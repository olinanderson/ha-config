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
  const { value: speed } = useEntityNumeric('sensor.wican_speed');
  const { value: rpm } = useEntityNumeric('sensor.wican_rpm');
  const gear = useEntity('sensor.wican_gear_display');
  const { value: throttle } = useEntityNumeric('sensor.wican_throttle_position');
  const { value: load } = useEntityNumeric('sensor.wican_engine_load');
  const { value: coolant } = useEntityNumeric('sensor.wican_coolant_temperature');
  const { value: ecuV } = useEntityNumeric('sensor.wican_control_module_voltage');
  const moving = useEntity('binary_sensor.vehicle_is_moving');
  const engine = useEntity('binary_sensor.engine_is_running');

  const { data: speedHistory } = useHistory('sensor.wican_speed', 6);
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
          <div className="cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors" onClick={() => open('sensor.wican_speed', 'Speed', 'km/h')}>
            <p className="text-3xl font-bold tabular-nums">{fmt(speed, 0)}</p>
            <p className="text-[10px] text-muted-foreground">km/h</p>
          </div>
          <div className="cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors" onClick={() => open('sensor.wican_rpm', 'RPM', 'rpm')}>
            <p className="text-3xl font-bold tabular-nums">{fmt(rpm, 0)}</p>
            <p className="text-[10px] text-muted-foreground">RPM</p>
          </div>
          <div>
            <p className="text-3xl font-bold tabular-nums">{gearText}</p>
            <p className="text-[10px] text-muted-foreground">Gear</p>
          </div>
        </div>
        <Sparkline data={speedHistory} color="#3b82f6" width={300} height={32} className="w-full" onClick={() => open('sensor.wican_speed', 'Speed', 'km/h')} />
        <div className="grid gap-1">
          <SparklineStat entityId="sensor.wican_throttle_position" label="Throttle" value={fmt(throttle, 0)} unit="%" color="#f59e0b" />
          <SparklineStat entityId="sensor.wican_engine_load" label="Engine Load" value={fmt(load, 0)} unit="%" color="#ef4444" />
          <SparklineStat entityId="sensor.wican_coolant_temperature" label="Coolant Temp" value={fmt(coolant, 0)} unit="°C" color="#ef4444" />
          <SparklineStat entityId="sensor.wican_control_module_voltage" label="ECU Voltage" value={fmt(ecuV, 1)} unit="V" color="#6366f1" />
        </div>
      </CardContent>
    </Card>
  );
}

function FuelCard() {
  const { value: stable } = useEntityNumeric('sensor.stable_fuel_level');
  const { value: raw } = useEntityNumeric('sensor.wican_fuel');
  const { value: mean5 } = useEntityNumeric('sensor.wican_fuel_5_min_mean');
  const { value: economy } = useEntityNumeric('sensor.fuel_consumption_l100km');
  const { value: rate } = useEntityNumeric('sensor.fuel_consumption_lh');
  const { value: fuelRate } = useEntityNumeric('sensor.wican_fuel_rate');

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
        <SparklineStat entityId="sensor.wican_fuel" label="Raw OBD" value={fmt(raw, 0)} unit="%" color="#64748b" />
        {(economy ?? 0) > 0 && <SparklineStat entityId="sensor.fuel_consumption_l100km" label="Economy" value={fmt(economy, 1)} unit="L/100km" color="#8b5cf6" />}
        {(rate ?? 0) > 0 && <SparklineStat entityId="sensor.fuel_consumption_lh" label="Rate" value={fmt(rate, 1)} unit="L/h" color="#f59e0b" />}
        {(fuelRate ?? 0) > 0 && <SparklineStat entityId="sensor.wican_fuel_rate" label="Fuel Rate" value={fmt(fuelRate, 2)} unit="g/s" color="#06b6d4" />}
      </CardContent>
    </Card>
  );
}

function TirePressureCard() {
  const { value: fl } = useEntityNumeric('sensor.wican_tire_pressure_fl');
  const { value: fr } = useEntityNumeric('sensor.wican_tire_pressure_fr');
  const { value: rl } = useEntityNumeric('sensor.wican_tire_pressure_rl');
  const { value: rr } = useEntityNumeric('sensor.wican_tire_pressure_rr');
  const lowTire = useEntity('binary_sensor.low_tire_pressure');
  const isLow = lowTire?.state === 'on';

  const tireColor = (psi: number | null) =>
    (psi ?? 0) < 35 ? 'text-red-500' : (psi ?? 0) < 40 ? 'text-orange-500' : 'text-green-500';

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
  const { value: gradePct } = useEntityNumeric('sensor.road_grade_percent');
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
        <SparklineStat entityId="sensor.road_grade_percent" label="Grade" value={fmt(gradePct, 1)} unit="%" color="#22c55e" />
        <SparklineStat entityId="sensor.road_grade_deg" label="Degrees" value={fmt(gradeDeg, 1)} unit="°" color="#6366f1" />
        <SparklineStat entityId="sensor.hill_aggression" label="Terrain" value={aggression?.state ?? '—'} unit="" color="#64748b" />
      </CardContent>
    </Card>
  );
}

function DiagnosticsCard() {
  const { value: oilLife } = useEntityNumeric('sensor.wican_oil_life');
  const { value: transTemp } = useEntityNumeric('sensor.wican_transmission_temperature');
  const { value: wastegate } = useEntityNumeric('sensor.wican_wastegate');
  const { value: altDuty } = useEntityNumeric('sensor.wican_alternator_duty');
  const { value: intakeAir } = useEntityNumeric('sensor.wican_intake_air_temperature');
  const { value: ambientAir } = useEntityNumeric('sensor.wican_ambient_air_temperature');
  const { value: fuelPressure } = useEntityNumeric('sensor.wican_fuel_pressure');
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
        <SparklineStat entityId="sensor.wican_oil_life" label="Oil Life" value={fmt(oilLife, 0)} unit="%" color="#22c55e" />
        <SparklineStat entityId="sensor.wican_transmission_temperature" label="Trans Temp" value={fmt(transTemp, 0)} unit="°C" color="#ef4444" />
        <SparklineStat entityId="sensor.wican_wastegate" label="Wastegate" value={fmt(wastegate, 0)} unit="%" color="#f59e0b" />
        <SparklineStat entityId="sensor.wican_alternator_duty" label="Alt Duty" value={fmt(altDuty, 0)} unit="%" color="#6366f1" />
        <SparklineStat entityId="sensor.wican_intake_air_temperature" label="Intake Air" value={fmt(intakeAir, 0)} unit="°C" color="#06b6d4" />
        <SparklineStat entityId="sensor.wican_ambient_air_temperature" label="Ambient Air" value={fmt(ambientAir, 0)} unit="°C" color="#3b82f6" />
        <SparklineStat entityId="sensor.wican_fuel_pressure" label="Fuel Pressure" value={fmt(fuelPressure, 0)} unit="kPa" color="#8b5cf6" />
      </CardContent>
    </Card>
  );
}

export default function Van() {
  return (
    <PageContainer title="Van & Vehicle">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
