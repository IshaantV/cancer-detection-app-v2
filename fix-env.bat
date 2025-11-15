@echo off
echo ========================================
echo Fixing Environment Configuration
echo ========================================
echo.

echo This will add REACT_APP_API_URL to your .env file if it's missing.
echo.
set /p BACKEND_URL="Enter your BACKEND tunnel URL (from Cloudflare tunnel window): "

if "%BACKEND_URL%"=="" (
    echo No URL provided. Exiting.
    pause
    exit /b 1
)

echo.
echo Adding REACT_APP_API_URL=%BACKEND_URL% to client\.env
echo.

REM Check if REACT_APP_API_URL already exists
findstr /C:"REACT_APP_API_URL" client\.env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo REACT_APP_API_URL already exists, updating it...
    powershell -Command "(Get-Content 'client\.env') -replace '^REACT_APP_API_URL=.*', 'REACT_APP_API_URL=%BACKEND_URL%' | Set-Content 'client\.env'"
) else (
    echo Adding new REACT_APP_API_URL...
    echo. >> client\.env
    echo # Cloudflare Tunnel Backend URL >> client\.env
    echo REACT_APP_API_URL=%BACKEND_URL% >> client\.env
)

echo.
echo ✅ Updated client\.env
echo.
echo IMPORTANT: You must restart your React app for this to take effect!
echo Stop the app (Ctrl+C) and run start-tunnels-with-app.bat again.
echo.
pause

