import React, { useState, useEffect } from 'react';
import { Bell, X, FileText, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function NotificationPopup({ user, absences = [], applications = [], onAction, onDismiss }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  const isTeacher = user?.role === 'teacher';

  // Calculate unread/pending items for this user
  const teacherPendingAbsences = isTeacher
    ? absences.filter((a) => a.status === 'pending')
    : [];

  const teacherPendingApps = isTeacher
    ? applications.filter((a) => a.status === 'pending')
    : [];

  const studentApprovedAbsences = !isTeacher
    ? absences.filter((a) => a.status === 'approved')
    : [];

  const studentApprovedClubs = !isTeacher
    ? applications.filter((a) => a.status === 'approved')
    : [];

  const studentPendingAbsences = !isTeacher
    ? absences.filter((a) => a.status === 'pending')
    : [];

  const totalTeacherItems = teacherPendingAbsences.length + teacherPendingApps.length;
  const totalStudentItems = studentApprovedAbsences.length + studentApprovedClubs.length;

  // Show automatically on initial login/entry if there are pending/new items
  useEffect(() => {
    if (hasDismissed) return;

    if (isTeacher && totalTeacherItems > 0) {
      const timer = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(timer);
    }

    if (!isTeacher && (totalStudentItems > 0 || studentPendingAbsences.length > 0)) {
      const timer = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [user?.id, isTeacher, totalTeacherItems, totalStudentItems, studentPendingAbsences.length, hasDismissed]);

  const handleDismiss = () => {
    setIsOpen(false);
    setHasDismissed(true);
    if (onDismiss) onDismiss();
  };

  const handleGo = (targetTab) => {
    handleDismiss();
    if (onAction) onAction(targetTab);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-2xl p-4 sm:p-5 text-slate-800 relative overflow-hidden">
        {/* Accent top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {isTeacher ? 'Входящие документы и заявки' : 'Уведомления школы'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isTeacher
                  ? `Требуют вашего внимания: ${totalTeacherItems}`
                  : 'Статус ваших обращений обновлён'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="mt-3.5 space-y-2 text-xs">
          {isTeacher ? (
            <>
              {teacherPendingAbsences.map((abs) => (
                <div
                  key={abs.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">{abs.student_name}</strong>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{abs.reason}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0 ml-2">
                    Справка
                  </span>
                </div>
              ))}

              {teacherPendingApps.map((app) => (
                <div
                  key={app.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">{app.student_name}</strong>
                      <span className="text-[11px] text-slate-500 line-clamp-1">Запись в кружок</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 shrink-0 ml-2">
                    Кружок
                  </span>
                </div>
              ))}
            </>
          ) : (
            <>
              {studentApprovedAbsences.map((abs) => (
                <div
                  key={abs.id}
                  className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">Справка одобрена</strong>
                      <span className="text-[11px] text-slate-500">Период: {abs.dates}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shrink-0 ml-2">
                    Принято
                  </span>
                </div>
              ))}

              {studentApprovedClubs.map((app) => (
                <div
                  key={app.id}
                  className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">Зачисление в кружок</strong>
                      <span className="text-[11px] text-slate-500">Заявление одобрено педагогом</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shrink-0 ml-2">
                    Зачислен
                  </span>
                </div>
              ))}

              {studentPendingAbsences.map((abs) => (
                <div
                  key={abs.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">Справка на согласовании</strong>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{abs.reason}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0 ml-2">
                    На проверке
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            Позже
          </button>
          <button
            type="button"
            onClick={() => handleGo(isTeacher ? 'absences' : 'history')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
          >
            <span>Перейти к проверке</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
