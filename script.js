// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- AUTH LOGIC ---
function toggleAuthMode(mode) {
    if (mode === 'signup') {
        document.getElementById('loginCard').classList.add('hidden');
        document.getElementById('signupCard').classList.remove('hidden');
    } else {
        document.getElementById('signupCard').classList.add('hidden');
        document.getElementById('loginCard').classList.remove('hidden');
    }
}

function handleSignUp() {
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    const confirm = document.getElementById('regConfirm').value;

    if (!email || !pass) {
        alert("Credentials required.");
        return;
    }
    if (pass !== confirm) {
        alert("Passwords do not match.");
        return;
    }

    // Example initialization logic
    alert("Identity Created. Redirecting to workspace...");
    login();
}

function login() {
    // Basic entry logic for the UI demonstration
    document.getElementById('login').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    lucide.createIcons();
    startClock();
}

function logout() {
    if(confirm("End session?")) {
        window.location.reload();
    }
}

// --- UTILS ---
function saveCustomization() {
    const font = document.getElementById('fontSelector').value;
    document.documentElement.style.setProperty('--global-font', font);
    alert("Changes Saved.");
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

function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
}

window.onload = () => {
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
};
