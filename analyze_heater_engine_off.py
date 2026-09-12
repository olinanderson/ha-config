#!/usr/bin/env python
"""Read-only: validate the new hydronic heater monitor against history, using
only the clean case the user asked for -- heater relay ON while the engine is OFF.

Replays the firmware's monitor (30 s ticks, trailing-5-min rise, OK temp, 6 min
timeouts, 3 restarts) over every relay-on run and reports:
  * when it would have declared "lit" / "running", and via which rule
  * every point where it would have cycled the relay, with the engine state and
    whether the coolant went on to warm anyway (= the restart would have been
    spurious) or stayed cold (= justified)
  * the coolant band while a lit burner runs with the engine off (for the OK temp
    and blower-off threshold), with and without the blower running
  * the trailing-5-min rise distribution, engine-off only, lit vs never-lit runs
  * cool-down after relay-off with the engine off (residual-heat blow-out time)
  * duct air temp per coolant bin, engine off, blower running

Usage: python analyze_heater_engine_off.py [days]
Raw history is cached in C:/WINDOWS/TEMP/heater_series_cache.json for re-runs.
"""
import urllib.request, urllib.parse, json, datetime as dt, sys, bisect, os, time
from statistics import median

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 60
CACHE = "C:/WINDOWS/TEMP/heater_series_cache.json"
LOCAL = dt.datetime.now().astimezone().tzinfo

# Firmware constants (must match esphome/a32-pro-esp32-s3.yaml)
TICK = 30            # s
HIST = 10            # samples -> 5 min window
OK_TEMP = 45.0       # number: Hydronic Heater OK Temp
RISE_MIN = 8.0       # substitution heater_rise_min_c
START_TIMEOUT = 360  # s
STALL_TIMEOUT = 360  # s
MAX_RESTARTS = 3
BLOWER_START = 55.0  # number: Hydronic Blower Start Temp
BLOWER_HYST = 10.0

E = {
    "HEATER":  "switch.a32_pro_switch24_hydronic_heater",
    "ENG":     "binary_sensor.engine_is_running",
    "ECT":     "sensor.192_168_10_90_05_enginecoolanttemp",
    "COOL":    "sensor.a32_pro_s5140_channel_34_temperature_blower_coolant",
    "AIR":     "sensor.a32_pro_s5140_channel_35_temperature_blower_air",
    "PID":     "sensor.a32_pro_coolant_blower_heating_pid_climate_result",
    "CLIMATE": "climate.a32_pro_van_hydronic_heating_pid",
    "HOTWATER":"input_boolean.hot_water_mode",
    "FUEL":    "sensor.stable_fuel_level",
    "STATUS":  "sensor.a32_pro_hydronic_heater_status",
}
NUMERIC = {"COOL", "AIR", "PID", "FUEL", "ECT"}
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


def load_series():
    if os.path.exists(CACHE) and time.time() - os.path.getmtime(CACHE) < 3 * 3600:
        with open(CACHE) as f:
            d = json.load(f)
        if d.get("days") == DAYS:
            print(f"(using cached history from {dt.datetime.fromtimestamp(os.path.getmtime(CACHE)):%H:%M})")
            return {k: [tuple(x) for x in v] for k, v in d["series"].items()}
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
    with open(CACHE, "w") as f:
        json.dump({"days": DAYS, "series": series}, f)
    return series


series = load_series()
times = {k: [t for t, _ in v] for k, v in series.items()}


def at(k, t):
    i = bisect.bisect_right(times[k], t) - 1
    return series[k][i][1] if i >= 0 else None


def fmt_t(t):
    return dt.datetime.fromtimestamp(t, LOCAL).strftime("%m-%d %H:%M")


def f1(v):
    return "  -- " if v is None else f"{v:5.1f}"


# ---- relay-on runs (merge gaps < 12 s: only the firmware's own 10 s off/on) --
runs, cur = [], None
for t, s in series["HEATER"]:
    if s == "on" and cur is None:
        cur = t
    elif s != "on" and cur is not None:
        runs.append((cur, t)); cur = None
now_ts = dt.datetime.now(dt.timezone.utc).timestamp()
if cur is not None:
    runs.append((cur, now_ts))
merged = []
for a, b in runs:
    if merged and a - merged[-1][1] < 12:
        merged[-1] = (merged[-1][0], b)
    else:
        merged.append((a, b))
runs = merged

# engine "last on" lookup for residual-heat exclusion
eng_on_times = [t for t, s in series["ENG"] if s == "on"]
eng_off_times = [t for t, s in series["ENG"] if s == "off"]


def engine_on(t):
    return at("ENG", t) == "on"


def mins_since_engine(t):
    """Minutes since the engine was last running (None if never / unknown)."""
    if engine_on(t):
        return 0.0
    i = bisect.bisect_right(eng_off_times, t) - 1
    if i < 0:
        return None
    return (t - eng_off_times[i]) / 60


print(f"\n{len(runs)} relay-on runs in {DAYS} days. Replaying the new monitor "
      f"(tick {TICK}s, window {HIST*TICK}s, OK {OK_TEMP:.0f} C, rise {RISE_MIN:.0f} C, "
      f"timeouts {START_TIMEOUT}s/{STALL_TIMEOUT}s, {MAX_RESTARTS} restarts)\n")

band_all, band_blower, band_noblower = [], [], []   # coolant while state 3, engine off >= 60 min, lit burner
rise_lit, rise_unlit = [], []                       # trailing-5-min rise samples, engine off
restart_events = []
for a, b in runs:
    dur = (b - a) / 60
    ticks = list(range(int(a), int(b), TICK))
    eng_frac = sum(1 for t in ticks if engine_on(t)) / max(1, len(ticks))
    c0 = at("COOL", a)
    cmax = max([s for t, s in series["COOL"] if a <= t <= b] or [c0 or 0])
    lit_run = cmax >= OK_TEMP + 10   # got properly hot at some point (engine or burner)
    fuel = at("FUEL", a)
    clim = at("CLIMATE", a + 5)
    hw = at("HOTWATER", a + 5)
    mse = mins_since_engine(a)
    print(f"=== {fmt_t(a)}  {dur:6.1f} min  fuel {f1(fuel)}%  engine-on {eng_frac*100:3.0f}% of run  "
          f"engine off for {'--' if mse is None else f'{mse:.0f}'} min at start  climate={clim} hotwater={hw}  "
          f"coolant {f1(c0)} -> max {f1(cmax)}")

    # ---- replay ----
    state, attempts = 1, 0
    attempt_start = last_healthy = a
    hist = [c0] if c0 is not None else []
    lit_reported = False
    for t in ticks[1:]:
        c = at("COOL", t)
        if c is None:
            continue
        hist.append(c); hist = hist[-HIST:]
        rise = c - hist[0]
        eng = engine_on(t)
        if not eng:
            (rise_lit if lit_run else rise_unlit).append(rise)
        if state == 4:
            continue
        if c >= OK_TEMP:
            if state != 3 and not lit_reported:
                print(f"    {fmt_t(t)}  RUNNING via OK temp: coolant {c:.1f} C, {(t-a)/60:.1f} min after relay-on, engine {'ON' if eng else 'off'}")
                lit_reported = True
            state, attempts, last_healthy = 3, 0, t
            m = mins_since_engine(t)
            if m is not None and m >= 60:
                band_all.append(c)
                p = at("PID", t) or 0
                (band_blower if p >= 20 else band_noblower).append(c)
            continue
        if rise >= RISE_MIN:
            if state != 3 and not lit_reported:
                print(f"    {fmt_t(t)}  LIT via rise: {hist[0]:.1f} -> {c:.1f} C (+{rise:.1f} in 5 min), {(t-a)/60:.1f} min after relay-on, engine {'ON' if eng else 'off'}")
                lit_reported = True
            state, last_healthy = 3, t
            continue
        waited = t - (last_healthy if state == 3 else attempt_start)
        limit = STALL_TIMEOUT if state == 3 else START_TIMEOUT
        if waited < limit:
            continue
        # would act now: what did the coolant actually do in the next 10 min?
        later = [s for tt, s in series["COOL"] if t < tt <= min(b, t + 600)]
        recovered = bool(later) and max(later) >= OK_TEMP
        if attempts < MAX_RESTARTS:
            attempts += 1
            state = 2
            attempt_start = t
            hist = [c]
            lit_reported = False
            verdict = "SPURIOUS (coolant reached OK temp within 10 min anyway)" if recovered else "justified (coolant stayed cold)"
            restart_events.append((t, eng, recovered))
            print(f"    {fmt_t(t)}  WOULD RESTART #{attempts}: coolant {c:.1f} C, 5-min rise {rise:+.1f}, engine {'ON' if eng else 'off'} -> {verdict}")
        else:
            state = 4
            f = at("FUEL", t)
            print(f"    {fmt_t(t)}  WOULD GIVE UP after {attempts} restarts (fuel {f1(f)}%): "
                  f"{'LOCKOUT' if (f is not None and f < 25) else 'FAILED'}, relay off")
    # cool-down after relay off, engine off
    if b < now_ts - 600 and not engine_on(b) and (at("COOL", b) or 0) >= BLOWER_START:
        after = [(tt, s) for tt, s in series["COOL"] if b <= tt <= b + 4 * 3600]
        t45 = next((tt for tt, s in after if s <= BLOWER_START - BLOWER_HYST), None)
        eng_after = any(engine_on(tt) for tt in range(int(b), int(t45 or b + 4 * 3600), 300))
        if t45 and not eng_after:
            print(f"    relay OFF at {fmt_t(b)} with coolant {at('COOL', b):.1f} C -> below {BLOWER_START-BLOWER_HYST:.0f} C after {(t45-b)/60:.0f} min (engine stayed off)")
    print()

# ---- summaries -------------------------------------------------------------
print("Would-restart events:", len(restart_events),
      f"({sum(1 for _, e, _ in restart_events if not e)} with engine off, "
      f"{sum(1 for _, _, r in restart_events if r)} spurious)")


def dist(name, v):
    if not v:
        print(f"  {name}: n=0"); return
    v = sorted(v)
    q = lambda p: v[min(len(v) - 1, int(p * len(v)))]
    print(f"  {name}: n={len(v):5d}  min {v[0]:5.1f}  p1 {q(0.01):5.1f}  p5 {q(0.05):5.1f}  median {median(v):5.1f}  p95 {q(0.95):5.1f}  max {v[-1]:5.1f}")


print("\nCoolant while the monitor says RUNNING, engine off for >= 60 min (lit burner, no engine residual):")
dist("all           ", band_all)
dist("blower >= 20% ", band_blower)
dist("blower off/low", band_noblower)

print("\nTrailing-5-min coolant rise at monitor ticks, engine off:")
dist("runs that got hot  ", rise_lit)
dist("runs that never lit", rise_unlit)

print("\nDuct air temp per coolant bin, engine off, blower >= 20%, heater relay on:")
bins = {}
for t, c in series["COOL"]:
    if not any(a <= t <= b for a, b in runs) or engine_on(t):
        continue
    p = at("PID", t)
    if p is None or p < 20:
        continue
    air = at("AIR", t)
    if air is None:
        continue
    bins.setdefault(int(c // 5) * 5, []).append(air)
for k in sorted(bins):
    v = bins[k]
    print(f"  coolant {k:3d}-{k+5:3d} C  n={len(v):5d}  air median {median(v):5.1f}  min {min(v):5.1f}  max {max(v):5.1f}")
