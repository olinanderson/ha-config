#!/usr/bin/env python3
"""
GPS Filter Daemon — pre-processes raw Starlink GPS into filtered segments.

Runs alongside osrm_proxy.py on the HA host. Fetches raw GPS from the HA
history API, deduplicates, runs the same movement state machine as the
panel's client-side code, merges short stops, pre-routes through Valhalla
(via the OSRM proxy), and stores results in SQLite.

The panel reads pre-computed results from the /vanlife/filtered-gps endpoint
(served by osrm_proxy.py) for instant page loads.

Usage:
  # Backfill historical + run as daemon:
  python3 gps_filter.py --backfill --from 2025-01-01 --daemon

  # Daemon only (incremental from where we left off):
  python3 gps_filter.py

  # Backfill only (no daemon):
  python3 gps_filter.py --backfill --from 2025-06-01

  # Route unrouted segments only:
  python3 gps_filter.py --route-only

Token is read from /config/.gps_filter_token (one line, long-lived HA token).
"""

import argparse
import json
import math
import os
import sqlite3
import sys
import time
import traceback
import urllib.request
from datetime import datetime, timedelta, timezone

# ── Config ────────────────────────────────────────────────────────────────────
HA_URL      = os.environ.get("HA_URL", "http://localhost:8123")
PROXY_URL   = os.environ.get("PROXY_URL", "http://localhost:8765")
FILTER_DB   = "/config/www/vanlife-panel/filtered_gps.db"
TOKEN_FILE  = "/config/.gps_filter_token"
ENTITY_ID   = "device_tracker.starlink_device_location"
LOG_FILE    = "/config/www/vanlife-panel/gps_filter.log"

# Filter constants — MUST match index.html _fetchAndFilterStarlink()
MIN_PARK_DURATION_S = 180   # 3 min — avoid splitting trips at traffic lights
FILTER_RADIUS_M     = 15
CONFIRM_COUNT       = 3
MIN_SEGMENT_DISTANCE_M = 300 # ignore tiny "moved van down the street" trips
GPS_GAP_SPLIT_S     = 180   # 3 min — split segment if time gap > this (Starlink blocked)

# Daemon timing
POLL_INTERVAL_S     = 120   # seconds between incremental runs
PROCESS_DELAY_S     = 300   # only process data older than 5 min (ensure stops finalized)

# ── Helpers ───────────────────────────────────────────────────────────────────

def haversine_m(lat1, lon1, lat2, lon2):
    R = 6371000
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def segment_distance_m(seg):
    """Total haversine distance along a segment's points."""
    d = 0
    for i in range(1, len(seg)):
        d += haversine_m(seg[i - 1]["lat"], seg[i - 1]["lon"],
                         seg[i]["lat"], seg[i]["lon"])
    return d


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)


def read_token():
    """Read HA long-lived access token from file."""
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE) as f:
            return f.read().strip()
    return None


# ── Database ──────────────────────────────────────────────────────────────────

def init_db():
    con = sqlite3.connect(FILTER_DB)
    con.execute("PRAGMA journal_mode=WAL")
    con.executescript("""
        CREATE TABLE IF NOT EXISTS segments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_ts REAL NOT NULL,
            end_ts REAL NOT NULL,
            points TEXT NOT NULL,
            point_count INTEGER NOT NULL,
            routed_geometry TEXT,
            distance_m REAL
        );
        CREATE TABLE IF NOT EXISTS parking_spots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lat REAL NOT NULL,
            lon REAL NOT NULL,
            start_ts REAL NOT NULL,
            duration_s REAL NOT NULL,
            point_count INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS filter_meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_seg_ts ON segments(start_ts, end_ts);
        CREATE INDEX IF NOT EXISTS idx_park_ts ON parking_spots(start_ts);
    """)
    con.close()


def get_meta(key, default=None):
    con = sqlite3.connect(FILTER_DB)
    row = con.execute("SELECT value FROM filter_meta WHERE key = ?", (key,)).fetchone()
    con.close()
    return json.loads(row[0]) if row else default


def set_meta(key, value):
    con = sqlite3.connect(FILTER_DB)
    con.execute("INSERT OR REPLACE INTO filter_meta (key, value) VALUES (?, ?)",
                (key, json.dumps(value)))
    con.commit()
    con.close()


def store_results(segments, parking_spots, clear_after_ts=None):
    """Atomically store filter results. If clear_after_ts is set, delete existing
    data after that timestamp first (for incremental re-processing)."""
    con = sqlite3.connect(FILTER_DB)
    try:
        con.execute("BEGIN")
        if clear_after_ts is not None:
            con.execute("DELETE FROM segments WHERE start_ts >= ?", (clear_after_ts,))
            con.execute("DELETE FROM parking_spots WHERE start_ts >= ?", (clear_after_ts,))

        for seg in segments:
            pts = [{"lat": p["lat"], "lon": p["lon"], "ts": p["ts"]} for p in seg]
            con.execute(
                "INSERT INTO segments (start_ts, end_ts, points, point_count) VALUES (?, ?, ?, ?)",
                (seg[0]["ts"], seg[-1]["ts"], json.dumps(pts), len(pts))
            )

        for pk in parking_spots:
            con.execute(
                "INSERT INTO parking_spots (lat, lon, start_ts, duration_s, point_count) VALUES (?, ?, ?, ?, ?)",
                (pk["lat"], pk["lon"], pk["ts"], pk["duration_s"], pk["count"])
            )

        con.execute("COMMIT")
    except Exception:
        con.execute("ROLLBACK")
        raise
    finally:
        con.close()


def clear_all():
    con = sqlite3.connect(FILTER_DB)
    con.execute("DELETE FROM segments")
    con.execute("DELETE FROM parking_spots")
    con.execute("DELETE FROM filter_meta")
    con.commit()
    con.close()


def get_unrouted_segments():
    con = sqlite3.connect(FILTER_DB)
    rows = con.execute(
        "SELECT id, points, point_count FROM segments WHERE routed_geometry IS NULL ORDER BY start_ts"
    ).fetchall()
    con.close()
    return [{"id": r[0], "points": json.loads(r[1]), "point_count": r[2]} for r in rows]


def get_all_parking_in_range(start_ts, end_ts):
    """Get parking spots overlapping a time range (for trimming during routing)."""
    con = sqlite3.connect(FILTER_DB)
    rows = con.execute(
        "SELECT lat, lon, start_ts, duration_s FROM parking_spots "
        "WHERE start_ts + duration_s * 1000 >= ? AND start_ts <= ? ORDER BY start_ts",
        (start_ts, end_ts)
    ).fetchall()
    con.close()
    return [{"lat": r[0], "lon": r[1], "ts": r[2], "duration_s": r[3]} for r in rows]


def update_segment_route(seg_id, geometry, distance_m):
    con = sqlite3.connect(FILTER_DB)
    con.execute(
        "UPDATE segments SET routed_geometry = ?, distance_m = ? WHERE id = ?",
        (json.dumps(geometry), distance_m, seg_id)
    )
    con.commit()
    con.close()


# ── HA History API ────────────────────────────────────────────────────────────

def fetch_gps_from_ha(token, start_dt, end_dt):
    """Fetch raw Starlink GPS states from HA history API. Returns [{lat,lon,ts,acc}, ...]."""
    start_iso = start_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    end_iso = end_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    url = (f"{HA_URL}/api/history/period/{start_iso}"
           f"?filter_entity_id={ENTITY_ID}"
           f"&end_time={end_iso}"
           f"&significant_changes_only=false")
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=300) as resp:
        data = json.loads(resp.read())
    raw_states = data[0] if data else []
    points = []
    for s in raw_states:
        attrs = s.get("attributes", {})
        lat = attrs.get("latitude")
        lon = attrs.get("longitude")
        if lat is None or lon is None:
            continue
        ts_str = s.get("last_updated") or s.get("last_changed") or ""
        if not ts_str:
            continue
        ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00")).timestamp() * 1000
        acc = attrs.get("gps_accuracy")
        points.append({"lat": lat, "lon": lon, "ts": ts, "acc": acc})
    points.sort(key=lambda p: p["ts"])
    return points


# ── Filter Algorithm (mirrors JS _fetchAndFilterStarlink) ─────────────────────

def dedup_points(points):
    """Remove consecutive points with identical lat/lon."""
    if not points:
        return []
    deduped = [points[0]]
    for p in points[1:]:
        if p["lat"] != deduped[-1]["lat"] or p["lon"] != deduped[-1]["lon"]:
            deduped.append(p)
    return deduped


def filter_movement(deduped):
    """Run movement state machine. Returns (raw_segments, raw_parking_spots).
    This is a faithful port of the JS state machine in index.html."""
    if not deduped:
        return [], []

    raw_parking = []
    current_segment = []
    segments = []

    state = "stopped"
    cluster_lat = deduped[0]["lat"]
    cluster_lon = deduped[0]["lon"]
    cluster_count = 1
    cluster_start_ts = deduped[0]["ts"]
    cluster_last_ts = deduped[0]["ts"]
    candidate_buffer = []
    stopped_ref = None
    stopped_count = 0

    for i in range(1, len(deduped)):
        p = deduped[i]
        dist = haversine_m(p["lat"], p["lon"], cluster_lat, cluster_lon)

        if state == "stopped":
            if dist > FILTER_RADIUS_M:
                candidate_buffer.append(p)
                if len(candidate_buffer) >= CONFIRM_COUNT:
                    duration_s = (cluster_last_ts - cluster_start_ts) / 1000
                    if cluster_count > 1:
                        raw_parking.append({
                            "lat": cluster_lat, "lon": cluster_lon,
                            "ts": cluster_start_ts, "duration_s": duration_s,
                            "count": cluster_count,
                        })
                    current_segment = list(candidate_buffer)
                    candidate_buffer = []
                    state = "moving"
                    stopped_ref = None
                    stopped_count = 0
            else:
                cluster_count += 1
                cluster_lat += (p["lat"] - cluster_lat) / cluster_count
                cluster_lon += (p["lon"] - cluster_lon) / cluster_count
                cluster_last_ts = p["ts"]
                candidate_buffer = []
        else:
            current_segment.append(p)
            if stopped_ref is None:
                stopped_ref = p
                stopped_count = 1
            else:
                dist_ref = haversine_m(p["lat"], p["lon"], stopped_ref["lat"], stopped_ref["lon"])
                if dist_ref <= FILTER_RADIUS_M:
                    stopped_count += 1
                    if stopped_count >= CONFIRM_COUNT * 2:
                        if len(current_segment) >= 2:
                            segments.append(current_segment)
                        current_segment = []
                        state = "stopped"
                        cluster_lat = stopped_ref["lat"]
                        cluster_lon = stopped_ref["lon"]
                        cluster_count = stopped_count
                        cluster_start_ts = stopped_ref["ts"]
                        cluster_last_ts = p["ts"]
                        candidate_buffer = []
                        stopped_ref = None
                        stopped_count = 0
                else:
                    stopped_ref = p
                    stopped_count = 1

    # Finalize
    if state == "moving" and len(current_segment) >= 2:
        segments.append(current_segment)
    if state == "stopped" and cluster_count > 1:
        duration_s = (cluster_last_ts - cluster_start_ts) / 1000
        raw_parking.append({
            "lat": cluster_lat, "lon": cluster_lon,
            "ts": cluster_start_ts, "duration_s": duration_s,
            "count": cluster_count,
        })

    return segments, raw_parking


def merge_short_stops(segments, raw_parking):
    """Merge segments separated by short stops (<120s). Returns (merged_segs, filtered_parking).
    Mirrors the JS merge logic: park[k] for k>=1 sits between seg[k-1] and seg[k]."""
    parking_spots = [pk for pk in raw_parking if pk["duration_s"] >= MIN_PARK_DURATION_S]
    short_stop_indices = {i for i, pk in enumerate(raw_parking) if pk["duration_s"] < MIN_PARK_DURATION_S}

    if not segments:
        return [], parking_spots

    merged = []
    current = list(segments[0])
    for si in range(1, len(segments)):
        if si < len(raw_parking) and si in short_stop_indices:
            current.extend(segments[si])
        else:
            if len(current) >= 2:
                merged.append(current)
            current = list(segments[si])
    if len(current) >= 2:
        merged.append(current)

    return merged, parking_spots


def split_at_time_gaps(segments, parking_spots):
    """Split segments at large time gaps (e.g. Starlink blocked under a roof).
    Inserts synthetic parking spots for the gap period."""
    new_segs = []
    new_parking = list(parking_spots)
    for seg in segments:
        current = [seg[0]]
        for i in range(1, len(seg)):
            gap_s = (seg[i]["ts"] - seg[i - 1]["ts"]) / 1000
            if gap_s > GPS_GAP_SPLIT_S:
                # Finalize the segment before the gap
                if len(current) >= 2:
                    new_segs.append(current)
                # Insert synthetic parking spot for the gap
                new_parking.append({
                    "lat": seg[i - 1]["lat"], "lon": seg[i - 1]["lon"],
                    "ts": seg[i - 1]["ts"], "duration_s": gap_s,
                    "count": 0,  # synthetic
                })
                current = [seg[i]]
            else:
                current.append(seg[i])
        if len(current) >= 2:
            new_segs.append(current)
    new_parking.sort(key=lambda pk: pk["ts"])
    return new_segs, new_parking


def process_gps(points):
    """Full pipeline: dedup → filter → merge → drop tiny trips. Returns (segments, parking_spots)."""
    deduped = dedup_points(points)
    if not deduped:
        return [], []
    raw_segs, raw_parking = filter_movement(deduped)
    merged, parking = merge_short_stops(raw_segs, raw_parking)
    # Split segments at large GPS gaps (Starlink blocked under roof/cover)
    split_segs, parking = split_at_time_gaps(merged, parking)
    # Drop segments where start-to-end displacement is ≤ threshold (GPS drift / van shuffled in parking)
    # Use displacement (not cumulative distance) because GPS noise inflates point-to-point sums
    filtered = [s for s in split_segs if haversine_m(s[0]["lat"], s[0]["lon"], s[-1]["lat"], s[-1]["lon"]) > MIN_SEGMENT_DISTANCE_M]
    return filtered, parking


# ── Valhalla Pre-routing ──────────────────────────────────────────────────────

def trim_segment_for_routing(seg_points, parking_spots):
    """Apply the same trimming logic as the panel: trim off-road drift near
    adjacent parking spots, add parking spot as endpoint."""
    seg = list(seg_points)
    if len(seg) < 2:
        return seg

    seg_start_ts = seg[0]["ts"]
    seg_end_ts = seg[-1]["ts"]

    # Find next parking spot (starts after segment ends)
    next_park = None
    for pk in parking_spots:
        if pk["ts"] > seg_end_ts - 120000:
            next_park = pk
            break

    # Find previous parking spot (ends before segment starts) — use park END time
    prev_park = None
    for pk in parking_spots:
        park_end = pk["ts"] + pk["duration_s"] * 1000
        if park_end <= seg_start_ts + 60000 and seg_start_ts - park_end < 120000:
            prev_park = pk

    trimmed = list(seg)

    # Trim tail near next parking spot
    if next_park:
        cut_idx = len(trimmed)
        for i in range(len(trimmed) - 1, max(-1, len(trimmed) - 21), -1):
            if haversine_m(trimmed[i]["lat"], trimmed[i]["lon"], next_park["lat"], next_park["lon"]) < 30:
                cut_idx = i
            else:
                break
        if cut_idx < len(trimmed) and cut_idx >= 2:
            trimmed = trimmed[:cut_idx]
        trimmed.append({"lat": next_park["lat"], "lon": next_park["lon"], "ts": trimmed[-1]["ts"] + 1})

    # Trim head near previous parking spot
    if prev_park and len(trimmed) > 2:
        head_cut = 0
        for i in range(min(20, len(trimmed))):
            if haversine_m(trimmed[i]["lat"], trimmed[i]["lon"], prev_park["lat"], prev_park["lon"]) < 30:
                head_cut = i + 1
            else:
                break
        if head_cut > 0 and head_cut < len(trimmed) - 1:
            trimmed = trimmed[head_cut:]
        trimmed.insert(0, {"lat": prev_park["lat"], "lon": prev_park["lon"], "ts": trimmed[0]["ts"] - 1})

    return trimmed


def route_via_proxy(points):
    """Route segment through the Valhalla proxy (osrm_proxy.py). Returns (geometry, distance_m)."""
    waypoints = [[p["lon"], p["lat"]] for p in points]
    if len(waypoints) < 2:
        return None, 0

    payload = json.dumps({"waypoints": waypoints}).encode()
    req = urllib.request.Request(
        f"{PROXY_URL}/vanlife/route-segment",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            data = json.loads(resp.read())
        geometry = data.get("geometry", [])
        if len(geometry) >= 2:
            dist = 0
            for i in range(1, len(geometry)):
                dist += haversine_m(geometry[i - 1][0], geometry[i - 1][1],
                                    geometry[i][0], geometry[i][1])
            return geometry, dist
    except Exception as e:
        log(f"Route error: {e}")
    return None, 0


def route_unrouted():
    """Route any segments without routed geometry."""
    unrouted = get_unrouted_segments()
    if not unrouted:
        return

    log(f"Routing {len(unrouted)} unrouted segments...")
    for i, seg in enumerate(unrouted):
        points = seg["points"]
        # Get surrounding parking spots for trimming
        start_ts = points[0]["ts"]
        end_ts = points[-1]["ts"]
        nearby_parking = get_all_parking_in_range(start_ts - 300000, end_ts + 300000)

        trimmed = trim_segment_for_routing(points, nearby_parking)
        geometry, distance = route_via_proxy(trimmed)

        if geometry:
            update_segment_route(seg["id"], geometry, distance)
            log(f"  Segment {i + 1}/{len(unrouted)}: {len(geometry)} coords, {distance / 1000:.1f} km")
        else:
            update_segment_route(seg["id"], [], 0)
            log(f"  Segment {i + 1}/{len(unrouted)}: routing failed")
        time.sleep(0.5)

    log("Routing complete.")


# ── Backfill ──────────────────────────────────────────────────────────────────

def backfill(token, from_date):
    """Process historical data: fetch day-by-day, accumulate de-duplicated
    points, and periodically re-run the full pipeline.

    Memory optimization: raw Starlink GPS is ~94k states/day, but consecutive
    duplicates (parked van) compress ~13:1 via dedup before accumulation.
    400 days of 1 Hz GPS ≈ 3M unique points ≈ 1.2 GB RAM — feasible.

    Routing optimization: segment routing data is preserved across clear/store
    cycles by matching on (start_ts, end_ts), so only truly new segments hit
    the Valhalla proxy."""
    start = datetime.strptime(from_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    end = datetime.now(timezone.utc)

    PROCESS_EVERY = 7  # re-run pipeline every N days (balances progress vs overhead)

    clear_all()
    total_days = (end - start).days + 1
    log(f"Backfill: {from_date} to {end.strftime('%Y-%m-%d')} ({total_days} days)")

    all_points = []   # deduped points accumulated across all days
    prev_seg_count = 0
    current = start
    day_num = 0
    while current < end:
        chunk_end = min(current + timedelta(days=1), end)
        day_str = current.strftime("%Y-%m-%d")
        day_num += 1

        try:
            raw = fetch_gps_from_ha(token, current, chunk_end)
            # Dedup BEFORE accumulating — 94k raw → ~7k unique per day
            day_deduped = dedup_points(raw)
            # Also dedup across the day boundary
            if all_points and day_deduped:
                if (day_deduped[0]["lat"] == all_points[-1]["lat"] and
                        day_deduped[0]["lon"] == all_points[-1]["lon"]):
                    day_deduped = day_deduped[1:]
            all_points.extend(day_deduped)
            log(f"  {day_str} ({day_num}/{total_days}): {len(raw):,} raw → "
                f"{len(day_deduped):,} unique  ({len(all_points):,} total)")
            del raw  # free full API response promptly
        except Exception as e:
            log(f"  {day_str}: fetch error: {e}")
            current = chunk_end
            time.sleep(0.3)
            continue

        if not all_points:
            current = chunk_end
            time.sleep(0.3)
            continue

        # Re-process + store periodically (every N days or on the last day)
        is_last = chunk_end >= end
        if day_num % PROCESS_EVERY == 0 or is_last:
            # Cache existing routing data before clearing
            route_cache = {}
            con = sqlite3.connect(FILTER_DB)
            for r in con.execute(
                "SELECT start_ts, end_ts, routed_geometry, distance_m "
                "FROM segments WHERE routed_geometry IS NOT NULL"
            ).fetchall():
                route_cache[(r[0], r[1])] = (r[2], r[3])
            con.close()

            # Re-process entire accumulated buffer (handles cross-midnight trips)
            segments, parking = process_gps(all_points)

            # Atomic replace
            clear_all()
            if segments or parking:
                store_results(segments, parking)

            # Restore cached routing for unchanged segments
            if route_cache:
                con = sqlite3.connect(FILTER_DB)
                restored = 0
                for row in con.execute(
                    "SELECT id, start_ts, end_ts FROM segments"
                ).fetchall():
                    key = (row[1], row[2])
                    if key in route_cache:
                        con.execute(
                            "UPDATE segments SET routed_geometry = ?, distance_m = ? "
                            "WHERE id = ?",
                            (route_cache[key][0], route_cache[key][1], row[0]))
                        restored += 1
                con.commit()
                con.close()
                route_cache.clear()

            set_meta("last_processed_ts", all_points[-1]["ts"])

            new_segs = len(segments) - prev_seg_count
            log(f"    → {len(segments)} total trips (+{max(0, new_segs)}), {len(parking)} stops")

            # Route only truly new (unrouted) segments
            unrouted = get_unrouted_segments()
            if unrouted:
                log(f"    Routing {len(unrouted)} new segments...")
                for seg in unrouted:
                    pts = seg["points"]
                    nearby_parking = get_all_parking_in_range(
                        pts[0]["ts"] - 300000, pts[-1]["ts"] + 300000)
                    trimmed = trim_segment_for_routing(pts, nearby_parking)
                    geometry, distance = route_via_proxy(trimmed)
                    if geometry:
                        update_segment_route(seg["id"], geometry, distance)
                    else:
                        update_segment_route(seg["id"], [], 0)
                    time.sleep(0.3)

            prev_seg_count = len(segments)

        current = chunk_end
        time.sleep(0.3)

    log(f"Backfill complete! {prev_seg_count} trips across {day_num} days")


# ── Incremental Processing ────────────────────────────────────────────────────

def incremental_run(token):
    """One incremental processing pass.

    Strategy: re-process today's GPS data every cycle. This avoids complex state
    machine serialization. The state machine processes from midnight to (now - 5min),
    so all stops within the window are finalized. Old segments are atomically
    replaced. Routing hits the proxy cache for unchanged segments (instant).
    """
    now = datetime.now(timezone.utc)
    safe_end = now - timedelta(seconds=PROCESS_DELAY_S)

    # Today's midnight (UTC)
    today_midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_midnight_ts = today_midnight.timestamp() * 1000

    # Fetch today's GPS data
    try:
        points = fetch_gps_from_ha(token, today_midnight, safe_end)
    except Exception as e:
        log(f"Incremental: HA fetch error: {e}")
        return

    if not points:
        set_meta("last_processed_ts", safe_end.timestamp() * 1000)
        return

    # Process today's data
    segments, parking = process_gps(points)

    # Atomically replace today's data
    store_results(segments, parking, clear_after_ts=today_midnight_ts)
    set_meta("last_processed_ts", safe_end.timestamp() * 1000)

    if segments or parking:
        moving_pts = sum(len(s) for s in segments)
        log(f"Incremental: {len(segments)} segs ({moving_pts} pts), "
            f"{len(parking)} parking — today so far")

    # Route any new segments (proxy cache handles unchanged ones)
    route_unrouted()


# ── Daemon Loop ───────────────────────────────────────────────────────────────

def daemon_loop(token):
    log(f"GPS Filter daemon started (poll every {POLL_INTERVAL_S}s, "
        f"delay {PROCESS_DELAY_S}s)")
    while True:
        try:
            incremental_run(token)
        except Exception as e:
            log(f"Daemon error: {e}")
            traceback.print_exc()
        time.sleep(POLL_INTERVAL_S)


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GPS Filter Daemon")
    parser.add_argument("--token", help="HA long-lived access token (or read from token file)")
    parser.add_argument("--backfill", action="store_true", help="Backfill historical data")
    parser.add_argument("--from", dest="from_date", default="2025-01-01",
                        help="Backfill start date YYYY-MM-DD (default: 2025-01-01)")
    parser.add_argument("--daemon", action="store_true", help="Run as daemon (after backfill if combined)")
    parser.add_argument("--route-only", action="store_true", help="Only route unrouted segments")
    args = parser.parse_args()

    # Resolve token
    token = args.token or read_token()
    if not token and not args.route_only:
        print(f"Error: no token. Pass --token or create {TOKEN_FILE}", file=sys.stderr)
        sys.exit(1)

    init_db()

    if args.route_only:
        route_unrouted()
    elif args.backfill:
        backfill(token, args.from_date)
        if args.daemon:
            daemon_loop(token)
    else:
        daemon_loop(token)
