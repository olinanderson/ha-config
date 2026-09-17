# Automations & Modes

## Modes / Routines

| Mode | Script ON | Script OFF | Description |
|---|---|---|---|
| **Power Saving** | `script.power_saving_mode_on` | `script.power_saving_mode_off` | Lights off, monitors off, water off; auto on leaving/driving |
| **Sleep Mode** | `script.sleep_mode_on` | `script.wake_up_routine` | Pre-bed wind-down: monitors off, lights dim (cabinet 70% / skylight 40% / main 10%), all off after 5 min. Cancel mid-wind-down restores prior state; turning off after it completes runs the morning wake-up. Starlink: start +30 min, default 1 AM MST on off |
| **Shower Mode** | `script.shower_mode_on` | `script.shower_mode_off` | Lights 100%, water recirc, roof fan exhaust 60% |
| **Cook Mode** | `script.cook_mode` | `script.cook_mode_off` | LPG valve open, lights 100%, roof fan exhaust 60% |
| **Bedtime** | `script.bedtime_routine` | — | Progressive 10-min shutdown |
| **Night Climate** | `input_select.night_climate_mode` (Tonight card) | wake time / Sleep Mode off | What runs tonight: **Program** (15 °C night hold, warm-up to 23 °C for the wake time; heater below target − 1, A/C above target + 2 on shore power), **Fan all night**, **A/C all night**, **Heater**. Sleep Mode on starts the Program; the wake time ends it and Sleep Mode. See *Night Climate* below |

### Night Climate (Tonight card)

`input_select.night_climate_mode` is what runs tonight; anything but **Off** is live until the wake time
(`input_datetime.night_climate_wake_time`, 07:30). Built 2026-09-17.

| Mode | What it does |
|---|---|
| **Program** | Holds `sensor.night_climate_target`: the night target (`input_number.night_climate_night_target`, 15 °C) until *wake time − warm-up* (`input_number.night_climate_warmup_minutes`, 45), the wake target (`input_number.night_climate_wake_target`, 23 °C) from then on. Heater when the room is below target − 1 °C, off again above target + 2 °C; A/C above target + 2 °C, only on shore power (`sensor.shore_power_charger_power_24v` > 50 W), 30-min dwell between on/off, off below target − 0.5 °C; between the bands whatever runs holds its own thermostat. `input_boolean.night_climate_use_heater` / `_use_ac` allow each. Roof fan: `_use_fan` is reserved until the remote's Auto-temp IR frames are captured |
| **Fan all night** | Roof fan at `input_number.night_climate_fan_speed` (30 %) in `input_select.night_climate_fan_direction` (Intake), lid open (ceiling-fan mode left first); A/C off; heater untouched |
| **A/C all night** | A/C on its own thermostat at the target (clamped to the unit's 16–32 °C), fan level 1; shore power only, switched off if shore drops; roof fan off; heater untouched |
| **Heater** | Thermostat at the target; fan and A/C off |

Hooks: Sleep Mode on → Program (only if the mode was Off); Sleep Mode off → Off. The wake time sets the
mode to Off (fan and A/C off; the heater is left where the warm-up put it) and runs
`script.wake_up_routine`. The daily 07:30 scheduler entry (`switch.schedule_55e88d`, heater to 26 °C) is
the morning set point and runs whether or not the program ran, so the wake automation does not touch the
heater (two writers at 07:30 would race). Do not pause that entry: it was paused for one night on
2026-09-17 and, with Sleep Mode never switched on, nothing heated the van (16.9 °C at 08:00).

Room temperature: `sensor.living_space_temperature` = median of BME280_1 (only while
`sensor.inverter_power_24v` < 60 W), BME280_3 (only while the blower air is < 40 °C) and the Kidde (only if
updated within 15 min), BME280_1 as the fallback; attribute `sources` says which counted.
`sensor.night_climate_status` is the one-line summary the Tonight card shows.

Files: `template/night_climate.yaml`; `scripts.yaml` (`night_climate_heater_to` / `_fan_on` / `_ac_on` /
`_actuators_off`, each checks before it sends, since the fan and the A/C beep on every IR frame);
`automations.yaml` (`night_climate_controller` every 5 min and on any setting change,
`night_climate_start_on_sleep`, `night_climate_stop_on_sleep_off`, `night_climate_mode_off`,
`night_climate_wake`); `react-dashboard/src/components/TonightCard.tsx`.

Still to do: capture the fan remote's Auto-temp frames on the AG Pro (`remote_receiver` GPIO23, `dump: all`;
stream `esphome logs esphome/a8-pro.yaml` while the remote is pointed at the AG Pro), add them as scripts on
the AG Pro, then give the Program a fan branch that uses the fan's own thermostat.

### Dynamic Scenes (runtime via `scene.create`)
- `scene.last_active_state` — rolling 1Hz snapshot
- `scene.pre_cook_mode` / `scene.pre_sleep_mode_lights` / `scene.pre_shower_mode_state`

## Key Automations

| ID / Alias | Purpose |
|---|---|
| `starlink_*` (×5) | GPS tracking: bootstrap, 1Hz refresh/publish, start/stop snapshots |
| Main Lighting Sync | Physical switch ↔ LED dimmer brightness sync |
| `shore_charger_*` | Manual enable sync + SOC-based power-cycle reset |
| `iphone_home_arrival` | Welcome TTS when returning after 15+ min |
| `auto_power_saving_when_away` | Radar presence (`van_occupied`: on after 2 s, off after 3 min) → power saving on/off; a physical monitor rocker press also ends power saving at once |
| `auto_power_saving_when_driving` | Driving → power saving |
| `bed_power_auto_off_30s` | Safety: bed motor auto-off |
| `keep_home_zone_on_starlink` | Move HA home zone to u-blox GPS (`device_tracker.ublox_gps`) every 5 min |
| `rolling_last_active_snapshot_1hz` | 1Hz scene snapshot |
| Shelly EM 1s ping | Update inverter detection every second |
| `night_climate_*` (×5) | Night Climate: controller (5-min loop), start with Sleep Mode, stop with Sleep Mode, fan + A/C off when the mode goes Off, wake time |
| `syncthing_start_on_boot` | Start Syncthing 30s after HA boot |
| `dvr_proxy_start_on_boot` | Start DVR proxy 40s after HA boot |

## Voice Assistant

| Intent | Triggers | Action |
|---|---|---|
| `RoofFanTurnOn` | "turn on the roof fan" | Lid open → intake → fan on |
| `RoofFanTurnOff` | "shut off the roof fan" | Fan off → lid close |
| `CookModeStart/Stop` | "start/stop cook mode" | Scripts |
| `StartBedtimeRoutine` | "goodnight" / "bedtime" | `script.sleep_mode_on` |
| `GoodMorning` | "good morning" / "wake up" | `script.wake_up_routine` |
| `IndoorDimmersOff/On` | "turn off/on the lights" | All 4 LED controllers |

## Inverter Detection

No direct on/off entity. Inferred via Shelly EM ping:
- `button.a32_pro_inverter_on_off_toggle` — momentary press to toggle
- `binary_sensor.shelly_em_reachable` — status display
- Dashboard shows "Loading…" for 15s after press, clears on state change
