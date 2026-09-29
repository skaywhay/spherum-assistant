// Сферум.Ассистент — React-приложение (без Node.js и npm, запуск из коробки)

const { useState, useEffect, useCallback, useMemo } = React;

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

const DEMO_ACCOUNTS = [
  {
    title: 'Смирнова Елена Викторовна',
    role: 'Классный руководитель 9-А',
    badge: 'Учитель 9-А',
    badgeClass: 'badge-teacher',
    actionText: 'Войти как учитель →',
    email: 'teacher9a@sferum.ru',
    pass: 'password123',
  },
  {
    title: 'Васильев Михаил Сергеевич',
    role: 'Классный руководитель 10-Б',
    badge: 'Учитель 10-Б',
    badgeClass: 'badge-teacher',
    actionText: 'Войти как учитель →',
    email: 'teacher10b@sferum.ru',
    pass: 'password123',
  },
  {
    title: 'Кузнецов Артём',
    role: 'Учащийся 9-А класса',
    badge: 'Ученик 9-А',
    badgeClass: 'badge-student',
    actionText: 'Войти как ученик →',
    email: 'student9a@sferum.ru',
    pass: 'password123',
  },
  {
    title: 'Морозова София',
    role: 'Учащаяся 10-Б класса',
    badge: 'Ученик 10-Б',
    badgeClass: 'badge-student',
    actionText: 'Войти как ученик →',
    email: 'student10b@sferum.ru',
    pass: 'password123',
  },
];

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className={`toast toast-${toast.type || 'info'}`}>
        <span>{toast.message}</span>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', marginLeft: '12px', cursor: 'pointer', color: '#94a3b8' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const Header = ({ user, onLogout }) => {
  const isTeacher = user.role === 'teacher';

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="brand">
          <div className="brand-logo">С</div>
          <div className="brand-info">
            <div className="brand-title-wrap">
              <span className="brand-title">Сферум.Ассистент</span>
              <span className={isTeacher ? 'badge-role' : 'demo-badge badge-student'}>
                {isTeacher ? 'Учитель' : 'Ученик'}
              </span>
            </div>
            <span className="brand-subtitle">Электронный документооборот и кружки</span>
          </div>
        </div>

        <nav className="user-nav">
          <div className="user-meta">
            <div className="user-name">{user.full_name}</div>
            <div className="user-class">Класс: {user.class_name}</div>
          </div>
          <button type="button" onClick={onLogout} className="btn btn-outline btn-sm">
            Выйти
          </button>
        </nav>
      </div>
    </header>
  );
};

const StatusBadge = ({ status }) => {
  const badges = {
    approved: <span className="status-badge badge-approved">Одобрено</span>,
    rejected: <span className="status-badge badge-rejected">Отклонено</span>,
    pending: <span className="status-badge badge-pending">На проверке</span>,
  };
  return badges[status] || badges.pending;
};

// --- МОДАЛЬНЫЕ ОКНА ---

const DocumentModal = ({ absence, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!absence) return null;

  const r = absence.reason.toLowerCase();
  let docType = 'duty';
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
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-doc-box">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Электронный скан документа</h3>
            <p className="modal-subtitle">
              Ученик: {absence.student_name} ({absence.class_name})
            </p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body doc-modal-body">
          {docType === 'medical' && (
            <div className="doc-sheet doc-medical">
              <div className="doc-med-header">
                <div>
                  <strong>ГБУЗ «Детская городская поликлиника №42»</strong>
                  <br />
                  <small>г. Москва, ОГРН 1037739120481</small>
                </div>
                <div className="text-right">
                  Форма № 095/у<br />
                  <small>Утв. Минздравом РФ</small>
                </div>
              </div>

              <div className="doc-med-title">
                <h4>СПРАВКА № 412/26</h4>
                <span>О временной нетрудоспособности учащегося</span>
              </div>

              <div className="doc-med-fields">
                <p>
                  Ф.И.О. учащегося: <strong className="underline">{absence.student_name}</strong>
                </p>
                <p>
                  Класс / школа: <strong className="underline">{absence.class_name}, ГБОУ СОШ №1502</strong>
                </p>
                <p>
                  Диагноз: <em>J06.9 Острая респираторная вирусная инфекция (ОРВИ)</em>
                </p>
                <p>
                  Освобожден(а) от занятий: с <strong>{absence.dates}</strong>
                </p>
                <p>Режим: амбулаторный. Контакт с инфекционными больными не установлен.</p>
              </div>

              <div className="doc-med-footer">
                <div className="stamp-circle">
                  ДЛЯ СПРАВОК
                  <br />
                  ДГП №42
                </div>
                <div className="doc-med-sign">
                  <strong>Врач-педиатр: Соколова М.А.</strong>
                  <br />
                  <small className="text-muted">Подпись заверена ЭЦП поликлиники</small>
                </div>
              </div>
            </div>
          )}

          {docType === 'parent' && (
            <div className="doc-sheet doc-parent">
              <div className="doc-parent-header">
                Директору ГБОУ СОШ № 1502
                <br />
                Воронину А.В.
                <br />
                от законного представителя
                <br />
                учащегося {absence.class_name} класса
                <br />
                <strong>{absence.student_name}</strong>
              </div>

              <div className="doc-parent-title">
                <h4>ЗАЯВЛЕНИЕ</h4>
              </div>

              <div className="doc-parent-body">
                <p>
                  Прошу Вас отпустить моего ребенка с учебных занятий на период: <strong>{absence.dates}</strong>.
                </p>
                <p>
                  Причина отсутствия: <em>{absence.reason}</em>.
                </p>
                <p>
                  Ответственность за жизнь и здоровье ребенка, а также за освоение образовательной программы беру на себя.
                </p>
              </div>

              <div className="doc-parent-footer">
                <div>Дата подачи: 25.09.2026 г.</div>
                <div>
                  Подпись родителя: <span className="handwrite">/Кузнецова О.Н./</span>
                </div>
              </div>
            </div>
          )}

          {docType === 'olympiad' && (
            <div className="doc-sheet doc-olympiad">
              <div className="doc-oly-header">
                <span>Министерство просвещения РФ • Региональный оргкомитет</span>
                <h4>ВСЕРОССИЙСКАЯ ОЛИМПИАДА ШКОЛЬНИКОВ (ВсОШ)</h4>
              </div>

              <div className="doc-oly-title">
                <strong>ОФИЦИАЛЬНЫЙ ВЫЗОВ НА ЭТАП СОРЕВНОВАНИЙ</strong>
              </div>

              <div className="doc-oly-body">
                <p>
                  Организационный комитет подтверждает вызов учащегося <strong>{absence.student_name}</strong> (
                  {absence.class_name}) для очного участия в этапе соревнований.
                </p>
                <div className="doc-oly-box">
                  <p>
                    Дисциплина: <strong>Информатика и алгоритмическое программирование</strong>
                  </p>
                  <p>
                    Сроки проведения: <strong>{absence.dates}</strong>
                  </p>
                  <p>
                    Площадка: <strong>НИУ ВШЭ, Покровский бульвар 11</strong>
                  </p>
                </div>
                <small className="text-muted">Основание: распоряжение Департамента образования № 614/од.</small>
              </div>

              <div className="doc-oly-footer">
                <div className="stamp-square">ОРГКОМИТЕТ ВсОШ</div>
                <div className="text-right">
                  <strong>Председатель жюри: проф. Белов В.А.</strong>
                  <br />
                  <small className="text-emerald">Верифицировано в ФИС ОГЭ/ЕГЭ</small>
                </div>
              </div>
            </div>
          )}

          {docType === 'duty' && (
            <div className="doc-sheet doc-duty">
              <div className="doc-duty-header">
                <strong>ГБОУ «Школа № 1502»</strong>
                <br />
                <small>Служба дежурного администратора</small>
              </div>

              <div className="doc-duty-title">
                <h4>ТАЛОН-РАЗРЕШЕНИЕ НА ВЫХОД</h4>
                <small>№ 84 от 25.09.2026 г.</small>
              </div>

              <div className="doc-duty-body">
                <p>
                  Учащийся: <strong>{absence.student_name}</strong>
                </p>
                <p>
                  Класс: <strong>{absence.class_name}</strong>
                </p>
                <p>
                  Период: <strong>{absence.dates}</strong>
                </p>
                <p>
                  Основание: <em>{absence.reason}</em>
                </p>
                <p className="text-emerald text-sm">Согласовано с родителями по телефону дежурным завучем.</p>
              </div>

              <div className="doc-duty-footer">
                <div>
                  Дежурный завуч: <strong>Николаева С.В.</strong>
                </div>
                <div className="duty-badge">ПОСТ ОХРАНЫ: ПРОПУСТИТЬ</div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

const RejectModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('Некорректно указан период болезни');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="modal-header">
          <h3 className="modal-title">Причина отклонения справки</h3>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm(reason);
          }}
        >
          <div className="modal-body">
            <p className="text-sm text-muted mb-3">Укажите обоснование для учащегося и родителей:</p>
            <div className="form-group">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-control"
              >
                <option value="Некорректно указан период болезни">Некорректно указан период болезни</option>
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
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-danger">
              Подтвердить отклонение
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddAbsenceModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('Болезнь (справка от врача / медучреждения)');
  const [dates, setDates] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="modal-header">
          <h3 className="modal-title">Внести запись об отсутствии</h3>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !dates.trim()) return;
            onAdd({ student_name: name.trim(), reason, dates: dates.trim() });
            setName('');
            setDates('');
          }}
        >
          <div className="modal-body">
            <div className="form-group">
              <label>Ф.И.О. учащегося</label>
              <input
                type="text"
                required
                placeholder="Кузнецов Артём"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Причина</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="Болезнь (справка от врача / медучреждения)">Болезнь (справка от врача)</option>
                <option value="По семейным обстоятельствам (заявление родителей)">По семейным обстоятельствам</option>
                <option value="Участие во Всероссийской олимпиаде школьников">Участие в олимпиаде ВсОШ</option>
                <option value="Освобождение дежурного администратора / завуча">Освобождение дежурного завуча</option>
              </select>
            </div>

            <div className="form-group">
              <label>Период (дд.мм - дд.мм)</label>
              <input
                type="text"
                required
                placeholder="25.09 - 28.09"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary">
              Сохранить в журнал
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RosterModal = ({ isOpen, onClose, absences, className }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-3xl">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Список учащихся класса {className} (28 человек)</h3>
            <p className="modal-subtitle">Оперативный мониторинг посещаемости на текущий учебный день</p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body p-0 max-h-96 overflow-y-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Ф.И.О. учащегося</th>
                <th>Пол</th>
                <th>Дата рожд.</th>
                <th>Телефон родителя</th>
                <th>Статус на уроке</th>
              </tr>
            </thead>
            <tbody>
              {CLASS_9A_ROSTER.map((s) => {
                const match = absences.find(
                  (a) => a.student_name.trim().toLowerCase() === s.name.trim().toLowerCase()
                );

                let statusBadge = <span className="status-badge badge-approved">Присутствует</span>;
                if (match) {
                  if (match.status === 'approved') {
                    statusBadge = (
                      <span className="status-badge badge-role" title={match.reason}>
                        Справка принята
                      </span>
                    );
                  } else if (match.status === 'pending') {
                    statusBadge = (
                      <span className="status-badge badge-pending" title={match.reason}>
                        Справка на проверке
                      </span>
                    );
                  }
                }

                return (
                  <tr key={s.id}>
                    <td className="font-mono text-muted">{s.id}</td>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>{s.gender}</td>
                    <td className="font-mono text-xs text-muted">{s.birth}</td>
                    <td className="font-mono text-xs">{s.phone}</td>
                    <td>{statusBadge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

const ClubApplyModal = ({ club, user, onClose, onApply }) => {
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!club) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Запись в кружок</h3>
            <p className="modal-subtitle text-indigo font-bold">{club.title}</p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!parentName.trim() || !parentPhone.trim()) return;
            setLoading(true);
            await onApply(club.id, parentName.trim(), parentPhone.trim());
            setLoading(false);
          }}
        >
          <div className="modal-body">
            <div className="form-group">
              <label>Учащийся</label>
              <input
                type="text"
                disabled
                value={`${user.full_name} (${user.class_name})`}
                style={{ background: '#f8fafc', color: '#64748b' }}
              />
            </div>

            <div className="form-group">
              <label>Ф.И.О. родителя / представителя</label>
              <input
                type="text"
                required
                placeholder="Кузнецова Ольга Николаевна"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Контактный телефон родителя</label>
              <input
                type="tel"
                required
                placeholder="+7 (999) 000-00-00"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Отправка...' : 'Отправить заявление'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- ЭКРАН АВТОРИЗАЦИИ ---

const AuthScreen = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('teacher');
  const [regClass, setRegClass] = useState('9-А');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Неверный логин или пароль');
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: regName.trim(),
          role: regRole,
          class_name: regClass,
          email: regEmail.trim(),
          password: regPass.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Ошибка регистрации');
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (demo) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    setError(null);
    setLoading(true);
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: demo.email, password: demo.pass }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) onLoginSuccess(data.user);
        else throw new Error('Ошибка входа');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <section className="screen">
      <div className="auth-wrapper">
        <div className="demo-section">
          <div className="section-title-wrap">
            <h2 className="section-title">Быстрый вход для жюри и проверки</h2>
            <p className="section-desc">Нажмите на карточку любого пользователя для моментального входа</p>
          </div>

          <div className="demo-grid">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="demo-card"
                onClick={() => handleDemoClick(acc)}
                disabled={loading}
              >
                <span className={`demo-badge ${acc.badgeClass}`}>{acc.badge}</span>
                <strong className="demo-name">{acc.title}</strong>
                <span className="demo-desc">{acc.role}</span>
                <span className="demo-action">{acc.actionText}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={`tab-btn ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => setMode('signin')}
            >
              Вход в систему
            </button>
            <button
              type="button"
              className={`tab-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => setMode('signup')}
            >
              Регистрация
            </button>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {mode === 'signin' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Электронная почта</label>
                <input
                  type="email"
                  required
                  placeholder="user@school.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Пароль</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-block">
                {loading ? 'Вход...' : 'Войти в систему'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Ф.И.О.</label>
                <input
                  type="text"
                  required
                  placeholder="Иванов Иван Иванович"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Роль</label>
                  <select value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                    <option value="teacher">Учитель</option>
                    <option value="student">Ученик</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Класс</label>
                  <select value={regClass} onChange={(e) => setRegClass(e.target.value)}>
                    <option value="9-А">9-А</option>
                    <option value="10-Б">10-Б</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Электронная почта</label>
                <input
                  type="email"
                  required
                  placeholder="new_user@school.ru"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Пароль</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-block">
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

// --- ЭКРАН УЧИТЕЛЯ ---

const TeacherDashboard = ({ user, onLogout, showToast }) => {
  const [activeTab, setActiveTab] = useState('absences');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [absences, setAbsences] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [absRes, clubsRes, appsRes] = await Promise.all([
        fetch(`/api/absences?class_name=${encodeURIComponent(user.class_name)}`),
        fetch('/api/clubs'),
        fetch('/api/clubs/applications'),
      ]);

      const absData = await absRes.json();
      const clubsData = await clubsRes.json();
      const appsData = await appsRes.json();

      setAbsences(absData);
      setClubs(clubsData);
      setApplications(appsData.filter((a) => !a.class_name || a.class_name === user.class_name));
    } catch {
      showToast('Ошибка загрузки данных журнала', 'error');
    }
  }, [user.class_name, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/absences/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) throw new Error('Ошибка подтверждения');
      showToast('Справка успешно принята', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReject = async (reason) => {
    if (!rejectingId) return;
    try {
      const res = await fetch(`/api/absences/${rejectingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejection_reason: reason }),
      });
      if (!res.ok) throw new Error('Ошибка при отклонении');
      showToast('Справка отклонена', 'info');
      setRejectingId(null);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddAbsence = async (payload) => {
    try {
      const res = await fetch('/api/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: payload.student_name,
          class_name: user.class_name,
          reason: payload.reason,
          dates: payload.dates,
          has_certificate: true,
        }),
      });
      if (!res.ok) throw new Error('Ошибка сохранения');
      showToast('Запись об отсутствии внесена в журнал', 'success');
      setIsAddOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAppStatus = async (appId, status) => {
    try {
      const res = await fetch(`/api/clubs/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Ошибка обновления');
      showToast(status === 'approved' ? 'Заявление одобрено' : 'Заявление отклонено', 'info');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const pendingCount = absences.filter((a) => a.status === 'pending').length;
  const approvedCount = absences.filter((a) => a.status === 'approved').length;
  const pendingClubsCount = applications.filter((a) => a.status === 'pending').length;

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
    <div className="container">
      <div className="stats-grid">
        <div
          className="stat-card stat-card-action"
          onClick={() => {
            setActiveTab('absences');
            setFilter('pending');
          }}
        >
          <div className="stat-label">Справок на проверке</div>
          <div className="stat-val text-amber">{pendingCount}</div>
          <div className="stat-sub">Ожидают подтверждения</div>
        </div>

        <div
          className="stat-card stat-card-action"
          onClick={() => {
            setActiveTab('absences');
            setFilter('approved');
          }}
        >
          <div className="stat-label">Принятых справок</div>
          <div className="stat-val text-emerald">{approvedCount}</div>
          <div className="stat-sub">За текущую четверть</div>
        </div>

        <div
          className="stat-card stat-card-action"
          onClick={() => setActiveTab('clubs')}
        >
          <div className="stat-label">Заявок в кружки</div>
          <div className="stat-val text-indigo">{pendingClubsCount}</div>
          <div className="stat-sub">Внеурочная деятельность</div>
        </div>

        <div
          className="stat-card stat-card-action"
          onClick={() => setIsRosterOpen(true)}
        >
          <div className="stat-label">Учеников в классе</div>
          <div className="stat-val">28</div>
          <div className="stat-sub text-blue">Открыть журнал класса →</div>
        </div>
      </div>

      <div className="screen-tabs">
        <button
          type="button"
          className={`screen-tab-btn ${activeTab === 'absences' ? 'active' : ''}`}
          onClick={() => setActiveTab('absences')}
        >
          Справки и заявления
        </button>
        <button
          type="button"
          className={`screen-tab-btn ${activeTab === 'clubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('clubs')}
        >
          Кружки и секции
          {pendingClubsCount > 0 && <span className="tab-badge">{pendingClubsCount}</span>}
        </button>
      </div>

      {activeTab === 'absences' ? (
        <div className="tab-content">
          <div className="toolbar">
            <div className="filter-group">
              <span className="toolbar-label">Фильтр:</span>
              {[
                { k: 'all', l: 'Все' },
                { k: 'pending', l: 'На проверке' },
                { k: 'approved', l: 'Одобренные' },
                { k: 'rejected', l: 'Отклоненные' },
              ].map((f) => (
                <button
                  key={f.k}
                  type="button"
                  className={`chip ${filter === f.k ? 'active' : ''}`}
                  onClick={() => setFilter(f.k)}
                >
                  {f.l}
                </button>
              ))}
            </div>

            <div className="toolbar-actions">
              <input
                type="text"
                className="search-input"
                placeholder="Поиск по ученику или причине..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddOpen(true)}
              >
                + Внести справку
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsRosterOpen(true)}
              >
                Журнал класса (28)
              </button>
              <button
                type="button"
                className="btn btn-icon"
                title="Обновить"
                onClick={loadData}
              >
                ↻
              </button>
            </div>
          </div>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ученик</th>
                  <th>Причина отсутствия</th>
                  <th>Период</th>
                  <th>Скан документа</th>
                  <th>Статус</th>
                  <th className="text-right">Решение</th>
                </tr>
              </thead>
              <tbody>
                {filteredAbsences.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      Справок по выбранному фильтру не найдено
                    </td>
                  </tr>
                ) : (
                  filteredAbsences.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong className="font-semibold">{item.student_name}</strong>
                      </td>
                      <td>
                        <div>{item.reason}</div>
                        {item.rejection_reason && (
                          <div className="text-xs text-rose mt-1">Отказ: {item.rejection_reason}</div>
                        )}
                      </td>
                      <td className="font-semibold whitespace-nowrap">{item.dates}</td>
                      <td>
                        {item.has_certificate ? (
                          <button
                            type="button"
                            className="btn-doc"
                            onClick={() => setSelectedDoc(item)}
                          >
                            Скан документа ↗
                          </button>
                        ) : (
                          <span className="text-muted text-xs">Без файла</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="text-right whitespace-nowrap">
                        {item.status === 'pending' ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(item.id)}
                            >
                              Одобрить
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => setRejectingId(item.id)}
                            >
                              Отклонить
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted text-xs font-semibold">Обработано</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="tab-content">
          <div className="section-header">
            <h3>Заявления учеников в секции и кружки</h3>
            <p className="text-muted text-sm">Проверьте заявки от родителей и примите решение о зачислении</p>
          </div>

          <div className="table-card mb-6">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ученик</th>
                  <th>Название кружка</th>
                  <th>Ф.И.О. родителя</th>
                  <th>Телефон</th>
                  <th>Статус</th>
                  <th className="text-right">Решение</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      Заявлений в кружки пока нет
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => {
                    const club = clubs.find((c) => c.id === app.club_id);
                    return (
                      <tr key={app.id}>
                        <td>
                          <strong>{app.student_name}</strong>
                        </td>
                        <td className="text-indigo font-semibold">{club?.title || `Кружок №${app.club_id}`}</td>
                        <td>{app.parent_name}</td>
                        <td className="font-mono text-sm">{app.parent_phone}</td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="text-right whitespace-nowrap">
                          {app.status === 'pending' ? (
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() => handleAppStatus(app.id, 'approved')}
                              >
                                Принять
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleAppStatus(app.id, 'rejected')}
                              >
                                Отклонить
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted text-xs font-semibold">Решено</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="section-header">
            <h3>Школьные кружки и секции</h3>
          </div>
          <div className="cards-grid">
            {clubs.map((c) => {
              const enrolled = c.taken_slots ?? c.enrolled ?? 0;
              const capacity = c.max_slots ?? c.capacity ?? 15;
              return (
                <div key={c.id} className="club-card">
                  <div>
                    <div className="club-card-header">
                      <h4 className="club-card-title">{c.title}</h4>
                    </div>
                    <p className="club-card-desc">{c.description}</p>
                  </div>
                  <div className="club-meta">
                    <div className="club-meta-row">
                      <span>Преподаватель:</span>
                      <strong>{c.teacher_name}</strong>
                    </div>
                    <div className="club-meta-row">
                      <span>Расписание:</span>
                      <span>{c.schedule}</span>
                    </div>
                    <div className="club-meta-row">
                      <span>Кабинет:</span>
                      <span>{c.room}</span>
                    </div>
                    <div className="club-meta-row">
                      <span>Мест занято:</span>
                      <strong className="text-indigo">
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

      <DocumentModal absence={selectedDoc} onClose={() => setSelectedDoc(null)} />
      <RejectModal isOpen={!!rejectingId} onClose={() => setRejectingId(null)} onConfirm={handleReject} />
      <AddAbsenceModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAddAbsence} />
      <RosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        absences={absences}
        className={user.class_name}
      />
    </div>
  );
};

// --- ЭКРАН УЧАЩЕГОСЯ ---

const StudentDashboard = ({ user, onLogout, showToast }) => {
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
      const [absRes, clubsRes, appsRes] = await Promise.all([
        fetch(`/api/absences?class_name=${encodeURIComponent(user.class_name)}`),
        fetch('/api/clubs'),
        fetch('/api/clubs/applications'),
      ]);

      const allAbs = await absRes.json();
      setAbsences(allAbs.filter((a) => a.student_name.trim().toLowerCase() === user.full_name.trim().toLowerCase()));

      setClubs(await clubsRes.json());

      const allApps = await appsRes.json();
      setApplications(allApps.filter((a) => a.student_name.trim().toLowerCase() === user.full_name.trim().toLowerCase()));
    } catch {
      showToast('Ошибка загрузки данных ученика', 'error');
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
      const res = await fetch('/api/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: user.full_name,
          class_name: user.class_name,
          reason,
          dates,
          has_certificate: hasFile,
        }),
      });

      if (!res.ok) throw new Error('Не удалось сохранить справку');

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
      const res = await fetch('/api/clubs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club_id: clubId,
          student_name: user.full_name,
          class_name: user.class_name,
          parent_name: parentName,
          parent_phone: parentPhone,
        }),
      });
      if (!res.ok) throw new Error('Ошибка подачи заявления');
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
    <div className="container">
      <div className="stats-grid">
        <div className="stat-card stat-card-action" onClick={() => setActiveTab('history')}>
          <div className="stat-label">Подано справок</div>
          <div className="stat-val">{absences.length}</div>
          <div className="stat-sub">Всего обращений</div>
        </div>

        <div className="stat-card stat-card-action" onClick={() => setActiveTab('history')}>
          <div className="stat-label">Одобрено</div>
          <div className="stat-val text-emerald">{approvedCount}</div>
          <div className="stat-sub">Принято учителем</div>
        </div>

        <div className="stat-card stat-card-action" onClick={() => setActiveTab('history')}>
          <div className="stat-label">На проверке</div>
          <div className="stat-val text-amber">{pendingCount}</div>
          <div className="stat-sub">Ожидает решения</div>
        </div>

        <div className="stat-card stat-card-action" onClick={() => setActiveTab('clubs')}>
          <div className="stat-label">Мои кружки</div>
          <div className="stat-val text-indigo">{applications.length}</div>
          <div className="stat-sub">Подано заявлений</div>
        </div>
      </div>

      <div className="screen-tabs">
        <button
          type="button"
          className={`screen-tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          Подать справку
        </button>
        <button
          type="button"
          className={`screen-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Мои справки
          {absences.length > 0 && <span className="tab-badge">{absences.length}</span>}
        </button>
        <button
          type="button"
          className={`screen-tab-btn ${activeTab === 'clubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('clubs')}
        >
          Кружки и секции
          <span className="tab-badge">{clubs.length}</span>
        </button>
      </div>

      {activeTab === 'submit' && (
        <div className="tab-content">
          <div className="form-card max-w-xl mx-auto">
            <div className="card-header">
              <h3>Электронная подача справки об отсутствии</h3>
              <p className="text-muted text-sm">
                Документ поступит классному руководителю ({user.class_name} класс) на согласование
              </p>
            </div>

            <form onSubmit={handleSubmitAbsence} className="auth-form">
              <div className="form-group">
                <label>Причина отсутствия</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)}>
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

              <div className="form-row">
                <div className="form-group">
                  <label>Дата начала</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Дата окончания</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-check-card">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={hasFile}
                    onChange={(e) => setHasFile(e.target.checked)}
                  />
                  <div className="checkbox-text">
                    <strong>Прикрепить электронный подтверждающий документ</strong>
                    <span className="text-muted text-xs block">
                      Будет сформирован верифицированный скан бланка
                    </span>
                  </div>
                </label>
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
                {submitting ? 'Отправка...' : 'Отправить справку учителю'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="tab-content">
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Причина отсутствия</th>
                  <th>Период</th>
                  <th>Класс</th>
                  <th>Скан документа</th>
                  <th>Статус проверки</th>
                </tr>
              </thead>
              <tbody>
                {absences.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      Вы еще не подавали справок об отсутствии
                    </td>
                  </tr>
                ) : (
                  absences.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong className="font-semibold">{item.reason}</strong>
                        {item.rejection_reason && (
                          <div className="text-xs text-rose mt-1">Причина отказа: {item.rejection_reason}</div>
                        )}
                      </td>
                      <td className="font-semibold whitespace-nowrap">{item.dates}</td>
                      <td>{item.class_name}</td>
                      <td>
                        {item.has_certificate ? (
                          <button
                            type="button"
                            className="btn-doc"
                            onClick={() => setSelectedDoc(item)}
                          >
                            Смотреть скан ↗
                          </button>
                        ) : (
                          <span className="text-muted text-xs">Без файла</span>
                        )}
                      </td>
                      <td>
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

      {activeTab === 'clubs' && (
        <div className="tab-content">
          <div className="section-header">
            <h3>Каталог кружков и секций</h3>
            <p className="text-muted text-sm">Выберите направление и подайте онлайн-заявление на зачисление</p>
          </div>

          <div className="cards-grid">
            {clubs.map((c) => {
              const isApplied = appliedIds.has(c.id);
              const enrolled = c.taken_slots ?? c.enrolled ?? 0;
              const capacity = c.max_slots ?? c.capacity ?? 15;
              const isFull = enrolled >= capacity;

              const btn = isApplied ? (
                <button type="button" className="btn btn-outline btn-block" disabled>
                  Вы уже записаны
                </button>
              ) : isFull ? (
                <button type="button" className="btn btn-outline btn-block" disabled>
                  Группа укомплектована
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => setApplyingClub(c)}
                >
                  Подать заявление
                </button>
              );

              return (
                <div key={c.id} className="club-card">
                  <div>
                    <div className="club-card-header">
                      <h4 className="club-card-title">{c.title}</h4>
                      {isApplied && <span className="status-badge badge-approved">Заявка подана</span>}
                    </div>
                    <p className="club-card-desc">{c.description}</p>
                  </div>
                  <div className="club-meta">
                    <div className="club-meta-row">
                      <span>Преподаватель:</span>
                      <strong>{c.teacher_name}</strong>
                    </div>
                    <div className="club-meta-row">
                      <span>Расписание:</span>
                      <span>{c.schedule}</span>
                    </div>
                    <div className="club-meta-row">
                      <span>Кабинет:</span>
                      <span>{c.room}</span>
                    </div>
                    <div className="club-meta-row">
                      <span>Мест занято:</span>
                      <strong>
                        {enrolled} из {capacity}
                      </strong>
                    </div>
                    <div className="club-btn-wrap">{btn}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <DocumentModal absence={selectedDoc} onClose={() => setSelectedDoc(null)} />
      <ClubApplyModal
        club={applyingClub}
        user={user}
        onClose={() => setApplyingClub(null)}
        onApply={handleApplyClub}
      />
    </div>
  );
};

// --- ГЛАВНОЕ ПРИЛОЖЕНИЕ (APP) ---

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sferum_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('sferum_user', JSON.stringify(user));
    showToast(`Добро пожаловать, ${user.full_name}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('sferum_user');
    setCurrentUser(null);
    showToast('Вы вышли из системы', 'info');
  };

  return (
    <>
      {currentUser && <Header user={currentUser} onLogout={handleLogout} />}

      <main className="app-main">
        {!currentUser && <AuthScreen onLoginSuccess={handleLoginSuccess} />}

        {currentUser && currentUser.role === 'teacher' && (
          <TeacherDashboard user={currentUser} onLogout={handleLogout} showToast={showToast} />
        )}

        {currentUser && currentUser.role !== 'teacher' && (
          <StudentDashboard user={currentUser} onLogout={handleLogout} showToast={showToast} />
        )}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
