import { useCallback } from 'react';
import { useHassStore } from '@/context/HomeAssistantContext';

/**
 * Returns a callService function bound to the current HA connection.
 */
export function useService() {
  const store = useHassStore();
  return useCallback(
    (
      domain: string,
      service: string,
      data?: Record<string, any>,
      target?: { entity_id?: string | string[] },
    ) => {
      // Always attach a .catch so the caller returning void never creates
      // an unhandled promise rejection (errors are already handled in
      // HassStore.callService, this is just the safety net).
      store.callService(domain, service, data, target).catch(() => {});
    },
    [store],
  );
}

/**
 * Returns a toggle function for a specific entity.
 */
export function useToggle(entityId: string) {
  const callService = useService();
  const domain = entityId.split('.')[0];
  return useCallback(
    () => callService(domain, 'toggle', undefined, { entity_id: entityId }),
    [callService, domain, entityId],
  );
}

/**
 * Call button.press for a specific entity.
 */
export function useButtonPress(entityId: string) {
  const callService = useService();
  return useCallback(
    () => callService('button', 'press', undefined, { entity_id: entityId }),
    [callService, entityId],
  );
}
