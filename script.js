// ==========================================
// 1. SUPABASE & EXTERNAL API CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CONFIG = {
    SYNONYMS: { 
        "job": ["career", "employment", "work"], 
        "task": ["objective", "to-do", "goal"] 
    }
};

// =========================
// 2. INITIALIZATION
// =========================
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
        const display = document.getElementById('clockDisplay');
        if (display) display.innerText = now.toLocaleTimeString();
        checkThemeSchedule(now);
    }, 1000);
}

function checkThemeSchedule(now) {
    const current = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0');
    const light = document.getElementById('lightTime')?.value || "07:00";
    const dark = document.getElementById('darkTime')?.value || "19:00";
    
    if (current === light) document.body.classList.add('light-mode');
    if (current === dark) document.body.classList.remove('light-mode');
}

// =========================
// 3. TASK & API LOGIC
// =========================

// POST a new task to dhruv.anita100 API (RapidAPI)
async function saveTaskToRapidAPI(taskText) {
    const url = 'https://todo-list13.p.rapidapi.com/add-task';
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': '1fc885e56dmsh7b38e5337649fcfp1a5dacjsne68127cf5fb3',
            'X-RapidAPI-Host': 'todo-list13.p.rapidapi.com'
        },
        body: JSON.stringify({ task: taskText, status: 'pending' })
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log("RapidAPI Task Saved:", result);
        showNotification("Neural Sync Successful", "success");
    } catch (error) {
        // Requirement #7: Alert users on which information needs to be fixed
        showNotification("Failed to sync task: " + error.message, "error");
    }
}

// --- AI & DOCUMENT EXTRACTION SIMULATION ---
async function aiOrganize() {
    const inputField = document.getElementById('notes');
    const input = inputField.value;
    
    if (!input) { 
        showNotification("Input buffer empty. Please provide text for AI analysis.", "error");
        return; 
    }
    
    const btn = document.getElementById('aiBtn');
    const originalContent = btn.innerHTML;
    btn.innerText = "Processing Neural Path...";
    
    // Simulating AI Processing (Grammar/Extraction)
    setTimeout(async () => {
        const corrected = input.charAt(0).toUpperCase() + input.slice(1);
        
        // 1. Add to local UI
        addManualTask(corrected, "High");
        
        // 2. Sync to RapidAPI Cloud Storage
        await saveTaskToRapidAPI(corrected);
        
        // 3. UI Cleanup
        inputField.value = "";
        btn.innerHTML = originalContent;
        lucide.createIcons();
    }, 2000);
}

// =========================
// 4. UTILITIES & UI
// =========================

function showNotification(message, type = "info") {
    // Create alert element for Requirement #7
    const alertBox = document.createElement('div');
    alertBox.className = `system-alert ${type}`;
    alertBox.style.position = 'fixed';
    alertBox.style.bottom = '20px';
    alertBox.style.right = '20px';
    alertBox.style.padding = '15px';
    alertBox.style.borderRadius = '8px';
    alertBox.style.background = type === 'error' ? '#ff4d4d' : '#00f2ff';
    alertBox.style.color = '#000';
    alertBox.style.zIndex = '9999';
    alertBox.innerText = `[SYSTEM]: ${message}`;
    
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 4000);
}

function handleSearch() {
    const query = document.getElementById('globalSearch').value.toLowerCase();
    const tasks = document.querySelectorAll('.task-item');
    
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

function updateThemeColor(val) {
    if (!val.startsWith('#')) val = '#' + val;
    document.documentElement.style.setProperty('--accent', val);
    document.getElementById('hexInput').value = val;
}

function initSimBackground() {
    const cols = ['simTasks', 'simCalendar', 'simAccomplishments'];
    cols.forEach(id => {
        const el = document.getElementById(id);
        if(!el) return;
        for(let i=0; i<20; i++) {
            const div = document.createElement('div');
            div.style.padding = '10px';
            div.style.border = '1px solid var(--border)';
            div.style.margin = '10px 0';
            div.innerText = id === 'simTasks' ? "✓ Syncing..." : "📅 Plan Active";
            el.appendChild(div);
        }
    });
}

function handleAuth(mode) {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    saveName();
}

function saveName() {
    const name = document.getElementById('nameInput').value || "User";
    const greeting = document.getElementById('greeting');
    if(greeting) greeting.innerText = `Welcome Back, ${name}`;
    localStorage.setItem('life_os_name', name);
}

function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

function addManualTask(text, priority = "Medium") {
    const container = document.getElementById('tasks');
    if(!container) return;
    const item = document.createElement('div');
    item.className = 'glass-card task-item animate-in';
    item.style.marginBottom = '10px';
    item.innerHTML = `<span>${text}</span> <span class="priority ${priority.toLowerCase()}">${priority}</span>`;
    container.prepend(item);
}

function loadSession() {
    const savedName = localStorage.getItem('life_os_name');
    if (savedName) {
        document.getElementById('nameInput').value = savedName;
        document.getElementById('greeting').innerText = `Welcome Back, ${savedName}`;
    }
}
