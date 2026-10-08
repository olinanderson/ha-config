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
| `sensor.192_168_10_90_tyre_p_fl/fr/rl/rr` | Tire pressure (psi). The WiCAN profile's `[B4:B5]/10` is 2 × psi; `mqtt/sensors.yaml` halves it (the only conversion) and makes values outside 0–150 psi unknown |
| `sensor.192_168_10_90_tran_f_temp` | Transmission fluid temp (°C) |
| `sensor.192_168_10_90_gear` | Current gear (0=P, 15=N, 255=R, 1-6=gear) |
| `sensor.192_168_10_90_oil_life` | Oil life remaining (%) |
| `sensor.192_168_10_90_wastegate` | Turbo wastegate (%) |
| `sensor.192_168_10_90_map` | NOT manifold pressure: `22F404` mirrors PID 04, so it is calculated load × 2.55 (255 = 100 %). HA name "WiCAN Pro Engine Load (raw, 255 = 100 %)", no unit (mqtt/sensors.yaml) |
| `sensor.192_168_10_90_park_brake` | Parking brake (0/1) |
| `sensor.192_168_10_90_inj_pw` | NOT injector pulse width: `22F44A` mirrors PID 4A (accelerator pedal E), byte × 256 (5120 at rest). HA name "WiCAN Pro Accelerator Pedal E (raw, byte × 256)" (mqtt/sensors.yaml) |
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
| `sensor.accelerator_pedal` | Accelerator pedal E (%): `inj_pw` ÷ 256 × 100/255, 7.8 % at rest. Replaced the misnamed `sensor.injector_pulse_width` on 2026-10-08 |
| `sensor.average_fuel_trim` | Averaged fuel trim across both banks |
| `sensor.commanded_afr` | Commanded air-fuel ratio (14.7 × lambda) |
| `binary_sensor.check_engine_light` | MIL/CEL on/off |
| `binary_sensor.low_tire_pressure` | Any tire < 35 psi |
| `binary_sensor.vehicle_is_moving` | Speed > threshold AND engine running |
| `binary_sensor.engine_is_running` | RPM > 0 (freshness-based) |

## Fuel Estimation Notes

Uses speed-density estimation via Ford Mode 22 `22F404` (PID 04 calculated load,
not MAP) + RPM + IAT + barometer, in `sensor.estimated_fuel_rate`, integrated
into `sensor.estimated_fuel_used_total_l`. PID 04 is airflow ÷ the WOT airflow at
that RPM at sea level, hence the layers:
1. RPM curve for the turbo's WOT air per rev: 0.30× up to 1100 RPM (idle),
   linear to 1.0× at 2000 RPM and above
2. Barometer: × pressure/1013.25 from `sensor.apollo_msr_2_1731d8_dps310_pressure`
   (≈0.88 in Calgary); missing or out of range counts as sea level
3. Fuel trim averaging across both banks
4. Lambda-based commanded AFR instead of fixed 14.7

VE base `input_number.fuel_ve_correction` = 0.80, fitted 2026-10-08 on 9
fill-to-fill windows from 2026-08-31 to 10-05 (~570 L, Calgary and the BC trip):
every window within ±6 %, both totals within ±4 %. The old model
(curve 0.60× at 600 → 1.0× at 3000 RPM, no barometer, VE 0.475) read 15–30 % low.
Fitted with outside air at +9 to +23 °C (5–95 % of engine time); re-check after
cold-weather fills.

The Espar heater's fuel is not in the estimate. Allow ≈0.25 L/h of on-time of
`switch.a32_pro_switch24_hydronic_heater` (the same windows fit 0.15–0.3).

Re-checking the VE by hand (the fill-up auto-calibration is off, see the note
above `fill_up_detected` in automations.yaml): between two fills to full, real =
litres bought at the second fill, minus 0.25 L/h × heater hours; estimate = the
change in `sensor.estimated_fuel_used_total_l`. New VE = VE × real ÷ estimate.
Average 3+ fills before changing it: one fill is only good to about ±5 % (where
the pump clicks off, slosh).
