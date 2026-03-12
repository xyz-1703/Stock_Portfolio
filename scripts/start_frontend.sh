#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] npm is not installed or not available in PATH"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/frontend/package.json" ]]; then
  echo "[ERROR] frontend/package.json not found"
  exit 1
fi

cd "$ROOT_DIR/frontend"
FRONTEND_HOST="${FRONTEND_HOST:-0.0.0.0}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

echo "Starting React frontend at http://${FRONTEND_HOST}:${FRONTEND_PORT}/"
HOST="$FRONTEND_HOST" PORT="$FRONTEND_PORT" npm start
