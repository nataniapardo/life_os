// =========================
// 1. SYSTEM SETUP & DB
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. SYSTEM INITIALIZATION & STATE
const OS_VERSION = "2.0.4";
let currentUser = null;

// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initThemeEngine();
    startTimeEngine();
    populateFontList();
});

// 2. NAVIGATION & UI CONTROL
function switchPage(pageId) {
    // Update View Sections
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');

    // Update Sidebar Active State
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
    });
    const activeNav = document.getElementById(`nav-${pageId}`);
    if (activeNav) activeNav.classList.add('active');
}

function toggleAuthMode() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('signupForm').classList.toggle('hidden');
}

function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
}

// 3. THEME & FONT ENGINE (Zen Chic Updates)
const fonts = [
    { name: 'Modern Sans', value: "'Inter', sans-serif" },
    { name: 'Futuristic', value: "'Orbitron', sans-serif" },
    { name: 'Elegant Serif', value: "'Playfair Display', serif" },
    { name: 'Coding Mono', value: "'JetBrains Mono', monospace" },
    { name: 'Clean Montserrat', value: "'Montserrat', sans-serif" }
];

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

function updateTheme() {
    const color = document.getElementById('themePicker').value;
    const font = document.getElementById('fontChoice').value;
    
    document.documentElement.style.setProperty('--accent-glow', color);
    document.body.style.setProperty('font-family', font);
    
    // Save to LocalStorage for persistence
    localStorage.setItem('lifeOS_themeColor', color);
    localStorage.setItem('lifeOS_font', font);
}

function initThemeEngine() {
    // Load saved settings
    const savedColor = localStorage.getItem('lifeOS_themeColor');
    const savedFont = localStorage.getItem('lifeOS_font');
    
    if (savedColor) {
        document.getElementById('themePicker').value = savedColor;
        document.documentElement.style.setProperty('--accent-glow', savedColor);
    }
    if (savedFont) {
        document.getElementById('fontChoice').value = savedFont;
        document.body.style.setProperty('font-family', savedFont);
    }
    
    // Run Auto-Theme Check every minute
    setInterval(checkAutoTheme, 60000);
    checkAutoTheme();
}

function checkAutoTheme() {
    const now = new Date();
    const hour = now.getHours();
    const lightTime = parseInt(document.getElementById('lightTime')?.value || 7);
    const darkTime = parseInt(document.getElementById('darkTime')?.value || 19);

    if (hour >= lightTime && hour < darkTime) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    }
}

// 4. AI NEURAL PROCESSOR (Mock Logic)
function runAIProcessor() {
    const input = document.getElementById('aiJotter').value;
    if (!input.trim()) return;

    const panel = document.getElementById('aiReviewPanel');
    const list = document.getElementById('distributionList');
    
    panel.classList.remove('hidden');
    list.innerHTML = `<div class="loading-pulse">Analyzing Neural Input...</div>`;

    // Simulated AI Distribution Logic
    setTimeout(() => {
        list.innerHTML = `
            <div class="ai-item"><strong>Task detected:</strong> "${input.substring(0, 30)}..." -> Moved to To-Do</div>
            <div class="ai-item"><strong>Schedule:</strong> Extracted potential date/time context.</div>
        `;
    }, 1200);
}

function clearJotter() {
    document.getElementById('aiJotter').value = '';
    document.getElementById('aiReviewPanel').classList.add('hidden');
}

// 5. CLOCK & GREETING ENGINE
function startTimeEngine() {
    setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour12: false });
        document.getElementById('clockDisplay').textContent = timeStr;
        
        // Dynamic Greeting
        const hrs = now.getHours();
        let greet = "Good night";
        if (hrs < 12) greet = "Good morning";
        else if (hrs < 17) greet = "Good afternoon";
        else greet = "Good evening";
        
        document.getElementById('dynamicGreeting').textContent = `${greet}, ${currentUser || 'User'}`;
    }, 1000);
}

// 6. GLOBAL SEARCH LOGIC
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
