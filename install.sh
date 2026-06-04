#!/usr/bin/env bash
set -euo pipefail

UUID="hide-past-calendar-events@prostopasta.github.com"
DEST="$HOME/.local/share/gnome-shell/extensions/$UUID"

echo "Installing Hide Past Calendar Events..."
mkdir -p "$DEST/schemas"
cp extension.js prefs.js metadata.json "$DEST/"
cp schemas/*.xml "$DEST/schemas/"

echo "Compiling GSettings schema..."
glib-compile-schemas "$DEST/schemas/"

gnome-extensions enable "$UUID" 2>/dev/null || true

echo ""
echo "Done! Reload GNOME Shell to activate:"
echo "  X11:    Alt+F2 → type 'r' → Enter"
echo "  Wayland: log out and back in"
echo ""
echo "Configure dismiss delay:"
echo "  gnome-extensions prefs $UUID"
