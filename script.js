// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateGreeting();
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

function updateGreeting() {
    const hours = new Date().getHours();
    let msg = "Good evening";
    if (hours < 12) msg = "Good morning";
    else if (hours < 17) msg = "Good afternoon";
    document.getElementById('dynamicGreeting').innerText = `${msg}, User`;
}

function switchPage(pageId) {
    // Hide all
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    
    // Show Target
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
        document.getElementById(`nav-${pageId}`).classList.add('active');
    }
    
    // Auto-close profile menu
    document.getElementById('profileDropdown').classList.add('hidden');
}

function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
}

function updateTheme() {
    const color = document.getElementById('themePicker').value;
    const font = document.getElementById('fontChoice').value;
    document.documentElement.style.setProperty('--accent-color', color);
    document.body.style.fontFamily = font;
}

function updateProfile() {
    const init = document.getElementById('initialsInput').value;
    if (init) document.getElementById('userAvatar').innerText = init.toUpperCase();
}

function addToHome(sectionName) {
    const widget = document.createElement('div');
    widget.className = 'glass-card';
    widget.style.marginTop = '15px';
    widget.innerHTML = `<h3>Pinned: ${sectionName}</h3><p>Live data for ${sectionName} will sync here.</p>`;
    document.getElementById('homeWidgets').appendChild(widget);
    alert(`${sectionName} pinned to Home!`);
}
