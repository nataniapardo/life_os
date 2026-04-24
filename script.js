let isMilitaryTime = false;
let tasks = JSON.parse(localStorage.getItem('zen_tasks')) || [];
let userName = localStorage.getItem('zen_name') || "Operator";

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initClock();
    renderTasks();
    renderCalendar();
});

// FIXED: Theme Toggle Logic
function manualThemeToggle() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        icon.setAttribute('data-lucide', 'sun');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        icon.setAttribute('data-lucide', 'moon');
    }
    lucide.createIcons();
}

// Navigation Logic
function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId + 'View').classList.remove('hidden');
    
    // Update active nav state
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const activeNav = [...document.querySelectorAll('.nav-item')].find(n => n.onclick.toString().includes(viewId));
    if (activeNav) activeNav.classList.add('active');
}

// Dropdown Module Titles
function handleModuleSelect() {
    const selector = document.getElementById('categorySelector');
    const moduleName = selector.value;
    
    document.getElementById('moduleTitle').innerText = moduleName.toUpperCase();
    switchView('module');
}

// AI Organizer Logic
function organizeWithAI() {
    const input = document.getElementById('aiInput').value;
    if (!input) return;

    // Simple priority logic simulation based on keywords
    const items = input.split(',').map(text => {
        let priority = 'Normal';
        if (text.toLowerCase().includes('tomorrow') || text.toLowerCase().includes('urgent')) priority = 'High';
        return {
            id: Date.now() + Math.random(),
            name: text.trim(),
            date: new Date().toISOString().split('T')[0],
            priority: priority,
            completed: false
        };
    });

    tasks = [...tasks, ...items];
    saveAndRender();
    document.getElementById('aiInput').value = '';
    alert("AI has prioritized and added tasks to your Todo List.");
}

// Todo List CRUD
function saveNewTask() {
    const name = document.getElementById('taskNameInput').value;
    const date = document.getElementById('taskDateInput').value;
    
    if (name) {
        tasks.push({ id: Date.now(), name, date, completed: false });
        saveAndRender();
        closeModal();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('zen_tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('todoListElement');
    list.innerHTML = '';
    
    let completedCount = 0;

    tasks.forEach(task => {
        if (task.completed) completedCount++;
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span style="${task.completed ? 'text-decoration: line-through; opacity: 0.5' : ''}">${task.name}</span>
                <small style="margin-left: 10px; opacity: 0.6">${task.date || ''}</small>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})"><i data-lucide="trash-2"></i></button>
        `;
        list.appendChild(li);
    });

    // Update Chart
    const percent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    document.getElementById('taskBar').style.width = percent + '%';
    document.getElementById('taskStatus').innerText = Math.round(percent) + '% Complete';
    lucide.createIcons();
}

// Calendar Generator
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    for (let i = 1; i <= 31; i++) {
        const day = document.createElement('div');
        day.className = 'day-box';
        day.innerText = i;
        grid.appendChild(day);
    }
}

// Clock & Utils
function initClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clockDisplay').innerText = isMilitaryTime ? now.toLocaleTimeString('en-GB') : now.toLocaleTimeString('en-US');
        document.getElementById('dateDisplay').innerText = now.toLocaleDateString();
    }, 1000);
}

function openModal() { document.getElementById('quickModal').classList.remove('hidden'); }
function closeModal() { document.getElementById('quickModal').classList.add('hidden'); }
function toggleProfileMenu(e) { e.stopPropagation(); document.getElementById('profileMenu').classList.toggle('hidden'); }
window.onclick = () => document.getElementById('profileMenu').classList.add('hidden');
