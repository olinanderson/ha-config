# Copilot Instructions — Home Assistant (Olin's Van)

> **⚠ NETWORK DRIVE WARNING**: This `config/` folder lives on the Home Assistant host
> and is shared over the network via **Tailscale / SMB** (`\\homeassistant\config`).
> File operations may **hang or time out** if the Tailscale tunnel is slow or the HA
> host is under load. If a file read/write stalls, retry once — don't assume failure.
> Prefer **reading large chunks** over many small reads to minimize round-trips.

---

## Overview

This is a **Home Assistant** instance (version **2025.7.1**) running on a **camper van / RV**
(referred to as "Olin's van"). The system manages all electrical, climate, water, vehicle,
entertainment, and safety subsystems for full-time van life.

---

## System Architecture

### Hardware Platform

| Device | Role | Protocol |
|---|---|---|
| **Simarine A32 Pro** (ESP32-S3) | Primary controller — switches, sensors, MPPT, tank levels, BME280s, S5140 current sensors, DAC outputs | ESPHome via WiFi |
| **AG Pro** (ESPHome) | Roof fan (speed, direction, lid), additional controls | ESPHome via WiFi |
| **WiCAN OBD** | Vehicle OBD2 data — speed, fuel, RPM, coolant temp, throttle, engine load | MQTT (`wican/` topics) |
| **Starlink** | Internet + GPS location tracking | Native integration + MQTT filtered tracker |
| **Apollo MSR-2** | mmWave radar presence/occupancy sensor | ESPHome |
| **Shelly EM** | AC power monitoring (inverter output voltage, power) | Native integration (ping-based) |
| **Olins Van BMS** | Battery management — SOC, voltage, current, temperature, cycles, stored energy | BLE via `bms_ble` custom component |
| **Victron MPPT** (×2) | Solar charge controllers (MPPT1 & MPPT2) — PV power, output voltage/current, yield | BLE via `victron_ble` ESPHome component |
| **Pro Check F317** | Propane tank ultrasonic level sensor | BLE |
| **Kidde HomeSafe** | CO/smoke detection | `kidde_homesafe` custom component |
| **Zigbee2MQTT** | Zigbee device gateway | MQTT bridge |
| **VLC Telnet** | Media player for TTS and audio | Media player integration |
| **OpenAI TTS** | Text-to-speech via GPT-4o-mini-tts | `openai_tts` custom component |

### Network

- Router: **MoFi** at `192.168.10.1` (OpenWrt/LuCI device tracking)
- HA Host SSH: port `22222` on `172.30.32.1` (used for PulseAudio ducking & Scream audio)
- Inverter monitoring: Shelly EM pinging at `192.168.10.174`
- Remote access: **Tailscale** VPN — the config share is `\\homeassistant\config`

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
themes/mushroom/                # Mushroom UI theme
www/                            # Static web assets
zigbee2mqtt/                    # Zigbee2MQTT config
.storage/                       # HA storage (dashboards, registries, etc.)
.github/
  copilot-instructions.md       # THIS FILE
  dashboard-editing-reference.md
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
| `sensor.a32_pro_hydronic_heater_power_supply_lockout_status` | Lockout status text |
| `sensor.a32_pro_coolant_blower_heating_pid_climate_result` | PID output (0–1) |
| `light.a32_pro_a32_pro_dac_0` | Blower matrix (DAC fan speed as light entity) |
| `switch.a32_pro_fan_override_manual_on_off` | Fan manual override |

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

### Vehicle / OBD (WiCAN MQTT)
| Entity | Description |
|---|---|
| `sensor.wican_speed` | Speed (km/h) |
| `sensor.wican_fuel` | Fuel tank level (%) — raw, noisy |
| `sensor.wican_fuel_5_min_mean` | 5-min rolling mean fuel |
| `sensor.stable_fuel_level` | Template: sticky fuel (updates only when stable) |
| `sensor.wican_coolant_temperature` | Engine coolant (°C) |
| `sensor.wican_rpm` | Engine RPM |
| `sensor.wican_throttle_position` | Throttle (%) |
| `sensor.wican_engine_load` | Engine load (%) |
| `sensor.wican_control_module_voltage` | ECU voltage (V) |
| `sensor.wican_ambient_air_temperature` | OBD ambient air temp (°C) |
| `sensor.wican_distance_mil_on` | Distance since check engine (km) |
| `binary_sensor.wican_connected` | WiCAN online/offline |

### Vehicle Movement (template binary_sensors)
| Entity | Description |
|---|---|
| `binary_sensor.vehicle_is_moving` | speed > threshold AND engine running |
| `binary_sensor.vehicle_is_stable` | acceleration ≤ threshold |
| `binary_sensor.engine_is_running` | OBD data fresh (< 120s) |

### GPS / Location
| Entity | Description |
|---|---|
| `device_tracker.starlink_device_location` | Raw Starlink GPS |
| `device_tracker.filtered_starlink_location` | MQTT filtered GPS (1Hz while moving) |
| `device_tracker.starlink` | Starlink tracker (used for home zone) |
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
| `sensor.ambient_air_temp_last` | Sticky last-good OBD ambient temp |
| `sensor.coolant_temp_last` | Sticky last-good coolant temp |
| `sensor.road_grade_percent_last` | Sticky last-good road grade % |

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
| `shore_charger_*` | Manual enable sync + SOC-based power-cycle reset |
| `iphone_home_arrival` | Welcome TTS when returning after 15+ min |
| `auto_power_saving_when_away` | Radar presence → power saving on/off |
| `auto_power_saving_when_driving` | Driving → power saving (30s on, 2min off) |
| `bed_power_auto_off_30s` | Safety: bed motor auto-off |
| `keep_home_zone_on_starlink` | Move HA home zone to Starlink GPS every 5 min |
| `rolling_last_active_snapshot_1hz` | 1Hz scene snapshot of lights/monitors/water |
| `shower_mode_on_actions` / `_off_restore` | Shower mode setup + restore |
| Shelly EM 1s ping | Update inverter detection every second |
| Inverter pending clear | Clear pending flag when ping state changes |
| Bootstrap ducking / Scream | Start audio ducking + Scream receiver on HA boot |

---

## Tips for Copilot

- The van runs a **24V LiFePO4** battery. Power = current × `sensor.olins_van_bms_voltage`
  (24V) or × `sensor.a32_pro_smart_battery_sense_12v_voltage` (12V).
- **Inverter detection** is indirect: ping Shelly EM → if reachable, AC is live.
- **Propane %** uses hemisphere+cylinder geometry with 80% fill rule.
- **Fuel level** is noisy from OBD — use `sensor.stable_fuel_level` or `sensor.wican_fuel_5_min_mean`.
- **Roof fan direction**: `forward` = exhaust, `reverse` = intake.
- **Scenes are all dynamic** — `scenes.yaml` is empty. They're created via `scene.create` in scripts/automations.
