export type UserRole = 'teacher' | 'student';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  class_name: string;
}

export type AbsenceStatus = 'pending' | 'approved' | 'rejected';

export interface Absence {
  id: number;
  student_name: string;
  class_name: string;
  reason: string;
  dates: string;
  has_certificate: number | boolean;
  certificate_url?: string;
  status: AbsenceStatus;
  rejection_reason?: string;
  created_at?: string;
}

export interface Club {
  id: number;
  title: string;
  description: string;
  teacher_name: string;
  schedule: string;
  room: string;
  max_slots: number;
  taken_slots: number;
  enrolled?: number;
  capacity?: number;
}

export type ClubApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface ClubApplication {
  id: number;
  club_id: number;
  student_name: string;
  class_name: string;
  parent_name: string;
  parent_phone: string;
  status: ClubApplicationStatus;
  created_at?: string;
  club_title?: string;
  club_schedule?: string;
  club_room?: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  message: string;
  type?: ToastType;
}

export interface NotificationItem {
  id?: string;
  title: string;
  desc: string;
  time: string;
  type?: string;
  targetTab?: string;
  read?: boolean;
}

export interface StudentRosterItem {
  id: number;
  name: string;
  gender: string;
  birth: string;
  phone: string;
}

export interface AddAbsencePayload {
  student_name: string;
  reason: string;
  dates: string;
}

export interface CreateAbsencePayload {
  student_name: string;
  class_name: string;
  reason: string;
  dates: string;
  has_certificate?: boolean;
  certificate_url?: string;
}

export interface CreateClubPayload {
  title: string;
  description: string;
  teacher_name: string;
  schedule: string;
  room: string;
  max_slots?: number;
}

export interface ApplyClubPayload {
  club_id: number;
  student_name: string;
  class_name: string;
  parent_name: string;
  parent_phone: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  class_name: string;
}

export interface AuthResponse {
  status: string;
  user: User;
  token?: string;
}

export interface SimulatedClubAppResponse {
  status: 'ok' | 'skipped';
  message?: string;
  application?: {
    id: number;
    student_name: string;
    club_title: string;
    club_id: number;
    status: ClubApplicationStatus;
  };
}


export interface VKMiniAppAuthPayload {
  vk_user_id: number;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  class_name?: string;
  sign?: string;
  launch_params?: string;
}

