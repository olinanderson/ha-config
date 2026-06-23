// Import historical body metrics from a Health Auto Export JSON file into
// Home Assistant long-term statistics (retained forever, unlike /api/history
// which is purged after ~10 days and cannot be backdated).
//
// Usage (from react-dashboard/):
//   node scripts/import-statistics.mjs [path-to-export.json]            # dry run
//   node scripts/import-statistics.mjs [path-to-export.json] --commit   # write
//
// Reads VITE_HA_URL / VITE_HA_TOKEN from .env. Uses the raw HA WebSocket API
// (Node 24 has a global WebSocket, so no extra deps). Only weight has a real
// historical series in the export; this script imports it into the existing
// sensor.apple_watch_weight statistic.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const COMMIT = process.argv.includes('--commit');
const jsonArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
const JSON_PATH =
  jsonArg ??
  'C:/Users/Olin/Downloads/HealthAutoExport_20260604141813/HealthAutoExport-2026-03-06-2026-06-04.json';

const KG_TO_LB = 2.20462262;

// What we import: metric name in the export -> target statistic + conversion.
const TARGETS = [
  {
    metric: 'weight_body_mass',
    statisticId: 'sensor.apple_watch_weight',
    hasMean: true,
    // value is in kg in the export; convert to the statistic's unit
    toUnitValue: (kg, unit) => (unit && unit.toLowerCase().startsWith('kg') ? kg : kg * KG_TO_LB),
  },
];

/* ── .env ─────────────────────────────────────────────────────────── */
function loadEnv() {
  const txt = readFileSync(resolve(ROOT, '.env'), 'utf-8');
  const env = {};
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

/* ── parse "2026-05-02 00:00:00 -0600" -> hour-aligned UTC ISO ─────── */
function toHourISO(s) {
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})\s*([+-]\d{2}):?(\d{2})/);
  if (!m) return null;
  const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${m[7]}:${m[8]}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  // align to top of the hour (UTC); daily local-midnight + whole-hour offset is already aligned
  d.setUTCMinutes(0, 0, 0);
  return d.toISOString();
}

/* ── minimal HA WS client ─────────────────────────────────────────── */
function haConnect(url, token) {
  const wsUrl = url.replace(/^http/, 'ws').replace(/\/$/, '') + '/api/websocket';
  return new Promise((resolveConn, rejectConn) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    const api = {
      send(msg) {
        const myId = ++id;
        return new Promise((res, rej) => {
          pending.set(myId, { res, rej });
          ws.send(JSON.stringify({ ...msg, id: myId }));
        });
      },
      close: () => ws.close(),
    };
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'auth_required') {
        ws.send(JSON.stringify({ type: 'auth', access_token: token }));
      } else if (msg.type === 'auth_ok') {
        resolveConn(api);
      } else if (msg.type === 'auth_invalid') {
        rejectConn(new Error('auth_invalid: ' + (msg.message || '')));
      } else if (msg.type === 'result') {
        const p = pending.get(msg.id);
        if (p) {
          pending.delete(msg.id);
          msg.success ? p.res(msg.result) : p.rej(new Error(JSON.stringify(msg.error)));
        }
      }
    });
    ws.addEventListener('error', (e) => rejectConn(new Error('ws error: ' + (e.message || e.type))));
  });
}

/* ── main ─────────────────────────────────────────────────────────── */
const env = loadEnv();
if (!env.VITE_HA_URL || !env.VITE_HA_TOKEN) {
  console.error('Missing VITE_HA_URL / VITE_HA_TOKEN in .env');
  process.exit(1);
}
const doc = JSON.parse(readFileSync(JSON_PATH, 'utf-8'));
const metrics = doc.data.metrics;

console.log(`Mode: ${COMMIT ? 'COMMIT (will write)' : 'DRY RUN (no write)'}`);
console.log(`Source: ${JSON_PATH}\n`);

const conn = await haConnect(env.VITE_HA_URL, env.VITE_HA_TOKEN);
console.log('Connected + authenticated to HA.\n');

const allMeta = await conn.send({ type: 'recorder/list_statistic_ids' });

for (const t of TARGETS) {
  const met = metrics.find((m) => m.name === t.metric);
  if (!met || !met.data?.length) {
    console.log(`! ${t.metric}: not present in export — skipping`);
    continue;
  }
  const meta = allMeta.find((x) => x.statistic_id === t.statisticId);
  const unit = meta?.statistics_unit_of_measurement ?? meta?.unit_of_measurement ?? 'lb';
  console.log(`■ ${t.metric} -> ${t.statisticId}`);
  console.log(`  existing stat metadata: ${meta ? JSON.stringify(meta) : '(none yet)'}`);
  console.log(`  importing in unit: ${unit}`);

  // build stats (dedup by hour bucket, keep last reading of the day)
  const byStart = new Map();
  for (const r of met.data) {
    const start = toHourISO(r.date);
    if (start == null || r.qty == null) continue;
    const value = +t.toUnitValue(r.qty, unit).toFixed(2);
    byStart.set(start, value);
  }
  const stats = [...byStart.entries()]
    .map(([start, value]) => ({ start, mean: value, min: value, max: value }))
    .sort((a, b) => a.start.localeCompare(b.start));

  console.log(`  ${stats.length} daily points: ${stats[0].start} (${stats[0].mean}) -> ${stats[stats.length - 1].start} (${stats[stats.length - 1].mean})`);

  if (COMMIT) {
    await conn.send({
      type: 'recorder/import_statistics',
      metadata: {
        has_mean: t.hasMean,
        has_sum: false,
        name: null,
        source: 'recorder',
        statistic_id: t.statisticId,
        unit_of_measurement: unit,
      },
      stats,
    });
    console.log('  ✓ import_statistics sent');

    // verify
    const end = new Date().toISOString();
    const start = new Date(Date.now() - 120 * 864e5).toISOString();
    const back = await conn.send({
      type: 'recorder/statistics_during_period',
      start_time: start,
      end_time: end,
      statistic_ids: [t.statisticId],
      period: 'day',
    });
    const rows = back[t.statisticId] ?? [];
    console.log(`  ✓ readback: ${rows.length} daily points now in statistics`);
    if (rows.length) {
      const f = rows[0];
      const l = rows[rows.length - 1];
      const fmt = (x) => new Date(x.start).toISOString().slice(0, 10) + '=' + (x.mean ?? x.state ?? x.sum);
      console.log(`    first ${fmt(f)} | last ${fmt(l)}`);
    }
  }
  console.log('');
}

conn.close();
console.log(COMMIT ? 'Done.' : 'Dry run complete — re-run with --commit to write.');
process.exit(0);
