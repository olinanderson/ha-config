/**
 * Panel loader for Home Assistant panel_custom integration.
 *
 * Registers a single custom element "van-dashboard" that loads the
 * React bundle with built-in tab navigation (hash routing).
 *
 * Keep this file thin. HA serves /local/ with a 31-day cache, so browsers can
 * run an old copy of it for weeks. The recovery logic (HA parks and empties
 * the panel after the tab has been hidden for a while) lives in the bundle,
 * src/lib/panel-host.ts. The bundle is fetched fresh on every page load and
 * re-fetches this file when __VAN_DASH_LOADER__ is older than it expects.
 *
 * Usage in configuration.yaml:
 *   panel_custom:
 *     - name: van-dashboard
 *       url_path: dashboard
 *       sidebar_title: Dashboard
 *       sidebar_icon: mdi:view-dashboard
 *       module_url: /local/react-dashboard/panel-loader.js?v=16
 *       embed_iframe: false
 *       trust_external_script: true
 */

// Bump together with LOADER_VERSION in src/main.tsx.
window.__VAN_DASH_LOADER__ = 2;

const BASE = '/local/react-dashboard';
const CACHE_VER = Date.now(); // always fresh — no manual bumping needed
const RETRY_MS = 5000;

// ─── Global safety net ───────────────────────────────────────────────────
// Chrome surfaces HA's WebSocket "message channel closed" as an unhandled
// promise rejection when the browser tab is backgrounded or minimised.
// We suppress it here so it never reaches React's error boundary or the
// browser's default "uncaught" handling (which can take the page down).
window.addEventListener('unhandledrejection', (evt) => {
  const msg = String(evt.reason?.message ?? evt.reason ?? '');
  if (
    msg.includes('message channel closed') ||
    msg.includes('The message channel is closed') ||
    msg.includes('asynchronous response by returning true')
  ) {
    evt.preventDefault();
  }
});
// ─────────────────────────────────────────────────────────────────────────

// Load module fresh each page load.
// A failed load must NOT stay cached. Retries also use a new URL, because the
// browser may remember a failed module fetch for the life of the page.
let _moduleAttempts = 0;
let _modulePromise = null;
function getModule() {
  if (!_modulePromise) {
    _moduleAttempts++;
    const ver = _moduleAttempts === 1 ? CACHE_VER : `${CACHE_VER}-${_moduleAttempts}`;
    _modulePromise = import(`${BASE}/van-dashboard.js?${ver}`)
      .catch((err) => { _modulePromise = null; throw err; });
  }
  return _modulePromise;
}

// Fetch CSS fresh each page load — same retry-on-failure rule as the module.
let _cssPromise = null;
function getCss() {
  if (!_cssPromise) {
    _cssPromise = fetch(`${BASE}/van-dashboard.css?${CACHE_VER}`)
      .then(r => {
        if (!r.ok) throw new Error(`CSS HTTP ${r.status}`);
        return r.text();
      })
      .catch((err) => { _cssPromise = null; throw err; });
  }
  return _cssPromise;
}

class VanDashboard extends HTMLElement {
  constructor() {
    super();
    this._style = null;
    this._container = null; // what the bundle mounts into; kept for re-attaches
    this._release = null; // from mod.mount(); set while mounted
    this._loading = false;
    this._failedAt = 0;
  }

  set hass(hass) {
    window.__HASS__ = hass;
    window.dispatchEvent(new Event('hass-updated'));
    // HA pushing state again is a good moment to retry a failed load.
    if (this._failedAt && Date.now() - this._failedAt > RETRY_MS) this._mount();
  }

  set panel(panel) {
    this._panel = panel;
  }

  get panel() {
    return this._panel;
  }

  connectedCallback() {
    this._mount();
  }

  disconnectedCallback() {
    // The bundle decides whether the React tree survives this: HA also
    // detaches the panel when the tab has been hidden for a while.
    const release = this._release;
    this._release = null;
    if (release) release();
  }

  async _mount() {
    if (this._release || this._loading || !this.isConnected) return;
    this._loading = true;
    try {
      const [cssText, mod] = await Promise.all([getCss(), getModule()]);
      if (this._release || !this.isConnected) return; // detached mid-load; retried on connect

      if (!this._style) {
        // Inject CSS inside this element so it works inside HA's shadow DOM
        this._style = document.createElement('style');
        this._style.textContent = cssText;
        this._container = document.createElement('div');
        this._container.style.height = '100%';
        this._container.style.width = '100%';
      }
      // Drop an error box from an earlier attempt, but leave our own nodes
      // where they are: re-inserting them would restart video in the page.
      for (const child of [...this.children]) {
        if (child !== this._style && child !== this._container) child.remove();
      }
      if (this._style.parentNode !== this) this.prepend(this._style);
      if (this._container.parentNode !== this) this.append(this._container);

      this._failedAt = 0;
      this._release = mod.mount(this._container);
      // Dispatch hass-updated via requestAnimationFrame so React's
      // useLayoutEffect listener is registered before the event fires.
      requestAnimationFrame(() => {
        if (window.__HASS__) window.dispatchEvent(new Event('hass-updated'));
      });
    } catch (err) {
      this._failedAt = Date.now();
      console.error('[VanDash] Failed to load:', err);
      const box = document.createElement('div');
      box.style.cssText = 'padding: 2rem; color: red;';
      box.innerHTML = '<h2>Failed to load dashboard</h2><pre></pre><p>Retrying…</p>';
      box.querySelector('pre').textContent = String(err);
      this.replaceChildren(box);
    } finally {
      this._loading = false;
    }
  }
}

if (!customElements.get('van-dashboard')) {
  customElements.define('van-dashboard', VanDashboard);
}
