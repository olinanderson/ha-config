#!/usr/bin/env python
"""Read-only: 10-second trace of charger current vs Orion 12V input vs engine RPM/speed.

Tests whether the ~15A charge-current drops are caused by the 12V alternator feed sagging
(supply-limited / RPM-driven) rather than by a charger faulting.

Usage: python analyze_sag_highres.py 2026-08-11T02:50 2026-08-11T03:15 [grid_seconds]
"""
import urllib.request, urllib.parse, json, datetime as dt, sys

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
E = {
    "CH8": "sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger",
    "IV":  "sensor.a32_pro_orion_input_voltage",
    "OV":  "sensor.a32_pro_orion_output_voltage",
    "OS":  "sensor.a32_pro_orion_state",
    "RPM": "sensor.192_168_10_90_0c_enginerpm",
    "SPD": "sensor.192_168_10_90_0d_vehiclespeed",
    "LOAD": "sensor.192_168_10_90_04_calcengineload",
    "CMV": "sensor.192_168_10_90_42_controlmodulevolt",
    "BC":  "sensor.olins_van_bms_current",
    "BV":  "sensor.olins_van_bms_voltage",
}
inv = {v: k for k, v in E.items()}
a = dt.datetime.fromisoformat(sys.argv[1]).replace(tzinfo=dt.timezone.utc)
b = dt.datetime.fromisoformat(sys.argv[2]).replace(tzinfo=dt.timezone.utc)
GRID = int(sys.argv[3]) if len(sys.argv) > 3 else 10

qs = urllib.parse.urlencode({"filter_entity_id": ",".join(E.values()),
    "end_time": b.strftime("%Y-%m-%dT%H:%M:%S+00:00"), "minimal_response": "", "no_attributes": ""})
url = f"{HA}/api/history/period/{a.strftime('%Y-%m-%dT%H:%M:%S+00:00')}?{qs}"
req = urllib.request.Request(url, headers={"Authorization": "Bearer " + TOKEN})
data = json.load(urllib.request.urlopen(req, timeout=120))

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
for k in series:
    series[k].sort()
print("points: " + ", ".join(f"{k}={len(v)}" for k, v in series.items()))


def num(v):
    try:
        return float(v)
    except Exception:
        return None


def stepper(pairs, numeric=True):
    d = [(t, (num(s) if numeric else s)) for t, s in pairs]
    def look(t, ptr=[0]):
        if not d:
            return None
        i = ptr[0]
        while i + 1 < len(d) and d[i + 1][0] <= t:
            i += 1
        ptr[0] = i
        return d[i][1] if d[i][0] <= t else None
    return look


L = {k: stepper(series[k], k != "OS") for k in E}


def f(v, w, p=1):
    return f"{v:{w}.{p}f}" if isinstance(v, float) else f"{'--':>{w}}"


print(f"\n{'time':>8} {'CH8':>7} {'IVin':>7} {'OVout':>7} {'orion':>6} "
      f"{'RPM':>6} {'kph':>5} {'load%':>6} {'ECUv':>6} {'BMS_A':>7}   12V-input bar (11.5-14.8V)")
rows = []
t = a.timestamp()
while t <= b.timestamp():
    r = {k: L[k](t) for k in E}
    rows.append((t, r))
    t += GRID

for t, r in rows:
    iv = r["IV"]
    bar = ""
    if isinstance(iv, float):
        n = max(0, min(46, int((iv - 11.5) / (14.8 - 11.5) * 46)))
        bar = "#" * n
        if iv < 12.8:
            bar += "  <-- SAG"
    print(f"{dt.datetime.fromtimestamp(t):%H:%M:%S} {f(r['CH8'],6)}A {f(r['IV'],6,2)}V "
          f"{f(r['OV'],6,2)}V {str(r['OS'])[:6]:>6} {f(r['RPM'],6,0)} {f(r['SPD'],5,0)} "
          f"{f(r['LOAD'],6,0)} {f(r['CMV'],6,2)} {f(r['BC'],6)}A   {bar}")

# correlation between CH8 and IV over the window
pairs = [(r["CH8"], r["IV"]) for _, r in rows
         if isinstance(r["CH8"], float) and isinstance(r["IV"], float) and r["CH8"] > 5]
if len(pairs) > 10:
    n = len(pairs)
    mx = sum(p[0] for p in pairs) / n
    my = sum(p[1] for p in pairs) / n
    cov = sum((p[0] - mx) * (p[1] - my) for p in pairs)
    vx = sum((p[0] - mx) ** 2 for p in pairs) ** 0.5
    vy = sum((p[1] - my) ** 2 for p in pairs) ** 0.5
    print(f"\ncorrelation(CH8 current, Orion 12V input) over {n} charging samples = "
          f"{cov / (vx * vy):+.3f}")
    print(f"  mean CH8={mx:.1f}A  mean IV={my:.2f}V")
    lo = [p[0] for p in pairs if p[1] < 13.0]
    hi = [p[0] for p in pairs if p[1] >= 13.6]
    if lo:
        print(f"  when 12V input < 13.0V : mean charge current = {sum(lo)/len(lo):5.1f}A  (n={len(lo)})")
    if hi:
        print(f"  when 12V input >=13.6V : mean charge current = {sum(hi)/len(hi):5.1f}A  (n={len(hi)})")
