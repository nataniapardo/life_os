// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();
    
    // Start Clock
    setInterval(updateTime, 1000);
});

function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    document.getElementById('clockDisplay').innerText = timeStr;
    document.getElementById('dateDisplay').innerText = dateStr;
}

function switchPage(pageId) {
    console.log("Switching to:", pageId);
    // Add logic here to show/hide sections
}

function goToHome() {
    switchPage('nexus');
}
