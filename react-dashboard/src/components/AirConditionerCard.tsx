import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useEntity } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import { Snowflake, Power, Minus, Plus, Wind, Loader2 } from 'lucide-react';

const AC_ENTITY = 'climate.ag_pro_24v_air_conditioner';

// Debounce window. Rapid taps coalesce; only the FINAL value of each control is
// sent — one command per changed dimension — after the user stops interacting.
// This matters here specifically because the AC is driven by one-way IR: each
// command takes a beat and the firmware walks the temp/fan one IR step at a
// time, so firing on every tap would flood it and cause missed/colliding steps.
const APPLY_DELAY_MS = 5000;

type Pending = {
  mode?: string | null;
  temp?: number | null;
  fan?: string | null;
  swing?: string | null;
};

const FAN_LABELS: Record<string, string> = { low: 'Low', medium: 'Med', high: 'High' };

export function AirConditionerCard({ entityId = AC_ENTITY }: { entityId?: string }) {
  const ac = useEntity(entityId);
  const callService = useService();

  // Pending (desired-but-not-yet-sent) state. Kept in BOTH a ref (read by the
  // debounced flush, which would otherwise capture stale values) and React state
  // (drives the optimistic UI).
  const [pending, setPending] = useState<Pending>({});
  const pendingRef = useRef<Pending>({});
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // ── Backend (authoritative) values ──
  const a = ac?.attributes ?? {};
  const backendMode = ac?.state ?? 'off';
  const backendTemp = (a.temperature as number) ?? 24;
  const backendFan = (a.fan_mode as string) ?? 'medium';
  const backendSwing = (a.swing_mode as string) ?? 'off';
  const roomTemp = a.current_temperature as number | undefined | null;
  const minTemp = (a.min_temp as number) ?? 16;
  const maxTemp = (a.max_temp as number) ?? 32;
  const step = (a.target_temp_step as number) ?? 1;
  const fanModes: string[] = (a.fan_modes as string[]) ?? ['low', 'medium', 'high'];
  const swingModes: string[] = (a.swing_modes as string[]) ?? [];

  // Mirror backend into a ref so the flush closure always reads current values.
  const backendRef = useRef({ backendMode, backendTemp, backendFan, backendSwing });
  backendRef.current = { backendMode, backendTemp, backendFan, backendSwing };

  // ── Displayed values = optimistic override ?? backend ──
  const mode = pending.mode ?? backendMode;
  const temp = pending.temp ?? backendTemp;
  const fan = pending.fan ?? backendFan;
  const swing = pending.swing ?? backendSwing;
  const isOn = mode === 'cool';
  const hasPending =
    pending.mode != null || pending.temp != null || pending.fan != null || pending.swing != null;

  // ── Flush: send ONE service call per dimension that still differs from backend ──
  const flush = useCallback(() => {
    const p = pendingRef.current;
    const b = backendRef.current;
    const finalMode = p.mode ?? b.backendMode;
    // Keep only the dimensions we actually sent — reconciliation (below) clears
    // each once the backend reflects it. Everything else is dropped now so a
    // no-longer-relevant pending value (e.g. a temp set while turning off) can't
    // linger forever.
    const keep: Pending = {};

    if (p.mode != null && p.mode !== b.backendMode) {
      callService('climate', 'set_hvac_mode', { hvac_mode: p.mode }, { entity_id: entityId });
      keep.mode = p.mode;
    }
    // Temp/fan/swing are meaningless while off (and the firmware ignores them);
    // only push them when the unit will end up on.
    if (finalMode !== 'off') {
      if (p.temp != null && p.temp !== b.backendTemp) {
        callService('climate', 'set_temperature', { temperature: p.temp }, { entity_id: entityId });
        keep.temp = p.temp;
      }
      if (p.fan != null && p.fan !== b.backendFan) {
        callService('climate', 'set_fan_mode', { fan_mode: p.fan }, { entity_id: entityId });
        keep.fan = p.fan;
      }
      if (p.swing != null && p.swing !== b.backendSwing) {
        callService('climate', 'set_swing_mode', { swing_mode: p.swing }, { entity_id: entityId });
        keep.swing = p.swing;
      }
    }

    pendingRef.current = keep;
    setPending(keep);
    setSecondsLeft(0);
  }, [callService, entityId]);

  // ── (Re)arm the debounce. Called on every user interaction. ──
  const schedule = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flush, APPLY_DELAY_MS);
    setSecondsLeft(Math.round(APPLY_DELAY_MS / 1000));
  }, [flush]);

  // Apply a change to the pending set. If a dimension ends up equal to backend
  // (e.g. user nudged a value then put it back), drop it so no command is sent.
  const update = useCallback((patch: Pending) => {
    const b = backendRef.current;
    const merged: Pending = { ...pendingRef.current, ...patch };
    if (merged.mode === b.backendMode) merged.mode = null;
    if (merged.temp === b.backendTemp) merged.temp = null;
    if (merged.fan === b.backendFan) merged.fan = null;
    if (merged.swing === b.backendSwing) merged.swing = null;

    pendingRef.current = merged;
    setPending(merged);

    const stillPending =
      merged.mode != null || merged.temp != null || merged.fan != null || merged.swing != null;
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

  // Cosmetic 1 Hz countdown for the "Applying in Ns…" pill.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  // Reconcile: once the backend catches up to a pending value, drop the override
  // so the UI follows the real entity again (no flicker back to the old value).
  useEffect(() => {
    const p = pendingRef.current;
    const next: Pending = { ...p };
    let changed = false;
    if (p.mode != null && p.mode === backendMode) { next.mode = null; changed = true; }
    if (p.temp != null && p.temp === backendTemp) { next.temp = null; changed = true; }
    if (p.fan != null && p.fan === backendFan) { next.fan = null; changed = true; }
    if (p.swing != null && p.swing === backendSwing) { next.swing = null; changed = true; }
    if (changed) { pendingRef.current = next; setPending(next); }
  }, [backendMode, backendTemp, backendFan, backendSwing]);

  // Clear the timer on unmount.
  useEffect(() => () => { if (flushTimer.current) clearTimeout(flushTimer.current); }, []);

  if (!ac) return null;

  // ── Handlers ──
  const togglePower = () => update({ mode: isOn ? 'off' : 'cool' });
  const adjustTemp = (delta: number) => {
    const next = Math.round(Math.max(minTemp, Math.min(maxTemp, temp + delta)) / step) * step;
    if (next !== temp) update({ temp: next });
  };
  const setTempTo = (v: number) => {
    const next = Math.round(Math.max(minTemp, Math.min(maxTemp, v)) / step) * step;
    update({ temp: next });
  };
  const setFanTo = (f: string) => update({ fan: f });
  const toggleSwing = () =>
    update({ swing: swing === 'off' ? (swingModes.find((s) => s !== 'off') ?? 'vertical') : 'off' });

  const disabledCls = !isOn && 'opacity-50 pointer-events-none';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Snowflake className={cn('h-4 w-4', isOn ? 'text-cyan-500' : 'text-muted-foreground')} />
          Air Conditioner
          <span
            className={cn(
              'ml-auto text-xs font-medium px-2 py-0.5 rounded-full',
              isOn ? 'bg-cyan-500/10 text-cyan-500' : 'bg-muted text-muted-foreground',
            )}
          >
            {isOn ? 'Cooling' : 'Off'}
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
              variant="outline"
              size="icon"
              className="rounded-full shrink-0"
              onClick={() => adjustTemp(-step)}
              disabled={!isOn || temp <= minTemp}
              aria-label="Decrease temperature"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Slider
              min={minTemp}
              max={maxTemp}
              step={step}
              value={temp}
              onValueChange={setTempTo}
              disabled={!isOn}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shrink-0"
              onClick={() => adjustTemp(step)}
              disabled={!isOn || temp >= maxTemp}
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

        {/* Fan speed */}
        <div className={cn('space-y-1.5', disabledCls)}>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5" /> Fan
          </p>
          <div className="grid grid-cols-3 gap-2">
            {fanModes.map((f) => (
              <Button
                key={f}
                variant={fan === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFanTo(f)}
                disabled={!isOn}
              >
                {FAN_LABELS[f] ?? f}
              </Button>
            ))}
          </div>
        </div>

        {/* Swing (only if the entity supports it) */}
        {swingModes.length > 1 && (
          <div className={cn('flex items-center justify-between', disabledCls)}>
            <span className="text-xs text-muted-foreground">Swing</span>
            <Button
              variant={swing !== 'off' ? 'default' : 'outline'}
              size="sm"
              onClick={toggleSwing}
              disabled={!isOn}
            >
              {swing !== 'off' ? 'On' : 'Off'}
            </Button>
          </div>
        )}

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
