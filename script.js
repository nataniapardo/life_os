/* ============================================================
   LIFE OS — script.js  (no auth)
   ============================================================ */

// ── GLOBAL STATE ─────────────────────────────────────────────
let isMilitaryTime = false;
let tasks          = JSON.parse(localStorage.getItem('lifeos_tasks')) || [];
let userName       = localStorage.getItem('lifeos_name') || 'Operator';

// ── INITIALIZATION ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    initClock();
    renderTasks();
    renderCalendar();
    updateGreeting();

    // Restore saved accent color
    const savedColor = localStorage.getItem('lifeos_color') || '#00f2ff';
    document.documentElement.style.setProperty('--neon-color', savedColor);
    const colorInput = document.getElementById('themeColorInput');
    if (colorInput) colorInput.value = savedColor;

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        const menu = document.getElementById('profileMenu');
        if (menu) menu.classList.add('hidden');
    });
});

// ── THEME & COLOR ─────────────────────────────────────────────
window.changeSystemColor = function (color) {
    document.documentElement.style.setProperty('--neon-color', color);
    localStorage.setItem('lifeos_color', color);
};

window.manualThemeToggle = function () {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    const icon    = document.getElementById('themeIcon');
    if (icon) {
        icon.setAttribute('data-lucide', isLight ? 'sun' : 'moon');
        if (window.lucide) lucide.createIcons();
    }
};

window.changeFont = function (fontFamily) {
    document.body.style.fontFamily = fontFamily;
};

// ── NAVIGATION ────────────────────────────────────────────────
window.switchView = function (viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(viewId + 'View');
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle(
            'active',
            item.getAttribute('onclick')?.includes(`'${viewId}'`)
        );
    });

    if (viewId === 'calendar') renderCalendar();
};

window.handleModuleSelect = function () {
    const selector = document.getElementById('categorySelector');
    const titleEl  = document.getElementById('moduleTitle');
    if (titleEl) titleEl.innerText = selector.value.toUpperCase();
    switchView('module');
};

// ── GREETING ─────────────────────────────────────────────────
window.updateGreeting = function () {
    const el = document.getElementById('dynamicGreeting');
    if (!el) return;
    const h  = new Date().getHours();
    const tod = h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
    el.innerText = `${tod}, ${userName}`;
};

window.updateUserName = function () {
    const input = document.getElementById('userNameInput');
    if (input?.value.trim()) {
        userName = input.value.trim();
        localStorage.setItem('lifeos_name', userName);
        updateGreeting();
        input.value = '';
        alert('Display name updated.');
    }
};

// ── AI PARSER ────────────────────────────────────────────────
window.organizeWithAI = function () {
    const raw = document.getElementById('aiInput').value;
    raw.split('\n').forEach(line => {
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
    alert('AI has organised your objectives.');
};

function detectPriority(text) {
    const t = text.toLowerCase();
    if (/\b(urgent|meeting|appointment|deadline|asap|critical)\b/.test(t)) return 'high';
    if (/\b(walk|hobby|leisure|game|relax|cleaning|watch|read)\b/.test(t))  return 'low';
    return 'medium';
}

function extractTime(text) {
    const m = text.match(/\b(\d{1,2})(:\d{2})?\s?(am|pm)\b/i);
    return m ? m[0] : '';
}

function extractDate(text) {
    const t     = text.toLowerCase();
    const today = new Date();

    if (t.includes('today'))    return today.toISOString().split('T')[0];
    if (t.includes('tomorrow')) {
        const d = new Date(today);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }

    const months = ['january','february','march','april','may','june',
                    'july','august','september','october','november','december'];
    for (let i = 0; i < months.length; i++) {
        if (t.includes(months[i])) {
            const day = text.match(/\d+/);
            if (day) {
                return `${today.getFullYear()}-${String(i+1).padStart(2,'0')}-${String(day[0]).padStart(2,'0')}`;
            }
        }
    }
    return '';
}

// ── CALENDAR ─────────────────────────────────────────────────
function renderCalendar() {
    const grid    = document.getElementById('calendarGrid');
    const monthEl = document.getElementById('currentMonthName');
    if (!grid || !monthEl) return;

    const now = new Date();
    monthEl.innerText = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    grid.innerHTML = '';
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const dayTasks = tasks.filter(t => t.date === dateStr);

        const d = document.createElement('div');
        d.className = 'day-box';
        d.innerHTML = `<span class="day-num">${i}</span>` +
            dayTasks.map(() => '<div class="calendar-event-dot"></div>').join('');
        grid.appendChild(d);
    }
}

// ── TASKS (CRUD) ──────────────────────────────────────────────
window.saveNewTask = function () {
    const name = document.getElementById('taskNameInput');
    const date = document.getElementById('taskDateInput');
    if (!name?.value.trim()) return;

    tasks.push({
        id:        Date.now(),
        name:      name.value.trim(),
        date:      date.value,
        completed: false,
        priority:  detectPriority(name.value.trim()),
    });
    saveAndRender();
    renderCalendar();
    closeModal();
    name.value = '';
};

window.toggleTask = function (id) {
    const t = tasks.find(t => t.id === id);
    if (t) t.completed = !t.completed;
    saveAndRender();
};

window.deleteTask = function (id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
    renderCalendar();
};

function saveAndRender() {
    localStorage.setItem('lifeos_tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('todoListElement');
    if (!list) return;
    list.innerHTML = '';
    let done = 0;

    tasks.forEach(task => {
        if (task.completed) done++;
        const li = document.createElement('li');
        li.classList.add(`priority-${task.priority || 'medium'}`);
        li.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
                <input type="checkbox" ${task.completed ? 'checked' : ''}
                    onchange="toggleTask(${task.id})">
                <span class="${task.completed ? 'strikethrough' : ''}" style="word-break:break-word;">
                    <span style="opacity:0.45;font-size:.75rem;">[${(task.priority||'MED').toUpperCase()}]</span>
                    ${task.name}
                    ${task.date ? `<span style="display:block;opacity:.4;font-size:.75rem;">${task.date}</span>` : ''}
                </span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">✕</button>
        `;
        list.appendChild(li);
    });

    const pct = tasks.length ? (done / tasks.length) * 100 : 0;
    const bar = document.getElementById('taskBar');
    if (bar) bar.style.width = pct + '%';
    const status = document.getElementById('taskStatus');
    if (status) status.innerText = `${Math.round(pct)}% Complete (${done}/${tasks.length})`;
}

// ── CLOCK ─────────────────────────────────────────────────────
function initClock() {
    const tick = () => {
        const now     = new Date();
        const clockEl = document.getElementById('clockDisplay');
        const dateEl  = document.getElementById('dateDisplay');
        if (clockEl) clockEl.innerText = isMilitaryTime
            ? now.toLocaleTimeString('en-GB')
            : now.toLocaleTimeString('en-US');
        if (dateEl)  dateEl.innerText  = now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
    };
    tick();
    setInterval(tick, 1000);
}

window.toggleMilitaryTime = () => { isMilitaryTime = !isMilitaryTime; };

// ── MODAL ─────────────────────────────────────────────────────
window.openModal  = () => document.getElementById('quickModal').classList.remove('hidden');
window.closeModal = () => document.getElementById('quickModal').classList.add('hidden');

window.toggleProfileMenu = (e) => {
    e.stopPropagation();
    document.getElementById('profileMenu').classList.toggle('hidden');
};
