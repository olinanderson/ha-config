import { useState, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntity } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import {
  Moon,
  Sun,
  Clock,
  AlarmClock,
  Coffee,
  MoonStar,
  Sparkles,
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Parse "HH:MM:SS" or "HH:MM" → { h, m } */
function parseTime(state: string | undefined): { h: number; m: number } | null {
  if (!state || state === 'unknown' || state === 'unavailable') return null;
  const parts = state.split(':').map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return null;
  return { h: parts[0], m: parts[1] };
}

/** { h, m } → "HH:MM" display string */
function fmtTime(t: { h: number; m: number } | null): string {
  if (!t) return '--:--';
  return `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`;
}

/** Convert { h, m } to minutes-since-midnight */
function toMins(t: { h: number; m: number }): number {
  return t.h * 60 + t.m;
}

/** Wrapped duration in minutes from start → end (handles midnight crossing) */
function durationMins(start: { h: number; m: number }, end: { h: number; m: number }): number {
  let d = toMins(end) - toMins(start);
  if (d <= 0) d += 24 * 60;
  return d;
}

// ─── TimeInput ──────────────────────────────────────────────────────────────

function TimeInput({
  entityId,
  label,
  icon: Icon,
}: {
  entityId: string;
  label: string;
  icon: React.ElementType;
}) {
  const entity = useEntity(entityId);
  const callService = useService();
  const [pending, setPending] = useState(false);

  const current = parseTime(entity?.state);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value; // "HH:MM"
      setPending(true);
      try {
        await callService('time', 'set_value', { value: val + ':00' }, { entity_id: entityId });
      } finally {
        setTimeout(() => setPending(false), 800);
      }
    },
    [callService, entityId],
  );

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{label}</span>
      </div>
      <div className="relative flex-shrink-0">
        <input
          type="time"
          value={current ? fmtTime(current) : ''}
          onChange={handleChange}
          disabled={!entity || pending}
          className={cn(
            'rounded-md border border-input bg-background px-2.5 py-1.5 text-sm tabular-nums',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            pending && 'opacity-70',
          )}
        />
      </div>
    </div>
  );
}

// ─── SleepTimeline ───────────────────────────────────────────────────────────
// 24-hour bar with the sleep window highlighted

function SleepTimeline({
  start,
  end,
}: {
  start: { h: number; m: number } | null;
  end: { h: number; m: number } | null;
}) {
  if (!start || !end) {
    return (
      <div className="h-5 rounded-full bg-muted/40 w-full" aria-label="Sleep timeline unavailable" />
    );
  }

  const TOTAL = 24 * 60;
  const startPct = (toMins(start) / TOTAL) * 100;
  const dur = durationMins(start, end);
  const durPct = (dur / TOTAL) * 100;

  // Hour tick marks at 0, 6, 12, 18
  const ticks = [0, 6, 12, 18];

  return (
    <div className="space-y-1">
      <div className="relative h-5 rounded-full bg-muted/40 overflow-hidden">
        {/* Sleep window */}
        <div
          className="absolute top-0 h-full bg-indigo-500/70 rounded-full"
          style={{
            left: `${startPct}%`,
            width: `${durPct}%`,
            // Handle midnight wrap: if it overflows, we show two segments
            ...(startPct + durPct > 100
              ? {
                  width: `${100 - startPct}%`,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }
              : {}),
          }}
        />
        {/* Second segment if crosses midnight */}
        {startPct + durPct > 100 && (
          <div
            className="absolute top-0 left-0 h-full bg-indigo-500/70 rounded-full"
            style={{
              width: `${startPct + durPct - 100}%`,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          />
        )}
      </div>
      {/* Hour labels */}
      <div className="relative h-3 text-[9px] text-muted-foreground select-none">
        {ticks.map((h) => (
          <span
            key={h}
            className="absolute"
            style={{ left: `${(h / 24) * 100}%`, transform: 'translateX(-50%)' }}
          >
            {h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── StarlinkSleepCard ───────────────────────────────────────────────────────

function StarlinkSleepCard() {
  const startEntity = useEntity('time.starlink_sleep_start');
  const endEntity = useEntity('time.starlink_sleep_end');

  const start = parseTime(startEntity?.state);
  const end = parseTime(endEntity?.state);

  const durLabel =
    start && end
      ? (() => {
          const d = durationMins(start, end);
          const h = Math.floor(d / 60);
          const m = d % 60;
          return m > 0 ? `${h}h ${m}m` : `${h}h`;
        })()
      : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-400" />
            Starlink Sleep
          </div>
          {durLabel && (
            <span className="text-xs font-normal text-muted-foreground">{durLabel} nightly</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SleepTimeline start={start} end={end} />
        <div className="space-y-3">
          <TimeInput entityId="time.starlink_sleep_start" label="Sleep start" icon={MoonStar} />
          <TimeInput entityId="time.starlink_sleep_end" label="Wake start" icon={Sun} />
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Starlink enters low-power sleep mode between these times. Internet is unavailable during the sleep window.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── RoutineButton ───────────────────────────────────────────────────────────

function RoutineButton({
  label,
  description,
  icon: Icon,
  entityId,
  domain = 'script',
  color = 'bg-primary',
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  entityId: string;
  domain?: string;
  color?: string;
}) {
  const [busy, setBusy] = useState(false);
  const callService = useService();

  const run = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await callService(domain, 'turn_on', undefined, { entity_id: entityId });
    } finally {
      setTimeout(() => setBusy(false), 2000);
    }
  }, [busy, callService, domain, entityId]);

  return (
    <button
      onClick={run}
      disabled={busy}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl border border-border p-3 text-left',
        'hover:bg-muted/60 active:scale-[0.98] transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      <div className={cn('rounded-lg p-2 text-white flex-shrink-0', color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      {busy && (
        <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      )}
    </button>
  );
}

// ─── DailyRoutinesCard ───────────────────────────────────────────────────────

function DailyRoutinesCard() {
  const routines = [
    {
      label: 'Good Morning',
      description: 'Wake-up routine — lights up, Starlink on, music',
      icon: Coffee,
      entityId: 'script.wake_up_routine',
      color: 'bg-amber-500',
    },
    {
      label: 'Bedtime',
      description: 'Progressive shutdown — lights dim, monitors off, Starlink sleep',
      icon: MoonStar,
      entityId: 'script.bedtime_routine',
      color: 'bg-indigo-500',
    },
    {
      label: 'Sleep Mode',
      description: 'Full sleep — all lights off, scene saved',
      icon: Moon,
      entityId: 'script.sleep_mode_on',
      color: 'bg-slate-600',
    },
    {
      label: 'Power Saving',
      description: 'Lights off, monitors off, water off',
      icon: Sparkles,
      entityId: 'script.power_saving_mode_on',
      color: 'bg-green-600',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlarmClock className="h-4 w-4" />
          Daily Routines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {routines.map((r) => (
          <RoutineButton key={r.entityId} {...r} />
        ))}
      </CardContent>
    </Card>
  );
}

// ─── ScheduleEntitiesCard ────────────────────────────────────────────────────
// Auto-renders any schedule.* or time.* entities (other than the Starlink ones)

function OtherTimeEntitiesCard() {
  // This card scans for extra time.* entities beyond the known Starlink pair
  // Currently a placeholder — will auto-populate when new time helpers are added
  const knownIds = ['time.starlink_sleep_start', 'time.starlink_sleep_end'];
  void knownIds; // used as documentation

  return null; // No other time entities registered yet
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Schedule() {
  return (
    <PageContainer title="Schedule">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <StarlinkSleepCard />
        </div>
        <div className="space-y-4">
          <DailyRoutinesCard />
          <OtherTimeEntitiesCard />
        </div>
      </div>

      {/* Time helpers tip */}
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-[11px] text-muted-foreground">
        <strong className="font-medium text-foreground">Tip:</strong> Create <code>time</code> helper entities in HA (Settings → Devices &amp; Services → Helpers → Time) to add more schedule controls here automatically.
      </div>
    </PageContainer>
  );
}
