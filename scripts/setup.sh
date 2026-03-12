#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$ROOT_DIR/env/Scripts/activate" ]]; then
  echo "[INFO] Creating virtual environment in ./env"
  python -m venv "$ROOT_DIR/env"
fi

# shellcheck source=/dev/null
source "$ROOT_DIR/env/Scripts/activate"

echo "Installing backend dependencies..."
pip install -r "$ROOT_DIR/requirements.txt"

echo "Installing frontend dependencies..."
cd "$ROOT_DIR/frontend"
npm install

echo "Setup complete."
