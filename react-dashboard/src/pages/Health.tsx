import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SparklineStat } from '@/components/ClickableValue';
import { Sparkline, HistoryChart } from '@/components/Chart';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useHistory } from '@/hooks/useHistory';
import { useStatistics } from '@/hooks/useStatistics';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { cn, fmt, timeAgo } from '@/lib/utils';
import {
  HeartPulse,
  Heart,
  Wind,
  Droplets,
  Activity,
  Footprints,
  Flame,
  Moon,
  Bed,
  Scale,
  Percent,
  Dumbbell,
  Gauge,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

/* ── Entity map (resolved live against HA) ────────────────────────────
 * Vitals / activity / sleep live on the "Apple Watch Ultra" device
 * (long prefix). Body-composition sensors have no device block (short id).
 */
const E = {
  hr: 'sensor.apple_watch_ultra_apple_watch_heart_rate',
  restingHr: 'sensor.apple_watch_ultra_apple_watch_resting_heart_rate',
  hrv: 'sensor.apple_watch_ultra_apple_watch_heart_rate_variability',
  resp: 'sensor.apple_watch_ultra_apple_watch_respiratory_rate',
  spo2: 'sensor.apple_watch_ultra_apple_watch_blood_oxygen',
  steps: 'sensor.apple_watch_ultra_apple_watch_steps_today',
  energy: 'sensor.apple_watch_ultra_apple_watch_active_energy_today',
  sleepAsleep: 'sensor.apple_watch_ultra_apple_watch_sleep_asleep',
  sleepDeep: 'sensor.apple_watch_ultra_apple_watch_sleep_deep',
  sleepRem: 'sensor.apple_watch_ultra_apple_watch_sleep_rem',
  sleepCore: 'sensor.apple_watch_ultra_apple_watch_sleep_core',
  sleepInBed: 'sensor.apple_watch_ultra_apple_watch_sleep_in_bed',
  sleepStart: 'sensor.apple_watch_ultra_apple_watch_sleep_start',
  sleepEnd: 'sensor.apple_watch_ultra_apple_watch_sleep_end',
  sleepScore: 'sensor.apple_watch_ultra_apple_watch_sleep_score',
  weight: 'sensor.apple_watch_weight',
  bodyFat: 'sensor.apple_watch_body_fat',
  bmi: 'sensor.apple_watch_bmi',
  leanMass: 'sensor.apple_watch_lean_body_mass',
} as const;

/* Activity goals — tweak to match your Apple Watch rings */
const STEP_GOAL = 10_000;
const ENERGY_GOAL = 600; // kcal (Move ring)

/* ── small helpers ─────────────────────────────────────────────────── */

const v = (n: number | null | undefined) => n ?? 0;

/** Hours (float) → "7h 48m" */
function hm(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return '0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Parse HAE sleep timestamp "2026-06-04 08:25:17 -0600" → Date */
function parseTime(s: string | undefined | null): Date | null {
  if (!s) return null;
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})\s*([+-]\d{2}):?(\d{2})/);
  if (m) {
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${m[7]}:${m[8]}`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

const clockFmt = (d: Date) =>
  d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

function bmiInfo(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
  if (bmi < 25) return { label: 'Normal', color: '#22c55e' };
  if (bmi < 30) return { label: 'Overweight', color: '#f59e0b' };
  return { label: 'Obese', color: '#ef4444' };
}

function scoreColor(s: number): string {
  if (s >= 85) return '#22c55e';
  if (s >= 70) return '#84cc16';
  if (s >= 50) return '#f59e0b';
  return '#ef4444';
}

/* ── Circular progress ring ────────────────────────────────────────── */

function Ring({
  value,
  goal,
  label,
  display,
  unit,
  color,
  icon: Icon,
}: {
  value: number;
  goal: number;
  label: string;
  display: string;
  unit: string;
  color: string;
  icon: LucideIcon;
}) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / goal));
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[88px] w-[88px]">
        <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="currentColor" className="text-muted" strokeWidth={8} />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="h-4 w-4 mb-0.5" style={{ color }} />
          <span className="text-base font-bold tabular-nums leading-none">{display}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">{label}</p>
      <p className="text-[10px] text-muted-foreground/70 tabular-nums">
        {Math.round(pct * 100)}% of {goal.toLocaleString()}{unit}
      </p>
    </div>
  );
}

/* ── Glance bar ────────────────────────────────────────────────────── */

function Chip({
  label,
  value,
  color,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: string;
  color: string;
  icon: LucideIcon;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-card px-3 py-2 min-w-[6.5rem] text-left transition-colors',
        onClick && 'hover:bg-accent active:bg-accent/80 cursor-pointer',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', color)} />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-semibold tabular-nums truncate">{value}</p>
      </div>
    </button>
  );
}

function GlanceBar() {
  const { value: hr } = useEntityNumeric(E.hr);
  const { value: resting } = useEntityNumeric(E.restingHr);
  const { value: hrv } = useEntityNumeric(E.hrv);
  const { value: spo2 } = useEntityNumeric(E.spo2);
  const { value: score } = useEntityNumeric(E.sleepScore);
  const { value: steps } = useEntityNumeric(E.steps);
  const { value: energy } = useEntityNumeric(E.energy);
  const { value: weight } = useEntityNumeric(E.weight);
  const { value: fat } = useEntityNumeric(E.bodyFat);
  const { open } = useHistoryDialog();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Chip label="Heart Rate" value={`${fmt(hr, 0)} bpm`} color="text-rose-500" icon={HeartPulse} onClick={() => open(E.hr, 'Heart Rate', 'bpm')} />
      <Chip label="Resting HR" value={`${fmt(resting, 0)} bpm`} color="text-red-400" icon={Heart} onClick={() => open(E.restingHr, 'Resting Heart Rate', 'bpm')} />
      <Chip label="HRV" value={`${fmt(hrv, 0)} ms`} color="text-violet-500" icon={Activity} onClick={() => open(E.hrv, 'Heart Rate Variability', 'ms')} />
      <Chip label="SpO₂" value={`${fmt(spo2, 0)}%`} color="text-cyan-500" icon={Droplets} onClick={() => open(E.spo2, 'Blood Oxygen', '%')} />
      <Chip label="Sleep" value={`${fmt(score, 0)}`} color="text-indigo-500" icon={Moon} onClick={() => open(E.sleepScore, 'Sleep Score', '/100')} />
      <Chip label="Steps" value={steps != null ? Math.round(steps).toLocaleString() : '—'} color="text-green-500" icon={Footprints} onClick={() => open(E.steps, 'Steps', 'steps')} />
      <Chip label="Energy" value={`${fmt(energy, 0)} kcal`} color="text-orange-500" icon={Flame} onClick={() => open(E.energy, 'Active Energy', 'kcal')} />
      <Chip label="Weight" value={`${fmt(weight, 1)} lb`} color="text-blue-500" icon={Scale} onClick={() => open(E.weight, 'Weight', 'lb')} />
      <Chip label="Body Fat" value={`${fmt(fat, 1)}%`} color="text-amber-500" icon={Percent} onClick={() => open(E.bodyFat, 'Body Fat', '%')} />
    </div>
  );
}

/* ── Vitals ────────────────────────────────────────────────────────── */

function VitalsCard() {
  const { value: hr, entity } = useEntityNumeric(E.hr);
  const { value: resting } = useEntityNumeric(E.restingHr);
  const { value: hrv } = useEntityNumeric(E.hrv);
  const { value: resp } = useEntityNumeric(E.resp);
  const { value: spo2 } = useEntityNumeric(E.spo2);
  const { data: hrHistory } = useHistory(E.hr, 6);
  const { open } = useHistoryDialog();

  const hrColor = (hr ?? 0) >= 120 ? 'text-rose-600' : (hr ?? 0) >= 100 ? 'text-orange-500' : 'text-rose-500';
  const updated = entity?.last_updated || entity?.last_changed;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <HeartPulse className="h-4 w-4 text-rose-500" />
          Vitals
          {updated && <span className="ml-auto text-[10px] font-normal text-muted-foreground">{timeAgo(updated)}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Live heart-rate hero */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-1 transition-colors"
          onClick={() => open(E.hr, 'Heart Rate', 'bpm')}
        >
          <Heart className={cn('h-9 w-9 shrink-0 animate-pulse', hrColor)} fill="currentColor" />
          <div className="leading-none">
            <span className={cn('text-4xl font-bold tabular-nums', hrColor)}>{fmt(hr, 0)}</span>
            <span className="text-sm text-muted-foreground ml-1">bpm</span>
          </div>
          <Sparkline data={hrHistory} color="#f43f5e" width={120} height={36} className="ml-auto" />
        </div>

        <div className="grid gap-1">
          <SparklineStat entityId={E.restingHr} label="Resting HR" value={fmt(resting, 0)} unit="bpm" color="#ef4444" icon={Heart} />
          <SparklineStat entityId={E.hrv} label="HRV" value={fmt(hrv, 0)} unit="ms" color="#8b5cf6" icon={Activity} />
          <SparklineStat entityId={E.resp} label="Respiratory" value={fmt(resp, 1)} unit="br/min" color="#14b8a6" icon={Wind} />
          <SparklineStat entityId={E.spo2} label="Blood Oxygen" value={fmt(spo2, 0)} unit="%" color="#06b6d4" icon={Droplets} />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Activity ──────────────────────────────────────────────────────── */

function ActivityCard() {
  const { value: steps } = useEntityNumeric(E.steps);
  const { value: energy } = useEntityNumeric(E.energy);
  const { data: stepHist } = useHistory(E.steps, 24);
  const { data: energyHist } = useHistory(E.energy, 24);
  const { open } = useHistoryDialog();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-green-500" />
          Activity Today
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="cursor-pointer" onClick={() => open(E.steps, 'Steps', 'steps')}>
            <Ring
              value={v(steps)}
              goal={STEP_GOAL}
              label="Steps"
              display={steps != null ? Math.round(steps).toLocaleString() : '—'}
              unit=""
              color="#22c55e"
              icon={Footprints}
            />
          </div>
          <div className="cursor-pointer" onClick={() => open(E.energy, 'Active Energy', 'kcal')}>
            <Ring
              value={v(energy)}
              goal={ENERGY_GOAL}
              label="Active Energy"
              display={fmt(energy, 0)}
              unit=" kcal"
              color="#f97316"
              icon={Flame}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Sparkline data={stepHist} color="#22c55e" width={140} height={28} className="w-full" onClick={() => open(E.steps, 'Steps', 'steps')} />
          <Sparkline data={energyHist} color="#f97316" width={140} height={28} className="w-full" onClick={() => open(E.energy, 'Active Energy', 'kcal')} />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Sleep ─────────────────────────────────────────────────────────── */

function SleepCard() {
  const { value: asleep } = useEntityNumeric(E.sleepAsleep);
  const { value: deep } = useEntityNumeric(E.sleepDeep);
  const { value: core } = useEntityNumeric(E.sleepCore);
  const { value: rem } = useEntityNumeric(E.sleepRem);
  const { value: inBed } = useEntityNumeric(E.sleepInBed);
  const { value: score } = useEntityNumeric(E.sleepScore);
  const startEnt = useEntity(E.sleepStart);
  const endEnt = useEntity(E.sleepEnd);
  const { open } = useHistoryDialog();

  const awake = Math.max(v(inBed) - v(asleep), 0);
  const segs = [
    { label: 'Deep', value: v(deep), color: '#4338ca' },
    { label: 'Core', value: v(core), color: '#3b82f6' },
    { label: 'REM', value: v(rem), color: '#22d3ee' },
    { label: 'Awake', value: awake, color: '#94a3b8' },
  ];
  const total = segs.reduce((s, x) => s + x.value, 0) || 1;

  const bed = parseTime(startEnt?.state);
  const wake = parseTime(endEnt?.state);
  const sc = v(score);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Moon className="h-4 w-4 text-indigo-400" />
          Last Night
          <Badge
            className="ml-auto text-[11px] font-bold border-transparent text-white"
            style={{ backgroundColor: scoreColor(sc) }}
          >
            {sc > 0 ? `${Math.round(sc)} / 100` : '—'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Asleep total + bedtime/wake */}
        <div className="flex items-end justify-between">
          <div
            className="cursor-pointer hover:bg-muted/50 rounded-lg p-1 -m-1 transition-colors"
            onClick={() => open(E.sleepAsleep, 'Asleep', 'h')}
          >
            <p className="text-3xl font-bold tabular-nums leading-none">{hm(v(asleep))}</p>
            <p className="text-[10px] text-muted-foreground mt-1">asleep</p>
          </div>
          {bed && wake && (
            <div className="text-right text-xs text-muted-foreground">
              <p className="flex items-center justify-end gap-1">
                <Bed className="h-3.5 w-3.5" /> {clockFmt(bed)}
              </p>
              <p className="flex items-center justify-end gap-1 mt-1">
                <Moon className="h-3.5 w-3.5" /> {clockFmt(wake)}
              </p>
            </div>
          )}
        </div>

        {/* Stacked stage bar */}
        <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted">
          {segs.map((s) => (
            <div
              key={s.label}
              style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
              title={`${s.label}: ${hm(s.value)}`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {segs.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-muted-foreground">{s.label}</span>
              <span className="ml-auto font-medium tabular-nums">{hm(s.value)}</span>
              <span className="text-muted-foreground/60 tabular-nums w-9 text-right">
                {Math.round((s.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>

        <div className="grid gap-1 pt-1">
          <SparklineStat entityId={E.sleepDeep} label="Deep (7d)" value={hm(v(deep))} unit="" color="#4338ca" hours={168} />
          <SparklineStat entityId={E.sleepCore} label="Core (7d)" value={hm(v(core))} unit="" color="#3b82f6" hours={168} />
          <SparklineStat entityId={E.sleepRem} label="REM (7d)" value={hm(v(rem))} unit="" color="#22d3ee" hours={168} />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Body composition ──────────────────────────────────────────────── */

function BmiScale({ bmi }: { bmi: number }) {
  // scale spans BMI 15 → 40
  const lo = 15;
  const hi = 40;
  const pos = Math.max(0, Math.min(1, (bmi - lo) / (hi - lo))) * 100;
  return (
    <div className="pt-1">
      <div
        className="relative h-2.5 w-full rounded-full"
        style={{
          background:
            'linear-gradient(to right, #3b82f6 0% 14%, #22c55e 14% 40%, #f59e0b 40% 60%, #ef4444 60% 100%)',
        }}
      >
        <div
          className="absolute -top-1 w-1.5 -translate-x-1/2 rounded-full bg-foreground border-2 border-background shadow"
          style={{ left: `${pos}%`, height: '1.1rem' }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground/70 mt-0.5">
        <span>15</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>40</span>
      </div>
    </div>
  );
}

function BodyCompositionCard() {
  const { value: weight } = useEntityNumeric(E.weight);
  const { value: fat } = useEntityNumeric(E.bodyFat);
  const { value: bmi } = useEntityNumeric(E.bmi);
  const { value: lean } = useEntityNumeric(E.leanMass);
  const { data: weightHist } = useHistory(E.weight, 720); // 30d
  const { open } = useHistoryDialog();

  const fatMass = v(weight) * (v(fat) / 100);
  const leanMass = lean != null ? lean : Math.max(v(weight) - fatMass, 0);
  const compTotal = fatMass + leanMass || 1;
  const bi = bmiInfo(v(bmi));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="h-4 w-4 text-blue-500" />
          Body Composition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weight hero + 30d trend */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-1 -m-1 transition-colors"
          onClick={() => open(E.weight, 'Weight', 'lb')}
        >
          <div className="leading-none">
            <span className="text-4xl font-bold tabular-nums">{fmt(weight, 1)}</span>
            <span className="text-sm text-muted-foreground ml-1">lb</span>
          </div>
          <Sparkline data={weightHist} color="#3b82f6" width={120} height={36} className="ml-auto" />
        </div>

        {/* BMI */}
        <div
          className="cursor-pointer hover:bg-muted/50 rounded-lg p-1 -m-1 transition-colors"
          onClick={() => open(E.bmi, 'BMI', 'kg/m²')}
        >
          <div className="flex items-baseline gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground self-center" />
            <span className="text-2xl font-bold tabular-nums">{fmt(bmi, 1)}</span>
            <span className="text-xs text-muted-foreground">BMI</span>
            <span className="ml-auto text-sm font-semibold" style={{ color: bi.color }}>
              {bi.label}
            </span>
          </div>
          <BmiScale bmi={v(bmi)} />
        </div>

        {/* Fat vs lean composition */}
        <div>
          <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted">
            <div style={{ width: `${(leanMass / compTotal) * 100}%`, backgroundColor: '#22c55e' }} title={`Lean: ${fmt(leanMass, 1)} lb`} />
            <div style={{ width: `${(fatMass / compTotal) * 100}%`, backgroundColor: '#f59e0b' }} title={`Fat: ${fmt(fatMass, 1)} lb`} />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center gap-1.5" role="button" onClick={() => open(E.leanMass, 'Lean Body Mass', 'lb')}>
              <Dumbbell className="h-3.5 w-3.5 text-green-500" />
              <span className="text-muted-foreground">Lean</span>
              <span className="font-medium tabular-nums">{fmt(leanMass, 1)} lb</span>
            </div>
            <div className="flex items-center gap-1.5" role="button" onClick={() => open(E.bodyFat, 'Body Fat', '%')}>
              <Percent className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-muted-foreground">Fat</span>
              <span className="font-medium tabular-nums">{fmt(fat, 1)}%</span>
              <span className="text-muted-foreground/60 tabular-nums">({fmt(fatMass, 1)} lb)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Trends (interactive multi-metric chart) ──────────────────────────── */

interface TrendMetric {
  key: string;
  label: string;
  id: string;
  unit: string;
  color: string;
  ranges: { label: string; hours: number }[];
}

const VITAL_RANGES = [
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
  { label: '30d', hours: 720 },
];
const BODY_RANGES = [
  { label: '7d', hours: 168 },
  { label: '30d', hours: 720 },
  { label: '90d', hours: 2160 },
];

const TREND_METRICS: TrendMetric[] = [
  { key: 'weight', label: 'Weight', id: E.weight, unit: 'lb', color: '#3b82f6', ranges: BODY_RANGES },
  { key: 'bodyFat', label: 'Body Fat', id: E.bodyFat, unit: '%', color: '#f59e0b', ranges: BODY_RANGES },
  { key: 'restingHr', label: 'Resting HR', id: E.restingHr, unit: 'bpm', color: '#ef4444', ranges: VITAL_RANGES },
  { key: 'hrv', label: 'HRV', id: E.hrv, unit: 'ms', color: '#8b5cf6', ranges: VITAL_RANGES },
  { key: 'sleepScore', label: 'Sleep Score', id: E.sleepScore, unit: '', color: '#6366f1', ranges: BODY_RANGES },
  { key: 'spo2', label: 'SpO₂', id: E.spo2, unit: '%', color: '#06b6d4', ranges: VITAL_RANGES },
];

function TrendsCard() {
  const [metricKey, setMetricKey] = useState('weight');
  const metric = TREND_METRICS.find((m) => m.key === metricKey) ?? TREND_METRICS[0];
  const [hours, setHours] = useState(metric.ranges[1].hours);

  // Pull both sources: states history (granular, but purged after ~10 days)
  // and long-term statistics (retained forever, holds imported/backfilled
  // history like the weight series). Show whichever has the richer series —
  // statistics wins for weight & long ranges; history keeps vitals granular.
  const period = hours <= 48 ? 'hour' : 'day';
  const stats = useStatistics(metric.id, hours, period);
  const hist = useHistory(metric.id, hours);
  const useStats = stats.data.length > hist.data.length;
  const data = useStats ? stats.data : hist.data;
  const loading = useStats ? stats.loading : hist.loading && hist.data.length === 0;

  const selectMetric = (m: TrendMetric) => {
    setMetricKey(m.key);
    // snap range to this metric's middle option
    setHours(m.ranges[1].hours);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Metric selector */}
        <div className="flex flex-wrap gap-1.5">
          {TREND_METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => selectMetric(m)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                m.key === metricKey
                  ? 'text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
              style={m.key === metricKey ? { backgroundColor: m.color } : undefined}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Range selector */}
        <div className="flex gap-1">
          {metric.ranges.map((r) => (
            <button
              key={r.label}
              onClick={() => setHours(r.hours)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                hours === r.hours
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="min-h-[260px] flex items-center justify-center">
          {loading ? (
            <div className="text-sm text-muted-foreground animate-pulse">Loading history…</div>
          ) : data.length < 2 ? (
            <div className="text-sm text-muted-foreground text-center px-4">
              Not enough history yet for {metric.label.toLowerCase()} over this range.
              <br />
              <span className="text-xs text-muted-foreground/70">
                Body metrics fill in as you weigh in; vitals build up over time.
              </span>
            </div>
          ) : (
            <HistoryChart data={data} unit={metric.unit} color={metric.color} height={280} trend />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */

export default function Health() {
  const hrEnt = useEntity(E.hr);
  const updated = hrEnt?.last_updated || hrEnt?.last_changed;

  return (
    <PageContainer title="Health" subtitle={updated ? `synced ${timeAgo(updated)}` : undefined}>
      <GlanceBar />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-4">
          <VitalsCard />
          <ActivityCard />
        </div>
        <div className="space-y-4">
          <SleepCard />
        </div>
        <div className="space-y-4">
          <BodyCompositionCard />
        </div>
      </div>
      <TrendsCard />
    </PageContainer>
  );
}
