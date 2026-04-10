import { useState, useEffect, useRef } from 'react';
import { useHassStore } from '@/context/HomeAssistantContext';

export interface HistoryPoint {
  t: number; // unix ms
  v: number;
}

/**
 * Fetch entity history from HA REST API.
 * Returns numeric data points for charting.
 */
export function useHistory(
  entityId: string | null,
  hours = 24,
): { data: HistoryPoint[]; loading: boolean } {
  const store = useHassStore();
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!entityId) {
      setData([]);
      return;
    }

    const hass = store.hass;
    if (!hass) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const now = new Date();
    const start = new Date(now.getTime() - hours * 3600_000);
    const startIso = start.toISOString();
    const endIso = now.toISOString();

    // Build the URL — works from both HA panel context and test.html
    const base = (window as any).__HA_BASE_URL__ || '';
    const url =
      `${base}/api/history/period/${startIso}?end_time=${endIso}` +
      `&filter_entity_id=${encodeURIComponent(entityId)}` +
      `&minimal_response&no_attributes`;
    const token = hass.auth?.data?.access_token;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: any[][]) => {
        if (controller.signal.aborted) return;
        const points: HistoryPoint[] = [];
        const arr = json?.[0] ?? [];
        for (const entry of arr) {
          const v = parseFloat(entry.state ?? entry.s);
          if (!Number.isFinite(v)) continue;
          const ts = new Date(entry.last_changed ?? entry.lu * 1000).getTime();
          if (Number.isFinite(ts)) points.push({ t: ts, v });
        }
        setData(points);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('[useHistory]', err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [entityId, hours, store]);

  return { data, loading };
}
