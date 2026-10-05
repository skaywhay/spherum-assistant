import React, { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import {
  getAbsences,
  createAbsence,
  getClubs,
  getClubApplications,
  applyClub,
  cancelClubApplication,
} from '../api';
import StatusBadge from '../components/StatusBadge';
import DocumentModal from '../components/DocumentModal';
import ClubApplyModal from '../components/ClubApplyModal';
import {
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Calendar,
  Layers,
  MapPin,
  User as UserIcon,
  Trash2,
} from 'lucide-react';
import type { Absence, Club, ClubApplication, ToastType, User } from '../types';

interface StudentDashboardProps {
  user: User;
  showToast: (msg: string, type?: ToastType) => void;
  refreshTrigger?: number;
}

type TabType = 'submit' | 'history' | 'my_clubs' | 'catalog';

export default function StudentDashboard({
  user,
  showToast,
  refreshTrigger,
}: StudentDashboardProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('my_clubs');
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [applications, setApplications] = useState<ClubApplication[]>([]);

  const [reason, setReason] = useState<string>('Болезнь (справка от врача / медучреждения)');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [hasFile, setHasFile] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [selectedDoc, setSelectedDoc] = useState<Absence | null>(null);
  const [applyingClub, setApplyingClub] = useState<Club | null>(null);

  const isInitialStudentRef = useRef<boolean>(true);
  const prevStatusesRef = useRef<Map<number, string>>(new Map());

  const loadData = useCallback(async (silent = false): Promise<void> => {
    try {
      const [allAbs, allClubs, allApps] = await Promise.all([
        getAbsences(user.class_name),
        getClubs(),
        getClubApplications(),
      ]);

      const myAbs = allAbs.filter(
        (a) => a.student_name.trim().toLowerCase() === user.full_name.trim().toLowerCase()
      );
      const myApps = allApps.filter(
        (a) => a.student_name.trim().toLowerCase() === user.full_name.trim().toLowerCase()
      );

      if (!isInitialStudentRef.current) {
        for (const item of myAbs) {
          const prevStatus = prevStatusesRef.current.get(item.id);
          if (prevStatus === 'pending' && item.status === 'approved') {
            showToast(`✅ Ваша справка за ${item.dates} одобрена учителем!`, 'success');
          } else if (prevStatus === 'pending' && item.status === 'rejected') {
            showToast(
              `❌ Ваша справка за ${item.dates} отклонена: ${item.rejection_reason || 'Без причины'}`,
              'error'
            );
          }
        }
      }

      const map = new Map<number, string>();
      for (const item of myAbs) {
        map.set(item.id, item.status);
      }
      prevStatusesRef.current = map;
      isInitialStudentRef.current = false;

      setAbsences(myAbs);
      setClubs(allClubs);
      setApplications(myApps);
    } catch {
      if (!silent) {
        showToast('Ошибка загрузки данных учащегося', 'error');
      }
    }
  }, [user.class_name, user.full_name, showToast]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [loadData, refreshTrigger]);

  const handleSubmitAbsence = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!startDate || !endDate) {
      showToast('Укажите даты начала и окончания', 'error');
      return;
    }

    const formatDate = (val: string): string => {
      const parts = val.split('-');
      return `${parts[2]}.${parts[1]}`;
    };
    const dates = `${formatDate(startDate)} - ${formatDate(endDate)}`;

    setSubmitting(true);
    try {
      await createAbsence({
        student_name: user.full_name,
        class_name: user.class_name || '9-А',
        reason,
        dates,
        has_certificate: hasFile,
      });

      showToast('Справка отправлена классному руководителю!', 'success');
      setStartDate('');
      setEndDate('');
      await loadData();
      setActiveTab('history');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка отправки справки';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyClub = async (clubId: number, parentName: string, parentPhone: string): Promise<void> => {
    try {
      await applyClub({
        club_id: clubId,
        student_name: user.full_name,
        class_name: user.class_name || '9-А',
        parent_name: parentName,
        parent_phone: parentPhone,
      });
      showToast('Заявление в секцию успешно направлено педагогу', 'success');
      setApplyingClub(null);
      await loadData();
      setActiveTab('my_clubs');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка отправки заявления';
      showToast(errorMsg, 'error');
    }
  };

  const handleCancelApplication = async (appId: number, clubTitle: string): Promise<void> => {
    if (!window.confirm(`Вы уверены, что хотите отозвать заявление в «${clubTitle}»?`)) return;
    try {
      await cancelClubApplication(appId);
      showToast(`Заявление в «${clubTitle}» отозвано`, 'info');
      await loadData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка отзыва заявления';
      showToast(errorMsg, 'error');
    }
  };

  const approvedCount = absences.filter((a) => a.status === 'approved').length;
  const pendingCount = absences.filter((a) => a.status === 'pending').length;

  const appliedIds = new Set<number>(applications.map((a) => a.club_id));
  const approvedClubs = applications.filter((a) => a.status === 'approved');
  const pendingClubs = applications.filter((a) => a.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('my_clubs')}
          className="text-left bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Мои секции</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 mt-2">{applications.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            {approvedClubs.length} зачислено • {pendingClubs.length} на проверке
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className="text-left bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Подано справок</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{absences.length}</div>
          <div className="text-xs text-slate-500 mt-1">Всего обращений в класс</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className="text-left bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-emerald-400 hover:shadow-md transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Одобрено</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{approvedCount}</div>
          <div className="text-xs text-slate-500 mt-1">Согласовано учителем</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className="text-left bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-amber-400 hover:shadow-md transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>На проверке</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{pendingCount}</div>
          <div className="text-xs text-slate-500 mt-1">Ожидает решения</div>
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto whitespace-nowrap no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('my_clubs')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 -mb-[2px] transition-colors inline-flex items-center gap-1.5 shrink-0 ${
            activeTab === 'my_clubs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Мои кружки и расписание</span>
          {applications.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {applications.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 -mb-[2px] transition-colors shrink-0 ${
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Каталог секций ({clubs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('submit')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 -mb-[2px] transition-colors shrink-0 ${
            activeTab === 'submit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Подать справку
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 -mb-[2px] transition-colors inline-flex items-center gap-1.5 shrink-0 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>История справок</span>
          {absences.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {absences.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'my_clubs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Мои секции дополнительного образования
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Статус зачисления, аудитории и персональное расписание занятий на неделю
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Записаться в новую секцию</span>
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-xs">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">Вы пока не записаны в секции</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Выберите интересное направление из общешкольного каталога — робототехника, олимпиадное программирование, шахматы или медиацентр.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Перейти в каталог секций →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => {
                const club = clubs.find((c) => c.id === app.club_id);
                const isApproved = app.status === 'approved';

                return (
                  <div
                    key={app.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                      isApproved ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Секция школы
                          </span>
                          <h4 className="text-base font-bold text-slate-900 mt-0.5">
                            {club?.title || app.club_title}
                          </h4>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {club?.description || 'Школьное объединение'}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Преподаватель: <strong>{club?.teacher_name || 'Педагог секции'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Расписание: <strong>{club?.schedule || app.club_schedule}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Аудитория: <strong>{club?.room || app.club_room}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {isApproved ? '✓ Вы успешно зачислены в группу' : '⏳ Заявление на согласовании'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCancelApplication(app.id, club?.title || app.club_title || 'Кружок')}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Отозвать</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {approvedClubs.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Моя недельная занятость внеурочкой
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5 text-center text-xs">
                {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'].map((day) => {
                  const match = approvedClubs.find((a) => {
                    const c = clubs.find((item) => item.id === a.club_id);
                    const sch = (c?.schedule || '').toLowerCase();
                    if (day === 'Понедельник' && sch.includes('пн')) return true;
                    if (day === 'Вторник' && sch.includes('вт')) return true;
                    if (day === 'Среда' && sch.includes('ср')) return true;
                    if (day === 'Четверг' && sch.includes('чт')) return true;
                    if (day === 'Пятница' && sch.includes('пт')) return true;
                    return false;
                  });

                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-xl border ${
                        match
                          ? 'border-indigo-200 bg-indigo-50/60 font-semibold text-indigo-900'
                          : 'border-slate-100 bg-slate-50/50 text-slate-400'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{day}</div>
                      <div className="mt-1 text-xs">
                        {match ? (
                          <span className="text-indigo-700 font-bold block">
                            {clubs.find((c) => c.id === match.club_id)?.title}
                          </span>
                        ) : (
                          '—'
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Каталог кружков и секций</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Выберите направление и подайте онлайн-заявление на зачисление
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((c) => {
              const isApplied = appliedIds.has(c.id);
              const enrolled = c.taken_slots ?? c.enrolled ?? 0;
              const capacity = c.max_slots ?? c.capacity ?? 15;
              const isFull = enrolled >= capacity;

              return (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                      {isApplied && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                          Заявка подана
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Преподаватель:</span>
                      <strong className="text-slate-700">{c.teacher_name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Расписание:</span>
                      <span className="text-slate-700">{c.schedule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Кабинет:</span>
                      <span className="text-slate-700">{c.room}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Мест занято:</span>
                      <strong className="text-indigo-600 font-semibold">
                        {enrolled} из {capacity}
                      </strong>
                    </div>

                    <div className="pt-3">
                      {isApplied ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
                        >
                          Вы уже записаны
                        </button>
                      ) : isFull ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
                        >
                          Группа укомплектована
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setApplyingClub(c)}
                          className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                        >
                          Подать заявление
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'submit' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                Электронная подача справки об отсутствии
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Документ поступит классному руководителю ({user.class_name} класс) на согласование
              </p>
            </div>

            <form onSubmit={handleSubmitAbsence} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Причина отсутствия
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="Болезнь (справка от врача / медучреждения)">
                    Болезнь (справка по форме 095/у)
                  </option>
                  <option value="По семейным обстоятельствам (заявление родителей)">
                    По семейным обстоятельствам (заявление родителей)
                  </option>
                  <option value="Участие во Всероссийской олимпиаде школьников">
                    Участие в олимпиаде (ВсОШ / официальный вызов)
                  </option>
                  <option value="Освобождение дежурного администратора / завуча">
                    Освобождение дежурного завуча (талон)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFile}
                    onChange={(e) => setHasFile(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Прикрепить электронный подтверждающий документ
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Будет сформирован верифицированный электронный скан бланка
                    </span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Отправка...' : 'Отправить справку учителю'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Мобильный вид (карточки) */}
          <div className="md:hidden divide-y divide-slate-100">
            {absences.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Вы еще не подавали справок об отсутствии
              </div>
            ) : (
              absences.map((item) => (
                <div key={item.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-sm font-semibold text-slate-900 block">{item.reason}</strong>
                      <div className="text-xs text-slate-500 mt-0.5">Период: {item.dates}</div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  {item.rejection_reason && (
                    <div className="text-[11px] text-rose-600 font-medium bg-rose-50 border border-rose-100 rounded-lg p-2">
                      Причина отклонения: {item.rejection_reason}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Класс: {item.class_name}</span>
                    {item.has_certificate ? (
                      <button
                        type="button"
                        onClick={() => setSelectedDoc(item)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Смотреть скан ↗</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Без файла</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Десктопная таблица */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Причина отсутствия</th>
                  <th className="py-3 px-4 whitespace-nowrap">Период</th>
                  <th className="py-3 px-4">Класс</th>
                  <th className="py-3 px-4">Скан документа</th>
                  <th className="py-3 px-4">Статус проверки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {absences.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                      Вы еще не подавали справок об отсутствии
                    </td>
                  </tr>
                ) : (
                  absences.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-xs text-slate-800">
                        <strong className="font-semibold text-slate-900 block">{item.reason}</strong>
                        {item.rejection_reason && (
                          <div className="text-[11px] text-rose-600 mt-0.5 font-medium">
                            Причина отказа: {item.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-xs text-slate-800">
                        {item.dates}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {item.class_name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.has_certificate ? (
                          <button
                            type="button"
                            onClick={() => setSelectedDoc(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Смотреть скан ↗</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Без файла</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DocumentModal absence={selectedDoc} onClose={() => setSelectedDoc(null)} />
      <ClubApplyModal
        club={applyingClub}
        user={user}
        onClose={() => setApplyingClub(null)}
        onApply={handleApplyClub}
      />
    </div>
  );
}
