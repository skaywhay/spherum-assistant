import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export default function ClubApplyModal({ club, user, onClose, onApply }) {
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!club) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parentName.trim() || !parentPhone.trim()) return;
    setLoading(true);
    await onApply(club.id, parentName.trim(), parentPhone.trim());
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Запись в кружок
            </h3>
            <p className="text-xs font-semibold text-indigo-600 mt-0.5">{club.title}</p>
          </div>
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
                Учащийся
              </label>
              <input
                type="text"
                disabled
                value={`${user.full_name} (${user.class_name})`}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ф.И.О. родителя / представителя
              </label>
              <input
                type="text"
                required
                placeholder="Кузнецова Ольга Николаевна"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Контактный телефон родителя
              </label>
              <input
                type="tel"
                required
                placeholder="+7 (999) 000-00-00"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Отправка...' : 'Отправить заявление'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
