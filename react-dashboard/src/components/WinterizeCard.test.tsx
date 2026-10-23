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

import { WinterizeCard, STEPS } from './WinterizeCard';

const LOCK = 'input_boolean.water_winterized';
const FLAG = 'input_boolean.water_blowout_running';
const WALK = 'input_boolean.water_winterizing';
const STEP = 'input_number.water_winterize_step';
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
const FRESH = 'sensor.a32_pro_fresh_water_tank_level';
const GREY = 'sensor.a32_pro_grey_water_tank_level';
const MASTER = 'switch.a32_pro_water_system_master_switch';
const ELSE_PUMP = 'switch.a32_pro_switch30_main_system_water_pump';
const RECIRC_PUMP = 'switch.a32_pro_switch29_shower_system_water_pump';
const DUMP = 'switch.a32_pro_switch06_grey_water_tank_valve';
const DRAIN_ON = 'script.water_winterize_drain_on';

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
  walk = 'off',
  step = 0,
  fresh = '61.2',
  grey = '24.3',
  master = 'off',
  pumps = 'off',
  dump = 'off',
  drainOn = 'off',
} = {}) {
  const sw = (id: string, on: boolean) => ({ entity_id: id, state: on ? 'on' : 'off', attributes: {} });
  return {
    [LOCK]: { entity_id: LOCK, state: locked, attributes: {}, last_changed: NOW.toISOString() },
    [FLAG]: { entity_id: FLAG, state: flag, attributes: {} },
    [WALK]: { entity_id: WALK, state: walk, attributes: {} },
    [STEP]: { entity_id: STEP, state: String(step), attributes: { min: 0, max: 12 } },
    [SCRIPT]: {
      entity_id: SCRIPT,
      state: script,
      attributes: { last_triggered: new Date(NOW.getTime() - startedAgo * 1000).toISOString() },
    },
    [DRAIN_ON]: { entity_id: DRAIN_ON, state: drainOn, attributes: {} },
    [STATUS]: { entity_id: STATUS, state: status, attributes: {}, last_changed: NOW.toISOString() },
    [STEP_ENDS]: { entity_id: STEP_ENDS, state: 'x', attributes: { timestamp: nowSec + stepEndsIn } },
    [RUN_ENDS]: { entity_id: RUN_ENDS, state: 'x', attributes: { timestamp: nowSec + runEndsIn } },
    [MINUTES]: { entity_id: MINUTES, state: String(minutes), attributes: { min: 1, max: 10 } },
    [ROUNDS]: { entity_id: ROUNDS, state: String(rounds), attributes: { min: 1, max: 5 } },
    [SHOP]: { entity_id: SHOP, state: shopMode, attributes: {} },
    [MODE_MAIN]: sw(MODE_MAIN, mode === 'main'),
    [MODE_RECIRC]: sw(MODE_RECIRC, mode === 'recirc'),
    [MODE_FLUSH]: sw(MODE_FLUSH, mode === 'flush'),
    [FRESH]: { entity_id: FRESH, state: fresh, attributes: { unit_of_measurement: '%' } },
    [GREY]: { entity_id: GREY, state: grey, attributes: { unit_of_measurement: '%' } },
    [MASTER]: sw(MASTER, master === 'on'),
    [ELSE_PUMP]: sw(ELSE_PUMP, pumps === 'on'),
    [RECIRC_PUMP]: sw(RECIRC_PUMP, pumps === 'on'),
    [DUMP]: sw(DUMP, dump === 'on'),
  } as Record<string, any>;
}

const scriptCall = (id: string) => ['script', 'turn_on', undefined, { entity_id: id }] as const;
const stepCall = (n: number) => ['input_number', 'set_value', { value: n }, { entity_id: STEP }] as const;

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
    expect(callService).toHaveBeenCalledWith(...scriptCall(SCRIPT));
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

  it('shows how the last run ended, and since when it is winterized', () => {
    entityRef.current = makeEntities({ locked: 'on', status: 'Done. Water off, Winterized on.' });
    render(<WinterizeCard />);
    expect(screen.getByText(/Last run: Done\. Water off, Winterized on\./)).toBeTruthy();
    expect(screen.getAllByText('Winterized').length).toBeGreaterThan(1); // the badge and the lock row
    expect(screen.getByText(/^Since /)).toBeTruthy();
  });

  it('starts the walkthrough through script.water_winterize_start, once per tap', () => {
    render(<WinterizeCard />);
    fireEvent.click(screen.getByText('Start winterizing'));
    expect(callService).toHaveBeenCalledWith(...scriptCall('script.water_winterize_start'));
    fireEvent.click(screen.getByText('Starting…'));
    expect(callService).toHaveBeenCalledTimes(1);
  });

  it('offers no walkthrough while Winterized is on, only the blow-out', () => {
    entityRef.current = makeEntities({ locked: 'on' });
    render(<WinterizeCard />);
    expect(screen.queryByText('Start winterizing')).toBeNull();
    expect(screen.getByText('Start blow-out · 12 min')).toBeTruthy();
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
    expect(callService).toHaveBeenCalledWith(...scriptCall('script.water_blowout_stop'));
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

describe('WinterizeCard walkthrough', () => {
  it('has twelve steps, the fresh tank first and the blow-outs after the fuses', () => {
    expect(STEPS.length).toBe(12);
    expect(STEPS[0].title).toBe('Drain the fresh tank');
    expect(STEPS.map((s) => s.kind)).toEqual([
      'drain', 'plain', 'flush', 'plain', 'plain', 'plain', 'plain', 'plain', 'blowout', 'blowout', 'plain', 'grey',
    ]);
  });

  it('shows the step out of twelve, its title and no lock switch', () => {
    entityRef.current = makeEntities({ walk: 'on', step: 5 });
    render(<WinterizeCard />);
    expect(screen.getByText('Step 5 of 12')).toBeTruthy();
    expect(screen.getByText("Else pump's fuse out")).toBeTruthy();
    expect(screen.queryByLabelText('Winterized')).toBeNull();
  });

  it('step 1 shows the live fresh level and asks before Drained while the tank still reads water', () => {
    entityRef.current = makeEntities({ walk: 'on', step: 1, fresh: '23.4' });
    render(<WinterizeCard />);
    expect(screen.getByText('23 %')).toBeTruthy();
    fireEvent.click(screen.getByText('Drained'));
    expect(callService).not.toHaveBeenCalled();
    expect(screen.getByText(/It still reads 23 %/)).toBeTruthy();
    fireEvent.click(screen.getByText('Not yet'));
    expect(screen.queryByText('Yes, drained')).toBeNull();
    fireEvent.click(screen.getByText('Drained'));
    fireEvent.click(screen.getByText('Yes, drained'));
    expect(callService).toHaveBeenCalledWith(...stepCall(2));
  });

  it('step 1 goes straight on once the tank reads empty', () => {
    entityRef.current = makeEntities({ walk: 'on', step: 1, fresh: '0.0' });
    render(<WinterizeCard />);
    fireEvent.click(screen.getByText('Drained'));
    expect(callService).toHaveBeenCalledWith(...stepCall(2));
    expect(screen.queryByText(/Drained anyway/)).toBeNull();
  });

  it('plain steps tick a checklist and go on with Next, back with Back', () => {
    entityRef.current = makeEntities({ walk: 'on', step: 2 });
    render(<WinterizeCard />);
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes.length).toBe(5);
    fireEvent.click(boxes[0]);
    expect((boxes[0] as HTMLInputElement).checked).toBe(true);
    expect(callService).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Next'));
    expect(callService).toHaveBeenLastCalledWith(...stepCall(3));
    fireEvent.click(screen.getByLabelText('Back'));
    expect(callService).toHaveBeenLastCalledWith(...stepCall(1));
  });

  it('step 3 switches the water on in Flush and off again through the drain scripts', () => {
    entityRef.current = makeEntities({ walk: 'on', step: 3 });
    render(<WinterizeCard />);
    expect(screen.queryByText('Next')).toBeNull();
    fireEvent.click(screen.getByText('Water on in Flush'));
    expect(callService).toHaveBeenCalledWith(...scriptCall('script.water_winterize_drain_on'));

    entityRef.current = makeEntities({ walk: 'on', step: 3, master: 'on', mode: 'flush', pumps: 'on' });
    cleanup();
    render(<WinterizeCard />);
    expect((screen.getByText('The water is on in Flush') as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getAllByText('Running').length).toBe(2);
    fireEvent.click(screen.getByText('They only spit · water off'));
    expect(callService).toHaveBeenCalledWith(...scriptCall('script.water_winterize_drain_off'));
  });

  it('step 3 waits while the water is switching on', () => {
    entityRef.current = makeEntities({ walk: 'on', step: 3, drainOn: 'on', master: 'on' });
    render(<WinterizeCard />);
    expect((screen.getByText('Starting…') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByText('They only spit · water off') as HTMLButtonElement).disabled).toBe(true);
  });

  it('step 3 says to dump the grey tank first when it is nearly full', () => {
    entityRef.current = makeEntities({ walk: 'on', step: 3, grey: '85' });
    render(<WinterizeCard />);
    expect(screen.getByText(/nearly full/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Grey dump valve'));
    expect(callService).toHaveBeenCalledWith('switch', 'turn_on', undefined, { entity_id: DUMP });
    cleanup();
    entityRef.current = makeEntities({ walk: 'on', step: 3, grey: '40' });
    render(<WinterizeCard />);
    expect(screen.queryByText(/nearly full/)).toBeNull();
  });

  it('step 9 starts the blow-out and holds Next while it runs', () => {
    entityRef.current = makeEntities({ walk: 'on', step: 9 });
    render(<WinterizeCard />);
    fireEvent.click(screen.getByText('Start blow-out · 12 min'));
    expect(callService).toHaveBeenCalledWith(...scriptCall(SCRIPT));
    cleanup();
    entityRef.current = makeEntities({ walk: 'on', step: 9, flag: 'on', script: 'on', status: 'Main · round 1 of 2' });
    render(<WinterizeCard />);
    expect(screen.getByText('Main · round 1 of 2')).toBeTruthy();
    expect(screen.queryByText('Start blow-out · 12 min')).toBeNull();
    expect((screen.getByText('Next') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByText('Stop winterizing') as HTMLButtonElement).disabled).toBe(true);
  });

  it('step 10 keeps the blow-out even with Winterized already on', () => {
    entityRef.current = makeEntities({ walk: 'on', step: 10, locked: 'on', status: 'Done. Water off, Winterized on.' });
    render(<WinterizeCard />);
    expect(screen.getByText('Start blow-out · 12 min')).toBeTruthy();
    expect(screen.getByText(/Last run: Done/)).toBeTruthy();
  });

  it('step 12 shows the grey tank with its dump valve and ends with Done', () => {
    entityRef.current = makeEntities({ walk: 'on', step: 12, grey: '12', dump: 'on' });
    render(<WinterizeCard />);
    expect(screen.getByText('12 %')).toBeTruthy();
    expect(screen.getByText(/dumping/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Grey dump valve'));
    expect(callService).toHaveBeenCalledWith('switch', 'turn_off', undefined, { entity_id: DUMP });
    fireEvent.click(screen.getByText('Done'));
    expect(callService).toHaveBeenCalledWith(...scriptCall('script.water_winterize_finish'));
  });

  it('Stop asks first, then goes through script.water_winterize_stop', () => {
    entityRef.current = makeEntities({ walk: 'on', step: 4 });
    render(<WinterizeCard />);
    fireEvent.click(screen.getByText('Stop winterizing'));
    expect(callService).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Keep going'));
    expect(screen.queryByText('Stop')).toBeNull();
    fireEvent.click(screen.getByText('Stop winterizing'));
    fireEvent.click(screen.getByText('Stop'));
    expect(callService).toHaveBeenCalledWith(...scriptCall('script.water_winterize_stop'));
  });

  it('falls back to the idle card when the flag is on but the step is 0', () => {
    entityRef.current = makeEntities({ walk: 'on', step: 0 });
    render(<WinterizeCard />);
    expect(screen.getByText('Start winterizing')).toBeTruthy();
  });
});
