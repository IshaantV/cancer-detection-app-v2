@echo off
echo ========================================
echo Starting Cancer Detection App
echo ========================================
echo.
echo Starting Backend Server (port 5000)...
start "Backend Server" cmd /k "cd server && node index.js"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Client (port 3000)...
start "Frontend Client" cmd /k "cd client && npm start"
echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Keep both windows open while using the app.
echo Press any key to exit this window (servers will keep running)...
pause >nul

