import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function AddAbsenceModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('Болезнь (справка от врача / медучреждения)');
  const [dates, setDates] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !dates.trim()) return;
    onAdd({ student_name: name.trim(), reason, dates: dates.trim() });
    setName('');
    setDates('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Внести запись об отсутствии
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ф.И.О. учащегося
              </label>
              <input
                type="text"
                required
                placeholder="Кузнецов Артём"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Причина отсутствия
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="Болезнь (справка от врача / медучреждения)">
                  Болезнь (справка от врача)
                </option>
                <option value="По семейным обстоятельствам (заявление родителей)">
                  По семейным обстоятельствам
                </option>
                <option value="Участие во Всероссийской олимпиаде школьников">
                  Участие в олимпиаде ВсОШ
                </option>
                <option value="Освобождение дежурного администратора / завуча">
                  Освобождение дежурного завуча
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Период (дд.мм - дд.мм)
              </label>
              <input
                type="text"
                required
                placeholder="25.09 - 28.09"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              Сохранить в журнал
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
