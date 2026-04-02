# Dashboard Editing Reference

> Quick-reference for editing Home Assistant Lovelace dashboards via Copilot.
> Full entity list and system docs: see `.github/copilot-instructions.md`.

## Dashboard Status

| File | Status | Notes |
|---|---|---|
| `old_home.yaml` | ✅ **ACTIVE** | Real entity IDs, Mushroom + custom cards, sections layout |
| `main_overview.yaml` | 🟡 Partial | Some real IDs, basic entity/gauge cards |
| `climate_control.yaml` | 🔴 **FAKE IDs** | Needs full rewrite with real entities |
| `power_energy.yaml` | 🔴 **FAKE IDs** | Needs full rewrite with real entities |
| `lighting_electrical.yaml` | 🔴 **FAKE IDs** | Needs full rewrite with real entities |
| `water_system.yaml` | 🔴 **FAKE IDs** | Needs full rewrite with real entities |
| `vehicle_travel.yaml` | 🔴 **FAKE IDs** | Needs full rewrite with real entities |
| `propane_safety.yaml` | 🔴 **FAKE IDs** | Needs full rewrite with real entities |
| `diagnostics_maintenance.yaml` | 🔴 **FAKE IDs** | Needs full rewrite with real entities |
| `entertainment_media.yaml` | 🔴 **FAKE IDs** | Needs full rewrite with real entities |
| `automation_scenes.yaml` | 🔴 **FAKE IDs** | Needs full rewrite with real entities |

## Rewrite Priority

1. **climate_control.yaml** — Hydronic heater PID, BME280 temps, roof fan
2. **power_energy.yaml** — Battery, solar, power flow, energy tracking
3. **lighting_electrical.yaml** — 4 LED controllers, switches, monitors
4. **water_system.yaml** — Tank levels, water modes, grey valve
5. **vehicle_travel.yaml** — WiCAN OBD data, GPS, road grade, fuel
6. **propane_safety.yaml** — Propane tank, LPG valve, Kidde sensors
7. **entertainment_media.yaml** — Starlink, speedtest, audio, monitors
8. **diagnostics_maintenance.yaml** — System health, ESPHome status
9. **automation_scenes.yaml** — Mode toggles, automation status

## Entity Quick-Lookup by Dashboard

### Climate Control
```
climate.a32_pro_van_hydronic_heating_pid
switch.a32_pro_switch24_hydronic_heater
sensor.a32_pro_hydronic_heater_power_supply_lockout_status
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
sensor.wican_speed
sensor.wican_fuel
sensor.stable_fuel_level
sensor.wican_coolant_temperature
sensor.wican_rpm
sensor.wican_throttle_position
sensor.wican_engine_load
sensor.wican_control_module_voltage
sensor.wican_ambient_air_temperature
sensor.wican_distance_mil_on
binary_sensor.wican_connected
binary_sensor.vehicle_is_moving
binary_sensor.vehicle_is_stable
binary_sensor.engine_is_running
device_tracker.filtered_starlink_location
sensor.road_grade_deg
sensor.road_grade_percent
sensor.hill_aggression
sensor.ambient_air_temp_last
sensor.coolant_temp_last
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

### Modes / Input Helpers (for Automation & Scenes dashboard)
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
