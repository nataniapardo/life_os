<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
const SUPABASE_URL = "https://bzwnjtofcduxllafdybw.supabase.co";
const SUPABASE_KEY = "sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// PAGE SWITCH
function switchPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// STORAGE
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const load = k => JSON.parse(localStorage.getItem(k)) || [];

// CLOCK
function updateClock() {
  const tz = document.getElementById("timezoneSelect").value;
  const now = new Date().toLocaleString("en-US", { timeZone: tz });
  document.getElementById("clock").textContent = now;
}
setInterval(updateClock, 1000);

// TASKS
function addTask() {
  let val = taskInput.value;
  if (!val) return alert("Enter task");

  let data = load("tasks");
  data.push(val);
  save("tasks", data);
  renderTasks();
  taskInput.value = "";
}

function renderTasks() {
  taskList.innerHTML = "";
  load("tasks").forEach(t => {
    let li = document.createElement("li");
    li.textContent = t;
    taskList.appendChild(li);
  });
}

// DATES
function addDate() {
  let val = dateInput.value;
  let data = load("dates");
  data.push(val);
  save("dates", data);
  renderDates();
}

function renderDates() {
  dateList.innerHTML = "";
  load("dates").forEach(d => {
    let li = document.createElement("li");
    li.textContent = d;
    dateList.appendChild(li);
  });
}

// FILE + AI TABLE
fileUpload.addEventListener("change", e => {
  const table = document.querySelector("#aiTable tbody");

  Array.from(e.target.files).forEach(file => {
    let row = document.createElement("tr");

    row.innerHTML = `
      <td>${file.type.includes("pdf") ? "Document" : "Data"}</td>
      <td contenteditable="true">${file.name}</td>
      <td><button onclick="this.closest('tr').remove()">Delete</button></td>
    `;

    table.appendChild(row);

    console.log("AI processing hook:", file);
  });
});

// CUSTOMIZATION
colorPicker.oninput = e => document.body.style.backgroundColor = e.target.value;

function applyHex() {
  document.body.style.backgroundColor = hexInput.value;
}

bgUpload.onchange = e => {
  const reader = new FileReader();
  reader.onload = ev => {
    document.querySelector("main").style.backgroundImage = `url(${ev.target.result})`;
  };
  reader.readAsDataURL(e.target.files[0]);
};

// SEARCH
search.oninput = function() {
  let val = this.value.toLowerCase();
  document.querySelectorAll("li").forEach(li => {
    li.style.display = li.textContent.toLowerCase().includes(val) ? "" : "none";
  });
};

// INIT
renderTasks();
renderDates();
updateClock();
