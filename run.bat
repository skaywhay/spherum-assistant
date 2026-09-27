@echo off
chcp 65001 > nul
echo ====================================================
echo Запуск проекта "Сферум.Ассистент" на http://localhost:8000
echo ====================================================
if exist venv\Scripts\python.exe (
    venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
) else (
    python -m uvicorn app.main:app --reload --port 8000
)
pause
