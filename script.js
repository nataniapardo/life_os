// =========================
// 1. SYSTEM SETUP & DB
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const OS_VERSION = "2.0.4";
let currentUser = null;

// =========================
// 2. SYSTEM INITIALIZATION
// =========================
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initThemeEngine();
    startTimeEngine();
    populateFontList();
    initPersistenceEngine(); // New: Loads saved drafts
});

// =========================
// 3. NAVIGATION & UI CONTROL
// =========================

/**
 * Enhanced Switch Page Function
 * Handles visibility, sidebar states, and UI cleanup
 */
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
    const activeNav = document.getElementById(`nav-${pageId}`);
    if (activeNav) activeNav.classList.add('active');

    // Auto-close profile dropdown when navigating
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
    // Mock Auth logic to unlock the OS
    currentUser = document.getElementById(mode === 'login' ? 'emailInput' : 'newEmailInput').value || "User";
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    lucide.createIcons();
}

// =========================
// 4. PERSISTENCE ENGINE (Auto-Save)
// =========================
function initPersistenceEngine() {
    const aiJotter = document.getElementById('aiJotter');
    if (!aiJotter) return;

    // Load unsaved text from a previous session
    const draft = localStorage.getItem('jotter_draft');
    if (draft) {
        aiJotter.value = draft;
    }

    // Every time the user types, save progress instantly
    aiJotter.addEventListener('input', () => {
        localStorage.setItem('jotter_draft', aiJotter.value);
    });
}

// =========================
// 5. AI NEURAL PROCESSOR
// =========================
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

/**
 * Clear function - now wipes physical memory
 */
function clearJotter() {
    if (confirm("Clear your workspace? This cannot be undone.")) {
        document.getElementById('aiJotter').value = '';
        localStorage.removeItem('jotter_draft'); // Wipe the auto-save backup
        document.getElementById('aiReviewPanel').classList.add('hidden');
    }
}

// =========================
// 6. THEME & CUSTOMIZATION
// =========================
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
    
    localStorage.setItem('lifeOS_themeColor', color);
    localStorage.setItem('lifeOS_font', font);
}

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

// =========================
// 7. UTILITIES: CLOCK & SEARCH
// =========================
function startTimeEngine() {
    setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: 12, hour12: false });
        document.getElementById('clockDisplay').textContent = timeStr;
        
        const hrs = now.getHours();
        let greet = (hrs < 12) ? "Good morning" : (hrs < 17) ? "Good afternoon" : "Good evening";
        document.getElementById('dynamicGreeting').textContent = `${greet}, ${currentUser || 'User'}`;
    }, 1000);
}

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
