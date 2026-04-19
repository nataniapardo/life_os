// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    setInterval(updateClock, 1000);
});

function enterOS() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
}

function updateClock() {
    const now = new Date();
    document.getElementById('clockDisplay').innerText = now.toLocaleTimeString();
}

function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
}

function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
        if (li.getAttribute('onclick').includes(pageId)) li.classList.add('active');
    });
}

// THEME & PROFILE ENGINE
function updateTheme() {
    const color = document.getElementById('themePicker').value;
    const font = document.getElementById('fontChoice').value;
    
    document.documentElement.style.setProperty('--accent-color', color);
    document.documentElement.style.setProperty('--user-font', font);
}

function updateProfile() {
    const initials = document.getElementById('initialsInput').value;
    if(initials) document.getElementById('userAvatar').innerText = initials;
}

// HOME PLACEMENT SYSTEM
function addToHome(type) {
    const widgetArea = document.getElementById('homeWidgets');
    const widget = document.createElement('div');
    widget.className = 'glass-card widget';
    widget.innerHTML = `<h3>${type.toUpperCase()}</h3><p>Live widget tracking enabled.</p>`;
    widgetArea.appendChild(widget);
    alert(`${type} added to Home Dashboard!`);
}

function changeStim(stim) {
    document.body.className = `theme-${stim}`;
}
