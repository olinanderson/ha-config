import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn, fmt } from '@/lib/utils';
import { Fan, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

export function FanControl() {
  const fan = useEntity('fan.ag_pro_roof_fan');
  const lid = useEntity('cover.ag_pro_roof_fan_lid');
  const direction = useEntity('sensor.roof_fan_direction');
  const { value: currentAmps } = useEntityNumeric('sensor.a32_pro_s5140_channel_14_current_12v_roof_fan');
  const callService = useService();

  const fanOn = fan?.state === 'on';
  const percentage = fan?.attributes?.percentage ?? 0;
  const lidState = lid?.state;
  const dirText = direction?.state ?? 'Unknown';
  const isExhaust = dirText === 'Exhaust';

  const toggleFan = () => {
    callService('fan', fanOn ? 'turn_off' : 'turn_on', undefined, {
      entity_id: 'fan.ag_pro_roof_fan',
    });
  };

  const [localSpeed, setLocalSpeed] = useState<number | null>(null);
  const speedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setSpeed = useCallback(
    (pct: number) => {
      setLocalSpeed(pct);
      if (speedTimer.current) clearTimeout(speedTimer.current);
      speedTimer.current = setTimeout(() => {
        callService('fan', 'set_percentage', { percentage: pct }, {
          entity_id: 'fan.ag_pro_roof_fan',
        });
      }, 300);
    },
    [callService],
  );
  const displaySpeed = localSpeed ?? percentage;

  // Clear local override when backend catches up
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLocalSpeed(null); }, [percentage]);

  const toggleDirection = () => {
    callService('fan', 'set_direction', { direction: isExhaust ? 'reverse' : 'forward' }, {
      entity_id: 'fan.ag_pro_roof_fan',
    });
  };

  const toggleLid = () => {
    const action = lidState === 'open' ? 'close_cover' : 'open_cover';
    callService('cover', action, undefined, { entity_id: 'cover.ag_pro_roof_fan_lid' });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Fan
            className={cn('h-4 w-4', fanOn && 'text-cyan-500 animate-spin')}
            style={fanOn ? { animationDuration: '2s' } : undefined}
          />
          Roof Fan
          {fanOn && currentAmps != null && (
            <span className="ml-auto text-xs font-normal text-muted-foreground tabular-nums">
              {fmt(currentAmps, 2)} A
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Fan on/off + speed */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Fan</span>
          <Switch checked={fanOn} onCheckedChange={toggleFan} />
        </div>

        {fanOn && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm">Speed</span>
              <span className="text-xs text-muted-foreground tabular-nums">{displaySpeed}%</span>
            </div>
            <Slider min={0} max={100} step={10} value={displaySpeed} onValueChange={setSpeed} />
          </div>
        )}

        {/* Direction toggle — single button that swaps between exhaust/intake */}
        <button
          onClick={toggleDirection}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors',
            isExhaust
              ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
              : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
          )}
        >
          <div className="flex items-center gap-2">
            {isExhaust
              ? <ArrowUp className="h-4 w-4" />
              : <ArrowDown className="h-4 w-4" />
            }
            <span className="text-sm font-medium">{dirText}</span>
          </div>
          <span className="text-xs opacity-60">Tap to switch</span>
        </button>

        {/* Lid open/close */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Lid</span>
          <div className="flex gap-1.5">
            <Button
              variant={lidState === 'open' ? 'default' : 'outline'}
              size="sm"
              onClick={() => callService('cover', 'open_cover', undefined, { entity_id: 'cover.ag_pro_roof_fan_lid' })}
            >
              <ChevronUp className="h-3.5 w-3.5 mr-1" />
              Open
            </Button>
            <Button
              variant={lidState === 'closed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => callService('cover', 'close_cover', undefined, { entity_id: 'cover.ag_pro_roof_fan_lid' })}
            >
              <ChevronDown className="h-3.5 w-3.5 mr-1" />
              Close
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
