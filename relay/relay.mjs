// Van relay: runs on atlantis (always on) and stands in for Home Assistant
// while the van is offline between Starlink duty-cycle windows.
//
//   - Keeps a websocket to HA whenever the van is reachable, mirrors every
//     entity state and saves it to disk.
//   - Serves the React dashboard and speaks HA's own websocket protocol to it,
//     so the unchanged bundle runs against the relay (public/standalone.js).
//   - Commands sent while the van is offline are queued (newest per thing
//     wins, 2 h expiry) and sent as soon as the next window connects.
//   - Tells HA when it has synced (input_datetime.starlink_relay_last_sync) and
//     holds the window open while someone is using the dashboard
//     (input_datetime.starlink_relay_hold_until); see automations
//     starlink_duty_* in automations.yaml.
//   - Anything else (history, statistics, cameras, the vanlife API) is passed
//     through while the van is online and answered with "van_offline" when not.
//
// Reachable only from loopback and the tailnet. Run with launchd
// (com.olin.van-relay.plist); config via the env vars in CFG.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import WebSocket, { WebSocketServer } from 'ws';
import {
  applyEntityDiff,
  snapshotEvent,
  expandState,
  normalizeCall,
  queueKey,
  describeCall,
  enqueue,
  partitionExpired,
  isTrustedAddress,
} from './lib.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const CFG = {
  haUrl: process.env.HA_URL || 'http://100.80.15.86:8123',
  port: +(process.env.PORT || 8124),
  tokenFile: process.env.HA_TOKEN_FILE || path.join(DIR, '.ha_token'),
  dataDir: process.env.DATA_DIR || path.join(DIR, 'data'),
  distDir: process.env.DIST_DIR || path.join(DIR, '..', 'react-dashboard', 'dist'),
  publicDir: path.join(DIR, 'public'),
  queueTtlMs: 2 * 3600_000,
  reconnectMs: 5_000,
  // Starlink cuts the link without closing the socket, so a missing pong is
  // the only sign the van went away.
  pingEveryMs: 15_000,
  pongTimeoutMs: 10_000,
  // After a sync, keep the window open this long so results of sent commands
  // come back; while someone uses the dashboard, push the hold this far ahead.
  syncHoldMs: 60_000,
  viewerHoldMs: 180_000,
  viewerActiveMs: 90_000,
};

const log = (...a) => console.log(new Date().toISOString(), ...a);
const now = () => Date.now();

// ─── Persistent state ───────────────────────────────────────────────────────

fs.mkdirSync(CFG.dataDir, { recursive: true });
const STATE_FILE = path.join(CFG.dataDir, 'state.json');
const QUEUE_FILE = path.join(CFG.dataDir, 'queue.json');
const readJson = (f, d) => {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {
    return d;
  }
};
const writeJson = (f, v) => {
  fs.writeFileSync(f + '.tmp', JSON.stringify(v));
  fs.renameSync(f + '.tmp', f);
};

const saved = readJson(STATE_FILE, {});
let entities = saved.entities ?? {};
let haVersion = saved.haVersion ?? '2026.9.0';
let lastSync = saved.lastSync ?? 0; // last time the relay had fresh state and an empty queue
let lastContact = saved.lastContact ?? 0; // last message from HA
let queue = readJson(QUEUE_FILE, []);
let recent = saved.recent ?? []; // outcomes of sent/expired commands, newest first

let stateDirty = false;
const markDirty = () => (stateDirty = true);
setInterval(() => {
  if (!stateDirty) return;
  stateDirty = false;
  writeJson(STATE_FILE, { entities, haVersion, lastSync, lastContact, recent });
}, 10_000);
const saveQueue = () => writeJson(QUEUE_FILE, queue);

// ─── Upstream: the websocket to Home Assistant ──────────────────────────────

const token = fs.readFileSync(CFG.tokenFile, 'utf8').trim();
let up = null; // live, authenticated socket or null
let online = false;
let upId = 1;
const upPending = new Map(); // upstream id → { resolve, reject } | { client, clientId }
let entitySubId = null;
let lastHoldPush = 0;

function upSend(msg) {
  const id = upId++;
  up.send(JSON.stringify({ ...msg, id }));
  return id;
}

/** Send to HA and wait for its result. */
function upRequest(msg, timeoutMs = 15_000) {
  return new Promise((resolve, reject) => {
    if (!up) return reject(new Error('van offline'));
    const id = upSend(msg);
    const timer = setTimeout(() => {
      upPending.delete(id);
      reject(new Error('timeout'));
    }, timeoutMs);
    upPending.set(id, {
      resolve: (r) => (clearTimeout(timer), resolve(r)),
      reject: (e) => (clearTimeout(timer), reject(e)),
    });
  });
}

function setDatetime(entityId, ms) {
  return upRequest({
    type: 'call_service',
    domain: 'input_datetime',
    service: 'set_datetime',
    service_data: { timestamp: Math.round(ms / 1000) },
    target: { entity_id: entityId },
  });
}

function connectUpstream() {
  const wsUrl = CFG.haUrl.replace(/^http/, 'ws') + '/api/websocket';
  const ws = new WebSocket(wsUrl, { handshakeTimeout: 8_000 });
  let pingTimer = null;
  let pongTimer = null;
  let firstSnapshot = true;

  const fail = (why) => {
    clearInterval(pingTimer);
    clearTimeout(pongTimer);
    ws.removeAllListeners();
    ws.on('error', () => {});
    try {
      ws.terminate();
    } catch {}
    if (up === ws) goOffline(why);
    setTimeout(connectUpstream, CFG.reconnectMs);
  };

  ws.on('error', (e) => fail(e.code || e.message));
  ws.on('close', () => fail('closed'));
  ws.on('message', (raw) => {
    lastContact = now();
    let msgs = JSON.parse(raw);
    if (!Array.isArray(msgs)) msgs = [msgs];
    for (const m of msgs) handleUpstream(ws, m);
  });

  function handleUpstream(ws, m) {
    if (m.type === 'auth_required') return ws.send(JSON.stringify({ type: 'auth', access_token: token }));
    if (m.type === 'auth_invalid') {
      log('HA rejected the relay token:', m.message);
      return fail('auth_invalid');
    }
    if (m.type === 'auth_ok') {
      up = ws;
      haVersion = m.ha_version ?? haVersion;
      entitySubId = upSend({ type: 'subscribe_entities' });
      pingTimer = setInterval(() => {
        const id = upSend({ type: 'ping' });
        pongTimer = setTimeout(() => fail('no pong'), CFG.pongTimeoutMs);
        upPending.set(id, { resolve: () => clearTimeout(pongTimer), reject: () => {} });
      }, CFG.pingEveryMs);
      return;
    }
    if (m.type === 'pong' || m.type === 'result') {
      const p = upPending.get(m.id);
      if (!p) return;
      upPending.delete(m.id);
      if (p.client) return clientSend(p.client, { ...m, id: p.clientId });
      if (m.type === 'pong' || m.success) p.resolve(m.result);
      else p.reject(Object.assign(new Error(m.error?.message ?? 'error'), { code: m.error?.code }));
      return;
    }
    if (m.type === 'event' && m.id === entitySubId) {
      if (firstSnapshot) {
        firstSnapshot = false;
        const previous = Object.keys(entities);
        entities = {};
        applyEntityDiff(entities, m.event);
        broadcastEntities(snapshotEvent(entities, previous));
        markDirty();
        goOnline();
      } else {
        applyEntityDiff(entities, m.event);
        broadcastEntities(m.event);
        markDirty();
        // HA started a new window while the relay was already connected (a
        // pause ended, or the duty cycle was switched on): the relay is in
        // sync, so say so, or the window never closes.
        if (online && (m.event.a?.[WINDOW_STARTED] || m.event.c?.[WINDOW_STARTED])) markSync();
      }
      return;
    }
    if (m.type === 'event') {
      const sub = forwardedSubs.get(m.id);
      if (sub) clientSend(sub.client, { ...m, id: sub.clientId });
    }
  }
}

async function goOnline() {
  online = true;
  log('van online');
  // Clients reconnect so anything they had forwarded (statistics, forecast)
  // is set up again against the live HA.
  dropForwardingClients();
  await flushQueue();
  await markSync();
  pushHold(CFG.syncHoldMs).catch((e) => log('could not push the hold:', e.message));
}

const WINDOW_STARTED = 'input_datetime.starlink_window_started';

async function markSync() {
  lastSync = now();
  markDirty();
  broadcastStatus();
  try {
    await setDatetime('input_datetime.starlink_relay_last_sync', lastSync);
  } catch (e) {
    log('could not mark the sync in HA:', e.message);
  }
}

function goOffline(why) {
  if (!online && !up) return;
  log('van offline:', why);
  up = null;
  online = false;
  entitySubId = null;
  for (const [id, p] of upPending) {
    if (p.client) clientSend(p.client, offlineError(p.clientId));
    else p.reject(new Error('van offline'));
    upPending.delete(id);
  }
  dropForwardingClients();
  broadcastStatus();
}

async function pushHold(ms) {
  lastHoldPush = now();
  await setDatetime('input_datetime.starlink_relay_hold_until', now() + ms);
}

// Keep the window open while someone is actually using the dashboard.
setInterval(() => {
  if (!online) return;
  const active = [...clients.values()].some((c) => now() - c.lastActive < CFG.viewerActiveMs);
  if (active && now() - lastHoldPush > 50_000) pushHold(CFG.viewerHoldMs).catch(() => {});
}, 10_000);

// ─── Queue ──────────────────────────────────────────────────────────────────

function addRecent(item, ok, error) {
  recent = [{ label: item.label, ok, error, at: now() }, ...recent].slice(0, 20);
  markDirty();
}

function expireQueue() {
  const { keep, expired } = partitionExpired(queue, now());
  if (!expired.length) return;
  queue = keep;
  for (const q of expired) addRecent(q, false, 'expired before the van came online');
  saveQueue();
  broadcastStatus();
}
setInterval(expireQueue, 60_000);

let flushing = null;
function flushQueue() {
  flushing ??= (async () => {
    expireQueue();
    while (queue.length && up) {
      const item = queue[0];
      try {
        await upRequest({ type: 'call_service', ...item.call });
        addRecent(item, true);
        log('sent', item.label);
      } catch (e) {
        if (e.message === 'van offline' || e.message === 'timeout') break; // retry next window
        addRecent(item, false, e.message);
        log('failed', item.label, e.message);
      }
      queue = queue.filter((q) => q !== item);
      saveQueue();
      broadcastStatus();
    }
  })().finally(() => (flushing = null));
  return flushing;
}

// ─── Downstream: dashboard clients ──────────────────────────────────────────

// forwarded: the client has a request that depends on the live link (a
// forwarded subscription, or one refused while offline), so it is dropped and
// reconnects whenever the link changes.
const clients = new Map(); // ws → { entitySubs:Set, statusSubs:Set, forwarded:bool, lastActive }
const forwardedSubs = new Map(); // upstream id → { client, clientId }

function clientSend(ws, msg) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}
const result = (id, res = null) => ({ id, type: 'result', success: true, result: res });
const offlineError = (id) => ({
  id,
  type: 'result',
  success: false,
  error: { code: 'van_offline', message: 'The van is offline; this works during the next sync window.' },
});

function broadcastEntities(ev) {
  for (const [ws, c] of clients) for (const id of c.entitySubs) clientSend(ws, { id, type: 'event', event: ev });
}

function status() {
  return { online, lastSync, lastContact, queue: queue.map(({ call, ...q }) => q), recent, now: now() };
}
function broadcastStatus() {
  const s = status();
  for (const [ws, c] of clients) for (const id of c.statusSubs) clientSend(ws, { id, type: 'event', event: s });
}

function dropForwardingClients() {
  for (const [ws, c] of clients) if (c.forwarded) ws.close(4000, 'van link changed');
  for (const [id, sub] of forwardedSubs) if (!clients.has(sub.client)) forwardedSubs.delete(id);
}

function handleClient(ws, m) {
  const c = clients.get(ws);
  const { id, type } = m;
  switch (type) {
    case 'auth':
      return clientSend(ws, { type: 'auth_ok', ha_version: haVersion });
    case 'ping':
      return clientSend(ws, { id, type: 'pong' });
    case 'supported_features':
      return clientSend(ws, result(id));
    case 'subscribe_entities':
      c.entitySubs.add(id);
      clientSend(ws, result(id));
      return clientSend(ws, { id, type: 'event', event: { a: entities } });
    case 'get_states':
      return clientSend(ws, result(id, Object.entries(entities).map(([k, v]) => expandState(k, v))));
    case 'van_relay/subscribe':
      c.statusSubs.add(id);
      clientSend(ws, result(id));
      return clientSend(ws, { id, type: 'event', event: status() });
    case 'van_relay/active':
      c.lastActive = now();
      return clientSend(ws, result(id));
    case 'van_relay/cancel':
      queue = queue.filter((q) => q.key !== m.key);
      saveQueue();
      broadcastStatus();
      return clientSend(ws, result(id));
    case 'unsubscribe_events': {
      if (c.entitySubs.delete(m.subscription) || c.statusSubs.delete(m.subscription)) {
        return clientSend(ws, result(id));
      }
      for (const [upSub, sub] of forwardedSubs) {
        if (sub.client === ws && sub.clientId === m.subscription) {
          forwardedSubs.delete(upSub);
          if (up) upSend({ type: 'unsubscribe_events', subscription: upSub });
        }
      }
      return clientSend(ws, result(id));
    }
    case 'call_service':
      // Forward live, unless older queued commands are still going out: then
      // queue behind them so the newest command still wins.
      if (up && online && !queue.length) break;
      {
        const call = normalizeCall(
          { domain: m.domain, service: m.service, service_data: m.service_data ?? {}, target: m.target },
          entities,
        );
        const item = {
          key: queueKey(call),
          label: describeCall(call, entities),
          call,
          queuedAt: now(),
          expiresAt: now() + CFG.queueTtlMs,
        };
        queue = enqueue(queue, item);
        saveQueue();
        broadcastStatus();
        log('queued', item.label);
        if (up && online) flushQueue();
        return clientSend(ws, result(id, { context: { id: `queued-${item.queuedAt}` }, response: null, queued: true }));
      }
  }
  // Everything else goes to HA while the van is online. A client refused now
  // is dropped when the van comes back, so it asks again.
  if (!up || !online) {
    c.forwarded = true;
    return clientSend(ws, offlineError(id));
  }
  const { id: _, ...rest } = m;
  const upIdForMsg = upSend(rest);
  upPending.set(upIdForMsg, { client: ws, clientId: id });
  if (type.startsWith('subscribe') || type.endsWith('/subscribe') || type.includes('subscribe_')) {
    c.forwarded = true;
    forwardedSubs.set(upIdForMsg, { client: ws, clientId: id });
  }
}

// ─── HTTP: static files and pass-through ────────────────────────────────────

const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };

function serveFile(res, file) {
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(buf);
  });
}

function proxy(req, res, base) {
  if (!online) {
    res.writeHead(503, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ message: 'van_offline' }));
  }
  const target = new URL(base + req.url);
  const headers = { ...req.headers, host: target.host, authorization: `Bearer ${token}` };
  const upReq = http.request(target, { method: req.method, headers }, (r) => {
    res.writeHead(r.statusCode, r.headers);
    r.pipe(res);
  });
  upReq.on('error', () => {
    if (!res.headersSent) res.writeHead(502).end('van unreachable');
  });
  req.pipe(upReq);
}

const server = http.createServer((req, res) => {
  if (!isTrustedAddress(req.socket.remoteAddress)) return res.writeHead(403).end();
  const url = req.url.split('?')[0];
  if (url === '/' || url === '/index.html') return serveFile(res, path.join(CFG.publicDir, 'index.html'));
  if (url === '/standalone.js') return serveFile(res, path.join(CFG.publicDir, 'standalone.js'));
  if (url === '/van-dashboard.js' || url === '/van-dashboard.css' || url.startsWith('/assets/')) {
    return serveFile(res, path.join(CFG.distDir, path.normalize(url).replace(/^(\.\.[/\\])+/, '')));
  }
  // /local/ is HA's www folder (the Windy route page lives there).
  if (url.startsWith('/api/') || url.startsWith('/local/')) return proxy(req, res, CFG.haUrl);
  res.writeHead(404).end('not found');
});

const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (req, socket, head) => {
  if (!isTrustedAddress(req.socket.remoteAddress) || req.url.split('?')[0] !== '/api/websocket') {
    return socket.destroy();
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    clients.set(ws, { entitySubs: new Set(), statusSubs: new Set(), forwarded: false, lastActive: 0 });
    clientSend(ws, { type: 'auth_required', ha_version: haVersion });
    ws.on('message', (raw) => {
      let msgs;
      try {
        msgs = JSON.parse(raw);
      } catch {
        return;
      }
      for (const m of Array.isArray(msgs) ? msgs : [msgs]) handleClient(ws, m);
    });
    ws.on('close', () => {
      clients.delete(ws);
      for (const [upSub, sub] of forwardedSubs) {
        if (sub.client !== ws) continue;
        forwardedSubs.delete(upSub);
        if (up) upSend({ type: 'unsubscribe_events', subscription: upSub });
      }
    });
  });
});

server.listen(CFG.port, () => log(`van relay on :${CFG.port}, HA ${CFG.haUrl}, ${queue.length} queued`));
connectUpstream();
