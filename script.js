// ------------------------------
// ELEMENTS
// ------------------------------
const dashboard = document.getElementById("dashboard");
const backgroundImageInput = document.getElementById("backgroundImage");
const backgroundColorInput = document.getElementById("backgroundColor");

const documentUpload = document.getElementById("documentUpload");
const simulateAIButton = document.getElementById("simulateAIButton");

const dueDatesList = document.getElementById("dueDatesList");
const meetingsList = document.getElementById("meetingsList");
const todoList = document.getElementById("todoList");
const contactsList = document.getElementById("contactsList");
const summaryText = document.getElementById("summaryText");

const alertBox = document.getElementById("alertBox");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResults = document.getElementById("searchResults");

const textInput = document.getElementById("textInput");
const checkTextButton = document.getElementById("checkTextButton");
const suggestionBox = document.getElementById("suggestionBox");

const timerDisplay = document.getElementById("timerDisplay");
const startTimer = document.getElementById("startTimer");
const pauseTimer = document.getElementById("pauseTimer");
const resetTimer = document.getElementById("resetTimer");

// ------------------------------
// DEMO DATA STORE
// ------------------------------
let appData = {
  dueDates: [],
  meetings: [],
  tasks: [],
  contacts: [],
  summary: ""
};

// ------------------------------
// BACKGROUND COLOR PICKER
// ------------------------------
backgroundColorInput.addEventListener("input", function () {
  dashboard.style.backgroundColor = backgroundColorInput.value;
});

// ------------------------------
// BACKGROUND IMAGE UPLOAD
// ------------------------------
backgroundImageInput.addEventListener("change", function (event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    dashboard.style.backgroundImage = `url('${e.target.result}')`;
  };
  reader.readAsDataURL(file);
});

// ------------------------------
// ALERT HANDLER
// ------------------------------
function showAlert(message, isError = false) {
  alertBox.classList.remove("hidden");
  alertBox.textContent = message;

  if (isError) {
    alertBox.style.background = "#fee2e2";
    alertBox.style.color = "#991b1b";
    alertBox.style.border = "1px solid #ef4444";
  } else {
    alertBox.style.background = "#fef3c7";
    alertBox.style.color = "#92400e";
    alertBox.style.border = "1px solid #f59e0b";
  }
}

// ------------------------------
// RENDER HELPERS
// ------------------------------
function renderList(listElement, items, fallbackText) {
  listElement.innerHTML = "";

  if (items.length === 0) {
    const li = document.createElement("li");
    li.textContent = fallbackText;
    listElement.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    listElement.appendChild(li);
  });
}

function renderDashboard() {
  renderList(dueDatesList, appData.dueDates, "No due dates yet");
  renderList(meetingsList, appData.meetings, "No meetings yet");
  renderList(todoList, appData.tasks, "No tasks yet");
  renderList(contactsList, appData.contacts, "No contacts yet");

  summaryText.textContent =
    appData.summary ||
    "Upload a file and click “Simulate AI Extraction & Auto-Placement” to see how information can be organized automatically.";
}

// ------------------------------
// AI EXTRACTION SIMULATION
// ------------------------------
simulateAIButton.addEventListener("click", function () {
  if (!documentUpload.files.length) {
    showAlert("Please upload a document or file before running AI extraction.", true);
    return;
  }

  const file = documentUpload.files[0];
  const fileName = file.name.toLowerCase();

  // Demo AI-generated extracted content
  appData = {
    dueDates: [
      "Project Proposal Due — April 15, 2026",
      "Client Presentation Due — April 22, 2026",
      "Portfolio Submission Due — May 1, 2026"
    ],
    meetings: [
      "Zoom Meeting with Hiring Manager — April 12, 2026 at 10:00 AM",
      "In-Person Team Sync at Office — April 16, 2026 at 2:00 PM",
      "LinkedIn Recruiter Call — April 18, 2026 at 11:30 AM"
    ],
    tasks: [
      "Review uploaded planning documents",
      "Finalize deliverables for this week",
      "Prepare talking points for recruiter call",
      "Organize calendar tasks by priority",
      "Complete 2 Pomodoro sessions for focused work"
    ],
    contacts: [
      "Recruiter: Jordan Lee — jordan.lee@company.com",
      "Hiring Manager: Taylor Morgan — taylor.morgan@company.com",
      "Board Director (Public Contact): Chris Patel — chris.patel@company.com"
    ],
    summary:
      `AI successfully analyzed "${file.name}" and auto-placed extracted information into due dates, meetings, tasks, and professional contacts. In a production version, AI would extract structured content from ${fileName.endsWith(".pdf") ? "a PDF" : "the uploaded file"} and map it into the correct planning sections automatically.`
  };

  renderDashboard();
  showAlert("AI extraction completed. Information has been automatically organized into the appropriate sections.");
});

// ------------------------------
// KEYWORD / SYNONYM SEARCH
// ------------------------------
const synonymMap = {
  deadline: ["due date", "submission", "deliverable"],
  "due date": ["deadline", "submission", "deliverable"],
  meeting: ["call", "zoom", "sync"],
  recruiter: ["hiring manager", "talent", "employer"],
  task: ["to-do", "todo", "action item"]
};

searchButton.addEventListener("click", function () {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    showAlert("Please enter a keyword or synonym to search.", true);
    return;
  }

  const searchTerms = new Set([query]);

  if (synonymMap[query]) {
    synonymMap[query].forEach((term) => searchTerms.add(term));
  }

  // Reverse synonym support
  Object.keys(synonymMap).forEach((key) => {
    if (synonymMap[key].includes(query)) {
      searchTerms.add(key);
      synonymMap[key].forEach((term) => searchTerms.add(term));
    }
  });

  const allItems = [
    ...appData.dueDates,
    ...appData.meetings,
    ...appData.tasks,
    ...appData.contacts
  ];

  const matches = allItems.filter((item) => {
    const itemText = item.toLowerCase();
    return Array.from(searchTerms).some((term) => itemText.includes(term));
  });

  searchResults.innerHTML = "";

  if (matches.length === 0) {
    searchResults.innerHTML = "<p>No matching results found.</p>";
    showAlert("Search completed. No matching results were found.");
    return;
  }

  matches.forEach((match) => {
    const p = document.createElement("p");
    p.textContent = "• " + match;
    searchResults.appendChild(p);
  });

  showAlert("Search completed successfully.");
});

// ------------------------------
// SPELLING / GRAMMAR SUGGESTION SIMULATION
// ------------------------------
checkTextButton.addEventListener("click", function () {
  let text = textInput.value.trim();

  if (!text) {
    suggestionBox.textContent = "Enter text to receive suggestions.";
    showAlert("Please enter text before checking spelling and grammar.", true);
    return;
  }

  let correctedText = text;

  const replacements = [
    { wrong: /\bmeting\b/gi, correct: "meeting" },
    { wrong: /\btomorow\b/gi, correct: "tomorrow" },
    { wrong: /\brecruter\b/gi, correct: "recruiter" },
    { wrong: /\bdosumnets\b/gi, correct: "documents" },
    { wrong: /\bartifical\b/gi, correct: "artificial" }
  ];

  replacements.forEach((item) => {
    correctedText = correctedText.replace(item.wrong, item.correct);
  });

  if (correctedText !== text) {
    suggestionBox.innerHTML = `
      <strong>Suggested Correction:</strong><br />
      ${correctedText}
    `;
    showAlert("Suggestions generated. Review the corrected text.");
  } else {
    suggestionBox.innerHTML = `
      <strong>No obvious issues found.</strong><br />
      Your text looks good in this demo.
    `;
    showAlert("Text checked successfully.");
  }
});

// ------------------------------
// POMODORO TIMER
// ------------------------------
let totalSeconds = 25 * 60;
let timerInterval = null;

function updateTimerDisplay() {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  timerDisplay.textContent =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

startTimer.addEventListener("click", function () {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      showAlert("Pomodoro session complete!");
    }
  }, 1000);
});

pauseTimer.addEventListener("click", function () {
  clearInterval(timerInterval);
  timerInterval = null;
});

resetTimer.addEventListener("click", function () {
  clearInterval(timerInterval);
  timerInterval = null;
  totalSeconds = 25 * 60;
  updateTimerDisplay();
});

// ------------------------------
// INITIAL RENDER
// ------------------------------
renderDashboard();
updateTimerDisplay();
 
