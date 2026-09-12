#!/usr/bin/env python
"""Read-only: how much house-battery energy is lost overnight, and what's drawing it.

"Overnight" = local 22:00-07:00, restricted to nights where the engine never ran
(binary_sensor.engine_is_running) so a night drive doesn't contaminate the number.
Nights where shore power was plugged in are reported separately since they're not
a fair "how much do I lose" sample.

Usage: python analyze_overnight_loss.py [days]
"""
import urllib.request, urllib.parse, json, datetime as dt, sys
from statistics import mean, median

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 30
GRID = 60  # seconds

E = {
    "SOC":    "sensor.olins_van_bms_battery",
    "WH":     "sensor.olins_van_bms_stored_energy",
    "PPACK":  "sensor.olins_van_bms_power",
    "V24":    "sensor.olins_van_bms_voltage",
    "V12":    "sensor.a32_pro_smart_battery_sense_12v_voltage",
    "SOLAR":  "sensor.total_mppt_pv_power",
    "ENG":    "binary_sensor.engine_is_running",
    "SHORE":  "sensor.a32_pro_s5140_channel_16_current_24v_shore_power_charger",
    "ALT":    "sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger",
    "CH_AC":  "sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning",
    "CH_24V": "sensor.a32_pro_s5140_channel_5_current_24v_24v_devices",
    "CH_12V": "sensor.a32_pro_s5140_channel_6_current_24v_12v_devices",
    "CH_INV": "sensor.a32_pro_s5140_channel_7_current_24v_inverter",
    "CH_HEAT":"sensor.a32_pro_s5140_channel_13_current_12v_battery_heater",
    "CH_FAN": "sensor.a32_pro_s5140_channel_14_current_12v_roof_fan",
    "CH_BED": "sensor.a32_pro_s5140_channel_15_current_24v_bed_motor",
}
CHANNELS = ["CH_AC", "CH_24V", "CH_12V", "CH_INV", "CH_HEAT", "CH_FAN", "CH_BED"]
CH_LABEL = {
    "CH_AC": "Air Conditioning", "CH_24V": "24V Devices", "CH_12V": "12V Devices",
    "CH_INV": "Inverter", "CH_HEAT": "Battery Heater", "CH_FAN": "Roof Fan",
    "CH_BED": "Bed Motor",
}
CH_BUS = {"CH_AC": "V24", "CH_24V": "V24", "CH_12V": "V24", "CH_INV": "V24",
          "CH_HEAT": "V12", "CH_FAN": "V12", "CH_BED": "V24"}
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


L = {k: stepper(series[k], k != "ENG") for k in E}
grid = []
t = (now - dt.timedelta(days=DAYS)).timestamp()
while t <= now.timestamp():
    grid.append((t, {k: L[k](t) for k in E}))
    t += GRID


def isn(v):
    return isinstance(v, (int, float))


# --- bucket into nights: local 22:00-07:00, keyed by the evening's calendar date ---
nights = {}
for t, r in grid:
    local = dt.datetime.fromtimestamp(t)
    if local.hour >= 22:
        key = local.date()
    elif local.hour < 7:
        key = local.date() - dt.timedelta(days=1)
    else:
        continue
    nights.setdefault(key, []).append((t, r))

print(f"\n{len(nights)} calendar nights with any data in range\n")

clean, excluded = [], []
for key in sorted(nights):
    pts = nights[key]
    if len(pts) < 180:  # need >=3h of 60s samples to trust it
        continue
    soc_pts = [(t, r["SOC"]) for t, r in pts if isn(r["SOC"])]
    wh_pts = [(t, r["WH"]) for t, r in pts if isn(r["WH"])]
    if len(soc_pts) < 2 or len(wh_pts) < 2:
        continue
    soc0, soc1 = soc_pts[0][1], soc_pts[-1][1]
    wh0, wh1 = wh_pts[0][1], wh_pts[-1][1]
    span_h = (pts[-1][0] - pts[0][0]) / 3600
    eng_on_min = sum(1 for _, r in pts if r["ENG"] == "on") * GRID / 60
    shore_max = max((r["SHORE"] for _, r in pts if isn(r["SHORE"])), default=0)
    solar_mean = mean([r["SOLAR"] for _, r in pts if isn(r["SOLAR"])] or [0])
    ppack_vals = [r["PPACK"] for _, r in pts if isn(r["PPACK"])]
    ppack_mean = mean(ppack_vals) if ppack_vals else None
    v24_vals = [r["V24"] for _, r in pts if isn(r["V24"])]
    v12_vals = [r["V12"] for _, r in pts if isn(r["V12"])]
    v24_mean = mean(v24_vals) if v24_vals else 26.6
    v12_mean = mean(v12_vals) if v12_vals else 12.6

    ch_w = {}
    for ch in CHANNELS:
        vals = [r[ch] for _, r in pts if isn(r[ch])]
        if not vals:
            continue
        bus_v = v24_mean if CH_BUS[ch] == "V24" else v12_mean
        ch_w[ch] = mean(abs(x) for x in vals) * bus_v

    rec = dict(key=key, span_h=span_h, soc0=soc0, soc1=soc1, wh0=wh0, wh1=wh1,
               eng_on_min=eng_on_min, shore_max=shore_max, solar_mean=solar_mean,
               ppack_mean=ppack_mean, v24_mean=v24_mean, ch_w=ch_w)
    if eng_on_min >= 5:
        rec["reason"] = f"engine ran {eng_on_min:.0f}min"
        excluded.append(rec)
    elif shore_max > 1.0:
        rec["reason"] = f"shore power ({shore_max:.1f}A)"
        excluded.append(rec)
    else:
        clean.append(rec)

print(f"=== {len(clean)} clean nights (parked, unplugged, engine off) ===")
print(f"{'date':>12} {'span':>5} {'SOC%':>12} {'Wh':>16} {'net W':>7} {'solar':>6}  top loads")
for r in clean:
    top = sorted(r["ch_w"].items(), key=lambda kv: -kv[1])[:3]
    top_s = ", ".join(f"{CH_LABEL[k]} {w:.0f}W" for k, w in top if w > 1)
    print(f"{str(r['key']):>12} {r['span_h']:4.1f}h {r['soc0']:5.1f}->{r['soc1']:<5.1f} "
          f"{r['wh0']:6.0f}->{r['wh1']:<6.0f}Wh {(-(r['ppack_mean'] or 0)):6.1f} "
          f"{r['solar_mean']:5.1f}  {top_s}")

if excluded:
    print(f"\n=== {len(excluded)} excluded nights (not representative) ===")
    for r in excluded:
        print(f"{str(r['key']):>12}  {r['reason']}  SOC {r['soc0']:.1f}->{r['soc1']:.1f}")

if clean:
    soc_loss = [r["soc0"] - r["soc1"] for r in clean]
    wh_loss = [r["wh0"] - r["wh1"] for r in clean]
    print(f"\n=== summary over {len(clean)} clean nights ===")
    print(f"  SOC lost:  mean {mean(soc_loss):.2f}%  median {median(soc_loss):.2f}%  "
          f"min {min(soc_loss):.2f}%  max {max(soc_loss):.2f}%")
    print(f"  Wh  lost:  mean {mean(wh_loss):.0f}Wh  median {median(wh_loss):.0f}Wh  "
          f"min {min(wh_loss):.0f}  max {max(wh_loss):.0f}")
    mean_span = mean(r["span_h"] for r in clean)
    print(f"  avg window covered: {mean_span:.1f}h  ->  "
          f"{mean(wh_loss)/mean_span:.0f} Wh/h  ({mean(wh_loss)/mean_span/ (mean(r['v24_mean'] for r in clean)):.2f} A avg)")

    print(f"\n  --- average draw by channel across clean nights (W) ---")
    all_ch = {}
    for r in clean:
        for ch, w in r["ch_w"].items():
            all_ch.setdefault(ch, []).append(w)
    ranked = sorted(all_ch.items(), key=lambda kv: -mean(kv[1]))
    total_measured = 0
    for ch, ws in ranked:
        m = mean(ws)
        total_measured += m
        print(f"    {CH_LABEL[ch]:<20} {m:6.1f}W  (n={len(ws)}/{len(clean)} nights, max {max(ws):.1f}W)")
    net_loss_w = mean(wh_loss) / mean_span
    print(f"    {'sum of channels':<20} {total_measured:6.1f}W")
    print(f"    {'measured net loss':<20} {net_loss_w:6.1f}W")
    print(f"    {'unaccounted':<20} {net_loss_w - total_measured:6.1f}W  "
          f"(BMS self-draw / 24V->12V conversion loss / sensor noise)")

    # projected runway if this rate held with zero solar/driving
    wh_per_pct = 84.0
    full_wh = 100 * wh_per_pct
    print(f"\n  at {mean(wh_loss)/mean_span:.0f}Wh/h with no solar/driving: "
          f"~{full_wh/(mean(wh_loss)/mean_span)/24:.1f} days from 100% to empty")
else:
    print("\nNo clean nights found in range - check entity ids / grid coverage.")
