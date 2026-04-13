<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
const SUPABASE_URL = "https://bzwnjtofcduxllafdybw.supabase.co";
const SUPABASE_KEY = "sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl";

const supabaseClient = supabase.createClient("https://bzwnjtofcduxllafdybw.supabase.co", "sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl");


// PAGE SWITCH
function switchPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// CLOCK
setInterval(() => {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString();
}, 1000);

// =========================
// BOOKMARK SYSTEM
// =========================
function bookmark(page) {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

  if (!bookmarks.includes(page)) {
    bookmarks.push(page);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    renderBookmarks();
  }
}

function renderBookmarks() {
  let list = document.getElementById("bookmarkList");
  list.innerHTML = "";

  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

  bookmarks.forEach(p => {
    let li = document.createElement("li");
    li.textContent = p;
    li.onclick = () => switchPage(p);
    list.appendChild(li);
  });
}

// =========================
// CUSTOMIZATION SYSTEM
// =========================

function applySettings() {
  // FONT
  document.body.style.fontFamily = document.getElementById("fontSelect").value;

  // HEX COLOR
  let color = document.getElementById("hexInput").value || document.getElementById("colorPicker").value;
  document.body.style.backgroundColor = color;

  // SAVE SETTINGS
  let settings = {
    font: fontSelect.value,
    color: color,
    timeFormat: timeFormat.value,
    country: countrySelect.value,
    state: stateSelect.value,
    currency: currencySelect.value
  };

  localStorage.setItem("settings", JSON.stringify(settings));
}

// LOAD SETTINGS (MULTI-UPDATE SUPPORT)
function loadSettings() {
  let settings = JSON.parse(localStorage.getItem("settings"));
  if (!settings) return;

  document.body.style.fontFamily = settings.font;
  document.body.style.backgroundColor = settings.color;
}

// =========================
// INIT
// =========================
renderBookmarks();
loadSettings();
  
  

 
