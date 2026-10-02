import React, { useState, useEffect, useCallback } from 'react';
import { getAbsences, createAbsence, getClubs, getClubApplications, applyClub } from '../api';
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
  CheckSquare,
} from 'lucide-react';

export default function StudentDashboard({ user, showToast }) {
  const [activeTab, setActiveTab] = useState('submit');
  const [absences, setAbsences] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [reason, setReason] = useState('Болезнь (справка от врача / медучреждения)');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasFile, setHasFile] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [applyingClub, setApplyingClub] = useState(null);

  const loadData = useCallback(async () => {
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

      setAbsences(myAbs);
      setClubs(allClubs);
      setApplications(myApps);
    } catch {
      showToast('Ошибка загрузки данных учащегося', 'error');
    }
  }, [user.class_name, user.full_name, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitAbsence = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      showToast('Укажите даты начала и окончания', 'error');
      return;
    }

    const formatDate = (val) => {
      const parts = val.split('-');
      return `${parts[2]}.${parts[1]}`;
    };
    const dates = `${formatDate(startDate)} - ${formatDate(endDate)}`;

    setSubmitting(true);
    try {
      await createAbsence({
        student_name: user.full_name,
        class_name: user.class_name,
        reason,
        dates,
        has_certificate: hasFile,
      });

      showToast('Справка отправлена учителю на проверку!', 'success');
      setStartDate('');
      setEndDate('');
      await loadData();
      setActiveTab('history');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyClub = async (clubId, parentName, parentPhone) => {
    try {
      await applyClub({
        club_id: clubId,
        student_name: user.full_name,
        class_name: user.class_name,
        parent_name: parentName,
        parent_phone: parentPhone,
      });
      showToast('Заявление в кружок успешно отправлено', 'success');
      setApplyingClub(null);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const approvedCount = absences.filter((a) => a.status === 'approved').length;
  const pendingCount = absences.filter((a) => a.status === 'pending').length;
  const appliedIds = new Set(applications.map((a) => a.club_id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 4 Interactive KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="text-xs text-slate-500 mt-1">Всего обращений</div>
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
          <div className="text-xs text-slate-500 mt-1">Принято учителем</div>
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

        <button
          type="button"
          onClick={() => setActiveTab('clubs')}
          className="text-left bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Мои кружки</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 mt-2">{applications.length}</div>
          <div className="text-xs text-slate-500 mt-1">Подано заявлений</div>
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('submit')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 -mb-[2px] transition-colors ${
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
          className={`pb-3 px-3 text-sm font-semibold border-b-2 -mb-[2px] transition-colors inline-flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Мои справки</span>
          {absences.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {absences.length}
            </span>
          )}
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
          <span>Кружки и секции</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {clubs.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Submit Form */}
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

      {/* Tab 2: My Absences History */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
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

      {/* Tab 3: Clubs Catalog */}
      {activeTab === 'clubs' && (
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

      {/* Modals */}
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
