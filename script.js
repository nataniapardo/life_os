// --- STATE & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    loadSettings();
    attachListeners();
});

function updateClock() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString();
    document.getElementById('currentDate').textContent = now.toLocaleDateString(undefined, { 
        weekday: 'short', month: 'short', day: 'numeric' 
    });
}

// --- UI TOGGLES ---
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    localStorage.setItem('zen_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');
profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle('hidden');
});

// Close menu on outside click
window.addEventListener('click', () => profileMenu.classList.add('hidden'));

// --- SETTINGS (COLOR CUSTOMIZATION) ---
function toggleSettings() {
    document.getElementById('settingsModal').classList.toggle('hidden');
}

function changeAccent(color) {
    document.documentElement.style.setProperty('--accent', color);
    localStorage.setItem('zen_accent', color);
    
    // Update the globe glow dynamically
    const globe = document.querySelector('.globe');
    globe.style.background = color;
    globe.style.boxShadow = `0 0 15px ${color}`;
}

function loadSettings() {
    const savedAccent = localStorage.getItem('zen_accent');
    if (savedAccent) changeAccent(savedAccent);
    
    const savedTheme = localStorage.getItem('zen_theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
}

// --- TASK LOGIC ---
function updateTaskCount() {
    const total = document.querySelectorAll('#taskList input[type="checkbox"]').length;
    const unchecked = [...document.querySelectorAll('#taskList input[type="checkbox"]')].filter(i => !i.checked).length;
    document.getElementById('taskCount').textContent = unchecked;
}

function attachListeners() {
    document.querySelectorAll('input[type="checkbox"]').forEach(i => {
        i.addEventListener('change', updateTaskCount);
    });
    updateTaskCount();
}

function handleLogout() {
    if(confirm("End current zen session?")) {
        alert("Session saved to local consciousness.");
    }
}
