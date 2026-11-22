#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Membuka SOLAR ODYSSEY di browser..."
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$DIR/index.html"
elif command -v open >/dev/null 2>&1; then
  open "$DIR/index.html"
else
  python3 -m http.server 8080 --directory "$DIR"
fi
