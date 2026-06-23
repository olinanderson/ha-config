import { useState, useEffect } from 'react';

export interface FuelTrip {
  start_ts: number;
  end_ts: number;
  distance_km: number;
  segment_count: number;
  fuel_start_pct: number | null;
  fuel_end_pct: number | null;
  fuel_used_pct?: number;
  fuel_used_l?: number;
  l_per_100km?: number;
  km_per_l?: number;
}

export interface FuelTripSummary {
  trip_count: number;
  total_km: number;
  total_l_used: number;
  avg_l_per_100km: number | null;
  tank_capacity_l: number;
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
async function getAuthHeaders(): Promise<Record<string, string>> {
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
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useFuelTrips(limit = 20): FuelTripsResult {
  const [trips, setTrips] = useState<FuelTrip[]>([]);
  const [summary, setSummary] = useState<FuelTripSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const headers = await getAuthHeaders();
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
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [limit]);

  const validTrips = trips.filter(t => t.l_per_100km != null);

  return { trips, validTrips, summary, loading, error };
}

/** Returns fuel economy color class for a given L/100km value */
export function fuelEconomyColor(l100km: number): string {
  if (l100km < 12) return 'text-green-400';
  if (l100km < 15) return 'text-amber-400';
  return 'text-red-400';
}

/** Returns a stroke color for map segments */
export function fuelEconomyStroke(l100km: number | undefined): string {
  if (l100km == null) return '#6b7280'; // gray-500
  if (l100km < 12) return '#4ade80';   // green-400
  if (l100km < 15) return '#fb923c';   // orange-400
  return '#f87171';                     // red-400
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
