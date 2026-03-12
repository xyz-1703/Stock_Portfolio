@echo off
setlocal

set "ROOT_DIR=%~dp0.."
pushd "%ROOT_DIR%"

if not exist "env\Scripts\activate.bat" (
  echo [INFO] Creating virtual environment in .\env
  python -m venv env
)

call "env\Scripts\activate.bat"

echo Installing backend dependencies...
pip install -r requirements.txt
if errorlevel 1 (
  echo [ERROR] Failed to install backend dependencies.
  popd
  exit /b 1
)

echo Installing frontend dependencies...
pushd "frontend"
npm install
if errorlevel 1 (
  echo [ERROR] Failed to install frontend dependencies.
  popd
  popd
  exit /b 1
)
popd

echo Setup complete.
popd
