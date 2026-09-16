# Hydronic Heating System

Gasoline-fired **Espar Hydronic S3 B5E** heating coolant in a loop that also
picks up engine heat while driving. Controlled via a single 12V signal wire
(relay on/off).

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

**The engine heats this loop as well.** With the Espar off, the coolant sensor
reads 90–96 °C after a few minutes of driving and then decays ~0.5 °C/min once
the engine stops (HA history, Sept 2026). So "coolant is hot" does not by itself
mean the burner is lit — the firmware treats either heat source as "running"
and only steps in when the loop is cold and not warming.

## Modes

| Condition | Dashboard Label |
|---|---|
| Heater ON + Climate ON + Hot Water ON | "Heating air + water" |
| Heater ON + Hot Water ON + Climate OFF | "Hot water only" |
| Heater ON + Climate ON + Hot Water OFF | "Heating air (+ water passthrough)" |
| Heater OFF | No label |

## Warm-up Monitor & Auto-restart (ESPHome)

Whoever lights the heater (PID climate, Hot Water Mode, Switch24, the rocker),
the relay's `on_turn_on` arms a monitor that runs every 30 s while the relay is
on and watches the HX#1 coolant sensor:

1. Coolant ≥ **Heater OK Temp** (default 45 °C) → running (state 3).
2. Else coolant rose ≥ 8 °C over the trailing 5 min → burner lit (state 3).
   A lit burner lifts the sensor ~12 °C/min (42 → 75 °C in 3 min on 2026-09-11);
   failed starts drift < 2.5 °C in 5 min from engine/ambient heat.
3. Else, after 6 min (from relay-on for a start; since the coolant last looked
   healthy for a running heater) → relay off 10 s / on again (state 2), up to
   **Heater Max Restarts** (default 3). The Espar latches a fault after its own
   failed start and only a signal cycle clears it.
4. All restarts used up → relay dropped: fuel lockout (state 5) if fuel < 25 %,
   otherwise failed (state 4). State 4 waits for you to toggle the climate or
   the heater — the climate handler will not relight it by itself.

Tunables live on the a32-Pro device page under Configuration:
`number.a32_pro_hydronic_heater_ok_temp` and
`number.a32_pro_hydronic_heater_max_restarts`. The 8 °C / 6 min constants are
`substitutions:` at the top of `esphome/a32-pro-esp32-s3.yaml`.

Why: of the 8 relay-on runs between July and September 2026, four never lit (at
68 %, 68 %, 93 % and 20 % fuel), and every ignition came within 4 min of a fresh
relay-on -- on both multi-attempt days the third attempt lit. The old one-shot "≥ 2 °C in 5 min" test passed on a
+2.1 °C engine drift on 2026-09-11 and then stopped watching for the rest of
the run, so the failed start was never retried.

## Blower Coolant Gate

In Auto (PID) mode the blower DAC is held at 0 until the coolant reaches
**Hydronic Blower Start Temp** (`number.a32_pro_hydronic_blower_start_temp`,
default 60 °C), and keeps running until it drops 10 °C below that so residual
heat is still blown into the van. With 40 °C coolant the duct air was only
~27 °C; a lit burner takes the sensor from 45 to 60 °C in about a minute, so
the wait costs little. The gate re-evaluates on every coolant sample, so the
fan starts within a second of the threshold, and
`binary_sensor.a32_pro_hydronic_blower_coolant_ready` shows its state. Manual
blower control and the shoe dryer bypass it.

Why 60 °C (`analyze_blower_gate.py`, 60 days to 2026-09-16): with the fan at full the
duct air is about 41 / 44 / 47 °C when the coolant passes 55 / 60 / 65 °C, and it keeps
climbing as the coolant rises. Cold starts reach 60 °C in a median 6.5 min (65 °C:
7.5 min, p75 13.5, because the first slug of hot coolant is followed by a dip). The stop
point matters more: with the fan at full, burner pauses pull the sensor down to 58.8 °C
(p5) and once to 53.6 °C. A 50 °C stop point never tripped in 60 days, while 55 °C (a
65 °C start) would have cut the fan in the middle of a run.

## Blower Auto / Manual

`switch.a32_pro_coolant_blower_mode_auto_manual`: on = Auto (the thermostat's PID
sets the blower speed), off = Manual (the blower keeps whatever speed it is given).
Manual is a hold: the thermostat stays in `heat` and keeps the burner lit, and the
PID's `on_state`, which fires on every cabin temperature sample, no longer puts the
blower back on Auto. The hold ends the next time the thermostat is switched on, so
every heat session starts on Auto. That is also how the shoe dryer's climate restore
hands the blower back. With the thermostat off the blower is always manual, and the
switch reads off. The dashboard's Heater card has the Auto / Manual buttons.

The same card has a single **Hot Water / Hydronic Heater** switch in place of separate
Switch24 and Hot Water Mode toggles, since both just run the burner without the
thermostat. It drives `input_boolean.hot_water_mode`, and it also reads on whenever the
burner runs with the thermostat off (e.g. started from the rocker, which sets Switch24's
manual request). Turning it off in that case also turns Switch24 off, because Hot Water
Mode off alone leaves a manual request burning. Turning it on is blocked while the
supply is off, Shop Mode is armed, or the low-fuel lockout is active, since the a32 would
ignore it.

## Low Fuel Lockout

- **Trigger**: Heater never warms up after all restarts AND fuel < 25%
- **Auto-clear**: Fuel rises above 30% for 2 min (the ESP drops its lockout
  verdict when the boolean clears, so a still-on climate relights the heater)
- **Manual override**: Dashboard button with confirmation

## Heater Status States

| State | Message |
|---|---|
| 0 | "Idle." (hidden) |
| 1 | "Starting heater -> waiting for coolant to warm up (NN °C)..." |
| 2 | "Coolant not warming -> heater restart N of M..." |
| 3 | "Heater running -> coolant NN °C." or, while the blower is gated, "Heater running -> blower waits for coolant to reach 60 °C (now NN °C)." |
| 4 | "Heater never warmed up after N restarts -> turned off. Toggle climate or heater to try again." |
| 5 | "Low fuel lockout (XX%) -> Refuel or override from dashboard." |

States 4 and 5 outlive the relay (it is dropped when they are given); turning
the climate off, or any new relay-on, resets them.

## Power Supply Interlock (Switch24 vs Switch32)

`switch.a32_pro_switch24_hydronic_heater` is the heater ENABLE (relay on the 12V
signal wire). `switch.a32_pro_switch32_hydronic_heater_power_supply` is the
heater's standby supply — normally always on. The a32_pro enforces both ways:

- Switch24 will **not turn ON while Switch32 is OFF** — it logs
  `Cannot turn on hydronic heater: Power Supply is OFF!` and changes nothing, so
  a dashboard toggle just snaps back with no error. The PID climate and Hot
  Water Mode are gated the same way.
- Switch32 will **not turn OFF while Switch24 is on or within 180 s** of it
  going off (Espar purge cycle — cutting power early cokes the burner).

Shop Mode cuts Switch32 (deferred ~3 min for the purge interlock) and restores it
on disarm. If the heater ever refuses to toggle with no status message, check
Switch32 first — the Heating card shows a "power supply is off" warning with a
restore button, and disables the heater switch while Shop Mode is armed.

## Shore Power Charger

Uses `input_boolean.shore_power_charger_enabled` (NOT the raw switch) to handle
auto power-cycle when battery hits 100% then drops below reset threshold.
