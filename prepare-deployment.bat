@echo off
echo 🚀 Preparing Portfolio Optimizer for Deployment
echo ==============================================

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Error: Please run this script from the project root directory
    echo Expected structure: backend\, frontend\, README.md
    pause
    exit /b 1
)

if not exist "backend" (
    echo ❌ Error: backend directory not found
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Error: frontend directory not found
    pause
    exit /b 1
)

echo 📁 Current directory: %cd%

REM Check backend requirements
if not exist "backend\requirements.txt" (
    echo ❌ Error: backend\requirements.txt not found
    pause
    exit /b 1
) else (
    echo ✅ Backend requirements.txt found
)

REM Check if frontend build works
echo 🔨 Testing frontend build...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed - please fix errors first
    cd ..
    pause
    exit /b 1
) else (
    echo ✅ Frontend build successful
    cd ..
)

REM Check if backend starts
echo 🔨 Testing backend startup...
cd backend
python -c "from main import app; print('✅ Backend imports successful')"
if %errorlevel% neq 0 (
    echo ❌ Backend startup test failed
    cd ..
    pause
    exit /b 1
) else (
    echo ✅ Backend startup test passed
    cd ..
)

echo.
echo 🎉 Deployment preparation complete!
echo.
echo Project structure:
echo ├── backend\     (Deploy to Render)
echo ├── frontend\    (Deploy to Vercel)
echo └── README.md    (Documentation)
echo.
echo Next steps:
echo 1. Push to GitHub: git push origin main
echo 2. Deploy backend to Render (set root directory to 'backend')
echo 3. Deploy frontend to Vercel (set root directory to 'frontend')
echo 4. Update environment variables with actual URLs
echo.
echo 📖 See DEPLOYMENT.md for detailed instructions
pause
