import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';

// Same harness as ShoeDryerCard.test.tsx: hooks mocked, entities keyed by id.
const { callService, entityRef } = vi.hoisted(() => ({
  callService: vi.fn(),
  entityRef: { current: {} as Record<string, any> },
}));

vi.mock('@/hooks/useService', () => ({ useService: () => callService }));
vi.mock('@/hooks/useEntity', () => ({
  useEntity: (id: string) => entityRef.current[id] ?? null,
}));

import { WinterizeCard } from './WinterizeCard';

const LOCK = 'input_boolean.water_winterized';
const FLAG = 'input_boolean.water_blowout_running';
const SCRIPT = 'script.water_blowout';
const STATUS = 'input_text.water_blowout_status';
const STEP_ENDS = 'input_datetime.water_blowout_step_ends';
const RUN_ENDS = 'input_datetime.water_blowout_ends';
const MINUTES = 'input_number.water_blowout_minutes';
const ROUNDS = 'input_number.water_blowout_rounds';
const SHOP = 'input_boolean.shop_mode';
const MODE_MAIN = 'switch.a32_pro_water_system_state_main';
const MODE_RECIRC = 'switch.a32_pro_water_system_state_recirculating_shower';
const MODE_FLUSH = 'switch.a32_pro_water_system_state_recirculating_shower_flush';

const NOW = new Date('2026-10-22T22:00:00Z');
const nowSec = NOW.getTime() / 1000;

function makeEntities({
  locked = 'off',
  flag = 'off',
  script = 'off',
  status = 'unknown',
  minutes = 2,
  rounds = 2,
  shopMode = 'off',
  mode = 'main',
  stepEndsIn = 90,
  runEndsIn = 600,
  startedAgo = 120,
} = {}) {
  const sw = (id: string, on: boolean) => ({ entity_id: id, state: on ? 'on' : 'off', attributes: {} });
  return {
    [LOCK]: { entity_id: LOCK, state: locked, attributes: {} },
    [FLAG]: { entity_id: FLAG, state: flag, attributes: {} },
    [SCRIPT]: {
      entity_id: SCRIPT,
      state: script,
      attributes: { last_triggered: new Date(NOW.getTime() - startedAgo * 1000).toISOString() },
    },
    [STATUS]: { entity_id: STATUS, state: status, attributes: {}, last_changed: NOW.toISOString() },
    [STEP_ENDS]: { entity_id: STEP_ENDS, state: 'x', attributes: { timestamp: nowSec + stepEndsIn } },
    [RUN_ENDS]: { entity_id: RUN_ENDS, state: 'x', attributes: { timestamp: nowSec + runEndsIn } },
    [MINUTES]: { entity_id: MINUTES, state: String(minutes), attributes: { min: 1, max: 10 } },
    [ROUNDS]: { entity_id: ROUNDS, state: String(rounds), attributes: { min: 1, max: 5 } },
    [SHOP]: { entity_id: SHOP, state: shopMode, attributes: {} },
    [MODE_MAIN]: sw(MODE_MAIN, mode === 'main'),
    [MODE_RECIRC]: sw(MODE_RECIRC, mode === 'recirc'),
    [MODE_FLUSH]: sw(MODE_FLUSH, mode === 'flush'),
  } as Record<string, any>;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  callService.mockClear();
  entityRef.current = makeEntities();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('WinterizeCard idle', () => {
  it('says so when the helpers are not loaded', () => {
    entityRef.current = {};
    render(<WinterizeCard />);
    expect(screen.getByText(/Winterize helpers not loaded/)).toBeTruthy();
  });

  it('starts the blow-out with script.turn_on, so the call returns at once', () => {
    render(<WinterizeCard />);
    fireEvent.click(screen.getByText('Start blow-out · 12 min'));
    expect(callService).toHaveBeenCalledWith('script', 'turn_on', undefined, { entity_id: SCRIPT });
  });

  it('locks Start after a tap so a double tap cannot start twice', () => {
    render(<WinterizeCard />);
    fireEvent.click(screen.getByText('Start blow-out · 12 min'));
    const pendingBtn = screen.getByText('Starting…') as HTMLButtonElement;
    expect(pendingBtn.disabled).toBe(true);
    fireEvent.click(pendingBtn);
    expect(callService).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(5000); });
    expect((screen.getByText('Start blow-out · 12 min') as HTMLButtonElement).disabled).toBe(false);
  });

  it('greys Start out under Shop Mode', () => {
    entityRef.current = makeEntities({ shopMode: 'on' });
    render(<WinterizeCard />);
    expect((screen.getByText('Start blow-out · 12 min') as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Disarm Shop Mode first/)).toBeTruthy();
  });

  it('steps minutes within 1–10 and rounds within 1–5', () => {
    entityRef.current = makeEntities({ minutes: 10, rounds: 1 });
    render(<WinterizeCard />);
    fireEvent.click(screen.getByLabelText('More minutes per mode'));
    expect(callService).toHaveBeenLastCalledWith('input_number', 'set_value', { value: 10 }, { entity_id: MINUTES });
    fireEvent.click(screen.getByLabelText('Fewer rounds'));
    expect(callService).toHaveBeenLastCalledWith('input_number', 'set_value', { value: 1 }, { entity_id: ROUNDS });
    fireEvent.click(screen.getByLabelText('More rounds'));
    expect(callService).toHaveBeenLastCalledWith('input_number', 'set_value', { value: 2 }, { entity_id: ROUNDS });
  });

  it('turns Winterized on with one tap', () => {
    render(<WinterizeCard />);
    fireEvent.click(screen.getByLabelText('Winterized'));
    expect(callService).toHaveBeenCalledWith('input_boolean', 'turn_on', undefined, { entity_id: LOCK });
  });

  it('asks before turning Winterized off', () => {
    entityRef.current = makeEntities({ locked: 'on' });
    render(<WinterizeCard />);
    fireEvent.click(screen.getByLabelText('Winterized'));
    expect(callService).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Turn Winterized off')).toBeNull();
    fireEvent.click(screen.getByLabelText('Winterized'));
    fireEvent.click(screen.getByText('Turn Winterized off'));
    expect(callService).toHaveBeenCalledWith('input_boolean', 'turn_off', undefined, { entity_id: LOCK });
  });

  it('shows how the last run ended', () => {
    entityRef.current = makeEntities({ locked: 'on', status: 'Done. Water off, Winterized on.' });
    render(<WinterizeCard />);
    expect(screen.getByText(/Last run: Done\. Water off, Winterized on\./)).toBeTruthy();
    expect(screen.getAllByText('Winterized').length).toBeGreaterThan(1); // the badge and the lock row
  });
});

describe('WinterizeCard running', () => {
  const runningEntities = () =>
    makeEntities({ flag: 'on', script: 'on', status: 'Recirc · round 1 of 2', mode: 'recirc' });

  it('shows the step, the mode the a32 is in, the time left and when it ends', () => {
    entityRef.current = runningEntities();
    render(<WinterizeCard />);
    expect(screen.getByText('Recirc · round 1 of 2')).toBeTruthy();
    expect(screen.getByText('Blowing out')).toBeTruthy();
    expect(screen.getByText('Recirc').getAttribute('aria-current')).toBe('step');
    expect(screen.getByText('Main').getAttribute('aria-current')).toBeNull();
    expect(screen.getByText('1:30')).toBeTruthy();
    const doneAt = new Date(NOW.getTime() + 600_000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    expect(screen.getByText(`Done at ${doneAt}`)).toBeTruthy();
  });

  it('counts the step down every second', () => {
    entityRef.current = runningEntities();
    render(<WinterizeCard />);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByText('1:27')).toBeTruthy();
  });

  it('stops through script.water_blowout_stop', () => {
    entityRef.current = runningEntities();
    render(<WinterizeCard />);
    fireEvent.click(screen.getByText('Stop'));
    expect(callService).toHaveBeenCalledWith('script', 'turn_on', undefined, { entity_id: 'script.water_blowout_stop' });
  });

  it('holds the Winterized switch while it runs', () => {
    entityRef.current = runningEntities();
    render(<WinterizeCard />);
    expect((screen.getByLabelText('Winterized') as HTMLButtonElement).disabled).toBe(true);
  });

  it('stays on the running face while a Stop finishes (script off, flag on)', () => {
    entityRef.current = makeEntities({ flag: 'on', script: 'off', status: 'Finishing: valves back to Main, then the water off', stepEndsIn: -30 });
    render(<WinterizeCard />);
    expect(screen.getByText('Finishing: valves back to Main, then the water off')).toBeTruthy();
    expect(screen.queryByText(/left$/)).toBeNull();
    expect(screen.getByText('Stop')).toBeTruthy();
  });
});
