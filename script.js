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
  const privatePages = ["dashboard", "settings-general", "settings-notifications", "account", "personalization"];
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
// PROFILE DROPDOWN LOGIC
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

// Close menu when clicking outside of the profile area
window.addEventListener("click", (e) => {
  const container = document.querySelector(".profile-container");
  if (container && !container.contains(e.target)) {
    closeProfileMenu();
  }
});

// =========================
// AUTHENTICATION
// =========================

async function signup() {
  return CreateAccount();
}

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
  switchPage("dashboard");
}

function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("currentUser");
  alert("Logged out successfully");
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
    logout(); // Clear session and redirect to home
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
window.onload = () => {
  const last = localStorage.getItem("lastPage") || "home";
  switchPage(last);
  renderTasks();
  
  // Set the clock
  setInterval(() => {
    const clock = document.getElementById("clock");
    if (clock) clock.textContent = new Date().toLocaleTimeString();
  }, 1000);
};
