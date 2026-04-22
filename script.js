// ==========================================
// 1. SYSTEM SETUP & CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const OS_VERSION = "2.0.5";
let currentUser = null;
let recentlyDeleted = [];

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
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    updateSystemDate();
    initThemeEngine();
    startTimeEngine();
    populateFontList();
    populateStimulations();
    initPersistenceEngine();
    setupTimer(); 
    renderCalendar();
});

function updateSystemDate() {
    const now = new Date();
    const dateEl = document.getElementById('dateDisplay');
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('en-US', { 
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
        // Generate initials from name
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
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    const target = document.getElementById(pageId);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
    });
    
    const activeNav = document.getElementById(`nav-${pageId}`);
    if (activeNav) activeNav.classList.add('active');

    if(pageId === 'calendar') renderCalendar();
}

function addNewSection() {
    const sectionName = prompt("Enter section name:");
    if (!sectionName) return;
    
    const id = sectionName.toLowerCase().replace(/\s/g, '-');
    
    // Add to Nav
    const nav = document.getElementById('mainNav');
    const li = document.createElement('li');
    li.id = `nav-${id}`;
    li.innerHTML = `
        <i data-lucide="layers"></i>
        <span>${sectionName}</span>
        <button class="del-btn" onclick="deleteSection('${id}', '${sectionName}')" style="margin-left:auto; background:none; border:none; color:red; cursor:pointer;">×</button>
    `;
    li.onclick = (e) => { if(e.target.tagName !== 'BUTTON') switchPage(id) };
    nav.appendChild(li);
    
    // Create actual Section
    const content = document.getElementById('contentSections');
    const sec = document.createElement('section');
    sec.id = id;
    sec.className = "view-section hidden";
    sec.innerHTML = `<div class="glass-card"><h2>${sectionName}</h2><p>New custom module active.</p></div>`;
    content.appendChild(sec);
    
    lucide.createIcons();
}

function deleteSection(id, name) {
    if(!confirm(`Delete "${name}"?`)) return;
    recentlyDeleted.push({ id, name, date: new Date().toLocaleTimeString() });
    
    const navItem = document.getElementById(`nav-${id}`);
    const sectionItem = document.getElementById(id);
    
    if(navItem) navItem.remove();
    if(sectionItem) sectionItem.remove();
    
    updateDeletedUI();
}

function updateDeletedUI() {
    const list = document.getElementById('recentlyDeletedList');
    if (!list) return;
    list.innerHTML = recentlyDeleted.map(item => `
        <div class="dropdown-item" style="font-size:0.7rem; opacity:0.8;">
            ${item.name} <span style="font-size:0.6rem; margin-left:5px;">(${item.date})</span>
        </div>
    `).join('');
}

function toggleProfileMenu() {
    const menu = document.getElementById('profileDropdown');
    if (menu) menu.classList.toggle('hidden');
}

// ==========================================
// 5. THEME & CUSTOMIZATION
// ==========================================
function saveAppearanceSettings() {
    const color = document.getElementById('themePicker').value;
    const font = document.getElementById('fontChoice').value;
    const customName = document.getElementById('prefNameInput')?.value;
    const customInitials = document.getElementById('prefInitialsInput')?.value;
    
    // Apply Identity Changes
    if (customName) {
        currentUser = customName;
        document.getElementById('dynamicGreeting').textContent = `Good morning, ${customName}`;
    }
    if (customInitials) {
        document.getElementById('userAvatar').textContent = customInitials.toUpperCase();
    }
    
    // Apply Theme Changes
    document.documentElement.style.setProperty('--accent-glow', color);
    document.body.style.fontFamily = font;
    
    localStorage.setItem('lifeOS_themeColor', color);
    localStorage.setItem('lifeOS_font', font);
    
    alert("System Preferences Updated!");
}

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
// 6. TIMER ENGINE (DUAL MODE + SOUND)
// ==========================================
function playAlert() {
    const sound = document.getElementById('timerAlert');
    if (sound) sound.play();
}

function startBasicTimer() {
    let time = parseInt(document.getElementById('basicTimerInput').value);
    const display = document.getElementById('basicDisplay');
    if (isNaN(time)) return;

    const interval = setInterval(() => {
        time--;
        let mins = Math.floor(time / 60);
        let secs = time % 60;
        display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        if (time <= 0) {
            clearInterval(interval);
            playAlert();
        }
    }, 1000);
}

function startPomodoro() {
    if (timerInterval) clearInterval(timerInterval);
    
    const workMins = parseInt(document.getElementById('workDuration').value) || 25;
    const breakMins = parseInt(document.getElementById('breakDuration').value) || 5;
    
    timeLeft = isBreak ? breakMins * 60 : workMins * 60;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playAlert();
            isBreak = !isBreak;
            alert(isBreak ? "Work Session Over! Take a break." : "Break Over! Back to work.");
            startPomodoro(); // Cycle to next
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    isBreak = false;
    setupTimer();
}

// ==========================================
// 7. CALENDAR & UTILS
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
            <span class="day-number">${day}</span>
            <div class="event-area" style="margin-top: 10px;"></div>
        `;
        grid.appendChild(dayEl);
    }
}

// Internal existing helper functions omitted for brevity (startTimeEngine, initThemeEngine, etc.)
