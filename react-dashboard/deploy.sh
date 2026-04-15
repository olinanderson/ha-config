#!/usr/bin/env bash
# Deploy built React dashboard to Home Assistant
# Run from the react-dashboard directory: ./deploy.sh

set -euo pipefail

SSH_HOST="hassio@100.80.15.86"
SSH_KEY="$HOME/.ssh/id_ed25519"
REMOTE_DIR="/config/www/react-dashboard"
LOCAL_DIST="dist"

echo "Building..."
npm run build

echo "Deploying to HA..."

# Create remote directory
ssh -i "$SSH_KEY" "$SSH_HOST" "sudo mkdir -p $REMOTE_DIR"

# Deploy built JS + CSS
for file in "$LOCAL_DIST"/van-dashboard.js "$LOCAL_DIST"/van-dashboard.css; do
  if [ -f "$file" ]; then
    fname=$(basename "$file")
    echo "  → $fname"
    cat "$file" | ssh -i "$SSH_KEY" "$SSH_HOST" "cat > /tmp/$fname && sudo cp /tmp/$fname $REMOTE_DIR/$fname && rm /tmp/$fname"
  fi
done

# Deploy panel loader
echo "  → panel-loader.js"
cat panel-loader.js | ssh -i "$SSH_KEY" "$SSH_HOST" "cat > /tmp/panel-loader.js && sudo cp /tmp/panel-loader.js $REMOTE_DIR/panel-loader.js && rm /tmp/panel-loader.js"

echo ""
echo "Done! Files deployed to $REMOTE_DIR"
echo ""
echo "Add to configuration.yaml if not already present:"
echo ""
echo "  panel_custom:"
echo "    - name: van-dashboard"
echo "      url_path: van-dashboard"
echo "      sidebar_title: Dashboard"
echo "      sidebar_icon: mdi:view-dashboard"
echo "      module_url: /local/react-dashboard/panel-loader.js"
echo "      embed_iframe: false"
echo "      trust_external_script: true"
echo ""
echo "Then restart HA or reload the frontend."
echo ""
echo "⚠️  IMPORTANT: Hard-refresh the browser (Ctrl+Shift+R / Cmd+Shift+R) after deploy"
echo "   to force reload of cached JS/CSS. A normal refresh WON'T pick up the new build."
