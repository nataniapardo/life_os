// ==========================================
// 1. SYSTEM SETUP & CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const OS_VERSION = "2.0.6";
let currentUser = null;

// GLOBAL STATE
let recentlyDeleted = [];
let customInterval; 
let timerInterval = null; 
let timeLeft = 0;
let isBreak = false;
let isMilitary = false;
let date = new Date(); // Primary calendar date tracker

const stimulations = ["Nature", "Food", "Space", "Shapes", "Flowers", "Futuristic", "Travel", "Location"];

const fonts = [
    { name: 'Modern Sans', value: "'Inter', sans-serif" },
    { name: 'Futuristic', value: "'Orbitron', sans-serif" },
    { name: 'Elegant Serif', value: "'Playfair Display', serif" },
    { name: 'Coding Mono', value: "'JetBrains Mono', monospace" },
    { name: 'Clean Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Papyrus (Legacy)', value: "'Papyrus', fantasy" }
];

// ==========================================
// 2. SYSTEM INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    updateSystemDate();
    initThemeEngine();
    startTimeEngine();
    populateFontList();
    populateStimulations();
    
    // Initialize Calendar
    initCalendar();
    
    const savedColor = localStorage.getItem('lifeOS_themeColor');
    if (savedColor) {
        document.documentElement.style.setProperty('--accent-glow', savedColor);
    }
});

function updateSystemDate() {
    const dateEl = document.getElementById('dateDisplay');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }
}

// ==========================================
// 3. IDENTITY & AUTHENTICATION
// ==========================================
function handleAuth(mode) {
    const nameInput = document.getElementById('newNameInput');
    const emailInput = (mode === 'login') ? 
        document.getElementById('emailInput') : 
        document.getElementById('newEmailInput');
    
    currentUser = (mode === 'signup' && nameInput.value) ? nameInput.value : (emailInput.value || "User");
    
    updateUserDisplay(currentUser);
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateUserDisplay(name) {
    const greeting = document.getElementById('dynamicGreeting');
    const avatar = document.getElementById('userAvatar');
    if (greeting) greeting.textContent = `Good morning, ${name}`;
    if (avatar) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        avatar.textContent = initials || "US";
    }
}

function toggleAuthMode() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('signupForm').classList.toggle('hidden');
}

// ==========================================
// 4. DYNAMIC NAVIGATION & PAGES
// ==========================================
function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(section => section.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${pageId}`);
    if (activeNav) activeNav.classList.add('active');

    if(pageId === 'calendar') renderCalendar();
}

function toggleProfileMenu() {
    const menu = document.getElementById('profileDropdown');
    if (menu) menu.classList.toggle('hidden');
}

function addNewSection() {
    const name = prompt("New Section Name:");
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const nav = document.getElementById('mainNav');

    const li = document.createElement('li');
    li.id = `nav-${id}`;
    li.innerHTML = `<i data-lucide="layers"></i><span>${name}</span><button onclick="deleteSection(event, '${id}', '${name}')" class="del-btn">×</button>`;
    li.addEventListener('click', (e) => { if (e.target.tagName !== 'BUTTON') switchPage(id); });
    nav.appendChild(li);

    const container = document.getElementById('contentSections');
    const section = document.createElement('section');
    section.id = id;
    section.className = "view-section hidden";
    section.innerHTML = `<div class="glass-card"><h2>${name}</h2><p>Custom section content goes here.</p></div>`;
    container.appendChild(section);

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function deleteSection(event, id, name) {
    if(event) event.stopPropagation(); 
    if (!confirm(`Delete ${name}?`)) return;
    recentlyDeleted.push({ id, name, date: new Date().toLocaleTimeString() });
    updateDeletedUI();
    document.getElementById(`nav-${id}`)?.remove();
    document.getElementById(id)?.remove();
}

function updateDeletedUI() {
    const list = document.getElementById('recentlyDeletedList');
    if (!list) return;
    list.innerHTML = recentlyDeleted.length === 0 ? "No items deleted." : recentlyDeleted.map(item => `
        <div style="padding:5px; border-bottom:1px solid #333; font-size:11px;">🗑️ ${item.name} <small>(${item.date})</small></div>
    `).join('');
}

// ==========================================
// 5. THEME & CUSTOMIZATION
// ==========================================
function saveAppearanceSettings() {
    const newName = document.getElementById('prefNameInput')?.value;
    const color = document.getElementById('themePicker')?.value;
    const font = document.getElementById('fontChoice')?.value;

    if (newName) {
        currentUser = newName;
        document.getElementById('dynamicGreeting').textContent = `Good morning, ${newName}`;
    }
    if (color) {
        document.documentElement.style.setProperty('--accent-glow', color);
        localStorage.setItem('lifeOS_themeColor', color);
    }
    if (font) {
        document.body.style.fontFamily = font;
        localStorage.setItem('lifeOS_font', font);
    }
    alert("Settings applied.");
}

function setStimulation(type) {
    const bgUrl = `https://source.unsplash.com/featured/?${type}`;
    document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${bgUrl}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
}

function populateStimulations() {
    const container = document.getElementById('stimContainer'); 
    if (!container) return;
    container.innerHTML = `<div class="stimulation-grid">${stimulations.map(s => `<button class="btn-outline" onclick="setStimulation('${s}')">${s}</button>`).join('')}</div>`;
}

function populateFontList() {
    const select = document.getElementById('fontChoice');
    if (!select) return;
    fonts.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.value; opt.textContent = f.name;
        select.appendChild(opt);
    });
}

// ==========================================
// 6. TIMER ENGINE
// ==========================================
function playAlert() {
    const sound = document.getElementById('timerAlert');
    if (sound) sound.play();
}

function startBasicTimer() {
    let time = parseInt(document.getElementById('basicTimerInput').value);
    const display = document.getElementById('basicDisplay');
    if (isNaN(time)) return;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        time--;
        let mins = Math.floor(time / 60); let secs = time % 60;
        display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        if (time <= 0) { clearInterval(timerInterval); playAlert(); }
    }, 1000);
}

function startCustomTimer() {
    if (customInterval) clearInterval(customInterval);
    let hh = parseInt(document.getElementById('custHH').value) || 0;
    let mm = parseInt(document.getElementById('custMM').value) || 0;
    let totalSeconds = (hh * 3600) + (mm * 60);
    customInterval = setInterval(() => {
        if (totalSeconds <= 0) { clearInterval(customInterval); playAlert(); return; }
        totalSeconds--;
        let h = Math.floor(totalSeconds / 3600);
        let m = Math.floor((totalSeconds % 3600) / 60);
        let s = totalSeconds % 60;
        document.getElementById('customDisplay').textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }, 1000);
}

function startPomodoro() {
    if (timerInterval) clearInterval(timerInterval);
    const workMins = parseInt(document.getElementById('workDuration').value) || 25;
    const breakMins = parseInt(document.getElementById('breakDuration').value) || 5;
    timeLeft = isBreak ? breakMins * 60 : workMins * 60;
    timerInterval = setInterval(() => {
        timeLeft--;
        let mins = Math.floor(timeLeft / 60); let secs = timeLeft % 60;
        document.getElementById('timerCountdown').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval); playAlert();
            isBreak = !isBreak; alert(isBreak ? "Break!" : "Work!"); startPomodoro();
        }
    }, 1000);
}

function resetTimer() { clearInterval(timerInterval); document.getElementById('timerCountdown').textContent = "25:00"; }

// ==========================================
// 7. CALENDAR PERSISTENCE & RENDERING
// ==========================================
function initCalendar() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    if(prevBtn) prevBtn.addEventListener('click', () => {
        date.setMonth(date.getMonth() - 1);
        renderCalendar();
    });

    if(nextBtn) nextBtn.addEventListener('click', () => {
        date.setMonth(date.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
}

function renderCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const monthYear = document.getElementById('monthYear');
    if (!calendarDays || !monthYear) return;

    calendarDays.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();

    monthYear.innerText = `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    // 1. Fill previous month's trailing days
    for (let x = firstDayIndex; x > 0; x--) {
        const div = document.createElement('div');
        div.classList.add('day', 'other-month');
        div.innerHTML = `<span class="day-number">${prevLastDay - x + 1}</span>`;
        calendarDays.appendChild(div);
    }

    // 2. Fill current month's days
    for (let i = 1; i <= lastDay; i++) {
        const div = document.createElement('div');
        div.classList.add('day');
        if (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
            div.classList.add('today');
        }
        div.innerHTML = `<span class="day-number">${i}</span>`;
        calendarDays.appendChild(div);
    }
}

function startTimeEngine() {}
function initThemeEngine() {}
