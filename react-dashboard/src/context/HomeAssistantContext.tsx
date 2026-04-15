import {
  createContext,
  useContext,
  useRef,
  useLayoutEffect,
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
  ): Promise<void> {
    if (!this._hass) return; // silently drop — not connected
    try {
      await this._hass.callService(domain, service, data, target);
    } catch (err: any) {
      // HA closes the WebSocket message channel when the browser tab is
      // backgrounded / minimised. The resulting rejection is not actionable
      // — the service call likely already executed on the HA side — so we
      // swallow it rather than let it become an unhandled promise rejection
      // that Chrome surfaces as an error and React DevTools can propagate
      // into a blank-screen crash.
      const msg = String(err?.message ?? err);
      const isClosed =
        msg.includes('message channel closed') ||
        msg.includes('The message channel is closed') ||
        msg.includes('disconnected') ||
        err?.code === 3 || // ERR_CONNECTION_LOST
        err?.code === 6;   // ERR_INVALID_AUTH (can happen on resume)
      if (!isClosed) {
        console.warn('[VanDash] callService error:', err);
      }
    }
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

  // useLayoutEffect fires synchronously after React commits to the DOM and
  // before the browser paints. This guarantees the 'hass-updated' listener
  // is registered before requestAnimationFrame in panel-loader.js fires.
  useLayoutEffect(() => {
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
