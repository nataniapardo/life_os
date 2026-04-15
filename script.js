// Initialize Supabase
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Routing Logic
function switchPage(pageId) {
    const isLoggedIn = localStorage.getItem("loggedIn");
    const protectedRoutes = ["dashboard", "documents", "networking"];

    if (protectedRoutes.includes(pageId) && !isLoggedIn) {
        showAlert("Access Denied: Please log in first.");
        return;
    }

    // Update visibility
    document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

    const target = document.getElementById(pageId);
    if (target) target.classList.add("active");

    const nav = document.querySelector(`[data-section="${pageId}"]`);
    if (nav) nav.classList.add("active");

    localStorage.setItem("lastPage", pageId);
}

// Auth Logic
async function CreateAccount() {
    const user = document.getElementById("signUser").value.trim();
    const pass = document.getElementById("signPass").value.trim();
    if (!user || !pass) return showAlert("Fill in all fields");

    const { error } = await db.from("users").insert([{ username: user, password: pass }]);
    if (error) return showAlert("Signup failed");

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", user);
    switchPage("dashboard");
}

async function login() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();

    const { data, error } = await db.from("users").select("*").eq("username", user).eq("password", pass).single();
    if (error || !data) return showAlert("Invalid login details");

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", user);
    switchPage("dashboard");
}

function logout() {
    localStorage.clear();
    location.reload();
}

// Tasks
function addTask() {
    const input = document.getElementById("taskInput");
    if (!input.value) return;
    const list = document.getElementById("taskList");
    const li = document.createElement("li");
    li.style.padding = "8px 0";
    li.style.borderBottom = "1px solid #eee";
    li.textContent = "• " + input.value;
    list.appendChild(li);
    input.value = "";
}

// Settings
function applyHex() {
    const color = document.getElementById("hexInput").value;
    if(/^#[0-9A-F]{6}$/i.test(color)) {
        document.documentElement.style.setProperty('--primary-color', color);
    }
}

// App Initialization
window.onload = () => {
    // Restore state
    const last = localStorage.getItem("lastPage") || "home";
    switchPage(last);

    // Start Clock
    setInterval(() => {
        document.getElementById("clock").textContent = new Date().toLocaleTimeString();
    }, 1000);
};

function toggleProfileMenu() {
    document.getElementById("profileMenu").classList.toggle("hidden");
}

function showAlert(msg) {
    const alert = document.getElementById("errorAlert");
    document.getElementById("alertMessage").textContent = msg;
    alert.classList.remove("hidden");
    setTimeout(() => alert.classList.add("hidden"), 3000);
}

  
