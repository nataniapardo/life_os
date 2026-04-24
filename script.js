// ==========================
// SUPABASE INITIALIZATION
// ==========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateGreeting();
    setInterval(updateTime, 1000);
});

// DYNAMIC GREETING LOGIC
function updateGreeting() {
    const hours = new Date().getHours();
    const greetingEl = document.getElementById('dynamicGreeting');
    let msg = "";
    
    if (hours >= 5 && hours < 12) msg = "Good morning";
    else if (hours >= 12 && hours < 17) msg = "Good afternoon";
    else if (hours >= 17 && hours < 21) msg = "Good evening";
    else msg = "Good night";
    
    greetingEl.innerText = `${msg}, User`;
}

function updateTime() {
    const now = new Date();
    document.getElementById('clockDisplay').innerText = now.toLocaleTimeString();
    document.getElementById('dateDisplay').innerText = now.toDateString();
}

// PROFILE MENU TOGGLE FIX
function toggleProfileMenu() {
    const menu = document.getElementById('profileDropdown');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// NAVIGATION
function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if (target) target.classList.remove('hidden');
    
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
        if (li.getAttribute('onclick').includes(pageId)) li.classList.add('active');
    });
}

// PRODUCTIVITY AI SIMULATION
function processAIInput() {
    const input = document.getElementById('aiRawInput').value;
    if (!input) return;

    // Simulate AI sorting
    const previewArea = document.getElementById('aiPreviewArea');
    const suggestList = document.getElementById('suggestedList');
    suggestList.innerHTML = "";

    const fakeTasks = input.split(',').map(t => t.trim());
    fakeTasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<label><input type="checkbox" checked> ${task} (AI Sorted)</label>`;
        suggestList.appendChild(li);
    });

    previewArea.classList.remove('hidden');
}

function applyToMainList() {
    const suggested = document.getElementById('suggestedList').innerHTML;
    document.getElementById('finalTaskList').innerHTML += suggested;
    document.getElementById('aiPreviewArea').classList.add('hidden');
    document.getElementById('aiRawInput').value = "";
    alert("Tasks saved to 24/7 view!");
}

// CALENDAR CUSTOMIZATION
function updateCalTheme() {
    const color = document.getElementById('calColorPicker').value;
    const hex = document.getElementById('calHexInput').value;
    const finalColor = hex.startsWith('#') ? hex : color;

    document.querySelectorAll('.cal-day').forEach(day => {
        day.style.borderColor = finalColor;
        day.style.color = finalColor;
    });
}
