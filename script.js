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
    // Map Theme DOM Elements
    themeBtn = document.getElementById('themeToggle');
    scheduleCheckbox = document.getElementById('enableSchedule');
    lightInput = document.getElementById('lightStartTime');
    darkInput = document.getElementById('darkStartTime');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    updateSystemDate();
    initThemeEngine(); // Updated below
    startTimeEngine(); // Updated below
    populateFontList();
    populateStimulations();
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

// ==========================================
// 5. THEME ENGINE & SCHEDULING (NEW LOGIC)
// ==========================================
function initThemeEngine() {
    // 1. Persistence & Setup
    const savedLight = localStorage.getItem('scheduledLight');
    const savedDark = localStorage.getItem('scheduledDark');
    const scheduleActive = localStorage.getItem('scheduleEnabled') === 'true';
    const lastTheme = localStorage.getItem('themePreference');

    if (savedLight && lightInput) lightInput.value = savedLight;
    if (savedDark && darkInput) darkInput.value = savedDark;
    if (scheduleCheckbox) scheduleCheckbox.checked = scheduleActive;

    // Apply last used theme
    if (lastTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    // 2. Listeners
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            localStorage.setItem('themePreference', isLight ? 'light' : 'dark');
        });
    }

    [lightInput, darkInput, scheduleCheckbox].forEach(input => {
        if (!input) return;
        input.addEventListener('change', () => {
            localStorage.setItem('scheduledLight', lightInput.value);
            localStorage.setItem('scheduledDark', darkInput.value);
            localStorage.setItem('scheduleEnabled', scheduleCheckbox.checked);
            checkThemeSchedule(); 
        });
    });
}

function checkThemeSchedule() {
    if (!scheduleCheckbox || !scheduleCheckbox.checked) return;

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                        now.getMinutes().toString().padStart(2, '0');

    const lightTime = lightInput.value;
    const darkTime = darkInput.value;

    if (currentTime === lightTime) {
        document.body.classList.add('light-mode');
        localStorage.setItem('themePreference', 'light');
    } else if (currentTime === darkTime) {
        document.body.classList.remove('light-mode');
        localStorage.setItem('themePreference', 'dark');
    }
}

function startTimeEngine() {
    // System Clock Display
    setInterval(() => {
        const now = new Date();
        const clockEl = document.getElementById('clockDisplay');
        if (clockEl) {
            clockEl.textContent = now.toLocaleTimeString('en-US', { 
                hour12: !isMilitary, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
        }
        
        // Every second, we check the theme schedule
        checkThemeSchedule();
    }, 1000);
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

// (Remaining existing timer and calendar functions continue as before...)
