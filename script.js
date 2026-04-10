// Navigation
function navigate(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
}

// Tasks
let tasks = [];

function addTask() {
  const text = document.getElementById('taskText').value;
  const date = document.getElementById('taskDate').value;

  if (!text) {
    alert("Task cannot be empty!");
    return;
  }

  if (!date) {
    alert("Please add a due date!");
    return;
  }

  const task = { text, date };
  tasks.push(task);

  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${task.text} - ${task.date}
      <button onclick="deleteTask(${index})">X</button>
    `;
    list.appendChild(li);
  });

  document.getElementById('taskCount').innerText = tasks.length;
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
}

// Search (basic prototype)
function handleSearch() {
  const query = document.getElementById('globalSearch').value.toLowerCase();

  if (!query) {
    alert("Enter a search term");
    return;
  }

  alert("Search feature will connect to AI + synonym engine: " + query);
}

// Theme customization
function changeThemeColor(color) {
  document.documentElement.style.setProperty('--primary-color', color);
}

function applyHex() {
  const hex = document.getElementById('hexInput').value;

  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    alert("Invalid HEX code!");
    return;
  }

  changeThemeColor(hex);
}
