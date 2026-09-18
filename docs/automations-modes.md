# Automations & Modes

## Modes / Routines

| Mode | Script ON | Script OFF | Description |
|---|---|---|---|
| **Power Saving** | `script.power_saving_mode_on` | `script.power_saving_mode_off` | Lights off, monitors off, water off; auto on leaving/driving |
| **Sleep Mode** | `script.sleep_mode_on` | `script.wake_up_routine` | Pre-bed wind-down: monitors off, lights dim (cabinet 70% / skylight 40% / main 10%), all off after 5 min. Cancel mid-wind-down restores prior state; turning off after it completes runs the morning wake-up. Starlink: start +30 min, default 1 AM MST on off |
| **Shower Mode** | `script.shower_mode_on` | `script.shower_mode_off` | Lights 100%, water recirc, roof fan exhaust 60% |
| **Cook Mode** | `script.cook_mode` | `script.cook_mode_off` | LPG valve open, lights 100%, roof fan exhaust 60% |
| **Bedtime** | `script.bedtime_routine` | — | Progressive 10-min shutdown |
| **Night Climate** | `input_select.night_climate_mode` (Tonight card) | wake time / Sleep Mode off | What runs tonight: **Program** (15 °C night hold, warm-up to 23 °C for the wake time; heater below target − 1; above target + 2 the roof fan while it is cooler outside, the A/C only above "A/C above" on shore power), **Fan all night**, **A/C all night**, **Heater**. Sleep Mode on starts the Program; the wake time ends it and Sleep Mode. See *Night Climate* below |

### Night Climate (Tonight card)

`input_select.night_climate_mode` is what runs tonight; anything but **Off** is live until the wake time
(`input_datetime.night_climate_wake_time`, 07:30). Built 2026-09-17.

| Mode | What it does |
|---|---|
| **Program** | Holds `sensor.night_climate_target`: the night target (`input_number.night_climate_night_target`, 15 °C) until *wake time − warm-up* (`input_number.night_climate_warmup_minutes`, 45), the wake target (`input_number.night_climate_wake_target`, 23 °C) from then on. Heater when the room is below target − 1 °C, off again above target + 2 °C. Above target + 2 °C the **roof fan** cools while the underneath-van sensor reads at least 1 °C cooler than the room (kept until it is within 0.3 °C): first on its own thermostat (set point = target in °F, lid open, direction and speed from the card; only the set point gets re-sent when the target changes). If that thermostat has been armed 20 min and the motor has not turned for 10 (`binary_sensor.roof_fan_running`), HA runs the fan itself from the room sensor for the rest of the program (`input_boolean.night_climate_fan_by_room`): manual at the card's speed, off and lid closed at target + 0.5 °C. The **A/C** only joins above `input_number.night_climate_cool_above` (24 °C, "A/C above" on the card), on shore power (`binary_sensor.shore_power_present`) and never while it is more than 3 °C colder outside with the fan allowed; once on it cools to the target (unit minimum 16 °C), 30-min dwell between on/off, off below target − 0.5 °C, when it turns clearly colder outside, or at once when shore power or the permission goes. Fan and A/C never run together. Between the bands whatever runs holds its own thermostat. `input_boolean.night_climate_use_heater` / `_use_ac` / `_use_fan` allow each |
| **Hold** | The Program's logic at `input_number.night_climate_hold_target` (22 °C) with no end: for daytime use from the card. Sleep Mode turns a Hold into the night Program; the wake time leaves it alone |
| **Fan all night** | Roof fan at `input_number.night_climate_fan_speed` (30 %) in `input_select.night_climate_fan_direction` (Intake), lid open (ceiling-fan mode left first); A/C off; heater untouched |
| **A/C all night** | A/C on its own thermostat at the target (clamped to the unit's 16–32 °C), fan level 1; shore power only, switched off if shore drops; roof fan off; heater untouched |
| **Heater** | Thermostat at the target; fan and A/C off |

Hooks: the Schedule page's **Night** preset (a scheduler entry, 00:30 daily by default) sets the targets and
the wake time and picks the mode, which starts the program; Sleep Mode on → Program (only if the mode was
Off); Sleep Mode off → Off. The wake time sets the
mode to Off (fan and A/C off; the heater is left where the warm-up put it) and runs
`script.wake_up_routine`. The warm-up is the morning heat: the old daily 07:30 scheduler entry
(`switch.schedule_55e88d`, heater to 26 °C) was deleted from the Schedule page on 2026-09-17, and the heater
simply stays at the wake target after the wake time. (History: that entry was paused for one night on
2026-09-17 and, with Sleep Mode never switched on, nothing heated the van, 16.9 °C at 08:00. Do not switch
off whatever heats the van in the morning.)

**One-way IR and what backs it up** (from the first night, 2026-09-18, when the user walked in to the
heater, the A/C at 26 °C and the roof fan all running):

- The A/C's power command is a **toggle**. The AG Pro's belief had drifted (it showed cooling for two hours
  on a unit that never started), so the warm-up's "off" switched it ON at its 26 °C / fan 4 power-on
  default. Now the AG Pro checks its belief against the measured power every minute, not only on edges, and
  the power flag needs 30 s of draw so shore-charger noise (2–9 s spikes of 8–59 W on the A/C current
  channel) cannot flip it. `script.night_climate_ac_off` also refuses to send the toggle when the unit has
  shown cooling for 3 min without drawing power.
- The roof fan ignored its lid-closed frame because the A/C frame went out right behind it. The AG Pro now
  keeps 1.5 s between a fan frame and any other appliance's frame (`remote_transmitter.on_transmit`),
  `script.night_climate_fan_off` sends "off, lid closed" a second time through
  `button.ag_pro_roof_fan_force_off`, and `night_climate_fan_watchdog` presses that button again if the
  motor draws more than 5 W for 12 s while HA has the fan off, during a program or within an hour of one
  ending (outside that window it may be the handheld remote).
- The fan's own thermostat did nothing in Intake: its sensor sits in the incoming air, so it ran 103 s
  and idled with the lid open all night. Hence the idle check above, and Exhaust as the direction to try.
- Shore power has no sensor. The charger reads 0 W whenever the battery is full and only topped up about
  every 2.5 h, which is exactly when the old "> 50 W right now" test let the A/C start.
  `binary_sensor.shore_power_present` = the charger drew power within the last 3 h
  (`input_datetime.shore_power_last_seen`, automation `shore_power_seen`); an hour of the A/C drawing power
  with the charger silent clears it.

Room temperature: `sensor.living_space_temperature` = median of BME280_1 (only while
`sensor.inverter_power_24v` < 60 W), BME280_3 (only while the blower air is < 40 °C) and the Kidde (only if
updated within 15 min), BME280_1 as the fallback; attribute `sources` says which counted.
`sensor.night_climate_status` is the one-line summary the Tonight card shows.

Files: `template/night_climate.yaml` (also `binary_sensor.roof_fan_running` and
`binary_sensor.shore_power_present`); `scripts.yaml` (`night_climate_heater_to` / `_fan_on` / `_fan_auto` /
`_fan_off` / `_ac_on` / `_ac_off` / `_actuators_off`, each checks before it sends, since the fan and the A/C
beep on every IR frame; `_fan_off` closes the lid, which is also what ends thermostat mode, and sends it
twice); `automations.yaml` (`night_climate_controller` every 5 min and on any setting change,
`night_climate_start_on_sleep`, `night_climate_stop_on_sleep_off`, `night_climate_mode_off`,
`night_climate_wake`, `night_climate_fan_watchdog`, `shore_power_seen`);
`react-dashboard/src/components/TonightCard.tsx`. A dry run of the controller against any set of readings,
without touching anything: render its `variables` in order through `/api/template` and walk the `choose`
tree (done for the 2026-09-18 scenarios before tonight's run).

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
the switch off when it sends them; switching the thermostat off sends the lid-closed frame, so it stops and
shuts the lid like a manual off. Measured 2026-09-17 by stepping the set point: the fan's own sensor read 69–70 °F (20.8 °C) while the living-space blend and the Kidde read 22.1 °C and the remote's handheld sensor 71 °F, i.e. about 1 °C under the room with the lid open on a 10 °C morning. In thermostat mode the fan also modulates its speed with the margin above the set point (22 W at 10 °F over, 15 W at 3 °F, 7 W at 1 °F). Capture: stream
`esphome logs esphome/a8-pro.yaml --device 192.168.10.61` (the receiver on GPIO23 dumps Pronto) and decode
with the 1200-baud rule above.

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
| `night_climate_*` (×6) | Night Climate: controller (5-min loop), start with Sleep Mode, stop with Sleep Mode, fan + A/C off when the mode goes Off, wake time, roof-fan watchdog (re-sends off if the motor draws power while HA has it off) |
| `shore_power_seen` | Keeps `input_datetime.shore_power_last_seen` for `binary_sensor.shore_power_present` (charger drew power within 3 h) |
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
