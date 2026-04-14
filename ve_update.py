#!/usr/bin/env python3
"""
ve_update.py  from_ts_ms  to_ts_ms

Called automatically by the "Fill-up Detected" HA automation after stable_fuel_level
rises more than 15 percentage points (indicating a fill-up occurred).

What it does:
  1. Queries /vanlife/fuel-stats?from_ts=...&to_ts=... to get GPS distance,
     actual fuel used, and the estimated consumption average for that period.
  2. Derives a suggested VE correction: current_ve × (actual / estimated).
  3. Reads input_text.ve_correction_history (JSON array, last 10 entries).
  4. Appends the new entry, computes a rolling average of all stored corrections,
     and clamps to a sane range [0.10 – 1.50].
  5. Writes the averaged VE to input_number.fuel_ve_correction via HA REST API.
  6. Writes the updated history array to input_text.ve_correction_history.

Requires:
  - /config/.gps_filter_token  (long-lived HA token)
  - osrm_proxy.py running on localhost:8765
  - /vanlife/fuel-stats endpoint (added to osrm_proxy.py April 2026)
"""

import sys
import json
import time
import datetime
import urllib.request
import urllib.parse

HA_URL       = "http://localhost:8123"
PROXY_URL    = "http://localhost:8765"
TOKEN_FILE   = "/config/.gps_filter_token"
HISTORY_MAX  = 5           # keep last 5 fill-up corrections (must fit in 255-char input_text)
MIN_DISTANCE = 50          # km — don't update VE if the drive was very short
MIN_VE       = 0.10
MAX_VE       = 1.50


# ─── HA REST helpers ─────────────────────────────────────────────────────────

def _get_token():
    with open(TOKEN_FILE) as f:
        return f.read().strip()


def _ha_get(token, entity_id):
    req = urllib.request.Request(
        f"{HA_URL}/api/states/{entity_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())


def _ha_post(token, entity_id, state, attributes=None):
    payload = json.dumps({
        "state": str(state),
        "attributes": attributes or {}
    }).encode()
    req = urllib.request.Request(
        f"{HA_URL}/api/states/{entity_id}",
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 3:
        print("Usage: ve_update.py from_ts_ms to_ts_ms", file=sys.stderr)
        sys.exit(1)

    try:
        from_ts = int(sys.argv[1])
        to_ts   = int(sys.argv[2])
    except ValueError:
        print(f"ERROR: arguments must be integer epoch-ms values", file=sys.stderr)
        sys.exit(1)

    # If from_ts is 0 or before 2020, default to 30 days ago
    # (first ever fill-up or corrupted state)
    epoch_2020 = 1577836800000  # 2020-01-01 in ms
    if from_ts < epoch_2020:
        from_ts = int((time.time() - 30 * 86400) * 1000)
        print(f"from_ts was before 2020 — defaulting to 30 days ago "
              f"({from_ts})", flush=True)

    # ── 1. Query fuel-stats ──────────────────────────────────────────────────
    url = f"{PROXY_URL}/vanlife/fuel-stats?from_ts={from_ts}&to_ts={to_ts}"
    print(f"Querying: {url}", flush=True)
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            stats = json.loads(r.read())
    except Exception as e:
        print(f"ERROR: failed to reach fuel-stats endpoint: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Stats: {json.dumps(stats, indent=2)}", flush=True)

    suggested_ve     = stats.get("suggested_ve_correction")
    actual_l100km    = stats.get("fuel_economy_l100km")
    estimated_l100km = stats.get("estimated_avg_l100km")
    distance_km      = stats.get("distance_km", 0)
    current_ve       = stats.get("current_ve_correction", 0.55)

    # ── 2. Sanity checks ─────────────────────────────────────────────────────
    if suggested_ve is None:
        reasons = []
        if actual_l100km is None:
            reasons.append("no actual fuel economy (need GPS distance + fuel delta)")
        if estimated_l100km is None:
            reasons.append("no estimated fuel consumption data")
        print(f"No suggested VE available: {', '.join(reasons)}. Skipping.", flush=True)
        sys.exit(0)

    if distance_km < MIN_DISTANCE:
        print(f"Distance too short ({distance_km:.1f} km < {MIN_DISTANCE} km). "
              f"Skipping VE update to avoid noise.", flush=True)
        sys.exit(0)

    # Reject implausible suggestions (more than 3× off from current)
    if not (current_ve / 3 <= suggested_ve <= current_ve * 3):
        print(f"Suggested VE {suggested_ve} is implausible relative to current "
              f"{current_ve}. Skipping.", flush=True)
        sys.exit(0)

    # ── 3. Load history ──────────────────────────────────────────────────────
    token = _get_token()
    history = []
    try:
        hist_state = _ha_get(token, "input_text.ve_correction_history")
        raw = hist_state.get("state", "[]")
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            history = parsed
    except Exception as e:
        print(f"Warning: could not read VE history: {e}. Starting fresh.", flush=True)
        history = []

    # ── 4. Append entry ──────────────────────────────────────────────────────
    entry = {
        "d": datetime.date.today().isoformat(),
        "v": round(float(suggested_ve), 3),
        "l": round(float(actual_l100km), 1) if actual_l100km is not None else None,
        "k": round(float(distance_km), 0),
    }
    history.append(entry)
    history = history[-HISTORY_MAX:]

    # ── 5. Rolling average (with mild outlier rejection) ─────────────────────
    ve_values = [e["v"] for e in history if isinstance(e.get("v"), (int, float))]

    if len(ve_values) >= 3:
        # Exclude values outside ±50% of the median
        sorted_v = sorted(ve_values)
        median   = sorted_v[len(sorted_v) // 2]
        filtered = [v for v in ve_values if 0.5 * median <= v <= 1.5 * median]
        avg_ve   = sum(filtered) / len(filtered) if filtered else float(suggested_ve)
    else:
        avg_ve = sum(ve_values) / len(ve_values)

    new_ve = round(max(MIN_VE, min(MAX_VE, avg_ve)), 3)
    print(f"VE history values: {ve_values}", flush=True)
    print(f"Averaged VE: {avg_ve:.3f} → applying {new_ve} "
          f"(clamped to [{MIN_VE}, {MAX_VE}])", flush=True)

    # ── 6. Write back to HA ──────────────────────────────────────────────────
    # Update input_number.fuel_ve_correction
    _ha_post(token, "input_number.fuel_ve_correction", new_ve)
    print(f"Set input_number.fuel_ve_correction = {new_ve}", flush=True)

    # Update input_text.ve_correction_history (must stay ≤ 255 chars — HA hard limit)
    hist_json = json.dumps(history, separators=(",", ":"))
    while len(hist_json) > 255 and history:
        history.pop(0)
        hist_json = json.dumps(history, separators=(",", ":"))
    _ha_post(token, "input_text.ve_correction_history", hist_json)
    print(f"Updated VE history ({len(history)} entries): {hist_json}", flush=True)


if __name__ == "__main__":
    main()
