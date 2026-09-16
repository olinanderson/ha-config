#!/usr/bin/env python
"""Read-only: pick the hydronic blower gate threshold from HA history.

The a32_pro holds the Auto (PID) blower off until the HX#1 coolant sensor
reaches number.a32_pro_hydronic_blower_start_temp, then runs it until the
coolant falls 10 °C below that. For each candidate start temp this reports:
  A. duct air temperature vs coolant while the blower is running
  B. minutes from a cold heater start (relay ON, engine off) to each coolant
     temp, and the duct air at that moment on pre-gate starts
  C. coolant troughs during burner pauses once warmed up: the OFF threshold
     (start - 10) has to stay below them or the fan cycles with the burner
  D. after the relay goes OFF (engine off), minutes until the coolant falls
     to each OFF threshold
  E. what the live gate (binary_sensor ..._coolant_ready) did since 2026-09-12
  F. the coolant dip right after the live gate opens (must stay inside the
     hysteresis or the gate shuts again at once)

Usage: python analyze_blower_gate.py [days]   (cwd = repo root; 60 days ~5 min)
"""
import urllib.request, urllib.parse, json, datetime as dt, sys, bisect
from statistics import median

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 60
LOCAL = dt.datetime.now().astimezone().tzinfo
STEP = 30  # grid seconds
HYST = 10.0
CANDIDATES = [50, 55, 60, 65, 70]

E = {
    "COOL": "sensor.a32_pro_s5140_channel_34_temperature_blower_coolant",
    "AIR": "sensor.a32_pro_s5140_channel_35_temperature_blower_air",
    "HEATER": "switch.a32_pro_switch24_hydronic_heater",
    "CLIMATE": "climate.a32_pro_van_hydronic_heating_pid",
    "BLOWER": "light.a32_pro_a32_pro_dac_0",
    "OUT": "sensor.a32_pro_coolant_blower_heating_pid_heat_output",
    "GATE": "binary_sensor.a32_pro_hydronic_blower_coolant_ready",
    "MODE": "switch.a32_pro_coolant_blower_mode_auto_manual",
    "ENG": "binary_sensor.engine_is_running",
}
NUMERIC = {"COOL", "AIR", "OUT"}
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


now = dt.datetime.now(dt.timezone.utc)
raw = {k: [] for k in E}
for d in range(DAYS, 0, -1):
    a, b = now - dt.timedelta(days=d), now - dt.timedelta(days=d - 1)
    try:
        data = fetch(a, b)
    except Exception as ex:
        print(f"  fetch {a.date()} failed: {ex}", file=sys.stderr)
        continue
    for sub in data:
        k = inv.get(sub[0].get("entity_id")) if sub else None
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
                    s = None
            raw[k].append((t, s))
for k in raw:
    raw[k].sort(key=lambda x: x[0])

t0 = min(v[0][0] for v in raw.values() if v)
t1 = now.timestamp()
grid = list(range(int(t0) - int(t0) % STEP + STEP, int(t1), STEP))


def resample(k):
    ts = [t for t, _ in raw[k]]
    out = []
    for g in grid:
        i = bisect.bisect_right(ts, g) - 1
        out.append(raw[k][i][1] if i >= 0 else None)
    return out


S = {k: resample(k) for k in E}
N = len(grid)
cool, air, out = S["COOL"], S["AIR"], S["OUT"]
heater = [s == "on" for s in S["HEATER"]]
blower = [s == "on" for s in S["BLOWER"]]
eng = [s == "on" for s in S["ENG"]]
auto = [s == "on" for s in S["MODE"]]


def fmt_t(t):
    return dt.datetime.fromtimestamp(t, LOCAL).strftime("%m-%d %H:%M")


def pct(v, p):
    v = sorted(v)
    return v[min(len(v) - 1, int(p * len(v)))]


print(f"{DAYS} days, grid {STEP}s, samples: " + ", ".join(f"{k}={len(v)}" for k, v in raw.items()))

# ---- A. duct air vs coolant while the blower runs -------------------------
run_len = 0
bins = {}
for i in range(N):
    run_len = run_len + 1 if blower[i] else 0
    if run_len < 4 or cool[i] is None or air[i] is None:  # blower on >= 2 min
        continue
    back = i - 4
    steady = cool[back] is not None and abs(cool[i] - cool[back]) <= 1.5
    lvl = out[i] if auto[i] and out[i] is not None else None
    fan = "full" if lvl is not None and lvl >= 95 else ("part" if lvl is not None and lvl >= 20 else "?")
    b = bins.setdefault(int(cool[i] // 5) * 5, {"all": [], "steady": [], "full": [], "part": []})
    b["all"].append(air[i])
    if steady:
        b["steady"].append(air[i])
        if fan in ("full", "part"):
            b[fan].append(air[i])
print("\nA. Duct air (°C) vs coolant while the blower has run >= 2 min "
      "(steady = coolant moved <= 1.5 °C over 2 min; full/part = PID heat output >=95 / 20-95 % on Auto)")
print("   coolant    min   air med  p10  p90 | steady med | full med (min) | part med (min)")
for c in sorted(bins):
    b = bins[c]
    if len(b["all"]) < 10:
        continue
    def m(v):
        return f"{median(v):5.1f}" if len(v) >= 6 else "    -"
    print(f"   {c:3d}-{c+5:<3d} {len(b['all'])*STEP/60:6.0f}   {median(b['all']):5.1f} {pct(b['all'],.1):5.1f} {pct(b['all'],.9):5.1f} |"
          f"   {m(b['steady'])}    |  {m(b['full'])} ({len(b['full'])*STEP//60:4d}) |  {m(b['part'])} ({len(b['part'])*STEP//60:4d})")

# ---- heater sessions --------------------------------------------------------
sessions = []
i = 0
while i < N:
    if heater[i]:
        j = i
        while j < N and heater[j]:
            j += 1
        if sessions and i - sessions[-1][1] <= 2:  # merge the 10 s restart blips
            sessions[-1] = (sessions[-1][0], j)
        else:
            sessions.append((i, j))
        i = j
    else:
        i += 1
print(f"\n{len(sessions)} heater relay sessions")

# ---- B. warm-up -------------------------------------------------------------
TH = [45, 50, 55, 60, 65, 70]
warm = {th: [] for th in TH}
air_at = {th: [] for th in TH}
cold_starts = 0
for a, b in sessions:
    if cool[a] is None or cool[a] >= 40 or any(eng[a:b]):
        continue
    cold_starts += 1
    for th in TH:
        k = next((x for x in range(a, b) if cool[x] is not None and cool[x] >= th), None)
        if k is None:
            continue
        warm[th].append((k - a) * STEP / 60)
        if blower[k] and air[k] is not None and grid[k] < dt.datetime(2026, 9, 12, 16, 28, tzinfo=dt.timezone.utc).timestamp():
            air_at[th].append(air[k])
print(f"\nB. Cold starts (coolant < 40 °C, engine off): {cold_starts}. Minutes from relay ON to coolant >= X,"
      " and duct air at that moment on pre-gate starts with the blower already running:")
for th in TH:
    v = warm[th]
    if not v:
        print(f"   {th} °C  never reached")
        continue
    aa = air_at[th]
    at_txt = f"air med {median(aa):5.1f} (n={len(aa)})" if aa else "air -"
    print(f"   {th} °C  n={len(v):3d}  median {median(v):5.1f}  p75 {pct(v,.75):5.1f}  max {max(v):5.1f}   {at_txt}")

# ---- C. troughs once warmed up ---------------------------------------------
print("\nC. Warmed-up running (relay on, engine off, after coolant first reached 72 °C):")
troughs = []  # (value, blower on at trough, time)
time_below = {c - HYST: 0 for c in CANDIDATES}
run_steps = 0
for a, b in sessions:
    k = next((x for x in range(a, b) if cool[x] is not None and cool[x] >= 72), None)
    if k is None:
        continue
    lo = None
    rising_from = None
    for x in range(k, b):
        c = cool[x]
        if c is None or eng[x]:
            continue
        run_steps += 1
        for off in time_below:
            if c <= off:
                time_below[off] += 1
        # trough = lowest point between drops of >= 3 °C and the next rise of >= 3 °C
        if lo is None or c < lo[0]:
            lo = (c, blower[x], grid[x])
        elif c >= lo[0] + 3 and lo[0] <= 72:
            troughs.append(lo)
            lo = (c, blower[x], grid[x])
        elif c >= lo[0] + 3:
            lo = (c, blower[x], grid[x])
print(f"   {run_steps*STEP/3600:.1f} h of warmed-up running, {len(troughs)} burner-pause troughs")
if troughs:
    tv = [t[0] for t in troughs]
    tb = [t[0] for t in troughs if t[1]]
    print(f"   trough coolant: min {min(tv):.1f}  p5 {pct(tv,.05):.1f}  median {median(tv):.1f}"
          + (f"   | blower on at trough: n={len(tb)} min {min(tb):.1f} p5 {pct(tb,.05):.1f} median {median(tb):.1f}" if tb else ""))
    for cand in CANDIDATES:
        off = cand - HYST
        n = sum(1 for v in tv if v <= off)
        print(f"   start {cand} / off {off:.0f}: {n:3d} troughs would stop the fan; "
              f"{time_below[off]*STEP/60:6.1f} min at or below {off:.0f} °C while running")
    low = sorted(troughs)[:8]
    print("   lowest troughs: " + ", ".join(f"{v:.1f}{'(fan)' if f else ''} {fmt_t(t)}" for v, f, t in low))

# ---- D. cool-down after the relay goes off --------------------------------
print("\nD. After the relay goes OFF (coolant >= 65 °C at off, engine off for the next hour):")
cd = {c - HYST: [] for c in CANDIDATES}
n_off = 0
for a, b in sessions:
    if b >= N or cool[b] is None or cool[b] < 65 or any(eng[b:b + 120]):
        continue
    n_off += 1
    for off in cd:
        k = next((x for x in range(b, min(N, b + 240)) if cool[x] is not None and cool[x] <= off), None)
        if k is not None:
            cd[off].append((k - b) * STEP / 60)
print(f"   {n_off} stops")
for off, v in cd.items():
    if v:
        print(f"   down to {off:.0f} °C: n={len(v):3d}  median {median(v):5.1f} min  p75 {pct(v,.75):5.1f}")

# ---- E. the live gate --------------------------------------------------------
print("\nE. Live gate transitions (binary_sensor ..._coolant_ready):")
prev = None
for t, s in raw["GATE"]:
    if s in ("on", "off") and s != prev:
        i = min(N - 1, max(0, bisect.bisect_left(grid, t)))
        print(f"   {fmt_t(t)}  {s:3s}  coolant {cool[i] if cool[i] is not None else float('nan'):5.1f}  "
              f"relay {'on ' if heater[i] else 'off'}  engine {'on' if eng[i] else 'off'}  climate {S['CLIMATE'][i]}")
    prev = s if s in ("on", "off") else prev

# ---- F. right after the live gate opens -----------------------------------
# The blower starting pulls heat out of a loop that is still warming up; the
# dip must stay inside the hysteresis or the gate closes again straight away.
print("\nF. After the live gate opens with the relay on and the engine off (coolant, then min over the next 10 min):")
prev = None
for t, s in raw["GATE"]:
    if s == "on" and prev != "on":
        i = min(N - 1, max(0, bisect.bisect_left(grid, t)))
        if heater[i] and not eng[i] and cool[i] is not None:
            win = [c for c in cool[i:i + 20] if c is not None]
            a2 = air[i + 4] if i + 4 < N else None
            a5 = air[i + 10] if i + 10 < N else None
            print(f"   {fmt_t(t)}  open at {cool[i]:5.1f}  min next 10 min {min(win):5.1f} (dip {cool[i] - min(win):4.1f})"
                  f"  air +2 min {a2 if a2 is not None else float('nan'):5.1f}  +5 min {a5 if a5 is not None else float('nan'):5.1f}")
    if s in ("on", "off"):
        prev = s
