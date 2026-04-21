# Entity Reference

> **CRITICAL**: Always use these real IDs. Placeholder dashboards used fabricated IDs
> like `sensor.a32_battery_voltage` — those do NOT exist.

## Battery / BMS
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

## Solar / MPPT
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

## 12V System
| Entity | Description |
|---|---|
| `sensor.a32_pro_smart_battery_sense_12v_voltage` | 12V rail (24V→12V converter output) |

## Temperature / Humidity (BME280 × 4)
| Entity | Location |
|---|---|
| `sensor.a32_pro_bme280_1_temperature` / `_relative_humidity` | Living area |
| `sensor.a32_pro_bme280_2_temperature` / `_relative_humidity` | Cab |
| `sensor.a32_pro_bme280_3_temperature` / `_relative_humidity` | Shower |
| `sensor.a32_pro_bme280_4_temperature` / `_relative_humidity` | Outdoor |

## Current Sensors (S5140 → template power sensors)
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

## Energy Sensors (Riemann integration, Wh)
Pattern: `sensor.*_energy_wh` — one for each power sensor, plus `sensor.mppt1_energy_wh` and `sensor.mppt2_energy_wh`.

## Water System
| Entity | Description |
|---|---|
| `sensor.a32_pro_fresh_water_tank_level` | Fresh water (%) |
| `sensor.a32_pro_grey_water_tank_level` | Grey water (%) |
| `switch.a32_pro_water_system_master_switch` | Water master on/off |
| `switch.a32_pro_water_system_state_main` | Water mode: main |
| `switch.a32_pro_water_system_state_recirculating_shower` | Water mode: recirc shower |
| `switch.a32_pro_switch06_grey_water_tank_valve` | Grey water dump valve |

## Climate / Heating
| Entity | Description |
|---|---|
| `climate.a32_pro_van_hydronic_heating_pid` | PID thermostat |
| `switch.a32_pro_switch24_hydronic_heater` | Hydronic heater relay |
| `sensor.a32_pro_hydronic_heater_status` | Heater status text |
| `sensor.a32_pro_coolant_blower_heating_pid_climate_result` | PID output (0–1) |
| `light.a32_pro_a32_pro_dac_0` | Blower matrix (DAC fan speed as light entity) |
| `switch.a32_pro_fan_override_manual_on_off` | Fan manual override |
| `input_boolean.hot_water_mode` | Hot water mode |
| `input_boolean.heater_low_fuel_lockout` | Low fuel lockout |

## Roof Fan
| Entity | Description |
|---|---|
| `fan.ag_pro_roof_fan` | Fan — speed %, direction (forward=exhaust, reverse=intake) |
| `cover.ag_pro_roof_fan_lid` | Roof hatch open/close |
| `sensor.roof_fan_direction` | Template: "Exhaust" / "Intake" / "Unknown" |

## Lighting
| Entity | Zone |
|---|---|
| `light.led_controller_cct_1` | Main / roof hatch (CCT, dimmable, color_temp) |
| `light.led_controller_cct_2` | Under-cabinet (CCT, dimmable) |
| `light.led_controller_sc_1` | Shower (single color, dimmable) |
| `light.led_controller_sc_2` | Accent / other (single color, dimmable) |

## Switches / Controls
| Entity | Description |
|---|---|
| `switch.a32_pro_do8_switch04_shore_power_charger` | Shore charger relay |
| `switch.a32_pro_do8_switch06_top_monitor` | Top monitor |
| `switch.a32_pro_do8_switch07_bottom_monitor` | Bottom monitor |
| `switch.a32_pro_switch16_lpg_valve` | LPG / propane gas valve |
| `switch.a32_pro_switch27_bed_power_supply` | Bed lift power (auto-off 30s) |
| `switch.a32_pro_switch21_left_outdoor_lights` | Left outdoor lights |
| `switch.a32_pro_switch22_right_outdoor_lights` | Right outdoor lights |
| `switch.a32_pro_switch23_rear_outdoor_lights` | Rear outdoor lights |
| `switch.a32_pro_switch31_lightbar` | Lightbar |
| `switch.a32_pro_switch28_compressor` | Compressor |
| `button.a32_pro_inverter_on_off_toggle` | Inverter toggle (momentary) |
| `binary_sensor.192_168_10_174` | Shelly EM ping → inverter AC is live |
| `binary_sensor.shelly_em_reachable` | Shelly EM reachable (= inverter on) |

## GPS / Location
| Entity | Description |
|---|---|
| `device_tracker.starlink_device_location` | Raw Starlink GPS |
| `device_tracker.filtered_starlink_location` | MQTT filtered GPS (1Hz while moving) |
| `device_tracker.starlink` | Starlink tracker (used for home zone) |

## Propane
| Entity | Description |
|---|---|
| `sensor.pro_check_f317_tank_level` | Raw ultrasonic distance (mm) |
| `sensor.propane_tank_percentage` | Template: calculated % |

## Presence / Occupancy
| Entity | Description |
|---|---|
| `binary_sensor.apollo_msr_2_1731d8_radar_target` | Apollo mmWave radar |

## Weather
| Entity | Description |
|---|---|
| `weather.pirateweather` | PirateWeather forecast |

## Internet / Connectivity
| Entity | Description |
|---|---|
| `sensor.starlink_downlink_throughput_mbps` | Downlink Mbps |
| `sensor.starlink_uplink_throughput_mbps` | Uplink Mbps |
| `sensor.speedtest_download` / `_upload` / `_ping` | Speedtest results |

## Media
| Entity | Description |
|---|---|
| `media_player.vlc_telnet` | VLC (TTS output) |
| `tts.openai_tts_gpt_4o_mini_tts` | OpenAI TTS service |

## Input Helpers
| Entity | Description |
|---|---|
| `input_boolean.power_saving_mode` | Power saving flag |
| `input_boolean.sleep_mode` | Sleep mode flag |
| `input_boolean.shower_mode` | Shower mode flag |
| `input_boolean.shore_power_charger_enabled` | Shore charger manual enable |
| `input_boolean.speedtest_running` | Speedtest in progress |
| `input_boolean.windows_audio_stream` | Windows Scream audio enabled |
| `input_boolean.inverter_toggle_pending` | Inverter toggle in progress |
| `input_boolean.hot_water_mode` | Hot water mode |
| `input_boolean.heater_low_fuel_lockout` | Low fuel heater lockout |
| `input_number.main_light_warmth` | Main light CCT (250–500 mireds) |
| `input_number.shore_charge_reset_threshold` | Shore charger reset SOC % |
| `input_number.acceleration_stability_threshold` | Accel threshold (km/h/s) |
| `input_number.vehicle_stopped_threshold` | Speed threshold for "stopped" |
| `input_text.previous_fuel_level` | Last stable fuel reading |
| `input_text.previous_speed` | Previous speed for accel calc |

## Starlink Sleep
| Entity | Description |
|---|---|
| `time.starlink_sleep_start` | Starlink sleep start time |
| `time.starlink_sleep_end` | Starlink sleep end time |
