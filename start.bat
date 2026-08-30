@echo off
setlocal enabledelayedexpansion
title DUT Link Launcher

cd /d "%~dp0"
set "APP_URL=http://localhost:3000"

echo ============================================
echo   DUT Link - one-click local launcher
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js was not found. Install Node.js 22 LTS first.
    echo     https://nodejs.org/
    pause
    exit /b 1
)

node -e "const [major,minor]=process.versions.node.split('.').map(Number); process.exit((major===20&&minor>=19)||(major===22&&minor>=12)||major>=24?0:1)"
if errorlevel 1 (
    echo [X] Unsupported Node.js version. Use 20.19+, 22.12+ or 24+; Node.js 22 LTS is recommended.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [1/3] Installing locked dependencies...
    call npm ci
    if errorlevel 1 (
        echo [X] Dependency installation failed. See docs/GETTING_STARTED.md.
        pause
        exit /b 1
    )
) else (
    echo [1/3] Dependencies found.
)

echo [2/3] Preparing local environment...
call npm run setup
if errorlevel 1 (
    echo [X] Environment setup failed.
    pause
    exit /b 1
)

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo [3/3] Port 3000 already has a service. Opening it without starting a duplicate.
    start "" "%APP_URL%"
    exit /b 0
)

echo [3/3] Starting DUT Link...
start "DUT Link Dev Server" cmd /k "npm run dev"
echo       Waiting for the page to become available...
set /a tries=0

:waitloop
ping -n 2 127.0.0.1 >nul
curl -s --max-time 2 -o nul "%APP_URL%/api/health"
if not errorlevel 1 goto ready
set /a tries+=1
if !tries! geq 90 (
    echo [X] Server did not start within 90 seconds. Check the DUT Link Dev Server window.
    pause
    exit /b 1
)
goto waitloop

:ready
echo [OK] DUT Link is available at %APP_URL%
start "" "%APP_URL%"
endlocal
