// ==========================================
// 1. SYSTEM SETUP & CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const OS_VERSION = "2.0.5";
let currentUser = null;

const stimulations = ["Nature", "Food", "Space", "Shapes", "Flowers", "Futuristic", "Travel", "Location"];

const fonts = [
    { name: 'Modern Sans', value: "'Inter', sans-serif" },
    { name: 'Futuristic', value: "'Orbitron', sans-serif" },
    { name: 'Elegant Serif', value: "'Playfair Display', serif" },
    { name: 'Coding Mono', value: "'JetBrains Mono', monospace" },
    { name: 'Clean Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Papyrus (Legacy)', value: "'Papyrus', fantasy" }
];

// Timer State
let timerInterval = null;
let timeLeft = 0;
let isBreak = false;
let isMilitary = false;

// Calendar State
let currentCalendarDate = new Date();

// ==========================================
// 2. SYSTEM INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    initThemeEngine();
    startTimeEngine();
    populateFontList();
    populateStimulations(); // Now populates the settings container
    initPersistenceEngine();
    setupTimer(); 
    renderCalendar();
});

// ==========================================
// 3. AUTHENTICATION & UI CONTROL
// ==========================================
function handleAuth(mode) {
    // Capture name if signing up, otherwise default to "User"
    const nameInput = document.getElementById('newNameInput');
    const emailInput = (mode === 'login') ? 
        document.getElementById('emailInput') : 
        document.getElementById('newEmailInput');
    
    currentUser = (mode === 'signup' && nameInput.value) ? nameInput.value : (emailInput.value || "User");
    
    // Update Greeting
    const greeting = document.getElementById('dynamicGreeting');
    if (greeting) greeting.textContent = `Good morning, ${currentUser}`;

    // UI Transition
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function toggleAuthMode() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('signupForm').classList.toggle('hidden');
}

function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    const target = document.getElementById(pageId);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
    });
    
    const navId = (pageId === 'timers') ? 'nav-timers' : `nav-${pageId}`;
    const activeNav = document.getElementById(navId);
    if (activeNav) activeNav.classList.add('active');

    if(pageId === 'calendar') renderCalendar();
}

function toggleProfileMenu() {
    const menu = document.getElementById('profileDropdown');
    if (menu) menu.classList.toggle('hidden');
}

// ==========================================
// 4. THEME & CUSTOMIZATION ENGINE
// ==========================================
function initThemeEngine() {
    const savedColor = localStorage.getItem('lifeOS_themeColor');
    const savedFont = localStorage.getItem('lifeOS_font');
    
    if (savedColor) {
        if (document.getElementById('themePicker')) document.getElementById('themePicker').value = savedColor;
        document.documentElement.style.setProperty('--accent-glow', savedColor);
    }
    if (savedFont) {
        document.body.style.fontFamily = savedFont;
        if (document.getElementById('fontChoice')) document.getElementById('fontChoice').value = savedFont;
    }
    
    setInterval(checkAutoTheme, 30000);
    checkAutoTheme();
}

function checkAutoTheme() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const lightTimeVal = localStorage.getItem('lightTime') || "07:00";
    const darkTimeVal = localStorage.getItem('darkTime') || "19:00";
    
    const lightMinutes = parseInt(lightTimeVal.split(':')[0]) * 60 + parseInt(lightTimeVal.split(':')[1]);
    const darkMinutes = parseInt(darkTimeVal.split(':')[0]) * 60 + parseInt(darkTimeVal.split(':')[1]);

    if (currentTime >= lightMinutes && currentTime < darkMinutes) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    }
}

/**
 * Global Save function for Website Appearance
 */
function saveAppearanceSettings() {
    const color = document.getElementById('themePicker').value;
    const font = document.getElementById('fontChoice').value;
    
    // Apply changes immediately
    document.documentElement.style.setProperty('--accent-glow', color);
    document.body.style.fontFamily = font;
    
    // Persist to LocalStorage
    localStorage.setItem('lifeOS_themeColor', color);
    localStorage.setItem('lifeOS_font', font);
    
    // UI Feedback
    const saveBtn = event.target;
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "Settings Applied!";
    saveBtn.classList.add('btn-success');
    
    setTimeout(() => {
        saveBtn.innerText = originalText;
        saveBtn.classList.remove('btn-success');
    }, 2000);
}

// ==========================================
// 5. STIMULATION ENGINE (RELOCATED)
// ==========================================
function populateStimulations() {
    const container = document.getElementById('stimContainer'); 
    if (!container) return;
    
    let html = `<div class="stimulation-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap:10px; margin-top:10px;">`;
    stimulations.forEach(s => {
        html += `<button class="btn-outline" onclick="setStimulation('${s}')" style="font-size:0.7rem; padding: 10px;">${s}</button>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function setStimulation(type) {
    document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://source.unsplash.com/featured/?${type}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
}

// ==========================================
// 6. HORIZONTAL CALENDAR ENGINE
// ==========================================
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('monthDisplay');
    if (!grid) return;

    grid.innerHTML = ''; 
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    monthYear.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentCalendarDate);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dayName = dayNames[dateObj.getDay()];
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-cell glass-card';
        dayEl.innerHTML = `
            <span class="day-label">${dayName}</span>
            <span class="day-number" style="font-size: 1.5rem;">${day}</span>
            <div class="event-area" style="margin-top: 10px; width: 100%;"></div>
        `;
        
        // Logic for highlighting events
        if (day === 15) {
            dayEl.querySelector('.event-area').innerHTML += `<div class="event-tag">Neural Sync</div>`;
        }
        
        grid.appendChild(dayEl);
    }
}

function changeMonth(offset) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + offset);
    renderCalendar();
}

// ==========================================
// 7. TIME & UTILITY ENGINES
// ==========================================
function startTimeEngine() {
    setInterval(() => {
        const now = new Date();
        const clock = document.getElementById('clockDisplay');
        if (clock) {
            clock.textContent = now.toLocaleTimeString([], { hour12: !isMilitary });
        }
    }, 1000);
}

function setupTimer() {
    const workMins = parseInt(document.getElementById('workDuration')?.value) || 25;
    timeLeft = workMins * 60;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const timerEl = document.getElementById('timerCountdown');
    if (timerEl) timerEl.textContent = display;
}

function populateFontList() {
    const selector = document.getElementById('fontChoice');
    if (!selector) return;
    selector.innerHTML = '';
    fonts.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.value;
        opt.textContent = f.name;
        selector.appendChild(opt);
    });
}

function initPersistenceEngine() {
    const jotter = document.getElementById('aiJotter');
    if (jotter) {
        jotter.value = localStorage.getItem('jotter_draft') || "";
        jotter.addEventListener('input', () => {
            localStorage.setItem('jotter_draft', jotter.value);
        });
    }
}

function setTimeFormat(military) {
    isMilitary = military;
}

function setTimeFormat(military) {
    isMilitary = military;
}
