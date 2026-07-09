/**
 * Environment — consolidated weather / conditions tab (hub of the hub-and-spoke).
 *
 * Ordered top → bottom by urgency: active severe-weather alerts, then the Weather
 * card (current conditions + search + the combined meteogram: temperature line +
 * rain-chance bars + mm, hourly across 7 days), then a Radar/Wind selector card,
 * then a compact map preview that deep-links to the Map tab (the one authoritative
 * interactive map — not duplicated here).
 *
 * All widgets are GPS-anchored to device_tracker.ublox_gps.
 */
import { PageContainer } from '@/components/layout/PageContainer';
import { useEntity } from '@/hooks/useEntity';
import { WeatherCard } from '@/components/WeatherCard';
import { NwsAlertsCard } from '@/components/NwsAlertsCard';
import { ConditionsCard } from '@/components/ConditionsCard';
import { TodayTripsCard } from '@/components/TodayTripsCard';

export default function Environment() {
  const gps = useEntity('device_tracker.ublox_gps');
  const lat = gps?.attributes?.latitude as number | undefined;
  const lon = gps?.attributes?.longitude as number | undefined;

  return (
    <PageContainer title="Environment">
      <div className="space-y-4">
        {/* Active severe-weather alerts — renders nothing when clear / outside US */}
        <NwsAlertsCard lat={lat} lon={lon} />

        {/* Current conditions + search + combined meteogram (7-day + hourly) */}
        <WeatherCard />

        {/* Radar (time controls) / Wind (Windy windfinder) — one card, a selector */}
        <ConditionsCard lat={lat} lon={lon} />

        {/* Compact map preview → full Map tab */}
        <TodayTripsCard />
      </div>
    </PageContainer>
  );
}
