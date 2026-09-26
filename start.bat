@echo off
echo ==========================================================
echo Starting SuVithiMap: Urban Intelligence Platform (SIH26124)
echo ==========================================================

start "SuVithiMap Backend" cmd /k "cd /d %~dp0 && .venv\Scripts\uvicorn.exe backend.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 2 /nobreak >nul
start "SuVithiMap Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo SuVithiMap Backend running at http://localhost:8000
echo SuVithiMap Frontend running at http://localhost:5173
echo Opening browser...
start http://localhost:5173
