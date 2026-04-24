// ==========================
// SUPABASE INITIALIZATION
// ==========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Global State for Tasks
let todos = []; 

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateGreeting();
    renderCalendar(); // Initialize calendar structure
    setInterval(updateTime, 1000);
});

// DYNAMIC GREETING LOGIC
function updateGreeting() {
    const hours = new Date().getHours();
    const greetingEl = document.getElementById('dynamicGreeting');
    let msg = "";
    
    if (hours >= 5 && hours < 12) msg = "Good morning";
    else if (hours >= 12 && hours < 17) msg = "Good afternoon";
    else if (hours >= 17 && hours < 21) msg = "Good evening";
    else msg = "Good night";
    
    greetingEl.innerText = `${msg}, User`;
}

function updateTime() {
    const now = new Date();
    const clockEl = document.getElementById('clockDisplay');
    const dateEl = document.getElementById('dateDisplay');
    if (clockEl) clockEl.innerText = now.toLocaleTimeString();
    if (dateEl) dateEl.innerText = now.toDateString();
}

// PROFILE MENU TOGGLE
function toggleProfileMenu() {
    const menu = document.getElementById('profileDropdown');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// NAVIGATION
function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if (target) target.classList.remove('hidden');
    
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
        if (li.getAttribute('onclick').includes(pageId)) li.classList.add('active');
    });

    // Sync tasks if entering calendar
    if (pageId === 'calendarView') {
        syncTasksToCalendar();
    }
}

// PRODUCTIVITY AI SIMULATION
function processAIInput() {
    const input = document.getElementById('aiRawInput').value;
    if (!input) return;

    const previewArea = document.getElementById('aiPreviewArea');
    const suggestList = document.getElementById('suggestedList');
    suggestList.innerHTML = "";

    const fakeTasks = input.split(',').map(t => t.trim());
    fakeTasks.forEach(taskText => {
        const li = document.createElement('li');
        li.innerHTML = `<label><input type="checkbox" checked> ${taskText} (AI Sorted)</label>`;
        suggestList.appendChild(li);
    });

    previewArea.classList.remove('hidden');
}

function applyToMainList() {
    const suggestList = document.getElementById('suggestedList');
    const items = suggestList.querySelectorAll('li');
    const today = new Date().toISOString().split('T')[0]; // Default to today's date

    items.forEach(item => {
        const taskText = item.innerText.replace('(AI Sorted)', '').trim();
        
        // Add to global array for calendar sync
        todos.push({
            text: taskText,
            date: today,
            completed: false
        });

        // Add to UI
        const li = document.createElement('li');
        li.innerHTML = `<label><input type="checkbox"> ${taskText}</label>`;
        document.getElementById('finalTaskList').appendChild(li);
    });

    document.getElementById('aiPreviewArea').classList.add('hidden');
    document.getElementById('aiRawInput').value = "";
    
    syncTasksToCalendar(); // Update calendar with new tasks
    alert("Tasks saved to 24/7 view!");
}

// CALENDAR LOGIC
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    grid.innerHTML = "";

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let dayCount = 1; dayCount <= daysInMonth; dayCount++) {
        const cell = document.createElement('div');
        cell.className = 'day-box';
        // Format date as YYYY-M-D (matches your requested format)
        cell.setAttribute('data-date', `${year}-${month + 1}-${dayCount}`); 
        cell.innerHTML = `<span class="day-number">${dayCount}</span>`;
        grid.appendChild(cell);
    }
    syncTasksToCalendar();
}

/**
 * Synchronizes Todo List tasks with the Calendar view.
 */
function syncTasksToCalendar() {
    // 1. Clear existing task indicators
    document.querySelectorAll('.calendar-event-dot, .calendar-task-label').forEach(el => el.remove());

    // 2. Loop through todo data
    todos.forEach(task => {
        if (!task.date || task.completed) return; 

        // 3. Find the calendar cell that matches the task date
        const dateString = task.date;
        const dayCell = document.querySelector(`.day-box[data-date="${dateString}"]`);

        if (dayCell) {
            // 4. Create visual indicator
            const dot = document.createElement('div');
            dot.className = 'calendar-event-dot';
            dot.title = task.text; 

            // Handle navigation on click
            dot.onclick = () => {
                switchPage('todoView'); // Navigates to todo section
                console.log("Navigating to task: " + task.text);
            };
            
            dayCell.appendChild(dot);
        }
    });
}

// CALENDAR CUSTOMIZATION
function updateCalTheme() {
    const color = document.getElementById('calColorPicker').value;
    const hex = document.getElementById('calHexInput').value;
    const finalColor = hex.startsWith('#') ? hex : color;

    document.querySelectorAll('.day-box').forEach(day => {
        day.style.borderColor = finalColor;
        day.style.color = finalColor;
    });
}
