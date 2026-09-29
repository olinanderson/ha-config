// Pure helpers for the van relay (relay.mjs): the entity cache in Home
// Assistant's compressed `subscribe_entities` format, and the command queue.
// No I/O here so it can be unit-tested (lib.test.mjs).

// ─── Entity cache ───────────────────────────────────────────────────────────
// Entries look like HA sends them: { s, a, c, lc, lu? } (state, attributes,
// context, last_changed, last_updated; lu is left out when it equals lc).

/** Apply one subscribe_entities event ({a, c, r}) to `map` in place. */
export function applyEntityDiff(map, ev) {
  if (ev.a) {
    for (const [id, st] of Object.entries(ev.a)) map[id] = st;
  }
  if (ev.r) {
    for (const id of ev.r) delete map[id];
  }
  if (ev.c) {
    for (const [id, ch] of Object.entries(ev.c)) {
      const old = map[id];
      if (!old) continue;
      const st = { ...old };
      const plus = ch['+'];
      if (plus) {
        const { a, ...rest } = plus;
        Object.assign(st, rest);
        // A new last_changed without last_updated means both moved together.
        if ('lc' in plus && !('lu' in plus)) delete st.lu;
        if (a) st.a = { ...st.a, ...a };
      }
      const minus = ch['-'];
      if (minus?.a) {
        st.a = { ...st.a };
        for (const k of minus.a) delete st.a[k];
      }
      map[id] = st;
    }
  }
}

/** A full snapshot as one event for a client that may hold older entities. */
export function snapshotEvent(map, previousIds = []) {
  const removed = previousIds.filter((id) => !(id in map));
  return removed.length ? { a: map, r: removed } : { a: map };
}

/** Compressed entry → the get_states shape. */
export function expandState(entityId, st) {
  const iso = (sec) => new Date(sec * 1000).toISOString();
  return {
    entity_id: entityId,
    state: st.s,
    attributes: st.a ?? {},
    last_changed: iso(st.lc),
    last_updated: iso(st.lu ?? st.lc),
    context: typeof st.c === 'string' ? { id: st.c, parent_id: null, user_id: null } : st.c,
  };
}

// ─── Command queue ──────────────────────────────────────────────────────────

const POWER = new Set(['turn_on', 'turn_off', 'toggle']);
// States that count as "on" when turning a queued toggle into turn_on/turn_off.
const ON_STATES = new Set(['on', 'open', 'opening', 'playing', 'heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only']);

/** Entity ids a call_service message targets, sorted and de-duplicated. */
export function targetIds(msg) {
  const ids = [];
  for (const src of [msg.target, msg.service_data]) {
    const e = src?.entity_id;
    if (e) ids.push(...(Array.isArray(e) ? e : [e]));
  }
  return [...new Set(ids)].sort();
}

/**
 * A queued command must say what it wants, not flip something: a toggle is
 * turned into turn_on/turn_off from the last known state, so two queued
 * toggles can't cancel out and a stale one can't flip the wrong way.
 */
export function normalizeCall(msg, entities) {
  if (msg.service !== 'toggle') return msg;
  const on = targetIds(msg).some((id) => ON_STATES.has(entities[id]?.s));
  return { ...msg, service: on ? 'turn_off' : 'turn_on' };
}

/**
 * Commands with the same key replace each other, so only the newest one per
 * thing is sent: turn_on/turn_off/toggle share a key, other services (set a
 * temperature, pick an option) get their own.
 */
export function queueKey(msg) {
  const svc = POWER.has(msg.service) ? 'power' : msg.service;
  return `${msg.domain}.${svc}:${targetIds(msg).join(',')}`;
}

/** Short human label for the dashboard, e.g. "Heater → turn on". */
export function describeCall(msg, entities) {
  const ids = targetIds(msg);
  const names = ids.map((id) => entities[id]?.a?.friendly_name ?? id);
  const who = names.length ? names.join(', ') : `${msg.domain}.${msg.service}`;
  const data = Object.entries(msg.service_data ?? {})
    .filter(([k]) => k !== 'entity_id')
    .map(([, v]) => (typeof v === 'object' ? JSON.stringify(v) : String(v)))
    .join(' ');
  const what = msg.service.replace(/_/g, ' ');
  return `${who} → ${what}${data ? ` ${data}` : ''}`;
}

/** Add `item` to `queue` (a new array), replacing any older item with its key. */
export function enqueue(queue, item) {
  return [...queue.filter((q) => q.key !== item.key), item];
}

/** Split into still-valid and expired items. */
export function partitionExpired(queue, now) {
  const keep = [];
  const expired = [];
  for (const q of queue) (now >= q.expiresAt ? expired : keep).push(q);
  return { keep, expired };
}

/** Is a remote address one of ours (loopback or the Tailscale 100.64/10 range)? */
export function isTrustedAddress(addr = '') {
  const a = addr.replace(/^::ffff:/, '');
  if (a === '127.0.0.1' || a === '::1') return true;
  const m = /^100\.(\d+)\./.exec(a);
  return !!m && +m[1] >= 64 && +m[1] <= 127;
}
