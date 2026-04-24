// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = ‘https://bzwnjtofcduxllafdybw.supabase.co’;
const SUPABASE_KEY = ‘sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl’;
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CONFIGURATION ---
const CONFIG = {
    SYNONYMS: { "job": ["career", "employment", "work"], "task": ["objective", "to-do", "goal"] }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initClock();
    initSimBackground();
    loadSession();
});

// --- CLOCK & THEME SCHEDULE ---
function initClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clockDisplay').innerText = now.toLocaleTimeString();
        checkThemeSchedule(now);
    }, 1000);
}

function checkThemeSchedule(now) {
    const current = now.getHours() + ":" + now.getMinutes();
    const light = document.getElementById('lightTime').value;
    const dark = document.getElementById('darkTime').value;
    if (current === light) document.body.classList.add('light-mode');
    if (current === dark) document.body.classList.remove('light-mode');
}

// --- AI & DOCUMENT EXTRACTION SIMULATION ---
async function aiOrganize() {
    const input = document.getElementById('notes').value;
    if (!input) { alert("Error: Input buffer empty. Please provide text."); return; }
    
    // Simulate AI Latency
    const btn = document.getElementById('aiBtn');
    btn.innerText = "Processing Neural Path...";
    
    setTimeout(() => {
        // Mock Grammar Correction & Extraction
        const corrected = input.charAt(0).toUpperCase() + input.slice(1);
        alert("AI Action: Grammar Corrected & Information Extracted to Objectives.");
        addManualTask(corrected, "High");
        btn.innerHTML = `<i data-lucide="brain"></i> Organize with AI`;
        lucide.createIcons();
    }, 2000);
}

// --- SEARCH & SYNONYM LOGIC ---
function handleSearch() {
    const query = document.getElementById('globalSearch').value.toLowerCase();
    const tasks = document.querySelectorAll('.task-item');
    
    // Expand query with synonyms
    let searchTerms = [query];
    for (let key in CONFIG.SYNONYMS) {
        if (query.includes(key)) searchTerms = [...searchTerms, ...CONFIG.SYNONYMS[key]];
    }

    tasks.forEach(task => {
        const text = task.innerText.toLowerCase();
        const match = searchTerms.some(term => text.includes(term));
        task.style.display = match ? 'flex' : 'none';
    });
}

// --- UI CUSTOMIZATION ---
function updateThemeColor(val) {
    if (!val.startsWith('#')) val = '#' + val;
    document.documentElement.style.setProperty('--accent', val);
    document.getElementById('hexInput').value = val;
}

// --- BACKGROUND SIMULATION ENGINE ---
function initSimBackground() {
    const cols = ['simTasks', 'simCalendar', 'simAccomplishments'];
    cols.forEach(id => {
        const el = document.getElementById(id);
        for(let i=0; i<20; i++) {
            const div = document.createElement('div');
            div.style.padding = '10px';
            div.style.border = '1px solid var(--border)';
            div.style.margin = '10px 0';
            div.innerText = id === 'simTasks' ? "✓ Task Item Sync..." : "📅 Calendar Block Set";
            el.appendChild(div);
        }
    });
}

// --- AUTH & NAVIGATION ---
function handleAuth(mode) {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    saveName();
}

function saveName() {
    const name = document.getElementById('nameInput').value || "User";
    document.getElementById('greeting').innerText = `Welcome Back, ${name}`;
    localStorage.setItem('life_os_name', name);
}

function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

function addManualTask(text, priority = "Medium") {
    const container = document.getElementById('tasks');
    const item = document.createElement('div');
    item.className = 'glass-card task-item';
    item.style.marginBottom = '10px';
    item.innerHTML = `<span>${text}</span> <span class="priority ${priority.toLowerCase()}">${priority}</span>`;
    container.prepend(item);
}
