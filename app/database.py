import sqlite3
from typing import List, Dict, Any, Optional
from app.security import hash_password, verify_password, sanitize_text

DB_PATH = "spherum.db"


def init_db():
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
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM clubs")
    count = cursor.fetchone()[0]
    if count == 0:
        demo_clubs = [
            ("Робототехника и БПЛА", "Сборка, схемотехника и пилотирование квадрокоптеров", "Васильев М.С.", "Вт, Чт 15:30", "Каб. 204", 15, 8),
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
    safe_name = sanitize_text(full_name, max_len=100)
    safe_role = "teacher" if role == "teacher" else "student"
    safe_class = sanitize_text(class_name, max_len=20)
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash, full_name, role, class_name) VALUES (?, ?, ?, ?, ?)",
            (email.lower().strip(), hash_password(password), safe_name, safe_role, safe_class)
        )
        conn.commit()
        return {
            "id": cursor.lastrowid,
            "email": email.lower().strip(),
            "full_name": safe_name,
            "role": safe_role,
            "class_name": safe_class
        }


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    user = get_user_by_email(email.strip())
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
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
    safe_name = sanitize_text(student_name, max_len=100)
    safe_reason = sanitize_text(reason, max_len=300)
    safe_dates = sanitize_text(dates, max_len=50)
    safe_class = sanitize_text(class_name, max_len=20)
    safe_cert_url = sanitize_text(certificate_url, max_len=300)
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            """INSERT INTO absences 
               (student_name, reason, dates, has_certificate, class_name, certificate_url, status) 
               VALUES (?, ?, ?, ?, ?, ?, 'pending')""",
            (safe_name, safe_reason, safe_dates, 1 if has_certificate else 0, safe_class, safe_cert_url)
        )
        conn.commit()
        return {"id": cursor.lastrowid, "status": "ok"}


def get_absence_by_id(absence_id: int) -> Optional[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT * FROM absences WHERE id = ?", (absence_id,)).fetchone()
        return dict(row) if row else None


def update_absence_status(absence_id: int, status: str, rejection_reason: str = ""):
    safe_status = status if status in ("approved", "rejected", "pending") else "pending"
    safe_rejection = sanitize_text(rejection_reason, max_len=300)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "UPDATE absences SET status = ?, rejection_reason = ? WHERE id = ?",
            (safe_status, safe_rejection, absence_id)
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
    safe_student = sanitize_text(student_name, max_len=100)
    safe_class = sanitize_text(class_name, max_len=20)
    safe_parent = sanitize_text(parent_name, max_len=100)
    safe_phone = sanitize_text(parent_phone, max_len=30)
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            """INSERT INTO club_applications 
               (club_id, student_name, class_name, parent_name, parent_phone, status) 
               VALUES (?, ?, ?, ?, ?, 'pending')""",
            (club_id, safe_student, safe_class, safe_parent, safe_phone)
        )
        conn.execute("UPDATE clubs SET taken_slots = taken_slots + 1 WHERE id = ?", (club_id,))
        conn.commit()
        return {"id": cursor.lastrowid, "status": "ok"}


def get_club_application_by_id(app_id: int) -> Optional[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("""
            SELECT ca.*, c.title as club_title, c.schedule as club_schedule, c.room as club_room 
            FROM club_applications ca
            JOIN clubs c ON ca.club_id = c.id
            WHERE ca.id = ?
        """, (app_id,)).fetchone()
        return dict(row) if row else None


def update_club_application_status(app_id: int, status: str):
    safe_status = status if status in ("approved", "rejected", "pending") else "pending"
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("UPDATE club_applications SET status = ? WHERE id = ?", (safe_status, app_id))
        conn.commit()


def add_club(title: str, description: str, teacher_name: str, schedule: str, room: str, max_slots: int = 15) -> Dict[str, Any]:
    safe_title = sanitize_text(title, max_len=120)
    safe_desc = sanitize_text(description, max_len=500)
    safe_teacher = sanitize_text(teacher_name, max_len=100)
    safe_sch = sanitize_text(schedule, max_len=100)
    safe_room = sanitize_text(room, max_len=50)
    safe_slots = max(1, min(max_slots, 100))
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            """INSERT INTO clubs (title, description, teacher_name, schedule, room, max_slots, taken_slots)
               VALUES (?, ?, ?, ?, ?, ?, 0)""",
            (safe_title, safe_desc, safe_teacher, safe_sch, safe_room, safe_slots)
        )
        conn.commit()
        return {"id": cursor.lastrowid, "title": safe_title}


def delete_club_application(app_id: int) -> bool:
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute("SELECT club_id, status FROM club_applications WHERE id = ?", (app_id,)).fetchone()
        if not row:
            return False
        club_id, status = row
        conn.execute("DELETE FROM club_applications WHERE id = ?", (app_id,))
        conn.execute("UPDATE clubs SET taken_slots = MAX(0, taken_slots - 1) WHERE id = ?", (club_id,))
        conn.commit()
        return True


def reset_database():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS club_applications")
        cursor.execute("DROP TABLE IF EXISTS clubs")
        cursor.execute("DROP TABLE IF EXISTS absences")
        cursor.execute("DROP TABLE IF EXISTS tasks")
        cursor.execute("DROP TABLE IF EXISTS users")
        conn.commit()
    init_db()


STUDENT_ROSTER_9A = [
    "Кузнецов Артём", "Алексеева Дарья", "Борисов Иван", "Васильева Полина",
    "Григорьев Максим", "Дмитриева Анна", "Егоров Кирилл", "Жукова Екатерина",
    "Зайцев Роман", "Иванова Софья", "Ковалёв Денис", "Лебедева Мария",
    "Макаров Михаил", "Никитина Алиса", "Орлов Даниил", "Павлова Виктория",
    "Романов Владислав", "Семенова Ксения", "Тарасов Арсений", "Устинова Вероника",
    "Федоров Егор", "Харитонова Анастасия", "Цветков Богдан", "Чернова Елизавета",
    "Шапошников Глеб", "Щербакова Варвара", "Юдин Сергей", "Яковлева Милана"
]

ABSENCE_REASONS = [
    ("ОРВИ, температура 38.4°C (справка поликлиники №42)", "26.09 - 29.09"),
    ("Острый ринофарингит, амбулаторный режим (форма 095/у)", "27.09 - 01.10"),
    ("По семейным обстоятельствам (заявление родителей)", "26.09 - 26.09"),
    ("Участие во Всероссийской олимпиаде по математике (ВсОШ)", "28.09 - 29.09"),
    ("Освобождение дежурного администратора (талон №89)", "26.09 - 26.09"),
    ("Приём у врача-офтальмолога в ДГП №42", "27.09 - 27.09"),
    ("Обострение аллергического ринита (справка врача)", "26.09 - 28.09"),
    ("Участие в региональном шахматном турнире «Белая ладья»", "29.09 - 30.09"),
]


def simulate_random_absence(class_name: str = "9-А") -> Dict[str, Any]:
    import random
    student = random.choice(STUDENT_ROSTER_9A)
    reason, dates = random.choice(ABSENCE_REASONS)
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            """INSERT INTO absences (student_name, class_name, reason, dates, has_certificate, status)
               VALUES (?, ?, ?, ?, 1, 'pending')""",
            (student, class_name, reason, dates)
        )
        conn.commit()
        return {
            "id": cursor.lastrowid,
            "student_name": student,
            "class_name": class_name,
            "reason": reason,
            "dates": dates,
            "status": "pending"
        }


def simulate_random_club_application() -> Optional[Dict[str, Any]]:
    import random
    student = random.choice(STUDENT_ROSTER_9A)
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        clubs = conn.execute("SELECT id, title FROM clubs").fetchall()
        if not clubs:
            return None
        club = random.choice(clubs)
        existing = conn.execute(
            "SELECT id FROM club_applications WHERE club_id = ? AND student_name = ?",
            (club["id"], student)
        ).fetchone()
        if existing:
            return None
        cursor = conn.execute(
            """INSERT INTO club_applications 
               (club_id, student_name, class_name, parent_name, parent_phone, status)
               VALUES (?, ?, '9-А', 'Родитель ' || ?, '+7 (999) ' || (100 + abs(random() % 900)) || '-' || (10 + abs(random() % 90)) || '-' || (10 + abs(random() % 90)), 'pending')""",
            (club["id"], student, student.split()[0])
        )
        conn.execute("UPDATE clubs SET taken_slots = taken_slots + 1 WHERE id = ?", (club["id"],))
        conn.commit()
        return {
            "id": cursor.lastrowid,
            "student_name": student,
            "club_title": club["title"],
            "club_id": club["id"],
            "status": "pending"
        }