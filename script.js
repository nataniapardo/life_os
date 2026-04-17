// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- INITIALIZATION & AUTH ---
function login() {
    const id = document.getElementById('loginId').value;
    if(id) {
        document.getElementById('login').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        lucide.createIcons();
        startClock();
    } else {
        alert("Please initialize identity.");
    }
}

function logout() {
    if(confirm("Terminate session?")) {
        window.location.reload();
    }
}

// --- CUSTOMIZATION ---
function changeGlobalFont() {
    const selectedFont = document.getElementById('fontSelector').value;
    document.documentElement.style.setProperty('--global-font', selectedFont);
}

function applyCustomTheme() {
    const color = document.getElementById('accentPicker').value;
    document.documentElement.style.setProperty('--accent-color', color);
}

// --- CORE UTILS ---
function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
}

function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    document.getElementById('profileDropdown').classList.add('hidden');
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    if(event && event.currentTarget.tagName === 'LI') event.currentTarget.classList.add('active');
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
