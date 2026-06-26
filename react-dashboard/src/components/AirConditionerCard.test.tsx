import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';

// Mock the two HA hooks the card depends on so we can drive entity state and
// capture service calls. `vi.hoisted` lets the mock factories reference these.
const { callService, entityRef } = vi.hoisted(() => ({
  callService: vi.fn(),
  entityRef: { current: null as any },
}));

vi.mock('@/hooks/useService', () => ({ useService: () => callService }));
vi.mock('@/hooks/useEntity', () => ({ useEntity: () => entityRef.current }));

import { AirConditionerCard } from './AirConditionerCard';

const ENTITY_ID = 'climate.ag_pro_24v_air_conditioner';

function makeEntity({ state = 'cool', attrs = {} }: { state?: string; attrs?: Record<string, unknown> } = {}) {
  return {
    entity_id: ENTITY_ID,
    state,
    attributes: {
      temperature: 24,
      current_temperature: 20,
      fan_mode: 'medium',
      fan_modes: ['low', 'medium', 'high'],
      swing_mode: 'off',
      swing_modes: ['off', 'vertical'],
      min_temp: 16,
      max_temp: 32,
      target_temp_step: 1,
      ...attrs,
    },
  };
}

const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

beforeEach(() => {
  vi.useFakeTimers();
  callService.mockClear();
  entityRef.current = makeEntity();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('AirConditionerCard debounce', () => {
  it('coalesces rapid temp taps into ONE set_temperature with the final value', () => {
    render(<AirConditionerCard />);
    const inc = screen.getByLabelText('Increase temperature');

    fireEvent.click(inc); // 24 -> 25
    advance(1000);
    fireEvent.click(inc); // -> 26
    advance(1000);
    fireEvent.click(inc); // -> 27  (last interaction)

    // 4 s after the last tap: still within the 5 s window → nothing sent yet
    advance(4000);
    expect(callService).not.toHaveBeenCalled();

    // cross the 5 s threshold → exactly one command, with the final value
    advance(1500);
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith(
      'climate',
      'set_temperature',
      { temperature: 27 },
      { entity_id: ENTITY_ID },
    );
  });

  it('sends one command per changed dimension (temp + fan), final values only', () => {
    render(<AirConditionerCard />);

    fireEvent.click(screen.getByLabelText('Increase temperature')); // 25
    fireEvent.click(screen.getByLabelText('Increase temperature')); // 26
    fireEvent.click(screen.getByRole('button', { name: 'High' }));   // fan -> high

    advance(5500);

    expect(callService).toHaveBeenCalledWith(
      'climate', 'set_temperature', { temperature: 26 }, { entity_id: ENTITY_ID },
    );
    expect(callService).toHaveBeenCalledWith(
      'climate', 'set_fan_mode', { fan_mode: 'high' }, { entity_id: ENTITY_ID },
    );
    // fan + temp only — mode was unchanged so no set_hvac_mode
    expect(callService).not.toHaveBeenCalledWith(
      'climate', 'set_hvac_mode', expect.anything(), expect.anything(),
    );
    expect(callService).toHaveBeenCalledTimes(2);
  });

  it('sends nothing when a value is nudged then returned to its original', () => {
    render(<AirConditionerCard />);
    fireEvent.click(screen.getByLabelText('Increase temperature')); // 24 -> 25
    fireEvent.click(screen.getByLabelText('Decrease temperature')); // 25 -> 24 (== backend)
    advance(6000);
    expect(callService).not.toHaveBeenCalled();
  });

  it('turning on then setting temp sends set_hvac_mode(cool) + set_temperature together', () => {
    entityRef.current = makeEntity({ state: 'off' });
    render(<AirConditionerCard />);

    fireEvent.click(screen.getByRole('button', { name: /turn on/i })); // mode -> cool (optimistic enables controls)
    fireEvent.click(screen.getByLabelText('Increase temperature'));     // 24 -> 25

    advance(5500);

    expect(callService).toHaveBeenCalledWith(
      'climate', 'set_hvac_mode', { hvac_mode: 'cool' }, { entity_id: ENTITY_ID },
    );
    expect(callService).toHaveBeenCalledWith(
      'climate', 'set_temperature', { temperature: 25 }, { entity_id: ENTITY_ID },
    );
    expect(callService).toHaveBeenCalledTimes(2);
  });

  it('"Apply now" flushes immediately without waiting for the countdown', () => {
    render(<AirConditionerCard />);
    fireEvent.click(screen.getByLabelText('Increase temperature')); // 25, pill appears
    fireEvent.click(screen.getByRole('button', { name: /apply now/i }));

    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith(
      'climate', 'set_temperature', { temperature: 25 }, { entity_id: ENTITY_ID },
    );
  });
});
