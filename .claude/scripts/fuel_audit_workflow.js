export const meta = {
  name: 'fuel-subsystem-audit',
  description: 'Audit & verify the van fuel-level/consumption/OBD subsystem; produce a prioritized, adversarially-verified fix plan',
  phases: [
    { title: 'Audit', detail: 'parallel auditors, one per dimension' },
    { title: 'Verify', detail: 'adversarial skeptic per finding' },
    { title: 'Synthesize', detail: 'dedupe + prioritize into a fix plan' },
  ],
}

const ROOT = 'c:/Users/Olin/Documents/Workspace/ha_config'

const GROUND_TRUTH = `
REPO ROOT: ${ROOT}
VEHICLE: 2016 Ford Transit T-350 HD, 3.5L EcoBoost V6. Fuel tank = 94.6 L (25 US gal). Gasoline density ~750 g/L.

=== LIVE GROUND TRUTH (verified by SSH to the running HA host, 2026-06-24; do NOT re-SSH, reason from this) ===

ENTITY EXISTENCE / CURRENT STATE (engine currently OFF, so WiCAN PIDs read 'unavailable'):
  sensor.192_168_10_90_2f_fueltanklevel = unavailable (raw OBD tank %, PID 0x2F)
  sensor.wican_fuel_ema                  = ENTITY NOT FOUND  <-- filter.yaml sensor never loaded
  sensor.wican_fuel_5_min_mean           = unavailable (EXISTS; recorder has 9255 rows 2026-05-28..06-23)
  sensor.wican_fuel_5_min_mean_2         = ENTITY NOT FOUND  <-- no collision suffix => only ONE such entity exists
  sensor.stable_fuel_level               = 84.31 %  (template trigger sensor, the dashboards' hero number)
  sensor.estimated_fuel_rate             = 0 L/h (engine off)
  sensor.estimated_fuel_consumption      = 0 L/100km (engine off)
  sensor.fuel_consumption_l100km         = ENTITY NOT FOUND  <-- dashboards/van.yaml references this; broken
  sensor.fuel_consumption_lh             = ENTITY NOT FOUND  <-- dashboards/van.yaml references this; broken
  sensor.estimated_fuel_used_total_l     = 88.308 L (Riemann integral of estimated_fuel_rate, unbounded total)
  sensor.vehicle_acceleration            = -0.9 km/h/s
  sensor.road_grade_deg                  = 0 ; sensor.road_grade = 0.0 %
  input_number.fuel_ve_correction        = 0.55 (DEFAULT; never auto-calibrated)
  input_text.previous_fuel_level         = unavailable (written by automations, READ BY NOTHING)
  input_text.last_fillup_ts              = 1782274117552 (set 2026-06-23 ~22:08 - suspicious, no real fill happened)
  input_text.ve_correction_history       = []  (empty; VE loop has never produced a correction)

CONFIG WIRING (configuration.yaml):
  line 64: sensor: !include integrations/sensor.yaml
  line 67: filter: !include filter.yaml   <-- BUG: 'filter' is NOT a valid HA integration key. The filter
           platform must be configured under sensor: (- platform: filter). So filter.yaml is silently ignored.
           Proof: sensor.wican_fuel_ema does not exist, and there is no _2 collision on wican_fuel_5_min_mean.
           Therefore the live sensor.wican_fuel_5_min_mean is the STATISTICS-platform sensor defined in
           integrations/sensor.yaml (state_characteristic: mean, max_age 5 min), NOT the filter.yaml lowpass.

DUPLICATE NAME: integrations/sensor.yaml defines "WiCAN Fuel 5 min mean" (statistics) AND filter.yaml defines
  "WiCAN Fuel 5 min mean" (lowpass) - same friendly name => same entity_id. Only the statistics one is live
  (filter.yaml not loaded). If filter.yaml were ever loaded correctly, the two would COLLIDE.

JUNE 23 2026 EVENING DRIVE (19:48-22:10 MDT, ~20 km round trip, real OBD data) - signal quality:
  raw fuel %     : n=321  start=100.00 end=84.31  min=65.49 max=100.00  RANGE=34.51  mean_step_jitter=6.963
  5min mean %    : n=556  start=94.51  end=82.79  min=81.40 max=94.51   RANGE=13.11  mean_step_jitter=0.153
  stable fuel %  : n=185  start=89.02  end=84.31  min=72.94 max=100.00  RANGE=27.06  mean_step_jitter=7.690
  => raw sloshes wildly. 5min mean is 45x smoother (jitter 0.15). stable_fuel_level is AS NOISY AS RAW
     (jitter 7.69 > raw 6.96) and spikes to 100 - its stability gating is NOT working. The +10 "fillup"
     bypass (raw-prev>10) latches upward slosh spikes, and the grade<=1.5 & accel<=thresh gate passes during
     city stop-and-go, so it latches noisy raw values. Yet BOTH dashboards show stable_fuel_level as the hero.
  est L/100km    : n=3442 mean(incl idle)=31.7 nonzero-mean=31.8 max=262.2 ; idle fraction only ~2% this drive
  est L/h        : nonzero-mean=9.3 max=34.2 ; speed moving-mean=39 km/h

LIVE API OUTPUT:
  /vanlife/fuel-trips?limit=8 summary: trip_count=8 total_km=20.1 total_l_used=6.8 avg_l_per_100km=33.8 tank=94.6
    recent trips: (10.2km: 85.9->83.0%, 26.5 L/100km) (9.9km: 91.1->86.8%, 41.4 L/100km)
    6 older April trips: fuel_start_pct=84.3 (all identical!) fuel_end_pct=None => dropped. Because recorder
    wican_fuel_5_min_mean only goes back to 2026-05-28, so April lookups returned the earliest May reading for
    start and None for end. (Data-retention artifact, but the unbounded nearest-after lookup is sloppy.)
  /vanlife/fuel-stats (14d): distance_km=20.11 segment_count=2 ; fuel 96.08->82.79% = used 13.29% = 12.57 L ;
    fuel_economy_l100km=62.5 (ABSURD) ; estimated_avg_l100km=31.0 (38903 readings) ; current_ve=0.55 ;
    suggested_ve=1.109. The 62.5 is garbage: fuel delta is measured over a 14-DAY window but distance is only
    the 2 GPS segments that fell fully inside the window (20 km) - most driving in those 14 days isn't in the
    segments table (post-GPS-migration gap), so the denominator is undercounted => inflated economy =>
    inflated suggested VE. (VE auto-update is gated by MIN_DISTANCE=50km so it didn't actually apply.)

filtered_gps.db: tables [segments, sqlite_sequence, parking_spots, filter_meta, named_places]. segments has
  539 rows, end_ts 2025-03-02..2026-06-23 (IS being populated by the new u-blox pipeline). fuel-trips/fuel-stats
  read distance from segments; fuel level from HA recorder sensor.wican_fuel_5_min_mean.

KNOWN-GOOD (do not "fix"): React react-dashboard/src/pages/Van.tsx FuelCard uses CORRECT entity ids
  (sensor.estimated_fuel_consumption, sensor.estimated_fuel_rate, sensor.wican_fuel_5_min_mean,
  sensor.stable_fuel_level). The BROKEN refs are only in the Lovelace dashboards/van.yaml (line 278-279).

=== KEY FILES (read them for exact line content) ===
  template/sensors.yaml         (estimated_fuel_rate ~298-349, estimated_fuel_consumption ~351-363, avg_fuel_trim ~384, commanded_afr ~407)
  template/triggered.yaml       (stable_fuel_level ~162-195)
  filter.yaml                   (whole; the unloaded EMA + dup 5min mean)
  integrations/sensor.yaml      (statistics 5min mean ~6-13, estimated_fuel_used_total_l ~74-80)
  automations.yaml              (fuel/movement section ~491-642: update_stable_fuel_level, update_previous_speed, update_fuel_on_wican_disconnect, initialize_fuel_level_on_startup, fill_up_detected)
  www/vanlife-panel/osrm_proxy.py (fuel-trips ~471-607, fuel-stats ~609-742)
  ve_update.py                  (whole; VE rolling-average calibration)
  dashboards/van.yaml           (fuel hero card ~262-310, broken refs line 278-279, fuel charts ~365-388)
  react-dashboard/src/pages/Van.tsx (FuelCard ~102-142)
  react-dashboard/src/hooks/useFuelTrips.ts ; react-dashboard/src/components/FuelTripHistory.tsx
  mqtt/sensors.yaml             (fuel tank level ~89-91, fuel trims ~128-155)
  configuration.yaml            (includes ~61-72)
  input_number.yaml (fuel_ve_correction) ; input_text.yaml (previous_fuel_level, last_fillup_ts, ve_correction_history)
`

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    dimension: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'short stable slug, e.g. filter-include-invalid' },
          title: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'nit'] },
          location: { type: 'string', description: 'file:line(s)' },
          claim: { type: 'string', description: 'the precise problem' },
          evidence: { type: 'string', description: 'why it is true (cite code/live data)' },
          proposed_fix: { type: 'string', description: 'concrete change, ideally exact edit' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['id', 'title', 'severity', 'location', 'claim', 'proposed_fix', 'confidence'],
      },
    },
  },
  required: ['dimension', 'findings'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['confirmed', 'refuted', 'partial'] },
    reason: { type: 'string' },
    fix_correct: { type: 'boolean', description: 'is the proposed fix correct AND safe for this HA/RV setup' },
    fix_risk: { type: 'string', enum: ['none', 'low', 'medium', 'high'] },
    refined_fix: { type: 'string', description: 'corrected/safer fix if the proposed one is wrong or risky; else echo it' },
  },
  required: ['id', 'verdict', 'reason', 'fix_correct', 'fix_risk'],
}

const DIMENSIONS = [
  {
    key: 'fuel-level-signal',
    prompt: `Audit the FUEL-LEVEL SIGNAL CHAIN and decide which signal is the most accurate absolute tank level.
Cover: the invalid 'filter: !include filter.yaml' key (filter platform must be under sensor:); the unused
sensor.wican_fuel_ema; the duplicate "WiCAN Fuel 5 min mean" name (statistics vs lowpass); whether to keep an
EMA at all; and especially sensor.stable_fuel_level (template/triggered.yaml) which the live drive shows is as
noisy as raw (jitter 7.69) because (a) the 'fillup = raw-prev>10' bypass latches slosh spikes and (b) the
grade<=1.5 & accel<=thresh gate passes during stop-and-go. Propose how to make a genuinely clean, slosh-free,
tilt-corrected level (e.g. latch stable_fuel_level from the 5-min mean rather than raw; raise/replace the
fillup bypass). Also assess: should the dashboards' hero number be the 5-min mean instead of stable? Be concrete
about which entity is "most accurate" for display vs for tank-delta math.`,
  },
  {
    key: 'consumption-math',
    prompt: `Independently re-derive and audit the SPEED-DENSITY consumption math in template/sensors.yaml
(Estimated Fuel Rate / Estimated Fuel Consumption) and integrations/sensor.yaml (Estimated Fuel Used Total L).
Check unit correctness end-to-end: ideal-gas air density, MAF = rho*Vd*RPM/120*VE (Vd=0.0035 m^3), fuel_gs =
maf/AFR*trim, L/h = g/s*3600/750. Check the RPM VE curve (0.60@600 -> 1.0@3000, clamped >=0.55), the fuel-trim
average ((stft1+ltft1)+(stft2+ltft2))/2, and lambda->AFR (14.7*lambda). Flag: idle/low-speed overestimation;
the L/100km sensor only computing at speed>5 (returns 0 otherwise) and what that does to any AVERAGING; the
Riemann 'Estimated Fuel Used Total' being unbounded and integrating idle overestimate. State whether 31 L/100km
is plausible for this vehicle and where the structural bias is. Propose concrete formula/curve/threshold fixes.`,
  },
  {
    key: 'trip-economy-api',
    prompt: `Audit the TRIP/ECONOMY API in www/vanlife-panel/osrm_proxy.py: _handle_fuel_trips and _handle_fuel_stats.
Key issues to evaluate and fix: (1) fuel-stats measures the fuel delta over a TIME window but distance only over
GPS segments inside it => with the post-migration segment gaps the denominator is undercounted and L/100km blows
up to 62.5 (live). (2) It samples sensor.wican_fuel_5_min_mean for tank deltas; would sensor.stable_fuel_level be
more accurate for start/end levels? (3) The nearest-fuel lookup with no max-staleness picks readings days away
(April trips got a May value). (4) fuel-stats' non-before_only branch still uses ORDER BY ABS() = full table scan.
(5) Short trips (<~30 km) produce meaningless economy because 1% tank res = 0.946 L dominates - should the API
flag/suppress economy for short spans? Propose concrete code changes (with care: read-only DB, keep JSON shape
stable for the React hook useFuelTrips.ts / FuelTripHistory.tsx).`,
  },
  {
    key: 've-calibration-loop',
    prompt: `Audit the closed-loop VE AUTO-CALIBRATION: automation fill_up_detected (automations.yaml ~596-642),
ve_update.py, the /vanlife/fuel-stats suggested_ve_correction, and input_text.ve_correction_history /
input_number.fuel_ve_correction. Evaluate: suggested_ve = current_ve * actual/estimated where 'actual' is the
inflated tank-method economy (garbage on short/fragmented drives) and 'estimated' is a TIME-weighted mean of
instantaneous L/100km (idle-biased) - is this ratio sound? The MIN_DISTANCE=50km guard means it basically never
runs (drives are ~10-20 km) so VE is stuck at 0.55 forever - is that acceptable or should calibration be
fill-to-fill only with a long accumulation? Also: can fill_up_detected FALSE-TRIGGER when WiCAN reconnects and
stable_fuel_level jumps from a stale held value to the real (higher) level (note last_fillup_ts was set 06-23
with no real fill and history is still [])? Propose concrete, safe fixes.`,
  },
  {
    key: 'entity-wiring-deadcode',
    prompt: `Audit ENTITY WIRING, DEAD CODE, and CONSISTENCY across the fuel subsystem. Confirm and fix: (1)
dashboards/van.yaml lines 278-279 reference sensor.fuel_consumption_l100km and sensor.fuel_consumption_lh which
DO NOT EXIST (correct entities: sensor.estimated_fuel_consumption [L/100km] and sensor.estimated_fuel_rate [L/h]).
(2) input_text.previous_fuel_level is written by automations (update_stable_fuel_level,
update_fuel_on_wican_disconnect, initialize_fuel_level_on_startup) but READ BY NOTHING now that the template
sensor.stable_fuel_level exists - are these automations fully dead, or does update_previous_speed still feed
sensor.vehicle_acceleration? Verify before recommending deletion. (3) Any other Lovelace-vs-React entity-id drift
in the fuel cards. (4) A leftover Syncthing artifact shell_commands.sync-conflict-20260624-104645-7EM6772.yaml
should be deleted. Give exact edits/removals. Read the actual files to confirm each before proposing deletion.`,
  },
]

phase('Audit')
log('Auditing fuel subsystem across 5 dimensions, then adversarially verifying each finding...')

const verified = await pipeline(
  DIMENSIONS,
  (d) => agent(
    `You are auditing one dimension of a Home Assistant van/RV fuel subsystem. Read the actual repo files you
need (you have Read/Grep/Glob). Reason from the provided LIVE GROUND TRUTH - do NOT SSH; the host data below is
authoritative and current. Find real, actionable issues (correctness + accuracy + dead code), each with a
concrete fix. Be precise with file:line. Do not invent problems; severity-rank honestly.

DIMENSION: ${d.key}
${d.prompt}

${GROUND_TRUTH}`,
    { label: `audit:${d.key}`, phase: 'Audit', schema: FINDINGS_SCHEMA, effort: 'high' },
  ),
  (audit, dim) => {
    if (!audit || !audit.findings || !audit.findings.length) return []
    return parallel(
      audit.findings.map((f) => () =>
        agent(
          `You are an adversarial verifier. A fuel-subsystem auditor made this finding. Try to REFUTE it by reading
the actual file(s) cited and checking against the LIVE GROUND TRUTH. Confirm only if the code/data truly supports
it. Then judge whether the proposed fix is correct AND safe for a live HA + ESPHome + RV setup (a wrong fuel/VE
change can mislead range planning or trip a heater low-fuel lockout). If the fix is wrong or risky, give a refined
fix. Default skeptical: if you cannot substantiate the claim from the actual files, mark it refuted.

FINDING (dimension ${dim.key}):
id: ${f.id}
title: ${f.title}
severity: ${f.severity}
location: ${f.location}
claim: ${f.claim}
evidence: ${f.evidence || '(none given)'}
proposed_fix: ${f.proposed_fix}

${GROUND_TRUTH}`,
          { label: `verify:${f.id}`, phase: 'Verify', schema: VERDICT_SCHEMA, effort: 'high' },
        ).then((v) => ({ finding: f, dimension: dim.key, verdict: v }))
      )
    )
  },
)

const flat = verified.flat().filter(Boolean)
const confirmed = flat.filter((x) => x.verdict && x.verdict.verdict !== 'refuted')
const refuted = flat.filter((x) => x.verdict && x.verdict.verdict === 'refuted')
log(`Verification: ${confirmed.length} confirmed/partial, ${refuted.length} refuted, of ${flat.length} findings.`)

phase('Synthesize')
const SYNTH_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    most_accurate_fuel_level: { type: 'string', description: 'definitive answer: which entity/approach is the most accurate fuel level, for display and for tank-delta math, with the reason' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rank: { type: 'number' },
          title: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'nit'] },
          files: { type: 'array', items: { type: 'string' } },
          change: { type: 'string', description: 'exact change to make' },
          rationale: { type: 'string' },
          risk: { type: 'string', enum: ['none', 'low', 'medium', 'high'] },
        },
        required: ['rank', 'title', 'severity', 'change', 'risk'],
      },
    },
  },
  required: ['summary', 'most_accurate_fuel_level', 'items'],
}

const synth = await agent(
  `Synthesize the verified fuel-subsystem findings into ONE prioritized, deduplicated fix plan for the developer.
Merge overlapping findings. Drop refuted ones. Order by impact on (1) fuel-LEVEL accuracy, (2) fuel-CONSUMPTION/
economy accuracy, (3) correctness of entity wiring/dead code. For each item give exact files + the precise change
and a risk rating. Also answer definitively: what is the MOST ACCURATE fuel level signal to use (for the dashboard
hero number and for tank-delta economy math) and why. Keep it concrete and implementation-ready.

CONFIRMED/PARTIAL FINDINGS (with verifier verdicts and refined fixes):
${JSON.stringify(confirmed.map((x) => ({ dimension: x.dimension, finding: x.finding, verdict: x.verdict })), null, 1)}

REFUTED (excluded - listed so you don't resurrect them):
${JSON.stringify(refuted.map((x) => ({ id: x.finding.id, title: x.finding.title, reason: x.verdict && x.verdict.reason })), null, 1)}

${GROUND_TRUTH}`,
  { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA, effort: 'high' },
)

return { confirmed_count: confirmed.length, refuted_count: refuted.length, synthesis: synth, all_verified: flat }
