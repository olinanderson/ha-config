import { useState, useEffect, useRef } from 'react';

/**
 * Reverse-geocode lat/lon to a human-readable location name.
 * Uses OpenStreetMap Nominatim (free, no API key).
 * Caches result per ~0.01° grid cell to avoid excessive requests.
 */

const cache = new Map<string, string>();

function cacheKey(lat: number, lon: number): string {
  // Round to ~1km grid to avoid re-fetching on tiny GPS drift
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

export function useReverseGeocode(
  lat: number | undefined | null,
  lon: number | undefined | null,
): string | null {
  const [location, setLocation] = useState<string | null>(null);
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (lat == null || lon == null) return;
    const key = cacheKey(lat, lon);
    if (key === lastKey.current) return;
    lastKey.current = key;

    // Check cache
    const cached = cache.get(key);
    if (cached) {
      setLocation(cached);
      return;
    }

    let cancelled = false;
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;

    fetch(url, {
      headers: { 'User-Agent': 'VanDashboard/1.0' },
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const addr = data.address;
        // Build a short location string: "City, State" or "Town, State" etc.
        const city =
          addr?.city || addr?.town || addr?.village || addr?.hamlet || addr?.county || '';
        const state = addr?.state || addr?.province || '';
        const country = addr?.country_code?.toUpperCase() || '';
        let result = '';
        if (city && state) {
          result = `${city}, ${state}`;
        } else if (city) {
          result = city;
        } else if (state) {
          result = state;
        } else if (data.display_name) {
          // Fallback: first two parts of display_name
          result = data.display_name.split(',').slice(0, 2).join(',').trim();
        }
        if (result && country && !result.includes(country)) {
          // Don't append if it's already there
        }
        cache.set(key, result);
        setLocation(result);
      })
      .catch(() => {
        if (!cancelled) {
          // Fallback to coordinates
          const fallback = `${Number(lat).toFixed(2)}°, ${Number(lon).toFixed(2)}°`;
          cache.set(key, fallback);
          setLocation(fallback);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return location;
}
