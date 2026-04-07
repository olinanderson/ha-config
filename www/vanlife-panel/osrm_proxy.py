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

# ── Config ────────────────────────────────────────────────────────────────────
VALHALLA       = "https://valhalla1.openstreetmap.de/trace_route"
CHUNK          = 75     # points per Valhalla call (smaller = faster per-request)
CHUNK_OVL      = 5      # overlap GPS points between chunks for continuity
PORT           = 8765
TIMEOUT        = 45     # seconds; public Valhalla can be slow
REQUEST_DELAY  = 1.2    # seconds between Valhalla calls — avoids 429 rate limit
CACHE_DB    = "/config/www/vanlife-panel/route_cache.db"

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
            "search_radius": 35,       # metres to search for a road from each GPS point
            "gps_accuracy": 15,        # expected GPS noise (m) — higher = more smoothing
            "breakage_distance": 5000, # max gap (m) before straight-line fallback; was 2000
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
        result.extend(seg if i == 0 else seg[1:])
        advance = CHUNK - CHUNK_OVL
        i += advance
        if i >= len(lonlat_pts) - 1:
            break
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
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
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

    # ── POST /vanlife/route-segment ───────────────────────────────────────────
    def do_POST(self):
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

    # ── GET /route/v1/driving/... (legacy fallback) ───────────────────────────
    def do_GET(self):
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


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), ProxyHandler)
    print(f"Routing proxy listening on port {PORT}", flush=True)
    server.serve_forever()
