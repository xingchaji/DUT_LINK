@echo off
setlocal enabledelayedexpansion
title DUT Link Launcher

REM ============================================================
REM  DUT Link one-click launcher
REM  Steps: deps check -> database check -> start Next.js -> open browser
REM  Edit the two paths below if your PostgreSQL install location differs.
REM ============================================================

cd /d "%~dp0"

set "PG_ISREADY=E:\postgresql\bin\pg_isready.exe"
set "PG_SERVICE=postgresql-x64-16"
set "APP_URL=http://localhost:3000"

echo ============================================
echo   DUT Link - one-click launcher
echo ============================================
echo.

REM 1. Dependencies
if exist "node_modules" (
    echo [1/4] Dependencies OK.
) else (
    echo [1/4] Installing dependencies, please wait...
    call npm install
    if errorlevel 1 (
        echo [X] npm install failed. Check your network or Node.js install.
        pause
        exit /b 1
    )
)

REM 2. Database
echo [2/4] Checking PostgreSQL...
"%PG_ISREADY%" -h 127.0.0.1 -p 5432 >nul 2>&1
if errorlevel 1 (
    echo       Not responding, starting service...
    net start "%PG_SERVICE%" >nul 2>&1
    if errorlevel 1 (
        echo [X] Could not start PostgreSQL. Run this script as Administrator.
        pause
        exit /b 1
    )
)
echo       Database OK.

REM 3. Port check
echo [3/4] Checking port 3000...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo       Already running - opening browser only.
    start "" "%APP_URL%"
    exit /b 0
)

REM 4. Start dev server
echo [4/4] Starting Next.js dev server...
start "DUT Link Dev Server" cmd /k "npm run dev"

REM 5. Wait for ready then open browser
echo       Waiting for server to become ready...
set /a tries=0
:waitloop
ping -n 2 127.0.0.1 >nul
curl -s --max-time 2 -o nul "%APP_URL%/api/health"
if not errorlevel 1 goto ready
set /a tries+=1
if !tries! geq 90 (
    echo [X] Server did not start within 90s. Check the "DUT Link Dev Server" window.
    pause
    exit /b 1
)
goto waitloop

:ready
echo.
echo   [OK] DUT Link is up at %APP_URL%
echo.
start "" "%APP_URL%"
endlocal
