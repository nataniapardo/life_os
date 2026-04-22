// ==========================================
// 1. SYSTEM SETUP & CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const OS_VERSION = "2.0.6";
let currentUser = null;

// --- 1. GLOBAL STATE UPDATES ---
let recentlyDeleted = [];
let customInterval; 
let timerInterval = null; 
let timeLeft = 0;
let isBreak = false;
let isMilitary = false;
let calendarDate = new Date(); // Replaces old 'date' variable for consistency

// THEME ELEMENTS
let themeBtn, scheduleCheckbox, lightInput, darkInput;

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
    themeBtn = document.getElementById('themeToggle');
    scheduleCheckbox = document.getElementById('enableSchedule');
    lightInput = document.getElementById('lightStartTime');
    darkInput = document.getElementById('darkStartTime');

    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    updateSystemDate();
    initThemeEngine(); 
    startTimeEngine(); // Fixed Time Engine
    populateFontList();
    populateStimulations();
    initCalendar();    // Fixed Calendar Jump
    
    // Apply Saved Settings
    const savedColor = localStorage.getItem('lifeOS_themeColor');
    if (savedColor) document.documentElement.style.setProperty('--accent-glow', savedColor);

    const savedFont = localStorage.getItem('lifeOS_font');
    if (savedFont) document.documentElement.style.setProperty('--main-font', savedFont);
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
// 3. --- 2. FONT FIX ---
// ==========================================
function saveAppearanceSettings() {
    const font = document.getElementById('fontChoice')?.value;
    const color = document.getElementById('themePicker')?.value;

    if (font) {
        // This targets the CSS variable, changing the entire website font
        document.documentElement.style.setProperty('--main-font', font);
        localStorage.setItem('lifeOS_font', font);
    }
    
    if (color) {
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--accent-glow', color);
        localStorage.setItem('lifeOS_themeColor', color);
    }
}

function populateFontList() {
    const select = document.getElementById('fontChoice');
    if (!select) return;
    fonts.forEach(f => {
        let opt = new Option(f.name, f.value);
        select.add(opt);
    });
}

// ==========================================
// 4. --- 3. CALENDAR JUMP FEATURE ---
// ==========================================
function initCalendar() {
    const monthSelect = document.getElementById('selectMonth');
    const yearSelect = document.getElementById('selectYear');
    if (!monthSelect || !yearSelect) return;
    
    monthSelect.innerHTML = '';
    yearSelect.innerHTML = '';

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    months.forEach((m, i) => {
        let opt = new Option(m, i);
        monthSelect.add(opt);
    });

    for (let i = 1900; i <= 2100; i++) {
        let opt = new Option(i, i);
        yearSelect.add(opt);
    }

    monthSelect.value = calendarDate.getMonth();
    yearSelect.value = calendarDate.getFullYear();

    renderCalendar();
}

function jumpToDate() {
    const m = document.getElementById('selectMonth').value;
    const y = document.getElementById('selectYear').value;
    calendarDate = new Date(y, m, 1);
    renderCalendar();
}

function renderCalendar() {
    const container = document.getElementById('calendarDays');
    const display = document.getElementById('monthYearDisplay');
    if(!container) return;

    container.innerHTML = '';
    const y = calendarDate.getFullYear();
    const m = calendarDate.getMonth();
    
    display.innerText = `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(calendarDate)} ${y}`;

    const firstDay = new Date(y, m, 1).getDay();
    const lastDate = new Date(y, m + 1, 0).getDate();

    for(let i=0; i < firstDay; i++) {
        container.innerHTML += `<div class="day empty"></div>`;
    }

    for(let i=1; i <= lastDate; i++) {
        const isToday = i === new Date().getDate() && m === new Date().getMonth() && y === new Date().getFullYear();
        container.innerHTML += `<div class="day ${isToday ? 'today' : ''}"><span class="day-number">${i}</span></div>`;
    }
}

// ==========================================
// 5. --- 4. STIMULATION ENGINE FIX ---
// ==========================================
function populateStimulations() {
    const container = document.getElementById('stimContainer');
    if (!container) return;
    stimulations.forEach(s => {
        const btn = document.createElement('button');
        btn.className = "btn-outline";
        btn.style.margin = "5px";
        btn.textContent = s;
        btn.onclick = () => setStimulation(s);
        container.appendChild(btn);
    });
}

function setStimulation(type) {
    const bgOverlay = "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))";
    // Effective stimulation images using high-quality Unsplash source
    const url = `https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=1920&sig=${Math.random()}&keyword=${type}`;
    
    document.body.style.background = `${bgOverlay}, url('${url}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
}

// ==========================================
// 6. --- 5. RECENTLY DELETED CLEAR ---
// ==========================================
function clearRecentlyDeleted() {
    if(confirm("Permanently clear all deleted items?")) {
        recentlyDeleted = [];
        const list = document.getElementById('recentlyDeletedList');
        if (list) list.innerHTML = "No items deleted.";
    }
}

// ==========================================
// 7. --- 6. TIME ENGINE (THE FIX) ---
// ==========================================
function startTimeEngine() {
    setInterval(() => {
        const now = new Date();
        const clockEl = document.getElementById('clockDisplay');
        if (clockEl) {
            clockEl.innerText = now.toLocaleTimeString('en-US', { 
                hour12: !isMilitary, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
        }
        checkThemeSchedule();
    }, 1000);
}

// ==========================================
// 8. OTHER CORE FUNCTIONS
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

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('themePreference', isLight ? 'light' : 'dark');
}

function refreshIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function handleAuth(mode) {
    const nameInput = document.getElementById('newNameInput');
    const emailInput = (mode === 'login') ? document.getElementById('emailInput') : document.getElementById('newEmailInput');
    currentUser = (mode === 'signup' && nameInput.value) ? nameInput.value : (emailInput.value || "User");
    
    const greeting = document.getElementById('dynamicGreeting');
    if (greeting) greeting.textContent = `Good morning, ${currentUser}`;
    
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    refreshIcons();
}
