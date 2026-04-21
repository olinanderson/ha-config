# System Overview

## Vehicle

| Spec | Value |
|---|---|
| **Chassis** | 2016 Ford Transit T-350 HD |
| **Engine** | 3.5L EcoBoost V6 (twin-turbo, gasoline) |
| **Body** | High Roof, Extended Length |
| **Fuel tank** | 94.6 L (25 US gal) |
| **Drivetrain** | RWD, 6-speed automatic |
| **Electrical** | 24V LiFePO4 house battery system (separate from 12V chassis) |
| **OBD** | WiCAN Pro (v4.48) at 192.168.10.90 |

## Hardware Platform

| Device | Role | Protocol |
|---|---|---|
| **Simarine A32 Pro** (ESP32-S3) | Primary controller — switches, sensors, MPPT, tank levels, BME280s, S5140 current sensors, DAC outputs | ESPHome via WiFi |
| **AG Pro** (ESPHome) | Roof fan (speed, direction, lid), additional controls | ESPHome via WiFi |
| **WiCAN Pro** (v4.48) | Vehicle OBD2 data — speed, fuel, RPM, coolant, tire pressure, gear, trans temp | MQTT |
| **Starlink** | Internet + GPS location tracking | Native integration + MQTT |
| **Apollo MSR-2** | mmWave radar presence/occupancy sensor | ESPHome |
| **Shelly EM** | AC power monitoring (inverter output voltage, power) | Native integration (ping-based) |
| **Olins Van BMS** | Battery management — SOC, voltage, current, temperature, cycles, stored energy | BLE via `bms_ble` |
| **Victron MPPT** (×2) | Solar charge controllers — PV power, output voltage/current, yield | BLE via `victron_ble` ESPHome |
| **Pro Check F317** | Propane tank ultrasonic level sensor | BLE |
| **Lorex D231A41B** | 4-channel 1080p DVR (security cameras) — RTSP streams | go2rtc (MSE) via dvr_proxy |
| **Kidde HomeSafe** | CO/smoke detection | `kidde_homesafe` custom component |
| **Zigbee2MQTT** | Zigbee device gateway | MQTT bridge |
| **VLC Telnet** | Media player for TTS and audio | Media player integration |
| **OpenAI TTS** | Text-to-speech via GPT-4o-mini-tts | `openai_tts` custom component |

## Key Gotchas

- **24V system** — power = current × ~24V (not 12V)
- **Fuel level is noisy** — always use `sensor.stable_fuel_level`, not raw OBD
- **Inverter has no state entity** — inferred from Shelly EM ping (`binary_sensor.shelly_em_reachable`)
- **WiCAN /store_config wipes ALL settings** — NEVER POST partial config
- **Jinja2 pipe precedence** — `states(x) | float(0) * N` → must use `(states(x) | float(0)) * N`
- **No MAF/fuel-rate PID** — fuel consumption uses speed-density estimation via MAP+RPM+IAT
- **Scenes are all dynamic** — `scenes.yaml` is empty; created via `scene.create` in scripts
- **Never edit `secrets.yaml`** or files in `custom_components/`
