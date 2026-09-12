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

// NOTE: a `useEntities(ids[])` variant used to live here. It returned a fresh
// object from getSnapshot on every call, which useSyncExternalStore treats as
// "always changed" — an instant infinite re-render loop for any component that
// used it. It had no callers, so it was removed rather than fixed. If you need
// multi-entity subscription, call useEntity() per id.
