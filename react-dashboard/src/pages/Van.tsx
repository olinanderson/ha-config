import { PageContainer } from '@/components/layout/PageContainer';
import { SparklineStat, ClickableValue } from '@/components/ClickableValue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useHistory } from '@/hooks/useHistory';
import { Sparkline } from '@/components/Chart';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { fmt, cn } from '@/lib/utils';
import {
  Gauge,
  Fuel,
  Thermometer,
  Car,
  CircleDot,
  AlertTriangle,
  Mountain,
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

  const { data: speedHistory } = useHistory('sensor.192_168_10_90_0d_vehiclespeed', 6);
  const { open } = useHistoryDialog();

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
          <SparklineStat entityId="sensor.192_168_10_90_42_controlmodulevolt" label="ECU Voltage" value={fmt(ecuV, 1)} unit="V" color="#6366f1" />
        </div>
      </CardContent>
    </Card>
  );
}

function FuelCard() {
  const { value: stable } = useEntityNumeric('sensor.stable_fuel_level');
  const { value: raw } = useEntityNumeric('sensor.192_168_10_90_2f_fueltanklevel');
  const { value: mean5 } = useEntityNumeric('sensor.wican_fuel_5_min_mean');
  const { value: economy } = useEntityNumeric('sensor.fuel_consumption_l_100km');
  const { value: rate } = useEntityNumeric('sensor.fuel_consumption_l_h');

  const { data: fuelHistory } = useHistory('sensor.stable_fuel_level', 24);
  const { open: openFuel } = useHistoryDialog();

  const tankLiters = stable != null ? (stable / 100) * 94.6 : null;
  const stableNum = stable ?? 0;
  const fuelColor =
    stableNum < 15 ? 'text-red-500' : stableNum < 30 ? 'text-orange-500' : 'text-green-500';

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
        {(economy ?? 0) > 0 && <SparklineStat entityId="sensor.fuel_consumption_l_100km" label="Economy" value={fmt(economy, 1)} unit="L/100km" color="#8b5cf6" />}
        {(rate ?? 0) > 0 && <SparklineStat entityId="sensor.fuel_consumption_l_h" label="Rate" value={fmt(rate, 1)} unit="L/h" color="#f59e0b" />}
      </CardContent>
    </Card>
  );
}

function TirePressureCard() {
  const { value: flRaw, entity: flEntity } = useEntityNumeric('sensor.192_168_10_90_tyre_p_fl');
  const { value: frRaw, entity: frEntity } = useEntityNumeric('sensor.192_168_10_90_tyre_p_fr');
  const { value: rlRaw, entity: rlEntity } = useEntityNumeric('sensor.192_168_10_90_tyre_p_rl');
  const { value: rrRaw, entity: rrEntity } = useEntityNumeric('sensor.192_168_10_90_tyre_p_rr');
  const lowTire = useEntity('binary_sensor.low_tire_pressure');
  const isLow = lowTire?.state === 'on';

  // HA auto-converts psi→kPa in entity registry; convert back if needed
  const toPsi = (val: number | null, entity: typeof flEntity) => {
    if (val == null) return null;
    const unit = entity?.attributes?.unit_of_measurement;
    if (unit === 'kPa') return val * 0.0725190;
    return val;
  };
  const fl = toPsi(flRaw, flEntity);
  const fr = toPsi(frRaw, frEntity);
  const rl = toPsi(rlRaw, rlEntity);
  const rr = toPsi(rrRaw, rrEntity);

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
  const { value: transTemp } = useEntityNumeric('sensor.192_168_10_90_tran_f_temp');
  const { value: wastegate } = useEntityNumeric('sensor.192_168_10_90_wastegate');
  const { value: intakeAir } = useEntityNumeric('sensor.192_168_10_90_intake_air_tmp');
  const { value: ambientAir } = useEntityNumeric('sensor.192_168_10_90_46_ambientairtemp');
  const { value: fuelPressure } = useEntityNumeric('sensor.192_168_10_90_fuel_pressure');
  const cel = useEntity('binary_sensor.check_engine_light');
  const { value: dtcCount } = useEntityNumeric('sensor.dtc_count');
  const isCel = cel?.state === 'on';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4" />
          Diagnostics
          {isCel && (
            <Badge variant="destructive" className="ml-auto text-[10px] flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              CEL ({dtcCount} DTC)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <SparklineStat entityId="sensor.192_168_10_90_oil_life" label="Oil Life" value={fmt(oilLife, 0)} unit="%" color="#22c55e" />
        <SparklineStat entityId="sensor.192_168_10_90_wastegate" label="Wastegate" value={fmt(wastegate, 0)} unit="%" color="#f59e0b" />
        <SparklineStat entityId="sensor.192_168_10_90_intake_air_tmp" label="Intake Air" value={fmt(intakeAir, 0)} unit="°C" color="#06b6d4" />
        <SparklineStat entityId="sensor.192_168_10_90_46_ambientairtemp" label="Ambient Air" value={fmt(ambientAir, 0)} unit="°C" color="#3b82f6" />
        <SparklineStat entityId="sensor.192_168_10_90_fuel_pressure" label="Fuel Pressure" value={fmt(fuelPressure, 0)} unit="kPa" color="#8b5cf6" />
      </CardContent>
    </Card>
  );
}

/** Big at-a-glance driving stats — always visible at the top on mobile */
function DrivingHeroCard() {
  const { value: rpm } = useEntityNumeric('sensor.192_168_10_90_0c_enginerpm');
  const { value: ecuV } = useEntityNumeric('sensor.192_168_10_90_42_controlmodulevolt');
  const { value: coolant } = useEntityNumeric('sensor.192_168_10_90_05_enginecoolanttemp');
  const { value: transTemp } = useEntityNumeric('sensor.192_168_10_90_tran_f_temp');
  const { value: gradePct } = useEntityNumeric('sensor.road_grade');
  const aggression = useEntity('sensor.hill_aggression');
  const { open } = useHistoryDialog();

  const coolantColor = (coolant ?? 0) > 105 ? 'text-red-500' : (coolant ?? 0) > 95 ? 'text-orange-400' : 'text-foreground';
  const transColor = (transTemp ?? 0) > 110 ? 'text-red-500' : (transTemp ?? 0) > 95 ? 'text-orange-400' : 'text-foreground';

  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors" onClick={() => open('sensor.192_168_10_90_0c_enginerpm', 'RPM', 'rpm')}>
            <p className="text-3xl font-bold tabular-nums">{fmt(rpm, 0)}</p>
            <p className="text-[10px] text-muted-foreground">RPM</p>
          </div>
          <div className="cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors" onClick={() => open('sensor.192_168_10_90_42_controlmodulevolt', 'Battery Voltage', 'V')}>
            <p className="text-3xl font-bold tabular-nums">{fmt(ecuV, 2)}</p>
            <p className="text-[10px] text-muted-foreground">Battery V</p>
          </div>
          <div className={cn('cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors')} onClick={() => open('sensor.192_168_10_90_05_enginecoolanttemp', 'Coolant Temp', '°C')}>
            <p className={cn('text-3xl font-bold tabular-nums', coolantColor)}>{fmt(coolant, 0)}°</p>
            <p className="text-[10px] text-muted-foreground">Coolant</p>
          </div>
          <div className={cn('cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors')} onClick={() => open('sensor.192_168_10_90_tran_f_temp', 'Trans Temp', '°C')}>
            <p className={cn('text-3xl font-bold tabular-nums', transColor)}>{fmt(transTemp, 0)}°</p>
            <p className="text-[10px] text-muted-foreground">Trans</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors" onClick={() => open('sensor.road_grade', 'Road Grade', '%')}>
          <Mountain className="h-4 w-4 text-muted-foreground" />
          <span className="text-2xl font-bold tabular-nums">{fmt(gradePct, 1)}%</span>
          <span className="text-xs text-muted-foreground">{aggression?.state ?? '—'}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Van() {
  return (
    <PageContainer title="Van & Vehicle">
      <DrivingHeroCard />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-4">
        <div className="space-y-4">
          <EngineCard />
          <FuelCard />
        </div>
        <div className="space-y-4">
          <TirePressureCard />
          <RoadGradeCard />
        </div>
        <div className="space-y-4">
          <DiagnosticsCard />
        </div>
      </div>
    </PageContainer>
  );
}
