# React Dashboard

Custom HA sidebar panel: **React 19 + Vite 6 + TypeScript + Tailwind CSS 3 + shadcn/ui**.
Registered via `panel_custom` as `<van-dashboard>` with hash-based tab routing.

## Pages

`#home` | `#power` | `#climate` | `#water` | `#van` | `#schedule` | `#cameras` | `#map` | `#system`

## File Structure

```
react-dashboard/
  panel-loader.js          # Custom element registration + cache busting (keep it thin)
  vite.config.ts           # Library mode build
  src/
    main.tsx               # mount() for the loader + dev-mode WebSocket connector
    App.tsx                # Root: HassProvider → hash router → navbar + pages
    context/
      HomeAssistantContext.tsx  # HassStore + HassProvider
    hooks/
      useEntity.ts         # useEntity, useEntityNumeric, useEntities
      useHistory.ts        # Entity history from HA REST API
      useService.ts        # useToggle, useButtonPress
    lib/panel-host.ts      # Keeps the React tree on screen through HA's panel lifecycle
    pages/                 # Home, Power, Climate, Water, Van, Cameras, System, etc.
    components/            # BatteryCard, SolarCard, WeatherCard, Chart, etc.
```

## Key Patterns

```tsx
// Entity subscription (minimal re-renders)
const entity = useEntity('sensor.olins_van_bms_battery');
const { value } = useEntityNumeric('sensor.total_mppt_pv_power');

// Null-safe display
fmt(value, 0)  // "42" or "—"

// History dialog
const { open } = useHistoryDialog();
<span onClick={() => open('sensor.id', 'Name', 'W')}>...</span>

// Weather (WS subscription, not entity attributes)
const forecast = useWeatherForecast('weather.pirateweather', 'daily');
```

## Build & Deploy

```bash
cd react-dashboard && bash deploy.sh
```

This builds via Vite and deploys `van-dashboard.js`, `van-dashboard.css`, and
`panel-loader.js` to `/config/www/react-dashboard/` on HA via SSH.

**Always hard-refresh** (Ctrl+Shift+R) after deploy.

### Cache Busting

`panel-loader.js` uses `CACHE_VER = Date.now()` — automatic per page load.

HA serves `/local/` with a 31-day cache, so browsers keep `panel-loader.js?v=16` for weeks.
Leave `?v=N` alone (changing it needs an HA restart). When the loader changes, bump
`window.__VAN_DASH_LOADER__` in `panel-loader.js` and `LOADER_VERSION` in `src/main.tsx`
together. The bundle re-fetches an older loader past the cache, so the next page load
gets the new one.

## Panel Lifecycle (blank panel after returning to the tab)

HA's frontend (checked on 2026.4) pulls the current panel out of the page after the tab has
been hidden for 5 minutes (profile setting "Automatically close connection"). It puts the panel
back when the tab is shown again. `<ha-panel-custom>` deletes its children when detached and
doesn't rebuild on re-attach, so the dashboard used to stay blank until a reload.

`src/lib/panel-host.ts` handles this:
- one React tree per page, moved into whichever `<van-dashboard>` mounted last;
- the tree stays alive while HA has the panel parked;
- when the wrapper comes back empty, the element goes straight back in (no blank frame) and
  `requestUpdate('panel', null)` makes HA build a wired element that takes over the tree;
- after a navigation to another HA panel, the tree is unmounted if nothing takes it within 2 s.

It also works with old loaders still in browser caches. Tests: `src/lib/panel-host.test.ts`.
If this regresses after an HA update, check `ha-panel-custom` / `partial-panel-resolver` in the
HA frontend first.

## Schedule Page

`src/pages/Schedule.tsx` is a front end for the HACS scheduler component (`/api/scheduler/list|add|edit|remove`,
`scheduler.run_action`). A new schedule opens on the **Heater** preset: "Heat to N °C" (default 26 °C at
07:30, daily) sends `climate.set_temperature` with `hvac_mode: heat` to
`climate.a32_pro_van_hydronic_heating_pid`, so one schedule both switches the thermostat on and sets
its target; "Turn off" is `climate.turn_off`. **Night** is the Night Climate program as a schedule
(default 00:30 daily): one entry whose actions set `input_number.night_climate_night_target`,
`input_number.night_climate_wake_target` and `input_datetime.night_climate_wake_time`, then pick
`input_select.night_climate_mode` (Program / Fan all night / A/C all night / Heater), which starts it;
the entry's enable switch is the on/off, and several entries can hold different set points on different
days. **Other** is the domain → entity → action walk for everything else. The payload is only what the component's schema takes (`weekdays`, `timeslots:
[{start, actions}]`, `repeat_type`, `name`): it rejects `stop: null`, an empty `conditions` list and
`condition_type: null` with a 500, which is what every add did before 2026-09-16. Tests:
`src/pages/Schedule.test.tsx`.

## Tonight Card

`src/components/TonightCard.tsx` (Climate page, under the A/C card) is the front end for the Night Climate
program (`docs/automations-modes.md` → Night Climate). It only edits helpers: the mode buttons
(`input_select.night_climate_mode`; **A/C** is disabled without shore power), night and wake targets,
the wake time (`input_datetime.set_datetime` with `time: HH:MM:00`), the warm-up, which appliances the
Program may use and the fan speed and direction (used by Fan all night and by the Program's fan
thermostat). The status line is `sensor.night_climate_status`, built by the template so
the card and HA say the same thing. Tests: `src/components/TonightCard.test.tsx`.

## CSS Scoping

No shadow DOM. Root `.van-dash-root` has `position: relative`.
Use `absolute` positioning (not `fixed`) for overlays.

## Always-Mounted Components

`Cameras` page stays mounted (CSS `hidden` when inactive) to preserve MSE streams.
Follow this pattern for any component with long-lived connections.

## Configuration

In `configuration.yaml`:
```yaml
panel_custom:
  - name: van-dashboard
    url_path: dashboard
    sidebar_title: Dashboard
    sidebar_icon: mdi:view-dashboard
    module_url: /local/react-dashboard/panel-loader.js?v=16
    embed_iframe: false
    trust_external_script: true
```
