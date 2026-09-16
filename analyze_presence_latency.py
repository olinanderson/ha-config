#!/usr/bin/env python
"""Read-only: why do the lights take so long to come back when you return to the van?

binary_sensor.van_occupied is a template over the Apollo MSR-2 radar with
delay_on 10 s / delay_off 3 min. One minute after it goes off, power saving
turns the lights and both monitors off; when it comes back on, power saving
is switched off again and the lights are restored.

  A. every return that ended power saving: when the monitors came on, when
     the radar came back online, when it saw you, when van_occupied flipped,
     when the lights came on
  B. every time the MSR-2 dropped offline / came back: how long after the
     monitors went off / on, and whether it had rebooted (uptime), i.e. lost
     power rather than Wi-Fi
  C. radar detections that started while van_occupied was off: how long they
     lasted and whether a real arrival followed, i.e. which ones a shorter
     delay_on would have turned into a false "welcome back"

Usage: python analyze_presence_latency.py [days]   (cwd = repo root; 30 days ~2-3 min)
"""
import urllib.request, urllib.parse, json, datetime as dt, sys, bisect
from statistics import median

HA = "http://100.80.15.86:8123"
TOKEN = open(".gps_filter_token").read().strip()
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 30
LOCAL = dt.datetime.now().astimezone().tzinfo

E = {
    "RT": "binary_sensor.apollo_msr_2_1731d8_radar_target",
    "MOV": "binary_sensor.apollo_msr_2_1731d8_radar_moving_target",
    "STILL": "binary_sensor.apollo_msr_2_1731d8_radar_still_target",
    "UP": "sensor.apollo_msr_2_1731d8_uptime",
    "OCC": "binary_sensor.van_occupied",
    "PS": "input_boolean.power_saving_mode",
    "SLEEP": "input_boolean.sleep_mode",
    "TOP": "switch.a32_pro_do8_switch06_top_monitor",
    "BOT": "switch.a32_pro_do8_switch07_bottom_monitor",
    "L1": "light.led_controller_cct_1",
    "L2": "light.led_controller_cct_2",
}
inv = {v: k for k, v in E.items()}


def fetch(a, b):
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
raw = {k: [] for k in E}
for d in range(DAYS, 0, -1):
    a = now - dt.timedelta(days=d)
    b = now - dt.timedelta(days=d - 1)
    for series in fetch(a, b):
        if not series:
            continue
        key = inv.get(series[0]["entity_id"])
        for row in series:
            ts = dt.datetime.fromisoformat(row.get("last_changed") or row["last_updated"])
            raw[key].append((ts, row["state"]))
for k in raw:
    raw[k].sort()
    dedup = []
    for ts, st in raw[k]:
        if dedup and dedup[-1][1] == st and k != "UP":
            continue  # repeated first row of each day's window
        dedup.append((ts, st))
    raw[k] = dedup

T = {k: [t for t, _ in v] for k, v in raw.items()}


def state_at(k, t):
    i = bisect.bisect_right(T[k], t) - 1
    return raw[k][i][1] if i >= 0 else None


def changes(k, to=None, frm=None):
    out = []
    prev = None
    for t, s in raw[k]:
        if prev is not None and s != prev and (to is None or s in to) and (frm is None or prev in frm):
            out.append((t, prev, s))
        prev = s
    return out


def last_before(events, t, within):
    best = None
    for et, *_ in events:
        if t - within <= et <= t:
            best = et
    return best


def first_after(events, t, within):
    for et, *_ in events:
        if t <= et <= t + within:
            return et
    return None


def loc(t):
    return t.astimezone(LOCAL).strftime("%m-%d %H:%M:%S")


def secs(a, b):
    return f"{(b - a).total_seconds():6.1f}" if a and b else "     -"


UNAVAIL = {"unavailable", "unknown"}
mon_on = sorted(changes("TOP", to={"on"}) + changes("BOT", to={"on"}))
mon_off = sorted(changes("TOP", to={"off"}) + changes("BOT", to={"off"}))
radar_back = changes("RT", frm=UNAVAIL, to={"on", "off"})
radar_gone = changes("RT", to=UNAVAIL, frm={"on", "off"})
radar_on = changes("RT", to={"on"})
lights_on = sorted(changes("L1", to={"on"}) + changes("L2", to={"on"}))
ps_off = changes("PS", frm={"on"}, to={"off"})

print(f"Window: last {DAYS} days, local time\n")

# ── A. returns that ended power saving ────────────────────────────────────
print("A. Returns that ended power saving")
print("   when            monitors->radar online->radar on->occupied->lights  | total  radar was")
tot_off, tot_on = [], []
for t, prev, _ in changes("OCC", to={"on"}):
    ps_end = first_after(ps_off, t, dt.timedelta(seconds=5))
    if not ps_end:
        continue
    back = last_before(radar_back, t, dt.timedelta(seconds=60))
    mon = last_before(mon_on, back or t, dt.timedelta(seconds=180))
    ron = last_before(radar_on, t, dt.timedelta(seconds=60))
    lit = first_after(lights_on, t, dt.timedelta(seconds=10))
    if back:
        start = mon or back
        total = (lit or t) - start
        tot_off.append(total.total_seconds())
        how = "OFFLINE" + ("" if mon else " (no monitor switch seen)")
    else:
        start = ron
        total = (lit or t) - start if start else None
        if total:
            tot_on.append(total.total_seconds())
        how = "online"
    print(f"   {loc(t)}  {secs(mon, back)} {secs(back, ron) if back else '     -'} {secs(ron, t)} {secs(t, lit)}"
          f"      | {total.total_seconds() if total else float('nan'):5.1f}  {how}")
if tot_off:
    print(f"   radar offline at return: {len(tot_off)}x, median {median(tot_off):.1f} s from monitor switch to lights")
if tot_on:
    print(f"   radar online at return:  {len(tot_on)}x, median {median(tot_on):.1f} s from first detection to lights")

# ── B. MSR-2 offline / back online vs the monitor switches ──────────────
print("\nB. MSR-2 dropouts vs the monitor relays")
gone_after_off, gone_with_mon_on = [], 0
for t, *_ in radar_gone:
    mons = (state_at("TOP", t), state_at("BOT", t))
    if mons == ("off", "off"):
        off_t = last_before(mon_off, t, dt.timedelta(hours=6))
        gone_after_off.append((t - off_t).total_seconds() if off_t else float("nan"))
    else:
        gone_with_mon_on += 1
        print(f"   {loc(t)} went offline with monitors {mons}")
if gone_after_off:
    print(f"   went offline with both monitors off: {len(gone_after_off)}x, "
          f"median {median(gone_after_off):.0f} s after they switched off "
          f"(range {min(gone_after_off):.0f}-{max(gone_after_off):.0f})")
print(f"   went offline with a monitor still on: {gone_with_mon_on}x")
lags, reboots, checked = [], 0, 0
for t, *_ in radar_back:
    mon = last_before(mon_on, t, dt.timedelta(seconds=180))
    if mon:
        lags.append((t - mon).total_seconds())
    i = bisect.bisect_left(T["UP"], t)
    for ut, us in raw["UP"][i:i + 5]:
        if ut - t > dt.timedelta(seconds=120):
            break
        try:
            up = float(us)
        except ValueError:
            continue
        checked += 1
        if up < (ut - t).total_seconds() + 60:
            reboots += 1
        break
print(f"   came back online: {len(radar_back)}x; {len(lags)} within 3 min of a monitor switching on "
      f"(median {median(lags) if lags else float('nan'):.1f} s later); "
      f"uptime says rebooted in {reboots} of {checked} checked")

# ── C. detections that started while van_occupied was off ───────────────
print("\nC. Radar detections starting while van_occupied was off (radar online)")


# One timeline for "any target" (the template's input): on / off / unavailable.
merged, cur, prev = [], {"RT": None, "MOV": None, "STILL": None}, None
for t, k, st in sorted((t, k, st) for k in cur for t, st in raw[k]):
    cur[k] = st
    if cur["RT"] in UNAVAIL:
        m = "unavailable"
    elif "on" in cur.values():
        m = "on"
    else:
        m = "off"
    if m != prev:
        merged.append((t, m))
        prev = m

occ_on = changes("OCC", to={"on"})
occ_off = changes("OCC", to={"off"})
episodes = []
for i, (t, m) in enumerate(merged):
    if m != "on" or i == 0 or merged[i - 1][1] != "off":
        continue  # only off -> on (a boot reports "on" straight from unavailable)
    if state_at("OCC", t - dt.timedelta(milliseconds=1)) != "off":
        continue
    end = merged[i + 1][0] if i + 1 < len(merged) else now
    arrived = first_after(occ_on, t, dt.timedelta(seconds=90))
    stayed = None
    if arrived:
        nxt = first_after(occ_off, arrived, dt.timedelta(days=5))
        stayed = (nxt or now) - arrived
    real = bool(arrived and stayed and stayed > dt.timedelta(minutes=5))
    episodes.append((t, end, arrived, stayed, real))

short = [e for e in episodes if (e[1] - e[0]).total_seconds() < 10]
print(f"   {len(episodes)} detections; {len(short)} lasted < 10 s (today's delay_on filtered those out)")
for t, end, arrived, stayed, real in episodes:
    dur = (end - t).total_seconds()
    if arrived:
        tag = f"van_occupied on {int((arrived - t).total_seconds())} s later, stayed {stayed.total_seconds() / 60:.0f} min"
    else:
        tag = "no arrival followed"
    print(f"   {loc(t)}  {dur:7.1f} s  sleep={state_at('SLEEP', t)} ps={state_at('PS', t)}  "
          f"{'real' if real else 'SUSPECT'}  {tag}")
for d in (0, 1, 2, 3, 5, 10):
    fp = [e for e in episodes if (e[1] - e[0]).total_seconds() >= d and not e[4]]
    print(f"   delay_on {d:2d} s: {len(fp)} suspect detection(s) would fire")
