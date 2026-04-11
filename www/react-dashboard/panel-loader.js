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
    this._loaded = false;
  }

  set hass(hass) {
    window.__HASS__ = hass;
    window.dispatchEvent(new Event('hass-updated'));
  }

  set panel(panel) {
    this._panel = panel;
  }

  async connectedCallback() {
    if (this._loaded) return;
    this._loaded = true;

    // Inject CSS inside this element so it works inside HA's shadow DOM
    const cssText = await getCss();
    const style = document.createElement('style');
    style.textContent = cssText;
    this.appendChild(style);

    const mountPoint = document.createElement('div');
    mountPoint.style.height = '100%';
    mountPoint.style.width = '100%';
    this.appendChild(mountPoint);

    try {
      const mod = await getModule();
      if (mod.mount) {
        this._unmount = mod.mount(mountPoint);
      }
    } catch (err) {
      console.error('[VanDash] Failed to load:', err);
      mountPoint.innerHTML = `
        <div style="padding: 2rem; color: red;">
          <h2>Failed to load dashboard</h2>
          <pre>${err}</pre>
        </div>
      `;
    }
  }

  disconnectedCallback() {
    if (this._unmount) {
      this._unmount();
      this._unmount = null;
    }
    this._loaded = false;
  }
}

customElements.define('van-dashboard', VanDashboard);
