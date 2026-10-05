import io
import os
import math
from typing import Dict, Any, Optional

import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"

def _setup_fonts():
    global FONT_REGULAR, FONT_BOLD
    candidate_regular = [
        r"C:\Windows\Fonts\arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/TTF/DejaVuSans.ttf",
    ]
    candidate_bold = [
        r"C:\Windows\Fonts\arialbd.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
    ]

    for p in candidate_regular:
        if os.path.exists(p):
            try:
                pdfmetrics.registerFont(TTFont("CustomArial", p))
                FONT_REGULAR = "CustomArial"
                break
            except Exception:
                pass

    for p in candidate_bold:
        if os.path.exists(p):
            try:
                pdfmetrics.registerFont(TTFont("CustomArial-Bold", p))
                FONT_BOLD = "CustomArial-Bold"
                break
            except Exception:
                pass

_setup_fonts()


def generate_qr_image(url: str) -> ImageReader:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=1,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return ImageReader(buf)


def draw_official_stamp(c: canvas.Canvas, center_x: float, center_y: float, radius: float = 46):
    c.saveState()
    c.setStrokeColor(colors.HexColor("#1D4ED8"))
    c.setFillColor(colors.HexColor("#1D4ED8"))
    c.setLineWidth(1.8)

    # Внешняя и внутренняя окружности
    c.circle(center_x, center_y, radius, stroke=1, fill=0)
    c.setLineWidth(0.8)
    c.circle(center_x, center_y, radius - 4, stroke=1, fill=0)
    c.circle(center_x, center_y, radius - 16, stroke=1, fill=0)

    # Текст в центре печати
    c.setFont(FONT_BOLD, 7)
    c.drawCentredString(center_x, center_y + 4, "ДЛЯ СПРАВОК")
    c.setFont(FONT_REGULAR, 6)
    c.drawCentredString(center_x, center_y - 5, "И ДОКУМЕНТОВ")

    # Текст по кругу
    top_text = "ГБУЗ «ДГП № 42 ДЗМ» * МОСКВА *"
    c.setFont(FONT_BOLD, 5.5)
    chars = list(top_text)
    angle_step = 180 / max(len(chars), 1)
    start_angle = 180
    r_text = radius - 10
    for i, ch in enumerate(chars):
        ang = math.radians(start_angle - i * angle_step)
        x = center_x + r_text * math.cos(ang)
        y = center_y + r_text * math.sin(ang)
        c.drawString(x - 2, y - 2, ch)

    bottom_text = "* ОГРН 1037739000000 *"
    b_chars = list(bottom_text)
    b_step = 160 / max(len(b_chars), 1)
    for i, ch in enumerate(b_chars):
        ang = math.radians(350 - i * b_step)
        x = center_x + r_text * math.cos(ang)
        y = center_y + r_text * math.sin(ang)
        c.drawString(x - 2, y - 2, ch)

    c.restoreState()


def draw_ecp_stamp(c: canvas.Canvas, x: float, y: float, width: float = 240, height: float = 68):
    c.saveState()
    # Синяя рамка штампа ЭЦП
    c.setStrokeColor(colors.HexColor("#0284C7"))
    c.setFillColor(colors.HexColor("#F0F9FF"))
    c.setLineWidth(1.2)
    c.roundRect(x, y, width, height, 4, stroke=1, fill=1)

    c.setFillColor(colors.HexColor("#0369A1"))
    c.setFont(FONT_BOLD, 8)
    c.drawString(x + 10, y + height - 14, "ДОКУМЕНТ ПОДПИСАН ЭЛЕКТРОННОЙ ПОДПИСЬЮ")

    c.setStrokeColor(colors.HexColor("#BAE6FD"))
    c.setLineWidth(0.6)
    c.line(x + 8, y + height - 18, x + width - 8, y + height - 18)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont(FONT_REGULAR, 6.5)
    c.drawString(x + 10, y + height - 28, "Сертификат: 00E1 829C F471 A902 38D5 1294 E771 9400")
    c.drawString(x + 10, y + height - 38, "Владелец: ГБУЗ ДГП №42 ДЗМ / Смирнова Елена Викторовна")
    c.drawString(x + 10, y + height - 48, "Действителен: с 01.09.2026 по 01.09.2027")
    c.setFillColor(colors.HexColor("#059669"))
    c.setFont(FONT_BOLD, 6.5)
    c.drawString(x + 10, y + height - 58, "Подлинность ЭЦП подтверждена Минцифры РФ (УКЭП)")
    c.restoreState()


def generate_absence_pdf(absence: Dict[str, Any], base_url: str = "http://localhost:8000") -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # 1. Шапка медицинского учреждения (левый верхний угол)
    c.setFont(FONT_BOLD, 8)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(45, height - 45, "ГБУЗ «Детская городская поликлиника № 42 ДЗМ»")
    c.setFont(FONT_REGULAR, 7)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(45, height - 56, "117279, г. Москва, ул. Профсоюзная, д. 111 | Тел.: +7 (495) 123-45-67")
    c.drawString(45, height - 66, "ОГРН: 1037739000000 | Лицензия: ЛО-77-01-018900 от 14.04.2020 г.")

    # Код формы справа вверху
    c.setFont(FONT_REGULAR, 7)
    c.drawRightString(width - 45, height - 45, "Медицинская документация")
    c.setFont(FONT_BOLD, 7)
    c.drawRightString(width - 45, height - 56, "Форма № 095/у")
    c.setFont(FONT_REGULAR, 6.5)
    c.drawRightString(width - 45, height - 66, "Утверждена Минздравом РФ № 1030")

    # Горизонтальный разделитель
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setLineWidth(1)
    c.line(45, height - 76, width - 45, height - 76)

    # 2. Название документа
    doc_id = absence.get("id", 1)
    c.setFont(FONT_BOLD, 14)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(width / 2, height - 102, f"СПРАВКА № {doc_id:04d} / 2026")
    c.setFont(FONT_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#3B82F6"))
    c.drawCentredString(width / 2, height - 116, "О ВРЕМЕННОЙ НЕТРУДОСПОСОБНОСТИ УЧАЩЕГОСЯ")

    # 3. Основные поля справки
    start_y = height - 150
    line_spacing = 26

    def draw_field(label: str, val: str, y: float):
        c.setFont(FONT_REGULAR, 9)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawString(45, y, label)
        c.setFont(FONT_BOLD, 9.5)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(210, y, str(val))
        c.setStrokeColor(colors.HexColor("#E2E8F0"))
        c.setLineWidth(0.6)
        c.line(208, y - 4, width - 45, y - 4)

    student_name = absence.get("student_name", "Не указано")
    class_name = absence.get("class_name", "9-А")
    reason = absence.get("reason", "ОРВИ")
    dates = absence.get("dates", "01.10 - 05.10")
    status = absence.get("status", "pending")
    status_ru = "Одобрена классным руководителем" if status == "approved" else "На рассмотрении"

    draw_field("1. Фамилия, имя, отчество:", student_name, start_y)
    draw_field("2. Образовательное учреждение:", f"ГБОУ Школа № 1502 «Энергия», класс {class_name}", start_y - line_spacing)
    draw_field("3. Диагноз заболевания / причина:", reason, start_y - line_spacing * 2)
    draw_field("4. Контакт с инф. больными:", "Не контактировал(а)", start_y - line_spacing * 3)
    draw_field("5. Освобожден(а) от занятий:", f"с {dates}", start_y - line_spacing * 4)
    draw_field("6. К занятиям приступить:", "С первого учебного дня после окончания периода", start_y - line_spacing * 5)
    draw_field("7. Статус в системе «Сферум»:", status_ru, start_y - line_spacing * 6)

    # 4. Заключение врача
    diag_y = start_y - line_spacing * 7 - 12
    c.setFont(FONT_REGULAR, 8.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawString(45, diag_y, "Заключение врача: учащийся здоров, посещение занятий и физические нагрузки разрешены.")

    # 5. Разделитель перед подписями
    c.setStrokeColor(colors.HexColor("#E2E8F0"))
    c.line(45, diag_y - 20, width - 45, diag_y - 20)

    # 6. Штамп ЭЦП и Синяя Печать (слева и по центру)
    bottom_y = diag_y - 105
    draw_ecp_stamp(c, x=45, y=bottom_y, width=250, height=72)
    draw_official_stamp(c, center_x=345, center_y=bottom_y + 36, radius=42)

    # 7. QR-код верификации (справа)
    verify_url = f"{base_url}/api/verify-doc/{doc_id}"
    qr_img = generate_qr_image(verify_url)
    qr_size = 68
    qr_x = width - 45 - qr_size
    qr_y = bottom_y + 4
    c.drawImage(qr_img, qr_x, qr_y, width=qr_size, height=qr_size)

    c.setFont(FONT_REGULAR, 5.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(qr_x + qr_size / 2, qr_y - 8, "Проверка подлинности")
    c.drawCentredString(qr_x + qr_size / 2, qr_y - 15, "в реестре «Сферум»")

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.getvalue()
