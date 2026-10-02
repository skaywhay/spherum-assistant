import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Toast from './components/Toast';
import AuthPage from './pages/AuthPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

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

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

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

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-slate-800 flex flex-col font-sans">
      {currentUser && <Header user={currentUser} onLogout={handleLogout} />}

      <main className="flex-1">
        {!currentUser && <AuthPage onLoginSuccess={handleLoginSuccess} />}

        {currentUser && currentUser.role === 'teacher' && (
          <TeacherDashboard
            user={currentUser}
            onLogout={handleLogout}
            showToast={showToast}
          />
        )}

        {currentUser && currentUser.role !== 'teacher' && (
          <StudentDashboard
            user={currentUser}
            onLogout={handleLogout}
            showToast={showToast}
          />
        )}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
