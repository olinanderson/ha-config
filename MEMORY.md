# MEMORY.md — Van / Home Assistant

_Curated knowledge for the van Home Assistant setup. Update this when something important is learned._

---

## React Dashboard — Camera Playback

- **Timeline interaction (updated Apr 20 2026):**
  - Scroll wheel → zoom (works in both playback and clip mode)
  - Drag when zoomed in → pans the timeline (cursor shows grab hand)
  - Click (static, <5px movement) → seeks video
  - Double-click → resets zoom to full day
- **Clip mode (updated Apr 20 2026):**
  - Opens with 10-minute window centered on current playback position
  - Timeline auto-zooms to show the clip window when clip mode activates
  - Handles start well apart (5 min before / 5 min after current time)
- **Playback loading:** Initial "Loading..." delay of ~3s is normal — stream startup latency, not a bug.

---

## Known DVR Quirks (Lorex XVR5104C-X1)

- **`setConfig` CGI is broken via HTTP API** — this firmware drops the TCP connection immediately on any request with a literal space in the URL. The Dahua `TimeSection` format requires `"3 00:00:00-24:00:00"` (space before time), so recording schedule cannot be changed via API. Must use physical UI or Lorex app.
- **Recording schedule reset on ~Apr 17 2026** — likely caused by a power cycle/DVR reboot. Schedule reverted to mask=1 (Timing/continuous only), losing motion event recording (mask=3). Olin fixed it manually via DVR UI on Apr 20.
- **Motion events (`flags=Event`) vs continuous (`flags=Timing`)** — the timeline API at `/api/timeline` returns both. When only Timing shows up, motion detection recording is off in the schedule.
- **Digest auth with `qop=auth`** — DVR requires full `nc`/`cnonce` fields. Plain digest without qop returns "Invalid Authority".

---

## Fuel Level Sensing (Updated Apr 21 2026)

### Architecture
Three sensors work together:
1. **`sensor.192_168_10_90_2f_fueltanklevel`** — raw OBD fuel tank %. Bounces ±5–10% from slosh while driving.
2. **`sensor.wican_fuel_5_min_mean`** (now a 20s EMA alias) — low-pass filtered raw value, dense history for trip calculations.
3. **`sensor.stable_fuel_level`** — gated latch, only updates when calm.

### What changed (Apr 21 2026)
- **Replaced 5-min SMA with 20s lowpass EMA** in `filter.yaml`. SMA had a cold-start problem (returned `unknown` until 5 min of data accumulated). EMA initializes immediately.
- **Loosened acceleration threshold** from 0.5 → 1.0 km/h/s in `input_number.yaml` and `template/triggered.yaml`. Allows updates during gentle city driving.
- **Added fill-up bypass** to `stable_fuel_level`: if raw jumps >10% above the previous stable value, latch immediately regardless of grade/accel.

### How OEM ECUs do it
- 10–30s exponential moving average (not SMA)
- Speed gating: stop updating filtered value above ~5–15 km/h
- Hysteresis: needle only moves if filtered value changed by >2–3%
- Fill-up snap: bypass all filtering if level jumps >10% quickly
- Multi-sample while parked: 10–20 samples over 2–3 seconds, then average

Our `stable_fuel_level` is actually *more precise* than OEM because grade+accel gating beats simple speed gating.

### Backend fuel-trip calculations
`osrm_proxy.py` queries `sensor.wican_fuel_5_min_mean` (now the EMA alias) from the HA recorder DB for start/end fuel levels on each trip. The dense history makes this reliable. `stable_fuel_level` is too sparse for backend math.

---

## DTC Dashboard (Apr 21 2026)

Active codes render as a red banner at the top of the Van page, one badge per code. Clicking opens a modal with:
- Local quick reference from `custom_templates/ford_dtc.jinja` (if known)
- Live-fetched description, causes, symptoms, and fix from `engine-codes.com`

### Architecture
- `dvr_proxy.py` has `/api/dtc?code=PXXXX` which server-side scrapes `engine-codes.com` (use browser User-Agent — `obd-codes.com` blocks bots with 403). Results cached in memory 7 days.
- React dashboard `DTCDialog` component calls this endpoint directly via `http://<host>:8766/api/dtc`. CORS fine because the proxy already sets `Access-Control-Allow-Origin: *`.
- `custom_templates/ford_dtc.jinja` is loaded only at HA startup — adding new codes to the macro requires HA restart.
- DVR proxy takes ~15–20s to bind port 8766 after starting (retries go2rtc stream registration first). `shell_command.restart_dvr_proxy` returns 200 immediately; wait before testing.

_Last updated: 2026-04-24_
