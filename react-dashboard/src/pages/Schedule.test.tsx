import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

// The page reads hass through the store hook and talks to the scheduler
// component over REST, so both are faked here.
const { storeRef } = vi.hoisted(() => ({ storeRef: { current: null as any } }));
vi.mock('@/context/HomeAssistantContext', () => ({ useHassStore: () => storeRef.current }));

import Schedule, {
  DEFAULT_EDITOR,
  HEATER_CLIMATE_ID,
  editorFromSchedule,
  editorToPayload,
  scheduleSummary,
  scheduleTitle,
} from './Schedule';

const calls: { url: string; body?: any }[] = [];
let listData: any[] = [];

const heaterAction = { service: 'climate.set_temperature', entity_id: HEATER_CLIMATE_ID, service_data: { temperature: 26, hvac_mode: 'heat' } };
const schedule = (over: Record<string, any> = {}) => ({
  schedule_id: 'abc', weekdays: ['daily'], repeat_type: 'repeat', name: null, enabled: true,
  next_entries: [], timestamps: [], entity_id: 'switch.schedule_abc', tags: [],
  timeslots: [{ start: '07:30:00', stop: null, actions: [heaterAction], conditions: [], condition_type: null, track_conditions: false }],
  ...over,
});

beforeEach(() => {
  calls.length = 0;
  listData = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, body: init?.body ? JSON.parse(init.body as string) : undefined });
    return { ok: true, status: 200, json: async () => (url.endsWith('/list') ? listData : {}) };
  }));
  storeRef.current = {
    hass: {
      states: {
        [HEATER_CLIMATE_ID]: { entity_id: HEATER_CLIMATE_ID, state: 'off', attributes: { friendly_name: 'a32-Pro Van Hydronic Heating (PID)', min_temp: 10, max_temp: 30, temperature: 27 } },
        'switch.porch': { entity_id: 'switch.porch', state: 'off', attributes: { friendly_name: 'Porch' } },
      },
      auth: { data: { access_token: 'tok' } },
    },
    callService: vi.fn(),
  };
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const pressed = (el: HTMLElement) => el.getAttribute('aria-pressed') === 'true';

describe('Schedule — heater preset model', () => {
  it('a new schedule is the heater at 26 °C, 07:30, daily', () => {
    const p = editorToPayload(DEFAULT_EDITOR);
    expect(p.weekdays).toEqual(['daily']);
    expect(p.repeat_type).toBe('repeat');
    expect(p.timeslots[0].start).toBe('07:30:00');
    expect(p.timeslots[0].actions).toEqual([heaterAction]);
  });

  it('Turn off is climate.turn_off with no hvac_mode', () => {
    const p = editorToPayload({ ...DEFAULT_EDITOR, service: 'climate.turn_off', serviceDataValue: '' });
    expect(p.timeslots[0].actions[0]).toEqual({ service: 'climate.turn_off', entity_id: HEATER_CLIMATE_ID, service_data: {} });
  });

  it('opens heater schedules in the preset and others as custom', () => {
    const h = editorFromSchedule(schedule() as any);
    expect(h.preset).toBe('heater'); expect(h.serviceDataValue).toBe('26'); expect(h.time).toBe('07:30');
    const light = schedule({ timeslots: [{ ...schedule().timeslots[0], actions: [{ service: 'light.turn_on', entity_id: 'light.bed', service_data: {} }] }] });
    expect(editorFromSchedule(light as any).preset).toBe('custom');
  });

  it('titles a nameless schedule by what it does', () => {
    expect(scheduleTitle(schedule() as any)).toBe('Heater to 26 °C');
    expect(scheduleTitle(schedule({ name: 'Morning' }) as any)).toBe('Morning');
    const off = schedule({ timeslots: [{ ...schedule().timeslots[0], actions: [{ service: 'climate.turn_off', entity_id: HEATER_CLIMATE_ID, service_data: {} }] }] });
    expect(scheduleTitle(off as any)).toBe('Heater off');
  });
});

describe('Schedule — editor', () => {
  it('Add → Save creates the 26 °C at 07:30 heater schedule', async () => {
    render(<Schedule />);
    await screen.findByText('No schedules yet.');
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(pressed(screen.getByRole('button', { name: 'Heater' }))).toBe(true);
    expect(pressed(screen.getByRole('button', { name: 'Heat to' }))).toBe(true);
    expect((screen.getByLabelText('Heater temperature') as HTMLInputElement).value).toBe('26');
    expect((screen.getByLabelText('Time') as HTMLInputElement).value).toBe('07:30');
    expect(screen.queryByText('Domain')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(calls.some((c) => c.url === '/api/scheduler/add')).toBe(true));
    const body = calls.find((c) => c.url === '/api/scheduler/add')!.body;
    // exactly what the scheduler's schema takes: no null stop / empty conditions
    expect(body.timeslots[0]).toEqual({ start: '07:30:00', actions: [heaterAction] });
    expect(body.weekdays).toEqual(['daily']);
  });

  it('rejects a target outside the thermostat range', async () => {
    render(<Schedule />);
    await screen.findByText('No schedules yet.');
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.change(screen.getByLabelText('Heater temperature'), { target: { value: '45' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Set a temperature between 10 and 30 °C');
    expect(calls.some((c) => c.url === '/api/scheduler/add')).toBe(false);
  });

  it('Other brings back the domain / entity walk', async () => {
    render(<Schedule />);
    await screen.findByText('No schedules yet.');
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: 'Other' }));
    expect(screen.getByText('Domain')).toBeTruthy();
    expect(screen.queryByLabelText('Heater temperature')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Heater' }));
    expect((screen.getByLabelText('Heater temperature') as HTMLInputElement).value).toBe('26');
  });

  it('lists a saved heater schedule under a readable title', async () => {
    listData = [schedule()];
    render(<Schedule />);
    await screen.findByText('Heater to 26 °C');
    expect(screen.getByText('7:30 AM')).toBeTruthy();
  });
});

describe('Schedule — night preset', () => {
  const nightActions = [
    { service: 'input_number.set_value', entity_id: 'input_number.night_climate_night_target', service_data: { value: 15 } },
    { service: 'input_number.set_value', entity_id: 'input_number.night_climate_wake_target', service_data: { value: 23 } },
    { service: 'input_datetime.set_datetime', entity_id: 'input_datetime.night_climate_wake_time', service_data: { time: '07:30:00' } },
    { service: 'input_select.select_option', entity_id: 'input_select.night_climate_mode', service_data: { option: 'Program' } },
  ];
  const nightSchedule = (over: Record<string, any> = {}) =>
    schedule({ timeslots: [{ start: '00:30:00', actions: nightActions }], ...over });

  it('turns the editor into the four actions, mode last', () => {
    const p = editorToPayload({ ...DEFAULT_EDITOR, preset: 'night', time: '00:30', nightMode: 'Program', nightTarget: '15', wakeTarget: '23', wakeTime: '07:30' });
    expect(p.timeslots[0].start).toBe('00:30:00');
    expect(p.timeslots[0].actions).toEqual(nightActions);
  });

  it('opens a night schedule in the preset with its values', () => {
    const e = editorFromSchedule(nightSchedule() as any);
    expect(e.preset).toBe('night');
    expect(e.time).toBe('00:30');
    expect(e.nightMode).toBe('Program');
    expect(e.nightTarget).toBe('15');
    expect(e.wakeTarget).toBe('23');
    expect(e.wakeTime).toBe('07:30');
  });

  it('titles and summarizes a night schedule', () => {
    expect(scheduleTitle(nightSchedule() as any)).toBe('Night: Program');
    expect(scheduleSummary(nightSchedule() as any)).toBe('15 °C overnight, 23 °C for 7:30 AM');
    const fan = nightSchedule({ timeslots: [{ start: '00:30:00', actions: [...nightActions.slice(0, 3), { ...nightActions[3], service_data: { option: 'Fan all night' } }] }] });
    expect(scheduleTitle(fan as any)).toBe('Night: Fan all night');
    expect(scheduleSummary(fan as any)).toBe('Until 7:30 AM');
  });

  it('Add → Night → Save posts the program at 00:30 with the targets', async () => {
    render(<Schedule />);
    await waitFor(() => expect(calls.some((c) => c.url.endsWith('/list'))).toBe(true));
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Night' }));
    expect((screen.getByLabelText('Time') as HTMLInputElement).value).toBe('00:30');
    fireEvent.change(screen.getByLabelText('Night target'), { target: { value: '16' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(calls.some((c) => c.url.endsWith('/add'))).toBe(true));
    const body = calls.find((c) => c.url.endsWith('/add'))!.body;
    expect(body.timeslots[0].start).toBe('00:30:00');
    expect(body.timeslots[0].actions[0]).toEqual({ ...nightActions[0], service_data: { value: 16 } });
    expect(body.timeslots[0].actions[3]).toEqual(nightActions[3]);
  });
});
