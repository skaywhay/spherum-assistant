// Логика управления прелоадером с кристаллами
let loaderTimer = null;

function showLoader(caption = 'Загрузка...', delayMs = 120) {
  const loader = document.getElementById('page-loader');
  const captionEl = document.getElementById('loader-caption');
  if (!loader) return;

  if (captionEl) {
    captionEl.textContent = caption;
  }

  // Если операция моментальная, не мигаем лоадером.
  // Показываем только если прошло более delayMs (например, 120ms)
  if (delayMs > 0) {
    clearTimeout(loaderTimer);
    loaderTimer = setTimeout(() => {
      loader.classList.remove('hidden');
    }, delayMs);
  } else {
    loader.classList.remove('hidden');
  }
}

function hideLoader() {
  clearTimeout(loaderTimer);
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.classList.add('hidden');
  }
}

// Логика авторизации и регистрации
function toggleAuthMode(mode) {
  const signinView = document.getElementById('signin-view');
  const signupView = document.getElementById('signup-view');
  clearErrors();

  if (mode === 'signup') {
    signinView.classList.add('hidden');
    signupView.classList.remove('hidden');
  } else {
    signupView.classList.add('hidden');
    signinView.classList.remove('hidden');
  }
}

function handleRoleChange(role) {
  const classGroup = document.getElementById('class-group');
  const classInput = document.getElementById('signup-class');
  if (role === 'teacher') {
    classGroup.classList.remove('hidden');
    classInput.placeholder = 'Класс руководства (например, 9-А)';
  } else {
    classGroup.classList.remove('hidden');
    classInput.placeholder = 'Класс ребенка (например, 9-А)';
  }
}

function clearErrors() {
  const signinErr = document.getElementById('signin-error');
  const signupErr = document.getElementById('signup-error');
  if (signinErr) signinErr.classList.add('hidden');
  if (signupErr) signupErr.classList.add('hidden');
}

function showError(elementId, message) {
  const box = document.getElementById(elementId);
  if (box) {
    box.textContent = message;
    box.classList.remove('hidden');
  }
}

async function handleSignIn(event) {
  event.preventDefault();
  clearErrors();

  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  const submitBtn = document.getElementById('btn-signin');

  setButtonLoading(submitBtn, true);
  showLoader('Проверка учетных данных...');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Неверный email или пароль');
    }

    // Сохраняем сессию пользователя
    localStorage.setItem('sferum_user', JSON.stringify(data.user));
    localStorage.setItem('sferum_token', data.token || 'demo_token');

    showLoader('Успешный вход! Загрузка кабинета...', 0);
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 450);
  } catch (err) {
    hideLoader();
    showError('signin-error', err.message || 'Ошибка подключения к серверу');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

async function handleSignUp(event) {
  event.preventDefault();
  clearErrors();

  const role = document.querySelector('input[name="role"]:checked')?.value || 'teacher';
  const fullName = document.getElementById('signup-name').value.trim();
  const className = document.getElementById('signup-class').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const submitBtn = document.getElementById('btn-signup');

  setButtonLoading(submitBtn, true);
  showLoader('Создание аккаунта...');

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        full_name: fullName,
        class_name: className,
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Ошибка при регистрации');
    }

    // Сохраняем сессию
    localStorage.setItem('sferum_user', JSON.stringify(data.user));
    localStorage.setItem('sferum_token', data.token || 'demo_token');

    showLoader('Регистрация успешна! Открываем сервис...', 0);
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 450);
  } catch (err) {
    hideLoader();
    showError('signup-error', err.message || 'Ошибка регистрации');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// Подстановка учетных данных выбранного аккаунта в поля формы
function fillCredentials(email, password) {
  // Переключаем на форму входа, если была открыта регистрация
  toggleAuthMode('signin');
  clearErrors();

  const emailInput = document.getElementById('signin-email');
  const passwordInput = document.getElementById('signin-password');
  const submitBtn = document.getElementById('btn-signin');

  if (emailInput && passwordInput) {
    emailInput.value = email;
    passwordInput.value = password;

    // Анимация подсветки полей для наглядности
    emailInput.classList.remove('input-highlight');
    passwordInput.classList.remove('input-highlight');
    void emailInput.offsetWidth; // сброс анимации
    emailInput.classList.add('input-highlight');
    passwordInput.classList.add('input-highlight');

    if (submitBtn) {
      submitBtn.focus();
    }
  }
}

function setButtonLoading(btn, isLoading) {
  if (!btn) return;
  btn.disabled = isLoading;
  const textSpan = btn.querySelector('.btn-text');
  if (textSpan) {
    textSpan.style.opacity = isLoading ? '0.6' : '1';
  }
}
