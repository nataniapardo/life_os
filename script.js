const taskList = document.getElementById("taskList");
const habitList = document.getElementById("habitList");
const taskCount = document.getElementById("taskCount");
const habitCount = document.getElementById("habitCount");

const quickModal = document.getElementById("quickModal");
const openQuickAction = document.getElementById("openQuickAction");
const closeModal = document.getElementById("closeModal");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const quickTaskInput = document.getElementById("quickTaskInput");
const addTaskBtn = document.getElementById("addTaskBtn");

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

function attachCheckboxListeners() {
  document.querySelectorAll('#taskList input[type="checkbox"]').forEach(input => {
    input.addEventListener("change", updateTaskCount);
  });

  document.querySelectorAll('#habitList input[type="checkbox"]').forEach(input => {
    input.addEventListener("change", updateHabitCount);
  });
}

function addTask(taskName) {
  const li = document.createElement("li");
  li.innerHTML = `<label><input type="checkbox" /> ${taskName}</label>`;
  taskList.appendChild(li);

  const checkbox = li.querySelector('input[type="checkbox"]');
  checkbox.addEventListener("change", updateTaskCount);

  updateTaskCount();
}

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
  const taskName = quickTaskInput.value.trim();
  if (taskName) {
    addTask(taskName);
    closeQuickModal();
  }
});

quickTaskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    saveTaskBtn.click();
  }
});

quickModal.addEventListener("click", (e) => {
  if (e.target === quickModal) {
    closeQuickModal();
  }
});

attachCheckboxListeners();
updateTaskCount();
updateHabitCount();
