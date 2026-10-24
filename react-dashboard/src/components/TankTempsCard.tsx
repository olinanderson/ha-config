import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { SparklineStat } from '@/components/ClickableValue';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { useBangBangSetpoints } from '@/hooks/useBangBangSetpoints';
import { cn, fmt } from '@/lib/utils';
import { Thermometer } from 'lucide-react';

// The a32's tank thermostats (esphome/a32-pro-esp32-s3.yaml): a bang_bang per
// tank behind its Heater Enable switch, with the pads on below target_temp_low
// and off above target_temp_high.
const TANKS = [
  {
    name: 'Fresh',
    sensor: 'sensor.a32_pro_s5140_channel_38_temperature_fresh_water_tank',
    heater: 'switch.a32_pro_fresh_water_tank_heater_enable',
    thermostat: 'climate.a32_pro_fresh_water_tank_thermostat',
  },
  {
    name: 'Grey',
    sensor: 'sensor.a32_pro_s5140_channel_39_temperature_grey_water_tank',
    heater: 'switch.a32_pro_grey_water_tank_heater_enable',
    thermostat: 'climate.a32_pro_grey_water_tank_thermostat',
  },
  {
    name: 'Shower',
    sensor: 'sensor.a32_pro_s5140_channel_40_temperature_shower_water_tank',
    heater: 'switch.a32_pro_shower_water_tank_heater_enable',
    thermostat: 'climate.a32_pro_shower_water_tank_thermostat',
  },
] as const;

type Tank = (typeof TANKS)[number];

function Setpoint({
  label,
  name,
  value,
  onAdjust,
}: {
  label: string;
  name: string;
  value: number;
  onAdjust: (delta: number) => void;
}) {
  const btn =
    'flex h-6 w-6 items-center justify-center rounded border border-border text-xs text-muted-foreground transition-colors hover:bg-accent active:bg-accent/80';
  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground">{label}</span>
      <button aria-label={`Lower ${name}`} className={btn} onClick={() => onAdjust(-1)}>−</button>
      <span className="w-7 text-center text-xs font-semibold tabular-nums">{value}°</span>
      <button aria-label={`Raise ${name}`} className={btn} onClick={() => onAdjust(1)}>+</button>
    </div>
  );
}

function TankRow({ tank }: { tank: Tank }) {
  const { value: temp } = useEntityNumeric(tank.sensor);
  const heater = useEntity(tank.heater);
  const callService = useService();
  const { thermostat, targetLow, targetHigh, displayLow, displayHigh, adjustLow, adjustHigh } =
    useBangBangSetpoints(tank.thermostat);

  const on = heater?.state === 'on';
  // hvac_action is what the pads are doing; the state ('heat') is only the mode
  const heating = thermostat?.attributes?.hvac_action === 'heating';
  const setHeater = (want: boolean) =>
    callService('switch', want ? 'turn_on' : 'turn_off', undefined, { entity_id: tank.heater });

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <SparklineStat
          entityId={tank.sensor}
          label={tank.name}
          value={fmt(temp, 1)}
          unit="°C"
          color={temp != null && temp < 3 ? '#ef4444' : '#3b82f6'}
          className="flex-1"
        />
        <div className="ml-2 flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              'text-[10px]',
              on && heating ? 'font-medium text-orange-400' : 'text-muted-foreground',
            )}
          >
            {on ? (heating ? 'Heating' : 'Idle') : 'Heat'}
          </span>
          <Switch checked={on} onCheckedChange={setHeater} aria-label={`${tank.name} tank heater`} />
        </div>
      </div>
      {on && targetLow != null && targetHigh != null && (
        <div className="ml-1 flex items-center gap-3 text-[11px]">
          <Setpoint label="On ≤" name={`${tank.name} heat-on point`} value={displayLow} onAdjust={adjustLow} />
          <Setpoint label="Off ≥" name={`${tank.name} heat-off point`} value={displayHigh} onAdjust={adjustHigh} />
        </div>
      )}
    </div>
  );
}

/**
 * The Water page's Tank Temperatures card: each tank's temperature, its
 * heater's switch and, while the heater is on, the thermostat's set points.
 *
 * The heaters are not part of the Winterized lock (docs/winterizing.md): the
 * switches stay live all winter, the user's call of 2026-10-23.
 */
export function TankTempsCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Thermometer className="h-4 w-4" />
          Tank Temperatures
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {TANKS.map((t) => (
          <TankRow key={t.name} tank={t} />
        ))}
      </CardContent>
    </Card>
  );
}
