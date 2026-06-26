import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useEntity } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import { Snowflake, Power, Minus, Plus, Wind, Loader2 } from 'lucide-react';

const AC_ENTITY = 'climate.ag_pro_24v_air_conditioner';
// Fan level (1–6) lives in a dedicated ESPHome number entity, because the climate
// entity only exposes low/medium/high. Amps come from the AC's current shunt.
const FAN_NUMBER = 'number.ag_pro_24v_ac_fan_level';
const AMPS_SENSOR = 'sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning';

// Remote presets. Each is a single IR frame that jumps the AC straight to a
// temp/fan; the firmware syncs its state to match. We show the target values
// optimistically and fire the matching button on flush.
const PRESETS = [
  { key: 'strong', label: 'Strong', temp: 16, fan: 6, entity: 'button.ag_pro_24v_ac_strong' },
  { key: 'eco', label: 'Eco', temp: 26, fan: 3, entity: 'button.ag_pro_24v_ac_eco' },
  { key: 'sleep', label: 'Sleep', temp: 28, fan: 1, entity: 'button.ag_pro_24v_ac_sleep' },
] as const;

// Debounce window. Rapid taps coalesce; only the FINAL value of each control is
// sent — one command per changed dimension — after the user stops interacting.
// This matters here specifically because the AC is driven by one-way IR: each
// command takes a beat and the firmware walks the temp/fan one IR step at a
// time, so firing on every tap would flood it and cause missed/colliding steps.
const APPLY_DELAY_MS = 5000;

type Pending = {
  mode?: string | null;
  temp?: number | null;
  fan?: number | null;
  preset?: string | null;
};

export function AirConditionerCard({ entityId = AC_ENTITY }: { entityId?: string }) {
  const ac = useEntity(entityId);
  const fanNum = useEntity(FAN_NUMBER);
  const ampsEnt = useEntity(AMPS_SENSOR);
  const callService = useService();

  const [pending, setPending] = useState<Pending>({});
  const pendingRef = useRef<Pending>({});
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // ── Backend (authoritative) values ──
  const a = ac?.attributes ?? {};
  const backendMode = ac?.state ?? 'off';
  const backendTemp = (a.temperature as number) ?? 24;
  const roomTemp = a.current_temperature as number | undefined | null;
  const minTemp = (a.min_temp as number) ?? 16;
  const maxTemp = (a.max_temp as number) ?? 32;
  const step = (a.target_temp_step as number) ?? 1;

  const fanAttrs = fanNum?.attributes ?? {};
  const fanMin = Number(fanAttrs.min ?? 1);
  const fanMax = Number(fanAttrs.max ?? 6);
  const fanState = fanNum?.state;
  const backendFan =
    fanState != null && fanState !== 'unknown' && fanState !== 'unavailable' ? Number(fanState) : 4;

  const amps = ampsEnt ? Number(ampsEnt.state) : NaN;

  const backendRef = useRef({ backendMode, backendTemp, backendFan });
  backendRef.current = { backendMode, backendTemp, backendFan };

  // ── Displayed values = optimistic override ?? backend ──
  const mode = pending.mode ?? backendMode;
  const temp = pending.temp ?? backendTemp;
  const fan = pending.fan ?? backendFan;
  const isOn = mode === 'cool';
  const hasPending =
    pending.mode != null || pending.temp != null || pending.fan != null || pending.preset != null;

  // ── Flush: send ONE service call per dimension that still differs from backend ──
  const flush = useCallback(() => {
    const p = pendingRef.current;
    const b = backendRef.current;
    const finalMode = p.mode ?? b.backendMode;
    const keep: Pending = {};

    if (p.mode != null && p.mode !== b.backendMode) {
      callService('climate', 'set_hvac_mode', { hvac_mode: p.mode }, { entity_id: entityId });
      keep.mode = p.mode;
    }
    if (finalMode !== 'off') {
      if (p.preset != null) {
        // Fire the preset IR frame; the firmware syncs belief + climate target/fan.
        const preset = PRESETS.find((x) => x.key === p.preset);
        if (preset) callService('button', 'press', undefined, { entity_id: preset.entity });
        // Hold the optimistic temp/fan until the backend reflects the preset.
        if (p.temp != null) keep.temp = p.temp;
        if (p.fan != null) keep.fan = p.fan;
      } else {
        if (p.temp != null && p.temp !== b.backendTemp) {
          callService('climate', 'set_temperature', { temperature: p.temp }, { entity_id: entityId });
          keep.temp = p.temp;
        }
        if (p.fan != null && p.fan !== b.backendFan) {
          callService('number', 'set_value', { value: p.fan }, { entity_id: FAN_NUMBER });
          keep.fan = p.fan;
        }
      }
    }

    pendingRef.current = keep;
    setPending(keep);
    setSecondsLeft(0);
  }, [callService, entityId]);

  const schedule = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flush, APPLY_DELAY_MS);
    setSecondsLeft(Math.round(APPLY_DELAY_MS / 1000));
  }, [flush]);

  const update = useCallback((patch: Pending) => {
    const b = backendRef.current;
    const merged: Pending = { ...pendingRef.current, ...patch };
    if (merged.mode === b.backendMode) merged.mode = null;
    if (merged.temp === b.backendTemp) merged.temp = null;
    if (merged.fan === b.backendFan) merged.fan = null;

    pendingRef.current = merged;
    setPending(merged);

    const stillPending =
      merged.mode != null || merged.temp != null || merged.fan != null || merged.preset != null;
    if (stillPending) {
      schedule();
    } else {
      if (flushTimer.current) clearTimeout(flushTimer.current);
      setSecondsLeft(0);
    }
  }, [schedule]);

  const applyNow = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flush();
  }, [flush]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  // Reconcile: once the backend catches up to a pending value, drop the override.
  useEffect(() => {
    const p = pendingRef.current;
    const next: Pending = { ...p };
    let changed = false;
    if (p.mode != null && p.mode === backendMode) { next.mode = null; changed = true; }
    if (p.temp != null && p.temp === backendTemp) { next.temp = null; changed = true; }
    if (p.fan != null && p.fan === backendFan) { next.fan = null; changed = true; }
    if (changed) { pendingRef.current = next; setPending(next); }
  }, [backendMode, backendTemp, backendFan]);

  useEffect(() => () => { if (flushTimer.current) clearTimeout(flushTimer.current); }, []);

  if (!ac) return null;

  // ── Handlers ──
  const togglePower = () => update({ mode: isOn ? 'off' : 'cool' });
  // Manual temp/fan changes override (and cancel) a pending preset.
  const adjustTemp = (delta: number) => {
    const next = Math.round(Math.max(minTemp, Math.min(maxTemp, temp + delta)) / step) * step;
    if (next !== temp) update({ temp: next, preset: null });
  };
  const setTempTo = (v: number) =>
    update({ temp: Math.round(Math.max(minTemp, Math.min(maxTemp, v)) / step) * step, preset: null });
  const adjustFan = (delta: number) => {
    const next = Math.max(fanMin, Math.min(fanMax, fan + delta));
    if (next !== fan) update({ fan: next, preset: null });
  };
  const setFanTo = (v: number) =>
    update({ fan: Math.max(fanMin, Math.min(fanMax, Math.round(v))), preset: null });
  const applyPreset = (p: (typeof PRESETS)[number]) =>
    update({ preset: p.key, temp: p.temp, fan: p.fan });

  const disabledCls = !isOn && 'opacity-50 pointer-events-none';
  const ampsKnown = Number.isFinite(amps);
  const drawing = ampsKnown && amps > 0.05;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Snowflake className={cn('h-4 w-4', isOn ? 'text-cyan-500' : 'text-muted-foreground')} />
          Air Conditioner
          <span className="ml-auto flex items-center gap-1.5">
            {ampsKnown && (
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full tabular-nums',
                  drawing
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {amps.toFixed(1)} A
              </span>
            )}
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                isOn ? 'bg-cyan-500/10 text-cyan-500' : 'bg-muted text-muted-foreground',
              )}
            >
              {isOn ? 'Cooling' : 'Off'}
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Room temp + set point */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Room</p>
            <p className="text-3xl font-bold tabular-nums leading-none">
              {roomTemp != null ? `${roomTemp.toFixed(1)}°` : '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Set to</p>
            <p
              className={cn(
                'text-2xl font-bold tabular-nums leading-none',
                isOn ? 'text-cyan-500' : 'text-muted-foreground',
              )}
            >
              {temp}°
            </p>
          </div>
        </div>

        {/* Temperature: − / slider / + */}
        <div className={cn('space-y-1', disabledCls)}>
          <div className="flex items-center gap-3">
            <Button
              variant="outline" size="icon" className="rounded-full shrink-0"
              onClick={() => adjustTemp(-step)} disabled={!isOn || temp <= minTemp}
              aria-label="Decrease temperature"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Slider
              min={minTemp} max={maxTemp} step={step} value={temp}
              onValueChange={setTempTo} disabled={!isOn} className="flex-1"
            />
            <Button
              variant="outline" size="icon" className="rounded-full shrink-0"
              onClick={() => adjustTemp(step)} disabled={!isOn || temp >= maxTemp}
              aria-label="Increase temperature"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums px-12">
            <span>{minTemp}°</span>
            <span>{maxTemp}°</span>
          </div>
        </div>

        {/* Fan level 1L–6L: − / slider / + */}
        <div className={cn('space-y-1', disabledCls)}>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5" /> Fan
            </p>
            <span className={cn('text-xs font-medium tabular-nums', isOn ? 'text-foreground' : 'text-muted-foreground')}>
              {fan}L
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline" size="icon" className="rounded-full shrink-0"
              onClick={() => adjustFan(-1)} disabled={!isOn || fan <= fanMin}
              aria-label="Decrease fan speed"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Slider
              min={fanMin} max={fanMax} step={1} value={fan}
              onValueChange={setFanTo} disabled={!isOn} className="flex-1"
            />
            <Button
              variant="outline" size="icon" className="rounded-full shrink-0"
              onClick={() => adjustFan(1)} disabled={!isOn || fan >= fanMax}
              aria-label="Increase fan speed"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums px-12">
            <span>{fanMin}L</span>
            <span>{fanMax}L</span>
          </div>
        </div>

        {/* Presets */}
        <div className={cn('space-y-1.5', disabledCls)}>
          <p className="text-xs text-muted-foreground">Presets</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.key}
                variant={pending.preset === p.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyPreset(p)}
                disabled={!isOn}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Pending / debounce indicator */}
        {hasPending && (
          <div className="flex items-center justify-between rounded-md bg-cyan-500/10 px-3 py-2 text-xs text-cyan-600 dark:text-cyan-400">
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {secondsLeft > 0 ? `Applying in ${secondsLeft}s…` : 'Applying…'}
            </span>
            {secondsLeft > 0 && (
              <button className="font-medium underline-offset-2 hover:underline" onClick={applyNow}>
                Apply now
              </button>
            )}
          </div>
        )}

        {/* Power */}
        <Button
          variant={isOn ? 'default' : 'outline'}
          className={cn('w-full', isOn && 'bg-cyan-600 hover:bg-cyan-700')}
          onClick={togglePower}
        >
          <Power className="h-4 w-4 mr-2" />
          {isOn ? 'Turn Off' : 'Turn On'}
        </Button>
      </CardContent>
    </Card>
  );
}
