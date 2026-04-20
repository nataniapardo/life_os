// =========================
// 1. SYSTEM SETUP & DB
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Expanded Font List
const expandedFonts = ["'Papyrus', serif", "'Inter', sans-serif", "'Playfair Display', serif", "'JetBrains Mono', monospace", "'Orbitron', sans-serif", "'Montserrat', sans-serif"];

function populateSettings() {
    // Populate Fonts
    const fontSelect = document.getElementById('fontChoice');
    if (fontSelect) {
        fontSelect.innerHTML = expandedFonts.map(f => `<option value="${f}">${f.split("'")[1]}</option>`).join('');
    }

    // Populate Stimulations
    const stims = [
        { cat: "Nature", items: ["Rainforest", "Deep Ocean"] },
        { cat: "Futuristic", items: ["Cyber City", "Mars Colony"] },
        { cat: "Shape", items: ["Fractals", "Minimal Cubes"] },
        { cat: "Food", items: ["Coffee Shop", "Zen Tea Garden"] },
        { cat: "Travel", items: ["Tokyo Night", "Swiss Alps"] }
    ];
    
    const stimContainer = document.getElementById('stimList');
    if (stimContainer) {
        stimContainer.innerHTML = stims.flatMap(s => 
            s.items.map(item => `<div class="stim-item" onclick="alert('Entering ${item} stimulation...')">${item}</div>`)
        ).join('');
    }
}

// Check schedule every minute
function checkThemeSchedule() {
    if (!themeSchedule.active) return;

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                        now.getMinutes().toString().padStart(2, '0');

    if (currentTime === themeSchedule.light) {
        document.body.classList.add('light-mode');
        document.body.classList.remove('theme-futuristic');
        console.log("Scheduled: Light Mode Active");
    } else if (currentTime === themeSchedule.dark) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('theme-futuristic');
        console.log("Scheduled: Dark Mode Active");
    }
}

// Call populateSettings on load
document.addEventListener('DOMContentLoaded', () => {
    populateSettings();
    // ... existing init code
});
