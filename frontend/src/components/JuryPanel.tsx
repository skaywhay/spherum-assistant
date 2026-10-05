import React, { useState, type FormEvent } from 'react';
import {
  simulateAbsence,
  simulateClubApplication,
  createClub,
  resetDatabase,
} from '../api';
import {
  Sparkles,
  Zap,
  RotateCcw,
  Plus,
  Users,
  X,
  Play,
  Pause,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import type { ToastType, User } from '../types';

interface DemoUserItem {
  title: string;
  role: string;
  email: string;
  pass: string;
}

const DEMO_USERS: DemoUserItem[] = [
  {
    title: 'Смирнова Елена Викторовна',
    role: 'Классрук 9-А • Секция «Программирование»',
    email: 'teacher9a@sferum.ru',
    pass: 'password123',
  },
  {
    title: 'Васильев Михаил Сергеевич',
    role: 'Классрук 10-Б • Секция «Робототехника и БПЛА»',
    email: 'teacher10b@sferum.ru',
    pass: 'password123',
  },
  {
    title: 'Кузнецов Артём',
    role: 'Ученик 9-А класса',
    email: 'student9a@sferum.ru',
    pass: 'password123',
  },
  {
    title: 'Морозова София',
    role: 'Ученица 10-Б класса',
    email: 'student10b@sferum.ru',
    pass: 'password123',
  },
];

interface JuryPanelProps {
  currentUser: User | null;
  onSwitchUser: (email: string, pass: string) => void;
  onDataChanged?: () => void;
  showToast: (msg: string, type?: ToastType) => void;
  autoSimulate: boolean;
  setAutoSimulate: (val: boolean) => void;
}

export default function JuryPanel({
  currentUser,
  onSwitchUser,
  onDataChanged,
  showToast,
  autoSimulate,
  setAutoSimulate,
}: JuryPanelProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [showAddClub, setShowAddClub] = useState<boolean>(false);
  const [clubTitle, setClubTitle] = useState<string>('');
  const [clubDesc, setClubDesc] = useState<string>('');
  const [clubTeacher, setClubTeacher] = useState<string>('');
  const [clubSchedule, setClubSchedule] = useState<string>('');
  const [clubRoom, setClubRoom] = useState<string>('');
  const [clubSlots, setClubSlots] = useState<number>(15);

  const handleSimulateAbsence = async (): Promise<void> => {
    setLoading(true);
    try {
      const cls = currentUser?.class_name || '9-А';
      const abs = await simulateAbsence(cls);
      showToast(
        `⚡ Поступила справка: ${abs.student_name} (${abs.class_name}) — ${abs.reason}`,
        'info'
      );
      if (onDataChanged) onDataChanged();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка при симуляции справки';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateClubApp = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await simulateClubApplication();
      if (res.status === 'ok' && res.application) {
        showToast(
          `⚡ Заявка в кружок: ${res.application.student_name} записался в «${res.application.club_title}»`,
          'success'
        );
        if (onDataChanged) onDataChanged();
      } else {
        showToast(res.message || 'Нет доступных мест или кружков', 'info');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка при симуляции заявки';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!clubTitle.trim() || !clubTeacher.trim()) return;
    setLoading(true);
    try {
      await createClub({
        title: clubTitle.trim(),
        description: clubDesc.trim() || 'Школьное объединение дополнительного образования',
        teacher_name: clubTeacher.trim(),
        schedule: clubSchedule.trim() || 'Ср, Пт 16:30',
        room: clubRoom.trim() || 'Каб. 210',
        max_slots: Number(clubSlots) || 15,
      });
      showToast(`Кружок «${clubTitle}» успешно добавлен в школьный реестр`, 'success');
      setClubTitle('');
      setClubDesc('');
      setClubTeacher('');
      setClubSchedule('');
      setClubRoom('');
      setShowAddClub(false);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка создания кружка';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (): Promise<void> => {
    if (!window.confirm('Сбросить базу данных к начальному состоянию конкурса?')) return;
    setLoading(true);
    try {
      await resetDatabase();
      showToast('База данных успешно возвращена в исходное состояние', 'success');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка сброса базы данных';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-3 sm:bottom-5 sm:left-5 z-40 inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full bg-slate-900 text-white font-semibold text-xs shadow-xl hover:bg-slate-800 hover:scale-105 transition-all border border-slate-700/60 group"
      >
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden xs:inline">Панель жюри</span>
        <span className="xs:hidden">Жюри</span>
        {autoSimulate && (
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-500/30">
            Live
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5 sm:gap-2">
                    Панель жюри и симуляции
                    <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      Sandbox Mode
                    </span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                    Управление потоком справок, кружками и тестовыми профилями
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Генерация событий в реальном времени
                  </span>
                  <button
                    type="button"
                    onClick={() => setAutoSimulate(!autoSimulate)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                      autoSimulate
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {autoSimulate ? (
                      <>
                        <Pause className="w-3 h-3" /> Автопоток (45 сек): ВКЛ
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Автопоток: ВЫКЛ
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleSimulateAbsence}
                    disabled={loading}
                    className="p-3.5 text-left rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 hover:border-blue-400 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-blue-900 group-hover:text-blue-700">
                        + Входящая справка от ученика
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Выбирает случайного ученика из 28 человек класса и создаёт электронный скан
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-600 mt-3 block">
                      Смоделировать сейчас ↗
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateClubApp}
                    disabled={loading}
                    className="p-3.5 text-left rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 hover:border-indigo-400 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-indigo-900 group-hover:text-indigo-700">
                        + Заявка в школьный кружок
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Генерирует заявление от родителей на зачисление в секцию
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-600 mt-3 block">
                      Смоделировать сейчас ↗
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Моментальное переключение профиля
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DEMO_USERS.map((u) => {
                    const isActive = currentUser?.email === u.email;
                    return (
                      <button
                        key={u.email}
                        type="button"
                        onClick={() => {
                          onSwitchUser(u.email, u.pass);
                          setIsOpen(false);
                        }}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          isActive
                            ? 'border-blue-600 bg-blue-50/70 font-semibold ring-1 ring-blue-500'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900">{u.title}</strong>
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{u.role}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Школьные кружки и секции
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddClub(!showAddClub)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddClub ? 'Скрыть форму' : 'Создать новый кружок'}</span>
                  </button>
                </div>

                {showAddClub && (
                  <form onSubmit={handleCreateClub} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Название секции</label>
                        <input
                          type="text"
                          required
                          placeholder="3D-моделирование и VR"
                          value={clubTitle}
                          onChange={(e) => setClubTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Преподаватель</label>
                        <input
                          type="text"
                          required
                          placeholder="Семенов Д.В."
                          value={clubTeacher}
                          onChange={(e) => setClubTeacher(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Краткое описание</label>
                      <input
                        type="text"
                        placeholder="Основы трёхмерной графики, Blender и прототипирование"
                        value={clubDesc}
                        onChange={(e) => setClubDesc(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Расписание</label>
                        <input
                          type="text"
                          placeholder="Ср, Пт 16:30"
                          value={clubSchedule}
                          onChange={(e) => setClubSchedule(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Кабинет</label>
                        <input
                          type="text"
                          placeholder="Каб. 210"
                          value={clubRoom}
                          onChange={(e) => setClubRoom(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Лимит мест</label>
                        <input
                          type="number"
                          value={clubSlots}
                          onChange={(e) => setClubSlots(Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                    >
                      Сохранить и опубликовать
                    </button>
                  </form>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">
                    Исходное состояние конкурса
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Очистить созданные данные и вернуть базу к чистым 4 аккаунтам
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Сбросить данные</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
