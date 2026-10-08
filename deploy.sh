#!/usr/bin/env bash
# Deploy this repo to Home Assistant: push to GitHub, pull on HA, check the
# config, reload what changed. /config on HA is a git checkout of this repo
# (set up 2026-09-25, replacing the Syncthing sync). Runs from Git Bash or macOS.
#
#   ./deploy.sh          push + pull + check + reload
#   ./deploy.sh --dry    only show what HA would receive
set -euo pipefail

HA="${HA_SSH:-hassio@100.80.15.86}"
cd "$(dirname "$0")"

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    echo "Uncommitted changes in the repo; commit (or stash) them first." >&2
    git status --short --untracked-files=no >&2
    exit 1
fi

before=$(ssh "$HA" 'sudo git -C /config rev-parse HEAD')
if [ "${1:-}" = "--dry" ]; then
    echo "HA is at $(git rev-parse --short "$before"); it would receive:"
    git --no-pager log --oneline "$before"..HEAD
    git --no-pager diff --stat "$before" HEAD
    exit 0
fi

git push -q origin HEAD:main
ssh "$HA" 'cd /config && sudo git fetch -q origin main && sudo git merge -q --ff-only origin/main'
after=$(ssh "$HA" 'sudo git -C /config rev-parse HEAD')
if [ "$before" = "$after" ]; then
    echo "HA already at $(git rev-parse --short "$after"); nothing to do."
    exit 0
fi

changed=$(git diff --name-only "$before" "$after")
echo "HA updated $(git rev-parse --short "$before") -> $(git rev-parse --short "$after"):"
printf '  %s\n' $changed

# The whole config must still parse before anything is reloaded.
check=$(ssh "$HA" 'curl -s -X POST -H "Authorization: Bearer $(cat /config/.gps_filter_token)" http://localhost:8123/api/config/core/check_config')
if [ "$check" != '{"result":"valid","errors":null,"warnings":null}' ] && ! grep -q '"result": *"valid"' <<<"$check"; then
    echo "CONFIG CHECK FAILED, nothing reloaded:" >&2
    echo "$check" >&2
    echo "Fix and deploy again, or roll HA back: ssh $HA 'sudo git -C /config reset --hard $before'" >&2
    exit 1
fi

# YAML that HA can reload without a restart; everything else needs one.
# reload_all also reloads the MQTT YAML entities in mqtt/ (seen 2026-10-08, 0094a30).
reloadable='^(automations\.yaml|scripts\.yaml|scenes\.yaml|input_[a-z_]+\.yaml|customize\.yaml|template/.*\.yaml|group\.yaml|timers?\.yaml|counters?\.yaml|mqtt/.*\.yaml)$'
needs_restart=""
needs_reload=0
services=""      # reloads that reload_all leaves out
needs_voice=0
daemons=""       # van services in www/ (shell_commands.yaml): HA doesn't load their code
while IFS= read -r f; do
    case "$f" in
        voice/*) needs_voice=1 ;;   # areas, aliases, exposure, Claude: voice/apply.py
        intent_scripts.yaml) services+="intent_script/reload " ;;
        custom_sentences/*) services+="conversation/reload " ;;
        custom_components/*) needs_restart+="$f " ;;   # integration code loads only at startup
        www/*/gps_filter.py|www/*/gps_ublox.py|www/*/osrm_proxy.py|www/*/dvr_proxy.py)
            n=${f##*/}; daemons+="shell_command.restart_${n%.py} " ;;
        esphome/*|react-dashboard/*|dashboards/*|relay/*|docs/*|*.md|*.py|*.js|*.sh|.github/*|.claude/*|*.gitignore|.stignore) ;;   # not HA runtime config (dashboards/: lovelace is in storage mode)
        *) if grep -Eq "$reloadable" <<<"$f"; then needs_reload=1; else needs_restart+="$f "; fi ;;
    esac
done <<<"$changed"

if [ "$needs_reload" = 1 ]; then
    ssh "$HA" 'curl -s -o /dev/null -w "reload_all: HTTP %{http_code}\n" -X POST -H "Authorization: Bearer $(cat /config/.gps_filter_token)" http://localhost:8123/api/services/homeassistant/reload_all'
fi
for svc in $(printf '%s\n' $services | sort -u); do
    ssh "$HA" "curl -s -o /dev/null -w '$svc: HTTP %{http_code}\n' -X POST -H \"Authorization: Bearer \$(cat /config/.gps_filter_token)\" http://localhost:8123/api/services/$svc"
done
# After the reloads, so a new script exists before it is exposed
if [ "$needs_voice" = 1 ]; then
    echo "voice/apply.py:"
    ssh "$HA" 'TOKEN=$(sudo cat /config/.gps_filter_token); sudo docker exec -e TOKEN="$TOKEN" homeassistant python3 /config/voice/apply.py' | sed 's/^/  /'
fi
if [ -n "$needs_restart" ]; then
    echo "These need an HA restart to take effect (not done automatically): $needs_restart"
fi
if [ -n "$daemons" ]; then
    echo "These services need a restart to take effect (not done automatically): $daemons"
fi
