import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAbsences,
  createAbsence,
  updateAbsenceStatus,
  getClubs,
  getClubApplications,
  updateClubApplicationStatus,
  simulateAbsence,
} from '../api';
import StatusBadge from '../components/StatusBadge';
import DocumentModal from '../components/DocumentModal';
import RejectModal from '../components/RejectModal';
import AddAbsenceModal from '../components/AddAbsenceModal';
import RosterModal from '../components/RosterModal';
import {
  Clock,
  CheckCircle2,
  Sparkles,
  Users,
  Search,
  Plus,
  RefreshCw,
  FileText,
  Building,
  GraduationCap,
  Zap,
  Check,
  X as XIcon,
} from 'lucide-react';

const CLASS_9A_ROSTER = [
  'Кузнецов Артём', 'Алексеева Дарья', 'Борисов Иван', 'Васильева Полина',
  'Григорьев Максим', 'Дмитриева Анна', 'Егоров Кирилл', 'Жукова Екатерина',
  'Зайцев Роман', 'Иванова Софья', 'Ковалёв Денис', 'Лебедева Мария',
  'Макаров Михаил', 'Никитина Алиса', 'Орлов Даниил', 'Павлова Виктория',
  'Романов Владислав', 'Семенова Ксения', 'Тарасов Арсений', 'Устинова Вероника',
  'Федоров Егор', 'Харитонова Анастасия', 'Цветков Богдан', 'Чернова Елизавета',
  'Шапошников Глеб', 'Щербакова Варвара', 'Юдин Сергей', 'Яковлева Милана'
];

export default function TeacherDashboard({ user, showToast, refreshTrigger }) {
  const [activeTab, setActiveTab] = useState('absences');
  const [clubSubTab, setClubSubTab] = useState('class_overview'); // 'class_overview', 'my_club', 'catalog'
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [absences, setAbsences] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [absData, clubsData, appsData] = await Promise.all([
        getAbsences(user.class_name),
        getClubs(),
        getClubApplications(),
      ]);

      setAbsences(absData);
      setClubs(clubsData);
      setApplications(appsData);
    } catch {
      showToast('Ошибка загрузки данных журнала', 'error');
    }
  }, [user.class_name, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const handleApprove = async (id) => {
    try {
      await updateAbsenceStatus(id, 'approved');
      showToast('Справка успешно принята', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReject = async (reason) => {
    if (!rejectingId) return;
    try {
      await updateAbsenceStatus(rejectingId, 'rejected', reason);
      showToast('Справка отклонена', 'info');
      setRejectingId(null);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddAbsence = async (payload) => {
    try {
      await createAbsence({
        student_name: payload.student_name,
        class_name: user.class_name,
        reason: payload.reason,
        dates: payload.dates,
        has_certificate: true,
      });
      showToast('Запись об отсутствии внесена в журнал', 'success');
      setIsAddOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAppStatus = async (appId, status) => {
    try {
      await updateClubApplicationStatus(appId, status);
      showToast(status === 'approved' ? 'Заявление одобрено' : 'Заявление отклонено', 'info');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleQuickSimulate = async () => {
    setSimulating(true);
    try {
      const res = await simulateAbsence(user.class_name);
      showToast(`⚡ Новое обращение: ${res.student_name} (${res.reason})`, 'info');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSimulating(false);
    }
  };

  const pendingCount = absences.filter((a) => a.status === 'pending').length;
  const approvedCount = absences.filter((a) => a.status === 'approved').length;

  // The club taught by current teacher (e.g. Smirnova -> Programming, Vasiliev -> Robotics)
  const myClub = clubs.find((c) =>
    user.full_name.includes('Смирнова') ? c.title.includes('программирование') :
    user.full_name.includes('Васильев') ? c.title.includes('Робототехника') :
    c.teacher_name.includes(user.full_name.split(' ')[0])
  ) || clubs[0];

  // Applications for teacher's own club
  const myClubApps = applications.filter((a) => myClub && a.club_id === myClub.id);
  const myClubPendingCount = myClubApps.filter((a) => a.status === 'pending').length;

  // Class 9-A extracurricular coverage calculation (Отчёт по внеурочной занятости класса)
  const classAllApps = applications.filter((a) => a.class_name === user.class_name);
  const enrolledStudents = new Set(classAllApps.filter((a) => a.status === 'approved').map((a) => a.student_name));
  const pendingStudents = new Set(classAllApps.filter((a) => a.status === 'pending').map((a) => a.student_name));
  const coveragePercent = CLASS_9A_ROSTER.length > 0
    ? Math.round((enrolledStudents.size / CLASS_9A_ROSTER.length) * 100)
    : 0;

  const filteredAbsences = useMemo(() => {
    return absences.filter((item) => {
      const matchFilter = filter === 'all' || item.status === filter;
      const matchSearch =
        item.student_name.toLowerCase().includes(search.toLowerCase()) ||
        item.reason.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [absences, filter, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 4 Interactive KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab('absences');
            setFilter('pending');
          }}
          className="text-left bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-amber-400 hover:shadow-md transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Справок на проверке</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{pendingCount}</div>
          <div className="text-xs text-slate-500 mt-1">Ожидают решения классрука</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('absences');
            setFilter('approved');
          }}
          className="text-left bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-emerald-400 hover:shadow-md transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Принятые справки</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{approvedCount}</div>
          <div className="text-xs text-slate-500 mt-1">За текущую четверть</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('clubs');
            setClubSubTab('class_overview');
          }}
          className="text-left bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Охват внеурочкой</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 mt-2">{coveragePercent}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {enrolledStudents.size} из 28 зачислено
            {pendingStudents.size > 0 && (
              <span className="text-amber-600 font-medium"> (+{pendingStudents.size} на проверке)</span>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsRosterOpen(true)}
          className="text-left bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Учеников в классе</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">28</div>
          <div className="text-xs text-blue-600 font-medium mt-1">Журнал посещаемости →</div>
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('absences')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 -mb-[2px] transition-colors ${
            activeTab === 'absences'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Справки и заявления ({absences.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('clubs')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 -mb-[2px] transition-colors inline-flex items-center gap-2 ${
            activeTab === 'clubs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Внеурочная деятельность и кружки</span>
          {myClubPendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              +{myClubPendingCount} заявки
            </span>
          )}
        </button>
      </div>

      {activeTab === 'absences' ? (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-2">Фильтр:</span>
              {[
                { k: 'all', l: 'Все' },
                { k: 'pending', l: 'На проверке' },
                { k: 'approved', l: 'Одобренные' },
                { k: 'rejected', l: 'Отклоненные' },
              ].map((f) => (
                <button
                  key={f.k}
                  type="button"
                  onClick={() => setFilter(f.k)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    filter === f.k
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {f.l}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Поиск по ученику..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleQuickSimulate}
                disabled={simulating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors shadow-xs"
                title="Смоделировать входящую справку от случайного ученика"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>{simulating ? 'Генерация...' : '⚡ Симуляция справки'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Внести справку</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRosterOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-xs"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Журнал класса (28)</span>
              </button>

              <button
                type="button"
                onClick={loadData}
                title="Обновить"
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Absences Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ученик</th>
                    <th className="py-3 px-4">Причина отсутствия</th>
                    <th className="py-3 px-4 whitespace-nowrap">Период</th>
                    <th className="py-3 px-4">Скан документа</th>
                    <th className="py-3 px-4">Статус</th>
                    <th className="py-3 px-4 text-right">Решение</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAbsences.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                        Справок по выбранным критериям не найдено
                      </td>
                    </tr>
                  ) : (
                    filteredAbsences.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {item.student_name}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-700">
                          <div>{item.reason}</div>
                          {item.rejection_reason && (
                            <div className="text-[11px] text-rose-600 mt-0.5 font-medium">
                              Отказ: {item.rejection_reason}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-xs text-slate-800">
                          {item.dates}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.has_certificate ? (
                            <button
                              type="button"
                              onClick={() => setSelectedDoc(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Скан бланка ↗</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">Без файла</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {item.status === 'pending' ? (
                            <div className="inline-flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApprove(item.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                              >
                                Одобрить
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingId(item.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 transition-colors"
                              >
                                Отклонить
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">Обработано</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sub-tabs for Clubs System (Option B) */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setClubSubTab('class_overview')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                clubSubTab === 'class_overview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              📊 Занятость класса {user.class_name} (Отчёт завучу)
            </button>
            <button
              type="button"
              onClick={() => setClubSubTab('my_club')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-1.5 ${
                clubSubTab === 'my_club'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>🎓 Моя секция: {myClub?.title || 'Руководство'}</span>
              {myClubPendingCount > 0 && (
                <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 rounded-full">
                  {myClubPendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setClubSubTab('catalog')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                clubSubTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🏫 Каталог всех секций школы
            </button>
          </div>

          {/* SubTab 1: Class Extracurricular Coverage Report */}
          {clubSubTab === 'class_overview' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Ведомость внеурочной занятости класса {user.class_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Официальная школьная отчётность классного руководителя по охвату дополнительным образованием
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Зачислено {enrolledStudents.size} из 28:</span>
                    <strong className="text-lg font-bold text-emerald-600">{coveragePercent}% класса</strong>
                  </div>
                  <div className="w-24 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full"
                      style={{ width: `${Math.min(coveragePercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">№</th>
                        <th className="py-3 px-4">Ученик 9-А</th>
                        <th className="py-3 px-4">Посещаемые кружки и секции</th>
                        <th className="py-3 px-4">Статус охвата</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {CLASS_9A_ROSTER.map((name, idx) => {
                        const studentApps = applications.filter(
                          (a) => a.student_name.trim().toLowerCase() === name.trim().toLowerCase()
                        );
                        const approvedClubs = studentApps
                          .filter((a) => a.status === 'approved')
                          .map((a) => {
                            const c = clubs.find((item) => item.id === a.club_id);
                            return c?.title || `Кружок №${a.club_id}`;
                          });

                        const pendingClubs = studentApps
                          .filter((a) => a.status === 'pending')
                          .map((a) => {
                            const c = clubs.find((item) => item.id === a.club_id);
                            return c?.title || `Кружок №${a.club_id}`;
                          });

                        const hasEnrollment = approvedClubs.length > 0;

                        return (
                          <tr key={name} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-4 text-center font-mono text-xs text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-slate-900 text-xs">
                              {name}
                            </td>
                            <td className="py-2.5 px-4 text-xs">
                              {approvedClubs.map((t) => (
                                <span
                                  key={t}
                                  className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium mr-1.5 mb-1"
                                >
                                  ✓ {t}
                                </span>
                              ))}
                              {pendingClubs.map((t) => (
                                <span
                                  key={t}
                                  className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium mr-1.5 mb-1"
                                >
                                  ⏳ {t} (на проверке)
                                </span>
                              ))}
                              {approvedClubs.length === 0 && pendingClubs.length === 0 && (
                                <span className="text-slate-400 text-[11px] italic">
                                  Нет активных записей
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4">
                              {hasEnrollment ? (
                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  Охвачен
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                  Не записан
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: My Club Applications & Enrollment */}
          {clubSubTab === 'my_club' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
                      Педагог дополнительного образования: {user.full_name}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      Секция: «{myClub?.title}»
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Расписание: <strong>{myClub?.schedule}</strong> • Аудитория: <strong>{myClub?.room}</strong>
                    </p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-semibold text-right">
                    Занято мест: <span className="text-base font-bold text-indigo-600">{myClub?.taken_slots ?? myClub?.enrolled ?? 0}</span> из {myClub?.max_slots ?? myClub?.capacity ?? 15}
                  </div>
                </div>
              </div>

              {/* Applications for this club */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900">
                    Поступившие заявления на зачисление в секцию
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Решение о зачислении принимает руководитель объединения
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Ученик</th>
                        <th className="py-3 px-4">Класс</th>
                        <th className="py-3 px-4">Ф.И.О. родителя</th>
                        <th className="py-3 px-4">Телефон для связи</th>
                        <th className="py-3 px-4">Статус</th>
                        <th className="py-3 px-4 text-right">Решение педагога</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myClubApps.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                            Заявлений в данную секцию пока нет
                          </td>
                        </tr>
                      ) : (
                        myClubApps.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-900 text-xs">
                              {app.student_name}
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-slate-600">
                              {app.class_name}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-700">{app.parent_name}</td>
                            <td className="py-3 px-4 font-mono text-xs text-slate-600">
                              {app.parent_phone}
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={app.status} />
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              {app.status === 'pending' ? (
                                <div className="inline-flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleAppStatus(app.id, 'approved')}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Зачислить
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAppStatus(app.id, 'rejected')}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 transition-colors inline-flex items-center gap-1"
                                  >
                                    <XIcon className="w-3.5 h-3.5" /> Отклонить
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs font-medium text-slate-400">Решение принято</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 3: Full School Clubs Catalog */}
          {clubSubTab === 'catalog' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clubs.map((c) => {
                  const enrolled = c.taken_slots ?? c.enrolled ?? 0;
                  const capacity = c.max_slots ?? c.capacity ?? 15;
                  return (
                    <div
                      key={c.id}
                      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <DocumentModal absence={selectedDoc} onClose={() => setSelectedDoc(null)} />
      <RejectModal
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onConfirm={handleReject}
      />
      <AddAbsenceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddAbsence}
      />
      <RosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        absences={absences}
        className={user.class_name}
      />
    </div>
  );
}
