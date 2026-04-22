// ==========================================
// 1. SYSTEM SETUP & CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const OS_VERSION = "2.0.4";
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
    populateStimulations();
    initPersistenceEngine();
    setupTimer(); 
    renderCalendar();
});

// ==========================================
// 3. AUTHENTICATION & UI CONTROL
// ==========================================
function handleAuth(mode) {
    const emailInput = (mode === 'login') ? 
        document.getElementById('emailInput') : 
        document.getElementById('newEmailInput');
    
    currentUser = emailInput.value || "User";
    
    // UI Transition
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    
    // Refresh icons
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

    const profileDropdown = document.getElementById('profileDropdown');
    if (profileDropdown) profileDropdown.classList.add('hidden');

    // Re-render calendar if moving to calendar page
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
    }
    
    setInterval(checkAutoTheme, 30000);
    checkAutoTheme();
}

function checkAutoTheme() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const lightTimeVal = document.getElementById('lightTime')?.value || localStorage.getItem('lightTime') || "07:00";
    const darkTimeVal = document.getElementById('darkTime')?.value || localStorage.getItem('darkTime') || "19:00";
    
    const lightParts = lightTimeVal.split(':');
    const darkParts = darkTimeVal.split(':');
    const lightMinutes = parseInt(lightParts[0]) * 60 + parseInt(lightParts[1]);
    const darkMinutes = parseInt(darkParts[0]) * 60 + parseInt(darkParts[1]);

    if (currentTime >= lightMinutes && currentTime < darkMinutes) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    }
}

function updateTheme() {
    const color = document.getElementById('themePicker').value;
    const font = document.getElementById('fontChoice').value;
    
    document.documentElement.style.setProperty('--accent-glow', color);
    document.body.style.fontFamily = font;
    
    localStorage.setItem('lifeOS_themeColor', color);
    localStorage.setItem('lifeOS_font', font);
}

// ==========================================
// 5. NEURAL DISTRIBUTION ENGINE
// ==========================================
function runAIProcessor() {
    const input = document.getElementById('aiJotter').value;
    if (!input.trim()) return;

    const panel = document.getElementById('aiReviewPanel');
    const list = document.getElementById('distributionList');
    
    panel.classList.remove('hidden');
    list.innerHTML = `<div class="loading-pulse">Analyzing Neural Input...</div>`;

    setTimeout(() => {
        const tasks = input.split('\n').filter(line => line.trim() !== '');
        let resultsHTML = '';

        tasks.forEach(task => {
            const lowerTask = task.toLowerCase();
            let dest = "General To-Do";
            let icon = "check-square";

            if (lowerTask.includes('meeting') || lowerTask.includes('appointment') || lowerTask.includes('schedule')) {
                dest = "Calendar"; icon = "calendar";
            } else if (lowerTask.includes('buy') || lowerTask.includes('groceries') || lowerTask.includes('shopping')) {
                dest = "Personal List"; icon = "user";
            } else if (lowerTask.includes('study') || lowerTask.includes('focus') || lowerTask.includes('work')) {
                dest = "Timers"; icon = "timer";
            }

            resultsHTML += `
                <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
                    <i data-lucide="${icon}" style="width:14px;"></i>
                    <strong>${task}</strong> -> <em style="color:var(--accent-glow)">${dest}</em>
                </div>`;
        });

        list.innerHTML = resultsHTML;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 800);
}

function clearJotter() {
    document.getElementById('aiJotter').value = '';
    document.getElementById('aiReviewPanel').classList.add('hidden');
    localStorage.removeItem('jotter_draft');
}

// ==========================================
// 6. POMODORO TIMER
// ==========================================
function setupTimer() {
    const workMins = parseInt(document.getElementById('workDuration').value) || 25;
    timeLeft = workMins * 60;
    updateTimerDisplay();
}

function startPomodoro() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            alert(isBreak ? "Break over!" : "Work session complete!");
            isBreak = !isBreak;
            
            const nextDuration = isBreak ? 
                (document.getElementById('breakDuration').value || 5) : 
                (document.getElementById('workDuration').value || 25);
            
            timeLeft = nextDuration * 60;
            updateTimerDisplay();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isBreak = false;
    setupTimer();
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const timerEl = document.getElementById('timerCountdown');
    const statusEl = document.getElementById('timerStatus');
    
    if (timerEl) timerEl.textContent = display;
    if (statusEl) statusEl.textContent = isBreak ? "BREAK" : "FOCUSING";
}

// ==========================================
// 7. STIMULATION & BACKGROUND ENGINE
// ==========================================
function populateStimulations() {
    const container = document.getElementById('homeWidgets');
    if (!container) return;
    
    let html = `<h3>System Stimulation</h3><div class="stimulation-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap:10px; margin-top:15px;">`;
    
    stimulations.forEach(s => {
        html += `<button class="btn-outline" onclick="setStimulation('${s}')" style="font-size:0.7rem;">${s}</button>`;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

function setStimulation(type) {
    document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://source.unsplash.com/featured/?${type}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    console.log(`Stimulation set to: ${type}`);
}

// ==========================================
// 8. CALENDAR ENGINE
// ==========================================
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('monthDisplay');
    if (!grid) return;

    grid.innerHTML = ''; 
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    monthYear.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentCalendarDate);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(d => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = d;
        grid.appendChild(dayHeader);
    });

    for (let i = 0; i < firstDay; i++) {
        grid.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-cell glass-card';
        dayEl.innerHTML = `<span class="day-number">${day}</span>`;
        
        if (day === 15) dayEl.innerHTML += `<div class="event-tag">Meeting</div>`;
        
        grid.appendChild(dayEl);
    }
}

function changeMonth(offset) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + offset);
    renderCalendar();
}

// ==========================================
// 9. ENGINES & HELPERS
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
