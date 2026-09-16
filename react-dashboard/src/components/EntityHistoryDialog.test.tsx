import { render, screen, fireEvent } from '@testing-library/react';
import type { HistoryPoint } from '@/hooks/useHistory';

// useHistory never reports loading here, so the chart stays mounted across
// range changes and only its key can reset the zoom.
const { history } = vi.hoisted(() => ({ history: { current: [] as HistoryPoint[] } }));
vi.mock('@/hooks/useHistory', () => ({
  useHistory: () => ({ data: history.current, loading: false }),
}));
vi.mock('@/hooks/useEntity', () => ({ useEntity: () => null }));

import { HistoryDialogProvider, useHistoryDialog } from './EntityHistoryDialog';

const T0 = Date.UTC(2026, 8, 16);

function Opener() {
  const { open } = useHistoryDialog();
  return <button onClick={() => open('sensor.x', 'X', 'W')}>open</button>;
}

beforeEach(() => {
  history.current = Array.from({ length: 145 }, (_, i) => ({ t: T0 + i * 600_000, v: i }));
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, right: 600, bottom: 250, width: 600, height: 250, toJSON: () => ({}),
  } as DOMRect);
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('starts a newly picked range unzoomed', () => {
  const { container } = render(
    <HistoryDialogProvider>
      <Opener />
    </HistoryDialogProvider>,
  );
  fireEvent.click(screen.getByText('open'));
  fireEvent.wheel(container.querySelector('svg[viewBox="0 0 600 250"]')!, { deltaY: -100, clientX: 300 });
  expect(screen.queryByText('Reset Zoom')).not.toBeNull();

  fireEvent.click(screen.getByText('6h'));
  expect(screen.queryByText('Reset Zoom')).toBeNull();
});
