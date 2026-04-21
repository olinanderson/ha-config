# React Dashboard

Custom HA sidebar panel: **React 19 + Vite 6 + TypeScript + Tailwind CSS 3 + shadcn/ui**.
Registered via `panel_custom` as `<van-dashboard>` with hash-based tab routing.

## Pages

`#home` | `#power` | `#climate` | `#water` | `#van` | `#schedule` | `#cameras` | `#map` | `#system`

## File Structure

```
react-dashboard/
  panel-loader.js          # Custom element registration + cache busting
  vite.config.ts           # Library mode build
  src/
    App.tsx                # Root: HassProvider → hash router → navbar + pages
    context/
      HomeAssistantContext.tsx  # HassStore + HassProvider
    hooks/
      useEntity.ts         # useEntity, useEntityNumeric, useEntities
      useHistory.ts        # Entity history from HA REST API
      useService.ts        # useToggle, useButtonPress
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
`configuration.yaml` `?v=N` only needs bumping when `panel-loader.js` itself changes.

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
