import React, { useState, useEffect, type FormEvent } from 'react';
import { login, register, quickLogin, vkMiniAppLogin } from '../api';
import { parseVKLaunchParams, getVKUserInfo } from '../vkBridge';
import { UserCheck, ArrowRight, Info, X, Sparkles } from 'lucide-react';
import type { ToastType, User, UserRole } from '../types';

interface DemoAccountItem {
  title: string;
  role: string;
  badge: string;
  roleType: UserRole;
  email: string;
}

const DEMO_ACCOUNTS: DemoAccountItem[] = [
  {
    title: 'Смирнова Елена Викторовна',
    role: 'Классный руководитель 9-А',
    badge: 'Учитель 9-А',
    roleType: 'teacher',
    email: 'teacher9a@sferum.ru',
  },
  {
    title: 'Васильев Михаил Сергеевич',
    role: 'Классный руководитель 10-Б',
    badge: 'Учитель 10-Б',
    roleType: 'teacher',
    email: 'teacher10b@sferum.ru',
  },
  {
    title: 'Кузнецов Артём',
    role: 'Учащийся 9-А класса',
    badge: 'Ученик 9-А',
    roleType: 'student',
    email: 'student9a@sferum.ru',
  },
  {
    title: 'Морозова София',
    role: 'Учащаяся 10-Б класса',
    badge: 'Ученик 10-Б',
    roleType: 'student',
    email: 'student10b@sferum.ru',
  },
];

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
  showToast?: (msg: string, type?: ToastType) => void;
}

export default function AuthPage({ onLoginSuccess, showToast }: AuthPageProps): React.JSX.Element {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [vkNoticeOpen, setVkNoticeOpen] = useState<boolean>(false);

  const [vkParams] = useState(() => parseVKLaunchParams());
  const [vkDetectedUser, setVkDetectedUser] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (vkParams?.vk_user_id) {
      getVKUserInfo().then((info) => {
        if (info) {
          setVkDetectedUser({ id: info.id, name: `${info.first_name} ${info.last_name}` });
        } else {
          setVkDetectedUser({ id: vkParams.vk_user_id!, name: `Пользователь VK #${vkParams.vk_user_id}` });
        }
      });
    }
  }, [vkParams]);

  const handleVkMiniAppDirectLogin = async (role: UserRole = 'student'): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const vkId = vkParams?.vk_user_id || 77889911;
      const firstName = vkDetectedUser?.name ? vkDetectedUser.name.split(' ')[0] : 'Артём';
      const lastName = vkDetectedUser?.name ? (vkDetectedUser.name.split(' ')[1] || 'Кузнецов') : 'Кузнецов';
      const user = await vkMiniAppLogin({
        vk_user_id: vkId,
        first_name: firstName,
        last_name: lastName,
        role: role,
        class_name: '9-А',
        sign: (vkParams?.sign as string) || undefined,
        launch_params: window.location.search || undefined,
      });
      onLoginSuccess(user);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка входа через VK Mini App';
      setError(errorMsg);
    } finally {
      setLoading(false);
      setVkNoticeOpen(false);
    }
  };

  const [regName, setRegName] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('teacher');
  const [regClass, setRegClass] = useState<string>('9-А');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPass, setRegPass] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e?: FormEvent<HTMLFormElement>): Promise<void> => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка при входе';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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
      const errorMsg = err instanceof Error ? err.message : 'Ошибка при регистрации';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demo: DemoAccountItem): Promise<void> => {
    setEmail(demo.email);
    setPassword('');
    setError(null);
    setLoading(true);
    try {
      const user = await quickLogin(demo.roleType, demo.email);
      onLoginSuccess(user);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка демо-входа';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVkClick = (): void => {
    if (vkParams?.vk_user_id) {
      handleVkMiniAppDirectLogin('student');
      return;
    }
    setVkNoticeOpen(true);
    if (showToast) {
      showToast('Тут бы могла быть авторизация через Сферум или VK ID', 'info');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
              {DEMO_ACCOUNTS.map((acc, idx) => {
                const isTeacher = acc.roleType === 'teacher';
                const staggerClass = `stagger-${(idx % 4) + 1}`;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleDemoClick(acc)}
                    disabled={loading}
                    className={`text-left p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 card-hover btn-press flex flex-col justify-between group bg-slate-50/50 animate-fade-in-up ${staggerClass}`}
                  >
                    <div>
                      <span
                        className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded mb-2 transition-transform group-hover:scale-105 ${
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

                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>Войти в аккаунт</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

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

          {vkParams?.vk_user_id && (
            <div className="mb-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0077FF] shrink-0" />
                <div>
                  <strong>Запуск в VK Mini App!</strong>
                  <div className="text-[11px] text-slate-600">ID профиля: {vkParams.vk_user_id}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleVkMiniAppDirectLogin('student')}
                disabled={loading}
                className="w-full py-2 px-3 rounded-lg bg-[#0077FF] hover:bg-[#0066DD] text-white font-semibold transition-colors shadow-xs text-center"
              >
                Войти в 1 клик через аккаунт VK
              </button>
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

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2.5 text-slate-400 font-semibold tracking-wider">
                    или
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVkClick}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#0077FF] hover:bg-[#0066DF] shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2.5"
              >
                <span className="w-6 h-6 rounded-full bg-white text-[#0077FF] flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.65 17.5c-5.4 0-8.5-3.7-8.6-10h2.7c.07 4.6 2.1 6.5 3.7 6.9V7.5h2.5v3.9c1.55-.17 3.2-1.94 3.75-3.9h2.55c-.44 2.4-2.23 4.2-3.5 4.9 1.26.6 3.28 2.15 4.04 4.95h-2.8c-.6-1.85-2.06-3.26-4.02-3.45V17.5h-.62z" />
                  </svg>
                </span>
                <span>Войти через VK ID / Сферум</span>
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
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
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

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2.5 text-slate-400 font-semibold tracking-wider">
                    или
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVkClick}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#0077FF] hover:bg-[#0066DF] shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2.5"
              >
                <span className="w-6 h-6 rounded-full bg-white text-[#0077FF] flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.65 17.5c-5.4 0-8.5-3.7-8.6-10h2.7c.07 4.6 2.1 6.5 3.7 6.9V7.5h2.5v3.9c1.55-.17 3.2-1.94 3.75-3.9h2.55c-.44 2.4-2.23 4.2-3.5 4.9 1.26.6 3.28 2.15 4.04 4.95h-2.8c-.6-1.85-2.06-3.26-4.02-3.45V17.5h-.62z" />
                  </svg>
                </span>
                <span>Зарегистрироваться через VK ID</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {vkNoticeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setVkNoticeOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 w-full max-w-md overflow-hidden p-6 animate-slide-up sm:animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-2 mb-4 sm:hidden shrink-0" />
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0077FF] text-white flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M12.65 17.5c-5.4 0-8.5-3.7-8.6-10h2.7c.07 4.6 2.1 6.5 3.7 6.9V7.5h2.5v3.9c1.55-.17 3.2-1.94 3.75-3.9h2.55c-.44 2.4-2.23 4.2-3.5 4.9 1.26.6 3.28 2.15 4.04 4.95h-2.8c-.6-1.85-2.06-3.26-4.02-3.45V17.5h-.62z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setVkNoticeOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Тут бы могла быть авторизация через Сферум или VK ID
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              В полноценной промышленной версии сервис бесшовно связывается с аккаунтами Сферум и VK ID через официальный протокол OAuth 2.0.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-blue-800">
                <Info className="w-4 h-4 text-[#0077FF] shrink-0" />
                <span>Ограничение для конкурсной демонстрации</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Для боевого подключения VK ID требуется официальная регистрация юр. лица или ИП, договор с VK и верификация приложения модераторами.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Для тестирования функционала воспользуйтесь <strong>карточками быстрого демо-входа слева</strong> или кнопкой эмуляции входа ниже.
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => handleVkMiniAppDirectLogin('student')}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#0077FF] hover:bg-[#0066DD] transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>🚀 Войти в режиме VK Mini App (ученик Сферум)</span>
              </button>
              <button
                type="button"
                onClick={() => setVkNoticeOpen(false)}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors text-center"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
