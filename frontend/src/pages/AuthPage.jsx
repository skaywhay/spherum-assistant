import React, { useState } from 'react';
import { login, register } from '../api';
import { UserCheck, ArrowRight, Shield, Sparkles } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    title: 'Смирнова Елена Викторовна',
    role: 'Классный руководитель 9-А',
    badge: 'Учитель 9-А',
    roleType: 'teacher',
    email: 'teacher9a@sferum.ru',
    pass: 'password123',
  },
  {
    title: 'Васильев Михаил Сергеевич',
    role: 'Классный руководитель 10-Б',
    badge: 'Учитель 10-Б',
    roleType: 'teacher',
    email: 'teacher10b@sferum.ru',
    pass: 'password123',
  },
  {
    title: 'Кузнецов Артём',
    role: 'Учащийся 9-А класса',
    badge: 'Ученик 9-А',
    roleType: 'student',
    email: 'student9a@sferum.ru',
    pass: 'password123',
  },
  {
    title: 'Морозова София',
    role: 'Учащаяся 10-Б класса',
    badge: 'Ученик 10-Б',
    roleType: 'student',
    email: 'student10b@sferum.ru',
    pass: 'password123',
  },
];

export default function AuthPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('teacher');
  const [regClass, setRegClass] = useState('9-А');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await register({
        full_name: regName.trim(),
        role: regRole,
        class_name: regClass,
        email: regEmail.trim(),
        password: regPass.trim(),
      });
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demo) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    setError(null);
    setLoading(true);
    try {
      const user = await login(demo.email, demo.pass);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Quick login cards for Hackathon Jury */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
              <UserCheck className="w-3.5 h-3.5" />
              Демо-доступ для жюри хакатона
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Быстрый вход в систему
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Нажмите на любую карточку ниже, чтобы моментально войти под ролью учителя или ученика без ручного ввода паролей.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
              {DEMO_ACCOUNTS.map((acc) => {
                const isTeacher = acc.roleType === 'teacher';
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleDemoClick(acc)}
                    disabled={loading}
                    className="text-left p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md hover:bg-blue-50/20 transition-all duration-150 flex flex-col justify-between group bg-slate-50/50"
                  >
                    <div>
                      <span
                        className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded mb-2 ${
                          isTeacher
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {acc.badge}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {acc.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{acc.role}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                      <span>Войти в аккаунт</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Auth form card */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`pb-3 text-sm font-semibold border-b-2 -mb-[2px] transition-colors flex-1 text-center ${
                mode === 'signin'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`pb-3 text-sm font-semibold border-b-2 -mb-[2px] transition-colors flex-1 text-center ${
                mode === 'signup'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Регистрация
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Электронная почта
                </label>
                <input
                  type="email"
                  required
                  placeholder="teacher9a@sferum.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Пароль
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? 'Вход...' : 'Войти в систему'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ф.И.О.
                </label>
                <input
                  type="text"
                  required
                  placeholder="Иванов Иван Иванович"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Роль
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="teacher">Учитель</option>
                    <option value="student">Ученик</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Класс
                  </label>
                  <select
                    value={regClass}
                    onChange={(e) => setRegClass(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="9-А">9-А</option>
                    <option value="10-Б">10-Б</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Электронная почта
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@school.ru"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? 'Создание...' : 'Зарегистрироваться'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
