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

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2">
      <p className="text-2xl font-bold tabular-nums leading-tight">{value}</p>
      <p className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </p>
    </div>
  );
}

// One row of the City / Highway / Total detail table: distance driven, this trip's
// economy for that segment, your rolling average for it, and where you sit vs that
// average (lower L/100km is better → green when you beat it, red when you don't).
// The band you're driving right now (per live drive_class) is ringed + tinted with
// a "now" tag.
function BandTile({
  icon,
  label,
  accent,
  active,
  live,
  km,
  econ,
  avg,
}: {
  icon: ReactNode;
  label: string;
  accent: 'amber' | 'sky';
  active: boolean; // dominant band (ring) — set even at rest
  live: boolean; // actually driving this band right now → "NOW" chip
  km: number | null;
  econ: number | null;
  avg: number | null;
}) {
  const hasTrip = econ != null && km != null && km >= 0.1;
  // Lead with THIS trip's economy; if you haven't driven this road type yet, fall
  // back to your rolling average so the tile is never empty.
  const hero = hasTrip ? econ : avg;
  // Lower L/100km is better, so positive (avg − econ) means you beat your average.
  const delta = hasTrip && avg != null ? avg - econ! : null;
  const t =
    accent === 'sky'
      ? {
          text: 'text-sky-400',
          bg: 'bg-sky-500/10',
          ring: 'ring-2 ring-sky-500/60',
          chip: 'bg-sky-500/20 text-sky-300',
          bar: 'bg-sky-400',
        }
      : {
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          ring: 'ring-2 ring-amber-500/60',
          chip: 'bg-amber-500/20 text-amber-300',
          bar: 'bg-amber-400',
        };
  return (
    <div className={cn('relative overflow-hidden rounded-xl p-2.5 pt-3', t.bg, active && t.ring)}>
      {/* Colour stripe — makes city vs highway unmistakable at a glance. */}
      <div className={cn('absolute inset-x-0 top-0 h-1', t.bar)} />
      <div className="flex items-center justify-between">
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
      <div className="mt-1.5 flex items-baseline gap-1">
        <span
          className={cn(
            'text-3xl font-bold leading-none tabular-nums',
            hero != null ? fuelEconomyColor(hero) : 'text-muted-foreground',
          )}
        >
          {hero != null ? hero.toFixed(1) : '—'}
        </span>
        <span className="text-[10px] text-muted-foreground">L/100km</span>
      </div>
      <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
        {hasTrip ? `this trip · ${km!.toFixed(1)} km` : hero != null ? 'your average' : 'no data yet'}
      </p>
      <div className="mt-1.5 flex items-center justify-between border-t border-foreground/10 pt-1 text-[10px] tabular-nums">
        {hasTrip ? (
          <>
            <span className="text-muted-foreground">avg {avg != null ? avg.toFixed(1) : '—'}</span>
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
          <span className="text-muted-foreground/70">none this trip yet</span>
        )}
      </div>
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
        Your speed picks the mode — <span className="text-sky-400">highway</span> above ~85 km/h,{' '}
        <span className="text-amber-400">city</span> below ~70, held in between so it can't flip-flop;
        idling is excluded. Each row shows this trip's km + economy for that segment; the band you're
        driving is tagged <b>now</b>. <b>avg</b> is the distance-weighted average across your recent
        trips (total litres ÷ total km for that road type) — your real driving, not an EPA rating — and{' '}
        <span className="text-green-400/90">better</span>/<span className="text-red-400/90">worse</span>/on
        par is how this trip compares to it (lower L/100km is better).
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
  // The band actually being driven right now → drives the "now" tag; null at rest
  // (so a parked "Last Trip" card keeps the dominant-band ring but drops "now").
  const liveBand: 'city' | 'highway' | null =
    isMoving && (driveClass === 'city' || driveClass === 'highway') ? driveClass : null;
  // Display km so the three rows always reconcile: City = round1(Total) − round1(Highway),
  // so City + Highway == Total exactly at the one-decimal precision shown.
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
      <CardHeader className="pb-2">
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
      <CardContent>
        {waiting ? (
          <p className="py-2 text-xs text-muted-foreground">
            {isCurrent ? 'Trip starting — waiting for data…' : 'No trip data yet'}
          </p>
        ) : (
          <>
            {/* City vs Highway — THE headline. Two big colour-coded tiles (amber =
                city, sky = highway, each with a stripe + icon) so which is which is
                unmistakable; the one you're driving is ringed with a NOW chip. */}
            {showSplit && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <BandTile
                    icon={<Building2 className="h-3.5 w-3.5" />}
                    label="City"
                    accent="amber"
                    active={activeBand === 'city'}
                    live={liveBand === 'city'}
                    km={cityKmDisp}
                    econ={cityEcon}
                    avg={summary?.avg_city_l_per_100km ?? null}
                  />
                  <BandTile
                    icon={<Milestone className="h-3.5 w-3.5" />}
                    label="Highway"
                    accent="sky"
                    active={activeBand === 'highway'}
                    live={liveBand === 'highway'}
                    km={hwyKm}
                    econ={hwyEcon}
                    avg={summary?.avg_highway_l_per_100km ?? null}
                  />
                </div>
                {hwyPct != null && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="bg-amber-400" style={{ width: `${100 - hwyPct}%` }} />
                      <div className="bg-sky-400" style={{ width: `${hwyPct}%` }} />
                    </div>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      <span className="text-amber-400">{(100 - hwyPct).toFixed(0)}%</span> city ·{' '}
                      <span className="text-sky-400">{hwyPct.toFixed(0)}%</span> hwy
                    </span>
                  </div>
                )}
              </>
            )}
            {/* Trip total — kept, but deliberately secondary to the two tiles above. */}
            <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/30 px-2.5 py-1.5">
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Sigma className="h-3.5 w-3.5" />
                Trip total
              </span>
              <span className="flex items-baseline gap-1.5 tabular-nums">
                <span
                  className={cn(
                    'text-base font-bold',
                    econ != null ? fuelEconomyColor(econ) : 'text-muted-foreground',
                  )}
                >
                  {econ != null ? econ.toFixed(1) : '—'}
                </span>
                <span className="text-[10px] text-muted-foreground">L/100km</span>
                {summary?.avg_l_per_100km != null && (
                  <span className="text-[10px] text-muted-foreground">
                    avg {summary.avg_l_per_100km.toFixed(1)}
                  </span>
                )}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
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
            </div>
            {range != null && (
              <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-muted/30 py-1.5">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">≈</span>
                <span
                  className={cn(
                    'text-xl font-bold tabular-nums',
                    range < 50 ? 'text-red-500' : range < 150 ? 'text-amber-400' : 'text-foreground',
                  )}
                >
                  {Math.round(range / 5) * 5}
                </span>
                <span className="text-sm text-muted-foreground">km to empty</span>
              </div>
            )}
            {showSplit && <SplitInfo className="mt-2 text-center" />}
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
