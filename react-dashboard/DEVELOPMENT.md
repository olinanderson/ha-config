# React Dashboard — Dev Workflow

## The Golden Rule

**After every code change: `npm run deploy` → commit → `bash deploy.sh` → open the dashboard → check the browser console.**

TypeScript and tests catch a lot, but some things (missing HA entities, API failures, layout issues, Leaflet quirks) only show up in the real browser against the real van system. Don't skip the visual check.

---

## Making Changes

### 1. Edit source files
All source is in `react-dashboard/src/`. HA serves the **built files** in `www/react-dashboard/` (`van-dashboard.js`, `van-dashboard.css`, `panel-loader.js`). They are tracked in git and reach HA only through the repo's git deploy: `/config` on HA is a git checkout of this repo (since 2026-09-25).

### 2. Test, build and copy into www/
```bash
cd react-dashboard
npm run deploy    # = bash deploy.sh: npm test, npm run build, copy into ../www/react-dashboard/
```
A failing test or a TypeScript error stops it before anything is copied. It never writes to HA, and at the end it lists the dashboard files that changed (and warns about any other uncommitted work, which belongs in its own commit).

### 3. Commit and deploy
```bash
cd ..
git add react-dashboard www/react-dashboard   # plus docs/react-dashboard.md if you changed it
git commit
bash deploy.sh    # pushes to GitHub, fast-forwards /config on HA
```
Always commit the source together with its bundle. Never copy files onto HA by hand (scp, or the old version of `react-dashboard/deploy.sh`): HA's checkout then has local changes and the next `deploy.sh` stops at `git merge --ff-only`. That happened on 2026-10-04, after the 2026-10-02 bundle had only been copied over. Once a committed bundle at least as new is ready, clear it with `ssh hassio@100.80.15.86 'sudo git -C /config checkout -- www/react-dashboard'` and deploy again.

### 4. Open the dashboard
`http://100.80.15.86:8123` → navigate to the changed page.

⚠️ **Hard-refresh** (Ctrl+Shift+R / Cmd+Shift+R) after a deploy, or close and reopen the HA app. A normal refresh WON'T pick up the new build.

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
| Old build still showing | Changes not appearing | Hard-refresh. Then check HA has the commit: `ssh hassio@100.80.15.86 'sudo git -C /config log -1 --oneline'` |
| `deploy.sh` fails at `git merge --ff-only` | Top-level deploy stops after the push | HA's checkout has local changes, usually files copied over by hand. See "Commit and deploy" above |
| Leaflet CSS not loaded | Map shows broken tiles | Ensure `import 'leaflet/dist/leaflet.css'` in the page |
| CORS on Open-Meteo/RainViewer | Console shows CORS errors | These are public APIs — only happens if blocked (van on cellular with filtering) |
| Build succeeds but page is blank | JS runtime error | Check console for the actual error |
| Panel blank after coming back to the tab | Sidebar shows, content area empty, fixed by reload | HA parks panels after 5 min hidden; `src/lib/panel-host.ts` restores them. See docs/react-dashboard.md "Panel Lifecycle" |

---

## Project Layout

```
react-dashboard/
├── src/
│   ├── components/       # Reusable widgets (WindWidget, RadarWidget, etc.)
│   ├── pages/            # Full pages (Home, Climate, Cameras, VanlifeMap, ...)
│   ├── hooks/            # HA entity hooks, weather hooks, etc.
│   ├── lib/              # Utilities, vanlife API client, panel host (HA panel lifecycle)
│   └── test/             # Vitest tests + setup
├── dist/                 # Built output (not committed)
├── vite.config.ts        # Vite build config
├── vitest.config.ts      # Test config
└── package.json
```

The built files HA serves, tracked in git and deployed by the top-level `deploy.sh`:
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
4. `npm run deploy` → commit → `bash deploy.sh` → visual check in browser
