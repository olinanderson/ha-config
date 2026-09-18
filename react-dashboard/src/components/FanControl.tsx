import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import { Fan, ArrowUp, ArrowDown, Minus, Plus, type LucideIcon } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

// The roof fan runs one of two ways, like on its remote: Manual (fan entity on
// at a speed) or Auto (the fan's own thermostat, switch on, fan entity off): it
// starts and stops by itself while the room is above the set point and
// throttles with the margin. Off / Manual / Auto is one control so the two
// never look like separate things. The AG Pro builds the IR frames; the set
// point lives in whole °F on the fan and is shown here in °C.
export const FAN_ID = 'fan.ag_pro_roof_fan';
export const FAN_THERMOSTAT_ID = 'switch.ag_pro_roof_fan_thermostat';
export const FAN_SET_POINT_ID = 'number.ag_pro_roof_fan_thermostat_set_point';
export const LID_ID = 'cover.ag_pro_roof_fan_lid';
export const DIRECTION_ID = 'sensor.roof_fan_direction';
export const ROOM_ID = 'sensor.living_space_temperature';
export const POWER_ID = 'sensor.roof_fan_power_12v';
// Always sends "off, lid closed", whatever the entities say. The link is one-way
// IR: when the fan misses a frame HA still shows Off, and Off-again is the way out.
export const FORCE_OFF_ID = 'button.ag_pro_roof_fan_force_off';
export const fToC = (f: number) => ((f - 32) * 5) / 9;

// Every frame the fan receives is a beep, so a run of taps or a slider drag is
// sent as one value once it has been left alone for this long.
export const APPLY_DELAY_MS = 1200;

type FanMode = 'off' | 'manual' | 'auto';

/** A value shown as soon as it is changed and sent once the changing stops. */
function useSettled(backend: number, send: (v: number) => void) {
  const [local, setLocal] = useState<number | null>(null);
  const pending = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const sendRef = useRef(send);
  sendRef.current = send;

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (pending.current == null) return;
    const v = pending.current;
    pending.current = null;
    sendRef.current(v);
    // The backend normally reports the new value within a second and clears the
    // override below; if it never does, stop showing a value it does not hold.
    const g = ++generation.current;
    setTimeout(() => {
      if (generation.current === g && pending.current == null) setLocal(null);
    }, 4000);
  }, []);

  const set = useCallback((v: number) => {
    setLocal(v);
    pending.current = v;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, APPLY_DELAY_MS);
  }, [flush]);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    pending.current = null;
    setLocal(null);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLocal(null); }, [backend]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return { value: local ?? backend, set, flush, cancel };
}

function Segmented<K extends string>({
  options, value, onChange, label, size = 'sm', accent = false, className,
}: {
  options: { key: K; label: string; icon?: LucideIcon; title?: string }[];
  value: K | null;
  onChange: (key: K) => void;
  label: string;
  size?: 'sm' | 'lg';
  /** Colour the selected segment (all but the first) as "running". */
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'grid rounded-lg bg-muted p-1',
        size === 'lg' ? 'gap-1' : 'gap-0.5',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o, i) => {
        const selected = o.key === value;
        const Icon = o.icon;
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={selected}
            title={o.title}
            onClick={() => onChange(o.key)}
            className={cn(
              'flex items-center justify-center gap-1 rounded-md font-medium transition-colors',
              size === 'lg' ? 'py-1.5 text-sm' : 'px-2.5 py-1 text-xs',
              selected
                ? accent && i > 0
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function AdjustRow({
  value, min, max, step, onChange, label,
}: {
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; label: string;
}) {
  const clamp = (v: number) => Math.round(Math.max(min, Math.min(max, v)) / step) * step;
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline" size="icon" className="h-8 w-8 rounded-full shrink-0"
        onClick={() => onChange(clamp(value - step))} disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Slider
        aria-label={label}
        min={min} max={max} step={step} value={value}
        onValueChange={(v) => onChange(clamp(v))}
        className="flex-1"
      />
      <Button
        variant="outline" size="icon" className="h-8 w-8 rounded-full shrink-0"
        onClick={() => onChange(clamp(value + step))} disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function FanControl() {
  const fan = useEntity(FAN_ID);
  const lid = useEntity(LID_ID);
  const direction = useEntity(DIRECTION_ID);
  const thermostat = useEntity(FAN_THERMOSTAT_ID);
  const { value: setPointF } = useEntityNumeric(FAN_SET_POINT_ID);
  const { value: watts } = useEntityNumeric(POWER_ID);
  const { value: room } = useEntityNumeric(ROOM_ID);
  const forceOff = useEntity(FORCE_OFF_ID);
  const callService = useService();

  const fanOn = fan?.state === 'on';
  const thermoOn = thermostat?.state === 'on';
  const hasThermostat = !!thermostat;
  const mode: FanMode = thermoOn ? 'auto' : fanOn ? 'manual' : 'off';
  const percentage: number = fan?.attributes?.percentage ?? 0;
  const dirText: string = direction?.state ?? '';
  const isExhaust = dirText === 'Exhaust';
  const dirKey = dirText === 'Exhaust' ? 'exhaust' : dirText === 'Intake' ? 'intake' : null;
  const lidOpen = lid?.state === 'open';
  // Under Auto the fan entity stays off while the motor cycles by itself, so
  // the draw is the only sign it is turning.
  const drawing = watts != null ? watts > 2 : fanOn;
  const spinning = fanOn || (thermoOn && drawing);

  const setPoint = useSettled(setPointF ?? 65, (v) =>
    callService('number', 'set_value', { value: v }, { entity_id: FAN_SET_POINT_ID }));
  const speed = useSettled(percentage, (v) =>
    callService('fan', 'set_percentage', { percentage: v }, { entity_id: FAN_ID }));

  // Off ends whichever way it is running (both paths close the lid); Manual
  // and Auto each end the other, the firmware clears what the frame clears. A
  // set point still waiting goes first when Auto starts (no frame while the
  // thermostat is off) and after the change otherwise, so it never adds a
  // frame; a waiting speed is dropped, since setting it would restart the fan.
  const setMode = (next: FanMode) => {
    if (next === mode) {
      // Off while it already shows Off: the fan may have missed the frame, send it again
      if (next === 'off' && forceOff) callService('button', 'press', undefined, { entity_id: FORCE_OFF_ID });
      return;
    }
    speed.cancel();
    if (next === 'auto') setPoint.flush();
    if (next === 'off') {
      if (thermoOn) callService('switch', 'turn_off', undefined, { entity_id: FAN_THERMOSTAT_ID });
      else callService('fan', 'turn_off', undefined, { entity_id: FAN_ID });
    } else if (next === 'manual') {
      callService('fan', 'turn_on', undefined, { entity_id: FAN_ID });
    } else {
      callService('switch', 'turn_on', undefined, { entity_id: FAN_THERMOSTAT_ID });
    }
    if (next !== 'auto') setPoint.flush();
  };

  const setDirection = (key: 'intake' | 'exhaust') => {
    const exhaust = key === 'exhaust';
    if (exhaust === isExhaust) return;
    if (mode === 'auto') {
      // With the fan entity off under the thermostat a plain direction change
      // sends nothing, so restart the thermostat in the new direction.
      const temp_f = setPoint.value;
      setPoint.cancel();
      callService('esphome', 'ag_pro_roof_fan_thermostat', {
        temp_f, exhaust, speed_pct: Math.max(10, percentage),
      });
    } else {
      callService('fan', 'set_direction', { direction: exhaust ? 'forward' : 'reverse' }, { entity_id: FAN_ID });
    }
  };

  const setLid = (key: 'open' | 'closed') => {
    if ((key === 'open') === lidOpen) return;
    callService('cover', key === 'open' ? 'open_cover' : 'close_cover', undefined, { entity_id: LID_ID });
  };

  const modes: { key: FanMode; label: string; title?: string }[] = hasThermostat
    ? [
        { key: 'off', label: 'Off', title: 'Off and lid closed. Tap again to send it once more if the fan missed it' },
        { key: 'manual', label: 'Manual', title: 'Runs at the speed you set' },
        { key: 'auto', label: 'Auto', title: 'Runs by itself while the room is above the set point, faster the warmer it is' },
      ]
    : [{ key: 'off', label: 'Off' }, { key: 'manual', label: 'On' }];

  const badge =
    mode === 'off' ? 'Off'
    : mode === 'manual' ? 'On'
    : drawing ? 'Auto · running' : 'Auto · idle';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Fan
            className={cn(
              'h-4 w-4',
              mode !== 'off' ? 'text-cyan-500' : 'text-muted-foreground',
              spinning && 'animate-spin',
            )}
            style={spinning ? { animationDuration: '2s' } : undefined}
          />
          Roof Fan
          <span className="ml-auto flex items-center gap-1.5">
            {mode !== 'off' && watts != null && (
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full tabular-nums',
                  drawing ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-muted text-muted-foreground',
                )}
              >
                {Math.round(watts)} W
              </span>
            )}
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                mode !== 'off' ? 'bg-cyan-500/10 text-cyan-500' : 'bg-muted text-muted-foreground',
              )}
            >
              {badge}
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Room + what the fan is holding */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Room</p>
            <p className="text-3xl font-bold tabular-nums leading-none">
              {room != null ? `${room.toFixed(1)}°` : '—'}
            </p>
          </div>
          {mode === 'manual' ? (
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-0.5">Speed</p>
              <p className="text-2xl font-bold tabular-nums leading-none text-cyan-500">{speed.value}%</p>
            </div>
          ) : hasThermostat ? (
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-0.5">Auto above</p>
              <p
                className={cn(
                  'text-2xl font-bold tabular-nums leading-none',
                  mode === 'auto' ? 'text-cyan-500' : 'text-muted-foreground',
                )}
              >
                {fToC(setPoint.value).toFixed(1)}°
              </p>
              <p className="text-[10px] text-muted-foreground tabular-nums mt-1">{setPoint.value} °F</p>
            </div>
          ) : null}
        </div>

        <Segmented options={modes} value={mode} onChange={setMode} label="Fan mode" size="lg" accent />

        {mode === 'manual' && (
          <AdjustRow value={speed.value} min={10} max={100} step={10} onChange={speed.set} label="fan speed" />
        )}
        {/* The fan accepts 29–99 °F; 50–90 (10–32 °C) is the part worth a slider */}
        {mode === 'auto' && (
          <AdjustRow value={setPoint.value} min={50} max={90} step={1} onChange={setPoint.set} label="fan set point" />
        )}

        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">Direction</span>
            <Segmented
              label="Fan direction"
              className="w-44"
              value={dirKey}
              onChange={setDirection}
              options={[
                { key: 'intake', label: 'Intake', icon: ArrowDown },
                { key: 'exhaust', label: 'Exhaust', icon: ArrowUp },
              ]}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">Lid</span>
            <Segmented
              label="Fan lid"
              className="w-44"
              value={lid ? (lidOpen ? 'open' : 'closed') : null}
              onChange={setLid}
              options={[
                { key: 'open', label: 'Open' },
                { key: 'closed', label: 'Closed' },
              ]}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
