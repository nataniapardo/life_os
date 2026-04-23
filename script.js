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

    // Load saved name into input
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
// 3. DYNAMIC GREETING & THEME ENGINE
// ==========================================

function updateTimeAndGreeting() {
    const now = new Date();
    const hours = now.getHours();
    const greetingEl = document.getElementById('dynamicGreeting');
    const clockEl = document.getElementById('clockDisplay');

    // Greeting Logic
    let status = "Day";
    if (hours < 12) status = "Morning";
    else if (hours < 17) status = "Afternoon";
    else if (hours < 21) status = "Evening";
    else status = "Night";
    
    if (greetingEl) greetingEl.innerText = `Good ${status}, ${userName}`;

    // Clock Logic (Military vs Standard)
    if (clockEl) {
        if (isMilitaryTime) {
            clockEl.innerText = now.toLocaleTimeString('en-GB'); // 24hr
        } else {
            clockEl.innerText = now.toLocaleTimeString('en-US'); // 12hr
        }
    }

    checkThemeSchedule(now);
}

function toggleMilitaryTime() {
    isMilitaryTime = !isMilitaryTime;
    updateTimeAndGreeting();
}

function updateUserName() {
    const input = document.getElementById('userNameInput');
    if (input && input.value.trim()) {
        userName = input.value.trim();
        localStorage.setItem('lifeOS_name', userName);
        updateTimeAndGreeting();
        const display = document.getElementById('userNameDisplay');
        if(display) display.innerText = userName;
    }
}

function manualThemeToggle() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    
    if(icon) {
        icon.setAttribute('data-lucide', isLight ? 'sun' : 'moon');
        lucide.createIcons();
    }
}

function checkThemeSchedule(now) {
    const check = document.getElementById('enableSchedule');
    if (!check || !check.checked) return;

    const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    const lightTarget = document.getElementById('lightTime').value;
    const darkTarget = document.getElementById('darkTime').value;

    if (currentTime === lightTarget) {
        document.body.classList.add('light-mode');
        document.getElementById('themeIcon')?.setAttribute('data-lucide', 'sun');
    } else if (currentTime === darkTarget) {
        document.body.classList.remove('light-mode');
        document.getElementById('themeIcon')?.setAttribute('data-lucide', 'moon');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 4. CALENDAR ENGINE (BOXED GRID)
// ==========================================

function initCalendar() {
    const daysContainer = document.getElementById('calendarDays');
    if (!daysContainer) return;

    const now = new Date();
    const month = calendarDate.getMonth();
    const year = calendarDate.getFullYear();

    daysContainer.innerHTML = '';

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    
    const displayEl = document.getElementById('monthYearDisplay');
    if(displayEl) displayEl.innerText = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = 32 - new Date(year, month, 32).getDate();

    // 1. Padding for previous month days
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day-box empty';
        daysContainer.appendChild(emptyDiv);
    }

    // 2. Generation of Day Boxes
    for (let date = 1; date <= daysInMonth; date++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day-box';
        dayDiv.innerText = date;

        if (date === now.getDate() && year === now.getFullYear() && month === now.getMonth()) {
            dayDiv.classList.add('today');
        }

        dayDiv.onclick = () => selectCalendarDate(year, month, date);
        daysContainer.appendChild(dayDiv);
    }
}

// ==========================================
// 5. NAVIGATION & SECTIONS
// ==========================================

function addNewCategorizedSection() {
    const category = document.getElementById('categorySelector').value;
    if (!category) return alert("Please select a category first.");
    
    const nav = document.getElementById('mainNav'); // Assuming your UL has this ID
    if(!nav) return;

    const li = document.createElement('li');
    li.id = `nav-${category}`;
    li.onclick = () => switchPage('home'); 
    li.innerHTML = `<i data-lucide="layers"></i><span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>`;
    
    nav.appendChild(li);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    
    const target = document.getElementById(pageId);
    const navItem = document.getElementById(`nav-${pageId}`);
    
    if (target) target.classList.remove('hidden');
    if (navItem) navItem.classList.add('active');
    
    if(pageId === 'calendar') initCalendar();
}

// ==========================================
// 6. TIME ENGINE & AUTH
// ==========================================

function startTimeEngine() {
    updateTimeAndGreeting();
    setInterval(updateTimeAndGreeting, 1000);
}

function handleAuth(mode) {
    const nameInput = document.getElementById('newNameInput');
    if (mode === 'signup' && nameInput && nameInput.value) {
        userName = nameInput.value;
        localStorage.setItem('lifeOS_name', userName);
    }
    
    updateTimeAndGreeting();
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
