import { PageContainer } from '@/components/layout/PageContainer';
import { FuelTripHistory } from '@/components/FuelTripHistory';
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
  const { value: ecuV } = useEntityNumeric('sensor.192_168_10_90_42_controlmodulevolt');
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
          <SparklineStat entityId="sensor.192_168_10_90_42_controlmodulevolt" label="ECU Voltage" value={fmt(ecuV, 2)} unit="V" color="#6366f1" />
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

/** Main glance card — battery state plus the vitals watched while driving. */
function MainHeroCard() {
  // Power / battery
  const { value: soc } = useEntityNumeric('sensor.olins_van_bms_battery');
  const { value: battCurrent } = useEntityNumeric('sensor.olins_van_bms_current');
  const { value: battTemp } = useEntityNumeric('sensor.olins_van_bms_temperature');
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
  const { value: ecuV } = useEntityNumeric('sensor.192_168_10_90_42_controlmodulevolt');

  const { open } = useHistoryDialog();

  const socColor = (soc ?? 0) < 20 ? 'text-red-500' : (soc ?? 0) < 40 ? 'text-orange-400' : 'text-green-400';
  const battCurrentVal = battCurrent ?? 0;
  const battColor = battCurrentVal > 0 ? 'text-green-400' : battCurrentVal < -5 ? 'text-orange-400' : 'text-foreground';
  const solarActive = (solarA ?? 0) > 0.5;
  const coolantColor = (coolant ?? 0) > 105 ? 'text-red-500' : (coolant ?? 0) > 95 ? 'text-orange-400' : 'text-foreground';
  const transColor = (transTemp ?? 0) > 110 ? 'text-red-500' : (transTemp ?? 0) > 95 ? 'text-orange-400' : 'text-foreground';

  const estimate = estimateEntity?.state;
  const estimateDisplay =
    !estimate || estimate === 'unknown' || estimate === 'unavailable'
      ? '—'
      : estimate === 'Idle'
        ? 'Idle'
        : estimate;

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="divide-y divide-border sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {/* ── Power / battery ── */}
          <div className="pb-4 sm:pb-0 sm:pr-4">
            <div className="mb-2 flex items-center justify-between">
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
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50" onClick={() => open('sensor.olins_van_bms_battery', 'Battery', '%')}>
                <p className={cn('text-3xl font-bold tabular-nums', socColor)}>{fmt(soc, 0)}%</p>
                <p className="text-[10px] text-muted-foreground">Battery</p>
              </div>
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50" onClick={() => open('sensor.olins_van_bms_current', 'Battery Current', 'A')}>
                <p className={cn('text-3xl font-bold tabular-nums', battColor)}>{fmt(battCurrent, 1)}</p>
                <p className="text-[10px] text-muted-foreground">Amps</p>
              </div>
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50" onClick={() => open('sensor.olins_van_bms_temperature', 'Battery Temp', '°C')}>
                <p className={cn('text-3xl font-bold tabular-nums', battTempColor(battTemp))}>{fmt(battTemp, 0)}°</p>
                <p className="text-[10px] text-muted-foreground">Batt Temp</p>
              </div>
            </div>

            {/* Long SOC bar */}
            <div className="mt-2 px-1">
              <Progress value={soc ?? 0} className="h-2.5" indicatorClassName={(soc ?? 0) < 20 ? 'bg-red-500' : (soc ?? 0) < 40 ? 'bg-orange-400' : 'bg-green-500'} />
            </div>
            <p className="mt-1.5 text-center text-sm font-medium text-muted-foreground">{estimateDisplay}</p>
          </div>

          {/* ── Driving vitals ── */}
          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              Driving
            </span>

            {/* Most important: coolant, trans, grade */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50" onClick={() => open('sensor.192_168_10_90_05_enginecoolanttemp', 'Coolant Temp', '°C')}>
                <p className={cn('text-2xl font-bold tabular-nums', coolantColor)}>{fmt(coolant, 0)}°</p>
                <p className="text-[10px] text-muted-foreground">Coolant</p>
              </div>
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50" onClick={() => open('sensor.192_168_10_90_tran_f_temp', 'Trans Temp', '°C')}>
                <p className={cn('text-2xl font-bold tabular-nums', transColor)}>{fmt(transTemp, 0)}°</p>
                <p className="text-[10px] text-muted-foreground">Trans</p>
              </div>
              <div className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-muted/50" onClick={() => open('sensor.road_grade', 'Road Grade', '%')}>
                <p className="text-2xl font-bold tabular-nums">{fmt(gradePct, 1)}%</p>
                <p className="text-[10px] text-muted-foreground">Grade{aggression?.state ? ` · ${aggression.state}` : ''}</p>
              </div>
            </div>

            {/* Less important: rpm, ecu voltage */}
            <div className="mt-2 grid grid-cols-2 gap-2 text-center">
              <div className="cursor-pointer rounded-lg p-1 transition-colors hover:bg-muted/50" onClick={() => open('sensor.192_168_10_90_0c_enginerpm', 'RPM', 'rpm')}>
                <p className="text-lg font-semibold tabular-nums text-muted-foreground">{fmt(rpm, 0)}</p>
                <p className="text-[10px] text-muted-foreground">RPM</p>
              </div>
              <div className="cursor-pointer rounded-lg p-1 transition-colors hover:bg-muted/50" onClick={() => open('sensor.192_168_10_90_42_controlmodulevolt', 'ECU Voltage', 'V')}>
                <p className="text-lg font-semibold tabular-nums text-muted-foreground">{fmt(ecuV, 2)}</p>
                <p className="text-[10px] text-muted-foreground">ECU V</p>
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
    <PageContainer title="Van & Vehicle">
      <DTCBanner placement="top" />
      <MainHeroCard />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-4">
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
