import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useEntity } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import { Fan, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

export function FanControl() {
  const fan = useEntity('fan.ag_pro_roof_fan');
  const lid = useEntity('cover.ag_pro_roof_fan_lid');
  const direction = useEntity('sensor.roof_fan_direction');
  const callService = useService();

  const fanOn = fan?.state === 'on';
  const percentage = fan?.attributes?.percentage ?? 0;
  const lidState = lid?.state;
  const dirText = direction?.state ?? 'Unknown';

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

  const setDirection = (dir: string) => {
    callService('fan', 'set_direction', { direction: dir }, {
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
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Fan</span>
          <Switch checked={fanOn} onCheckedChange={toggleFan} />
        </div>

        {fanOn && (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm">Speed</span>
                <span className="text-xs text-muted-foreground tabular-nums">{displaySpeed}%</span>
              </div>
              <Slider min={0} max={100} step={10} value={displaySpeed} onValueChange={setSpeed} />
            </div>

            <div className="flex gap-2">
              <Button
                variant={dirText === 'Exhaust' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setDirection('forward')}
              >
                <ArrowUp className="h-3.5 w-3.5 mr-1" />
                Exhaust
              </Button>
              <Button
                variant={dirText === 'Intake' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setDirection('reverse')}
              >
                <ArrowDown className="h-3.5 w-3.5 mr-1" />
                Intake
              </Button>
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm">Lid</span>
          <Button variant="outline" size="sm" onClick={toggleLid}>
            {lidState === 'open' ? 'Close' : 'Open'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
