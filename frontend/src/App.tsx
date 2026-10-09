import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Toast from './components/Toast';
import JuryPanel from './components/JuryPanel';
import NotificationPopup from './components/NotificationPopup';
import AuthPage from './pages/AuthPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { login, quickLogin, simulateAbsence, getAbsences, getClubApplications } from './api';
import type { Absence, ClubApplication, NotificationItem, ToastMessage, ToastType, User } from './types';

export default function App(): React.JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('sferum_user');
      if (!saved) return null;
      const parsed: unknown = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && 'id' in parsed && 'email' in parsed) {
        return parsed as User;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);

  const [absences, setAbsences] = useState<Absence[]>([]);
  const [applications, setApplications] = useState<ClubApplication[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info'): void => {
    setToast({ message, type });
  }, []);

  const triggerRefresh = useCallback((): void => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setAbsences([]);
      setApplications([]);
      return;
    }

    let failureCount = 0;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;

    const poll = async () => {
      // 1. Page Visibility API: предотвращение троттлинга и запросов из фоновых вкладок
      if (document.hidden) {
        timerId = setTimeout(poll, 4000);
        return;
      }

      try {
        const [abs, apps] = await Promise.all([
          getAbsences(currentUser.class_name),
          getClubApplications(),
        ]);
        if (isCancelled) return;
        failureCount = 0;
        setAbsences(abs || []);
        if (currentUser.role === 'teacher') {
          setApplications(apps || []);
        } else {
          setApplications(
            (apps || []).filter(
              (a) => a.student_name.trim().toLowerCase() === currentUser.full_name.trim().toLowerCase()
            )
          );
        }
      } catch (err) {
        failureCount++;
        console.warn(`[Sync] Ошибка фоновой синхронизации (попытка ${failureCount}):`, err);
      }

      if (!isCancelled) {
        // Экспоненциальный backoff: при стабильной сети 3.5с, при сбоях мобильного Wi-Fi плавно растет до 20с
        const nextDelay = failureCount === 0 ? 3500 : Math.min(3500 * Math.pow(1.5, failureCount), 20000);
        timerId = setTimeout(poll, nextDelay);
      }
    };

    poll();

    const handleVisibility = () => {
      if (!document.hidden && !isCancelled) {
        poll();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentUser, refreshKey]);

  const handleLoginSuccess = (user: User): void => {
    setCurrentUser(user);
    localStorage.setItem('sferum_user', JSON.stringify(user));
    showToast(`Добро пожаловать, ${user.full_name}!`, 'success');
  };

  const handleLogout = (): void => {
    localStorage.removeItem('sferum_user');
    localStorage.removeItem('sferum_token');
    setCurrentUser(null);
    showToast('Вы вышли из системы', 'info');
  };

  const handleSwitchUser = async (email: string, pass?: string): Promise<void> => {
    try {
      const user = pass ? await login(email, pass) : await quickLogin(undefined, email);
      handleLoginSuccess(user);
      triggerRefresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка смены профиля';
      showToast(errorMsg, 'error');
    }
  };

  useEffect(() => {
    if (!autoSimulate) return;

    const timer = setInterval(async () => {
      try {
        const cls = currentUser?.class_name || '9-А';
        const res = await simulateAbsence(cls);
        showToast(
          `⚡ Входящая справка: ${res.student_name} (${res.class_name}) — ${res.reason}`,
          'info'
        );
        triggerRefresh();
      } catch {
        // Silently skip if network momentarily drops
      }
    }, 45000);

    return () => clearInterval(timer);
  }, [autoSimulate, currentUser?.class_name, showToast, triggerRefresh]);

  const isTeacher = currentUser?.role === 'teacher';
  const pendingAbsences = isTeacher
    ? absences.filter((a) => a.status === 'pending')
    : [];
  const pendingApps = isTeacher
    ? applications.filter((a) => a.status === 'pending')
    : [];

  const studentApprovedAbs = !isTeacher
    ? absences.filter((a) => a.status === 'approved')
    : [];
  const studentApprovedApps = !isTeacher
    ? applications.filter((a) => a.status === 'approved')
    : [];

  const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!currentUser?.id) {
      setSeenIds(new Set());
      return;
    }
    try {
      const raw = localStorage.getItem(`sferum_seen_notifications_${currentUser.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSeenIds(new Set(parsed));
          return;
        }
      }
    } catch {
      // fallback
    }
    setSeenIds(new Set());
  }, [currentUser?.id]);

  const markNotificationsSeen = useCallback((idsToMark: string[]): void => {
    if (!currentUser?.id || idsToMark.length === 0) return;
    setSeenIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const id of idsToMark) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      if (changed) {
        try {
          localStorage.setItem(
            `sferum_seen_notifications_${currentUser.id}`,
            JSON.stringify(Array.from(next))
          );
        } catch {
          // ignore
        }
        return next;
      }
      return prev;
    });
  }, [currentUser?.id]);

  const headerNotifications: NotificationItem[] = isTeacher
    ? [
      ...pendingAbsences.map((a) => {
        const id = `abs_${a.id}_${a.status}`;
        return {
          id,
          title: `Справка: ${a.student_name}`,
          desc: a.reason,
          time: a.dates,
          read: seenIds.has(id),
        };
      }),
      ...pendingApps.map((a) => {
        const id = `app_${a.id}_${a.status}`;
        return {
          id,
          title: `Заявка в кружок: ${a.student_name}`,
          desc: a.class_name,
          time: 'Новое',
          read: seenIds.has(id),
        };
      }),
    ]
    : [
      ...studentApprovedAbs.map((a) => {
        const id = `abs_${a.id}_${a.status}`;
        return {
          id,
          title: 'Справка одобрена учителем',
          desc: a.reason,
          time: a.dates,
          read: seenIds.has(id),
        };
      }),
      ...studentApprovedApps.map((a) => {
        const id = `app_${a.id}_${a.status}`;
        return {
          id,
          title: 'Зачисление в секцию подтверждено',
          desc: a.club_title || 'Кружок',
          time: 'Зачислен',
          read: seenIds.has(id),
        };
      }),
    ];

  const handleMarkAllRead = useCallback((): void => {
    const allIds = headerNotifications
      .map((n) => n.id)
      .filter((id): id is string => Boolean(id));
    markNotificationsSeen(allIds);
  }, [headerNotifications, markNotificationsSeen]);

  const unreadCount = headerNotifications.filter((n) => !n.id || !seenIds.has(n.id)).length;

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-slate-800 flex flex-col font-sans relative">
      {currentUser && (
        <Header
          user={currentUser}
          onLogout={handleLogout}
          unreadCount={unreadCount}
          notifications={headerNotifications}
          onMarkAllRead={handleMarkAllRead}
        />
      )}

      <main className="flex-1 pb-16">
        {!currentUser && (
          <AuthPage onLoginSuccess={handleLoginSuccess} showToast={showToast} />
        )}

        {currentUser && currentUser.role === 'teacher' && (
          <TeacherDashboard
            user={currentUser}
            showToast={showToast}
            refreshTrigger={refreshKey}
          />
        )}

        {currentUser && currentUser.role !== 'teacher' && (
          <StudentDashboard
            user={currentUser}
            showToast={showToast}
            refreshTrigger={refreshKey}
          />
        )}
      </main>

      {currentUser && (
        <NotificationPopup
          user={currentUser}
          absences={absences}
          applications={applications}
          seenIds={seenIds}
          onMarkSeen={markNotificationsSeen}
          onDismiss={handleMarkAllRead}
        />
      )}

      <JuryPanel
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onDataChanged={triggerRefresh}
        showToast={showToast}
        autoSimulate={autoSimulate}
        setAutoSimulate={setAutoSimulate}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
