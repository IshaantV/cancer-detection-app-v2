@echo off
echo ========================================
echo Starting SkinGuard with Cloudflare Tunnels
echo ========================================
echo.

REM Check if cloudflared is installed
where cloudflared >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: cloudflared is not installed or not in PATH
    echo Please install cloudflared first
    echo Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
    pause
    exit /b 1
)

echo [1/3] Starting application servers...
start "SkinGuard App" cmd /k "npm run dev"

REM Wait a few seconds for servers to start
timeout /t 5 /nobreak >nul

echo [2/3] Starting frontend tunnel (port 3000)...
start "Cloudflare Tunnel - Frontend" cmd /k "cloudflared tunnel --url http://localhost:3000"

REM Wait a moment
timeout /t 2 /nobreak >nul

echo [3/3] Starting backend tunnel (port 5000)...
start "Cloudflare Tunnel - Backend" cmd /k "cloudflared tunnel --url http://localhost:5000"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Check the Cloudflare Tunnel windows for your public URLs:
echo   - Frontend URL will be in "Cloudflare Tunnel - Frontend" window
echo   - Backend URL will be in "Cloudflare Tunnel - Backend" window
echo.
echo ========================================
echo IMPORTANT: Update Environment Variables
echo ========================================
echo.
echo To make QR codes always show the tunnel URL:
echo   1. Copy the URLs from the tunnel windows above
echo   2. Run: update-tunnel-urls.bat
echo   3. Or manually edit client\.env file
echo   4. Restart your React app for changes to take effect
echo.
echo Keep all windows open while using the app.
echo Press any key to close this window (services will keep running)...
pause >nul

