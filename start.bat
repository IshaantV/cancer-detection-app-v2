@echo off
echo Starting SkinGuard Application...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
)

if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo Starting development servers...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.

call npm run dev

