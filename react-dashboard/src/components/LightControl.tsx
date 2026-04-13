import { useEntity } from '@/hooks/useEntity';
import { useToggle, useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import { Sun, Thermometer, Power } from 'lucide-react';
import { useCallback, useRef, useState, useEffect } from 'react';

interface LightControlProps {
  entityId: string;
  name: string;
  hasCct?: boolean;
}

export function LightControl({ entityId, name, hasCct = false }: LightControlProps) {
  const entity = useEntity(entityId);
  const toggle = useToggle(entityId);
  const callService = useService();
  const isOn = entity?.state === 'on';
  const brightness = entity?.attributes?.brightness ?? 0;
  const pct = Math.round((brightness / 255) * 100);
  const colorTemp = entity?.attributes?.color_temp ?? 250;
  const minMireds = entity?.attributes?.min_mireds ?? 150;
  const maxMireds = entity?.attributes?.max_mireds ?? 500;

  // Local slider state for smooth dragging
  const [localBright, setLocalBright] = useState(pct);
  const [localTemp, setLocalTemp] = useState(colorTemp);
  const brightTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tempTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sync from entity when not dragging
  useEffect(() => { setLocalBright(pct); }, [pct]);
  useEffect(() => { setLocalTemp(colorTemp); }, [colorTemp]);

  const commitBrightness = useCallback(
    (v: number) => {
      setLocalBright(v);
      if (brightTimer.current) clearTimeout(brightTimer.current);
      brightTimer.current = setTimeout(() => {
        callService('light', 'turn_on', { brightness_pct: v }, { entity_id: entityId });
      }, 200);
    },
    [callService, entityId],
  );

  const commitTemp = useCallback(
    (v: number) => {
      setLocalTemp(v);
      if (tempTimer.current) clearTimeout(tempTimer.current);
      tempTimer.current = setTimeout(() => {
        callService('light', 'turn_on', { color_temp: v }, { entity_id: entityId });
      }, 200);
    },
    [callService, entityId],
  );

  return (
    <div
      className={cn(
        'rounded-xl border-2 transition-all duration-300 overflow-hidden',
        isOn
          ? 'border-yellow-500/60 bg-yellow-500/5 shadow-md shadow-yellow-500/15'
          : 'border-border bg-card',
      )}
    >
      {/* Toggle row */}
      <button
        onClick={toggle}
        className={cn(
          'flex items-center gap-3 w-full px-3 py-2.5 transition-colors',
          isOn ? 'text-foreground' : 'text-muted-foreground hover:bg-accent',
        )}
      >
        <Power className={cn('h-3.5 w-3.5 shrink-0', isOn ? 'text-yellow-500' : '')} />
        <span className="text-xs font-medium">{name}</span>
        {isOn && (
          <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
            {localBright}%
          </span>
        )}
      </button>

      {/* Sliders — only when on */}
      {isOn && (
        <div className="px-3 pb-2.5 space-y-2">
          {/* Brightness */}
          <div className="flex items-center gap-2">
            <Sun className="h-3 w-3 text-muted-foreground shrink-0" />
            <input
              type="range"
              min={1}
              max={100}
              value={localBright}
              onChange={(e) => commitBrightness(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-secondary
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-500"
            />
          </div>

          {/* Color temp — only for CCT lights */}
          {hasCct && (
            <div className="flex items-center gap-2">
              <Thermometer className="h-3 w-3 text-muted-foreground shrink-0" />
              <input
                type="range"
                min={minMireds}
                max={maxMireds}
                value={localTemp}
                onChange={(e) => commitTemp(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400"
                style={{
                  background: `linear-gradient(to right, #cce0ff, #ffcc66, #ff8833)`,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
