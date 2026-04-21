// ==========================================
// 1. SYSTEM SETUP & CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const OS_VERSION = "2.0.4";
let currentUser = null;

const stimulations = [
    "Nature", "Food", "Travel", "Location", "Zen", "Cities", 
    "Earth", "Water", "Space", "Futuristic", "Shapes", "Art", "Cartoon"
];

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
                dest = "Grocery List"; icon = "shopping-cart";
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
// 7. ENGINES & HELPERS
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

function populateStimulations() {
    const container = document.getElementById('homeWidgets');
    if (!container) return;
    // You can add logic here to display the stimulation categories
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
