# React Dashboard — Dev Workflow

## The Golden Rule

**After every code change: build → deploy → open the dashboard → check the browser console.**

TypeScript and tests catch a lot, but some things (missing HA entities, API failures, layout issues, Leaflet quirks) only show up in the real browser against the real van system. Don't skip the visual check.

---

## Making Changes

### 1. Edit source files
All source is in `react-dashboard/src/`. The workspace syncs to HA via Syncthing, but the **built files** (`www/react-dashboard/van-dashboard.js` and `.css`) are what HA actually serves.

### 2. Build
```bash
cd react-dashboard
npm run build
```
TypeScript errors fail the build — fix them before continuing.

### 3. Deploy (copy to www/)
```bash
# Windows (PowerShell)
Copy-Item dist/van-dashboard.js ../www/react-dashboard/van-dashboard.js
Copy-Item dist/van-dashboard.css ../www/react-dashboard/van-dashboard.css
```
Syncthing pushes `www/` to HA automatically (~10s).

> **TODO**: There's a `deploy.sh` referenced in package.json but it doesn't exist yet. Create it when needed.

### 4. Open the dashboard
`http://100.80.15.86:8123` → navigate to the changed page

### 5. Check the browser console ✅
Open DevTools → Console. Look for:
- **Red errors** — something broke (missing prop, failed API call, etc.)
- **Yellow warnings** — usually harmless but worth noting (React key warnings, deprecated APIs)
- **Network failures** — failed fetches to HA, dvr_proxy, vanlife API, Open-Meteo, RainViewer

**A clean deploy should have zero red errors in the console.**

---

## Running Tests

```bash
cd react-dashboard
npm test           # run once
npm run test:watch # watch mode (re-runs on file change)
npm run test:ui    # browser-based test UI
```

Tests live in `src/test/`. The framework is **Vitest** + **React Testing Library**.

### What tests cover

| File | What it tests |
|---|---|
| `WindWidget.test.tsx` | Renders without crash, shows correct labels, no console errors |
| `RadarWidget.test.tsx` | Same pattern for radar |
| `utils.test.ts` | Utility functions (compass direction, time formatting) |

### Test patterns to follow

**Always check for console errors:**
```tsx
it('does not log console errors on render', () => {
  const spy = vi.spyOn(console, 'error');
  render(<MyComponent />);
  expect(spy).not.toHaveBeenCalled();
});
```

**Mock external APIs:**
```tsx
beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData),
  } as any);
});
```

**Mock Leaflet** — it's already mocked in `src/test/setup.ts` since jsdom doesn't support canvas/SVG.

### What tests don't cover (manual only)
- Actual map rendering and interactions
- Camera streams (MSE/HLS)
- DVR proxy responses
- HA entity values
- Anything requiring the real van system

---

## Things That Commonly Break

| Issue | How to spot | Fix |
|---|---|---|
| Missing HA entity | Component renders nothing / `undefined` | Check entity ID in HA dev tools |
| dvr_proxy down | Camera page shows "Loading..." forever | SSH → check `ps aux \| grep dvr_proxy` |
| Syncthing not synced | Changes not appearing | Check Syncthing at `http://100.80.15.86:8384` |
| Leaflet CSS not loaded | Map shows broken tiles | Ensure `import 'leaflet/dist/leaflet.css'` in the page |
| CORS on Open-Meteo/RainViewer | Console shows CORS errors | These are public APIs — only happens if blocked (van on cellular with filtering) |
| Build succeeds but page is blank | JS runtime error | Check console for the actual error |

---

## Project Layout

```
react-dashboard/
├── src/
│   ├── components/       # Reusable widgets (WindWidget, RadarWidget, etc.)
│   ├── pages/            # Full pages (Home, Climate, Cameras, VanlifeMap, ...)
│   ├── hooks/            # HA entity hooks, weather hooks, etc.
│   ├── lib/              # Utilities, vanlife API client
│   └── test/             # Vitest tests + setup
├── dist/                 # Built output (not committed)
├── vite.config.ts        # Vite build config
├── vitest.config.ts      # Test config
└── package.json
```

The built files that get deployed to HA:
```
www/react-dashboard/
├── van-dashboard.js      # Everything bundled
├── van-dashboard.css     # Styles
├── dvr_proxy.py          # Python DVR proxy server
└── panel-loader.js       # HA panel loader
```

---

## Adding New Components

1. Create `src/components/MyWidget.tsx`
2. Add a test in `src/test/MyWidget.test.tsx` — minimum: renders without crash + no console errors
3. Import and use in the relevant page
4. `npm test` → `npm run build` → deploy → visual check in browser
