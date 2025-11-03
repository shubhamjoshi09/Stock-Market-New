@echo off
echo Starting Backend Server...
cd /d "C:\Users\hp\Web Development\Stock-Market-New\Backend"
start "Backend Server" cmd /k "npm run dev"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
cd /d "C:\Users\hp\Web Development\Stock-Market-New\Frontend"
start "Frontend Server" cmd /k "npm run dev"

echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo WebSocket Test: http://localhost:3000/test-realtime.html
pause