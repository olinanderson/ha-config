import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// Same harness as TonightCard.test.tsx: hooks mocked, entities keyed by id.
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
  LivingSpaceCard,
  ROOM_ID, OUTSIDE_ID, MODE_ID, HOLD_TARGET_ID, TARGET_ID, STATUS_ID,
  HEATER_ID, AC_ID, FAN_ID, FAN_THERMOSTAT_ID, FAN_POWER_ID, OFF_SCRIPT_ID,
} from './LivingSpaceCard';

const simple = (id: string, state: string, attributes: Record<string, any> = {}) => ({ entity_id: id, state, attributes });

function makeEntities({
  mode = 'Off', room = '21.4', outside = '7', hold = '22.0', target = '15.0', status = 'Off',
  heater = 'off', ac = 'off', fan = 'off', fanThermo = 'off', watts = '0',
} = {}) {
  return {
    [MODE_ID]: simple(MODE_ID, mode, { options: ['Off', 'Hold', 'Program', 'Fan all night', 'A/C all night', 'Heater'] }),
    [ROOM_ID]: simple(ROOM_ID, room),
    [OUTSIDE_ID]: simple(OUTSIDE_ID, outside),
    [HOLD_TARGET_ID]: simple(HOLD_TARGET_ID, hold, { min: 10, max: 30, step: 0.5 }),
    [TARGET_ID]: simple(TARGET_ID, target, { phase: 'night' }),
    [STATUS_ID]: simple(STATUS_ID, status),
    [HEATER_ID]: simple(HEATER_ID, heater),
    [AC_ID]: simple(AC_ID, ac),
    [FAN_ID]: simple(FAN_ID, fan, { percentage: 30 }),
    [FAN_THERMOSTAT_ID]: simple(FAN_THERMOSTAT_ID, fanThermo),
    [FAN_POWER_ID]: simple(FAN_POWER_ID, watts),
    [OFF_SCRIPT_ID]: simple(OFF_SCRIPT_ID, 'off'),
  };
}

beforeEach(() => {
  callService.mockClear();
  entityRef.current = makeEntities();
});
afterEach(cleanup);

const pressed = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-pressed') === 'true';
const status = () => screen.getByTestId('living-space-status');
const running = () => screen.getByTestId('living-space-running').textContent;

describe('LivingSpaceCard — the van dashboard glance', () => {
  it('shows the living space temperature and the outside air; Off has no target', () => {
    render(<LivingSpaceCard />);
    expect(screen.getByText('21.4°')).toBeTruthy();
    expect(screen.getByText('Outside 7°')).toBeTruthy();
    expect(screen.queryByText('Target')).toBeNull();
    expect(pressed('Off')).toBe(true);
    expect(status().textContent).toBe('Everything off · Auto heats or cools to a target');
  });

  it('says what each button does', () => {
    render(<LivingSpaceCard />);
    expect(screen.getByRole('button', { name: 'Off' }).textContent).toContain('all off');
    expect(screen.getByRole('button', { name: 'Auto' }).textContent).toContain('heat or cool');
    expect(screen.getByRole('button', { name: 'Fan' }).textContent).toContain('roof fan');
  });

  it('Auto and Fan write the Climate Program mode; Off runs the everything-off script', () => {
    render(<LivingSpaceCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    expect(callService).toHaveBeenCalledWith('input_select', 'select_option', { option: 'Hold' }, { entity_id: MODE_ID });
    fireEvent.click(screen.getByRole('button', { name: 'Fan' }));
    expect(callService).toHaveBeenCalledWith('input_select', 'select_option', { option: 'Fan all night' }, { entity_id: MODE_ID });
    cleanup();
    callService.mockClear();
    entityRef.current = makeEntities({
      mode: 'Hold', heater: 'heat', status: 'Hold · holding 22.0 °C · room 21.4 °C · heater',
    });
    render(<LivingSpaceCard />);
    expect(pressed('Auto')).toBe(true);
    expect(screen.getByText('Target')).toBeTruthy();
    expect(status().textContent).toBe('▲ Heating to 22.0° · heater');
    // HA's full line is the tooltip
    expect(status().getAttribute('title')).toContain('holding 22.0 °C');
    fireEvent.click(screen.getByRole('button', { name: 'Off' }));
    expect(callService).toHaveBeenCalledWith('script', 'turn_on', undefined, { entity_id: OFF_SCRIPT_ID });
    expect(callService).not.toHaveBeenCalledWith('input_select', 'select_option', { option: 'Off' }, { entity_id: MODE_ID });
  });

  it('Off still switches off an A/C started from its own card while the mode reads Off', () => {
    // 2026-09-21: the A/C was started from its card, the mode stayed Off, and
    // five taps on Off only re-selected Off. The card no longer claims Off.
    entityRef.current = makeEntities({ mode: 'Off', ac: 'cool' });
    render(<LivingSpaceCard />);
    expect(running()).toBe('A/C');
    expect(pressed('Off')).toBe(false);
    expect(status().textContent).toBe('A/C on from its own card · Off turns it off');
    fireEvent.click(screen.getByRole('button', { name: 'Off' }));
    expect(callService).toHaveBeenCalledWith('script', 'turn_on', undefined, { entity_id: OFF_SCRIPT_ID });
    cleanup();
    // A heater on its own thermostat, same thing
    entityRef.current = makeEntities({ mode: 'Off', heater: 'heat' });
    render(<LivingSpaceCard />);
    expect(running()).toBe('Heat');
    expect(pressed('Off')).toBe(false);
  });

  it('steps the Auto target by the helper step and clamps at its limits', () => {
    entityRef.current = makeEntities({ mode: 'Hold' });
    render(<LivingSpaceCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase target' }));
    expect(callService).toHaveBeenCalledWith('input_number', 'set_value', { value: 22.5 }, { entity_id: HOLD_TARGET_ID });
    fireEvent.click(screen.getByRole('button', { name: 'Decrease target' }));
    expect(callService).toHaveBeenLastCalledWith('input_number', 'set_value', { value: 21.5 }, { entity_id: HOLD_TARGET_ID });
    cleanup();
    callService.mockClear();
    entityRef.current = makeEntities({ mode: 'Hold', hold: '30.0' });
    render(<LivingSpaceCard />);
    const up = screen.getByRole('button', { name: 'Increase target' });
    expect(up.hasAttribute('disabled')).toBe(true);
    fireEvent.click(up);
    expect(callService).not.toHaveBeenCalled();
  });

  it('names what is running now from the appliances themselves', () => {
    entityRef.current = makeEntities({ mode: 'Hold', heater: 'heat', status: 'Hold · holding 22.0 °C · heater' });
    render(<LivingSpaceCard />);
    expect(running()).toBe('Heat');
    cleanup();
    // Under its own thermostat the fan entity stays off while the motor cycles
    entityRef.current = makeEntities({ mode: 'Hold', room: '25', ac: 'cool', fanThermo: 'on', watts: '18' });
    render(<LivingSpaceCard />);
    expect(running()).toBe('A/CFan');
    expect(status().textContent).toBe('▼ Cooling to 22.0° · A/C + roof fan');
    cleanup();
    entityRef.current = makeEntities({ mode: 'Off' });
    render(<LivingSpaceCard />);
    expect(running()).toBe('');
  });

  it('says why Auto is not cooling, and when it is at target', () => {
    entityRef.current = makeEntities({
      mode: 'Hold',
      room: '25.0',
      status: 'Hold · holding 22.0 °C · room 25.0 °C · nothing running · A/C needs shore power',
    });
    render(<LivingSpaceCard />);
    expect(status().textContent).toBe('Warmer than 22.0° · A/C needs shore power');
    cleanup();
    entityRef.current = makeEntities({ mode: 'Hold', room: '22.3', status: 'Hold · holding 22.0 °C · nothing running' });
    render(<LivingSpaceCard />);
    expect(status().textContent).toBe('At target 22.0°');
  });

  it('names a mode set from the Climate page and shows its target read-only', () => {
    entityRef.current = makeEntities({
      mode: 'Program',
      status: 'Program · holding 15.0 °C · room 21.4 °C · nothing running · until 07:30',
    });
    render(<LivingSpaceCard />);
    // The badge, not one of the three buttons
    expect(running()).toBe('Night');
    expect(pressed('Off')).toBe(false);
    expect(pressed('Auto')).toBe(false);
    // 15.0 is what it holds, so the Auto target's steppers are out of the way
    expect(screen.getByText('Target')).toBeTruthy();
    expect(screen.getByText('15.0°')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Increase target' })).toBeNull();
  });

  it('survives missing entities', () => {
    entityRef.current = {};
    render(<LivingSpaceCard />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.getByText('Outside —')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Off' }));
    expect(callService).not.toHaveBeenCalled();
  });
});
