// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. SESSION MANAGEMENT ---
function login() {
    const user = document.getElementById('loginId').value;
    if(user) {
        document.getElementById('login').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        lucide.createIcons();
        startClock();
        renderDatabase();
    }
}

// --- 2. NAVIGATION ---
function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// --- 3. TOOLS: POMODORO & CALC ---
let timer;
function toggleTimer() {
    let timeLeft = 25 * 60;
    const display = document.getElementById('timer');
    timer = setInterval(() => {
        let mins = Math.floor(timeLeft / 60);
        let secs = timeLeft % 60;
        display.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        if (--timeLeft < 0) clearInterval(timer);
    }, 1000);
}

function calc(val) { document.getElementById('calcDisplay').value += val; }
function solve() { 
    try { document.getElementById('calcDisplay').value = eval(document.getElementById('calcDisplay').value); } 
    catch { document.getElementById('calcDisplay').value = "Error"; }
}
function clearCalc() { document.getElementById('calcDisplay').value = ""; }

// --- 4. DATABASE FORMULAS ---
const sampleData = [
    { name: "Global Strategy", status: "Active", date: "2026-06-01" },
    { name: "Financial Audit", status: "Review", date: "2026-04-25" }
];

function renderDatabase() {
    const tbody = document.getElementById('db-body');
    if(!tbody) return;
    tbody.innerHTML = sampleData.map(item => {
        const daysLeft = Math.ceil((new Date(item.date) - new Date()) / (86400000));
        return `<tr>
            <td>${item.name}</td>
            <td><span class="btn-glow" style="padding:4px 8px; font-size:10px">${item.status}</span></td>
            <td>${item.date}</td>
            <td style="color:var(--accent-color)">${daysLeft} Days Remaining</td>
        </tr>`;
    }).join('');
}

// --- 5. UI UTILITIES ---
function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clockDisplay').innerText = now.toLocaleTimeString();
        document.getElementById('dateDisplay').innerText = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }, 1000);
}

function exec(cmd) { document.execCommand(cmd, false, null); }
