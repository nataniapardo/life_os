// SUPABASE & CONFIGURATION 
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// PAGE ROUTER
function switchPage(pageId) {
    const isLoggedIn = localStorage.getItem("loggedIn");
    const protected = ["dashboard"];

    if (protected.includes(pageId) && !isLoggedIn) {
        alert("System access denied. Please login.");
        return;
    }

    document.querySelectorAll('.view-section').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');
    
    const nav = document.querySelector(`[data-section="${pageId}"]`);
    if (nav) nav.classList.add('active');
}

function goHome() { switchPage('home'); }

// THEME ENGINE
const colorPicker = document.getElementById('colorPicker');
const hexInput = document.getElementById('hexInput');

if(colorPicker) {
    colorPicker.addEventListener('input', (e) => updateTheme(e.target.value));
}

function applyHex() {
    const hex = hexInput.value.trim();
    if (/^#[0-9A-F]{6}$/i.test(hex)) updateTheme(hex);
}

function setPreset(color) { updateTheme(color); }

function updateTheme(color) {
    document.documentElement.style.setProperty('--accent-color', color);
    if(hexInput) hexInput.value = color.toUpperCase();
    if(colorPicker) colorPicker.value = color;
}

// PROFILE DROPDOWN
function toggleProfileMenu() {
    document.getElementById('profileMenu').classList.toggle('hidden');
}

// Close dropdown if clicking outside
window.onclick = function(event) {
    if (!event.target.closest('.profile-container')) {
        const menu = document.getElementById('profileMenu');
        if (menu) menu.classList.add('hidden');
    }
}

// CLOCK
setInterval(() => {
    const clock = document.getElementById("clock");
    if(clock) clock.textContent = new Date().toLocaleTimeString();
}, 1000);

// TASKS & STORAGE (Simplified)
function addTask() {
    const input = document.getElementById("taskInput");
    if (!input.value) return;
    const list = document.getElementById("taskList");
    const li = document.createElement("li");
    li.style.padding = "10px";
    li.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
    li.textContent = "• " + input.value;
    list.appendChild(li);
    input.value = "";
}
