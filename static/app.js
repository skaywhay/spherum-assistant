// Сферум.Ассистент — Клиентское приложение

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

const state = {
  user: null,
  teacherAbsences: [],
  teacherClubs: [],
  teacherApplications: [],
  teacherFilter: 'all',
  teacherSearch: '',
  studentAbsences: [],
  studentClubs: [],
  studentApplications: [],
  rejectingAbsenceId: null,
};

// --- УВЕДОМЛЕНИЯ (TOAST) ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- УПРАВЛЕНИЕ ЭКРАНАМИ ---
function showScreen(screenName) {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('teacher-screen').classList.add('hidden');
  document.getElementById('student-screen').classList.add('hidden');

  const header = document.getElementById('main-header');

  if (screenName === 'auth') {
    header.classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
  } else if (screenName === 'teacher') {
    header.classList.remove('hidden');
    updateHeaderUI();
    document.getElementById('teacher-screen').classList.remove('hidden');
    loadTeacherData();
  } else if (screenName === 'student') {
    header.classList.remove('hidden');
    updateHeaderUI();
    document.getElementById('student-screen').classList.remove('hidden');
    loadStudentData();
  }
}

function updateHeaderUI() {
  if (!state.user) return;
  document.getElementById('user-display-name').textContent = state.user.full_name;
  document.getElementById('user-display-class').textContent = `Класс: ${state.user.class_name}`;
  
  const isTeacher = state.user.role === 'teacher';
  const badge = document.getElementById('user-role-badge');
  badge.textContent = isTeacher ? 'Учитель' : 'Ученик';
  badge.className = isTeacher ? 'badge-role' : 'demo-badge badge-student';
}

// --- АВТОРИЗАЦИЯ ---
async function login(email, password) {
  const errBox = document.getElementById('auth-error-box');
  errBox.classList.add('hidden');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Неверный логин или пароль');
    }

    state.user = data.user;
    localStorage.setItem('sferum_user', JSON.stringify(state.user));
    showToast(`Добро пожаловать, ${state.user.full_name}!`, 'success');

    if (state.user.role === 'teacher') {
      showScreen('teacher');
    } else {
      showScreen('student');
    }
  } catch (err) {
    errBox.textContent = err.message;
    errBox.classList.remove('hidden');
  }
}

async function register(payload) {
  const errBox = document.getElementById('auth-error-box');
  errBox.classList.add('hidden');

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Ошибка при регистрации');
    }

    state.user = data.user;
    localStorage.setItem('sferum_user', JSON.stringify(state.user));
    showToast(`Регистрация успешна! Добро пожаловать, ${state.user.full_name}!`, 'success');

    if (state.user.role === 'teacher') {
      showScreen('teacher');
    } else {
      showScreen('student');
    }
  } catch (err) {
    errBox.textContent = err.message;
    errBox.classList.remove('hidden');
  }
}

function logout() {
  localStorage.removeItem('sferum_user');
  state.user = null;
  showToast('Вы вышли из системы', 'info');
  showScreen('auth');
}

// --- ДАННЫЕ УЧИТЕЛЯ ---
async function loadTeacherData() {
  if (!state.user) return;
  try {
    const [absRes, clubsRes, appsRes] = await Promise.all([
      fetch(`/api/absences?class_name=${encodeURIComponent(state.user.class_name)}`),
      fetch('/api/clubs'),
      fetch('/api/clubs/applications'),
    ]);

    state.teacherAbsences = await absRes.json();
    state.teacherClubs = await clubsRes.json();
    const allApps = await appsRes.json();
    state.teacherApplications = allApps.filter(
      (a) => !a.class_name || a.class_name === state.user.class_name
    );

    renderTeacherStats();
    renderTeacherAbsencesTable();
    renderTeacherClubsTable();
    renderTeacherClubsCatalog();
  } catch (err) {
    showToast('Ошибка загрузки данных журнала', 'error');
  }
}

function renderTeacherStats() {
  const pending = state.teacherAbsences.filter((a) => a.status === 'pending').length;
  const approved = state.teacherAbsences.filter((a) => a.status === 'approved').length;
  const clubsPending = state.teacherApplications.filter((a) => a.status === 'pending').length;

  document.getElementById('stat-val-pending').textContent = pending;
  document.getElementById('stat-val-approved').textContent = approved;
  document.getElementById('stat-val-clubs').textContent = clubsPending;

  const badgeApps = document.getElementById('badge-teacher-apps-count');
  if (clubsPending > 0) {
    badgeApps.textContent = clubsPending;
    badgeApps.classList.remove('hidden');
  } else {
    badgeApps.classList.add('hidden');
  }
}

function renderTeacherAbsencesTable() {
  const tbody = document.getElementById('teacher-absences-tbody');
  if (!tbody) return;

  const filtered = state.teacherAbsences.filter((item) => {
    const matchFilter = state.teacherFilter === 'all' || item.status === state.teacherFilter;
    const matchSearch =
      item.student_name.toLowerCase().includes(state.teacherSearch.toLowerCase()) ||
      item.reason.toLowerCase().includes(state.teacherSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Справок по выбранному фильтру не найдено</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((item) => {
      const statusBadge = getStatusBadgeHtml(item.status);
      const docBtn = item.has_certificate
        ? `<button type="button" class="btn-doc" onclick="openDocModalById(${item.id})">Скан документа ↗</button>`
        : `<span class="text-muted text-xs">Без файла</span>`;

      const actions =
        item.status === 'pending'
          ? `<button type="button" class="btn btn-success btn-sm" onclick="approveAbsence(${item.id})">Одобрить</button>
             <button type="button" class="btn btn-danger btn-sm" onclick="openRejectModal(${item.id})">Отклонить</button>`
          : `<span class="text-muted text-xs font-semibold">Обработано</span>`;

      const rejectionNote = item.rejection_reason
        ? `<div class="text-xs text-rose mt-1">Отказ: ${escapeHtml(item.rejection_reason)}</div>`
        : '';

      return `
        <tr>
          <td><strong class="font-semibold">${escapeHtml(item.student_name)}</strong></td>
          <td>
            <div>${escapeHtml(item.reason)}</div>
            ${rejectionNote}
          </td>
          <td class="font-semibold whitespace-nowrap">${escapeHtml(item.dates)}</td>
          <td>${docBtn}</td>
          <td>${statusBadge}</td>
          <td class="text-right whitespace-nowrap">${actions}</td>
        </tr>
      `;
    })
    .join('');
}

function renderTeacherClubsTable() {
  const tbody = document.getElementById('teacher-clubs-tbody');
  if (!tbody) return;

  if (state.teacherApplications.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Заявлений в кружки пока нет</td></tr>`;
    return;
  }

  tbody.innerHTML = state.teacherApplications
    .map((app) => {
      const club = state.teacherClubs.find((c) => c.id === app.club_id);
      const clubTitle = club ? club.title : `Кружок №${app.club_id}`;
      const statusBadge = getStatusBadgeHtml(app.status);

      const actions =
        app.status === 'pending'
          ? `<button type="button" class="btn btn-success btn-sm" onclick="updateAppStatus(${app.id}, 'approved')">Принять</button>
             <button type="button" class="btn btn-danger btn-sm" onclick="updateAppStatus(${app.id}, 'rejected')">Отклонить</button>`
          : `<span class="text-muted text-xs font-semibold">Решено</span>`;

      return `
        <tr>
          <td><strong>${escapeHtml(app.student_name)}</strong></td>
          <td class="text-indigo font-semibold">${escapeHtml(clubTitle)}</td>
          <td>${escapeHtml(app.parent_name)}</td>
          <td class="font-mono text-sm">${escapeHtml(app.parent_phone)}</td>
          <td>${statusBadge}</td>
          <td class="text-right whitespace-nowrap">${actions}</td>
        </tr>
      `;
    })
    .join('');
}

function renderTeacherClubsCatalog() {
  const catalog = document.getElementById('teacher-clubs-catalog');
  if (!catalog) return;

  catalog.innerHTML = state.teacherClubs
    .map((c) => {
      const enrolled = c.taken_slots ?? c.enrolled ?? 0;
      const capacity = c.max_slots ?? c.capacity ?? 15;
      return `
      <div class="club-card">
        <div>
          <div class="club-card-header">
            <h4 class="club-card-title">${escapeHtml(c.title)}</h4>
          </div>
          <p class="club-card-desc">${escapeHtml(c.description)}</p>
        </div>
        <div class="club-meta">
          <div class="club-meta-row"><span>Преподаватель:</span><strong>${escapeHtml(c.teacher_name)}</strong></div>
          <div class="club-meta-row"><span>Расписание:</span><span>${escapeHtml(c.schedule)}</span></div>
          <div class="club-meta-row"><span>Кабинет:</span><span>${escapeHtml(c.room)}</span></div>
          <div class="club-meta-row"><span>Мест занято:</span><strong class="text-indigo">${enrolled} из ${capacity}</strong></div>
        </div>
      </div>
    `;
    })
    .join('');
}

// Решения учителя
async function approveAbsence(id) {
  try {
    const res = await fetch(`/api/absences/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    if (!res.ok) throw new Error('Ошибка подтверждения');
    showToast('Справка успешно принята', 'success');
    await loadTeacherData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function rejectAbsence(id, reason) {
  try {
    const res = await fetch(`/api/absences/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', rejection_reason: reason }),
    });
    if (!res.ok) throw new Error('Ошибка при отклонении');
    showToast('Справка отклонена', 'info');
    closeModal('modal-reject');
    await loadTeacherData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function updateAppStatus(appId, status) {
  try {
    const res = await fetch(`/api/clubs/applications/${appId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Ошибка обновления статуса');
    showToast(status === 'approved' ? 'Заявление одобрено' : 'Заявление отклонено', 'info');
    await loadTeacherData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// --- ДАННЫЕ УЧЕНИКА ---
async function loadStudentData() {
  if (!state.user) return;
  try {
    const [absRes, clubsRes, appsRes] = await Promise.all([
      fetch(`/api/absences?class_name=${encodeURIComponent(state.user.class_name)}`),
      fetch('/api/clubs'),
      fetch('/api/clubs/applications'),
    ]);

    const allAbs = await absRes.json();
    state.studentAbsences = allAbs.filter(
      (a) => a.student_name.trim().toLowerCase() === state.user.full_name.trim().toLowerCase()
    );

    state.studentClubs = await clubsRes.json();

    const allApps = await appsRes.json();
    state.studentApplications = allApps.filter(
      (app) => app.student_name.trim().toLowerCase() === state.user.full_name.trim().toLowerCase()
    );

    renderStudentStats();
    renderStudentHistoryTable();
    renderStudentClubsCatalog();
  } catch (err) {
    showToast('Ошибка загрузки данных ученика', 'error');
  }
}

function renderStudentStats() {
  const total = state.studentAbsences.length;
  const approved = state.studentAbsences.filter((a) => a.status === 'approved').length;
  const pending = state.studentAbsences.filter((a) => a.status === 'pending').length;
  const clubsCount = state.studentApplications.length;

  document.getElementById('stat-student-val-total').textContent = total;
  document.getElementById('stat-student-val-approved').textContent = approved;
  document.getElementById('stat-student-val-pending').textContent = pending;
  document.getElementById('stat-student-val-clubs').textContent = clubsCount;

  const historyBadge = document.getElementById('badge-student-history-count');
  if (total > 0) {
    historyBadge.textContent = total;
    historyBadge.classList.remove('hidden');
  } else {
    historyBadge.classList.add('hidden');
  }
}

function renderStudentHistoryTable() {
  const tbody = document.getElementById('student-history-tbody');
  if (!tbody) return;

  if (state.studentAbsences.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Вы еще не подавали справок об отсутствии</td></tr>`;
    return;
  }

  tbody.innerHTML = state.studentAbsences
    .map((item) => {
      const docBtn = item.has_certificate
        ? `<button type="button" class="btn-doc" onclick="openDocModalById(${item.id})">Смотреть скан ↗</button>`
        : `<span class="text-muted text-xs">Без файла</span>`;

      const rejection = item.rejection_reason
        ? `<div class="text-xs text-rose mt-1">Причина отказа: ${escapeHtml(item.rejection_reason)}</div>`
        : '';

      return `
        <tr>
          <td>
            <strong class="font-semibold">${escapeHtml(item.reason)}</strong>
            ${rejection}
          </td>
          <td class="font-semibold whitespace-nowrap">${escapeHtml(item.dates)}</td>
          <td>${escapeHtml(item.class_name)}</td>
          <td>${docBtn}</td>
          <td>${getStatusBadgeHtml(item.status)}</td>
        </tr>
      `;
    })
    .join('');
}

function renderStudentClubsCatalog() {
  const catalog = document.getElementById('student-clubs-catalog');
  if (!catalog) return;

  const appliedIds = new Set(state.studentApplications.map((a) => a.club_id));

  catalog.innerHTML = state.studentClubs
    .map((c) => {
      const isApplied = appliedIds.has(c.id);
      const enrolled = c.taken_slots ?? c.enrolled ?? 0;
      const capacity = c.max_slots ?? c.capacity ?? 15;
      const isFull = enrolled >= capacity;

      const btn = isApplied
        ? `<button type="button" class="btn btn-outline btn-block" disabled>Вы уже записаны</button>`
        : isFull
        ? `<button type="button" class="btn btn-outline btn-block" disabled>Группа укомплектована</button>`
        : `<button type="button" class="btn btn-primary btn-block" onclick="openClubApplyModal(${c.id}, '${escapeQuotes(c.title)}')">Подать заявление</button>`;

      return `
        <div class="club-card">
          <div>
            <div class="club-card-header">
              <h4 class="club-card-title">${escapeHtml(c.title)}</h4>
              ${isApplied ? '<span class="status-badge badge-approved">Заявка подана</span>' : ''}
            </div>
            <p class="club-card-desc">${escapeHtml(c.description)}</p>
          </div>
          <div class="club-meta">
            <div class="club-meta-row"><span>Преподаватель:</span><strong>${escapeHtml(c.teacher_name)}</strong></div>
            <div class="club-meta-row"><span>Расписание:</span><span>${escapeHtml(c.schedule)}</span></div>
            <div class="club-meta-row"><span>Кабинет:</span><span>${escapeHtml(c.room)}</span></div>
            <div class="club-meta-row"><span>Мест занято:</span><strong class="text-indigo">${enrolled} из ${capacity}</strong></div>
            <div class="club-btn-wrap">${btn}</div>
          </div>
        </div>
      `;
    })
    .join('');
}

// Отправка справки учащимся
async function submitAbsenceForm(e) {
  e.preventDefault();
  if (!state.user) return;

  const reason = document.getElementById('absence-reason-select').value;
  const start = document.getElementById('absence-date-start').value;
  const end = document.getElementById('absence-date-end').value;
  const hasFile = document.getElementById('absence-has-file').checked;

  if (!start || !end) {
    showToast('Укажите дату начала и окончания', 'error');
    return;
  }

  const formatDate = (val) => {
    const p = val.split('-');
    return `${p[2]}.${p[1]}`;
  };
  const dates = `${formatDate(start)} - ${formatDate(end)}`;

  const btn = document.getElementById('btn-submit-absence');
  btn.disabled = true;
  btn.textContent = 'Отправка...';

  try {
    const res = await fetch('/api/absences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: state.user.full_name,
        class_name: state.user.class_name,
        reason,
        dates,
        has_certificate: hasFile,
      }),
    });

    if (!res.ok) throw new Error('Не удалось сохранить справку');

    showToast('Справка передана на проверку учителю!', 'success');
    document.getElementById('absence-date-start').value = '';
    document.getElementById('absence-date-end').value = '';

    await loadStudentData();

    // Переключаем на вкладку "Мои справки"
    document.getElementById('tab-student-history').click();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Отправить справку учителю';
  }
}

// Подача заявления в кружок
async function submitClubApplyForm(e) {
  e.preventDefault();
  if (!state.user) return;

  const clubId = parseInt(document.getElementById('club-apply-id').value, 10);
  const parentName = document.getElementById('club-apply-parent-name').value.trim();
  const parentPhone = document.getElementById('club-apply-parent-phone').value.trim();

  if (!parentName || !parentPhone) return;

  const btn = document.getElementById('btn-submit-club-apply');
  btn.disabled = true;

  try {
    const res = await fetch('/api/clubs/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        club_id: clubId,
        student_name: state.user.full_name,
        class_name: state.user.class_name,
        parent_name: parentName,
        parent_phone: parentPhone,
      }),
    });

    if (!res.ok) throw new Error('Ошибка подачи заявления');

    showToast('Заявление в кружок успешно отправлено', 'success');
    closeModal('modal-club-apply');
    await loadStudentData();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

// Ручное внесение справки учителем
async function submitManualAbsenceForm(e) {
  e.preventDefault();
  if (!state.user) return;

  const student = document.getElementById('manual-student-name').value.trim();
  const reason = document.getElementById('manual-reason').value;
  const dates = document.getElementById('manual-dates').value.trim();

  if (!student || !dates) return;

  try {
    const res = await fetch('/api/absences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: student,
        class_name: state.user.class_name,
        reason,
        dates,
        has_certificate: true,
      }),
    });

    if (!res.ok) throw new Error('Не удалось добавить справку');

    showToast('Запись об отсутствии добавлена в журнал', 'success');
    closeModal('modal-add-absence');
    document.getElementById('manual-student-name').value = '';
    document.getElementById('manual-dates').value = '';
    await loadTeacherData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// --- МОДАЛЬНЫЕ ОКНА И ДОКУМЕНТЫ ---
function openDocModalById(absenceId) {
  const item =
    state.teacherAbsences.find((a) => a.id === absenceId) ||
    state.studentAbsences.find((a) => a.id === absenceId);

  if (!item) return;

  document.getElementById('doc-modal-student').textContent = `Ученик: ${item.student_name} (${item.class_name})`;

  // Скрываем все типы бланков
  document.getElementById('doc-type-medical').classList.add('hidden');
  document.getElementById('doc-type-parent').classList.add('hidden');
  document.getElementById('doc-type-olympiad').classList.add('hidden');
  document.getElementById('doc-type-duty').classList.add('hidden');

  const r = item.reason.toLowerCase();

  if (
    r.includes('болезн') ||
    r.includes('орви') ||
    r.includes('врач') ||
    r.includes('поликлиник') ||
    r.includes('температур') ||
    r.includes('грипп') ||
    r.includes('медсправк')
  ) {
    document.getElementById('doc-med-name').textContent = item.student_name;
    document.getElementById('doc-med-class').textContent = `${item.class_name}, ГБОУ СОШ №1502`;
    document.getElementById('doc-med-dates').textContent = item.dates;
    document.getElementById('doc-type-medical').classList.remove('hidden');
  } else if (
    r.includes('семейн') ||
    r.includes('родител') ||
    r.includes('заявлен') ||
    r.includes('обстоятельств')
  ) {
    document.getElementById('doc-parent-name').textContent = item.student_name;
    document.getElementById('doc-parent-class').textContent = item.class_name;
    document.getElementById('doc-parent-dates').textContent = item.dates;
    document.getElementById('doc-parent-reason').textContent = item.reason;
    document.getElementById('doc-type-parent').classList.remove('hidden');
  } else if (
    r.includes('олимпиад') ||
    r.includes('всош') ||
    r.includes('соревнован') ||
    r.includes('конкурс')
  ) {
    document.getElementById('doc-oly-name').textContent = item.student_name;
    document.getElementById('doc-oly-class').textContent = item.class_name;
    document.getElementById('doc-oly-dates').textContent = item.dates;
    document.getElementById('doc-type-olympiad').classList.remove('hidden');
  } else {
    document.getElementById('doc-duty-name').textContent = item.student_name;
    document.getElementById('doc-duty-class').textContent = item.class_name;
    document.getElementById('doc-duty-dates').textContent = item.dates;
    document.getElementById('doc-duty-reason').textContent = item.reason;
    document.getElementById('doc-type-duty').classList.remove('hidden');
  }

  openModal('modal-doc');
}

function openRejectModal(absenceId) {
  state.rejectingAbsenceId = absenceId;
  openModal('modal-reject');
}

function openClubApplyModal(clubId, title) {
  document.getElementById('club-apply-id').value = clubId;
  document.getElementById('club-apply-subtitle').textContent = title;
  document.getElementById('club-apply-student').value = `${state.user.full_name} (${state.user.class_name})`;
  openModal('modal-club-apply');
}

function openRosterModal() {
  const tbody = document.getElementById('roster-tbody');
  if (!tbody) return;

  tbody.innerHTML = CLASS_9A_ROSTER.map((s) => {
    const match = state.teacherAbsences.find(
      (a) => a.student_name.trim().toLowerCase() === s.name.trim().toLowerCase()
    );

    let statusPill = `<span class="status-badge badge-approved">Присутствует</span>`;
    if (match) {
      if (match.status === 'approved') {
        statusPill = `<span class="status-badge badge-role" title="${escapeQuotes(match.reason)}">Справка принята</span>`;
      } else if (match.status === 'pending') {
        statusPill = `<span class="status-badge badge-pending" title="${escapeQuotes(match.reason)}">Справка на проверке</span>`;
      }
    }

    return `
      <tr>
        <td class="font-mono text-muted">${s.id}</td>
        <td><strong>${escapeHtml(s.name)}</strong></td>
        <td>${s.gender}</td>
        <td class="font-mono text-xs text-muted">${s.birth}</td>
        <td class="font-mono text-xs">${s.phone}</td>
        <td>${statusPill}</td>
      </tr>
    `;
  }).join('');

  openModal('modal-roster');
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function getStatusBadgeHtml(status) {
  if (status === 'approved') return `<span class="status-badge badge-approved">Одобрено</span>`;
  if (status === 'rejected') return `<span class="status-badge badge-rejected">Отклонено</span>`;
  return `<span class="status-badge badge-pending">На проверке</span>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeQuotes(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// --- ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ ---
document.addEventListener('DOMContentLoaded', () => {
  // Проверка сохраненного пользователя
  try {
    const saved = localStorage.getItem('sferum_user');
    if (saved) {
      state.user = JSON.parse(saved);
      if (state.user.role === 'teacher') {
        showScreen('teacher');
      } else {
        showScreen('student');
      }
    } else {
      showScreen('auth');
    }
  } catch (e) {
    showScreen('auth');
  }

  // Кнопка выхода
  document.getElementById('btn-logout').addEventListener('click', logout);

  // Табы авторизации (Вход / Регистрация)
  const tabSignin = document.getElementById('tab-btn-signin');
  const tabSignup = document.getElementById('tab-btn-signup');
  const formSignin = document.getElementById('form-signin');
  const formSignup = document.getElementById('form-signup');

  tabSignin.addEventListener('click', () => {
    tabSignin.classList.add('active');
    tabSignup.classList.remove('active');
    formSignin.classList.remove('hidden');
    formSignup.classList.add('hidden');
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabSignin.classList.remove('active');
    formSignup.classList.remove('hidden');
    formSignin.classList.add('hidden');
  });

  // Отправка форм входа и регистрации
  formSignin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const pass = document.getElementById('signin-password').value.trim();
    login(email, pass);
  });

  formSignup.addEventListener('submit', (e) => {
    e.preventDefault();
    register({
      full_name: document.getElementById('signup-name').value.trim(),
      role: document.getElementById('signup-role').value,
      class_name: document.getElementById('signup-class').value,
      email: document.getElementById('signup-email').value.trim(),
      password: document.getElementById('signup-password').value.trim(),
    });
  });

  // Быстрый вход по демо-кнопкам для жюри
  document.querySelectorAll('.demo-card').forEach((card) => {
    card.addEventListener('click', () => {
      const email = card.dataset.email;
      const pass = card.dataset.pass;
      login(email, pass);
    });
  });

  // Вкладки учителя
  const tTabAbs = document.getElementById('tab-teacher-absences');
  const tTabClubs = document.getElementById('tab-teacher-clubs');
  const tContentAbs = document.getElementById('content-teacher-absences');
  const tContentClubs = document.getElementById('content-teacher-clubs');

  tTabAbs.addEventListener('click', () => {
    tTabAbs.classList.add('active');
    tTabClubs.classList.remove('active');
    tContentAbs.classList.remove('hidden');
    tContentClubs.classList.add('hidden');
  });

  tTabClubs.addEventListener('click', () => {
    tTabClubs.classList.add('active');
    tTabAbs.classList.remove('active');
    tContentClubs.classList.remove('hidden');
    tContentAbs.classList.add('hidden');
  });

  // Фильтры учителя
  document.querySelectorAll('.chip[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip[data-filter]').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.teacherFilter = chip.dataset.filter;
      renderTeacherAbsencesTable();
    });
  });

  // Поиск учителя
  const searchInput = document.getElementById('teacher-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.teacherSearch = e.target.value.trim();
      renderTeacherAbsencesTable();
    });
  }

  // Кнопки открытия модалок учителя
  document.getElementById('btn-open-add-absence').addEventListener('click', () => openModal('modal-add-absence'));
  document.getElementById('btn-open-roster').addEventListener('click', openRosterModal);
  document.getElementById('btn-open-roster-secondary').addEventListener('click', openRosterModal);
  document.getElementById('btn-teacher-refresh').addEventListener('click', loadTeacherData);

  // Формы модалок
  document.getElementById('form-manual-absence').addEventListener('submit', submitManualAbsenceForm);
  document.getElementById('form-reject-absence').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.rejectingAbsenceId) return;
    const reason = document.getElementById('reject-reason-select').value;
    rejectAbsence(state.rejectingAbsenceId, reason);
  });

  // Вкладки ученика
  const sTabSubmit = document.getElementById('tab-student-submit');
  const sTabHistory = document.getElementById('tab-student-history');
  const sTabClubs = document.getElementById('tab-student-clubs');
  const sContentSubmit = document.getElementById('content-student-submit');
  const sContentHistory = document.getElementById('content-student-history');
  const sContentClubs = document.getElementById('content-student-clubs');

  sTabSubmit.addEventListener('click', () => {
    sTabSubmit.classList.add('active');
    sTabHistory.classList.remove('active');
    sTabClubs.classList.remove('active');
    sContentSubmit.classList.remove('hidden');
    sContentHistory.classList.add('hidden');
    sContentClubs.classList.add('hidden');
  });

  sTabHistory.addEventListener('click', () => {
    sTabHistory.classList.add('active');
    sTabSubmit.classList.remove('active');
    sTabClubs.classList.remove('active');
    sContentHistory.classList.remove('hidden');
    sContentSubmit.classList.add('hidden');
    sContentClubs.classList.add('hidden');
  });

  sTabClubs.addEventListener('click', () => {
    sTabClubs.classList.add('active');
    sTabSubmit.classList.remove('active');
    sTabHistory.classList.remove('active');
    sContentClubs.classList.remove('hidden');
    sContentSubmit.classList.add('hidden');
    sContentHistory.classList.add('hidden');
  });

  // Формы ученика
  document.getElementById('form-submit-absence').addEventListener('submit', submitAbsenceForm);
  document.getElementById('form-club-apply').addEventListener('submit', submitClubApplyForm);

  // Закрытие модалок по крестику и кнопкам
  document.querySelectorAll('[data-modal]').forEach((el) => {
    el.addEventListener('click', () => closeModal(el.dataset.modal));
  });

  // Закрытие модалок по клику на фон
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add('hidden');
      }
    });
  });

  // Закрытие по Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop').forEach((m) => m.classList.add('hidden'));
    }
  });
});
