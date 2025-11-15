@echo off
echo Creating client\.env file...

if not exist "client\.env" (
    echo # Cloudflare Tunnel URLs > "client\.env"
    echo # Frontend URL (from "Cloudflare Tunnel - Frontend" window) >> "client\.env"
    echo REACT_APP_PUBLIC_URL= >> "client\.env"
    echo. >> "client\.env"
    echo # Backend API URL (from "Cloudflare Tunnel - Backend" window) >> "client\.env"
    echo REACT_APP_API_URL= >> "client\.env"
    echo. >> "client\.env"
    echo # Example: >> "client\.env"
    echo # REACT_APP_PUBLIC_URL=https://abc-xyz-1234.trycloudflare.com >> "client\.env"
    echo # REACT_APP_API_URL=https://def-uvw-5678.trycloudflare.com >> "client\.env"
    echo. >> "client\.env"
    echo Created client\.env file successfully!
) else (
    echo client\.env already exists. Skipping creation.
)

echo.
echo Now run update-tunnel-urls.bat to set your tunnel URLs.
pause

