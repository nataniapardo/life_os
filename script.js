// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = "https://bzwnjtofcduxllafdybw.supabase.co";
const SUPABASE_KEY = "sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================
// PAGE SYSTEM (ROUTER)
// =========================
function switchPage(pageId) {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";

    // Toggle UI visibility based on login status (Gating Logic)
    if (!isLoggedIn) {
        document.body.classList.add("logged-out");
        // Force them to login or signup if they try to wander off
        if (pageId !== 'login' && pageId !== 'signup') {
            pageId = 'login';
        }
    } else {
        document.body.classList.remove("logged-out");
    }

    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const page = document.getElementById(pageId);
    
    if (page) {
        page.classList.add("active");
    } else {
        console.warn(`Page ID "${pageId}" not found in HTML.`);
    }

    // Close dropdown whenever we switch pages
    closeProfileMenu();
    localStorage.setItem("lastPage", pageId);
}

function goHome() {
    switchPage("home");
}

// =========================
// PROFILE & AVATAR LOGIC
// =========================
function toggleProfileMenu() {
    const menu = document.getElementById("profileMenu");
    if (menu) {
        menu.classList.toggle("hidden");
    }
}

function closeProfileMenu() {
    const menu = document.getElementById("profileMenu");
    if (menu) {
        menu.classList.add("hidden");
    }
}

// Trigger the hidden file input
function triggerUpload() {
    const input = document.getElementById('imageUpload');
    if (input) input.click();
}

// Handle file selection and update UI
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            localStorage.setItem('userAvatar', imageData);
            
            // Update all UI elements showing the avatar
            syncAvatarUI(imageData);
        };
        reader.readAsDataURL(file);
    }
}

// Synchronize all avatar elements (Nav and Full Profile)
function syncAvatarUI(imageData) {
    const navImg = document.getElementById('navAvatar');
    const navPlace = document.getElementById('avatarPlaceholder');
    const bigImg = document.getElementById('bigAvatar');
    const bigPlace = document.getElementById('bigPlaceholder');

    if (imageData) {
        // Show images
        if (navImg) { navImg.src = imageData; navImg.classList.remove('hidden'); }
        if (bigImg) { bigImg.src = imageData; bigImg.classList.remove('hidden'); }
        // Hide placeholders
        if (navPlace) navPlace.classList.add('hidden');
        if (bigPlace) bigPlace.classList.add('hidden');
    }
}

// Load saved avatar or initials on boot
function loadProfile() {
    const savedAvatar = localStorage.getItem('userAvatar');
    const username = localStorage.getItem('currentUser') || "Guest";
    
    // Update Name Displays
    const userDisplay = document.getElementById('currentUserDisplay');
    if (userDisplay) userDisplay.textContent = username;
    
    const fullNameDisplay = document.getElementById('fullProfileName');
    if (fullNameDisplay) fullNameDisplay.textContent = username;

    if (savedAvatar) {
        syncAvatarUI(savedAvatar);
    } else {
        // Set Initials
        const initials = username.substring(0, 2).toUpperCase();
        const navPlace = document.getElementById('avatarPlaceholder');
        const bigPlace = document.getElementById('bigPlaceholder');
        const navImg = document.getElementById('navAvatar');
        const bigImg = document.getElementById('bigAvatar');

        if (navPlace) {
            navPlace.innerText = initials;
            navPlace.classList.remove('hidden');
        }
        if (bigPlace) {
            bigPlace.innerText = initials;
            bigPlace.classList.remove('hidden');
        }
        // Ensure images are hidden if no avatar exists
        if (navImg) navImg.classList.add('hidden');
        if (bigImg) bigImg.classList.add('hidden');
    }
}

// Close menu when clicking outside
window.addEventListener("click", (e) => {
    const container = document.querySelector(".profile-container");
    if (container && !container.contains(e.target)) {
        closeProfileMenu();
    }
});

// =========================
// THEME SYSTEM
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

    if (theme === 'light') {
        themeText.innerText = "Dark Mode";
        themeIcon.setAttribute('data-lucide', 'moon');
    } else {
        themeText.innerText = "Light Mode";
        themeIcon.setAttribute('data-lucide', 'sun');
    }
    
    if (window.lucide) lucide.createIcons();
}

// =========================
// AUTHENTICATION
// =========================
async function CreateAccount() {
    const username = document.getElementById("signUser").value.trim();
    const password = document.getElementById("signPass").value.trim();

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    const { data: existing, error: fetchError } = await db
        .from("users")
        .select("*")
        .eq("username", username);

    if (existing && existing.length > 0) {
        alert("Username already exists");
        return;
    }

    const { error: insertError } = await db
        .from("users")
        .insert([{ username, password }]);

    if (insertError) {
        alert("Error creating account");
        return;
    }

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", username);
    alert("Account created and logged in!");
    
    // UI REFRESH
    document.body.classList.remove("logged-out");
    loadProfile();
    switchPage("home");
}

async function login() {
    const username = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPass").value.trim();

    if (!username || !password) return alert("Enter credentials");

    const { data, error } = await db
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

    if (error || !data) return alert("Invalid credentials");

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", username);
    
    // UI REFRESH
    document.body.classList.remove("logged-out");
    loadProfile();
    switchPage("home"); // Redirect to home after success
}

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userAvatar");
    
    // UI REFRESH
    document.body.classList.add("logged-out");
    switchPage("login");
}

// =========================
// ACCOUNT MANAGEMENT
// =========================
async function deleteAccount() {
    const username = localStorage.getItem("currentUser");
    const confirmDelete = confirm("CRITICAL: Are you sure you want to delete your account? This cannot be undone.");

    if (!confirmDelete) return;

    const { error } = await db
        .from("users")
        .delete()
        .eq("username", username);

    if (error) {
        alert("Error deleting account: " + error.message);
    } else {
        alert("Account successfully deleted.");
        logout();
    }
}

// =========================
// TASK SYSTEM
// =========================
function addTask() {
    const input = document.getElementById("taskInput");
    if (!input || !input.value) return;

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(input.value);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    input.value = "";
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById("taskList");
    if (!list) return;
    list.innerHTML = "";
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => {
        const li = document.createElement("li");
        li.textContent = task;
        list.appendChild(li);
    });
}

// =========================
// INITIALIZATION
// =========================
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    if (!isLoggedIn) {
        switchPage('login');
    } else {
        loadProfile();
        renderTasks();
        const last = localStorage.getItem("lastPage") || "home";
        switchPage(last);
    }

    // Set the clock
    setInterval(() => {
        const clock = document.getElementById("clock");
        if (clock) clock.textContent = new Date().toLocaleTimeString();
    }, 1000);

    if (window.lucide) lucide.createIcons();
});
