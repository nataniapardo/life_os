// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. PROFILE LOGIC ---
function toggleProfileMenu() {
    const menu = document.getElementById('profileDropdown');
    menu.classList.toggle('hidden');
}

function updateProfile() {
    const initials = document.getElementById('initialsInput').value;
    const avatarUrl = document.getElementById('avatarUrlInput').value;
    const avatarDiv = document.getElementById('userAvatar');
    const displayInit = document.getElementById('displayInitials');

    if (initials) {
        avatarDiv.innerText = initials.toUpperCase();
        displayInit.innerText = initials.toUpperCase();
    }
    
    if (avatarUrl) {
        avatarDiv.style.backgroundImage = `url('${avatarUrl}')`;
        avatarDiv.innerText = ""; // Hide text if image exists
    }
    
    alert("Identity updated successfully.");
}

function logout() {
    const confirmOut = confirm("Are you sure you want to terminate the session?");
    if(confirmOut) {
        window.location.reload(); // Returns to login state
    }
}

// --- 2. THEME CUSTOMIZATION ---
function applyCustomTheme() {
    const color = document.getElementById('accentPicker').value;
    document.documentElement.style.setProperty('--accent-color', color);
}

// --- 3. PAGE ROUTING ---
function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    document.getElementById('profileDropdown').classList.add('hidden'); // Close menu on click
    
    if (event && event.currentTarget.tagName === 'LI') {
        document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
        event.currentTarget.classList.add('active');
    }
}

// --- 4. INITIALIZATION ---
function login() {
    document.getElementById('login').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    lucide.createIcons();
    startClock();
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clockDisplay').innerText = now.toLocaleTimeString();
        document.getElementById('dateDisplay').innerText = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }, 1000);
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-area')) {
        document.getElementById('profileDropdown').classList.add('hidden');
    }
});
