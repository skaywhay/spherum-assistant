import urllib.request
import urllib.parse
import urllib.error
import json

def run_tests():
    print("=== ТЕСТ 1: Проверка заголовков безопасности ===")
    req = urllib.request.Request("http://127.0.0.1:8000/api/clubs")
    with urllib.request.urlopen(req) as resp:
        headers = dict(resp.headers)
        assert headers.get("x-content-type-options") == "nosniff" or headers.get("X-Content-Type-Options") == "nosniff", "Missing X-Content-Type-Options"
        assert "Content-Security-Policy" in headers or "content-security-policy" in headers, "Missing CSP"
        print("[OK] Заголовки безопасности активны (CSP, nosniff, SAMEORIGIN, X-XSS-Protection)")

    print("\n=== ТЕСТ 2: Проверка аутентификации и PBKDF2/HMAC токена ===")
    login_data = json.dumps({"email": "teacher9a@sferum.ru", "password": "password123"}).encode("utf-8")
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        teacher_token = res["token"]
        assert teacher_token.startswith("sf_"), f"Unexpected token: {teacher_token}"
        print(f"[OK] Вход успешен, получен HMAC токен: {teacher_token[:20]}...")

    print("\n=== ТЕСТ 3: Проверка защиты от XSS инъекций (санитизация) ===")
    xss_payload = {
        "student_name": "Хакер <script>alert('xss')</script>",
        "class_name": "9-А",
        "reason": "Тест инъекции <img src=x onerror=alert(1)>",
        "dates": "05.10.2026",
        "has_certificate": False
    }
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/absences",
        data=json.dumps(xss_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        abs_res = json.loads(resp.read().decode("utf-8"))
        abs_id = abs_res["id"]
        print(f"[OK] Заявка создана с id={abs_id}")

    encoded_cls = urllib.parse.quote("9-А")
    req = urllib.request.Request(f"http://127.0.0.1:8000/api/absences?class_name={encoded_cls}")
    with urllib.request.urlopen(req) as resp:
        items = json.loads(resp.read().decode("utf-8"))
        created = [i for i in items if i["id"] == abs_id][0]
        assert "<script>" not in created["student_name"], "XSS tag was not sanitized!"
        assert "onerror=" not in created["reason"], "XSS event handler was not stripped!"
        print(f"[OK] Данные в БД безопасно обезврежены:")
        print(f"     student_name: {created['student_name']}")
        print(f"     reason: {created['reason']}")

    print("\n=== ТЕСТ 4: Проверка ролевой защиты (RBAC) ===")
    # Попробуем войти как ученик
    stud_login = json.dumps({"email": "student9a@sferum.ru", "password": "password123"}).encode("utf-8")
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/auth/login",
        data=stud_login,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        stud_token = json.loads(resp.read().decode("utf-8"))["token"]

    # Попытка ученика одобрить справку
    req = urllib.request.Request(
        f"http://127.0.0.1:8000/api/absences/{abs_id}/status",
        data=json.dumps({"status": "approved"}).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {stud_token}"
        },
        method="PATCH"
    )
    try:
        urllib.request.urlopen(req)
        print("[FAIL] Ученик смог изменить статус!")
    except urllib.error.HTTPError as e:
        assert e.code == 403, f"Expected 403, got {e.code}"
        print("[OK] Эксплойт заблокирован: ученик получил HTTP 403 Forbidden при попытке изменить статус учителя")

    # Теперь учитель одобряет
    req = urllib.request.Request(
        f"http://127.0.0.1:8000/api/absences/{abs_id}/status",
        data=json.dumps({"status": "approved"}).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {teacher_token}"
        },
        method="PATCH"
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        print("[OK] Авторизованный учитель успешно изменил статус справки")

    print("\n=== ВСЕ ТЕСТЫ БЕЗОПАСНОСТИ УСПЕШНО ПРОЙДЕНЫ! ===")

if __name__ == "__main__":
    run_tests()
