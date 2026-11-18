#!/bin/bash
# Install the unsigned CEP panel in the current user's Adobe extensions folder.
set -eu
source_dir="$(cd "$(dirname "$0")" && pwd)"
target_dir="$HOME/Library/Application Support/Adobe/CEP/extensions/com.cyrilplugin.PremiereProjectConverter"
mkdir -p "$target_dir"
for item in CSXS client host; do
  ditto "$source_dir/$item" "$target_dir/$item"
done
# Enable CEP development mode for current and recent Premiere releases.
for version in {7..20}; do defaults write "com.adobe.CSXS.$version" PlayerDebugMode 1; done
echo "Installation complete. Restart Premiere and open Window > Extensions > Project Converter."
