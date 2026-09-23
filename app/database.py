import sqlite3
from typing import List, Dict, Any

DB_PATH = "spherum.db"


def init_db():
    """Создание таблиц при первом старте сервиса"""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject TEXT NOT NULL,
                title TEXT NOT NULL,
                deadline TEXT NOT NULL,
                class_name TEXT DEFAULT '9-А'
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS absences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_name TEXT NOT NULL,
                reason TEXT NOT NULL,
                dates TEXT NOT NULL,
                has_certificate INTEGER DEFAULT 0
            )
        """)
        conn.commit()


def get_all_tasks() -> List[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM tasks ORDER BY id DESC").fetchall()
        return [dict(row) for row in rows]


def add_task(subject: str, title: str, deadline: str) -> Dict[str, Any]:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            "INSERT INTO tasks (subject, title, deadline) VALUES (?, ?, ?)",
            (subject, title, deadline)
        )
        conn.commit()
        return {
            "id": cursor.lastrowid,
            "subject": subject,
            "title": title,
            "deadline": deadline,
            "class_name": "9-А"
        }


def get_all_absences() -> List[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM absences ORDER BY id DESC").fetchall()
        return [dict(row) for row in rows]


def add_absence(student_name: str, reason: str, dates: str, has_certificate: bool):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO absences (student_name, reason, dates, has_certificate) VALUES (?, ?, ?, ?)",
            (student_name, reason, dates, 1 if has_certificate else 0)
        )
        conn.commit()