import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText, CheckCircle, Download, QrCode } from 'lucide-react';
import { getAbsencePdfUrl, getDocVerificationUrl } from '../api';
import type { Absence } from '../types';

interface DocumentModalProps {
  absence: Absence | null;
  onClose: () => void;
}

export default function DocumentModal({ absence, onClose }: DocumentModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!absence) return null;

  const r = (absence.reason || '').toLowerCase();
  let docType: 'medical' | 'parent' | 'olympiad' | 'duty' = 'duty';

  if (
    r.includes('болезн') ||
    r.includes('орви') ||
    r.includes('врач') ||
    r.includes('поликлиник') ||
    r.includes('температур') ||
    r.includes('грипп') ||
    r.includes('медсправк')
  ) {
    docType = 'medical';
  } else if (
    r.includes('семейн') ||
    r.includes('родител') ||
    r.includes('заявлен') ||
    r.includes('обстоятельств')
  ) {
    docType = 'parent';
  } else if (
    r.includes('олимпиад') ||
    r.includes('всош') ||
    r.includes('соревнован') ||
    r.includes('конкурс')
  ) {
    docType = 'olympiad';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-slide-up sm:animate-scale-in">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Электронный скан документа
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              Ученик: {absence.student_name} ({absence.class_name})
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

        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-100/70">
          {docType === 'medical' && (
            <div className="bg-amber-50/40 border border-slate-300 rounded-xl p-4 sm:p-8 font-serif shadow-sm text-slate-800 relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-slate-300 pb-3 sm:pb-4 text-xs">
                <div>
                  <strong className="block font-bold">ГБУЗ «ДГП №42»</strong>
                  <span className="text-[11px] text-slate-500">г. Москва</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">Форма № 095/у</span>
                  <div className="text-[11px] text-slate-500">Утв. Минздравом РФ</div>
                </div>
              </div>

              <div className="text-center my-4 sm:my-6">
                <h4 className="text-base sm:text-lg font-bold tracking-wide">СПРАВКА № 412/26</h4>
                <p className="text-xs text-slate-600 mt-1">О временной нетрудоспособности учащегося</p>
              </div>

              <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
                <p>
                  Ф.И.О. учащегося: <strong className="underline underline-offset-4 font-semibold">{absence.student_name}</strong>
                </p>
                <p>
                  Класс / школа: <strong className="underline underline-offset-4 font-semibold">{absence.class_name}, ГБОУ СОШ №1502</strong>
                </p>
                <p>
                  Диагноз: <span className="italic font-medium">J06.9 ОРВИ</span>
                </p>
                <p>
                  Освобожден(а) от занятий: с <strong className="font-semibold text-slate-900">{absence.dates}</strong>
                </p>
                <p className="text-xs text-slate-600 pt-1">Режим: амбулаторный. Контакт с инфекционными больными не установлен.</p>
              </div>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-blue-600/70 flex flex-col items-center justify-center text-[9px] sm:text-[10px] font-bold text-blue-700 uppercase tracking-tighter transform -rotate-12 select-none shrink-0">
                  <span>ДЛЯ СПРАВОК</span>
                  <span>ДГП №42</span>
                  <span className="text-[7px] sm:text-[8px] font-normal">ЭЦП ПОДТВЕРЖДЕНО</span>
                </div>
                <div className="text-center sm:text-right">
                  <div className="font-bold">Врач-педиатр: Соколова М.А.</div>
                  <div className="text-emerald-700 font-sans font-medium flex items-center justify-center sm:justify-end gap-1 mt-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Заверено квалифицированной ЭЦП
                  </div>
                </div>
              </div>
            </div>
          )}

          {docType === 'parent' && (
            <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-8 shadow-sm text-slate-800">
              <div className="text-right text-xs leading-relaxed max-w-xs ml-auto mb-4 sm:mb-6 text-slate-600">
                Директору ГБОУ СОШ № 1502<br />
                Воронину А.В.<br />
                от законного представителя<br />
                учащегося {absence.class_name} класса<br />
                <strong className="text-slate-900">{absence.student_name}</strong>
              </div>

              <div className="text-center my-4 sm:my-6">
                <h4 className="text-sm sm:text-base font-bold tracking-widest uppercase">ЗАЯВЛЕНИЕ</h4>
              </div>

              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm leading-relaxed">
                <p>
                  Прошу Вас отпустить моего ребенка с учебных занятий на период:{' '}
                  <strong className="underline underline-offset-4">{absence.dates}</strong>.
                </p>
                <p>
                  Причина отсутствия: <span className="italic">{absence.reason}</span>.
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600">
                  Ответственность за жизнь и здоровье ребенка, а также за освоение образовательной программы беру на себя.
                </p>
              </div>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <span className="text-slate-500 text-[11px]">Дата подачи: 25.09.2026 г.</span>
                <div className="text-left sm:text-right">
                  <span className="font-handwriting text-lg text-blue-700 select-none mr-2">/Кузнецова О.Н./</span>
                  <span className="text-slate-500 block text-[10px]">Подпись законного представителя</span>
                </div>
              </div>
            </div>
          )}

          {docType === 'olympiad' && (
            <div className="bg-sky-50/40 border border-sky-200 rounded-xl p-4 sm:p-8 shadow-sm text-slate-800">
              <div className="border-b border-sky-200 pb-3 mb-4 text-center">
                <span className="text-[10px] sm:text-[11px] font-semibold text-sky-800 tracking-wider uppercase block">
                  Министерство просвещения РФ • Региональный оргкомитет
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  ВСЕРОССИЙСКАЯ ОЛИМПИАДА ШКОЛЬНИКОВ (ВсОШ)
                </h4>
              </div>

              <div className="text-center my-3 sm:my-4">
                <span className="inline-block bg-sky-100 text-sky-900 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-md">
                  ОФИЦИАЛЬНЫЙ ВЫЗОВ НА ЭТАП СОРЕВНОВАНИЙ
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm leading-relaxed">
                <p>
                  Организационный комитет подтверждает вызов учащегося{' '}
                  <strong className="underline underline-offset-4">{absence.student_name}</strong> ({absence.class_name}) для
                  очного участия в этапе соревнований.
                </p>

                <div className="bg-white border border-sky-100 rounded-lg p-3 space-y-1 text-xs">
                  <div>
                    <span className="text-slate-500">Дисциплина: </span>
                    <strong className="text-slate-800">Информатика и программирование</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Сроки проведения: </span>
                    <strong className="text-slate-800">{absence.dates}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Площадка: </span>
                    <strong className="text-slate-800">НИУ ВШЭ, Покровский бульвар 11</strong>
                  </div>
                </div>

                <p className="text-[10px] sm:text-[11px] text-slate-500">
                  Основание: распоряжение Департамента образования № 614/од.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-sky-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div className="border border-sky-600 text-sky-700 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase">
                  ОРГКОМИТЕТ ВсОШ
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-bold">Председатель жюри: проф. Белов В.А.</div>
                  <span className="text-emerald-600 font-medium text-[10px] sm:text-[11px] flex items-center gap-1 mt-0.5">
                    <CheckCircle className="w-3 h-3" /> Верифицировано в ФИС ОГЭ/ЕГЭ
                  </span>
                </div>
              </div>
            </div>
          )}

          {docType === 'duty' && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 sm:p-8 shadow-sm text-slate-800">
              <div className="flex justify-between items-center border-b border-amber-200 pb-3 mb-4">
                <div>
                  <strong className="block text-xs font-bold">ГБОУ «Школа № 1502»</strong>
                  <span className="text-[10px] sm:text-[11px] text-slate-500">Служба дежурного администратора</span>
                </div>
                <div className="text-right text-[10px] sm:text-[11px] font-mono text-slate-500">
                  № 84 от 25.09.2026 г.
                </div>
              </div>

              <div className="text-center my-3 sm:my-4">
                <h4 className="text-xs sm:text-base font-bold text-slate-900 uppercase tracking-wide">
                  ТАЛОН-РАЗРЕШЕНИЕ НА ВЫХОД
                </h4>
              </div>

              <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
                <p>
                  Учащийся: <strong className="underline underline-offset-4">{absence.student_name}</strong>
                </p>
                <p>
                  Класс: <strong className="underline underline-offset-4">{absence.class_name}</strong>
                </p>
                <p>
                  Период: <strong>{absence.dates}</strong>
                </p>
                <p>
                  Основание: <span className="italic">{absence.reason}</span>
                </p>
                <p className="text-[11px] sm:text-xs text-emerald-700 font-medium pt-1">
                  ✓ Согласовано с родителями по телефону дежурным завучем.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                  Дежурный завуч: <strong className="text-slate-900">Николаева С.В.</strong>
                </div>
                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded">
                  ПОСТ ОХРАНЫ: ПРОПУСТИТЬ
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={getAbsencePdfUrl(absence.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Скачать PDF с печатью и ЭЦП</span>
            </a>
            <a
              href={getDocVerificationUrl(absence.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <QrCode className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Проверить QR-код</span>
              <span className="sm:hidden">QR</span>
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-center"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
