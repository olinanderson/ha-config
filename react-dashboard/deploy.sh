#!/usr/bin/env bash
# Build the React dashboard into www/react-dashboard/, ready for the git deploy.
# Run as `npm run deploy` or `bash deploy.sh` from react-dashboard/.
#
# It never writes to HA. /config on HA is a git checkout of this repo (since
# 2026-09-25) and www/react-dashboard/* is tracked, so a copy straight onto HA
# leaves its checkout modified and the next top-level deploy.sh fails at
# `git merge --ff-only`. That happened on 2026-10-04, after the 2026-10-02
# bundle had only been copied over by the old version of this script.
#
#   npm test -> npm run build -> copy into ../www/react-dashboard/
#   then: commit, and run `bash deploy.sh` from the repo root
set -euo pipefail

cd "$(dirname "$0")"
WWW="../www/react-dashboard"

echo "Testing..."
npm test

echo "Building..."
npm run build

echo "Copying into www/react-dashboard/..."
for f in dist/van-dashboard.js dist/van-dashboard.css panel-loader.js; do
  cp "$f" "$WWW/$(basename "$f")"
  echo "  -> $(basename "$f")"
done

# Tracked dashboard changes, plus new source files (not stray screenshots).
changes=$( { git -C .. status --short --untracked-files=no -- react-dashboard www/react-dashboard docs/react-dashboard.md
             git -C .. ls-files --others --exclude-standard -- react-dashboard/src | sed 's/^/?? /'; } )
echo ""
if [ -z "$changes" ]; then
  echo "The bundle is identical to the committed one: nothing to commit or deploy."
  exit 0
fi
echo "Nothing has gone to HA yet. Dashboard changes to commit:"
echo "$changes" | sed 's/^/  /'

# Other uncommitted work can stay where it is, but not in the dashboard commit.
other=$(git -C .. status --porcelain --untracked-files=no -- . ':!react-dashboard/' ':!www/react-dashboard/' ':!docs/react-dashboard.md')
if [ -n "$other" ]; then
  echo ""
  echo "Also uncommitted, outside the dashboard (leave these out of its commit):"
  echo "$other" | sed 's/^/  /'
fi

cat <<'MSG'

Next:
  1. Commit the source together with the bundle, from the repo root:
       git add react-dashboard/src www/react-dashboard && git commit
     Add docs/react-dashboard.md or any other file above that belongs to the change.
  2. Deploy from the repo root: bash deploy.sh
     (pushes to GitHub, fast-forwards /config on HA)
  3. Hard-refresh the browser (Ctrl+Shift+R / Cmd+Shift+R) or reopen the HA app.
     A normal refresh WON'T pick up the new build.
MSG
