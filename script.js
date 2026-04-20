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

// =========================
// 2. AUTHENTICATION & OS ENTRANCE
// =========================
function enterOS() {
    // Check if the user entered a name in the signup/login inputs (if exists)
    const nameInput = document.getElementById('userNameInput');
    const name = (nameInput && nameInput.value) ? nameInput.value : "User";
    
    // Update Greeting with actual Name
    const hours = new Date().getHours();
    let msg = "Good night";
    if (hours >= 5 && hours < 12) msg = "Good morning";
    else if (hours >= 12 && hours < 17) msg = "Good afternoon";
    else if (hours >= 17 && hours < 21) msg = "Good evening";
    
    document.getElementById('dynamicGreeting').innerText = `${msg}, ${name}`;
    
    // Update Avatar
    document.getElementById('userAvatar').innerText = name.charAt(0).toUpperCase();

    // Transition Screens
    document.getElementById('loginPage').classList.add('hidden');
    // If you have an authPage section, hide that too
    const authPage = document.getElementById('authPage');
    if(authPage) authPage.classList.add('hidden');
    
    document.getElementById('appContainer').classList.remove('hidden');
    
    // Refresh icons for the new view
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
    // Hide all sections
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    // Remove active state from all nav links
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    
    // Show Target Section
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
        // Handle nav active state (handles both standard and specific nav IDs)
        const navItem = document.getElementById(`nav-${pageId}`);
        if (navItem) navItem.classList.add('active');
    }
    
    // Auto-close profile menu
    document.getElementById('profileDropdown').classList.add('hidden');
    lucide.createIcons();
}

function toggleProfileMenu() {
    const menu = document.getElementById('profileDropdown');
    if (menu) menu.classList.toggle('hidden');
}

// =========================
// 4. CUSTOMIZATION & SETTINGS
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
// 5. AI NEURAL PROCESSOR LOGIC
// =========================
let tempDistribution = [];

function runAIProcessor() {
    const rawText = document.getElementById('aiJotter').value;
    if (!rawText) return;

    const lines = rawText.split(/[.,\n]/); 
    tempDistribution = [];
    
    lines.forEach(line => {
        const text = line.trim();
        if (text.length < 3) return;

        let destination = "Tasks"; // Default
        let icon = "check-circle";

        const lowerText = text.toLowerCase();
        
        // AI Logic: Keyword Routing
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
    if(!list) return;
    list.innerHTML = "";
    
    tempDistribution.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "dist-item";
        div.innerHTML = `
            <span><strong>[${item.destination}]</strong> ${item.text}</span>
            <span onclick="removeItem(${index})" style="cursor:pointer; color:red; margin-left:10px;">✕</span>
        `;
        list.appendChild(div);
    });

    document.getElementById('aiReviewPanel').classList.remove('hidden');
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

    alert("AI has distributed your tasks. Check the specific sections or Home to view.");
    document.getElementById('aiReviewPanel').classList.add('hidden');
    document.getElementById('aiJotter').value = "";
}

function clearJotter() {
    document.getElementById('aiJotter').value = '';
    const panel = document.getElementById('aiReviewPanel');
    if (panel) panel.classList.add('hidden');
}

function removeItem(index) {
    tempDistribution.splice(index, 1);
    renderReview();
}
