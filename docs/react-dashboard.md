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

`src/components/TonightCard.tsx` (the "Climate Program" card on the Climate page, under the A/C card) is the
front end for the Night Climate program (`docs/automations-modes.md` → Night Climate). It only edits
helpers: the mode buttons (`input_select.night_climate_mode`: Off / Hold / Night / Fan / A/C / Heater;
**A/C** is disabled without shore power), the hold target (Hold = the same logic right now, no end), night and wake targets,
the wake time (`input_datetime.set_datetime` with `time: HH:MM:00`), the warm-up, which appliances the
Program may use, "A/C above" (`input_number.night_climate_cool_above`: the A/C only joins above it) and the
fan speed and direction (used by Fan all night and by the Program's fan). Shore power for the A/C button and
hint is `binary_sensor.shore_power_present`, not the charger's live draw, which reads 0 W on a full battery. The status line is `sensor.night_climate_status`, built by the template so
the card and HA say the same thing. Tests: `src/components/TonightCard.test.tsx`. The Roof Fan card
(`FanControl.tsx`, Home and Climate pages) follows the Air Conditioner card: room temperature
(`sensor.living_space_temperature`) beside what the fan is holding, an Off / Manual / Auto
segmented control, one − / slider / + row for the mode (speed in Manual, set point in Auto) and
Direction / Lid segmented rows. Manual is `fan.ag_pro_roof_fan` at a speed, Auto is the fan's own
thermostat (`switch.ag_pro_roof_fan_thermostat`) with the set point in whole °F
(`number.ag_pro_roof_fan_thermostat_set_point`, shown in °C, slider 50–90 °F), Off ends whichever
runs and shuts the lid. Every frame the fan receives is a beep, so speed and set point changes are
shown at once and sent 1.2 s after the last tap or drag (`APPLY_DELAY_MS`); a set point still
waiting goes before Auto starts and after any other mode change, so it never adds a frame, and a
waiting speed is dropped by Off. In Auto a direction change calls `esphome.ag_pro_roof_fan_thermostat`
(a plain `fan.set_direction` sends nothing while the fan entity is off under the thermostat). The
badge reads Off / On / Auto · running / Auto · idle from `sensor.roof_fan_power_12v`. Tapping Off while it
already shows Off presses `button.ag_pro_roof_fan_force_off`, which always sends "off, lid closed": the link
is one-way IR, so when the fan misses a frame HA still shows Off and this is the way to send it again.
Tests: `src/components/FanControl.test.tsx`.

## Living Space Card

`src/components/LivingSpaceCard.tsx` sits on the **Van page** under the Current Trip card: the back
of the van at a glance while driving, and the smallest control that can do something about it. It shows
`sensor.living_space_temperature` big with `sensor.ambient_air_temp_last_good` under it, a pill per
appliance that is actually running (heater / A/C / roof fan, read from their own entities, the fan spinning
when `sensor.roof_fan_power_12v` says the motor is turning), and three buttons that each say what they do:
**Off** "all off", **Auto** "heat or cool", **Fan** "roof fan". Auto is the program's Hold mode; Auto and Fan
write the same helper as the Climate Program card (`input_select.night_climate_mode`: Hold /
`Fan all night`), so the two cards can never disagree and HA still decides what runs. Off runs
`script.living_space_off` instead: it ends the program if one runs, turns the heater off and runs
`script.night_climate_actuators_off` for the fan and the A/C, so it also stops an appliance started from
its own card. Choosing Off on the mode did neither: on 2026-09-21 the A/C was started from its card, the mode
stayed Off, and five taps on Off only re-selected Off. With the mode Off and something running, Off is not
shown selected. Auto is the one that both heats and cools, so it is the only mode with a − / + target:
turn it up and the heater runs, down and the roof fan or the A/C does. That target is
`input_number.night_climate_hold_target`, stepped by the helper's own min/max/step; Off and Fan show no
target. When the mode is one the card has no button for (Night, Heater, A/C all night, set from the Climate
page) a badge names it, no button is selected and its target shows read-only from
`sensor.night_climate_target`. The line underneath is one sentence built by the card, always one line so
the phone height is known: "▲ Heating to 22.0° · heater", "▼ Cooling to 22.0° · roof fan", "At target
22.0°", "Warmer than 22.0° · A/C needs shore power", "A/C on from its own card · Off turns it off",
"Everything off · …". The warnings (shore power, heater supply, fuel lockout, Shop Mode) are picked out
of `sensor.night_climate_status`, whose full text is the line's tooltip. Tests:
`src/components/LivingSpaceCard.test.tsx`.

## Van Page Badges and Tank Levels

`src/components/VanBadges.tsx` is the one-line row at the top of the Van page: Propane, Fresh, Grey and
Lights. Tapping a level opens its history. Tapping Lights turns all four LED controllers off, or on when
none is on, the same as the Home badge. Propane everywhere (Van and Home badges, Water card) goes through
`src/hooks/usePropane.ts`. When the Mopeka itself (`sensor.pro_check_f317_tank_level`) is unavailable it
shows **Battery dead** in orange instead of a level, and the Water card hides its bar and says to replace
the coin cell. A silent sensor under a fixed tank is its battery (it died that way on 2026-07-23), and
before 2026-09-24 the template turned "no reading" into 0 %, an empty-looking tank. With the sensor's
battery at 15 % or less the level still shows, with a low-battery mark. Tests: `src/hooks/usePropane.test.ts`.

The water levels everywhere on the dashboard (Home badges and tanks, Water page, Van badges) come from
`src/hooks/useTankLevel.ts`, which only knows `sensor.stable_fresh_water_level` /
`sensor.stable_grey_water_level` (template/triggered.yaml: fresh a 5-min median that moves after 5 min
parked and by at least 1 point, grey a 30-min median that moves after 30 min parked and by at least 2).
The history dialog opens the same sensors, whose history starts 2026-09-25. There is no raw fallback: the
dashboard showed the raw sensors while the stable ones did not exist yet, and a tap then opened the noisy
raw history. The stable sensors restore across restarts and reloads, and if one is ever unavailable the
level reads "—". `TankLevel` takes `tank="fresh" | "grey"` for these and `entityId` for anything else.

Worth knowing while driving: under Hold the A/C only starts on `binary_sensor.shore_power_present` (the
charger drew power within 3 h) and the roof fan only when it is at least 1 °C cooler outside, so on a hot
drive away from shore power neither will cool.

## Van Page on a Phone

On a phone the badge row and the first three cards of the Van page are the driving screen: badges,
hero (Power + Driving), Current Trip, Living Space, all visible without scrolling. The target is an iPhone
16 Pro Max in the HA app, which renders the page at 87.5 % zoom: 503 × 1022 CSS px, the tab bar ends at
45 and the Living Space card has to end by 999 to clear the home indicator. The worst realistic case
(engine running, fuel averages loaded, Auto with three running pills) ends at 988 (2026-09-24). Below `sm`
the fit comes from: `PageContainer compactOnPhone` (no page title, `space-y-3` between cards), the
single-line badges, the hero card's tighter padding (`max-sm:py-1` tiles), the Battery tile's drive rate
on the same line as the Wh (wider screens keep its own "%/h driving" line), the trip stats as one row of
four with the range, the city/highway explainer hidden (it is also on the trip history card), `pt-4`
headers and `pt-2` card content on the trip and living space cards, and the living space status kept to
one truncated line. The band tile's NOW chip wraps under HIGHWAY there rather than being clipped. Alert banners (DTC
with the CEL on, Starlink recovery, Shop Mode) push the cards down on purpose. Anything added to these
three cards or above them needs re-measuring on that screen.

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
