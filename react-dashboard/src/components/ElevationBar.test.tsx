import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// Same harness as ShoeDryerCard.test.tsx: hooks mocked, entities keyed by id.
const { entityRef, openHistory } = vi.hoisted(() => ({
  openHistory: vi.fn(),
  entityRef: { current: {} as Record<string, any> },
}));

vi.mock('@/hooks/useEntity', () => ({
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

import { ElevationBar } from './ElevationBar';

const ID = 'sensor.van_elevation';

function setElevation(state: string, unit = 'ft') {
  entityRef.current = { [ID]: { entity_id: ID, state, attributes: { unit_of_measurement: unit } } };
}

// How far up the bar the fill reaches, in %
function fillHeight(container: HTMLElement): number {
  return parseFloat(container.querySelector<HTMLElement>('[data-fill]')!.style.height);
}
const tickCount = (container: HTMLElement) => container.querySelectorAll('[data-tick]').length;

afterEach(() => {
  cleanup();
  openHistory.mockReset();
});

describe('ElevationBar', () => {
  it('fills up to the feet on a 10,000 ft scale and shows the reading', () => {
    setElevation('2145');
    const { container } = render(<ElevationBar />);
    expect(screen.getByText('2145')).toBeTruthy();
    expect(screen.getByText('ft')).toBeTruthy();
    expect(fillHeight(container)).toBeCloseTo(21.45);
    expect(tickCount(container)).toBe(9);
    expect(screen.getByRole('button').title).toMatch(/^2,145 ft \(654 m\) above sea level/);
  });

  it('reads a state in metres as metres', () => {
    // HA showed it in metres while the sensor had device_class distance
    setElevation('667.512', 'm');
    render(<ElevationBar />);
    expect(screen.getByText('2190')).toBeTruthy();
    expect(screen.getByRole('button').title).toMatch(/^2,190 ft \(668 m\)/);
  });

  it('grows the scale in 2,000 ft steps above 10,000 ft, the reading under the dot', () => {
    setElevation('11200');
    const { container } = render(<ElevationBar />);
    expect(tickCount(container)).toBe(11);
    expect(fillHeight(container)).toBeCloseTo((11200 / 12000) * 100);
    expect(screen.getByText('11200').parentElement!.className).toContain('translate-y-[calc(100%+8px)]');
  });

  it('keeps below sea level at the bottom', () => {
    setElevation('-282');
    const { container } = render(<ElevationBar />);
    expect(screen.getByText('-282')).toBeTruthy();
    expect(fillHeight(container)).toBe(0);
  });

  it('shows an empty bar and no reading without a value', () => {
    setElevation('unavailable');
    const { container } = render(<ElevationBar />);
    expect(screen.queryByText('ft')).toBeNull();
    expect(fillHeight(container)).toBe(0);
    expect(screen.getByRole('button', { name: 'Elevation unknown' })).toBeTruthy();
  });

  it('opens the history on a tap', () => {
    setElevation('2145');
    render(<ElevationBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Elevation 2145 ft' }));
    expect(openHistory).toHaveBeenCalledWith(ID, 'Elevation', 'ft');
  });
});
