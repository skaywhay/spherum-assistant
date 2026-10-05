import sys
import subprocess
import os
import socket

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_py = os.path.join(base_dir, "venv", "Scripts", "python.exe")
    python_exe = venv_py if os.path.exists(venv_py) else sys.executable

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        try:
            local_ip = socket.gethostbyname(socket.gethostname())
        except Exception:
            local_ip = "127.0.0.1"

    print("====================================================")
    print("«Сферум.Ассистент» запущен!")
    print(f"На компьютере: http://localhost:8000")
    print(f"На телефоне (в одной сети Wi-Fi): http://{local_ip}:8000")
    print("====================================================")

    try:
        subprocess.run([
            python_exe, "-m", "uvicorn", "app.main:app",
            "--host", "0.0.0.0", "--port", "8000", "--reload"
        ])
    except KeyboardInterrupt:
        print("\nСервер остановлен.")

if __name__ == "__main__":
    main()
