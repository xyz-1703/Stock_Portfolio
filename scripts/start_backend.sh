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

if [[ -f "$ROOT_DIR/env/bin/activate" ]]; then
  # shellcheck source=/dev/null
  source "$ROOT_DIR/env/bin/activate"
elif [[ -f "$ROOT_DIR/env/Scripts/activate" ]]; then
  # shellcheck source=/dev/null
  source "$ROOT_DIR/env/Scripts/activate"
else
  echo "[ERROR] Virtual environment not found in env/bin/activate or env/Scripts/activate"
  echo "Create it first, for example: $PYTHON_BIN -m venv env"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/stock_portfolio/manage.py" ]]; then
  echo "[ERROR] manage.py not found at stock_portfolio/manage.py"
  exit 1
fi

cd "$ROOT_DIR/stock_portfolio"
echo "Starting Django backend at http://127.0.0.1:8000/"
"$PYTHON_BIN" manage.py runserver
