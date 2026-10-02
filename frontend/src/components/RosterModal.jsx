import React, { useEffect } from 'react';
import { X, Users, CheckCircle2, Clock } from 'lucide-react';

const CLASS_9A_ROSTER = [
  { id: 1, name: 'Кузнецов Артём', gender: 'М', birth: '14.03.2010', phone: '+7 (916) 123-45-01' },
  { id: 2, name: 'Алексеева Дарья', gender: 'Ж', birth: '22.05.2010', phone: '+7 (916) 123-45-02' },
  { id: 3, name: 'Борисов Иван', gender: 'М', birth: '09.11.2009', phone: '+7 (916) 123-45-03' },
  { id: 4, name: 'Васильева Полина', gender: 'Ж', birth: '30.01.2010', phone: '+7 (916) 123-45-04' },
  { id: 5, name: 'Григорьев Максим', gender: 'М', birth: '18.07.2010', phone: '+7 (916) 123-45-05' },
  { id: 6, name: 'Дмитриева Анна', gender: 'Ж', birth: '04.09.2010', phone: '+7 (916) 123-45-06' },
  { id: 7, name: 'Егоров Кирилл', gender: 'М', birth: '12.12.2009', phone: '+7 (916) 123-45-07' },
  { id: 8, name: 'Жукова Екатерина', gender: 'Ж', birth: '25.04.2010', phone: '+7 (916) 123-45-08' },
  { id: 9, name: 'Зайцев Роман', gender: 'М', birth: '08.02.2010', phone: '+7 (916) 123-45-09' },
  { id: 10, name: 'Иванова Софья', gender: 'Ж', birth: '19.06.2010', phone: '+7 (916) 123-45-10' },
  { id: 11, name: 'Ковалёв Денис', gender: 'М', birth: '15.08.2009', phone: '+7 (916) 123-45-11' },
  { id: 12, name: 'Лебедева Мария', gender: 'Ж', birth: '03.10.2010', phone: '+7 (916) 123-45-12' },
  { id: 13, name: 'Макаров Михаил', gender: 'М', birth: '27.01.2010', phone: '+7 (916) 123-45-13' },
  { id: 14, name: 'Никитина Алиса', gender: 'Ж', birth: '11.05.2010', phone: '+7 (916) 123-45-14' },
  { id: 15, name: 'Орлов Даниил', gender: 'М', birth: '20.03.2010', phone: '+7 (916) 123-45-15' },
  { id: 16, name: 'Павлова Виктория', gender: 'Ж', birth: '07.07.2010', phone: '+7 (916) 123-45-16' },
  { id: 17, name: 'Романов Владислав', gender: 'М', birth: '16.09.2009', phone: '+7 (916) 123-45-17' },
  { id: 18, name: 'Семенова Ксения', gender: 'Ж', birth: '29.11.2010', phone: '+7 (916) 123-45-18' },
  { id: 19, name: 'Тарасов Арсений', gender: 'М', birth: '02.04.2010', phone: '+7 (916) 123-45-19' },
  { id: 20, name: 'Устинова Вероника', gender: 'Ж', birth: '14.08.2010', phone: '+7 (916) 123-45-20' },
  { id: 21, name: 'Федоров Егор', gender: 'М', birth: '23.02.2010', phone: '+7 (916) 123-45-21' },
  { id: 22, name: 'Харитонова Анастасия', gender: 'Ж', birth: '05.06.2010', phone: '+7 (916) 123-45-22' },
  { id: 23, name: 'Цветков Богдан', gender: 'М', birth: '17.10.2009', phone: '+7 (916) 123-45-23' },
  { id: 24, name: 'Чернова Елизавета', gender: 'Ж', birth: '31.12.2009', phone: '+7 (916) 123-45-24' },
  { id: 25, name: 'Шапошников Глеб', gender: 'М', birth: '10.01.2010', phone: '+7 (916) 123-45-25' },
  { id: 26, name: 'Щербакова Варвара', gender: 'Ж', birth: '18.03.2010', phone: '+7 (916) 123-45-26' },
  { id: 27, name: 'Юдин Сергей', gender: 'М', birth: '26.07.2010', phone: '+7 (916) 123-45-27' },
  { id: 28, name: 'Яковлева Милана', gender: 'Ж', birth: '08.09.2010', phone: '+7 (916) 123-45-28' },
];

export default function RosterModal({ isOpen, onClose, absences = [], className = '9-А' }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Список учащихся класса {className} (28 человек)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Оперативный мониторинг присутствия на текущий учебный день
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-0 flex-1">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">№</th>
                <th className="py-3 px-4">Ф.И.О. учащегося</th>
                <th className="py-3 px-4 w-16">Пол</th>
                <th className="py-3 px-4">Дата рожд.</th>
                <th className="py-3 px-4">Телефон родителя</th>
                <th className="py-3 px-4">Статус на уроке</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CLASS_9A_ROSTER.map((student) => {
                const match = absences.find(
                  (a) => a.student_name.trim().toLowerCase() === student.name.trim().toLowerCase()
                );

                let badge = (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Присутствует
                  </span>
                );

                if (match) {
                  if (match.status === 'approved') {
                    badge = (
                      <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full text-xs font-medium" title={match.reason}>
                        <CheckCircle2 className="w-3 h-3" /> Справка принята
                      </span>
                    );
                  } else if (match.status === 'pending') {
                    badge = (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-medium" title={match.reason}>
                        <Clock className="w-3 h-3" /> На проверке
                      </span>
                    );
                  }
                }

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-center font-mono text-xs text-slate-400">
                      {student.id}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {student.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 text-xs">{student.gender}</td>
                    <td className="py-2.5 px-4 font-mono text-xs text-slate-500">
                      {student.birth}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-slate-600">
                      {student.phone}
                    </td>
                    <td className="py-2.5 px-4">{badge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-xs"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
