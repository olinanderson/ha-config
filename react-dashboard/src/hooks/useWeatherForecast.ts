import { useState, useEffect } from 'react';
import { useHassStore } from '@/context/HomeAssistantContext';

export interface ForecastEntry {
  datetime: string;
  condition: string;
  temperature: number;
  templow: number;
  precipitation: number;
  precipitation_probability: number;
  humidity: number;
  wind_speed: number;
}

/**
 * Subscribe to Home Assistant's weather forecast via WebSocket.
 * Modern HA (2023.x+) no longer puts forecasts in entity attributes.
 */
export function useWeatherForecast(
  entityId: string,
  forecastType: 'daily' | 'hourly' | 'twice_daily' = 'daily',
): ForecastEntry[] {
  const store = useHassStore();
  const [forecast, setForecast] = useState<ForecastEntry[]>([]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let cancelled = false;

    async function subscribe() {
      const hass = store.hass;
      if (!hass?.connection) return;

      try {
        unsub = await hass.connection.subscribeMessage<{
          type: string;
          forecast: ForecastEntry[];
        }>(
          (msg) => {
            if (!cancelled && msg.forecast) {
              setForecast(msg.forecast);
            }
          },
          {
            type: 'weather/subscribe_forecast',
            forecast_type: forecastType,
            entity_id: entityId,
          },
        );
      } catch (e) {
        console.warn('Failed to subscribe to weather forecast:', e);
      }
    }

    subscribe();

    // Re-subscribe when hass reconnects
    const handleUpdate = () => {
      if (store.hass?.connection && !unsub) {
        subscribe();
      }
    };
    window.addEventListener('hass-updated', handleUpdate);

    return () => {
      cancelled = true;
      unsub?.();
      window.removeEventListener('hass-updated', handleUpdate);
    };
  }, [store, entityId, forecastType]);

  return forecast;
}
