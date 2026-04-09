// TASKS
function addTask() {
  const input = document.getElementById("taskInput");
  const list = document.getElementById("taskList");

  if (input.value.trim() === "") {
    showAlert("Task cannot be empty");
    return;
  }

  const li = document.createElement("li");
  li.textContent = autoCorrect(input.value);
  list.appendChild(li);

  input.value = "";
}

// DUE DATES
function addDueDate() {
  const input = document.getElementById("dueDate");
  const list = document.getElementById("dateList");

  if (!input.value) {
    showAlert("Please select a valid date");
    return;
  }

  const li = document.createElement("li");
  li.textContent = input.value;
  list.appendChild(li);
}

// CONTACTS
function addContact() {
  const input = document.getElementById("contactInput");
  const list = document.getElementById("contactList");

  if (input.value.trim() === "") {
    showAlert("Contact cannot be empty");
    return;
  }

  const li = document.createElement("li");
  li.textContent = input.value;
  list.appendChild(li);

  input.value = "";
}

// ALERT SYSTEM
function showAlert(message) {
  const alertBox = document.getElementById("alertBox");
  alertBox.textContent = message;
  alertBox.style.color = "red";
}

// SIMPLE AUTOCORRECT (basic demo)
function autoCorrect(text) {
  return text.replace(/\bi\b/g, "I");
}

// COLOR PICKER
document.getElementById("colorPicker").addEventListener("input", (e) => {
  document.body.style.backgroundColor = e.target.value;
});

// HEX INPUT
function applyHex() {
  const hex = document.getElementById("hexInput").value;
  document.body.style.backgroundColor = hex;
}

// BACKGROUND IMAGE
document.getElementById("bgUpload").addEventListener("change", function(e) {
  const reader = new FileReader();
  reader.onload = function(event) {
    document.body.style.backgroundImage = `url(${event.target.result})`;
    document.body.style.backgroundSize = "cover";
  };
  reader.readAsDataURL(e.target.files[0]);
});

// SEARCH FUNCTION
document.getElementById("searchBox").addEventListener("input", function() {
  const value = this.value.toLowerCase();
  const items = document.querySelectorAll("li");

  items.forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(value)
      ? ""
      : "none";
  });
});
 
