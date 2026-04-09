// Page Navigation
function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// Tasks
function addTask() {
  const input = document.getElementById('taskInput');
  if (!input.value.trim()) return alert('Task cannot be empty');
  const li = document.createElement('li');
  li.textContent = input.value;
  document.getElementById('taskList').appendChild(li);
  input.value = '';
}

// Contacts
function addContact() {
  const input = document.getElementById('contactInput');
  if (!input.value.trim()) return alert('Contact cannot be empty');
  const li = document.createElement('li');
  li.textContent = input.value;
  document.getElementById('contactList').appendChild(li);
  input.value = '';
}

// Due Dates
function addDueDate() {
  const input = document.getElementById('dueDate');
  if (!input.value) return alert('Please select a date');
  const li = document.createElement('li');
  li.textContent = input.value;
  document.getElementById('dateList').appendChild(li);
  input.value = '';
}

// File Uploads
document.getElementById('fileUpload').addEventListener('change', function(e) {
  const fileList = document.getElementById('fileList');
  Array.from(e.target.files).forEach(file => {
    const li = document.createElement('li');
    li.textContent = file.name;
    fileList.appendChild(li);
    // AI integration placeholder: send file to backend for processing
  });
});

// Background Customization
document.getElementById('colorPicker').addEventListener('input', (e) => {
  document.body.style.backgroundColor = e.target.value;
});

document.getElementById('bgUpload').addEventListener('change', function(e) {
  const reader = new FileReader();
  reader.onload = function(event) {
    document.body.style.backgroundImage = `url(${event.target.result})`;
    document.body.style.backgroundSize = 'cover';
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Pomodoro Timer
let timer;
let totalTime = 25 * 60; // 25 min

function updateTimerDisplay() {
  let minutes = Math.floor(totalTime / 60);
  let seconds = totalTime % 60;
  document.getElementById('timerDisplay').textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

function startPomodoro() {
  if (timer) return;
  timer = setInterval(() => {
    if (totalTime <= 0) {
      clearInterval(timer);
      alert('Pomodoro finished!');
      totalTime = 25 * 60;
      timer = null;
    } else {
      totalTime--;
      updateTimerDisplay();
    }
  }, 1000);
}

function resetPomodoro() {
  clearInterval(timer);
  totalTime = 25 * 60;
  updateTimerDisplay();
  timer = null;
}

// Initialize timer display
updateTimerDisplay();
