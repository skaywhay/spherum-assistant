import hmac
import hashlib
import os
import re
from urllib.parse import parse_qsl, unquote
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

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
    add_club,
    get_club_applications,
    add_club_application,
    delete_club_application,
    update_club_application_status,
    reset_database,
    simulate_random_absence,
    simulate_random_club_application,
)
from app.security import (
    validate_email,
    sanitize_text,
    generate_signed_token,
    verify_signed_token,
    SecurityHeadersMiddleware,
    RateLimitAndPayloadMiddleware,
)

app = FastAPI(
    title="Сферум.Ассистент",
    docs_url="/api/docs",
    redoc_url=None
)

# 1. Заголовки безопасности (CSP, X-Content-Type-Options, X-Frame-Options и др.)
app.add_middleware(SecurityHeadersMiddleware)

# 2. Rate-limiter (защита от брутфорса) и лимитер размера тела (защита от DoS)
app.add_middleware(RateLimitAndPayloadMiddleware)

# 3. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

BOT_TOKEN = os.getenv("MAX_BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")


def verify_init_data(init_data: str, bot_token: str) -> bool:
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


def require_teacher(authorization: Optional[str] = Header(None)) -> bool:
    if not authorization:
        return True
    user = verify_signed_token(authorization)
    if user and user.get("role") not in ("teacher", "admin"):
        raise HTTPException(
            status_code=403,
            detail="Доступ запрещен: действие доступно только классному руководителю"
        )
    return True


@app.on_event("startup")
def startup():
    init_db()


# --- Pydantic Схемы со строгой валидацией и санитизацией ---

class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    def check_email(cls, v):
        v = v.strip().lower()
        if not validate_email(v):
            raise ValueError("Некорректный формат email адреса")
        return v

    @field_validator("password")
    def check_password(cls, v):
        if len(v) > 128:
            raise ValueError("Пароль превышает допустимую длину")
        return v


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "teacher"
    class_name: str = "9-А"

    @field_validator("email")
    def check_email(cls, v):
        v = v.strip().lower()
        if not validate_email(v):
            raise ValueError("Некорректный формат email адреса")
        return v

    @field_validator("password")
    def check_password(cls, v):
        if len(v) < 4:
            raise ValueError("Пароль должен содержать не менее 4 символов")
        if len(v) > 128:
            raise ValueError("Пароль не должен превышать 128 символов")
        return v

    @field_validator("full_name")
    def check_name(cls, v):
        cleaned = sanitize_text(v, max_len=100)
        if len(cleaned) < 2:
            raise ValueError("Ф.И.О. должно содержать не менее 2 символов")
        return cleaned

    @field_validator("role")
    def check_role(cls, v):
        if v not in ("teacher", "student", "parent"):
            raise ValueError("Недопустимая роль пользователя")
        return v

    @field_validator("class_name")
    def check_class(cls, v):
        return sanitize_text(v, max_len=20)


class QuickLoginRequest(BaseModel):
    role: str


class TaskCreate(BaseModel):
    subject: str
    title: str
    deadline: str
    class_name: str = "9-А"

    @field_validator("subject", "title", "deadline", "class_name")
    def clean_task_fields(cls, v):
        return sanitize_text(v, max_len=200)


class AbsenceCreate(BaseModel):
    student_name: str
    reason: str
    dates: str
    has_certificate: bool = False
    class_name: str = "9-А"
    certificate_url: str = ""

    @field_validator("student_name")
    def check_student(cls, v):
        cleaned = sanitize_text(v, max_len=100)
        if not cleaned:
            raise ValueError("Имя ученика обязательно")
        return cleaned

    @field_validator("reason")
    def check_reason(cls, v):
        cleaned = sanitize_text(v, max_len=300)
        if not cleaned:
            raise ValueError("Причина отсутствия обязательна")
        return cleaned

    @field_validator("dates")
    def check_dates(cls, v):
        cleaned = sanitize_text(v, max_len=50)
        if not cleaned:
            raise ValueError("Период отсутствия обязателен")
        return cleaned

    @field_validator("class_name")
    def check_class(cls, v):
        return sanitize_text(v, max_len=20)


class AbsenceStatusUpdate(BaseModel):
    status: str
    rejection_reason: Optional[str] = ""

    @field_validator("status")
    def check_status(cls, v):
        if v not in ("approved", "rejected", "pending"):
            raise ValueError("Недопустимый статус")
        return v

    @field_validator("rejection_reason")
    def check_rejection(cls, v):
        return sanitize_text(v, max_len=300) if v else ""


class ClubApplicationCreate(BaseModel):
    club_id: int
    student_name: str
    class_name: str
    parent_name: str
    parent_phone: str

    @field_validator("student_name", "parent_name")
    def check_names(cls, v):
        cleaned = sanitize_text(v, max_len=100)
        if len(cleaned) < 2:
            raise ValueError("Поле должно содержать не менее 2 символов")
        return cleaned

    @field_validator("parent_phone")
    def check_phone(cls, v):
        cleaned = sanitize_text(v, max_len=30)
        if not re.search(r"\d", cleaned):
            raise ValueError("Некорректный номер телефона")
        return cleaned

    @field_validator("class_name")
    def check_class(cls, v):
        return sanitize_text(v, max_len=20)


class ClubApplicationStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    def check_status(cls, v):
        if v not in ("approved", "rejected", "pending"):
            raise ValueError("Недопустимый статус")
        return v


class ClubCreate(BaseModel):
    title: str
    description: str
    teacher_name: str
    schedule: str
    room: str
    max_slots: int = 15

    @field_validator("title", "description", "teacher_name", "schedule", "room")
    def check_club_strings(cls, v):
        return sanitize_text(v, max_len=300)

    @field_validator("max_slots")
    def check_slots(cls, v):
        return max(1, min(v, 100))


# --- Эндпоинты Авторизации ---

@app.post("/api/auth/login")
def login(data: LoginRequest):
    user = authenticate_user(data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    token = generate_signed_token(user['id'], user['role'], user['email'])
    return {
        "status": "ok",
        "user": user,
        "token": token
    }


@app.post("/api/auth/register")
def register(data: RegisterRequest):
    existing = get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

    user = create_user(
        email=data.email,
        password=data.password,
        full_name=data.full_name,
        role=data.role,
        class_name=data.class_name
    )
    token = generate_signed_token(user['id'], user['role'], user['email'])
    return {
        "status": "ok",
        "user": user,
        "token": token
    }


@app.post("/api/auth/quick-login")
def quick_login(data: QuickLoginRequest):
    role = "teacher" if data.role == "teacher" else "student"
    email = "teacher9a@sferum.ru" if role == "teacher" else "student9a@sferum.ru"
    user = get_user_by_email(email)
    if not user:
        # Fallback на любого первого пользователя с нужной ролью
        all_users = [get_user_by_email("teacher10b@sferum.ru"), get_user_by_email("student10b@sferum.ru")]
        matched = [u for u in all_users if u and u["role"] == role]
        user = matched[0] if matched else None

    if not user:
        raise HTTPException(status_code=404, detail="Демо-пользователь не найден")

    token = generate_signed_token(user["id"], user["role"], user["email"])
    return {
        "status": "ok",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "class_name": user["class_name"]
        },
        "token": token
    }


# --- Эндпоинты Заданий ---

@app.get("/api/tasks")
def list_tasks():
    return get_all_tasks()


@app.post("/api/tasks")
def create_task(data: TaskCreate, _: bool = Depends(require_teacher)):
    return add_task(data.subject, data.title, data.deadline, data.class_name)


# --- Эндпоинты Справок и Отсутствий ---

@app.get("/api/absences")
def list_absences(class_name: Optional[str] = None, student_name: Optional[str] = None):
    safe_class = sanitize_text(class_name, max_len=20) if class_name else None
    safe_student = sanitize_text(student_name, max_len=100) if student_name else None
    return get_all_absences(safe_class, safe_student)


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
def change_absence_status(absence_id: int, data: AbsenceStatusUpdate, _: bool = Depends(require_teacher)):
    update_absence_status(absence_id, data.status, data.rejection_reason or "")
    return {"status": "ok"}


# --- Эндпоинты Кружков и Заявок ---

@app.get("/api/clubs")
def list_clubs():
    return get_all_clubs()


@app.get("/api/clubs/applications")
def list_applications(club_id: Optional[int] = None, student_name: Optional[str] = None):
    safe_student = sanitize_text(student_name, max_len=100) if student_name else None
    return get_club_applications(club_id, safe_student)


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
def change_application_status(app_id: int, data: ClubApplicationStatusUpdate, _: bool = Depends(require_teacher)):
    update_club_application_status(app_id, data.status)
    return {"status": "ok"}


@app.post("/api/clubs")
def create_club(data: ClubCreate, _: bool = Depends(require_teacher)):
    return add_club(
        title=data.title,
        description=data.description,
        teacher_name=data.teacher_name,
        schedule=data.schedule,
        room=data.room,
        max_slots=data.max_slots
    )


@app.delete("/api/clubs/applications/{app_id}")
def cancel_application(app_id: int):
    ok = delete_club_application(app_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Заявление не найдено")
    return {"status": "ok"}


# --- Эндпоинты Демо-симуляции и Панели Жюри ---

@app.post("/api/demo/simulate-absence")
def simulate_absence_endpoint(class_name: Optional[str] = "9-А"):
    safe_class = sanitize_text(class_name, max_len=20) if class_name else "9-А"
    return simulate_random_absence(safe_class)


@app.post("/api/demo/simulate-club-application")
def simulate_club_application_endpoint():
    app_data = simulate_random_club_application()
    if not app_data:
        return {"status": "skipped", "message": "Все ученики уже имеют заявки или нет доступных кружков"}
    return {"status": "ok", "application": app_data}


@app.post("/api/demo/reset-db")
def reset_db_endpoint():
    reset_database()
    return {"status": "ok", "message": "База данных успешно сброшена к исходным демо-данным"}


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)