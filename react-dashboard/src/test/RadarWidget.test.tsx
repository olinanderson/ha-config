/**
 * RadarWidget tests
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RadarWidget } from '../components/RadarWidget';

const mockRadarResponse = {
  radar: {
    past: Array.from({ length: 12 }, (_, i) => ({
      time: Math.floor(Date.now() / 1000) - (12 - i) * 600,
      path: `/v2/radar/${Math.floor(Date.now() / 1000) - (12 - i) * 600}`,
    })),
    nowcast: Array.from({ length: 3 }, (_, i) => ({
      time: Math.floor(Date.now() / 1000) + (i + 1) * 600,
      path: `/v2/radar/${Math.floor(Date.now() / 1000) + (i + 1) * 600}`,
    })),
  },
};

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockRadarResponse),
  } as any);
  // Mock canvas API (not available in jsdom)
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    drawImage: vi.fn(),
    globalAlpha: 1,
    strokeStyle: '',
    lineWidth: 1,
    beginPath: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('RadarWidget', () => {
  it('renders without crashing', () => {
    const { container } = render(<RadarWidget lat={51.0} lon={-114.0} />);
    expect(container).toBeTruthy();
  });

  it('renders nothing when no lat/lon', () => {
    const { container } = render(<RadarWidget lat={undefined} lon={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows Radar label', () => {
    render(<RadarWidget lat={51.0} lon={-114.0} />);
    expect(screen.getByText('Radar')).toBeInTheDocument();
  });

  it('does not log console errors on render', () => {
    const spy = vi.spyOn(console, 'error');
    render(<RadarWidget lat={51.0} lon={-114.0} />);
    expect(spy).not.toHaveBeenCalled();
  });
});
