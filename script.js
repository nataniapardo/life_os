// 🔑 SUPABASE SETUP
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = ‘sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl’;

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🔑 CONFIGURATION
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
const OPENAI_KEY = "YOUR_OPENAI_API_KEY";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🌎 GLOBAL STATE
let pages = [];
let currentPageId = null;
let notifications = JSON.parse(localStorage.getItem("notifications")) || [];

// 🚀 INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initClock();
    renderAppleStrip();
    updateGreeting();
    loadPages();
    
    // Check for saved theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
});

// ==========================================
// 🕒 SYSTEM UI (Clock & Calendar)
// ==========================================
function initClock() {
    const update = () => {
        const now = new Date();
        const clockEl = document.getElementById('clockDisplay');
        const dateEl = document.getElementById('dateDisplay');
        
        if(clockEl) clockEl.innerText = now.toLocaleTimeString();
        if(dateEl) dateEl.innerText = now.toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };
    setInterval(update, 1000);
    update();
}

function renderAppleStrip() {
    const strip = document.getElementById('appleCalendar');
    if (!strip) return;
    
    const today = new Date();
    strip.innerHTML = '';

    for (let i = -2; i < 12; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        const card = document.createElement('div');
        card.className = `calendar-day-card ${i === 0 ? 'active' : ''}`;
        card.innerHTML = `
            <span style="font-size: 0.7rem; opacity: 0.6;">${d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span style="font-size: 1.2rem; font-weight: bold; margin-top: 5px;">${d.getDate()}</span>
        `;
        strip.appendChild(card);
    }
}

// ==========================================
// 📄 PAGE & CONTENT MANAGEMENT (Supabase)
// ==========================================
async function loadPages() {
    const { data } = await supabase.from("pages").select("*");
    pages = data || [];
    renderPages();
}

const newPageBtn = document.getElementById("newPageBtn");
if (newPageBtn) {
    newPageBtn.onclick = async () => {
        await supabase.from("pages").insert([{ title: "New Page" }]);
        loadPages();
    };
}

function renderPages() {
    const pagesList = document.getElementById("pagesList");
    if (!pagesList) return;
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
    const notesEl = document.getElementById("notes");
    const pageTitleEl = document.getElementById("pageTitle");

    if (pageTitleEl) pageTitleEl.textContent = page.title;
    if (notesEl) notesEl.value = page.notes || "";

    loadTasks(id);
}

// Autosave Notes
const notesEl = document.getElementById("notes");
if (notesEl) {
    notesEl.addEventListener("input", async () => {
        if (!currentPageId) return;
        await supabase
            .from("pages")
            .update({ notes: notesEl.value })
            .eq("id", currentPageId);
    });
}

// ==========================================
// ✅ TASK MANAGEMENT
// ==========================================
async function loadTasks(pageId) {
    const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("page_id", pageId);

    renderTasks(data || []);
}

function renderTasks(tasks) {
    const tasksContainer = document.getElementById("tasks");
    if (!tasksContainer) return;
    tasksContainer.innerHTML = "";

    tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = `task ${task.completed ? 'completed' : ''}`;

        div.innerHTML = `
            <div>
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                    onchange="toggleTask('${task.id}', this.checked)">
                <span>${task.text}</span>
            </div>
            <div class="priority ${task.priority}">${task.priority}</div>
        `;
        tasksContainer.appendChild(div);
    });
}

async function toggleTask(taskId, isCompleted) {
    await supabase.from("tasks").update({ completed: isCompleted }).eq("id", taskId);
    loadTasks(currentPageId);
}

// ==========================================
// 🤖 AI ENGINE (OpenAI)
// ==========================================
async function smartAddTask() {
    const input = document.getElementById('aiTaskInput');
    if (!input || !input.value || !currentPageId) return;

    // Direct insert to Supabase
    const priority = (input.value.toLowerCase().includes('urgent') || input.value.toLowerCase().includes('priority')) ? 'high' : 'medium';
    
    await supabase.from("tasks").insert([{
        page_id: currentPageId,
        text: input.value,
        priority: priority,
        completed: false
    }]);

    input.value = '';
    loadTasks(currentPageId);
    addNotification("Manual task synced to cloud ☁️");
}

const aiBtn = document.getElementById("aiBtn");
if (aiBtn) {
    aiBtn.onclick = async () => {
        const page = pages.find(p => p.id === currentPageId);
        if (!page || !page.notes) return;

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                messages: [{
                    role: "user",
                    content: `Turn these notes into tasks. Return ONLY valid JSON array: [{"task": "string", "priority": "high/medium/low"}]. Notes: ${page.notes}`
                }]
            })
        });

        const data = await res.json();
        let text = data.choices[0].message.content.replace(/```json|```/g, "").trim();
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
        addNotification("AI organized your notes! ✨");
    };
}

// ==========================================
// 👤 PROFILE & AUTH
// ==========================================
function saveName() {
    const nameInput = document.getElementById("nameInput");
    if(nameInput) {
        localStorage.setItem("username", nameInput.value);
        updateGreeting();
    }
}

function updateGreeting() {
    const name = localStorage.getItem("username") || "User";
    const hour = new Date().getHours();
    const greetEl = document.getElementById("greeting") || document.getElementById("dynamicGreeting");

    let msg = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    if (greetEl) greetEl.textContent = `${msg}, ${name} 👋`;
}

function handleAuth(type) {
    // Transition UI
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    addNotification("System Initialized 🖥️");
}

function toggleProfileMenu() {
    const drop = document.getElementById('profileDropdown');
    if(drop) drop.classList.toggle('hidden');
}

function saveProfileChanges() {
    const name = document.getElementById('editFullName').value;
    if (name) {
        localStorage.setItem("username", name);
        updateGreeting();
        const display = document.getElementById('userNameDisplay');
        if(display) display.innerText = name;
    }
    if (window.tempAvatar) {
        const img = document.getElementById('userAvatarImg');
        if(img) {
            img.src = window.tempAvatar;
            img.classList.remove('hidden');
            document.getElementById('userInitials').classList.add('hidden');
        }
    }
    closeProfileSettings();
}

// ==========================================
// 🔔 NOTIFICATIONS & THEME
// ==========================================
function addNotification(msg) {
    notifications.unshift(`${new Date().toLocaleTimeString()}: ${msg}`);
    if (notifications.length > 5) notifications.pop();
    localStorage.setItem("notifications", JSON.stringify(notifications));
    renderNotifications();
}

function renderNotifications() {
    const container = document.getElementById("notifications");
    if (!container) return;
    container.innerHTML = notifications.map(n => `<div>${n}</div>`).join("");
}

const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.onclick = () => {
        const isDark = document.body.classList.toggle("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    };
}

// Navigation Helper
function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if(target) target.classList.remove('hidden');
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
}
