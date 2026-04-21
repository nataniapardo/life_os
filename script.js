// ==========================================
// 1. SYSTEM SETUP & CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
    { name: 'Clean Montserrat', value: "'Montserrat', sans-serif" }
];

// Timer State
let timerInterval;
let timeLeft;
let isBreak = false;

// ==========================================
// 2. SYSTEM INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initThemeEngine();
    startTimeEngine();
    populateFontList();
    populateStimulations();
    initPersistenceEngine();
    setupTimer(); // Initialize Pomodoro display
});

// ==========================================
// 3. NAVIGATION & UI CONTROL
// ==========================================
function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    const target = document.getElementById(pageId);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
    });
    
    const navId = pageId === 'timers' ? 'nav-timers' : `nav-${pageId}`;
    const activeNav = document.getElementById(navId);
    if (activeNav) activeNav.classList.add('active');

    const profileDropdown = document.getElementById('profileDropdown');
    if (profileDropdown) profileDropdown.classList.add('hidden');
}

function handleAuth(mode) {
    currentUser = document.getElementById(mode === 'login' ? 'emailInput' : 'newEmailInput').value || "User";
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    lucide.createIcons();
}

// ==========================================
// 4. THEME & CUSTOMIZATION ENGINE
// ==========================================
function initThemeEngine() {
    const savedColor = localStorage.getItem('lifeOS_themeColor');
    const savedFont = localStorage.getItem('lifeOS_font');
    
    if (savedColor) {
        document.getElementById('themePicker').value = savedColor;
        document.documentElement.style.setProperty('--accent-glow', savedColor);
    }
    if (savedFont) {
        const fontSelector = document.getElementById('fontChoice');
        if (fontSelector) fontSelector.value = savedFont;
        document.body.style.setProperty('font-family', savedFont);
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
            let destination = "";
            let icon = "";

            // Advanced Keyword Logic
            if (lowerTask.includes('meeting') || lowerTask.includes('appointment') || lowerTask.includes('schedule')) {
                destination = "Calendar";
                icon = "calendar";
            } else if (lowerTask.includes('buy') || lowerTask.includes('groceries') || lowerTask.includes('
