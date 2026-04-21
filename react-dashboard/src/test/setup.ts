import '@testing-library/jest-dom';

// Mock Leaflet — it requires a real DOM with canvas/SVG support that jsdom doesn't provide
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({
      setView: vi.fn().mockReturnThis(),
      addLayer: vi.fn(),
      removeLayer: vi.fn(),
      fitBounds: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      remove: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    polyline: vi.fn(() => ({ addTo: vi.fn() })),
    circleMarker: vi.fn(() => ({ addTo: vi.fn() })),
    marker: vi.fn(() => ({ addTo: vi.fn() })),
    divIcon: vi.fn(),
    latLngBounds: vi.fn(() => ({})),
    layerGroup: vi.fn(() => ({ addTo: vi.fn(), clearLayers: vi.fn(), remove: vi.fn() })),
  },
}));

// Suppress noisy console.error in tests (e.g. React act() warnings)
// Comment this out if you need to debug render errors
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('act(')) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
