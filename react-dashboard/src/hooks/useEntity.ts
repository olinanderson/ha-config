import { useSyncExternalStore, useCallback } from 'react';
import { useHassStore } from '@/context/HomeAssistantContext';
import type { HassEntity } from '@/types/hass';

/**
 * Subscribe to a single entity. Only re-renders when that entity changes.
 */
export function useEntity(entityId: string): HassEntity | null {
  const store = useHassStore();
  const subscribe = useCallback(
    (cb: () => void) => store.subscribeEntity(entityId, cb),
    [store, entityId],
  );
  const getSnapshot = useCallback(
    () => store.getEntity(entityId),
    [store, entityId],
  );
  return useSyncExternalStore(subscribe, getSnapshot);
}

/**
 * Read an entity's state as a number.
 * Returns null when entity is missing, unknown, or unavailable.
 */
export function useEntityNumeric(
  entityId: string,
): { value: number | null; entity: HassEntity | null } {
  const entity = useEntity(entityId);
  const raw = entity?.state;
  if (raw === undefined || raw === 'unknown' || raw === 'unavailable') {
    return { value: null, entity };
  }
  const n = Number(raw);
  return { value: Number.isFinite(n) ? n : null, entity };
}

/**
 * Subscribe to multiple entities. Returns a record of entityId → HassEntity.
 * Re-renders when ANY of the listed entities change.
 */
export function useEntities(
  entityIds: string[],
): Record<string, HassEntity | null> {
  const store = useHassStore();
  const subscribe = useCallback(
    (cb: () => void) => {
      const unsubs = entityIds.map((id) => store.subscribeEntity(id, cb));
      return () => unsubs.forEach((u) => u());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, entityIds.join(',')],
  );
  const getSnapshot = useCallback(() => {
    const result: Record<string, HassEntity | null> = {};
    for (const id of entityIds) {
      result[id] = store.getEntity(id);
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, entityIds.join(',')]);
  return useSyncExternalStore(subscribe, getSnapshot);
}
