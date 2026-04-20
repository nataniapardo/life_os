// =========================
// 1. SYSTEM SETUP & DB
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Global State
let tempDistribution = [];

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateGreeting();
    setInterval(updateClock, 1000);
});

// =========================
// 2. AUTHENTICATION & OS ENTRANCE
// =========================
function enterOS() {
    const nameInput = document.getElementById('userNameInput');
    const name = (nameInput && nameInput.value) ? nameInput.value : "User";
    
    const hours = new Date().getHours();
    let msg = "Good night";
    if (hours >= 5 && hours < 12) msg = "Good morning";
    else if (hours >= 12 && hours < 17) msg = "Good afternoon";
    else if (hours >= 17 && hours < 21) msg = "Good evening";
    
    document.getElementById('dynamicGreeting').innerText = `${msg}, ${name}`;
    document.getElementById('userAvatar').innerText = name.charAt(0).toUpperCase();

    document.getElementById('loginPage').classList.add('hidden');
    const authPage = document.getElementById('authPage');
    if(authPage) authPage.classList.add('hidden');
    
    document.getElementById('appContainer').classList.remove('hidden');
    lucide.createIcons();
}

// =========================
// 3. CORE UI LOGIC
// =========================
function updateClock() {
    const clockEl = document.getElementById('clockDisplay');
    if (clockEl) {
        const now = new Date();
        clockEl.innerText = now.toLocaleTimeString();
    }
}

function updateGreeting() {
    const hours = new Date().getHours();
    let msg = "Good evening";
    if (hours < 12) msg = "Good morning";
    else if (hours < 17) msg = "Good afternoon";
    document.getElementById('dynamicGreeting').innerText = `${msg}, User`;
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
    
    document.getElementById('profileDropdown').classList.add('hidden');
    lucide.createIcons();
}

function toggleProfileMenu() {
    const menu = document.getElementById('profileDropdown');
    if (menu) menu.classList.toggle('hidden');
}

// =========================
// 4. GLOBAL SEARCH & NAVIGATION
// =========================

// 1. Define the searchable map of the OS
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
                executeNavigation(match.target);
                clearSearch();
            };
            dropdown.appendChild(div);
        });
    }

    dropdown.classList.remove('hidden');
    lucide.createIcons(); 
}

function executeNavigation(targetId) {
    switchPage(targetId);
    console.log(`Navigating to: ${targetId}`);
}

function clearSearch() {
    const searchInput = document.getElementById('globalSearch');
    if(searchInput) searchInput.value = "";
    document.getElementById('searchDropdown').classList.add('hidden');
}

// Close search if clicking outside
document.addEventListener('click', (e) => {
    const searchWrapper = document.querySelector('.search-wrapper');
    if (searchWrapper && !searchWrapper.contains(e.target)) {
        document.getElementById('searchDropdown').classList.add('hidden');
    }
});

// =========================
// 5. CUSTOMIZATION & PINNING
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

function addToHome(sectionName) {
    const widget = document.createElement('div');
    widget.className = 'glass-card';
    widget.style.marginTop = '15px';
    widget.innerHTML = `<h3>Pinned: ${sectionName}</h3><p>Live data for ${sectionName} will sync here.</p>`;
    document.getElementById('homeWidgets').appendChild(widget);
    alert(`${sectionName} pinned to Home!`);
}

// =========================
// 6. AI NEURAL PROCESSOR LOGIC
// =========================

function runAIProcessor() {
    console.log("AI Processor Triggered..."); 
    const jotter = document.getElementById('aiJotter');
    if (!jotter) return;

    const rawText = jotter.value;
    if (!rawText.trim()) {
        alert("Please jot something down first!");
        return;
    }

    const lines = rawText.split(/[.,\n]/); 
    tempDistribution = [];
    
    lines.forEach(line => {
        const text = line.trim();
        if (text.length < 3) return;

        let destination = "Tasks";
        let icon = "check-circle";
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes("at") || lowerText.includes("pm") || lowerText.includes("am") || lowerText.includes("tomorrow") || lowerText.includes("monday")) {
            destination = "Calendar";
            icon = "calendar";
        } else if (lowerText.includes("translate") || lowerText.includes("convert") || lowerText.includes("weather")) {
            destination = "World Tools";
            icon = "globe";
        } else if (lowerText.includes("timer") || lowerText.includes("minutes")) {
            destination = "Timers";
            icon = "clock";
        }

        tempDistribution.push({ text, destination, icon });
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

    alert("AI has distributed your tasks to the Home Dashboard.");
    document.getElementById('aiReviewPanel').classList.add('hidden');
    document.getElementById('aiJotter').value = "";
    tempDistribution = [];
}

function clearJotter() {
    const jotter = document.getElementById('aiJotter');
    const panel = document.getElementById('aiReviewPanel');
    if (jotter) jotter.value = '';
    if (panel) panel.classList.add('hidden');
    tempDistribution = [];
}

function removeItem(index) {
    tempDistribution.splice(index, 1);
    renderReview();
}
