#!/usr/bin/env python
"""Read-only: does channel 5 (24V Devices) or channel 6 (12V Devices) look like a
thermostatically-cycling compressor fridge (clean on/off steps, ~10-40min period)
vs a flat continuous electronics baseline? Full-resolution history, no grid smoothing.

Usage: python analyze_24v_12v_duty_cycle.py [nights_back_start] [n_nights]
  e.g. `python analyze_24v_12v_duty_cycle.py 1 3` = the 3 most recent nights.
"""
import urllib.request, urllib.parse, json, datetime as dt, sys
from statistics import mean, median

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
START_BACK = int(sys.argv[1]) if len(sys.argv) > 1 else 1
N_NIGHTS = int(sys.argv[2]) if len(sys.argv) > 2 else 3

E = {
    "CH5": "sensor.a32_pro_s5140_channel_5_current_24v_24v_devices",   # 24V Devices
    "CH6": "sensor.a32_pro_s5140_channel_6_current_24v_12v_devices",   # 12V Devices
}
inv = {v: k for k, v in E.items()}


def fetch(a, b):
    qs = urllib.parse.urlencode({
        "filter_entity_id": ",".join(E.values()),
        "end_time": b.strftime("%Y-%m-%dT%H:%M:%S+00:00"),
        "minimal_response": "", "no_attributes": "",
    })
    url = f"{HA}/api/history/period/{a.strftime('%Y-%m-%dT%H:%M:%S+00:00')}?{qs}"
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + TOKEN})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


def num(v):
    try:
        return abs(float(v))
    except Exception:
        return None


def analyze_channel(pairs, label):
    pairs = [(t, num(s)) for t, s in pairs if num(s) is not None]
    pairs.sort()
    if len(pairs) < 20:
        print(f"    {label}: not enough points ({len(pairs)})")
        return
    vals = [v for _, v in pairs]
    lo, hi = min(vals), max(vals)
    # simple 2-cluster split at midpoint between the 10th and 90th percentile
    sv = sorted(vals)
    p10 = sv[int(0.10 * (len(sv) - 1))]
    p90 = sv[int(0.90 * (len(sv) - 1))]
    thresh = (p10 + p90) / 2
    print(f"    {label}: n={len(pairs)}  min={lo:.2f}A p10={p10:.2f}A median={median(vals):.2f}A "
          f"p90={p90:.2f}A max={hi:.2f}A  (split @ {thresh:.2f}A)")

    # histogram
    binw = max(0.05, round((hi - lo) / 20, 2)) if hi > lo else 0.1
    hist = {}
    for v in vals:
        b = round(v / binw) * binw
        hist[b] = hist.get(b, 0) + 1
    print("      histogram: " + " ".join(
        f"{b:.2f}:{hist[b]}" for b in sorted(hist)[:25]))

    # state runs above/below thresh -> cycles
    state = None
    runs = []  # (state, start_t, end_t)
    run_start = None
    for t, v in pairs:
        s = v >= thresh
        if state is None:
            state, run_start = s, t
        elif s != state:
            runs.append((state, run_start, t))
            state, run_start = s, t
    runs.append((state, run_start, pairs[-1][0]))

    on_runs = [(e - s) / 60 for st, s, e in runs if st and (e - s) > 30]
    off_runs = [(e - s) / 60 for st, s, e in runs if not st and (e - s) > 30]
    n_cycles = min(len(on_runs), len(off_runs))
    print(f"      transitions: {len(runs)}  distinct on-runs>=30s: {len(on_runs)}  off-runs>=30s: {len(off_runs)}")
    if on_runs:
        print(f"      on-run minutes:  mean {mean(on_runs):.1f}  median {median(on_runs):.1f}  "
              f"min {min(on_runs):.1f}  max {max(on_runs):.1f}")
    if off_runs:
        print(f"      off-run minutes: mean {mean(off_runs):.1f}  median {median(off_runs):.1f}  "
              f"min {min(off_runs):.1f}  max {max(off_runs):.1f}")
    step = (mean([v for v in vals if v >= thresh]) - mean([v for v in vals if v < thresh])) \
        if any(v >= thresh for v in vals) and any(v < thresh for v in vals) else 0
    print(f"      step amplitude (high-mean minus low-mean): {step:.2f}A  "
          f"({'looks like clean duty-cycling' if n_cycles >= 3 and step > 0.15 else 'looks flat / no clear cycling'})")


now = dt.datetime.now()
for i in range(N_NIGHTS):
    back = START_BACK + i
    evening = (now - dt.timedelta(days=back)).replace(hour=22, minute=0, second=0, microsecond=0)
    morning = evening + dt.timedelta(hours=9)
    if morning > now:
        continue
    print(f"\n=== night {evening.date()} 22:00 -> {morning.date()} 07:00 (local) ===")
    a_utc = evening.astimezone(dt.timezone.utc) if evening.tzinfo else evening.astimezone()
    # naive local -> assume system tz matches van tz (same convention as other analyze_ scripts)
    a_utc = dt.datetime.fromtimestamp(evening.timestamp(), dt.timezone.utc)
    b_utc = dt.datetime.fromtimestamp(morning.timestamp(), dt.timezone.utc)
    try:
        data = fetch(a_utc, b_utc)
    except Exception as ex:
        print(f"  fetch failed: {ex}", file=sys.stderr)
        continue
    series = {k: [] for k in E}
    for sub in data:
        if not sub:
            continue
        k = inv.get(sub[0].get("entity_id"))
        if not k:
            continue
        for it in sub:
            ts = (it.get("last_changed") or it.get("last_updated") or "").replace("Z", "+00:00")
            try:
                t = dt.datetime.fromisoformat(ts).timestamp()
            except Exception:
                continue
            series[k].append((t, it.get("state")))
    analyze_channel(series["CH5"], "CH5 24V Devices")
    analyze_channel(series["CH6"], "CH6 12V Devices")
