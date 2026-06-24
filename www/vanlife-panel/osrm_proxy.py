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

# ── Fuel-history helpers (read-only HA recorder lookups) ────────────────────
TANK_L                 = 94.6   # Ford Transit T-350, 25 US gal
FUEL_MEAN_ENTITY       = "sensor.wican_fuel_5_min_mean"        # smoothed tank %
FUEL_USED_TOTAL_ENTITY = "sensor.estimated_fuel_used_total_l"  # OBD L integral


def _nearest_state(con, entity_id, ts_s, mode="closest", max_gap_s=None):
    """Nearest non-unknown numeric state of entity_id to ts_s (epoch seconds).
    Uses two index-friendly queries (never ORDER BY ABS() over the table).
      mode 'closest' = nearest before-or-after; 'before' = nearest at-or-before.
    Returns (value_float, last_updated_ts), or (None, None) when nothing exists
    within max_gap_s (when given) — which prevents fabricating a value from a
    reading days away (e.g. April trips picking up a May reading).
    """
    before = con.execute(
        "SELECT s.state, s.last_updated_ts FROM states s "
        "JOIN states_meta sm ON s.metadata_id = sm.metadata_id "
        "WHERE sm.entity_id = ? AND s.state NOT IN ('unknown','unavailable') "
        "AND s.last_updated_ts <= ? "
        "ORDER BY s.last_updated_ts DESC LIMIT 1",
        (entity_id, ts_s),
    ).fetchone()
    if mode == "before":
        row = before
    else:
        after = con.execute(
            "SELECT s.state, s.last_updated_ts FROM states s "
            "JOIN states_meta sm ON s.metadata_id = sm.metadata_id "
            "WHERE sm.entity_id = ? AND s.state NOT IN ('unknown','unavailable') "
            "AND s.last_updated_ts >= ? "
            "ORDER BY s.last_updated_ts ASC LIMIT 1",
            (entity_id, ts_s),
        ).fetchone()
        if before and after:
            row = before if abs(before[1] - ts_s) <= abs(after[1] - ts_s) else after
        else:
            row = before or after
    if not row:
        return None, None
    if max_gap_s is not None and abs(row[1] - ts_s) > max_gap_s:
        return None, None
    try:
        return float(row[0]), row[1]
    except (TypeError, ValueError):
        return None, None


def _obd_litres_between(con, start_ts_s, end_ts_s, max_gap_s=2 * 3600):
    """Litres of fuel burned between two epoch-seconds timestamps, from the OBD
    speed-density integral (sensor.estimated_fuel_used_total_l). This is the
    'OBD + GPS' numerator: OBD litres / GPS km = L/100km, accurate even on short
    city trips where the 1%-resolution tank delta is meaningless.
    Returns litres (>0), or None if unavailable / spans an integration reset
    (delta <= 0, e.g. HA restart) / readings too stale.
    """
    v0, _ = _nearest_state(con, FUEL_USED_TOTAL_ENTITY, start_ts_s, "closest", max_gap_s)
    v1, _ = _nearest_state(con, FUEL_USED_TOTAL_ENTITY, end_ts_s,   "closest", max_gap_s)
    if v0 is None or v1 is None:
        return None
    delta = v1 - v0
    if delta <= 0:
        return None
    return round(delta, 3)


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
            "gps_accuracy": 50,        # expected GPS noise (m) — u-blox ~2-5m, be generous
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

        if self.path.startswith('/vanlife/fuel-trips'):
            self._handle_fuel_trips()
            return

        if self.path.startswith('/vanlife/fuel-stats'):
            self._handle_fuel_stats()
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


    # ── GET /vanlife/fuel-trips?limit=N ──────────────────────────────────────
    # Returns per-trip fuel efficiency by grouping driving segments between
    # parking stops, cross-referencing HA fuel level history.
    # Each "trip" = continuous driving between two stops (parking or overnight).
    # Fuel used = (fuel_start% - fuel_end%) / 100 * 94.6L (tank method).
    def _handle_fuel_trips(self):
        import os
        HA_DB  = "/config/home-assistant_v2.db"
        MIN_DIST_KM = 1.0   # skip micro-trips < 1km   (TANK_L is module-level)

        qs    = parse_qs(urlparse(self.path).query)
        limit = int(qs.get("limit", [50])[0])

        if not os.path.exists(FILTERED_DB) or not os.path.exists(HA_DB):
            self._json(200, {"trips": [], "error": "DB not available"})
            return

        try:
            # Load segments grouped by parking gaps
            # A "trip" is a run of consecutive segments with < 30 min gaps
            gps_con = sqlite3.connect(FILTERED_DB)
            segs = gps_con.execute(
                "SELECT start_ts, end_ts, distance_m FROM segments "
                "WHERE distance_m > ? ORDER BY start_ts DESC LIMIT 2000",
                (MIN_DIST_KM * 1000,)
            ).fetchall()
            gps_con.close()

            if not segs:
                self._json(200, {"trips": []})
                return

            # Group consecutive segments into trips (gap > 20 min = new trip)
            GAP_MS = 20 * 60 * 1000
            trip_groups = []
            current = [segs[0]]
            for seg in segs[1:]:
                prev_end = current[-1][1]
                if prev_end - seg[1] > GAP_MS:  # sorted DESC, so check reverse
                    trip_groups.append(current)
                    current = [seg]
                else:
                    current.append(seg)
            trip_groups.append(current)

            # For each group compute distance and get fuel levels from HA
            ha_con = sqlite3.connect("file:" + HA_DB + "?mode=ro", uri=True)

            def fuel_at(ts_ms, before_only=False):
                """Nearest smoothed fuel % to ts_ms, within a 2 h staleness cap
                so a pre-retention timestamp can't borrow a reading days away."""
                mode = "before" if before_only else "closest"
                val, ts = _nearest_state(ha_con, FUEL_MEAN_ENTITY, ts_ms / 1000,
                                         mode, max_gap_s=2 * 3600)
                if val is None:
                    return None, None
                return round(val, 1), ts

            # Tank-delta economy is only trustworthy over long fill-to-fill spans
            # (1% tank resolution ≈ 0.95 L dominates a short trip); the OBD+GPS
            # method below has no such floor.
            ECON_MIN_KM  = 30
            ECON_MIN_PCT = 3

            trips = []
            for group in trip_groups[:limit]:
                start_ts = min(g[0] for g in group)
                end_ts   = max(g[1] for g in group)
                dist_m   = sum(g[2] for g in group)
                dist_km  = round(dist_m / 1000, 1)
                if dist_km < MIN_DIST_KM:
                    continue

                fuel_start, fs_ts = fuel_at(start_ts, before_only=False)
                fuel_end,   fe_ts = fuel_at(end_ts,   before_only=True)

                trip = {
                    "start_ts":   start_ts,
                    "end_ts":     end_ts,
                    "distance_km": dist_km,
                    "segment_count": len(group),
                    "fuel_start_pct": fuel_start,
                    "fuel_end_pct":   fuel_end,
                }

                # ── Primary economy: OBD fuel-rate integral ÷ GPS distance ──
                # Uses the new u-blox GPS distance + OBD speed-density litres;
                # accurate even on short trips where the tank delta is noise.
                obd_l = _obd_litres_between(ha_con, start_ts / 1000, end_ts / 1000)
                if obd_l is not None and dist_km > 0:
                    trip["fuel_used_l_obd"] = obd_l
                    trip["l_per_100km_obd"] = round(obd_l / dist_km * 100, 1)

                # ── Secondary cross-check: tank-level delta (long spans only) ──
                if fuel_start is not None and fuel_end is not None:
                    used_pct = round(fuel_start - fuel_end, 1)
                    used_l   = round(used_pct / 100 * TANK_L, 1)
                    trip["fuel_used_pct"] = used_pct
                    trip["fuel_used_l"]   = used_l
                    if dist_km >= ECON_MIN_KM and used_pct >= ECON_MIN_PCT:
                        trip["l_per_100km_tank"] = round(used_l / dist_km * 100, 1)

                # Headline economy: prefer OBD+GPS, fall back to tank delta.
                if "l_per_100km_obd" in trip:
                    trip["l_per_100km"]    = trip["l_per_100km_obd"]
                    trip["economy_method"] = "obd_gps"
                elif "l_per_100km_tank" in trip:
                    trip["l_per_100km"]    = trip["l_per_100km_tank"]
                    trip["economy_method"] = "tank_delta"
                if trip.get("l_per_100km"):
                    trip["km_per_l"] = round(100 / trip["l_per_100km"], 1)

                trips.append(trip)

            ha_con.close()

            # Fleet rolling average over trips that have a headline economy,
            # weighted by the litres each method actually measured.
            def _trip_litres(t):
                return (t.get("fuel_used_l_obd") if t.get("economy_method") == "obd_gps"
                        else t.get("fuel_used_l"))

            valid     = [t for t in trips if t.get("l_per_100km") is not None]
            total_km  = sum(t["distance_km"] for t in valid)
            total_l   = sum((_trip_litres(t) or 0) for t in valid)
            avg_l100  = round(total_l / total_km * 100, 1) if total_km > 0 and total_l > 0 else None

            self._json(200, {
                "trips": trips,
                "summary": {
                    "trip_count":       len(trips),
                    "total_km":         round(total_km, 1),
                    "total_l_used":     round(total_l, 1),
                    "avg_l_per_100km":  avg_l100,
                    "tank_capacity_l":  TANK_L,
                }
            })

        except Exception as e:
            self._json(500, {"error": str(e)})

    # ── GET /vanlife/fuel-stats?from_ts=MS[&to_ts=MS] ──────────────────────
    # Returns distance driven + fuel used between two timestamps so the VE
    # correction factor can be calibrated from fill-to-fill measurements.
    #
    # Params:
    #   from_ts  Epoch ms — start of period (last fill-up). Default: 7 days ago.
    #   to_ts    Epoch ms — end of period. Default: now.
    #
    # Response fields:
    #   distance_km             GPS-summed distance from segments table
    #   segment_count           Number of driving segments in the window
    #   fuel_start_pct          sensor.wican_fuel_5_min_mean nearest to from_ts
    #   fuel_end_pct            sensor.wican_fuel_5_min_mean nearest to to_ts
    #   fuel_used_pct/l         Delta x 94.6 L tank
    #   fuel_economy_l100km     Actual L/100km (tank method; coverage-gated)
    #   estimated_avg_l100km    OBD integral litres ÷ GPS km (distance-weighted)
    #   current_ve_correction   input_number.fuel_ve_correction current value
    #   suggested_ve_correction current_ve * tank_litres / OBD_litres (mass ratio)
    def _handle_fuel_stats(self):
        import os
        HA_DB  = "/config/home-assistant_v2.db"   # TANK_L is module-level

        qs      = parse_qs(urlparse(self.path).query)
        now_ms  = time.time() * 1000
        from_ms = float(qs.get("from_ts", [now_ms - 7 * 86400 * 1000])[0])
        to_ms   = float(qs.get("to_ts",   [now_ms])[0])

        # ── Distance + coverage from GPS segments ─────────────────────────────
        gps_con = sqlite3.connect(FILTERED_DB)
        seg_row = gps_con.execute(
            "SELECT COUNT(*), COALESCE(SUM(distance_m), 0), MIN(start_ts), MAX(end_ts) "
            "FROM segments WHERE start_ts >= ? AND end_ts <= ?",
            (from_ms, to_ms)
        ).fetchone()
        gps_con.close()

        # Fraction of the requested window actually spanned by GPS driving. Low
        # coverage => the fuel delta spans gaps the distance never saw, so the
        # tank-method economy/VE would be garbage (the old 62.5 L/100km bug).
        win_ms           = max(1.0, to_ms - from_ms)
        seg_min, seg_max = seg_row[2], seg_row[3]
        coverage_frac    = ((seg_max - seg_min) / win_ms) if (seg_min and seg_max) else 0.0

        result = {
            "from_ts":         from_ms,
            "to_ts":           to_ms,
            "distance_km":     round((seg_row[1] or 0) / 1000, 2),
            "segment_count":   seg_row[0] or 0,
            "coverage_frac":   round(coverage_frac, 3),
            "tank_capacity_l": TANK_L,
        }

        if not os.path.exists(HA_DB):
            result["error"] = "HA database not accessible"
            self._json(200, result)
            return

        try:
            ha_con = sqlite3.connect("file:" + HA_DB + "?mode=ro", uri=True)

            def _fuel_near(target_ms, before_only=False):
                """Nearest smoothed fuel % to target_ms, within a 6 h cap (span
                endpoints can lag the requested edge while parked). Indexed —
                no ORDER BY ABS() full scan. Returns (val, ts) or None."""
                mode = "before" if before_only else "closest"
                val, ts = _nearest_state(ha_con, FUEL_MEAN_ENTITY, target_ms / 1000,
                                         mode, max_gap_s=6 * 3600)
                return (val, ts) if val is not None else None

            fuel_start_row = _fuel_near(from_ms, before_only=False)
            fuel_end_row   = _fuel_near(to_ms,   before_only=True)

            fuel_start = round(float(fuel_start_row[0]), 2) if fuel_start_row else None
            fuel_end   = round(float(fuel_end_row[0]),   2) if fuel_end_row   else None

            result["fuel_start_pct"] = fuel_start
            result["fuel_start_ts"]  = fuel_start_row[1] if fuel_start_row else None
            result["fuel_end_pct"]   = fuel_end
            result["fuel_end_ts"]    = fuel_end_row[1]   if fuel_end_row   else None

            ECON_LO, ECON_HI = 5.0, 40.0   # plausible L/100km for a 3.5 EB Transit
            covered = coverage_frac >= 0.5 and (result["segment_count"] or 0) >= 1

            # Tank-method litres used (smoothed-level delta)
            tank_used_l = None
            if fuel_start is not None and fuel_end is not None:
                used_pct = round(fuel_start - fuel_end, 2)
                tank_used_l = round(used_pct / 100 * TANK_L, 2)
                result["fuel_used_pct"] = used_pct
                result["fuel_used_l"]   = tank_used_l

            # OBD speed-density litres over the SAME (tank-reading) window — the
            # 'estimated' side, now distance-weighted (OBD litres ÷ GPS km)
            # instead of an idle-biased mean of instantaneous L/100km ratios.
            obd_l = None
            if result.get("fuel_start_ts") and result.get("fuel_end_ts"):
                obd_l = _obd_litres_between(ha_con,
                                            result["fuel_start_ts"],
                                            result["fuel_end_ts"])
            if obd_l is not None:
                result["estimated_used_l"] = obd_l
                if result["distance_km"] > 0:
                    result["estimated_avg_l100km"] = round(
                        obd_l / result["distance_km"] * 100, 1)

            # Actual (tank-method) economy — only when GPS coverage is trustworthy
            # and the number is physically plausible; otherwise warn, don't lie.
            if (tank_used_l is not None and tank_used_l > 0
                    and result["distance_km"] > 0 and covered):
                econ = round(tank_used_l / result["distance_km"] * 100, 1)
                if ECON_LO <= econ <= ECON_HI:
                    result["fuel_economy_l100km"] = econ
                else:
                    result["coverage_warning"] = (
                        f"tank-method economy {econ} L/100km outside {ECON_LO}-{ECON_HI} "
                        f"band; likely incomplete GPS coverage")
            elif not covered:
                result["coverage_warning"] = (
                    f"GPS segments cover only {coverage_frac:.0%} of the window; "
                    f"economy/VE suppressed")

            # Current VE
            ve_row = ha_con.execute(
                "SELECT s.state FROM states s "
                "JOIN states_meta sm ON s.metadata_id = sm.metadata_id "
                "WHERE sm.entity_id = ? AND s.state != ? AND s.state != ? "
                "ORDER BY s.last_updated_ts DESC LIMIT 1",
                ("input_number.fuel_ve_correction", "unknown", "unavailable")
            ).fetchone()
            current_ve = round(float(ve_row[0]), 3) if ve_row else 0.55
            result["current_ve_correction"] = current_ve

            # Suggested VE = current * (tank litres / OBD-integral litres). A pure
            # fuel-MASS ratio over one window: GPS distance cancels, so it is
            # immune to the segment-undercount that produced the 1.109 bug. Only
            # offered when the actual economy passed the coverage+plausibility gate.
            if (tank_used_l is not None and tank_used_l > 0
                    and obd_l and obd_l > 0
                    and result.get("fuel_economy_l100km") is not None):
                result["suggested_ve_correction"] = round(
                    current_ve * tank_used_l / obd_l, 3)

            ha_con.close()
        except Exception as e:
            result["ha_db_error"] = str(e)

        self._json(200, result)

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
    import socket as _socket
    server = HTTPServer(("0.0.0.0", PORT), ProxyHandler)
    server.socket.setsockopt(_socket.SOL_SOCKET, _socket.SO_REUSEADDR, 1)
    print(f"Routing proxy listening on port {PORT}", flush=True)
    server.serve_forever()
