#!/usr/bin/env python
"""Read-only: which circuit is Starlink on, and does its snooze actually save power?

The dish's snooze window is configured at time.starlink_sleep_start/_end (live: 01:00-08:00).
If Starlink sits on the "12V Devices" branch (CH6) its current should step DOWN at 01:00 and
back UP at 08:00. If the step shows on "24V Devices" (CH5) instead, it's on that branch.
No step on either => snooze isn't saving a measurable amount.

Usage: python analyze_starlink_snooze_step.py [nights]
"""
import urllib.request, urllib.parse, json, datetime as dt, sys
from statistics import mean

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
NIGHTS = int(sys.argv[1]) if len(sys.argv) > 1 else 6

E = {
    "CH5": "sensor.a32_pro_s5140_channel_5_current_24v_24v_devices",   # 24V Devices
    "CH6": "sensor.a32_pro_s5140_channel_6_current_24v_12v_devices",   # 12V Devices
}
inv = {v: k for k, v in E.items()}
AWAKE = [22, 23, 0]        # before snooze starts at 01:00
ASLEEP = [1, 2, 3, 4, 5, 6, 7]  # snooze window
POST = [8]                 # after wake at 08:00


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


now = dt.datetime.now()
per_night = []   # (date, {hour: {CH: mean_A}})
pooled = {k: {} for k in E}  # CH -> hour -> [vals]

for i in range(1, NIGHTS + 1):
    evening = (now - dt.timedelta(days=i)).replace(hour=21, minute=0, second=0, microsecond=0)
    morning = evening + dt.timedelta(hours=12)   # 21:00 -> 09:00
    if morning > now:
        continue
    a_utc = dt.datetime.fromtimestamp(evening.timestamp(), dt.timezone.utc)
    b_utc = dt.datetime.fromtimestamp(morning.timestamp(), dt.timezone.utc)
    try:
        data = fetch(a_utc, b_utc)
    except Exception as ex:
        print(f"  fetch {evening.date()} failed: {ex}", file=sys.stderr)
        continue
    hours = {}
    for sub in data:
        if not sub:
            continue
        k = inv.get(sub[0].get("entity_id"))
        if not k:
            continue
        for it in sub:
            ts = (it.get("last_changed") or it.get("last_updated") or "").replace("Z", "+00:00")
            v = num(it.get("state"))
            if v is None:
                continue
            try:
                t = dt.datetime.fromisoformat(ts).timestamp()
            except Exception:
                continue
            h = dt.datetime.fromtimestamp(t).hour
            hours.setdefault(h, {}).setdefault(k, []).append(v)
            pooled[k].setdefault(h, []).append(v)
    per_night.append((evening.date(), hours))

order = [21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8]
print("\n=== mean current by hour, pooled across nights (A) ===")
print(f"  {'hour':>5} {'CH5 24V Dev':>12} {'CH6 12V Dev':>12}   {'':4}")
for h in order:
    c5 = pooled["CH5"].get(h)
    c6 = pooled["CH6"].get(h)
    mark = "  <- snooze starts" if h == 1 else ("  <- wake" if h == 8 else "")
    print(f"  {h:02d}:00 {(mean(c5) if c5 else float('nan')):12.2f} "
          f"{(mean(c6) if c6 else float('nan')):12.2f}{mark}")


def window_mean(pool, hrs):
    vals = []
    for h in hrs:
        vals += pool.get(h, [])
    return mean(vals) if vals else None


print("\n=== awake (22-00) vs snooze (01-07) vs post-wake (08) ===")
for k, label in [("CH5", "CH5 24V Devices"), ("CH6", "CH6 12V Devices")]:
    a = window_mean(pooled[k], AWAKE)
    s = window_mean(pooled[k], ASLEEP)
    p = window_mean(pooled[k], POST)
    if a is None or s is None:
        print(f"  {label}: insufficient data")
        continue
    # channels are measured on the 24V side -> W at ~26.4V nominal pack
    dW = (a - s) * 26.4
    print(f"  {label}: awake {a:.2f}A  snooze {s:.2f}A  post-wake {(p if p else float('nan')):.2f}A"
          f"   step {a-s:+.2f}A ({-dW:+.0f}W while asleep)")

print("\n=== per-night step at 01:00 (awake 22-00 mean -> snooze 01-07 mean) ===")
print(f"  {'night':>12} {'CH5 awake':>10} {'CH5 sleep':>10} {'CH5 step':>9} | "
      f"{'CH6 awake':>10} {'CH6 sleep':>10} {'CH6 step':>9}")
for date, hours in per_night:
    row = [str(date).rjust(12)]
    for k in ["CH5", "CH6"]:
        aw = [v for h in AWAKE for v in hours.get(h, {}).get(k, [])]
        sl = [v for h in ASLEEP for v in hours.get(h, {}).get(k, [])]
        if aw and sl:
            row.append(f"{mean(aw):10.2f}{mean(sl):11.2f}{mean(aw)-mean(sl):+10.2f}")
        else:
            row.append(f"{'--':>10}{'--':>11}{'--':>10}")
    print("  " + " | ".join(row))
