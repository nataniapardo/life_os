// PAGE SWITCHING
function switchPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// LOCAL STORAGE
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function load(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// CLOCK WITH TIMEZONE
function updateClock() {
  const tz = document.getElementById("timezoneSelect").value;
  const now = new Date().toLocaleString("en-US", { timeZone: tz });
  document.getElementById("clock").textContent = now;
}
setInterval(updateClock, 1000);

// TASKS
function addTask() {
  let val = document.getElementById("taskInput").value;
  if (!val) return alert("Enter task");

  let tasks = load("tasks");
  tasks.push(val);
  save("tasks", tasks);
  renderTasks();
}

function renderTasks() {
  let list = document.getElementById("taskList");
  list.innerHTML = "";
  load("tasks").forEach(t => {
    let li = document.createElement("li");
    li.textContent = t;
    list.appendChild(li);
  });
}

// CALENDAR
function addDate() {
  let val = document.getElementById("dateInput").value;
  let dates = load("dates");
  dates.push(val);
  save("dates", dates);
  renderDates();
}

function renderDates() {
  let list = document.getElementById("dateList");
  list.innerHTML = "";
  load("dates").forEach(d => {
    let li = document.createElement("li");
    li.textContent = d;
    list.appendChild(li);
  });
}

// FILE UPLOAD + AI SIMULATION
document.getElementById("fileUpload").addEventListener("change", e => {
  const files = Array.from(e.target.files);
  let table = document.querySelector("#aiTable tbody");

  files.forEach(file => {
    let row = document.createElement("tr");

    // Simulated AI extraction
    let type = file.type.includes("pdf") ? "Document" : "Data";
    let content = file.name;

    row.innerHTML = `
      <td>${type}</td>
      <td contenteditable="true">${content}</td>
      <td><button onclick="deleteRow(this)">Delete</button></td>
    `;

    table.appendChild(row);

    // AI HOOK
    console.log("Send file to AI:", file);
  });
});

// DELETE ROW
function deleteRow(btn) {
  btn.parentElement.parentElement.remove();
}

// CUSTOMIZATION
document.getElementById("colorPicker").addEventListener("input", e => {
  document.body.style.backgroundColor = e.target.value;
});

function applyHex() {
  const hex = document.getElementById("hexInput").value;
  document.body.style.backgroundColor = hex;
}

document.getElementById("bgUpload").addEventListener("change", e => {
  const reader = new FileReader();
  reader.onload = function(ev) {
    document.querySelector("main").style.backgroundImage = `url(${ev.target.result})`;
  };
  reader.readAsDataURL(e.target.files[0]);
});

// SEARCH
document.getElementById("search").addEventListener("input", function() {
  let value = this.value.toLowerCase();
  document.querySelectorAll("li").forEach(li => {
    li.style.display = li.textContent.toLowerCase().includes(value) ? "" : "none";
  });
});

// INIT
renderTasks();
renderDates();
updateClock();
