@echo off
echo ========================================
echo Checking Environment Configuration
echo ========================================
echo.

if exist "client\.env" (
    echo Found client\.env file
    echo.
    echo Current contents:
    type client\.env
    echo.
    echo.
    findstr /C:"REACT_APP_API_URL" client\.env >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ REACT_APP_API_URL is set
    ) else (
        echo ❌ REACT_APP_API_URL is NOT set!
        echo.
        echo You need to add your backend tunnel URL.
        echo Run: update-tunnel-urls.bat
    )
) else (
    echo ❌ client\.env file not found!
    echo Run: setup-env.bat
)

echo.
echo ========================================
pause

