#!/bin/bash
set -euo pipefail

APP_NAME="Slack Broadcaster"
REPO="taiki200504/slack-broadcaster"
INSTALL_DIR="/Applications"

echo "=== ${APP_NAME} Installer ==="
echo ""

# Get latest release DMG URL
echo "Fetching latest release..."
DMG_URL=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest" \
  | grep -o '"browser_download_url": *"[^"]*universal\.dmg"' \
  | head -1 \
  | cut -d'"' -f4)

if [ -z "$DMG_URL" ]; then
  echo "Error: Could not find macOS DMG in latest release."
  exit 1
fi

VERSION=$(echo "$DMG_URL" | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
echo "Version: ${VERSION}"

# Download
WORK_DIR=$(mktemp -d)
DMG_PATH="${WORK_DIR}/${APP_NAME}.dmg"
echo "Downloading..."
curl -L -# -o "$DMG_PATH" "$DMG_URL"

# Mount DMG to a known path
MOUNT_POINT="${WORK_DIR}/dmg_mount"
mkdir -p "$MOUNT_POINT"
echo "Installing..."
hdiutil attach "$DMG_PATH" -nobrowse -quiet -mountpoint "$MOUNT_POINT"

# Copy to Applications (remove old version if exists)
if [ -d "${INSTALL_DIR}/${APP_NAME}.app" ]; then
  rm -rf "${INSTALL_DIR}/${APP_NAME}.app"
fi
cp -R "${MOUNT_POINT}/${APP_NAME}.app" "${INSTALL_DIR}/"

# Unmount & cleanup
hdiutil detach "$MOUNT_POINT" -quiet
rm -rf "$WORK_DIR"

# Remove quarantine attribute (bypasses Gatekeeper)
xattr -cr "${INSTALL_DIR}/${APP_NAME}.app"

echo ""
echo "Done! ${APP_NAME} ${VERSION} has been installed."
echo "Opening ${APP_NAME}..."
open "${INSTALL_DIR}/${APP_NAME}.app"
