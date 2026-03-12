@echo off
setlocal

set "ROOT_DIR=%~dp0.."
pushd "%ROOT_DIR%"

if not exist "frontend\package.json" (
  echo [ERROR] frontend\package.json not found
  popd
  exit /b 1
)

pushd "frontend"
echo Starting React frontend at http://localhost:3000/
npm start
popd
popd
