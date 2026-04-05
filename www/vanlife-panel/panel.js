/**
 * Vanlife Tracker — Custom Panel (v10 — postMessage auth)
 *
 * panel_custom gives us `this.hass` directly. We forward the auth
 * token and states to index.html via postMessage so the iframe
 * doesn't have to do fragile cross-frame DOM walking.
 */

class VanlifePanel extends HTMLElement {
  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;

    const iframe = document.createElement("iframe");
    iframe.src = "/local/vanlife-panel/index.html";
    iframe.style.cssText = "width:100%;height:100%;border:none;display:block;";
    this.appendChild(iframe);
    this._iframe = iframe;

    // Send auth as soon as iframe finishes loading
    iframe.addEventListener("load", () => this._postHass());

    // Sidebar-aware sizing
    const fit = () => {
      const sidebar =
        document.querySelector("home-assistant")
          ?.shadowRoot?.querySelector("home-assistant-main")
          ?.shadowRoot?.querySelector("ha-sidebar");
      const w = sidebar ? sidebar.offsetWidth : 0;
      this.style.cssText =
        `display:block;position:fixed;top:0;left:${w}px;right:0;bottom:0;`;
    };
    fit();
    window.addEventListener("resize", fit);
    const sidebar =
      document.querySelector("home-assistant")
        ?.shadowRoot?.querySelector("home-assistant-main")
        ?.shadowRoot?.querySelector("ha-sidebar");
    if (sidebar) new ResizeObserver(fit).observe(sidebar);
  }

  // HA calls this setter every time hass updates
  set hass(hass) {
    this._hass = hass;
    this._postHass();
  }

  _postHass() {
    const hass = this._hass;
    const win = this._iframe?.contentWindow;
    if (!hass) return;
    // Write token to localStorage so iframe can read it immediately on load
    // (same origin — both served from the same HA instance)
    try { localStorage.setItem("vl_ha_token", hass.auth.data.access_token); } catch(_) {}
    if (!win) return;
    win.postMessage({
      type: "vanlife-hass",
      token: hass.auth.data.access_token,
      states: hass.states,
    }, window.location.origin);
  }
}

customElements.define("vanlife-panel", VanlifePanel);
