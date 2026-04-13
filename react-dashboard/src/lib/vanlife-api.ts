/** Vanlife map API client — talks to osrm_proxy.py on port 8765 */

const API_BASE = () => `${location.protocol}//${location.hostname}:8765`;

/* ── Types ─────────────────────────────────────────────────────────── */

export interface GpsPoint {
  lat: number;
  lon: number;
  ts: number;
}

export interface Segment {
  id: string | null;
  start_ts: number;
  end_ts: number;
  points: GpsPoint[];
  point_count: number;
  routed_geometry: [number, number][] | null; // [lat, lon]
  distance_m: number;
}

export interface ParkingSpot {
  lat: number;
  lon: number;
  start_ts: number;
  duration_s: number;
  point_count: number;
}

export interface FilteredGpsResponse {
  segments: Segment[];
  parking_spots: ParkingSpot[];
  ready: boolean;
}

export interface NamedPlace {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  radius_m: number;
  notes: string;
  created_at: number;
}

export interface DataRange {
  min_date: string;
  max_date: string;
}

/* ── API calls ─────────────────────────────────────────────────────── */

export async function fetchFilteredGps(
  start: Date,
  end: Date,
  signal?: AbortSignal,
): Promise<FilteredGpsResponse | null> {
  const url = `${API_BASE()}/vanlife/filtered-gps?start=${start.getTime()}&end=${end.getTime()}`;
  const r = await fetch(url, { signal });
  if (!r.ok) return null;
  const d = await r.json();
  if (!d.ready || !d.segments || d.segments.length === 0) return null;
  return d as FilteredGpsResponse;
}

export async function fetchNamedPlaces(signal?: AbortSignal): Promise<NamedPlace[]> {
  const r = await fetch(`${API_BASE()}/vanlife/named-places`, { signal });
  if (!r.ok) return [];
  const d = await r.json();
  return d.places ?? [];
}

export async function fetchDataRange(signal?: AbortSignal): Promise<DataRange | null> {
  const r = await fetch(`${API_BASE()}/vanlife/data-range`, { signal });
  if (!r.ok) return null;
  return r.json();
}

export async function createNamedPlace(
  place: Omit<NamedPlace, 'id' | 'created_at'>,
  signal?: AbortSignal,
): Promise<{ id: string; name: string } | null> {
  const r = await fetch(`${API_BASE()}/vanlife/named-places`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(place),
    signal,
  });
  if (!r.ok) return null;
  return r.json();
}

export async function updateNamedPlace(
  id: string,
  data: Partial<NamedPlace>,
  signal?: AbortSignal,
): Promise<boolean> {
  const r = await fetch(`${API_BASE()}/vanlife/named-places/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal,
  });
  return r.ok;
}

export async function deleteNamedPlace(id: string, signal?: AbortSignal): Promise<boolean> {
  const r = await fetch(`${API_BASE()}/vanlife/named-places/${id}`, {
    method: 'DELETE',
    signal,
  });
  return r.ok;
}

/* ── Helpers ───────────────────────────────────────────────────────── */

export const PLACE_CATEGORY_ICONS: Record<string, string> = {
  home: '🏠',
  wild_camping: '🏕️',
  climbing: '🧗',
  gym: '💪',
  grocery: '🛒',
  laundry: '👕',
  coffee: '☕',
  friend: '👥',
  work: '💼',
  mechanic: '🔧',
  hospital: '🏥',
  fuel: '⛽',
  skatepark: '🛹',
  surf: '🏄',
  other: '📌',
};

export const PLACE_CATEGORIES = Object.keys(PLACE_CATEGORY_ICONS);

/** Haversine distance in meters between two lat/lon points */
export function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Total polyline distance */
export function polylineDistanceM(coords: [number, number][]): number {
  let d = 0;
  for (let i = 1; i < coords.length; i++) {
    d += haversineM(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]);
  }
  return d;
}

/** Find named place containing a coordinate */
export function placeForCoord(
  lat: number,
  lon: number,
  places: NamedPlace[],
): NamedPlace | null {
  for (const p of places) {
    if (haversineM(lat, lon, p.lat, p.lon) <= p.radius_m) return p;
  }
  return null;
}

/** Merge nearby parking spots (same event, GPS jitter) */
export function mergeParkingSpots(spots: ParkingSpot[]): ParkingSpot[] {
  const MERGE_RADIUS_M = 50;
  const MERGE_GAP_MS = 30 * 60 * 1000;
  const merged: ParkingSpot[] = [];
  const used = new Set<number>();

  for (let i = 0; i < spots.length; i++) {
    if (used.has(i)) continue;
    const group = [spots[i]];
    used.add(i);
    for (let j = i + 1; j < spots.length; j++) {
      if (used.has(j)) continue;
      const gLast = group[group.length - 1];
      if (
        haversineM(gLast.lat, gLast.lon, spots[j].lat, spots[j].lon) < MERGE_RADIUS_M &&
        Math.abs(spots[j].start_ts - (gLast.start_ts + gLast.duration_s * 1000)) < MERGE_GAP_MS
      ) {
        group.push(spots[j]);
        used.add(j);
      }
    }
    // Use centroid of group
    const lat = group.reduce((s, p) => s + p.lat, 0) / group.length;
    const lon = group.reduce((s, p) => s + p.lon, 0) / group.length;
    const totalDuration = group.reduce((s, p) => s + p.duration_s, 0);
    merged.push({
      lat,
      lon,
      start_ts: group[0].start_ts,
      duration_s: totalDuration,
      point_count: group.reduce((s, p) => s + p.point_count, 0),
    });
  }
  return merged;
}
