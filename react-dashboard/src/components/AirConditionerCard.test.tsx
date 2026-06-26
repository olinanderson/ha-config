import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';

// Mock the HA hooks. useEntity is keyed by entity id so we can drive the
// climate, the fan-level number, and the amps sensor independently.
const { callService, entityRef } = vi.hoisted(() => ({
  callService: vi.fn(),
  entityRef: { current: {} as Record<string, any> },
}));

vi.mock('@/hooks/useService', () => ({ useService: () => callService }));
vi.mock('@/hooks/useEntity', () => ({ useEntity: (id: string) => entityRef.current[id] ?? null }));

import { AirConditionerCard } from './AirConditionerCard';

const ENTITY_ID = 'climate.ag_pro_24v_air_conditioner';
const FAN_NUMBER = 'number.ag_pro_24v_ac_fan_level';
const AMPS = 'sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning';

function makeEntities({ mode = 'cool', temp = 24, fan = 4, amps = '0.0' } = {}) {
  return {
    [ENTITY_ID]: {
      entity_id: ENTITY_ID,
      state: mode,
      attributes: {
        temperature: temp,
        current_temperature: 20,
        swing_mode: 'off',
        swing_modes: ['off', 'vertical'],
        min_temp: 16,
        max_temp: 32,
        target_temp_step: 1,
      },
    },
    [FAN_NUMBER]: {
      entity_id: FAN_NUMBER,
      state: String(fan),
      attributes: { min: 1, max: 6, step: 1 },
    },
    [AMPS]: { entity_id: AMPS, state: amps, attributes: { unit_of_measurement: 'A' } },
  } as Record<string, any>;
}

const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

beforeEach(() => {
  vi.useFakeTimers();
  callService.mockClear();
  entityRef.current = makeEntities();
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
    fireEvent.click(inc); // -> 27 (last interaction)

    advance(4000); // 4 s after last tap → still pending
    expect(callService).not.toHaveBeenCalled();

    advance(1500); // cross 5 s → one command, final value
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith(
      'climate', 'set_temperature', { temperature: 27 }, { entity_id: ENTITY_ID },
    );
  });

  it('coalesces fan taps into ONE number.set_value with the final 1–6 level', () => {
    render(<AirConditionerCard />);
    const incFan = screen.getByLabelText('Increase fan speed');

    fireEvent.click(incFan); // 4 -> 5
    fireEvent.click(incFan); // 5 -> 6

    advance(5500);

    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith(
      'number', 'set_value', { value: 6 }, { entity_id: FAN_NUMBER },
    );
  });

  it('sends one command per changed dimension (temp + fan), final values only', () => {
    render(<AirConditionerCard />);

    fireEvent.click(screen.getByLabelText('Increase temperature')); // 25
    fireEvent.click(screen.getByLabelText('Increase temperature')); // 26
    fireEvent.click(screen.getByLabelText('Decrease fan speed'));    // fan 4 -> 3

    advance(5500);

    expect(callService).toHaveBeenCalledWith(
      'climate', 'set_temperature', { temperature: 26 }, { entity_id: ENTITY_ID },
    );
    expect(callService).toHaveBeenCalledWith(
      'number', 'set_value', { value: 3 }, { entity_id: FAN_NUMBER },
    );
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
    entityRef.current = makeEntities({ mode: 'off' });
    render(<AirConditionerCard />);

    fireEvent.click(screen.getByRole('button', { name: /turn on/i })); // mode -> cool (optimistic)
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

  it('shows an amps badge in the header when the AC is drawing current', () => {
    entityRef.current = makeEntities({ mode: 'cool', amps: '4.5' });
    render(<AirConditionerCard />);
    // getByText throws if absent, so this asserts the badge rendered.
    expect(screen.getByText('4.5 A')).toBeTruthy();
  });

  it('a preset fires its button after the debounce (and does not walk temp/fan)', () => {
    render(<AirConditionerCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Strong' }));
    advance(5500);
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith(
      'button', 'press', undefined, { entity_id: 'button.ag_pro_24v_ac_strong' },
    );
    expect(callService).not.toHaveBeenCalledWith(
      'climate', 'set_temperature', expect.anything(), expect.anything(),
    );
    expect(callService).not.toHaveBeenCalledWith(
      'number', 'set_value', expect.anything(), expect.anything(),
    );
  });

  it('a manual temp change cancels a pending preset (no preset button press)', () => {
    render(<AirConditionerCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Eco' }));   // preset pending
    fireEvent.click(screen.getByLabelText('Increase temperature')); // overrides the preset
    advance(5500);
    expect(callService).not.toHaveBeenCalledWith(
      'button', 'press', undefined, { entity_id: 'button.ag_pro_24v_ac_eco' },
    );
    expect(callService).toHaveBeenCalledWith(
      'climate', 'set_temperature', expect.anything(), { entity_id: ENTITY_ID },
    );
  });
});
