@echo off
REM Model Setup Script for Windows
REM Creates directories and helps set up AI models

echo 🤖 AI Model Setup Script
echo ========================
echo.

REM Create model directories
echo 📁 Creating model directories...
if not exist "client\public\models\cancer-detection" (
    mkdir "client\public\models\cancer-detection"
    echo    ✅ Created client\public\models\cancer-detection
) else (
    echo    ℹ️  client\public\models\cancer-detection already exists
)

if not exist "client\public\models\infection-detection" (
    mkdir "client\public\models\infection-detection"
    echo    ✅ Created client\public\models\infection-detection
) else (
    echo    ℹ️  client\public\models\infection-detection already exists
)

REM Create .gitkeep files
echo. > "client\public\models\cancer-detection\.gitkeep"
echo. > "client\public\models\infection-detection\.gitkeep"

echo.
echo ✅ Model directories ready!
echo.

REM Check for Python
echo 🔍 Checking dependencies...
python --version >nul 2>&1
if errorlevel 1 (
    echo    ⚠️  Python not found (needed for model conversion)
    echo    💡 Install Python from https://www.python.org/
) else (
    echo    ✅ Python found
    python -c "import tensorflowjs" >nul 2>&1
    if errorlevel 1 (
        echo    ⚠️  TensorFlow.js converter not installed
        echo    💡 Run: pip install tensorflowjs
    ) else (
        echo    ✅ TensorFlow.js converter installed
    )
)

echo.
echo 📋 Next Steps:
echo ==============
echo.
echo 1. Download models from one of these sources:
echo    📚 See MODEL_REPOSITORIES.md for specific links
echo.
echo 2. Place model files in:
echo    - client\public\models\cancer-detection\
echo    - client\public\models\infection-detection\
echo.
echo 3. Model files needed:
echo    - model.json (model architecture)
echo    - weights.bin or weights_*.bin (model weights)
echo.
echo 4. Restart your app - models will auto-load!
echo.
echo 💡 Tip: The app works with fallback analysis if models aren't found.
echo    This is perfect for testing and development.
echo.

echo ✨ Setup complete!
echo.
echo 📖 For detailed instructions, see:
echo    - MODEL_REPOSITORIES.md (where to find models)
echo    - AI_MODELS_GUIDE.md (how to convert and use models)
echo.
pause

