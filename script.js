// --- GLOBAL STATE ---
let isMilitaryTime = false;
let tasks = JSON.parse(localStorage.getItem('zen_tasks')) || [];
let userName = localStorage.getItem('zen_name') || "Operator";

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    initClock();
    renderTasks();
    renderCalendar();
    updateGreeting();

    // Load saved system color
    const savedColor = localStorage.getItem('system_color') || '#00f2ff';
    document.documentElement.style.setProperty('--neon-color', savedColor);
});

// --- THEME & COLOR ENGINE ---
window.changeSystemColor = function(color) {
    document.documentElement.style.setProperty('--neon-color', color);
    localStorage.setItem('system_color', color);
};

window.manualThemeToggle = function() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
    
    const isLight = body.classList.contains('light-mode');
    if (icon) icon.setAttribute('data-lucide', isLight ? 'sun' : 'moon');
    if (window.lucide) lucide.createIcons();
};

window.changeFont = function(fontFamily) {
    document.body.style.fontFamily = fontFamily;
};

// --- NAVIGATION ---
window.switchView = function(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(viewId + 'View');
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('onclick')?.includes(`'${viewId}'`)) item.classList.add('active');
    });
};

window.handleModuleSelect = function() {
    const selector = document.getElementById('categorySelector');
    const titleEl = document.getElementById('moduleTitle');
    if (titleEl) titleEl.innerText = selector.value.toUpperCase();
    switchView('module');
};

// --- USER IDENTITY & GREETING ---
window.updateGreeting = function() {
    const greetingEl = document.getElementById('dynamicGreeting');
    if (!greetingEl) return;

    const hour = new Date().getHours();
    let welcome = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    greetingEl.innerText = `${welcome}, ${userName}`;
};

window.updateUserName = function() {
    const input = document.getElementById('userNameInput');
    if (input?.value.trim()) {
        userName = input.value.trim();
        localStorage.setItem('zen_name', userName); 
        updateGreeting();
        input.value = ""; 
        alert("Identity Tag Updated.");
    }
};

window.handleLogout = function() {
    if(confirm("Confirm system disconnect?")) {
        localStorage.clear();
        location.reload();
    }
};

// --- SMART AI PARSER ---
window.organizeWithAI = function() {
    const input = document.getElementById("aiInput").value;
    const lines = input.split("\n");

    lines.forEach(line => {
        const text = line.trim();
        if (!text) return;

        tasks.push({
            id: Date.now() + Math.random(),
            name: text,
            date: extractDate(text),
            time: extractTime(text),
            priority: detectPriority(text),
            completed: false
        });
    });

    saveAndRender();
    document.getElementById("aiInput").value = "";
    alert("AI has parsed your objectives.");
};

function detectPriority(text) {
    const lower = text.toLowerCase();
    if (lower.includes("urgent") || lower.includes("asap") || lower.includes("high")) return "high";
    if (lower.includes("low")) return "low";
    return "medium";
}

function extractTime(text) {
    const match = text.match(/\b(\d{1,2})(:\d{2})?\s?(am|pm)\b/i);
    return match ? match[0] : "";
}

function extractDate(text) {
    const lower = text.toLowerCase();
    const today = new Date();
    if (lower.includes("today")) return today.toISOString().split('T')[0];
    if (lower.includes("tomorrow")) {
        today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
    }
    return "";
}

// --- TASK LOGIC (CRUD) ---
window.saveNewTask = function() {
    const nameInput = document.getElementById('taskNameInput');
    if (nameInput?.value.trim()) {
        tasks.push({ 
            id: Date.now(), 
            name: nameInput.value.trim(), 
            completed: false,
            priority: 'medium'
        });
        saveAndRender();
        closeModal();
        nameInput.value = '';
    }
};

window.toggleTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
    saveAndRender();
};

window.deleteTask = function(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
};

function saveAndRender() {
    localStorage.setItem('zen_tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('todoListElement');
    if (!list) return;
    list.innerHTML = '';
    let completedCount = 0;

    tasks.forEach(task => {
        if (task.completed) completedCount++;
        const li = document.createElement('li');
        
        // --- PRIORITY HIGHLIGHTING ---
        const priorityClass = `priority-${task.priority || 'medium'}`;
        li.classList.add(priorityClass);

        li.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span class="${task.completed ? 'strikethrough' : ''}">
                    [${(task.priority || 'MED').toUpperCase()}] ${task.name}
                </span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;
        list.appendChild(li);
    });

    const percent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    const bar = document.getElementById('taskBar');
    if (bar) bar.style.width = percent + '%';
    const statusText = document.getElementById('taskStatus');
    if (statusText) statusText.innerText = Math.round(percent) + '% Complete';
}

// --- UTILS ---
function initClock() {
    setInterval(() => {
        const now = new Date();
        const clockEl = document.getElementById('clockDisplay');
        const dateEl = document.getElementById('dateDisplay');
        if (clockEl) clockEl.innerText = isMilitaryTime ? now.toLocaleTimeString('en-GB') : now.toLocaleTimeString('en-US');
        if (dateEl) dateEl.innerText = now.toLocaleDateString();
    }, 1000);
}

window.openModal = () => document.getElementById('quickModal').classList.remove('hidden');
window.closeModal = () => document.getElementById('quickModal').classList.add('hidden');
window.toggleProfileMenu = (e) => { e.stopPropagation(); document.getElementById('profileMenu').classList.toggle('hidden'); };
window.toggleMilitaryTime = () => { isMilitaryTime = !isMilitaryTime; };

window.renderCalendar = () => {
    const grid = document.getElementById('calendarGrid');
    if(!grid) return;
    grid.innerHTML = '';
    for (let i = 1; i <= 31; i++) {
        const d = document.createElement('div');
        d.className = 'day-box'; d.innerText = i;
        grid.appendChild(d);
    }
};
