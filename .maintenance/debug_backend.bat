@echo off
echo Testing Backend Startup...
call venv\Scripts\activate
python -c "import backend.main; print('Import successful')"
if %errorlevel% neq 0 (
    echo Import failed!
    pause
    exit /b
)

echo Starting Uvicorn...
uvicorn backend.main:app --reload
pause
