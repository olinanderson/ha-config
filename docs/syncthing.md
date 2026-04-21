# Syncthing — Bidirectional Config Sync

HA config (`/config`) syncs bidirectionally to local PCs via Syncthing over Tailscale.
Changes propagate in ~10 seconds.

## ⚠ Pre-flight Check

Before relying on file sync, verify Syncthing is running on Windows:
```bash
tasklist | grep -i syncthing
```
If not running: `start "" "$(where syncthing)" --no-browser`

| Machine | Auto-start? |
|---|---|
| **Asylum** | ❌ No — must launch manually after reboot |
| **Satellite** | ✅ Yes — Windows Scheduled Task at logon |

## Key Details

| Setting | Value |
|---|---|
| **Folder ID** | `ha-config` |
| **HA folder path** | `/config` |
| **HA Syncthing binary** | `/config/.ha-sync/syncthing` |
| **HA Syncthing config** | `/config/.ha-sync/st-config/` |
| **HA Device ID** | `7EM6772-22RZNMH-NLCQWWI-OTUCSJH-Y54DBRJ-4NYEJKH-UP3AWSM-GAFM3AT` |
| **HA listen port** | `22000` (TCP) |
| **HA GUI** | `http://100.80.15.86:8384` (no auth, Tailscale-only) |
| **Sync interval** | ~10 seconds |
| **Full rescan** | Every 60 minutes |
| **Discovery** | Local only — no global discovery, no relays, no NAT |
| **Auto-start** | HA automation `syncthing_start_on_boot` (30s delay) |

## .stignore (excluded from sync)

- Database files, runtime/cache, secrets, HACS, blueprints, `www/`, `zigbee2mqtt/`
- Syncthing internals, `.git`, OS junk, temp files

## Git + Syncthing Workflow

Syncthing delivers file changes but not git history. After another machine pushes:
```bash
git sync    # alias for: git fetch origin && git reset origin/main
```

## Troubleshooting

- **HA Syncthing not running?** SSH in: `sudo pgrep -f "syncthing serve"`
- **Connection refused?** Both machines must be on Tailscale, port 22000 open
- **Files not syncing?** Check `.stignore`
- **Conflict files?** Resolve `.sync-conflict-*` manually
- **HA GUI**: `http://100.80.15.86:8384`
