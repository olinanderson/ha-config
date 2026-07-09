/**
 * ConditionsCard — one card with a Radar | Wind segmented selector.
 *
 * Merges the old separate Radar and Windy cards. Radar uses the bare RadarPanel
 * sized to FILL the card (the old radar card was stretched to the Windy card's
 * height in a 2-col grid, leaving it half-empty). Wind is the Windy.com embed
 * (windfinder map with its own timeline). The Windy iframe is kept mounted once
 * first shown, so toggling back to it is instant instead of reloading.
 */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudRain, Wind } from 'lucide-react';
import { RadarPanel } from './RadarWidget';

function hassBaseUrl(): string {
  const hass = (window as unknown as { __HASS__?: { auth?: { data?: { hassUrl?: string } } } }).__HASS__;
  return hass?.auth?.data?.hassUrl || `${window.location.protocol}//${window.location.hostname}:8123`;
}

export function ConditionsCard({ lat, lon }: { lat?: number; lon?: number }) {
  const [view, setView] = useState<'radar' | 'wind'>('radar');
  const [seenWind, setSeenWind] = useState(false);
  useEffect(() => {
    if (view === 'wind') setSeenWind(true);
  }, [view]);

  if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  // Round to ~1km so the Windy iframe src stays stable across GPS jitter.
  const windyUrl =
    `${hassBaseUrl()}/local/react-dashboard/windy-route.html` +
    `?lat=${lat.toFixed(2)}&lon=${lon.toFixed(2)}&zoom=7&overlay=wind`;

  const tab = (id: 'radar' | 'wind', Icon: typeof CloudRain, label: string) => (
    <button
      onClick={() => setView(id)}
      className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
        view === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            {view === 'radar' ? <CloudRain className="h-4 w-4 text-blue-400" /> : <Wind className="h-4 w-4 text-cyan-400" />}
            {view === 'radar' ? 'Radar' : 'Wind'}
          </span>
          <div className="flex items-center rounded-lg bg-muted/40 p-0.5 text-xs">
            {tab('radar', CloudRain, 'Radar')}
            {tab('wind', Wind, 'Wind')}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Radar mounts on demand (Leaflet map re-inits cheaply). */}
        {view === 'radar' && (
          <div className="px-4 pb-4">
            <RadarPanel lat={lat} lon={lon} mapClassName="h-[380px]" />
          </div>
        )}
        {/* Windy: kept mounted once first opened, just hidden, so toggling is instant. */}
        {seenWind && (
          <iframe
            key={windyUrl}
            src={windyUrl}
            title="Windy wind map"
            className="w-full border-0"
            style={{ height: 440, display: view === 'wind' ? 'block' : 'none' }}
            allow="fullscreen"
            loading="lazy"
          />
        )}
      </CardContent>
    </Card>
  );
}
