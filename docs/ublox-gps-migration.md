# Migration: Starlink GPS → u-blox USB GPS

Replaces the Starlink `device_tracker` as the van's raw GPS source with a u-blox 7
USB receiver (`/dev/ttyACM0` on the HA host), read by a new stdlib-only daemon
(`gps_ublox.py`) that publishes an MQTT `device_tracker`.

**Starlink itself is untouched** — it's still the internet connection. Only the
GPS/location entities moved. Starlink power/network/sleep/throughput sensors stay.

## Entity changes

| Old | New | Notes |
|-----|-----|-------|
| `device_tracker.starlink_device_location` (raw) | `device_tracker.ublox_gps` | new MQTT tracker from `gps_ublox.py` |
| `device_tracker.filtered_starlink_tracker_filtered_starlink_location` (filtered) | `device_tracker.ublox_gps_filtered` | **same entity, renamed — history preserved** (`unique_id` kept) |
| `device_tracker.starlink` (home zone) | `device_tracker.ublox_gps` | home-zone-follows-van automation |

## What's already in the repo (synced via Syncthing → `/config`)

- `www/vanlife-panel/gps_ublox.py` — NEW NMEA→MQTT daemon (stdlib only; publishes
  via HA REST `mqtt.publish`; reuses `/config/.gps_filter_token`).
- `mqtt/device_tracker.yaml` — adds `ublox_gps`; renames filtered tracker (keeps `unique_id`).
- `automations.yaml` — repointed sources/topics, dropped the obsolete Starlink 1 Hz
  refresh, repointed home zone, added `gps_ublox_start_on_boot`.
- `shell_commands.yaml` — `start_gps_ublox` / `restart_gps_ublox` / `restart_gps_filter`.
- `template/triggered.yaml`, dashboards, React dashboard, vanlife panel, docs — repointed.
- `gps_filter.py` (`ENTITY_ID`), `backfill_gps.py` (dynamic metadata lookup).

## Go-live runbook (run on the HA host)

> Prereq: confirm Syncthing pushed the new files, e.g. `ls -la /config/www/vanlife-panel/gps_ublox.py`.

**1. Confirm the GPS is visible to the HA Core container** (the one daemons run in):
```sh
docker exec homeassistant ls -la /dev/ttyACM0
```
If missing, the device isn't mapped into Core — stop and fix mapping before continuing.

**2. Start the daemon and watch it get a fix:**
- Developer Tools → Actions → `shell_command.start_gps_ublox` → Run.
- `tail -f /config/www/vanlife-panel/gps_ublox.log`
- Expect: `streaming NMEA from /dev/ttyACM0 @ <baud> baud`, then quiet (publishing).
  - `valid sentences but no satellite fix yet` → needs sky view; cold start can take minutes.
  - `open failed ... errno 13` → permission; `errno 2` → wrong device path / not mapped.

**3. Load the new HA config:**
- Developer Tools → YAML → reload **Manually configured MQTT entities** (creates
  `device_tracker.ublox_gps`, updates the filtered tracker config).
- Reload **Automations** and **Template** (or just **Restart Home Assistant** to do
  everything; the boot automations will also start the daemons).
- Confirm `device_tracker.ublox_gps` shows latitude/longitude.

**4. Rename the filtered entity (preserves history):**
- Settings → Devices & Services → Entities → find
  `device_tracker.filtered_starlink_tracker_filtered_starlink_location`
  (friendly name "uBlox GPS Filtered" after step 3).
- Change its **Entity ID** to `device_tracker.ublox_gps_filtered`. HA migrates the
  recorder history automatically.

**5. Restart the GPS-filter trip pipeline** so it re-reads the new source entity:
- Developer Tools → Actions → `shell_command.restart_gps_filter` → Run.

**6. Rebuild + deploy the React dashboard** (the `device_tracker.*` strings live in
`src/`; the deployed bundle must be regenerated):
```sh
cd react-dashboard && bash deploy.sh
```

**7. Verify:** Home page coordinates, VanlifeMap live position + trips, weather card,
presence bar, road-grade sensor. Old `device_tracker.starlink_device_location` /
`device_tracker.starlink` still exist (Starlink integration) but are now unused —
optionally disable those two entities to avoid confusion. Do **not** remove the
Starlink integration.
