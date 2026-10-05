import React, { useState, type FormEvent } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function RejectModal({ isOpen, onClose, onConfirm }: RejectModalProps): React.JSX.Element | null {
  const [reason, setReason] = useState<string>('Некорректно указан период болезни');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            Причина отклонения справки
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
          <div className="p-4 sm:p-6 space-y-4">
            <p className="text-xs text-slate-500">
              Укажите причину для ученика и родителей. Она будет отображаться в личном кабинете:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Основание отклонения
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
              >
                <option value="Некорректно указан период болезни">
                  Некорректно указан период болезни
                </option>
                <option value="Отсутствует официальная круглая печать учреждения">
                  Отсутствует официальная круглая печать учреждения
                </option>
                <option value="Неразборчивый скан или фотография низкого качества">
                  Неразборчивый скан или фотография низкого качества
                </option>
                <option value="Период в документе не совпадает с днями фактического пропуска">
                  Период в документе не совпадает с днями фактического пропуска
                </option>
              </select>
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
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
            >
              Подтвердить отклонение
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
