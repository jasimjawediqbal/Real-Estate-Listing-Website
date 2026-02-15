const GOOGLE_CLIENT_ID = '619721643105-lrh7n9l1rk52feknk2qhivosm8nqlc2m.apps.googleusercontent.com';
let googleAuthInitialized = false;
let authMessageBoxOnClose = null;
let authMessageBoxAutoCloseTimer = null;
let authMessageBoxCloseTimer = null;
let authMessageBoxFadeOutMs = 250;

function clearAuthMessageBoxTimers() {
    if (authMessageBoxAutoCloseTimer) {
        clearTimeout(authMessageBoxAutoCloseTimer);
        authMessageBoxAutoCloseTimer = null;
    }

    if (authMessageBoxCloseTimer) {
        clearTimeout(authMessageBoxCloseTimer);
        authMessageBoxCloseTimer = null;
    }
}

function ensureAuthMessageBox() {
    let overlay = document.getElementById('authMessageBoxOverlay');
    if (overlay) {
        return overlay;
    }

    overlay = document.createElement('div');
    overlay.id = 'authMessageBoxOverlay';
    overlay.className = 'auth-message-box-overlay';
    overlay.innerHTML = `
        <div class="auth-message-box" role="dialog" aria-modal="true" aria-labelledby="authMessageBoxTitle">
            <h3 id="authMessageBoxTitle" class="auth-message-box-title"></h3>
            <p id="authMessageBoxBody" class="auth-message-box-body"></p>
            <button id="authMessageBoxCloseBtn" type="button" class="auth-message-box-btn">OK</button>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('#authMessageBoxCloseBtn');
    closeBtn.addEventListener('click', closeAuthMessageBox);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeAuthMessageBox();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay.classList.contains('show')) {
            closeAuthMessageBox();
        }
    });

    return overlay;
}

function showAuthMessageBox(message, options = {}) {
    const overlay = ensureAuthMessageBox();
    const box = overlay.querySelector('.auth-message-box');
    const titleEl = overlay.querySelector('#authMessageBoxTitle');
    const bodyEl = overlay.querySelector('#authMessageBoxBody');
    const closeBtn = overlay.querySelector('#authMessageBoxCloseBtn');
    const title = options.title || 'Message';
    const type = options.type || 'info';
    const showCloseButton = options.showCloseButton !== false;
    const autoCloseMs = Number(options.autoCloseMs) || 0;
    const fadeOutMs = Number(options.fadeOutMs) || 250;

    clearAuthMessageBoxTimers();

    authMessageBoxOnClose = typeof options.onClose === 'function' ? options.onClose : null;
    authMessageBoxFadeOutMs = fadeOutMs > 0 ? fadeOutMs : 250;

    titleEl.textContent = title;
    bodyEl.textContent = message;
    closeBtn.style.display = showCloseButton ? 'inline-block' : 'none';
    box.classList.remove('is-success', 'is-error', 'is-info');
    box.classList.add(`is-${type}`);
    overlay.classList.remove('is-closing', 'slow-close');
    overlay.classList.add('show');

    if (showCloseButton) {
        closeBtn.focus();
    }

    if (autoCloseMs > 0) {
        authMessageBoxAutoCloseTimer = setTimeout(() => {
            closeAuthMessageBox({ fadeOutMs: authMessageBoxFadeOutMs });
        }, autoCloseMs);
    }
}

function closeAuthMessageBox(options = {}) {
    const overlay = document.getElementById('authMessageBoxOverlay');
    if (!overlay) {
        return;
    }

    if (!overlay.classList.contains('show') || overlay.classList.contains('is-closing')) {
        return;
    }

    clearAuthMessageBoxTimers();

    const requestedFadeMs = Number(options.fadeOutMs);
    const fadeOutMs = requestedFadeMs > 0 ? requestedFadeMs : authMessageBoxFadeOutMs;

    if (fadeOutMs >= 700) {
        overlay.classList.add('slow-close');
    } else {
        overlay.classList.remove('slow-close');
    }

    overlay.classList.add('is-closing');

    authMessageBoxCloseTimer = setTimeout(() => {
        overlay.classList.remove('show', 'is-closing', 'slow-close');

        if (authMessageBoxOnClose) {
            const callback = authMessageBoxOnClose;
            authMessageBoxOnClose = null;
            callback();
        }
    }, fadeOutMs);
}

function switchToLogin() {
    const tabSlider = document.getElementById('tabSlider');
    const signupTab = document.getElementById('signupTab');
    const loginTab = document.getElementById('loginTab');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');

    tabSlider.classList.add('slide-right-tab');
    signupTab.classList.remove('active');
    loginTab.classList.add('active');
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
    formTitle.textContent = 'Welcome Back';
    formSubtitle.textContent = 'Log in to continue to PropertyHub';
}

function switchToSignup() {
    const tabSlider = document.getElementById('tabSlider');
    const signupTab = document.getElementById('signupTab');
    const loginTab = document.getElementById('loginTab');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');

    tabSlider.classList.remove('slide-right-tab');
    loginTab.classList.remove('active');
    signupTab.classList.add('active');
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
    formTitle.textContent = 'Create Account';
    formSubtitle.textContent = 'Get started with PropertyHub today';
}

async function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('signup-fullname').value.trim();
    const email = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;

    try {
        const res = await fetch('api/signup.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Signup failed');
        }

        showAuthMessageBox(data.message || 'Account created successfully', {
            title: 'Signup Successful',
            type: 'success',
            onClose: switchToLogin
        });
    } catch (err) {
        showAuthMessageBox('Signup failed: ' + err.message, {
            title: 'Signup Failed',
            type: 'error'
        });
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Login failed');
        }

        showAuthMessageBox('Welcome, ' + data.user.name, {
            title: 'Login Successful',
            type: 'success',
            showCloseButton: false,
            autoCloseMs: 1400,
            fadeOutMs: 900,
            onClose: () => {
                window.location.href = 'index.html';
            }
        });
    } catch (err) {
        showAuthMessageBox('Login failed: ' + err.message, {
            title: 'Login Failed',
            type: 'error'
        });
    }
}

function initializeGoogleAuth() {
    if (googleAuthInitialized) return true;

    if (!window.google || !google.accounts || !google.accounts.id) {
        console.error('Google Identity Services script not loaded.');
        return false;
    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        ux_mode: 'popup'
    });

    googleAuthInitialized = true;
    return true;
}

function startGoogleAuth() {
    if (!initializeGoogleAuth()) {
        showAuthMessageBox('Google sign-in is not available right now. Please try again.', {
            title: 'Google Sign-In',
            type: 'error'
        });
        return;
    }

    google.accounts.id.prompt((notification) => {
        if (
            notification &&
            typeof notification.isNotDisplayed === 'function' &&
            notification.isNotDisplayed()
        ) {
            const reason =
                typeof notification.getNotDisplayedReason === 'function'
                    ? notification.getNotDisplayedReason()
                    : 'unknown';
            console.warn('Google sign-in prompt not displayed:', reason);
        }
    });
}

function signUpWithGoogle() {
    startGoogleAuth();
}

function loginWithGoogle() {
    startGoogleAuth();
}

async function handleCredentialResponse(response) {
    if (!response || !response.credential) {
        showAuthMessageBox('Google login failed: Missing credential token.', {
            title: 'Google Login Failed',
            type: 'error'
        });
        return;
    }

    try {
        const res = await fetch('api/google-login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
            throw new Error(result.error || 'Google authentication failed');
        }

        showAuthMessageBox('Welcome, ' + result.user.name, {
            title: 'Login Successful',
            type: 'success',
            showCloseButton: false,
            autoCloseMs: 1400,
            fadeOutMs: 900,
            onClose: () => {
                window.location.href = 'index.html';
            }
        });
    } catch (err) {
        showAuthMessageBox('Google login failed: ' + err.message, {
            title: 'Google Login Failed',
            type: 'error'
        });
    }
}

function forgotPassword(event) {
    if (event) event.preventDefault();
    showAuthMessageBox('Forgot password is not configured yet. Please contact support@primeproperties.com.', {
        title: 'Forgot Password',
        type: 'info'
    });
}

function togglePassword(fieldId, iconElement) {
    const input = document.getElementById(fieldId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);

    if (type === 'text') {
        iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 1l22 22M12 5c-7 0-11 7-11 7s2.59 4.52 7.05 6.62M12 19c7 0 11-7 11-7s-2.59-4.52-7.05-6.62"/>
            <circle cx="12" cy="12" r="2.5"/>
        </svg>`;
    } else {
        iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
            <circle cx="12" cy="12" r="2.5"/>
        </svg>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeGoogleAuth();
});

