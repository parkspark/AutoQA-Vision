@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
call npm run dev
echo.
echo [frontend stopped with exit code %errorlevel%] - window kept open so you can read errors.
pause
