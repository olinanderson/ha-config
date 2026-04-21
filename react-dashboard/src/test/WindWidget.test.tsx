/**
 * WindWidget tests
 * - Renders without crashing
 * - Shows loading state initially
 * - Doesn't log console errors
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WindWidget } from '../components/WindWidget';

// Mock fetch for Open-Meteo API
const mockWindResponse = {
  current: { windspeed_10m: 18.5, windgusts_10m: 28.2, winddirection_10m: 245 },
  hourly: {
    time: Array.from({ length: 48 }, (_, i) => new Date(Date.now() + i * 3600_000).toISOString()),
    windspeed_10m: Array(48).fill(18),
    windgusts_10m: Array(48).fill(27),
    winddirection_10m: Array(48).fill(245),
  },
};

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockWindResponse),
  } as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('WindWidget', () => {
  it('renders without crashing when lat/lon provided', () => {
    const { container } = render(<WindWidget lat={51.0} lon={-114.0} />);
    expect(container).toBeTruthy();
  });

  it('renders nothing when no lat/lon', () => {
    const { container } = render(<WindWidget lat={undefined} lon={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows Wind label', () => {
    render(<WindWidget lat={51.0} lon={-114.0} />);
    expect(screen.getByText('Wind')).toBeInTheDocument();
  });

  it('does not log console errors on render', () => {
    const spy = vi.spyOn(console, 'error');
    render(<WindWidget lat={51.0} lon={-114.0} />);
    expect(spy).not.toHaveBeenCalled();
  });
});
