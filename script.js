const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// =========================
// PAGE SYSTEM (ISOLATION)
// =========================
function switchPage(pageId) {
  const isLoggedIn = localStorage.getItem("loggedIn");

  // protect dashboard
  if (pageId === "dashboard" && !isLoggedIn) {
    alert("Please login first");
    return;
  }

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

// HOME BUTTON
function goHome() {
  switchPage("home");
}

// =========================
// CLOCK
// =========================
setInterval(() => {
  document.getElementById("clock").textContent =
    new Date().toLocaleTimeString();
}, 1000);

// =========================
// AUTH SYSTEM (LOCAL STORAGE)
// =========================
function signup() {
  let user = signUser.value;
  let pass = signPass.value;

  localStorage.setItem("user", JSON.stringify({ user, pass }));

  alert("Account created!");
  switchPage("login");
}

function login() {
  let user = loginUser.value;
  let pass = loginPass.value;

  let stored = JSON.parse(localStorage.getItem("user"));

  if (stored && stored.user === user && stored.pass === pass) {
    localStorage.setItem("loggedIn", "true");
    alert("Login successful!");
    switchPage("dashboard");
  } else {
    alert("Invalid credentials");
  }
}

// =========================
// DASHBOARD TASKS
// =========================
function addTask() {
  let val = taskInput.value;
  if (!val) return;

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(val);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  renderTasks();
  taskInput.value = "";
}

function renderTasks() {
  taskList.innerHTML = "";
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks.forEach(t => {
    let li = document.createElement("li");
    li.textContent = t;
    taskList.appendChild(li);
  });
}

// INIT
renderTasks();
  
  

 
