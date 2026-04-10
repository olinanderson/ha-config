import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useEntity } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import { Thermometer, Power } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function ThermostatControl() {
  const thermostat = useEntity('climate.a32_pro_van_hydronic_heating_pid');
  const callService = useService();

  // Local slider state for smooth dragging (committed on release)
  const [localTarget, setLocalTarget] = useState<number | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commitTemp = useCallback(
    (temp: number) => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
      commitTimer.current = setTimeout(() => {
        callService('climate', 'set_temperature', { temperature: temp }, {
          entity_id: 'climate.a32_pro_van_hydronic_heating_pid',
        });
      }, 300);
    },
    [callService],
  );

  const targetTemp = thermostat?.attributes?.temperature ?? 0;

  // Clear local override when backend catches up — must be before early return
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLocalTarget(null); }, [targetTemp]);

  if (!thermostat) return null;

  const attrs = thermostat.attributes;
  const currentTemp = attrs.current_temperature ?? 0;
  const minTemp = attrs.min_temp ?? 5;
  const maxTemp = attrs.max_temp ?? 35;
  const stepTemp = attrs.target_temp_step ?? 0.5;
  const hvacMode = thermostat.state;
  const isHeating = hvacMode === 'heat';

  const displayTarget = localTarget ?? targetTemp;

  const handleSlider = (val: number) => {
    // Snap to step
    const snapped = Math.round(val / stepTemp) * stepTemp;
    setLocalTarget(snapped);
    commitTemp(snapped);
  };

  const toggleMode = () => {
    callService('climate', 'set_hvac_mode', {
      hvac_mode: isHeating ? 'off' : 'heat',
    }, { entity_id: 'climate.a32_pro_van_hydronic_heating_pid' });
  };

  // Color gradient based on target temp
  const tempRatio = Math.max(0, Math.min(1, (displayTarget - minTemp) / (maxTemp - minTemp)));
  const sliderColor = isHeating
    ? `hsl(${30 - tempRatio * 30}, ${70 + tempRatio * 30}%, ${55 - tempRatio * 10}%)`
    : undefined;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Thermometer
            className={cn('h-4 w-4', isHeating ? 'text-orange-500' : 'text-muted-foreground')}
          />
          Thermostat
          <span className={cn(
            'ml-auto text-xs font-medium px-2 py-0.5 rounded-full',
            isHeating
              ? 'bg-orange-500/10 text-orange-500'
              : 'bg-muted text-muted-foreground',
          )}>
            {isHeating ? 'Heating' : 'Off'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current + Target temps side by side */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Current</p>
            <p className="text-3xl font-bold tabular-nums leading-none">
              {currentTemp.toFixed(1)}°
            </p>
          </div>
          {isHeating && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-0.5">Target</p>
              <p className="text-2xl font-bold tabular-nums text-orange-500 leading-none">
                {displayTarget.toFixed(1)}°
              </p>
            </div>
          )}
        </div>

        {/* Temperature slider */}
        {isHeating && (
          <div className="space-y-1">
            <Slider
              min={minTemp}
              max={maxTemp}
              step={stepTemp}
              value={displayTarget}
              onValueChange={handleSlider}
              style={sliderColor ? {
                accentColor: sliderColor,
              } as React.CSSProperties : undefined}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
              <span>{minTemp}°</span>
              <span>{maxTemp}°</span>
            </div>
          </div>
        )}

        {/* On/Off toggle */}
        <Button
          variant={isHeating ? 'default' : 'outline'}
          className={cn('w-full', isHeating && 'bg-orange-500 hover:bg-orange-600')}
          onClick={toggleMode}
        >
          <Power className="h-4 w-4 mr-2" />
          {isHeating ? 'Turn Off' : 'Turn On'}
        </Button>
      </CardContent>
    </Card>
  );
}
