@echo off
setlocal enabledelayedexpansion
REM ============================================================
REM  DNF Vision web launcher + first-run bootstrap.
REM  On a freshly cloned machine this script will:
REM    1) install Python 3.12 (via winget) if missing
REM    2) create .venv and install backend deps (web/backend/requirements.txt)
REM    3) install Node.js LTS (via winget) if missing
REM    4) npm install for the frontend
REM    5) start backend (:8000) + frontend (:3000) and open the browser
REM  Re-running is fast: existing .venv / node_modules are reused.
REM ============================================================
cd /d "%~dp0"

REM Make a winget-installed Node visible to this session.
set "PATH=C:\Program Files\nodejs;%PATH%"

set "VENV_PY=%~dp0.venv\Scripts\python.exe"

REM ---------- [1/4] Python 3.12 + .venv ----------
if exist "%VENV_PY%" goto venv_ready

echo [setup] .venv not found - bootstrapping Python environment...

REM Find a Python 3.12 launcher: prefer the py launcher, then plain python.
set "BOOT_PY="
py -3.12 -c "import sys" >nul 2>&1 && set "BOOT_PY=py -3.12"
if not defined BOOT_PY (
  for /f "delims=" %%v in ('python -c "import sys;print(sys.version_info[0]*10+sys.version_info[1])" 2^>nul') do (
    if "%%v"=="312" set "BOOT_PY=python"
  )
)

if not defined BOOT_PY (
  echo [setup] Python 3.12 not found. Installing via winget...
  where winget >nul 2>&1
  if errorlevel 1 (
    echo [ERROR] winget is unavailable. Install Python 3.12 manually:
    echo         https://www.python.org/downloads/release/python-3120/
    echo         Then re-run this script.
    pause
    exit /b 1
  )
  winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
  py -3.12 -c "import sys" >nul 2>&1 && set "BOOT_PY=py -3.12"
  if not defined BOOT_PY (
    echo [setup] Python installed, but PATH is not refreshed in this session.
    echo         Please CLOSE this window and run start_web.bat again.
    pause
    exit /b 1
  )
)

echo [setup] Creating virtual environment (.venv)...
%BOOT_PY% -m venv .venv
if not exist "%VENV_PY%" (
  echo [ERROR] Failed to create .venv.
  pause
  exit /b 1
)

echo [setup] Installing backend dependencies (this can take a few minutes)...
"%VENV_PY%" -m pip install --upgrade pip
"%VENV_PY%" -m pip install -r "%~dp0web\backend\requirements.txt"
if errorlevel 1 (
  echo [ERROR] pip install failed. See messages above.
  pause
  exit /b 1
)

:venv_ready

REM ---------- [2/4] Node.js ----------
where node >nul 2>&1
if errorlevel 1 (
  echo [setup] Node.js not found. Installing via winget...
  where winget >nul 2>&1
  if errorlevel 1 (
    echo [ERROR] winget is unavailable. Install Node.js LTS manually:
    echo         https://nodejs.org/en/download
    echo         Then re-run this script.
    pause
    exit /b 1
  )
  winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
  set "PATH=C:\Program Files\nodejs;%PATH%"
  where node >nul 2>&1
  if errorlevel 1 (
    echo [setup] Node installed, but PATH is not refreshed in this session.
    echo         Please CLOSE this window and run start_web.bat again.
    pause
    exit /b 1
  )
)

REM ---------- [3/4] Frontend deps ----------
if not exist "%~dp0web\frontend\node_modules" (
  echo [setup] Installing frontend dependencies (npm install)...
  pushd "%~dp0web\frontend"
  call npm install
  popd
  if not exist "%~dp0web\frontend\node_modules" (
    echo [ERROR] npm install failed. See messages above.
    pause
    exit /b 1
  )
)

REM ---------- [4/4] Launch ----------
echo.
echo [1/3] Starting FastAPI backend (:8000) ...
start "DNF Vision Backend" "%~dp0web\backend\run-api.bat"

echo [2/3] Starting Next.js frontend (:3000) ...
start "DNF Vision Frontend" "%~dp0web\frontend\run-dev.bat"

echo [3/3] Opening browser in 8 seconds ...
timeout /t 8 >nul
start http://localhost:3000

echo.
echo Two console windows opened (Backend + Frontend). Close each window to stop the servers.
echo If a server window flashed and closed, it crashed - it now stays open to show the error.
echo.
pause
endlocal
