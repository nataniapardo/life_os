// =========================
// CONFIGURATION & SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Synonyms for Smart Search
const synonyms = {
    "job": ["career", "employment", "opportunity", "work"],
    "meeting": ["sync", "call", "appointment", "calendar"],
    "fix": ["error", "correct", "update"]
};

// =========================
// PAGE SYSTEM (ROUTER)
// =========================
function switchPage(pageId) {
    const isLoggedIn = localStorage.getItem("loggedIn");
    const protectedPages = ["dashboard", "documents", "networking"];

    // Auth Guard
    if (protectedPages.includes(pageId) && !isLoggedIn) {
        showAlert("Please login first to access this sector.", "#ef4444");
        return;
    }

    // Update UI Active States
    document.querySelectorAll(".view-section").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

    const page = document.getElementById(pageId);
    if (page) page.classList.add("active");

    const navItem = document.querySelector(`[data-section="${pageId}"]`);
    if (navItem) navItem.classList.add("active");

    localStorage.setItem("lastPage", pageId);
}

function goHome() { switchPage("home"); }

// =========================
// INITIALIZATION
// =========================
window.onload = () => {
    const last = localStorage.getItem("lastPage") || "home";
    switchPage(last);
    renderTasks();
    initEventListeners();
};

function initEventListeners() {
    // Clock Implementation
    setInterval(() => {
        const clock = document.getElementById("clock");
        if (clock) clock.textContent = new Date().toLocaleTimeString();
    }, 1000);

    // Global Search Synonym Logic
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleSmartSearch);
    }

    // File Upload / AI Extraction
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleAIExtraction);
    }

    // Signup Binding
    const signupBtn = document.getElementById("signupBtn");
    if (signupBtn) signupBtn.addEventListener("click", CreateAccount);
};

// =========================
// AUTHENTICATION LOGIC
// =========================
async function CreateAccount() {
    const username = document.getElementById("signUser").value.trim();
    const password = document.getElementById("signPass").value.trim();

    if (!username || !password) {
        showAlert("Enter both email and password");
        return;
    }

    const { data: existing } = await db.from("users").select("*").eq("username", username);
    if (existing && existing.length > 0) {
        showAlert("User already exists");
        return;
    }

    const { error } = await db.from("users").insert([{ username, password }]);
    if (error) {
        showAlert("Database Error: " + error.message);
        return;
    }

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", username);
    showAlert("Account Created!", "#10b981");
    switchPage("dashboard");
}

async function login() {
    const username = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPass").value.trim();

    const { data, error } = await db.from("users").select("*").eq("username", username).eq("password", password).single();

    if (error || !data) {
        showAlert("Invalid credentials");
        return;
    }

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", username);
    switchPage("dashboard");
}

// =========================
// AI & FEATURE LOGIC
// =========================
function handleAIExtraction() {
    const progress = document.getElementById('extractionProgress');
    const bar = progress.querySelector('.progress-bar');
    progress.style.display = 'block';
    
    // Simulate latency for AI processing (3.5 seconds)
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            progress.style.display = 'none';
            // Auto-populate a task from "AI data"
            addAIGeneratedTask("Extracted: Networking event with Google Recruiters");
            showAlert("AI Extraction Complete", "#10b981");
        } else {
            width += 5;
            bar.style.width = width + '%';
        }
    }, 150);
}

function handleSmartSearch(e) {
    const val = e.target.value.toLowerCase();
    const suggestions = document.getElementById('searchSuggestions');
    if (val.length < 2) { suggestions.style.display = 'none'; return; }

    let results = [];
    for (let key in synonyms) {
        if (key.includes(val) || synonyms[key].some(s => s.includes(val))) {
            results.push(`Go to ${key} sector`);
        }
    }

    if (results.length > 0) {
        suggestions.innerHTML = results.map(r => `<div class="suggest-item">${r}</div>`).join('');
        suggestions.style.display = 'block';
    } else {
        suggestions.style.display = 'none';
    }
}

// =========================
// TASK SYSTEM
// =========================
function addTask() {
    const input = document.getElementById("taskInput");
    if (!input.value) return;

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(input.value);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    input.value = "";
    renderTasks();
}

function addAIGeneratedTask(text) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(text);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById("taskList");
    if (!list) return;
    list.innerHTML = "";
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";
        li.textContent = task;
        list.appendChild(li);
    });
}

// =========================
// THEME LOGIC
// =========================
function applyHex() {
    const color = document.getElementById('hexInput').value;
    if(/^#[0-9A-F]{6}$/i.test(color)) {
        document.documentElement.style.setProperty('--primary-color', color);
    } else {
        showAlert("Invalid Hex Format");
    }
}

// =========================
// UI UTILITIES
// =========================
function showAlert(msg, bgColor = "#ef4444") {
    const alert = document.getElementById('errorAlert');
    const message = document.getElementById('alertMessage');
    if (!alert || !message) return;
    
    alert.style.backgroundColor = bgColor;
    message.innerText = msg;
    alert.classList.remove('hidden');
    setTimeout(() => alert.classList.add('hidden'), 4000);
}
