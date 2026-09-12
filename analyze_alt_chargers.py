#!/usr/bin/env python
"""Pull ~3 weeks of HA recorder history and analyze alternator-charging behaviour
while driving. Read-only. Answers: does the combined alternator-charger power sit
at "half" a lot, and does that track a dropped charger vs normal LFP taper?"""
import urllib.request, urllib.parse, json, datetime as dt, sys

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 21
GRID = 30  # seconds

E = {
    "P":    "sensor.alternator_charger_power_24v",       # combined charger power (W)
    "OS":   "sensor.a32_pro_orion_state",                # Off/Bulk/Absorption/Float
    "OV":   "sensor.a32_pro_orion_input_voltage",        # Orion 12V-side input (V)
    "SPD":  "sensor.192_168_10_90_0d_vehiclespeed",      # OBD speed (km/h) -> engine-on gate
    "SOC":  "sensor.olins_van_bms_battery",              # %
    "TEMP": "sensor.olins_van_bms_temperature",          # C
    "BC":   "sensor.olins_van_bms_current",              # A (+charge/-discharge)
    "BV":   "sensor.olins_van_bms_voltage",              # V
}
ids = list(E.values())
inv = {v: k for k, v in E.items()}

def parse_ts(s):
    if not s: return None
    s = s.replace("Z", "+00:00")
    try: return dt.datetime.fromisoformat(s).timestamp()
    except Exception: return None

def fetch(start, end):
    qs = urllib.parse.urlencode({
        "filter_entity_id": ",".join(ids),
        "end_time": end.strftime("%Y-%m-%dT%H:%M:%S+00:00"),
        "minimal_response": "", "no_attributes": "",
    })
    url = f"{HA}/api/history/period/{start.strftime('%Y-%m-%dT%H:%M:%S+00:00')}?{qs}"
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + TOKEN})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.load(r)

now = dt.datetime.now(dt.timezone.utc)
start0 = now - dt.timedelta(days=DAYS)
series = {k: [] for k in E}
day = start0
while day < now:
    nd = min(day + dt.timedelta(days=1), now)
    try:
        data = fetch(day, nd)
    except Exception as ex:
        print(f"  fetch {day.date()} failed: {ex}", file=sys.stderr); day = nd; continue
    n = 0
    for sub in data:
        if not sub: continue
        eid = sub[0].get("entity_id")
        k = inv.get(eid)
        if not k: continue
        for it in sub:
            ts = parse_ts(it.get("last_changed") or it.get("last_updated"))
            if ts is None: continue
            series[k].append((ts, it.get("state")))
            n += 1
    print(f"  {day.date()}  {n:>6} points", file=sys.stderr)
    day = nd

for k in series:
    series[k].sort(key=lambda x: x[0])
print(f"\nfetched {DAYS} days; points: " + ", ".join(f"{k}={len(series[k])}" for k in E), file=sys.stderr)

def numify(v):
    try: return float(v)
    except Exception: return None

# ---- step-resample onto a common grid --------------------------------------
def stepper(pairs, numeric=True):
    data = [(t, (numify(s) if numeric else s)) for t, s in pairs]
    def look(t, ptr=[0]):
        i = ptr[0]
        while i + 1 < len(data) and data[i + 1][0] <= t:
            i += 1
        ptr[0] = i
        if not data: return None
        if data[i][0] > t: return None
        return data[i][1]
    return look

look = {
    "P": stepper(series["P"]), "OV": stepper(series["OV"]),
    "SOC": stepper(series["SOC"]), "TEMP": stepper(series["TEMP"]),
    "BC": stepper(series["BC"]), "BV": stepper(series["BV"]),
    "SPD": stepper(series["SPD"]), "OS": stepper(series["OS"], numeric=False),
}

def is_num(v): return isinstance(v, (int, float))

grid = []
t = start0.timestamp()
end = now.timestamp()
while t <= end:
    row = {k: look[k](t) for k in look}
    grid.append((t, row))
    t += GRID

# engine-on = OBD speed is a valid number (dongle powered => ignition on)
eng = [(t, r) for t, r in grid if is_num(r["SPD"]) and r["P"] is not None]
mov = [(t, r) for t, r in eng if r["SPD"] > 3]
print(f"grid rows={len(grid)}  engine-on(30s)={len(eng)} ({len(eng)*GRID/3600:.1f} h)  moving={len(mov)} ({len(mov)*GRID/3600:.1f} h)")

def pct(vals, ps):
    vals = sorted(v for v in vals if v is not None)
    if not vals: return {p: None for p in ps}
    out = {}
    for p in ps:
        i = min(len(vals) - 1, int(round(p / 100 * (len(vals) - 1))))
        out[p] = vals[i]
    return out

def hist(vals, lo, hi, step):
    edges = []
    x = lo
    while x < hi:
        edges.append((x, x + step)); x += step
    out = []
    for a, b in edges:
        c = sum(1 for v in vals if a <= v < b)
        out.append((a, b, c))
    return out

Pmov = [r["P"] for _, r in mov]
print("\n=== combined alternator-charger power while MOVING (W) ===")
q = pct(Pmov, [0, 10, 25, 50, 75, 90, 95, 99, 100])
print("  " + "  ".join(f"p{p}={q[p]:.0f}" if q[p] is not None else f"p{p}=NA" for p in [0,10,25,50,75,90,95,99,100]))
print("  histogram (200W bins, moving):")
mx = max(Pmov) if Pmov else 0
for a, b, c in hist(Pmov, 0, (int(mx//200)+2)*200, 200):
    bar = "#" * int(60 * c / max(1, len(Pmov)))
    print(f"   {a:5.0f}-{b:5.0f}W | {c:6d} {bar}")

# ---- cross-tabs ------------------------------------------------------------
def group_stats(rows, keyfn, label):
    from collections import defaultdict
    g = defaultdict(list)
    for _, r in rows:
        k = keyfn(r)
        if k is None or r["P"] is None: continue
        g[k].append(r["P"])
    print(f"\n=== mean/median combined charger power by {label} (moving) ===")
    for k in sorted(g, key=lambda x: (isinstance(x,str), x)):
        v = sorted(g[k]); mean = sum(v)/len(v); med = v[len(v)//2]
        print(f"  {str(k):>14}: n={len(v):5d}  mean={mean:6.0f}W  median={med:6.0f}W  max={v[-1]:6.0f}W")

def soc_bucket(r):
    s = r["SOC"];
    if s is None: return None
    for hi,lbl in [(60,"<60%"),(75,"60-75%"),(85,"75-85%"),(92,"85-92%"),(97,"92-97%"),(101,">97%")]:
        if s < hi: return lbl
    return ">97%"

def temp_bucket(r):
    tp = r["TEMP"]
    if tp is None: return None
    for hi,lbl in [(5,"<5C"),(10,"5-10C"),(20,"10-20C"),(30,"20-30C"),(40,"30-40C")]:
        if tp < hi: return lbl
    return ">40C"

def spd_bucket(r):
    s=r["SPD"]
    if s is None: return None
    if s<3: return "idle(0-3)"
    if s<70: return "city(3-70)"
    if s<95: return "hwy(70-95)"
    return "fast(95+)"

group_stats(mov, soc_bucket, "SOC bucket")
group_stats(mov, spd_bucket, "speed bucket")
group_stats(mov, temp_bucket, "battery-temp bucket")
group_stats(eng, lambda r: r["OS"], "Orion state (engine-on incl idle)")

# ---- clean full-power opportunity: engine-on, moving, low SOC, warm --------
clean = [(t,r) for t,r in mov if r["SOC"] is not None and r["SOC"]<80
         and r["TEMP"] is not None and 10<=r["TEMP"]<=35 and r["SPD"]>30]
Pc=[r["P"] for _,r in clean]
print(f"\n=== 'should-be-full' window (moving>30, SOC<80, batt 10-35C): n={len(Pc)} ({len(Pc)*GRID/3600:.2f} h) ===")
if Pc:
    q=pct(Pc,[0,25,50,75,90,100])
    print("  " + "  ".join(f"p{p}={q[p]:.0f}W" for p in [0,25,50,75,90,100]))
    print("  Orion state distribution here:")
    from collections import Counter
    cc=Counter(r["OS"] for _,r in clean)
    for k,v in cc.most_common(): print(f"    {k}: {v} ({100*v/len(clean):.0f}%)")
    print("  histogram (200W bins):")
    for a,b,c in hist(Pc,0,(int(max(Pc)//200)+2)*200,200):
        bar="#"*int(60*c/max(1,len(Pc)))
        print(f"   {a:5.0f}-{b:5.0f}W | {c:6d} {bar}")
else:
    print("  (no samples matched — bank may have been high-SOC or cold on all recent drives)")

# ---- per-drive summary -----------------------------------------------------
print("\n=== recent drives (engine-on segments, gap>20min splits) ===")
drives=[]; cur=[]
last=None
for t,r in eng:
    if last is not None and t-last>1200:
        if cur: drives.append(cur); cur=[]
    cur.append((t,r)); last=t
if cur: drives.append(cur)
print(f"  {len(drives)} drives in last {DAYS} days")
def loc(ts): return dt.datetime.fromtimestamp(ts).strftime("%m-%d %H:%M")
hdr=f"  {'start':>11} {'dur':>5} {'SOC0':>5} {'SOC1':>5} {'Pmed_mv':>7} {'Pmax':>6} {'kWh':>5}  OrionState%"
print(hdr)
for d in drives[-25:]:
    ts0=d[0][0]; ts1=d[-1][0]; dur=(ts1-ts0)/3600
    socs=[r["SOC"] for _,r in d if r["SOC"] is not None]
    mv=[r["P"] for _,r in d if r["SPD"] and r["SPD"]>3 and r["P"] is not None]
    Pmed=sorted(mv)[len(mv)//2] if mv else 0
    Pmax=max((r["P"] for _,r in d if r["P"] is not None), default=0)
    # energy via trapezoid on grid
    kwh=sum((r["P"] or 0) for _,r in d)*GRID/3600/1000
    from collections import Counter
    oc=Counter(r["OS"] for _,r in d if r["OS"])
    tot=sum(oc.values()) or 1
    ostr=" ".join(f"{k[:3]}{100*v//tot}" for k,v in oc.most_common(3))
    s0=socs[0] if socs else None; s1=socs[-1] if socs else None
    print(f"  {loc(ts0):>11} {dur:4.1f}h {(f'{s0:.0f}' if s0 is not None else 'NA'):>5} {(f'{s1:.0f}' if s1 is not None else 'NA'):>5} {Pmed:6.0f}W {Pmax:5.0f}W {kwh:4.1f}  {ostr}")
