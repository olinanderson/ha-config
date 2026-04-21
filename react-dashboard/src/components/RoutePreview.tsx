/**
 * RoutePreview — small Leaflet map showing last 48h of van route
 * Clicking navigates to the full Map tab.
 */
import { useEffect, useRef, useState } from 'react';
import { useEntity } from '@/hooks/useEntity';
import { fetchFilteredGps } from '@/lib/vanlife-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

export function RoutePreview({ onNavigateToMap, tall = false }: { onNavigateToMap?: () => void; tall?: boolean }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [pointCount, setPointCount] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const starlink = useEntity('device_tracker.starlink_device_location');
  const currentLat = starlink?.attributes?.latitude as number | undefined;
  const currentLon = starlink?.attributes?.longitude as number | undefined;

  useEffect(() => {
    let destroyed = false;
    // Capture lat/lon at mount time — don't re-run when GPS updates
    const initLat = currentLat;
    const initLon = currentLon;

    const init = async () => {
      if (!mapRef.current) return;
      const L = (await import('leaflet')).default;

      if (destroyed || !mapRef.current) return;

      // Create map
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      leafletRef.current = map;

      // Fetch last 48h
      const now = Date.now();
      const from = new Date(now - 48 * 3600_000);
      const to = new Date(now);

      try {
        const data = await fetchFilteredGps(from, to);
        if (destroyed || !data) return;

        const allPoints: [number, number][] = [];
        let totalDist = 0;

        for (const seg of data.segments) {
          if (seg.points.length > 0) {
            const pts: [number, number][] = seg.points.map((p: any) => [p.lat, p.lon]);
            allPoints.push(...pts);
            totalDist += seg.distance_m;
            L.polyline(pts, { color: '#3b82f6', weight: 3, opacity: 0.85 }).addTo(map);
          }
          if (seg.routed_geometry && seg.routed_geometry.length > 0) {
            L.polyline(seg.routed_geometry, { color: '#60a5fa', weight: 2, opacity: 0.5, dashArray: '4,4' }).addTo(map);
          }
        }

        setPointCount(allPoints.length);
        setDistanceKm(Math.round(totalDist / 1000));

        for (const spot of data.parking_spots) {
          L.circleMarker([spot.lat, spot.lon], {
            radius: 4,
            fillColor: '#f59e0b',
            fillOpacity: 0.9,
            color: '#fff',
            weight: 1,
          }).addTo(map);
        }

        // Current position marker
        if (initLat && initLon) {
          const icon = L.divIcon({
            html: `<div style="width:12px;height:12px;border-radius:50%;background:#22d3ee;border:2px solid #fff;box-shadow:0 0 6px #22d3ee"></div>`,
            className: '',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });
          L.marker([initLat, initLon], { icon }).addTo(map);
        }

        // Fit bounds to all points
        if (allPoints.length > 0) {
          map.fitBounds(L.latLngBounds(allPoints), { padding: [16, 16], maxZoom: 12 });
        } else if (initLat && initLon) {
          map.setView([initLat, initLon], 10);
        }
      } catch (e: any) {
        if (!destroyed) setError(e.message);
      }

      setLoading(false);
    };

    init();
    return () => {
      destroyed = true;
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []); // run once on mount — GPS updates must not retrigger

  // When used inside WeatherMapCard (tall=true), render without Card wrapper
  const mapContent = (
    <div className={`relative ${tall ? 'h-[360px]' : 'h-64'} w-full bg-black/20`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Navigation className="h-5 w-5 text-muted-foreground animate-pulse" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground px-4 text-center">
          {error}
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" style={{ background: '#1a1a2e' }} />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card/60 to-transparent pointer-events-none" />
      {!loading && pointCount > 0 && (
        <div className="absolute bottom-1.5 left-3 text-[10px] text-white/60 pointer-events-none">
          {distanceKm} km · last 48h
        </div>
      )}
      <div className="absolute bottom-1.5 right-2 text-[10px] text-white/50 pointer-events-none">
        Tap to open map
      </div>
    </div>
  );

  if (tall) {
    return (
      <div className="cursor-pointer" onClick={onNavigateToMap}>
        {mapContent}
      </div>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:ring-1 hover:ring-blue-500/50 transition-all overflow-hidden"
      onClick={onNavigateToMap}
    >
      <CardHeader className="pb-1 pt-3 px-4">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-blue-400" />
            Last 48h Route
          </span>
          <div className="flex items-center gap-2">
            {!loading && pointCount > 0 && (
              <span className="text-xs text-muted-foreground">{distanceKm} km</span>
            )}
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {mapContent}
      </CardContent>
    </Card>
  );
}
