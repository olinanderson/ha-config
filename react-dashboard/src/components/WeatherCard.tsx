/**
 * WeatherCard — weather for the van's LIVE GPS location (not a fixed HA point),
 * with a search bar to look up any other place.
 *
 * Data: Open-Meteo, fetched browser-direct keyed on the van's live GPS
 * (device_tracker.ublox_gps) — the same browser-direct pattern as WindWidget /
 * NwsAlertsCard. Type a place to pin a different location; tap the location chip
 * to snap back to "my location".
 *
 * The search dropdown FLIPS UP when the card is low on screen — this card lives
 * near the bottom of the Home page, so a downward dropdown would render below the
 * viewport fold where you can't tap it.
 */
import { useEffect, useRef, useState, type ElementType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntity } from '@/hooks/useEntity';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { fmt } from '@/lib/utils';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  MapPin,
  Navigation,
  Moon,
  CloudSun,
  Droplets,
  Search,
  X,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Meteogram } from './Meteogram';

// ─── WMO weather-code → label + icon (Open-Meteo uses WMO codes) ───
export function wmo(code: number | undefined, isDay = true): { label: string; Icon: ElementType } {
  const c = code ?? -1;
  if (c === 0) return { label: 'Clear', Icon: isDay ? Sun : Moon };
  if (c === 1) return { label: 'Mainly clear', Icon: isDay ? CloudSun : Moon };
  if (c === 2) return { label: 'Partly cloudy', Icon: CloudSun };
  if (c === 3) return { label: 'Overcast', Icon: Cloud };
  if (c === 45 || c === 48) return { label: 'Fog', Icon: CloudFog };
  if (c >= 51 && c <= 57) return { label: 'Drizzle', Icon: CloudDrizzle };
  if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return { label: 'Rain', Icon: CloudRain };
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return { label: 'Snow', Icon: CloudSnow };
  if (c >= 95) return { label: 'Thunderstorm', Icon: CloudLightning };
  return { label: 'Cloudy', Icon: Cloud };
}

export interface Wx {
  current: { temp: number; feels: number; humidity: number; wind: number; code: number; isDay: boolean };
  daily: {
    time: string[];
    code: number[];
    tmax: number[];
    tmin: number[];
    pop: number[];   // precipitation probability max, %
    psum: number[];  // precipitation sum, mm
  };
}

/** Fetch current + 7-day weather from Open-Meteo, keyed on ~1km-rounded lat/lon. */
export function useOpenMeteoWeather(lat?: number, lon?: number) {
  const [data, setData] = useState<Wx | null>(null);
  const [loading, setLoading] = useState(false);
  const latKey = lat != null && Number.isFinite(lat) ? lat.toFixed(2) : null;
  const lonKey = lon != null && Number.isFinite(lon) ? lon.toFixed(2) : null;

  // One effect owns both the on-change fetch and the 15-min refresh. `cancelled`
  // guards against a slow previous-location response overwriting the current one.
  useEffect(() => {
    if (latKey == null || lonKey == null) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latKey}&longitude=${lonKey}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum` +
          `&wind_speed_unit=kmh&timezone=auto&forecast_days=7`;
        const r = await fetch(url);
        const j = await r.json();
        if (cancelled) return;
        if (!j?.current || !j?.daily) throw new Error('bad payload');
        setData({
          current: {
            temp: j.current.temperature_2m,
            feels: j.current.apparent_temperature,
            humidity: j.current.relative_humidity_2m,
            wind: j.current.wind_speed_10m,
            code: j.current.weather_code,
            isDay: j.current.is_day === 1,
          },
          daily: {
            time: j.daily.time ?? [],
            code: j.daily.weather_code ?? [],
            tmax: j.daily.temperature_2m_max ?? [],
            tmin: j.daily.temperature_2m_min ?? [],
            pop: j.daily.precipitation_probability_max ?? [],
            psum: j.daily.precipitation_sum ?? [],
          },
        });
      } catch {
        /* keep last-good on transient failure */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [latKey, lonKey]);

  return { data, loading };
}

// ─── Location search (Open-Meteo geocoding — free, no key) ───
interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  country_code?: string;
}

const placeLabel = (r: GeoResult) => [r.name, r.admin1, r.country].filter(Boolean).join(', ');

function LocationSearch({ onPick }: { onPick: (r: GeoResult) => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding lookup with a stale-response guard.
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const id = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}` +
            `&count=8&language=en&format=json`,
        );
        const j = await r.json();
        if (!cancelled) {
          setResults(j.results ?? []);
          setOpen(true);
        }
      } catch {
        if (!cancelled) setResults([]);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [q]);

  // Decide flip direction whenever the dropdown becomes visible: if there isn't
  // room below the input (card is low on screen), open upward so results stay
  // on-screen and tappable.
  useEffect(() => {
    if (open && results.length && boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 240 && rect.top > 240);
    }
  }, [open, results.length]);

  // Close the dropdown on an outside click. IMPORTANT: this dashboard renders
  // inside Home Assistant's Shadow DOM (see panel-loader.js), where a document
  // listener's `event.target` is RETARGETED to the shadow host — so a tap on a
  // result would look "outside" boxRef and close the dropdown before the click
  // lands (the "I can see it but can't select it" bug). Use composedPath(),
  // which crosses shadow boundaries, and fall back to contains() outside shadows.
  useEffect(() => {
    const onDown = (e: Event) => {
      if (!boxRef.current) return;
      const path = (e as Event & { composedPath?: () => EventTarget[] }).composedPath?.();
      const inside = path
        ? path.includes(boxRef.current)
        : boxRef.current.contains(e.target as Node);
      if (!inside) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2 py-1.5">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search a location…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button
            onClick={() => { setQ(''); setResults([]); }}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div
          className={`absolute left-0 right-0 z-30 max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-xl ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                onPick(r);
                setQ('');
                setResults([]);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm hover:bg-accent"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{placeLabel(r)}</span>
            </button>
          ))}
        </div>
      )}
      {open && q.trim().length >= 2 && results.length === 0 && (
        <div
          className={`absolute left-0 right-0 z-30 rounded-lg border border-border bg-card px-2.5 py-2 text-xs text-muted-foreground shadow-xl ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          No matches — check spelling
        </div>
      )}
    </div>
  );
}

export function WeatherCard() {
  const ublox = useEntity('device_tracker.ublox_gps');
  const gpsLat = Number(ublox?.attributes?.latitude);
  const gpsLon = Number(ublox?.attributes?.longitude);

  const [override, setOverride] = useState<{ name: string; lat: number; lon: number } | null>(null);
  const usingGps = override == null;

  const lat = usingGps ? (Number.isFinite(gpsLat) ? gpsLat : undefined) : override!.lat;
  const lon = usingGps ? (Number.isFinite(gpsLon) ? gpsLon : undefined) : override!.lon;

  const gpsName = useReverseGeocode(usingGps ? lat : undefined, usingGps ? lon : undefined);
  const locationName = usingGps ? gpsName : override!.name;

  const { data, loading } = useOpenMeteoWeather(lat, lon);

  const cur = data?.current;
  const Icon = cur ? wmo(cur.code, cur.isDay).Icon : Cloud;
  const todayHi = data?.daily.tmax[0];
  const todayLo = data?.daily.tmin[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            Weather
          </span>
          {loading && <span className="text-xs font-normal text-muted-foreground">updating…</span>}
        </CardTitle>
        {locationName && (
          <button
            onClick={() => setOverride(null)}
            disabled={usingGps}
            className="-mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:cursor-default disabled:hover:text-muted-foreground"
            title={usingGps ? 'Showing your current location' : 'Back to my location'}
          >
            {usingGps ? <MapPin className="h-3 w-3" /> : <Navigation className="h-3 w-3 text-blue-400" />}
            {locationName}
            {!usingGps && <span className="text-blue-400">· my location</span>}
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <LocationSearch
          onPick={(r) => setOverride({ name: placeLabel(r), lat: r.latitude, lon: r.longitude })}
        />

        {!data ? (
          <p className="py-2 text-xs text-muted-foreground">
            {lat == null ? 'Waiting for GPS…' : 'Loading weather…'}
          </p>
        ) : (
          <>
            {/* Current conditions */}
            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <Icon className="h-11 w-11 text-foreground/90" />
                <div>
                  <p className="text-4xl font-bold leading-none tabular-nums">{fmt(cur!.temp, 0)}°</p>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">
                    {wmo(cur!.code, cur!.isDay).label}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-right text-xs text-muted-foreground">
                {todayHi != null && todayLo != null && (
                  <p className="flex items-center justify-end gap-1 tabular-nums">
                    <ArrowUp className="h-3 w-3" />{Math.round(todayHi)}°
                    <ArrowDown className="ml-1 h-3 w-3" />{Math.round(todayLo)}°
                  </p>
                )}
                <p className="tabular-nums">Feels {fmt(cur!.feels, 0)}°</p>
                <p className="flex items-center justify-end gap-1 tabular-nums">
                  <Droplets className="h-3 w-3" /> {fmt(cur!.humidity, 0)}%
                  <Wind className="ml-1 h-3 w-3" /> {fmt(cur!.wind, 0)}
                </p>
              </div>
            </div>

            {/* Combined 7-day + hourly meteogram (temp line + rain bars + mm) */}
            <Meteogram lat={lat} lon={lon} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
