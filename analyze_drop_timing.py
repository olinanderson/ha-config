#!/usr/bin/env python
"""Read-only: is the Sterling half-power drop TIME-driven (a timer parameter) rather than
voltage- or temperature-driven?

Two tests:
 1. FRACTION of time in the reduced cluster vs pack voltage. The earlier analysis used a
    MEDIAN, which is dominated by the ~81% full-power state and hides any effect acting on
    the minority state. Fraction is the correct statistic.
 2. TIME structure: delay from charge-session start to first drop, and the interval between
    consecutive drops. Sterling documents a 240 s turn-off timer; intervals clustering near
    240 s would implicate a timer parameter rather than a thermal trip.

Usage: python analyze_drop_timing.py [days]
"""
import urllib.request, urllib.parse, json, datetime as dt, sys

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 21
GRID = 10

E = {
    "CH8": "sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger",
    "IV":  "sensor.a32_pro_orion_input_voltage",
    "BV":  "sensor.olins_van_bms_voltage",
    "RPM": "sensor.192_168_10_90_0c_enginerpm",
    "SPD": "sensor.192_168_10_90_0d_vehiclespeed",
    "SOC": "sensor.olins_van_bms_battery",
    "TMP": "sensor.olins_van_bms_temperature",
}
inv = {v: k for k, v in E.items()}
now = dt.datetime.now(dt.timezone.utc)
series = {k: [] for k in E}
for d in range(DAYS, 0, -1):
    a, b = now - dt.timedelta(days=d), now - dt.timedelta(days=d - 1)
    qs = urllib.parse.urlencode({"filter_entity_id": ",".join(E.values()),
        "end_time": b.strftime("%Y-%m-%dT%H:%M:%S+00:00"), "minimal_response": "", "no_attributes": ""})
    req = urllib.request.Request(
        f"{HA}/api/history/period/{a.strftime('%Y-%m-%dT%H:%M:%S+00:00')}?{qs}",
        headers={"Authorization": "Bearer " + TOKEN})
    try:
        data = json.load(urllib.request.urlopen(req, timeout=180))
    except Exception as ex:
        print(f"  fetch {a.date()} failed: {ex}", file=sys.stderr)
        continue
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
for k in series:
    series[k].sort()
print("points: " + ", ".join(f"{k}={len(v)}" for k, v in series.items()))


def num(v):
    try:
        return float(v)
    except Exception:
        return None


def stepper(pairs, max_age=60):
    d = [(t, num(s)) for t, s in pairs]
    def look(t, ptr=[0]):
        if not d:
            return None
        i = ptr[0]
        while i + 1 < len(d) and d[i + 1][0] <= t:
            i += 1
        ptr[0] = i
        if d[i][0] > t or (t - d[i][0]) > max_age:
            return None
        return d[i][1]
    return look


L = {k: stepper(series[k]) for k in E}
grid = []
t = (now - dt.timedelta(days=DAYS)).timestamp()
while t <= now.timestamp():
    grid.append((t, {k: L[k](t) for k in E}))
    t += GRID
isn = lambda v: isinstance(v, (int, float))


def pct(v, q):
    v = sorted(v)
    return v[min(len(v) - 1, int(q / 100 * (len(v) - 1)))]


FULL, RED_LO, RED_HI = 70.0, 50.0, 66.0

# ---- TEST 1: fraction in reduced cluster vs pack voltage -------------------
cr = [r for _, r in grid
      if isn(r["RPM"]) and 1100 <= r["RPM"] < 1900 and isn(r["SPD"]) and r["SPD"] > 30
      and isn(r["IV"]) and r["IV"] >= 13.6 and isn(r["CH8"]) and r["CH8"] > 40
      and isn(r["BV"]) and isn(r["SOC"]) and r["SOC"] < 78]
print(f"\ncruise + healthy bus + SOC<78% samples: n={len(cr)}")
print("\n=== TEST 1: %% of time in the REDUCED cluster (50-66A) vs PACK VOLTAGE ===")
print("  (the median hid this). A rising %% with pack V would support a voltage setpoint.")
print(f"{'pack V':>13} {'n':>6} {'reduced':>8} {'% reduced':>10}")
for lo, hi in [(26.4, 26.8), (26.8, 27.0), (27.0, 27.2), (27.2, 27.4), (27.4, 27.8)]:
    g = [r for r in cr if lo <= r["BV"] < hi]
    if len(g) < 6:
        continue
    red = sum(1 for r in g if RED_LO <= r["CH8"] < RED_HI)
    print(f"{lo:5.2f}-{hi:<6.2f} {len(g):6d} {red:8d} {100*red/len(g):9.1f}%")

print("\n=== TEST 1b: same, vs BATTERY TEMPERATURE (thermal-trip hypothesis) ===")
print(f"{'batt C':>13} {'n':>6} {'reduced':>8} {'% reduced':>10}")
for lo, hi in [(15, 20), (20, 22), (22, 24), (24, 26), (26, 40)]:
    g = [r for r in cr if isn(r["TMP"]) and lo <= r["TMP"] < hi]
    if len(g) < 6:
        continue
    red = sum(1 for r in g if RED_LO <= r["CH8"] < RED_HI)
    print(f"{lo:5.0f}-{hi:<7.0f} {len(g):6d} {red:8d} {100*red/len(g):9.1f}%")

# ---- TEST 2: time structure ------------------------------------------------
print("\n=== TEST 2: TIME structure of the drops ===")
chg = [(t, r) for t, r in grid if isn(r["CH8"]) and r["CH8"] > 40]
sessions, cur, last = [], [], None
for t, r in chg:
    if last is not None and t - last > 300:
        if len(cur) > 6:
            sessions.append(cur)
        cur = []
    cur.append((t, r))
    last = t
if len(cur) > 6:
    sessions.append(cur)
print(f"  charging sessions (>40A, split on >5min gap): {len(sessions)}")

firsts, intervals, holds = [], [], []
for s in sessions:
    t0 = s[0][0]
    drops, recovers = [], []
    state = "full"
    for t, r in s:
        if state == "full" and r["CH8"] < RED_HI:
            drops.append(t)
            state = "red"
        elif state == "red" and r["CH8"] >= FULL:
            recovers.append(t)
            state = "full"
    if drops:
        firsts.append(drops[0] - t0)
        for i in range(1, len(drops)):
            intervals.append(drops[i] - drops[i - 1])
        for i, dt0 in enumerate(drops):
            nxt = [x for x in recovers if x > dt0]
            if nxt:
                holds.append(nxt[0] - dt0)

if firsts:
    print(f"\n  delay from session start to FIRST drop (n={len(firsts)}):")
    print(f"    median {pct(firsts,50):.0f}s  p25 {pct(firsts,25):.0f}s  p75 {pct(firsts,75):.0f}s  "
          f"min {min(firsts):.0f}s  max {max(firsts):.0f}s")
    print("    sorted values (s):", sorted(int(x) for x in firsts)[:24])

if intervals:
    print(f"\n  interval BETWEEN consecutive drops (n={len(intervals)}):")
    print(f"    median {pct(intervals,50):.0f}s  p25 {pct(intervals,25):.0f}s  p75 {pct(intervals,75):.0f}s")
    print("    histogram (60s bins):")
    for lo in range(0, 1020, 60):
        c = sum(1 for x in intervals if lo <= x < lo + 60)
        if c:
            flag = "  <-- 240s Sterling timer" if lo <= 240 < lo + 60 else ""
            print(f"      {lo:4d}-{lo+60:4d}s | {c:4d} {'#'*min(46, c*3)}{flag}")
    n2 = sum(1 for x in intervals if 180 <= x <= 300)
    print(f"    in the 180-300s band (i.e. ~240s): {n2}/{len(intervals)} = "
          f"{100*n2/len(intervals):.0f}%")

if holds:
    print(f"\n  HOLD duration in reduced state before recovery (n={len(holds)}):")
    print(f"    median {pct(holds,50):.0f}s  p25 {pct(holds,25):.0f}s  p75 {pct(holds,75):.0f}s  "
          f"max {max(holds):.0f}s")
    print("    A tightly clustered hold implicates a fixed timer; a broad spread implicates")
    print("    a thermal cooldown, which depends on conditions.")
    import statistics
    if len(holds) > 2:
        cv = statistics.pstdev(holds) / (sum(holds) / len(holds))
        print(f"    coefficient of variation = {cv:.2f}  "
              f"({'tight -> timer' if cv < 0.35 else 'broad -> condition-dependent'})")
