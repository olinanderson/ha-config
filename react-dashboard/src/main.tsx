import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { createPanelHost } from '@/lib/panel-host';
import './index.css';

// Re-export WS helpers so test.html can use them from the bundle
export {
  createConnection,
  createLongLivedTokenAuth,
  subscribeEntities,
  callService,
} from 'home-assistant-js-websocket';

/** The panel-loader.js this bundle expects. Bump together with
 *  window.__VAN_DASH_LOADER__ in panel-loader.js. */
const LOADER_VERSION = 2;

// One React tree per page, moved between <van-dashboard> elements as HA
// rebuilds and parks the panel (see lib/panel-host.ts).
const panelHost = createPanelHost((host) => {
  const root = createRoot(host);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
  return () => root.unmount();
});

/**
 * Mount the Van Dashboard into a container element.
 * Called by panel-loader.js for the HA panel.
 * Navigation is handled internally via hash routing (#home, #power, etc.)
 * @param container - DOM element to mount into
 * @returns the function the loader calls when its element goes away; the
 *   panel host decides whether the React tree survives it.
 */
export function mount(container: HTMLElement): () => void {
  refreshStaleLoader();
  return panelHost.mount(container);
}

let loaderChecked = false;

/**
 * HA serves /local/ with a 31-day cache and module_url never changes, so a
 * browser can keep running an old panel-loader.js for weeks. This bundle is
 * fetched fresh on every page load. If the loader that loaded it is older
 * than expected, fetch the loader again, bypassing the cache, so the next
 * page load gets the current one.
 */
function refreshStaleLoader() {
  if (loaderChecked) return;
  loaderChecked = true;
  const running = (window as { __VAN_DASH_LOADER__?: number }).__VAN_DASH_LOADER__ ?? 1;
  if (running >= LOADER_VERSION) return;
  // HA loads module_url through a <script type="module"> it adds to <body>.
  const script = document.querySelector<HTMLScriptElement>(
    'script[src*="/react-dashboard/panel-loader.js"]',
  );
  if (!script) return;
  fetch(script.src, { cache: 'reload' })
    .then((r) => r.arrayBuffer())
    .catch(() => {
      loaderChecked = false; // try again on the next mount
    });
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
