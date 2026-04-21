# Automations & Modes

## Modes / Routines

| Mode | Script ON | Script OFF | Description |
|---|---|---|---|
| **Power Saving** | `script.power_saving_mode_on` | `script.power_saving_mode_off` | Lights off, monitors off, water off; auto on leaving/driving |
| **Sleep Mode** | `script.sleep_mode_on` | `script.wake_up_routine` | All lights/monitors off, Starlink sleep, state snapshotted |
| **Shower Mode** | `script.shower_mode_on` | `script.shower_mode_off` | Lights 100%, water recirc, roof fan exhaust 60% |
| **Cook Mode** | `script.cook_mode` | `script.cook_mode_off` | LPG valve open, lights 100%, roof fan exhaust 60% |
| **Bedtime** | `script.bedtime_routine` | — | Progressive 10-min shutdown |

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
| `auto_power_saving_when_away` | Radar presence → power saving on/off |
| `auto_power_saving_when_driving` | Driving → power saving |
| `bed_power_auto_off_30s` | Safety: bed motor auto-off |
| `keep_home_zone_on_starlink` | Move HA home zone to Starlink GPS every 5 min |
| `rolling_last_active_snapshot_1hz` | 1Hz scene snapshot |
| Shelly EM 1s ping | Update inverter detection every second |
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
