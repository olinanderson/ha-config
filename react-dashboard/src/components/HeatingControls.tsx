import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useToggle, useService } from '@/hooks/useService';
import { cn, fmt } from '@/lib/utils';
import { SparklineStat } from '@/components/ClickableValue';
import { Flame, Droplets, Wind, PowerOff, Wrench } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

const HEATER_ID = 'switch.a32_pro_switch24_hydronic_heater';
// Switch32 is the heater's STANDBY power supply — normally always on. The
// a32_pro refuses to close the heater relay while it is off (it logs "Cannot
// turn on hydronic heater: Power Supply is OFF!" and does nothing), so with the
// supply down the heater switch is a silent no-op that just snaps back.
// script.shop_mode_apply is the only thing that cuts it; disarming restores it,
// and this card is the fallback for when that didn't happen (a32_pro offline at
// disarm, or a manual cut).
const SUPPLY_ID = 'switch.a32_pro_switch32_hydronic_heater_power_supply';

export function HeatingControls() {
  const heater = useEntity(HEATER_ID);
  const supply = useEntity(SUPPLY_ID);
  const shopMode = useEntity('input_boolean.shop_mode');
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

  const toggleHeater = useToggle(HEATER_ID);
  const toggleHotWater = useToggle('input_boolean.hot_water_mode');
  const callService = useService();

  const heaterOn = heater?.state === 'on';
  const hotWaterOn = hotWater?.state === 'on';
  const isLockout = lockout?.state === 'on';
  // Only a definite "off" blocks — unknown/unavailable means the a32_pro is
  // offline, which is not this card's problem to explain.
  const supplyOff = supply?.state === 'off';
  const shopModeOn = shopMode?.state === 'on';
  // In both cases the heater switch is a no-op (or gets re-shut within a
  // second by the Shop Mode guard automation). Disable it and say why rather
  // than let it flip back silently.
  const heaterBlocked = supplyOff || shopModeOn;
  const blowerBrightness = blowerFan?.attributes?.brightness ?? 0;
  const blowerPercent = Math.round((blowerBrightness / 255) * 100);
  const statusText = heaterStatus?.state ?? '';

  const turnOnSupply = useCallback(
    () => callService('switch', 'turn_on', undefined, { entity_id: SUPPLY_ID }),
    [callService],
  );

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

        {shopModeOn ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-400">
            <Wrench className="mt-0.5 h-3.5 w-3.5 flex-none" />
            <span>Shop Mode is armed — the heater stays locked off until it is disarmed.</span>
          </div>
        ) : supplyOff ? (
          <div className="space-y-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-400">
            <div className="flex items-start gap-2">
              <PowerOff className="mt-0.5 h-3.5 w-3.5 flex-none" />
              <span>
                Heater power supply is off, so the heater cannot start — Shop Mode leaves it
                this way.
              </span>
            </div>
            <button
              onClick={turnOnSupply}
              className="w-full rounded-md bg-amber-500/25 px-2 py-1 font-medium transition-colors hover:bg-amber-500/40"
            >
              Turn on heater power supply
            </button>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <span className={cn('text-sm', heaterBlocked && 'text-muted-foreground')}>
            Hydronic Heater
          </span>
          <Switch
            aria-label="Hydronic Heater"
            checked={heaterOn}
            onCheckedChange={toggleHeater}
            disabled={heaterBlocked}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5 text-blue-500" />
            Hot Water Mode
          </span>
          <Switch aria-label="Hot Water Mode" checked={hotWaterOn} onCheckedChange={toggleHotWater} />
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
          <SparklineStat entityId="sensor.a32_pro_coolant_blower_heating_pid_climate_result" label="PID Output" value={fmt(pidOutput, 0)} unit="%" color="#6366f1" />
          {statusText && statusText !== 'Idle.' && statusText !== '0' && (
            <p className="text-xs text-orange-500 mt-1">{statusText}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
