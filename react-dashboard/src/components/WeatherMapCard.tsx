/**
 * WeatherMapCard — Windy + route via standalone windy-route.html (Wind/Rain toggle)
 */
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wind, CloudRain, Loader2 } from 'lucide-react';

type WindyLayer = 'wind' | 'rain';

function getWindyRouteUrl(lat: number, lon: number, layer: WindyLayer): string {
  const hass = (window as any).__HASS__;
  const hassUrl = hass?.auth?.data?.hassUrl || `${window.location.protocol}//${window.location.hostname}:8123`;
  const isHttps = hassUrl.startsWith('https');
  const apiBase = isHttps ? hassUrl + '/api' : hassUrl.replace(':8123', ':8765');
  const token = hass?.auth?.data?.access_token || '';
  return `${hassUrl}/local/react-dashboard/windy-route.html`
    + `?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`
    + `&zoom=7&layer=${layer}`
    + `&api=${encodeURIComponent(apiBase)}`
    + `&token=${encodeURIComponent(token)}`;
}

export function WeatherMapCard({ lat, lon }: { lat: number | undefined; lon: number | undefined }) {
  const [layer, setLayer] = useState<WindyLayer>('rain');
  const [loaded, setLoaded] = useState(false);

  if (!lat || !lon) return null;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center border-b border-border bg-card px-3 py-2 gap-2">
        <span className="text-sm font-medium mr-1">Weather</span>
        <button
          onClick={() => { setLayer('wind'); setLoaded(false); }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            layer === 'wind' ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <Wind className="h-3.5 w-3.5" /> Wind
        </button>
        <button
          onClick={() => { setLayer('rain'); setLoaded(false); }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            layer === 'rain' ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <CloudRain className="h-3.5 w-3.5" /> Rain
        </button>
        <span className="ml-auto text-xs text-muted-foreground/50">Route = last 48h</span>
      </div>
      <CardContent className="p-0">
        <div className="relative h-[480px]">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 pointer-events-none">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
          )}
          <iframe
            key={layer}
            src={getWindyRouteUrl(lat, lon, layer)}
            className="w-full h-full border-0"
            title="Windy weather map"
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onLoad={() => setLoaded(true)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
