@echo off
setlocal

set "ROOT_DIR=%~dp0.."
pushd "%ROOT_DIR%"

if not exist "scripts\start_backend.bat" (
  echo [ERROR] scripts\start_backend.bat not found
  popd
  exit /b 1
)

if not exist "scripts\start_frontend.bat" (
  echo [ERROR] scripts\start_frontend.bat not found
  popd
  exit /b 1
)

start "Backend" cmd /k "call scripts\start_backend.bat"
start "Frontend" cmd /k "call scripts\start_frontend.bat"

echo Opened backend and frontend in separate terminals.
popd
