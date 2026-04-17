// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- AUTHENTICATION FLOW ---
function toggleAuthMode(mode) {
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');
    if (mode === 'signup') {
        loginCard.classList.add('hidden');
        signupCard.classList.remove('hidden');
    } else {
        signupCard.classList.add('hidden');
        loginCard.classList.remove('hidden');
    }
}

function handleSignUp() {
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    const confirm = document.getElementById('regConfirm')?.value;

    if (!email || !pass) {
        alert("Credentials required for initialization.");
        return;
    }
    if (confirm && pass !== confirm) {
        alert("Security Breach: Passwords do not match.");
        return;
    }

    alert("Identity Created. Accessing Workspace...");
    login();
}

function login() {
    document.getElementById('login').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    document.body.classList.remove('logged-out');
    lucide.createIcons();
    startClock();
}

function logout() {
    if(confirm("End session?")) {
        window.location.reload();
    }
}

// --- UI & CUSTOMIZATION ---
function saveCustomization() {
    const font = document.getElementById('fontSelector').value;
    const color = document.getElementById('accentPicker').value;
    const feedback = document.getElementById('saveFeedback');
    const btn = document.getElementById('saveCustomBtn');

    // Apply variables globally
    document.documentElement.style.setProperty('--global-font', font);
    document.documentElement.style.setProperty('--accent-color', color);

    // Visual feedback
    feedback.classList.remove('hidden');
    btn.innerText = "Saved";
    
    setTimeout(() => {
        feedback.classList.add('hidden');
        btn.innerText = "Save";
    }, 2000);
}

function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    document.getElementById('profileDropdown').classList.add('hidden');
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    // Handle specific active state logic
    if(event && event.currentTarget.tagName === 'LI') event.currentTarget.classList.add('active');
}

function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        const clock = document.getElementById('clockDisplay');
        const date = document.getElementById('dateDisplay');
        if(clock) clock.innerText = now.toLocaleTimeString();
        if(date) date.innerText = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }, 1000);
}

// Ensure start state is Login
window.onload = () => {
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
};
