# Vehicle OBD — WiCAN Pro

WiCAN Pro connects via MQTT to `core-mosquitto` (192.168.10.173:1883).
Entity IDs follow `sensor.192_168_10_90_*` pattern.

## ⚠ WiCAN CONFIG SAFETY

The `/store_config` endpoint **replaces ALL settings at once**. A partial POST
wipes WiFi settings and the device reverts to AP-only mode. **NEVER send partial config.**

`/get_config` returns 404 on firmware v4.48. Config changes must go through the
web UI at `http://192.168.10.90` (use browser automation).

## Standard OBD PIDs (Mode 01)

| Entity | PID | Description |
|---|---|---|
| `sensor.192_168_10_90_04_calcengineload` | 0x04 | Engine load (%) |
| `sensor.192_168_10_90_05_enginecoolanttemp` | 0x05 | Coolant temp (°C) |
| `sensor.192_168_10_90_0c_enginerpm` | 0x0C | Engine RPM |
| `sensor.192_168_10_90_0d_vehiclespeed` | 0x0D | Vehicle speed (km/h) |
| `sensor.192_168_10_90_0f_intakeairtemperature` | 0x0F | Intake air temp (°C) |
| `sensor.192_168_10_90_11_throttleposition` | 0x11 | Throttle position (%) |
| `sensor.192_168_10_90_2f_fueltanklevel` | 0x2F | Fuel tank level (%) — raw, noisy |
| `sensor.192_168_10_90_42_controlmodulevolt` | 0x42 | ECU voltage (V) |
| `sensor.192_168_10_90_46_ambientairtemp` | 0x46 | Ambient air temp (°C) |

## Ford Mode 22 Custom PIDs

| Entity | Description |
|---|---|
| `sensor.192_168_10_90_tyre_p_fl/fr/rl/rr` | Tire pressure (psi, already corrected) |
| `sensor.192_168_10_90_tran_f_temp` | Transmission fluid temp (°C) |
| `sensor.192_168_10_90_gear` | Current gear (0=P, 15=N, 255=R, 1-6=gear) |
| `sensor.192_168_10_90_oil_life` | Oil life remaining (%) |
| `sensor.192_168_10_90_wastegate` | Turbo wastegate (%) |
| `sensor.192_168_10_90_map` | Manifold Absolute Pressure (kPa) |
| `sensor.192_168_10_90_park_brake` | Parking brake (0/1) |
| `sensor.192_168_10_90_inj_pw` | Injector pulse width (raw µs) |
| `sensor.192_168_10_90_lambda` | Commanded equivalence ratio |
| `sensor.192_168_10_90_stft_b1/b2` | Short-term fuel trim |
| `sensor.192_168_10_90_ltft_b1/b2` | Long-term fuel trim |

## NOT Supported by this ECU

- `FUEL_RATE`, `MAF` (0x10), standard MAP (0x0B), Engine Fuel Rate (0x5E)
- Ford Mode 22 MAF (`22F410`), IPW Bank 2 (`22F44B`), Barometric (`22F402`)

## Computed Vehicle Sensors

| Entity | Description |
|---|---|
| `sensor.stable_fuel_level` | Sticky fuel (updates only when stable) |
| `sensor.gear_display` | Gear as text: Park/Reverse/Neutral/1-6 |
| `sensor.tire_pressure_min` | Min tire pressure across all 4 (psi) |
| `sensor.estimated_fuel_rate` | Speed-density fuel rate (L/h) |
| `sensor.estimated_fuel_consumption` | Fuel economy (L/100km, speed > 5 km/h) |
| `sensor.injector_pulse_width` | Injector pulse width (ms) |
| `sensor.average_fuel_trim` | Averaged fuel trim across both banks |
| `sensor.commanded_afr` | Commanded air-fuel ratio (14.7 × lambda) |
| `binary_sensor.check_engine_light` | MIL/CEL on/off |
| `binary_sensor.low_tire_pressure` | Any tire < 35 psi |
| `binary_sensor.vehicle_is_moving` | Speed > threshold AND engine running |
| `binary_sensor.engine_is_running` | RPM > 0 (freshness-based) |

## Fuel Estimation Notes

Uses speed-density estimation via Ford Mode 22 MAP (`22F404`) + RPM + IAT.
Three correction layers:
1. RPM-based VE curve (0.60× at idle → 1.0× at 3000+ RPM)
2. Fuel trim averaging across both banks
3. Lambda-based commanded AFR instead of fixed 14.7

Overestimates at idle, most accurate at cruise.
