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
    if(confirm("End session?")) {
        window.location.reload();
    }
}

// --- CUSTOMIZATION & SAVE LOGIC ---
function saveCustomization() {
    const font = document.getElementById('fontSelector').value;
    const color = document.getElementById('accentPicker').value;
    const feedback = document.getElementById('saveFeedback');
    const btn = document.getElementById('saveCustomBtn');

    // Apply Changes
    document.documentElement.style.setProperty('--global-font', font);
    document.documentElement.style.setProperty('--accent-color', color);

    // Visual Feedback
    feedback.classList.remove('hidden');
    btn.innerText = "Saved!";
    
    setTimeout(() => {
        feedback.classList.add('hidden');
        btn.innerText = "Save Changes";
    }, 2000);
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

function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
}

window.onload = () => {
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
};
