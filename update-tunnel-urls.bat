@echo off
echo ========================================
echo Update Cloudflare Tunnel URLs
echo ========================================
echo.
echo This script will help you update the tunnel URLs in your .env file.
echo.
echo You need to get the URLs from your Cloudflare tunnel windows:
echo   1. Frontend URL from "Cloudflare Tunnel - Frontend" window
echo   2. Backend URL from "Cloudflare Tunnel - Backend" window
echo.
echo The URLs look like: https://abc-xyz-1234.trycloudflare.com
echo.

set /p FRONTEND_URL="Enter Frontend Tunnel URL (or press Enter to skip): "
set /p BACKEND_URL="Enter Backend Tunnel URL (or press Enter to skip): "

if "%FRONTEND_URL%"=="" (
    echo Skipping frontend URL update.
) else (
    echo Updating frontend URL...
    powershell -Command "(Get-Content 'client\.env') -replace '^REACT_APP_PUBLIC_URL=.*', 'REACT_APP_PUBLIC_URL=%FRONTEND_URL%' | Set-Content 'client\.env'"
    echo Frontend URL updated to: %FRONTEND_URL%
)

if "%BACKEND_URL%"=="" (
    echo Skipping backend URL update.
) else (
    echo Updating backend URL...
    powershell -Command "(Get-Content 'client\.env') -replace '^REACT_APP_API_URL=.*', 'REACT_APP_API_URL=%BACKEND_URL%' | Set-Content 'client\.env'"
    echo Backend URL updated to: %BACKEND_URL%
)

echo.
echo ========================================
echo Update complete!
echo ========================================
echo.
echo IMPORTANT: You must restart your React app for changes to take effect.
echo Stop the app (Ctrl+C) and run 'npm run dev' again, or restart the batch file.
echo.
pause

