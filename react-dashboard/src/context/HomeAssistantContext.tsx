import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { HomeAssistant, HassEntity } from '@/types/hass';

// ─── Reactive store that efficiently tracks per-entity changes ───

type Listener = () => void;

class HassStore {
  private _hass: HomeAssistant | null = null;
  private _entityListeners = new Map<string, Set<Listener>>();
  private _globalListeners = new Set<Listener>();

  get hass() {
    return this._hass;
  }

  update(hass: HomeAssistant) {
    this._hass = hass;

    // Always notify all subscribed entity listeners.
    // useSyncExternalStore compares snapshots by reference, so
    // components only re-render when their entity actually changed.
    for (const subs of this._entityListeners.values()) {
      subs.forEach((fn) => fn());
    }

    this._globalListeners.forEach((fn) => fn());
  }

  getEntity(entityId: string): HassEntity | null {
    return this._hass?.states[entityId] ?? null;
  }

  subscribeEntity(entityId: string, callback: Listener): () => void {
    if (!this._entityListeners.has(entityId)) {
      this._entityListeners.set(entityId, new Set());
    }
    this._entityListeners.get(entityId)!.add(callback);
    return () => {
      this._entityListeners.get(entityId)?.delete(callback);
    };
  }

  subscribeGlobal(callback: Listener): () => void {
    this._globalListeners.add(callback);
    return () => {
      this._globalListeners.delete(callback);
    };
  }

  async callService(
    domain: string,
    service: string,
    data?: Record<string, any>,
    target?: { entity_id?: string | string[] },
  ) {
    if (!this._hass) throw new Error('Not connected to Home Assistant');
    return this._hass.callService(domain, service, data, target);
  }
}

// ─── Context ───

const HassContext = createContext<HassStore>(new HassStore());

export function useHassStore() {
  return useContext(HassContext);
}

// ─── Provider ───

interface HassProviderProps {
  children: ReactNode;
}

/**
 * HassProvider bridges the panel_custom hass property into React.
 * It listens for 'hass-updated' events on window (dispatched by the
 * custom element wrapper or the dev-mode WebSocket connector).
 */
export function HassProvider({ children }: HassProviderProps) {
  const storeRef = useRef(new HassStore());

  useEffect(() => {
    const handler = () => {
      const hass = (window as any).__HASS__ as HomeAssistant | undefined;
      if (hass) storeRef.current.update(hass);
    };

    window.addEventListener('hass-updated', handler);

    // Also re-sync when browser tab returns from background
    const onVisibility = () => {
      if (!document.hidden) handler();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Pick up hass if it was already set before React mounted
    handler();
    return () => {
      window.removeEventListener('hass-updated', handler);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <HassContext.Provider value={storeRef.current}>
      {children}
    </HassContext.Provider>
  );
}
