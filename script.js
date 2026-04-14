const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Page Routing
function switchPage(pageId) {
    const isLoggedIn = localStorage.getItem("loggedIn");
    const protected = ["dashboard", "documents", "networking"];

    if (protected.includes(pageId) && !isLoggedIn) {
        showAlert("Please login first");
        return;
    }

    document.querySelectorAll(".view-section").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

    const target = document.getElementById(pageId);
    if (target) target.classList.add("active");
    
    const nav = document.querySelector(`[data-section="${pageId}"]`);
    if (nav) nav.classList.add("active");

    localStorage.setItem("lastPage", pageId);
}

// Auth Logic
async function CreateAccount() {
    const username = document.getElementById("signUser").value.trim();
    const password = document.getElementById("signPass").value.trim();

    const { error } = await db.from("users").insert([{ username, password }]);
    if (error) return showAlert("Error creating account");

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", username);
    switchPage("dashboard");
}

async function login() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();

    const { data, error } = await db.from("users").select("*").eq("username", user).eq("password", pass).single();
    if (error || !data) return showAlert("Invalid credentials");

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", user);
    switchPage("dashboard");
}

function logout() {
    localStorage.clear();
    location.reload();
}

// Feature Logic
function handleAIExtraction() {
    const prog = document.getElementById("extractionProgress");
    const bar = prog.querySelector(".progress-bar");
    prog.classList.remove("hidden");
    
    let w = 0;
    const intv = setInterval(() => {
        w += 10;
        bar.style.width = w + "%";
        if (w >= 100) {
            clearInterval(intv);
            prog.classList.add("hidden");
            showAlert("AI: Successfully extracted milestones", "#10b981");
        }
    }, 200);
}

// Initialize
window.onload = () => {
    const last = localStorage.getItem("lastPage") || "home";
    switchPage(last);
    
    // Clock
    setInterval(() => {
        const c = document.getElementById("clock");
        if (c) c.textContent = new Date().toLocaleTimeString();
    }, 1000);

    // AI listener
    const fInput = document.getElementById("fileInput");
    if (fInput) fInput.addEventListener("change", handleAIExtraction);

    // Signup listener
    const sBtn = document.getElementById("signupBtn");
    if (sBtn) sBtn.addEventListener("click", CreateAccount);
};

function toggleProfileMenu() {
    document.getElementById("profileMenu").classList.toggle("hidden");
}

function showAlert(msg, color = "#ef4444") {
    const alert = document.getElementById("errorAlert");
    alert.style.background = color;
    document.getElementById("alertMessage").innerText = msg;
    alert.classList.remove("hidden");
    setTimeout(() => alert.classList.add("hidden"), 3000);
}
