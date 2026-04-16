// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================
// DATA INITIALIZATION
// =========================
let currentNavDate = new Date(); // Global state for Calendar
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
    console.log("Attempting to switch to:", pageId); // Debugging line

    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    
    // 1. Auth Guard & Gating Logic
    if (!isLoggedIn && (pageId !== 'login' && pageId !== 'signup')) {
        console.warn("User not logged in. Redirecting to login.");
        document.body.classList.add("logged-out");
        pageId = 'login';
    } else if (isLoggedIn) {
        document.body.classList.remove("logged-out");
    }

    // 2. Hide all pages
    const pages = document.querySelectorAll(".page");
    if (pages.length === 0) {
        console.error("No elements with class '.page' found!");
        return;
    }

    pages.forEach(p => {
        p.classList.add("hidden"); 
        p.style.display = 'none';
        p.classList.remove("active");
    });

    // 3. Show active page
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.remove("hidden");
        activePage.style.display = 'block';
        activePage.classList.add("active");
        
        // Trigger feature-specific renders
        if (pageId === 'calendar') renderCalendar();
        if (pageId === 'resources') updateResources();
    } else {
        console.error(`Page ID "${pageId}" does not exist in HTML!`);
    }

    // 4. Update UI visuals & cleanup
    updateSidebarUI(pageId);
    closeProfileMenu();
    localStorage.setItem("lastPage", pageId);
    if (window.lucide) lucide.createIcons();
}

function updateSidebarUI(pageId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick')?.includes(`'${pageId}'`)) {
            item.classList.add('active');
        }
    });
}

function goHome() {
    switchPage("home");
}

// =========================
// CALENDAR ENGINE
// =========================
function renderCalendar() {
    const calendarDays = document.getElementById("calendarDays");
    const monthDisplay = document.getElementById("monthDisplay");
    if (!calendarDays || !monthDisplay) return;

    calendarDays.innerHTML = "";
    const year = currentNavDate.getFullYear();
    const month = currentNavDate.getMonth();

    monthDisplay.innerText = currentNavDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Padding for first week
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("empty-day");
        calendarDays.appendChild(empty);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.innerText = day;
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add("today");
        }
        calendarDays.appendChild(cell);
    }
}

function moveMonth(offset) {
    currentNavDate.setMonth(currentNavDate.getMonth() + offset);
    renderCalendar();
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
    if (imageData && navImg) {
        navImg.src = imageData;
        navImg.classList.remove('hidden');
        if (navPlace) navPlace.classList.add('hidden');
    }
}

function loadProfile() {
    const savedAvatar = localStorage.getItem('userAvatar');
    const username = localStorage.getItem('currentUser') || "Guest";
    const userDisplay = document.getElementById('currentUserDisplay');
    if (userDisplay) userDisplay.textContent = username;

    if (savedAvatar) {
        syncAvatarUI(savedAvatar);
    } else {
        const initials = username.substring(0, 2).toUpperCase();
        const navPlace = document.getElementById('avatarPlaceholder');
        if (navPlace) { navPlace.innerText = initials; navPlace.classList.remove('hidden'); }
    }
}

// =========================
// WORLD TOOLS & RESOURCES
// =========================
function translateText() {
    const text = document.getElementById('transInput').value;
    const langCode = document.getElementById('langList').value;
    const langName = languages[langCode] || langCode;
    document.getElementById('transOutput').innerText = `[Simulated Translation to ${langName}]: ${text}`;
}

function convertCurrency() {
    const amount = document.getElementById('currAmount').value;
    const from = document.getElementById('currFrom').value;
    const to = document.getElementById('currTo').value;
    const rate = 1.25; 
    document.getElementById('currResult').innerText = `${amount} ${from} = ${(amount * rate).toFixed(2)} ${to}`;
}

function updateResources() {
    const countrySelect = document.getElementById('countryList');
    const container = document.getElementById('resourceContainer');
    if (!countrySelect || !container) return;

    const country = countrySelect.value;
    const list = resourceData[country] || ["No data currently available for this region."];
    
    container.innerHTML = list.map(item => `
        <div class="glass-card" style="margin-bottom:10px; padding:15px; border-left: 4px solid var(--accent-color);">
            ${item}
        </div>
    `).join('');
}

// =========================
// THEME & AUTH
// =========================
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

    const { data, error } = await db.from("users").select("*").eq("username", user).eq("password", pass).single();
    if (error || !data) return alert("Invalid credentials");

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", user);
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
    switchPage("home");
    location.reload();
}

function logout() {
    localStorage.clear();
    location.reload();
}

// =========================
// INITIALIZATION
// =========================
window.addEventListener('DOMContentLoaded', () => {
    // Theme Init
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    // Dynamic List Population
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

    // Auth gating
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    if (!isLoggedIn) {
        switchPage('login');
    } else {
        loadProfile();
        const last = localStorage.getItem("lastPage") || "home";
        switchPage(last);
    }

    // System Clock
    setInterval(() => {
        const clock = document.getElementById("clock");
        const dateElement = document.getElementById("date");
        const now = new Date();
        if (clock) clock.textContent = now.toLocaleTimeString();
        if (dateElement) dateElement.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }, 1000);

    if (window.lucide) lucide.createIcons();
});

// Click outside menu listener
window.addEventListener("click", (e) => {
    const container = document.querySelector(".profile-container");
    if (container && !container.contains(e.target)) closeProfileMenu();
});
