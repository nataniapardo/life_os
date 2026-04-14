// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================
// PAGE SYSTEM (ROUTER)
// =========================
function switchPage(pageId) {
  const isLoggedIn = localStorage.getItem("loggedIn");

  if (pageId === "dashboard" && !isLoggedIn) {
    alert("Please login first");
    return;
  }

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

  const page = document.getElementById(pageId);
  if (page) page.classList.add("active");

  localStorage.setItem("lastPage", pageId);
}

// HOME (LOGO CLICK)
function goHome() {
  switchPage("home");
}

// RESTORE LAST PAGE
window.onload = () => {
  const last = localStorage.getItem("lastPage") || "home";
  switchPage(last);

  renderTasks();
};

// =========================
// CLOCK
// =========================
setInterval(() => {
  const clock = document.getElementById("clock");
  if (clock) {
    clock.textContent = new Date().toLocaleTimeString();
  }
}, 1000);

// =========================
// CREATE ACCOUNT (SIGNUP + AUTO LOGIN)
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

  if (fetchError) {
    console.error(fetchError);
    alert("Error checking user");
    return;
  }

  if (existing && existing.length > 0) {
    alert("Username already exists");
    return;
  }

  const { error: insertError } = await db
    .from("users")
    .insert([
      {
        username,
        password
      }
    ]);

  if (insertError) {
    console.error(insertError);
    alert("Error creating account");
    return;
  }

  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("currentUser", username);

  alert("Account created and logged in!");
  switchPage("dashboard");
}

// =========================
// LOGIN
// =========================
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

// =========================
// LOG OUT (UPDATED NAME)
// =========================
function logOut() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("currentUser");

  alert("Logged out successfully");

  switchPage("home");
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


 

