import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useService, useToggle } from '@/hooks/useService';
import { cn, fmt } from '@/lib/utils';
import { SparklineStat } from '@/components/ClickableValue';
import { type LucideIcon } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

interface BangBangControlProps {
  /** Entity ID of the bang_bang climate entity */
  climateEntity: string;
  /** Entity ID of the enable switch (optional) */
  enableEntity?: string;
  /** Entity ID of the temperature sensor for sparkline */
  tempEntity: string;
  /** Entity ID of an optional power sensor */
  powerEntity?: string;
  /** Display name */
  name: string;
  /** Icon component */
  icon: LucideIcon;
  /** Accent color */
  color: string;
  /** Whether this is a cooling thermostat (default: heating) */
  isCooling?: boolean;
}

export function BangBangControl({
  climateEntity,
  enableEntity,
  tempEntity,
  powerEntity,
  name,
  icon: Icon,
  color,
  isCooling = false,
}: BangBangControlProps) {
  const thermostat = useEntity(climateEntity);
  const enableSwitch = useEntity(enableEntity ?? '');
  const toggleEnable = useToggle(enableEntity ?? '');
  const { value: temp } = useEntityNumeric(tempEntity);
  const { value: power } = useEntityNumeric(powerEntity ?? '');
  const callService = useService();

  const attrs = thermostat?.attributes ?? {};
  const targetLow = attrs.target_temp_low as number | undefined;
  const targetHigh = attrs.target_temp_high as number | undefined;
  const hvacMode = thermostat?.state; // 'heat', 'cool', 'off'
  const isActive = hvacMode === 'heat' || hvacMode === 'cool';

  // Local state for smooth adjustments
  const [localLow, setLocalLow] = useState<number | null>(null);
  const [localHigh, setLocalHigh] = useState<number | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clear local override when backend catches up
  useEffect(() => { setLocalLow(null); }, [targetLow]);
  useEffect(() => { setLocalHigh(null); }, [targetHigh]);

  const displayLow = localLow ?? targetLow ?? 0;
  const displayHigh = localHigh ?? targetHigh ?? 0;

  const commitTemps = useCallback(
    (low: number, high: number) => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
      commitTimer.current = setTimeout(() => {
        callService('climate', 'set_temperature', {
          target_temp_low: low,
          target_temp_high: high,
        }, { entity_id: climateEntity });
      }, 400);
    },
    [callService, climateEntity],
  );

  const adjustLow = (delta: number) => {
    const newLow = Math.round((displayLow + delta) * 10) / 10;
    // Ensure low < high (at least 0.5 gap)
    if (newLow >= displayHigh - 0.4) return;
    setLocalLow(newLow);
    commitTemps(newLow, displayHigh);
  };

  const adjustHigh = (delta: number) => {
    const newHigh = Math.round((displayHigh + delta) * 10) / 10;
    // Ensure high > low
    if (newHigh <= displayLow + 0.4) return;
    setLocalHigh(newHigh);
    commitTemps(displayLow, newHigh);
  };

  const activeLabel = isCooling
    ? (isActive ? 'Cooling' : 'Idle')
    : (isActive ? 'Heating' : 'Idle');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={cn('h-4 w-4')} style={{ color: isActive ? color : undefined }} />
          {name}
          {enableEntity && enableSwitch && (
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">{activeLabel}</span>
              <Switch
                checked={enableSwitch.state === 'on'}
                onCheckedChange={toggleEnable}
              />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <SparklineStat
          entityId={tempEntity}
          label="Temperature"
          value={fmt(temp, 1)}
          unit="°C"
          color={color}
        />

        {/* Threshold controls */}
        {targetLow != null && targetHigh != null && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              {isCooling ? 'Fan On / Off' : 'Heat On / Off'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {/* Low threshold */}
              <div className="flex items-center justify-between rounded-lg border px-2 py-1.5">
                <div className="text-xs">
                  <span className="text-muted-foreground">{isCooling ? 'Off' : 'On'} ≤</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="h-6 w-6 rounded border text-xs hover:bg-accent active:bg-accent/80 flex items-center justify-center"
                    onClick={() => adjustLow(-1)}
                  >−</button>
                  <span className="text-sm font-bold tabular-nums w-8 text-center">
                    {displayLow}°
                  </span>
                  <button
                    className="h-6 w-6 rounded border text-xs hover:bg-accent active:bg-accent/80 flex items-center justify-center"
                    onClick={() => adjustLow(1)}
                  >+</button>
                </div>
              </div>

              {/* High threshold */}
              <div className="flex items-center justify-between rounded-lg border px-2 py-1.5">
                <div className="text-xs">
                  <span className="text-muted-foreground">{isCooling ? 'On' : 'Off'} ≥</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="h-6 w-6 rounded border text-xs hover:bg-accent active:bg-accent/80 flex items-center justify-center"
                    onClick={() => adjustHigh(-1)}
                  >−</button>
                  <span className="text-sm font-bold tabular-nums w-8 text-center">
                    {displayHigh}°
                  </span>
                  <button
                    className="h-6 w-6 rounded border text-xs hover:bg-accent active:bg-accent/80 flex items-center justify-center"
                    onClick={() => adjustHigh(1)}
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {powerEntity && power != null && (
          <SparklineStat
            entityId={powerEntity}
            label="Power"
            value={fmt(power, 0)}
            unit="W"
            color="#ef4444"
          />
        )}
      </CardContent>
    </Card>
  );
}
