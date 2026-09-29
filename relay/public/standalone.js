// The dashboard as served by the van relay on atlantis. It mounts the same
// bundle HA serves, against the relay instead of HA: the relay speaks HA's
// websocket protocol, answers from its saved state while the van is offline,
// and queues commands until the next Starlink window (relay.mjs).
import * as V from '/van-dashboard.js';

const DUTY = 'input_boolean.starlink_duty_cycle';
const origin = location.origin;
// The vanlife API goes through HA's /api/vanlife proxy (the same route Nabu
// Casa uses), which the relay passes through.
window.__VAN_API_BASE__ = `${origin}/api`;

// Requests that need the live van fail with code van_offline while it's away;
// the cards already show them as empty, so keep them out of the console.
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.code === 'van_offline') e.preventDefault();
});

const auth = V.createLongLivedTokenAuth(origin, 'relay');
const conn = await V.createConnection({ auth, setupRetry: -1 });

const hass = {
  states: {},
  connection: conn,
  callService: (domain, service, data, target) => V.callService(conn, domain, service, data, target),
  user: { name: 'Olin', is_admin: true },
  auth: { data: { hassUrl: origin, access_token: 'relay' } },
  language: 'en',
  // HA follows the device's appearance setting; do the same.
  themes: { darkMode: matchMedia('(prefers-color-scheme: dark)').matches },
};
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  hass.themes = { darkMode: e.matches };
  window.dispatchEvent(new Event('hass-updated'));
});

V.subscribeEntities(conn, (ents) => {
  hass.states = ents;
  window.__HASS__ = hass;
  window.dispatchEvent(new Event('hass-updated'));
  render();
});

V.mount(document.getElementById('root'));

// ─── Status strip ───────────────────────────────────────────────────────────

let status = null;
let clockSkew = 0; // relay clock − ours
conn.subscribeMessage(
  (s) => {
    status = s;
    clockSkew = s.now - Date.now();
    render();
  },
  { type: 'van_relay/subscribe' },
  { resubscribe: true },
);

const bar = document.getElementById('relay-bar');
const t = () => Date.now() + clockSkew;
const hhmm = (ms) => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
function ago(ms) {
  if (!ms) return 'never';
  const m = Math.round((t() - ms) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min ago`;
}
// Windows open at :00 and :30; the van is reachable about 3 min later.
function nextSync() {
  const d = new Date(t());
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60);
  return d.getTime() + 3 * 60000;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function render() {
  if (!status) return;
  const duty = hass.states[DUTY]?.state;
  const parts = [];
  if (status.online) {
    parts.push('<span><span class="dot on"></span>Van online</span>');
  } else {
    parts.push('<span><span class="dot off"></span>Van offline</span>');
    parts.push(`<span class="muted">synced ${ago(status.lastSync)}</span>`);
    if (duty === 'on') parts.push(`<span class="muted">next sync ≈ ${hhmm(nextSync())}</span>`);
  }
  parts.push('<span class="spacer"></span>');
  if (duty === 'on' || duty === 'off') {
    parts.push(
      `<button data-act="duty">${duty === 'on' ? 'Starlink: saving power' : 'Starlink: always on'}</button>`,
    );
  }
  const items = [];
  for (const q of status.queue) {
    items.push(
      `<li><span>⏳ ${esc(q.label)}</span><span class="muted">queued ${ago(q.queuedAt)}</span>` +
        `<button data-cancel="${esc(q.key)}">Cancel</button></li>`,
    );
  }
  // Outcomes from the last 15 minutes, so a command sent at the last sync shows it landed.
  for (const r of status.recent.filter((r) => t() - r.at < 15 * 60000).slice(0, 3)) {
    items.push(
      `<li class="${r.ok ? 'ok' : 'fail'}">${r.ok ? '✓' : '✕'} ${esc(r.label)}` +
        `${r.error ? ` — ${esc(r.error)}` : ''}<span class="muted">${ago(r.at)}</span></li>`,
    );
  }
  if (items.length) parts.push(`<ul>${items.join('')}</ul>`);
  bar.innerHTML = parts.join('');
}
setInterval(render, 30_000);

bar.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.act === 'duty') {
    const on = hass.states[DUTY]?.state === 'on';
    hass.callService('input_boolean', on ? 'turn_off' : 'turn_on', {}, { entity_id: DUTY });
  } else if (b.dataset.cancel) {
    conn.sendMessagePromise({ type: 'van_relay/cancel', key: b.dataset.cancel });
  }
});

// While someone is actually using the page, ask the relay to hold the
// Starlink window open (it tells HA). Only when visible and touched recently,
// so a forgotten tab doesn't keep Starlink on.
let lastTouch = Date.now();
for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) {
  window.addEventListener(ev, () => (lastTouch = Date.now()), { passive: true, capture: true });
}
function heartbeat() {
  if (document.visibilityState === 'visible' && Date.now() - lastTouch < 10 * 60000) {
    conn.sendMessagePromise({ type: 'van_relay/active' }).catch(() => {});
  }
}
setInterval(heartbeat, 30_000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    lastTouch = Date.now();
    heartbeat();
  }
});
heartbeat();
