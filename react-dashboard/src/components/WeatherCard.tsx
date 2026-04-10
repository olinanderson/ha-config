import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntity } from '@/hooks/useEntity';
import { fmt } from '@/lib/utils';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, CloudDrizzle, CloudFog } from 'lucide-react';
import type { ElementType } from 'react';

const weatherIcons: Record<string, ElementType> = {
  sunny: Sun,
  'clear-night': Sun,
  cloudy: Cloud,
  partlycloudy: Cloud,
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

export function WeatherCard() {
  const weather = useEntity('weather.pirateweather');
  if (!weather) return null;

  const state = weather.state;
  const attrs = weather.attributes;
  const temp = attrs.temperature;
  const humidity = attrs.humidity;
  const windSpeed = attrs.wind_speed;
  const Icon = weatherIcons[state] || Cloud;
  const forecast: any[] = attrs.forecast ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold tabular-nums">{fmt(temp, 0)}°C</p>
            <p className="text-sm text-muted-foreground capitalize">
              {state?.replace(/-/g, ' ').replace(/_/g, ' ')}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-muted-foreground">Humidity: {fmt(humidity, 0)}%</p>
            <p className="text-xs text-muted-foreground">Wind: {fmt(windSpeed, 0)} km/h</p>
          </div>
        </div>
        {forecast.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {forecast.slice(0, 5).map((f: any, i: number) => {
              const FIcon = weatherIcons[f.condition] || Cloud;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-0.5 min-w-[3.5rem] text-xs"
                >
                  <span className="text-muted-foreground">
                    {new Date(f.datetime).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                  <FIcon className="h-4 w-4" />
                  <span className="font-medium tabular-nums">{Math.round(f.temperature)}°</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
