import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';

// Same harness as HeaterCard.test.tsx: hooks mocked, entities keyed by id.
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
// Sparklines pull history over the websocket — only the label and value matter here.
vi.mock('@/components/ClickableValue', () => ({
  SparklineStat: ({ label, value, unit }: any) => <span>{`${label} ${value}${unit}`}</span>,
}));

import { TankTempsCard } from './TankTempsCard';

const LOCK = 'input_boolean.water_winterized';
const FLAG = 'input_boolean.water_blowout_running';
const FRESH_T = 'sensor.a32_pro_s5140_channel_38_temperature_fresh_water_tank';
const GREY_T = 'sensor.a32_pro_s5140_channel_39_temperature_grey_water_tank';
const SHOWER_T = 'sensor.a32_pro_s5140_channel_40_temperature_shower_water_tank';
const FRESH_H = 'switch.a32_pro_fresh_water_tank_heater_enable';
const GREY_H = 'switch.a32_pro_grey_water_tank_heater_enable';
const SHOWER_H = 'switch.a32_pro_shower_water_tank_heater_enable';
const FRESH_C = 'climate.a32_pro_fresh_water_tank_thermostat';
const GREY_C = 'climate.a32_pro_grey_water_tank_thermostat';
const SHOWER_C = 'climate.a32_pro_shower_water_tank_thermostat';

function makeEntities({
  locked = 'off',
  flag = 'off',
  fresh = 'off',
  grey = 'on',
  shower = 'off',
  greyAction = 'idle',
  low = 3,
  high = 4,
} = {}) {
  const sw = (id: string, state: string) => ({ entity_id: id, state, attributes: {} });
  const climate = (id: string, enabled: boolean, action: string) => ({
    entity_id: id,
    state: enabled ? 'heat' : 'off',
    attributes: {
      target_temp_low: low,
      target_temp_high: high,
      hvac_action: enabled ? action : 'off',
      min_temp: -10,
      max_temp: 30,
    },
  });
  return {
    [LOCK]: sw(LOCK, locked),
    [FLAG]: sw(FLAG, flag),
    [FRESH_T]: { entity_id: FRESH_T, state: '2.3', attributes: {} },
    [GREY_T]: { entity_id: GREY_T, state: '0.5', attributes: {} },
    [SHOWER_T]: { entity_id: SHOWER_T, state: '-0.2', attributes: {} },
    [FRESH_H]: sw(FRESH_H, fresh),
    [GREY_H]: sw(GREY_H, grey),
    [SHOWER_H]: sw(SHOWER_H, shower),
    [FRESH_C]: climate(FRESH_C, fresh === 'on', 'idle'),
    [GREY_C]: climate(GREY_C, grey === 'on', greyAction),
    [SHOWER_C]: climate(SHOWER_C, shower === 'on', 'idle'),
  } as Record<string, any>;
}

const heaterCall = (id: string, on: boolean) =>
  ['switch', on ? 'turn_on' : 'turn_off', undefined, { entity_id: id }] as const;
const setpointCall = (id: string, low: number, high: number) =>
  ['climate', 'set_temperature', { target_temp_low: low, target_temp_high: high }, { entity_id: id }] as const;

const button = (label: string) => screen.getByLabelText(label) as HTMLButtonElement;

beforeEach(() => {
  vi.useFakeTimers();
  callService.mockClear();
  entityRef.current = makeEntities();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('TankTempsCard', () => {
  it('shows each tank with its temperature and a Heat switch', () => {
    render(<TankTempsCard />);
    expect(screen.getByText('Fresh 2.3°C')).toBeTruthy();
    expect(screen.getByText('Grey 0.5°C')).toBeTruthy();
    expect(screen.getByText('Shower -0.2°C')).toBeTruthy();
    expect(screen.getAllByRole('switch')).toHaveLength(3);
    expect(button('Grey tank heater').getAttribute('aria-checked')).toBe('true');
    expect(button('Fresh tank heater').getAttribute('aria-checked')).toBe('false');
  });

  it('turns a heater on and off', () => {
    render(<TankTempsCard />);
    fireEvent.click(button('Grey tank heater'));
    expect(callService).toHaveBeenLastCalledWith(...heaterCall(GREY_H, false));
    fireEvent.click(button('Fresh tank heater'));
    expect(callService).toHaveBeenLastCalledWith(...heaterCall(FRESH_H, true));
  });

  it('holds the Fresh and Shower heaters while Winterized is on, and says why', () => {
    entityRef.current = makeEntities({ locked: 'on' });
    render(<TankTempsCard />);
    expect(button('Fresh tank heater').disabled).toBe(true);
    expect(button('Shower tank heater').disabled).toBe(true);
    expect(button('Grey tank heater').disabled).toBe(false);
    expect(screen.getByText(/Winterized: the fresh and shower tanks are drained/)).toBeTruthy();
    fireEvent.click(button('Fresh tank heater'));
    expect(callService).not.toHaveBeenCalled();
  });

  it('holds them during a blow-out too', () => {
    entityRef.current = makeEntities({ flag: 'on' });
    render(<TankTempsCard />);
    expect(button('Shower tank heater').disabled).toBe(true);
    expect(button('Grey tank heater').disabled).toBe(false);
    expect(screen.getByText(/Blow-out running/)).toBeTruthy();
  });

  it('leaves everything free when neither is on', () => {
    render(<TankTempsCard />);
    expect(screen.getAllByRole('switch').every((s) => !(s as HTMLButtonElement).disabled)).toBe(true);
    expect(screen.queryByText(/Winterized/)).toBeNull();
  });

  it('shows the set points of a heater that is on, and steps them', () => {
    render(<TankTempsCard />);
    // Only Grey is on, so only its set points show
    expect(screen.getAllByText('On ≤')).toHaveLength(1);
    expect(screen.getByText('3°')).toBeTruthy();
    expect(screen.getByText('4°')).toBeTruthy();

    fireEvent.click(button('Raise Grey heat-off point'));
    expect(screen.getByText('5°')).toBeTruthy(); // shown at once
    expect(callService).not.toHaveBeenCalled(); // sent after the taps stop
    act(() => { vi.advanceTimersByTime(400); });
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenLastCalledWith(...setpointCall(GREY_C, 3, 5));

    fireEvent.click(button('Lower Grey heat-on point'));
    fireEvent.click(button('Lower Grey heat-on point'));
    act(() => { vi.advanceTimersByTime(400); });
    expect(callService).toHaveBeenCalledTimes(2); // two taps, one call
    expect(callService).toHaveBeenLastCalledWith(...setpointCall(GREY_C, 1, 5));
  });

  it('keeps On under Off and both inside the thermostat range', () => {
    entityRef.current = makeEntities({ low: -10, high: 30 });
    render(<TankTempsCard />);
    fireEvent.click(button('Lower Grey heat-on point')); // already at min_temp
    fireEvent.click(button('Raise Grey heat-off point')); // already at max_temp
    act(() => { vi.advanceTimersByTime(400); });
    expect(callService).not.toHaveBeenCalled();

    entityRef.current = makeEntities({ low: 3, high: 4 });
    cleanup();
    render(<TankTempsCard />);
    fireEvent.click(button('Raise Grey heat-on point')); // would meet Off
    fireEvent.click(button('Lower Grey heat-off point')); // would meet On
    act(() => { vi.advanceTimersByTime(400); });
    expect(callService).not.toHaveBeenCalled();
    expect(screen.getByText('3°')).toBeTruthy();
    expect(screen.getByText('4°')).toBeTruthy();
  });

  it('says Heating only while the pads are on', () => {
    entityRef.current = makeEntities({ greyAction: 'heating' });
    render(<TankTempsCard />);
    expect(screen.getByText('Heating')).toBeTruthy();
    expect(screen.queryByText('Idle')).toBeNull();
    expect(screen.getAllByText('Heat')).toHaveLength(2); // the two that are off

    cleanup();
    entityRef.current = makeEntities({ greyAction: 'idle' });
    render(<TankTempsCard />);
    expect(screen.getByText('Idle')).toBeTruthy();
    expect(screen.queryByText('Heating')).toBeNull();
  });

  it('does not log console errors on render', () => {
    const spy = vi.spyOn(console, 'error');
    render(<TankTempsCard />);
    expect(spy).not.toHaveBeenCalled();
  });
});
