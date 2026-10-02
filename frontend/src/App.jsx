import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Toast from './components/Toast';
import JuryPanel from './components/JuryPanel';
import NotificationPopup from './components/NotificationPopup';
import AuthPage from './pages/AuthPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { login, simulateAbsence, getAbsences, getClubApplications } from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sferum_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoSimulate, setAutoSimulate] = useState(false);

  const [absences, setAbsences] = useState([]);
  const [applications, setApplications] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch pending items for header badge & notification popup
  useEffect(() => {
    if (!currentUser) {
      setAbsences([]);
      setApplications([]);
      return;
    }

    Promise.all([
      getAbsences(currentUser.class_name),
      getClubApplications(),
    ])
      .then(([abs, apps]) => {
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
      })
      .catch(() => {});
  }, [currentUser, refreshKey]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('sferum_user', JSON.stringify(user));
    showToast(`Добро пожаловать, ${user.full_name}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('sferum_user');
    setCurrentUser(null);
    showToast('Вы вышли из системы', 'info');
  };

  const handleSwitchUser = async (email, password) => {
    try {
      const user = await login(email, password);
      handleLoginSuccess(user);
      triggerRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Live incoming absence simulation loop (Option B / Hackathon Mode)
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

  // Notifications calculation for Header
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

  const headerNotifications = isTeacher
    ? [
        ...pendingAbsences.map((a) => ({
          title: `Справка: ${a.student_name}`,
          desc: a.reason,
          time: a.dates,
        })),
        ...pendingApps.map((a) => ({
          title: `Заявка в кружок: ${a.student_name}`,
          desc: a.class_name,
          time: 'Новое',
        })),
      ]
    : [
        ...studentApprovedAbs.map((a) => ({
          title: 'Справка одобрена учителем',
          desc: a.reason,
          time: a.dates,
        })),
        ...studentApprovedApps.map((a) => ({
          title: 'Зачисление в секцию подтверждено',
          desc: a.club_title || 'Кружок',
          time: 'Зачислен',
        })),
      ];

  const [seenNotificationsCount, setSeenNotificationsCount] = useState(0);

  const handleMarkAllRead = useCallback(() => {
    setSeenNotificationsCount(headerNotifications.length);
  }, [headerNotifications.length]);

  const rawCount = isTeacher
    ? pendingAbsences.length + pendingApps.length
    : studentApprovedAbs.length + studentApprovedApps.length;

  const unreadCount = Math.max(0, rawCount - seenNotificationsCount);

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
        {!currentUser && <AuthPage onLoginSuccess={handleLoginSuccess} />}

        {currentUser && currentUser.role === 'teacher' && (
          <TeacherDashboard
            user={currentUser}
            onLogout={handleLogout}
            showToast={showToast}
            refreshTrigger={refreshKey}
          />
        )}

        {currentUser && currentUser.role !== 'teacher' && (
          <StudentDashboard
            user={currentUser}
            onLogout={handleLogout}
            showToast={showToast}
            refreshTrigger={refreshKey}
          />
        )}
      </main>

      {/* Floating Welcome Notification on Entry */}
      {currentUser && (
        <NotificationPopup
          user={currentUser}
          absences={absences}
          applications={applications}
          onDismiss={handleMarkAllRead}
        />
      )}

      {/* Persistent Jury Sandbox Control Center */}
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
