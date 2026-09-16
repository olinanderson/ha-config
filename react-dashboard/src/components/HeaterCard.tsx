import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn, fmt } from '@/lib/utils';
import { SparklineStat } from '@/components/ClickableValue';
import { Flame, Droplets, Wind, Power, PowerOff, Wrench } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

// The thermostat is a PID climate on the a32_pro. In `heat` it keeps the burner
// lit and, with the blower on Auto, drives the blower toward the target.
const CLIMATE_ID = 'climate.a32_pro_van_hydronic_heating_pid';
// on = Auto (the PID sets the blower speed), off = Manual. Manual holds while
// the thermostat keeps heating, until the thermostat is next switched on. With
// the thermostat off the blower is always manual and this reads off.
const BLOWER_MODE_ID = 'switch.a32_pro_coolant_blower_mode_auto_manual';
const BLOWER_ID = 'light.a32_pro_a32_pro_dac_0';
// The burner relay. The rocker and Switch24 set a manual request that keeps it
// lit even with the thermostat and Hot Water Mode off.
const HEATER_ID = 'switch.a32_pro_switch24_hydronic_heater';
// Switch32 is the heater's STANDBY power supply — normally always on. The
// a32_pro refuses to close the heater relay while it is off (it logs "Cannot
// turn on hydronic heater: Power Supply is OFF!" and does nothing), so with the
// supply down, starting the heater is a silent no-op.
// script.shop_mode_apply is the only thing that cuts it; disarming restores it,
// and this card is the fallback for when that didn't happen (a32_pro offline at
// disarm, or a manual cut).
const SUPPLY_ID = 'switch.a32_pro_switch32_hydronic_heater_power_supply';
const HOT_WATER_ID = 'input_boolean.hot_water_mode';

export function HeaterCard() {
  const thermostat = useEntity(CLIMATE_ID);
  const blowerMode = useEntity(BLOWER_MODE_ID);
  const heater = useEntity(HEATER_ID);
  const supply = useEntity(SUPPLY_ID);
  const shopMode = useEntity('input_boolean.shop_mode');
  const hotWater = useEntity(HOT_WATER_ID);
  const blowerFan = useEntity(BLOWER_ID);
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

  const callService = useService();

  const thermostatOn = thermostat?.state === 'heat';
  // Anything but a definite "off" counts as Auto, so an unknown switch state
  // never claims the user took the blower over.
  const blowerAuto = thermostatOn && blowerMode?.state !== 'off';
  const heaterOn = heater?.state === 'on';
  const hotWaterOn = hotWater?.state === 'on';
  const isLockout = lockout?.state === 'on';
  // Only a definite "off" blocks — unknown/unavailable means the a32_pro is
  // offline, which is not this card's problem to explain.
  const supplyOff = supply?.state === 'off';
  const shopModeOn = shopMode?.state === 'on';
  // In all three cases starting the heater is a no-op: the a32_pro skips it, or
  // the Shop Mode guard re-shuts it. Block turning it on and let the banners
  // say why; turning it off always works.
  const cannotStart = supplyOff || shopModeOn || isLockout;
  const statusText = heaterStatus?.state ?? '';

  const attrs = thermostat?.attributes ?? {};
  const currentTemp: number | null = attrs.current_temperature ?? null;
  const targetTemp: number = attrs.temperature ?? 0;
  const minTemp: number = attrs.min_temp ?? 5;
  const maxTemp: number = attrs.max_temp ?? 35;
  const stepTemp: number = attrs.target_temp_step ?? 0.5;

  // Local slider state for smooth dragging (committed after a short pause)
  const [localTarget, setLocalTarget] = useState<number | null>(null);
  const targetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commitTarget = useCallback(
    (temp: number) => {
      if (targetTimer.current) clearTimeout(targetTimer.current);
      targetTimer.current = setTimeout(() => {
        callService('climate', 'set_temperature', { temperature: temp }, { entity_id: CLIMATE_ID });
      }, 300);
    },
    [callService],
  );
  const displayTarget = localTarget ?? targetTemp;

  // Clear local override when backend catches up
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLocalTarget(null); }, [targetTemp]);

  const handleTarget = (val: number) => {
    // Snap to step
    const snapped = Math.round(val / stepTemp) * stepTemp;
    setLocalTarget(snapped);
    commitTarget(snapped);
  };

  const toggleThermostat = () => {
    callService('climate', 'set_hvac_mode', { hvac_mode: thermostatOn ? 'off' : 'heat' }, {
      entity_id: CLIMATE_ID,
    });
  };

  // One switch for "the heater runs without the thermostat" (Hot Water Mode and
  // Switch24 do the same job). It drives Hot Water Mode, and it also reads on
  // when the burner was started another way (rocker, Switch24), because Hot
  // Water Mode off alone would leave that burner lit.
  const burnerOnOwn = heaterOn && !thermostatOn;
  const hotWaterChecked = hotWaterOn || burnerOnOwn;
  const setHotWater = (on: boolean) => {
    callService('input_boolean', on ? 'turn_on' : 'turn_off', undefined, { entity_id: HOT_WATER_ID });
    // Switch24 off clears the manual request holding a hand-started burner.
    if (!on && burnerOnOwn) callService('switch', 'turn_off', undefined, { entity_id: HEATER_ID });
  };

  const setBlowerAuto = (auto: boolean) => {
    callService('switch', auto ? 'turn_on' : 'turn_off', undefined, { entity_id: BLOWER_MODE_ID });
  };

  const turnOnSupply = useCallback(
    () => callService('switch', 'turn_on', undefined, { entity_id: SUPPLY_ID }),
    [callService],
  );

  const blowerBrightness = blowerFan?.attributes?.brightness ?? 0;
  const blowerPercent = Math.round((blowerBrightness / 255) * 100);
  const [localBlower, setLocalBlower] = useState<number | null>(null);
  const blowerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commitBlower = useCallback(
    (v: number) => {
      setLocalBlower(v);
      if (blowerTimer.current) clearTimeout(blowerTimer.current);
      blowerTimer.current = setTimeout(() => {
        callService('light', 'turn_on', { brightness_pct: v }, { entity_id: BLOWER_ID });
      }, 300);
    },
    [callService],
  );
  const displayBlower = localBlower ?? blowerPercent;

  // Clear local override when backend catches up
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLocalBlower(null); }, [blowerPercent]);

  // Color gradient based on target temp
  const tempRatio = Math.max(0, Math.min(1, (displayTarget - minTemp) / (maxTemp - minTemp)));
  const sliderColor = `hsl(${30 - tempRatio * 30}, ${70 + tempRatio * 30}%, ${55 - tempRatio * 10}%)`;

  const badge = thermostatOn ? 'Heating' : heaterOn ? (hotWaterOn ? 'Hot water' : 'Burner on') : 'Off';
  const blowerHint = !thermostatOn
    ? 'Thermostat is off, so the fan runs at whatever you set.'
    : blowerAuto
      ? 'The thermostat sets the fan speed.'
      : 'The heater keeps running and you set the fan speed. Auto hands it back to the thermostat.';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame
            className={cn('h-4 w-4', thermostatOn || heaterOn ? 'text-orange-500' : 'text-muted-foreground')}
          />
          Heater
          <span className={cn(
            'ml-auto text-xs font-medium px-2 py-0.5 rounded-full',
            badge !== 'Off'
              ? 'bg-orange-500/10 text-orange-500'
              : 'bg-muted text-muted-foreground',
          )}>
            {badge}
          </span>
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

        {/* Thermostat: current + target, target slider, on/off */}
        {thermostat && (
          <>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Current</p>
                <p className="text-3xl font-bold tabular-nums leading-none">
                  {currentTemp != null ? `${currentTemp.toFixed(1)}°` : '—'}
                </p>
              </div>
              {blowerAuto && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-0.5">Target</p>
                  <p className="text-2xl font-bold tabular-nums text-orange-500 leading-none">
                    {displayTarget.toFixed(1)}°
                  </p>
                </div>
              )}
            </div>

            {/* The target only steers the blower, so it is hidden while the fan is manual */}
            {blowerAuto && (
              <div className="space-y-1">
                <Slider
                  aria-label="Target temperature"
                  min={minTemp}
                  max={maxTemp}
                  step={stepTemp}
                  value={displayTarget}
                  onValueChange={handleTarget}
                  style={{ accentColor: sliderColor } as React.CSSProperties}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
                  <span>{minTemp}°</span>
                  <span>{maxTemp}°</span>
                </div>
              </div>
            )}

            <Button
              variant={thermostatOn ? 'default' : 'outline'}
              className={cn('w-full', thermostatOn && 'bg-orange-500 hover:bg-orange-600')}
              onClick={toggleThermostat}
              // Shop Mode's guard switches the thermostat straight back off.
              disabled={shopModeOn && !thermostatOn}
            >
              <Power className="h-4 w-4 mr-2" />
              {thermostatOn ? 'Turn Off' : 'Turn On'}
            </Button>
          </>
        )}

        {/* Blower: Auto (thermostat) or Manual */}
        <div className="space-y-1.5 border-t pt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5" />
              Blower Fan
            </span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <button
                  aria-pressed={blowerAuto}
                  onClick={() => setBlowerAuto(true)}
                  disabled={!thermostatOn}
                  title={thermostatOn ? undefined : 'Turn the thermostat on for automatic fan speed'}
                  className={cn(
                    'px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    blowerAuto
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground',
                  )}
                >
                  Auto
                </button>
                <button
                  aria-pressed={!blowerAuto}
                  // With the thermostat off the fan is already manual.
                  onClick={() => { if (blowerAuto) setBlowerAuto(false); }}
                  className={cn(
                    'px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors',
                    !blowerAuto
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground',
                  )}
                >
                  Manual
                </button>
              </div>
              <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">{displayBlower}%</span>
            </div>
          </div>
          <Slider
            aria-label="Blower fan speed"
            min={0}
            max={100}
            value={displayBlower}
            onValueChange={commitBlower}
            // On Auto the PID rewrites the speed within seconds, so a drag would just bounce back.
            disabled={blowerAuto}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-[11px] text-muted-foreground">{blowerHint}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <span className={cn(
              'text-sm flex items-center gap-1.5',
              cannotStart && !hotWaterChecked && 'text-muted-foreground',
            )}>
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
              Hot Water / Hydronic Heater
            </span>
            <p className="text-[11px] text-muted-foreground">Runs the heater without the thermostat.</p>
          </div>
          <Switch
            aria-label="Hot Water / Hydronic Heater"
            checked={hotWaterChecked}
            onCheckedChange={setHotWater}
            disabled={cannotStart && !hotWaterChecked}
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
