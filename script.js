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
    
    updateSystemDate();
    initThemeEngine(); 
    startTimeEngine(); 
    populateFontList();
    populateStimulations();
    
    // Initialize calendars
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
    // 1. Toggle visibility of sections
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    const targetSection = document.getElementById(pageId);
    if (targetSection) targetSection.classList.remove('hidden');
    
    // 2. Update Nav active states
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    const navItem = document.getElementById(`nav-${pageId}`);
    if (navItem) navItem.classList.add('active');

    // 3. Update the Top Left Section Title
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
    
    // 4. Trigger specific page logic
    if(pageId === 'calendar') initCalendar();
}

// ==========================================
// 4. CALENDAR GENERATOR (Temporal Grid)
// =================
