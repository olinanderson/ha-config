# MEMORY.md — Long-Term Memory

_Curated knowledge that persists across sessions. Update this when something important is learned._

---

## Who I'm Helping

- **Name:** Olin Anderson
- **What:** Full-time van life in a 2016 Ford Transit T-350 HD
- **Setup:** Home Assistant running on the van, managing electrical, climate, water, cameras, vehicle data
- **Vibe:** Technical, DIY, wants things to work well. Doesn't need hand-holding. Appreciates direct answers.

---

## Known DVR Quirks (Lorex XVR5104C-X1)

- **`setConfig` CGI is broken via HTTP API** — this firmware drops the TCP connection immediately on any request with a literal space in the URL. The Dahua `TimeSection` format requires `"3 00:00:00-24:00:00"` (space before time), so recording schedule cannot be changed via API. Must use physical UI or Lorex app.
- **Recording schedule reset on ~Apr 17 2026** — likely caused by a power cycle/DVR reboot. Schedule reverted to mask=1 (Timing/continuous only), losing motion event recording (mask=3). Olin fixed it manually via DVR UI on Apr 20.
- **Motion events (`flags=Event`) vs continuous (`flags=Timing`)** — the timeline API at `/api/timeline` returns both. When only Timing shows up, motion detection recording is off in the schedule.
- **Digest auth with `qop=auth`** — DVR requires full `nc`/`cnonce` fields. Plain digest without qop returns "Invalid Authority".

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

## Lessons Learned

- **Write things down every session** — memory doesn't persist without files. Update `memory/YYYY-MM-DD.md` during sessions and distill into MEMORY.md periodically.
- **DVR API research:** The Dahua CGI HTTP API (`configManager.cgi`) works for `getConfig` but `setConfig` with TimeSection values is firmware-dependent. This XVR model silently drops connections rather than returning an error.

---

_Last updated: 2026-04-20_
