@echo off
echo ========================================
echo   SkinGuard - Cancer Detection App
echo   Easy Startup Script for Beginners
echo ========================================
echo.

REM Go to project root (one level up from client)
cd ..

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Download the LTS version and install it.
    echo Then run this script again.
    pause
    exit /b 1
)

echo [1/4] Checking Node.js installation...
node --version
echo ✓ Node.js is installed!
echo.

REM Check if we're in the right directory
if not exist "client" (
    echo [ERROR] Cannot find 'client' folder!
    echo.
    echo Please make sure you're running this script from the project root
    echo (the folder that contains both 'client' and 'server' folders)
    echo.
    pause
    exit /b 1
)

if not exist "server" (
    echo [ERROR] Cannot find 'server' folder!
    echo.
    echo Please make sure you're running this script from the project root
    echo (the folder that contains both 'client' and 'server' folders)
    echo.
    pause
    exit /b 1
)

echo [2/4] Installing backend dependencies...
if not exist "node_modules" (
    echo This may take 2-3 minutes, please wait...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✓ Backend dependencies already installed
)
echo.

echo [3/4] Installing frontend dependencies...
cd client
if not exist "node_modules" (
    echo This may take 3-5 minutes, please wait...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ✓ Frontend dependencies already installed
)
cd ..
echo.

echo [4/4] Starting the application...
echo.
echo ========================================
echo   Starting servers...
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo The browser will open automatically.
echo Press Ctrl+C to stop the servers.
echo.

REM Start both servers using npm run dev if package.json exists
if exist "package.json" (
    call npm run dev
) else (
    REM Manual start if no package.json
    start "Backend Server" cmd /k "node server/index.js"
    timeout /t 3 /nobreak >nul
    start "Frontend Server" cmd /k "cd client && npm start"
    pause
)


