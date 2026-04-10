import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useToggle, useService } from '@/hooks/useService';
import { cn, fmt } from '@/lib/utils';
import { SparklineStat } from '@/components/ClickableValue';
import { Flame, Droplets, Wind } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

export function HeatingControls() {
  const heater = useEntity('switch.a32_pro_switch24_hydronic_heater');
  const hotWater = useEntity('input_boolean.hot_water_mode');
  const blowerFan = useEntity('light.a32_pro_a32_pro_dac_0');
  const heaterStatus = useEntity('sensor.a32_pro_hydronic_heater_status');
  const lockout = useEntity('input_boolean.heater_low_fuel_lockout');
  const { value: coolantTemp } = useEntityNumeric(
    'sensor.a32_pro_s5140_channel_34_temperature_blower_coolant',
  );
  const { value: blowerAirTemp } = useEntityNumeric(
    'sensor.a32_pro_s5140_channel_35_temperature_blower_air',
  );
  const { value: pidOutput } = useEntityNumeric(
    'sensor.a32_pro_coolant_blower_heating_pid_climate_result',
  );

  const toggleHeater = useToggle('switch.a32_pro_switch24_hydronic_heater');
  const toggleHotWater = useToggle('input_boolean.hot_water_mode');
  const callService = useService();

  const heaterOn = heater?.state === 'on';
  const hotWaterOn = hotWater?.state === 'on';
  const isLockout = lockout?.state === 'on';
  const blowerBrightness = blowerFan?.attributes?.brightness ?? 0;
  const blowerPercent = Math.round((blowerBrightness / 255) * 100);
  const statusText = heaterStatus?.state ?? '';

  const [localBlower, setLocalBlower] = useState<number | null>(null);
  const blowerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commitBlower = useCallback(
    (v: number) => {
      setLocalBlower(v);
      if (blowerTimer.current) clearTimeout(blowerTimer.current);
      blowerTimer.current = setTimeout(() => {
        callService('light', 'turn_on', { brightness_pct: v }, {
          entity_id: 'light.a32_pro_a32_pro_dac_0',
        });
      }, 300);
    },
    [callService],
  );
  const displayBlower = localBlower ?? blowerPercent;

  // Clear local override when backend catches up
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLocalBlower(null); }, [blowerPercent]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className={cn('h-4 w-4', heaterOn ? 'text-orange-500' : 'text-muted-foreground')} />
          Heating System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLockout && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-500 font-medium">
            ⚠ Low fuel lockout active
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm">Hydronic Heater</span>
          <Switch checked={heaterOn} onCheckedChange={toggleHeater} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5 text-blue-500" />
            Hot Water Mode
          </span>
          <Switch checked={hotWaterOn} onCheckedChange={toggleHotWater} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5" />
              Blower Fan
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">{displayBlower}%</span>
          </div>
          <Slider
            min={0}
            max={100}
            value={displayBlower}
            onValueChange={commitBlower}
          />
        </div>

        <div className="border-t pt-3 space-y-1">
          <SparklineStat entityId="sensor.a32_pro_s5140_channel_34_temperature_blower_coolant" label="Coolant Temp" value={fmt(coolantTemp, 1)} unit="°C" color="#ef4444" />
          <SparklineStat entityId="sensor.a32_pro_s5140_channel_35_temperature_blower_air" label="Blower Air" value={fmt(blowerAirTemp, 1)} unit="°C" color="#f97316" />
          <SparklineStat entityId="sensor.a32_pro_coolant_blower_heating_pid_climate_result" label="PID Output" value={fmt(pidOutput != null ? pidOutput * 100 : null, 0)} unit="%" color="#6366f1" />
          {statusText && statusText !== 'Idle.' && statusText !== '0' && (
            <p className="text-xs text-orange-500 mt-1">{statusText}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
