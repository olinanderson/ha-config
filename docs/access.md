# Access & Credentials

## SSH Access to HA

| Setting | Value |
|---|---|
| **Command** | `ssh -i ~/.ssh/id_ed25519 hassio@100.80.15.86` |
| **Port** | 22 (default) |
| **User** | `hassio` |
| **Key** | `~/.ssh/id_ed25519` (ed25519) |
| **Root access** | `sudo` works without password |
| **OS** | Alpine Linux v3.23 (HAOS), x86_64 |
| **Shell** | zsh |

## HA Web UI Login

Credentials are stored in `.ha_login` (JSON, git-ignored) at the workspace root.
When using browser tools to interact with the HA frontend, read this file to get
the username and password for the login form.

## Network Addresses

| Resource | Address |
|---|---|
| **HA Web UI** | `http://100.80.15.86:8123` (Tailscale) |
| **HA SSH** | `hassio@100.80.15.86` |
| **WiCAN Pro** | `192.168.10.90` (web UI only, no API) |
| **Lorex DVR** | `192.168.10.156` (RTSP) |
| **Router (MoFi)** | `192.168.10.1` |
| **Syncthing GUI (HA)** | `http://100.80.15.86:8384` |
| **Shelly EM** | `192.168.10.174` |
| **HA Host SSH** | port `22222` on `172.30.32.1` (PulseAudio/Scream) |

## Workspace Sync Paths

| Machine | Path | Tailscale IP |
|---|---|---|
| **Asylum** (primary desktop) | `C:\Users\Olin\Documents\Workspace\ha_config` | `100.106.30.112` |
| **Satellite** (laptop) | `C:\Users\Olin Anderson\Documents\Workspace\ha_config` | `100.73.225.9` |

## HA API Token

Stored on HA host at `/config/.gps_filter_token`. Retrieve via:
```bash
TOKEN=$(ssh -i ~/.ssh/id_ed25519 hassio@100.80.15.86 "cat /config/.gps_filter_token")
```
