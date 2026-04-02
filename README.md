## Home Assistant - ha_config (van)

This directory contains my Home Assistant configuration and dashboards. One of the dashboards is the "van" dashboard located at `dashboards/van.yaml` — it collects vehicle-specific sensors, controls, and UI cards for monitoring and managing the van.

### Purpose

- Provide a focused dashboard for the van: charging, battery, power usage, water, climate, and locations.
- Keep a reproducible config for Home Assistant (YAML-based) that can be version-controlled.

### Important files

- `configuration.yaml` - main HA configuration entrypoint (includes, integrations).
- `dashboards/van.yaml` - the van-specific Lovelace dashboard used in the HA UI. This is the primary file for the van UI.
- `automations.yaml`, `scripts.yaml`, `sensors/`, `mqtt/`, `esphome/` - supporting config for sensors, automations, and devices.

If you edit or move `dashboards/van.yaml`, update any reference in `configuration.yaml` or the Lovelace resources.

### How to use

1. Copy this folder into your Home Assistant config directory (or point HA to this folder when using a separate repo).
2. Ensure `configuration.yaml` includes the dashboards directory (or includes the `dashboards/van.yaml` file directly).
3. Restart Home Assistant (or reload Lovelace) to pick up changes.

Example snippet to include a dashboard (if using YAML mode):

```yaml
# In configuration.yaml
lovelace:
  mode: yaml
  resources: !include lovelace/resources.yaml
  dashboards:
    van:
      mode: yaml
      filename: dashboards/van.yaml
```

### Notes and assumptions

- Some sensors are provided via MQTT and ESPHome devices stored in `mqtt/` and `esphome/` respectively. If you don't have those devices, the dashboard will show unavailable entities.
- Secrets (API keys, credentials) should be stored in `secrets.yaml` and not checked into version control.
- Paths and entity names follow the local naming conventions used in this repo; if you copy the dashboard to another HA instance you may need to map entity IDs.

### Editing tips

- Edit `dashboards/van.yaml` to change cards or add entities. Use the HA UI Raw Editor to validate YAML if needed.
- When adding sensors, update `template/` or `mqtt/` sensor definitions accordingly.

### Troubleshooting

- If cards show "entity not found" or "unavailable": verify the entity ID in Developer Tools -> States and the device providing it (MQTT, ESPHome, integrations).
- Check Home Assistant logs after restart for configuration errors (`Configuration -> Settings -> Logs`).

### Contributing / Changes

- Keep changes small and test in a local HA instance or a safe environment before deploying to production.
- Document any new entities or integrations you add in this README under the "Important files" or a new subsection.

---

If you'd like, I can also add a short list of the van-specific entities (e.g., battery, charger, water pump) by scanning the YAML files and summarizing them.
