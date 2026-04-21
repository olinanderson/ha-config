/**
 * WindWidget — compact wind card with Leaflet wind-arrow map + detailed overlay
 * Uses Open-Meteo free API. Wind arrows drawn as canvas markers on the map.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind, X, ChevronUp } from 'lucide-react';
import L from 'leaflet';

interface WindPoint {
  lat: number;
  lon: number;
  speed: number;
  dir: number;
  gust: number;
}

interface WindData {
  current: { windspeed: number; windgusts: number; winddirection: number };
  hourly: {
    time: string[];
    windspeed_10m: number[];
    windgusts_10m: number[];
    winddirection_10m: number[];
  };
}

export function compassDir(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function windColor(speed: number): string {
  if (speed < 15) return '#22d3ee';
  if (speed < 30) return '#84cc16';
  if (speed < 50) return '#f59e0b';
  return '#ef4444';
}

/** Draw a wind arrow icon as a canvas data URL */
function windArrowIcon(speed: number, dir: number, size = 32): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2, cy = size / 2;
  const color = windColor(speed);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((dir * Math.PI) / 180);

  // Arrow shaft
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.35);
  ctx.lineTo(0, -size * 0.35);
  ctx.stroke();

  // Arrowhead
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.42);
  ctx.lineTo(-size * 0.18, -size * 0.15);
  ctx.lineTo(size * 0.18, -size * 0.15);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
  return canvas.toDataURL();
}

function useWindData(lat: number | undefined, lon: number | undefined) {
  const [data, setData] = useState<WindData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    if (!lat || !lon) return;
    setLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
        + `&current=windspeed_10m,windgusts_10m,winddirection_10m`
        + `&hourly=windspeed_10m,windgusts_10m,winddirection_10m`
        + `&windspeed_unit=kmh&forecast_days=2&timezone=auto`;
      const r = await fetch(url);
      const j = await r.json();
      setData({
        current: { windspeed: j.current.windspeed_10m, windgusts: j.current.windgusts_10m, winddirection: j.current.winddirection_10m },
        hourly: { time: j.hourly.time, windspeed_10m: j.hourly.windspeed_10m, windgusts_10m: j.hourly.windgusts_10m, winddirection_10m: j.hourly.winddirection_10m },
      });
    } catch (_) {}
    setLoading(false);
  }, [lat, lon]);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => {
    const id = setInterval(fetch_, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetch_]);

  return { data, loading };
}

/** Fetch a grid of wind points around a lat/lon using Open-Meteo */
async function fetchWindGrid(centerLat: number, centerLon: number, zoom: number): Promise<WindPoint[]> {
  // Generate a sparse grid of points covering roughly the visible map area
  const spread = zoom <= 5 ? 8 : zoom <= 7 ? 4 : 2;
  const step = zoom <= 5 ? 2.5 : zoom <= 7 ? 1.5 : 0.8;
  const points: { lat: number; lon: number }[] = [];
  for (let dlat = -spread; dlat <= spread; dlat += step * 1.2) {
    for (let dlon = -spread; dlon <= spread; dlon += step) {
      points.push({ lat: centerLat + dlat, lon: centerLon + dlon });
    }
  }

  // Open-Meteo doesn't support batch requests, so limit grid size
  const grid = points.slice(0, 16);
  const results: WindPoint[] = [];

  await Promise.all(grid.map(async (p) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat.toFixed(2)}&longitude=${p.lon.toFixed(2)}`
        + `&current=windspeed_10m,winddirection_10m&windspeed_unit=kmh&forecast_days=1&timezone=auto`;
      const r = await fetch(url);
      const j = await r.json();
      results.push({ lat: p.lat, lon: p.lon, speed: j.current.windspeed_10m, dir: j.current.winddirection_10m, gust: 0 });
    } catch (_) {}
  }));

  return results;
}

// ─── Leaflet wind map ───

function WindLeafletMap({ lat, lon, zoom = 6, height = 'h-52' }: { lat: number; lon: number; zoom?: number; height?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
    }).setView([lat, lon], zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', { maxZoom: 12 }).addTo(map);

    // Current position dot
    const icon = L.divIcon({
      html: `<div style="width:10px;height:10px;border-radius:50%;background:#22d3ee;border:2px solid #fff;box-shadow:0 0 6px #22d3ee"></div>`,
      className: '', iconSize: [10, 10], iconAnchor: [5, 5],
    });
    L.marker([lat, lon], { icon }).addTo(map);

    mapRef.current = map;

    // Load wind grid
    fetchWindGrid(lat, lon, zoom).then((pts) => {
      if (!mapRef.current) return;
      // Clear old markers
      markersRef.current.forEach(m => mapRef.current?.removeLayer(m));
      markersRef.current = [];

      pts.forEach((p) => {
        const dataUrl = windArrowIcon(p.speed, p.dir, 28);
        const arrowIcon = L.icon({ iconUrl: dataUrl, iconSize: [28, 28], iconAnchor: [14, 14] });
        const m = L.marker([p.lat, p.lon], { icon: arrowIcon, interactive: false });
        m.addTo(mapRef.current!);
        // Speed label
        const labelIcon = L.divIcon({
          html: `<span style="color:${windColor(p.speed)};font-size:9px;font-weight:600;white-space:nowrap;text-shadow:0 1px 2px #000">${Math.round(p.speed)}</span>`,
          className: '', iconSize: [28, 12], iconAnchor: [14, -16],
        });
        const lbl = L.marker([p.lat, p.lon], { icon: labelIcon, interactive: false });
        lbl.addTo(mapRef.current!);
        markersRef.current.push(m, lbl);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // init once

  return <div ref={divRef} className={`w-full ${height}`} />;
}

// ─── Detail Overlay ───

export function WindDetailOverlay({ lat, lon, onClose }: { lat: number; lon: number; onClose: () => void }) {
  const { data, loading } = useWindData(lat, lon);
  const now = Date.now();

  const hours = data
    ? data.hourly.time
        .map((t, i) => ({ t: new Date(t).getTime(), i }))
        .filter(({ t }) => t >= now - 3600_000 && t <= now + 24 * 3600_000)
        .slice(0, 25)
    : [];

  const maxSpeed = data ? Math.max(60, ...hours.map(({ i }) => data.hourly.windgusts_10m[i])) : 60;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2 font-semibold">
            <Wind className="h-4 w-4 text-blue-400" />
            Wind
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>

        {loading && <div className="text-sm text-muted-foreground text-center py-8">Loading…</div>}

        {data && (
          <>
            {/* Wind map — Windfinder-style arrows */}
            <div className="h-56 rounded-none overflow-hidden">
              <WindLeafletMap lat={lat} lon={lon} zoom={6} height="h-full" />
            </div>

            {/* Current summary */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <div>
                  <span className="text-3xl font-bold tabular-nums" style={{ color: windColor(data.current.windspeed) }}>
                    {Math.round(data.current.windspeed)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1.5">km/h</span>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {compassDir(data.current.winddirection)} · gusts {Math.round(data.current.windgusts)} km/h
                  </div>
                </div>
                <div
                  className="text-blue-400"
                  style={{ transform: `rotate(${data.current.winddirection}deg)`, fontSize: 40 }}
                  title={`${data.current.winddirection}°`}
                >
                  ↑
                </div>
              </div>

              {/* 24h chart */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Next 24 Hours</div>
                <div className="space-y-1.5">
                  {hours.map(({ t, i }) => {
                    const speed = data.hourly.windspeed_10m[i];
                    const gust = data.hourly.windgusts_10m[i];
                    const dir = data.hourly.winddirection_10m[i];
                    const label = new Date(t).toLocaleTimeString([], { hour: 'numeric', hour12: true });
                    const isNow = Math.abs(t - now) < 3600_000;
                    return (
                      <div key={i} className={`grid items-center gap-2 text-xs ${isNow ? 'text-foreground' : 'text-muted-foreground'}`}
                        style={{ gridTemplateColumns: '3.5rem 1.2rem 1fr 3.5rem 2.5rem' }}>
                        <span className={isNow ? 'font-semibold text-blue-400' : ''}>{label}</span>
                        <span style={{ transform: `rotate(${dir}deg)`, display: 'inline-block', color: windColor(speed) }}>↑</span>
                        <div className="h-1.5 rounded-full bg-white/10">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (speed / maxSpeed) * 100)}%`, backgroundColor: windColor(speed) }} />
                        </div>
                        <span className="tabular-nums text-right">{Math.round(speed)} km/h</span>
                        <span className="tabular-nums text-right text-orange-400/80">↑{Math.round(gust)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Compact Widget ───

export function WindWidget({ lat, lon }: { lat: number | undefined; lon: number | undefined }) {
  const [showDetail, setShowDetail] = useState(false);
  const { data, loading } = useWindData(lat, lon);

  if (!lat || !lon) return null;

  return (
    <>
      <Card className="cursor-pointer hover:bg-accent/20 transition-colors overflow-hidden" onClick={() => setShowDetail(true)}>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5 text-blue-400" />
              Wind
            </span>
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Leaflet wind map */}
          <div className="h-44 overflow-hidden">
            <WindLeafletMap lat={lat} lon={lon} zoom={6} height="h-full" />
          </div>
          {/* Current stats bar */}
          {data && (
            <div className="px-4 py-2 flex items-center justify-between">
              <div>
                <span className="text-xl font-bold tabular-nums" style={{ color: windColor(data.current.windspeed) }}>
                  {Math.round(data.current.windspeed)}
                </span>
                <span className="text-xs text-muted-foreground ml-1">km/h</span>
                <span className="text-xs text-muted-foreground ml-2">{compassDir(data.current.winddirection)}</span>
              </div>
              <div className="text-xs text-muted-foreground">gusts {Math.round(data.current.windgusts)} km/h</div>
            </div>
          )}
          {loading && <div className="text-xs text-muted-foreground px-4 pb-2">Loading…</div>}
        </CardContent>
      </Card>
      {showDetail && (
        <WindDetailOverlay lat={lat} lon={lon} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
