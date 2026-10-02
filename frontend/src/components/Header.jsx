import React from 'react';
import { LogOut, GraduationCap, School } from 'lucide-react';

export default function Header({ user, onLogout }) {
  const isTeacher = user.role === 'teacher';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-sm shadow-blue-500/30">
            С
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                Сферум.Ассистент
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  isTeacher
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {isTeacher ? 'Учитель' : 'Ученик'}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Электронный документооборот и кружки
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-800">{user.full_name}</div>
            <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
              <School className="w-3 h-3 text-slate-400" /> Класс {user.class_name}
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </header>
  );
}
