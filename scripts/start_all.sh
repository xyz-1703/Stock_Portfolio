#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$ROOT_DIR/scripts/start_backend.sh" ]]; then
  echo "[ERROR] scripts/start_backend.sh not found"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/scripts/start_frontend.sh" ]]; then
  echo "[ERROR] scripts/start_frontend.sh not found"
  exit 1
fi

bash "$ROOT_DIR/scripts/start_backend.sh" &
BACKEND_PID=$!

cleanup() {
  if kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID"
  fi
}
trap cleanup EXIT

bash "$ROOT_DIR/scripts/start_frontend.sh"
