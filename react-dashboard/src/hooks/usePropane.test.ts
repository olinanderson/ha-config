import { renderHook } from '@testing-library/react';

const { entityRef } = vi.hoisted(() => ({ entityRef: { current: {} as Record<string, any> } }));
vi.mock('@/hooks/useEntity', () => ({
  useEntity: (id: string) => entityRef.current[id] ?? null,
  useEntityNumeric: (id: string) => {
    const raw = entityRef.current[id]?.state;
    const n = Number(raw);
    return { value: raw != null && raw !== '' && Number.isFinite(n) ? n : null, entity: entityRef.current[id] ?? null };
  },
}));

import { usePropane, propaneProblemText, PROPANE_PCT_ID, PROPANE_LEVEL_ID, PROPANE_BATTERY_ID } from './usePropane';

const set = (level: string, pct: string, battery: string) => {
  entityRef.current = {
    [PROPANE_LEVEL_ID]: { entity_id: PROPANE_LEVEL_ID, state: level, attributes: {} },
    [PROPANE_PCT_ID]: { entity_id: PROPANE_PCT_ID, state: pct, attributes: {} },
    [PROPANE_BATTERY_ID]: { entity_id: PROPANE_BATTERY_ID, state: battery, attributes: {} },
  };
};

describe('usePropane', () => {
  it('a silent sensor is a dead battery, not an empty tank', () => {
    // 2026-09-24: the Mopeka was unavailable and the old template said 0.0 %
    set('unavailable', '0.0', 'unavailable');
    const { result } = renderHook(() => usePropane());
    expect(result.current).toEqual({ value: null, problem: 'dead', battery: null });
    expect(propaneProblemText('dead', null)).toContain('coin cell');
  });

  it('a reading with a low sensor battery keeps the reading and warns', () => {
    set('180', '42', '12');
    const { result } = renderHook(() => usePropane());
    expect(result.current).toEqual({ value: 42, problem: 'low', battery: 12 });
  });

  it('a healthy sensor is just the level', () => {
    set('180', '42', '80');
    const { result } = renderHook(() => usePropane());
    expect(result.current).toEqual({ value: 42, problem: null, battery: 80 });
    expect(propaneProblemText(null, 80)).toBe('');
  });
});
