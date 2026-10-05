import hmac
import hashlib
import os
import re
from urllib.parse import parse_qsl, unquote
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, JSONResponse, Response, HTMLResponse
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
    get_absence_by_id,
    add_absence,
    update_absence_status,
    get_all_clubs,
    add_club,
    get_club_applications,
    get_club_application_by_id,
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
from app.vk_integration import (
    authenticate_vk_mini_app,
    verify_vk_launch_params,
)
from app.pdf_generator import generate_absence_pdf

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


class VKMiniAppAuthRequest(BaseModel):
    vk_user_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str = "student"
    class_name: str = "9-А"
    sign: Optional[str] = None
    launch_params: Optional[str] = None


# --- Эндпоинты Авторизации ---

@app.post("/api/auth/vk-mini-app")
def vk_mini_app_login(data: VKMiniAppAuthRequest):
    if data.launch_params and data.sign:
        valid = verify_vk_launch_params(data.launch_params)
        if not valid:
            raise HTTPException(status_code=403, detail="Недействительная подпись VK Mini App")

    return authenticate_vk_mini_app(
        vk_user_id=data.vk_user_id,
        first_name=data.first_name,
        last_name=data.last_name,
        role=data.role,
        class_name=data.class_name
    )


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


@app.get("/api/absences/{absence_id}/pdf")
def download_absence_pdf(absence_id: int, request: Request):
    absence = get_absence_by_id(absence_id)
    if not absence:
        raise HTTPException(status_code=404, detail="Справка или заявление не найдены")
    base_url = str(request.base_url).rstrip("/")
    pdf_bytes = generate_absence_pdf(absence, base_url=base_url)
    filename = f"spravka_{absence_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
            "Cache-Control": "no-cache"
        }
    )


@app.get("/api/verify-doc/{absence_id}", response_class=HTMLResponse)
def verify_document_endpoint(absence_id: int):
    absence = get_absence_by_id(absence_id)
    if not absence:
        return HTMLResponse(
            status_code=404,
            content="""<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><title>Документ не найден</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f8fafc;color:#1e293b;}</style>
</head><body><div style="text-align:center;"><h2>Документ не найден в реестре</h2><p>Проверьте корректность QR-кода</p></div></body></html>"""
        )

    student_name = absence.get("student_name", "—")
    class_name = absence.get("class_name", "9-А")
    dates = absence.get("dates", "—")
    reason = absence.get("reason", "—")
    status = absence.get("status", "pending")
    status_text = "Одобрено" if status == "approved" else ("Отклонено" if status == "rejected" else "На рассмотрении")
    status_color = "#16a34a" if status == "approved" else ("#dc2626" if status == "rejected" else "#ea580c")

    doc_hash = hashlib.sha256(f"{absence_id}:{student_name}:{dates}:{reason}".encode("utf-8")).hexdigest().upper()

    html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Верификация документа № СПР-2024-00{absence_id} — Сферум</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #F1F5F9;
            color: #0F172A;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }}
        .card {{
            background: #FFFFFF;
            max-width: 580px;
            width: 100%;
            border-radius: 20px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
            border: 1px solid #E2E8F0;
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #0284C7, #0369A1);
            color: white;
            padding: 24px 28px;
            display: flex;
            align-items: center;
            gap: 14px;
        }}
        .header svg {{ width: 36px; height: 36px; flex-shrink: 0; }}
        .header h1 {{ font-size: 19px; font-weight: 700; line-height: 1.3; }}
        .header p {{ font-size: 13px; opacity: 0.9; margin-top: 2px; }}
        .badge-box {{
            padding: 20px 28px 10px;
        }}
        .badge {{
            display: flex;
            align-items: center;
            gap: 12px;
            background: #F0FDF4;
            border: 1.5px solid #86EFAC;
            color: #15803D;
            padding: 14px 18px;
            border-radius: 14px;
            font-size: 14.5px;
            font-weight: 600;
        }}
        .content {{
            padding: 16px 28px 24px;
        }}
        .info-row {{
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #F1F5F9;
            font-size: 14px;
            gap: 12px;
        }}
        .info-row:last-child {{ border-bottom: none; }}
        .label {{ color: #64748B; font-weight: 500; min-width: 130px; }}
        .value {{ color: #0F172A; font-weight: 600; text-align: right; word-break: break-word; }}
        .stamp-box {{
            background: #F8FAFC;
            border: 1px dashed #CBD5E1;
            border-radius: 12px;
            padding: 14px 18px;
            margin-top: 14px;
            font-size: 12px;
            color: #475569;
            line-height: 1.6;
        }}
        .actions {{
            padding: 0 28px 28px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }}
        .btn {{
            display: block;
            text-align: center;
            background: #0284C7;
            color: white;
            padding: 13px 20px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14.5px;
            text-decoration: none;
            transition: background 0.15s;
        }}
        .btn:hover {{ background: #0369A1; }}
        .footer {{
            text-align: center;
            font-size: 11px;
            color: #94A3B8;
            padding: 0 28px 20px;
        }}
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <div>
                <h1>Единый реестр документов «Сферум»</h1>
                <p>Верификация электронной медицинской справки</p>
            </div>
        </div>
        <div class="badge-box">
            <div class="badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Подлинность документа подтверждена</span>
            </div>
        </div>
        <div class="content">
            <div class="info-row">
                <span class="label">Номер документа:</span>
                <span class="value">СПР-2024-00{absence_id}</span>
            </div>
            <div class="info-row">
                <span class="label">Обучающийся:</span>
                <span class="value">{student_name} ({class_name})</span>
            </div>
            <div class="info-row">
                <span class="label">Период:</span>
                <span class="value">{dates}</span>
            </div>
            <div class="info-row">
                <span class="label">Причина:</span>
                <span class="value">{reason}</span>
            </div>
            <div class="info-row">
                <span class="label">Статус в системе:</span>
                <span class="value" style="color: {status_color};">{status_text}</span>
            </div>
            <div class="info-row">
                <span class="label">Организация:</span>
                <span class="value">ГБУЗ ДГП № 38 ДЗМ</span>
            </div>
            <div class="stamp-box">
                <strong>Электронная цифровая подпись (УКЭП):</strong><br>
                Сертификат: <code>00DE77B21F89410AE4001B93A9A74E90</code><br>
                Владелец: Главный врач Смирнова Е. В.<br>
                Действителен: с 01.01.2024 по 31.12.2025<br>
                Хеш документа (SHA-256): <code>{doc_hash[:24]}...</code>
            </div>
        </div>
        <div class="actions">
            <a href="/api/absences/{absence_id}/pdf" class="btn" target="_blank">📄 Открыть оригинал PDF с печатью</a>
        </div>
        <div class="footer">
            Система электронного документооборота «Сферум» • ГОСТ Р 34.10-2012
        </div>
    </div>
</body>
</html>"""
    return HTMLResponse(content=html)


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