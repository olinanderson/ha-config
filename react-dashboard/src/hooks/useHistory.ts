import { useState, useEffect, useRef, useCallback } from 'react';
import { useHassStore } from '@/context/HomeAssistantContext';

export interface HistoryPoint {
  t: number; // unix ms
  v: number;
}

/**
 * Fetch entity history from HA REST API.
 * Appends live data points as the entity state changes.
 */
export function useHistory(
  entityId: string | null,
  hours = 24,
): { data: HistoryPoint[]; loading: boolean } {
  const store = useHassStore();
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastTRef = useRef<number>(0); // track the latest timestamp to avoid duplicates

  // Append a live point when entity state changes
  const appendLive = useCallback(() => {
    if (!entityId) return;
    const entity = store.getEntity(entityId);
    if (!entity) return;
    const raw = entity.state;
    const v = parseFloat(raw);
    if (!Number.isFinite(v)) return;
    const ts = new Date(entity.last_updated || entity.last_changed).getTime();
    if (!Number.isFinite(ts) || ts <= lastTRef.current) return;
    lastTRef.current = ts;
    setData((prev) => [...prev, { t: ts, v }]);
  }, [entityId, store]);

  // Fetch historical data
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
        // Set the last timestamp so live points don't duplicate history
        lastTRef.current = points.length > 0 ? points[points.length - 1].t : 0;
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('[useHistory]', err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [entityId, hours, store]);

  // Subscribe to live entity updates and append new points
  useEffect(() => {
    if (!entityId) return;
    return store.subscribeEntity(entityId, appendLive);
  }, [entityId, store, appendLive]);

  return { data, loading };
}
