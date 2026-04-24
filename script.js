// --- GLOBAL STATE ---
let isMilitaryTime = false;
let userName = localStorage.getItem('lifeOS_name') || "Seeker";

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateTimeAndGreeting();
    setInterval(updateTimeAndGreeting, 1000);
    loadSettings();
    attachCheckboxListeners();
});

// --- TIME & GREETING ---
function updateTimeAndGreeting() {
    const now = new Date();
    const hours = now.getHours();
    const greetingEl = document.getElementById('dynamicGreeting');
    const clockEl = document.getElementById('clockDisplay');
    const dateEl = document.getElementById('dateDisplay');

    // Greeting Logic
    let status = "Day";
    if (hours < 12) status = "Morning";
    else if (hours < 17) status = "Afternoon";
    else if (hours < 21) status = "Evening";
    else status = "Night";
    greetingEl.innerText = `Good ${status}, ${userName}`;

    // Clock Logic
    clockEl.innerText = isMilitaryTime ? now.toLocaleTimeString('en-GB') : now.toLocaleTimeString('en-US');
    dateEl.innerText = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

    checkThemeSchedule(now);
}

function toggleMilitaryTime() { isMilitaryTime = !isMilitaryTime; }

function updateUserName() {
    const input = document.getElementById('userNameInput');
    if (input.value.trim()) {
        userName = input.value.trim();
        localStorage.setItem('lifeOS_name', userName);
        updateTimeAndGreeting();
    }
}

// --- THEME ENGINE ---
function manualThemeToggle() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    body.classList.toggle('light-mode');
    body.classList.toggle('dark-mode');
    
    const isLight = body.classList.contains('light-mode');
    icon.setAttribute('data-lucide', isLight ? 'sun' : 'moon');
    lucide.createIcons();
}

function toggleSchedule() {
    const isEnabled = document.getElementById('enableSchedule').checked;
    document.getElementById('scheduleInputs').style.display = isEnabled ? 'grid' : 'none';
}

function checkThemeSchedule(now) {
    if (!document.getElementById('enableSchedule').checked) return;
    const current = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    const light = document.getElementById('lightTime').value;
    const dark = document.getElementById('darkTime').value;

    if (current === light) {
        document.body.classList.replace('dark-mode', 'light-mode');
    } else if (current === dark) {
        document.body.classList.replace('light-mode', 'dark-mode');
    }
}

function changeAccent(color) {
    document.documentElement.style.setProperty('--accent', color);
    const globe = document.querySelector('.globe');
    if(globe) globe.style.background = color;
    localStorage.setItem('zen_accent', color);
}

// --- NAVIGATION ---
function switchView(viewId) {
    document.getElementById('dashboardView').classList.add('hidden');
    document.getElementById('settingsView').classList.add('hidden');
    document.getElementById(viewId + 'View').classList.remove('hidden');
}

const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');
profileBtn.addEventListener('click', (e) => { e.stopPropagation(); profileMenu.classList.toggle('hidden'); });
window.addEventListener('click', () => profileMenu.classList.add('hidden'));

// --- SECTION ADDER ---
function addNewCategorizedSection() {
    const cat = document.getElementById('categorySelector').value;
    if (!cat) return alert("Select a category.");
    alert("System expansion initiated for: " + cat);
    // Here you would append new HTML to the sidebar
}

function loadSettings() {
    const savedAccent = localStorage.getItem('zen_accent');
    if (savedAccent) changeAccent(savedAccent);
}

function attachCheckboxListeners() {
    document.querySelectorAll('input[type="checkbox"]').forEach(i => {
        i.addEventListener('change', () => {
            const count = [...document.querySelectorAll('#taskList input[type="checkbox"]')].filter(x => !x.checked).length;
            document.getElementById('taskCount').textContent = count;
        });
    });
}
