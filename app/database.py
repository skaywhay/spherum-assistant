import sqlite3
import hashlib
from typing import List, Dict, Any, Optional

DB_PATH = "spherum.db"


def hash_password(password: str) -> str:
    """Хэширование пароля через SHA-256 с солью"""
    salt = "spherum_salt_2026"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()


def init_db():
    """Создание таблиц и начальных данных при первом старте сервиса"""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        
        # Пользователи системы (Учителя, Родители)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'teacher', -- 'teacher' или 'parent'
                class_name TEXT DEFAULT '9-А',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Задания
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject TEXT NOT NULL,
                title TEXT NOT NULL,
                deadline TEXT NOT NULL,
                class_name TEXT DEFAULT '9-А'
            )
        """)

        # Справки и заявления об отсутствии
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS absences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_name TEXT NOT NULL,
                class_name TEXT DEFAULT '9-А',
                reason TEXT NOT NULL,
                dates TEXT NOT NULL,
                has_certificate INTEGER DEFAULT 0,
                certificate_url TEXT DEFAULT '',
                status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
                rejection_reason TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Кружки и секции (Дополнительное образование)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS clubs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                teacher_name TEXT NOT NULL,
                schedule TEXT NOT NULL,
                room TEXT NOT NULL,
                max_slots INTEGER DEFAULT 15,
                taken_slots INTEGER DEFAULT 0
            )
        """)

        # Заявки в кружки
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS club_applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                club_id INTEGER NOT NULL,
                student_name TEXT NOT NULL,
                class_name TEXT NOT NULL,
                parent_name TEXT NOT NULL,
                parent_phone TEXT NOT NULL,
                status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (club_id) REFERENCES clubs(id)
            )
        """)

        conn.commit()

        # Создаем демо-пользователей по умолчанию, если база пустая
        create_demo_users(conn)
        create_demo_clubs(conn)


def create_demo_users(conn: sqlite3.Connection):
    """Инициализация 4 тестовых аккаунтов для жюри:
       2 классных руководителя (9-А и 10-Б) и 2 привязанных ученика
    """
    cursor = conn.cursor()
    demo_users = [
        # Учитель 1: 9-А класс
        ("teacher9a@sferum.ru", hash_password("password123"), "Смирнова Елена Викторовна", "teacher", "9-А"),
        # Учитель 2: 10-Б класс
        ("teacher10b@sferum.ru", hash_password("password123"), "Васильев Михаил Сергеевич", "teacher", "10-Б"),
        # Ученик 1: 9-А класс (привязан к Смирновой Е.В.)
        ("student9a@sferum.ru", hash_password("password123"), "Кузнецов Артём", "student", "9-А"),
        # Ученик 2: 10-Б класс (привязан к Васильеву М.С.)
        ("student10b@sferum.ru", hash_password("password123"), "Морозова София", "student", "10-Б"),
    ]
    for email, pwd, name, role, cls in demo_users:
        cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, role, class_name)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET 
                password_hash = excluded.password_hash,
                full_name = excluded.full_name,
                role = excluded.role,
                class_name = excluded.class_name
        """, (email, pwd, name, role, cls))
    
    # Добавляем стартовые справки от обоих учеников, если их еще нет
    cursor.execute("SELECT COUNT(*) FROM absences")
    if cursor.fetchone()[0] == 0:
        demo_absences = [
            ("Кузнецов Артём", "9-А", "ОРВИ, постельный режим (справка №402)", "23.09 - 27.09", 1, "pending"),
            ("Морозова София", "10-Б", "Участие в региональной олимпиаде", "25.09 - 26.09", 1, "pending")
        ]
        cursor.executemany("""
            INSERT INTO absences (student_name, class_name, reason, dates, has_certificate, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, demo_absences)

    # Добавляем стартовые заявки в кружки
    cursor.execute("SELECT COUNT(*) FROM club_applications")
    if cursor.fetchone()[0] == 0:
        demo_apps = [
            (1, "Кузнецов Артём", "9-А", "Кузнецова Ольга Николаевна", "+7 (999) 123-45-67", "pending"),
            (2, "Морозова София", "10-Б", "Морозов Дмитрий Игоревич", "+7 (999) 765-43-21", "pending")
        ]
        cursor.executemany("""
            INSERT INTO club_applications (club_id, student_name, class_name, parent_name, parent_phone, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, demo_apps)

    conn.commit()


def create_demo_clubs(conn: sqlite3.Connection):
    """Начальный каталог школьных кружков"""
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM clubs")
    count = cursor.fetchone()[0]
    if count == 0:
        demo_clubs = [
            ("Робототехника и БПЛА", "Сборка, схемотехника и пилотирование квадрокоптеров", "Иванов П.С.", "Вт, Чт 15:30", "Каб. 204", 15, 8),
            ("Олимпиадное программирование", "Алгоритмы, Python и подготовка к ВсОШ", "Смирнова Е.В.", "Пн, Ср 16:00", "Каб. 312", 12, 11),
            ("Шахматный клуб «Гамбит»", "Тактика, стратегия и участие в школьных турнирах", "Ковалев А.М.", "Пт 15:00", "Библиотека", 20, 14),
            ("Школьный медиацентр", "Журналистика, видеомонтаж и ведение канала Сферум", "Попова Д.А.", "Ср 15:00", "Каб. 108", 10, 6)
        ]
        cursor.executemany(
            "INSERT INTO clubs (title, description, teacher_name, schedule, room, max_slots, taken_slots) VALUES (?, ?, ?, ?, ?, ?, ?)",
            demo_clubs
        )
        conn.commit()


# --- Функции работы с пользователями ---

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT id, email, full_name, role, class_name, password_hash FROM users WHERE email = ?", (email.lower(),)).fetchone()
        return dict(row) if row else None


def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT id, email, full_name, role, class_name FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None


def create_user(email: str, password: str, full_name: str, role: str, class_name: str) -> Dict[str, Any]:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash, full_name, role, class_name) VALUES (?, ?, ?, ?, ?)",
            (email.lower(), hash_password(password), full_name, role, class_name)
        )
        conn.commit()
        return {
            "id": cursor.lastrowid,
            "email": email.lower(),
            "full_name": full_name,
            "role": role,
            "class_name": class_name
        }


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    user = get_user_by_email(email)
    if not user:
        return None
    if user["password_hash"] != hash_password(password):
        return None
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "class_name": user["class_name"]
    }


# --- Функции работы с заданиями ---

def get_all_tasks() -> List[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM tasks ORDER BY id DESC").fetchall()
        return [dict(row) for row in rows]


def add_task(subject: str, title: str, deadline: str, class_name: str = "9-А") -> Dict[str, Any]:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            "INSERT INTO tasks (subject, title, deadline, class_name) VALUES (?, ?, ?, ?)",
            (subject, title, deadline, class_name)
        )
        conn.commit()
        return {
            "id": cursor.lastrowid,
            "subject": subject,
            "title": title,
            "deadline": deadline,
            "class_name": class_name
        }


# --- Функции работы со справками ---

def get_all_absences(class_name: Optional[str] = None, student_name: Optional[str] = None) -> List[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        query = "SELECT * FROM absences WHERE 1=1"
        params = []
        if class_name:
            query += " AND class_name = ?"
            params.append(class_name)
        if student_name:
            query += " AND student_name = ?"
            params.append(student_name)
        query += " ORDER BY id DESC"
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]


def add_absence(student_name: str, reason: str, dates: str, has_certificate: bool, class_name: str = "9-А", certificate_url: str = "") -> Dict[str, Any]:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            """INSERT INTO absences 
               (student_name, reason, dates, has_certificate, class_name, certificate_url, status) 
               VALUES (?, ?, ?, ?, ?, ?, 'pending')""",
            (student_name, reason, dates, 1 if has_certificate else 0, class_name, certificate_url)
        )
        conn.commit()
        return {"id": cursor.lastrowid, "status": "ok"}


def update_absence_status(absence_id: int, status: str, rejection_reason: str = ""):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "UPDATE absences SET status = ?, rejection_reason = ? WHERE id = ?",
            (status, rejection_reason, absence_id)
        )
        conn.commit()


# --- Функции работы с кружками ---

def get_all_clubs() -> List[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            """SELECT id, title, description, teacher_name, schedule, room,
                      max_slots, taken_slots,
                      taken_slots AS enrolled, max_slots AS capacity
               FROM clubs ORDER BY id ASC"""
        ).fetchall()
        return [dict(row) for row in rows]


def get_club_applications(club_id: Optional[int] = None, student_name: Optional[str] = None) -> List[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        query = """
            SELECT ca.*, c.title as club_title, c.schedule as club_schedule, c.room as club_room 
            FROM club_applications ca
            JOIN clubs c ON ca.club_id = c.id
            WHERE 1=1
        """
        params = []
        if club_id:
            query += " AND ca.club_id = ?"
            params.append(club_id)
        if student_name:
            query += " AND ca.student_name = ?"
            params.append(student_name)
        query += " ORDER BY ca.id DESC"
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]


def add_club_application(club_id: int, student_name: str, class_name: str, parent_name: str, parent_phone: str) -> Dict[str, Any]:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            """INSERT INTO club_applications 
               (club_id, student_name, class_name, parent_name, parent_phone, status) 
               VALUES (?, ?, ?, ?, ?, 'pending')""",
            (club_id, student_name, class_name, parent_name, parent_phone)
        )
        conn.execute("UPDATE clubs SET taken_slots = taken_slots + 1 WHERE id = ?", (club_id,))
        conn.commit()
        return {"id": cursor.lastrowid, "status": "ok"}


def update_club_application_status(app_id: int, status: str):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("UPDATE club_applications SET status = ? WHERE id = ?", (status, app_id))
        conn.commit()