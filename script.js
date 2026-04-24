let isMilitaryTime = false;
let userName = localStorage.getItem('lifeOS_name') || "Operator";

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initClock();
    loadCustomization();
});

// Clock Logic
function initClock() {
    updateTime();
    setInterval(updateTime, 1000);
}

function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    
    // Dynamic Greeting
    let greet = "System Online";
    if (hours < 12) greet = "Morning Protocol";
    else if (hours < 18) greet = "Afternoon Active";
    else greet = "Evening Standby";
    document.getElementById('dynamicGreeting').innerText = `${greet}, ${userName}`;

    // Clock Display
    const clockEl = document.getElementById('clockDisplay');
    clockEl.innerText = isMilitaryTime ? now.toLocaleTimeString('en-GB') : now.toLocaleTimeString('en-US');
    
    document.getElementById('dateDisplay').innerText = now.toLocaleDateString(undefined, { 
        weekday: 'short', month: 'short', day: 'numeric' 
    });
}

function toggleMilitaryTime() { isMilitaryTime = !isMilitaryTime; }

// View Switching
function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId + 'View').classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// Customization
function changeAccent(color) {
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--border', color + '33'); // Transparent border
    localStorage.setItem('lifeOS_accent', color);
}

function changeFont(font) {
    document.body.style.fontFamily = font;
    localStorage.setItem('lifeOS_font', font);
}

function updateUserName() {
    const val = document.getElementById('userNameInput').value;
    if(val) {
        userName = val;
        localStorage.setItem('lifeOS_name', val);
        updateTime();
    }
}

function loadCustomization() {
    const font = localStorage.getItem('lifeOS_font');
    if(font) {
        changeFont(font);
        document.getElementById('fontSelector').value = font;
    }
    const accent = localStorage.getItem('lifeOS_accent');
    if(accent) changeAccent(accent);
}

// Profile Menu
function toggleProfileMenu(e) {
    e.stopPropagation();
    document.getElementById('profileMenu').classList.toggle('hidden');
}

window.onclick = () => document.getElementById('profileMenu').classList.add('hidden');

// Modal Logic
function openModal() { document.getElementById('quickModal').classList.remove('hidden'); }
function closeModal() { document.getElementById('quickModal').classList.add('hidden'); }

function addNewCategorizedSection() {
    const val = document.getElementById('categorySelector').value;
    if(val) alert(`Initializing module: ${val.toUpperCase()}`);
}
