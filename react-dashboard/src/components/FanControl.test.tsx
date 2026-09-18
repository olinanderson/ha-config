import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';

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
    return { value: raw != null && Number.isFinite(n) ? n : null, entity: entityRef.current[id] ?? null };
  },
}));

import {
  FanControl, FAN_ID, FAN_THERMOSTAT_ID, FAN_SET_POINT_ID, LID_ID, DIRECTION_ID, ROOM_ID, POWER_ID, FORCE_OFF_ID,
  APPLY_DELAY_MS, fToC,
} from './FanControl';

const simple = (id: string, state: string, attributes: Record<string, any> = {}) => ({ entity_id: id, state, attributes });

function makeEntities({ fan = 'off', thermostat = 'off', setPoint = '65.0', watts = '0', lid = 'closed' } = {}) {
  return {
    [FAN_ID]: simple(FAN_ID, fan, { percentage: 30, direction: 'reverse' }),
    [LID_ID]: simple(LID_ID, lid),
    [DIRECTION_ID]: simple(DIRECTION_ID, 'Intake'),
    [FAN_THERMOSTAT_ID]: simple(FAN_THERMOSTAT_ID, thermostat),
    [FAN_SET_POINT_ID]: simple(FAN_SET_POINT_ID, setPoint, { min: 29, max: 99, step: 1 }),
    [POWER_ID]: simple(POWER_ID, watts),
    [ROOM_ID]: simple(ROOM_ID, '22.4'),
    [FORCE_OFF_ID]: simple(FORCE_OFF_ID, 'unknown'),
  };
}

beforeEach(() => {
  callService.mockClear();
  entityRef.current = makeEntities();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const pressed = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-pressed') === 'true';
const settle = () => act(() => { vi.advanceTimersByTime(APPLY_DELAY_MS + 1); });

describe('FanControl — one Off / Manual / Auto control', () => {
  it('reads the mode from the fan and thermostat entities', () => {
    render(<FanControl />);
    expect(pressed('Off')).toBe(true);
    expect(screen.getByText('Auto above')).toBeTruthy();
    expect(screen.getByText('22.4°')).toBeTruthy();
    expect(screen.queryByRole('slider')).toBeNull();
    cleanup();
    entityRef.current = makeEntities({ fan: 'on', watts: '9' });
    render(<FanControl />);
    expect(pressed('Manual')).toBe(true);
    expect(screen.getByText('30%')).toBeTruthy();
    expect(screen.getByLabelText('fan speed')).toBeTruthy();
    expect(screen.getByText('On')).toBeTruthy();
    cleanup();
    entityRef.current = makeEntities({ thermostat: 'on' });
    render(<FanControl />);
    expect(pressed('Auto')).toBe(true);
    expect(screen.getByLabelText('fan set point')).toBeTruthy();
    expect(screen.getByText('Auto · idle')).toBeTruthy();
    cleanup();
    entityRef.current = makeEntities({ thermostat: 'on', watts: '22' });
    render(<FanControl />);
    expect(screen.getByText('Auto · running')).toBeTruthy();
    expect(screen.getByText('22 W')).toBeTruthy();
  });

  it('Auto starts the thermostat, Manual the fan, Off ends whichever runs', () => {
    render(<FanControl />);
    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    expect(callService).toHaveBeenCalledWith('switch', 'turn_on', undefined, { entity_id: FAN_THERMOSTAT_ID });
    fireEvent.click(screen.getByRole('button', { name: 'Manual' }));
    expect(callService).toHaveBeenCalledWith('fan', 'turn_on', undefined, { entity_id: FAN_ID });
    cleanup();
    callService.mockClear();
    entityRef.current = makeEntities({ thermostat: 'on' });
    render(<FanControl />);
    fireEvent.click(screen.getByRole('button', { name: 'Off' }));
    expect(callService).toHaveBeenCalledWith('switch', 'turn_off', undefined, { entity_id: FAN_THERMOSTAT_ID });
    cleanup();
    callService.mockClear();
    entityRef.current = makeEntities({ fan: 'on' });
    render(<FanControl />);
    fireEvent.click(screen.getByRole('button', { name: 'Off' }));
    expect(callService).toHaveBeenCalledWith('fan', 'turn_off', undefined, { entity_id: FAN_ID });
  });

  it('shows the set point in °C and °F and sends a run of taps as one value', () => {
    vi.useFakeTimers();
    entityRef.current = makeEntities({ thermostat: 'on' });
    render(<FanControl />);
    expect(screen.getByText('18.3°')).toBeTruthy();
    expect(screen.getByText('65 °F')).toBeTruthy();
    expect(fToC(65).toFixed(1)).toBe('18.3');
    const up = screen.getByRole('button', { name: 'Increase fan set point' });
    fireEvent.click(up);
    fireEvent.click(up);
    fireEvent.click(up);
    expect(screen.getByText('68 °F')).toBeTruthy();
    expect(screen.getByText('20.0°')).toBeTruthy();
    expect(callService).not.toHaveBeenCalled();
    settle();
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('number', 'set_value', { value: 68 }, { entity_id: FAN_SET_POINT_ID });
    // The slider goes the same way
    fireEvent.change(screen.getByLabelText('fan set point'), { target: { value: '75' } });
    settle();
    expect(callService).toHaveBeenLastCalledWith('number', 'set_value', { value: 75 }, { entity_id: FAN_SET_POINT_ID });
    expect(callService).toHaveBeenCalledTimes(2);
  });

  it('sends a waiting set point before Auto starts and a speed drag as one value', () => {
    vi.useFakeTimers();
    entityRef.current = makeEntities({ fan: 'on' });
    render(<FanControl />);
    const faster = screen.getByRole('button', { name: 'Increase fan speed' });
    fireEvent.click(faster);
    fireEvent.click(faster);
    expect(screen.getByText('50%')).toBeTruthy();
    settle();
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('fan', 'set_percentage', { percentage: 50 }, { entity_id: FAN_ID });
    // A speed still waiting is dropped by Off, so it cannot restart the fan
    callService.mockClear();
    fireEvent.click(faster);
    fireEvent.click(screen.getByRole('button', { name: 'Off' }));
    settle();
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('fan', 'turn_off', undefined, { entity_id: FAN_ID });
    cleanup();
    callService.mockClear();
    entityRef.current = makeEntities({ thermostat: 'on' });
    render(<FanControl />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease fan set point' }));
    fireEvent.click(screen.getByRole('button', { name: 'Off' }));
    settle();
    // Off first (its frame clears the thermostat), then the value is stored without a frame
    expect(callService.mock.calls.map((c) => `${c[0]}.${c[1]}`)).toEqual(['switch.turn_off', 'number.set_value']);
    expect(callService).toHaveBeenLastCalledWith('number', 'set_value', { value: 64 }, { entity_id: FAN_SET_POINT_ID });
  });

  it('changes direction and lid; in Auto the direction restarts the thermostat', () => {
    render(<FanControl />);
    expect(pressed('Intake')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Exhaust' }));
    expect(callService).toHaveBeenCalledWith('fan', 'set_direction', { direction: 'forward' }, { entity_id: FAN_ID });
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(callService).toHaveBeenCalledWith('cover', 'open_cover', undefined, { entity_id: LID_ID });
    expect(pressed('Closed')).toBe(true);
    cleanup();
    callService.mockClear();
    entityRef.current = makeEntities({ thermostat: 'on', lid: 'open' });
    render(<FanControl />);
    fireEvent.click(screen.getByRole('button', { name: 'Exhaust' }));
    expect(callService).toHaveBeenCalledWith('esphome', 'ag_pro_roof_fan_thermostat', { temp_f: 65, exhaust: true, speed_pct: 30 });
    fireEvent.click(screen.getByRole('button', { name: 'Closed' }));
    expect(callService).toHaveBeenCalledWith('cover', 'close_cover', undefined, { entity_id: LID_ID });
  });

  it('Off while it already shows Off sends off / lid closed again', () => {
    render(<FanControl />);
    fireEvent.click(screen.getByRole('button', { name: 'Off' }));
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('button', 'press', undefined, { entity_id: FORCE_OFF_ID });
    // Tapping the mode that is already running does nothing
    cleanup();
    callService.mockClear();
    entityRef.current = makeEntities({ fan: 'on' });
    render(<FanControl />);
    fireEvent.click(screen.getByRole('button', { name: 'Manual' }));
    expect(callService).not.toHaveBeenCalled();
    // Without the firmware button there is nothing to press
    cleanup();
    entityRef.current = makeEntities();
    delete entityRef.current[FORCE_OFF_ID];
    render(<FanControl />);
    fireEvent.click(screen.getByRole('button', { name: 'Off' }));
    expect(callService).not.toHaveBeenCalled();
  });

  it('falls back to Off / On until the firmware thermostat exists', () => {
    delete entityRef.current[FAN_THERMOSTAT_ID];
    render(<FanControl />);
    expect(screen.queryByRole('button', { name: 'Auto' })).toBeNull();
    expect(screen.queryByText('Auto above')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'On' }));
    expect(callService).toHaveBeenCalledWith('fan', 'turn_on', undefined, { entity_id: FAN_ID });
  });
});
