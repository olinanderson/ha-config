#!/usr/bin/env python
"""Read-only: what engine RPM is needed to hold the 12V bus up under charger load?

The confound: bus voltage depends on BOTH rpm and load, and the loop is closed
(voltage sags -> chargers back off -> load drops -> voltage partly recovers). So we
bin on rpm AND on charger current, and report the LOW percentiles of voltage, which
is what actually trips the chargers' thresholds.

Usage: python analyze_rpm_vs_voltage.py [days]
"""
import urllib.request, urllib.parse, json, datetime as dt, sys

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 21
GRID = 10

E = {
    "CH8": "sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger",
    "IV":  "sensor.a32_pro_orion_input_voltage",
    "RPM": "sensor.192_168_10_90_0c_enginerpm",
    "SPD": "sensor.192_168_10_90_0d_vehiclespeed",
    "CMV": "sensor.192_168_10_90_42_controlmodulevolt",
    "SOC": "sensor.olins_van_bms_battery",
    "OS":  "sensor.a32_pro_orion_state",
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


def stepper(pairs, numeric=True, max_age=30):
    """Hold last value, but go stale after max_age seconds so an unavailable OBD
    dongle cannot masquerade as a valid low RPM reading."""
    d = [(t, (num(s) if numeric else s)) for t, s in pairs]
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


# Fast-updating numeric signals go stale in 30s. Orion DEVICE_STATE is recorded only on
# CHANGE (54 transitions in 7 days), so a 30s cutoff would discard nearly every sample -
# it gets a long hold instead.
L = {k: stepper(series[k], k != "OS", max_age=(7200 if k == "OS" else 30)) for k in E}
grid = []
t = (now - dt.timedelta(days=DAYS)).timestamp()
while t <= now.timestamp():
    grid.append({k: L[k](t) for k in E})
    t += GRID


def isn(v):
    return isinstance(v, (int, float))


rows = [r for r in grid if isn(r["RPM"]) and isn(r["IV"]) and isn(r["CH8"]) and r["RPM"] > 300]
print(f"\nengine-running samples with fresh RPM+voltage+current: {len(rows)} "
      f"({len(rows)*GRID/3600:.2f} h)")
if not rows:
    sys.exit(0)


def pct(vals, q):
    v = sorted(vals)
    return v[min(len(v) - 1, int(q / 100 * (len(v) - 1)))]


RPM_BINS = [(300, 700), (700, 800), (800, 850), (850, 900), (900, 950), (950, 1000),
            (1000, 1050), (1050, 1100), (1100, 1200), (1200, 1400), (1400, 1800), (1800, 9999)]

print("\n=== 12V bus voltage by RPM, ALL loads ===")
print(f"{'rpm':>12} {'n':>6} {'p5 V':>7} {'p25 V':>7} {'med V':>7} {'medCH8':>8} {'%below13.0':>11} {'%below12.5':>11}")
for lo, hi in RPM_BINS:
    g = [r for r in rows if lo <= r["RPM"] < hi]
    if len(g) < 5:
        continue
    ivs = [r["IV"] for r in g]
    print(f"{lo:5d}-{hi:<6d} {len(g):6d} {pct(ivs,5):6.2f}V {pct(ivs,25):6.2f}V {pct(ivs,50):6.2f}V "
          f"{pct([r['CH8'] for r in g],50):7.1f}A "
          f"{100*sum(1 for v in ivs if v<13.0)/len(ivs):10.1f}% "
          f"{100*sum(1 for v in ivs if v<12.5)/len(ivs):10.1f}%")

# The question that matters: under HEAVY charger load, what rpm holds the bus up?
LOADED = 45.0
print(f"\n=== 12V bus voltage by RPM, LOADED ONLY (charger current >= {LOADED:.0f}A) ===")
print("   This is the case that matters - the alternator is being asked for ~150A+ at 12V.")
print(f"{'rpm':>12} {'n':>6} {'p5 V':>7} {'p25 V':>7} {'med V':>7} {'medCH8':>8} {'%below13.1':>11} {'%below12.5':>11}")
best = None
for lo, hi in RPM_BINS:
    g = [r for r in rows if lo <= r["RPM"] < hi and r["CH8"] >= LOADED]
    if len(g) < 5:
        continue
    ivs = [r["IV"] for r in g]
    p5 = pct(ivs, 5)
    frac_fold = 100 * sum(1 for v in ivs if v < 13.1) / len(ivs)
    frac_lock = 100 * sum(1 for v in ivs if v < 12.5) / len(ivs)
    print(f"{lo:5d}-{hi:<6d} {len(g):6d} {p5:6.2f}V {pct(ivs,25):6.2f}V {pct(ivs,50):6.2f}V "
          f"{pct([r['CH8'] for r in g],50):7.1f}A {frac_fold:10.1f}% {frac_lock:10.1f}%")
    if best is None and p5 >= 13.1 and frac_lock < 1.0:
        best = (lo, hi, p5, frac_fold)

print("\n=== interpretation ===")
if best:
    print(f"  Lowest RPM band where the 5th-percentile bus voltage clears the Orion's")
    print(f"  13.1V foldback threshold: {best[0]}-{best[1]} RPM  (p5 = {best[2]:.2f}V,")
    print(f"  still below 13.1V {best[3]:.1f}% of the time).")
else:
    print("  No RPM band kept p5 voltage above 13.1V under load in this dataset.")

# Direct comparison of the two candidate idle speeds under load
print("\n=== candidate idle speeds, LOADED ===")
for label, lo, hi in [("current idle ~850", 800, 900), ("proposed idle 1050", 1000, 1100)]:
    g = [r for r in rows if lo <= r["RPM"] < hi and r["CH8"] >= LOADED]
    if len(g) < 5:
        print(f"  {label:22s}: too few loaded samples (n={len(g)})")
        continue
    ivs = [r["IV"] for r in g]
    ch8 = [r["CH8"] for r in g]
    print(f"  {label:22s}: n={len(g):4d}  p5={pct(ivs,5):5.2f}V med={pct(ivs,50):5.2f}V  "
          f"medCH8={pct(ch8,50):5.1f}A maxCH8={max(ch8):5.1f}A  "
          f"below13.1: {100*sum(1 for v in ivs if v<13.1)/len(ivs):4.1f}%")

# How much charge current is actually sustained at each rpm - the payoff metric
print("\n=== sustained charger current by RPM (only when the bank still wants charge: SOC<80) ===")
print(f"{'rpm':>12} {'n':>6} {'medCH8':>8} {'p90CH8':>8} {'medIV':>7}")
for lo, hi in RPM_BINS:
    g = [r for r in rows if lo <= r["RPM"] < hi and isn(r["SOC"]) and r["SOC"] < 80
         and r["OS"] not in (None, "Off")]
    if len(g) < 5:
        continue
    print(f"{lo:5d}-{hi:<6d} {len(g):6d} {pct([r['CH8'] for r in g],50):7.1f}A "
          f"{pct([r['CH8'] for r in g],90):7.1f}A {pct([r['IV'] for r in g],50):6.2f}V")

# Sanity: does the ECU bus voltage agree with the Orion input at each rpm?
print("\n=== cross-check: Orion input vs ECU control-module voltage (loaded) ===")
g = [r for r in rows if r["CH8"] >= LOADED and isn(r["CMV"])]
if g:
    diffs = [r["CMV"] - r["IV"] for r in g]
    print(f"  n={len(g)}  median (ECU - Orion) = {pct(diffs,50):+.2f}V  "
          f"p5={pct(diffs,5):+.2f}V p95={pct(diffs,95):+.2f}V")
    print("  A small positive offset = normal cable drop. A large one would mean the")
    print("  charger feed itself is undersized rather than the alternator being maxed.")
