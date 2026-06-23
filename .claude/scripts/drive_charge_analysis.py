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
    if t0:
        q += " AND last_updated_ts>=?"; args.append(t0)
    if t1:
        q += " AND last_updated_ts<=?"; args.append(t1)
    q += " ORDER BY last_updated_ts"
    out = []
    for ts, st in cur.execute(q, args):
        try:
            v = float(st)
        except (TypeError, ValueError):
            v = None
        out.append((ts, v))
    return out

def lt(ts):
    return datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')

# ---- Find recent drives from engine RPM (WiCAN only reports while engine on) ----
rpm = [(ts, v) for ts, v in series('sensor.192_168_10_90_0c_enginerpm') if v is not None]
GAP = 900  # 15 min gap => separate drive
drives = []
cluster = []
for ts, v in rpm:
    if cluster and ts - cluster[-1][0] > GAP:
        drives.append(cluster); cluster = []
    cluster.append((ts, v))
if cluster:
    drives.append(cluster)

print("=== Recent drives (engine-on windows from RPM) ===")
for d in drives[-6:]:
    t0, t1 = d[0][0], d[-1][0]
    dur = (t1 - t0) / 60.0
    print(f"  {lt(t0)} -> {lt(t1)}  ({dur:5.1f} min, {len(d)} rpm samples)")

if not drives:
    print("No drives found in retained history.")
    raise SystemExit

def twavg(entity, a, b):
    pts = [(ts, v) for ts, v in series(entity, a, b) if v is not None]
    if len(pts) < 2:
        return None
    integ = tot = pintreg = ptot = 0.0
    nintreg = ntot = 0.0
    vmin = min(v for _, v in pts); vmax = max(v for _, v in pts)
    for i in range(len(pts) - 1):
        ts, v = pts[i]; ts2, _ = pts[i + 1]
        dt = ts2 - ts
        integ += v * dt; tot += dt
        if v > 0:
            pintreg += v * dt; ptot += dt
        elif v < 0:
            nintreg += v * dt; ntot += dt
    return {
        'n': len(pts),
        'avg': integ / tot if tot else None,
        'avg_charge': pintreg / ptot if ptot else None,
        'avg_discharge': nintreg / ntot if ntot else None,
        'frac_charging': ptot / tot if tot else None,
        'min': vmin, 'max': vmax,
        'ah_net': integ / 3600.0,
        'ah_in': pintreg / 3600.0,
        'span_h': tot / 3600.0,
    }

def edge(entity, t, pre=True):
    win = 1200
    mid = meta_id(entity)
    if mid is None:
        return None
    if pre:
        r = cur.execute("SELECT last_updated_ts, state FROM states WHERE metadata_id=? AND last_updated_ts<=? ORDER BY last_updated_ts DESC LIMIT 1", (mid, t + 30)).fetchone()
    else:
        r = cur.execute("SELECT last_updated_ts, state FROM states WHERE metadata_id=? AND last_updated_ts>=? ORDER BY last_updated_ts ASC LIMIT 1", (mid, t - 30)).fetchone()
    if not r:
        return None
    try:
        return (r[0], float(r[1]))
    except (TypeError, ValueError):
        return None

def analyze(t0, t1, tag):
    dur_h = (t1 - t0) / 3600.0
    print(f"\n=== {tag}: {lt(t0)} -> {lt(t1)}  ({dur_h*60:.1f} min) ===")
    c = twavg('sensor.olins_van_bms_current', t0, t1)
    v = twavg('sensor.olins_van_bms_voltage', t0, t1)
    if c:
        print(f"  current: net avg {c['avg']:+.1f} A | avg-while-charging {c['avg_charge']:+.1f} A "
              f"({c['frac_charging']*100:.0f}% charging) | max {c['max']:+.1f} A | net {c['ah_net']:+.1f} Ah")
    if v:
        pw = c['avg_charge'] * v['avg'] if c and c['avg_charge'] else 0
        print(f"  voltage: avg {v['avg']:.2f} V  ->  charge power ~{pw:.0f} W")
    for label, ent in [("SOC %", 'sensor.olins_van_bms_battery'), ("Stored Wh", 'sensor.olins_van_bms_stored_energy')]:
        a = edge(ent, t0, pre=True)
        b = edge(ent, t1, pre=False)
        if a and b:
            print(f"  {label:10s}: {a[1]:.0f} -> {b[1]:.0f}   (delta {b[1]-a[1]:+.0f})")

# Analyze the last 3 substantial drives (>= 5 min)
substantial = [d for d in drives if (d[-1][0] - d[0][0]) >= 300]
for i, d in enumerate(substantial[-3:]):
    tag = "MOST RECENT DRIVE" if d is substantial[-1] else "earlier drive"
    analyze(d[0][0], d[-1][0], tag)
