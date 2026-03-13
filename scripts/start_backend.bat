@echo off
setlocal

set "ROOT_DIR=%~dp0.."
pushd "%ROOT_DIR%"

if not exist "env\Scripts\activate.bat" (
  echo [ERROR] Virtual environment not found at env\Scripts\activate.bat
  echo Create it first, for example: python -m venv env
  popd
  exit /b 1
)

call "env\Scripts\activate.bat"

if not exist "stock_portfolio\manage.py" (
  echo [ERROR] manage.py not found at stock_portfolio\manage.py
  popd
  exit /b 1
)

pushd "stock_portfolio"
echo Starting Django backend at http://127.0.0.1:8000/
python manage.py runserver
popd
popd
