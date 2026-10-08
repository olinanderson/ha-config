# Dashboard Editing Reference

> Quick reference for editing the van's Home Assistant dashboards.
> Full entity list and system docs: see `.github/copilot-instructions.md`.

## How the dashboards work (checked 2026-10-08)

- **Lovelace runs in storage mode.** `configuration.yaml` has `lovelace: mode: storage`
  and no `dashboards:` key, so every Lovelace dashboard lives in HA's `.storage/`
  (`lovelace_dashboards` lists them, `lovelace.<id>` holds each config), not in git.
- **`dashboards/` is an archive.** HA never loads those YAML files (`old_home*.yaml`,
  `*_v2.yaml`, `van.yaml`, `map.yaml` ...), so editing them changes nothing, and
  `deploy.sh` ignores the folder (89ff714). `lovelace_resources.yaml` isn't loaded
  either: the card resources are in storage too (websocket `lovelace/resources`).
- **The React dashboard** in `react-dashboard/` is separate: a `panel_custom` at
  `/dashboard` ("Dashboard" in the sidebar). Build it with
  `cd react-dashboard && bash deploy.sh`, commit the bundle in `www/react-dashboard/`,
  then run the top-level `deploy.sh`. More under "React Dashboard Panel" in
  copilot-instructions.md.

### The 17 Lovelace dashboards

`lovelace/dashboards/list` gives the current list. Only the three raw device
dashboards are in the sidebar; the rest open by URL (`/<url_path>`).

| url_path | Title | Notes |
|---|---|---|
| `lovelace` | Overview | the default dashboard (`url_path` null works too) |
| `dashboard-home` | Home | |
| `dashboard-van` | Van | |
| `dashboard-lights` | Lights | |
| `dashboard-hvac` | HVAC | |
| `dashboard-climate` | Weather | |
| `dashboard-bms` | Water Systems | |
| `dashboard-sensors` | Bed | |
| `dashboard-ir` | IR | |
| `roof-fan` | Roof Fan | |
| `map` | Map | |
| `security-cameras` | Security Cameras | admin only |
| `research-development` | Research & Development | |
| `input-numbers` | Input Numbers | |
| `raw-a32-pro-control` | Raw A32 Pro Control | sidebar, admin only |
| `raw-a-8-pro` | Raw AG Pro | sidebar, admin only |
| `mtr-2-radar` | Raw Apollo MTR-2 | sidebar |

### Editing one

- **In the UI:** open `/<url_path>`, then ⋮ → Edit dashboard → Raw configuration editor.
  A save is live at once; there is nothing to reload or deploy.
- **From a script:** the websocket command `lovelace/config` reads a config, and
  `lovelace/config/save` (`url_path`, `config`) replaces all of it. Pipe a Python script
  to `ssh hassio@100.80.15.86 'sudo docker exec -i homeassistant python3 -'`; the
  container has aiohttp, and the script reads the token from `/config/.gps_filter_token`
  without printing it.
- **Back up first:** save the current config to
  `/config/vanlife-data/lovelace_backup_<date>/<url_path>.json` (git-ignored, not served).
  Never put backups in `/config/www`: it is public at `/local/` without a login. To undo,
  send the JSON back with `lovelace/config/save`. After a save, read the config back and
  compare.
- **Don't hand-edit `.storage/lovelace*` while HA runs.** HA won't see the edit until a
  restart, and its next save overwrites it.
- **Custom cards** must be in `lovelace/resources` (HACS adds them). A card whose type
  isn't there shows an error; config-template-card and meteogram-card aren't installed.

### Checking for dead entity IDs

1. Existing IDs: `get_states` plus `config/entity_registry/list`.
2. For the default dashboard and every url_path from `lovelace/dashboards/list`, fetch
   `lovelace/config` and match `domain.object_id` with a word-boundary regex.
3. Skip action names such as `input_boolean.toggle`, `script.turn_on` and `switch.toggle`
   (`get_services` lists them all).
4. Fix card by card, not with a global string replace: some live IDs start the same way
   as dead ones.

## Entity Quick-Lookup by Topic

All 103 IDs below were checked against HA on 2026-10-08.

### Climate Control
```
climate.a32_pro_van_hydronic_heating_pid
switch.a32_pro_switch24_hydronic_heater
sensor.a32_pro_hydronic_heater_status          # status text (replaced the lockout sensor)
sensor.a32_pro_coolant_blower_heating_pid_climate_result
light.a32_pro_a32_pro_dac_0                    # blower matrix
sensor.a32_pro_s5140_channel_34_temperature_blower_coolant
sensor.a32_pro_s5140_channel_35_temperature_blower_air
sensor.a32_pro_bme280_1_temperature            # living area
sensor.a32_pro_bme280_2_temperature            # cab
sensor.a32_pro_bme280_3_temperature            # shower
sensor.a32_pro_bme280_4_temperature            # outdoor
sensor.a32_pro_bme280_1_relative_humidity      # (same pattern for 2/3/4)
fan.ag_pro_roof_fan
cover.ag_pro_roof_fan_lid
sensor.roof_fan_direction
sensor.air_conditioning_power_24v
```

### Power & Energy
```
sensor.olins_van_bms_battery                   # SOC %
sensor.olins_van_bms_voltage                   # 24V
sensor.olins_van_bms_current                   # amps
sensor.olins_van_bms_power                     # watts
sensor.olins_van_bms_stored_energy             # Wh
sensor.olins_van_bms_temperature
sensor.olins_van_bms_cycles
sensor.olins_van_bms_delta_voltage
sensor.battery_charging                        # template W
sensor.battery_discharging                     # template W
sensor.a32_pro_mppt1_pv_power
sensor.a32_pro_mppt2_pv_power
sensor.total_mppt_pv_power
sensor.total_mppt_yield_today                  # Wh
sensor.a32_pro_smart_battery_sense_12v_voltage # 12V rail
sensor.alternator_charger_power_24v
sensor.shore_power_charger_power_24v
sensor.inverter_power_24v
sensor.air_conditioning_power_24v
sensor.all_24v_devices_power_24v
sensor.all_12v_devices_power_24v
# Energy (Wh): sensor.*_energy_wh for each power sensor
```

### Lighting & Electrical
```
light.led_controller_cct_1                     # main/roof
light.led_controller_cct_2                     # under-cabinet
light.led_controller_sc_1                      # shower
light.led_controller_sc_2                      # accent
input_number.main_light_warmth                 # CCT slider
switch.a32_pro_do8_switch06_top_monitor
switch.a32_pro_do8_switch07_bottom_monitor
switch.a32_pro_do8_switch04_shore_power_charger
button.a32_pro_inverter_on_off_toggle
binary_sensor.192_168_10_174                   # inverter AC live
input_boolean.inverter_toggle_pending
input_boolean.shore_power_charger_enabled
```

### Water System
```
sensor.a32_pro_fresh_water_tank_level
sensor.a32_pro_grey_water_tank_level
switch.a32_pro_water_system_master_switch
switch.a32_pro_water_system_state_main
switch.a32_pro_water_system_state_recirculating_shower
switch.a32_pro_switch06_grey_water_tank_valve
```

### Vehicle & Travel
```
# WiCAN Pro OBD PIDs (mqtt/sensors.yaml), unavailable while the engine is off
sensor.192_168_10_90_0d_vehiclespeed
sensor.192_168_10_90_2f_fueltanklevel          # raw
sensor.stable_fuel_level                       # smoothed
sensor.192_168_10_90_05_enginecoolanttemp
sensor.192_168_10_90_0c_enginerpm
sensor.192_168_10_90_11_throttleposition
sensor.192_168_10_90_04_calcengineload
sensor.192_168_10_90_42_controlmodulevolt
sensor.192_168_10_90_46_ambientairtemp
binary_sensor.meatpi_pro_ecu_status            # WiCAN ECU status
binary_sensor.vehicle_is_moving
binary_sensor.vehicle_is_stable
binary_sensor.engine_is_running
device_tracker.ublox_gps_filtered
sensor.road_grade_deg
sensor.road_grade
sensor.hill_aggression
sensor.ambient_air_temp_last_good
sensor.coolant_temp_last_good
```

### Propane & Safety
```
sensor.propane_tank_percentage
sensor.propane_liquid_volume
sensor.propane_liquid_depth
sensor.pro_check_f317_tank_level               # raw mm
switch.a32_pro_switch16_lpg_valve              # LPG valve
# Kidde sensors (entity IDs from integration — check HA for exact names)
```

### Entertainment & Media
```
sensor.starlink_downlink_throughput_mbps
sensor.starlink_uplink_throughput_mbps
sensor.speedtest_download
sensor.speedtest_upload
sensor.speedtest_ping
binary_sensor.starlink_ethernet_speeds
input_boolean.speedtest_running
media_player.vlc_telnet
switch.a32_pro_do8_switch06_top_monitor
switch.a32_pro_do8_switch07_bottom_monitor
input_boolean.windows_audio_stream
```

### Modes / Input Helpers
```
input_boolean.power_saving_mode
input_boolean.sleep_mode
input_boolean.shower_mode
input_boolean.shore_power_charger_enabled
script.power_saving_mode_toggle
script.cook_mode
script.cook_mode_off
script.bedtime_routine
script.sleep_mode_on
script.wake_up_routine
script.shower_mode_on
script.shower_mode_off
script.inverter_toggle
script.inverter_ensure_on
script.inverter_ensure_off
script.all_lights_toggle
script.update_speedtest
```
