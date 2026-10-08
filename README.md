# Home Assistant config: camper van

The Home Assistant configuration of a Ford Transit camper van that its owner lives in full
time. It runs the house power system (24 V LiFePO4 battery, solar, alternator and shore
charging, inverter), heating, cooling and the roof fan, water and propane, lighting, the
vehicle's OBD data, GPS and trips, cameras and a voice assistant.

## Layout

| Path | Contents |
|---|---|
| `configuration.yaml` | Entry point; includes the files and folders below |
| `automations.yaml`, `scripts.yaml`, `scenes.yaml` | Automations, scripts and scenes |
| `input_*.yaml` | Helpers (booleans, numbers, selects, texts, dates and times) |
| `template/` | Template sensors and binary sensors |
| `mqtt/` | MQTT entities: the vehicle's OBD data (WiCAN), the GPS and others |
| `integrations/` | YAML sensor platforms (statistics, history stats, integrals) |
| `shell_commands.yaml` | Shell commands, including starting the van services kept in `www/` |
| `custom_sentences/`, `intent_scripts.yaml`, `voice/` | Voice assistant: local sentences and what they do; names, areas and Claude's prompt (`voice/`, applied by `deploy.sh`) |
| `custom_components/` | Integrations written for the van; those installed from HACS aren't in git |
| `esphome/` | ESPHome configs: the I/O controllers, the radar presence sensor and the voice satellite |
| `react-dashboard/` | Source of the React dashboard, a sidebar panel at `/dashboard`; its build goes to `www/react-dashboard/` |
| `www/` | Served at `/local/` **without login**, so nothing private goes here: the dashboard build and the GPS, routing and camera services |
| `relay/` | Node service that stands in for HA while the van is offline |
| `dashboards/` | Archive of old YAML dashboards; HA doesn't load them |
| `analyze_*.py` | One-off analyses of HA's history |
| `docs/`, `.github/` | Documentation (below) and the CI check |

All Lovelace dashboards are in storage mode and are edited in HA, not in this repo: see
[How the dashboards work](.github/dashboard-editing-reference.md).

## Deploying

`/config` on the HA machine is a git checkout of this repo. Edit here, commit, then:

```sh
bash deploy.sh        # push to GitHub, pull on HA, check the config, reload what changed
bash deploy.sh --dry  # only show what HA would receive
```

`deploy.sh` refuses to run with uncommitted changes. It never restarts HA or the van
services; it lists the files that need a restart. Don't edit files on HA directly or save
from HA's automation and script editors: that leaves HA's checkout modified, and the next
deploy that changes the same file stops.

## Documentation

- [docs/README.md](docs/README.md): index of the reference docs (hardware, entities,
  automations, voice, the React dashboard, GPS and more)
- [.github/copilot-instructions.md](.github/copilot-instructions.md): the full system
  description and working rules, written for AI assistants
- [.github/dashboard-editing-reference.md](.github/dashboard-editing-reference.md): how the
  dashboards work

## Notes

- Secrets (API keys, passwords) belong in `secrets.yaml`, which is not in git.
  `secrets.fake.yaml` is a stub for the CI config check.
- Many entities come from the van's MQTT and ESPHome devices. On another HA instance they
  are unavailable, and entity IDs would need mapping.
- If a card shows "entity not found" or "unavailable", check the entity ID in Developer
  tools → States and the device behind it (MQTT, ESPHome or an integration). HA's log is
  in Settings → System → Logs.
- When adding sensors, update the definitions in `template/` or `mqtt/`.
- Keep changes small; `deploy.sh` checks the config before it reloads anything.
