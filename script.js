// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function login() {
    document.getElementById('login').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    lucide.createIcons();
    startClock();
}

function saveCustomization() {
    const font = document.getElementById('fontSelector').value;
    const accentColor = document.getElementById('accentPicker').value;
    
    // THEMED STIMULATION LOGIC
    // Update the accent color variable
    document.documentElement.style.setProperty('--accent-color', accentColor);
    
    // Update the font variable
    document.documentElement.style.setProperty('--global-font', font);

    // Optional: Auto-generate a darker background version of the accent for stimulation
    const bgDim = accentColor + '10'; // Adds transparency to the hex
    document.documentElement.style.setProperty('--bg-dark', '#06070a'); 

    const btn = document.getElementById('saveCustomBtn');
    btn.innerText = "Saved";
    setTimeout(() => btn.innerText = "Save", 2000);
}

// ... rest of your switchPage and startClock functions ...
