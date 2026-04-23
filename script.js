// ==========================================
// 1. SYSTEM SETUP & GLOBAL STATE
// ==========================================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const OS_VERSION = "2.0.6";
let currentUser = null;

// --- GLOBAL STATE ---
let isMilitaryTime = false;
let userName = localStorage.getItem('lifeOS_name') || "User";
let recentlyDeleted = [];
let timerInterval = null; 
let timeLeft = 0;
let calendarDate = new Date(); 

// Mock data based on API structure for Smart Engine
const smartEnergyData = {
    morningPeak: "08:00-10:00",
    afternoonDip: "12:00-14:00",
    chronotype: "morning person"
};

const stimulations = ["Nature", "Food", "Space", "Shapes", "Flowers", "Futuristic", "Travel", "Location"];
const fonts = [
    { name: 'Papyrus (System Default)', value: "'Papyrus', fantasy" },
    { name: 'Modern Sans', value: "'Inter', sans-serif" },
    { name: 'Futuristic', value: "'Orbitron', sans-serif" },
    { name: 'Elegant Serif', value: "'Playfair Display', serif" },
    { name: 'Coding Mono', value: "'JetBrains Mono', monospace" },
    { name: 'Clean Montserrat', value: "'Montserrat', sans-serif" }
];

// ==========================================
// 2. SYSTEM INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    // Core Engine Starts
    updateSystemDate(); 
    initThemeEngine(); 
    startTimeEngine(); 
    
    // UI Setup
    populateFontList();
    populateStimulations();
    initCalendar(); 
    renderHorizontalCalendar(); 

    const lastBg = localStorage.getItem('lifeOS_lastBackground') || 'Nature';
    setBackground(lastBg);

    const nameInput = document.getElementById('userNameInput');
    if(nameInput) nameInput.value = userName;

    const savedColor = localStorage.getItem('lifeOS_themeColor');
    if (savedColor) {
        document.documentElement.style.setProperty('--accent', savedColor);
        document.documentElement.style.setProperty('--accent-glow', savedColor);
    }

    const savedFont = localStorage.getItem('lifeOS_font') || "'Papyrus', fantasy";
    document.documentElement.style.setProperty('--main-font', savedFont);
});

// ==========================================
// 3. NAVIGATION & PAGE TITLE ENGINE
// ==========================================
function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    const targetSection = document.getElementById(pageId);
    if (targetSection) targetSection.classList.remove('hidden');
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    const navItem = document.getElementById(`nav-${pageId}`);
    if (navItem) navItem.classList.add('active');

    const titleMap = {
        'home': 'Command Center',
        'tasks': 'Strategic Flow',
        'calendar': 'Temporal Grid',
        'settings': 'System Matrix'
    };
    const titleDisplay = document.getElementById('sectionTitle');
    if (titleDisplay) {
        titleDisplay.innerText = titleMap[pageId] || pageId;
    }
    
    if(pageId === 'calendar') initCalendar();
}

// ==========================================
// 4. SMART CALENDAR ENGINE (Temporal Grid)
// ==========================================
function initCalendar() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    if (!monthSelect || !yearSelect) return;
    
    if(yearSelect.options.length === 0) {
        for(let i = 2020; i <= 2030; i++) {
            let opt = document.createElement('option');
            opt.value = i; opt.innerHTML = i;
            yearSelect.appendChild(opt);
        }
        yearSelect.value = new Date().getFullYear();
    }
    
    if(monthSelect.value === "") monthSelect.value = new Date().getMonth();

    updateCalendar();
}

function updateCalendar() {
    const grid = document.getElementById('calendarDays');
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    
    if (!grid || !monthSelect || !yearSelect) return;

    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    grid.innerHTML = ''; 

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for(let i = 0; i < firstDay; i++) {
        const emptyBox = document.createElement('div');
        emptyBox.className = 'calendar-day-box empty';
        grid.appendChild(emptyBox);
    }

    const now = new Date();
    for(let d = 1; d <= daysInMonth; d++) {
        const isToday = now.getDate() === d && now.getMonth() === month && now.getFullYear() === year;
        const dayOfWeek = new Date(year, month, d).getDay();
        const isWorkDay = dayOfWeek > 0 && dayOfWeek < 6;

        const dayBox = document.createElement('div');
        dayBox.className = `calendar-day-box ${isToday ? 'today' : ''}`;
        
        dayBox.innerHTML = `
            <span class="day-num">${d}</span>
            <div class="day-metadata">
                ${isWorkDay ? '<span class="energy-dot high" title="High Energy: Analytical Mode"></span>' : ''}
                ${d % 5 === 0 ? '<span class="energy-dot creative" title="Brainstorming Session"></span>' : ''}
            </div>
        `;
        
        dayBox.onclick = () => showSmartDayView(year, month, d);
        grid.appendChild(dayBox);
    }
}

function showSmartDayView(y, m, d) {
    console.log(`Loading Smart Schedule for ${y}-${m+1}-${d}`);
}

// ==========================================
// 5. GREETING, DATE & TIME ENGINE
// ==========================================

function updateSystemDate() {
    const dateDisplay = document.getElementById('systemDate');
    if (!dateDisplay) return;

    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    dateDisplay.innerText = now.toLocaleDateString('en-US', options);
}

function updateTimeAndGreeting() {
    const now = new Date();
    const hours = now.getHours();
    const greetingEl = document.getElementById('dynamicGreeting');
    const clockEl = document.getElementById('clockDisplay');

    let status = (hours < 12) ? "Morning" : (hours < 17) ? "Afternoon" : (hours < 21) ? "Evening" : "Night";
    if (greetingEl) greetingEl.innerText = `Good ${status}, ${userName}`;

    if (clockEl) {
        clockEl.innerText = isMilitaryTime ? now.toLocaleTimeString('en-GB') : now.toLocaleTimeString('en-US');
    }
    checkThemeSchedule(now);
}

function startTimeEngine() {
    updateTimeAndGreeting();
    setInterval(updateTimeAndGreeting, 1000);
}
