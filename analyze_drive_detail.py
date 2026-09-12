#!/usr/bin/env python
"""Read-only: full-resolution trace of a single drive, to see the ~15A drop happen.

Usage: python analyze_drive_detail.py 2026-08-10T19:00 2026-08-11T00:00
"""
import urllib.request, urllib.parse, json, datetime as dt, sys
from collections import Counter

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
E = {
    "CH8": "sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger",
    "IV":  "sensor.a32_pro_orion_input_voltage",
    "OV":  "sensor.a32_pro_orion_output_voltage",
    "OS":  "sensor.a32_pro_orion_state",
    "BC":  "sensor.olins_van_bms_current",
    "BV":  "sensor.olins_van_bms_voltage",
    "SOC": "sensor.olins_van_bms_battery",
    "TMP": "sensor.olins_van_bms_temperature",
    "PV":  "sensor.total_mppt_pv_power",
}
inv = {v: k for k, v in E.items()}
a = dt.datetime.fromisoformat(sys.argv[1]).replace(tzinfo=dt.timezone.utc)
b = dt.datetime.fromisoformat(sys.argv[2]).replace(tzinfo=dt.timezone.utc)

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

print("\n=== Orion state transitions in window ===")
for t, s in series["OS"]:
    print(f"   {dt.datetime.fromtimestamp(t):%m-%d %H:%M:%S}  -> {s}")


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
GRID = 60
print(f"\n=== 1-minute trace ===")
print(f"   {'time':>8} {'CH8':>7} {'IV':>7} {'OV':>7} {'orion':>10} {'BMS_A':>7} {'BV':>6} {'SOC':>4} {'T':>4} {'PV':>6}")
t = a.timestamp()
prev = None
while t <= b.timestamp():
    r = {k: L[k](t) for k in E}
    ch8 = r["CH8"]
    if isinstance(ch8, float):
        mark = ""
        if isinstance(prev, float):
            d = ch8 - prev
            if d <= -6:
                mark = f"   <<<< DROP {d:.1f}A"
            elif d >= 6:
                mark = f"   >>>> RISE +{d:.1f}A"
        def f(v, w, p=1, u=""):
            return f"{v:{w}.{p}f}{u}" if isinstance(v, float) else f"{'--':>{w}}"
        print(f"   {dt.datetime.fromtimestamp(t):%H:%M:%S} {f(r['CH8'],6)}A {f(r['IV'],6,2)}V "
              f"{f(r['OV'],6,2)}V {str(r['OS'])[:10]:>10} {f(r['BC'],6)}A {f(r['BV'],5,2)} "
              f"{f(r['SOC'],4,0)} {f(r['TMP'],4,0)} {f(r['PV'],5,0)}W{mark}")
        prev = ch8
    t += GRID
