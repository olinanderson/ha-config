import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';

// Same harness as ShoeDryerCard.test.tsx: hooks mocked, entities keyed by id
// so the thermostat, blower mode, heater, its power supply and Shop Mode can be
// driven independently.
const { callService, entityRef } = vi.hoisted(() => ({
  callService: vi.fn(),
  entityRef: { current: {} as Record<string, any> },
}));

vi.mock('@/hooks/useService', () => ({ useService: () => callService }));
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
// Sparklines pull history over the websocket — irrelevant to the controls.
vi.mock('@/components/ClickableValue', () => ({ SparklineStat: () => null }));

import { HeaterCard } from './HeaterCard';

const CLIMATE = 'climate.a32_pro_van_hydronic_heating_pid';
const BLOWER_MODE = 'switch.a32_pro_coolant_blower_mode_auto_manual';
const BLOWER = 'light.a32_pro_a32_pro_dac_0';
const HEATER = 'switch.a32_pro_switch24_hydronic_heater';
const SUPPLY = 'switch.a32_pro_switch32_hydronic_heater_power_supply';
const SHOP = 'input_boolean.shop_mode';
const HOT_WATER = 'input_boolean.hot_water_mode';

function makeEntities({
  climate = 'off',
  blowerMode = 'off',
  blowerBrightness = 0,
  heater = 'off',
  supply = 'on',
  shopMode = 'off',
  hotWater = 'off',
  lockout = 'off',
} = {}) {
  const simple = (id: string, state: string, attributes: Record<string, any> = {}) => ({
    entity_id: id,
    state,
    attributes,
  });
  return {
    [CLIMATE]: simple(CLIMATE, climate, {
      current_temperature: 19.9,
      temperature: 27,
      min_temp: 10,
      max_temp: 30,
      target_temp_step: 0.1,
    }),
    [BLOWER_MODE]: simple(BLOWER_MODE, blowerMode),
    [BLOWER]: simple(BLOWER, blowerBrightness > 0 ? 'on' : 'off', { brightness: blowerBrightness }),
    [HEATER]: simple(HEATER, heater),
    [SUPPLY]: simple(SUPPLY, supply),
    [SHOP]: simple(SHOP, shopMode),
    [HOT_WATER]: simple(HOT_WATER, hotWater),
    'input_boolean.heater_low_fuel_lockout': simple('input_boolean.heater_low_fuel_lockout', lockout),
    'sensor.a32_pro_hydronic_heater_status': simple('sensor.a32_pro_hydronic_heater_status', 'Idle.'),
  } as Record<string, any>;
}

const hotWaterSwitch = () => screen.getByRole('switch', { name: 'Hot Water / Hydronic Heater' });
const isChecked = (el: HTMLElement) => el.getAttribute('aria-checked') === 'true';
// Plain DOM property, same as the other card tests (no jest-dom matcher types in tsc).
const isDisabled = (el: HTMLElement) => (el as HTMLButtonElement | HTMLInputElement).disabled;
const supplyButton = () => screen.queryByRole('button', { name: /turn on heater power supply/i });
const modeButton = (name: 'Auto' | 'Manual') => screen.getByRole('button', { name });
const isPressed = (el: HTMLElement) => el.getAttribute('aria-pressed') === 'true';
const fanSlider = () => screen.getByRole('slider', { name: 'Blower fan speed' });
const targetSlider = () => screen.queryByRole('slider', { name: 'Target temperature' });

beforeEach(() => {
  callService.mockClear();
  entityRef.current = makeEntities();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('HeaterCard — blower Auto / Manual', () => {
  it('on Auto the thermostat owns the fan: target shown, fan slider locked', () => {
    entityRef.current = makeEntities({ climate: 'heat', blowerMode: 'on', blowerBrightness: 255 });
    render(<HeaterCard />);

    expect(isPressed(modeButton('Auto'))).toBe(true);
    expect(isPressed(modeButton('Manual'))).toBe(false);
    expect(isDisabled(fanSlider())).toBe(true);
    expect(targetSlider()).not.toBeNull();
    expect(screen.getByText('27.0°')).toBeTruthy();
    expect((fanSlider() as HTMLInputElement).value).toBe('100');
  });

  it('switches the blower to Manual without touching the thermostat or the heater', () => {
    entityRef.current = makeEntities({ climate: 'heat', blowerMode: 'on', heater: 'on' });
    render(<HeaterCard />);

    fireEvent.click(modeButton('Manual'));
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('switch', 'turn_off', undefined, { entity_id: BLOWER_MODE });
  });

  it('on Manual with the thermostat heating: fan slider works, target hidden, Auto hands it back', () => {
    vi.useFakeTimers();
    entityRef.current = makeEntities({ climate: 'heat', blowerMode: 'off', blowerBrightness: 128, heater: 'on' });
    render(<HeaterCard />);

    expect(isPressed(modeButton('Manual'))).toBe(true);
    expect(isDisabled(fanSlider())).toBe(false);
    expect(targetSlider()).toBeNull();
    expect(screen.getByText('Heating')).toBeTruthy();
    expect(screen.getByRole('button', { name: /turn off/i })).toBeTruthy();

    fireEvent.change(fanSlider(), { target: { value: '40' } });
    expect(callService).not.toHaveBeenCalled(); // debounced
    act(() => { vi.advanceTimersByTime(300); });
    expect(callService).toHaveBeenCalledWith('light', 'turn_on', { brightness_pct: 40 }, { entity_id: BLOWER });

    callService.mockClear();
    fireEvent.click(modeButton('Auto'));
    expect(callService).toHaveBeenCalledWith('switch', 'turn_on', undefined, { entity_id: BLOWER_MODE });
  });

  it('with the thermostat off, Auto stops a fan left running by hand', () => {
    entityRef.current = makeEntities({ climate: 'off', blowerMode: 'off', blowerBrightness: 128, heater: 'on' });
    render(<HeaterCard />);

    expect(isPressed(modeButton('Manual'))).toBe(true);
    expect(isDisabled(modeButton('Auto'))).toBe(false);
    expect(isDisabled(fanSlider())).toBe(false);
    expect(screen.getByText('Burner on')).toBeTruthy();
    expect(screen.getByText('50%')).toBeTruthy();

    // The a32_pro leaves the fan alone while the climate is OFF, so the card
    // zeroes it as well — that is what the PID's output of 0 means.
    fireEvent.click(modeButton('Auto'));
    expect(callService).toHaveBeenCalledWith('switch', 'turn_on', undefined, { entity_id: BLOWER_MODE });
    expect(callService).toHaveBeenCalledWith('light', 'turn_off', undefined, { entity_id: BLOWER });
    expect(callService).toHaveBeenCalledTimes(2);
    expect(screen.getByText('0%')).toBeTruthy();
    expect(isPressed(modeButton('Auto'))).toBe(true);
  });

  it('a pending fan drag never restarts the fan after Auto', () => {
    vi.useFakeTimers();
    entityRef.current = makeEntities({ climate: 'off', blowerMode: 'off', blowerBrightness: 128 });
    render(<HeaterCard />);

    fireEvent.change(fanSlider(), { target: { value: '70' } });
    fireEvent.click(modeButton('Auto'));
    act(() => { vi.advanceTimersByTime(600); });

    expect(callService).not.toHaveBeenCalledWith('light', 'turn_on', expect.anything(), expect.anything());
    expect(callService).toHaveBeenCalledWith('light', 'turn_off', undefined, { entity_id: BLOWER });
  });

  it('with the thermostat off and the fan stopped, Auto is already the state', () => {
    entityRef.current = makeEntities({ climate: 'off', blowerMode: 'off', heater: 'on' });
    render(<HeaterCard />);

    expect(isPressed(modeButton('Auto'))).toBe(true);
    // Nothing is held by hand, so there is nothing to hand back: the slider is
    // how you take the fan over.
    expect(isDisabled(modeButton('Manual'))).toBe(true);
    expect(isDisabled(fanSlider())).toBe(false);

    fireEvent.click(modeButton('Auto'));
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('switch', 'turn_on', undefined, { entity_id: BLOWER_MODE });
  });

  it('does not claim Manual when the mode switch state is unknown', () => {
    const ents = makeEntities({ climate: 'heat' });
    delete ents[BLOWER_MODE];
    entityRef.current = ents;
    render(<HeaterCard />);

    expect(isPressed(modeButton('Auto'))).toBe(true);
  });
});

describe('HeaterCard — thermostat', () => {
  it('Turn Off only switches the thermostat off', () => {
    entityRef.current = makeEntities({ climate: 'heat', blowerMode: 'on', heater: 'on' });
    render(<HeaterCard />);

    fireEvent.click(screen.getByRole('button', { name: /turn off/i }));
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('climate', 'set_hvac_mode', { hvac_mode: 'off' }, { entity_id: CLIMATE });
  });

  it('Turn On heats, but not while Shop Mode is armed', () => {
    render(<HeaterCard />);
    fireEvent.click(screen.getByRole('button', { name: /turn on$/i }));
    expect(callService).toHaveBeenCalledWith('climate', 'set_hvac_mode', { hvac_mode: 'heat' }, { entity_id: CLIMATE });

    cleanup();
    callService.mockClear();
    entityRef.current = makeEntities({ shopMode: 'on' });
    render(<HeaterCard />);
    const turnOn = screen.getByRole('button', { name: /turn on$/i });
    expect(isDisabled(turnOn)).toBe(true);
    fireEvent.click(turnOn);
    expect(callService).not.toHaveBeenCalled();
  });

  it('still renders the heating controls when the thermostat entity is missing', () => {
    const ents = makeEntities();
    delete ents[CLIMATE];
    entityRef.current = ents;
    render(<HeaterCard />);

    expect(screen.queryByRole('button', { name: /turn (on|off)/i })).toBeNull();
    expect(hotWaterSwitch()).toBeTruthy();
  });
});

describe('HeaterCard — hot water / hydronic heater switch', () => {
  it('turns Hot Water Mode on when the heater can start', () => {
    render(<HeaterCard />);
    expect(isDisabled(hotWaterSwitch())).toBe(false);
    expect(screen.queryByText(/power supply is off/i)).toBeNull();
    expect(supplyButton()).toBeNull();
    // The separate burner switch is gone; this is the only one.
    expect(screen.getAllByRole('switch')).toHaveLength(1);

    fireEvent.click(hotWaterSwitch());
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('input_boolean', 'turn_on', undefined, { entity_id: HOT_WATER });
  });

  it('reads on for a burner started without the thermostat, and turning it off stops it', () => {
    // e.g. the rocker: Switch24's manual request outlives Hot Water Mode off.
    entityRef.current = makeEntities({ heater: 'on' });
    render(<HeaterCard />);

    expect(isChecked(hotWaterSwitch())).toBe(true);
    fireEvent.click(hotWaterSwitch());
    expect(callService).toHaveBeenCalledTimes(2);
    expect(callService).toHaveBeenCalledWith('input_boolean', 'turn_off', undefined, { entity_id: HOT_WATER });
    expect(callService).toHaveBeenCalledWith('switch', 'turn_off', undefined, { entity_id: HEATER });
  });

  it('while the thermostat heats, shows only Hot Water Mode and leaves the burner alone', () => {
    entityRef.current = makeEntities({ climate: 'heat', blowerMode: 'on', heater: 'on' });
    render(<HeaterCard />);
    expect(isChecked(hotWaterSwitch())).toBe(false);

    cleanup();
    entityRef.current = makeEntities({ climate: 'heat', blowerMode: 'on', heater: 'on', hotWater: 'on' });
    render(<HeaterCard />);
    expect(isChecked(hotWaterSwitch())).toBe(true);
    fireEvent.click(hotWaterSwitch());
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('input_boolean', 'turn_off', undefined, { entity_id: HOT_WATER });
  });

  it('blocks turning it on and offers to restore the supply when Switch32 is off', () => {
    entityRef.current = makeEntities({ supply: 'off' });
    render(<HeaterCard />);

    expect(isDisabled(hotWaterSwitch())).toBe(true);
    expect(screen.getByText(/power supply is off/i)).toBeTruthy();
    fireEvent.click(hotWaterSwitch());
    expect(callService).not.toHaveBeenCalled();

    fireEvent.click(supplyButton()!);
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('switch', 'turn_on', undefined, { entity_id: SUPPLY });
  });

  it('blocks turning it on while Shop Mode is armed, without the supply button', () => {
    entityRef.current = makeEntities({ shopMode: 'on', supply: 'off' });
    render(<HeaterCard />);

    expect(isDisabled(hotWaterSwitch())).toBe(true);
    expect(screen.getByText(/shop mode is armed/i)).toBeTruthy();
    // Turning the supply on under Shop Mode would just be re-shut by the guard.
    expect(supplyButton()).toBeNull();
  });

  it('blocks turning it on during a low-fuel lockout', () => {
    entityRef.current = makeEntities({ lockout: 'on' });
    render(<HeaterCard />);

    expect(screen.getByText(/low fuel lockout/i)).toBeTruthy();
    expect(isDisabled(hotWaterSwitch())).toBe(true);
  });

  it('still turns off when the heater could not start again', () => {
    entityRef.current = makeEntities({ supply: 'off', hotWater: 'on' });
    render(<HeaterCard />);

    expect(isDisabled(hotWaterSwitch())).toBe(false);
    fireEvent.click(hotWaterSwitch());
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('input_boolean', 'turn_off', undefined, { entity_id: HOT_WATER });
  });

  it('does not block it when the supply state is unknown (a32_pro offline)', () => {
    const ents = makeEntities();
    delete ents[SUPPLY];
    entityRef.current = ents;
    render(<HeaterCard />);

    expect(isDisabled(hotWaterSwitch())).toBe(false);
    expect(supplyButton()).toBeNull();
  });
});
