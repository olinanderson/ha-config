// End-to-end: the relay against a fake Home Assistant that starts "offline".
// Commands sent while it is down are queued (toggle made explicit, newest per
// thing wins); when it comes up the relay syncs, sends them in order and marks
// the sync. Run with `npm test`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import WebSocket, { WebSocketServer } from 'ws';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const HA_PORT = 18123;
const RELAY_PORT = 18124;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function until(fn, ms = 10_000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const v = fn();
    if (v) return v;
    await sleep(50);
  }
  throw new Error('timed out');
}

/** Minimal HA: auth, subscribe_entities, call_service (recorded), ping. */
function fakeHa(calls) {
  const server = http.createServer();
  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'auth_required', ha_version: '2026.4.0' }));
    ws.on('message', (raw) => {
      const m = JSON.parse(raw);
      if (m.type === 'auth') return ws.send(JSON.stringify({ type: 'auth_ok', ha_version: '2026.4.0' }));
      if (m.type === 'ping') return ws.send(JSON.stringify({ id: m.id, type: 'pong' }));
      if (m.type === 'subscribe_entities') {
        fakeHa.pushEntities = (event) => ws.send(JSON.stringify({ id: m.id, type: 'event', event }));
        ws.send(JSON.stringify({ id: m.id, type: 'result', success: true, result: null }));
        return ws.send(
          JSON.stringify({
            id: m.id,
            type: 'event',
            event: { a: { 'switch.heater': { s: 'on', a: { friendly_name: 'Heater' }, c: 'x', lc: 1 } } },
          }),
        );
      }
      if (m.type === 'call_service') {
        calls.push(m);
        return ws.send(JSON.stringify({ id: m.id, type: 'result', success: true, result: { context: { id: 'c' } } }));
      }
      ws.send(JSON.stringify({ id: m.id, type: 'result', success: false, error: { code: 'unknown_command' } }));
    });
  });
  return new Promise((r) => server.listen(HA_PORT, () => r(server)));
}

/** A raw client speaking HA's protocol to the relay. */
async function relayClient() {
  const ws = new WebSocket(`ws://127.0.0.1:${RELAY_PORT}/api/websocket`);
  const inbox = [];
  ws.on('message', (raw) => inbox.push(JSON.parse(raw)));
  await until(() => inbox.find((m) => m.type === 'auth_required'));
  ws.send(JSON.stringify({ type: 'auth', access_token: 'relay' }));
  await until(() => inbox.find((m) => m.type === 'auth_ok'));
  let id = 1;
  const request = async (msg) => {
    const myId = id++;
    ws.send(JSON.stringify({ ...msg, id: myId }));
    return until(() => inbox.find((m) => m.id === myId && m.type === 'result'));
  };
  return { ws, inbox, request };
}

test('queues while offline, sends on reconnect', async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'relay-test-'));
  // A saved state from an earlier session: the heater was on.
  fs.writeFileSync(
    path.join(dataDir, 'state.json'),
    JSON.stringify({ entities: { 'switch.heater': { s: 'on', a: { friendly_name: 'Heater' }, c: 'x', lc: 1 } } }),
  );
  const tokenFile = path.join(dataDir, 'token');
  fs.writeFileSync(tokenFile, 'test-token');
  const relay = spawn(process.execPath, [path.join(DIR, 'relay.mjs')], {
    env: {
      ...process.env,
      HA_URL: `http://127.0.0.1:${HA_PORT}`,
      PORT: String(RELAY_PORT),
      HA_TOKEN_FILE: tokenFile,
      DATA_DIR: dataDir,
    },
    stdio: 'inherit',
  });
  let ha;
  try {
    await sleep(500);
    const { ws, inbox, request } = await relayClient();

    // Offline: the saved state is served.
    await request({ type: 'subscribe_entities' });
    const snap = await until(() => inbox.find((m) => m.type === 'event' && m.event.a));
    assert.equal(snap.event.a['switch.heater'].s, 'on');

    // Offline: a toggle is queued as an explicit turn_off, then replaced by a
    // later turn_on for the same switch; a second thing is queued separately.
    const r1 = await request({ type: 'call_service', domain: 'switch', service: 'toggle', target: { entity_id: 'switch.heater' } });
    assert.equal(r1.success, true);
    assert.equal(r1.result.queued, true);
    await request({ type: 'call_service', domain: 'climate', service: 'set_temperature', service_data: { temperature: 20 }, target: { entity_id: 'climate.c' } });
    await request({ type: 'call_service', domain: 'switch', service: 'turn_on', target: { entity_id: 'switch.heater' } });
    const q = JSON.parse(fs.readFileSync(path.join(dataDir, 'queue.json'), 'utf8'));
    assert.deepEqual(q.map((x) => `${x.call.domain}.${x.call.service}`), ['climate.set_temperature', 'switch.turn_on']);

    // Offline: anything that needs the live van is refused.
    const r2 = await request({ type: 'recorder/statistics_during_period' });
    assert.equal(r2.error.code, 'van_offline');

    // The client that was refused gets dropped when the van comes back.
    const closed = new Promise((r) => ws.on('close', r));

    // The van comes online.
    const calls = [];
    ha = await fakeHa(calls);
    await until(() => calls.some((c) => c.domain === 'input_datetime'), 15_000);
    const services = calls.map((c) => `${c.domain}.${c.service}:${c.target?.entity_id ?? ''}`);
    assert.deepEqual(services.slice(0, 2), ['climate.set_temperature:climate.c', 'switch.turn_on:switch.heater']);
    assert.equal(services[2], 'input_datetime.set_datetime:input_datetime.starlink_relay_last_sync');
    await until(() => calls.some((c) => c.target?.entity_id === 'input_datetime.starlink_relay_hold_until'));
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dataDir, 'queue.json'), 'utf8')), []);
    await closed;

    // Online: HA starts a new window (a pause ended); the relay marks a fresh sync.
    const syncs = () => calls.filter((c) => c.target?.entity_id === 'input_datetime.starlink_relay_last_sync').length;
    const syncsBefore = syncs();
    fakeHa.pushEntities({ c: { 'input_datetime.starlink_window_started': { '+': { s: '2026-09-29 18:07:25' } } } });
    fakeHa.pushEntities({ a: { 'input_datetime.starlink_window_started': { s: '2026-09-29 18:07:25', a: {}, c: 'w', lc: 2 } } });
    await until(() => syncs() >= syncsBefore + 1);

    // Online: a new client's command goes straight through.
    const c2 = await relayClient();
    const before = calls.length;
    const r3 = await c2.request({ type: 'call_service', domain: 'light', service: 'turn_off', target: { entity_id: 'light.l' } });
    assert.equal(r3.success, true);
    assert.equal(r3.result.queued, undefined);
    assert.equal(calls.length, before + 1);
    c2.ws.close();
  } finally {
    relay.kill();
    ha?.close();
  }
});
