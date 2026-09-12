import { useState, useEffect } from 'react';

export interface FuelTrip {
  start_ts: number;
  end_ts: number;
  distance_km: number;
  segment_count: number;
  moving_ms?: number; // driving time (sum of segment spans; excludes 3-20min mid-trip stops)
  fuel_start_pct: number | null;
  fuel_end_pct: number | null;
  fuel_used_pct?: number;
  fuel_used_l?: number;
  l_per_100km?: number; // headline economy (prefers OBD+GPS, falls back to tank)
  km_per_l?: number;
  // Primary method: OBD speed-density litres ÷ GPS distance (accurate on short trips)
  fuel_used_l_obd?: number;
  l_per_100km_obd?: number;
  // Cross-check: tank-level delta (only emitted for long fill-to-fill spans)
  l_per_100km_tank?: number;
  economy_method?: 'obd_gps' | 'tank_delta';
  // City vs highway split (only on recent trips still within recorder retention):
  // distances rescaled onto the GPS trip distance by the OBD city/highway fraction
  highway_pct?: number;          // share of trip distance driven on the highway
  city_km?: number;
  highway_km?: number;
  city_fuel_l?: number;
  highway_fuel_l?: number;
  city_l_per_100km?: number;     // moving-basis economy for the city portion
  highway_l_per_100km?: number;  // moving-basis economy for the highway portion
  // House-battery telemetry over the trip (driving charges off the alternator)
  battery_gain_pct?: number;        // energy-based: Wh gain ÷ historical full-pack Wh
  battery_gain_wh?: number;         // stored-energy increase (Wh)
  battery_start_c?: number | null;  // battery temperature (°C)
  battery_end_c?: number | null;
}

export interface FuelTripSummary {
  trip_count: number;
  total_km: number;
  total_l_used: number;
  avg_l_per_100km: number | null;
  tank_capacity_l: number;
  // Distance-weighted city/highway baselines (the "which am I comparing to"
  // reference). Null until enough split-carrying trips accumulate.
  avg_city_l_per_100km?: number | null;
  avg_highway_l_per_100km?: number | null;
  total_city_km?: number;
  total_highway_km?: number;
}

export interface FuelTripsResult {
  trips: FuelTrip[];
  validTrips: FuelTrip[]; // only trips with l_per_100km
  summary: FuelTripSummary | null;
  loading: boolean;
  error: string | null;
}

const IS_LOCAL = /^(192\.168\.|10\.|100\.|172\.(1[6-9]|2\d|3[01])\.|localhost$)/.test(
  location.hostname,
);
const API_BASE = () =>
  IS_LOCAL
    ? `${location.protocol}//${location.hostname}:8765`
    : `${location.origin}/api`;

const REFRESH_MS = 5 * 60 * 1000; // 5 minutes

/** Get auth headers for API requests through HA */
async function getAuthHeaders(): Promise<Record<string, string> | null> {
  if (IS_LOCAL) return {};
  const hass = (window as unknown as Record<string, unknown>).__HASS__ as { auth?: { data?: { access_token?: string } } } | undefined;
  let token = hass?.auth?.data?.access_token;
  if (!token) {
    // Wait for hass to be available
    token = await new Promise<string | undefined>((resolve) => {
      const timeout = setTimeout(() => resolve(undefined), 2000);
      const check = setInterval(() => {
        const t = (window as any).__HASS__?.auth?.data?.access_token;
        if (t) {
          clearInterval(check);
          clearTimeout(timeout);
          resolve(t);
        }
      }, 100);
    });
  }
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export function useFuelTrips(limit = 20): FuelTripsResult {
  const [trips, setTrips] = useState<FuelTrip[]>([]);
  const [summary, setSummary] = useState<FuelTripSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    // A single failed fetch (network handoff, brief Starlink drop, token not
    // ready yet) shouldn't blank the averages until the next 5-min refresh —
    // schedule one quick retry instead. Replaced on each failure, so repeated
    // failures poll gently rather than stacking timers.
    const retrySoon = (ms: number) => {
      if (cancelled) return;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(load, ms);
    };

    async function load() {
      try {
        const headers = await getAuthHeaders();
        if (!headers) {
          retrySoon(10_000); // remote without a token yet — skip the request (avoids 401 auth-ban), try again shortly
          return;
        }
        const r = await fetch(`${API_BASE()}/vanlife/fuel-trips?limit=${limit}`, {
          headers,
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        if (cancelled) return;
        if (d.code === 'Error') throw new Error(d.message);
        setTrips(d.trips ?? []);
        setSummary(d.summary ?? null);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(String(e));
          retrySoon(30_000);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(retryTimer);
    };
  }, [limit]);

  const validTrips = trips.filter(t => t.l_per_100km != null);

  return { trips, validTrips, summary, loading, error };
}

/** Returns fuel economy color class for a given L/100km value.
 *  Tuned for the 3.5 EcoBoost Transit: good < 16, ok < 22, poor ≥ 22 L/100km. */
export function fuelEconomyColor(l100km: number): string {
  if (l100km < 16) return 'text-green-400';
  if (l100km < 22) return 'text-amber-400';
  return 'text-red-400';
}

/** Find the fuel trip that best covers a GPS segment by timestamp */
export function tripForSegment(
  segStart: number,
  segEnd: number,
  trips: FuelTrip[],
): FuelTrip | null {
  // Find trips where the segment's time range overlaps the trip
  const overlapping = trips.filter(
    t => t.start_ts <= segEnd && t.end_ts >= segStart,
  );
  if (overlapping.length === 0) return null;
  // Prefer the trip with the most overlap
  return overlapping.reduce((best, t) => {
    const overlap = Math.min(t.end_ts, segEnd) - Math.max(t.start_ts, segStart);
    const bestOverlap = Math.min(best.end_ts, segEnd) - Math.max(best.start_ts, segStart);
    return overlap > bestOverlap ? t : best;
  });
}
