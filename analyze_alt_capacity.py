#!/usr/bin/env python
"""Read-only: is the idle voltage collapse a CAPACITY limit or something else?

Clean discriminator: at the same idle RPM, sweep charger load and watch the bus.
  * Voltage high with no load, falling progressively as load rises
      -> alternator regulates fine, it is simply out of output at idle RPM (load-line).
  * Voltage low even with NO charger load
      -> not a capacity story; suspect ECU-commanded reduction, belt slip, or wiring.
Engine load % is the corroborating signal: if the alternator is genuinely producing,
it costs the engine torque, so calculated load should CLIMB with charger current.

Usage: python analyze_alt_capacity.py [days]
"""
import urllib.request, urllib.parse, json, datetime as dt, sys

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 21
GRID = 10

E = {
    "CH8":  "sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger",
    "IV":   "sensor.a32_pro_orion_input_voltage",
    "CMV":  "sensor.192_168_10_90_42_controlmodulevolt",
    "RPM":  "sensor.192_168_10_90_0c_enginerpm",
    "SPD":  "sensor.192_168_10_90_0d_vehiclespeed",
    "LOAD": "sensor.192_168_10_90_04_calcengineload",
    "THR":  "sensor.192_168_10_90_11_throttleposition",
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


def stepper(pairs, max_age=30):
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
rows = []
t = (now - dt.timedelta(days=DAYS)).timestamp()
while t <= now.timestamp():
    rows.append({k: L[k](t) for k in E})
    t += GRID
isn = lambda v: isinstance(v, (int, float))


def pct(v, q):
    v = sorted(v)
    return v[min(len(v) - 1, int(q / 100 * (len(v) - 1)))]


# Idle = engine running, vehicle stationary, low rpm. Throttle-closed keeps out
# blips where the driver is feathering the pedal.
idle = [r for r in rows if isn(r["RPM"]) and 700 <= r["RPM"] < 1000
        and isn(r["SPD"]) and r["SPD"] <= 2 and isn(r["IV"]) and isn(r["CH8"])]
print(f"\nidle samples (700-1000 rpm, stationary): {len(idle)} ({len(idle)*GRID/60:.0f} min)")

print("\n=== AT IDLE: bus voltage vs charger load  (the discriminator) ===")
print(f"{'charger A':>14} {'n':>6} {'medIV':>7} {'p5 IV':>7} {'medECUv':>8} {'medLOAD%':>9} {'medRPM':>7}")
for lo, hi in [(0, 2), (2, 10), (10, 25), (25, 40), (40, 55), (55, 68), (68, 95)]:
    g = [r for r in idle if lo <= r["CH8"] < hi]
    if len(g) < 4:
        continue
    loads = [r["LOAD"] for r in g if isn(r["LOAD"])]
    cmvs = [r["CMV"] for r in g if isn(r["CMV"])]
    print(f"{lo:5.0f}-{hi:<8.0f} {len(g):6d} {pct([r['IV'] for r in g],50):6.2f}V "
          f"{pct([r['IV'] for r in g],5):6.2f}V "
          f"{(f'{pct(cmvs,50):.2f}V' if cmvs else 'NA'):>8} "
          f"{(f'{pct(loads,50):.0f}%' if loads else 'NA'):>9} "
          f"{pct([r['RPM'] for r in g],50):6.0f}")

print("\n=== same sweep while MOVING at cruise (rpm 1200-1800) for comparison ===")
cruise = [r for r in rows if isn(r["RPM"]) and 1200 <= r["RPM"] < 1800
          and isn(r["SPD"]) and r["SPD"] > 25 and isn(r["IV"]) and isn(r["CH8"])]
print(f"cruise samples: {len(cruise)}")
print(f"{'charger A':>14} {'n':>6} {'medIV':>7} {'p5 IV':>7} {'medECUv':>8} {'medLOAD%':>9}")
for lo, hi in [(0, 2), (2, 10), (10, 25), (25, 40), (40, 55), (55, 68), (68, 95)]:
    g = [r for r in cruise if lo <= r["CH8"] < hi]
    if len(g) < 4:
        continue
    loads = [r["LOAD"] for r in g if isn(r["LOAD"])]
    cmvs = [r["CMV"] for r in g if isn(r["CMV"])]
    print(f"{lo:5.0f}-{hi:<8.0f} {len(g):6d} {pct([r['IV'] for r in g],50):6.2f}V "
          f"{pct([r['IV'] for r in g],5):6.2f}V "
          f"{(f'{pct(cmvs,50):.2f}V' if cmvs else 'NA'):>8} "
          f"{(f'{pct(loads,50):.0f}%' if loads else 'NA'):>9}")

# Highest bus voltage ever seen at idle - proves the regulator's target is normal
print("\n=== best-case idle voltage (proves the regulator target, not a capacity story) ===")
unloaded = [r for r in idle if r["CH8"] < 2]
if unloaded:
    ivs = [r["IV"] for r in unloaded]
    print(f"  idle, chargers OFF: n={len(ivs)}  med={pct(ivs,50):.2f}V  "
          f"p90={pct(ivs,90):.2f}V  max={max(ivs):.2f}V")
    print("  -> if this is ~14.2-14.5V the alternator regulates fine at idle unloaded,")
    print("     and the sag under load is a pure output-capability limit at that rpm.")
else:
    print("  no idle samples with chargers off in this window")

loaded = [r for r in idle if r["CH8"] >= 55]
if loaded and unloaded:
    print(f"\n  idle, chargers >=55A: n={len(loaded)}  med={pct([r['IV'] for r in loaded],50):.2f}V")
    drop = pct([r["IV"] for r in unloaded], 50) - pct([r["IV"] for r in loaded], 50)
    print(f"  voltage lost to charger load at idle: {drop:.2f}V")

# Does engine load actually rise with charger current? If yes the alternator IS working.
print("\n=== does the alternator cost the engine torque at idle? ===")
pairs = [(r["CH8"], r["LOAD"]) for r in idle if isn(r["LOAD"])]
if len(pairs) > 20:
    n = len(pairs)
    mx = sum(p[0] for p in pairs) / n
    my = sum(p[1] for p in pairs) / n
    cov = sum((p[0] - mx) * (p[1] - my) for p in pairs)
    vx = sum((p[0] - mx) ** 2 for p in pairs) ** 0.5
    vy = sum((p[1] - my) ** 2 for p in pairs) ** 0.5
    if vx > 0 and vy > 0:
        print(f"  correlation(charger current, calc engine load) at idle = {cov/(vx*vy):+.3f}  (n={n})")
    lo = [p[1] for p in pairs if p[0] < 10]
    hi = [p[1] for p in pairs if p[0] >= 55]
    if lo:
        print(f"    chargers <10A : median engine load {pct(lo,50):.0f}%  (n={len(lo)})")
    if hi:
        print(f"    chargers >=55A: median engine load {pct(hi,50):.0f}%  (n={len(hi)})")
    print("  A clear rise means the alternator is genuinely producing and loading the")
    print("  engine - which rules out belt slip and ECU-commanded field reduction.")
