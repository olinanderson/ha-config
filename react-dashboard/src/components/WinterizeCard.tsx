import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useEntity } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import type { HassEntity } from '@/types/hass';
import { ChevronLeft, Minus, Plus, Snowflake, Square, Wind } from 'lucide-react';

// docs/winterizing.md. Winterized holds the water system off for the winter
// (automation water_winterized_guard). The walkthrough says what to do, the
// fresh tank first, and does the water part through script.water_winterize_*;
// its step lives in HA (input_number.water_winterize_step), so the phone and
// the laptop show the same one and it survives a reload. The blow-out cycles
// Main, Recirc and Flush while the compressor blows through a pump's air port,
// holds the pumps and the UV lamp off, and turns Winterized on as it ends.
export const WINTERIZED_ID = 'input_boolean.water_winterized';
export const BLOWOUT_RUNNING_ID = 'input_boolean.water_blowout_running';
export const WINTERIZING_ID = 'input_boolean.water_winterizing';
const STEP_ID = 'input_number.water_winterize_step';
const SCRIPT_ID = 'script.water_blowout';
const STOP_SCRIPT_ID = 'script.water_blowout_stop';
const START_WALK_ID = 'script.water_winterize_start';
const STOP_WALK_ID = 'script.water_winterize_stop';
const DRAIN_ON_ID = 'script.water_winterize_drain_on';
const DRAIN_OFF_ID = 'script.water_winterize_drain_off';
const FINISH_WALK_ID = 'script.water_winterize_finish';
const STATUS_ID = 'input_text.water_blowout_status';
const STEP_ENDS_ID = 'input_datetime.water_blowout_step_ends';
const RUN_ENDS_ID = 'input_datetime.water_blowout_ends';
const MINUTES_ID = 'input_number.water_blowout_minutes';
const ROUNDS_ID = 'input_number.water_blowout_rounds';
const SHOP_ID = 'input_boolean.shop_mode';
// The live senders, not the stable levels: those lag minutes (fresh) or hold
// for an hour after the hydronic heater ran (grey), docs/winterizing.md
const FRESH_RAW_ID = 'sensor.a32_pro_fresh_water_tank_level';
const GREY_RAW_ID = 'sensor.a32_pro_grey_water_tank_level';
const MASTER_ID = 'switch.a32_pro_water_system_master_switch';
const ELSE_PUMP_ID = 'switch.a32_pro_switch30_main_system_water_pump';
const RECIRC_PUMP_ID = 'switch.a32_pro_switch29_shower_system_water_pump';
const DUMP_VALVE_ID = 'switch.a32_pro_switch06_grey_water_tank_valve';
const MODE_FLUSH_ID = 'switch.a32_pro_water_system_state_recirculating_shower_flush';

const MODES = [
  { label: 'Main', entityId: 'switch.a32_pro_water_system_state_main' },
  { label: 'Recirc', entityId: 'switch.a32_pro_water_system_state_recirculating_shower' },
  { label: 'Flush', entityId: MODE_FLUSH_ID },
] as const;

/** The grey tank reading past which the drain step says to dump it first. */
const GREY_FULL_PCT = 80;
/** Below this the fresh tank counts as drained without asking. */
const FRESH_EMPTY_PCT = 5;

type StepKind = 'drain' | 'flush' | 'blowout' | 'grey' | 'plain';

interface Step {
  title: string;
  text: string;
  kind: StepKind;
  checklist?: string[];
}

// The user's own procedure, in order, with the fresh tank first. The same
// twelve steps are in docs/winterizing.md; change both.
export const STEPS: Step[] = [
  {
    title: 'Drain the fresh tank',
    kind: 'drain',
    text: "Open the tank's drain valve and leave it open all winter. Wait until the flow stops.",
  },
  {
    title: 'Open every outlet',
    kind: 'plain',
    text: 'Each to the middle, so hot and cold both drain.',
    checklist: [
      'Outdoor shower, hot and cold',
      'Shower fresh fill',
      'Shower mixer, hot and cold',
      'Sink, hot and cold',
      'Drinking spigot',
    ],
  },
  {
    title: 'Empty the lines and the shower tank',
    kind: 'flush',
    text:
      'Water on in Flush: both pumps run with the loop open to grey. Go round the outlets. When every one only ' +
      'spits, press the button below. The pumps run dry for a few seconds on purpose: that empties the pump heads.',
  },
  {
    title: 'Shower filters out',
    kind: 'plain',
    text:
      'Unscrew the three housings in the shower: the spin-down (40 µm), then the two large ones (20 and 5 µm). ' +
      'Empty them into the drain and put the housings back empty.',
  },
  {
    title: "Else pump's fuse out",
    kind: 'plain',
    text: 'Pull the fuse of the else pump, the one for everything but the shower loop.',
  },
  {
    title: "Compressor on the else pump's air port",
    kind: 'plain',
    text:
      "Connect the compressor to the air port by the else pump (the top one), open the port's valve and set " +
      'about 30 psi. Never above 40 to 50.',
  },
  {
    title: 'Blow out the fresh side, one outlet at a time',
    kind: 'plain',
    text:
      'Close every outlet. Take the drinking filter out first (under the right side of the sink, drawer out): a ' +
      'carbon block holds water. Then open one outlet at a time until only air comes, and go round again until ' +
      'nothing comes out anywhere. The shower mixer is on the loop: it gets its air in step 9.',
    checklist: [
      'Drinking filter out',
      'Outdoor shower hot',
      'Outdoor shower cold',
      'Shower fresh fill',
      'Drinking spigot',
      'Sink cold',
      'Sink hot',
      'Outdoor shower hose off and emptied',
    ],
  },
  {
    title: "Recirc pump's fuse out, compressor onto its port",
    kind: 'plain',
    text:
      "Pull the recirc pump's fuse. Move the compressor to the air port by the recirc pump and open its valve, " +
      '30 psi again. Open the shower mixer to the middle and close every other outlet.',
    checklist: ['Recirc fuse out', 'Compressor on the recirc port', 'Shower mixer open', 'Every other outlet closed'],
  },
  {
    title: 'Blow-out, recirc port',
    kind: 'blowout',
    text:
      'Press Start. It cycles Main, Recirc and Flush for the minutes and rounds set, holds the pumps and the UV ' +
      'lamp off, and ends with the water off and Winterized on.',
  },
  {
    title: 'Blow-out, else port',
    kind: 'blowout',
    text:
      "Move the compressor back to the else pump's air port and press Start again; it runs with Winterized on. " +
      'Then open each outlet once more, one at a time, until nothing comes out.',
  },
  {
    title: 'Filters out',
    kind: 'plain',
    text:
      "The drinking filter if it is still in; both inline filters before the pumps, emptied, which drains the " +
      "pumps' suction side; and the three shower housings opened once more and emptied.",
    checklist: ['Drinking filter', "Else pump's inline filter", "Recirc pump's inline filter", 'Shower housings emptied'],
  },
  {
    title: "What air can't clear",
    kind: 'grey',
    text:
      'Empty the P-trap under the sink by hand or with a wet-vac: the A/C condensate and toilet lines join above ' +
      'it, so air escapes up them. Sponge out the shower pan. Dump the grey tank and close the valve once it reads ' +
      'empty. Compressor off, both air-port valves closed. The tank drain stays open.',
    checklist: ['P-trap emptied', 'Shower pan sponged', 'Grey dumped, valve closed', 'Air-port valves closed'],
  },
];

/** An input_datetime's moment in ms, or NaN. */
function datetimeMs(entity: HassEntity | null): number {
  const ts = Number(entity?.attributes?.timestamp);
  return Number.isFinite(ts) && ts > 0 ? ts * 1000 : NaN;
}

/** A sensor's number, or null when it is missing, unknown or unavailable. */
function num(entity: HassEntity | null): number | null {
  if (!entity || entity.state === 'unknown' || entity.state === 'unavailable') return null;
  const n = Number(entity.state);
  return Number.isFinite(n) ? n : null;
}

const pct = (n: number | null) => (n == null ? '—' : `${Math.round(n)} %`);

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

/** A live reading in the walkthrough: a label over a number. */
function Reading({ label, value, on }: { label: string; value: string; on?: boolean }) {
  return (
    <div className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1.5 text-center">
      <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn('text-sm font-semibold tabular-nums', on && 'text-cyan-400')}>{value}</p>
    </div>
  );
}

/** Ticks are the phone's own and start clear at every step (keyed by step). */
function Checklist({ items }: { items: string[] }) {
  const [ticked, setTicked] = useState<boolean[]>([]);
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={item}>
          <label className="flex cursor-pointer items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={ticked[i] ?? false}
              onChange={() =>
                setTicked((t) => {
                  const next = [...t];
                  next[i] = !next[i];
                  return next;
                })
              }
              className="h-4 w-4 accent-cyan-500"
            />
            <span className={cn(ticked[i] && 'text-muted-foreground line-through')}>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

const primaryBtn =
  'w-full rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50';
const quietBtn =
  'rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50';

export function WinterizeCard() {
  const lock = useEntity(WINTERIZED_ID);
  const flag = useEntity(BLOWOUT_RUNNING_ID);
  const script = useEntity(SCRIPT_ID);
  const walkFlag = useEntity(WINTERIZING_ID);
  const stepEntity = useEntity(STEP_ID);
  const drainOn = useEntity(DRAIN_ON_ID);
  const drainOff = useEntity(DRAIN_OFF_ID);
  const status = useEntity(STATUS_ID);
  const stepEnds = useEntity(STEP_ENDS_ID);
  const runEnds = useEntity(RUN_ENDS_ID);
  const minutesEntity = useEntity(MINUTES_ID);
  const roundsEntity = useEntity(ROUNDS_ID);
  const shopMode = useEntity(SHOP_ID);
  const fresh = num(useEntity(FRESH_RAW_ID));
  const grey = num(useEntity(GREY_RAW_ID));
  const masterOn = useEntity(MASTER_ID)?.state === 'on';
  const elsePumpOn = useEntity(ELSE_PUMP_ID)?.state === 'on';
  const recircPumpOn = useEntity(RECIRC_PUMP_ID)?.state === 'on';
  const flushOn = useEntity(MODE_FLUSH_ID)?.state === 'on';
  const dumpOpen = useEntity(DUMP_VALVE_ID)?.state === 'on';
  const call = useService();

  // The flag comes on a moment after the script starts, and the script is
  // already off while a Stop finishes: either one means a run.
  const running = flag?.state === 'on' || script?.state === 'on';
  const locked = lock?.state === 'on';
  const stepRaw = Number(stepEntity?.state);
  const step = Number.isFinite(stepRaw) ? Math.round(stepRaw) : 0;
  const walking = walkFlag?.state === 'on' && step >= 1 && step <= STEPS.length;
  const drainOnRunning = drainOn?.state === 'on';
  const drainOffRunning = drainOff?.state === 'on';

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
  const [pendingWalk, setPendingWalk] = useState(false);
  useEffect(() => {
    if (walking) setPendingWalk(false);
  }, [walking]);
  useEffect(() => {
    if (!pendingWalk) return;
    const id = setTimeout(() => setPendingWalk(false), 5000);
    return () => clearTimeout(id);
  }, [pendingWalk]);

  // Turning Winterized off lets the water come on again: it asks first
  const [confirmingOff, setConfirmingOff] = useState(false);
  useEffect(() => {
    if (!locked || running) setConfirmingOff(false);
  }, [locked, running]);
  // So do "Drained" while the tank still reads water, and stopping the walkthrough
  const [confirmingDrained, setConfirmingDrained] = useState(false);
  const [confirmingStop, setConfirmingStop] = useState(false);
  useEffect(() => {
    setConfirmingDrained(false);
    setConfirmingStop(false);
  }, [step, walking]);

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
  const lockedAt = lock.last_changed ? Date.parse(lock.last_changed) : NaN;

  const setNumber = (entityId: string, value: number, min: number, max: number) =>
    call('input_number', 'set_value', { value: Math.min(max, Math.max(min, value)) }, { entity_id: entityId });
  // turn_on returns at once; calling a script itself would hold the call
  // open for the whole run
  const runScript = (entityId: string) => call('script', 'turn_on', undefined, { entity_id: entityId });
  const start = () => {
    setPending(true);
    runScript(SCRIPT_ID);
  };
  const stop = () => runScript(STOP_SCRIPT_ID);
  const setLock = (on: boolean) =>
    call('input_boolean', on ? 'turn_on' : 'turn_off', undefined, { entity_id: WINTERIZED_ID });
  const setStep = (n: number) => setNumber(STEP_ID, n, 0, STEPS.length);
  const startWalk = () => {
    setPendingWalk(true);
    runScript(START_WALK_ID);
  };
  const setDump = (open: boolean) =>
    call('switch', open ? 'turn_on' : 'turn_off', undefined, { entity_id: DUMP_VALVE_ID });

  const blowoutRunning = (
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
        The pumps and the UV lamp are held off. Stop, or the end of the last round, puts the valves back to Main,
        switches the water off and turns Winterized on.
      </p>
    </>
  );

  const blowoutControls = (label: string, note: boolean) => (
    <>
      <p className="text-sm font-medium">{label}</p>
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
      {note && (
        <p className="text-[11px] leading-snug text-muted-foreground">
          Before you start: both pump fuses out, the compressor on a pump&apos;s air port at about 30 psi, the
          shower mixer open. It cycles Main, Recirc and Flush so the air reaches every line.
        </p>
      )}
      <button onClick={start} disabled={shopModeOn || pending} className={primaryBtn}>
        {pending ? 'Starting…' : `Start blow-out · ${totalMin} min`}
      </button>
      {shopModeOn && (
        <p className="text-[11px] leading-snug text-amber-400">Disarm Shop Mode first: it holds the water off.</p>
      )}
      {statusText && (
        <p className="text-[11px] leading-snug text-muted-foreground">
          Last run: {statusText}
          {Number.isFinite(statusAt) &&
            ` · ${new Date(statusAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`}
        </p>
      )}
    </>
  );

  const greyDumpRow = (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">Grey dump valve</p>
        <p className="text-[11px] text-muted-foreground">
          Grey tank <span className="font-semibold tabular-nums text-foreground">{pct(grey)}</span>
          {dumpOpen && ' · dumping'}
        </p>
      </div>
      <Switch aria-label="Grey dump valve" checked={dumpOpen} onCheckedChange={setDump} />
    </div>
  );

  if (walking) {
    const current = STEPS[step - 1];
    const busy = running || drainOnRunning || drainOffRunning;
    const drained = () => {
      if (fresh != null && fresh > FRESH_EMPTY_PCT && !confirmingDrained) {
        setConfirmingDrained(true);
        return;
      }
      setConfirmingDrained(false);
      setStep(2);
    };
    return (
      <Card className="border-cyan-500/50 bg-cyan-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Snowflake className="h-4 w-4 text-cyan-400" />
            Winterize
            <span className="ml-auto rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
              Step {step} of {STEPS.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={((step - 1) / STEPS.length) * 100} indicatorClassName="bg-cyan-500" />
          <p className="text-sm font-medium">{current.title}</p>
          <p className="text-xs leading-snug text-muted-foreground">{current.text}</p>
          {current.checklist && <Checklist key={step} items={current.checklist} />}

          {running ? (
            blowoutRunning
          ) : current.kind === 'drain' ? (
            <>
              <div className="flex gap-2">
                <Reading label="Fresh tank" value={pct(fresh)} on={fresh != null && fresh <= FRESH_EMPTY_PCT} />
              </div>
              {confirmingDrained ? (
                <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5">
                  <p className="text-[11px] leading-snug text-amber-300">
                    It still reads {pct(fresh)}. The sender reads 0 % once the float is down. Drained anyway?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={drained}
                      className="flex-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                    >
                      Yes, drained
                    </button>
                    <button onClick={() => setConfirmingDrained(false)} className={quietBtn}>
                      Not yet
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={drained} className={primaryBtn}>
                  Drained
                </button>
              )}
            </>
          ) : current.kind === 'flush' ? (
            <>
              <div className="flex gap-2">
                <Reading label="Water" value={masterOn ? (flushOn ? 'On · Flush' : 'On') : 'Off'} on={masterOn} />
                <Reading label="Else pump" value={elsePumpOn ? 'Running' : 'Off'} on={elsePumpOn} />
                <Reading label="Recirc pump" value={recircPumpOn ? 'Running' : 'Off'} on={recircPumpOn} />
                <Reading label="Grey tank" value={pct(grey)} />
              </div>
              {grey != null && grey > GREY_FULL_PCT && (
                <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5">
                  <p className="text-[11px] leading-snug text-amber-300">
                    The grey tank is nearly full and the flush drains into it. Dump it first.
                  </p>
                  {greyDumpRow}
                </div>
              )}
              <button
                onClick={() => runScript(DRAIN_ON_ID)}
                disabled={busy || (masterOn && flushOn)}
                className={primaryBtn}
              >
                {drainOnRunning ? 'Starting…' : masterOn && flushOn ? 'The water is on in Flush' : 'Water on in Flush'}
              </button>
              <button onClick={() => runScript(DRAIN_OFF_ID)} disabled={busy} className={primaryBtn}>
                {drainOffRunning ? 'Switching off…' : 'They only spit · water off'}
              </button>
            </>
          ) : current.kind === 'blowout' ? (
            blowoutControls('Blow-out', false)
          ) : current.kind === 'grey' ? (
            greyDumpRow
          ) : null}

          <div className="flex gap-2">
            <button
              aria-label="Back"
              onClick={() => setStep(step - 1)}
              disabled={step <= 1 || busy}
              className={cn(quietBtn, 'flex items-center gap-1')}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            {current.kind === 'grey' ? (
              <button onClick={() => runScript(FINISH_WALK_ID)} disabled={busy} className={primaryBtn}>
                Done
              </button>
            ) : current.kind === 'plain' || current.kind === 'blowout' ? (
              <button onClick={() => setStep(step + 1)} disabled={busy} className={primaryBtn}>
                Next
              </button>
            ) : null}
          </div>

          {confirmingStop ? (
            <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5">
              <p className="text-[11px] leading-snug text-amber-300">
                Stop the walkthrough? The water goes off and it starts from step 1 next time.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => runScript(STOP_WALK_ID)}
                  className="flex-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                >
                  Stop
                </button>
                <button onClick={() => setConfirmingStop(false)} className={quietBtn}>
                  Keep going
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingStop(true)}
              disabled={running}
              className="w-full text-center text-[11px] text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
            >
              Stop winterizing
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

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
              {locked && Number.isFinite(lockedAt)
                ? `Since ${new Date(lockedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}. `
                : ''}
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
              <button onClick={() => setConfirmingOff(false)} className={quietBtn}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="border-t" />

        {running ? (
          blowoutRunning
        ) : (
          <>
            {!locked && (
              <>
                <p className="text-sm font-medium">Winterize for the winter</p>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  {STEPS.length} steps, the fresh tank first. The card says what to do and does the water part.
                </p>
                <button onClick={startWalk} disabled={pendingWalk || stepEntity == null} className={primaryBtn}>
                  {pendingWalk ? 'Starting…' : 'Start winterizing'}
                </button>
                <div className="border-t" />
              </>
            )}
            {blowoutControls(locked ? 'Blow-out' : 'Blow-out only', true)}
          </>
        )}
      </CardContent>
    </Card>
  );
}
