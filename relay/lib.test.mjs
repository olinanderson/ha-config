import test from 'node:test';
import assert from 'node:assert/strict';
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

test('applyEntityDiff: add, change, remove', () => {
  const map = {};
  applyEntityDiff(map, { a: { 'switch.x': { s: 'off', a: { friendly_name: 'X', icon: 'i' }, c: 'c1', lc: 10 } } });
  applyEntityDiff(map, { c: { 'switch.x': { '+': { s: 'on', lc: 20, a: { extra: 1 } }, '-': { a: ['icon'] } } } });
  assert.deepEqual(map['switch.x'], { s: 'on', a: { friendly_name: 'X', extra: 1 }, c: 'c1', lc: 20 });
  applyEntityDiff(map, { c: { 'switch.x': { '+': { lu: 30 } } } });
  assert.equal(map['switch.x'].lu, 30);
  applyEntityDiff(map, { c: { 'switch.x': { '+': { lc: 40 } } } });
  assert.equal(map['switch.x'].lu, undefined, 'new lc without lu clears the old lu');
  applyEntityDiff(map, { r: ['switch.x'] });
  assert.deepEqual(map, {});
});

test('applyEntityDiff ignores a change for an unknown entity', () => {
  const map = {};
  applyEntityDiff(map, { c: { 'light.y': { '+': { s: 'on' } } } });
  assert.deepEqual(map, {});
});

test('snapshotEvent lists entities that disappeared', () => {
  assert.deepEqual(snapshotEvent({ a: 1 }, ['a', 'b']), { a: { a: 1 }, r: ['b'] });
  assert.deepEqual(snapshotEvent({ a: 1 }, ['a']), { a: { a: 1 } });
});

test('expandState', () => {
  const s = expandState('sensor.t', { s: '5', a: { unit: 'C' }, c: 'ctx', lc: 1 });
  assert.equal(s.state, '5');
  assert.equal(s.last_updated, '1970-01-01T00:00:01.000Z');
  assert.equal(s.context.id, 'ctx');
});

test('normalizeCall turns toggle into an explicit state', () => {
  const ents = { 'switch.h': { s: 'on' }, 'light.l': { s: 'off' } };
  const t = (id) => ({ domain: id.split('.')[0], service: 'toggle', service_data: {}, target: { entity_id: id } });
  assert.equal(normalizeCall(t('switch.h'), ents).service, 'turn_off');
  assert.equal(normalizeCall(t('light.l'), ents).service, 'turn_on');
  const set = { domain: 'climate', service: 'set_temperature', service_data: { temperature: 20 } };
  assert.equal(normalizeCall(set, ents), set);
});

test('queueKey: on/off share a key, other services and targets do not', () => {
  const on = { domain: 'switch', service: 'turn_on', target: { entity_id: 'switch.h' } };
  const off = { domain: 'switch', service: 'turn_off', service_data: { entity_id: ['switch.h'] } };
  assert.equal(queueKey(on), queueKey(off));
  assert.notEqual(queueKey(on), queueKey({ ...on, target: { entity_id: 'switch.other' } }));
  const temp = { domain: 'climate', service: 'set_temperature', target: { entity_id: 'climate.c' } };
  const mode = { domain: 'climate', service: 'set_hvac_mode', target: { entity_id: 'climate.c' } };
  assert.notEqual(queueKey(temp), queueKey(mode));
});

test('enqueue: newest command per key wins and moves to the end', () => {
  let q = [];
  q = enqueue(q, { key: 'a', v: 1 });
  q = enqueue(q, { key: 'b', v: 1 });
  q = enqueue(q, { key: 'a', v: 2 });
  assert.deepEqual(q, [{ key: 'b', v: 1 }, { key: 'a', v: 2 }]);
});

test('partitionExpired', () => {
  const { keep, expired } = partitionExpired([{ expiresAt: 5 }, { expiresAt: 15 }], 10);
  assert.equal(keep.length, 1);
  assert.equal(expired.length, 1);
});

test('describeCall', () => {
  const ents = { 'climate.h': { a: { friendly_name: 'Heater' } } };
  assert.equal(
    describeCall({ domain: 'climate', service: 'set_temperature', service_data: { temperature: 20 }, target: { entity_id: 'climate.h' } }, ents),
    'Heater → set temperature 20',
  );
  assert.equal(describeCall({ domain: 'button', service: 'press', service_data: {} }, ents), 'button.press → press');
});

test('isTrustedAddress', () => {
  assert.ok(isTrustedAddress('127.0.0.1'));
  assert.ok(isTrustedAddress('::ffff:100.80.18.122'));
  assert.ok(!isTrustedAddress('192.168.1.5'));
  assert.ok(!isTrustedAddress('100.200.1.1'));
});
