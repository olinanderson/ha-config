# Hydronic Heating System

Gasoline-fired **Espar Hydronic S3 B5E** heating coolant in a closed loop.
Controlled via a single 12V signal wire (relay on/off).

## Coolant Loop (physical order)

```
Espar Hydronic S3 B5E
  │
  ├─► Water-to-Water HX #1 — MAIN water system (sink/faucet)
  │     [coolant temp NTC aluminum-taped to housing]
  │
  ├─► Water-to-Water HX #2 — RECIRCULATING SHOWER loop
  │
  ├─► Air Blower Matrix (water-to-air heater core + PID fan)
  │     Fan speed: DAC output (light.a32_pro_a32_pro_dac_0)
  │     PID climate: climate.a32_pro_van_hydronic_heating_pid
  │     [air temp NTC in blower duct]
  │
  └─► Return to heater
```

**Key**: Water HXs are upstream of air matrix — water always gets heated first,
even when air heating is the reason the heater is on.

## Modes

| Condition | Dashboard Label |
|---|---|
| Heater ON + Climate ON + Hot Water ON | "Heating air + water" |
| Heater ON + Hot Water ON + Climate OFF | "Hot water only" |
| Heater ON + Climate ON + Hot Water OFF | "Heating air (+ water passthrough)" |
| Heater OFF | No label |

## Startup & Retry Logic (ESPHome)

1. Records baseline coolant temp, turns on heater relay
2. Waits 5 minutes, checks if coolant rose ≥ 2°C
3. If yes → running (state 3)
4. If no → cycles off/on (retry), waits another 5 min
5. If retry fails + fuel < 25% → fuel lockout (state 5)

## Low Fuel Lockout

- **Trigger**: Heater fails after retry AND fuel < 25%
- **Auto-clear**: Fuel rises above 30% for 2 min
- **Manual override**: Dashboard button with confirmation

## Heater Status States

| State | Message |
|---|---|
| 0 | "Idle." (hidden) |
| 1 | "Starting heater -> Waiting for coolant to warm up..." |
| 2 | "First attempt failed -> Retrying..." |
| 3 | "Heater running -> Coolant warming up." |
| 4 | "Heater failed to start after retry." |
| 5 | "Low fuel lockout (XX%) -> Refuel or override from dashboard." |

## Shore Power Charger

Uses `input_boolean.shore_power_charger_enabled` (NOT the raw switch) to handle
auto power-cycle when battery hits 100% then drops below reset threshold.
