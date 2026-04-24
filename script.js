// 🔑 SUPABASE SETUP
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = ‘sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl’;

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// GLOBAL STATE
let pages = [];
let currentPageId = null;

// ELEMENTS
const pagesList = document.getElementById("pagesList");
const newPageBtn = document.getElementById("newPageBtn");
const notesEl = document.getElementById("notes");
const tasksContainer = document.getElementById("tasks");

// =======================
// 👤 NAME + GREETING
// =======================
function saveName() {
  const name = document.getElementById("nameInput").value;
  localStorage.setItem("username", name);
  updateGreeting();
}

function updateGreeting() {
  const name = localStorage.getItem("username") || "User";
  const hour = new Date().getHours();

  let greeting = "Hello";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  document.getElementById("greeting").textContent =
    `${greeting}, ${name} 👋`;
}
updateGreeting();

// =======================
// 🌗 THEME
// =======================
const themeToggle = document.getElementById("themeToggle");

themeToggle.onclick = () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

// =======================
// 🔔 NOTIFICATIONS
// =======================
let notifications = JSON.parse(localStorage.getItem("notifications")) || [];

document.getElementById("profileIcon").onclick = () => {
  document.getElementById("notificationPanel").classList.toggle("hidden");
  renderNotifications();
};

function addNotification(msg) {
  notifications.push(msg);
  localStorage.setItem("notifications", JSON.stringify(notifications));
}

function renderNotifications() {
  const container = document.getElementById("notifications");
  container.innerHTML = "";
  notifications.forEach(n => {
    const div = document.createElement("div");
    div.textContent = n;
    container.appendChild(div);
  });
}

document.getElementById("clearNotifications").onclick = () => {
  notifications = [];
  localStorage.setItem("notifications", "[]");
  renderNotifications();
};

// =======================
// 📄 PAGES (SUPABASE)
// =======================
async function loadPages() {
  const { data } = await supabase.from("pages").select("*");
  pages = data || [];
  renderPages();
}
loadPages();

newPageBtn.onclick = async () => {
  await supabase.from("pages").insert([{ title: "New Page" }]);
  loadPages();
};

function renderPages() {
  pagesList.innerHTML = "";

  pages.forEach(page => {
    const div = document.createElement("div");
    div.textContent = page.title;
    div.className = "page-item";

    div.onclick = () => selectPage(page.id);

    pagesList.appendChild(div);
  });
}

async function selectPage(id) {
  currentPageId = id;
  const page = pages.find(p => p.id === id);

  document.getElementById("pageTitle").textContent = page.title;
  notesEl.value = page.notes || "";

  loadTasks(id);
}

// =======================
// 📝 NOTES SAVE
// =======================
notesEl.addEventListener("input", async () => {
  if (!currentPageId) return;

  await supabase
    .from("pages")
    .update({ notes: notesEl.value })
    .eq("id", currentPageId);
});

// =======================
// ✅ TASKS (SUPABASE)
// =======================
async function loadTasks(pageId) {
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("page_id", pageId);

  renderTasks(data || []);
}

function renderTasks(tasks) {
  tasksContainer.innerHTML = "";

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task";

    const left = document.createElement("div");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.onchange = async () => {
      await supabase
        .from("tasks")
        .update({ completed: checkbox.checked })
        .eq("id", task.id);

      loadTasks(currentPageId);
    };

    const span = document.createElement("span");
    span.textContent = task.text;

    if (task.completed) div.classList.add("completed");

    left.appendChild(checkbox);
    left.appendChild(span);

    const priority = document.createElement("div");
    priority.className = `priority ${task.priority}`;
    priority.textContent = task.priority;

    div.appendChild(left);
    div.appendChild(priority);

    tasksContainer.appendChild(div);
  });
}

// =======================
// 🤖 AI ORGANIZER
// =======================
document.getElementById("aiBtn").onclick = async () => {
  const page = pages.find(p => p.id === currentPageId);
  if (!page) return;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_OPENAI_API_KEY"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [{
        role: "user",
        content: `
Turn these notes into tasks:
${page.notes}
Return JSON.
        `
      }]
    })
  });

  const data = await res.json();
  let text = data.choices[0].message.content;

  text = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(text);

  for (let t of parsed) {
    await supabase.from("tasks").insert([{
      page_id: currentPageId,
      text: t.task,
      priority: t.priority,
      completed: false
    }]);
  }

  loadTasks(currentPageId);
};

// =======================
// 📅 DAILY AI PLANNER
// =======================
document.getElementById("planBtn").onclick = async () => {
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("page_id", currentPageId);

  const tasksText = data.map(t => t.text).join(", ");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_OPENAI_API_KEY"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [{
        role: "user",
        content: `Create a daily schedule: ${tasksText}`
      }]
    })
  });

  const result = await res.json();
  document.getElementById("planOutput").textContent =
    result.choices[0].message.content;

  addNotification("Daily plan created ✅");
};
