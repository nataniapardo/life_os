// ==========================================
// 1. SYSTEM SETUP & CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
const db = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const OS_VERSION = "2.0.6";
let currentUser = null;

let recentlyDeleted = [];
let customInterval; 
let timerInterval = null; 
let timeLeft = 0;
let isBreak = false;
let isMilitary = false;
let calendarDate = new Date(); 

const stimulations = ["Nature", "Food", "Space", "Shapes", "Flowers", "Futuristic", "Travel", "Location"];

const fonts = [
    { name: 'Papyrus (System Default)', value: "'Papyrus', fantasy" },
    { name: 'Modern Sans', value: "'Inter', sans-serif" },
    { name: 'Futuristic', value: "'Orbitron', sans-serif" },
    { name: 'Elegant Serif', value: "'Playfair Display', serif" },
    { name: 'Coding Mono', value: "'JetBrains Mono', monospace" },
    { name: 'Clean Montserrat', value: "'Montserrat', sans-serif" }
];

// ==========================================
// 2. SYSTEM INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    updateSystemDate();
    initThemeEngine(); 
    startTimeEngine(); 
    populateFontList();
    populateStimulations();
    
    // Initialize both calendars
    initCalendar(); // Standard
    renderHorizontalCalendar(); // Apple-style

    const lastBg = localStorage.getItem('lifeOS_lastBackground') || 'Nature';
    setBackground(lastBg);

    const savedColor = localStorage.getItem('lifeOS_themeColor');
    if (savedColor) {
        document.documentElement.style.setProperty('--accent', savedColor);
        document.documentElement.style.setProperty('--accent-glow', savedColor);
    }

    const savedFont = localStorage.getItem('lifeOS_font') || "'Papyrus', fantasy";
    document.documentElement.style.setProperty('--main-font', savedFont);
});

// ==========================================
// 3. AI PERSONAL ASSISTANT LOGIC
// ==========================================

async function processTaskWithAI(rawText) {
    /**
     * AI Personal Assistant Simulation
     * Reads natural language and distributes attributes automatically.
     */
    const text = rawText.toLowerCase();
    let priority = 'medium';
    let dueDate = new Date().toISOString().split('T')[0];

    // Priority Heuristics
    if (text.includes('urgent') || text.includes('important') || text.includes('asap') || text.includes('today')) {
        priority = 'high';
    } else if (text.includes('whenever') || text.includes('later') || text.includes('low')) {
        priority = 'low';
    }

    // Simple Date Heuristics
    if (text.includes('tomorrow')) {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dueDate = tomorrow.toISOString().split('T')[0];
    }

    return { text: rawText, priority, dueDate };
}

async function smartAddTask() {
    const input = document.getElementById('aiTaskInput');
    if (!input || !input.value) return;

    // AI "reads" and "distributes" the data
    const analyzedTask = await processTaskWithAI(input.value);

    const { error } = await db
        .from('tasks')
        .insert([{ 
            text: analyzedTask.text, 
            priority: analyzedTask.priority,
            due_date: analyzedTask.dueDate,
            user_id: db.auth.user()?.id 
        }]);

    if (!error) {
        input.value = '';
        renderHorizontalCalendar(); 
        loadTasks(); 
    }
}

// ==========================================
// 4. TASK MANAGEMENT SYSTEM (CRUD)
// ==========================================

async function loadTasks() {
    const lists = {
        high: document.getElementById('highTaskList'),
        medium: document.getElementById('midTaskList'),
        low: document.getElementById('lowTaskList')
    };

    if (!lists.high) return;
    Object.values(lists).forEach(list => list.innerHTML = '');

    const { data: tasks, error } = await db
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return console.error(error);

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <span style="${task.is_completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">
                ${task.text}
            </span>
            <div class="task-actions">
                <i data-lucide="${task.is_completed ? 'rotate-ccw' : 'check'}" 
                   onclick="toggleTask('${task.id}', ${task.is_completed})" 
                   style="cursor:pointer; margin-right: 10px; color: var(--accent);"></i>
                <i data-lucide="trash-2" 
                   onclick="deleteTask('${task.id}')" 
                   style="cursor:pointer; color: #ff4d4d;"></i>
            </div>
        `;
        
        const targetList = lists[task.priority] || lists.medium;
        targetList.appendChild(li);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 5. PROFILE & AVATAR SYSTEM
// ==========================================

function updateProfileUI(user) {
    const nameEl = document.getElementById('userNameDisplay');
    const initialEl = document.getElementById('userInitials');
    const avatarEl = document.getElementById('userAvatarImg');

    if (user.user_metadata.full_name) {
        nameEl.innerText = user.user_metadata.full_name;
        // Generate Initials
        const initials = user.user_metadata.full_name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
        initialEl.innerText = initials;
    }

    if (user.user_metadata.avatar_url) {
        avatarEl.src = user.user_metadata.avatar_url;
        initialEl.classList.add('hidden');
        avatarEl.classList.remove('hidden');
    }
}

async function uploadAvatar(file) {
    const user = db.auth.user();
    const filePath = `avatars/${user.id}-${Date.now()}`;
    
    let { error: uploadError } = await db.storage
        .from('profile-pics')
        .upload(filePath, file);

    if (!uploadError) {
        const { publicURL } = db.storage.from('profile-pics').getPublicUrl(filePath);
        await db.auth.update({ data: { avatar_url: publicURL } });
        location.reload(); 
    }
}

function toggleProfileMenu() {
    const menu = document.getElementById('profileDropdown');
    if (menu) menu.classList.toggle('hidden');
}

// ==========================================
// 6. APPLE-STYLE HORIZONTAL CALENDAR
// ==========================================

function renderHorizontalCalendar() {
    const container = document.getElementById('appleCalendar');
    if (!container) return;
    container.innerHTML = '';
    
    const today = new Date();
    // Show 12 days spanning from 2 days ago to 9 days ahead
    for (let i = -2; i < 10; i++) { 
        const date = new Date();
        date.setDate(today.getDate() + i);
        
        const card = document.createElement('div');
        const isActive = i === 0;
        card.className = `calendar-day-card ${isActive ? 'active' : ''}`;
        
        card.innerHTML = `
            <span class="day-name">${date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span class="day-num">${date.getDate()}</span>
        `;
        
        // When clicked, AI/Assistant filters tasks for that day
        card.onclick = () => {
            document.querySelectorAll('.calendar-day-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            filterTasksByDate(date.toISOString().split('T')[0]);
        };
        container.appendChild(card);
    }
}

async function filterTasksByDate(dateStr) {
    console.log("AI Personal Assistant filtering tasks for:", dateStr);
    // Logic to reload task lists based on the selected due_date
    // loadTasks(dateStr); 
}

// ==========================================
// 7. APPEARANCE & BACKGROUND ENGINE
// ==========================================

function setBackground(query) {
    const bgOverlay = "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7))";
    const timestamp = new Date().getTime();
    const imageUrl = `https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=1920&sig=${timestamp}&keyword=${query}`;
    
    document.body.style.backgroundImage = `${bgOverlay}, url('${imageUrl}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";

    localStorage.setItem('lifeOS_lastBackground', query);
}

// ==========================================
// 8. TIME ENGINE & AUTH
// ==========================================

function startTimeEngine() {
    setInterval(() => {
        const now = new Date();
        const clockEl = document.getElementById('clockDisplay');
        if (clockEl) {
            clockEl.innerText = now.toLocaleTimeString('en-US', { 
                hour12: !isMilitary, 
                hour: '2-digit', minute: '2-digit', second: '2-digit' 
            });
        }
    }, 1000);
}

function handleAuth(mode) {
    const nameInput = document.getElementById('newNameInput');
    const emailInput = (mode === 'login') ? document.getElementById('emailInput') : document.getElementById('newEmailInput');
    currentUser = (mode === 'signup' && nameInput.value) ? nameInput.value : (emailInput.value || "User");
    
    const greeting = document.getElementById('dynamicGreeting');
    if (greeting) greeting.textContent = `Good morning, ${currentUser}`;
    
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Navigation Utilities
function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(section => section.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if (target) target.classList.remove('hidden');
    
    if(pageId === 'calendar') renderHorizontalCalendar();
}
