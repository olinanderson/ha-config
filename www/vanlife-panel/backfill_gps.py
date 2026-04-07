#!/usr/bin/env python3
"""Backfill gps_track from Starlink device_location in HA recorder.

Run on HA host: sudo python3 /config/www/vanlife-panel/backfill_gps.py
"""
import sqlite3
import json
import time

HA_DB = "/config/home-assistant_v2.db"
VL_DB = "/config/vanlife_tracker.db"
METADATA_ID = 366  # device_tracker.starlink_device_location
DAYS_BACK = 30

ha = sqlite3.connect(HA_DB)
vl = sqlite3.connect(VL_DB)
vl.execute("PRAGMA journal_mode=WAL")
vl.execute("PRAGMA synchronous=NORMAL")

min_ts_row = vl.execute("SELECT MIN(ts) FROM gps_track").fetchone()
min_ts = min_ts_row[0] if min_ts_row[0] else time.time()
cutoff = time.time() - DAYS_BACK * 86400

gap_days = (min_ts - cutoff) / 86400
print("Filling %.1f day gap into gps_track" % gap_days)

# Step 1: Get unique attribute IDs in the time window (fast — uses index on metadata_id)
print("Step 1: Getting unique attribute IDs...")
attr_rows = ha.execute(
    "SELECT DISTINCT attributes_id FROM states "
    "WHERE metadata_id = ? AND last_updated_ts >= ? AND last_updated_ts < ?",
    (METADATA_ID, cutoff, min_ts),
).fetchall()
attr_ids = [r[0] for r in attr_rows if r[0] is not None]
print("  Found %d unique attribute sets" % len(attr_ids))

# Step 2: Resolve each to lat/lon (fast — point lookups by PK)
print("Step 2: Resolving lat/lon...")
attr_map = {}
ABATCH = 500
for i in range(0, len(attr_ids), ABATCH):
    chunk = attr_ids[i : i + ABATCH]
    placeholders = ",".join(["?"] * len(chunk))
    rows = ha.execute(
        "SELECT attributes_id, shared_attrs FROM state_attributes "
        "WHERE attributes_id IN (%s)" % placeholders,
        chunk,
    ).fetchall()
    for aid, attrs_str in rows:
        try:
            attrs = json.loads(attrs_str)
            lat = attrs.get("latitude")
            lon = attrs.get("longitude")
            if lat and lon and lat != 0 and lon != 0:
                attr_map[aid] = (round(float(lat), 7), round(float(lon), 7))
        except Exception:
            pass
print("  Resolved %d attribute sets with valid lat/lon" % len(attr_map))

# Step 3: Stream timestamps in large batches and insert
print("Step 3: Inserting GPS points...")
BATCH = 100000
inserted = 0
cur_ts = cutoff

while cur_ts < min_ts:
    rows = ha.execute(
        "SELECT last_updated_ts, attributes_id FROM states "
        "WHERE metadata_id = ? AND last_updated_ts >= ? AND last_updated_ts < ? "
        "ORDER BY last_updated_ts LIMIT ?",
        (METADATA_ID, cur_ts, min_ts, BATCH),
    ).fetchall()
    if not rows:
        break

    batch = []
    for ts_val, aid in rows:
        coords = attr_map.get(aid)
        if coords:
            batch.append((round(ts_val, 3), coords[0], coords[1]))

    if batch:
        vl.executemany(
            "INSERT OR IGNORE INTO gps_track (ts, lat, lon) VALUES (?, ?, ?)", batch
        )
        vl.commit()
        inserted += len(batch)

    cur_ts = rows[-1][0] + 0.001
    pct = (cur_ts - cutoff) / (min_ts - cutoff) * 100
    print("  %d%% — +%d batch (total: %d)" % (int(pct), len(batch), inserted))

vl.close()
ha.close()
print("\nDone! Inserted: %d" % inserted)
