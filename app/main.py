import hmac
import hashlib
import os
from urllib.parse import parse_qsl, unquote
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from app.database import (
    init_db,
    authenticate_user,
    create_user,
    get_user_by_email,
    get_user_by_id,
    get_all_tasks,
    add_task,
    get_all_absences,
    add_absence,
    update_absence_status,
    get_all_clubs,
    get_club_applications,
    add_club_application,
    update_club_application_status
)

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


# --- Pydantic Схемы ---

class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "teacher"
    class_name: str = "9-А"


class QuickLoginRequest(BaseModel):
    role: str  # 'teacher' или 'parent'


class TaskCreate(BaseModel):
    subject: str
    title: str
    deadline: str
    class_name: str = "9-А"


class AbsenceCreate(BaseModel):
    student_name: str
    reason: str
    dates: str
    has_certificate: bool = False
    class_name: str = "9-А"
    certificate_url: str = ""


class AbsenceStatusUpdate(BaseModel):
    status: str  # 'approved' или 'rejected'
    rejection_reason: Optional[str] = ""


class ClubApplicationCreate(BaseModel):
    club_id: int
    student_name: str
    class_name: str
    parent_name: str
    parent_phone: str


class ClubApplicationStatusUpdate(BaseModel):
    status: str  # 'approved' или 'rejected'


# --- Эндпоинты Авторизации ---

@app.post("/api/auth/login")
def login(data: LoginRequest):
    user = authenticate_user(data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    return {
        "status": "ok",
        "user": user,
        "token": f"token_{user['id']}_{user['role']}"
    }


@app.post("/api/auth/register")
def register(data: RegisterRequest):
    existing = get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    
    if len(data.password) < 4:
        raise HTTPException(status_code=400, detail="Пароль должен содержать не менее 4 символов")

    user = create_user(
        email=data.email,
        password=data.password,
        full_name=data.full_name,
        role=data.role,
        class_name=data.class_name
    )
    return {
        "status": "ok",
        "user": user,
        "token": f"token_{user['id']}_{user['role']}"
    }


@app.post("/api/auth/quick-login")
def quick_login(data: QuickLoginRequest):
    """Быстрый вход для тестирования и жюри хакатона"""
    email = "teacher@sferum.ru" if data.role == "teacher" else "parent@sferum.ru"
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="Демо-пользователь не найден")
    return {
        "status": "ok",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "class_name": user["class_name"]
        },
        "token": f"demo_token_{user['role']}"
    }


# --- Эндпоинты Заданий ---

@app.get("/api/tasks")
def list_tasks():
    return get_all_tasks()


@app.post("/api/tasks")
def create_task(data: TaskCreate):
    return add_task(data.subject, data.title, data.deadline, data.class_name)


# --- Эндпоинты Справок и Отсутствий ---

@app.get("/api/absences")
def list_absences(class_name: Optional[str] = None, student_name: Optional[str] = None):
    return get_all_absences(class_name, student_name)


@app.post("/api/absences")
def create_absence(data: AbsenceCreate):
    return add_absence(
        student_name=data.student_name,
        reason=data.reason,
        dates=data.dates,
        has_certificate=data.has_certificate,
        class_name=data.class_name,
        certificate_url=data.certificate_url
    )


@app.patch("/api/absences/{absence_id}/status")
def change_absence_status(absence_id: int, data: AbsenceStatusUpdate):
    update_absence_status(absence_id, data.status, data.rejection_reason or "")
    return {"status": "ok"}


# --- Эндпоинты Кружков и Заявок ---

@app.get("/api/clubs")
def list_clubs():
    return get_all_clubs()


@app.get("/api/clubs/applications")
def list_applications(club_id: Optional[int] = None, student_name: Optional[str] = None):
    return get_club_applications(club_id, student_name)


@app.post("/api/clubs/apply")
def apply_to_club(data: ClubApplicationCreate):
    return add_club_application(
        club_id=data.club_id,
        student_name=data.student_name,
        class_name=data.class_name,
        parent_name=data.parent_name,
        parent_phone=data.parent_phone
    )


@app.patch("/api/clubs/applications/{app_id}/status")
def change_application_status(app_id: int, data: ClubApplicationStatusUpdate):
    update_club_application_status(app_id, data.status)
    return {"status": "ok"}


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
else:
    app.mount("/", StaticFiles(directory="static", html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)