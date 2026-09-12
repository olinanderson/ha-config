/**
 * NwsAlertsCard — active NWS severe-weather alerts for the van's LIVE GPS point
 * (not a fixed home zone). Fetches api.weather.gov directly from the browser
 * (free, no key, US-only, CORS-enabled — same browser-direct pattern as
 * WindWidget hitting Open-Meteo). Tap an alert for the full text + a radar view.
 *
 * This is the visual layer only. Parked push-notifications are a separate HA-side
 * piece (proxy /vanlife/nws-alerts endpoint + rest sensor + automation) because
 * the browser can't drive HA automations and api.weather.gov needs a real
 * User-Agent server-side.
 */
import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarWidget } from './RadarWidget';

const SEV_RANK: Record<string, number> = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1, Unknown: 0 };

// Points NWS has rejected with 400 (outside US coverage, e.g. Canada).
// A 400 for a given ~1km point is deterministic — remembering it module-wide
// stops every card mount / 3-min tick from re-asking and spamming the console.
// Cleared naturally when the van moves to a new rounded point.
const NWS_OUTSIDE_COVERAGE = new Set<string>();

export interface Alert {
  id: string;
  event: string;
  severity: string;
  headline?: string;
  description?: string;
  instruction?: string;
  expires?: string;
  areaDesc?: string;
}

/** Red for Severe+, orange Moderate, yellow Minor. */
function sevColor(sev: string): string {
  const r = SEV_RANK[sev] ?? 0;
  if (r >= 3) return '#ef4444';
  if (r === 2) return '#f59e0b';
  if (r === 1) return '#eab308';
  return '#94a3b8';
}

export function useNwsAlerts(lat?: number, lon?: number) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // Round to ~1km (2 decimals, well under NWS's 4-decimal cap) so ~1 Hz GPS
  // jitter doesn't hammer api.weather.gov. Refetch only when the van moves ~1km
  // (key changes) or on the 3-min interval.
  const latKey = lat != null && Number.isFinite(lat) ? lat.toFixed(2) : null;
  const lonKey = lon != null && Number.isFinite(lon) ? lon.toFixed(2) : null;

  useEffect(() => {
    if (latKey == null || lonKey == null) return;
    let cancelled = false;
    const load = async () => {
      if (NWS_OUTSIDE_COVERAGE.has(`${latKey},${lonKey}`)) return;
      setLoading(true);
      try {
        const url =
          `https://api.weather.gov/alerts/active?point=${latKey},${lonKey}` +
          `&status=actual&message_type=alert`;
        const r = await fetch(url, { headers: { Accept: 'application/geo+json' } });
        // api.weather.gov returns 400 for points outside US coverage (e.g. Canada).
        // Treat that as "no NWS data here": stay quiet and leave `ready` false so
        // the card renders nothing rather than a misleading "no alerts" pill.
        if (r.status === 400) {
          NWS_OUTSIDE_COVERAGE.add(`${latKey},${lonKey}`);
          return;
        }
        if (!r.ok) return;
        const j = await r.json();
        if (cancelled) return;
        const now = Date.now();
        const seen = new Set<string>();
        const list: Alert[] = (j.features ?? [])
          .map((f: any) => ({ id: f.properties?.id, ...f.properties }))
          .filter((a: Alert) => a.id && (!a.expires || new Date(a.expires).getTime() > now))
          .filter((a: Alert) => (seen.has(a.id) ? false : (seen.add(a.id), true)))
          .sort(
            (a: Alert, b: Alert) =>
              (SEV_RANK[b.severity] ?? 0) - (SEV_RANK[a.severity] ?? 0) ||
              new Date(a.expires ?? 0).getTime() - new Date(b.expires ?? 0).getTime(),
          );
        setAlerts(list);
        setReady(true);
      } catch {
        /* keep last-good alerts on transient failure — don't clear */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 3 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [latKey, lonKey]);

  return { alerts, loading, ready };
}

function fmtExpires(iso?: string): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  return new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function AlertDetailOverlay({
  alert,
  lat,
  lon,
  onClose,
}: {
  alert: Alert;
  lat: number;
  lon: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 pb-2">
          <div className="flex items-center gap-2 font-semibold" style={{ color: sevColor(alert.severity) }}>
            <AlertTriangle className="h-4 w-4" />
            {alert.event}
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 px-4 pb-4">
          {alert.areaDesc && <p className="text-xs text-muted-foreground">{alert.areaDesc}</p>}
          {alert.expires && (
            <p className="text-xs text-muted-foreground">Expires {fmtExpires(alert.expires)}</p>
          )}
          {alert.headline && <p className="text-sm font-medium">{alert.headline}</p>}
          {alert.description && (
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
              {alert.description}
            </p>
          )}
          {alert.instruction && (
            <p className="whitespace-pre-wrap rounded-lg bg-white/5 p-2 text-xs leading-relaxed">
              <span className="font-medium">Instructions: </span>
              {alert.instruction}
            </p>
          )}
          {/* Radar for context, centered on the van */}
          <RadarWidget lat={lat} lon={lon} />
        </div>
      </div>
    </div>
  );
}

export function NwsAlertsCard({ lat, lon }: { lat: number | undefined; lon: number | undefined }) {
  const { alerts, ready } = useNwsAlerts(lat, lon);
  const [selected, setSelected] = useState<Alert | null>(null);

  if (lat == null || lon == null) return null;

  // No alerts (and we've heard back) → slim reassuring pill, minimal chrome.
  if (ready && alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-500/25 bg-green-500/5 px-3 py-1.5 text-xs text-green-400/90">
        <ShieldCheck className="h-3.5 w-3.5" />
        No weather alerts here
      </div>
    );
  }

  if (!ready) return null; // nothing to show until first response

  return (
    <>
      <Card className="overflow-hidden border-red-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Weather Alerts
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {alerts.length} active
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {alerts.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className="flex w-full items-center gap-2 rounded-md border-l-4 bg-muted/30 py-1.5 pl-2 pr-2 text-left transition-colors hover:bg-muted/50"
              style={{ borderLeftColor: sevColor(a.severity) }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.event}</p>
                {a.areaDesc && <p className="truncate text-[11px] text-muted-foreground">{a.areaDesc}</p>}
              </div>
              {a.expires && (
                <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                  till {fmtExpires(a.expires)}
                </span>
              )}
            </button>
          ))}
        </CardContent>
      </Card>
      {selected && (
        <AlertDetailOverlay alert={selected} lat={lat} lon={lon} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
