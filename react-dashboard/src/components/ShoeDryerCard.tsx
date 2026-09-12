import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { cn, fmt } from '@/lib/utils';
import { Footprints, Minus, Plus, Square, Thermometer, Wind } from 'lucide-react';

const TIMER_ID = 'timer.shoe_dryer';
const MINUTES_ID = 'input_number.shoe_dryer_minutes';
// The blower's own thermocouples: coolant is the heat available in the loop,
// air is what actually reaches the shoes.
const AIR_TEMP_ID = 'sensor.a32_pro_s5140_channel_35_temperature_blower_air';
const COOLANT_TEMP_ID = 'sensor.a32_pro_s5140_channel_34_temperature_blower_coolant';
const PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
];

/** "0:20:00" / "1:05:30" → seconds. */
function parseHms(hms: unknown): number {
  if (typeof hms !== 'string') return 0;
  const parts = hms.split(':').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return 0;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

/** Seconds → digital countdown: "1:02:33" or "19:45". */
function fmtCountdown(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`;
}

/** One tappable temperature tile; opens the entity's history on click. */
function TempTile({
  label,
  entityId,
  value,
  accent,
}: {
  label: string;
  entityId: string;
  value: number | null;
  accent?: boolean;
}) {
  const { open } = useHistoryDialog();
  return (
    <button
      onClick={() => open(entityId, `Blower ${label}`, '°C')}
      className="flex-1 rounded-lg border border-border bg-muted/30 px-2 py-1.5 text-left transition-colors hover:bg-accent"
    >
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Thermometer className="h-3 w-3" />
        {label}
      </span>
      <span
        className={cn(
          'block text-lg font-semibold tabular-nums',
          accent && value != null && 'text-cyan-400',
        )}
      >
        {fmt(value, 1)}°C
      </span>
    </button>
  );
}

export function ShoeDryerCard() {
  const timer = useEntity(TIMER_ID);
  const minutesEntity = useEntity(MINUTES_ID);
  const shopMode = useEntity('input_boolean.shop_mode');
  const { value: airTemp } = useEntityNumeric(AIR_TEMP_ID);
  const { value: coolantTemp } = useEntityNumeric(COOLANT_TEMP_ID);
  const call = useService();

  const active = timer?.state === 'active';
  const paused = timer?.state === 'paused';
  // Anything non-idle means the dry is in progress — a paused timer still has
  // the blower at 100%, so it must NOT render the idle "Start" face.
  const running = active || paused;

  // The timer entity only pushes a state_changed on start/finish/cancel —
  // `remaining` does NOT tick over the websocket. Live countdown = 1 Hz local
  // tick against the static finishes_at attribute (active only; while paused
  // the remaining time is frozen anyway).
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  // In-flight lock: script.shoe_dryer_start takes ~1 s before the timer goes
  // active; a reflex double-tap in that window must not reach HA twice.
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (running) setPending(false);
  }, [running]);
  useEffect(() => {
    if (!pending) return;
    const id = setTimeout(() => setPending(false), 5000);
    return () => clearTimeout(id);
  }, [pending]);

  if (timer == null) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Footprints className="h-4 w-4" />
            Shoe Dryer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            timer.shoe_dryer is not configured — reload the timer integration.
          </p>
        </CardContent>
      </Card>
    );
  }

  const shopModeOn = shopMode?.state === 'on';
  const minutes = Number(minutesEntity?.state);
  const minutesValid = Number.isFinite(minutes);
  const shownMinutes = minutesValid ? Math.round(minutes) : 30;

  const totalSec = parseHms(timer.attributes?.duration);
  const finishesAt = active ? Date.parse(timer.attributes?.finishes_at ?? '') : NaN;
  const remainingSec = active
    ? Number.isFinite(finishesAt)
      ? Math.max(0, (finishesAt - Date.now()) / 1000)
      : 0
    : paused
      ? parseHms(timer.attributes?.remaining)
      : 0;

  const setMinutes = (value: number) =>
    call('input_number', 'set_value', { value: Math.min(240, Math.max(5, value)) }, { entity_id: MINUTES_ID });
  const start = () => {
    setPending(true);
    call('script', 'shoe_dryer_start');
  };
  const stop = () => call('script', 'shoe_dryer_stop');

  return (
    <Card className={cn(running && 'border-cyan-500/50 bg-cyan-500/5')}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Footprints className={cn('h-4 w-4', running && 'text-cyan-400')} />
          Shoe Dryer
          {running && (
            <span
              className={cn(
                'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                paused ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400',
              )}
            >
              {paused ? 'Paused' : 'Drying'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Air is what dries the shoes; coolant is the heat available to it.
            Shown in every state — a cold loop before you start means the
            blower would just move cold air around. */}
        <div className="flex gap-2">
          <TempTile label="Air" entityId={AIR_TEMP_ID} value={airTemp} accent={running} />
          <TempTile label="Coolant" entityId={COOLANT_TEMP_ID} value={coolantTemp} />
        </div>
        {running ? (
          <>
            <div className="flex items-center justify-center gap-2">
              <Wind className={cn('h-5 w-5', paused ? 'text-amber-400' : 'text-cyan-400')} />
              <span className="text-3xl font-semibold tabular-nums">
                {fmtCountdown(remainingSec)}
              </span>
            </div>
            <Progress
              value={totalSec > 0 ? (remainingSec / totalSec) * 100 : 0}
              indicatorClassName={paused ? 'bg-amber-500' : 'bg-cyan-500'}
            />
            <button
              onClick={stop}
              className="w-full rounded-lg border-2 border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 flex items-center justify-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </button>
            <p
              className={cn(
                'text-[11px] leading-snug',
                shopModeOn ? 'text-amber-400' : 'text-muted-foreground',
              )}
            >
              {shopModeOn
                ? 'Shop Mode killed the blower but the timer is still running — press Stop to end the dry.'
                : paused
                  ? 'Timer paused — the blower may still be running. Press Stop to end the dry.'
                  : 'Blower at 100%. Hydronic heating is paused and comes back when the timer ends.'}
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Run time
              </span>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Decrease run time"
                  onClick={() => setMinutes(shownMinutes - 5)}
                  className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[4.5rem] text-center text-lg font-semibold tabular-nums">
                  {minutesValid ? `${shownMinutes} min` : '—'}
                </span>
                <button
                  aria-label="Increase run time"
                  onClick={() => setMinutes(shownMinutes + 5)}
                  className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setMinutes(p.minutes)}
                  className={cn(
                    'flex-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors',
                    shownMinutes === p.minutes
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                      : 'border-border text-muted-foreground hover:bg-accent',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={start}
              disabled={shopModeOn || pending}
              className="w-full rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? 'Starting…' : 'Start Drying'}
            </button>
            <p className="text-[11px] leading-snug text-muted-foreground">
              {shopModeOn
                ? 'Disarm Shop Mode first — it locks the blower off.'
                : 'Runs the coolant blower at 100% (heating pauses), then shuts it off automatically.'}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
