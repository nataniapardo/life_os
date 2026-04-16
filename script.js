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
  const isLoggedIn = localStorage.getItem("loggedIn");

  // Protection for private pages
  const privatePages = ["dashboard", "settings-general", "settings-notifications", "account", "personalization", "customize"];
  if (privatePages.includes(pageId) && !isLoggedIn) {
    alert("Please login first to access this area.");
    switchPage("login");
    return;
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
            const navAvatar = document.getElementById('navAvatar');
            const placeholder = document.getElementById('avatarPlaceholder');
            
            navAvatar.src = e.target.result;
            navAvatar.classList.remove('hidden');
            placeholder.classList.add('hidden');
            
            localStorage.setItem('userAvatar', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Load saved avatar or initials on boot
function loadProfile() {
    const savedAvatar = localStorage.getItem('userAvatar');
    const navAvatar = document.getElementById('navAvatar');
    const placeholder = document.getElementById('avatarPlaceholder');
    const userDisplay = document.getElementById('currentUserDisplay');
    
    const username = localStorage.getItem('currentUser') || "Guest User";
    if (userDisplay) userDisplay.textContent = username;

    if (savedAvatar && navAvatar && placeholder) {
        navAvatar.src = savedAvatar;
        navAvatar.classList.remove('hidden');
        placeholder.classList.add('hidden');
    } else if (placeholder) {
        placeholder.innerText = username.substring(0, 2).toUpperCase();
        if (navAvatar) navAvatar.classList.add('hidden');
        placeholder.classList.remove('hidden');
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
  loadProfile(); // Update initials/display
  switchPage("dashboard");
}

async function login() {
  const username = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value.trim();

  if (!username || !password) {
    alert("Enter username and password");
    return;
  }

  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) {
    alert("Invalid credentials");
    return;
  }

  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("currentUser", username);
  alert("Login successful");
  loadProfile();
  switchPage("dashboard");
}

function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userAvatar"); // Optional: clear avatar on logout
  alert("Logged out successfully");
  loadProfile();
  switchPage("home");
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
  loadProfile();
  renderTasks();
  
  const last = localStorage.getItem("lastPage") || "home";
  switchPage(last);
  
  // Set the clock
  setInterval(() => {
    const clock = document.getElementById("clock");
    if (clock) clock.textContent = new Date().toLocaleTimeString();
  }, 1000);
  
  if (window.lucide) lucide.createIcons();
});
