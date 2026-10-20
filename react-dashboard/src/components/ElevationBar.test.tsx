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

// The fill width of each 1,000 ft segment, in % to 0.1
function segmentFills(container: HTMLElement): number[] {
  return [...container.querySelectorAll<HTMLElement>('span.block.h-full')].map(
    (s) => Math.round(parseFloat(s.style.width) * 10) / 10,
  );
}

afterEach(() => {
  cleanup();
  openHistory.mockReset();
});

describe('ElevationBar', () => {
  it('shows feet with metres beside, and fills the segments up to it', () => {
    setElevation('2145');
    const { container } = render(<ElevationBar />);
    expect(screen.getByText('2,145 ft')).toBeTruthy();
    expect(screen.getByText('654 m')).toBeTruthy();
    expect(segmentFills(container)).toEqual([100, 100, 14.5, 0, 0, 0, 0, 0, 0, 0]);
    expect(screen.getByText('10K')).toBeTruthy();
  });

  it('reads a state in metres as metres', () => {
    // HA showed it in metres while the sensor had device_class distance
    setElevation('667.512', 'm');
    render(<ElevationBar />);
    expect(screen.getByText('2,190 ft')).toBeTruthy();
    expect(screen.getByText('668 m')).toBeTruthy();
  });

  it('grows the scale in 2,000 ft steps above 10,000 ft', () => {
    setElevation('11200');
    const { container } = render(<ElevationBar />);
    expect(screen.getByText('12K')).toBeTruthy();
    expect(segmentFills(container)).toHaveLength(12);
  });

  it('shows a dash and an empty bar without a reading', () => {
    setElevation('unavailable');
    const { container } = render(<ElevationBar />);
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.queryByText(/ m$/)).toBeNull();
    expect(segmentFills(container).every((w) => w === 0)).toBe(true);
  });

  it('opens the history on a tap', () => {
    setElevation('2145');
    render(<ElevationBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Elevation 2,145 ft' }));
    expect(openHistory).toHaveBeenCalledWith(ID, 'Elevation', 'ft');
  });
});
