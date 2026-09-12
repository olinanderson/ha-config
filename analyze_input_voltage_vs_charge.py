#!/usr/bin/env python
"""Read-only: does the combined alternator-charger current track the Orion's 12V input voltage?

Tests the hypothesis that the ~15A drop is an input-voltage-sag cutout (either the Orion's own
engine-detect threshold, or a Sterling backing off) rather than a thermal/SOC taper.

Usage: python analyze_input_voltage_vs_charge.py [days]
"""
import urllib.request, urllib.parse, json, datetime as dt, sys
from collections import defaultdict, Counter

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 7
GRID = 20  # seconds

E = {
    "CH8": "sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger",  # combined charger A (24V side)
    "IV":  "sensor.a32_pro_orion_input_voltage",   # Orion 12V input = alternator side
    "OV":  "sensor.a32_pro_orion_output_voltage",  # Orion 24V output (0 when off)
    "OS":  "sensor.a32_pro_orion_state",           # Off/Bulk/Absorption/Float
    "SOC": "sensor.olins_van_bms_battery",
    "TMP": "sensor.olins_van_bms_temperature",
}
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


rows = [(t, r) for t, r in grid if isn(r["CH8"]) and isn(r["IV"])]
# engine running = alternator is pushing the 12V rail above rest
on = [(t, r) for t, r in rows if r["IV"] >= 13.3]
off = [(t, r) for t, r in rows if r["IV"] < 13.0]
print(f"\nrows={len(rows)}  engine-ON={len(on)} ({len(on)*GRID/3600:.1f}h)  "
      f"engine-OFF={len(off)} ({len(off)*GRID/3600:.1f}h)")

# --- sanity: is CH8 ever meaningfully live with the engine off? ---------------
stray = [(t, r) for t, r in off if r["CH8"] > 5]
print(f"\n=== engine-OFF but CH8 > 5A : {len(stray)} rows "
      f"({100*len(stray)/max(1,len(off)):.2f}% of engine-off time) ===")
for t, r in stray[:6]:
    print(f"   {dt.datetime.fromtimestamp(t):%m-%d %H:%M}  CH8={r['CH8']:5.1f}A  IV={r['IV']:.2f}V  "
          f"OV={r['OV']}  orion={r['OS']}")

# --- THE MAIN CROSSTAB: charge current binned by 12V input voltage -----------
print("\n=== combined charger current vs Orion 12V INPUT VOLTAGE (engine running) ===")
print(f"   {'input V':>12} {'n':>6} {'medCH8':>8} {'meanCH8':>8} {'min':>6} {'max':>6}  {'orion states'}")
bins = [(13.3, 13.6), (13.6, 13.8), (13.8, 14.0), (14.0, 14.1), (14.1, 14.2),
        (14.2, 14.3), (14.3, 14.4), (14.4, 14.6), (14.6, 15.5)]
for lo, hi in bins:
    g = [r for _, r in on if lo <= r["IV"] < hi]
    if not g:
        continue
    v = sorted(x["CH8"] for x in g)
    st = Counter(x["OS"] for x in g if x["OS"])
    stxt = " ".join(f"{k[:3]}:{100*c//max(1,sum(st.values()))}%" for k, c in st.most_common(3))
    print(f"   {lo:5.2f}-{hi:5.2f} {len(v):6d} {v[len(v)//2]:7.1f}A {sum(v)/len(v):7.1f}A "
          f"{v[0]:5.1f} {v[-1]:5.1f}  {stxt}")

# --- inverse view: input voltage binned by which current plateau we're on ----
print("\n=== Orion 12V input voltage vs which current PLATEAU we're sitting on ===")
plats = [(5, 25, "~15A  (one unit)"), (25, 40, "~30A  (one Sterling)"),
         (40, 52, "~45A"), (52, 68, "~60A  (15A MISSING)"), (68, 90, "~75A  (all three)")]
print(f"   {'plateau':>20} {'n':>6} {'medIV':>7} {'meanIV':>7} {'minIV':>6} {'p5 IV':>6}  {'orion states'}")
for lo, hi, lbl in plats:
    g = [r for _, r in on if lo <= r["CH8"] < hi]
    if not g:
        continue
    v = sorted(x["IV"] for x in g)
    st = Counter(x["OS"] for x in g if x["OS"])
    tot = max(1, sum(st.values()))
    stxt = " ".join(f"{k[:3]}:{100*c//tot}%" for k, c in st.most_common(3))
    p5 = v[min(len(v)-1, int(0.05*(len(v)-1)))]
    print(f"   {lbl:>20} {len(v):6d} {v[len(v)//2]:6.2f}V {sum(v)/len(v):6.2f}V {v[0]:5.2f} {p5:5.2f}  {stxt}")

# --- step detection: what happens to input voltage AT the moment of a drop ---
print("\n=== negative steps in CH8 >= 8A (engine running), with context ===")
print(f"   {'when':>12} {'from':>7} {'to':>7} {'drop':>6} {'IVbefore':>8} {'IVafter':>8} "
      f"{'dIV':>6} {'orion b->a':>22} {'SOC':>4} {'T':>5}")
W = 6  # 6 grid rows = 2 min smoothing either side
steps = []
for i in range(W, len(on) - W):
    t, r = on[i]
    if on[i][0] - on[i - W][0] > 300 or on[i + W][0] - on[i][0] > 300:
        continue  # don't straddle a gap
    before = [on[j][1]["CH8"] for j in range(i - W, i)]
    after = [on[j][1]["CH8"] for j in range(i + 1, i + 1 + W)]
    b, a = sum(before) / len(before), sum(after) / len(after)
    if b - a >= 8:
        ivb = sum(on[j][1]["IV"] for j in range(i - W, i)) / W
        iva = sum(on[j][1]["IV"] for j in range(i + 1, i + 1 + W)) / W
        steps.append((t, b, a, ivb, iva, on[i - 1][1]["OS"], on[i + 1][1]["OS"],
                      r["SOC"], r["TMP"]))
# de-dupe adjacent detections
ded = []
for s in steps:
    if not ded or s[0] - ded[-1][0] > 120:
        ded.append(s)
for t, b, a, ivb, iva, osb, osa, soc, tmp in ded[:40]:
    print(f"   {dt.datetime.fromtimestamp(t):%m-%d %H:%M} {b:6.1f}A {a:6.1f}A {b-a:5.1f}A "
          f"{ivb:7.2f}V {iva:7.2f}V {iva-ivb:+5.2f} {str(osb)[:9]+'->'+str(osa)[:9]:>22} "
          f"{(f'{soc:.0f}' if isn(soc) else 'NA'):>4} {(f'{tmp:.0f}C' if isn(tmp) else 'NA'):>5}")
print(f"   ({len(ded)} distinct drops total)")

if ded:
    orion_moved = sum(1 for s in ded if s[5] != s[6])
    iv_sagged = sum(1 for s in ded if s[4] < s[3] - 0.05)
    iv_rose = sum(1 for s in ded if s[4] > s[3] + 0.05)
    near15 = [s for s in ded if 11 <= (s[1] - s[2]) <= 19]
    print(f"\n   ATTRIBUTION over {len(ded)} drops:")
    print(f"     Orion state CHANGED at the drop : {orion_moved}  -> the Orion dropped out")
    print(f"     Orion state UNCHANGED           : {len(ded)-orion_moved}  -> a Sterling dropped")
    print(f"     drops in the 11-19A band        : {len(near15)}")
    print(f"     12V input SAGGED across drop    : {iv_sagged}")
    print(f"     12V input ROSE across drop      : {iv_rose}  (expected if a load went away)")
    if near15:
        om = sum(1 for s in near15 if s[5] != s[6])
        print(f"     of the ~15A drops: {om} had an Orion state change, {len(near15)-om} did not")
