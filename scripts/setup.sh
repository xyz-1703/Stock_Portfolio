#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "[ERROR] Python is not installed or not available in PATH"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/env/bin/activate" && ! -f "$ROOT_DIR/env/Scripts/activate" ]]; then
  echo "[INFO] Creating virtual environment in ./env"
  "$PYTHON_BIN" -m venv "$ROOT_DIR/env"
fi

if [[ -f "$ROOT_DIR/env/bin/activate" ]]; then
  # shellcheck source=/dev/null
  source "$ROOT_DIR/env/bin/activate"
elif [[ -f "$ROOT_DIR/env/Scripts/activate" ]]; then
  # shellcheck source=/dev/null
  source "$ROOT_DIR/env/Scripts/activate"
else
  echo "[ERROR] Could not find a virtual environment activation script in env/"
  exit 1
fi

echo "Installing backend dependencies..."
pip install -r "$ROOT_DIR/requirements.txt"

echo "Installing frontend dependencies..."
cd "$ROOT_DIR/frontend"
npm install

echo "Setup complete."
