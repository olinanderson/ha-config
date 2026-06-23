import sqlite3, datetime, sys
con = sqlite3.connect('file:/config/home-assistant_v2.db?mode=ro', uri=True)
cur = con.cursor()
P = lambda *a: (print(*a), sys.stdout.flush())
def lt(ts): return datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M')

IDS = {'soc': 'sensor.olins_van_bms_battery',
       'wh':  'sensor.olins_van_bms_stored_energy',
       'v':   'sensor.olins_van_bms_voltage'}

# metadata ids in the long-term statistics table
mids = {}
for k, sid in IDS.items():
    r = cur.execute("SELECT id FROM statistics_meta WHERE statistic_id=?", (sid,)).fetchone()
    mids[k] = r[0] if r else None
P("statistics_meta ids:", mids)

def stat(k):
    """hourly rows: start_ts -> (mean,min,max)"""
    out = {}
    if mids[k] is None: return out
    for ts, mean, mn, mx in cur.execute(
        "SELECT start_ts, mean, min, max FROM statistics WHERE metadata_id=? ORDER BY start_ts", (mids[k],)):
        if mean is not None: out[int(ts)] = (mean, mn, mx)
    return out

soc, wh, vv = stat('soc'), stat('wh'), stat('v')
P(f"hourly stat rows: SOC {len(soc)}, Wh {len(wh)}, V {len(vv)}")
if soc:
    ks = sorted(soc); P(f"  span {lt(ks[0])} -> {lt(ks[-1])}")

# join on identical hourly bucket start_ts
keys = sorted(set(soc) & set(wh) & set(vv))
trip = [(soc[t][0], wh[t][0], vv[t][0]) for t in keys]
P(f"  joined hourly points: {len(trip)}")

# ---- observed extremes ----
P("\n=== Observed extremes (hourly means) ===")
by_soc = sorted(trip, key=lambda r: r[0])
def band(target, lbl):
    sel = [r for r in trip if abs(r[0]-target) <= 1.0]
    if sel:
        aw = sum(r[1] for r in sel)/len(sel); av = sum(r[2] for r in sel)/len(sel)
        P(f"  {lbl}: SOC~{target:.0f}%  stored {aw:.0f} Wh (n={len(sel)}, {min(r[1] for r in sel):.0f}-{max(r[1] for r in sel):.0f})  V~{av:.2f}")
        return aw
hi = by_soc[-1][0]; lo = by_soc[0][0]
hiwh = band(hi, f"MAX SOC")
lowh = band(lo, f"MIN SOC")
P(f"  SOC observed range: {lo:.0f}% - {hi:.0f}%")

# ---- regression stored_Wh ~ SOC ----
def linreg(xy):
    n = len(xy)
    if n < 2: return None
    sx = sy = sxx = sxy = 0.0
    for x, y in xy:
        sx += x; sy += y; sxx += x*x; sxy += x*y
    d = n*sxx - sx*sx
    if d == 0: return None
    m = (n*sxy - sx*sy)/d; b = (sy - m*sx)/n; yb = sy/n
    sst = ssr = 0.0
    for x, y in xy:
        sst += (y - yb)**2; ssr += (y - (m*x + b))**2
    return m, b, (1 - ssr/sst if sst else 0), n

P("\n=== Regression stored_Wh = m*SOC + b ===")
reg = linreg([(r[0], r[1]) for r in trip])
full_wh = None
if reg:
    m,b,r2,n = reg
    full_wh = m*100+b
    P(f"  n={n} R²={r2:.4f} | {m:.1f} Wh/% | full(100%)={full_wh:.0f} Wh | at0%={b:.0f} | usable={m*100:.0f} Wh")

# ---- voltage characterization ----
P("\n=== Voltage ===")
vr = linreg([(r[0], r[2]) for r in trip])
if vr:
    vm,vb,vr2,_ = vr
    P(f"  V@100%~{vm*100+vb:.2f}  V@0%~{vb:.2f} (R²={vr2:.3f})")
allmins = [vv[t][1] for t in vv]; allmaxs = [vv[t][2] for t in vv]
P(f"  observed V: min {min(allmins):.2f}  max {max(allmaxs):.2f}")
mid = sorted(r[2] for r in trip if 40 <= r[0] <= 70)
nominal = mid[len(mid)//2] if mid else 25.6
P(f"  nominal (median V @40-70% SOC): {nominal:.2f} V")

# ---- reconciled ----
P("\n=== TOTAL CAPACITY (reconciled) ===")
if full_wh:
    P(f"  Full energy (regression->100%) : {full_wh:.0f} Wh  (~{full_wh/1000:.1f} kWh)")
    P(f"  Full energy (latest 6735Wh@83%): {6735/0.83:.0f} Wh extrapolated")
    P(f"  Ah @ nominal {nominal:.1f}V        : {full_wh/nominal:.0f} Ah")
    P(f"  Ah @ 25.6V (8S LiFePO4 spec)    : {full_wh/25.6:.0f} Ah")
    P(f"  Cross-check vs today coulomb (285-300Ah): {'consistent' if 270 <= full_wh/nominal <= 360 else 'CHECK'}")
