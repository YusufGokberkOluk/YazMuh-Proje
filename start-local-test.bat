@echo off
echo.
echo ====================================
echo   ETUDE LOCAL TEST STARTER
echo ====================================
echo.

echo [1/3] Checking directories...
if not exist "backend" (
    echo ERROR: backend directory not found!
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: frontend directory not found!
    pause
    exit /b 1
)

echo [2/3] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak

echo [3/3] Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Test URLs:
echo - Homepage: http://localhost:3000
echo - Sign In:  http://localhost:3000/sign-in
echo - App:      http://localhost:3000/app
echo - Templates: http://localhost:3000/templates
echo - Settings: http://localhost:3000/settings
echo.
echo ℹ️  Check the terminal windows for any errors
echo ℹ️  Use Ctrl+C in terminal windows to stop servers
echo.
pause 