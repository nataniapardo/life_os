// =========================
// 1. SYSTEM SETUP & DB
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Global State
let tempDistribution = [];
let themeSchedule = { light: "07:00", dark: "19:00", active: false };

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(checkThemeSchedule, 60000); // Check auto-theme every minute
});

// =========================
// 2. AUTHENTICATION LOGIC
// =========================
function toggleAuthMode() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('signupForm').classList.toggle('hidden');
}

async function handleAuth(type) {
    // In a real app, you'd use db.auth.signInWithPassword here.
    const nameInput = type === 'signup' ? document.getElementById('newNameInput') : document.getElementById('emailInput');
    const name = nameInput && nameInput.value ? nameInput.value.split('@')[0] : "User";
    
    if(!nameInput.value) { alert("Please enter your details."); return; }

    // Hide auth screens and show app
    const authPage = document.getElementById('authPage');
    const loginPage = document.getElementById('loginPage');
    if(authPage) authPage.classList.add('hidden');
    if(loginPage) loginPage.classList.add('hidden');
    
    document.getElementById('appContainer').classList.remove('hidden');
    
    // Initialize OS features with the user's name
    enterOS(name);
}

function enterOS(userName) {
    const hours = new Date().getHours();
    let msg = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";
    
    const greetingEl = document.getElementById('dynamicGreeting');
    const avatarEl = document.getElementById('userAvatar');
    
    if(greetingEl) greetingEl.innerText = `${msg}, ${userName}`;
    if(avatarEl) avatarEl.innerText = userName.charAt(0).toUpperCase();
    
    lucide.createIcons();
}

// =========================
// 3. THEME & SCHEDULER LOGIC
// =========================
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('theme-futuristic'); 
    } else {
        body.classList.add('light-mode');
        body.classList.remove('theme-futuristic');
    }
}

function saveThemeSchedule() {
    const lightInput = document.getElementById('lightTime');
    const darkInput = document.getElementById('darkTime');
    
    if(lightInput && darkInput) {
        themeSchedule.light = lightInput.value;
        themeSchedule.dark = darkInput.value;
        themeSchedule.active = true;
        alert(`Schedule Saved: Light at ${themeSchedule.light}, Dark at ${themeSchedule.dark}`);
    }
}

function checkThemeSchedule() {
    if (!themeSchedule.active) return;

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                        now.getMinutes().toString().padStart(2, '0');

    if (currentTime === themeSchedule.light) {
        document.body.classList.add('light-mode');
        document.body.classList.remove('theme-futuristic');
    } else if (currentTime === themeSchedule.dark) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('theme-futuristic');
    }
}

// =========================
// 4. CORE UI LOGIC
// =========================
function updateClock() {
    const clockEl = document.getElementById('clockDisplay');
    if (clockEl) {
        const now = new Date();
        clockEl.innerText = now.toLocaleTimeString();
    }
}

function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
        const navItem = document.getElementById(`nav-${pageId}`);
        if (navItem) navItem.classList.add('active');
    }
    
    const profileDropdown = document.getElementById('profileDropdown');
    if(profileDropdown) profileDropdown.classList.add('hidden');
    lucide.createIcons();
}

function toggleProfileMenu() {
    const menu = document.getElementById('profileDropdown');
    if (menu) menu.classList.toggle('hidden');
}

// =========================
// 5. GLOBAL SEARCH & NAVIGATION
// =========================
const siteMap = [
    { name: "Home Dashboard", keyword: "home", target: "home", icon: "home" },
    { name: "AI Productivity", keyword: "productivity", target: "productivity", icon: "zap" },
    { name: "Timers & Focus", keyword: "timers", target: "timers", icon: "timer" },
    { name: "World Tools", keyword: "tools", target: "tools", icon: "globe" },
    { name: "Calendar", keyword: "calendar", target: "calendar", icon: "calendar" },
    { name: "System Settings", keyword: "settings", target: "settings", icon: "settings" },
    { name: "User Profile", keyword: "profile", target: "settings", icon: "user" },
    { name: "Help Guide", keyword: "guide", target: "home", icon: "book-open" }
];

function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    const dropdown = document.getElementById('searchDropdown');
    
    if (!query) {
        dropdown.classList.add('hidden');
        return;
    }

    const matches = siteMap.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.keyword.toLowerCase().includes(query)
    );

    renderSearchResults(matches);
}

function renderSearchResults(matches) {
    const dropdown = document.getElementById('searchDropdown');
    dropdown.innerHTML = "";

    if (matches.length === 0) {
        dropdown.innerHTML = `<div class="search-result-item">No results found</div>`;
    } else {
        matches.forEach(match => {
            const div = document.createElement('div');
            div.className = "search-result-item";
            div.innerHTML = `
                <i data-lucide="${match.icon}"></i>
                <span>${match.name}</span>
            `;
            div.onclick = () => {
                switchPage(match.target);
                clearSearch();
            };
            dropdown.appendChild(div);
        });
    }

    dropdown.classList.remove('hidden');
    lucide.createIcons(); 
}

function clearSearch() {
    const searchInput = document.getElementById('globalSearch');
    if(searchInput) searchInput.value = "";
    document.getElementById('searchDropdown').classList.add('hidden');
}

document.addEventListener('click', (e) => {
    const searchWrapper = document.querySelector('.search-wrapper');
    if (searchWrapper && !searchWrapper.contains(e.target)) {
        document.getElementById('searchDropdown').classList.add('hidden');
    }
});

// =========================
// 6. CUSTOMIZATION & AI LOGIC
// =========================
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

function runAIProcessor() {
    const jotter = document.getElementById('aiJotter');
    if (!jotter || !jotter.value.trim()) return;

    const lines = jotter.value.split(/[.,\n]/); 
    tempDistribution = [];
    
    lines.forEach(line => {
        const text = line.trim();
        if (text.length < 3) return;

        let destination = "Tasks";
        const lowerText = text.toLowerCase();
        
        if (lowerText.match(/at|pm|am|tomorrow|monday/)) destination = "Calendar";
        else if (lowerText.match(/translate|convert|weather/)) destination = "World Tools";
        else if (lowerText.match(/timer|minutes/)) destination = "Timers";

        tempDistribution.push({ text, destination });
    });

    renderReview();
}

function renderReview() {
    const list = document.getElementById('distributionList');
    const panel = document.getElementById('aiReviewPanel');
    if(!list || !panel) return;

    list.innerHTML = "";
    tempDistribution.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "dist-item";
        div.innerHTML = `
            <span><strong>[${item.destination}]</strong> ${item.text}</span>
            <span onclick="removeItem(${index})" style="cursor:pointer; color:red; margin-left:10px; font-weight:bold;">✕</span>
        `;
        list.appendChild(div);
    });
    panel.classList.remove('hidden');
}

function applyAIDistribution() {
    tempDistribution.forEach(item => {
        const homeWidget = document.getElementById('homeWidgets');
        if (homeWidget) {
            const widget = document.createElement('div');
            widget.className = "glass-card";
            widget.style.fontSize = "0.8rem";
            widget.style.marginTop = "10px";
            widget.innerHTML = `<strong>${item.destination}:</strong> ${item.text}`;
            homeWidget.appendChild(widget);
        }
    });

    alert("AI has distributed your tasks.");
    clearJotter();
}

function clearJotter() {
    const jotter = document.getElementById('aiJotter');
    if (jotter) jotter.value = '';
    document.getElementById('aiReviewPanel').classList.add('hidden');
    tempDistribution = [];
}

function removeItem(index) {
    tempDistribution.splice(index, 1);
    renderReview();
}
