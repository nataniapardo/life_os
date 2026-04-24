// DOM Elements
const taskList = document.getElementById("taskList");
const habitList = document.getElementById("habitList");
const taskCount = document.getElementById("taskCount");
const habitCount = document.getElementById("habitCount");
const themeToggle = document.getElementById("themeToggle");
const timeDisplay = document.getElementById("currentTime");
const dateDisplay = document.getElementById("currentDate");

const quickModal = document.getElementById("quickModal");
const openQuickAction = document.getElementById("openQuickAction");
const closeModal = document.getElementById("closeModal");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const quickTaskInput = document.getElementById("quickTaskInput");
const addTaskBtn = document.getElementById("addTaskBtn");

// 1. Time and Date Updates
function updateClock() {
    const now = new Date();
    timeDisplay.textContent = now.toLocaleTimeString();
    dateDisplay.textContent = now.toLocaleDateString(undefined, { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
}
setInterval(updateClock, 1000);
updateClock();

// 2. Theme Toggle (Light/Dark)
themeToggle.addEventListener("click", () => {
    if (document.body.classList.contains("dark-mode")) {
        document.body.classList.replace("dark-mode", "light-mode");
    } else {
        document.body.classList.replace("light-mode", "dark-mode");
    }
});

// 3. Counter Management
function updateTaskCount() {
    const tasks = taskList.querySelectorAll('input[type="checkbox"]');
    const unchecked = [...tasks].filter(task => !task.checked).length;
    taskCount.textContent = unchecked;
}

function updateHabitCount() {
    const habits = habitList.querySelectorAll('input[type="checkbox"]');
    const completed = [...habits].filter(habit => habit.checked).length;
    habitCount.textContent = `${completed}/${habits.length}`;
}

// 4. Checklist Listeners
function attachListeners() {
    document.querySelectorAll('.check-list input[type="checkbox"]').forEach(input => {
        input.addEventListener("change", () => {
            updateTaskCount();
            updateHabitCount();
        });
    });
}

// 5. Modal Management
function openModal() {
    quickModal.classList.remove("hidden");
    quickTaskInput.focus();
}

function closeQuickModal() {
    quickModal.classList.add("hidden");
    quickTaskInput.value = "";
}

openQuickAction.addEventListener("click", openModal);
addTaskBtn.addEventListener("click", openModal);
closeModal.addEventListener("click", closeQuickModal);

saveTaskBtn.addEventListener("click", () => {
    const name = quickTaskInput.value.trim();
    if (name) {
        const li = document.createElement("li");
        li.innerHTML = `<label><input type="checkbox" /> ${name}</label>`;
        taskList.appendChild(li);
        
        // Attach listener to the new checkbox
        li.querySelector('input').addEventListener("change", updateTaskCount);
        
        updateTaskCount();
        closeQuickModal();
    }
});

// 6. Settings and Logout Mock
function handleLogout() {
    if(confirm("Are you sure you want to log out?")) {
        alert("Session terminated. Demonstration Mode.");
    }
}

// Initial Run
attachListeners();
updateTaskCount();
updateHabitCount();
