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
});

// ==========================================
// 3. NAVIGATION & UI CONTROL
// ==========================================
function switchPage(pageId) {
    // Hide all sections
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show the target section
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
    }

    // Update Sidebar visual active state
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
    });
    
    // Handle the specific ID naming for the Timer nav item
    const navId = pageId === 'timers' ? 'nav-timers' : `nav-${pageId}`;
    const activeNav = document.getElementById(navId);
    if (activeNav) activeNav.classList.add('active');

    // Auto-close profile dropdown
    const profileDropdown = document.getElementById('profileDropdown');
    if (profileDropdown) profileDropdown.classList.add('hidden');
}

function toggleAuthMode() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('signupForm').classList.toggle('hidden');
}

function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
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
    
    // Run auto-theme check every 30 seconds
    setInterval(checkAutoTheme, 30000);
    checkAutoTheme();
}

function checkAutoTheme() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Get schedule from inputs or defaults
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

function saveThemeSchedule() {
    const light = document.getElementById('lightTime').value;
    const dark = document.getElementById('darkTime').value;
    localStorage.setItem('lightTime', light);
    localStorage.setItem('darkTime', dark);
    checkAutoTheme();
    alert("Theme schedule updated.");
}

function setManualTheme(mode) {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${mode}-mode`);
}

function updateTheme() {
    const color = document.getElementById('themePicker').value;
    const font = document.getElementById('fontChoice').value;
    
    document.documentElement.style.setProperty('--accent-glow', color);
    document.body.style.setProperty('font-family', font);
    
    localStorage.setItem('lifeOS_themeColor', color);
    localStorage.setItem('lifeOS_font', font);
}

function populateFontList() {
    const selector = document.getElementById('fontChoice');
    if (!selector) return;
    fonts.forEach(f => {
        let opt = document.createElement('option');
        opt.value = f.value;
        opt.textContent = f.name;
        selector.appendChild(opt);
    });
}

function populateStimulations() {
    const list = document.getElementById('stimList');
    if (!list) return;
    list.innerHTML = ''; // Clear existing
    stimulations.forEach(s => {
        const btn = document.createElement('button');
        btn.className = "btn-outline stim-btn";
        btn.textContent = s;
        btn.onclick = () => alert(`Loading ${s} stimulation...`);
        list.appendChild(btn);
    });
}

// ==========================================
// 5. TIME, PERSISTENCE & AI PROCESSOR
// ==========================================
function startTimeEngine() {
    const update = () => {
        const now = new Date();
        
        // Update Date Display
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateDisplay = document.getElementById('dateDisplay');
        if(dateDisplay) dateDisplay.textContent = now.toLocaleDateString(undefined, dateOptions);
        
        // Update Clock Display
        const timeStr = now.toLocaleTimeString([], { hour12: false });
        const clockDisplay = document.getElementById('clockDisplay');
        if(clockDisplay) clockDisplay.textContent = timeStr;
        
        // Update Greeting
        const hrs = now.getHours();
        let greet = (hrs < 12) ? "Good morning" : (hrs < 17) ? "Good afternoon" : "Good evening";
        const greetingDisplay = document.getElementById('dynamicGreeting');
        if(greetingDisplay) greetingDisplay.textContent = `${greet}, ${currentUser || 'User'}`;
    };
    setInterval(update, 1000);
    update();
}

function initPersistenceEngine() {
    const aiJotter = document.getElementById('aiJotter');
    if (!aiJotter) return;

    const draft = localStorage.getItem('jotter_draft');
    if (draft) aiJotter.value = draft;

    aiJotter.addEventListener('input', () => {
        localStorage.setItem('jotter_draft', aiJotter.value);
    });
}

function runAIProcessor() {
    const input = document.getElementById('aiJotter').value;
    if (!input.trim()) return;

    const panel = document.getElementById('aiReviewPanel');
    const list = document.getElementById('distributionList');
    
    panel.classList.remove('hidden');
    list.innerHTML = `<div class="loading-pulse">Analyzing Neural Input...</div>`;

    setTimeout(() => {
        list.innerHTML = `
            <div class="ai-item"><strong>Task detected:</strong> "${input.substring(0, 30)}..." -> Moved to To-Do</div>
            <div class="ai-item"><strong>Schedule:</strong> Extracted potential date/time context.</div>
        `;
    }, 1200);
}

function clearJotter() {
    if (confirm("Clear your workspace? This cannot be undone.")) {
        document.getElementById('aiJotter').value = '';
        localStorage.removeItem('jotter_draft');
        document.getElementById('aiReviewPanel').classList.add('hidden');
    }
}

// ==========================================
// 6. UTILITIES: GLOBAL SEARCH
// ==========================================
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const dropdown = document.getElementById('searchDropdown');
    
    if (query.length < 2) {
        dropdown.classList.add('hidden');
        return;
    }

    const searchableItems = ['Home', 'Productivity', 'Timers', 'World Tools', 'Calendar', 'Settings'];
    const results = searchableItems.filter(i => i.toLowerCase().includes(query));

    if (results.length > 0) {
        dropdown.classList.remove('hidden');
        dropdown.innerHTML = results.map(r => `
            <div class="search-result-item" onclick="switchPage('${r.toLowerCase().replace(' ', '')}')">
                ${r}
            </div>
        `).join('');
    } else {
        dropdown.classList.add('hidden');
    }
}
