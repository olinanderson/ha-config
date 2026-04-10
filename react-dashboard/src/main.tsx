import { createRoot, type Root } from 'react-dom/client';
import App from './App';
import './index.css';

// Re-export WS helpers so test.html can use them from the bundle
export {
  createConnection,
  createLongLivedTokenAuth,
  subscribeEntities,
  callService,
} from 'home-assistant-js-websocket';

/**
 * Mount the Van Dashboard React app into a container element.
 * Called by panel-loader.js for the HA panel.
 * Navigation is handled internally via hash routing (#home, #power, etc.)
 * @param container - DOM element to mount into
 */
export function mount(container: HTMLElement): () => void {
  const root = createRoot(container);
  root.render(<App />);
  return () => root.unmount();
}

// ─── Dev mode: auto-mount when loaded via Vite dev server ───

if (import.meta.env.DEV) {
  const devRoot = document.getElementById('root');
  if (devRoot) {
    // In dev, use #power (etc.) hash or default to #home
    if (!window.location.hash) window.location.hash = 'home';
    const haUrl = import.meta.env.VITE_HA_URL as string | undefined;
    const haToken = import.meta.env.VITE_HA_TOKEN as string | undefined;

    if (haUrl && haToken) {
      // Connect to HA via WebSocket for live data in dev
      import('home-assistant-js-websocket').then(
        async ({ createConnection, createLongLivedTokenAuth, subscribeEntities }) => {
          try {
            const auth = createLongLivedTokenAuth(haUrl, haToken);
            const conn = await createConnection({ auth });

            // Build a hass-like object
            const hass: any = {
              states: {},
              callService: async (
                domain: string,
                service: string,
                data?: Record<string, any>,
                target?: { entity_id?: string | string[] },
              ) => {
                const { callService: wsCallService } = await import(
                  'home-assistant-js-websocket'
                );
                return wsCallService(conn, domain, service, data, target);
              },
              user: { name: 'Dev', is_admin: true },
              auth: { data: { access_token: haToken } },
              language: 'en',
            };

            subscribeEntities(conn, (entities) => {
              hass.states = entities;
              (window as any).__HASS__ = hass;
              window.dispatchEvent(new Event('hass-updated'));
            });

            console.log('[Van Dashboard] Connected to HA via WebSocket (dev mode)');
          } catch (err) {
            console.error('[Van Dashboard] Failed to connect:', err);
          }

          mount(devRoot);
        },
      );
    } else {
      // No HA credentials — mount anyway (will show empty states)
      console.warn(
        '[Van Dashboard] No VITE_HA_URL / VITE_HA_TOKEN — running without HA connection',
      );
      mount(devRoot);
    }
  }
}
