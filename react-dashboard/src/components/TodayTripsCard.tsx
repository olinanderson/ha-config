/**
 * TodayTripsCard — small Home-screen card: a static map thumbnail of today's
 * driving plus a quick summary (trips, distance, drive time, fuel, battery).
 * Tapping it jumps to the full Vanlife Map page.
 */
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Map as MapIcon, Loader2 } from 'lucide-react';
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
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTrips, setHasTrips] = useState(false);

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
    };
  }, []);

  // Load today's trips + draw, refresh every 5 min.
  useEffect(() => {
    let cancelled = false;
    let fitTimer: ReturnType<typeof setTimeout> | null = null;

    async function load() {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start.getTime() + 86400000);
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

        // Today's fuel + battery totals (sum the grouped trips that started today)
        const s = start.getTime();
        const e = end.getTime();
        const todayTrips = trips.filter(t => t.start_ts >= s && t.start_ts < e);
        const anyFuel = todayTrips.some(t => t.l_per_100km != null);
        const anyBatt = todayTrips.some(t => t.battery_gain_wh != null);
        const fuelL = todayTrips.reduce(
          (acc, t) => acc + (t.l_per_100km != null && t.distance_km ? (t.l_per_100km * t.distance_km) / 100 : 0), 0);
        const battWh = todayTrips.reduce((acc, t) => acc + (t.battery_gain_wh ?? 0), 0);
        const battPct = todayTrips.reduce((acc, t) => acc + (t.battery_gain_pct ?? 0), 0);

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
        <span className="text-sm font-medium">Today's Trips</span>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ml-1" />}
        <span className="ml-auto text-xs text-muted-foreground">Open map →</span>
      </div>
      <CardContent className="p-0">
        <div className="relative h-[180px] bg-muted/30">
          <div ref={mapRef} className="absolute inset-0" />
          {!loading && !hasTrips && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-background/60 z-[400]">
              No trips yet today
            </div>
          )}
        </div>
        {summary && hasTrips && (
          <div className="px-3 py-2 text-xs space-y-1">
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
        )}
      </CardContent>
    </Card>
  );
}
