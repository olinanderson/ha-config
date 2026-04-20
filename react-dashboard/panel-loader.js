/**
 * Panel loader for Home Assistant panel_custom integration.
 *
 * Registers a single custom element "van-dashboard" that loads the
 * React bundle with built-in tab navigation (hash routing).
 *
 * Usage in configuration.yaml:
 *   panel_custom:
 *     - name: van-dashboard
 *       url_path: dashboard
 *       sidebar_title: Dashboard
 *       sidebar_icon: mdi:view-dashboard
 *       module_url: /local/react-dashboard/panel-loader.js
 *       embed_iframe: false
 *       trust_external_script: true
 */

const BASE = '/local/react-dashboard';
const CACHE_VER = Date.now(); // always fresh — no manual bumping needed

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

// Load module fresh each page load
let _modulePromise = null;
function getModule() {
  if (!_modulePromise) {
    _modulePromise = import(`${BASE}/van-dashboard.js?${CACHE_VER}`);
  }
  return _modulePromise;
}

// Fetch CSS fresh each page load
let _cssPromise = null;
function getCss() {
  if (!_cssPromise) {
    _cssPromise = fetch(`${BASE}/van-dashboard.css?${CACHE_VER}`)
      .then(r => r.text());
  }
  return _cssPromise;
}

class VanDashboard extends HTMLElement {
  constructor() {
    super();
    this._unmount = null;
    this._mounting = false; // true while async _doMount is in progress
    this._mountGen = 0;
    this._onVisibility = null;
    this._onFocus = null;
    this._onPageShow = null;
    this._watchdog = null;
    this._teardownTimer = null;
  }

  _dispatchHassUpdated() {
    if (!window.__HASS__) return;
    window.dispatchEvent(new Event('hass-updated'));
    requestAnimationFrame(() => {
      if (this.isConnected && window.__HASS__) {
        window.dispatchEvent(new Event('hass-updated'));
      }
    });
  }

  _hasLiveDom() {
    return !!this.querySelector('.van-dash-root');
  }

  _recover(reason = 'unknown') {
    if (!this.isConnected) return;

    if (!this._unmount && !this._mounting) {
      console.debug('[VanDash] Recovering mount after', reason);
      this._doMount();
      return;
    }

    if (!this._hasLiveDom() && !this._mounting) {
      console.debug('[VanDash] Recovering blank DOM after', reason);
      if (this._unmount) {
        try {
          this._unmount();
        } catch (_) {}
        this._unmount = null;
      }
      this._doMount();
      return;
    }

    this._dispatchHassUpdated();
  }

  set hass(hass) {
    window.__HASS__ = hass;
    this._dispatchHassUpdated();
    // Recovery: if we're in the DOM but React isn't mounted, re-mount.
    // This catches the case where HA's quick "reconnecting..." cycle
    // disconnected/reconnected the element and the async mount failed or
    // was aborted, leaving a blank screen.
    this._recover('hass-setter');
  }

  set panel(panel) {
    this._panel = panel;
  }

  connectedCallback() {
    if (this._teardownTimer) {
      clearTimeout(this._teardownTimer);
      this._teardownTimer = null;
    }
    this._recover('connected');
  }

  async _doMount() {
    // Already mounted or mount in progress — skip
    if (this._unmount || this._mounting) return;
    this._mounting = true;

    // Capture the current generation. If disconnectedCallback fires while we
    // are awaiting below, _mountGen is incremented and we abort early so we
    // don't mount React into a stale / already-cleared container.
    const gen = ++this._mountGen;

    // Clear any stale children from a previous mount cycle
    this.innerHTML = '';

    try {
      // Inject CSS inside this element so it works inside HA's shadow DOM
      const cssText = await getCss();
      if (this._mountGen !== gen) return; // disconnected mid-flight — abort

      const style = document.createElement('style');
      style.textContent = cssText;
      this.appendChild(style);

      const mountPoint = document.createElement('div');
      mountPoint.style.height = '100%';
      mountPoint.style.width = '100%';
      this.appendChild(mountPoint);

      const mod = await getModule();
      if (this._mountGen !== gen) return; // disconnected mid-flight — abort

      if (mod.mount) {
        this._unmount = mod.mount(mountPoint);
      }
      // Dispatch hass-updated via requestAnimationFrame so React's
      // useLayoutEffect listener is registered before the event fires.
      // (useLayoutEffect runs synchronously after DOM commit, before RAF)
      requestAnimationFrame(() => {
        if (this._mountGen === gen && window.__HASS__) {
          this._dispatchHassUpdated();
        }
      });

      // When browser tab returns from background, force a hass refresh
      if (this._onVisibility) {
        document.removeEventListener('visibilitychange', this._onVisibility);
      }
      this._onVisibility = () => {
        if (!document.hidden) {
          this._recover('visibilitychange');
        }
      };
      document.addEventListener('visibilitychange', this._onVisibility);

      if (this._onFocus) {
        window.removeEventListener('focus', this._onFocus);
      }
      this._onFocus = () => {
        this._recover('focus');
      };
      window.addEventListener('focus', this._onFocus);

      if (this._onPageShow) {
        window.removeEventListener('pageshow', this._onPageShow);
      }
      this._onPageShow = () => {
        this._recover('pageshow');
      };
      window.addEventListener('pageshow', this._onPageShow);

      if (this._watchdog) {
        clearInterval(this._watchdog);
      }
      this._watchdog = setInterval(() => {
        if (!document.hidden) {
          this._recover('watchdog');
        }
      }, 5000);
    } catch (err) {
      if (this._mountGen !== gen) return;
      console.error('[VanDash] Failed to load:', err);
      this.innerHTML = `
        <div style="padding: 2rem; color: red;">
          <h2>Failed to load dashboard</h2>
          <pre>${err}</pre>
        </div>
      `;
    } finally {
      this._mounting = false;
    }
  }

  disconnectedCallback() {
    if (this._teardownTimer) {
      clearTimeout(this._teardownTimer);
    }

    // HA can temporarily disconnect the panel custom element during its own
    // websocket reconnect cycle. Delay teardown so quick detach/reattach does
    // not blank the panel and require a full reload.
    this._teardownTimer = setTimeout(() => {
      this._teardownTimer = null;
      if (this.isConnected) return;

      // Invalidate any in-flight _doMount awaits
      this._mountGen++;
      this._mounting = false;

      if (this._watchdog) {
        clearInterval(this._watchdog);
        this._watchdog = null;
      }
      if (this._onVisibility) {
        document.removeEventListener('visibilitychange', this._onVisibility);
        this._onVisibility = null;
      }
      if (this._onFocus) {
        window.removeEventListener('focus', this._onFocus);
        this._onFocus = null;
      }
      if (this._onPageShow) {
        window.removeEventListener('pageshow', this._onPageShow);
        this._onPageShow = null;
      }
      if (this._unmount) {
        this._unmount();
        this._unmount = null;
      }
      // Clear DOM only after we've confirmed the element stayed detached.
      this.innerHTML = '';
    }, 2000);
  }
}

customElements.define('van-dashboard', VanDashboard);
