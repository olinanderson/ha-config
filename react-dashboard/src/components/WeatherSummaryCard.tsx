/**
 * WeatherSummaryCard — the compact "glance" weather card for the Home page.
 *
 * Hub-and-spoke: Home shows just current conditions + today's hi/lo + a
 * severe-alert badge (only when active); tapping opens the full Environment tab
 * (forecast, radar, wind, alerts, search). Reuses the same Open-Meteo + NWS
 * hooks as the full cards, so there's no duplicated fetch logic.
 */
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, ChevronRight, Cloud, MapPin } from 'lucide-react';
import { useEntity } from '@/hooks/useEntity';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { fmt } from '@/lib/utils';
import { useOpenMeteoWeather, wmo } from './WeatherCard';
import { useNwsAlerts } from './NwsAlertsCard';

export function WeatherSummaryCard() {
  const gps = useEntity('device_tracker.ublox_gps');
  const lat = Number(gps?.attributes?.latitude);
  const lon = Number(gps?.attributes?.longitude);
  const latOk = Number.isFinite(lat);
  const lonOk = Number.isFinite(lon);

  const { data } = useOpenMeteoWeather(latOk ? lat : undefined, lonOk ? lon : undefined);
  const { alerts } = useNwsAlerts(latOk ? lat : undefined, lonOk ? lon : undefined);
  const place = useReverseGeocode(latOk ? lat : undefined, lonOk ? lon : undefined);

  const cur = data?.current;
  const daily = data?.daily;
  const Icon = cur ? wmo(cur.code, cur.isDay).Icon : Cloud;
  const open = () => {
    window.location.hash = 'environment';
  };

  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary/40"
      onClick={open}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-9 w-9 text-foreground/90" />
            <div>
              <p className="text-2xl font-bold leading-none tabular-nums">
                {cur ? `${fmt(cur.temp, 0)}°` : '—'}
              </p>
              <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                {cur ? wmo(cur.code, cur.isDay).label : 'Weather'}
              </p>
            </div>
          </div>
          <div className="space-y-0.5 text-right">
            {daily && daily.tmax.length > 0 && (
              <p className="text-xs tabular-nums text-muted-foreground">
                ↑{Math.round(daily.tmax[0])}° ↓{Math.round(daily.tmin[0])}°
              </p>
            )}
            {place && (
              <p className="flex items-center justify-end gap-0.5 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {place}
              </p>
            )}
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 rounded-md bg-red-500/15 px-2 py-1 text-xs font-medium text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            {alerts.length} weather alert{alerts.length > 1 ? 's' : ''} — tap for details
          </div>
        )}

        <div className="mt-2 flex items-center justify-end gap-0.5 text-[11px] text-muted-foreground">
          Forecast, radar &amp; wind
          <ChevronRight className="h-3 w-3" />
        </div>
      </CardContent>
    </Card>
  );
}
