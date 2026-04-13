// PAGE SWITCHING
function switchPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// LOCAL STORAGE HELPERS
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function load(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// TASKS
function addTask() {
  const input = document.getElementById('taskInput');
  if (!input.value) return alert('Enter task');

  const tasks = load('tasks');
  tasks.push(input.value);
  save('tasks', tasks);

  renderTasks();
  input.value = '';
}

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  load('tasks').forEach(task => {
    let li = document.createElement('li');
    li.textContent = task;
    list.appendChild(li);
  });
}

// CONTACTS
function addContact() {
  const input = document.getElementById('contactInput');
  if (!input.value) return alert('Enter contact');

  const contacts = load('contacts');
  contacts.push(input.value);
  save('contacts', contacts);

  renderContacts();
  input.value = '';
}

function renderContacts() {
  const list = document.getElementById('contactList');
  list.innerHTML = '';
  load('contacts').forEach(c => {
    let li = document.createElement('li');
    li.textContent = c;
    list.appendChild(li);
  });
}

// CALENDAR
function addDate() {
  const input = document.getElementById('dateInput');
  const dates = load('dates');
  dates.push(input.value);
  save('dates', dates);
  renderDates();
}

function renderDates() {
  const list = document.getElementById('dateList');
  list.innerHTML = '';
  load('dates').forEach(d => {
    let li = document.createElement('li');
    li.textContent = d;
    list.appendChild(li);
  });
}

// FILE UPLOAD (AI HOOK)
document.getElementById('fileUpload').addEventListener('change', e => {
  const files = Array.from(e.target.files);
  const list = document.getElementById('fileList');

  files.forEach(file => {
    let li = document.createElement('li');
    li.textContent = file.name;
    list.appendChild(li);

    // 🔥 AI INTEGRATION HOOK
    console.log("Send to AI parser:", file);
  });
});

// CUSTOMIZATION
document.getElementById('colorPicker').addEventListener('input', e => {
  document.body.style.background = e.target.value;
});

document.getElementById('bgUpload').addEventListener('change', e => {
  const reader = new FileReader();
  reader.onload = function(ev) {
    document.body.style.backgroundImage = `url(${ev.target.result})`;
  };
  reader.readAsDataURL(e.target.files[0]);
});

// POMODORO
let time = 1500;
let interval;

function updateTimer() {
  let m = Math.floor(time / 60);
  let s = time % 60;
  document.getElementById('timer').textContent =
    `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function startTimer() {
  if (interval) return;
  interval = setInterval(() => {
    if (time <= 0) {
      clearInterval(interval);
      alert("Done!");
      time = 1500;
      interval = null;
    } else {
      time--;
      updateTimer();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(interval);
  interval = null;
  time = 1500;
  updateTimer();
}

// INIT
renderTasks();
renderContacts();
renderDates();
updateTimer();
