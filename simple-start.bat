@echo off
echo ====================================
echo   SIMPLE ETUDE STARTER (NO REDIS)
echo ====================================

echo [1/2] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo [2/2] Starting Frontend Server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo Both servers are starting in separate windows!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Wait 10-15 seconds for servers to be ready
pause 