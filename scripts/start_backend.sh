#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$ROOT_DIR/env/Scripts/activate" ]]; then
  echo "[ERROR] Virtual environment not found at env/Scripts/activate"
  echo "Create it first, for example: python -m venv env"
  exit 1
fi

# shellcheck source=/dev/null
source "$ROOT_DIR/env/Scripts/activate"

if [[ ! -f "$ROOT_DIR/stock_portfolio/manage.py" ]]; then
  echo "[ERROR] manage.py not found at stock_portfolio/manage.py"
  exit 1
fi

cd "$ROOT_DIR/stock_portfolio"
echo "Starting Django backend at http://127.0.0.1:8000/"
python manage.py runserver
