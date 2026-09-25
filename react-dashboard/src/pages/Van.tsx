import { PageContainer } from '@/components/layout/PageContainer';
import { CurrentTripCard } from '@/components/CurrentTripCard';
import { LivingSpaceCard } from '@/components/LivingSpaceCard';
import { VanBadges } from '@/components/VanBadges';
import { FuelTripHistory } from '@/components/FuelTripHistory';
import { StarlinkBanner, StarlinkBadge } from '@/components/StarlinkStatus';
import { SparklineStat, ClickableValue } from '@/components/ClickableValue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useHistory } from '@/hooks/useHistory';
import { Sparkline } from '@/components/Chart';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { useDTCDialog } from '@/components/DTCDialog';
import { useToggle } from '@/hooks/useService';
import { fmt, cn, isFresh } from '@/lib/utils';
import {
  Gauge,
  Fuel,
  Thermometer,
  Car,
  CircleDot,
  AlertTriangle,
  Mountain,
  Battery,
  BatteryLow,
  Sun,
} from 'lucide-react';

function EngineCard() {
  const { value: speed } = useEntityNumeric('sensor.192_168_10_90_0d_vehiclespeed');
  const { value: rpm } = useEntityNumeric('sensor.192_168_10_90_0c_enginerpm');
  const gear = useEntity('sensor.gear_display');
  const { value: throttle } = useEntityNumeric('sensor.192_168_10_90_11_throttleposition');
  const { value: load } = useEntityNumeric('sensor.192_168_10_90_04_calcengineload');
  const { value: coolant } = useEntityNumeric('sensor.192_168_10_90_05_enginecoolanttemp');
  const { value: chargerV } = useEntityNumeric('sensor.a32_pro_orion_input_voltage');
  const moving = useEntity('binary_sensor.vehicle_is_moving');
  const engine = useEntity('binary_sensor.engine_is_running');
  const ecuStatus = useEntity('binary_sensor.meatpi_pro_ecu_status');

  const { data: speedHistory } = useHistory('sensor.192_168_10_90_0d_vehiclespeed', 6);
  const { open } = useHistoryDialog();

  // WiCAN status topic is unreliable (reports "offline" while publishing data).
  // Use RPM entity freshness as the real connectivity heartbeat instead.
  const rpmEntity = useEntity('sensor.192_168_10_90_0c_enginerpm');
  const wicanConnected = isFresh(rpmEntity?.last_updated, 120);
  const isMoving = moving?.state === 'on';
  const engineOn = engine?.state === 'on';
  const gearText = gear?.state ?? '—';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Car className="h-4 w-4" />
          Engine
          <div className="ml-auto flex gap-1.5">
            {!wicanConnected && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30">
                Disconnected
              </Badge>
            )}
            {engineOn && (
              <Badge variant="default" className="text-[10px] bg-green-500">
                Running
              </Badge>
            )}
            {isMoving && (
              <Badge variant="default" className="text-[10px] bg-blue-500">
                Moving
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors" onClick={() => open('sensor.192_168_10_90_0d_vehiclespeed', 'Speed', 'km/h')}>
            <p className="text-3xl font-bold tabular-nums">{fmt(speed, 0)}</p>
            <p className="text-[10px] text-muted-foreground">km/h</p>
          </div>
          <div className="cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors" onClick={() => open('sensor.192_168_10_90_0c_enginerpm', 'RPM', 'rpm')}>
            <p className="text-3xl font-bold tabular-nums">{fmt(rpm, 0)}</p>
            <p className="text-[10px] text-muted-foreground">RPM</p>
          </div>
          <div>
            <p className="text-3xl font-bold tabular-nums">{gearText}</p>
            <p className="text-[10px] text-muted-foreground">Gear</p>
          </div>
        </div>
        <Sparkline data={speedHistory} color="#3b82f6" width={300} height={32} className="w-full" onClick={() => open('sensor.192_168_10_90_0d_vehiclespeed', 'Speed', 'km/h')} />
        <div className="grid gap-1">
          <SparklineStat entityId="sensor.192_168_10_90_11_throttleposition" label="Throttle" value={fmt(throttle, 0)} unit="%" color="#f59e0b" />
          <SparklineStat entityId="sensor.192_168_10_90_04_calcengineload" label="Engine Load" value={fmt(load, 0)} unit="%" color="#ef4444" />
          <SparklineStat entityId="sensor.192_168_10_90_05_enginecoolanttemp" label="Coolant Temp" value={fmt(coolant, 0)} unit="°C" color="#ef4444" />
          <SparklineStat entityId="sensor.a32_pro_orion_input_voltage" label="Charger Input" value={fmt(chargerV, 2)} unit="V" color="#6366f1" />
        </div>
      </CardContent>
    </Card>
  );
}

function FuelCard() {
  const { value: stable } = useEntityNumeric('sensor.stable_fuel_level');
  const { value: raw } = useEntityNumeric('sensor.192_168_10_90_2f_fueltanklevel');
  const { value: mean5 } = useEntityNumeric('sensor.wican_fuel_5_min_mean');
  const { value: economy } = useEntityNumeric('sensor.estimated_fuel_consumption');
  const { value: rate } = useEntityNumeric('sensor.estimated_fuel_rate');
  const { value: speed } = useEntityNumeric('sensor.192_168_10_90_0d_vehiclespeed');

  const { data: fuelHistory } = useHistory('sensor.stable_fuel_level', 24);
  const { open: openFuel } = useHistoryDialog();

  const tankLiters = stable != null ? (stable / 100) * 94.6 : null;
  const stableNum = stable ?? 0;
  const fuelColor =
    stableNum < 15 ? 'text-red-500' : stableNum < 30 ? 'text-orange-500' : 'text-green-500';
  const economyDisplay = (speed ?? 0) > 5 ? fmt(economy, 1) : '—';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Fuel className="h-4 w-4" />
          Fuel
          <div className="ml-auto flex items-center gap-2">
            <Sparkline data={fuelHistory} color={stableNum < 15 ? '#ef4444' : stableNum < 30 ? '#f97316' : '#22c55e'} width={56} height={18} onClick={() => openFuel('sensor.stable_fuel_level', 'Fuel Level', '%')} />
            <span className={cn('text-2xl font-bold tabular-nums', fuelColor)}>
            {fmt(stable, 0)}%
          </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <SparklineStat entityId="sensor.stable_fuel_level" label="Estimated" value={fmt(tankLiters, 1)} unit="L" color="#22c55e" />
        <SparklineStat entityId="sensor.wican_fuel_5_min_mean" label="5min Mean" value={fmt(mean5, 0)} unit="%" color="#3b82f6" />
        <SparklineStat entityId="sensor.192_168_10_90_2f_fueltanklevel" label="Raw OBD" value={fmt(raw, 0)} unit="%" color="#64748b" />
        {(rate ?? 0) > 0 && <SparklineStat entityId="sensor.estimated_fuel_rate" label="Rate" value={fmt(rate, 1)} unit="L/h" color="#f59e0b" />}
        {(rate ?? 0) > 0 && <SparklineStat entityId="sensor.estimated_fuel_consumption" label="Economy" value={economyDisplay} unit="L/100km" color="#8b5cf6" />}
      </CardContent>
    </Card>
  );
}

function TirePressureCard() {
  const { value: flRaw } = useEntityNumeric('sensor.192_168_10_90_tyre_p_fl');
  const { value: frRaw } = useEntityNumeric('sensor.192_168_10_90_tyre_p_fr');
  const { value: rlRaw } = useEntityNumeric('sensor.192_168_10_90_tyre_p_rl');
  const { value: rrRaw } = useEntityNumeric('sensor.192_168_10_90_tyre_p_rr');
  const lowTire = useEntity('binary_sensor.low_tire_pressure');
  const isLow = lowTire?.state === 'on';

  // Entity now reports directly in psi (conversion done in MQTT discovery value_template)
  const fl = flRaw;
  const fr = frRaw;
  const rl = rlRaw;
  const rr = rrRaw;

  // Transit T-350 HD: front ~65 psi, rear ~80 psi recommended
  const tireColor = (psi: number | null) =>
    (psi ?? 0) < 50 ? 'text-red-500' : (psi ?? 0) < 55 ? 'text-orange-500' : 'text-green-500';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CircleDot className="h-4 w-4" />
          Tire Pressure
          {isLow && (
            <Badge variant="destructive" className="ml-auto text-[10px]">
              LOW
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Front Left</p>
            <p className={cn('text-xl font-bold tabular-nums', tireColor(fl))}>{fmt(fl, 0)}</p>
            <p className="text-[10px] text-muted-foreground">psi</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Front Right</p>
            <p className={cn('text-xl font-bold tabular-nums', tireColor(fr))}>{fmt(fr, 0)}</p>
            <p className="text-[10px] text-muted-foreground">psi</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Rear Left</p>
            <p className={cn('text-xl font-bold tabular-nums', tireColor(rl))}>{fmt(rl, 0)}</p>
            <p className="text-[10px] text-muted-foreground">psi</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Rear Right</p>
            <p className={cn('text-xl font-bold tabular-nums', tireColor(rr))}>{fmt(rr, 0)}</p>
            <p className="text-[10px] text-muted-foreground">psi</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoadGradeCard() {
  const { value: gradeDeg } = useEntityNumeric('sensor.road_grade_deg');
  const { value: gradePct } = useEntityNumeric('sensor.road_grade');
  const aggression = useEntity('sensor.hill_aggression');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mountain className="h-4 w-4" />
          Road Grade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <SparklineStat entityId="sensor.road_grade" label="Grade" value={fmt(gradePct, 1)} unit="%" color="#22c55e" />
        <SparklineStat entityId="sensor.road_grade_deg" label="Degrees" value={fmt(gradeDeg, 1)} unit="°" color="#6366f1" />
        <SparklineStat entityId="sensor.hill_aggression" label="Terrain" value={aggression?.state ?? '—'} unit="" color="#64748b" />
      </CardContent>
    </Card>
  );
}

function DiagnosticsCard() {
  const { value: oilLife } = useEntityNumeric('sensor.192_168_10_90_oil_life');
  const { value: wastegate } = useEntityNumeric('sensor.192_168_10_90_wastegate');
  const { value: intakeAir } = useEntityNumeric('sensor.192_168_10_90_intake_air_tmp');
  const { value: ambientAir } = useEntityNumeric('sensor.192_168_10_90_46_ambientairtemp');
  const { value: fuelPressure } = useEntityNumeric('sensor.192_168_10_90_fuel_pressure');
  const { value: mapKpa } = useEntityNumeric('sensor.192_168_10_90_map');
  const { value: injPw } = useEntityNumeric('sensor.injector_pulse_width');
  const { value: fuelTrim } = useEntityNumeric('sensor.average_fuel_trim');
  const { value: afr } = useEntityNumeric('sensor.commanded_afr');
  const { value: fuelPumpDuty } = useEntityNumeric('sensor.192_168_10_90_fuel_pump_duty');
  const cel = useEntity('binary_sensor.check_engine_light');
  const dtcState = useEntity('sensor.transit_active_dtcs');
  const dtcCount = dtcState?.state === 'System Clear' || !dtcState?.state ? 0 : parseInt(dtcState.state) || 0;
  const isCel = cel?.state === 'on' || dtcCount > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Diagnostics
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <SparklineStat entityId="sensor.192_168_10_90_oil_life" label="Oil Life" value={fmt(oilLife, 0)} unit="%" color="#22c55e" />
        <SparklineStat entityId="sensor.192_168_10_90_wastegate" label="Wastegate" value={fmt(wastegate, 0)} unit="%" color="#f59e0b" />
        <SparklineStat entityId="sensor.192_168_10_90_intake_air_tmp" label="Intake Air" value={fmt(intakeAir, 0)} unit="°C" color="#06b6d4" />
        <SparklineStat entityId="sensor.192_168_10_90_46_ambientairtemp" label="Ambient Air" value={fmt(ambientAir, 0)} unit="°C" color="#3b82f6" />
        <SparklineStat entityId="sensor.192_168_10_90_fuel_pressure" label="Fuel Pressure" value={fmt(fuelPressure, 0)} unit="kPa" color="#8b5cf6" />
        <SparklineStat entityId="sensor.192_168_10_90_map" label="MAP" value={fmt(mapKpa, 0)} unit="kPa" color="#14b8a6" />
        <SparklineStat entityId="sensor.injector_pulse_width" label="Injector PW" value={fmt(injPw, 2)} unit="ms" color="#e879f9" />
        <SparklineStat entityId="sensor.average_fuel_trim" label="Fuel Trim" value={fmt(fuelTrim, 1)} unit="%" color="#fb923c" />
        <SparklineStat entityId="sensor.commanded_afr" label="AFR" value={fmt(afr, 1)} unit=":1" color="#a78bfa" />
        <SparklineStat entityId="sensor.192_168_10_90_fuel_pump_duty" label="Fuel Pump Duty" value={fmt(fuelPumpDuty, 0)} unit="%" color="#facc15" />
      </CardContent>
    </Card>
  );
}

/**
 * LiFePO4 safe temperature bands (van 24V pack).
 *  • Charging is only allowed 0–45 °C — charging below 0 °C plates lithium and
 *    permanently damages cells, so sub-freezing is the most critical limit.
 *  • Discharge is tolerated roughly −20–60 °C; optimal cycle life is 15–35 °C.
 * Colors: <0 critical-cold (blue) · 0–5 cold (cyan) · 5–40 good (green) ·
 *         40–45 warm (orange) · >45 hot/critical (red).
 */
function battTempColor(t: number | null): string {
  if (t == null) return 'text-foreground';
  if (t < 0) return 'text-blue-500';
  if (t < 5) return 'text-cyan-400';
  if (t <= 40) return 'text-green-400';
  if (t <= 45) return 'text-orange-400';
  return 'text-red-500';
}

/**
 * Engine coolant — 2016 Transit 3.5L EcoBoost (Gen1), °C.
 * These run hot by design: owners report 190–210 °F (88–99 °C) warmed up, and the
 * Gen2 sits hotter still (205–216 °F). Ford's PCM sets P0217 "coolant over
 * temperature" and pulls power (limp mode) above roughly 220–230 °F (105–110 °C),
 * and forum consensus treats ~226 °F (108 °C) as the worry point. Below ~70 °C the
 * engine simply isn't up to temperature yet — economy is poor and it shouldn't be
 * worked hard, so that reads as its own "warming up" state rather than "good".
 */
function coolantTempColor(t: number | null): string {
  if (t == null) return 'text-foreground';
  if (t < 70) return 'text-cyan-400'; // still warming up
  if (t <= 103) return 'text-green-400'; // normal band (≤ ~217 °F)
  if (t < 110) return 'text-orange-400'; // hot — closing on the P0217 threshold
  return 'text-red-500'; // ≥110 °C / 230 °F — over-temp, expect limp mode
}

/**
 * 6R80 transmission fluid, °C.
 * Ford's spec band is 180–200 °F (82–93 °C); warmed-up cruising runs 190–210 °F and
 * the thermal bypass valve opens to the cooler at 185 °F (85 °C). Fluid life drops
 * sharply once it's held at 220–225 °F (104–107 °C), and 230–240 °F (110–116 °C)
 * means change it. Cold matters on this van too: below ~60 °C the torque converter
 * slips noticeably (the diagnosed cold-ATF slip), and the level check wants 80–85 °C.
 */
function transTempColor(t: number | null): string {
  if (t == null) return 'text-foreground';
  if (t < 60) return 'text-cyan-400'; // cold ATF — converter slips until it warms
  if (t <= 103) return 'text-green-400'; // normal band (≤ ~218 °F)
  if (t < 116) return 'text-orange-400'; // 220–240 °F — fluid degrading fast
  return 'text-red-500'; // ≥116 °C / 240 °F — cooking the fluid
}

/**
 * Ambient air, °C — a cold→hot temperature scale, NOT a good/bad one. Outside air
 * isn't a fault condition, so it diverges from a neutral "comfortable" middle out to
 * cool hues one way and warm hues the other, with no green/yellow in between (that
 * would read as a health verdict, and blue→green→red is the rainbow ramp to avoid).
 * Sub-zero still reads unmistakably cold, which is the one that carries weight on
 * this van: below 0 °C the LiFePO4 pack can't be charged and the plumbing is at risk.
 */
function ambientTempColor(t: number | null): string {
  if (t == null) return 'text-foreground';
  if (t <= -15) return 'text-blue-500'; // deep cold
  if (t <= 0) return 'text-sky-400'; // freezing — no LiFePO4 charging, pipes at risk
  if (t < 10) return 'text-cyan-400'; // cold
  if (t < 24) return 'text-foreground'; // comfortable — neutral midpoint
  if (t < 30) return 'text-amber-400'; // warm
  if (t < 35) return 'text-orange-400'; // hot
  return 'text-red-500'; // very hot
}

/**
 * Orion input voltage = the 12 V chassis/alternator side, so "healthy" depends on
 * whether the engine is turning:
 *  • Running — Ford's smart charge should hold ~13.5 V+ (13.7 V at the 1300 rpm
 *    knee); the Orion folds its charge rate back at 13.0 V, so a sagging bus is the
 *    real warning and anything under that means it's throttling or not charging.
 *  • Parked — the same wire is just the starter battery resting: 12.6 V ≈ 90 %+,
 *    12.2 V ≈ 50 %, and below ~12.0 V is deep-discharge (DC-DC lockout is 12.0/12.5 V).
 * Above 15 V is a regulator fault either way.
 */
function chargerVoltageColor(v: number | null, running: boolean): string {
  if (v == null) return 'text-foreground';
  if (v > 15) return 'text-red-500'; // overvoltage — regulator fault
  if (running) {
    if (v > 14.8) return 'text-orange-400'; // higher than smart-charge should command
    if (v >= 13.6) return 'text-green-400'; // full charge rate
    if (v >= 13.0) return 'text-orange-400'; // sagging toward Orion fold-back
    return 'text-red-500'; // not charging / folded back
  }
  if (v >= 12.6) return 'text-green-400'; // ~90–100 % resting
  if (v >= 12.2) return 'text-orange-400'; // ~50–80 %
  return 'text-red-500'; // under 50 % — starter battery low
}

/** Main glance card — battery state plus the vitals watched while driving. */
function MainHeroCard() {
  // Power / battery
  const { value: soc } = useEntityNumeric('sensor.olins_van_bms_battery');
  const { value: battCurrent } = useEntityNumeric('sensor.olins_van_bms_current');
  const { value: battPower } = useEntityNumeric('sensor.olins_van_bms_power');
  const { value: battVoltage } = useEntityNumeric('sensor.olins_van_bms_voltage');
  const { value: battTemp } = useEntityNumeric('sensor.olins_van_bms_temperature');
  const { value: storedWh } = useEntityNumeric('sensor.olins_van_bms_stored_energy');
  // Avg battery %/h across the last 20 drives (vanlife-proxy REST sensor) —
  // shown in the battery tile while the engine runs, as "what to expect". Net
  // pack change (solar in, loads out); negative means drives have been
  // DRAINING the pack, which is the DC-DC-failure symptom worth surfacing.
  const { value: driveChargeRate } = useEntityNumeric('sensor.average_drive_charge_rate');
  const { value: solarA } = useEntityNumeric('sensor.total_mppt_output_current');
  const estimateEntity = useEntity('sensor.battery_time_estimate');
  const ecoEntity = useEntity('input_boolean.power_saving_mode');
  const toggleEco = useToggle('input_boolean.power_saving_mode');
  const ecoOn = ecoEntity?.state === 'on';

  // Driving vitals
  const { value: coolant } = useEntityNumeric('sensor.192_168_10_90_05_enginecoolanttemp');
  const { value: transTemp } = useEntityNumeric('sensor.192_168_10_90_tran_f_temp');
  const { value: gradePct } = useEntityNumeric('sensor.road_grade');
  const aggression = useEntity('sensor.hill_aggression');
  const { value: rpm } = useEntityNumeric('sensor.192_168_10_90_0c_enginerpm');
  const { value: chargerV } = useEntityNumeric('sensor.a32_pro_orion_input_voltage');
  // Last-good cache (template sensor) so ambient holds its reading when the van
  // is off / WiCAN stops publishing, instead of blanking after the 30s expiry.
  const { value: ambient } = useEntityNumeric('sensor.ambient_air_temp_last_good');

  const { open } = useHistoryDialog();

  const socColor = (soc ?? 0) < 20 ? 'text-red-500' : (soc ?? 0) < 40 ? 'text-orange-400' : 'text-green-400';
  const battCurrentVal = battCurrent ?? 0;
  const battColor = battCurrentVal > 0 ? 'text-green-400' : battCurrentVal < -5 ? 'text-orange-400' : 'text-foreground';
  // Watts into (+) / out of (−) the pack, shown under the amps so you can see
  // whether the charger actually backs off as SOC climbs or just holds power
  // while the current falls. BMS power is signed; fall back to I×V if that
  // entity is missing so the sub-line never blanks on its own.
  const battWatts =
    battPower ?? (battCurrent != null && battVoltage != null ? battCurrent * battVoltage : null);
  const battWattsRounded = battWatts != null ? Math.round(battWatts) : null;
  const solarActive = (solarA ?? 0) > 0.5;
  const coolantColor = coolantTempColor(coolant);
  const transColor = transTempColor(transTemp);
  const ambientColor = ambientTempColor(ambient);
  // Engine turning? Decides which voltage scale applies (charging vs resting SOC).
  const engineRunning = (rpm ?? 0) > 400;
  const chargerVColor = chargerVoltageColor(chargerV, engineRunning);

  const estimate = estimateEntity?.state;
  const estimateDisplay =
    !estimate || estimate === 'unknown' || estimate === 'unavailable'
      ? '—'
      : estimate === 'Idle'
        ? 'Idle'
        : estimate;

  return (
    <Card>
      {/* Spacing is tighter below sm: on a phone this card, the trip and the
          living space have to share one screen while driving. */}
      <CardContent className="py-3 sm:py-4">
        <div className="divide-y divide-border sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {/* ── Power / battery ── */}
          <div className="pb-2 sm:pb-0 sm:pr-4">
            <div className="mb-1.5 flex items-center justify-between sm:mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Battery className="h-3.5 w-3.5" />
                Power
              </span>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    'cursor-pointer gap-1 font-mono',
                    solarActive ? 'border-yellow-500/40 text-yellow-400' : 'text-muted-foreground',
                  )}
                  onClick={() => open('sensor.total_mppt_output_current', 'Solar Current', 'A')}
                >
                  <Sun className="h-3 w-3" />
                  {fmt(solarA, 1)} A
                </Badge>
                <Badge
                  variant={ecoOn ? 'warning' : 'outline'}
                  className={cn('cursor-pointer gap-1', !ecoOn && 'text-muted-foreground')}
                  onClick={toggleEco}
                >
                  <BatteryLow className="h-3 w-3" />
                  Eco
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50 max-sm:py-1" onClick={() => open('sensor.olins_van_bms_battery', 'Battery', '%')}>
                <p className={cn('text-3xl font-bold tabular-nums', socColor)}>{fmt(soc, 0)}%</p>
                <p className="text-[10px] text-muted-foreground">Battery</p>
                {/* On a phone the drive rate shares the Wh line, so the card is
                    no taller with the engine running (the driving screen). Wider
                    screens give it its own line. */}
                <p className="text-[9px] tabular-nums text-muted-foreground/70">
                  {storedWh != null ? `${Math.round(storedWh)} Wh` : '—'}
                  {engineRunning && driveChargeRate != null && (
                    <>
                      <span className="sm:hidden"> · </span>
                      <span
                        className={cn(
                          'font-medium sm:block',
                          driveChargeRate >= 0 ? 'text-green-400/90' : 'text-orange-400',
                        )}
                        title="Avg battery %/h over your last 20 drives — net of solar input and house loads"
                      >
                        ≈{driveChargeRate >= 0 ? '+' : ''}{driveChargeRate.toFixed(1)}%/h
                        <span className="max-sm:hidden"> driving</span>
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50 max-sm:py-1" onClick={() => open('sensor.olins_van_bms_current', 'Battery Current', 'A')}>
                <p className={cn('text-3xl font-bold tabular-nums', battColor)}>{fmt(battCurrent, 1)}</p>
                <p className="text-[10px] text-muted-foreground">Amps</p>
                <p
                  className="text-[9px] tabular-nums text-muted-foreground/70 transition-colors hover:text-muted-foreground"
                  title="Watts into (+) or out of (−) the pack — tap for history"
                  onClick={(e) => {
                    e.stopPropagation();
                    open('sensor.olins_van_bms_power', 'Battery Power', 'W');
                  }}
                >
                  {battWattsRounded != null
                    ? `${battWattsRounded > 0 ? '+' : ''}${battWattsRounded === 0 ? 0 : battWattsRounded} W`
                    : '—'}
                </p>
              </div>
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50 max-sm:py-1" onClick={() => open('sensor.olins_van_bms_temperature', 'Battery Temp', '°C')}>
                <p className={cn('text-3xl font-bold tabular-nums', battTempColor(battTemp))}>{fmt(battTemp, 0)}°</p>
                <p className="text-[10px] text-muted-foreground">Batt Temp</p>
              </div>
            </div>

            {/* Long SOC bar, with the time to full / empty at its end */}
            <div className="mt-2 flex items-center gap-3 px-1">
              <Progress value={soc ?? 0} className="h-2.5 flex-1" indicatorClassName={(soc ?? 0) < 20 ? 'bg-red-500' : (soc ?? 0) < 40 ? 'bg-orange-400' : 'bg-green-500'} />
              <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">{estimateDisplay}</span>
            </div>
          </div>

          {/* ── Driving vitals ── */}
          <div className="pt-2 sm:pt-0 sm:pl-4">
            <div className="mb-1.5 flex items-center justify-between sm:mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Gauge className="h-3.5 w-3.5" />
                Driving
              </span>
              {/* PoE converter lockup this covers happens while driving, so this
                  is where you'll be looking when it bites. */}
              <StarlinkBadge className="font-mono text-[10px]" />
            </div>

            {/* The three temperatures — each its own slot so they read as peers. */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50 max-sm:py-1" onClick={() => open('sensor.192_168_10_90_05_enginecoolanttemp', 'Coolant Temp', '°C')}>
                <p className={cn('text-2xl font-bold tabular-nums', coolantColor)}>{fmt(coolant, 0)}°</p>
                <p className="text-[10px] text-muted-foreground">Coolant</p>
              </div>
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50 max-sm:py-1" onClick={() => open('sensor.192_168_10_90_tran_f_temp', 'Trans Temp', '°C')}>
                <p className={cn('text-2xl font-bold tabular-nums', transColor)}>{fmt(transTemp, 0)}°</p>
                <p className="text-[10px] text-muted-foreground">Trans</p>
              </div>
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50 max-sm:py-1" onClick={() => open('sensor.ambient_air_temp_last_good', 'Ambient Air', '°C')}>
                <p className={cn('text-2xl font-bold tabular-nums', ambientColor)}>{fmt(ambient, 0)}°</p>
                <p className="text-[10px] text-muted-foreground">Ambient</p>
              </div>
            </div>

            {/* Grade, rpm, charger input voltage (Orion 12V side) — same weight as
                the temperature row above, just a second line of vitals. */}
            <div className="mt-1 grid grid-cols-3 gap-2 text-center sm:mt-2">
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50 max-sm:py-1" onClick={() => open('sensor.road_grade', 'Road Grade', '%')}>
                <p className="text-2xl font-bold tabular-nums">{fmt(gradePct, 1)}%</p>
                <p className="text-[10px] text-muted-foreground">Grade{aggression?.state ? ` · ${aggression.state}` : ''}</p>
              </div>
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50 max-sm:py-1" onClick={() => open('sensor.192_168_10_90_0c_enginerpm', 'RPM', 'rpm')}>
                <p className="text-2xl font-bold tabular-nums">{fmt(rpm, 0)}</p>
                <p className="text-[10px] text-muted-foreground">RPM</p>
              </div>
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50 max-sm:py-1" onClick={() => open('sensor.a32_pro_orion_input_voltage', 'Charger Input', 'V')}>
                <p className={cn('text-2xl font-bold tabular-nums', chargerVColor)}>{fmt(chargerV, 2)}</p>
                <p className="text-[10px] text-muted-foreground">Chrg V</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** DTC banner with clickable codes (each opens a modal with an online-fetched
 *  description). Active codes (CEL on) pin to the TOP of the page; codes that
 *  are merely stored (CEL off) render at the BOTTOM instead. The `placement`
 *  prop lets the page mount one of each and the banner self-selects. */
function DTCBanner({ placement }: { placement: 'top' | 'bottom' }) {
  const dtcState = useEntity('sensor.transit_active_dtcs');
  const cel = useEntity('binary_sensor.check_engine_light');
  const celActive = cel?.state === 'on';
  const { open } = useDTCDialog();

  const codes: string[] = Array.isArray(dtcState?.attributes?.active_codes)
    ? (dtcState!.attributes!.active_codes as string[])
    : [];
  const descriptions: string[] = Array.isArray(dtcState?.attributes?.descriptions)
    ? (dtcState!.attributes!.descriptions as string[])
    : [];

  if (codes.length === 0) return null;
  // Active → top only; stored-only → bottom only.
  if (placement === 'top' && !celActive) return null;
  if (placement === 'bottom' && celActive) return null;

  // Map code -> local description (from jinja macro). Format is "P0420: blah blah".
  const localMap: Record<string, string> = {};
  for (const desc of descriptions) {
    const m = desc.match(/^([A-Z0-9]+)\s*:\s*(.*)$/s);
    if (m) localMap[m[1]] = m[2].trim();
  }

  // Use yellow/warning theme if codes exist but physical CEL is OFF
  const bgClass = celActive ? "bg-red-50 dark:bg-red-950/30 border-red-500/50" : "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500/50";
  const textClass = celActive ? "text-red-700 dark:text-red-300" : "text-yellow-700 dark:text-yellow-300";
  const badgeVariant = celActive ? "destructive" : "warning";

  return (
    <div className={cn("rounded-lg border p-3 flex items-center gap-3 flex-wrap", bgClass)}>
      <div className={cn("flex items-center gap-2 font-semibold text-sm", textClass)}>
        <EngineIcon className="h-4 w-4" />
        {codes.length} Stored {codes.length === 1 ? 'Code' : 'Codes'} {celActive ? '(CEL Active)' : '(CEL Off)'}:
      </div>
      <div className="flex flex-wrap gap-2 flex-1">
        {codes.map((code) => (
          <Badge
            key={code}
            variant={badgeVariant}
            className={cn(
              "cursor-pointer hover:opacity-80 transition-opacity font-mono text-xs py-1 px-2.5",
              !celActive && "bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100 hover:bg-yellow-300"
            )}
            onClick={() => open({ code, localDescription: localMap[code] })}
          >
            {code}
          </Badge>
        ))}
      </div>
      <span className={cn("text-[10px] italic", textClass, "opacity-70")}>Tap a code for details</span>
    </div>
  );
}

// Simple engine outline icon for the banner
function EngineIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2v4M8 2v4M16 2v4M4 10a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2zM4 14h16" />
      <path d="M6 18v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export default function Van() {
  return (
    // On a phone the first three cards are the driving screen and fit it
    // without scrolling: the van, the fuel economy, the living space (checked
    // on an iPhone 16 Pro Max in the HA app, 503 x 977 CSS px under the tab
    // bar at its 87.5 % zoom, with the engine running and a two-line climate
    // status). The title is dropped there to make room. The rest is for when
    // you are parked.
    <PageContainer title="Van & Vehicle" compactOnPhone>
      <DTCBanner placement="top" />
      <StarlinkBanner />
      <VanBadges />
      <MainHeroCard />
      <CurrentTripCard />
      <LivingSpaceCard />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-4">
          <DiagnosticsCard />
          <EngineCard />
          <FuelCard />
          <FuelTripHistory />
        </div>
        <div className="space-y-4">
          <TirePressureCard />
          <RoadGradeCard />
        </div>
      </div>
      <DTCBanner placement="bottom" />
    </PageContainer>
  );
}
