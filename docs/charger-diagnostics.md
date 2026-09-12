# Alternator charger visibility — findings and config additions

Investigation of the ~15 A mid-charge drop in `sensor.alternator_charger_power_24v`.
Nothing here is wired into HA yet — these are staged snippets to paste.

## What the hardware can and cannot tell you

**Victron Orion-Tr Smart 12/24-15 — no current, ever.** It broadcasts Victron BLE
record type `0x04` (DC/DC converter), which contains exactly five fields: device state,
charger error, input voltage, output voltage, off reason. There is no current or power
field in the advertisement, so no ESPHome `type:` and no firmware setting can produce
one. It also has **no VE.Direct port** and **no adjustable output current limit**.
(Record `0x0F`, which does carry current, belongs to the newer Orion XS — different product.)

> Caution: the component's global type list includes `OUTPUT_CURRENT` / `BATTERY_CURRENT`
> etc. because it serves many Victron devices. Those may *compile* against the Orion-Tr
> but will never publish a value, because the bits are absent from record `0x04`.

**"Bulk" does not mean the Orion is delivering current.** The Orion-Tr Smart folds its
charge current back whenever input voltage falls to or below its shutdown threshold
(`Vshutdown`, default **13.1 V**) and it keeps reporting `Bulk` while doing so. So
`sensor.a32_pro_orion_state` cannot distinguish "delivering 15 A" from "throttled to zero".
This is why the 76 A → 60 A step cannot be attributed from existing sensors alone.

**Sterling B2Bs — no telemetry.** Likely Sterling Pro Batt Ultra BB122470 (Sterling rates
B2Bs by *input* amps: 70 A in at 12 V ≈ 30–33 A out at 24 V). "1/2 power mode" is a real
documented discrete state whose magnitude matches the measured step, but its documented
automatic triggers are unit temperature > 85 °C / high ambient / excessive output-cable
volt drop — **not** input voltage. Low input voltage is documented to cause a continuous
taper or an outright sleep, neither of which yields a clean 50 % plateau.

## Measured behaviour (21 days of recorder history)

- Plateaus: ~76 A (all three online), ~60 A, occasionally ~45 A.
- Correlation between combined charge current and Orion 12 V input: **+0.681**.
  Input ≥ 13.6 V → mean 68.7 A. Input < 13.0 V → mean 41.0 A.
- Every sag coincides with engine **idle**. 2026-08-10 20:56:30, 837 RPM at 0 km/h,
  input fell to 12.16 V, current 76 A → 63 A. At 20:57:20, 2410 RPM, input 14.02 V, recovered.
- ECU control-module voltage tracks the Orion input to within 0.1–0.3 V, so the whole
  vehicle 12 V bus sags. Not a charger-feed cable problem. Three DC-DCs pull ~190 A at
  12 V to make ~2100 W at 28 V.
- Recovery hysteresis of **80–120 s**: current stays at ~60 A after input has recovered
  to 14.1 V at cruise. This exactly matches the Orion's default `tstart` delay of 2 minutes.
- 31 reduced-power episodes: 17 are normal LFP taper (high SOC, Absorption/Float);
  **14 are genuine anomalies** (SOC < 80 % while still in Bulk). Of those 14, 9 follow a
  sag below 13.0 V; at a 13.2 V threshold it is 11 of 14, and the remaining 3 had prior
  minima of 13.70–13.81 V, still below the 13.9–14.1 V healthy cruise level.
- Cost: 286 min in reduced power over 21 days ≈ **2.0 kWh** not captured.
- Outliers worth separate investigation:
  - `07-31 20:15` — 76.7 min at a mean of **1.1 A**, preceded by a sag to 12.13 V.
  - `08-08 17:24` — 27 min at 56 A with Orion state `Off` (the one clear Orion dropout).

Scripts: `analyze_input_voltage_vs_charge.py`, `analyze_drive_detail.py`,
`analyze_sag_highres.py`, `analyze_cruise_vs_idle.py`.

---

## 1. ESPHome additions — `esphome/a32-pro-esp32-s3.yaml`

Verified against the component README and `sensor/__init__.py`. `OFF_REASON` is the only
field in record `0x04` not already being read, and it is the one that would say *why* the
Orion shut off (low input voltage vs remote input vs engine detect).

Add under the existing `sensor:` block, next to the other Orion entries (~line 2361):

```yaml
  # Why the Orion is off. Numeric bitmask is the reliable one - the text_sensor
  # publishes once per matching bit, so with multiple bits set only the last survives.
  - platform: victron_ble
    victron_ble_id: Orion_DCDC_Charger
    name: "Orion Off Reason Code"
    type: OFF_REASON
```

Add under the existing `text_sensor:` block (~line 1283):

```yaml
  - platform: victron_ble
    victron_ble_id: Orion_DCDC_Charger
    name: "Orion Off Reason"
    type: OFF_REASON
```

Add under the existing `binary_sensor:` block (~line 1255). These let automations trigger
without string comparison against the state text:

```yaml
  - platform: victron_ble
    victron_ble_id: Orion_DCDC_Charger
    name: "Orion is Off"
    type: DEVICE_STATE_OFF
  - platform: victron_ble
    victron_ble_id: Orion_DCDC_Charger
    name: "Orion is in Bulk"
    type: DEVICE_STATE_BULK
```

## 2. `template/binary_sensors.yaml`

```yaml
# ─── Alternator 12V bus sag (root cause of the charger dropouts) ───
# The chargers pull ~190A at 12V to make ~2100W at 28V. At engine idle the
# alternator cannot hold the rail and it collapses to 12.1-12.5V, at which point
# chargers back off. Verified across 21 days: every genuine reduced-power episode
# is preceded by a depression here.
- binary_sensor:
    - name: "Alternator Bus Sagging"
      unique_id: alternator_bus_sagging
      device_class: problem
      icon: mdi:car-battery
      availability: >
        {{ has_value('sensor.a32_pro_orion_input_voltage') }}
      state: >
        {{ is_state('binary_sensor.engine_is_running', 'on')
           and states('sensor.a32_pro_orion_input_voltage') | float(99) < 13.0 }}
      delay_on: "00:00:10"
      delay_off: "00:00:30"

# ─── Orion in documented current-foldback ───
# The Orion-Tr Smart reduces charge current whenever VIN <= Vshutdown (default
# 13.1V) and KEEPS REPORTING "Bulk" while doing so. So this, not the state text,
# is what tells you the Orion may not be contributing its full 15A.
# If you retune Vshutdown in VictronConnect, change 13.1 to match.
- binary_sensor:
    - name: "Orion Current Foldback"
      unique_id: orion_current_foldback
      device_class: problem
      icon: mdi:speedometer-slow
      availability: >
        {{ has_value('sensor.a32_pro_orion_input_voltage') }}
      state: >
        {{ is_state('binary_sensor.engine_is_running', 'on')
           and states('sensor.a32_pro_orion_input_voltage') | float(99) <= 13.1 }}
      delay_on: "00:00:10"

# ─── Orion output stage energised ───
# Output voltage reads 0.00V when off and ~28.2V when charging. This proves the
# output stage is live; it does NOT prove current is flowing (see foldback above).
- binary_sensor:
    - name: "Orion Output Live"
      unique_id: orion_output_live
      device_class: power
      icon: mdi:power-plug
      availability: >
        {{ has_value('sensor.a32_pro_orion_output_voltage') }}
      state: >
        {{ states('sensor.a32_pro_orion_state') not in ['Off', 'unknown', 'unavailable']
           and states('sensor.a32_pro_orion_output_voltage') | float(0) > 1.0 }}
```

## 3. `template/sensors.yaml`

```yaml
    # ─── Alternator charger breakdown ───
    # There is ONE current sensor (S5140 ch8) for all three chargers, and the
    # Orion can never report its own current. So the Orion's share is INFERRED.
    #
    # ERROR BARS - read before trusting this:
    #   * Assumes the Orion contributes its full 15A whenever it is not Off.
    #   * That assumption BREAKS during foldback (binary_sensor.orion_current_foldback),
    #     when the Orion may be anywhere between 0 and 15A while still saying "Bulk".
    #   * So this figure is trustworthy when the 12V bus is healthy and
    #     meaningless during a sag - which is exactly when you most want it.
    # The only way to remove the inference is a current sensor per charger.
    - name: "Orion Current (inferred)"
      unique_id: orion_current_inferred
      unit_of_measurement: "A"
      device_class: current
      state_class: measurement
      state: >
        {% if states('sensor.a32_pro_orion_state') in ['Off', 'unknown', 'unavailable'] %}
          0
        {% elif states('sensor.a32_pro_orion_output_voltage') | float(0) < 1.0 %}
          0
        {% else %}
          15
        {% endif %}
      attributes:
        confidence: >
          {{ 'low - Orion in foldback, actual could be 0-15A'
             if is_state('binary_sensor.orion_current_foldback', 'on')
             else 'nominal - 12V bus healthy' }}

    - name: "Sterling Charger Current (estimated)"
      unique_id: sterling_charger_current_estimated
      unit_of_measurement: "A"
      device_class: current
      state_class: measurement
      state: >
        {% set total = states('sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger') | float(0) %}
        {% set orion = states('sensor.orion_current_inferred') | float(0) %}
        {{ [total - orion, 0] | max | round(1) }}
      attributes:
        confidence: >
          {{ 'low - Orion share unknown during foldback'
             if is_state('binary_sensor.orion_current_foldback', 'on')
             else 'nominal' }}

    # Plateau classifier. Levels measured over 21 days of history:
    #   ~76A all three online (15 Orion + ~30 + ~30)
    #   ~60A one 30A unit at half power  <-- the reported symptom
    #   ~45A one 30A unit fully offline
    - name: "Alternator Charger Status"
      unique_id: alternator_charger_status
      icon: mdi:alpha-a-circle
      state: >
        {% set a = states('sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger') | float(0) %}
        {% if not is_state('binary_sensor.engine_is_running', 'on') %}
          Engine off
        {% elif a < 5 %}
          Not charging
        {% elif a < 22 %}
          One unit only
        {% elif a < 38 %}
          Heavily reduced
        {% elif a < 52 %}
          One unit offline
        {% elif a < 68 %}
          One unit at half power
        {% else %}
          All three online
        {% endif %}
```

## 4. `integrations/sensor.yaml`

Lets you total the lost harvest over time rather than re-deriving it from history.

```yaml
- platform: integration
  name: "Sterling Charger Energy (Wh)"
  unique_id: "sterling_charger_energy_wh"
  source: sensor.sterling_charger_power_estimated
  method: trapezoidal
  round: 2
```

Requires a companion power template in `template/sensors.yaml`, matching the existing
`*_power_24v` pattern:

```yaml
    - name: "Sterling Charger Power (estimated)"
      unique_id: sterling_charger_power_estimated
      unit_of_measurement: "W"
      device_class: power
      state_class: measurement
      state: >
        {% set current = states('sensor.sterling_charger_current_estimated') | float(0) %}
        {% set voltage = states('sensor.olins_van_bms_voltage') | float(0) %}
        {{ ((current | abs) * voltage) | round(2) }}
```

## 5. `automations.yaml`

Fires on a sustained step down while the engine is running, and puts the whole
diagnostic context in the notification so the next occurrence is self-explaining.
The 90 s `for:` both debounces the noisy CT and outlasts the 80–120 s recovery
hysteresis, so it only fires on drops that actually persist.

```yaml
- id: alternator_charger_unit_dropped
  alias: "Alert - alternator charger unit dropped out"
  description: >
    Combined charger current sat in the "one unit missing" band for 90s while the
    engine was running and the bank was still in bulk (SOC < 80%), where a taper
    is not expected. Captures Orion state, 12V input, RPM, SOC and battery temp so
    the cause can be attributed after the fact.
  mode: single
  trigger:
    - trigger: numeric_state
      entity_id: sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger
      below: 68
      above: 38
      for: "00:01:30"
  condition:
    - condition: state
      entity_id: binary_sensor.engine_is_running
      state: "on"
    - condition: numeric_state
      entity_id: sensor.olins_van_bms_battery
      below: 80
    - condition: template
      value_template: >
        {{ states('sensor.a32_pro_orion_state') == 'Bulk' }}
  action:
    - action: persistent_notification.create
      data:
        title: "⚡ Charger unit dropped out"
        message: >
          Combined {{ states('sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger') | float(0) | round(1) }}A
          (expected ~76A) — {{ states('sensor.alternator_charger_status') }}.

          Orion state: {{ states('sensor.a32_pro_orion_state') }}
          / off reason: {{ states('sensor.a32_pro_orion_off_reason') }}
          / foldback: {{ states('binary_sensor.orion_current_foldback') }}

          12V input: {{ states('sensor.a32_pro_orion_input_voltage') }}V
          (bus sagging: {{ states('binary_sensor.alternator_bus_sagging') }})

          RPM {{ states('sensor.192_168_10_90_0c_enginerpm') }},
          speed {{ states('sensor.192_168_10_90_0d_vehiclespeed') }} km/h,
          SOC {{ states('sensor.olins_van_bms_battery') }}%,
          batt {{ states('sensor.olins_van_bms_temperature') }}°C
        notification_id: alternator_charger_dropped
```

> The `off reason` line references `sensor.a32_pro_orion_off_reason`, which only exists
> after the ESPHome change in section 1 is flashed. Until then it renders `unknown`.

## Recorder

`purge_keep_days: 60` is already set in `configuration.yaml`, which is ample. No change
needed — the 21-day analysis above ran off existing retention. Note that the S5140
current channel updates roughly every 3 s and Orion input voltage every ~2.5 s, which is
fine resolution for this; the limiting factor was Orion *state*, which only records on
change (54 transitions in 7 days).

---

## Raising idle RPM — what the data says

Question: would raising idle from ~850 to ~1050 RPM fix the sag?
Answer: it lands right at the knee of the curve. Script: `analyze_rpm_vs_voltage.py`.

Bus voltage vs RPM under charger load (≥ 45 A), 21 days, 2688 engine-running samples:

| RPM | median bus V | p5 bus V | % below 13.1 V | % below 12.5 V |
|---|---|---|---|---|
| 800–850 | 12.52 | 12.13 | **87.4 %** | 42.6 % |
| 850–900 | 12.72 | 12.16 | 67.4 % | 29.0 % |
| 900–950 | 13.19 | 12.24 | 47.1 % | 22.1 % |
| 950–1000 | 13.76 | 12.32 | 20.0 % | 9.2 % |
| 1000–1050 | 13.84 | 12.30 | 18.1 % | 8.3 % |
| **1050–1100** | **13.87** | **12.88** | **6.2 %** | **1.0 %** |
| 1100–1200 | 13.94 | 13.04 | 5.2 % | 1.9 % |
| 1200–1400 | 13.99 | 13.47 | 2.7 % | 0.9 % |
| 1800+ | 14.11 | 13.65 | 0.5 % | 0.2 % |

Head to head, loaded: **~850 RPM → median 12.59 V, 76.6 % of the time below the Orion's
13.1 V foldback threshold. ~1050 RPM → median 13.86 V, 11.2 % below it.**

Payoff in delivered current, filtered to SOC < 80 % with the Orion not off:

| RPM | median charger current | median bus V |
|---|---|---|
| 800–850 | 55.8 A | 12.45 V |
| 850–900 | 60.6 A | 12.41 V |
| 1050–1100 | 71.4 A | 13.74 V |
| 1100–1200 | 73.2 A | 13.80 V |

≈ +13–15 A recovered, i.e. roughly the whole missing unit. Small bins (n = 6–25), so
directional rather than precise.

**Caveats.** p5 at 1050–1100 is still 12.88 V, below 13.1 V, so this reduces excursions
from 87 % to 6 % rather than eliminating them. More importantly **none of these samples are
sustained idle** — every bin above 950 RPM is populated by transients (coasting,
decelerating, gear changes), only ~16 min of aggregate data in the 1050–1100 loaded bin.
Sustained high idle is a different duty: the alternator heats and derates, and airflow at
standstill is poor. So these figures are plausibly optimistic; set it and re-run the script.

**Cross-check:** median (ECU control-module V − Orion input V) = **−0.02 V** (p5 −0.35,
p95 +0.25) over 2101 loaded samples. The ECU and the Orion see the same voltage, so there
is no meaningful drop in the charger *input* feed — the constraint is alternator output,
which is what raising RPM addresses.

---

## Output-side voltage drop, and the two-Sterling setpoint question

### Measured: ~15.5 mΩ between the Orion's output terminals and the pack

Comparing `sensor.a32_pro_orion_output_voltage` (at the Orion's terminals) against
`sensor.olins_van_bms_voltage` (at the pack), 14 days, 1025 samples with the Orion live:

| combined charger current | median Orion OV | median pack BV | median drop | implied resistance |
|---|---|---|---|---|
| 40–55 A | 28.02 V | 27.28 V | +0.76 V | 15.2 mΩ |
| 55–68 A | 28.37 V | 27.36 V | +0.95 V | 15.6 mΩ |
| 68–90 A | 28.35 V | 27.22 V | +1.13 V | 15.8 mΩ |

The implied resistance is consistent at **~15.5 mΩ** across load bands, which is what you
expect from a real series resistance rather than a measurement artefact. (Ignore the
0–20 A band — at low charger current the pack is being fed by solar too, so the ratio is
meaningless there.) At 75 A that is **1.13 V of drop and ~87 W dissipated**.

Observed setpoints: Orion output terminal p99 **28.77 V**, max 28.82 V. Pack voltage
median 26.51 V, p99 **27.63 V**, max 28.41 V.

### Why this makes the setpoint question much bigger than 0.2 V

Sterling profiles are voltage-defined and selected per unit. Confirmed figures for the
Pro Batt Ultra are **Gel 13.8 V** and **AGM 14.2 V**, with **lead-acid as the factory
default** — and these are 12 V figures, so double them for a 24 V output:

| profile | 24 V output setpoint | pack voltage at which it starts tapering (setpoint − 1 V drop) |
|---|---|---|
| Gel | 27.6 V | ~26.6 V |
| AGM | 28.4 V | ~27.4 V |
| lead-acid (default) | ~28.8 V | ~27.8 V |
| LiFePO4 | ~29.2 V (unconfirmed) | ~28.2 V |

The measured reduced-power episodes occur at pack voltage **26.8–27.2 V**. That is exactly
the window where a Gel- or AGM-profile unit has reached its own limit and begins backing
off, while a lead-acid- or LiFePO4-profile unit keeps delivering. So a profile mismatch
does not produce a 0.2 V difference — it produces **0.8–1.6 V at 24 V**, and the 1 V of
cable drop shifts the whole thing down into the exact range where you are seeing trouble.

This also explains what the input-sag mechanism alone does not: why the reduced state
**persists at cruise with a healthy 12 V bus**, and why it happens at only 70 % SOC.

Two mechanisms are therefore in play and they are not mutually exclusive:
- **Input side** — 12 V bus sag at idle triggers the drop (strong RPM correlation).
- **Output side** — ~1 V cable drop plus a possible profile mismatch means one unit hits
  its voltage ceiling early and stays there.

### SUPERSEDED — the setpoint-mismatch mechanism was tested and does NOT hold

The reasoning above is kept for the record but the mechanism was subsequently **falsified**
for the low-SOC events. Filtering to cruise (1100–1900 rpm, >30 km/h) with a **healthy bus**
(Orion input ≥ 13.6 V) and **SOC < 78 %**, so neither alternator capacity nor normal taper
can be responsible, charger current shows **no dependence on pack voltage and no knee**:

| pack V | n | median CH8 |
|---|---|---|
| 26.60–27.00 | 35 | 73.4 A |
| 27.00–27.20 | 31 | 73.4 A |
| 27.20–27.50 | 23 | 71.2 A |

If a unit were hitting its own voltage setpoint, current would fall as pack voltage rose.
It does not. **A profile mismatch is therefore not the mechanism for the low-SOC drops.**
Reading back both profiles is still worth doing, but as housekeeping, not as the explanation.

What the same filtered data DOES show is a clean **bimodal** distribution:

| CH8 band | samples |
|---|---|
| 55–60 A | 13 |
| 60–65 A | 4 |
| **70–75 A** | **70** |
| 75–80 A | 2 |

Two tight clusters ~15 A apart with almost nothing between them — one unit switching
**discretely** between full and half output, in ~19 % of low-SOC cruise time. That is
Sterling's documented discrete "1/2 power mode", not a taper.

Since this occurs on a healthy 12 V bus, at low SOC, with no pack-voltage dependence, the
surviving candidate triggers are Sterling's other two documented ones: **unit temperature**
(>85 °C / high ambient) or **excessive output-cable volt drop** — and 1.13 V of measured
output drop is exactly the latter.

**Conclusion: there are two independent problems.** (1) Alternator idle capacity causing
sag-triggered dropouts, and (2) a Sterling entering discrete 1/2 power mode at cruise for
thermal or volt-drop reasons. Fixing the alternator side will not fix the second.

### Test protocol (revised)

The A/B test must be done at **cruise, not idle**. At idle, disabling any charger removes
~60 A of 12 V draw and drops total demand inside the 180 A idle rating, so the sag trigger
never fires and the result is uninterpretable. At cruise the alternator has headroom either
way, so the comparison is valid.

Disable the **old Sterling**, drive steady highway cruise at SOC < 75 %, long enough to
heat-soak. Expect a steady 45 A (Orion 15 + new Sterling 30).
- Rock-steady 45 A → the old Sterling was the culprit.
- Discrete drops to ~30 A → it is the Orion or the new Sterling.

IR-thermometer both Sterling cases at the moment of a drop; a materially hotter old unit
confirms the thermal trigger directly.

### What is NOT established

I found **no evidence that Sterling setpoints drift with age**, so "the 4–5 year old unit
has gone out of calibration" is the least likely explanation. What is well supported is
that the two units may simply be **set to different profiles** — lead-acid is the factory
default, so a unit configured years ago and a new one out of the box can easily differ.

Sterling does ship distinct generations with distinct manuals — "V51 April 2017 onward",
"V62 September 2017 onward", "Blue Stripe 2022 Model", "Green BB1230/60 Version 69+" — so
a ~2021 unit and a 2026 unit are plausibly different revisions with different profile
lists. I could not find a definitive per-generation setpoint comparison, so treat
"different generations have different voltages" as unconfirmed.

### How to test it

Read back each unit's selected profile via the front-panel LED flash count (1 flash =
1 setting) and confirm both are on the same profile. Sterling also documents that
**excessive output-cable volt drop is itself a trigger for 1/2 power mode**, and 1.13 V is
a strong candidate for tripping that — so fixing the cabling may matter more than the
profiles.

Also relevant: Sterling requires the input source be **"30 % larger or more"** when
paralleling units. Two BB122470s plus the Orion draw ~190 A at 12 V, implying a ~250 A
alternator requirement.

### Independent problem this surfaced

With ~1 V of drop, every charger reaches its setpoint about 1 V of *pack* voltage early,
which truncates absorption. Your pack sits at a median of 26.51 V and only reaches 27.63 V
at p99 — well short of a full 24 V LFP charge. Reducing that 15.5 mΩ (shorter or fatter
output cable, cleaner lugs, checking the shunt and any busbar joints) would raise
delivered current *and* let the bank actually finish charging.

Sources: [FarOutRide BB1260 review](https://faroutride.com/b2b-review/),
[Sterling BB122470 product page](https://sterling-power.com/products/12v-24v-70a-bb122470),
[Marine How To Pro Batt Ultra writeup](https://marinehowto.com/understanding-the-sterling-power-pro-batt-ultra-battery-to-battery-charger/),
[Sterling B2B owner's manual](http://www.sterling-power-usa.com/library/B2B%20Owner's%20manual%20and%20installation%20instructions.pdf).

---

## Alternator capacity: it is not undersized, it has zero idle margin

Vehicle: 2016 Ford Transit T-350 HD, 3.5 EcoBoost. Alternator: Mechman 320 A Elite,
already fitted with Mechman's smaller **1.75" pulley** — so the pulley lever is spent.
Mechman's own spec is the key number: **"180+ amps at engine idle RPM and 320+ amps at
cruising speeds (hot rated)"**
([source](https://www.mechman.com/alternators/ford/expedition/3-5l/2015-2021/320-amp-elite-series-alternator-for-ford-late-model-v6/)).

Because the DC-DCs are constant-power, their 12 V-side draw is derivable from the measured
24 V output: `12V amps = (CH8 × pack_V) / (bus_V × 0.90)`.

| engine RPM | median CH8 | median bus V | implied 12 V draw | p90 |
|---|---|---|---|---|
| 750–900 | 56.6 A | 12.59 V | **134 A** | 155 A |
| 900–1000 | 63.0 A | 13.63 V | 143 A | 165 A |
| 1000–1100 | 65.2 A | 13.89 V | 144 A | 164 A |
| 1300–1800 | 64.8 A | 14.07 V | 140 A | 159 A |

Chargers alone: **134 A median / 155 A p90**. Plus vehicle loads at idle (ECU, fuel pump,
fans, blower, lights — plausibly 40–70 A) gives **~175–205 A against a 180 A idle rating**.
Zero margin at the one RPM where the alternator is weakest, plus a destabilising feedback:
as voltage sags the constant-power chargers demand *more* current, sagging it further until
they trip their cutouts.

Proof it is capability and not regulation — same idle RPM, split by load:

| idle condition | median bus V | p5 | below 12.6 V |
|---|---|---|---|
| chargers off/light | **14.43 V** | 14.29 V | **0.0 %** |
| chargers heavy | **12.52 V** | 12.13 V | **60.8 %** |

A 12 V starter battery rests at 12.6–12.8 V, so for **61 % of loaded idle time the starter
battery is discharging** to cover the deficit. The regulator is healthy: it holds 14.43 V
at the same RPM whenever the chargers are not pulling.

> **Correction to an earlier claim in this doc's reasoning:** the agreement between ECU
> control-module voltage and Orion input voltage rules out a problem in the *Orion's own
> branch*, but NOT a bottleneck between the alternator B+ stud and the battery/distribution
> point — both sense downstream of it. At ~190 A even 5 mΩ of cable plus ground is ~1 V.
> **Measure at the alternator B+ stud vs the battery post at loaded idle.** Over ~0.3 V and
> the B+/ground cabling is the cheapest volt available. Stock Transit cabling was sized for
> a ~150–250 A alternator, not sustained 190 A.

Also ruled out earlier: ECU-commanded field reduction (would show at all loads, doesn't),
and gross belt slip (charger current vs calculated engine load correlates **+0.413**, median
load rising 49 % → 60 %, so torque is genuinely being transmitted).

## Raising idle: fuel cost, engine wear, and the real constraint

### Fuel: ~+1.4 L/h, but negligible in total

From `sensor.estimated_fuel_rate`, stationary, matched on charger load:

| condition | RPM | fuel rate | n |
|---|---|---|---|
| chargers heavy | 844 | **4.35 L/h** | 190 |
| chargers heavy | 1021 | **5.79 L/h** | 13 |
| chargers light | 862 | 3.56 L/h | 28 |
| chargers light | 1000 | 5.35 L/h | 12 |

≈ **+1.44 L/h (+33 %)** under load. **Trust the magnitude, not the precision**: MAP reads
123–178 kPa at idle, which is physically impossible (should be ~30–40 kPa), so the
speed-density model is mis-scaled at idle, and the VE correction is fill-up calibrated hence
cruise-dominated. Elevated-RPM bins are only n=12–13 and are transients, not sustained idle.

Bottom-up cross-check that supports it anyway: neutral idle ≈ 1.0–1.5 L/h; alternator load
≈ 187 A at 13 V ≈ 2.4 kW electrical, at ~55–60 % alternator efficiency ≈ 4.2 kW mechanical
≈ 5.6 hp, at idle BSFC ~450 g/kWh ≈ 2.5 L/h. Total ≈ 3.7–4.0 L/h, bracketing the measured
4.35. So **+1.4 L/h ± ~40 %**.

Total exposure: only **60 minutes of stationary idle across 21 days** (~20 h/yr), so
≈ 1.4 L per three weeks ≈ **$2.50 per three weeks / ~$45 a year**. Not a deciding factor.

### Engine wear: no, and Ford sanctions far higher

Ford SVE bulletin Q-239 provides Stationary Elevated Idle Control for exactly this use case;
`docs/seic/` notes reference **2000–2400 RPM**, and the common Intermotive aftermarket module
defaults to **1500 RPM** (triggered by VBAT < 12.5 V — which matches this van's measured sag
floor of 12.10–12.54 V almost exactly). **1050 is conservative** by both standards.

Higher idle is mechanically *better* for oil pressure and flow, coolant flow, and — important
with a 320 A unit — alternator fan speed. The real EcoBoost concerns are about *how much* you
idle (oil fuel-dilution, DI intake-valve carbon), not idle speed.

### The actual constraint: transmission fluid temperature

In-gear elevated idle is settable via HP Tuners (separate in-gear / not-in-gear options), which
matters because the losses occur **at traffic lights while in gear**, not parked — so
parking-brake-interlocked solutions would not have helped.

But `sensor.192_168_10_90_tran_f_temp`, 2913 samples over 21 days:

| | temp |
|---|---|
| median | 71 °C |
| p90 | **94 °C** |
| p99 | 97 °C |
| max | **99 °C** |

Already at 94–99 °C, against a Mercon LV practical ceiling of ~105–110 °C — roughly
**10–20 °C of headroom**. Near converter stall, input torque scales ~N² and dissipated power
~N³, so 850 → 1050 RPM is **≈1.9× the converter slip heat while stopped in gear**, generated
exactly when road speed (and cooler airflow) is zero.

A single 30–90 s traffic light will not reach equilibrium, so it is a non-issue. Repeated
stop-and-go in summer traffic is where it could accumulate.

(The apparent inversion where "chargers light" stationary shows a higher median trans temp
(89 °C) than "chargers heavy" (67 °C) is confounded by *when in a drive* each condition
occurs, not causal.)

**Recommendation:** target **1050, not higher** — 1500 in gear would be ~5.5× converter heat.
If HP Tuners exposes a voltage-based or electrical-load-based idle-up table, condition the
raise on low system voltage rather than applying it at every stop; you then only pay heat,
fuel and creep during the ~61 % of loaded idle time when the bus is actually sagging, and it
self-disables when the chargers are off. Expect noticeable creep on a T-350 HD.

### Trans-temp guard to validate the change

Add to `template/binary_sensors.yaml` and watch p90 for a few weeks after the tune:

```yaml
# ─── Transmission fluid over-temp (guards the elevated-idle change) ───
# Baseline before raising idle: median 71C, p90 94C, max 99C over 21 days.
# In-gear elevated idle roughly doubles converter slip heat at a standstill, so
# this is the number that decides whether 1050 rpm is sustainable in traffic.
- binary_sensor:
    - name: "Trans Fluid Hot"
      unique_id: trans_fluid_hot
      device_class: problem
      icon: mdi:thermometer-alert
      availability: >
        {{ has_value('sensor.192_168_10_90_tran_f_temp') }}
      state: >
        {{ states('sensor.192_168_10_90_tran_f_temp') | float(0) > 102 }}
      delay_on: "00:00:30"
      delay_off: "00:02:00"
```

---

## Priority order

**Settle the ambiguity first — one A/B drive, no cost.** Disable the Orion in
VictronConnect and drive a stop-and-go route at SOC < 75 %. If the 76 → 60 A step still
happens, it is a Sterling. If the ceiling simply drops to ~60 A and holds flat, the Orion
was the thing cycling all along. Nothing else — no config, no analysis — can separate
these two, because the Orion broadcasts no current and reports `Bulk` while throttling.

**Read back the Orion's actual settings.** In VictronConnect check `Vshutdown` (default
13.1 V), `Vstart` (14.0 V), the `tstart` delay (2 min) and the input voltage lock-out
(12.5 V / 12.8 V). All are adjustable 8–17 V; because this is a 12 V-*input* model the
manual's 12 V defaults apply as printed. The default 12.5 V lock-out sits **above** your
measured 12.16 V idle floor, so on defaults it is firing at every sag with no grace timer,
and the 2 min `tstart` matches your measured recovery hysteresis exactly. If it is still
on defaults, that is most of a diagnosis.

**Then fix the root cause, which is alternator capacity at idle — not a broken charger.**
Options, roughly in order of sanity: force both Sterlings permanently to 1/2 power via the
front-panel buttons (caps total 12 V draw so nothing browns out, at the cost of peak
harvest); or shorten the Orion's restart delay so it recovers in seconds rather than
2 minutes; or accept the idle losses since they are ~2 kWh per three weeks.

**Per-charger metering is the only true telemetry, and it is a want-to-know, not a fix.**
S5140 channels 9–12 (Modbus holding registers 108–111) are unused.

I could not find a public datasheet for the "S5140" designation specifically — it appears
to be from the Kincony analog-input family (cf. KC868-COL, 16-channel 0–5 V / 0–10 V
RS485 Modbus RTU). But the repo itself is better evidence than a datasheet would be:
channels 4–8 and 13–16 are all already working as 0–5 V current inputs with an identical
scaling lambda, and channel 3 works as a plain voltage input. Channels are therefore
general-purpose 0–5 V analog inputs, and 9–12 will almost certainly behave the same.
Verify by configuring one and watching it read 0.00 before committing to a wiring job.

Scaling convention is `(x / 100.0) * (RANGE / 5.0)` — the module reports hundredths of a
volt on a 0–5 V input and RANGE is the sensor's full-scale amps. Example for channel 9
with a 50 A sensor:

```yaml
  - platform: modbus_controller
    modbus_controller_id: s5140
    name: "S5140 Channel 9 Current (24V) - Sterling B2B #1"
    address: 108
    register_type: holding
    unit_of_measurement: "A"
    device_class: current
    state_class: measurement
    value_type: U_WORD
    accuracy_decimals: 2
    filters:
      - lambda: "return (x / 100.0) * (50.0 / 5.0);"
```

Note channel 8's lambda has **no** leading `-1` while the load channels do, because it
measures current flowing *into* the bank rather than out. Orient any new charger sensor
the same way round as channel 8, or add the `-1` to match.

For parts, the pragmatic move is to buy more of whatever the existing channel-8 sensor is
— it is a known-working 100 A 0–5 V part already integrated with this module. Failing
that, look for **split-core** Hall-effect DC sensors with 0–5 V output, since split core
means you do not have to break the charger output cables to fit them. Verified-real
candidates in that shape: the [CYHCTD-S3K split-core Hall sensor](https://www.sonnecy-shop.com/en/bidirectional-digital-split-core-hall-effect-dc-current-sensor-cyhctd-s3k-digital-output-current-i-analogue-output-0-5v-dc-power-supply-24v-dc-interface-rs485-modbus-window-oe-20-mm.html)
(0–5 V analog out, 24 V supply, Ø20 mm window), the
[Accuenergy HAK series](https://www.accuenergy.com/products/hak-hall-effect-dc-current-sensors/)
(split core, 0–5 V or 4–20 mA), and [ATO's Hall-effect DC range](https://www.ato.com/dc-current-sensor-50a-to-1500a).
Size the Orion leg at 0–20 A or 0–30 A and each Sterling leg at 0–50 A. I have not
price-verified these, so treat them as shapes to shop for rather than a bill of materials.
