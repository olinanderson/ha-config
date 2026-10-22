import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useEntity } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import type { HassEntity } from '@/types/hass';
import { Minus, Plus, Snowflake, Square, Wind } from 'lucide-react';

// docs/winterizing.md. Winterized holds the water system off for the winter
// (automation water_winterized_guard). The blow-out cycles Main, Recirc and
// Flush while the compressor blows through a pump's air port, holds the pumps
// and the UV lamp off, and turns Winterized on as it ends.
export const WINTERIZED_ID = 'input_boolean.water_winterized';
export const BLOWOUT_RUNNING_ID = 'input_boolean.water_blowout_running';
const SCRIPT_ID = 'script.water_blowout';
const STOP_SCRIPT_ID = 'script.water_blowout_stop';
const STATUS_ID = 'input_text.water_blowout_status';
const STEP_ENDS_ID = 'input_datetime.water_blowout_step_ends';
const RUN_ENDS_ID = 'input_datetime.water_blowout_ends';
const MINUTES_ID = 'input_number.water_blowout_minutes';
const ROUNDS_ID = 'input_number.water_blowout_rounds';
const SHOP_ID = 'input_boolean.shop_mode';

const MODES = [
  { label: 'Main', entityId: 'switch.a32_pro_water_system_state_main' },
  { label: 'Recirc', entityId: 'switch.a32_pro_water_system_state_recirculating_shower' },
  { label: 'Flush', entityId: 'switch.a32_pro_water_system_state_recirculating_shower_flush' },
] as const;

/** An input_datetime's moment in ms, or NaN. */
function datetimeMs(entity: HassEntity | null): number {
  const ts = Number(entity?.attributes?.timestamp);
  return Number.isFinite(ts) && ts > 0 ? ts * 1000 : NaN;
}

/** Seconds → "1:05". The steps are 10 minutes at most. */
function mss(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** HA's clock is Mountain and the van may not be, so times are the phone's own. */
function clock(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** The a32's current mode, lit while the blow-out is in it. */
function ModePill({ label, entityId }: { label: string; entityId: string }) {
  const on = useEntity(entityId)?.state === 'on';
  return (
    <span
      aria-current={on ? 'step' : undefined}
      className={cn(
        'flex-1 rounded-lg border px-2 py-1 text-center text-xs font-medium',
        on ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-400' : 'border-border text-muted-foreground',
      )}
    >
      {label}
    </span>
  );
}

function Stepper({
  label,
  shown,
  unit,
  onChange,
}: {
  label: string;
  shown: number | null;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <button
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={shown == null}
          onClick={() => shown != null && onChange(shown - 1)}
          className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[4.5rem] text-center text-lg font-semibold tabular-nums">
          {shown == null ? '—' : `${shown} ${unit}`}
        </span>
        <button
          aria-label={`More ${label.toLowerCase()}`}
          disabled={shown == null}
          onClick={() => shown != null && onChange(shown + 1)}
          className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function WinterizeCard() {
  const lock = useEntity(WINTERIZED_ID);
  const flag = useEntity(BLOWOUT_RUNNING_ID);
  const script = useEntity(SCRIPT_ID);
  const status = useEntity(STATUS_ID);
  const stepEnds = useEntity(STEP_ENDS_ID);
  const runEnds = useEntity(RUN_ENDS_ID);
  const minutesEntity = useEntity(MINUTES_ID);
  const roundsEntity = useEntity(ROUNDS_ID);
  const shopMode = useEntity(SHOP_ID);
  const call = useService();

  // The flag comes on a moment after the script starts, and the script is
  // already off while a Stop finishes: either one means a run.
  const running = flag?.state === 'on' || script?.state === 'on';
  const locked = lock?.state === 'on';

  // Countdowns tick locally against the stored end times
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // A double tap must not start two runs before the first one shows
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (running) setPending(false);
  }, [running]);
  useEffect(() => {
    if (!pending) return;
    const id = setTimeout(() => setPending(false), 5000);
    return () => clearTimeout(id);
  }, [pending]);

  // Turning Winterized off lets the water come on again: it asks first
  const [confirmingOff, setConfirmingOff] = useState(false);
  useEffect(() => {
    if (!locked || running) setConfirmingOff(false);
  }, [locked, running]);

  if (lock == null || script == null) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Snowflake className="h-4 w-4" />
            Winterize
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Winterize helpers not loaded. Reload the input helpers and scripts in Developer&nbsp;Tools&nbsp;→&nbsp;YAML.
          </p>
        </CardContent>
      </Card>
    );
  }

  const shopModeOn = shopMode?.state === 'on';
  const minutesRaw = Number(minutesEntity?.state);
  const roundsRaw = Number(roundsEntity?.state);
  const minutes = Number.isFinite(minutesRaw) ? Math.round(minutesRaw) : null;
  const rounds = Number.isFinite(roundsRaw) ? Math.round(roundsRaw) : null;
  const totalMin = (minutes ?? 2) * (rounds ?? 2) * 3;

  const now = Date.now();
  const stepEndsMs = datetimeMs(stepEnds);
  const runEndsMs = datetimeMs(runEnds);
  const startedMs = Date.parse(script.attributes?.last_triggered ?? '');
  const runStartMs =
    Number.isFinite(startedMs) && startedMs < runEndsMs ? startedMs : runEndsMs - (totalMin * 60 + 12) * 1000;
  const progress =
    Number.isFinite(runEndsMs) && runEndsMs > runStartMs ? ((now - runStartMs) / (runEndsMs - runStartMs)) * 100 : 0;
  const stepLeftSec = Number.isFinite(stepEndsMs) ? (stepEndsMs - now) / 1000 : NaN;

  const statusText =
    status && !['unknown', 'unavailable', ''].includes(status.state) ? status.state : null;
  const statusAt = status?.last_changed ? Date.parse(status.last_changed) : NaN;

  const setNumber = (entityId: string, value: number, min: number, max: number) =>
    call('input_number', 'set_value', { value: Math.min(max, Math.max(min, value)) }, { entity_id: entityId });
  const start = () => {
    setPending(true);
    // turn_on returns at once; calling the script itself would hold the
    // call open for the whole run
    call('script', 'turn_on', undefined, { entity_id: SCRIPT_ID });
  };
  const stop = () => call('script', 'turn_on', undefined, { entity_id: STOP_SCRIPT_ID });
  const setLock = (on: boolean) =>
    call('input_boolean', on ? 'turn_on' : 'turn_off', undefined, { entity_id: WINTERIZED_ID });

  return (
    <Card className={cn((running || locked) && 'border-cyan-500/50 bg-cyan-500/5')}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Snowflake className={cn('h-4 w-4', (running || locked) && 'text-cyan-400')} />
          Winterize
          {(running || locked) && (
            <span className="ml-auto rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
              {running ? 'Blowing out' : 'Winterized'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">Winterized</p>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Holds the water system off: whatever switches it on is switched straight back off.
            </p>
          </div>
          <Switch
            aria-label="Winterized"
            checked={locked}
            disabled={running}
            onCheckedChange={(on) => (on ? setLock(true) : setConfirmingOff(true))}
          />
        </div>
        {confirmingOff && (
          <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5">
            <p className="text-[11px] leading-snug text-amber-300">
              The water can be switched on again. Only once the tank is filled and the filters are back in.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setLock(false);
                  setConfirmingOff(false);
                }}
                className="flex-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
              >
                Turn Winterized off
              </button>
              <button
                onClick={() => setConfirmingOff(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="border-t" />

        {running ? (
          <>
            <div className="flex items-center justify-center gap-2">
              <Wind className="h-5 w-5 shrink-0 text-cyan-400" />
              <span className="text-lg font-semibold">{statusText ?? 'Starting…'}</span>
            </div>
            <div className="flex gap-2">
              {MODES.map((m) => (
                <ModePill key={m.entityId} label={m.label} entityId={m.entityId} />
              ))}
            </div>
            {Number.isFinite(stepLeftSec) && stepLeftSec > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                This step: <span className="font-semibold tabular-nums text-foreground">{mss(stepLeftSec)}</span> left
              </p>
            )}
            <Progress value={progress} indicatorClassName="bg-cyan-500" />
            {Number.isFinite(runEndsMs) && (
              <p className="text-center text-[11px] text-muted-foreground">Done at {clock(runEndsMs)}</p>
            )}
            <button
              onClick={stop}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Square className="h-4 w-4" />
              Stop
            </button>
            <p className="text-[11px] leading-snug text-muted-foreground">
              The pumps and the UV lamp are held off. Stop, or the end of the last round, puts the valves back to
              Main, switches the water off and turns Winterized on.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">Blow-out</p>
            <Stepper
              label="Minutes per mode"
              shown={minutes}
              unit="min"
              onChange={(v) => setNumber(MINUTES_ID, v, 1, 10)}
            />
            <Stepper
              label="Rounds"
              shown={rounds}
              unit={rounds === 1 ? 'round' : 'rounds'}
              onChange={(v) => setNumber(ROUNDS_ID, v, 1, 5)}
            />
            <p className="text-[11px] leading-snug text-muted-foreground">
              Before you start: both pump fuses out, the compressor on a pump&apos;s air port at about 30 psi, the
              shower mixer open. It cycles Main, Recirc and Flush so the air reaches every line.
            </p>
            <button
              onClick={start}
              disabled={shopModeOn || pending}
              className="w-full rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? 'Starting…' : `Start blow-out · ${totalMin} min`}
            </button>
            {shopModeOn && (
              <p className="text-[11px] leading-snug text-amber-400">
                Disarm Shop Mode first: it holds the water off.
              </p>
            )}
            {statusText && (
              <p className="text-[11px] leading-snug text-muted-foreground">
                Last run: {statusText}
                {Number.isFinite(statusAt) &&
                  ` · ${new Date(statusAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
