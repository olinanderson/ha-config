#!/usr/bin/env python3
"""
Vanlife routing CORS proxy — runs on the HA box at port 8765.

Endpoint:
  POST /vanlife/route-segment
        Body:  {"waypoints": [[lon,lat],...]}
        Cache: permanent, content-addressed by MD5(waypoints).
               Same waypoints → instant hit, no provider call.

Provider: OSRM map matching (router.project-osrm.org/match)
  - No API key needed
  - No rate limit (personal use)
  - Max 100 waypoints per request
  - Uses Hidden Markov Model GPS trace matching — no U-turns, no turn-restriction over-routing
  - Returns road-snapped geometry that follows the actual path of the trace
"""
import hashlib
import json
import re
import sqlite3
import threading
import time
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# ── Config ────────────────────────────────────────────────────────────────────
VALHALLA       = "https://valhalla1.openstreetmap.de/trace_route"
CHUNK          = 75     # points per Valhalla call (smaller = faster per-request)
CHUNK_OVL      = 5      # overlap GPS points between chunks for continuity
PORT           = 8765
TIMEOUT        = 45     # seconds; public Valhalla can be slow
REQUEST_DELAY  = 1.2    # seconds between Valhalla calls — avoids 429 rate limit
CACHE_DB    = "/config/www/vanlife-panel/route_cache.db"
FILTERED_DB = "/config/www/vanlife-panel/filtered_gps.db"

# ── SQLite cache (content-addressed by MD5 of waypoints) ────────────────────
_db_lock = threading.Lock()

def _db():
    """Open the cache DB, creating the table if needed."""
    con = sqlite3.connect(CACHE_DB)
    con.execute("""
        CREATE TABLE IF NOT EXISTS route_cache (
            seg_hash   TEXT PRIMARY KEY,
            geometry   TEXT NOT NULL,
            created_at REAL NOT NULL
        )
    """)
    con.commit()
    return con

def _init_named_places():
    """Ensure named_places table exists in FILTERED_DB."""
    con = sqlite3.connect(FILTERED_DB)
    con.execute("""
        CREATE TABLE IF NOT EXISTS named_places (
            id         TEXT PRIMARY KEY,
            name       TEXT NOT NULL,
            category   TEXT NOT NULL DEFAULT 'other',
            lat        REAL NOT NULL,
            lon        REAL NOT NULL,
            radius_m   REAL NOT NULL DEFAULT 200,
            notes      TEXT NOT NULL DEFAULT '',
            created_at REAL NOT NULL
        )
    """)
    con.commit()
    con.close()

# init on import
import os as _os
if _os.path.exists(FILTERED_DB):
    _init_named_places()

def waypoint_hash(lonlat_pts):
    """Stable MD5 of the canonical waypoint list — permanent cache key."""
    canon = json.dumps(lonlat_pts, separators=(",", ":"))
    return hashlib.md5(canon.encode()).hexdigest()[:16]

def cache_get(seg_hash):
    """Return cached [[lat,lon],...] geometry or None."""
    with _db_lock:
        con = _db()
        row = con.execute(
            "SELECT geometry FROM route_cache WHERE seg_hash = ?",
            (seg_hash,)
        ).fetchone()
        con.close()
    return json.loads(row[0]) if row else None

def cache_set(seg_hash, geometry):
    """Store routed geometry permanently by waypoint hash."""
    with _db_lock:
        con = _db()
        con.execute(
            "INSERT OR REPLACE INTO route_cache (seg_hash, geometry, created_at) VALUES (?, ?, ?)",
            (seg_hash, json.dumps(geometry), time.time())
        )
        con.commit()
        con.close()

# ── Provider helpers ──────────────────────────────────────────────────────────

def _decode_polyline6(encoded):
    """Decode a Valhalla precision-6 encoded polyline → [[lat,lon],...]."""
    result = []
    idx, lat, lon = 0, 0, 0
    while idx < len(encoded):
        for coord in range(2):
            shift, result_val = 0, 0
            while True:
                b = ord(encoded[idx]) - 63
                idx += 1
                result_val |= (b & 0x1F) << shift
                shift += 5
                if b < 0x20:
                    break
            delta = ~(result_val >> 1) if result_val & 1 else result_val >> 1
            if coord == 0:
                lat += delta
            else:
                lon += delta
        result.append([lat / 1e6, lon / 1e6])
    return result


def _match_chunk(lonlat_pts):
    """Call Valhalla trace_route for a list of [lon,lat] GPS points.

    Valhalla map matching uses a Hidden Markov Model — snaps the GPS trace
    to roads without U-turns or turn-restriction over-routing. No API key.
    Returns [[lat,lon],...] road-snapped geometry.
    """
    time.sleep(REQUEST_DELAY)  # rate-limit guard for the public Valhalla server
    shape = [{"lat": lat, "lon": lon} for lon, lat in lonlat_pts]
    payload = json.dumps({
        "shape": shape,
        "costing": "auto",
        "shape_match": "map_snap",
        "trace_options": {
            "search_radius": 100,      # metres — max allowed by public Valhalla
            "gps_accuracy": 50,        # expected GPS noise (m) — Starlink ~15-30m, be generous
            "breakage_distance": 20000, # max gap (m) before trace break — keep matching through gaps
            "turn_penalty_factor": 0,  # no penalty for turns — trace is known path
        },
    }).encode()
    req = urllib.request.Request(
        VALHALLA, data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "vanlife-panel/1.0"},
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                d = json.loads(resp.read())
            break
        except urllib.error.HTTPError as e:
            if e.code in (429, 504) and attempt < 3:
                wait = 10 * (attempt + 1)
                print(f"[Valhalla {e.code}] retrying in {wait}s (attempt {attempt+1})...", flush=True)
                time.sleep(wait)
            else:
                raise
    legs = d.get("trip", {}).get("legs", [])
    if not legs:
        raise RuntimeError(f"Valhalla returned no legs (status={d.get('trip',{}).get('status_message')})")
    coords = []
    for leg in legs:
        decoded = _decode_polyline6(leg["shape"])
        coords.extend(decoded[1:] if coords else decoded)
    return coords  # already [[lat,lon],...]


def route_segment(lonlat_pts):
    """Map-match a full GPS trace via chunked Valhalla calls with overlap."""
    result = []
    i = 0
    while i < len(lonlat_pts):
        chunk = lonlat_pts[i: i + CHUNK]
        seg   = _match_chunk(chunk)
        if i == 0:
            result.extend(seg)
        else:
            # Better overlap stitching: find the point in the new segment
            # closest to result[-1] (the overlap region may snap differently
            # between adjacent chunks, so seg[0] != result[-1]).
            best_idx = 0
            best_dist = float('inf')
            search_limit = min(len(seg), CHUNK_OVL * 4)
            for j in range(search_limit):
                d = _haversine_m(result[-1][0], result[-1][1], seg[j][0], seg[j][1])
                if d < best_dist:
                    best_dist = d
                    best_idx = j
            result.extend(seg[best_idx + 1:])
        advance = CHUNK - CHUNK_OVL
        i += advance
        if i >= len(lonlat_pts) - 1:
            break
    return _fix_breakage(result, lonlat_pts)


def _haversine_m(lat1, lon1, lat2, lon2):
    """Haversine distance in metres between two points."""
    import math
    R = 6371000
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _fix_breakage(routed_coords, gps_lonlat, max_gap_m=500):
    """Fix Valhalla straight-line breakage by splicing in raw GPS points.

    When Valhalla can't match a section to roads, it inserts straight-line
    jumps. We detect gaps > max_gap_m in the routed geometry, find the
    corresponding raw GPS points, and splice them in as fallback.
    The GPS trace roughly follows roads and looks much better than a
    straight line cutting through buildings.
    """
    if len(routed_coords) < 2:
        return routed_coords

    # Convert GPS from [lon,lat] to [lat,lon]
    gps_ll = [[lat, lon] for lon, lat in gps_lonlat]

    result = [routed_coords[0]]
    spliced = 0

    for i in range(1, len(routed_coords)):
        d = _haversine_m(result[-1][0], result[-1][1],
                         routed_coords[i][0], routed_coords[i][1])
        if d > max_gap_m:
            # Find GPS points closest to the gap start and end
            gap_start = result[-1]
            gap_end = routed_coords[i]
            start_idx = min(range(len(gps_ll)),
                            key=lambda j: _haversine_m(gap_start[0], gap_start[1],
                                                       gps_ll[j][0], gps_ll[j][1]))
            end_idx = min(range(len(gps_ll)),
                          key=lambda j: _haversine_m(gap_end[0], gap_end[1],
                                                     gps_ll[j][0], gps_ll[j][1]))
            if end_idx > start_idx + 1:
                # Splice in raw GPS points for the broken section
                for j in range(start_idx + 1, end_idx):
                    result.append(gps_ll[j])
                spliced += 1
        result.append(routed_coords[i])

    if spliced:
        print(f"[breakage fix] spliced raw GPS for {spliced} broken section(s)", flush=True)
    return result


def parse_osrm_coords(path):
    """Parse /route/v1/driving/lon,lat;lon,lat;... → [[lon,lat],...] (legacy)"""
    m = re.match(r"/route/v1/driving/([^?]+)", path)
    if not m:
        return None
    pts = []
    for pair in m.group(1).split(";"):
        parts = pair.split(",")
        if len(parts) < 2:
            return None
        pts.append([float(parts[0]), float(parts[1])])
    return pts


# ── HTTP handler ──────────────────────────────────────────────────────────────

class ProxyHandler(BaseHTTPRequestHandler):

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_PUT(self):
        if self.path.startswith("/vanlife/named-places/"):
            self._handle_named_place_update()
        else:
            self._json(404, {"error": "not found"})

    def do_DELETE(self):
        if self.path.startswith("/vanlife/named-places/"):
            self._handle_named_place_delete()
        else:
            self._json(404, {"error": "not found"})

    # ── POST /vanlife/route-segment ───────────────────────────────────────────
    def do_POST(self):
        if self.path.startswith("/vanlife/named-places"):
            self._handle_named_place_create()
            return
        if not self.path.startswith("/vanlife/route-segment"):
            self._json(404, {"error": "not found"})
            return

        length    = int(self.headers.get("Content-Length", 0))
        body      = json.loads(self.rfile.read(length))
        waypoints = body.get("waypoints", [])   # [[lon, lat], ...]

        if len(waypoints) < 2:
            self._json(400, {"error": "need at least 2 waypoints"})
            return

        # Valhalla map_snap needs ≥3 points — return straight line for tiny segments
        if len(waypoints) < 3:
            # waypoints are [lon, lat] — return [[lat, lon], ...]
            geom = [[pt[1], pt[0]] for pt in waypoints]
            self._json(200, {"geometry": geom, "cached": False, "straight": True})
            return

        seg_hash = waypoint_hash(waypoints)

        # ── Serve from permanent cache if this exact waypoint set was routed ──
        geom = cache_get(seg_hash)
        if geom is not None:
            print(f"[cache HIT]  {seg_hash}", flush=True)
            self._json(200, {"geometry": geom, "cached": True})
            return

        print(f"[cache MISS] {seg_hash} ({len(waypoints)} wpts)", flush=True)

        # ── Route and persist ─────────────────────────────────────────────────
        try:
            geom = route_segment(waypoints)
            cache_set(seg_hash, geom)
            print(f"[cache WRITE] {seg_hash}", flush=True)
            self._json(200, {"geometry": geom, "cached": False})
        except Exception as e:
            print(f"[route error] {seg_hash}: {e}", flush=True)
            self._json(502, {"error": str(e)})

    # ── GET /vanlife/filtered-gps?start=TS&end=TS ──────────────────────────────
    # Serve pre-filtered GPS segments + parking from gps_filter.py's DB.
    # ── GET /vanlife/named-places ─────────────────────────────────────────────
    # ── PUT /vanlife/named-places/<id> ────────────────────────────────────────
    # ── DELETE /vanlife/named-places/<id> ─────────────────────────────────────
    # ── GET /route/v1/driving/... (legacy fallback) ───────────────────────────
    def do_GET(self):
        if self.path.startswith("/vanlife/named-places"):
            self._handle_named_places_get()
            return

        if self.path == "/vanlife/data-range":
            try:
                import os
                if not os.path.exists(FILTERED_DB):
                    self._json(200, {"min_date": None, "max_date": None})
                    return
                con = sqlite3.connect(FILTERED_DB)
                row = con.execute(
                    "SELECT MIN(start_ts), MAX(end_ts) FROM segments"
                ).fetchone()
                con.close()
                if row and row[0] is not None:
                    from datetime import datetime, timezone
                    min_d = datetime.fromtimestamp(row[0] / 1000, tz=timezone.utc).strftime("%Y-%m-%d")
                    max_d = datetime.fromtimestamp(row[1] / 1000, tz=timezone.utc).strftime("%Y-%m-%d")
                    self._json(200, {"min_date": min_d, "max_date": max_d})
                else:
                    self._json(200, {"min_date": None, "max_date": None})
            except Exception as e:
                print(f"[data-range error] {e}", flush=True)
                self._json(500, {"error": str(e)})
            return

        if self.path.startswith("/vanlife/filtered-gps"):
            try:
                qs = parse_qs(urlparse(self.path).query)
                start_ts = float(qs.get("start", [0])[0])
                end_ts = float(qs.get("end", [0])[0])
                if not start_ts or not end_ts:
                    self._json(400, {"error": "start and end params required (epoch ms)"})
                    return

                import os
                if not os.path.exists(FILTERED_DB):
                    self._json(200, {"segments": [], "parking_spots": [], "ready": False})
                    return

                con = sqlite3.connect(FILTERED_DB)
                segs = con.execute(
                    "SELECT id, start_ts, end_ts, points, point_count, routed_geometry, distance_m "
                    "FROM segments WHERE end_ts >= ? AND start_ts <= ? ORDER BY start_ts",
                    (start_ts, end_ts)
                ).fetchall()
                parks = con.execute(
                    "SELECT lat, lon, start_ts, duration_s, point_count "
                    "FROM parking_spots WHERE start_ts + duration_s * 1000 >= ? AND start_ts <= ? "
                    "ORDER BY start_ts",
                    (start_ts, end_ts)
                ).fetchall()
                con.close()

                def _serve_segment(r):
                    pts_raw = json.loads(r[3])
                    geo = json.loads(r[5]) if r[5] else None
                    # Re-apply breakage fix at serve time with current threshold
                    if geo and len(geo) >= 2 and pts_raw:
                        gps_lonlat = [[p["lon"], p["lat"]] for p in pts_raw]
                        geo = _fix_breakage(geo, gps_lonlat)
                    return {
                        "id": r[0],
                        "start_ts": r[1], "end_ts": r[2],
                        "points": pts_raw, "point_count": r[4],
                        "routed_geometry": geo,
                        "distance_m": r[6],
                    }

                result = {
                    "segments": [_serve_segment(r) for r in segs],
                    "parking_spots": [
                        {"lat": r[0], "lon": r[1], "start_ts": r[2],
                         "duration_s": r[3], "point_count": r[4]}
                        for r in parks
                    ],
                    "ready": True,
                }
                self._json(200, result)
            except Exception as e:
                print(f"[filtered-gps error] {e}", flush=True)
                self._json(500, {"error": str(e)})
            return

        pts = parse_osrm_coords(self.path)
        if not pts or len(pts) < 2:
            self._json(400, {"code": "Error", "message": "bad path"})
            return
        try:
            geom = route_segment(pts)
            self._json(200, {"code": "Ok", "routes": [{"geometry": geom}]})
        except urllib.error.HTTPError as e:
            body = e.read()
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            self.send_response(502)
            self._cors()
            self.end_headers()
            self.wfile.write(str(e).encode())

    def log_message(self, fmt, *args):
        pass   # suppress per-request access log

    # ── Named Places CRUD ─────────────────────────────────────────────────────

    def _handle_named_places_get(self):
        """GET /vanlife/named-places → return all named places."""
        _init_named_places()
        con = sqlite3.connect(FILTERED_DB)
        rows = con.execute(
            "SELECT id, name, category, lat, lon, radius_m, notes, created_at "
            "FROM named_places ORDER BY name"
        ).fetchall()
        con.close()
        places = [
            {"id": r[0], "name": r[1], "category": r[2], "lat": r[3],
             "lon": r[4], "radius_m": r[5], "notes": r[6], "created_at": r[7]}
            for r in rows
        ]
        self._json(200, {"places": places})

    def _handle_named_place_create(self):
        """POST /vanlife/named-places → create a new named place."""
        _init_named_places()
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))
        name = body.get("name", "").strip()
        if not name:
            self._json(400, {"error": "name is required"})
            return
        lat = body.get("lat")
        lon = body.get("lon")
        if lat is None or lon is None:
            self._json(400, {"error": "lat and lon are required"})
            return
        import uuid
        place_id = str(uuid.uuid4())[:8]
        category = body.get("category", "other")
        radius_m = body.get("radius_m", 200)
        notes = body.get("notes", "")
        con = sqlite3.connect(FILTERED_DB)
        con.execute(
            "INSERT INTO named_places (id, name, category, lat, lon, radius_m, notes, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (place_id, name, category, lat, lon, radius_m, notes, time.time())
        )
        con.commit()
        con.close()
        self._json(201, {"id": place_id, "name": name})

    def _handle_named_place_update(self):
        """PUT /vanlife/named-places/<id> → update an existing named place."""
        place_id = self.path.split("/")[-1]
        if not place_id:
            self._json(400, {"error": "place id required"})
            return
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))
        con = sqlite3.connect(FILTERED_DB)
        existing = con.execute("SELECT id FROM named_places WHERE id = ?", (place_id,)).fetchone()
        if not existing:
            con.close()
            self._json(404, {"error": "place not found"})
            return
        fields = []
        values = []
        for key in ("name", "category", "lat", "lon", "radius_m", "notes"):
            if key in body:
                fields.append(f"{key} = ?")
                values.append(body[key])
        if fields:
            values.append(place_id)
            con.execute(f"UPDATE named_places SET {', '.join(fields)} WHERE id = ?", values)
            con.commit()
        con.close()
        self._json(200, {"ok": True})

    def _handle_named_place_delete(self):
        """DELETE /vanlife/named-places/<id> → delete a named place."""
        place_id = self.path.split("/")[-1]
        if not place_id:
            self._json(400, {"error": "place id required"})
            return
        con = sqlite3.connect(FILTERED_DB)
        con.execute("DELETE FROM named_places WHERE id = ?", (place_id,))
        con.commit()
        con.close()
        self._json(200, {"ok": True})


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), ProxyHandler)
    print(f"Routing proxy listening on port {PORT}", flush=True)
    server.serve_forever()
