#!/usr/bin/env bash
set -euo pipefail

UUID="hide-past-calendar-events@prostopasta.github.com"
ZIP_NAME="${UUID}.shell-extension.zip"

echo "Packaging ${UUID}..."

# Remove any previously compiled schema or old zip
rm -f "${ZIP_NAME}" schemas/gschemas.compiled

# Package required files according to GNOME Shell 45+ guidelines
zip -r "${ZIP_NAME}" \
    metadata.json \
    extension.js \
    prefs.js \
    LICENSE \
    schemas/*.xml

echo "Created ${ZIP_NAME} successfully (no gschemas.compiled included)."

if command -v shexli >/dev/null 2>&1; then
    echo "Running shexli verification on ${ZIP_NAME}..."
    shexli "${ZIP_NAME}"
elif [ -x "/tmp/shexli-venv/bin/shexli" ]; then
    echo "Running shexli verification on ${ZIP_NAME}..."
    /tmp/shexli-venv/bin/shexli "${ZIP_NAME}"
fi
