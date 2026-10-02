const API_BASE = '/api';

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password: password.trim() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Неверный логин или пароль');
  return data.user;
}

export async function register(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Ошибка регистрации');
  return data.user;
}

export async function getAbsences(className, studentName) {
  const params = new URLSearchParams();
  if (className) params.append('class_name', className);
  if (studentName) params.append('student_name', studentName);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/absences${query}`);
  if (!res.ok) throw new Error('Не удалось загрузить отсутствия');
  return res.json();
}

export async function createAbsence(payload) {
  const res = await fetch(`${API_BASE}/absences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Не удалось отправить справку');
  return res.json();
}

export async function updateAbsenceStatus(id, status, rejectionReason = '') {
  const res = await fetch(`${API_BASE}/absences/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, rejection_reason: rejectionReason }),
  });
  if (!res.ok) throw new Error('Не удалось обновить статус');
  return res.json();
}

export async function getClubs() {
  const res = await fetch(`${API_BASE}/clubs`);
  if (!res.ok) throw new Error('Не удалось загрузить кружки');
  return res.json();
}

export async function getClubApplications(clubId, studentName) {
  const params = new URLSearchParams();
  if (clubId) params.append('club_id', clubId);
  if (studentName) params.append('student_name', studentName);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/clubs/applications${query}`);
  if (!res.ok) throw new Error('Не удалось загрузить заявления');
  return res.json();
}

export async function applyClub(payload) {
  const res = await fetch(`${API_BASE}/clubs/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Не удалось подать заявление');
  return res.json();
}

export async function updateClubApplicationStatus(id, status) {
  const res = await fetch(`${API_BASE}/clubs/applications/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Не удалось обновить статус заявления');
  return res.json();
}
