import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// Same harness as ShoeDryerCard.test.tsx: hooks mocked, entities keyed by id
// so the heater, its power supply and Shop Mode can be driven independently.
const { callService, entityRef } = vi.hoisted(() => ({
  callService: vi.fn(),
  entityRef: { current: {} as Record<string, any> },
}));

vi.mock('@/hooks/useService', () => ({
  useService: () => callService,
  // Same shape as the real hook: domain from the entity id, service "toggle".
  useToggle: (id: string) => () =>
    callService(id.split('.')[0], 'toggle', undefined, { entity_id: id }),
}));
vi.mock('@/hooks/useEntity', () => ({
  useEntity: (id: string) => entityRef.current[id] ?? null,
  useEntityNumeric: (id: string) => {
    const raw = entityRef.current[id]?.state;
    const n = Number(raw);
    return {
      value: raw != null && raw !== 'unknown' && raw !== 'unavailable' && Number.isFinite(n) ? n : null,
      entity: entityRef.current[id] ?? null,
    };
  },
}));
// Sparklines pull history over the websocket — irrelevant to the switch gating.
vi.mock('@/components/ClickableValue', () => ({ SparklineStat: () => null }));

import { HeatingControls } from './HeatingControls';

const HEATER = 'switch.a32_pro_switch24_hydronic_heater';
const SUPPLY = 'switch.a32_pro_switch32_hydronic_heater_power_supply';
const SHOP = 'input_boolean.shop_mode';

function makeEntities({ heater = 'off', supply = 'on', shopMode = 'off' } = {}) {
  const simple = (id: string, state: string, attributes: Record<string, any> = {}) => ({
    entity_id: id,
    state,
    attributes,
  });
  return {
    [HEATER]: simple(HEATER, heater),
    [SUPPLY]: simple(SUPPLY, supply),
    [SHOP]: simple(SHOP, shopMode),
    'input_boolean.hot_water_mode': simple('input_boolean.hot_water_mode', 'off'),
    'input_boolean.heater_low_fuel_lockout': simple('input_boolean.heater_low_fuel_lockout', 'off'),
    'light.a32_pro_a32_pro_dac_0': simple('light.a32_pro_a32_pro_dac_0', 'off', { brightness: 0 }),
    'sensor.a32_pro_hydronic_heater_status': simple('sensor.a32_pro_hydronic_heater_status', 'Idle.'),
  } as Record<string, any>;
}

const heaterSwitch = () => screen.getByRole('switch', { name: 'Hydronic Heater' });
// Plain DOM property, same as the other card tests (no jest-dom matcher types in tsc).
const isDisabled = (el: HTMLElement) => (el as HTMLButtonElement).disabled;
const supplyButton = () => screen.queryByRole('button', { name: /turn on heater power supply/i });

beforeEach(() => {
  callService.mockClear();
  entityRef.current = makeEntities();
});

afterEach(() => {
  cleanup();
});

describe('HeatingControls — heater switch gating', () => {
  it('toggles the heater when the supply is on and Shop Mode is off', () => {
    render(<HeatingControls />);
    expect(isDisabled(heaterSwitch())).toBe(false);
    expect(screen.queryByText(/power supply is off/i)).toBeNull();
    expect(supplyButton()).toBeNull();

    fireEvent.click(heaterSwitch());
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('switch', 'toggle', undefined, { entity_id: HEATER });
  });

  it('disables the heater switch and offers to restore the supply when Switch32 is off', () => {
    entityRef.current = makeEntities({ supply: 'off' });
    render(<HeatingControls />);

    expect(isDisabled(heaterSwitch())).toBe(true);
    expect(screen.getByText(/power supply is off/i)).toBeTruthy();
    fireEvent.click(heaterSwitch());
    expect(callService).not.toHaveBeenCalled();

    fireEvent.click(supplyButton()!);
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('switch', 'turn_on', undefined, { entity_id: SUPPLY });
  });

  it('disables the heater switch while Shop Mode is armed, without the supply button', () => {
    entityRef.current = makeEntities({ shopMode: 'on', supply: 'off' });
    render(<HeatingControls />);

    expect(isDisabled(heaterSwitch())).toBe(true);
    expect(screen.getByText(/shop mode is armed/i)).toBeTruthy();
    // Turning the supply on under Shop Mode would just be re-shut by the guard.
    expect(supplyButton()).toBeNull();
  });

  it('does not block the heater when the supply state is unknown (a32_pro offline)', () => {
    const ents = makeEntities();
    delete ents[SUPPLY];
    entityRef.current = ents;
    render(<HeatingControls />);

    expect(isDisabled(heaterSwitch())).toBe(false);
    expect(supplyButton()).toBeNull();
  });

  it('leaves Hot Water Mode toggleable regardless of the supply', () => {
    entityRef.current = makeEntities({ supply: 'off' });
    render(<HeatingControls />);

    const hotWater = screen.getByRole('switch', { name: 'Hot Water Mode' });
    expect(isDisabled(hotWater)).toBe(false);
    fireEvent.click(hotWater);
    expect(callService).toHaveBeenCalledWith('input_boolean', 'toggle', undefined, {
      entity_id: 'input_boolean.hot_water_mode',
    });
  });
});
