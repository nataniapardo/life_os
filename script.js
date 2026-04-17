// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. RELATIONAL DATABASE & FORMULAS ---
const database = [
    { id: 1, title: "Launch Marketing Plan", priority: "High", deadline: "2026-05-20", status: "In Progress" },
    { id: 2, title: "AI Core Extraction", priority: "Urgent", deadline: "2026-04-30", status: "Pending" }
];

function renderDatabase() {
    const body = document.getElementById('db-body');
    if(!body) return;

    body.innerHTML = database.map(row => {
        // FORMULA CALCULATION: Days remaining until deadline
        const today = new Date();
        const target = new Date(row.deadline);
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return `
            <tr>
                <td><b>${row.title}</b></td>
                <td><span class="tag">${row.priority}</span></td>
                <td style="color: ${diffDays < 5 ? '#ff4d4d' : '#00f2ff'}">
                    ${diffDays} Days Remaining
                </td>
                <td>${row.status}</td>
            </tr>
        `;
    }).join('');
}

// --- 2. KANBAN LOGIC ---
function renderKanban() {
    const cols = {
        'Pending': document.querySelector('#col-pending .kanban-cards'),
        'In Progress': document.querySelector('#col-progress .kanban-cards'),
        'Completed': document.querySelector('#col-done .kanban-cards')
    };

    database.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glass-card kanban-card';
        card.style.marginBottom = '10px';
        card.innerHTML = `<h4>${item.title}</h4><p>${item.deadline}</p>`;
        
        if(cols[item.status]) cols[item.status].appendChild(card);
    });
}

// --- 3. EDITOR COMMANDS ---
function execCmd(command) {
    document.execCommand(command, false, null);
}

// --- 4. NAVIGATION & CLOCK ---
function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    
    if(pageId === 'database') renderDatabase();
    if(pageId === 'tasks') renderKanban();
}

function updateClock() {
    const now = new Date();
    document.getElementById('clockDisplay').innerText = now.toLocaleTimeString();
    document.getElementById('dateDisplay').innerText = now.toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
}
setInterval(updateClock, 1000);

// LOGIN LOGIC
function login() {
    document.getElementById('login').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    document.body.classList.remove('logged-out');
    lucide.createIcons();
    updateClock();
}
