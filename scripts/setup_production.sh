#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_PATH="${SERVER_PATH:-$ROOT_DIR}"
SERVER_USER="${SERVER_USER:-$(id -un)}"
SERVER_NAME="${SERVER_NAME:-_}"
DJANGO_SERVICE_NAME="${DJANGO_SERVICE_NAME:-stock-portfolio}"
NGINX_SITE_NAME="${NGINX_SITE_NAME:-stock-portfolio}"

if [[ -z "${DJANGO_SECRET_KEY:-}" ]]; then
  echo "[ERROR] DJANGO_SECRET_KEY is required"
  exit 1
fi

if [[ -z "${DJANGO_ALLOWED_HOSTS:-}" ]]; then
  echo "[ERROR] DJANGO_ALLOWED_HOSTS is required"
  exit 1
fi

if ! command -v sudo >/dev/null 2>&1; then
  echo "[ERROR] sudo is required"
  exit 1
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "[ERROR] nginx is not installed"
  exit 1
fi

bash "$ROOT_DIR/scripts/setup.sh"

if [[ -f "$ROOT_DIR/env/bin/activate" ]]; then
  # shellcheck source=/dev/null
  source "$ROOT_DIR/env/bin/activate"
elif [[ -f "$ROOT_DIR/env/Scripts/activate" ]]; then
  # shellcheck source=/dev/null
  source "$ROOT_DIR/env/Scripts/activate"
else
  echo "[ERROR] Could not activate virtual environment"
  exit 1
fi

pushd "$ROOT_DIR/frontend" > /dev/null
npm run build
popd > /dev/null

mkdir -p "$ROOT_DIR/stock_portfolio/static/frontend"
cp -r "$ROOT_DIR/frontend/build"/* "$ROOT_DIR/stock_portfolio/static/frontend/"

pushd "$ROOT_DIR/stock_portfolio" > /dev/null
python manage.py migrate --noinput
python manage.py collectstatic --noinput
popd > /dev/null

cat > "$ROOT_DIR/.env.deploy" <<EOF
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
DJANGO_ALLOWED_HOSTS=${DJANGO_ALLOWED_HOSTS}
DJANGO_CSRF_TRUSTED_ORIGINS=${DJANGO_CSRF_TRUSTED_ORIGINS:-}
EOF

sed \
  -e "s|__SERVER_PATH__|$SERVER_PATH|g" \
  -e "s|__SERVER_USER__|$SERVER_USER|g" \
  "$ROOT_DIR/deploy/systemd/stock_portfolio.service" | sudo tee "/etc/systemd/system/${DJANGO_SERVICE_NAME}.service" > /dev/null

sed \
  -e "s|__SERVER_PATH__|$SERVER_PATH|g" \
  -e "s|__SERVER_NAME__|$SERVER_NAME|g" \
  "$ROOT_DIR/deploy/nginx/stock_portfolio.conf" | sudo tee "/etc/nginx/sites-available/${NGINX_SITE_NAME}" > /dev/null

sudo ln -sfn "/etc/nginx/sites-available/${NGINX_SITE_NAME}" "/etc/nginx/sites-enabled/${NGINX_SITE_NAME}"
sudo nginx -t
sudo systemctl daemon-reload
sudo systemctl enable "${DJANGO_SERVICE_NAME}.service"
sudo systemctl restart "${DJANGO_SERVICE_NAME}.service"
sudo systemctl enable nginx
sudo systemctl reload nginx

echo "Production setup complete."
echo "Open http://${SERVER_NAME} if DNS is configured, otherwise use your VM public IP on port 80."