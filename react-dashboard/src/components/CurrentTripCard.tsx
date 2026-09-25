/**
 * CurrentTripCard — a LIVE trip-computer glance, updating ~1 Hz while driving.
 *
 * Driven entirely by live Home Assistant entities (no batch GPS pipeline). All
 * trip stats count ONLY while the van is moving, so idling (red lights, or a
 * 1-2 h battery-charge idle) never skews them:
 *   • sensor.live_trip_distance      — moving odometer delta since trip start (km)
 *   • sensor.live_trip_fuel          — MOVING fuel delta since trip start (L)
 *   • sensor.live_trip_drive_seconds — driving time (moving seconds) this trip
 *   • sensor.live_trip_economy       — moving fuel ÷ distance (L/100km), once ≥0.1 km
 *   • sensor.live_trip_idle_fuel     — fuel burned while NOT moving (shown apart)
 * These push from the websocket as they change (~1 Hz under way) and freeze when
 * stopped, so the card refreshes effectively every ~0.1 km and never counts idle.
 *
 * A new trip is started (baselines reset) when the van moves again after being
 * NOT MOVING longer than input_number.trip_split_minutes — so shorter 5-30 min
 * stops stay grouped, but a long charge-idle is its own boundary.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Route, MapPin, Clock, Fuel, Gauge, Building2, Milestone, Info, Sigma } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fuelEconomyColor, useFuelTrips } from '@/hooks/useFuelTrips';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { cn } from '@/lib/utils';

function fmtDuration(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

function fmtClock(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function num(s: string | undefined): number {
  if (s == null || s === '' || s === 'unknown' || s === 'unavailable') return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function Stat({
  icon, value, label, valueClassName,
}: { icon: ReactNode; value: string; label: string; valueClassName?: string }) {
  // Four of these share a row, so a phone gets the smaller number.
  return (
    <div className="rounded-lg bg-muted/40 px-1 py-1.5 sm:p-2">
      <p className={cn('text-xl font-bold tabular-nums leading-tight sm:text-2xl', valueClassName)}>{value}</p>
      <p className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </p>
    </div>
  );
}

// Accent palette shared by the centre Overall tile and the City/Highway side tiles.
// 'total' is neutral so it never competes with the amber/sky road-type colours — the
// hero NUMBER still colours by economy; the Overall tile's emphasis comes from size.
function bandTheme(accent: 'amber' | 'sky' | 'total') {
  if (accent === 'sky')
    return {
      text: 'text-sky-400',
      bg: 'bg-sky-500/10',
      ring: 'ring-2 ring-sky-500/60',
      chip: 'bg-sky-500/20 text-sky-300',
      bar: 'bg-sky-400',
    };
  if (accent === 'amber')
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      ring: 'ring-2 ring-amber-500/60',
      chip: 'bg-amber-500/20 text-amber-300',
      bar: 'bg-amber-400',
    };
  return {
    text: 'text-foreground/90',
    bg: 'bg-muted/60',
    ring: 'ring-2 ring-foreground/30',
    chip: 'bg-foreground/10 text-foreground/80',
    bar: 'bg-foreground/50',
  };
}

// The headline: THIS trip's overall economy, big and centre-stage. Keeps the full
// detail (trip distance + your rolling average + how this trip compares to it) since
// the side tiles are now deliberately minimal. Elevated (shadow + ring + big number)
// so it reads first, before you glance sideways to the city/highway breakdown.
function OverallTile({
  km,
  econ,
  avg,
  scaleMax,
}: {
  km: number | null;
  econ: number | null;
  avg: number | null;
  scaleMax: number;
}) {
  const hasTrip = econ != null && km != null && km >= 0.1;
  // Lead with this trip; fall back to your rolling average so it's never empty.
  const hero = hasTrip ? econ : avg;
  // Lower L/100km is better, so positive (avg − econ) means you beat your average.
  const delta = hasTrip && avg != null ? avg - econ! : null;
  const t = bandTheme('total');
  return (
    <div className={cn('relative overflow-hidden rounded-2xl p-3.5 pt-4 shadow-lg shadow-black/20', t.bg, t.ring)}>
      <div className={cn('absolute inset-x-0 top-0 h-1.5', t.bar)} />
      <div className="flex items-center gap-1.5">
        <Sigma className="h-4 w-4 text-foreground/80" />
        <span className="text-xs font-bold uppercase tracking-wider text-foreground/90">Overall</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span
          className={cn(
            'text-5xl font-bold leading-none tabular-nums',
            hero != null ? fuelEconomyColor(hero) : 'text-muted-foreground',
          )}
        >
          {hero != null ? hero.toFixed(1) : '—'}
        </span>
        <span className="text-xs text-muted-foreground">L/100km</span>
      </div>
      <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
        {hasTrip ? `this trip · ${km!.toFixed(1)} km` : hero != null ? 'your average' : 'no data yet'}
      </p>
      <MiniMeter econ={econ} avg={avg} scaleMax={scaleMax} accent="total" className="mt-2" />
      <div className="mt-2 flex items-center justify-between border-t border-foreground/10 pt-1.5 text-[11px] tabular-nums">
        {hasTrip ? (
          <>
            <span className="text-muted-foreground">
              avg{' '}
              <span className="text-base font-semibold text-foreground/90">
                {avg != null ? avg.toFixed(1) : '—'}
              </span>
            </span>
            {delta != null ? (
              Math.abs(delta) < 0.05 ? (
                <span className="text-muted-foreground">on par</span>
              ) : (
                <span className={cn('font-semibold', delta > 0 ? 'text-green-400' : 'text-red-400')}>
                  {Math.abs(delta).toFixed(1)} {delta > 0 ? 'better' : 'worse'}
                </span>
              )
            ) : (
              <span className="text-muted-foreground/50">—</span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground/70">—</span>
        )}
      </div>
    </div>
  );
}

// A side tile for one road type: its economy this trip, its share + km, a mini
// meter, and an avg/better-worse footer — the same anatomy as the Overall tile,
// just smaller. Ringed + "now"-tagged while you're actually driving this band.
function BandTile({
  icon,
  label,
  accent,
  active,
  live,
  econ,
  avg,
  pct,
  km,
  scaleMax,
}: {
  icon: ReactNode;
  label: string;
  accent: 'amber' | 'sky';
  active: boolean; // dominant band (ring) — set even at rest
  live: boolean; // actually driving this band right now → "NOW" chip
  econ: number | null;
  avg: number | null; // rolling-average fallback so a fresh trip isn't blank
  pct: number | null; // share of this trip driven in this band
  km: number | null; // km driven in this band this trip
  scaleMax: number; // shared meter scale so all three tiles compare on one axis
}) {
  const hasTrip = econ != null;
  // Lead with this trip's economy; fall back to your rolling average if not yet driven.
  const hero = hasTrip ? econ : avg;
  // Lower L/100km is better, so positive (avg − econ) means you beat your average.
  const delta = hasTrip && avg != null ? avg - econ! : null;
  const t = bandTheme(accent);
  return (
    <div className={cn('relative flex flex-col overflow-hidden rounded-xl p-2.5 pt-3', t.bg, active && t.ring)}>
      {/* Colour stripe — makes city vs highway unmistakable at a glance. */}
      <div className={cn('absolute inset-x-0 top-0 h-1', t.bar)} />
      {/* On a phone HIGHWAY and the NOW chip are wider than the tile, so the
          chip wraps under the label instead of being clipped by the edge. */}
      <div className="flex flex-wrap items-center justify-between gap-x-1 gap-y-1">
        <span className={cn('flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide', t.text)}>
          {icon}
          {label}
        </span>
        {live && (
          <span className={cn('rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wide', t.chip)}>
            now
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center pt-1.5">
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              'text-2xl font-bold leading-none tabular-nums',
              hero != null ? fuelEconomyColor(hero) : 'text-muted-foreground',
            )}
          >
            {hero != null ? hero.toFixed(1) : '—'}
          </span>
          <span className="text-[9px] text-muted-foreground">L/100km</span>
        </div>
        <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">
          {pct != null && <span className={cn('font-semibold', t.text)}>{pct.toFixed(0)}%</span>}
          {pct != null && km != null && <span aria-hidden> · </span>}
          {km != null
            ? `${km.toFixed(1)} km`
            : pct != null
              ? ' of trip'
              : econ != null
                ? 'this trip'
                : 'your average'}
        </p>
        <MiniMeter econ={econ} avg={avg} scaleMax={scaleMax} accent={accent} className="mt-1.5" />
      </div>
      {/* Same avg/delta footer as the Overall tile, sized down. flex-wrap lets the
          delta drop to its own line instead of clipping when the tile gets narrow. */}
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-1 border-t border-foreground/10 pt-1 text-[10px] tabular-nums">
        {hasTrip ? (
          <>
            <span className="text-muted-foreground">
              avg{' '}
              <span className="text-sm font-semibold text-foreground/90">
                {avg != null ? avg.toFixed(1) : '—'}
              </span>
            </span>
            {delta != null ? (
              Math.abs(delta) < 0.05 ? (
                <span className="text-muted-foreground">on par</span>
              ) : (
                <span className={cn('font-semibold', delta > 0 ? 'text-green-400' : 'text-red-400')}>
                  {Math.abs(delta).toFixed(1)} {delta > 0 ? 'better' : 'worse'}
                </span>
              )
            ) : (
              <span className="text-muted-foreground/50">—</span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground/70">—</span>
        )}
      </div>
    </div>
  );
}

// A tiny in-tile bullet meter: this trip's economy as the fill, your rolling average
// as a white tick, on one scale shared by all three tiles so the bands stay
// comparable. Lower L/100km is better, so a fill stopping LEFT of the tick beat the
// average → green; past it → red; on par / no average → the band's own colour. The
// fill-vs-tick position carries the direction too (not colour alone), so it survives
// colour-blindness/grayscale. With no this-trip data yet it shows just the tick.
function MiniMeter({
  econ,
  avg,
  scaleMax,
  accent,
  className,
}: {
  econ: number | null;
  avg: number | null;
  scaleMax: number;
  accent: 'amber' | 'sky' | 'total';
  className?: string;
}) {
  const has = econ != null && econ > 0;
  const avgPct = avg != null && avg > 0 ? Math.min(100, (avg / scaleMax) * 100) : null;
  if (!has && avgPct == null) return null;
  const t = bandTheme(accent);
  // Keep a 2px sliver visible for very small values so the meter never looks empty.
  const econPct = has ? Math.max(2, Math.min(100, (econ! / scaleMax) * 100)) : 0;
  const delta = has && avg != null ? avg - econ! : null; // + = beat your average
  const fill =
    delta == null || Math.abs(delta) < 0.05 ? t.bar : delta > 0 ? 'bg-green-500' : 'bg-red-500';
  return (
    // Outer wrapper is NOT clipped so the average tick can stand proud of the track.
    <div className={cn('relative', className)}>
      <div className="h-1.5 overflow-hidden rounded-full bg-background/50">
        {has && <div className={cn('h-full rounded-r-full', fill)} style={{ width: `${econPct}%` }} />}
      </div>
      {avgPct != null && (
        <div
          className="absolute top-1/2 h-2.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-1 ring-background/60"
          style={{ left: `${avgPct}%` }}
        />
      )}
    </div>
  );
}

// Collapsible "how this works" note for the city/highway split + averages. Uses a
// native <details> (not a popover) so it behaves reliably inside Home Assistant's
// shadow-DOM panel. Shared with the Trip Economy history card.
export function SplitInfo({ className }: { className?: string }) {
  return (
    <details className={cn('text-[10px] text-muted-foreground [&_summary]:list-none', className)}>
      <summary className="flex cursor-pointer items-center justify-center gap-1 text-muted-foreground/60 transition-colors hover:text-muted-foreground">
        <Info className="h-3 w-3" />
        How the city/highway split works
      </summary>
      <p className="mt-1 leading-relaxed text-muted-foreground/80">
        Your speed picks the mode — <span className="text-sky-400">highway</span> above ~78 km/h,{' '}
        <span className="text-amber-400">city</span> below ~63, held in between so it can't flip-flop;
        idling is excluded; the band you're driving is tagged <b>now</b>. <b>avg</b> is the
        distance-weighted average across your recent trips (total litres ÷ total km for that road
        type) — your real driving, not an EPA rating — and{' '}
        <span className="text-green-400/90">better</span>/<span className="text-red-400/90">worse</span>/on
        par is how this trip compares to it (lower L/100km is better). The thin meter under a number
        races this trip against that average: the white tick is your avg, so a{' '}
        <span className="text-green-400/90">green</span> fill stopping short of it is beating it and a{' '}
        <span className="text-red-400/90">red</span> fill past it is trailing it.
      </p>
    </details>
  );
}

export function CurrentTripCard() {
  const { value: distance } = useEntityNumeric('sensor.live_trip_distance');
  const { value: liters } = useEntityNumeric('sensor.live_trip_fuel'); // moving fuel only
  const { value: econ } = useEntityNumeric('sensor.live_trip_economy');
  const { value: driveSec } = useEntityNumeric('sensor.live_trip_drive_seconds');
  const { value: idleFuel } = useEntityNumeric('sensor.live_trip_idle_fuel');
  const { value: range } = useEntityNumeric('sensor.live_trip_range_remaining');
  // City/highway split for THIS trip + the current drive-mode classification.
  const { value: cityEcon } = useEntityNumeric('sensor.live_trip_city_economy');
  const { value: hwyEcon } = useEntityNumeric('sensor.live_trip_highway_economy');
  const { value: cityKm } = useEntityNumeric('sensor.live_trip_city_distance');
  const { value: hwyKm } = useEntityNumeric('sensor.live_trip_highway_distance');
  const { value: hwyPct } = useEntityNumeric('sensor.live_trip_highway_percent');
  const driveClass = useEntity('sensor.drive_class')?.state; // 'city' | 'highway'
  const { summary } = useFuelTrips(30); // personal distance-weighted economy baseline
  const startEntity = useEntity('input_text.trip_start_ts');
  // Fuel-model health, not trip data: VE is the speed-density calibration factor
  // (learned from fill-ups — see ve_update.py), trim is the ECU's own correction.
  // Both sit near their usual band in normal operation; a jump in either is the
  // signal something changed (exhaust leak, vacuum leak, sensor fault) before the
  // pump receipts would tell you.
  const { value: veCorrection } = useEntityNumeric('input_number.fuel_ve_correction');
  const { value: trimAvg } = useEntityNumeric('sensor.average_fuel_trim');
  const movingEntity = useEntity('binary_sensor.vehicle_is_moving');
  const isMoving = movingEntity?.state === 'on';
  const { value: splitMin } = useEntityNumeric('input_number.trip_split_minutes');

  // 1 Hz tick so the live duration counts up smoothly (distance/fuel/economy
  // already push from the websocket on their own).
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const startTs = num(startEntity?.state);
  const hasTrip = Number.isFinite(startTs) && startTs > 0;
  const now = Date.now();
  // Duration = DRIVING time (idle excluded) from the movement-gated sensor; it
  // advances ~1 Hz while moving and freezes when stopped.
  const durationMs = driveSec != null ? driveSec * 1000 : 0;

  const avgSpeed = distance != null && driveSec != null && driveSec > 5 ? distance / (driveSec / 3600) : null;
  const kmPerL = econ != null && econ > 0 ? 100 / econ : null;

  // Which band is "happening now": live drive_class when classified, else the
  // trip's dominant band by distance so the emphasis still reads sensibly at rest.
  const activeBand: 'city' | 'highway' | null =
    driveClass === 'city' || driveClass === 'highway'
      ? driveClass
      : hwyPct != null
        ? hwyPct >= 50
          ? 'highway'
          : 'city'
        : null;
  // Show the split whenever there's this-trip data OR a rolling average to compare
  // against — so both road types' averages stay visible even before a band is driven.
  const showSplit =
    cityKm != null ||
    hwyKm != null ||
    summary?.avg_city_l_per_100km != null ||
    summary?.avg_highway_l_per_100km != null;
  // One shared scale for the in-tile meters so City/Highway/Overall (and their
  // average ticks) stay comparable. Max of every value present + headroom.
  const meterVals = [
    cityEcon,
    hwyEcon,
    econ,
    summary?.avg_city_l_per_100km,
    summary?.avg_highway_l_per_100km,
    summary?.avg_l_per_100km,
  ].filter((v): v is number => v != null && v > 0);
  const meterScaleMax = meterVals.length ? Math.max(...meterVals) * 1.12 : 30;
  // The band actually being driven right now → drives the "now" tag; null at rest
  // (so a parked "Last Trip" card keeps the dominant-band ring but drops "now").
  const liveBand: 'city' | 'highway' | null =
    isMoving && (driveClass === 'city' || driveClass === 'highway') ? driveClass : null;
  // Reconcile the displayed km so City + Highway == Total exactly at the one-decimal
  // precision shown: City = round1(Total) − round1(Highway).
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const cityKmDisp =
    distance != null && hwyKm != null ? Math.max(0, r1(r1(distance) - r1(hwyKm))) : cityKm;

  // "Current" while moving, or recently moving — a stop shorter than the
  // trip-split gap (idle OR engine-off) is still the same trip. Pure pre-drive
  // idle (engine on, but motion stopped long ago) reads as the last trip.
  const splitMs = (splitMin ?? 35) * 60_000;
  const movingLastMs = movingEntity?.last_changed ? Date.parse(movingEntity.last_changed) : NaN;
  const recentlyMoving = Number.isFinite(movingLastMs) && now - movingLastMs < splitMs;
  const isCurrent = isMoving || recentlyMoving;
  const title = isCurrent || !hasTrip ? 'Current Trip' : 'Last Trip';
  const waiting = !hasTrip || distance == null;

  return (
    <Card>
      <CardHeader className="pb-2 max-sm:pt-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Route className="h-4 w-4" />
          {title}
          <div className="ml-auto flex items-center gap-2">
            {isMoving && (driveClass === 'highway' || driveClass === 'city') && (
              <Badge
                variant="outline"
                className={cn(
                  'gap-1 text-[10px]',
                  driveClass === 'highway'
                    ? 'border-sky-500/40 text-sky-400'
                    : 'border-amber-500/40 text-amber-400',
                )}
              >
                {driveClass === 'highway' ? <Milestone className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                {driveClass === 'highway' ? 'Highway' : 'City'}
              </Badge>
            )}
            {isMoving ? (
              <Badge variant="default" className="text-[10px] bg-blue-500">
                Driving
              </Badge>
            ) : isCurrent ? (
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30">
                Stopped
              </Badge>
            ) : null}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 sm:pt-4">
        {waiting ? (
          <p className="py-2 text-xs text-muted-foreground">
            {isCurrent ? 'Trip starting — waiting for data…' : 'No trip data yet'}
          </p>
        ) : (
          <>
            {/* Overall in the CENTRE — THE headline, big and detailed — flanked by
                minimal City (left) and Highway (right) tiles that just show each band's
                economy + its share of the trip. The side you're driving is ringed with
                a NOW chip. When there's no split data yet, Overall stands alone. */}
            <div
              className={cn(
                'grid items-stretch gap-2',
                showSplit
                  ? 'grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)]'
                  : 'grid-cols-1',
              )}
            >
              {showSplit && (
                <BandTile
                  icon={<Building2 className="h-3.5 w-3.5" />}
                  label="City"
                  accent="amber"
                  active={activeBand === 'city'}
                  live={liveBand === 'city'}
                  econ={cityEcon}
                  avg={summary?.avg_city_l_per_100km ?? null}
                  pct={hwyPct != null ? 100 - hwyPct : null}
                  km={cityKmDisp}
                  scaleMax={meterScaleMax}
                />
              )}
              <OverallTile
                km={distance}
                econ={econ}
                avg={summary?.avg_l_per_100km ?? null}
                scaleMax={meterScaleMax}
              />
              {showSplit && (
                <BandTile
                  icon={<Milestone className="h-3.5 w-3.5" />}
                  label="Highway"
                  accent="sky"
                  active={activeBand === 'highway'}
                  live={liveBand === 'highway'}
                  econ={hwyEcon}
                  avg={summary?.avg_highway_l_per_100km ?? null}
                  pct={hwyPct}
                  km={hwyKm}
                  scaleMax={meterScaleMax}
                />
              )}
            </div>
            {/* Distance, time, fuel and range in one row: on a phone this card
                shares the screen with the van and the living space. */}
            <div className={cn('mt-2 grid gap-2 text-center', range != null ? 'grid-cols-4' : 'grid-cols-3')}>
              <Stat
                icon={<MapPin className="h-3 w-3" />}
                value={distance != null ? distance.toFixed(1) : '—'}
                label="km"
              />
              <Stat icon={<Clock className="h-3 w-3" />} value={fmtDuration(durationMs)} label="driving" />
              <Stat
                icon={<Fuel className="h-3 w-3" />}
                value={liters != null ? liters.toFixed(1) : '—'}
                label="liters"
              />
              {range != null && (
                <Stat
                  icon={<Gauge className="h-3 w-3" />}
                  value={`≈${Math.round(range / 5) * 5}`}
                  label="km to empty"
                  valueClassName={range < 50 ? 'text-red-500' : range < 150 ? 'text-amber-400' : undefined}
                />
              )}
            </div>
            {/* The explainer also sits on the trip history card further down,
                so a phone can spare it here. */}
            {showSplit && <SplitInfo className="mt-2 text-center max-sm:hidden" />}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 text-[11px] tabular-nums text-muted-foreground">
              {avgSpeed != null && <span>{avgSpeed.toFixed(0)} km/h avg</span>}
              {kmPerL != null && (
                <>
                  <span aria-hidden>·</span>
                  <span>{kmPerL.toFixed(1)} km/L</span>
                </>
              )}
              {idleFuel != null && idleFuel > 0.05 && (
                <>
                  <span aria-hidden>·</span>
                  <span>{idleFuel.toFixed(1)} L idle</span>
                </>
              )}
              {hasTrip && (
                <>
                  <span aria-hidden>·</span>
                  <span>since {fmtClock(startTs)}</span>
                </>
              )}
              {veCorrection != null && (
                <>
                  <span aria-hidden>·</span>
                  <span title="Fuel model VE calibration factor (learned from fill-ups)">
                    VE {veCorrection.toFixed(2)}
                  </span>
                </>
              )}
              {trimAvg != null && (
                <>
                  <span aria-hidden>·</span>
                  <span
                    title="ECU fuel trim, avg both banks — a jump here (vs. its normal ~-3%) means an exhaust or vacuum leak, not a fuel-model error"
                    className={cn(Math.abs(trimAvg) > 8 && 'font-semibold text-orange-400')}
                  >
                    trim {trimAvg > 0 ? '+' : ''}
                    {trimAvg.toFixed(1)}%
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
