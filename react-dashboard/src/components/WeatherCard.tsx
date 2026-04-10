import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntity } from '@/hooks/useEntity';
import { useWeatherForecast } from '@/hooks/useWeatherForecast';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { fmt, timeAgo } from '@/lib/utils';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  CloudDrizzle,
  CloudFog,
  MapPin,
  Moon,
  CloudSun,
  Droplets,
} from 'lucide-react';
import type { ElementType } from 'react';

const weatherIcons: Record<string, ElementType> = {
  sunny: Sun,
  'clear-night': Moon,
  cloudy: Cloud,
  partlycloudy: CloudSun,
  rainy: CloudRain,
  pouring: CloudRain,
  snowy: CloudSnow,
  'snowy-rainy': CloudSnow,
  windy: Wind,
  'windy-variant': Wind,
  fog: CloudFog,
  hail: CloudDrizzle,
  lightning: CloudDrizzle,
  'lightning-rainy': CloudRain,
};

function conditionLabel(state: string) {
  return state?.replace(/-/g, ' ').replace(/_/g, ' ') ?? '';
}

export function WeatherCard() {
  const weather = useEntity('weather.pirateweather');
  const starlink = useEntity('device_tracker.starlink_device_location');
  const forecast = useWeatherForecast('weather.pirateweather', 'daily');

  // Location from Starlink GPS — reverse geocoded (must be before early return)
  const lat = starlink?.attributes?.latitude;
  const lon = starlink?.attributes?.longitude;
  const locationStr = useReverseGeocode(lat, lon);

  if (!weather) return null;

  const state = weather.state;
  const attrs = weather.attributes;
  const temp = attrs.temperature;
  const humidity = attrs.humidity;
  const windSpeed = attrs.wind_speed;
  const Icon = weatherIcons[state] || Cloud;
  const updated = weather.last_updated;

  // Find hi/lo range across forecast for bar scaling
  const forecastSlice = forecast.slice(0, 7);
  const allTemps = forecastSlice.flatMap((f) => [f.temperature, f.templow]);
  const minT = allTemps.length > 0 ? Math.min(...allTemps) : 0;
  const maxT = allTemps.length > 0 ? Math.max(...allTemps) : 30;
  const range = maxT - minT || 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            Weather
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {timeAgo(updated)}
          </span>
        </CardTitle>
        {locationStr && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 -mt-1">
            <MapPin className="h-3 w-3" />
            {locationStr}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current conditions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold tabular-nums">{fmt(temp, 0)}°C</p>
            <p className="text-sm text-muted-foreground capitalize">{conditionLabel(state)}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Droplets className="h-3 w-3" /> {fmt(humidity, 0)}%
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Wind className="h-3 w-3" /> {fmt(windSpeed, 0)} km/h
            </p>
          </div>
        </div>

        {/* 7-day forecast */}
        {forecastSlice.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">7-Day Forecast</p>
            {forecastSlice.map((f, i) => {
              const FIcon = weatherIcons[f.condition] || Cloud;
              const d = new Date(f.datetime);
              const isToday = i === 0;
              const dayLabel = isToday
                ? 'Today'
                : d.toLocaleDateString(undefined, { weekday: 'short' });
              const lo = f.templow;
              const hi = f.temperature;
              // Bar position: fraction of range
              const loFrac = ((lo - minT) / range) * 100;
              const hiFrac = ((hi - minT) / range) * 100;
              const barColor =
                hi > 30
                  ? 'bg-red-500'
                  : hi > 20
                    ? 'bg-orange-400'
                    : hi > 10
                      ? 'bg-yellow-400'
                      : hi > 0
                        ? 'bg-blue-400'
                        : 'bg-blue-600';

              return (
                <div
                  key={i}
                  className="grid items-center gap-1 text-xs"
                  style={{ gridTemplateColumns: '2.5rem 1.25rem 1fr 2rem 2rem' }}
                >
                  <span
                    className={`truncate ${isToday ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                  >
                    {dayLabel}
                  </span>
                  <FIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="relative h-2 rounded-full bg-muted">
                    <div
                      className={`absolute inset-y-0 rounded-full ${barColor}`}
                      style={{
                        left: `${loFrac}%`,
                        right: `${100 - hiFrac}%`,
                      }}
                    />
                  </div>
                  <span className="text-right tabular-nums text-muted-foreground">
                    {Math.round(lo)}°
                  </span>
                  <span className="text-right tabular-nums font-medium">{Math.round(hi)}°</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Precipitation row if any day has > 0% */}
        {forecastSlice.some((f) => f.precipitation_probability > 0) && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {forecastSlice.map((f, i) => {
              const prob = f.precipitation_probability;
              const d = new Date(f.datetime);
              const dayLabel =
                i === 0 ? 'Tod' : d.toLocaleDateString(undefined, { weekday: 'short' });
              return (
                <div key={i} className="flex flex-col items-center gap-0.5 min-w-[2.5rem] text-xs">
                  <span className="text-muted-foreground">{dayLabel}</span>
                  <div className="h-6 w-3 rounded-sm bg-muted relative overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full bg-blue-400 rounded-sm"
                      style={{ height: `${prob}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground tabular-nums">{prob}%</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
