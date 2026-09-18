import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// Same harness as HeaterCard.test.tsx: hooks mocked, entities keyed by id.
const { callService, entityRef } = vi.hoisted(() => ({
  callService: vi.fn(),
  entityRef: { current: {} as Record<string, any> },
}));
vi.mock('@/hooks/useService', () => ({ useService: () => callService }));
vi.mock('@/hooks/useEntity', () => ({
  useEntity: (id: string) => entityRef.current[id] ?? null,
}));

import {
  TonightCard,
  MODE_ID, FAN_DIRECTION_ID, NIGHT_TARGET_ID, HOLD_TARGET_ID, WAKE_TARGET_ID, WARMUP_ID, COOL_ABOVE_ID, FAN_SPEED_ID,
  USE_HEATER_ID, USE_AC_ID, USE_FAN_ID, WAKE_TIME_ID, STATUS_ID, ROOM_ID, SHORE_ID, SLEEP_MODE_ID,
  wakeTimeValue,
} from './TonightCard';

const simple = (id: string, state: string, attributes: Record<string, any> = {}) => ({ entity_id: id, state, attributes });

function makeEntities({ mode = 'Off', shore = true, status = 'Off', sleep = 'off', useAc = 'on' } = {}) {
  return {
    [MODE_ID]: simple(MODE_ID, mode, { options: ['Off', 'Hold', 'Program', 'Fan all night', 'A/C all night', 'Heater'] }),
    [FAN_DIRECTION_ID]: simple(FAN_DIRECTION_ID, 'Intake', { options: ['Intake', 'Exhaust'] }),
    [NIGHT_TARGET_ID]: simple(NIGHT_TARGET_ID, '15.0', { min: 5, max: 25, step: 0.5 }),
    [HOLD_TARGET_ID]: simple(HOLD_TARGET_ID, '22.0', { min: 10, max: 30, step: 0.5 }),
    [WAKE_TARGET_ID]: simple(WAKE_TARGET_ID, '23.0', { min: 10, max: 30, step: 0.5 }),
    [WARMUP_ID]: simple(WARMUP_ID, '45.0', { min: 0, max: 180, step: 5 }),
    [COOL_ABOVE_ID]: simple(COOL_ABOVE_ID, '24.0', { min: 18, max: 35, step: 0.5 }),
    [FAN_SPEED_ID]: simple(FAN_SPEED_ID, '30.0', { min: 10, max: 100, step: 10 }),
    [USE_HEATER_ID]: simple(USE_HEATER_ID, 'on'),
    [USE_AC_ID]: simple(USE_AC_ID, useAc),
    [USE_FAN_ID]: simple(USE_FAN_ID, 'off'),
    [WAKE_TIME_ID]: simple(WAKE_TIME_ID, '07:30:00', { has_time: true, has_date: false }),
    [STATUS_ID]: simple(STATUS_ID, status),
    [ROOM_ID]: simple(ROOM_ID, '22.5'),
    [SHORE_ID]: simple(SHORE_ID, shore ? 'on' : 'off'),
    [SLEEP_MODE_ID]: simple(SLEEP_MODE_ID, sleep),
  };
}

beforeEach(() => {
  callService.mockClear();
  entityRef.current = makeEntities();
});
afterEach(cleanup);

const pressed = (el: HTMLElement) => el.getAttribute('aria-pressed') === 'true';

describe('TonightCard', () => {
  it('shows the current mode and selects another one', () => {
    entityRef.current = makeEntities({
      mode: 'Program',
      status: 'Program · holding 15 °C · room 22.5 °C · nothing running · until 07:30',
    });
    render(<TonightCard />);
    expect(pressed(screen.getByRole('button', { name: 'Night' }))).toBe(true);
    expect(screen.getByTestId('tonight-status').textContent).toContain('holding 15 °C');
    fireEvent.click(screen.getByRole('button', { name: 'Heater' }));
    expect(callService).toHaveBeenCalledWith('input_select', 'select_option', { option: 'Heater' }, { entity_id: MODE_ID });
  });

  it('Hold keeps the hold target now', () => {
    render(<TonightCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Hold' }));
    expect(callService).toHaveBeenCalledWith('input_select', 'select_option', { option: 'Hold' }, { entity_id: MODE_ID });
    fireEvent.click(screen.getByRole('button', { name: 'Increase hold target (now)' }));
    expect(callService).toHaveBeenCalledWith('input_number', 'set_value', { value: 22.5 }, { entity_id: HOLD_TARGET_ID });
    expect(screen.getByTestId('tonight-status').textContent).toContain('Hold keeps the hold target now');
  });

  it('A/C all night needs shore power', () => {
    entityRef.current = makeEntities({ shore: false });
    render(<TonightCard />);
    expect((screen.getByRole('button', { name: 'A/C' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('A/C only runs on shore power.')).toBeTruthy();
    cleanup();
    entityRef.current = makeEntities({ shore: true });
    render(<TonightCard />);
    expect((screen.getByRole('button', { name: 'A/C' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('steps the night target by the helper step and clamps at the limits', () => {
    render(<TonightCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase night target' }));
    expect(callService).toHaveBeenCalledWith('input_number', 'set_value', { value: 15.5 }, { entity_id: NIGHT_TARGET_ID });
    fireEvent.click(screen.getByRole('button', { name: 'Decrease warm-up before wake' }));
    expect(callService).toHaveBeenCalledWith('input_number', 'set_value', { value: 40 }, { entity_id: WARMUP_ID });
    cleanup();
    entityRef.current = makeEntities();
    entityRef.current[NIGHT_TARGET_ID].state = '25.0';
    render(<TonightCard />);
    expect((screen.getByRole('button', { name: 'Increase night target' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('writes the wake time as a time-only input_datetime', () => {
    render(<TonightCard />);
    const input = screen.getByLabelText('Wake time') as HTMLInputElement;
    expect(input.value).toBe('07:30');
    fireEvent.change(input, { target: { value: '06:45' } });
    expect(callService).toHaveBeenCalledWith('input_datetime', 'set_datetime', { time: '06:45:00' }, { entity_id: WAKE_TIME_ID });
    expect(wakeTimeValue('unknown')).toBe('07:30');
  });

  it('toggles what the Program may use', () => {
    render(<TonightCard />);
    fireEvent.click(screen.getByRole('switch', { name: 'Program may use heater' }));
    expect(callService).toHaveBeenCalledWith('input_boolean', 'turn_off', undefined, { entity_id: USE_HEATER_ID });
    fireEvent.click(screen.getByRole('switch', { name: 'Program may use roof fan' }));
    expect(callService).toHaveBeenCalledWith('input_boolean', 'turn_on', undefined, { entity_id: USE_FAN_ID });
    cleanup();
    entityRef.current = makeEntities({ useAc: 'off' });
    render(<TonightCard />);
    fireEvent.click(screen.getByRole('switch', { name: 'Program may use A/C' }));
    expect(callService).toHaveBeenCalledWith('input_boolean', 'turn_on', undefined, { entity_id: USE_AC_ID });
  });

  it('sets the temperature above which the A/C joins', () => {
    render(<TonightCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease a/c above' }));
    expect(callService).toHaveBeenCalledWith('input_number', 'set_value', { value: 23.5 }, { entity_id: COOL_ABOVE_ID });
  });

  it('sets the fan direction and speed for Fan all night', () => {
    render(<TonightCard />);
    expect(pressed(screen.getByRole('button', { name: 'Intake' }))).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Exhaust' }));
    expect(callService).toHaveBeenCalledWith('input_select', 'select_option', { option: 'Exhaust' }, { entity_id: FAN_DIRECTION_ID });
    fireEvent.click(screen.getByRole('button', { name: 'Increase fan speed' }));
    expect(callService).toHaveBeenCalledWith('input_number', 'set_value', { value: 40 }, { entity_id: FAN_SPEED_ID });
  });

  it('explains how the Program starts while nothing runs', () => {
    render(<TonightCard />);
    expect(screen.getByTestId('tonight-status').textContent).toContain('Night schedule or Sleep Mode starts the night program');
    cleanup();
    entityRef.current = makeEntities({ sleep: 'on' });
    render(<TonightCard />);
    expect(screen.getByTestId('tonight-status').textContent).toContain('Sleep Mode is on');
  });

  it('renders nothing until the mode helper exists', () => {
    entityRef.current = {};
    const { container } = render(<TonightCard />);
    expect(container.firstChild).toBeNull();
  });
});
