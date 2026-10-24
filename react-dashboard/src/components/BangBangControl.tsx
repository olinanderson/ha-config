import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useToggle } from '@/hooks/useService';
import { useBangBangSetpoints } from '@/hooks/useBangBangSetpoints';
import { cn, fmt } from '@/lib/utils';
import { SparklineStat } from '@/components/ClickableValue';
import { type LucideIcon } from 'lucide-react';

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
  const enableSwitch = useEntity(enableEntity ?? '');
  const toggleEnable = useToggle(enableEntity ?? '');
  const { value: temp } = useEntityNumeric(tempEntity);
  const { value: power } = useEntityNumeric(powerEntity ?? '');
  const { thermostat, targetLow, targetHigh, displayLow, displayHigh, adjustLow, adjustHigh } =
    useBangBangSetpoints(climateEntity);

  // hvac_action is what the relay is doing now ('heating', 'cooling', 'idle',
  // 'off'); the state ('heat', 'cool', 'off') is only the mode it is enabled in
  const action = thermostat?.attributes?.hvac_action;
  const isActive = action === 'heating' || action === 'cooling';

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
