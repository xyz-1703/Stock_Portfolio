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
echo "Starting React frontend at http://localhost:3000/"
npm start
