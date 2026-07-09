/**
 * FuelRibbon — a live "are you beating your economy?" feedback bar for the
 * Current Trip card. Compares this trip's ACTUAL moving economy
 * (sensor.live_trip_economy) against a personal EXPECTED baseline (the
 * distance-weighted lifetime average from /vanlife/fuel-trips), and renders a
 * center-anchored diverging bar: green filling right = beating your average,
 * red filling left = worse. The number below is cumulative litres saved/wasted
 * this trip.
 *
 * IMPORTANT (design correction): there is no forward router or elevation-profile
 * prediction in this system (the routing proxy only map-matches PAST GPS traces),
 * so "expected" is a model of the van's OWN history — NOT a simulation of the
 * road ahead. The live-conditions line below the bar (current grade + head/tail
 * wind with an estimated % impact) is purely INFORMATIONAL — it explains WHY the
 * ribbon is where it is; it is not folded into the accumulated baseline (that
 * would fight the smoothed, trip-accumulated actual).
 *
 * All client-side: reads existing entities + Open-Meteo directly (like
 * WindWidget). No new HA sensor/helper.
 */
import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, Wind, Mountain } from 'lucide-react';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { cn } from '@/lib/utils';

// Brick-shaped Transit aero penalty: ~6% economy hit per 10 km/h of headwind.
// STARTING GUESS — calibrate against fuel-trips binned by wind. Only used for
// the informational chip, never for the ribbon math itself.
const KW_PER_10 = 0.06;

/** Current wind at a point via Open-Meteo (dir = direction wind blows FROM, km/h). */
function useCurrentWind(lat?: number, lon?: number) {
  const [wind, setWind] = useState<{ speed: number; dir: number } | null>(null);
  const fetch_ = useCallback(async () => {
    if (lat == null || lon == null) return;
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}` +
        `&current=windspeed_10m,winddirection_10m&windspeed_unit=kmh&forecast_days=1&timezone=auto`;
      const r = await fetch(url);
      const j = await r.json();
      if (j?.current) setWind({ speed: j.current.windspeed_10m, dir: j.current.winddirection_10m });
    } catch {
      /* keep last-good on failure */
    }
  }, [lat, lon]);
  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => {
    const id = setInterval(fetch_, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetch_]);
  return wind;
}

export function FuelRibbon({
  actual,
  distanceKm,
  expected,
}: {
  actual: number | null;   // sensor.live_trip_economy (L/100km)
  distanceKm: number | null; // sensor.live_trip_distance (km)
  expected: number | null;  // personal distance-weighted avg L/100km
}) {
  const gps = useEntity('device_tracker.ublox_gps');
  const lat = Number(gps?.attributes?.latitude);
  const lon = Number(gps?.attributes?.longitude);
  const course = Number(gps?.attributes?.course); // travel bearing, deg
  const { value: gradePct } = useEntityNumeric('sensor.road_grade_percent');
  const wind = useCurrentWind(
    Number.isFinite(lat) ? lat : undefined,
    Number.isFinite(lon) ? lon : undefined,
  );

  // Need a real baseline + a bit of distance before the comparison means anything.
  if (actual == null || distanceKm == null || expected == null || expected <= 0 || distanceKm < 0.2) {
    return null;
  }

  // Cumulative litres saved (>0) or wasted (<0) vs your average, so far this trip.
  const dl = ((expected - actual) / 100) * distanceKm; // (ΔL/100km)/100 × km = L
  const pct = Math.max(-0.4, Math.min(0.4, (expected - actual) / expected)); // clamp ±40%
  const ahead = dl >= 0;
  const magPct = Math.min(50, Math.abs(pct) * 125); // ±0.4 → up to 50% of the half-track

  // Live conditions (informational only) — relative along-track wind, + = headwind.
  const headwind =
    wind && Number.isFinite(course)
      ? wind.speed * Math.cos(((wind.dir - course) * Math.PI) / 180)
      : null;
  const windEstPct = headwind != null ? KW_PER_10 * (headwind / 10) : null; // fractional
  const showGrade = gradePct != null && Math.abs(gradePct) >= 1.5;
  const showWind = headwind != null && Math.abs(headwind) >= 5;

  return (
    <div className="mt-2">
      {/* Center-anchored diverging bar: green right = ahead, red left = behind */}
      <div className="relative h-2.5 rounded-full bg-muted/40 overflow-hidden">
        <div className="absolute left-1/2 top-0 z-10 h-full w-px bg-foreground/40" />
        {ahead ? (
          <div
            className="absolute left-1/2 top-0 h-full bg-green-500"
            style={{ width: `${magPct}%` }}
          />
        ) : (
          <div
            className="absolute top-0 h-full bg-red-500"
            style={{ right: '50%', width: `${magPct}%` }}
          />
        )}
      </div>

      <p className="mt-1 flex items-center justify-center gap-1 text-[11px] tabular-nums text-muted-foreground">
        {ahead ? (
          <TrendingUp className="h-3 w-3 text-green-400" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-400" />
        )}
        {ahead ? 'Ahead by ' : 'Behind by '}
        <span className={cn('font-semibold', ahead ? 'text-green-400' : 'text-red-400')}>
          {Math.abs(dl).toFixed(2)} L
        </span>
        <span>vs your {expected.toFixed(1)} avg</span>
      </p>

      {(showGrade || showWind) && (
        <div className="mt-0.5 flex items-center justify-center gap-x-3 text-[10px] tabular-nums text-muted-foreground">
          {showGrade && (
            <span className="flex items-center gap-1">
              <Mountain className="h-3 w-3" />
              {gradePct! > 0 ? 'climbing' : 'descending'} {Math.abs(gradePct!).toFixed(0)}%
            </span>
          )}
          {showWind && (
            <span className="flex items-center gap-1">
              <Wind className="h-3 w-3" />
              {headwind! > 0 ? 'headwind' : 'tailwind'} {Math.abs(headwind!).toFixed(0)} km/h
              {windEstPct != null && (
                <span className={headwind! > 0 ? 'text-red-400/80' : 'text-green-400/80'}>
                  (~{windEstPct > 0 ? '+' : '−'}{Math.abs(windEstPct * 100).toFixed(0)}%)
                </span>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
