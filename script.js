// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. INITIALIZATION ---
let supabaseClient = null;

// Fix: Check if Supabase is defined before initialization
if (typeof supabase !== 'undefined') {
    // Replace with your actual credentials if using Supabase
    // supabaseClient = supabase.createClient('URL', 'KEY'); 
} else {
    console.warn("Supabase library not loaded. Local mode active.");
}

const dbData = [
    { title: "Quarterly Audit", status: "Pending", deadline: "2026-05-15" },
    { title: "System Integration", status: "In Progress", deadline: "2026-04-30" }
];

// --- 2. CORE FUNCTIONS ---
function login() {
    document.getElementById('login').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    lucide.createIcons();
    startClock();
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clockDisplay').innerText = now.toLocaleTimeString();
        document.getElementById('dateDisplay').innerText = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }, 1000);
}

function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    
    // Toggle active state in sidebar
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    if(pageId === 'database') renderDatabase();
}

function renderDatabase() {
    const tbody = document.getElementById('db-body');
    if (!tbody) return;
    tbody.innerHTML = dbData.map(row => {
        const diff = Math.ceil((new Date(row.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        return `<tr><td>${row.title}</td><td>${row.status}</td><td>${row.deadline}</td><td style="color:var(--accent-color)">${diff} Days</td></tr>`;
    }).join('');
}

function execCmd(cmd) { document.execCommand(cmd, false, null); }
