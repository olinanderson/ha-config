import { render, screen, fireEvent } from '@testing-library/react';
import type { HistoryPoint } from '@/hooks/useHistory';
import { HistoryChart } from './Chart';

const T0 = Date.UTC(2026, 8, 16);
const STEP = 10 * 60_000;

// Sample i sits at T0 + i * 10 min with value i, so the stats row tells us
// which samples are in view. series(0, 144) is a 24 h fetch; series(1, 145)
// is that fetch after one live point arrived and useHistory trimmed the oldest.
function series(from: number, to: number): HistoryPoint[] {
  return Array.from({ length: to - from + 1 }, (_, k) => ({ t: T0 + (from + k) * STEP, v: from + k }));
}

// The plot area spans x 48..588 of the 600-wide viewBox; the rect mock below
// maps client px 1:1 onto it.
const LEFT_EDGE = 48;
const RIGHT_EDGE = 588;

beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, right: 600, bottom: 250, width: 600, height: 250, toJSON: () => ({}),
  } as DOMRect);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function zoomIn(container: HTMLElement, clientX: number, notches = 6) {
  const svg = container.querySelector('svg')!;
  for (let i = 0; i < notches; i++) fireEvent.wheel(svg, { deltaY: -100, clientX });
}

function stat(label: 'Current' | 'Min' | 'Max'): number {
  return Number(screen.getByText(`${label}:`).querySelector('strong')!.textContent);
}

function isZoomed() {
  return screen.queryByText('Reset Zoom') != null;
}

describe('HistoryChart zoom across live updates', () => {
  it('keeps a zoomed window when a live point arrives and the oldest is trimmed', () => {
    const { container, rerender } = render(<HistoryChart data={series(0, 144)} />);
    zoomIn(container, 300);
    expect(isZoomed()).toBe(true);
    const window = [stat('Min'), stat('Max')];

    rerender(<HistoryChart data={series(1, 145)} />);
    expect(isZoomed()).toBe(true);
    expect([stat('Min'), stat('Max')]).toEqual(window);
  });

  it('follows new samples when zoomed in on the newest one', () => {
    const { container, rerender } = render(<HistoryChart data={series(0, 144)} />);
    zoomIn(container, RIGHT_EDGE);
    expect(stat('Current')).toBe(144);
    const min = stat('Min');
    expect(min).toBeGreaterThan(100);

    rerender(<HistoryChart data={series(1, 145)} />);
    expect(isZoomed()).toBe(true);
    expect(stat('Current')).toBe(145);
    expect(stat('Min')).toBe(min + 1); // same width, slid forward

    rerender(<HistoryChart data={series(2, 146)} />);
    expect(stat('Current')).toBe(146);
    expect(stat('Min')).toBe(min + 2);
  });

  it('follows new samples when a wheel zoom lands just short of the newest one', () => {
    const { container, rerender } = render(<HistoryChart data={series(0, 144)} />);
    zoomIn(container, RIGHT_EDGE - 18);
    expect(stat('Current')).toBe(144);

    rerender(<HistoryChart data={series(1, 145)} />);
    expect(isZoomed()).toBe(true);
    expect(stat('Current')).toBe(145);
  });

  it('leaves a window in the past alone, only nudging it as old samples are trimmed', () => {
    const { container, rerender } = render(<HistoryChart data={series(0, 144)} />);
    zoomIn(container, LEFT_EDGE);
    expect([stat('Min'), stat('Current')]).toEqual([0, 29]);

    rerender(<HistoryChart data={series(0, 145)} />);
    expect(isZoomed()).toBe(true);
    expect([stat('Min'), stat('Current')]).toEqual([0, 29]);

    rerender(<HistoryChart data={series(3, 148)} />);
    expect(isZoomed()).toBe(true);
    expect([stat('Min'), stat('Current')]).toEqual([3, 32]);
  });

  it('starts following once a history window is dragged to the newest sample', () => {
    const { container, rerender } = render(<HistoryChart data={series(0, 144)} />);
    zoomIn(container, LEFT_EDGE);
    const svg = container.querySelector('svg')!;
    fireEvent.mouseDown(svg, { clientX: 580 });
    fireEvent.mouseMove(window, { clientX: 300 });
    fireEvent.mouseMove(window, { clientX: -5000 });
    fireEvent.mouseUp(window);
    expect(stat('Current')).toBe(144);

    rerender(<HistoryChart data={series(1, 145)} />);
    expect(isZoomed()).toBe(true);
    expect(stat('Current')).toBe(145);
  });

  it('stays unzoomed after Reset Zoom', () => {
    const { container, rerender } = render(<HistoryChart data={series(0, 144)} />);
    zoomIn(container, 300);
    fireEvent.click(screen.getByText('Reset Zoom'));
    expect(isZoomed()).toBe(false);

    rerender(<HistoryChart data={series(1, 145)} />);
    expect(isZoomed()).toBe(false);
    expect([stat('Min'), stat('Current')]).toEqual([1, 145]);
  });
});
