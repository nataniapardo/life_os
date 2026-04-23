document.addEventListener('DOMContentLoaded', () => {
    initClock();
    renderAppleStrip();
    lucide.createIcons();
});

// --- AUTHENTICATION LOGIC ---
function toggleAuthMode() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('signupForm').classList.toggle('hidden');
}

function handleAuth(type) {
    // Basic Simulation: Usually Supabase logic goes here
    console.log(`Authenticating: ${type}`);
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
}

// --- CLOCK & DATE ---
function initClock() {
    const update = () => {
        const now = new Date();
        document.getElementById('clockDisplay').textContent = now.toLocaleTimeString();
        document.getElementById('dateDisplay').textContent = now.toLocaleDateString(undefined, { 
            weekday: 'long', month: 'long', day: 'numeric' 
        });
    };
    setInterval(update, 1000);
    update();
}

// --- APPLE CALENDAR STRIP GENERATION ---
function renderAppleStrip() {
    const strip = document.getElementById('appleCalendar');
    if (!strip) return;
    
    const today = new Date();
    strip.innerHTML = '';

    for (let i = -3; i <= 10; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        
        const card = document.createElement('div');
        card.className = `calendar-day-card ${i === 0 ? 'active' : ''}`;
        card.innerHTML = `
            <span style="font-size: 0.7rem; opacity: 0.7;">${date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span style="font-size: 1.2rem; font-weight: bold;">${date.getDate()}</span>
        `;
        strip.appendChild(card);
    }
}

// --- PROFILE & AVATAR SYSTEM ---
function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
}

function openSettingsModal() {
    document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function saveProfileChanges() {
    const newName = document.getElementById('editFullName').value;
    const newImgSrc = document.getElementById('imagePreview').src;

    if (newName) document.getElementById('userNameDisplay').textContent = newName;
    if (newImgSrc) {
        const avatarImg = document.getElementById('userAvatarImg');
        avatarImg.src = newImgSrc;
        avatarImg.classList.remove('hidden');
        document.getElementById('userInitials').classList.add('hidden');
    }
    closeSettingsModal();
}

// --- NAVIGATION ---
function switchPage(pageId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${pageId}`);
    if(activeNav) activeNav.classList.add('active');
}
