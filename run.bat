@echo off
chcp 65001 > nul
echo ====================================================
echo Запуск проекта "Сферум.Ассистент"
echo На компьютере: http://localhost:8000
echo Для телефона: проверьте ваш локальный IP (ipconfig)
echo ====================================================
if exist venv\Scripts\python.exe (
    venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
) else (
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
)
pause
