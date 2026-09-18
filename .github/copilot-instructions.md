# Copilot Instructions — Home Assistant (Olin's Van)

> **Workspace location**: The config is synced bidirectionally to local PCs via
> **Syncthing over Tailscale**. Changes propagate in ~10 seconds.
>
> | Machine | Path | Tailscale IP |
> |---|---|---|
> | **Asylum** (primary desktop) | `C:\Users\Olin\Documents\Workspace\ha_config` | `100.106.30.112` |
> | **Satellite** (laptop) | `C:\Users\Olin Anderson\Documents\Workspace\ha_config` | `100.73.225.9` |
>
> The old SMB network drive (`H:` / `\\homeassistant\config`) still works but is
> slow — prefer editing the local copy.

> **⚠ SYNCTHING CHECK**: Before relying on file sync, **always verify Syncthing is
> running on Windows** (`tasklist | grep -i syncthing`). If not running, start it:
> `start "" "$(where syncthing)" --no-browser`. Also verify after any deploy that
> the file actually arrived on HA (`ssh hassio@100.80.15.86 "grep -c 'UNIQUE_STRING' /config/path/to/file"`).
>
> | Machine | Auto-start? | Notes |
> |---|---|---|
> | **Asylum** | ❌ No | Must launch manually after reboot |
> | **Satellite** | ✅ Yes | Windows Scheduled Task `Syncthing` runs at logon |

---

## Overview

This is a **Home Assistant** instance (version **2025.7.1**) running on a **camper van / RV**
(referred to as "Olin's van"). The system manages all electrical, climate, water, vehicle,
entertainment, and safety subsystems for full-time van life.

### Vehicle

| Spec | Value |
|---|---|
| **Chassis** | 2016 Ford Transit T-350 HD |
| **Engine** | 3.5L EcoBoost V6 (twin-turbo, gasoline) |
| **Body** | High Roof, Extended Length |
| **Fuel tank** | 94.6 L (25 US gal) |
| **Drivetrain** | RWD, 6-speed automatic |
| **Electrical** | 24V LiFePO4 house battery system (separate from 12V chassis) |
| **OBD** | WiCAN Pro (v4.48) at 192.168.10.90; Standard PIDs 01–20 + select 41–60; Ford Mode 22 custom PIDs; **no MAF/MAP/fuel-rate PID** |

---

## System Architecture

### Hardware Platform

| Device | Role | Protocol |
|---|---|---|
| **Simarine A32 Pro** (ESP32-S3) | Primary controller — switches, sensors, MPPT, tank levels, BME280s, S5140 current sensors, DAC outputs | ESPHome via WiFi |
| **AG Pro** (ESPHome) | Roof fan (speed, direction, lid), additional controls | ESPHome via WiFi |
| **WiCAN Pro** (v4.48) | Vehicle OBD2 data — speed, fuel, RPM, coolant, tire pressure, gear, trans temp, etc. | MQTT (native WiCAN MQTT mode → core-mosquitto, IP 192.168.10.90) |
| **Starlink** | Internet + GPS location tracking | Native integration + MQTT filtered tracker. `binary_sensor.starlink_roaming_mode` is disabled (2026-09-16): on HA 2026.4 its missing `alert_roaming` field froze every other Starlink entity at `unavailable` — re-enable once HA has the `data.alert.get("alert_roaming")` fix |
| **Apollo MSR-2** | mmWave radar presence/occupancy sensor | ESPHome |
| **Shelly EM** | AC power monitoring (inverter output voltage, power) | Native integration (ping-based) |
| **Olins Van BMS** | Battery management — SOC, voltage, current, temperature, cycles, stored energy | BLE via `bms_ble` custom component (2.13.0) through the a32-pro Bluetooth proxy — see Bluetooth below |
| **Victron MPPT** (×2) | Solar charge controllers (MPPT1 & MPPT2) — PV power, output voltage/current, yield | BLE via `victron_ble` ESPHome component |
| **Pro Check F317** | Propane tank ultrasonic level sensor | BLE |
| **Lorex D231A41B** | 4-channel 1080p DVR (security cameras) — RTSP streams, H.264 main / H.264 sub | go2rtc (MSE) via dvr_proxy |
| **Kidde HomeSafe** | CO/smoke detection | `kidde_homesafe` custom component |
| **Zigbee2MQTT** | Zigbee device gateway | MQTT bridge |
| **VLC Telnet** | Media player for TTS and audio | Media player integration |
| **OpenAI TTS** | Text-to-speech via GPT-4o-mini-tts | `openai_tts` custom component |

### Network

- Router: **MoFi** at `192.168.10.1` (OpenWrt/LuCI device tracking)
- HA Host SSH: port `22222` on `172.30.32.1` (used for PulseAudio ducking & Scream audio)
- Inverter monitoring: Shelly EM pinging at `192.168.10.174`
- Bluetooth: the BMS is read through the **a32-pro's Bluetooth proxy**. The HA box also has a
  Realtek RTL8761BU USB dongle (`hci1`, 28:F5:2B:3C:C8:00), but its `bluetooth` config entry is
  **disabled** (2026-09-16): it connects to the JBD BMS and never gets a reply, and HA preferred
  it for its stronger signal, which left the BMS `unavailable` for hours after restarts. Don't
  re-enable it without re-testing: with `bleak_retry_connector` / `custom_components.bms_ble` on
  debug, each attempt logs the scanner it used as `'source': '<mac>'`. `bms_ble` 2.13.0 was
  installed by hand on 2026-09-16 (release zip unpacked into `custom_components/bms_ble`; 1.10.0
  kept in `/config/.bms_ble_backup/`). HACS does not track it, so updates are manual too: 2.13.0
  is the newest release for HA 2026.4, 2.14+ needs HA 2026.6. After the upgrade + restart the BMS
  was back 10 s after the API, through the proxy.
- Remote access: **Tailscale** VPN — the config share is `\\homeassistant\config`

---

## Syncthing — Bidirectional Config Sync

The HA config folder (`/config` on the HA host) is synced bidirectionally to local
PCs via **Syncthing** over **Tailscale**. This replaces the slow SMB network drive
(`H:\`) for day-to-day editing.

### Architecture

```
                              Tailscale VPN
┌──────────────────────┐                        ┌──────────────────────┐
│   Home Assistant     │◄── tcp://:22000 ──────►│   Asylum (desktop)   │
│   (HA host)          │    Syncthing v2.0.15   │   100.106.30.112     │
│                      │                        │                      │
│  /config/            │   bidirectional sync   │  C:\Users\Olin\      │
│  (source of truth)   │   ~10 second latency   │  ...\ha_config\      │
│                      │                        │                      │
│  Device: HomeAssist  │                        │  Device: Asylum      │
│  ant (7EM6772...)    │                        │  (BXJLBZS...)        │
│                      │                        └──────────────────────┘
│  Binary:             │
│  /config/.ha-sync/   │                        ┌──────────────────────┐
│    syncthing         │◄── tcp://:22000 ──────►│   Satellite (laptop) │
│                      │    Syncthing v2.0.16   │   100.73.225.9       │
│  100.80.15.86        │                        │                      │
│                      │   bidirectional sync   │  C:\Users\Olin       │
│                      │   ~10 second latency   │  Anderson\...\       │
│                      │                        │  ha_config\          │
│                      │                        │                      │
│                      │                        │  Device: Satellite   │
│                      │                        │  (5JDDCUI...)        │
└──────────────────────┘                        └──────────────────────┘
```

### Key Details

| Setting | Value |
|---|---|
| **Folder ID** | `ha-config` (must match on all devices) |
| **HA folder path** | `/config` |
| **HA Syncthing binary** | `/config/.ha-sync/syncthing` |
| **HA Syncthing config** | `/config/.ha-sync/st-config/` |
| **HA Syncthing log** | `/config/.ha-sync/syncthing.log` |
| **HA Device ID** | `7EM6772-22RZNMH-NLCQWWI-OTUCSJH-Y54DBRJ-4NYEJKH-UP3AWSM-GAFM3AT` |
| **HA Tailscale IP** | `100.80.15.86` |
| **HA listen port** | `22000` (TCP) |
| **HA GUI** | `http://100.80.15.86:8384` (no auth, Tailscale-only) |
| **Sync interval** | ~10 seconds (filesystem watcher + 10s debounce) |
| **Full rescan** | Every 60 minutes |
| **Discovery** | Local only — no global discovery, no relays, no NAT |
| **Auto-start** | HA automation `syncthing_start_on_boot` (30s delay after HA start) |
| **Shell command** | `shell_command.start_syncthing` (idempotent, checks if already running) |
| **Asylum Device ID** | `BXJLBZS-5F3ZA2B-JQYWTXD-JRG3GGQ-ZRBMFYG-FLSAW4M-R32QUTJ-KMOQLQH` |
| **Asylum Tailscale IP** | `100.106.30.112` |
| **Satellite Device ID** | `5JDDCUI-QJHPR4P-4LNMWYV-CV7SNL6-BS27DX7-DHOKHZW-CGFIQN7-XFK5QQ6` |
| **Satellite Tailscale IP** | `100.73.225.9` |
| **Satellite auto-start** | Windows Scheduled Task `Syncthing` (runs at logon) |

### `.stignore` (synced files are filtered)

Both sides use matching `.stignore` files that exclude:
- Database files (`home-assistant_v2.db*`, `home-assistant.log*`)
- Runtime/cache (`.cloud`, `.storage`, `deps`, `tts`, `__pycache__`)
- Secrets (`secrets.yaml`, `ssh_keys`)
- HACS-managed (`custom_components`, `themes`)
- Blueprints, `www/`, `zigbee2mqtt/`
- Syncthing internals (`.ha-sync`, `.stfolder`, `.stversions`)
- Git (`.git`), OS junk, temp files

### SSH Access to HA

| Setting | Value |
|---|---|
| **Command** | `ssh -i ~/.ssh/id_ed25519 hassio@100.80.15.86` |
| **Port** | 22 (default) |
| **User** | `hassio` |
| **Key** | `~/.ssh/id_ed25519` (ed25519) |
| **Root access** | `sudo` works without password |
| **OS** | Alpine Linux v3.23 (HAOS), x86_64 |
| **Shell** | zsh |

### HA Web UI Login

Credentials are stored in `.ha_login` (JSON, git-ignored). When using browser tools
to interact with the HA frontend, read this file to get the username and password for
the login form. The file is at the workspace root: `<workspace>/.ha_login`.

### Setting Up a New Computer (Laptop, etc.)

To add another PC to the Syncthing mesh:

1. **Install Syncthing** on the new machine:
   ```bash
   # Windows (winget)
   winget install Syncthing.Syncthing

   # macOS (Homebrew)
   brew install syncthing

   # Linux
   sudo apt install syncthing   # or equivalent
   ```

2. **Start Syncthing** and open the web UI (`http://127.0.0.1:8384/`).

3. **Note the new device's Device ID** from the web UI (Actions → Show ID).

4. **Configure the new device — disable public infrastructure**:
   - Settings → Connections: uncheck "Global Discovery", "Enable Relaying", "Enable NAT Traversal"
   - Keep "Local Discovery" enabled

5. **Add the HA device on the new machine**:
   - Add Remote Device → paste HA Device ID: `7EM6772-22RZNMH-NLCQWWI-OTUCSJH-Y54DBRJ-4NYEJKH-UP3AWSM-GAFM3AT`
   - Set address to `tcp://100.80.15.86:22000` (HA's Tailscale IP)
   - Name it `HomeAssistant`

6. **Add the new device on HA's Syncthing** (via HA GUI at `http://100.80.15.86:8384`):
   - Add Remote Device → paste the new machine's Device ID
   - Set address to the new machine's Tailscale IP: `tcp://<tailscale-ip>:22000`

7. **Share the folder**:
   - On the new machine: when HA proposes sharing `ha-config`, accept it
   - Set the local folder path (e.g. `C:\Users\You\Workspace\ha_config` or `~/workspace/ha_config`)
   - Enable "Ignore Permissions"
   - OR: manually add folder with ID `ha-config`, share with HA device

8. **Create `.stignore`** in the new local folder (copy from the existing PC or HA).

9. **Verify**: files should sync within ~10 seconds. Check `http://127.0.0.1:8384/` for connection status.

10. **Git**: `git init && git remote add origin https://github.com/olinanderson/ha-config.git && git fetch origin main && git reset origin/main && git branch -M main && git branch --set-upstream-to=origin/main`

### Git + Syncthing Workflow

Syncthing updates files but not git history. When another machine pushes commits and
Syncthing delivers the file changes, the receiving machine sees "uncommitted changes"
even though the files match the remote. Use the `git sync` alias to reconcile:

```bash
git sync    # alias for: git fetch origin && git reset origin/main
```

This moves the branch pointer to match remote without touching files. Since Syncthing
already updated the files, `git status` will come back clean.

**Setup** (one-time per clone — already configured on Asylum and Satellite):
```bash
git config alias.sync '!f() { git fetch origin && git reset origin/main; }; f'
```

**Typical flow:**
1. **Asylum**: edit → `git commit` → `git push` → Syncthing propagates files to HA → HA to Satellite
2. **Satellite**: `git sync` → branch pointer catches up, working tree is clean

### Troubleshooting

- **HA Syncthing not running?** SSH in: `sudo pgrep -f "syncthing serve"`. If not running:
  `sudo sh -c 'nohup /config/.ha-sync/syncthing serve --home=/config/.ha-sync/st-config --no-browser --no-upgrade > /config/.ha-sync/syncthing.log 2>&1 &'`
- **Connection refused?** Ensure both machines are on Tailscale and port 22000 is not firewalled.
- **Files not syncing?** Check `.stignore` — files matching ignore patterns won't sync.
- **Conflict files?** Syncthing creates `.sync-conflict-*` files. Resolve manually and delete the conflict copy.
- **HA GUI**: `http://100.80.15.86:8384` — check folder status, connected devices, errors.
- **Windows GUI**: `http://127.0.0.1:8384/` — same.
- **Logs**: HA: `sudo tail -50 /config/.ha-sync/syncthing.log`. Windows: `%LOCALAPPDATA%\Syncthing\syncthing.log`.

---

## File Structure

```
config/
## File Structure (Refactored)

```
config/
# --- Main config (lean ~70 lines with !include directives) ---
configuration.yaml              # Main config (use configuration_new.yaml as source of truth)
configuration_new.yaml          # CLEAN refactored config — swap into configuration.yaml

# --- Include files (split from configuration.yaml) ---
input_boolean.yaml              # 7 input booleans (speedtest, shore power, modes, etc.)
input_number.yaml               # 4 input numbers (light warmth, thresholds, etc.)
input_text.yaml                 # 2 input texts (previous fuel/speed)
template/                       # Template sensors & binary sensors
  triggered.yaml                # Trigger-based: road grade, stable fuel level
  sensors.yaml                  # Regular: power, propane, solar, vehicle, starlink, etc.
  binary_sensors.yaml           # Vehicle moving, engine running, inverter on
mqtt/                           # MQTT sensors & device tracker
  sensors.yaml                  # WiCAN raw debug + parsed sensors
  binary_sensors.yaml           # WiCAN connected binary sensor
  device_tracker.yaml           # Filtered Starlink GPS tracker
integrations/                   # Platform-based sensors
  sensor.yaml                   # Riemann sum energy, statistics, history_stats

# --- Automations & scripts (not yet split — future refactor) ---
automations.yaml                # All automations (~750 lines)
scripts.yaml                    # Named scripts (~467 lines)

# --- Other config files ---
conversations.yaml              # Voice assistant intent sentence patterns
intent_scripts.yaml             # Intent handler actions
scenes.yaml                     # (empty)
shell_commands.yaml             # SSH commands for PulseAudio & Scream
secrets.yaml                    # NEVER edit via Copilot
lovelace_resources.yaml         # Frontend card resources (mushroom, apexcharts, etc.)

# --- Dashboards ---
dashboards/
  old_home_new.yaml             # ACTIVE rewritten Home dashboard (YAML mode, 704 lines)
  Home.yaml                     # Original export of storage-mode Home dashboard
  old_home.yaml                 # CORRUPTED — do not use
  (other dashboards)            # Still in storage mode (.storage/lovelace.*)

# --- Backups ---
yaml_backups/                   # Full backups of all original YAML files
  README.md                     # Backup index
  configuration.yaml            # Original monolithic 877-line config
  automations.yaml
  scripts.yaml
  conversations.yaml
  intent_scripts.yaml
  shell_commands.yaml

# --- Other directories ---
esphome/                        # ESPHome device configs
custom_components/              # HACS / custom integrations (DO NOT hand-edit)
  vanlife_tracker/              # Custom: stop detection, geocoding, Traccar
themes/mushroom/                # Mushroom UI theme
www/                            # Static web assets (NOT synced via Syncthing)
  vanlife-panel/                # Vanlife tracker panel
    index.html                  # Panel UI (~2700 lines, Leaflet map + trips + places)
    osrm_proxy.py               # CORS proxy + API server (port 8765)
    gps_filter.py               # GPS filter daemon (background, incremental mode)
    backfill_gps.py             # One-shot historical GPS backfill
    filtered_gps.db             # SQLite DB (segments, parking, named_places)
    panel.js                    # Panel loader
zigbee2mqtt/                    # Zigbee2MQTT config
.storage/                       # HA storage (dashboards, registries, etc.)
.github/
  copilot-instructions.md       # THIS FILE
  dashboard-editing-reference.md

# --- Syncthing (bidirectional sync) ---
.ha-sync/                       # Syncthing binary + config (NOT synced, NOT in git)
  syncthing                     # Syncthing v2.0.15 Linux binary
  st-config/                    # Syncthing config, keys, index DB
  syncthing.log                 # Runtime log
.stignore                       # Syncthing ignore patterns
.stfolder/                      # Syncthing folder marker (empty)
```

---

## Known Entity IDs (Real)

> **CRITICAL**: The placeholder dashboards (`climate_control.yaml`, `power_energy.yaml`,
> etc.) were auto-generated with **fabricated entity IDs** like `sensor.a32_battery_voltage`.
> Those do **NOT** exist. Always use the real IDs below when creating or editing dashboards.

### Battery / BMS
| Entity | Description |
|---|---|
| `sensor.olins_van_bms_battery` | Battery SOC (0–100%) |
| `sensor.olins_van_bms_voltage` | Battery voltage (24V system) |
| `sensor.olins_van_bms_current` | Battery current (A; + = charging, − = discharging) |
| `sensor.olins_van_bms_power` | Battery power (W; + = charging, − = discharging) |
| `sensor.olins_van_bms_stored_energy` | Stored energy (Wh) — full capacity ≈ 8700 Wh |
| `sensor.olins_van_bms_temperature` | Battery temperature |
| `sensor.olins_van_bms_cycles` | Battery cycle count |
| `sensor.olins_van_bms_delta_voltage` | Cell delta voltage |
| `sensor.battery_charging` | Template: W charging (0 when discharging) |
| `sensor.battery_discharging` | Template: W discharging (0 when charging) |

### Solar / MPPT
| Entity | Description |
|---|---|
| `sensor.a32_pro_mppt1_pv_power` | MPPT1 PV input power (W) |
| `sensor.a32_pro_mppt2_pv_power` | MPPT2 PV input power (W) |
| `sensor.a32_pro_mppt1_output_voltage` | MPPT1 output voltage |
| `sensor.a32_pro_mppt1_output_current` | MPPT1 output current |
| `sensor.a32_pro_mppt2_output_voltage` | MPPT2 output voltage |
| `sensor.a32_pro_mppt2_output_current` | MPPT2 output current |
| `sensor.a32_pro_mppt1_yield_today` | MPPT1 daily yield (kWh) |
| `sensor.a32_pro_mppt2_yield_today` | MPPT2 daily yield (kWh) |
| `sensor.total_mppt_pv_power` | Template: combined PV power (W) |
| `sensor.average_mppt_output_voltage` | Template: avg MPPT output voltage |
| `sensor.total_mppt_output_current` | Template: combined MPPT output current |
| `sensor.total_mppt_yield_today` | Template: combined daily yield (Wh) |

### 12V System
| Entity | Description |
|---|---|
| `sensor.a32_pro_smart_battery_sense_12v_voltage` | 12V rail (24V→12V converter output) |

### Temperature / Humidity (BME280 × 4)
| Entity | Location |
|---|---|
| `sensor.a32_pro_bme280_1_temperature` / `_relative_humidity` | Living area |
| `sensor.a32_pro_bme280_2_temperature` / `_relative_humidity` | Cab |
| `sensor.a32_pro_bme280_3_temperature` / `_relative_humidity` | Shower |
| `sensor.a32_pro_bme280_4_temperature` / `_relative_humidity` | Outdoor |

### Current Sensors (S5140 channels → template power sensors)
| Channel Entity | Power Template | What |
|---|---|---|
| `sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning` | `sensor.air_conditioning_power_24v` | A/C |
| `sensor.a32_pro_s5140_channel_5_current_24v_24v_devices` | `sensor.all_24v_devices_power_24v` | 24V loads |
| `sensor.a32_pro_s5140_channel_6_current_24v_12v_devices` | `sensor.all_12v_devices_power_24v` | 12V loads |
| `sensor.a32_pro_s5140_channel_7_current_24v_inverter` | `sensor.inverter_power_24v` | Inverter |
| `sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger` | `sensor.alternator_charger_power_24v` | Alt charger |
| `sensor.a32_pro_s5140_channel_13_current_12v_battery_heater` | `sensor.battery_heater_power_12v` | Batt heater |
| `sensor.a32_pro_s5140_channel_14_current_12v_roof_fan` | `sensor.roof_fan_power_12v` | Roof fan |
| `sensor.a32_pro_s5140_channel_15_current_24v_bed_motor` | `sensor.bed_motor_power_24v` | Bed motor |
| `sensor.a32_pro_s5140_channel_16_current_24v_shore_power_charger` | `sensor.shore_power_charger_power_24v` | Shore charger |
| `sensor.a32_pro_s5140_channel_34_temperature_blower_coolant` | — | Blower coolant temp |
| `sensor.a32_pro_s5140_channel_35_temperature_blower_air` | — | Blower air temp |

### Energy Sensors (Riemann integration, Wh)
Pattern: `sensor.*_energy_wh` — one for each power sensor above, plus `sensor.mppt1_energy_wh` and `sensor.mppt2_energy_wh`.

### Water System
| Entity | Description |
|---|---|
| `sensor.a32_pro_fresh_water_tank_level` | Fresh water (%) |
| `sensor.a32_pro_grey_water_tank_level` | Grey water (%) |
| `switch.a32_pro_water_system_master_switch` | Water master on/off |
| `switch.a32_pro_water_system_state_main` | Water mode: main |
| `switch.a32_pro_water_system_state_recirculating_shower` | Water mode: recirc shower |
| `switch.a32_pro_switch06_grey_water_tank_valve` | Grey water dump valve |

### Climate / Heating
| Entity | Description |
|---|---|
| `climate.a32_pro_van_hydronic_heating_pid` | PID thermostat |
| `switch.a32_pro_switch24_hydronic_heater` | Hydronic heater relay |
| `switch.a32_pro_switch32_hydronic_heater_power_supply` | Heater standby supply — Switch24 refuses to turn on while this is off (see docs/heating.md) |
| `sensor.a32_pro_hydronic_heater_status` | Heater status text (retry state, fuel lockout, cooldown) |
| `sensor.a32_pro_coolant_blower_heating_pid_climate_result` | PID output (0–1) |
| `light.a32_pro_a32_pro_dac_0` | Blower matrix (DAC fan speed as light entity) |
| `switch.a32_pro_fan_override_manual_on_off` | Fan manual override |
| `input_boolean.hot_water_mode` | Hot water mode — keeps heater running when climate is OFF |
| `input_boolean.heater_low_fuel_lockout` | Low fuel lockout — blocks heater when fuel < 25% after failed retry |

### Roof fan IR protocol (decoded 2026-09-17)

Every remote press sends one 16-byte packet: 1200-baud serial, 8 data bits LSB first, one stop bit plus
one idle bit, on a 38 kHz carrier with carrier ON = logic 0.

```
5A A5 80 7F 40 BF 20 DF 10 CC | flags | speed % | set point °F | FF 23 | XOR of bytes 0..12
flags: bit0 power, bit1 ceiling-fan mode, bit2 air out (exhaust), bit3 lid open, bit4 thermostat (auto)
```

The Pronto scripts in `esphome/a8-pro.yaml` are exactly these packets (speed 10–100 %, whatever set point
the remote held when they were captured). `roof_fan_send_frame` builds any packet on the AG Pro, which is
how the thermostat set point (29–99 °F, the fan's own unit) is sent without capturing 142 frames. Entities:
`switch.ag_pro_roof_fan_thermostat`, `number.ag_pro_roof_fan_thermostat_set_point`; action
`esphome.ag_pro_roof_fan_thermostat` (`temp_f`, `exhaust`, `speed_pct`) does lid + direction + speed + set
point in one frame. Verified 2026-09-17: bit2 clear showed "air in" on the fan; an auto frame does not start
a stopped motor, but a running fan stays on under one and then cycles by itself (stopped within 15 s of a
90 °F set point, restarted within 15 s of 60 °F), so the switch's turn-on sends a manual start frame first
when the fan is off (lid frame if shut, manual frame, 3 s, auto frame). Any manual fan command, and the
lid-closed frame, end thermostat mode (their packets have the auto bit clear), and the firmware publishes
the switch off when it sends them. Capture: stream
`esphome logs esphome/a8-pro.yaml --device 192.168.10.61` (the receiver on GPIO23 dumps Pronto) and decode
with the 1200-baud rule above.

### Roof Fan
| Entity | Description |
|---|---|
| `fan.ag_pro_roof_fan` | Fan — speed %, direction (forward=exhaust, reverse=intake) |
| `cover.ag_pro_roof_fan_lid` | Roof hatch open/close |
| `sensor.roof_fan_direction` | Template: "Exhaust" / "Intake" / "Unknown" |

### Lighting (4 LED controllers + 3 physical switches linked via blueprints)
| Entity | Zone |
|---|---|
| `light.led_controller_cct_1` | Main / roof hatch (CCT, dimmable, color_temp) |
| `light.led_controller_cct_2` | Under-cabinet (CCT, dimmable) |
| `light.led_controller_sc_1` | Shower (single color, dimmable) |
| `light.led_controller_sc_2` | Accent / other (single color, dimmable) |
| `light.main_lighting_switch` | Physical switch → linked to `cct_1` |
| `light.under_cabinet_lighting_switch` | Physical switch → linked to `cct_2` |
| `light.shower_lighting_switch` | Physical switch → linked to `sc_1` |

### Sundown dimming (indoor lights)
Indoor lights get a bit dimmer at sundown and a bit more once it's dark, then reset in the morning.

| Entity | Description |
|---|---|
| `sensor.indoor_light_phase` | Template (`template/lighting.yaml`): `day` (sun up) / `twilight` (sun below the horizon, above −6°) / `dark` (below −6°). Attr `max_brightness_pct` = the ceiling in force. `sun.sun` follows the Starlink-tracked home zone, so this is local wherever the van is |
| `input_boolean.indoor_light_sun_dimming` | Master enable (no `initial:`, restores across restarts) |
| `input_number.indoor_light_sundown_pct` | Ceiling during twilight (seeded 70 %) |
| `input_number.indoor_light_dark_pct` | Ceiling after dark (seeded 40 %) |

- `indoor_lights_sundown_dim` — at the evening edges (day→twilight, twilight→dark), lights already on step down to the new ceiling in 12 × 10 s steps. Small steps instead of one long transition because "Main Lighting: Sync" re-sends the switch level with no transition, which cuts a long fade short. A light turned up by hand mid-fade is left alone. Nothing brightens at dawn.
- `indoor_lights_sundown_turn_on_level` — a light switched on (off→on, any source) during twilight/dark is capped at the ceiling. The first switch-on after sunrise of a light still sitting at one of the ceilings goes back to 100 %; a level picked by hand is left alone.
- Hands off: shower light while Shower Mode is on, cabinet light while the LPG valve is open (Cook Mode), all lights during Sleep Mode's wind-down and for 2 min after Sleep Mode turns off (wake-up restore).
- Only the LED controllers are commanded; the Inovelli switches follow via the Linked Entities blueprint.

### Switches / Controls
| Entity | Description |
|---|---|
| `switch.a32_pro_do8_switch04_shore_power_charger` | Shore charger relay |
| `switch.a32_pro_do8_switch06_top_monitor` | Top monitor |
| `switch.a32_pro_do8_switch07_bottom_monitor` | Bottom monitor |
| `switch.a32_pro_switch16_lpg_valve` | LPG / propane gas valve |
| `switch.a32_pro_switch27_bed_power_supply` | Bed lift power (auto-off 30s) |
| `button.a32_pro_inverter_on_off_toggle` | Inverter toggle (momentary) |
| `binary_sensor.192_168_10_174` | Shelly EM ping → inverter AC is live |

### a32-Pro rocker expander fault guard (DI33–40)
DI33–DI40 (outdoor-light rockers, heater rocker, grey-water valve, LPG valve, bed power,
bed down) sit on a PCF8574 at I²C 0x23 — a 1-bit address neighbour of both XL9535
relay chips (0x21/0x22). Twice (2026-09-04, 2026-09-14) it read "all eight pressed"
in one instant and stayed there until a reset: LPG + grey-water valves opened, the bed
drove down, the heater toggled, and the rockers went dead (a stuck-pressed rocker can't
press again). Both a failed I²C read and a latch corrupted low read back as all-LOW =
all pressed; the 32 XL9535 inputs were fine both times. The firmware treats ≥ 5
simultaneous inputs as a fault (`a32::pcf_active_count` in `esphome/a32_helpers.h`):
the DI33–40 handlers ignore the presses, and a 1 s monitor rewrites the chip's port
after 2 s (what a reboot's setup does) and restarts the board after 10 s — never within
10 min of boot. `binary_sensor.a32_pro_di33_40_expander_fault` and
`sensor.a32_pro_di33_40_expander_faults` show it in HA. If the counter keeps climbing,
next knobs are the I²C clock (400 kHz in `i2c:`) and the chip's address jumpers.

### Fuel prices (GasBuddy, HACS `firstof9/ha-gasbuddy`)
One hub + one *cheapest* station subentry (regular, credit price, no postal code → HA's
home coordinates, which follow the van). Sensors are CAD/L; cost templates in
`template/sensors.yaml` multiply them by the trip tracker's litres.
| Entity | Description |
|---|---|
| `sensor.cheapest_regular_nearby_regular_gas` | Cheapest regular near the van (CAD/L; station_id/address attrs) |
| `sensor.live_trip_fuel_cost` | This trip's fuel (moving + idle) × price |
| `sensor.highway_fuel_cost_per_100km` / `sensor.city_fuel_cost_per_100km` | Lifetime economy × price |
| `sensor.fill_up_cost` | Fill the 94.6 L tank from `sensor.stable_fuel_level` |

### Vehicle / OBD — WiCAN Pro via MQTT

The WiCAN Pro connects via **MQTT** to `core-mosquitto` (192.168.10.173:1883). Entities are
created by **MQTT discovery** (retained configs under `homeassistant/sensor/wican_pro/`).
Entity IDs follow the pattern `sensor.192_168_10_90_*` (preserved from the old ha-wican
integration for backward compatibility). The old `ha-wican` HACS integration has been removed.

**WiCAN MQTT topics**: Each PID publishes to its own topic (e.g. `wican/EngineRPM`,
`wican/GEAR`, `wican/TYRE_P_FL`). Payloads are JSON with a single key-value pair
(e.g. `{"0C-EngineRPM": 1826}`). The discovery `value_template` is
`{{ value_json.values() | first }}`.

> **⚠ WiCAN CONFIG SAFETY**: The WiCAN `/store_config` HTTP endpoint **replaces ALL
> settings at once** — including WiFi SSID/password/mode. If you POST only MQTT fields,
> it **wipes WiFi settings** and the device reverts to AP-only mode, dropping off the
> network. **NEVER send a partial config.** Always `GET /get_config` first, modify only
> the needed fields in the full JSON, then POST the complete config back. This caused an
> outage on 2026-04-19.
>
> **Note**: `/get_config` and `/api/get_config` both return 404 on firmware v4.48. The
> only way to read or change config is via the WiCAN web UI at `http://192.168.10.90`.
> Use browser automation (Playwright) for scripted changes.
>
> **Required fields in any `/store_config` POST** (must ALL be present):
> - `wifi_mode`: `"STA+AP"` — Station + AP mode. Never set to `"AP"` alone or device drops off network.
> - `ssid`: `"Olins Van 2.4G"` — WiFi SSID
> - `password`: `"OlinsVanWifiIsFast"` — WiFi password
> - `wifi_security`: `"WPA2"` — security type
> - `ap_ssid`: `"WiCAN_48ca43343365"` — AP SSID
> - `ap_password`: `"wican1234"` — AP password
> - `mqtt_en`: `"enable"`
> - `mqtt_url`: `"mqtt://192.168.10.173"` — core-mosquitto broker IP
> - `mqtt_port`: `1883`
> - `mqtt_user`: `"mqtt_user"`
> - `mqtt_pass`: `"mqtt_password"`
> - `mqtt_rx_en`: `"disable"` — raw incoming CAN frames; keep disabled or broker floods
> - `mqtt_tx_en`: `"disable"`
> - `webhook_en`: `"disable"` — old ha-wican webhook mode; keep disabled
> - `protocol`: `"AutoPID"` — enables OBD PID polling mode

**Standard OBD PIDs (Mode 01):**
| Entity | PID | Description |
|---|---|---|
| `sensor.192_168_10_90_01_monitorstatus` | 0x01 | Monitor status (MIL bit 7, DTC count bits 0-6) |
| `sensor.192_168_10_90_04_calcengineload` | 0x04 | Calculated engine load (%) |
| `sensor.192_168_10_90_05_enginecoolanttemp` | 0x05 | Engine coolant temp (°C) |
| `sensor.192_168_10_90_0c_enginerpm` | 0x0C | Engine RPM |
| `sensor.192_168_10_90_0d_vehiclespeed` | 0x0D | Vehicle speed (km/h) |
| `sensor.192_168_10_90_0f_intakeairtemperature` | 0x0F | Intake air temp (°C) |
| `sensor.192_168_10_90_11_throttleposition` | 0x11 | Throttle position (%) |
| `sensor.192_168_10_90_1f_timesinceengstart` | 0x1F | Time since engine start (seconds) |
| `sensor.192_168_10_90_2f_fueltanklevel` | 0x2F | Fuel tank level (%) — raw, noisy |
| `sensor.192_168_10_90_42_controlmodulevolt` | 0x42 | ECU/control module voltage (V) |
| `sensor.192_168_10_90_46_ambientairtemp` | 0x46 | Ambient air temp (°C) |

**Ford Mode 22 Custom PIDs (via WiCAN Automate tab):**
| Entity | Description |
|---|---|
| `sensor.192_168_10_90_tyre_p_fl` | Front-left tire pressure (kPa) — raw; divide by ~2 for actual psi |
| `sensor.192_168_10_90_tyre_p_fr` | Front-right tire pressure (kPa) — raw; divide by ~2 for actual psi |
| `sensor.192_168_10_90_tyre_p_rl` | Rear-left tire pressure (kPa) — raw; divide by ~2 for actual psi |
| `sensor.192_168_10_90_tyre_p_rr` | Rear-right tire pressure (kPa) — raw; divide by ~2 for actual psi |
| `sensor.192_168_10_90_tran_f_temp` | Transmission fluid temp (°C) |
| `sensor.192_168_10_90_gear` | Current gear (raw int: 0=P, 15=N, 255=R, 1-6=gear) |
| `sensor.192_168_10_90_oil_life` | Engine oil life remaining (%) |
| `sensor.192_168_10_90_wastegate` | Turbo wastegate position (%) |
| `sensor.192_168_10_90_intake_air_tmp` | Intake air temp (°C) — Mode 22 |
| `sensor.192_168_10_90_intake_air_temp_2` | Intake air temp #2 (°C) |
| `sensor.192_168_10_90_fuel_pressure` | Fuel rail pressure (kPa) |
| `sensor.192_168_10_90_fuel_pump_duty` | Fuel pump duty cycle (%) |
| `sensor.192_168_10_90_fuel_sys_stat` | Fuel system status (raw int) |
| `sensor.192_168_10_90_coolant_tmp` | Coolant temp (°C) — Mode 22 (duplicate of 0x05) |
| `sensor.192_168_10_90_park_brake` | Parking brake (0=off, 1=on) |

**User Custom PIDs (via WiCAN Automate → User Custom tab):**
| Entity | PID | Expression | Description |
|---|---|---|---|
| `sensor.192_168_10_90_map` | `22F404` | `[B4:B5]/256` | Manifold Absolute Pressure (kPa) — Ford Mode 22; enables speed-density fuel calculation |
| `sensor.192_168_10_90_stft_b1` | `0x06` | standard | Short-term fuel trim Bank 1 (%) |
| `sensor.192_168_10_90_ltft_b1` | `0x07` | standard | Long-term fuel trim Bank 1 (%) |
| `sensor.192_168_10_90_stft_b2` | `0x08` | standard | Short-term fuel trim Bank 2 (%) |
| `sensor.192_168_10_90_ltft_b2` | `0x09` | standard | Long-term fuel trim Bank 2 (%) |
| `sensor.192_168_10_90_lambda` | `0x44` | standard | Commanded equivalence ratio (lambda); 1.0 = stoich, <1 = rich, >1 = lean |
| `sensor.192_168_10_90_inj_pw` | `22F44A` | `[B4:B5]` | Injector pulse width Bank 1 (raw µs; divide by 1000 for ms). Idle ~5000–6000 |

**NOT supported by this ECU** (tested, returns "no positive response" or "NO DATA"):
- `FUEL_RATE` (Mode 22, PID 22F49D) — fuel consumption rate
- `ALT_DUTY` (Mode 22) — alternator duty cycle
- Standard PID 0x10 (MAF) — not exposed by Ford PCM (speed-density engine)
- Standard PID 0x0B (MAP) — not exposed via standard OBD (but Ford Mode 22 `22F404` **works**)
- Standard PID 0x5E (Engine Fuel Rate) — NO DATA
- Ford Mode 22 MAF (`22F410`) — no positive response
- Ford Mode 22 IPW Bank 2 (`22F44B`) — no positive response (V6 uses shared injection timing)
- Ford Mode 22 Barometric Pressure (`22F402`) — no positive response

**WiCAN device entities (MQTT discovery):**
| Entity | Description |
|---|---|
| `binary_sensor.meatpi_pro_ecu_status` | WiCAN connected to ECU — based on `wican/status` topic; **unreliable** (reports "offline" even while publishing PID data). Use RPM freshness instead. |

### Vehicle Computed Sensors (templates)
| Entity | Description |
|---|---|
| `sensor.wican_fuel_5_min_mean` | Statistics: 5-min rolling mean fuel (source: native fuel PID) |
| `sensor.stable_fuel_level` | Template: sticky fuel (updates only when vehicle stable) |
| `sensor.trans_temp_last_good` | Sticky last-known-good transmission temp |
| `sensor.gear_display` | Gear as text: Park/Reverse/Neutral/1-6 |
| `sensor.tire_pressure_min` | Min tire pressure across all 4 (psi, with kPa÷2 correction) |
| `sensor.dtc_count` | Number of active DTCs (from PID 0x01) |
| `sensor.estimated_fuel_rate` | Speed-density fuel rate (L/h) — MAP × RPM × IAT × VE with 3 corrections: RPM-based VE curve, fuel trim avg, lambda AFR. Attributes: map_kpa, ve_base, rpm, ve_effective, fuel_trim_avg, lambda |
| `sensor.estimated_fuel_consumption` | Fuel economy (L/100km) — only when speed > 5 km/h |
| `sensor.injector_pulse_width` | Injector pulse width (ms) — raw WiCAN µs ÷ 1000. Idle ~5 ms |
| `sensor.average_fuel_trim` | Averaged fuel trim across both banks: (STFT+LTFT B1 + STFT+LTFT B2) / 2. Attributes: per-bank breakdowns |
| `sensor.commanded_afr` | Commanded air-fuel ratio (14.7 × lambda). Falls back to 14.7 if lambda unavailable |
| `binary_sensor.check_engine_light` | MIL/CEL on/off (from PID 0x01 bit 7 ≥ 128) |
| `binary_sensor.low_tire_pressure` | Any tire < 35 psi (has fl/fr/rl/rr_psi attributes) |

### Vehicle Movement (template binary_sensors)
| Entity | Description |
|---|---|
| `binary_sensor.vehicle_is_moving` | speed > threshold AND engine running |
| `binary_sensor.vehicle_is_stable` | acceleration ≤ threshold |
| `binary_sensor.engine_is_running` | RPM > 0 (from native WiCAN PID 0x0C) |

### GPS / Location
| Entity | Description |
|---|---|
| `device_tracker.ublox_gps` | Raw u-blox USB GPS (also used for home zone) |
| `device_tracker.ublox_gps_filtered` | MQTT filtered GPS (1Hz while moving) |
| `device_tracker.olin_andersons_iphone_16_pro_max` | iPhone location |

### Road Grade (template sensors from Starlink GPS)
| Entity | Description |
|---|---|
| `sensor.road_grade_deg` | Grade in degrees (EMA smoothed) |
| `sensor.road_grade_percent` | Grade in % |
| `sensor.hill_aggression` | "Flat" / "Gentle up" / "Moderate down" / "Steep" etc. |

### Propane
| Entity | Description |
|---|---|
| `sensor.pro_check_f317_tank_level` | Raw ultrasonic distance (mm) |
| `sensor.propane_tank_percentage` | Template: calculated % (hemisphere+cylinder, 80% fill) |
| `sensor.propane_raw_distance` | Template: raw mm |
| `sensor.propane_liquid_depth` | Template: liquid depth mm |
| `sensor.propane_liquid_volume` | Template: liquid volume (L) |

### "Last good" fallback sensors
| Entity | Description |
|---|---|
| `sensor.ambient_air_temp_last_good` | Sticky last-good OBD ambient temp |
| `sensor.coolant_temp_last_good` | Sticky last-good coolant temp |
| `sensor.road_grade_percent_last` | Sticky last-good road grade % |
| `sensor.trans_temp_last_good` | Sticky last-good transmission temp |

### Security Cameras (Lorex DVR)
| Entity | Description |
|---|---|
| `camera.channel_1` | DVR channel 1 (generic camera, RTSP via go2rtc) |
| `camera.channel_2` | DVR channel 2 |
| `camera.channel_3` | DVR channel 3 |
| `camera.channel_4` | DVR channel 4 |

### Presence / Occupancy
| Entity | Description |
|---|---|
| `binary_sensor.apollo_msr_2_1731d8_radar_target` | Apollo mmWave radar |

### Weather
| Entity | Description |
|---|---|
| `weather.pirateweather` | PirateWeather forecast |

### Internet / Connectivity
| Entity | Description |
|---|---|
| `sensor.starlink_downlink_throughput` | Raw downlink (bps) |
| `sensor.starlink_downlink_throughput_mbps` | Template: Mbps |
| `sensor.starlink_uplink_throughput_mbps` | Template: Mbps |
| `sensor.speedtest_download` / `_upload` / `_ping` | Speedtest results |
| `binary_sensor.starlink_ethernet_speeds` | off = OK, on = issues |

### Hydronic Heater Stats
| Entity | Description |
|---|---|
| `sensor.hydronic_heater_total_on_time` | Total on-time since 2025-01-24 |

### Media
| Entity | Description |
|---|---|
| `media_player.vlc_telnet` | VLC (TTS output) |
| `tts.openai_tts_gpt_4o_mini_tts` | OpenAI TTS service |

### Shelly EM (AC monitoring)
| Entity | Description |
|---|---|
| `sensor.shellyem_c4d8d500789a_channel_1_voltage` | Inverter AC voltage |
| `binary_sensor.shelly_em_reachable` | Shelly EM reachable (= inverter on) |

### Input Helpers
| Entity | Description |
|---|---|
| `input_boolean.power_saving_mode` | Power saving flag |
| `input_boolean.sleep_mode` | Sleep mode flag |
| `input_boolean.shower_mode` | Shower mode flag |
| `input_boolean.shore_power_charger_enabled` | Shore charger manual enable |
| `input_boolean.speedtest_running` | Speedtest in progress |
| `input_boolean.windows_audio_stream` | Windows Scream audio enabled |
| `input_boolean.inverter_toggle_pending` | Inverter toggle in progress |
| `input_boolean.hot_water_mode` | Hot water mode — keeps hydronic heater on when climate turns off |
| `input_boolean.heater_low_fuel_lockout` | Low fuel heater lockout — auto-set when fuel < 25% after failed retry, auto-cleared when fuel > 30% |
| `input_select.night_climate_mode` | Night Climate: Off / Hold / Program / Fan all night / A/C all night / Heater |
| `input_select.night_climate_fan_direction` | Night Climate fan: Intake / Exhaust |
| `input_number.night_climate_night_target` / `_wake_target` / `_hold_target` / `_warmup_minutes` / `_fan_speed` / `_cool_above` | Night Climate targets (15 / 23 / 22 °C), warm-up (45 min), fan speed (30 %), room temperature above which the A/C may join (24 °C) |
| `input_boolean.night_climate_use_heater` / `_use_ac` / `_use_fan` | What the Night Climate Program may run |
| `input_boolean.night_climate_fan_by_room` | Set by the controller when the fan's own thermostat sat idle: HA runs the fan from the room sensor until the program ends |
| `input_datetime.shore_power_last_seen` | When the shore charger last drew power (automation `shore_power_seen`); feeds `binary_sensor.shore_power_present` |
| `input_datetime.night_climate_wake_time` | Night Climate wake time (07:30, time only; `input_datetime.yaml`) |
| `input_number.main_light_warmth` | Main light CCT (250–500 mireds) |
| `input_number.shore_charge_reset_threshold` | Shore charger reset SOC % |
| `input_number.acceleration_stability_threshold` | Accel threshold (km/h/s) |
| `input_number.vehicle_stopped_threshold` | Speed threshold for "stopped" (km/h) |
| `input_text.previous_fuel_level` | Last stable fuel reading |
| `input_text.previous_speed` | Previous speed for accel calc |

### Starlink sleep schedule
| Entity | Description |
|---|---|
| `time.starlink_sleep_start` | Starlink sleep start time |
| `time.starlink_sleep_end` | Starlink sleep end time |

---

## Modes & Routines

| Mode | Script ON | Script OFF | Description |
|---|---|---|---|
| **Power Saving** | `script.power_saving_mode_on` | `script.power_saving_mode_off` | Lights off, monitors off, water off; auto-triggered by leaving or driving |
| **Sleep Mode** | `script.sleep_mode_on` | `script.wake_up_routine` | All lights/monitors off, Starlink sleep scheduled, state snapshotted |
| **Shower Mode** | `script.shower_mode_on` | `script.shower_mode_off` | Lights 100%, water recirc, roof fan exhaust 60% |
| **Cook Mode** | `script.cook_mode` | `script.cook_mode_off` | LPG valve open, lights 100%, roof fan exhaust 60% |
| **Bedtime** | `script.bedtime_routine` | — | Progressive 10-min shutdown |
| **Night Climate** | `input_select.night_climate_mode` (Tonight card) | wake time / Sleep Mode off | What runs tonight: **Program** (15 °C night hold, warm-up to 23 °C for the wake time; heater below target − 1; above target + 2 the roof fan while it is cooler outside, the A/C only above "A/C above" on shore power), **Fan all night**, **A/C all night**, **Heater**. Sleep Mode on starts the Program; the wake time ends it and Sleep Mode. See *Night Climate* below |

### Night Climate (Tonight card on the Climate page)

Anything but **Off** in `input_select.night_climate_mode` runs until `input_datetime.night_climate_wake_time`
(07:30). **Program** holds `sensor.night_climate_target` (night target 15 °C, wake target 23 °C from *wake −
warm-up*): heater below target − 1 °C; above target + 2 °C the roof fan while outside is cooler, on its own
thermostat (`esphome.ag_pro_roof_fan_thermostat`, set point = target in °F) or, when that sits idle
(`binary_sensor.roof_fan_running` off 10 min), run by HA from the room sensor
(`input_boolean.night_climate_fan_by_room`). The A/C only joins above `input_number.night_climate_cool_above`
(24 °C), on shore power (`binary_sensor.shore_power_present` = charger drew power within 3 h) and never
while it is more than 3 °C colder outside; 30-min dwell; fan and A/C never together.
`input_boolean.night_climate_use_heater/_use_ac/_use_fan` allow each.
**Hold** is the same logic at `input_number.night_climate_hold_target` with no end (daytime).
**Fan all night** / **A/C all night** / **Heater** run one appliance. The Schedule page's Night preset (a
scheduler entry, 00:30 daily: targets + wake time, then the mode) or Sleep Mode starts the Program, the
wake time ends it (fan + A/C off, heater left as the warm-up set it) and Sleep Mode. Room reading =
`sensor.living_space_temperature` (gated median, `template/night_climate.yaml`). Scripts
`night_climate_heater_to/_fan_on/_ac_on/_ac_off/_actuators_off` only send when something has to change (IR
beeps). The warm-up is the morning heat (the old 07:30 scheduler entry was deleted 2026-09-17). IR is one-way
and the A/C power is a toggle: the AG Pro spaces fan and other frames 1.5 s apart and checks its A/C belief
against measured power every minute; the fan's off is sent twice (`button.ag_pro_roof_fan_force_off`) and
`night_climate_fan_watchdog` re-sends it if the motor draws power while HA has it off. Details and the
2026-09-18 incident: `docs/automations-modes.md`.

### Dynamic Scenes (created at runtime via `scene.create`)
- `scene.last_active_state` — rolling 1Hz snapshot (lights + monitors + water)
- `scene.pre_cook_mode` — before cook mode
- `scene.pre_sleep_mode_lights` / `_monitors` — before sleep
- `scene.pre_shower_mode_state` — before shower

---

## Voice Assistant

Intents defined in `conversations.yaml` (sentence patterns) → `intent_scripts.yaml` (actions):

| Intent | Triggers | Action |
|---|---|---|
| `RoofFanTurnOn` | "turn on the roof fan" | Lid open → intake → fan on |
| `RoofFanTurnOff` | "turn/shut off the roof fan" | Fan off → lid close |
| `RoofFanSetMode` | "set roof fan to exhaust/intake" | Change direction |
| `AGRoofFanSetPercentage` | "set roof fan to {%}" | Change speed (rounds to 10%) |
| `CookModeStart/Stop` | "start/stop cook mode" | `script.cook_mode` / `_off` |
| `StartBedtimeRoutine` | "goodnight" / "bedtime" | `script.sleep_mode_on` |
| `GoodMorning` | "good morning" / "wake up" | `script.wake_up_routine` |
| `IndoorDimmersOff/On` | "turn off/on the lights" | All 4 LED controllers |

---

## Custom Frontend Cards (HACS)

Used in `old_home.yaml`:
- `custom:mushroom-template-badge` — status badges
- `custom:mushroom-light-card` — light dimmers
- `custom:mushroom-entity-card` — entity toggles
- `custom:better-thermostat-ui-card` — PID thermostat
- `custom:apexcharts-card` — time-series charts
- `custom:weather-chart-card` — weather forecasts
- `custom:power-flow-card-plus` — power flow diagram
- `custom:scheduler-card` — schedule automations

---

## Dashboard Editing Rules

### Critical Rules

1. **Always use REAL entity IDs** from the tables above. The placeholder dashboards
   use fake IDs like `sensor.a32_battery_voltage` — those don't exist.

2. **`old_home.yaml` is the active main dashboard.** Use it as reference for card patterns.

3. **Mushroom theme** is installed. Follow Mushroom card design for consistency.

4. **Dashboard YAML structure:**
   ```yaml
   title: Dashboard Title
   icon: mdi:icon-name
   views:
     - title: View Title
       path: view-path
       icon: mdi:icon-name
       cards:
         - type: ...
   ```

5. **Sections layout** (`old_home.yaml` uses the newer sections/grid layout with `column_span`).

6. **Never edit `secrets.yaml`** or files in `custom_components/`.

7. **Reload after changes**: Developer Tools → YAML → Lovelace Dashboards (or restart HA).

### Card Pattern Reference

**Mushroom badge:**
```yaml
- type: custom:mushroom-template-badge
  entity: sensor.example
  icon: "{{ 'mdi:on' if is_state(entity, 'on') else 'mdi:off' }}"
  color: "{{ 'green' if is_state(entity, 'on') else 'red' }}"
  content: "{{ states(entity) }}"
  label: Name
  tap_action:
    action: more-info
```

**Mushroom entity (toggle):**
```yaml
- type: custom:mushroom-entity-card
  entity: switch.example
  name: Name
  icon: mdi:icon
  layout: horizontal
  tap_action:
    action: toggle
```

**Mushroom light (dimmer):**
```yaml
- type: custom:mushroom-light-card
  entity: light.example
  show_brightness_control: true
  show_color_temp_control: true
  collapsible_controls: false
```

**ApexCharts:**
```yaml
- type: custom:apexcharts-card
  header:
    show: true
    show_states: true
    colorize_states: true
  graph_span: 12h
  series:
    - entity: sensor.example
      name: Name
      type: line
      color: '#3498DB'
      curve: smooth
      stroke_width: 2
```

**Power Flow:**
```yaml
- type: custom:power-flow-card-plus
  entities:
    solar:
      entity: sensor.total_mppt_pv_power
    battery:
      entity:
        consumption: sensor.battery_discharging
        production: sensor.battery_charging
      state_of_charge: sensor.olins_van_bms_battery
    grid:
      entity:
        consumption: sensor.alternator_charger_power_24v
    individual:
      - entity: sensor.inverter_power_24v
        name: Inverter
```

**Gauge:**
```yaml
- type: gauge
  entity: sensor.olins_van_bms_battery
  name: Battery SOC
  min: 0
  max: 100
  severity:
    green: 65
    yellow: 30
    red: 0
```

---

## Key Automations (automations.yaml)

| ID / Alias | Purpose |
|---|---|
| `starlink_*` (×5) | GPS tracking: bootstrap, 1Hz refresh, 1Hz publish while moving, start/stop snapshots |
| Main Lighting Sync | Physical switch ↔ LED dimmer brightness sync |
| Main Lighting Warmth | Warmth slider → LED CCT |
| Linked Entities (×3) | Blueprint: switch ↔ LED controller pairs |
| `indoor_lights_sundown_*` (×2) | Sundown dimming: step lights down at sundown / after dark, cap evening turn-ons, morning reset |
| `shore_charger_*` | Manual enable sync + SOC-based power-cycle reset |
| `iphone_home_arrival` | Welcome TTS when returning after 15+ min |
| `auto_power_saving_when_away` | Radar presence (`van_occupied`: on after 2 s, off after 3 min) → power saving on/off; a physical monitor rocker press also ends power saving at once |
| `auto_power_saving_when_driving` | Driving → power saving (30s on, 2min off) |
| `bed_power_auto_off_30s` | Safety: bed motor auto-off |
| `keep_home_zone_on_starlink` | Move HA home zone to Starlink GPS every 5 min |
| `rolling_last_active_snapshot_1hz` | 1Hz scene snapshot of lights/monitors/water |
| `shower_mode_on_actions` / `_off_restore` | Shower mode setup + restore |
| Shelly EM 1s ping | Update inverter detection every second |
| Inverter pending clear | Clear pending flag when ping state changes |
| Bootstrap ducking / Scream | Start audio ducking + Scream receiver on HA boot |
| `syncthing_start_on_boot` | Start Syncthing daemon 30s after HA boot |
| `dvr_proxy_start_on_boot` | Start DVR camera proxy daemon 40s after HA boot |

---

## Tips for Copilot

- The van runs a **24V LiFePO4** battery. Power = current × `sensor.olins_van_bms_voltage`
  (24V) or × `sensor.a32_pro_smart_battery_sense_12v_voltage` (12V).
- **Inverter detection** is indirect: ping Shelly EM → if reachable, AC is live.
- **Propane %** uses hemisphere+cylinder geometry with 80% fill rule.
- **Fuel level** is noisy from OBD — use `sensor.stable_fuel_level` or `sensor.wican_fuel_5_min_mean`.
- **Roof fan direction**: `forward` = exhaust, `reverse` = intake.
- **Scenes are all dynamic** — `scenes.yaml` is empty. They're created via `scene.create` in scripts/automations.
- **Tire pressure raw kPa values from WiCAN are ~2× actual.** The MQTT discovery `value_template`
  divides by 2 (`/ 2`), so entities like `sensor.192_168_10_90_tyre_p_fl` already report in psi.
  **Do NOT apply `* 0.0725190`** in templates or Van.tsx — that was the old wrong conversion.
- **`binary_sensor.engine_is_running`** uses RPM freshness only (RPM > 0 and last_updated < 120s).
  Do NOT gate it on `binary_sensor.meatpi_pro_ecu_status` — that entity uses the WiCAN MQTT LWT
  topic which is unreliable (stays `on` even when ECU has no response).
- **WiCAN MQTT discovery configs** have no `expire_after` — entities keep last known value forever.
  The ECU status entity (`binary_sensor.meatpi_pro_ecu_status`) also has no `expire_after`; it
  reflects the retained `wican/status` LWT (`online`/`offline`).
- **Fuel consumption uses speed-density estimation** — via Ford Mode 22 MAP PID (`22F404`)
  combined with RPM + IAT. The formula uses a volumetric efficiency (VE) correction factor
  (`input_number.fuel_ve_correction`, default 0.55) that should be calibrated against
  fill-to-fill measurements. Three correction layers: (1) RPM-based VE curve (0.60× at idle
  → 1.0× at 3000+ RPM), (2) fuel trim averaging across both banks, (3) lambda-based
  commanded AFR instead of fixed 14.7. Overestimates at idle, most accurate at cruise.
  MAF (0x10, `22F410`), fuel rate (`22F49D`, 0x5E), and MAP (0x0B) via standard OBD all
  don't work.
- **Jinja2 pipe + math precedence**: `states(x) | float(0) * N` parses as `float(0 * N)`.
  Always use parentheses: `(states(x) | float(0)) * N`. Same for `* N | round(M)` →
  use `(expr * N) | round(M)`.

---

## Hydronic Heating System — Architecture & Coolant Loop

The van has a **gasoline-fired hydronic heater** (**Espar Hydronic S3 B5E**) that heats
coolant in a closed loop. The coolant circulates through multiple heat exchangers before
returning to the heater. This is the core climate and hot water system for the van.

The heater is controlled via a single **signal wire** — applying 12V turns it on,
removing 12V turns it off. ESPHome drives this through a relay (`hydronic_heater_on_off_physical`).

### Sensor Mounting

- **Coolant temp** (`s5140_ch34_temp`): NTC probe aluminum-taped to the outside of one
  of the water-to-water heat exchangers. Reads surface temperature, not true inline
  coolant temp — expect it to lag and read lower than actual coolant.
- **Blower air temp** (`s5140_ch35_temp`): NTC probe dangling inside one of the blower
  matrix air ducts. Reads the heated air output temperature.

### Coolant Loop (physical order)

```
Espar Hydronic S3 B5E (gasoline burner, 12V signal wire on/off)
  │
  ├─► Water-to-Water Heat Exchanger #1 — MAIN water system
  │     (heats fresh water for sink/faucet via counterflow plate HX)
  │     [coolant temp NTC aluminum-taped to this HX housing]
  │
  ├─► Water-to-Water Heat Exchanger #2 — RECIRCULATING SHOWER loop
  │     (heats recirculating shower water via counterflow plate HX)
  │
  ├─► Air Blower Matrix (water-to-air heater core + PID-controlled fan)
  │     - Blows hot air into cabin for space heating
  │     - Fan speed controlled via DAC output (`light.a32_pro_a32_pro_dac_0`)
  │     - PID climate entity: `climate.a32_pro_van_hydronic_heating_pid`
  │     - Coolant temp sensor: `sensor.a32_pro_s5140_channel_34_temperature_blower_coolant`
  │     - Blower air temp sensor: `sensor.a32_pro_s5140_channel_35_temperature_blower_air`
  │     [air temp NTC dangling in blower duct]
  │
  └─► Return to heater (exits cabin, passes engine bay, loops back)
```

### Key Implications

- **The water HX's are upstream of the air matrix.** When the heater runs, the water
  systems always get heated first — even if climate (air heating) is the reason the
  heater is on. The dashboard reflects this: "Heating air (+ water passthrough)".
- **Hot Water Mode** (`input_boolean.hot_water_mode`): Keeps the hydronic heater running
  even when the PID climate entity is turned OFF. Use case: you want hot water at the
  sink/shower but don't need cabin air heating. The blower fan can be off while coolant
  still circulates through the water HXs.
- **Both modes simultaneously**: When climate is ON *and* hot water mode is ON, the
  dashboard shows "Heating air + water". When climate turns off but hot water mode stays
  on, the heater keeps running and the dashboard shows "Hot water only".
- **Coolant temperature** (`s5140_ch34_temp`) is measured at the blower matrix inlet —
  this is *after* the water HXs have extracted some heat, so it reads lower than the
  heater outlet temperature.
- **The engine heats this loop too.** With the Espar off, the coolant sensor reads
  90–96 °C after a few minutes of driving and decays ~0.5 °C/min once the engine stops
  (HA history, Sept 2026). "Coolant is hot" therefore does not prove the burner is lit;
  the firmware treats either heat source as "running" and only steps in when the loop
  is cold and not warming.

### Heater Warm-up Monitor & Auto-restart (ESPHome)

Whoever lights the heater (PID climate, Hot Water Mode, Switch24, rocker), the relay's
`on_turn_on` arms a monitor (`interval: 30s`) that watches the HX#1 coolant sensor
(`s5140_ch34_temp`) while the relay is on:

1. Coolant ≥ **Heater OK Temp** (`number.a32_pro_hydronic_heater_ok_temp`, default
   45 °C) → state 3 (running). Any heat source counts.
2. Else coolant rose ≥ **8 °C over the trailing 5 min** → state 3 (burner lit). A lit
   burner lifts this sensor ~12 °C/min; failed starts drift < 2.5 °C.
3. Else, after **6 min** (from relay-on for a start; since the coolant last looked
   healthy for a running heater) → attempt failed / burner died: relay off 10 s, on
   again (state 2), up to **Heater Max Restarts**
   (`number.a32_pro_hydronic_heater_max_restarts`, default 3).
4. All restarts used up → relay dropped: state 5 (fuel lockout) if
   `sensor.stable_fuel_level` < 25 %, else state 4 (failed). State 4 waits for the user
   to toggle the climate or heater; the climate handler will not relight it by itself.

History (2026-07 → 09): 4 of 8 relay-on runs never lit, at 68 %, 68 %, 93 % and 20 %
fuel; every ignition came within 4 min of a fresh relay-on (the third attempt lit on both
multi-attempt days). Engine-off replay of the new monitor: 9 restarts, all justified, 0
spurious; lit-burner coolant band at the sensor 77–92 °C. The previous one-shot "≥ 2 °C in 5 min" check passed on a +2.1 °C engine drift and then
stopped watching for the rest of the run.

### Blower Coolant Gate

In Auto (PID) mode the blower DAC stays at 0 until the coolant reaches **Hydronic Blower
Start Temp** (`number.a32_pro_hydronic_blower_start_temp`, default 60 °C) and runs until
it falls 10 °C below that (residual heat still gets blown out). The gate is re-evaluated
on every coolant sample; `binary_sensor.a32_pro_hydronic_blower_coolant_ready` shows it
and the status text says "blower waits for coolant…" meanwhile. Manual blower control and
the shoe dryer bypass the gate.

### Blower Auto / Manual

`switch.a32_pro_coolant_blower_mode_auto_manual` (on = Auto/PID, off = Manual) is a hold
while the thermostat heats: the burner stays lit and the climate's `on_state` (which fires
on every cabin temperature sample) no longer re-arms Auto. The hold clears when the
thermostat is next switched on, so each heat session starts on Auto and the shoe dryer's
climate restore hands the blower back. Thermostat off = always manual (switch reads off).
Firmware before 2026-09-16 re-armed Auto within ~10 s, which is why `script.shoe_dryer_start`
turns the climate off before flipping the switch.

With the climate OFF the switch's `turn_on_action` clears the hold and returns *before* its
"apply the PID's output now" step, so the blower keeps whatever speed it was given by hand.
The Heater card covers that gap: Auto is clickable with the thermostat off and also sends
`light.turn_off` to `light.a32_pro_a32_pro_dac_0` (the PID's output there is 0). Other
clients that flip the switch directly — HA's own more-info dialog, automations — still leave
the fan turning.

### Low Fuel Lockout

- **Trigger**: Heater never warms up after all restarts AND `sensor.stable_fuel_level` < 25%
- **Effect**: Sets `input_boolean.heater_low_fuel_lockout` ON → ESPHome blocks heater
  startup, dashboard shows red lockout message + override button
- **Auto-clear**: HA automation clears lockout when fuel rises above 30% for 2 min; the
  ESP drops its lockout verdict when the boolean clears, so a still-on climate relights
- **Manual override**: Dashboard button (with confirmation dialog)

### Heater Status Messages (`sensor.a32_pro_hydronic_heater_status`)

| State | Message |
|---|---|
| 0 (idle, heater off) | "Idle." (hidden on dashboard) |
| 1 (starting) | "Starting heater -> waiting for coolant to warm up (NN °C)..." |
| 2 (restarting) | "Coolant not warming -> heater restart N of M..." |
| 3 (running, blower gated) | "Heater running -> blower waits for coolant to reach 60 °C (now NN °C)." |
| 3 (running) | "Heater running -> coolant NN °C." |
| 4 (failed) | "Heater never warmed up after N restarts -> turned off. Toggle climate or heater to try again." |
| 5 (fuel lockout) | "Low fuel lockout (XX%) -> Refuel or override from dashboard." |
| Relay on, monitor not yet ticked | "Heater running." |

States 4 and 5 outlive the relay (it is dropped when they are given); turning the climate
off, or any new relay-on, resets them.

### Dashboard Heating Mode Context

The heating details card on the home dashboard shows contextual mode labels:

| Condition | Label |
|---|---|
| Heater ON + Climate ON + Hot Water ON | "Heating air + water" (orange) |
| Heater ON + Hot Water ON + Climate OFF | "Hot water only" (blue) |
| Heater ON + Climate ON + Hot Water OFF | "Heating air (+ water passthrough)" (orange) |
| Heater ON (manual, no mode active) | "Heater on (manual)" (orange) |
| Heater OFF | No label shown |

---

## Shore Power Charger — Auto-Cycle System

The shore power charger (`switch.a32_pro_do8_switch04_shore_power_charger`) is the physical
relay that powers the charger. However, the charger has a design flaw: **once the batteries
reach 100% SOC, the charger stops and does not automatically restart** when the SOC drops.
The only way to re-initialize it is to power-cycle the relay (turn off, wait, turn on).

To handle this, the dashboard and automations use `input_boolean.shore_power_charger_enabled`
instead of the raw switch. This input boolean drives an automation (`shore_charger_*`) that:

1. When enabled: turns on the physical charger relay
2. Monitors battery SOC — when SOC reaches 100% and then drops below the reset threshold
   (`input_number.shore_charge_reset_threshold`), automatically power-cycles the relay
3. When disabled: turns off the physical charger relay

**Dashboard rule**: Always use `input_boolean.shore_power_charger_enabled` for the shore
power toggle button, NOT `switch.a32_pro_do8_switch04_shore_power_charger`. The raw switch
should only be used for direct hardware control in edge cases.

| Entity | Purpose |
|---|---|
| `input_boolean.shore_power_charger_enabled` | User-facing toggle (auto-cycle enabled) |
| `switch.a32_pro_do8_switch04_shore_power_charger` | Physical relay (hardware switch) |
| `input_number.shore_charge_reset_threshold` | SOC % threshold for auto power-cycle reset |

---

## Inverter Detection — Indirect Feedback via Shelly EM Ping

The inverter has **no direct on/off status entity**. It is controlled via a momentary toggle
button (`button.a32_pro_inverter_on_off_toggle`) — pressing it once toggles the inverter on
or off. There is no way to read the inverter's state directly.

**Inverter status is inferred** by pinging a Shelly EM energy monitor (`192.168.10.174`)
that is powered by the inverter's AC output. If the Shelly is reachable, the inverter is on.
If not reachable, the inverter is off.

### Detection Mechanism

1. `binary_sensor.192_168_10_174` — HA Ping integration, updated every 1 second by the
   "Shelly EM – one-second ping updater" automation
2. `binary_sensor.shelly_em_reachable` — template binary sensor wrapping the ping state
3. `sensor.shellyem_c4d8d500789a_channel_1_voltage` — AC voltage (only available when on)

### Dashboard Inverter Button Behavior

The React dashboard's `InverterButton` component handles the lack of direct feedback:

1. **Resting state**: Shows "ON" (green glow) or "OFF" (muted) based on `binary_sensor.shelly_em_reachable`
2. **After press**: Shows "Loading…" (yellow, pulsing icon) for up to 15 seconds
3. **State change detected**: Clears loading immediately when the Shelly ping state changes
4. **Timeout**: If no state change after 15 seconds, reverts to showing current state

**Dashboard rule**: Use `button.a32_pro_inverter_on_off_toggle` for the toggle action,
and `binary_sensor.shelly_em_reachable` for status display. Never bind the inverter button
to a switch entity — it's a momentary press, not a toggle.

| Entity | Purpose |
|---|---|
| `button.a32_pro_inverter_on_off_toggle` | Momentary press to toggle inverter on/off |
| `binary_sensor.shelly_em_reachable` | Inverter on/off status (derived from Shelly EM ping) |
| `binary_sensor.192_168_10_174` | Raw ping sensor for Shelly EM (1s refresh) |
| `sensor.shellyem_c4d8d500789a_channel_1_voltage` | AC voltage (available when inverter on) |
| `input_boolean.inverter_toggle_pending` | HA-side pending flag (cleared by automation) |

---

## Vanlife Tracker Panel (`www/vanlife-panel/`)

A custom HA panel for GPS trip tracking, map visualization, and named places management.

### Architecture

| Component | File | Purpose |
|---|---|---|
| **Panel UI** | `www/vanlife-panel/index.html` | Single-file panel (~2700 lines): Leaflet map, trip sidebar, place management, date picker |
| **CORS Proxy / API** | `www/vanlife-panel/osrm_proxy.py` | Python HTTP server (port 8765): filtered GPS endpoint, named places CRUD, Valhalla routing proxy, data-range endpoint |
| **GPS Filter Daemon** | `www/vanlife-panel/gps_filter.py` | Background daemon: filters raw Starlink GPS → movement segments & parking spots, pre-routes via Valhalla, stores in SQLite |
| **Backfill Script** | `www/vanlife-panel/backfill_gps.py` | One-shot script to process historical GPS data |
| **Custom Component** | `custom_components/vanlife_tracker/` | HA integration: stop detection, geocoding, Traccar client |

### GPS Filter Pipeline

- **Source**: `device_tracker.ublox_gps` (5–10s update interval from Starlink)
- **Filter constants**: `MIN_PARK_DURATION_S=180`, `FILTER_RADIUS_M=15`, `CONFIRM_COUNT=3`, `MIN_SEGMENT_DISTANCE_M=300`
- **Database**: `www/vanlife-panel/filtered_gps.db` (SQLite)
- **Tables**: `gps_points`, `segments` (with pre-routed geometry), `named_places`
- **Routing**: Valhalla `trace_route` with `search_radius=100`, `gps_accuracy=50`, `breakage_distance=20000`
- **Data range**: 2025-03-03 to present (511+ routed segments as of April 2026)

### API Endpoints (osrm_proxy.py, port 8765)

| Endpoint | Method | Purpose |
|---|---|---|
| `/vanlife/filtered-gps?date=YYYY-MM-DD` | GET | Filtered GPS segments + parking for a date |
| `/vanlife/data-range` | GET | Returns `{min_date, max_date}` for date picker bounds |
| `/vanlife/named-places` | GET/POST | List all / create a named place |
| `/vanlife/named-places/<id>` | PUT/DELETE | Update / delete a named place |
| `/vanlife/route` | POST | Proxy to Valhalla trace_route |

### Named Places System

- **DB table**: `named_places` (id, name, category, lat, lon, radius_m, notes, created_at)
- **Place radius**: Used for matching — parking dots within a place's radius are hidden on the map, and the place name is shown instead
- **Place markers**: Purple with category emoji icon + name label; radius circle shown only on marker click (popup open), hidden on popup close
- **Place creation**: Via floating overlay form on the map (not in the Places tab); accessible from sidebar "＋ Place" button or parking dot "Create Place Here" popup
- **Place form**: Floating overlay at top-left of map pane (310px wide, purple border, z-index 9500); has live dotted radius preview circle + zoom-to-fit when location is set
- **Categories**: campsite, gas_station, dump_station, water_fill, walmart, rest_area, trailhead, mechanic, other

### Van/Place Marker Grouping

When the van is parked near a named place, the markers would overlap. The panel uses **pixel-distance grouping**:
- On each zoom change + van position update, checks pixel distance between van marker and all place markers
- If within 60px on screen → hides the van marker and shows a small red 🚐 badge on the place marker icon
- If further apart (zoomed in) → shows both markers separately
- This is purely visual — the place radius controls stop-matching, the pixel threshold controls marker grouping

### Panel UI Structure

- **Tabs**: "Map & Trips" (default) | "Named Places"
- **Map pane**: Leaflet map + route layer + sidebar (collapsible) + floating place form overlay
- **Sidebar**: Date picker (min from data-range API), date mode buttons, trip list with stop durations + place names, "＋ Place" button
- **Trip rendering**: Blue polylines for routed trips, grey parking dots for unmatched stops (parking dots inside named places are hidden)
- **Van marker**: Red 🚐 icon with "Van" label, zIndexOffset 1000, updated every 10s via polling

### Deployment

Panel files are NOT synced via Syncthing (`www/` is in `.stignore`). Deploy manually:
```bash
cat index.html | ssh -i ~/.ssh/id_ed25519 hassio@100.80.15.86 "cat > /tmp/index.html && sudo cp /tmp/index.html /config/www/vanlife-panel/index.html"
```
Same pattern for `osrm_proxy.py` and `gps_filter.py`. Hard-refresh the browser after deploy.

### Running Services on HA

- **Proxy**: `cd /config/www/vanlife-panel && python3 osrm_proxy.py &` (port 8765)
- **Daemon**: `cd /config/www/vanlife-panel && python3 gps_filter.py --mode incremental &`
- **Auth token**: Stored at `/config/.gps_filter_token`

---

## React Dashboard Panel (`react-dashboard/`)

Custom HA sidebar panel built with **React 19 + Vite 6 + TypeScript + Tailwind CSS 3 + shadcn/ui**.
Registered via `panel_custom` as a single `<van-dashboard>` custom element with hash-based tab routing.

### Architecture

| Layer | Technology |
|---|---|
| **Build** | Vite 6 (library mode, ES format) → `dist/van-dashboard.{js,css}` |
| **UI** | React 19, Tailwind CSS 3, shadcn/ui components, lucide-react icons |
| **HA bridge** | `panel-loader.js` registers custom element, passes `hass` → `window.__HASS__` → React context; `src/lib/panel-host.ts` keeps the React tree alive when HA parks the panel |
| **State** | `HassStore` class (per-entity subscriptions via `useSyncExternalStore`) |
| **Routing** | Hash-based (`#home`, `#power`, `#climate`, `#water`, `#van`, `#system`) with bottom navbar |

### File Structure

```
react-dashboard/
  panel-loader.js          # Custom element registration + cache busting (CACHE_VER); keep it thin
  configuration.yaml       # panel_custom config snippet (module_url with ?v=N)
  vite.config.ts           # Library mode build config
  package.json             # Dependencies
  src/
    App.tsx                # Root: HassProvider → hash router → navbar + pages
    index.css              # Tailwind directives + dark theme variables
    main.tsx               # Dev-mode entry (WebSocket connector for local dev)
    context/
      HomeAssistantContext.tsx  # HassStore + HassProvider (bridges hass → React)
    types/
      hass.ts              # HomeAssistant, HassEntity, HassConnection types
    hooks/
      useEntity.ts         # useEntity, useEntityNumeric, useEntities
      useHistory.ts        # Fetch entity history from HA REST API
      useService.ts        # useToggle, useButtonPress (callService wrappers)
      useWeatherForecast.ts # WS subscription for weather/subscribe_forecast
    lib/
      utils.ts             # fmt(), cn(), batteryEstimate()
    pages/
      Home.tsx             # BadgeBar, QuickControls, ModeToggles, cards
      Power.tsx            # Battery, solar, power breakdown
      Climate.tsx          # Thermostat, heating controls, fan, temperatures
      Water.tsx            # Tank levels, propane, water controls
      Van.tsx              # Fuel, tire pressure, OBD data, GPS
      Cameras.tsx          # 4-camera MSE grid (always mounted, see note below)
      Schedule.tsx         # Scheduler-component front end. Heater preset = thermostat to N °C / off at a time; Night = the Night Climate program with its targets; Other = any entity
      System.tsx           # Connectivity, device status, system info
    components/
      BatteryCard.tsx      # SOC gauge, power flow, charge estimate
      SolarCard.tsx        # PV power, MPPT details, daily yield
      WeatherCard.tsx      # Current conditions + 7-day forecast (WS subscription)
      TemperatureCard.tsx  # BME280 readings (4 zones)
      TankLevel.tsx        # Reusable tank bar (fresh/grey water)
      HeaterCard.tsx       # Hydronic heater: thermostat, blower Auto/Manual, one Hot Water / Hydronic Heater switch, status
      FanControl.tsx       # Roof fan: Off / Manual / Auto, speed or set point (sent 1.2 s after the last change), direction, lid; Off again re-sends off
      TonightCard.tsx      # Night Climate: mode, targets, wake time, what the Program may use, "A/C above", fan speed/direction
      PowerBreakdown.tsx   # Per-circuit power consumption
      ToggleButton.tsx     # Animated toggle with glow/pulse when active
      PresenceBar.tsx      # Occupancy indicator
      Chart.tsx            # Sparkline + HistoryChart (SVG, hover tooltip)
      EntityHistoryDialog.tsx # Modal: entity history graph with time range
      ClickableValue.tsx   # Tappable value → opens history dialog
      EntityValue.tsx      # Live entity display
      StatValue.tsx        # Labeled stat with optional sparkline
      StatusDot.tsx        # Colored status indicator
      layout/
        PageContainer.tsx  # Page wrapper with consistent padding
      ui/                  # shadcn/ui primitives (card, button, etc.)
```

### Key Patterns

**Entity subscription** — Components subscribe to individual entities for minimal re-renders:
```tsx
const entity = useEntity('sensor.olins_van_bms_battery');
const { value, entity } = useEntityNumeric('sensor.total_mppt_pv_power');
// value is number | null (null when unknown/unavailable)
```

**Null-safe display** — `fmt()` returns "—" for null/undefined values:
```tsx
fmt(value, 0)  // "42" or "—"
```

**History dialog** — Any tappable value can open a history chart:
```tsx
const { open } = useHistoryDialog();
<span onClick={() => open('sensor.id', 'Display Name', 'W')}>...</span>
```

**Weather forecast** — Modern HA (2023.x+) requires WS subscription (not entity attributes):
```tsx
const forecast = useWeatherForecast('weather.pirateweather', 'daily');
```

**Toggle button animation** — Active state shows colored glow shadow, scaled icon, and pulsing dot.

### Cache Busting

`panel-loader.js` uses `CACHE_VER = Date.now()` — JS/CSS imports get a unique timestamp on
every page load, so no manual version bumping is needed for the bundle.

HA serves `/local/` with `Cache-Control: max-age=2678400` (31 days), so browsers keep
`panel-loader.js?v=16` for weeks. Don't bump `?v=N` for loader changes (that needs an HA
restart). Instead bump `window.__VAN_DASH_LOADER__` in `panel-loader.js` and `LOADER_VERSION`
in `src/main.tsx` together: when the bundle finds an older loader running, it re-fetches the
loader past the cache, so the next page load picks up the new one. Keep the loader thin and put
lifecycle logic in the bundle (`src/lib/panel-host.ts`), which is always fresh.

### Prerequisites (Building the Dashboard)

Node.js is required to build the React dashboard. Install via **fnm** (Fast Node Manager):

```powershell
# Install fnm (one-time)
winget install Schniz.fnm

# Install Node.js LTS (one-time, after restarting shell)
fnm install --lts
fnm use lts-latest

# Install dashboard dependencies (one-time, or after package.json changes)
cd react-dashboard
npm install
```

| Machine | Node.js | fnm | Notes |
|---|---|---|---|
| **Asylum** | ❓ Unknown | ❓ Unknown | May need setup |
| **Satellite** | v24.14.1 | v1.39.0 | Installed 2025-04-12 via winget |

### Deploy Workflow

**Quick deploy** (builds + deploys JS, CSS, and panel-loader.js in one command):
```bash
cd react-dashboard && bash deploy.sh
```

**Manual deploy** (if `deploy.sh` doesn't work or for partial deploys):
```bash
# 1. Build
cd react-dashboard && npm run build

# 2. Deploy JS + CSS
cat dist/van-dashboard.js | ssh -i ~/.ssh/id_ed25519 hassio@100.80.15.86 \
  "cat > /tmp/vd.js && sudo cp /tmp/vd.js /config/www/react-dashboard/van-dashboard.js"
cat dist/van-dashboard.css | ssh -i ~/.ssh/id_ed25519 hassio@100.80.15.86 \
  "cat > /tmp/vd.css && sudo cp /tmp/vd.css /config/www/react-dashboard/van-dashboard.css"

# 3. If panel-loader.js changed (bump __VAN_DASH_LOADER__ / LOADER_VERSION, not ?v=N):
cat panel-loader.js | ssh -i ~/.ssh/id_ed25519 hassio@100.80.15.86 \
  "cat > /tmp/pl.js && sudo cp /tmp/pl.js /config/www/react-dashboard/panel-loader.js"

# 4. If the panel_custom block in configuration.yaml changed:
#    Wait for Syncthing (~10s), then restart HA via REST API:
TOKEN=$(ssh -i ~/.ssh/id_ed25519 hassio@100.80.15.86 "cat /config/.gps_filter_token")
curl -X POST "http://100.80.15.86:8123/api/services/homeassistant/restart" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"
```

**Prerequisites** (must be in place on any machine that deploys):
- **SSH key**: `~/.ssh/id_ed25519` must be authorized on HA (user `hassio@100.80.15.86`)
- **Node.js + npm**: Required for `npm run build` (Vite build)
- **Tailscale**: HA is only reachable at `100.80.15.86` over Tailscale VPN
- After deploy, **hard-refresh the browser** (Ctrl+Shift+R) to load new JS/CSS

### Current Versions

| File | Version |
|---|---|
| `panel-loader.js` CACHE_VER | `Date.now()` (automatic) |
| `panel-loader.js` `__VAN_DASH_LOADER__` / `main.tsx` `LOADER_VERSION` | `2` |
| `configuration.yaml` ?v= | `16` (leave it; see Cache Busting) |

### CSS Scoping

The dashboard runs inside a custom element (no shadow DOM). CSS is injected as a `<style>` tag
inside the element. The root `.van-dash-root` div has `position: relative` so that
absolute-positioned overlays (like the history dialog modal) stay within the panel's scope.
`fixed` positioning escapes the custom element — always use `absolute` with a positioned ancestor.

### Always-Mounted Components

The `Cameras` page is **always mounted** regardless of which tab is active. When the user
navigates away from the Cameras tab, it renders with `className="hidden"` instead of
unmounting. This preserves the 4 MSE streaming connections across tab switches.

In `App.tsx`:
```tsx
{/* Cameras always mounted — hidden when not active to preserve MSE streams */}
<div className={page === 'cameras' ? '' : 'hidden'}>
  <Cameras />
</div>
{page !== 'cameras' && <Page />}
```

Within `Cameras.tsx`, all 4 camera cells are always rendered. When a single camera is
expanded, the other 3 use `className="hidden"` — they are never unmounted. This prevents
stream reconnection when switching between grid and single-camera views.

**Rule**: If you add another component that holds long-lived connections (WebSocket streams,
MSE streams, etc.), follow the same pattern — keep it mounted and use CSS `hidden` to toggle
visibility instead of conditional rendering.

---

## Security Cameras — Lorex DVR + go2rtc + MSE Streaming

The van has a **Lorex D231A41B** 4-channel 1080p DVR connected via ethernet to the MoFi
router. Live video is streamed to the React dashboard via **MSE (Media Source Extensions)
over HTTP (TCP)**, proxied through `dvr_proxy.py` → go2rtc → RTSP → DVR.

### DVR Details

| Setting | Value |
|---|---|
| **Model** | Lorex D231A41B (Dahua XVR5104C-X1, 4-channel, 1TB HDD) |
| **IP** | `192.168.10.156` |
| **RTSP port** | 554 |
| **Credentials** | `admin` / *(in go2rtc.yaml on HA host — not in git)* |
| **Main stream** (`subtype=0`) | H.264 High, 960×480, 30fps, 768kbps VBR |
| **Sub stream** (`subtype=1`) | H.264, 704×480, 15fps, 512kbps CBR |
| **RTSP URL format** | `rtsp://admin:PASSWORD@192.168.10.156:554/cam/realmonitor?channel=N&subtype=S` |

### Streaming Architecture

```
Browser (MSEFeed)  ──HTTP/TCP──►  dvr_proxy:8766  ──HTTP──►  go2rtc:1984  ──RTSP──►  DVR:554
   /api/mse?src=channel_N           (proxy)        /api/stream.mp4          (H.264)
```

**Why MSE over HTTP instead of WebRTC?**
- WebRTC uses UDP — WiFi jitter caused frequent stalls/freezes on all 4 channels
- MSE over HTTP uses TCP — eliminates packet loss, rock-solid delivery
- ~1s latency vs ~0.3s WebRTC — fine for security cameras
- go2rtc's `/api/stream.mp4` outputs fMP4 (fragmented MP4) — MSE appends fragments as they arrive

### go2rtc Configuration

`go2rtc:` must be present in `configuration.yaml` to load the HA go2rtc integration.

| File | Purpose |
|---|---|
| `configuration.yaml` → `go2rtc:` | Triggers HA to load the go2rtc integration |
| `/config/go2rtc.yaml` | Stream definitions: 4 main (`channel_1-4`, subtype=0) + 4 sub (`channel_1-4_sub`, subtype=1) |
| go2rtc API | `http://localhost:1984/api/streams` (on HA host) |
| go2rtc MSE endpoint | `http://localhost:1984/api/stream.mp4?src=channel_N` |

### dvr_proxy.py

Python HTTP server running on port **8766** inside the HA container. Proxies go2rtc's MSE
stream to the browser (since go2rtc's `local_auth: true` blocks external CORS requests).
Also serves the DVR playback/recording API on port **8767** (RTSP Scale proxy) and
the playback control API on port **8766** (same as live MSE).

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/mse?src=channel_N` | GET | Proxies go2rtc `/api/stream.mp4` — long-lived streaming response |
| `/api/mse?src=playback` | GET | Proxies go2rtc playback stream (with FMP4Rewriter at speed > 1) |
| `/api/playback/start` | POST | Start DVR playback — registers go2rtc stream, routes through Scale proxy |
| `/api/playback/speed` | POST | Change playback speed — estimates DVR position, re-routes stream |
| `/api/playback/stop` | POST | Stop DVR playback — deletes go2rtc stream, resets state |
| `/api/timeline?channel=N&date=YYYY-MM-DD` | GET | Query DVR recording segments for a date |
| `/api/date-range?channel=N` | GET | Get oldest/newest recording timestamps |
| `/api/webrtc` | POST | Legacy WebRTC signaling (still functional, no longer used by frontend) |
| Port 8767 | — | RTSP Scale proxy (TCP passthrough, injects Scale header into PLAY) |

**Auto-start**: `shell_command.start_dvr_proxy` + automation `dvr_proxy_start_on_boot` (40s delay).
The proxy's `ensure_dvrip_streams()` also re-registers all streams in go2rtc via API on startup
as a fallback in case `go2rtc.yaml` wasn't loaded.

### MSEFeed Component — Live Streaming (Cameras.tsx)

The `MSEFeed` React component handles live streaming:
- Fetches `/api/mse?src=channel_N` via `fetch()` → `ReadableStream`
- Creates `MediaSource` → `SourceBuffer`, pumps fMP4 chunks into it
- **Buffer management**: Single `updateend` handler, batch-drain queue before trim, trim on 10s interval (keeps last 20s, trims at 60s buffer)
- **Live edge — initial snap**: On first `playing` event, snaps `currentTime` to `bufferedEnd - 0.5` to start 0.5s behind live (TARGET_LAG cushion)
- **Live edge — proportional controller**: Watchdog every **1s** computes a continuous
  `playbackRate` to track a target lag of 0.5s behind the buffer edge. No discrete rate
  bands or hard seeks under normal operation:
  ```
  rate = clamp(1.0 + (lag − 0.5) × 0.04, 0.95, 1.15)
  ```
  | Lag | Rate | Behavior |
  |---|---|---|
  | 0.0s | 0.98 | Too close to edge — slow down, rebuild buffer |
  | 0.5s | 1.00 | On target — normal playback |
  | 1.5s | 1.04 | Gentle catch-up, imperceptible |
  | 3.0s | 1.10 | Faster catch-up |
  | 5.0s | 1.15 | Cap — max smooth catch-up |
  | >15s | Hard seek to `edge − 0.5` | Only after major stall recovery |
- **Stall watchdog**: `currentTime` stuck for 8s (local) / 12s (remote) → force reconnect
- **Auto-reconnect**: Exponential backoff (2s → 30s cap) with per-channel stagger
- **Stream quality — automatic**: Chrome 107+ uses `MediaSource.canConstructInDedicatedWorker` (worker MSE) which moves all SourceBuffer work off the main thread, enabling 4×30fps HD grid. Grid uses main stream (HD 30fps). Expanded single-camera also uses main stream. On older browsers without worker MSE, grid falls back to sub-stream (15fps 512kbps SD) to avoid main-thread JS overload. No manual quality toggle.
- **Startup stagger**: channel_1 at 0ms, channel_2 at 250ms, channel_3 at 500ms, channel_4 at 750ms. Prevents simultaneous burst overloading go2rtc.
- **Trim stagger (main-thread fallback only)**: Each channel's periodic trim is offset by (last char % 4) × 2500ms to prevent all 4 trimming simultaneously. Not needed for worker MSE (each worker has its own thread).
- **currentTime sync to worker**: Watchdog sends `video.currentTime` to worker every 1s via `{ type: 'currentTime', time }`. Worker uses this to prevent trim from cutting ahead of the playhead (which would cause a stall at the trimmed position).

### Measured Latency (verified 2026-04-15)

Measurements taken by comparing DVR OSD timestamp in screenshots against UTC wall clock.
DVR timestamps are in MDT (UTC-6), which matched wall clock after timezone conversion.

| Condition | Lag |
|---|---|
| Steady-state (expanded HD, after reconnect settles) | **~1s** |
| First few seconds after expand (go2rtc buffered data drains) | 2–4s (catches up via playbackRate) |
| After MediaError reconnect | 2–3s reconnect + ~5s to live edge |
| Grid 4-up SD (15fps sub-stream, main-thread MSE fallback) | **~1s** (all 4 cameras within 1s of each other) |
| Grid 4-up HD (30fps main stream, main-thread MSE only) | **40–70s behind; diverges; Left camera reconnects** — NOT VIABLE |
| Grid 4-up HD (30fps main stream, worker MSE Chrome 107+) | **~1s** (3/4 cameras locked to live edge; ch_1 reconnects ~90s) |

### go2rtc fMP4 Codec

go2rtc returns `Content-Type: video/mp4; codecs="avc1.64001F"` which is H264 High profile Level 3.1 — exactly what the DVR outputs. The fallback codec string `avc1.640028` (Level 4.0) in MSEFeed is only used if go2rtc header is missing.

### 4-Stream 30fps Grid via MediaSource-in-Worker (Chrome 107+)

**Root cause of original JS failure**: 4 concurrent async `fetch()` reader loops + 4 `SourceBuffer` `appendBuffer/updateend` callbacks = 120 JS events/second on the main thread. Browser can't drain SourceBuffers fast enough; streams fall 40–70s behind and diverge.

**Solution**: `MediaSource.canConstructInDedicatedWorker` (Chrome 107+) moves the entire SourceBuffer pipeline off the main thread. Each camera spawns a `DedicatedWorker` (created from a Blob URL — works in Vite library mode, unlike `?worker` imports). The worker creates a `MediaSource`, transfers its `MediaSourceHandle` to the main thread via `postMessage`, and the main thread does `video.srcObject = handle`. SourceBuffer work then runs on 4 separate worker threads.

**Architecture (worker MSE path)**:
- Worker: `fetch()` → SourceBuffer (`appendBuffer`, `updateend`, trim) — all off main thread
- Main thread: `video.srcObject`, `video.play()`, `onPlaying` snap, stall watchdog, `playbackRate` drift — same as before
- Worker receives `{ type: 'currentTime', time }` every 3s from watchdog to prevent trim from cutting past the current playhead (which would stall playback)

**Measured result (2026-04-15)**: 3/4 cameras locked at live edge (synchronized to within 0s). Channel_1 (Left) reconnects every ~90s — pre-existing ch_1 stream instability unrelated to workers.

**Fallback**: Falls back to main-thread MSE on Chrome < 107, Firefox, Safari. In that case the grid uses sub-streams (15fps 512kbps) for stability.

### dvr_proxy — Producer-Consumer Queue (www/react-dashboard/dvr_proxy.py)

The original `_proxy_mse_stream` was synchronous (read from go2rtc + write to browser in same thread). Browser TCP backpressure propagated to go2rtc, causing 50%+ packet drops on channels 1 and 4 (high-bitrate night-vision). 

**Fixed architecture**: reader thread reads go2rtc at localhost speed → `queue.Queue(maxsize=128)` (~8MB headroom, absorbs VBR spikes). Main thread writes to browser at browser speed. Reader blocks up to 2s before dropping a chunk (`buf.put(chunk, timeout=2.0)`) — **blocking prevents fMP4 stream corruption**: a `put_nowait` drop of a 65KB raw chunk straddles fMP4 atom boundaries, delivering malformed data to the SourceBuffer → MediaError → reconnect. Blocking means a chunk is only dropped if the browser is stalled for >2s continuously (hardware problem). Result: **0 drops** on all channels; MediaErrors eliminated on HD expanded view.

**Hidden-camera MSE feeds were not paused during expand** (fixed 2026-04-15): `paused` was only set for `mode === 'playback'`. When a camera was expanded, the 3 hidden cameras kept active sub-stream MSE fetch loops running, competing with the expanded HD feed for JS cycles. Fixed: `paused={mode === 'playback' || isHidden}`.

### Critical Notes

- **Both streams are H.264** — main was changed from H.265 to H.264 on the DVR for MSE/WebRTC compatibility.
- **go2rtc.yaml has 8 streams**: `channel_1-4` (main, subtype=0) + `channel_1-4_sub` (sub, subtype=1). go2rtc returns codec `avc1.64001F` in Content-Type.
- **Buffer trim was the cause of 30s stalls** — the old code had two competing `updateend`
  listeners that corrupted the SourceBuffer. Fixed with a single unified handler.
- **Always hard-refresh** (`Ctrl+Shift+R` / `Cmd+Shift+R`) after deploying a new build. Normal refresh serves cached JS and picks up no changes.
- **Camera entity stream_source** (in `.storage/core.config_entries` under `options`)
  must match the go2rtc.yaml URLs.
- **go2rtc config entry** is auto-created with `source: "system"` after restart when
  `go2rtc:` is in configuration.yaml.

---

## DVR Playback System — RTSP Scale, FMP4 Rewriting, Speed Control

The Cameras page includes a **playback mode** for reviewing DVR recordings at 1×–16× speed.
Playback uses the same go2rtc fMP4 pipeline as live streams, but with additional server-side
infrastructure to control DVR playback speed and rewrite timestamps for smooth browser playback.

### Architecture

```
Browser (PlaybackFeed)                    dvr_proxy:8766                        go2rtc:1984
  │                                         │                                     │
  ├─POST /api/playback/start──────────────►│                                     │
  │  {channel, startTime, endTime, speed}   │                                     │
  │                                         ├─DELETE /api/streams?name=playback──►│
  │                                         │  (clean up old stream)              │
  │                                         │  sleep 2s (DVR closes RTSP)         │
  │                                         │                                     │
  │                                         ├─PUT /api/streams?name=playback     │
  │                                         │  &src=rtsp://...Scale proxy...──────►│──RTSP──►DVR:554
  │                                         │                                     │
  ├─GET /api/mse?src=playback─────────────►│──GET /api/stream.mp4?src=playback──►│
  │  (long-lived fMP4 stream)              │  (FMP4Rewriter if speed > 1)        │
  │                                         │                                     │
  ├─POST /api/playback/speed──────────────►│  (estimate position, DELETE+PUT     │
  │  {speed: 8}                            │   new stream with new Scale)        │
  │                                         │                                     │
  ├─POST /api/playback/stop──────────────►│──DELETE /api/streams?name=playback  │
```

### RTSP Scale Header

The DVR supports the RTSP **Scale** header in the `PLAY` request, which instructs it to
deliver video at N× real-time speed. At Scale > 1, the DVR sends **I-frames only** (keyframes),
skipping P/B-frames. This is the standard RTSP trick-play mechanism (RFC 2326 §12.34).

**Speed → Scale mapping** (`dvr_proxy.py`):

| Speed | Scale | Route | Frame delivery |
|---|---|---|---|
| 1× | None (no header) | Direct to DVR:554 | All frames (H.264 full stream) |
| 2× | 2.000 | Scale proxy:8767 | I-frames only, ~2× real-time delivery |
| 4× | 4.000 | Scale proxy:8767 | I-frames only, ~4× |
| 8× | 8.000 | Scale proxy:8767 | I-frames only, ~8× |
| 16× | 16.000 | Scale proxy:8767 | I-frames only, ~16× |

**Why 1× bypasses the proxy**: At 1×, no Scale header is needed — go2rtc connects directly
to the DVR. The proxy adds latency and is unnecessary for normal-speed playback.

### RTSP Scale Proxy (port 8767)

A **transparent TCP proxy** between go2rtc and the DVR that intercepts RTSP `PLAY` requests
and injects the `Scale:` header. All other traffic (SETUP, DESCRIBE, RTP data, RTCP) passes
through unchanged.

**How it works:**
1. go2rtc connects to `127.0.0.1:8767` (thinking it's the DVR)
2. Proxy opens a connection to the real DVR at `192.168.10.156:554`
3. Client→DVR direction: proxy parses RTSP messages, looking for `PLAY` requests
4. On `PLAY`: strips any existing `Scale:` header, appends `Scale: N.000`
5. DVR→Client direction: all data forwarded unchanged (including RTP interleaved data)
6. Session times out after 15 minutes

**RTSP message parsing**: The proxy handles both RTSP text messages (terminated by `\r\n\r\n`)
and interleaved RTP/RTCP data (prefixed by `$` + 1-byte channel + 2-byte length). This is
critical because RTSP over TCP multiplexes control and media on the same connection.

### FMP4 Timestamp Rewriter

**Problem**: At Scale > 1, the DVR sends I-frames with **compressed RTP timestamps** — all
frames are clustered within <0.5s of media time. When the browser's MSE SourceBuffer receives
these, it plays through all frames in <1 second then stalls, waiting for more data. The result
is a rapid burst of frames followed by a freeze, repeating every few seconds.

**Solution**: `FMP4Rewriter` (in `dvr_proxy.py`) rewrites the fMP4 `moof` boxes on the fly
as they flow through the proxy, spacing each fragment evenly at 2-second intervals.

**Constants:**
```python
_FMP4_TIMESCALE = 90000       # H.264 RTP 90kHz clock
_FMP4_TARGET_DUR = 180000     # 2 seconds per fragment (180000 / 90000)
```

**What it rewrites in each `moof` box:**
1. **`tfdt` (Track Fragment Decode Time)**: Sets `baseMediaDecodeTime = frag_idx × 180000`
   - Fragment 0 → 0, Fragment 1 → 180000, Fragment 2 → 360000, ...
   - Handles both 32-bit (version 0) and 64-bit (version 1) `tfdt` boxes
2. **`tfhd` (Track Fragment Header)**: Sets `default_sample_duration = 180000`
   - Only if the `default-sample-duration-present` flag (0x000008) is set
   - Parses variable-length fields (base_data_offset, sample_description_index) to locate the duration field

**Activation**: Only applied when `stream_name == "playback"` and `_playback_scale > 1.0`.
At 1× speed, the rewriter is not instantiated — timestamps from the DVR are already correct.

**Result**: Browser sees frames spaced at 0s, 2s, 4s, 6s, 8s... — smooth, even playback
at any speed with no stalls or bursts.

### Playback API Endpoints

#### `POST /api/playback/start`

```json
{ "channel": 1, "startTime": "2026-04-15 14:23:45", "endTime": "2026-04-15 15:00:00", "speed": 2 }
```

**Sequence:**
1. DELETE existing `playback` stream from go2rtc (cleanup previous session)
2. Sleep 2s — DVR needs time to close the old RTSP session
3. Build RTSP URL via `_build_playback_url()` — routes through Scale proxy if speed > 1
4. PUT new `playback` stream to go2rtc with the RTSP URL
5. Update `_playback_state` (channel, time range, speed, `time.time()` of start)

**RTSP URL format**: `rtsp://admin:PASS@HOST:PORT/cam/playback?channel=N&subtype=0&starttime=YYYY_MM_DD_HH_MM_SS&endtime=YYYY_MM_DD_HH_MM_SS`

**Time format**: DVR expects `_`-delimited timestamps (e.g. `2026_04_15_14_23_45`). The API
accepts human-readable `YYYY-MM-DD HH:MM:SS` and converts internally. All times are in **DVR
local time** (not UTC).

#### `POST /api/playback/speed`

```json
{ "speed": 8 }
```

Changes speed mid-playback without requiring the user to pick a new time:
1. Estimate current DVR position: `current = startTime + elapsed_real × old_speed`
2. Build new RTSP URL from estimated position to endTime with new speed
3. DELETE + PUT the go2rtc stream (same as start)
4. Frontend remounts `PlaybackFeed` with new key to pick up new stream

#### `POST /api/playback/stop`

Deletes the `playback` stream from go2rtc, resets `_playback_scale` to 1.0, clears state.

#### `GET /api/timeline?channel=N&date=YYYY-MM-DD`

Queries the DVR's recording index via the Dahua `mediaFileFind` CGI API. Returns segments:
```json
{
  "segments": [
    { "start": "2026-04-15 14:23:45", "end": "2026-04-15 14:53:47", "flags": "..." },
    { "start": "2026-04-15 15:10:22", "end": "2026-04-15 15:40:15", "flags": "..." }
  ],
  "channel": 1, "date": "2026-04-15"
}
```

Uses Dahua's `factory.create` → `findFile` → `findNextFile` → `destroy` session pattern
(up to 500 segments per query).

#### `GET /api/date-range?channel=N`

Returns `{ "min_date": "...", "max_date": "..." }` — the oldest and newest recording
timestamps for the date picker bounds.

### PlaybackFeed Component (Cameras.tsx)

The `PlaybackFeed` React component handles DVR playback streaming (separate from `MSEFeed`
which handles live). Key differences from live:

- **Main-thread MSE only** — no worker path (single stream, no 4-up competition)
- **SourceBuffer mode**: `segments` (not `sequence`) — DVR timestamps are rewritten to be
  monotonically increasing, so `segments` mode works correctly and allows seeking
- **Buffer**: Keeps last 30s (vs 20s for live), trims at 90s (vs 60s for live)
- **Initial buffer threshold**: 100KB at 1× (full frames), 10KB at 2×+ (I-frames only)
- **Initial seek**: On first sufficient buffer, seeks to `bufferStart + 0.1` (speed > 1)
  or `bufferStart` (1×) and calls `play()`

**Stall watchdog (every 3s):**
- If `currentTime` is behind `bufferStart`, seek to `bufferStart + 0.5` (DVR recordings
  have non-zero timestamps)
- Stall count ≤ 3 (9s): nudge with `play()` (avoids non-keyframe seeks)
- Stall count > 3 with data ahead: seek forward 5s to next keyframe
- No buffer growth for 30s: stream is dead → error callback

**Adaptive playback rate (speed > 1, checked every 1s):**

| Buffer ahead | Action |
|---|---|
| < 0.5s | Drop to 1.0× (nearly empty, let DVR catch up) |
| 0.5–2.0s | Ease to `speed × 0.7` (thin buffer, prevent underrun) |
| 2.0–8.0s | Full target speed (healthy buffer) |
| > 8.0s | Speed up to `speed × 1.2` (burn excess, capped at 16) |

This is necessary because the DVR delivers at ~N× rate (due to Scale), but network jitter
means the buffer can temporarily thin out or balloon. The adaptive rate keeps playback smooth.

### Playback UI — PlaybackMode Component

**Mode switching**: The Cameras page has three modes — `live` (default), `playback`, and
`expanded` (single camera zoom). Switching to playback mode stops all live MSE feeds.

**Timeline**: Clicking a date fetches `/api/timeline` segments. Segments are displayed as
colored bars. Clicking a time on the timeline calls `startPlayback()`.

**`findExtendedEndTime()` helper**: When the user clicks a time, the frontend finds the
DVR segment containing that time and then walks forward through contiguous segments (gap ≤ 5s)
to extend the endTime. This prevents playback from stopping at a segment boundary when the
DVR has continuous recording split across multiple files.

**Speed buttons**: [1×, 2×, 4×, 8×, 16×]. Changing speed calls `POST /api/playback/speed`
then remounts `PlaybackFeed` with a new React key (forces fresh MSE connection to pick up
the new Scale-routed stream).

### DVR Playback Quirks & Lessons Learned

- **DVR segment boundaries**: The Lorex splits recordings into ~30-minute files. Adjacent
  segments are contiguous (gap < 1s). `findExtendedEndTime()` handles this by walking
  forward with a 5s gap threshold.
- **2s sleep after DELETE**: Absolutely required. Without it, the DVR rejects the new RTSP
  SETUP because it's still tearing down the previous session. go2rtc retries, but the first
  attempt fails and adds latency.
- **Scale proxy session timeout**: 15 minutes max. For very long playback sessions, the proxy
  session will end and go2rtc will reconnect (transparent to the user via MSE reconnect).
- **fMP4 timescale is 90kHz**: The DVR outputs H.264 with a 90kHz RTP clock. All timestamp
  arithmetic in FMP4Rewriter uses this timescale. The target duration of 180000 ticks = 2.0s.
- **I-frame interval at Scale > 1**: DVR sends roughly one keyframe per 2 seconds of real-time
  DVR content. At 8× this means ~4 I-frames per second of wall-clock time.
- **No MAF/MAP for fuel rate**: Unrelated to cameras but noted here — the Ford ECU doesn't
  support MAF (0x10) via standard OBD, only Ford Mode 22 MAP (`22F404`).
- **Measured playback stability** (verified 2026-04-15):
  | Speed | Duration tested | Result |
  |---|---|---|
  | 1× | 10+ min | Stable |
  | 2× | 12+ min DVR content | Stable |
  | 4× | 7+ min DVR content | Stable |
  | 8× | 9+ min DVR content | Stable |
  | 16× | 15+ min DVR content | Stable |
