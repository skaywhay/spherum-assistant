import type {
  User,
  Absence,
  AbsenceStatus,
  Club,
  ClubApplication,
  ClubApplicationStatus,
  CreateAbsencePayload,
  CreateClubPayload,
  ApplyClubPayload,
  RegisterPayload,
  AuthResponse,
  SimulatedClubAppResponse,
  VKMiniAppAuthPayload,
} from './types';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('sferum_token');
  if (token) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }
  return { 'Content-Type': 'application/json' };
}

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password: password.trim() }),
  });
  const data: AuthResponse & { detail?: string } = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Неверный логин или пароль');
  if (data.token) {
    localStorage.setItem('sferum_token', data.token);
  }
  return data.user;
}

export async function register(userData: RegisterPayload): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data: AuthResponse & { detail?: string } = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Ошибка регистрации');
  if (data.token) {
    localStorage.setItem('sferum_token', data.token);
  }
  return data.user;
}

export async function getAbsences(className?: string, studentName?: string): Promise<Absence[]> {
  const params = new URLSearchParams();
  if (className) params.append('class_name', className);
  if (studentName) params.append('student_name', studentName);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/absences${query}`);
  if (!res.ok) throw new Error('Не удалось загрузить отсутствия');
  return res.json();
}

export async function createAbsence(payload: CreateAbsencePayload): Promise<{ id: number; status: string }> {
  const res = await fetch(`${API_BASE}/absences`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Не удалось отправить справку');
  return res.json();
}

export async function updateAbsenceStatus(
  id: number,
  status: AbsenceStatus,
  rejectionReason: string = ''
): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/absences/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, rejection_reason: rejectionReason }),
  });
  if (!res.ok) throw new Error('Не удалось обновить статус');
  return res.json();
}

export async function getClubs(): Promise<Club[]> {
  const res = await fetch(`${API_BASE}/clubs`);
  if (!res.ok) throw new Error('Не удалось загрузить кружки');
  return res.json();
}

export async function createClub(payload: CreateClubPayload): Promise<{ id: number; title: string }> {
  const res = await fetch(`${API_BASE}/clubs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Не удалось создать кружок');
  return res.json();
}

export async function getClubApplications(
  clubId?: number,
  studentName?: string
): Promise<ClubApplication[]> {
  const params = new URLSearchParams();
  if (clubId) params.append('club_id', String(clubId));
  if (studentName) params.append('student_name', studentName);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/clubs/applications${query}`);
  if (!res.ok) throw new Error('Не удалось загрузить заявления');
  return res.json();
}

export async function applyClub(payload: ApplyClubPayload): Promise<{ id: number; status: string }> {
  const res = await fetch(`${API_BASE}/clubs/apply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Не удалось подать заявление');
  return res.json();
}

export async function updateClubApplicationStatus(
  id: number,
  status: ClubApplicationStatus
): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/clubs/applications/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Не удалось обновить статус заявления');
  return res.json();
}

export async function cancelClubApplication(id: number): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/clubs/applications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не удалось отозвать заявление');
  return res.json();
}

export async function simulateAbsence(className: string = '9-А'): Promise<Absence> {
  const res = await fetch(`${API_BASE}/demo/simulate-absence?class_name=${encodeURIComponent(className)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Ошибка симуляции справки');
  return res.json();
}

export async function simulateClubApplication(): Promise<SimulatedClubAppResponse> {
  const res = await fetch(`${API_BASE}/demo/simulate-club-application`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Ошибка симуляции заявки');
  return res.json();
}

export async function resetDatabase(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/demo/reset-db`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Ошибка сброса данных');
  return res.json();
}

export function getAbsencePdfUrl(id: number): string {
  return `${API_BASE}/absences/${id}/pdf`;
}

export function getDocVerificationUrl(id: number): string {
  return `${API_BASE}/verify-doc/${id}`;
}

export async function vkMiniAppLogin(payload: VKMiniAppAuthPayload): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/vk-mini-app`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data: AuthResponse & { detail?: string } = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Ошибка авторизации через VK');
  if (data.token) {
    localStorage.setItem('sferum_token', data.token);
  }
  return data.user;
}


