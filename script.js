// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Navigation System
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// Personalization Engine
function toggleStyle(className) {
    document.body.classList.toggle(className);
}

function updateThemeColor(color) {
    document.documentElement.style.setProperty('--accent-color', color);
}

// AI Deciphering Logic
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const status = document.getElementById('uploadStatus');
    status.innerHTML = `<p style="color: var(--accent-color)">AI is deciphering ${file.name}...</p>`;

    // Simulate AI Latency (3-8 seconds as per requirements)
    setTimeout(() => {
        const simulatedData = decipherAI(file.name);
        status.innerHTML = `<p style="color: #4ade80">Success: AI organized data into ${simulatedData.category}</p>`;
        console.log("AI Extracted:", simulatedData);
    }, 4000);
}

function decipherAI(fileName) {
    // Simulated keyword detection for auto-categorization
    const name = fileName.toLowerCase();
    if (name.includes('task') || name.includes('todo')) return { category: 'Tasks', items: 5 };
    if (name.includes('contact') || name.includes('resume')) return { category: 'Contacts', items: 12 };
    if (name.includes('date') || name.includes('plan')) return { category: 'Calendar', items: 1 };
    return { category: 'Documents', items: 1 };
}

// Search Simulation (Keyword + Synonym)
document.getElementById('globalSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.toLowerCase();
        alert(`Searching Life OS for: ${query}\n(AI detecting synonyms...)`);
    }
});
