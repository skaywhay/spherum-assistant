import sys
import subprocess
import os

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_py = os.path.join(base_dir, "venv", "Scripts", "python.exe")
    python_exe = venv_py if os.path.exists(venv_py) else sys.executable

    print("====================================================")
    print("Запуск проекта «Сферум.Ассистент» на http://localhost:8000")
    print(f"Интерпретатор: {python_exe}")
    print("====================================================")

    try:
        subprocess.run([python_exe, "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"])
    except KeyboardInterrupt:
        print("\nСервер остановлен.")

if __name__ == "__main__":
    main()
