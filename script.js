// =========================
// 1. SYSTEM SETUP & DB
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

 // =========================
// 1. SYSTEM SETUP & DB
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Global State
let tempDistribution = [];
let themeSchedule = { light: "07:00", dark: "19:00", active: false };

// Expanded Font List for Settings
const expandedFonts = [
    { name: "Papyrus", value: "'Papyrus', serif" },
    { name: "Inter (Modern)", value: "'Inter', sans-serif" },
    { name: "Playfair (Elegant)", value: "'Playfair Display', serif" },
    { name: "JetBrains (Tech)", value: "'JetBrains Mono', monospace" },
    { name: "Orbitron (Futuristic)", value: "'Orbitron', sans-serif" },
    { name: "Montserrat (Clean)", value: "'Montserrat', sans-serif" }
];

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateClock();
    populateSettings(); // Initialize fonts and stimulations
    
    const savedName = localStorage.getItem('os_user_name');
    if (savedName) personalizeAccount(savedName);

    setInterval(updateClock, 1000);
    setInterval(checkThemeSchedule, 60000); // Check auto-theme every minute
});

// =========================
// 2. AUTHENTICATION & PERSONALIZATION
// =========================

function toggleAuthMode() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('signupForm').classList.toggle('hidden');
}

function personalizeAccount(name) {
    const greetingEl = document.getElementById('dynamicGreeting');
    const avatarEl = document.getElementById('userAvatar');
    if (!greetingEl) return;

    const hours = new Date().getHours();
    let timeMsg = "Good night";
    if (hours >= 5 && hours < 12) timeMsg = "Good morning";
    else if (hours >= 12 && hours < 17) timeMsg = "Good afternoon";
    else if (hours >= 17 && hours < 21) timeMsg = "Good evening";

    const displayName = name.trim() || "User";
    greetingEl.innerText = `${timeMsg}, ${displayName}`;
    if (avatarEl) avatarEl.innerText = displayName.charAt(0).toUpperCase();

    localStorage.setItem('os_user_name', displayName);
}

async function handleAuth(type) {
    const inputId = type === 'signup' ? 'newNameInput' : 'emailInput';
    const inputEl = document.getElementById(inputId);
    if(!inputEl || !inputEl.value) { alert("Please enter your details."); return; }

    const name = inputEl.value.includes('@') ? inputEl.value.split('@')[0] : inputEl.value;
    personalizeAccount(name);

    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    lucide.createIcons();
}

// =========================
// 3. THEME, SCHEDULER & SETTINGS populate
// =========================

function populateSettings() {
    // Populate expanded font dropdown
    const fontSelect = document.getElementById('fontChoice');
    if (fontSelect) {
        fontSelect.innerHTML = expandedFonts.map(f => `<option value="${f.value}">${f.name}</option>`).join('');
    }

    // Populate Stimulation Grid
    const stims = [
        { cat: "Nature", items: ["Rainforest", "Deep Ocean"] },
        { cat: "Futuristic", items: ["Cyber City", "Mars Colony"] },
        { cat: "Shape", items: ["Fractals", "Minimal Cubes"] },
        { cat: "Food", items: ["Zen Tea Garden", "Neon Diner"] },
        { cat: "Travel", items: ["Tokyo Night", "Swiss Alps"] }
    ];
    
    const stimContainer = document.getElementById('stimList');
    if (stimContainer) {
        stimContainer.innerHTML = stims.flatMap(s => 
            s.items.map(item => `<div class="stim-item" onclick="alert('Entering ${item} stimulation...')">${item}</div>`)
        ).join('');
    }
}

function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('theme-futuristic'); 
    } else {
        body.classList.add('light-mode');
        body.classList.remove('theme-futuristic');
    }
}

function saveThemeSchedule() {
    const lightInput = document.getElementById('lightTime');
    const darkInput = document.getElementById('darkTime');
    
    if(lightInput && darkInput) {
        themeSchedule.light = lightInput.value;
        themeSchedule.dark = darkInput.value;
        themeSchedule.active = true;
        alert(`Schedule Active: Light mode at ${themeSchedule.light}, Dark mode at ${themeSchedule.dark}`);
        checkThemeSchedule(); // Run immediate check
    }
}

function checkThemeSchedule() {
    if (!themeSchedule.active) return;

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                        now.getMinutes().toString().padStart(2, '0');

    if (currentTime === themeSchedule.light) {
        document.body.classList.add('light-mode');
        document.body.classList.remove('theme-futuristic');
    } else if (currentTime === themeSchedule.dark) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('theme-futuristic');
    }
}

// =========================
// 4. CORE UI LOGIC
// =========================

function updateClock() {
    const clockEl = document.getElementById('clockDisplay');
    if (clockEl) clockEl.innerText = new Date().toLocaleTimeString();
}

function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
        const navItem = document.getElementById(`nav-${pageId}`);
        if (navItem) navItem.classList.add('active');
    }
    document.getElementById('profileDropdown')?.classList.add('hidden');
    lucide.createIcons();
}

function toggleProfileMenu() {
    document.getElementById('profileDropdown')?.classList.toggle('hidden');
}

// =========================
// 5. GLOBAL SEARCH
// =========================

const siteMap = [
    { name: "Home Dashboard", keyword: "home", target: "home", icon: "home" },
    { name: "AI Productivity", keyword: "productivity", target: "productivity", icon: "zap" },
    { name: "Timers & Focus", keyword: "timers", target: "timers", icon: "timer" },
    { name: "World Tools", keyword: "tools", target: "tools", icon: "globe" },
    { name: "Calendar", keyword: "calendar", target: "calendar", icon: "calendar" },
    { name: "System Settings", keyword: "settings", target: "settings", icon: "settings" }
];

function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    const dropdown = document.getElementById('searchDropdown');
    if (!query) { dropdown.classList.add('hidden'); return; }

    const matches = siteMap.filter(item => 
        item.name.toLowerCase().includes(query) || item.keyword.toLowerCase().includes(query)
    );

    dropdown.innerHTML = matches.length ? matches.map(match => `
        <div class="search-result-item" onclick="switchPage('${match.target}'); clearSearch();">
            <i data-lucide="${match.icon}"></i><span>${match.name}</span>
        </div>
    `).join('') : '<div class="search-result-item">No results found</div>';

    dropdown.classList.remove('hidden');
    lucide.createIcons(); 
}

function clearSearch() {
    document.getElementById('globalSearch').value = "";
    document.getElementById('searchDropdown').classList.add('hidden');
}

// =========================
// 6. CUSTOMIZATION & AI LOGIC
// =========================

function updateTheme() {
    const color = document.getElementById('themePicker').value;
    const font = document.getElementById('fontChoice').value;
    document.documentElement.style.setProperty('--accent-color', color);
    document.body.style.fontFamily = font;
}

function updateProfile() {
    const init = document.getElementById('initialsInput').value;
    if (init) {
        document.getElementById('userAvatar').innerText = init.toUpperCase();
        localStorage.setItem('os_user_name', init);
    }
}

function runAIProcessor() {
    const jotter = document.getElementById('aiJotter');
    if (!jotter?.value.trim()) return;

    const lines = jotter.value.split(/[.,\n]/); 
    tempDistribution = lines.filter(l => l.trim().length > 3).map(text => {
        let destination = "Tasks";
        const lower = text.toLowerCase();
        if (lower.match(/at|pm|am|tomorrow|monday/)) destination = "Calendar";
        else if (lower.match(/translate|convert|weather/)) destination = "World Tools";
        else if (lower.match(/timer|minutes/)) destination = "Timers";
        return { text: text.trim(), destination };
    });

    renderReview();
}

function renderReview() {
    const list = document.getElementById('distributionList');
    if(!list) return;
    list.innerHTML = tempDistribution.map((item, index) => `
        <div class="dist-item">
            <span><strong>[${item.destination}]</strong> ${item.text}</span>
            <span onclick="removeItem(${index})" style="cursor:pointer; color:red; font-weight:bold;">✕</span>
        </div>
    `).join('');
    document.getElementById('aiReviewPanel').classList.remove('hidden');
}

function applyAIDistribution() {
    const homeWidget = document.getElementById('homeWidgets');
    tempDistribution.forEach(item => {
        if (homeWidget) {
            const widget = document.createElement('div');
            widget.className = "glass-card";
            widget.style.fontSize = "0.8rem";
            widget.style.marginTop = "10px";
            widget.innerHTML = `<strong>${item.destination}:</strong> ${item.text}`;
            homeWidget.appendChild(widget);
        }
    });
    alert("AI has distributed your tasks.");
    clearJotter();
}

function clearJotter() {
    document.getElementById('aiJotter').value = '';
    document.getElementById('aiReviewPanel').classList.add('hidden');
    tempDistribution = [];
}

function removeItem(index) {
    tempDistribution.splice(index, 1);
    renderReview();
}

document.addEventListener('click', (e) => {
    if (!document.querySelector('.search-wrapper')?.contains(e.target)) {
        document.getElementById('searchDropdown')?.classList.add('hidden');
    }
});
