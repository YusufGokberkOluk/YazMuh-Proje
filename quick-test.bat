@echo off
echo.
echo ====================================
echo   QUICK API TEST
echo ====================================
echo.

echo Testing Backend API...
echo.

echo [TEST 1] API Health Check:
curl -s http://localhost:5000 2>nul
if %errorlevel% neq 0 (
    echo ❌ Backend server is not running!
    echo Please start backend with: cd backend && npm run dev
    echo.
    pause
    exit /b 1
)
echo ✅ Backend is running!
echo.

echo [TEST 2] Frontend Check:
curl -s -o nul -w "%%{http_code}" http://localhost:3000 2>nul | findstr "200" >nul
if %errorlevel% neq 0 (
    echo ❌ Frontend server is not responding!
    echo Please start frontend with: cd frontend && npm run dev
) else (
    echo ✅ Frontend is running!
)
echo.

echo ====================================
echo   TEST SUMMARY
echo ====================================
echo.
echo Manual Test URLs:
echo 🌐 Homepage:  http://localhost:3000
echo 🔐 Sign In:   http://localhost:3000/sign-in
echo 📝 App:       http://localhost:3000/app
echo 📄 Templates: http://localhost:3000/templates
echo ⚙️  Settings:  http://localhost:3000/settings
echo.
echo API Endpoints:
echo 🔗 Health:    http://localhost:5000
echo 📊 API Docs:  http://localhost:5000/api-docs (if implemented)
echo.
echo Test Login Credentials:
echo 📧 Email:     kullanici@etude.app
echo 🔑 Password:  password123
echo.
pause 