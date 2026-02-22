@echo off
echo Cleaning up old processes...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

echo Starting Backend (Minimized)...
:: Uses direct python path to avoid activation issues
start /min "Solar Backend" cmd /k "venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000"

echo Starting Frontend (Minimized)...
start /min "Solar Frontend" cmd /k "set PATH=C:\Program Files\nodejs;%PATH% && cd frontend && npm run dev"

echo Waiting for servers to launch...
timeout /t 5 /nobreak >nul

echo Opening Browser...
start http://localhost:5173

exit
