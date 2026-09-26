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
reloadable='^(automations\.yaml|scripts\.yaml|scenes\.yaml|input_[a-z_]+\.yaml|customize\.yaml|template/.*\.yaml|group\.yaml|timers?\.yaml|counters?\.yaml)$'
needs_restart=""
needs_reload=0
while IFS= read -r f; do
    case "$f" in
        esphome/*|react-dashboard/*|docs/*|*.md|*.py|*.js|*.sh|.github/*|.claude/*|.gitignore|.stignore) ;;   # not HA runtime config
        *) if grep -Eq "$reloadable" <<<"$f"; then needs_reload=1; else needs_restart+="$f "; fi ;;
    esac
done <<<"$changed"

if [ "$needs_reload" = 1 ]; then
    ssh "$HA" 'curl -s -o /dev/null -w "reload_all: HTTP %{http_code}\n" -X POST -H "Authorization: Bearer $(cat /config/.gps_filter_token)" http://localhost:8123/api/services/homeassistant/reload_all'
fi
if [ -n "$needs_restart" ]; then
    echo "These need an HA restart to take effect (not done automatically): $needs_restart"
fi
