@echo off
title Backend Server - Cancer Detection App
color 0A

REM Change to the directory where this batch file is located
cd /d "%~dp0"

echo ========================================
echo   Starting Backend Server...
echo ========================================
echo.
echo Current directory: %CD%
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo [OK] Node.js found
echo.

REM Check if we're in the right directory
if not exist "server\index.js" (
    echo [ERROR] Cannot find server\index.js
    echo.
    echo Current directory: %CD%
    echo.
    echo Please make sure you're running this from the project root directory.
    echo The batch file should be in: C:\cancer-detection-app\
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo [OK] Found server\index.js
echo.

REM Check if node_modules exists (dependencies installed)
if not exist "node_modules" (
    echo [WARNING] Dependencies not installed!
    echo.
    echo Installing dependencies now...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to install dependencies!
        echo.
        echo Please run 'npm install' manually in this directory and try again.
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed successfully!
    echo.
)

REM Change to server directory
cd server

echo ========================================
echo Starting server on port 5000...
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Run the server
node index.js

REM If we get here, the server stopped
echo.
echo ========================================
echo Server stopped!
echo ========================================
echo.
echo Press any key to exit...
pause >nul
