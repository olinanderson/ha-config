import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';

// Same harness as AirConditionerCard.test.tsx: hooks mocked, entities keyed
// by id so timer / minutes / shop mode can be driven independently.
const { callService, entityRef, openHistory } = vi.hoisted(() => ({
  callService: vi.fn(),
  openHistory: vi.fn(),
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
vi.mock('@/components/EntityHistoryDialog', () => ({
  useHistoryDialog: () => ({ open: openHistory }),
}));

import { ShoeDryerCard } from './ShoeDryerCard';

const TIMER = 'timer.shoe_dryer';
const MINUTES = 'input_number.shoe_dryer_minutes';
const SHOP = 'input_boolean.shop_mode';
const AIR = 'sensor.a32_pro_s5140_channel_35_temperature_blower_air';
const COOLANT = 'sensor.a32_pro_s5140_channel_34_temperature_blower_coolant';

const NOW = new Date('2026-08-26T12:00:00Z');

// HA's wire format for finishes_at: ISO with an explicit UTC offset, not "Z".
function haTimestamp(secondsFromNow: number): string {
  return new Date(NOW.getTime() + secondsFromNow * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, '+00:00');
}

function makeEntities({
  timerState = 'idle',
  minutes = 30,
  shopMode = 'off',
  duration = '0:00:20',
  remaining = '0:00:20',
  finishesInSec = 20,
  air = '67.0571441650391',
  coolant = '93.8857040405273',
} = {}) {
  return {
    [AIR]: { entity_id: AIR, state: air, attributes: { unit_of_measurement: '°C' } },
    [COOLANT]: { entity_id: COOLANT, state: coolant, attributes: { unit_of_measurement: '°C' } },
    [TIMER]: {
      entity_id: TIMER,
      state: timerState,
      attributes:
        timerState === 'active'
          ? { duration, remaining, finishes_at: haTimestamp(finishesInSec) }
          : timerState === 'paused'
            ? { duration, remaining } // a paused timer has no finishes_at
            : { duration },
    },
    [MINUTES]: { entity_id: MINUTES, state: String(minutes), attributes: { min: 5, max: 240, step: 5 } },
    [SHOP]: { entity_id: SHOP, state: shopMode, attributes: {} },
  } as Record<string, any>;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  callService.mockClear();
  openHistory.mockClear();
  entityRef.current = makeEntities();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('ShoeDryerCard idle', () => {
  it('starts the dryer via script.shoe_dryer_start', () => {
    render(<ShoeDryerCard />);
    fireEvent.click(screen.getByText('Start Drying'));
    expect(callService).toHaveBeenCalledWith('script', 'shoe_dryer_start');
  });

  it('locks the Start button after a tap so a double-tap cannot fire twice', () => {
    render(<ShoeDryerCard />);
    const btn = screen.getByText('Start Drying');
    fireEvent.click(btn);
    const pendingBtn = screen.getByText('Starting…') as HTMLButtonElement;
    expect(pendingBtn.disabled).toBe(true);
    fireEvent.click(pendingBtn);
    expect(callService).toHaveBeenCalledTimes(1);
    // Safety timeout re-enables it if the timer never goes active.
    act(() => { vi.advanceTimersByTime(5000); });
    expect((screen.getByText('Start Drying') as HTMLButtonElement).disabled).toBe(false);
  });

  it('adjusts run time in 5-minute steps via input_number.set_value', () => {
    render(<ShoeDryerCard />);
    fireEvent.click(screen.getByLabelText('Increase run time'));
    expect(callService).toHaveBeenCalledWith(
      'input_number', 'set_value', { value: 35 }, { entity_id: MINUTES },
    );
    fireEvent.click(screen.getByLabelText('Decrease run time'));
    expect(callService).toHaveBeenCalledWith(
      'input_number', 'set_value', { value: 25 }, { entity_id: MINUTES },
    );
  });

  it('clamps run time at the 5-minute floor', () => {
    entityRef.current = makeEntities({ minutes: 5 });
    render(<ShoeDryerCard />);
    fireEvent.click(screen.getByLabelText('Decrease run time'));
    expect(callService).toHaveBeenCalledWith(
      'input_number', 'set_value', { value: 5 }, { entity_id: MINUTES },
    );
  });

  it('preset chips set the duration directly', () => {
    render(<ShoeDryerCard />);
    fireEvent.click(screen.getByText('2h'));
    expect(callService).toHaveBeenCalledWith(
      'input_number', 'set_value', { value: 120 }, { entity_id: MINUTES },
    );
  });

  it('disables Start while Shop Mode is armed', () => {
    entityRef.current = makeEntities({ shopMode: 'on' });
    render(<ShoeDryerCard />);
    expect((screen.getByText('Start Drying') as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Disarm Shop Mode/)).toBeTruthy();
  });
});

describe('ShoeDryerCard active', () => {
  it('shows a live countdown computed from finishes_at and ticks down', () => {
    entityRef.current = makeEntities({ timerState: 'active', finishesInSec: 20 });
    render(<ShoeDryerCard />);
    expect(screen.getByText('0:20')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText('0:15')).toBeTruthy();
  });

  it('formats hour-long remainders as h:mm:ss', () => {
    entityRef.current = makeEntities({
      timerState: 'active', duration: '2:00:00', finishesInSec: 3725,
    });
    render(<ShoeDryerCard />);
    expect(screen.getByText('1:02:05')).toBeTruthy();
  });

  it('clamps to 0:00 when finishes_at is already past (finished event delayed)', () => {
    entityRef.current = makeEntities({ timerState: 'active', finishesInSec: -5 });
    render(<ShoeDryerCard />);
    expect(screen.getByText('0:00')).toBeTruthy();
  });

  it('sizes the progress bar from remaining vs duration', () => {
    entityRef.current = makeEntities({
      timerState: 'active', duration: '0:00:40', finishesInSec: 20,
    });
    const { container } = render(<ShoeDryerCard />);
    const bar = container.querySelector('.bg-cyan-500') as HTMLElement;
    expect(bar.style.width).toBe('50%');
  });

  it('stops via script.shoe_dryer_stop', () => {
    entityRef.current = makeEntities({ timerState: 'active' });
    render(<ShoeDryerCard />);
    fireEvent.click(screen.getByText('Stop'));
    expect(callService).toHaveBeenCalledWith('script', 'shoe_dryer_stop');
  });

  it('warns instead of claiming 100% when Shop Mode killed the blower mid-dry', () => {
    entityRef.current = makeEntities({ timerState: 'active', shopMode: 'on' });
    render(<ShoeDryerCard />);
    expect(screen.getByText(/Shop Mode killed the blower/)).toBeTruthy();
    expect(screen.queryByText(/Blower at 100%/)).toBeNull();
  });
});

describe('ShoeDryerCard paused', () => {
  it('does NOT render the idle face — shows Paused with the frozen remaining time and Stop', () => {
    entityRef.current = makeEntities({ timerState: 'paused', remaining: '0:10:00' });
    render(<ShoeDryerCard />);
    expect(screen.getByText('Paused')).toBeTruthy();
    expect(screen.getByText('10:00')).toBeTruthy();
    expect(screen.queryByText('Start Drying')).toBeNull();
    fireEvent.click(screen.getByText('Stop'));
    expect(callService).toHaveBeenCalledWith('script', 'shoe_dryer_stop');
  });
});

describe('ShoeDryerCard blower temperatures', () => {
  it('shows air and coolant temps rounded to 1 decimal while idle', () => {
    render(<ShoeDryerCard />);
    expect(screen.getByText('Air')).toBeTruthy();
    expect(screen.getByText('67.1°C')).toBeTruthy();
    expect(screen.getByText('Coolant')).toBeTruthy();
    expect(screen.getByText('93.9°C')).toBeTruthy();
  });

  it('keeps the temps visible while drying', () => {
    entityRef.current = makeEntities({ timerState: 'active' });
    render(<ShoeDryerCard />);
    expect(screen.getByText('67.1°C')).toBeTruthy();
    expect(screen.getByText('93.9°C')).toBeTruthy();
  });

  it('falls back to a dash when a probe is unavailable', () => {
    entityRef.current = makeEntities({ air: 'unavailable', coolant: 'unknown' });
    render(<ShoeDryerCard />);
    expect(screen.getAllByText('—°C')).toHaveLength(2);
  });

  it('opens history when a temp tile is tapped', () => {
    render(<ShoeDryerCard />);
    fireEvent.click(screen.getByText('Air'));
    expect(openHistory).toHaveBeenCalledWith(AIR, 'Blower Air', '°C');
  });
});

describe('ShoeDryerCard unconfigured', () => {
  it('explains when the timer entity is missing', () => {
    entityRef.current = {};
    render(<ShoeDryerCard />);
    expect(screen.getByText(/not configured/)).toBeTruthy();
  });
});
