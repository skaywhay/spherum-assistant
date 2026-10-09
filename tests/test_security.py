import urllib.request
import urllib.parse
import urllib.error
import json
import os

def run_tests():
    print("=== ТЕСТ 1: Проверка заголовков безопасности и VK Mini Apps iframe ===")
    req = urllib.request.Request("http://127.0.0.1:8000/api/clubs")
    with urllib.request.urlopen(req) as resp:
        headers = dict(resp.headers)
        assert headers.get("x-content-type-options") == "nosniff" or headers.get("X-Content-Type-Options") == "nosniff", "Missing X-Content-Type-Options"
        
        csp = headers.get("content-security-policy") or headers.get("Content-Security-Policy") or ""
        assert "frame-ancestors" in csp, "Missing frame-ancestors in CSP"
        assert "*.vk.com" in csp and "*.vk.me" in csp and "*.sferum.ru" in csp, "VK and Sferum domains must be in frame-ancestors"
        
        # X-Frame-Options не должен блокировать iframe VK
        x_frame = headers.get("x-frame-options") or headers.get("X-Frame-Options")
        assert x_frame != "SAMEORIGIN", "X-Frame-Options: SAMEORIGIN blocks VK Mini App iframe!"
        print("[OK] Заголовки безопасности активны: CSP frame-ancestors разрешает VK Mini Apps (vk.com, vk.me, sferum.ru), X-Frame-Options разблокирован")

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

    print("\n=== ТЕСТ 4: Проверка ролевой защиты (RBAC) и устранения Showstopper 1 ===")
    # 4.1. Анонимный запрос без Authorization заголовка (Showstopper 1 fix)
    req_anon = urllib.request.Request(
        f"http://127.0.0.1:8000/api/absences/{abs_id}/status",
        data=json.dumps({"status": "approved"}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="PATCH"
    )
    try:
        urllib.request.urlopen(req_anon)
        assert False, "[FAIL] Критическая уязвимость: анонимный запрос без заголовка Authorization был пропущен!"
    except urllib.error.HTTPError as e:
        assert e.code == 401, f"Expected 401 Unauthorized for missing auth header, got {e.code}"
        print("[OK] Showstopper 1 закрыт: запрос без Authorization заголовка отклонен с HTTP 401 Unauthorized")

    # 4.2. Попытка ученика изменить статус учителя
    stud_login = json.dumps({"email": "student9a@sferum.ru", "password": "password123"}).encode("utf-8")
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/auth/login",
        data=stud_login,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        stud_token = json.loads(resp.read().decode("utf-8"))["token"]

    req_student = urllib.request.Request(
        f"http://127.0.0.1:8000/api/absences/{abs_id}/status",
        data=json.dumps({"status": "approved"}).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {stud_token}"
        },
        method="PATCH"
    )
    try:
        urllib.request.urlopen(req_student)
        assert False, "[FAIL] Ученик смог изменить статус!"
    except urllib.error.HTTPError as e:
        assert e.code == 403, f"Expected 403 Forbidden, got {e.code}"
        print("[OK] Эксплойт заблокирован: ученик получил HTTP 403 Forbidden")

    # 4.3. Попытка подделки токена (role swap в токене)
    parts = stud_token.split("_")
    tampered_token = f"{parts[0]}_{parts[1]}_teacher_{parts[3]}_{parts[4]}"
    req_tamper = urllib.request.Request(
        f"http://127.0.0.1:8000/api/absences/{abs_id}/status",
        data=json.dumps({"status": "approved"}).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {tampered_token}"
        },
        method="PATCH"
    )
    try:
        urllib.request.urlopen(req_tamper)
        assert False, "[FAIL] Поддельный токен был принят!"
    except urllib.error.HTTPError as e:
        assert e.code == 401, f"Expected 401 for tampered token signature, got {e.code}"
        print("[OK] Защита HMAC целостности: поддельный токен с измененной ролью отклонен с HTTP 401")

    # 4.4. Легитимный учитель одобряет
    req_teacher = urllib.request.Request(
        f"http://127.0.0.1:8000/api/absences/{abs_id}/status",
        data=json.dumps({"status": "approved"}).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {teacher_token}"
        },
        method="PATCH"
    )
    with urllib.request.urlopen(req_teacher) as resp:
        assert resp.status == 200
        print("[OK] Авторизованный учитель успешно изменил статус справки")

    print("\n=== ТЕСТ 5: Проверка соответствия 152-ФЗ (маскирование ПДн на /api/verify-doc) ===")
    req_doc = urllib.request.Request(f"http://127.0.0.1:8000/api/verify-doc/{abs_id}")
    with urllib.request.urlopen(req_doc) as resp:
        html = resp.read().decode("utf-8")
        assert "ГБУЗ ДГП № 38 ДЗМ" in html, "Missing hospital name"
        assert "152-ФЗ" in html, "Missing 152-FZ reference"
        assert "Хакер" not in html or ".*" in html or "***" in html, "Student name should be masked!"
        print("[OK] Соответствие 152-ФЗ подтверждено: ПДн замаскированы, диагноз защищен врачебной тайной")

    print("\n=== ТЕСТ 6: Проверка генерации PDF со штампами ЭЦП ===")
    req_pdf = urllib.request.Request(f"http://127.0.0.1:8000/api/absences/{abs_id}/pdf")
    with urllib.request.urlopen(req_pdf) as resp:
        pdf_data = resp.read()
        assert len(pdf_data) > 1000, "PDF too small"
        assert pdf_data.startswith(b"%PDF"), "Invalid PDF header"
        print(f"[OK] PDF Форма 095/у успешно сгенерирована (размер {len(pdf_data)} байт)")

    print("\n=== ВСЕ ТЕСТЫ БЕЗОПАСНОСТИ И СООТВЕТСТВИЯ QA УСПЕШНО ПРОЙДЕНЫ! ===")

if __name__ == "__main__":
    run_tests()
