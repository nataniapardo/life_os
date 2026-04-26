/* ============================================================
   LIFE OS — script.js
   Handles: Auth (login/signup), App logic, Tasks, Calendar, AI
   ============================================================ */
 
// ============================================================
// GLOBAL STATE
// ============================================================
 
let isMilitaryTime = false;
let currentUser = null; // { username, displayName }
let tasks = [];
let userName = "Operator";
 
// ============================================================
// ACCOUNT STORE HELPERS
// Accounts are stored in localStorage as { username -> { passwordHash, displayName } }
// ============================================================
 
function getAccounts() {
    return JSON.parse(localStorage.getItem('lifeos_accounts') || '{}');
}
 
function saveAccounts(accounts) {
    localStorage.setItem('lifeos_accounts', JSON.stringify(accounts));
}
 
/** Very lightweight hash — good enough for a client-side demo. */
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return hash.toString(36);
}
 
function getUserStorageKey(key) {
    if (!currentUser) return null;
    return `lifeos_${currentUser.username}_${key}`;
}
 
// ============================================================
// AUTH PANEL SWITCHING
// ============================================================
 
window.showSignup = function () {
    document.getElementById('loginPanel').classList.add('hidden');
    document.getElementById('signupPanel').classList.remove('hidden');
    clearAuthErrors();
};
 
window.showLogin = function () {
    document.getElementById('signupPanel').classList.add('hidden');
    document.getElementById('loginPanel').classList.remove('hidden');
    clearAuthErrors();
};
 
function clearAuthErrors() {
    ['loginError', 'signupError'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
}
 
function showAuthError(panelId, message) {
    const el = document.getElementById(panelId);
    const msgEl = document.getElementById(panelId + 'Msg');
    if (msgEl) msgEl.textContent = message;
    el.classList.remove('hidden');
 
    // Re-trigger shake animation
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = '';
}
 
// ============================================================
// PASSWORD VISIBILITY TOGGLE
// ============================================================
 
window.togglePwd = function (inputId, btn) {
    const input = document.getElementById(inputId);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    const icon = btn.querySelector('svg, i[data-lucide]');
    if (icon) {
        icon.setAttribute('data-lucide', isHidden ? 'eye-off' : 'eye');
        if (window.lucide) lucide.createIcons();
    }
};
 
// ============================================================
// PASSWORD STRENGTH METER
// ============================================================
 
function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}
 
function updateStrengthMeter(password) {
    const fill = document.getElementById('strengthFill');
    const label = document.getElementById('strengthLabel');
    if (!fill || !label) return;
 
    const score = getPasswordStrength(password);
    const levels = [
        { pct: '0%',   color: '#ff4d4d', text: 'Too short' },
        { pct: '20%',  color: '#ff4d4d', text: 'Very weak' },
        { pct: '40%',  color: '#ff914d', text: 'Weak' },
        { pct: '60%',  color: '#ffeb3b', text: 'Fair' },
        { pct: '80%',  color: '#8bc34a', text: 'Strong' },
        { pct: '100%', color: '#4caf50', text: 'Very strong' },
    ];
 
    const level = levels[Math.min(score, 5)];
    fill.style.width = level.pct;
    fill.style.background = level.color;
    label.textContent = password.length === 0 ? 'Password strength' : level.text;
    label.style.color = password.length === 0 ? '' : level.color;
}
 
// ============================================================
// LOGIN
// ============================================================
 
window.handleLogin = function () {
    const username = document.getElementById('loginUsername').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
 
    if (!username || !password) {
        showAuthError('loginError', 'Please enter your username and password.');
        return;
    }
 
    const accounts = getAccounts();
 
    if (!accounts[username]) {
        showAuthError('loginError', 'No account found with that username.');
        return;
    }
 
    if (accounts[username].passwordHash !== hashPassword(password)) {
        showAuthError('loginError', 'Incorrect password. Please try again.');
        return;
    }
 
    // Success — load user session
    currentUser = {
        username,
        displayName: accounts[username].displayName || username,
    };
    localStorage.setItem('lifeos_session', JSON.stringify(currentUser));
    bootApp();
};
 
// ============================================================
// SIGNUP
// ============================================================
 
window.handleSignup = function () {
    const displayName = document.getElementById('signupName').value.trim();
    const username    = document.getElementById('signupUsername').value.trim().toLowerCase();
    const password    = document.getElementById('signupPassword').value;
    const confirm     = document.getElementById('signupConfirm').value;
 
    // Validation
    if (!username) {
        showAuthError('signupError', 'Please choose a username.');
        return;
    }
 
    if (username.length < 3) {
        showAuthError('signupError', 'Username must be at least 3 characters.');
        return;
    }
 
    if (!/^[a-z0-9_]+$/.test(username)) {
        showAuthError('signupError', 'Username can only contain letters, numbers, and underscores.');
        return;
    }
 
    if (!password) {
        showAuthError('signupError', 'Please create a password.');
        return;
    }
 
    if (getPasswordStrength(password) < 2) {
        showAuthError('signupError', 'Password is too weak. Try adding numbers or symbols.');
        return;
    }
 
    if (password !== confirm) {
        showAuthError('signupError', 'Passwords do not match.');
        return;
    }
 
    const accounts = getAccounts();
 
    if (accounts[username]) {
        showAuthError('signupError', 'That username is already taken. Please choose another.');
        return;
    }
 
    // Save account
    accounts[username] = {
        passwordHash: hashPassword(password),
        displayName:  displayName || username,
        createdAt:    new Date().toISOString(),
    };
    saveAccounts(accounts);
 
    // Auto-login after signup
    currentUser = { username, displayName: displayName || username };
    localStorage.setItem('lifeos_session', JSON.stringify(currentUser));
    bootApp();
};
 
// ============================================================
// BOOT APP — transition from auth to main app
// ============================================================
 
function bootApp() {
    if (!currentUser) return;
 
    // Load user-specific data
    tasks = JSON.parse(localStorage.getItem(getUserStorageKey('tasks')) || '[]');
    userName = currentUser.displayName;
 
    // Animate auth screen out
    const authScreen = document.getElementById('authScreen');
    authScreen.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    authScreen.style.opacity = '0';
    authScreen.style.transform = 'scale(1.03)';
 
    setTimeout(() => {
        authScreen.classList.add('hidden');
        const app = document.getElementById('appContainer');
        app.classList.remove('hidden');
        app.style.opacity = '0';
        app.style.transition = 'opacity 0.4s ease';
        requestAnimationFrame(() => { app.style.opacity = '1'; });
 
        initApp();
    }, 500);
}
 
// ============================================================
// SIGN OUT
// ============================================================
 
window.handleLogout = function () {
    if (!confirm(`Sign out of @${currentUser?.username}?`)) return;
    localStorage.removeItem('lifeos_session');
    currentUser = null;
    tasks = [];
    location.reload();
};
 
// ============================================================
// DELETE ACCOUNT
// ============================================================
 
window.deleteAccount = function () {
    const input = prompt(`This will permanently delete your account.\nType your username "${currentUser.username}" to confirm:`);
    if (input?.trim().toLowerCase() !== currentUser.username) {
        alert('Account deletion cancelled — username did not match.');
        return;
    }
    const accounts = getAccounts();
    delete accounts[currentUser.username];
    saveAccounts(accounts);
 
    // Remove all user data
    const keysToRemove = Object.keys(localStorage).filter(k =>
        k.startsWith(`lifeos_${currentUser.username}_`)
    );
    keysToRemove.forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('lifeos_session');
 
    alert('Your account has been deleted.');
    location.reload();
};
 
// ============================================================
// INITIALIZATION
// ============================================================
 
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
 
    // Attach password strength listener
    const pwdInput = document.getElementById('signupPassword');
    if (pwdInput) {
        pwdInput.addEventListener('input', e => updateStrengthMeter(e.target.value));
    }
 
    // Check for existing session
    const savedSession = localStorage.getItem('lifeos_session');
    if (savedSession) {
        try {
            currentUser = JSON.parse(savedSession);
            bootApp();
            return;
        } catch (e) {
            localStorage.removeItem('lifeos_session');
        }
    }
    // Otherwise, show auth screen (it's visible by default)
});
 
function initApp() {
    initClock();
    renderTasks();
    renderCalendar();
    updateGreeting();
    updateProfileInfo();
    if (window.lucide) lucide.createIcons();
 
    // Load saved accent color
    const savedColor = localStorage.getItem(getUserStorageKey('color')) ||
                       localStorage.getItem('system_color') || '#00f2ff';
    document.documentElement.style.setProperty('--neon-color', savedColor);
 
    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        const menu = document.getElementById('profileMenu');
        if (menu) menu.classList.add('hidden');
    });
}
 
// ============================================================
// PROFILE INFO
// ============================================================
 
function updateProfileInfo() {
    const el = document.getElementById('profileInfo');
    if (!el || !currentUser) return;
    el.innerHTML = `
        <div style="font-weight:600;color:var(--text);font-size:0.85rem;">${currentUser.displayName}</div>
        <div>@${currentUser.username}</div>
    `;
}
 
// ============================================================
// THEME & COLOR ENGINE
// ============================================================
 
window.changeSystemColor = function (color) {
    document.documentElement.style.setProperty('--neon-color', color);
    if (currentUser) localStorage.setItem(getUserStorageKey('color'), color);
    localStorage.setItem('system_color', color);
};
 
window.manualThemeToggle = function () {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    if (icon) icon.setAttribute('data-lucide', isLight ? 'sun' : 'moon');
    if (window.lucide) lucide.createIcons();
};
 
window.changeFont = function (fontFamily) {
    document.body.style.fontFamily = fontFamily;
};
 
// ============================================================
// NAVIGATION
// ============================================================
 
window.switchView = function (viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(viewId + 'View');
    if (target) target.classList.remove('hidden');
 
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('onclick')?.includes(`'${viewId}'`)) item.classList.add('active');
    });
 
    if (viewId === 'calendar') renderCalendar();
};
 
window.handleModuleSelect = function () {
    const selector = document.getElementById('categorySelector');
    const titleEl  = document.getElementById('moduleTitle');
    if (titleEl) titleEl.innerText = selector.value.toUpperCase();
    switchView('module');
};
 
// ============================================================
// USER NAME & GREETING
// ============================================================
 
window.updateGreeting = function () {
    const greetingEl = document.getElementById('dynamicGreeting');
    if (!greetingEl) return;
    const hour = new Date().getHours();
    const welcome = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    greetingEl.innerText = `${welcome}, ${userName}`;
};
 
window.updateUserName = function () {
    const input = document.getElementById('userNameInput');
    if (input?.value.trim()) {
        userName = input.value.trim();
        // Also update the stored display name
        if (currentUser) {
            currentUser.displayName = userName;
            localStorage.setItem('lifeos_session', JSON.stringify(currentUser));
            const accounts = getAccounts();
            if (accounts[currentUser.username]) {
                accounts[currentUser.username].displayName = userName;
                saveAccounts(accounts);
            }
        }
        updateGreeting();
        updateProfileInfo();
        input.value = '';
        alert('Display name updated.');
    }
};
 
// ============================================================
// AI PARSER
// ============================================================
 
window.organizeWithAI = function () {
    const input = document.getElementById('aiInput').value;
    const lines  = input.split('\n');
 
    lines.forEach(line => {
        const text = line.trim();
        if (!text) return;
        tasks.push({
            id:        Date.now() + Math.random(),
            name:      text,
            date:      extractDate(text),
            time:      extractTime(text),
            priority:  detectPriority(text),
            completed: false,
        });
    });
 
    saveAndRender();
    renderCalendar();
    document.getElementById('aiInput').value = '';
    alert('AI has documented your objectives.');
};
 
function detectPriority(text) {
    const lower = text.toLowerCase();
    if (lower.match(/\b(urgent|meeting|appointment|deadline|critical|asap)\b/)) return 'high';
    if (lower.match(/\b(walk|hobby|cleaning|leisure|game|relax|watch|read)\b/)) return 'low';
    return 'medium';
}
 
function extractTime(text) {
    const match = text.match(/\b(\d{1,2})(:\d{2})?\s?(am|pm)\b/i);
    return match ? match[0] : '';
}
 
function extractDate(text) {
    const lower = text.toLowerCase();
    const today = new Date();
 
    if (lower.includes('today')) return today.toISOString().split('T')[0];
    if (lower.includes('tomorrow')) {
        const t = new Date(today);
        t.setDate(t.getDate() + 1);
        return t.toISOString().split('T')[0];
    }
 
    const months = ['january','february','march','april','may','june',
                    'july','august','september','october','november','december'];
    for (let i = 0; i < months.length; i++) {
        if (lower.includes(months[i])) {
            const dayMatch = text.match(/\d+/);
            if (dayMatch) {
                const y = today.getFullYear();
                return `${y}-${String(i + 1).padStart(2, '0')}-${String(dayMatch[0]).padStart(2, '0')}`;
            }
        }
    }
    return '';
}
 
// ============================================================
// CALENDAR
// ============================================================
 
function renderCalendar() {
    const grid    = document.getElementById('calendarGrid');
    const monthEl = document.getElementById('currentMonthName');
    if (!grid || !monthEl) return;
 
    const now = new Date();
    monthEl.innerText = now.toLocaleString('default', { month: 'long', year: 'numeric' });
 
    grid.innerHTML = '';
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
 
    for (let i = 1; i <= daysInMonth; i++) {
        const d = document.createElement('div');
        d.className = 'day-box';
 
        const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayTasks   = tasks.filter(t => t.date === dateString);
 
        let dotsHTML = dayTasks.map(() => '<div class="calendar-event-dot"></div>').join('');
        d.innerHTML  = `<span class="day-num">${i}</span>${dotsHTML}`;
 
        grid.appendChild(d);
    }
}
 
// ============================================================
// TASK CRUD
// ============================================================
 
window.saveNewTask = function () {
    const nameInput = document.getElementById('taskNameInput');
    const dateInput = document.getElementById('taskDateInput');
    if (nameInput?.value.trim()) {
        tasks.push({
            id:        Date.now(),
            name:      nameInput.value.trim(),
            date:      dateInput.value,
            completed: false,
            priority:  detectPriority(nameInput.value.trim()),
        });
        saveAndRender();
        renderCalendar();
        closeModal();
        nameInput.value = '';
    }
};
 
window.toggleTask = function (id) {
    const task = tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
    saveAndRender();
};
 
window.deleteTask = function (id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
    renderCalendar();
};
 
function saveAndRender() {
    if (currentUser) {
        localStorage.setItem(getUserStorageKey('tasks'), JSON.stringify(tasks));
    }
    renderTasks();
}
 
function renderTasks() {
    const list = document.getElementById('todoListElement');
    if (!list) return;
    list.innerHTML = '';
    let completedCount = 0;
 
    tasks.forEach(task => {
        if (task.completed) completedCount++;
        const li  = document.createElement('li');
        const pClass = `priority-${task.priority || 'medium'}`;
        li.classList.add(pClass);
 
        li.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span class="${task.completed ? 'strikethrough' : ''}" style="word-break:break-word;">
                    <span style="opacity:0.5;font-size:0.75rem;font-family:var(--font-mono);">[${(task.priority || 'MED').toUpperCase()}]</span>
                    ${task.name}
                    ${task.date ? `<span style="opacity:0.45;font-size:0.75rem;font-family:var(--font-mono);display:block;">${task.date}</span>` : ''}
                </span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">✕</button>
        `;
        list.appendChild(li);
    });
 
    const percent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    const bar = document.getElementById('taskBar');
    if (bar) bar.style.width = percent + '%';
    const statusText = document.getElementById('taskStatus');
    if (statusText) statusText.innerText = `${Math.round(percent)}% Complete (${completedCount}/${tasks.length})`;
}
 
// ============================================================
// CLOCK
// ============================================================
 
function initClock() {
    const tick = () => {
        const now     = new Date();
        const clockEl = document.getElementById('clockDisplay');
        const dateEl  = document.getElementById('dateDisplay');
        if (clockEl) clockEl.innerText = isMilitaryTime
            ? now.toLocaleTimeString('en-GB')
            : now.toLocaleTimeString('en-US');
        if (dateEl) dateEl.innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };
    tick();
    setInterval(tick, 1000);
}
 
window.toggleMilitaryTime = () => { isMilitaryTime = !isMilitaryTime; };
 
// ============================================================
// MODAL
// ============================================================
 
window.openModal  = () => document.getElementById('quickModal').classList.remove('hidden');
window.closeModal = () => document.getElementById('quickModal').classList.add('hidden');
 
window.toggleProfileMenu = (e) => {
    e.stopPropagation();
    document.getElementById('profileMenu').classList.toggle('hidden');
};
