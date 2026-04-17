// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function login() {
    const id = document.getElementById('loginId').value;
    if(id) {
        document.getElementById('login').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        lucide.createIcons();
        startClock();
    }
}

function logout() {
    // Changed "Terminate Session" to "End Session"
    if(confirm("End session?")) {
        window.location.reload();
    }
}

function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
}

function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    document.getElementById('profileDropdown').classList.add('hidden');
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clockDisplay').innerText = now.toLocaleTimeString();
        document.getElementById('dateDisplay').innerText = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }, 1000);
}

window.onload = () => {
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
};
