@echo off
REM Healthcare App Backend Startup Script for Windows

echo 🏥 Healthcare App Backend Startup
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if MongoDB is running (Windows)
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is running
) else (
    echo ⚠️  MongoDB is not running. Please start MongoDB:
    echo    mongod
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" (
        pause
        exit /b 1
    )
)

REM Check if Redis is running (Windows)
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I /N "redis-server.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ Redis is running
) else (
    echo ⚠️  Redis is not running. Please start Redis:
    echo    redis-server
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" (
        pause
        exit /b 1
    )
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating template...
    (
        echo VITE_GEMINI_API_KEY=your_gemini_key_here
        echo VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
        echo VITE_API_BASE_URL=http://localhost:5000
        echo DB_URI=mongodb://localhost:27017/healthcare_app
        echo REDIS_URL=redis://localhost:6379
        echo AUTH_PROVIDER=auth0
        echo JWT_SECRET=your_secure_jwt_secret_here
        echo HIPAA_ENCRYPTION_KEY=your_encryption_key_here
        echo PORT=5000
        echo NODE_ENV=development
    ) > .env
    echo 📝 Created .env template. Please update with your actual API keys.
    echo.
    set /p continue="Continue with template values? (y/n): "
    if /i not "%continue%"=="y" (
        pause
        exit /b 1
    )
) else (
    echo ✅ .env file found
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

REM Check if running in development or production
if "%NODE_ENV%"=="production" (
    echo 🚀 Starting in production mode...
    npm start
) else (
    echo 🔧 Starting in development mode...
    npm run dev
)

pause 