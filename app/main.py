import hmac
import hashlib
import os
from urllib.parse import parse_qsl, unquote
from fastapi import FastAPI, HTTPException, Header
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from app.database import init_db, get_all_tasks, add_task, get_all_absences, add_absence

app = FastAPI(title="Сферум.Ассистент")

BOT_TOKEN = os.getenv("MAX_BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")


def verify_init_data(init_data: str, bot_token: str) -> bool:
    """Проверка подписи WebApp данных от платформы MAX"""
    if not init_data:
        return False

    parsed = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        return False

    # Сортируем параметры по алфавиту для формирования строки проверки
    launch_params = "\n".join(
        f"{k}={unquote(parsed[k])}" for k in sorted(parsed.keys())
    )

    secret_key = hmac.new(
        key=b"WebAppData",
        msg=bot_token.encode("utf-8"),
        digestmod=hashlib.sha256
    ).digest()

    calculated_hash = hmac.new(
        key=secret_key,
        msg=launch_params.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(calculated_hash, received_hash)


@app.on_event("startup")
def startup():
    init_db()


# Входные схемы данных
class TaskCreate(BaseModel):
    subject: str
    title: str
    deadline: str


class AbsenceCreate(BaseModel):
    student_name: str
    reason: str
    dates: str
    has_certificate: bool = False


# Эндпоинты для работы с домашними заданиями
@app.get("/api/tasks")
def list_tasks():
    return get_all_tasks()


@app.post("/api/tasks")
def create_task(data: TaskCreate):
    return add_task(data.subject, data.title, data.deadline)


# Эндпоинты для реестра отсутствующих и справок
@app.get("/api/absences")
def list_absences():
    return get_all_absences()


@app.post("/api/absences")
def create_absence(data: AbsenceCreate):
    add_absence(data.student_name, data.reason, data.dates, data.has_certificate)
    return {"status": "ok"}


# Раздача фронтенда из папки static
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
    