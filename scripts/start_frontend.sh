#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$ROOT_DIR/frontend/package.json" ]]; then
  echo "[ERROR] frontend/package.json not found"
  exit 1
fi

cd "$ROOT_DIR/frontend"
echo "Starting React frontend at http://localhost:3000/"
npm start
