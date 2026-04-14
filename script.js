// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================
// PAGE SYSTEM
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

function goHome() {
  switchPage("home");
}

// =========================
// INIT
// =========================
window.onload = () => {
  const last = localStorage.getItem("lastPage") || "home";
  switchPage(last);

  renderTasks();
  renderMeetings();
  renderContacts();

  loadTheme();
  loadBackground();
};

// =========================
// CLOCK
// =========================
setInterval(() => {
  const clock = document.getElementById("clock");
  if (clock) clock.textContent = new Date().toLocaleTimeString();
}, 1000);

// =========================
// AUTH SYSTEM
// =========================
async function CreateAccount() {
  const username = signUser.value.trim();
  const password = signPass.value.trim();

  if (!username || !password) return showError("Enter credentials");

  const { data: existing } = await db
    .from("users")
    .select("*")
    .eq("username", username);

  if (existing && existing.length > 0) {
    return showError("Username exists");
  }

  const { error } = await db.from("users").insert([{ username, password }]);

  if (error) return showError("Signup failed");

  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("currentUser", username);

  switchPage("dashboard");
}

function signup() {
  return CreateAccount();
}

async function login() {
  const username = loginUser.value.trim();
  const password = loginPass.value.trim();

  const { data } = await db
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (!data) return showError("Invalid login");

  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("currentUser", username);

  switchPage("dashboard");
}

function logOut() {
  localStorage.clear();
  alert("Logged out");
  switchPage("home");
}

// =========================
// TASK SYSTEM
// =========================
function addTask() {
  const val = taskInput.value;
  if (!val) return showError("Task required");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(val);

  localStorage.setItem("tasks", JSON.stringify(tasks));

  taskInput.value = "";
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  if (!list) return;

  list.innerHTML = "";

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks.forEach(t => {
    let li = document.createElement("li");
    li.textContent = t;
    list.appendChild(li);
  });
}

// =========================
// MEETINGS
// =========================
function renderMeetings() {
  const list = document.getElementById("meetingList");
  if (!list) return;

  list.innerHTML = "";

  let meetings = JSON.parse(localStorage.getItem("meetings")) || [];

  meetings.forEach(m => {
    let li = document.createElement("li");
    li.textContent = m;
    list.appendChild(li);
  });
}

// =========================
// CONTACTS
// =========================
function renderContacts() {
  const list = document.getElementById("contactList");
  if (!list) return;

  list.innerHTML = "";

  let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

  contacts.forEach(c => {
    let li = document.createElement("li");
    li.textContent = c;
    list.appendChild(li);
  });
}

// =========================
// FILE UPLOAD + AI SIM
// =========================
function uploadFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  simulateAIExtraction(file.name);
}

function simulateAIExtraction(name) {
  setTimeout(() => {
    const mock = {
      tasks: ["Finish report"],
      meetings: ["Meeting at 2PM"],
      contacts: ["Recruiter - LinkedIn"]
    };
    autoPlaceData(mock);
  }, 1500);
}

function autoPlaceData(data) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(...data.tasks);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  let meetings = JSON.parse(localStorage.getItem("meetings")) || [];
  meetings.push(...data.meetings);
  localStorage.setItem("meetings", JSON.stringify(meetings));

  let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
  contacts.push(...data.contacts);
  localStorage.setItem("contacts", JSON.stringify(contacts));

  renderTasks();
  renderMeetings();
  renderContacts();
}

// =========================
// BACKGROUND UPLOAD
// =========================
function uploadBackground(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    document.querySelector("main").style.backgroundImage = `url(${evt.target.result})`;
    localStorage.setItem("bg", evt.target.result);
  };
  reader.readAsDataURL(file);
}

function loadBackground() {
  const bg = localStorage.getItem("bg");
  if (bg) document.querySelector("main").style.backgroundImage = `url(${bg})`;
}

// =========================
// COLOR THEME
// =========================
function setThemeColor(color) {
  document.documentElement.style.setProperty("--accent", color);
  localStorage.setItem("color", color);
}

function loadTheme() {
  const color = localStorage.getItem("color");
  if (color) setThemeColor(color);
}

// =========================
// SEARCH
// =========================
function searchData(query) {
  query = query.toLowerCase();

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  let results = tasks.filter(t => t.toLowerCase().includes(query));

  console.log("Results:", results);
}

// =========================
// SPELL CHECK
// =========================
function checkSpelling(text) {
  const fixes = { "teh": "the" };
  return text.split(" ").map(w => fixes[w] || w).join(" ");
}

// =========================
// ERROR HANDLING
// =========================
function showError(msg) {
  alert(msg);
}

// =========================
// POMODORO TIMER
// =========================
let timer;
let timeLeft = 1500;

function startPomodoro() {
  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;

    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;

    const display = document.getElementById("timer");
    if (display) display.textContent = `${m}:${s < 10 ? "0" : ""}${s}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("Time's up!");
    }
  }, 1000);
}

// =========================
// RESPONSIVE
// =========================
function toggleSidebar() {
  document.querySelector("aside").classList.toggle("hidden");
}


  
