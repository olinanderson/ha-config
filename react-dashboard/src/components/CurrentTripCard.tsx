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
import { Route, MapPin, Clock, Fuel, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fuelEconomyColor } from '@/hooks/useFuelTrips';
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

export function CurrentTripCard() {
  const { value: distance } = useEntityNumeric('sensor.live_trip_distance');
  const { value: liters } = useEntityNumeric('sensor.live_trip_fuel'); // moving fuel only
  const { value: econ } = useEntityNumeric('sensor.live_trip_economy');
  const { value: driveSec } = useEntityNumeric('sensor.live_trip_drive_seconds');
  const { value: idleFuel } = useEntityNumeric('sensor.live_trip_idle_fuel');
  const { value: range } = useEntityNumeric('sensor.live_trip_range_remaining');
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
            {isMoving ? (
              <Badge variant="default" className="text-[10px] bg-blue-500">
                Driving
              </Badge>
            ) : isCurrent ? (
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30">
                Stopped
              </Badge>
            ) : null}
            {!waiting && (
              <span
                className={cn(
                  'text-2xl font-bold tabular-nums',
                  econ != null ? fuelEconomyColor(econ) : 'text-muted-foreground',
                )}
              >
                {econ != null ? econ.toFixed(1) : '—'}
                <span className="ml-0.5 text-xs font-normal text-muted-foreground">L/100km</span>
              </span>
            )}
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
            <div className="grid grid-cols-3 gap-2 text-center">
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
