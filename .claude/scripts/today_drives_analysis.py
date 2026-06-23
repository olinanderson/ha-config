import sqlite3, datetime

con = sqlite3.connect('file:/config/home-assistant_v2.db?mode=ro', uri=True)
cur = con.cursor()

def meta_id(entity):
    r = cur.execute("SELECT metadata_id FROM states_meta WHERE entity_id=?", (entity,)).fetchone()
    return r[0] if r else None

def series(entity, t0=None, t1=None):
    mid = meta_id(entity)
    if mid is None:
        return []
    q = "SELECT last_updated_ts, state FROM states WHERE metadata_id=?"
    args = [mid]
    if t0: q += " AND last_updated_ts>=?"; args.append(t0)
    if t1: q += " AND last_updated_ts<=?"; args.append(t1)
    q += " ORDER BY last_updated_ts"
    out = []
    for ts, st in cur.execute(q, args):
        try: v = float(st)
        except (TypeError, ValueError): v = None
        out.append((ts, v, st))
    return out

def lt(ts):
    return datetime.datetime.fromtimestamp(ts).strftime('%H:%M:%S')

# ---- today's local-midnight epoch ----
now = datetime.datetime.now()
midnight = datetime.datetime(now.year, now.month, now.day).timestamp()
print(f"Analyzing drives for {now.strftime('%Y-%m-%d')} (since local midnight {midnight:.0f})\n")

# ---- engine-on windows from RPM ----
rpm_all = series('sensor.192_168_10_90_0c_enginerpm', midnight)
rpm = [(ts, v) for ts, v, st in rpm_all if v is not None]
print(f"Total RPM samples today: {len(rpm)}")
if not rpm:
    raise SystemExit("No RPM data today.")

GAP = 600  # 10-min gap splits engine-on windows
windows = []
clu = []
for ts, v in rpm:
    if clu and ts - clu[-1][0] > GAP:
        windows.append(clu); clu = []
    clu.append((ts, v))
if clu: windows.append(clu)

def twstats(entity, a, b):
    pts = [(ts, v) for ts, v, st in series(entity, a, b) if v is not None]
    if len(pts) < 2: return None
    integ = tot = pin = pt = 0.0
    vmin = min(v for _, v in pts); vmax = max(v for _, v in pts)
    for i in range(len(pts) - 1):
        ts, v = pts[i]; ts2, _ = pts[i + 1]; dt = ts2 - ts
        integ += v * dt; tot += dt
        if v > 0: pin += v * dt; pt += dt
    return {'n': len(pts), 'avg': integ/tot if tot else 0, 'avg_chg': pin/pt if pt else 0,
            'fchg': pt/tot if tot else 0, 'min': vmin, 'max': vmax,
            'ah_net': integ/3600, 'ah_in': pin/3600, 'wh_net': None}

def speed_stats(a, b):
    pts = [(ts, v) for ts, v, st in series('sensor.192_168_10_90_0d_vehiclespeed', a, b) if v is not None]
    if len(pts) < 2: return None
    moving = tot = dist = 0.0
    vmax = max(v for _, v in pts)
    for i in range(len(pts) - 1):
        ts, v = pts[i]; ts2, _ = pts[i + 1]; dt = ts2 - ts
        tot += dt; dist += v * dt / 3600.0
        if v > 1: moving += dt
    return {'max': vmax, 'moving_frac': moving/tot if tot else 0, 'dist_km': dist}

def edge(entity, t, pre=True, maxgap=600):
    mid = meta_id(entity)
    if mid is None: return None
    if pre:
        r = cur.execute("SELECT last_updated_ts, state FROM states WHERE metadata_id=? AND last_updated_ts<=? ORDER BY last_updated_ts DESC LIMIT 1", (mid, t + 30)).fetchone()
    else:
        r = cur.execute("SELECT last_updated_ts, state FROM states WHERE metadata_id=? AND last_updated_ts>=? ORDER BY last_updated_ts ASC LIMIT 1", (mid, t - 30)).fetchone()
    if not r: return None
    try: return (r[0], float(r[1]))
    except (TypeError, ValueError): return None

tot_ah = tot_soc = tot_wh = tot_drivemin = 0.0
drive_rows = []
print("\n" + "=" * 78)
for w in windows:
    t0, t1 = w[0][0], w[-1][0]
    dur_min = (t1 - t0) / 60.0
    rpmvals = [v for _, v in w]
    if dur_min < 0.5:
        print(f"\n[blip] {lt(t0)}  single/short engine-on, {len(w)} sample(s), RPM={rpmvals}  (engine bumped, not a drive)")
        continue
    c = twstats('sensor.olins_van_bms_current', t0, t1)
    v = twstats('sensor.olins_van_bms_voltage', t0, t1)
    sp = speed_stats(t0, t1)
    soc_a = edge('sensor.olins_van_bms_battery', t0, True)
    soc_b = edge('sensor.olins_van_bms_battery', t1, False)
    wh_a = edge('sensor.olins_van_bms_stored_energy', t0, True)
    wh_b = edge('sensor.olins_van_bms_stored_energy', t1, False)
    print(f"\nDRIVE {lt(t0)} -> {lt(t1)}   ({dur_min:.1f} min, RPM peak {max(rpmvals):.0f})")
    if sp:
        print(f"  motion : max {sp['max']:.0f} km/h | moving {sp['moving_frac']*100:.0f}% of window | ~{sp['dist_km']:.1f} km")
    if c:
        print(f"  current: net avg {c['avg']:+.1f} A | while-charging {c['avg_chg']:+.1f} A ({c['fchg']*100:.0f}%) | peak {c['max']:+.1f} A")
        print(f"  charge : +{c['ah_in']:.1f} Ah in  (net {c['ah_net']:+.1f} Ah)  @ ~{v['avg']:.1f} V  ->  ~{c['avg_chg']*v['avg']:.0f} W")
        tot_ah += c['ah_net']; tot_drivemin += dur_min
    if soc_a and soc_b:
        print(f"  SOC    : {soc_a[1]:.0f}% -> {soc_b[1]:.0f}%  ({soc_b[1]-soc_a[1]:+.0f})")
        tot_soc += (soc_b[1] - soc_a[1])
    if wh_a and wh_b:
        print(f"  stored : {wh_a[1]:.0f} -> {wh_b[1]:.0f} Wh  ({wh_b[1]-wh_a[1]:+.0f})")
        tot_wh += (wh_b[1] - wh_a[1])
    if c and soc_a and soc_b and (soc_b[1]-soc_a[1]) != 0:
        print(f"  --> implies capacity {c['ah_net']/((soc_b[1]-soc_a[1])/100):.0f} Ah  (coulomb / SOC%)")

print("\n" + "=" * 78)
print("TODAY TOTALS (engine-on / driving):")
print(f"  drive time      : {tot_drivemin:.0f} min ({tot_drivemin/60:.2f} h)")
print(f"  net Ah added    : {tot_ah:+.1f} Ah   (coulomb-counted)")
print(f"  SOC delta (sum) : {tot_soc:+.0f} %")
print(f"  stored Wh delta : {tot_wh:+.0f} Wh")
print("\nCROSS-CHECK of pack capacity (3 independent methods):")
if tot_soc:
    print(f"  A) coulomb / SOC : {tot_ah/(tot_soc/100):.0f} Ah  -> at 25.6V nominal ~{tot_ah/(tot_soc/100)*25.6/1000:.1f} kWh")
if tot_soc:
    print(f"  B) storedWh / SOC: {tot_wh/(tot_soc/100):.0f} Wh full")
print(f"  C) doc nameplate : ~8700 Wh")
print("\nRATE (per hour of driving, from today's totals):")
if tot_drivemin:
    print(f"  ~{tot_ah/(tot_drivemin/60):.0f} A avg  |  ~{tot_soc/(tot_drivemin/60):.0f} %/h  |  ~{tot_wh/(tot_drivemin/60):.0f} Wh/h")
