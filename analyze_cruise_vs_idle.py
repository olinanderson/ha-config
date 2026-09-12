#!/usr/bin/env python
"""Read-only: does the Sterling half-power event happen ONLY after an idle-induced 12V sag,
or does it also occur spontaneously during steady cruise with a healthy 12V bus?

Segments recent driving, then for every sustained "reduced power" episode asks whether a
12V sag occurred in the preceding lookback window.

Usage: python analyze_cruise_vs_idle.py [days]
"""
import urllib.request, urllib.parse, json, datetime as dt, sys

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 21
GRID = 20

E = {
    "CH8": "sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger",
    "IV":  "sensor.a32_pro_orion_input_voltage",
    "OS":  "sensor.a32_pro_orion_state",
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
    url = f"{HA}/api/history/period/{a.strftime('%Y-%m-%dT%H:%M:%S+00:00')}?{qs}"
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + TOKEN})
    try:
        data = json.load(urllib.request.urlopen(req, timeout=150))
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
grid = []
t = (now - dt.timedelta(days=DAYS)).timestamp()
while t <= now.timestamp():
    grid.append((t, {k: L[k](t) for k in E}))
    t += GRID


def isn(v):
    return isinstance(v, (int, float))


# Engine running. NOTE: this must NOT filter on IV or CH8 - the sag samples (IV ~12.1-12.5V) and the
# deep drops are exactly what the lookback needs to see. Filtering them out here silently makes every
# episode look like it began on a clean bus.
def engine_on(r):
    if isn(r["RPM"]) and r["RPM"] > 300:
        return True
    return isn(r["IV"]) and r["IV"] >= 13.3   # fallback when the OBD dongle is unavailable


eng = [(t, r) for t, r in grid if isn(r["CH8"]) and isn(r["IV"]) and engine_on(r)]
print(f"\nengine-on samples: {len(eng)} = {len(eng)*GRID/3600:.2f} h over {DAYS} days")
if not eng:
    print("no engine-on data in window"); sys.exit(0)

# split into drives on >10 min gaps
drives, cur, last = [], [], None
for t, r in eng:
    if last is not None and t - last > 600:
        if cur:
            drives.append(cur)
        cur = []
    cur.append((t, r))
    last = t
if cur:
    drives.append(cur)
print(f"drives with charging: {len(drives)}")

FULL, RED = 68.0, 66.0   # >=68A treated as all-three; <66A as reduced
SAG = 13.0               # 12V input below this = sag
LOOKBACK = 180           # seconds to look back for a sag

print(f"\n=== sustained REDUCED-POWER episodes (CH8 < {RED}A for >= 60s, after having been >= {FULL}A) ===")
print(f"{'start':>14} {'dur':>6} {'meanCH8':>8} {'meanIV':>7} {'minIV_before':>13} {'sag<13V in prior 3min':>22} "
      f"{'meanRPM':>8} {'meanSPD':>8} {'SOC':>4} {'orion':>11}")
n_sag, n_nosag, episodes, episodes_detail = 0, 0, [], []
for d in drives:
    seen_full = False
    i = 0
    while i < len(d):
        t, r = d[i]
        if r["CH8"] >= FULL:
            seen_full = True
            i += 1
            continue
        if not seen_full or r["CH8"] >= RED:
            i += 1
            continue
        j = i
        while j < len(d) and d[j][1]["CH8"] < RED:
            j += 1
        dur = d[j - 1][0] - d[i][0]
        if dur >= 60:
            seg = d[i:j]
            ch8 = [x[1]["CH8"] for x in seg]
            ivs = [x[1]["IV"] for x in seg]
            rpms = [x[1]["RPM"] for x in seg if isn(x[1]["RPM"])]
            spds = [x[1]["SPD"] for x in seg if isn(x[1]["SPD"])]
            t0 = d[i][0]
            prior = [x[1]["IV"] for x in d if t0 - LOOKBACK <= x[0] < t0 and isn(x[1]["IV"])]
            minprior = min(prior) if prior else None
            sagged = minprior is not None and minprior < SAG
            n_sag += sagged
            n_nosag += (not sagged)
            osv = seg[len(seg) // 2][1]["OS"]
            soc0 = seg[0][1]["SOC"]
            # A taper at high SOC in Absorption/Float is normal LFP behaviour, not a fault.
            anomalous = isn(soc0) and soc0 < 80 and str(osv) == "Bulk"
            episodes_detail.append((t0, dur, sagged, anomalous, minprior, soc0, osv))
            print(f"{dt.datetime.fromtimestamp(t0):%m-%d %H:%M:%S} {dur/60:5.1f}m "
                  f"{sum(ch8)/len(ch8):7.1f}A {sum(ivs)/len(ivs):6.2f}V "
                  f"{(f'{minprior:.2f}V' if minprior is not None else 'NA'):>13} "
                  f"{('YES - idle sag' if sagged else 'NO - clean bus'):>22} "
                  f"{(f'{sum(rpms)/len(rpms):.0f}' if rpms else 'NA'):>8} "
                  f"{(f'{sum(spds)/len(spds):.0f}' if spds else 'NA'):>8} "
                  f"{(f'{seg[0][1]['SOC']:.0f}' if isn(seg[0][1]['SOC']) else 'NA'):>4} {str(osv)[:11]:>11}")
            episodes.append((dur, sagged))
        i = j
        seen_full = False

print(f"\n=== ATTRIBUTION ===")
tot = n_sag + n_nosag
print(f"  reduced-power episodes total          : {tot}")
print(f"  preceded by a 12V sag below {SAG}V     : {n_sag}")
print(f"  with a CLEAN 12V bus (no prior sag)   : {n_nosag}")
if tot:
    lost = sum(d for d, _ in episodes)
    print(f"  total time in reduced power           : {lost/60:.1f} min")
    print(f"  approx charge lost at ~15A x 28V      : {15*28*lost/3600/1000:.2f} kWh")
    anom = [e for e in episodes_detail if e[3]]
    norm = [e for e in episodes_detail if not e[3]]
    print(f"\n  Splitting normal LFP taper from genuine anomalies:")
    print(f"    high-SOC / Absorption-Float episodes (normal taper) : {len(norm)}")
    print(f"    SOC<80% while still in BULK (should NOT be tapering): {len(anom)}")
    if anom:
        a_sag = sum(1 for e in anom if e[2])
        print(f"\n  Of the {len(anom)} genuinely anomalous episodes:")
        print(f"    preceded by a 12V sag below {SAG}V : {a_sag}")
        print(f"    began on a clean 12V bus          : {len(anom)-a_sag}")
        print(f"\n  {'when':>16} {'dur':>6} {'minIV prior':>12} {'SOC':>4}  sag?")
        for t0, dur, sagged, _, minprior, soc0, _ in anom:
            print(f"  {dt.datetime.fromtimestamp(t0):%m-%d %H:%M:%S} {dur/60:5.1f}m "
                  f"{(f'{minprior:.2f}V' if minprior is not None else 'NA'):>12} "
                  f"{(f'{soc0:.0f}' if isn(soc0) else 'NA'):>4}  {'YES' if sagged else 'no'}")
