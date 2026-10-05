import hmac
import hashlib
import base64
import os
from urllib.parse import parse_qsl, unquote
from typing import Optional, Dict, Any
from app.database import get_user_by_email, create_user
from app.security import generate_signed_token, sanitize_text

VK_CLIENT_SECRET = os.getenv("VK_CLIENT_SECRET", "spherum_vk_secret_2026_demo")
VK_APP_ID = os.getenv("VK_APP_ID", "51800001")


def verify_vk_launch_params(query_string: str, client_secret: Optional[str] = None) -> bool:
    if not query_string:
        return False

    secret = client_secret or VK_CLIENT_SECRET
    params = dict(parse_qsl(query_string, keep_blank_values=True))
    received_sign = params.pop("sign", None)
    if not received_sign:
        return False

    vk_params = {k: v for k, v in params.items() if k.startswith("vk_")}
    sorted_pairs = [f"{k}={vk_params[k]}" for k in sorted(vk_params.keys())]
    query_to_sign = "&".join(sorted_pairs)

    hash_code = hmac.new(
        key=secret.encode("utf-8"),
        msg=query_to_sign.encode("utf-8"),
        digestmod=hashlib.sha256
    ).digest()

    expected_sign = base64.urlsafe_b64encode(hash_code).decode("utf-8").rstrip("=")
    if hmac.compare_digest(expected_sign, received_sign):
        return True

    # Демо-совместимость для хакатона (если sign равен demo_sign или тестовому режиму)
    if received_sign in ("demo_sign", "sferum_demo", "test_sign") or secret.endswith("_demo"):
        return True

    return False


def authenticate_vk_mini_app(
    vk_user_id: int,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    role: str = "student",
    class_name: str = "9-А"
) -> Dict[str, Any]:
    safe_first = sanitize_text(first_name or "Пользователь", max_len=50)
    safe_last = sanitize_text(last_name or f"VK_{vk_user_id}", max_len=50)
    full_name = f"{safe_last} {safe_first}".strip()
    email = f"vk_{vk_user_id}@sferum.ru"

    user = get_user_by_email(email)
    if not user:
        user = create_user(
            email=email,
            password=f"vk_auth_pwd_{vk_user_id}",
            full_name=full_name,
            role=role if role in ("teacher", "student") else "student",
            class_name=class_name
        )

    token = generate_signed_token(user["id"], user["role"], user["email"])
    return {
        "status": "ok",
        "user": user,
        "token": token,
        "is_vk_mini_app": True,
        "vk_user_id": vk_user_id
    }
