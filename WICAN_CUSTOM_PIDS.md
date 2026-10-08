# WiCAN Pro — Custom PID Configuration Guide

> **Vehicle:** 2016 Ford Transit T-350 HD, 3.5L EcoBoost V6  
> **WiCAN:** Pro (ELM327 v2.3, STN support)  
> **PIDs sourced from:** Ford Transit North America 2022 vehicle profile (WiCAN firmware)

---

## How to Configure

1. Connect to WiCAN's WiFi AP (or access via your network if it's connected)
2. Open the WiCAN web interface (usually `http://192.168.80.1` on AP mode)
3. Go to **AutoPID** → **Custom PIDs**
4. Add each PID below with the exact values shown
5. Save and reboot WiCAN

---

## Standard PID to Add

### Monitor Status (Check Engine Light + DTC Count)

| Field | Value |
|---|---|
| **Name** | `MONITOR_STATUS` |
| **PID** | `01011` |
| **Init** | _(leave blank — standard OBD)_ |
| **Expression** | `B3` |
| **MQTT Topic** | `wican/monitor_status` |
| **Period (ms)** | `10000` |

> HA extracts: MIL on/off (bit 7, value ≥ 128) and DTC count (bits 0-6, value % 128)

---

## Ford-Specific PIDs (Mode 22)

These require the WiCAN Pro's STN instruction support for the ATSH/STCAFCP init commands.

### TPMS — Tire Pressure Monitoring (module 0x726)

Since about 2026-04-19 the tyre pressures come from the WiCAN's built-in vehicle profile
"Ford: Transit North America 2022" (vehicle-specific PIDs), not from custom PIDs:

| Field | FL | FR | RL | RR |
|---|---|---|---|---|
| **Name** (topic `wican/<name>`) | `TYRE_P_FL` | `TYRE_P_FR` | `TYRE_P_RL` | `TYRE_P_RR` |
| **PID** | `222813` | `222814` | `222816` | `222815` |
| **Init** | `ATSH000726;STCAFCP726,72E;` | _(same)_ | _(same)_ | _(same)_ |
| **Expression (profile)** | `[B4:B5]/10` | _(same)_ | _(same)_ | _(same)_ |

`[B4:B5]` is psi × 20 (OBDb Ford-Transit, valid 0–150 psi), so the profile's value is 2 × psi.
`mqtt/sensors.yaml` halves it, and that is the only conversion. If the PIDs are ever set up as
custom PIDs again, keep these names and `[B4:B5]/10`, or change the YAML with them.

The first setup (2026-04-06) used custom PIDs with `[B4:B5]/20` (psi) on lowercase topics
(`wican/tyre_p_fl` etc.). Their last values (60.5 / 59.75 / 72 / 73.25 psi) are still retained
on the broker; nothing reads them.

> **Status 2026-10-08: no tyre data.** The last real pressures arrived in April (126.8 / 126.8 /
> 148.8 / 151.3, i.e. 63.4 / 63.4 / 74.4 / 75.7 psi). From May to July HA only replayed those
> retained values; on 2026-08-22/25 the PIDs sent 1408 / 0 / 0 / 5452.8 (not pressures), and
> nothing since. The last drive's data (2026-10-07) has every PID read from the engine computer
> (0x7E0) but none from module 0x726. To check, with the engine running (the WiCAN sleeps
> otherwise), use read-only GETs: `/check_status` (firmware), `/load_auto_pid_car_data`
> (profile and enabled flags), `/load_auto_pid` (custom PIDs), `/autopid_data` (live values).
> `/load_config` holds the WiFi and MQTT passwords. Firmware: v4.48 was recorded on 2026-04-20.
> Later releases list "Fixed some autopid parameter stop updating" (v4.50) and "Fixed an
> AutoPID issue where some vehicle profiles were returning incorrect PID values" (v4.51).

> **Note on RL/RR:** In the Ford profile, PID `222815` = RR and `222816` = RL.

### Engine / Drivetrain (PCM Module)

All PCM PIDs use the same init command to talk to the PCM at address 0x7E0.

| Field | Value |
|---|---|
| **Init (all below)** | `ATSH7E0;STCAFCP7E0,7E8;` |

| Name | PID | Expression | Topic | Period (ms) | Unit |
|---|---|---|---|---|---|
| `TRAN_F_TEMP` | `221E1C` | `[B4:B5]/16` | `wican/trans_temp` | `1000` | °C |
| `GEAR` | `221E12` | `B4` | `wican/gear` | `1000` | — |
| `OIL_LIFE` | `22054B` | `B4` | `wican/oil_life` | `300000` | % |
| `FUEL_RATE` | `22F49D` | `[B4:B5]*2/100` | `wican/fuel_rate` | `1000` | g/s |
| `WASTEGATE` | `220462` | `B4*100/128` | `wican/wastegate` | `1000` | % |
| `INTAKE_AIR_TMP` | `22F40F` | `B4-40` | `wican/intake_air_temp` | `10000` | °C |
| `FUEL_PRESSURE` | `22F423` | `[B4:B5]` | `wican/fuel_pressure` | `5000` | kPa |
| `ALT_DUTY` | `220598` | `B4` | `wican/alt_duty` | `10000` | % |

---

## Recommended Polling Intervals

| Category | Period | Rationale |
|---|---|---|
| **Core driving** (speed, RPM, throttle, load, gear, ECU voltage, fuel rate, wastegate, coolant temp, trans temp, fuel tank) | 1000 ms | Real-time responsiveness |
| **Moderate** (fuel pressure) | 5000 ms | Changes over minutes |
| **Slow** (alt duty, intake air, ambient air, monitor status/CEL, distance MIL) | 10000 ms | Slow-changing or diagnostic |
| **TPMS** (4 tires) + PIDs Supported | 60000 ms | Tires don't change fast |
| **Oil life** | 300000 ms (5 min) | Only changes over long drives |

---

## DTC Reading & Clearing

The WiCAN MQTT interface publishes parsed PID values only — it does **not** support
sending raw ELM327 Mode 03 (read DTCs) or Mode 04 (clear DTCs) commands via MQTT.

**For reading and clearing DTCs:**

1. Connect your phone to the WiCAN Pro via **WiFi** or **BLE**
2. Use an OBD2 app:
   - **iOS:** Car Scanner, OBD Fusion
   - **Android:** Torque Pro, Car Scanner
3. Configure the app to use **WiFi** connection to WiCAN (usually `192.168.80.1:35000`)
4. Use the app's DTC feature to read codes (Mode 03) and clear codes (Mode 04)

**HA monitors the check engine light status** via PID 0x01 (`binary_sensor.check_engine_light`)
and DTC count (`sensor.dtc_count`). You'll get a notification when the CEL comes on —
then use the app for details.

---

## Compatibility Notes

- These PIDs are from the **Ford Transit NA 2022** profile. The 2016 3.5L EcoBoost uses
  the same Ford CAN architecture and most Mode 22 PIDs should work.
- **PIDs that definitely work:** Standard Mode 01 PIDs (speed, RPM, fuel, coolant, etc.)
  are already confirmed working on your vehicle.
- **TPMS:** module 0x726 answered on this 2016 in April 2026 (plausible pressures), so the
  addressing is right; since then it has stopped reporting (see the TPMS status above).
- **PIDs to skip:** The Ford Transit 2022 profile includes HV_A, HV_V, SOC (hybrid/EV
  battery) — these won't work on your gasoline-only vehicle.

---

## After Configuration

1. Reboot WiCAN
2. Start the engine
3. In HA, go to Developer Tools → States and search for `wican_`
4. New sensors should appear within a few seconds of the engine running
5. TPMS sensors may take up to 60 seconds (poll interval)
6. If any sensor stays `unknown`, that PID may not be supported on the 2016 model
