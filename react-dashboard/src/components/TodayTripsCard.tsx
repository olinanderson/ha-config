/**
 * TodayTripsCard — small Home-screen card: a static map thumbnail of today's
 * driving plus a quick summary (trips, distance, drive time, fuel, battery).
 * Tapping it jumps to the full Vanlife Map page.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Map as MapIcon, Loader2 } from 'lucide-react';
import { useEntity } from '@/hooks/useEntity';
import {
  fetchFilteredGps,
  fetchFuelTrips,
  mergeParkingSpots,
  haversineM,
  polylineDistanceM,
  type FuelTripApi,
} from '@/lib/vanlife-api';

function fmtDuration(sec: number): string {
  if (sec <= 0) return '0m';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Same fuel-economy stroke thresholds as the full map (3.5 EcoBoost Transit). */
function segmentColor(l100km?: number): string {
  if (l100km == null) return '#3b82f6';
  if (l100km < 16) return '#4ade80';
  if (l100km < 22) return '#fbbf24';
  return '#f87171';
}

/** Find the fuel/battery trip that best overlaps a GPS segment by timestamp. */
function tripForSegment(segStart: number, segEnd: number, trips: FuelTripApi[]): FuelTripApi | null {
  const overlapping = trips.filter(t => t.start_ts <= segEnd && t.end_ts >= segStart);
  if (!overlapping.length) return null;
  return overlapping.reduce((best, t) => {
    const o = Math.min(t.end_ts, segEnd) - Math.max(t.start_ts, segStart);
    const bo = Math.min(best.end_ts, segEnd) - Math.max(best.start_ts, segStart);
    return o > bo ? t : best;
  });
}

interface Summary {
  trips: number;
  km: number;
  driveSec: number;
  fuelL: number | null;
  battWh: number | null;
  battPct: number | null;
}

export function TodayTripsCard() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const vanMarkerRef = useRef<L.Marker | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTrips, setHasTrips] = useState(false);

  // Current van location (same tracker fallback as the full map).
  const vanTracker1 = useEntity('device_tracker.vanlife_tracker_van_location');
  const vanTracker2 = useEntity('device_tracker.ublox_gps');
  const vanTracker3 = useEntity('device_tracker.ublox_gps_filtered');
  const vanPos = useMemo((): [number, number] | null => {
    for (const e of [vanTracker1, vanTracker2, vanTracker3]) {
      const lat = Number(e?.attributes?.latitude);
      const lon = Number(e?.attributes?.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lon) && (lat !== 0 || lon !== 0)) {
        return [lat, lon];
      }
    }
    return null;
  }, [vanTracker1, vanTracker2, vanTracker3]);

  // Init a static, non-interactive thumbnail map.
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    }).setView([39.5, -98.35], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
      layerRef.current = null;
      vanMarkerRef.current = null;
    };
  }, []);

  // Van marker (always shown) + recenter on the van when there's no route.
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (vanPos) {
      if (!vanMarkerRef.current) {
        const icon = L.divIcon({
          html: '<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;background:#e53935;border:2px solid #b71c1c;border-radius:50%;font-size:14px;box-shadow:0 2px 5px rgba(0,0,0,0.4)">🚐</div>',
          className: '',
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        vanMarkerRef.current = L.marker(vanPos, { icon, zIndexOffset: 1000 }).addTo(map);
      } else {
        vanMarkerRef.current.setLatLng(vanPos);
      }
    } else {
      vanMarkerRef.current?.remove();
      vanMarkerRef.current = null;
    }
    // Keep the van framed when there's no route to fit: immediately during the
    // initial load, then (deferred + ref-guarded) once we've settled on no
    // trips. When trips exist, load()'s fitBounds owns the view — gating on
    // `loading`/`hasTrips` keeps this from racing that fitBounds.
    if (vanPos && loading) {
      map.invalidateSize();
      map.setView(vanPos, 13);
    } else if (vanPos && !hasTrips) {
      const t = setTimeout(() => {
        const m = mapInstance.current;
        if (!m) return;
        m.invalidateSize();
        m.setView(vanPos, 13);
      }, 60);
      return () => clearTimeout(t);
    }
  }, [vanPos, hasTrips, loading]);

  // Load the last 7 days of trips + draw, refresh every 5 min.
  useEffect(() => {
    let cancelled = false;
    let fitTimer: ReturnType<typeof setTimeout> | null = null;

    async function load() {
      const now = new Date();
      // Rolling last 7 days: end of today back 7 days.
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const start = new Date(end.getTime() - 7 * 86400000);
      try {
        const [data, fuelData] = await Promise.all([
          fetchFilteredGps(start, end),
          fetchFuelTrips(50),
        ]);
        if (cancelled) return;
        const trips = fuelData?.trips ?? [];
        const map = mapInstance.current;
        const layer = layerRef.current;
        layer?.clearLayers();

        // Driving segments with > 300 m displacement (matches the full map).
        const segs = (data?.segments ?? []).filter(s => {
          if (s.points.length < 2) return false;
          const a = s.points[0];
          const b = s.points[s.points.length - 1];
          return haversineM(a.lat, a.lon, b.lat, b.lon) > 300;
        });

        if (!segs.length) {
          setHasTrips(false);
          setSummary({ trips: 0, km: 0, driveSec: 0, fuelL: null, battWh: null, battPct: null });
          setLoading(false);
          return;
        }

        const allCoords: [number, number][] = [];
        let km = 0;
        let driveSec = 0;
        for (const seg of segs) {
          const geom = seg.routed_geometry && seg.routed_geometry.length >= 2
            ? seg.routed_geometry
            : seg.points.map(p => [p.lat, p.lon] as [number, number]);
          km += (seg.distance_m > 0 ? seg.distance_m : polylineDistanceM(geom)) / 1000;
          driveSec += (seg.points[seg.points.length - 1].ts - seg.points[0].ts) / 1000;
          const ft = tripForSegment(seg.start_ts, seg.end_ts, trips);
          if (layer) {
            L.polyline(geom, { color: segmentColor(ft?.l_per_100km), weight: 4, opacity: 0.9, lineJoin: 'round' }).addTo(layer);
          }
          allCoords.push(...geom);
        }

        // Stops
        const parking = mergeParkingSpots(data!.parking_spots);
        for (const pk of parking) {
          allCoords.push([pk.lat, pk.lon]);
          if (layer) {
            L.circleMarker([pk.lat, pk.lon], {
              radius: 3, color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.8, weight: 1,
            }).addTo(layer);
          }
        }

        // Fuel + battery totals over the window (sum the grouped trips that
        // started within the last 7 days)
        const s = start.getTime();
        const e = end.getTime();
        const windowTrips = trips.filter(t => t.start_ts >= s && t.start_ts < e);
        const anyFuel = windowTrips.some(t => t.l_per_100km != null);
        const anyBatt = windowTrips.some(t => t.battery_gain_wh != null);
        const fuelL = windowTrips.reduce(
          (acc, t) => acc + (t.l_per_100km != null && t.distance_km ? (t.l_per_100km * t.distance_km) / 100 : 0), 0);
        const battWh = windowTrips.reduce((acc, t) => acc + (t.battery_gain_wh ?? 0), 0);
        const battPct = windowTrips.reduce((acc, t) => acc + (t.battery_gain_pct ?? 0), 0);

        setHasTrips(true);
        setSummary({
          trips: segs.length, km, driveSec,
          fuelL: anyFuel ? fuelL : null,
          battWh: anyBatt ? battWh : null,
          battPct: anyBatt ? battPct : null,
        });
        setLoading(false);

        if (map && allCoords.length > 1) {
          // Defer so the card has laid out before Leaflet measures it. Re-read
          // the ref and bail if the card unmounted before the timer fired.
          fitTimer = setTimeout(() => {
            const m = mapInstance.current;
            if (cancelled || !m) return;
            m.invalidateSize();
            m.fitBounds(L.latLngBounds(allCoords), { padding: [18, 18], maxZoom: 14 });
          }, 60);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const iv = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(iv);
      if (fitTimer) clearTimeout(fitTimer);
    };
  }, []);

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => { window.location.hash = 'map'; }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <MapIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Last 7 Days</span>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ml-1" />}
        <span className="ml-auto text-xs text-muted-foreground">Open map →</span>
      </div>
      <CardContent className="p-0">
        <div className="relative h-[180px] bg-muted/30">
          <div ref={mapRef} className="absolute inset-0" />
        </div>
        <div className="px-3 py-2 text-xs">
          {hasTrips && summary ? (
            <div className="space-y-1">
              <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap font-medium tabular-nums">
                <span>🚐 {summary.trips} trip{summary.trips !== 1 ? 's' : ''}</span>
                <span>📏 {summary.km.toFixed(1)} km</span>
                <span>🚗 {fmtDuration(summary.driveSec)}</span>
              </div>
              {(summary.fuelL != null || summary.battPct != null) && (
                <div className="flex items-center gap-x-3 flex-wrap tabular-nums text-muted-foreground">
                  {summary.fuelL != null && <span>⛽ {summary.fuelL.toFixed(1)} L</span>}
                  {summary.battPct != null && (
                    <span className={summary.battPct >= 0 ? 'text-green-400' : 'text-orange-400'}>
                      🔋 {summary.battPct >= 0 ? '+' : '−'}{Math.abs(summary.battPct).toFixed(1)}%
                      {summary.battWh != null && ` (${summary.battWh >= 0 ? '+' : '−'}${Math.abs(summary.battWh)} Wh)`}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {loading ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Loading trips…</>
              ) : (
                <>🚐 No trips in the last 7 days{vanPos ? ' · showing current location' : ''}</>
              )}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
