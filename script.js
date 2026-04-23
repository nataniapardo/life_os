document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initClock();
    renderAppleStrip();
});

// Authentication System
function toggleAuthMode() {
    const title = document.querySelector('#loginForm h2');
    title.innerText = title.innerText === "Welcome Back" ? "Initialize System" : "Welcome Back";
}

function handleAuth(type) {
    // Simulation: In production, use Supabase here
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
}

// Clock Logic
function initClock() {
    const update = () => {
        const now = new Date();
        document.getElementById('clockDisplay').innerText = now.toLocaleTimeString();
        document.getElementById('dateDisplay').innerText = now.toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };
    setInterval(update, 1000);
    update();
}

// Apple Calendar Strip Logic
function renderAppleStrip() {
    const strip = document.getElementById('appleCalendar');
    const today = new Date();
    strip.innerHTML = '';

    for (let i = -2; i < 12; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        const card = document.createElement('div');
        card.className = `calendar-day-card ${i === 0 ? 'active' : ''}`;
        card.innerHTML = `
            <span style="font-size: 0.7rem; opacity: 0.6;">${d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span style="font-size: 1.2rem; font-weight: bold; margin-top: 5px;">${d.getDate()}</span>
        `;
        strip.appendChild(card);
    }
}

// Profile System
function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
}

function openProfileSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
}

function closeProfileSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.createElement('img');
            preview.src = e.target.result;
            preview.id = "tempPreview";
            // Store it globally for the "Save" function
            window.tempAvatar = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveProfileChanges() {
    const name = document.getElementById('editFullName').value;
    if (name) {
        document.getElementById('dynamicGreeting').innerText = `Good Afternoon, ${name}`;
        document.getElementById('userNameDisplay').innerText = name;
    }
    if (window.tempAvatar) {
        const img = document.getElementById('userAvatarImg');
        img.src = window.tempAvatar;
        img.classList.remove('hidden');
        document.getElementById('userInitials').classList.add('hidden');
    }
    closeProfileSettings();
}

// Navigation Logic
function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    
    // Update active state in sidebar
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    // (In real use, you'd add logic to find the specific LI clicked)
}

// AI Task Distribution Simulation
function smartAddTask() {
    const input = document.getElementById('aiTaskInput');
    if (!input.value) return;

    const li = document.createElement('li');
    li.style.padding = "10px";
    li.style.borderBottom = "1px solid var(--border)";
    li.innerText = input.value;

    // Simulate AI "sorting"
    if (input.value.toLowerCase().includes('urgent') || input.value.toLowerCase().includes('priority')) {
        document.getElementById('highTaskList').appendChild(li);
    } else {
        document.getElementById('midTaskList').appendChild(li);
    }
    input.value = '';
}
