import React, { useState } from 'react';
import { LogOut, School, Bell, CheckCircle2, FileText, Sparkles, X, CheckCheck } from 'lucide-react';

export default function Header({
  user,
  onLogout,
  unreadCount = 0,
  notifications = [],
  onNotificationClick,
  onMarkAllRead,
}) {
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const isTeacher = user.role === 'teacher';

  const handleToggleBell = () => {
    const next = !showBellDropdown;
    setShowBellDropdown(next);
    if (next && unreadCount > 0 && onMarkAllRead) {
      onMarkAllRead();
    }
  };

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

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={handleToggleBell}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Уведомления"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Bell Dropdown */}
            {showBellDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 text-xs z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span>Уведомления ({notifications.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && onMarkAllRead && (
                      <button
                        type="button"
                        onClick={onMarkAllRead}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Прочитано</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowBellDropdown(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center text-slate-400 py-6">
                      Новых уведомлений нет
                    </div>
                  ) : (
                    notifications.map((n, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setShowBellDropdown(false);
                          if (onNotificationClick) onNotificationClick(n);
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <strong className="text-slate-900 font-semibold block">{n.title}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{n.desc}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
