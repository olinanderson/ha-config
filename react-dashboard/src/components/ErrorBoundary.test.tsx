import { act, render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

let failing = true;

function Flaky() {
  if (failing) throw new Error('boom');
  return <p>dashboard</p>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    failing = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('keeps retrying slowly after it gives up, so a transient burst cannot strand the panel', () => {
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );
    // Initial crash + 5 quick retries, 3 s apart.
    for (let i = 0; i < 5; i++) {
      expect(screen.getByText('Recovering…')).not.toBeNull();
      act(() => vi.advanceTimersByTime(3000));
    }
    expect(screen.getByText('The dashboard keeps hitting an error.')).not.toBeNull();

    failing = false; // whatever broke has cleared up
    act(() => vi.advanceTimersByTime(59_000));
    expect(screen.queryByText('dashboard')).toBeNull();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('dashboard')).not.toBeNull();
  });
});
