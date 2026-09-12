#!/usr/bin/env python
"""Read-only: hydronic heater sessions from HA history.

For every period where Switch24 (heater relay) is ON:
  * start time, duration, fuel %, engine running?
  * coolant temp at start, at +5 min (the retry script's "rise" test), max
  * time to cross coolant thresholds (for choosing a blower-gate threshold)
  * heater-status text messages seen during the session
  * blower air temp vs coolant temp when the blower is actually running

Usage: python analyze_heater_sessions.py [days] [--timeline]
  --timeline  print a 1-min timeline for every session (verbose)
"""
import urllib.request, urllib.parse, json, datetime as dt, sys, bisect
from statistics import median

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
args = [a for a in sys.argv[1:] if not a.startswith("--")]
DAYS = int(args[0]) if args else 2
TIMELINE = "--timeline" in sys.argv
LOCAL = dt.datetime.now().astimezone().tzinfo

E = {
    "HEATER":  "switch.a32_pro_switch24_hydronic_heater",
    "SUPPLY":  "switch.a32_pro_switch32_hydronic_heater_power_supply",
    "CLIMATE": "climate.a32_pro_van_hydronic_heating_pid",
    "HOTWATER":"input_boolean.hot_water_mode",
    "STATUS":  "sensor.a32_pro_hydronic_heater_status",
    "COOL":    "sensor.a32_pro_s5140_channel_34_temperature_blower_coolant",
    "AIR":     "sensor.a32_pro_s5140_channel_35_temperature_blower_air",
    "ROOM":    "sensor.a32_pro_bme280_1_temperature",
    "PID":     "sensor.a32_pro_coolant_blower_heating_pid_climate_result",
    "FUEL":    "sensor.stable_fuel_level",
    "ENG":     "binary_sensor.engine_is_running",
    "I12":     "sensor.a32_pro_s5140_channel_6_current_24v_12v_devices",
    "LOCK":    "input_boolean.heater_low_fuel_lockout",
}
NUMERIC = {"COOL", "AIR", "ROOM", "PID", "FUEL", "I12"}
inv = {v: k for k, v in E.items()}


def fetch_day(a, b):
    qs = urllib.parse.urlencode({
        "filter_entity_id": ",".join(E.values()),
        "end_time": b.strftime("%Y-%m-%dT%H:%M:%S+00:00"),
        "minimal_response": "", "no_attributes": "",
    })
    url = f"{HA}/api/history/period/{a.strftime('%Y-%m-%dT%H:%M:%S+00:00')}?{qs}"
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + TOKEN})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


now = dt.datetime.now(dt.timezone.utc)
series = {k: [] for k in E}
for d in range(DAYS, 0, -1):
    a, b = now - dt.timedelta(days=d), now - dt.timedelta(days=d - 1)
    try:
        data = fetch_day(a, b)
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
            s = it.get("state")
            if k in NUMERIC:
                try:
                    s = float(s)
                except Exception:
                    continue
            series[k].append((t, s))
for k in series:
    series[k].sort()
    # de-dup identical timestamps
    out = []
    for t, s in series[k]:
        if out and out[-1][0] == t:
            out[-1] = (t, s)
        else:
            out.append((t, s))
    series[k] = out

times = {k: [t for t, _ in v] for k, v in series.items()}


def at(k, t):
    """Step-hold value of series k at time t (None if before first sample)."""
    i = bisect.bisect_right(times[k], t) - 1
    return series[k][i][1] if i >= 0 else None


def fmt_t(t):
    return dt.datetime.fromtimestamp(t, LOCAL).strftime("%m-%d %H:%M")


def fnum(v, nd=1):
    return "   -" if v is None else f"{v:{4+nd}.{nd}f}"


# ---- heater ON sessions ------------------------------------------------
sessions = []
cur = None
for t, s in series["HEATER"]:
    if s == "on" and cur is None:
        cur = t
    elif s != "on" and cur is not None:
        sessions.append((cur, t))
        cur = None
if cur is not None:
    sessions.append((cur, now.timestamp()))

# merge sessions separated by < 60 s (the retry script's 10 s off/on cycle)
merged = []
for a, b in sessions:
    if merged and a - merged[-1][1] < 60:
        merged[-1] = (merged[-1][0], b)
    else:
        merged.append((a, b))
sessions = merged

THRESH = [30, 35, 40, 45, 50, 55, 60, 65, 70]
print(f"\n{len(sessions)} heater sessions in the last {DAYS} days "
      f"(history samples: cool={len(series['COOL'])} air={len(series['AIR'])} status={len(series['STATUS'])})\n")

cross_stats = {th: [] for th in THRESH}
rise5 = []
for a, b in sessions:
    dur = (b - a) / 60
    c0 = at("COOL", a)
    c5 = at("COOL", a + 300)
    cmax = max([s for t, s in series["COOL"] if a <= t <= b] or [c0 or 0])
    cmin_after_max = None
    # min coolant after first reaching max-5 (steady state band)
    tmax = next((t for t, s in series["COOL"] if a <= t <= b and s >= cmax - 0.5), None)
    if tmax:
        vals = [s for t, s in series["COOL"] if tmax <= t <= b]
        if vals:
            cmin_after_max = min(vals)
    amax = max([s for t, s in series["AIR"] if a <= t <= b] or [0])
    fuel = at("FUEL", a)
    eng = [s for t, s in series["ENG"] if a - 1 <= t <= b]
    eng_any = (at("ENG", a) == "on") or ("on" in eng)
    clim = at("CLIMATE", a + 5)
    hw = at("HOTWATER", a + 5)
    print(f"=== {fmt_t(a)}  dur {dur:6.1f} min  fuel {fnum(fuel,0)}%  engine {'YES' if eng_any else 'no '}  "
          f"climate={clim} hotwater={hw}")
    print(f"    coolant start {fnum(c0)}  +5min {fnum(c5)}  (rise {fnum((c5-c0) if c0 is not None and c5 is not None else None)})"
          f"  max {fnum(cmax)}  min-after-max {fnum(cmin_after_max)}   air max {fnum(amax)}")
    if c0 is not None and c5 is not None:
        rise5.append((c5 - c0, cmax, fuel, dur))
    # thresholds crossing times
    parts = []
    for th in THRESH:
        tc = next((t for t, s in series["COOL"] if a <= t <= b and s >= th), None)
        if tc:
            m = (tc - a) / 60
            parts.append(f"{th}:{m:4.1f}")
            if c0 is not None and c0 < th - 2:
                cross_stats[th].append(m)
        else:
            parts.append(f"{th}:  --")
    print("    minutes to reach coolant °C  " + "  ".join(parts))
    # status messages during session (+ a little after)
    msgs = [(t, s) for t, s in series["STATUS"] if a - 5 <= t <= b + 30]
    for t, s in msgs:
        print(f"      {fmt_t(t)}  status: {s}")
    if TIMELINE:
        t = a
        print("      time        cool   air   room   pid  fuel  I12  eng")
        while t <= b + 600:
            print(f"      {fmt_t(t)}  {fnum(at('COOL',t))} {fnum(at('AIR',t))} {fnum(at('ROOM',t))} "
                  f"{fnum(at('PID',t),2)} {fnum(at('FUEL',t),0)} {fnum(at('I12',t))}  {at('ENG',t)}")
            t += 60
    print()

# ---- summary for threshold choice ---------------------------------------
print("Minutes from heater ON until coolant first reaches threshold (sessions starting cold):")
for th in THRESH:
    v = cross_stats[th]
    if v:
        v.sort()
        print(f"  {th:3d} °C  n={len(v):3d}  median {median(v):5.1f}  p25 {v[len(v)//4]:5.1f}  p75 {v[(3*len(v))//4]:5.1f}  max {max(v):5.1f}")
    else:
        print(f"  {th:3d} °C  n=  0")

print("\n5-min rise test (current 'heater is working' criterion): rise, session max coolant, fuel, duration")
for r, cmax, fuel, dur in sorted(rise5):
    print(f"  rise {r:5.1f}  max {cmax:5.1f}  fuel {fnum(fuel,0)}  dur {dur:6.1f} min")

# ---- coolant vs blower-air temp while blower running --------------------
print("\nBlower air temp vs coolant temp while PID output >= 0.3 and heater on (median air per 5 °C coolant bin):")
bins = {}
for t, c in series["COOL"]:
    if not any(a <= t <= b for a, b in sessions):
        continue
    p = at("PID", t)
    if p is None or p < 0.3:
        continue
    air = at("AIR", t)
    if air is None:
        continue
    bins.setdefault(int(c // 5) * 5, []).append(air)
for k in sorted(bins):
    v = bins[k]
    print(f"  coolant {k:3d}-{k+5:3d} °C  n={len(v):4d}  air median {median(v):5.1f}  min {min(v):5.1f}  max {max(v):5.1f}")

# ---- coolant while idle (heater off, blower off) for the OFF threshold ---
idle = [s for t, s in series["COOL"] if not any(a - 600 <= t <= b + 3600 for a, b in sessions)]
if idle:
    idle.sort()
    print(f"\nCoolant sensor while heater has been off >1 h: n={len(idle)} min {idle[0]:.1f} median {median(idle):.1f} "
          f"p95 {idle[int(0.95*len(idle))]:.1f} max {idle[-1]:.1f}")
