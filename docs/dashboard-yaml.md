# YAML Dashboard Editing

## Critical Rules

1. **Always use REAL entity IDs** from `docs/entities.md`. Placeholder dashboards used fake IDs.
2. **`old_home.yaml`** in `dashboards/` is the active main YAML dashboard.
3. **Mushroom theme** is installed — follow Mushroom card patterns for consistency.
4. **Never edit `secrets.yaml`** or files in `custom_components/`.
5. **Reload after changes**: Developer Tools → YAML → Lovelace Dashboards.

## Custom Frontend Cards (HACS)

- `custom:mushroom-template-badge` — status badges
- `custom:mushroom-light-card` — light dimmers
- `custom:mushroom-entity-card` — entity toggles
- `custom:better-thermostat-ui-card` — PID thermostat
- `custom:apexcharts-card` — time-series charts
- `custom:weather-chart-card` — weather forecasts
- `custom:power-flow-card-plus` — power flow diagram
- `custom:scheduler-card` — schedule automations

## Card Patterns

### Mushroom Badge
```yaml
- type: custom:mushroom-template-badge
  entity: sensor.example
  icon: "{{ 'mdi:on' if is_state(entity, 'on') else 'mdi:off' }}"
  color: "{{ 'green' if is_state(entity, 'on') else 'red' }}"
  content: "{{ states(entity) }}"
```

### Mushroom Light
```yaml
- type: custom:mushroom-light-card
  entity: light.example
  show_brightness_control: true
  show_color_temp_control: true
  collapsible_controls: false
```

### ApexCharts
```yaml
- type: custom:apexcharts-card
  header:
    show: true
    show_states: true
  graph_span: 12h
  series:
    - entity: sensor.example
      type: line
      color: '#3498DB'
      curve: smooth
```

### Power Flow
```yaml
- type: custom:power-flow-card-plus
  entities:
    solar:
      entity: sensor.total_mppt_pv_power
    battery:
      entity:
        consumption: sensor.battery_discharging
        production: sensor.battery_charging
      state_of_charge: sensor.olins_van_bms_battery
```

### Gauge
```yaml
- type: gauge
  entity: sensor.olins_van_bms_battery
  min: 0
  max: 100
  severity:
    green: 65
    yellow: 30
    red: 0
```
