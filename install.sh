#!/usr/bin/env bash
set -euo pipefail

UUID="hide-past-calendar-events@prostopasta.github.com"
DEST="$HOME/.local/share/gnome-shell/extensions/$UUID"

echo "Installing Hide Past Calendar Events..."
mkdir -p "$DEST"
cp extension.js metadata.json "$DEST/"

gnome-extensions enable "$UUID" 2>/dev/null || true

echo ""
echo "Done! Reload GNOME Shell to activate:"
echo "  X11:    Alt+F2 → type 'r' → Enter"
echo "  Wayland: log out and back in"
