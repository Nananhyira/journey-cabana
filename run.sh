#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

MAP_ARG="$ROOT_DIR/server/data/map.ascii"
BOOKINGS_ARG="$ROOT_DIR/server/data/bookings.json"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --map)
      MAP_ARG="$2"
      shift 2
      ;;
    --bookings)
      BOOKINGS_ARG="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

# Resolve to absolute paths before we cd into subfolders below.
MAP_PATH="$(cd "$(dirname "$MAP_ARG")" && pwd)/$(basename "$MAP_ARG")"
BOOKINGS_PATH="$(cd "$(dirname "$BOOKINGS_ARG")" && pwd)/$(basename "$BOOKINGS_ARG")"

echo "Installing server dependencies..."
(cd "$ROOT_DIR/server" && [ -d node_modules ] || npm install)

echo "Installing client dependencies..."
(cd "$ROOT_DIR/client" && [ -d node_modules ] || npm install)

echo "Building client..."
(cd "$ROOT_DIR/client" && npm run build)

echo "Starting server on http://localhost:4000 ..."
(cd "$ROOT_DIR/server" && npx ts-node src/index.ts --map "$MAP_PATH" --bookings "$BOOKINGS_PATH")
