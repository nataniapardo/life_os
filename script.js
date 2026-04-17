// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================
// AUTH & INITIALIZATION
// =========================
function login() {
    document.getElementById('login').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    document.body.classList.remove('logged-out');
    
    // Initialize OS Features
    lucide.createIcons();
    startClock();
    goToHome(); // Start at Nexus
}

function logout() {
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
    document.body.classList.add('logged-out');
}

function toggleAuthMode(mode) {
    if (mode === 'signup') {
        document.getElementById('loginCard').classList.add('hidden');
        document.getElementById('signupCard').classList.remove('hidden');
    } else {
        document.getElementById('signupCard').classList.add('hidden');
        document.getElementById('loginCard').classList.remove('hidden');
    }
}

// =========================
// NAVIGATION LOGIC
// =========================

/**
 * Returns user to the Nexus Dashboard
 * Triggered by clicking the Life OS logo
 */
function goToHome() {
    switchPage('nexus');

    // Update sidebar active state
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
        // Match the "Nexus" list item
        if (li.getAttribute('onclick')?.includes('nexus')) {
            li.classList.add('active');
        }
    });

    // Clean up UI
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.add('hidden');
}

function switchPage(pageId) {
    // Hide all sections
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show target section
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
    }

    // Update Sidebar highlighting
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
        if (li.getAttribute('onclick')?.includes(pageId)) {
            li.classList.add('active');
        }
    });
}

// =========================
// CUSTOMIZATION & STIMULATION
// =========================

function applyTheme(theme) {
    const root = document.documentElement;
    const presets = {
        cyber: { accent: '#ff00ff', bg: '#0d001a' },
        forest: { accent: '#2ecc71', bg: '#0a1a0f' },
        nova: { accent: '#e67e22', bg: '#1a0f00' },
        mono: { accent: '#ffffff', bg: '#000000' }
    };
    
    if (presets[theme]) {
        root.style.setProperty('--accent-color', presets[theme].accent);
        root.style.setProperty('--bg-dark', presets[theme].bg);
        // Sync the color picker input
        document.getElementById('accentPicker').value = presets[theme].accent;
    }
}

function saveCustomization() {
    const font = document.getElementById('fontSelector').value;
    const accentColor = document.getElementById('accentPicker').value;
    
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--global-font', font);

    // Feedback effect
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "SYSTEM UPDATED";
    setTimeout(() => btn.innerText = originalText, 2000);
}

// =========================
// UTILITIES (Clock, UI)
// =========================

function startClock() {
    setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        const dateStr = now.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        if(document.getElementById('clockDisplay')) {
            document.getElementById('clockDisplay').innerText = timeStr;
        }
        if(document.getElementById('dateDisplay')) {
            document.getElementById('dateDisplay').innerText = dateStr;
        }
    }, 1000);
}

function toggleProfileMenu() {
    const menu = document.getElementById('profileDropdown');
    menu.classList.toggle('hidden');
}

// =========================
// EVENT LISTENERS
// =========================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Logo click-to-home
    const logoBranding = document.querySelector('.logo-area-branding');
    if (logoBranding) {
        logoBranding.style.cursor = 'pointer';
        logoBranding.addEventListener('click', goToHome);
    }

    // Modal control
    const quickAddBtn = document.getElementById('openQuickAction');
    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', () => {
            document.getElementById('quickModal').classList.remove('hidden');
        });
    }
});
