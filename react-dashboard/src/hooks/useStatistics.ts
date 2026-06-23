import { useState, useEffect } from 'react';
import { useHassStore } from '@/context/HomeAssistantContext';
import type { HistoryPoint } from '@/hooks/useHistory';

export type StatPeriod = '5minute' | 'hour' | 'day' | 'week' | 'month';

/**
 * Fetch HA long-term statistics for a statistic_id (usually an entity_id) over
 * the WebSocket. Unlike /api/history (states, purged after ~10 days), statistics
 * are retained forever and can hold backfilled/imported history.
 *
 * Returns points using the period mean (falls back to state/sum). Empty when
 * there's no connection (e.g. dev mode without `connection`).
 */
export function useStatistics(
  statisticId: string | null,
  hours: number,
  period: StatPeriod = 'day',
): { data: HistoryPoint[]; loading: boolean } {
  const store = useHassStore();
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  // Track the WS connection; latch it once it first appears so the fetch
  // re-runs when hass connects after this hook mounts.
  const [conn, setConn] = useState(() => store.hass?.connection ?? null);

  useEffect(() => {
    if (conn) return;
    return store.subscribeGlobal(() => {
      const c = store.hass?.connection ?? null;
      if (c) setConn((prev) => prev ?? c);
    });
  }, [store, conn]);

  useEffect(() => {
    if (!statisticId || !conn) {
      setData([]);
      return;
    }
    let cancelled = false;
    setLoading(true);

    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600_000);

    conn
      .sendMessagePromise<Record<string, any[]>>({
        type: 'recorder/statistics_during_period',
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        statistic_ids: [statisticId],
        period,
      })
      .then((res) => {
        if (cancelled) return;
        const rows = res?.[statisticId] ?? [];
        const points: HistoryPoint[] = [];
        for (const r of rows) {
          const t = typeof r.start === 'number' ? r.start : new Date(r.start).getTime();
          const raw = r.mean ?? r.state ?? r.sum;
          const v = raw == null ? NaN : Number(raw);
          if (Number.isFinite(t) && Number.isFinite(v)) points.push({ t, v });
        }
        setData(points);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[useStatistics]', err);
          setData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [statisticId, hours, period, conn]);

  return { data, loading };
}
