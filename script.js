<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
const SUPABASE_URL = "https://bzwnjtofcduxllafdybw.supabase.co";
const SUPABASE_KEY = "sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl";

const supabaseClient = supabase.createClient("https://bzwnjtofcduxllafdybw.supabase.co", "sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl");

// PAGE SWITCHING
function switchPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// CLOCK
function updateClock() {
  const tz = timezoneSelect.value;
  const now = new Date().toLocaleString("en-US", { timeZone: tz });
  document.getElementById("clock").textContent = now;
}
setInterval(updateClock, 1000);

// TASKS
function addTask() {
  let val = taskInput.value;
  if (!val) return;

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(val);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  renderTasks();
  taskInput.value = "";
}

function renderTasks() {
  taskList.innerHTML = "";
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks.forEach(t => {
    let li = document.createElement("li");
    li.textContent = t;
    taskList.appendChild(li);
  });
}

// DATES
function addDate() {
  let val = dateInput.value;
  let dates = JSON.parse(localStorage.getItem("dates")) || [];

  dates.push(val);
  localStorage.setItem("dates", JSON.stringify(dates));

  renderDates();
}

function renderDates() {
  dateList.innerHTML = "";
  let dates = JSON.parse(localStorage.getItem("dates")) || [];

  dates.forEach(d => {
    let li = document.createElement("li");
    li.textContent = d;
    dateList.appendChild(li);
  });
}

// FILE UPLOAD (AI READY)
fileUpload.addEventListener("change", e => {
  const table = document.querySelector("#aiTable tbody");

  Array.from(e.target.files).forEach(file => {
    let row = document.createElement("tr");

    row.innerHTML = `
      <td>${file.type.includes("pdf") ? "Document" : "File"}</td>
      <td contenteditable="true">${file.name}</td>
      <td><button onclick="this.closest('tr').remove()">Delete</button></td>
    `;

    table.appendChild(row);
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
    document.querySelector("main").style.backgroundImage =
      `url(${ev.target.result})`;
  };
  reader.readAsDataURL(e.target.files[0]);
};

// SEARCH
search.oninput = function () {
  let val = this.value.toLowerCase();
  document.querySelectorAll("li").forEach(li => {
    li.style.display = li.textContent.toLowerCase().includes(val) ? "" : "none";
  });
};

// INIT
renderTasks();
renderDates();
updateClock();
 

  
  

 
