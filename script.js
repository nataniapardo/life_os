// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================
// DATA INITIALIZATION
// =========================
const countries = ["USA", "Canada", "UK", "Australia", "India"];
const currencies = ["USD", "EUR", "GBP", "CAD", "INR"];
const languages = { "es": "Spanish", "fr": "French", "de": "German", "zh": "Chinese", "ja": "Japanese" };

const resourceData = {
    "USA": ["211.org - Essential Needs", "Feeding America", "Crisis Text Line"],
    "UK": ["Citizens Advice", "NHS 111", "Trussell Trust Foodbanks"],
    "Canada": ["211 Canada", "Service Canada", "Health Canada"]
};

// =========================
// PAGE SYSTEM (ROUTER)
// =========================
function switchPage(pageId) {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    
    // Select all pages
    const pages = document.querySelectorAll(".page");
    
    // Fix: Ensure we can actually see the Login/Signup pages even when logged out
    if (!isLoggedIn && (pageId !== 'login' && pageId !== 'signup')) {
        document.body.classList.add("logged-out");
        pageId = 'login';
    } else if (isLoggedIn) {
        document.body.classList.remove("logged-out");
    }

    pages.forEach(p => {
        p.classList.add("hidden"); 
        p.style.display = 'none';
        p.classList.remove("active");
    });

    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.remove("hidden");
        activePage.style.display = 'block';
        activePage.classList.add("active");
    }

    closeProfileMenu();
    localStorage.setItem("lastPage", pageId);
    if (window.lucide) lucide.createIcons();
}

function goHome() {
    switchPage("home");
}

// =========================
// PROFILE & AVATAR LOGIC
// =========================
function toggleProfileMenu() {
    const menu = document.getElementById("profileMenu");
    if (menu) menu.classList.toggle("hidden");
}

function closeProfileMenu() {
    const menu = document.getElementById("profileMenu");
    if (menu) menu.classList.add("hidden");
}

function triggerUpload() {
    const input = document.getElementById('imageUpload');
    if (input) input.click();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            localStorage.setItem('userAvatar', imageData);
            syncAvatarUI(imageData);
        };
        reader.readAsDataURL(file);
    }
}

function syncAvatarUI(imageData) {
    const navImg = document.getElementById('navAvatar');
    const navPlace = document.getElementById('avatarPlaceholder');
    const bigImg = document.getElementById('bigAvatar');
    const bigPlace = document.getElementById('bigPlaceholder');

    if (imageData) {
        if (navImg) { navImg.src = imageData; navImg.classList.remove('hidden'); }
        if (bigImg) { bigImg.src = imageData; bigImg.classList.remove('hidden'); }
        if (navPlace) navPlace.classList.add('hidden');
        if (bigPlace) bigPlace.classList.add('hidden');
    }
}

function loadProfile() {
    const savedAvatar = localStorage.getItem('userAvatar');
    const username = localStorage.getItem('currentUser') || "Guest";
    
    const userDisplay = document.getElementById('currentUserDisplay');
    if (userDisplay) userDisplay.textContent = username;
    
    const fullNameDisplay = document.getElementById('fullProfileName');
    if (fullNameDisplay) fullNameDisplay.textContent = username;

    if (savedAvatar) {
        syncAvatarUI(savedAvatar);
    } else {
        const initials = username.substring(0, 2).toUpperCase();
        const navPlace = document.getElementById('avatarPlaceholder');
        const bigPlace = document.getElementById('bigPlaceholder');
        if (navPlace) { navPlace.innerText = initials; navPlace.classList.remove('hidden'); }
        if (bigPlace) { bigPlace.innerText = initials; bigPlace.classList.remove('hidden'); }
    }
}

// =========================
// CALCULATOR LOGIC
// =========================
function calcIn(val) { 
    document.getElementById('calcDisplay').value += val; 
}

function calcClear() { 
    document.getElementById('calcDisplay').value = ""; 
}

function calcSolve() {
    try {
        const expression = document.getElementById('calcDisplay').value;
        const result = eval(expression); 
        addCalcHistory(expression + " = " + result);
        document.getElementById('calcDisplay').value = result;
    } catch { 
        alert("Invalid Equation"); 
    }
}

function calcScientific(func) {
    document.getElementById('calcDisplay').value += func + "(";
}

function addCalcHistory(item) {
    const hist = document.getElementById('calcHistory');
    if (!hist) return;
    const li = document.createElement('li');
    li.style.borderBottom = "1px solid var(--border-color)";
    li.style.padding = "5px 0";
    li.innerText = item;
    hist.prepend(li);
}

function saveMathNotes() {
    const notes = document.getElementById('mathNotes').value;
    localStorage.setItem('mathNotes', notes);
    alert("Notes saved to your system memory.");
}

// =========================
// WORLD TOOLS & RESOURCES
// =========================
async function translateText() {
    const text = document.getElementById('transInput').value;
    const lang = document.getElementById('langList').value;
    document.getElementById('transOutput').innerText = `[Simulated Translation to ${lang}]: ${text}`;
}

function convertCurrency() {
    const amount = document.getElementById('currAmount').value;
    const from = document.getElementById('currFrom').value;
    const to = document.getElementById('currTo').value;
    const rate = 1.2; 
    document.getElementById('currResult').innerText = `${amount} ${from} = ${(amount * rate).toFixed(2)} ${to}`;
}

function updateResources() {
    const country = document.getElementById('countryList').value;
    const container = document.getElementById('resourceContainer');
    if (!container) return;
    const list = resourceData[country] || ["No data currently available for this region."];
    container.innerHTML = list.map(item => `<div class="glass-card" style="margin-bottom:10px; padding:15px;">${item}</div>`).join('');
}

// =========================
// THEME & AUTH
// =========================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
}

function updateThemeUI(theme) {
    const themeText = document.getElementById('themeText');
    const themeIcon = document.getElementById('themeIcon');
    if (!themeText || !themeIcon) return;
    themeText.innerText = theme === 'light' ? "Dark Mode" : "Light Mode";
    themeIcon.setAttribute('data-lucide', theme === 'light' ? 'moon' : 'sun');
    if (window.lucide) lucide.createIcons();
}

async function login() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();

    if (!user || !pass) return alert("Please enter credentials");

    // Real Supabase Auth Logic
    const { data, error } = await db.from("users")
        .select("*")
        .eq("username", user)
        .eq("password", pass)
        .single();

    if (error || !data) return alert("Invalid credentials");

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", user);
    
    alert("System Access Granted");
    switchPage("home");
    location.reload(); 
}

async function CreateAccount() {
    const username = document.getElementById("signUser").value.trim();
    const password = document.getElementById("signPass").value.trim();

    if (!username || !password) return alert("Enter credentials");

    const { error } = await db.from("users").insert([{ username, password }]);

    if (error) return alert("Error creating account.");

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", username);
    alert("Account initialized!");
    switchPage("home");
    location.reload();
}

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userAvatar");
    document.body.classList.add("logged-out");
    switchPage("login");
}

// =========================
// INITIALIZATION
// =========================
window.addEventListener('DOMContentLoaded', () => {
    // Force theme initialization
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    // Populate Dynamic Lists
    const langSelect = document.getElementById('langList');
    const countrySelect = document.getElementById('countryList');
    const currFrom = document.getElementById('currFrom');
    const currTo = document.getElementById('currTo');

    if (langSelect) Object.entries(languages).forEach(([code, name]) => langSelect.innerHTML += `<option value="${code}">${name}</option>`);
    if (countrySelect) countries.forEach(c => countrySelect.innerHTML += `<option value="${c}">${c}</option>`);
    if (currFrom && currTo) currencies.forEach(curr => {
        currFrom.innerHTML += `<option value="${curr}">${curr}</option>`;
        currTo.innerHTML += `<option value="${curr}">${curr}</option>`;
    });

    // Load Math Notes
    const notesBox = document.getElementById('mathNotes');
    if (notesBox) notesBox.value = localStorage.getItem('mathNotes') || "";

    // Auth gating logic
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    if (!isLoggedIn) {
        switchPage('login');
    } else {
        loadProfile();
        updateResources(); 
        const last = localStorage.getItem("lastPage") || "home";
        switchPage(last);
    }

    // System Clock
    setInterval(() => {
        const clock = document.getElementById("clock");
        if (clock) clock.textContent = new Date().toLocaleTimeString();
    }, 1000);

    if (window.lucide) lucide.createIcons();
});

// Outside click listener for profile menu
window.addEventListener("click", (e) => {
    const container = document.querySelector(".profile-container");
    if (container && !container.contains(e.target)) closeProfileMenu();
});
