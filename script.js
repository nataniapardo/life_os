/* ============================================================
   LIFE OS — script.js
   Full feature set: Tasks, Calendar, Pomodoro, Basic Timer,
   Groceries, Budget, Journal, Mood, Planner, Notifications,
   Recently Deleted, Overdue Alerts, Calculator, Charts
   ============================================================ */

'use strict';

// ════════════════════════════════════════════════════════════
// GLOBAL STATE
// ════════════════════════════════════════════════════════════
let isMilitaryTime = false;
let currentFilter  = 'all';
let currentSort    = 'date';
let calYear, calMonth;
let selectedCalDate = null;
let activeOverdueTask = null;

// Pomodoro
let pomoInterval   = null;
let pomoRunning    = false;
let pomoMode       = 'work';          // 'work' | 'short' | 'long'
let pomoSecondsLeft = 25 * 60;
let pomoTotalSeconds = 25 * 60;
let pomoSession    = 1;
let pomoTodaySessions = 0;
let pomoTodayMins  = 0;

// Basic Timer
let basicInterval  = null;
let basicRunning   = false;
let basicSecondsLeft = 0;
let basicTotalSecs = 0;

// Calculator
let calcExpression = '';
let calcJustEvaled = false;

// Charts (Chart.js instances — kept so we can destroy/redraw)
let taskPieChartInst   = null;
let groceryChartInst   = null;
let budgetChartInst    = null;
let moodChartInst      = null;

// ════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ════════════════════════════════════════════════════════════
const S = {
  get: (k, def = [])  => { try { return JSON.parse(localStorage.getItem('lifeos_' + k)) ?? def; } catch { return def; } },
  set: (k, v)         => localStorage.setItem('lifeos_' + k, JSON.stringify(v)),
  str: (k, def = '')  => localStorage.getItem('lifeos_' + k) ?? def,
  setStr: (k, v)      => localStorage.setItem('lifeos_' + k, v),
};

// Live data arrays (loaded on boot)
let tasks        = S.get('tasks',     []);
let deletedItems = S.get('deleted',   []);
let groceries    = S.get('groceries', []);
let budgetEntries= S.get('budget',    []);
let journalEntries=S.get('journal',   []);
let moodLogs     = S.get('mood',      []);
let dailyGoals   = S.get('dailyGoals',[]);
let affirmations = S.get('affirmations',[]);
let notifications= S.get('notifs',   []);
let userName     = S.str('name', 'Operator');

// ════════════════════════════════════════════════════════════
// BOOT
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  // Restore accent color
  const color = S.str('color', '#00f2ff');
  document.documentElement.style.setProperty('--neon-color', color);
  const ci = document.getElementById('themeColorInput');
  if (ci) ci.value = color;

  // Init calendar to current month
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();

  initClock();
  updateGreeting();
  renderDashStats();
  renderTasks();
  renderCalendar();
  renderNotifPanel();
  seedMockData();

  // Close dropdowns on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.profile-group'))  closeEl('profileMenu');
    if (!e.target.closest('.notif-wrap'))     closeEl('notifPanel');
  });

  // Check overdue tasks every minute
  checkOverdueTasks();
  setInterval(checkOverdueTasks, 60000);

  // Keyboard shortcut ⌘K / Ctrl+K placeholder
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') e.preventDefault();
  });
});

// ════════════════════════════════════════════════════════════
// MOCK DATA SEED (runs once)
// ════════════════════════════════════════════════════════════
function seedMockData() {
  // Groceries mock
  if (groceries.length === 0) {
    groceries = [
      { id: 1, name: 'Whole Milk',        qty: 2, cat: 'Dairy',     checked: false },
      { id: 2, name: 'Sourdough Bread',   qty: 1, cat: 'Bakery',    checked: false },
      { id: 3, name: 'Chicken Breast',    qty: 3, cat: 'Meat',      checked: false },
      { id: 4, name: 'Broccoli',          qty: 2, cat: 'Produce',   checked: false },
      { id: 5, name: 'Orange Juice',      qty: 1, cat: 'Beverages', checked: true  },
      { id: 6, name: 'Pasta',             qty: 2, cat: 'Pantry',    checked: false },
      { id: 7, name: 'Greek Yogurt',      qty: 4, cat: 'Dairy',     checked: false },
      { id: 8, name: 'Frozen Pizza',      qty: 2, cat: 'Frozen',    checked: false },
    ];
    S.set('groceries', groceries);
  }

  // Budget mock
  if (budgetEntries.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    budgetEntries = [
      { id: 1, type: 'income',  desc: 'Monthly Salary',      amt: 4500, cat: 'Salary',        date: today },
      { id: 2, type: 'expense', desc: 'Rent',                amt: 1200, cat: 'Housing',        date: today },
      { id: 3, type: 'expense', desc: 'Groceries',           amt: 320,  cat: 'Food',           date: today },
      { id: 4, type: 'expense', desc: 'Netflix + Spotify',   amt: 28,   cat: 'Entertainment',  date: today },
      { id: 5, type: 'expense', desc: 'Gym Membership',      amt: 45,   cat: 'Health',         date: today },
      { id: 6, type: 'income',  desc: 'Freelance Project',   amt: 850,  cat: 'Salary',         date: today },
      { id: 7, type: 'expense', desc: 'Gas & Transport',     amt: 110,  cat: 'Transport',      date: today },
      { id: 8, type: 'expense', desc: 'Savings Contribution',amt: 500,  cat: 'Savings',        date: today },
    ];
    S.set('budget', budgetEntries);
  }

  // Mood mock
  if (moodLogs.length === 0) {
    const moodLabels = ['Difficult','Low','Neutral','Good','Excellent'];
    const moodIcons  = ['cloud-rain','cloud','minus-circle','smile','sun'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const score = Math.floor(Math.random() * 5) + 1;
      moodLogs.push({
        id: Date.now() + i,
        score,
        label: moodLabels[score - 1],
        icon:  moodIcons[score - 1],
        note:  i === 0 ? 'Feeling productive today.' : '',
        date:  d.toISOString().split('T')[0],
      });
    }
    S.set('mood', moodLogs);
  }

  // Affirmations mock
  if (affirmations.length === 0) {
    affirmations = [
      { id: 1, text: 'I am capable of achieving everything I set my mind to.' },
      { id: 2, text: 'Every day I grow stronger, wiser, and more focused.' },
      { id: 3, text: 'I attract success through consistency and discipline.' },
    ];
    S.set('affirmations', affirmations);
  }

  renderGroceries();
  renderBudget();
  renderMoodHistory();
  renderPlannerView();
  renderAffirmationDisplay();
}

// ════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ════════════════════════════════════════════════════════════
function showToast(msg, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconMap = { info: 'info', success: 'check-circle', error: 'alert-circle', warning: 'alert-triangle' };
  toast.innerHTML = `<i data-lucide="${iconMap[type] || 'info'}" style="width:16px;height:16px;flex-shrink:0;"></i><span>${msg}</span>`;
  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ════════════════════════════════════════════════════════════
// BELL NOTIFICATIONS
// ════════════════════════════════════════════════════════════
function addNotification(title, body, icon = 'bell') {
  const notif = {
    id:    Date.now(),
    title,
    body,
    icon,
    time:  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    read:  false,
  };
  notifications.unshift(notif);
  if (notifications.length > 50) notifications.pop();
  S.set('notifs', notifications);
  renderNotifPanel();
  showToast(title, 'info');
}

function renderNotifPanel() {
  const list  = document.getElementById('notifList');
  const badge = document.getElementById('notifBadge');
  if (!list) return;

  const unread = notifications.filter(n => !n.read).length;
  if (badge) {
    badge.textContent = unread;
    badge.classList.toggle('hidden', unread === 0);
  }

  if (notifications.length === 0) {
    list.innerHTML = '<div class="notif-empty">No notifications</div>';
    return;
  }

  list.innerHTML = notifications.map(n => `
    <div class="notif-item" onclick="markNotifRead(${n.id})" style="${n.read ? 'opacity:.55' : ''}">
      <div class="notif-item-icon"><i data-lucide="${n.icon}" style="width:14px;height:14px;"></i></div>
      <div class="notif-item-body">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-note" style="font-size:.75rem;color:var(--text-muted);">${n.body}</div>
        <div class="notif-item-time">${n.time}</div>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

window.markNotifRead = id => {
  const n = notifications.find(x => x.id === id);
  if (n) { n.read = true; S.set('notifs', notifications); renderNotifPanel(); }
};

window.clearAllNotifs = () => {
  notifications = [];
  S.set('notifs', notifications);
  renderNotifPanel();
};

window.toggleNotifPanel = e => {
  e.stopPropagation();
  const panel = document.getElementById('notifPanel');
  const isHidden = panel.classList.contains('hidden');
  closeEl('profileMenu');
  panel.classList.toggle('hidden', !isHidden);
  // Mark all read when opened
  if (isHidden) {
    notifications.forEach(n => n.read = true);
    S.set('notifs', notifications);
    renderNotifPanel();
  }
};

// ════════════════════════════════════════════════════════════
// CLOCK & GREETING
// ════════════════════════════════════════════════════════════
function initClock() {
  const tick = () => {
    const now  = new Date();
    const cEl  = document.getElementById('clockDisplay');
    const dEl  = document.getElementById('dateDisplay');
    if (cEl) cEl.textContent = isMilitaryTime
      ? now.toLocaleTimeString('en-GB')
      : now.toLocaleTimeString('en-US');
    if (dEl) dEl.textContent = now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  };
  tick();
  setInterval(tick, 1000);
}
window.toggleMilitaryTime = () => { isMilitaryTime = !isMilitaryTime; };

function updateGreeting() {
  const el = document.getElementById('dynamicGreeting');
  if (!el) return;
  const h = new Date().getHours();
  const g = h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
  el.textContent = `${g}, ${userName}`;
}

window.updateUserName = () => {
  const input = document.getElementById('userNameInput');
  if (input?.value.trim()) {
    userName = input.value.trim();
    S.setStr('name', userName);
    updateGreeting();
    input.value = '';
    showToast('Display name updated.', 'success');
  }
};

// ════════════════════════════════════════════════════════════
// THEME & FONTS
// ════════════════════════════════════════════════════════════
window.manualThemeToggle = () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  const icon = document.getElementById('themeIcon');
  if (icon) { icon.setAttribute('data-lucide', isLight ? 'sun' : 'moon'); lucide.createIcons(); }
};

window.changeSystemColor = color => {
  document.documentElement.style.setProperty('--neon-color', color);
  S.setStr('color', color);
  // Redraw charts with new color
  if (taskPieChartInst)  { renderTaskPieChart(); }
  if (budgetChartInst)   { renderBudgetChart(); }
  if (groceryChartInst)  { renderGroceryChart(); }
  if (moodChartInst)     { renderMoodChart(); }
};

window.changeFont = fontFamily => { document.body.style.fontFamily = fontFamily; };

// ════════════════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════════════════
window.switchView = viewId => {
  document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
  document.getElementById(viewId + 'View')?.classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', !!item.getAttribute('onclick')?.includes(`'${viewId}'`));
  });

  const crumb = document.getElementById('breadcrumb');
  if (crumb) crumb.textContent = viewId.charAt(0).toUpperCase() + viewId.slice(1);

  if (viewId === 'calendar') renderCalendar();
  if (viewId === 'todo')     { renderTasks(); renderTaskPieChart(); }
  if (viewId === 'dashboard') renderDashStats();
  closeDropdowns();
};

window.switchModule = modId => {
  switchView('module');
  document.querySelectorAll('.module-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('mod-' + modId)?.classList.remove('hidden');

  const crumb = document.getElementById('breadcrumb');
  const labels = { groceries:'Groceries', budget:'Budget', journal:'Journal', mood:'Mood Tracker', planner:'Planner' };
  if (crumb) crumb.textContent = labels[modId] || modId;

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', !!item.getAttribute('onclick')?.includes(`'${modId}'`));
  });

  if (modId === 'groceries') { renderGroceries(); renderGroceryChart(); }
  if (modId === 'budget')    { renderBudget(); renderBudgetChart(); }
  if (modId === 'journal')   renderJournal();
  if (modId === 'mood')      { renderMoodHistory(); renderMoodChart(); }
  if (modId === 'planner')   renderPlannerView();
  closeDropdowns();
};

window.closeDropdowns = () => { closeEl('profileMenu'); closeEl('notifPanel'); };

function closeEl(id) {
  document.getElementById(id)?.classList.add('hidden');
}

window.toggleProfileMenu = e => {
  e.stopPropagation();
  const menu = document.getElementById('profileMenu');
  const isHidden = menu.classList.contains('hidden');
  closeEl('notifPanel');
  menu.classList.toggle('hidden', !isHidden);
};

// ════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ════════════════════════════════════════════════════════════
function renderDashStats() {
  const today = new Date().toISOString().split('T')[0];
  const open    = tasks.filter(t => !t.completed).length;
  const done    = tasks.filter(t => t.completed).length;
  const dueToday= tasks.filter(t => !t.completed && t.date === today).length;
  const overdue = tasks.filter(t => !t.completed && t.date && t.date < today).length;

  setText('statOpen',    open);
  setText('statDone',    done);
  setText('statToday',   dueToday);
  setText('statOverdue', overdue);
}

// ════════════════════════════════════════════════════════════
// AI PARSER
// ════════════════════════════════════════════════════════════
window.organizeWithAI = () => {
  const raw = document.getElementById('aiInput').value.trim();
  if (!raw) { showToast('Please enter some text first.', 'warning'); return; }

  const lines = raw.split('\n').filter(l => l.trim());
  let count = 0;

  lines.forEach(line => {
    const text = line.trim();
    if (!text) return;
    tasks.push({
      id:        uid(),
      name:      text,
      date:      extractDate(text),
      time:      extractTime(text),
      priority:  detectPriority(text),
      completed: false,
      notes:     '',
    });
    count++;
  });

  saveTasks();
  document.getElementById('aiInput').value = '';
  showToast(`${count} task${count !== 1 ? 's' : ''} added.`, 'success');
  renderDashStats();
  addNotification('AI Organised Tasks', `${count} task${count !== 1 ? 's' : ''} added to your list.`, 'sparkles');
};

function detectPriority(text) {
  const t = text.toLowerCase();
  if (/\b(urgent|critical|asap|meeting|appointment|deadline|board)\b/.test(t)) return 'high';
  if (/\b(walk|hobby|leisure|game|relax|cleaning|watch|read|groceries)\b/.test(t)) return 'low';
  return 'medium';
}
function extractTime(text) {
  const m = text.match(/\b(\d{1,2})(:\d{2})?\s?(am|pm)\b/i);
  return m ? m[0] : '';
}
function extractDate(text) {
  const t = text.toLowerCase();
  const today = new Date();
  if (t.includes('today'))    return fmtDate(today);
  if (t.includes('tomorrow')) { const d = new Date(today); d.setDate(d.getDate()+1); return fmtDate(d); }
  const months = ['january','february','march','april','may','june',
                  'july','august','september','october','november','december'];
  for (let i = 0; i < months.length; i++) {
    if (t.includes(months[i])) {
      const day = text.match(/\d+/);
      if (day) return `${today.getFullYear()}-${pad(i+1)}-${pad(+day[0])}`;
    }
  }
  // "next monday" etc.
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  for (let i = 0; i < days.length; i++) {
    if (t.includes('next ' + days[i])) {
      const d = new Date(today);
      const diff = (i - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      return fmtDate(d);
    }
  }
  return '';
}

// ════════════════════════════════════════════════════════════
// TASKS
// ════════════════════════════════════════════════════════════
window.openTaskModal = () => {
  document.getElementById('taskModalTitle').textContent = 'New Task';
  document.getElementById('taskNameInput').value  = '';
  document.getElementById('taskDateInput').value  = '';
  document.getElementById('taskPriorityInput').value = 'medium';
  openModal();
};

window.openModal  = () => document.getElementById('quickModal').classList.remove('hidden');
window.closeModal = () => document.getElementById('quickModal').classList.add('hidden');

window.saveNewTask = () => {
  const name = document.getElementById('taskNameInput').value.trim();
  if (!name) { showToast('Please enter a task name.', 'warning'); return; }
  const date     = document.getElementById('taskDateInput').value;
  const priority = document.getElementById('taskPriorityInput').value;
  tasks.push({ id: uid(), name, date, priority, completed: false, notes: '' });
  saveTasks();
  closeModal();
  renderTasks();
  renderCalendar();
  renderDashStats();
  showToast('Task saved.', 'success');
};

window.toggleTask = id => {
  const t = tasks.find(t => t.id === id);
  if (t) { t.completed = !t.completed; saveTasks(); renderTasks(); renderDashStats(); }
};

window.deleteTask = id => {
  const t = tasks.find(t => t.id === id);
  if (t) {
    softDelete({ type: 'task', item: t });
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    renderCalendar();
    renderDashStats();
    showToast('Task moved to Recently Deleted.', 'info');
  }
};

window.filterTasks = (filter, btn) => {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
};

window.sortTasks = (sort, btn) => {
  currentSort = sort;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  renderTasks();
};

function getFilteredTasks() {
  const today = new Date().toISOString().split('T')[0];
  let list = [...tasks];
  if (currentFilter === 'high')    list = list.filter(t => t.priority === 'high' && !t.completed);
  if (currentFilter === 'medium')  list = list.filter(t => t.priority === 'medium' && !t.completed);
  if (currentFilter === 'low')     list = list.filter(t => t.priority === 'low' && !t.completed);
  if (currentFilter === 'done')    list = list.filter(t => t.completed);
  if (currentFilter === 'overdue') list = list.filter(t => !t.completed && t.date && t.date < today);

  if (currentSort === 'date')     list.sort((a,b) => (a.date||'9999') > (b.date||'9999') ? 1 : -1);
  if (currentSort === 'priority') {
    const p = { high:0, medium:1, low:2 };
    list.sort((a,b) => (p[a.priority]||1) - (p[b.priority]||1));
  }
  if (currentSort === 'name') list.sort((a,b) => a.name.localeCompare(b.name));
  return list;
}

function renderTasks() {
  const list = document.getElementById('todoListElement');
  if (!list) return;
  const filtered = getFilteredTasks();
  const today = new Date().toISOString().split('T')[0];

  if (filtered.length === 0) {
    list.innerHTML = '<li style="padding:20px;opacity:.5;font-family:var(--font-mono);font-size:.82rem;">No tasks found.</li>';
  } else {
    list.innerHTML = filtered.map(t => {
      const isOverdue = !t.completed && t.date && t.date < today;
      return `
        <li class="priority-${t.priority}${t.completed ? ' completed' : ''}${isOverdue ? ' overdue-task' : ''}">
          <div style="display:flex;align-items:flex-start;gap:10px;flex:1;min-width:0;">
            <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask(${t.id})"
              style="margin-top:3px;accent-color:var(--neon-color);flex-shrink:0;">
            <span class="${t.completed ? 'strikethrough' : ''}" style="word-break:break-word;flex:1;">
              <span style="opacity:.45;font-size:.72rem;font-family:var(--font-mono);">[${(t.priority||'MED').toUpperCase()}]</span>
              ${escHtml(t.name)}
              ${t.date ? `<span style="display:block;font-size:.72rem;font-family:var(--font-mono);color:${isOverdue ? 'var(--danger)' : 'var(--text-muted)'};">${isOverdue ? 'OVERDUE — ' : ''}${t.date}</span>` : ''}
            </span>
          </div>
          <button class="delete-btn" onclick="deleteTask(${t.id})">
            <i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:middle;"></i>
          </button>
        </li>`;
    }).join('');
  }

  // Progress bar
  const total = tasks.length;
  const done  = tasks.filter(t => t.completed).length;
  const pct   = total ? Math.round((done/total)*100) : 0;
  const fill  = document.getElementById('taskProgFill');
  const label = document.getElementById('taskProgLabel');
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = `${done} / ${total} complete`;

  // Stats panel
  const statsEl = document.getElementById('taskStatsPanel');
  if (statsEl) {
    const overdue = tasks.filter(t => !t.completed && t.date && t.date < new Date().toISOString().split('T')[0]).length;
    statsEl.innerHTML = `
      <div class="ts-row"><span>Total</span><strong>${total}</strong></div>
      <div class="ts-row"><span style="color:var(--danger)">High</span><strong>${tasks.filter(t=>t.priority==='high').length}</strong></div>
      <div class="ts-row"><span style="color:var(--warning)">Medium</span><strong>${tasks.filter(t=>t.priority==='medium').length}</strong></div>
      <div class="ts-row"><span style="color:var(--success)">Low</span><strong>${tasks.filter(t=>t.priority==='low').length}</strong></div>
      <div class="ts-row"><span style="color:var(--danger)">Overdue</span><strong>${overdue}</strong></div>
      <div class="ts-row"><span style="color:var(--neon-color)">Done</span><strong>${done}</strong></div>`;
  }

  lucide.createIcons();
  renderTaskPieChart();
  updateTaskBadge();
}

function updateTaskBadge() {
  const open = tasks.filter(t => !t.completed).length;
  // Could add badge to sidebar nav item — handled via stats
}

function saveTasks() { S.set('tasks', tasks); }

// ════════════════════════════════════════════════════════════
// TASK PIE CHART
// ════════════════════════════════════════════════════════════
function renderTaskPieChart() {
  const canvas = document.getElementById('taskPieChart');
  if (!canvas) return;
  const done   = tasks.filter(t => t.completed).length;
  const open   = tasks.filter(t => !t.completed).length;
  const neon   = getComputedStyle(document.documentElement).getPropertyValue('--neon-color').trim() || '#00f2ff';

  if (taskPieChartInst) taskPieChartInst.destroy();
  taskPieChartInst = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Completed','Open'],
      datasets: [{ data: [done, open], backgroundColor: [neon, 'rgba(255,255,255,0.08)'], borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { labels: { color: '#e6f1ff', font: { size: 12 } } } },
      cutout: '68%',
    }
  });
}

// ════════════════════════════════════════════════════════════
// CALENDAR
// ════════════════════════════════════════════════════════════
window.changeMonth = dir => {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0;  calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  renderCalendar();
};

window.goToToday = () => {
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();
  renderCalendar();
};

function renderCalendar() {
  const grid    = document.getElementById('calendarGrid');
  const titleEl = document.getElementById('currentMonthName');
  if (!grid || !titleEl) return;

  titleEl.textContent = new Date(calYear, calMonth).toLocaleString('default', { month:'long', year:'numeric' });
  grid.innerHTML = '';

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayStr    = new Date().toISOString().split('T')[0];

  // Empty leading cells
  for (let e = 0; e < firstDay; e++) {
    const empty = document.createElement('div');
    empty.className = 'day-box empty-cell';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr  = `${calYear}-${pad(calMonth+1)}-${pad(d)}`;
    const dayTasks = tasks.filter(t => t.date === dateStr);

    // Budget entries for this day
    const dayBudget = budgetEntries.filter(b => b.date === dateStr);

    const box = document.createElement('div');
    box.className = 'day-box' +
      (dateStr === todayStr       ? ' today'    : '') +
      (dateStr === selectedCalDate ? ' selected' : '');
    box.onclick = () => selectCalDay(dateStr);

    let html = `<span class="day-num">${d}</span>`;

    // Show task names as chips (max 3)
    const shown = dayTasks.slice(0, 3);
    shown.forEach(t => {
      html += `<span class="day-task-chip ${t.priority}">${escHtml(t.name)}</span>`;
    });
    if (dayTasks.length > 3) {
      html += `<span class="day-task-chip" style="opacity:.5;">+${dayTasks.length - 3} more</span>`;
    }

    // Budget dot
    if (dayBudget.length > 0) {
      html += `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--success);margin-top:3px;"></span>`;
    }

    box.innerHTML = html;
    grid.appendChild(box);
  }
}

function selectCalDay(dateStr) {
  selectedCalDate = dateStr;
  renderCalendar();

  const panel   = document.getElementById('calSelectedPanel');
  const titleEl = document.getElementById('cspTitle');
  const tasksEl = document.getElementById('cspTasks');
  const budgEl  = document.getElementById('cspBudget');

  const dayTasks  = tasks.filter(t => t.date === dateStr);
  const dayBudget = budgetEntries.filter(b => b.date === dateStr);

  if (panel) panel.classList.remove('hidden');
  if (titleEl) {
    const d = new Date(dateStr + 'T00:00:00');
    titleEl.textContent = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  }

  if (tasksEl) {
    tasksEl.innerHTML = dayTasks.length === 0
      ? '<div style="opacity:.5;font-size:.85rem;font-family:var(--font-mono);">No tasks for this day.</div>'
      : dayTasks.map(t => `
          <div class="csp-task-item">
            <span style="width:8px;height:8px;border-radius:50%;background:${t.priority==='high'?'var(--danger)':t.priority==='low'?'var(--success)':'var(--warning)'};flex-shrink:0;display:inline-block;"></span>
            <span>${escHtml(t.name)}</span>
          </div>`).join('');
  }

  if (budgEl) {
    budgEl.innerHTML = dayBudget.length === 0
      ? '<span style="opacity:.5;">No budget entries.</span>'
      : dayBudget.map(b => `
          <div style="display:flex;justify-content:space-between;font-size:.82rem;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05);">
            <span>${escHtml(b.desc)} <span style="opacity:.5;font-size:.72rem;">${b.cat}</span></span>
            <span style="color:${b.type==='income'?'var(--success)':'var(--danger)'};">${b.type==='income'?'+':'-'}$${(+b.amt).toFixed(2)}</span>
          </div>`).join('');
  }
}

// ════════════════════════════════════════════════════════════
// OVERDUE TASK DETECTION
// ════════════════════════════════════════════════════════════
function checkOverdueTasks() {
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => !t.completed && t.date && t.date < today && !t.overdueHandled);

  if (overdueTasks.length > 0) {
    const t = overdueTasks[0]; // Handle one at a time
    activeOverdueTask = t;
    const modal   = document.getElementById('overdueModal');
    const titleEl = document.getElementById('overdueModalTitle');
    const msgEl   = document.getElementById('overdueModalMsg');
    if (modal && titleEl && msgEl) {
      titleEl.textContent = 'Task Overdue';
      msgEl.textContent   = `"${t.name}" was due on ${t.date}. What would you like to do?`;
      modal.classList.remove('hidden');
    }
    addNotification('Overdue Task', `"${t.name}" missed its due date.`, 'alert-circle');
  }
}

window.resolveOverdue = action => {
  if (!activeOverdueTask) return;
  const today  = new Date();
  const newDateInput = document.getElementById('overdueNewDate');
  const confirmBtn   = document.getElementById('overdueConfirmNew');

  if (action === 'suggest') {
    // Suggest tomorrow
    const tom = new Date(today);
    tom.setDate(tom.getDate() + 1);
    activeOverdueTask.date = fmtDate(tom);
    activeOverdueTask.overdueHandled = false;
    finishOverdueResolve(`Task rescheduled to ${activeOverdueTask.date}.`);

  } else if (action === 'nextweek') {
    const nw = new Date(today);
    nw.setDate(nw.getDate() + 7);
    activeOverdueTask.date = fmtDate(nw);
    activeOverdueTask.overdueHandled = false;
    finishOverdueResolve(`Task moved to ${activeOverdueTask.date}.`);

  } else if (action === 'new') {
    // Show date picker
    if (newDateInput) {
      newDateInput.style.display = 'block';
      newDateInput.value = '';
    }
    if (confirmBtn) confirmBtn.classList.remove('hidden');
  }
};

window.confirmNewDate = () => {
  const newDateInput = document.getElementById('overdueNewDate');
  const newDate      = newDateInput?.value;
  if (!newDate) { showToast('Please pick a date.', 'warning'); return; }
  if (activeOverdueTask) {
    activeOverdueTask.date = newDate;
    activeOverdueTask.overdueHandled = false;
    finishOverdueResolve(`Task rescheduled to ${newDate}.`);
  }
};

function finishOverdueResolve(msg) {
  saveTasks();
  renderTasks();
  renderCalendar();
  renderDashStats();
  showToast(msg, 'success');
  activeOverdueTask = null;
  document.getElementById('overdueModal').classList.add('hidden');
  const newDateInput = document.getElementById('overdueNewDate');
  const confirmBtn   = document.getElementById('overdueConfirmNew');
  if (newDateInput) newDateInput.style.display = 'none';
  if (confirmBtn)   confirmBtn.classList.add('hidden');
}

// ════════════════════════════════════════════════════════════
// POMODORO TIMER
// ════════════════════════════════════════════════════════════
function getPomoLengths() {
  return {
    work:  (+document.getElementById('pomoWorkLen')?.value  || 25) * 60,
    short: (+document.getElementById('pomoShortLen')?.value || 5)  * 60,
    long:  (+document.getElementById('pomoLongLen')?.value  || 15) * 60,
  };
}

window.setPomoMode = (mode, btn) => {
  pomoMode = mode;
  document.querySelectorAll('.pomo-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  resetPomo();
};

window.togglePomo = () => {
  if (pomoRunning) {
    clearInterval(pomoInterval);
    pomoRunning = false;
    setIcon('pomoPlayIcon', 'play');
  } else {
    pomoRunning = true;
    setIcon('pomoPlayIcon', 'pause');
    pomoInterval = setInterval(pomoTick, 1000);
  }
};

function pomoTick() {
  if (pomoSecondsLeft <= 0) {
    clearInterval(pomoInterval);
    pomoRunning = false;
    setIcon('pomoPlayIcon', 'play');
    onPomoComplete();
    return;
  }
  pomoSecondsLeft--;
  updatePomoDisplay();
}

function updatePomoDisplay() {
  const el = document.getElementById('pomoDisplay');
  if (el) el.textContent = formatTime(pomoSecondsLeft);

  const ring = document.getElementById('pomoRing');
  if (ring) {
    const total = pomoTotalSeconds || 1;
    const pct   = pomoSecondsLeft / total;
    const circ  = 2 * Math.PI * 96; // r=96
    ring.style.strokeDashoffset = circ * (1 - pct);
  }
}

function onPomoComplete() {
  const modeLabel = document.getElementById('pomoModeLabel');

  if (pomoMode === 'work') {
    pomoTodaySessions++;
    pomoTodayMins += Math.round(getPomoLengths().work / 60);
    setText('pomoTodaySessions', pomoTodaySessions);
    setText('pomoTodayMins', pomoTodayMins);

    const autoBreak = document.getElementById('pomoAutoBreak')?.checked;
    showToast('Focus session complete! Time for a break.', 'success');
    addNotification('Pomodoro Complete', `Focus session ${pomoSession} done. Take a break!`, 'timer');

    const nextMode = (pomoSession % 4 === 0) ? 'long' : 'short';
    if (pomoSession % 4 === 0) pomoSession = 1; else pomoSession++;
    setText('pomoSessionNum', pomoSession);

    if (autoBreak) switchPomoModeSilent(nextMode);

  } else {
    showToast('Break over — time to focus!', 'info');
    addNotification('Break Ended', 'Your break is over. Ready to focus?', 'play');
    if (document.getElementById('pomoAutoBreak')?.checked) {
      switchPomoModeSilent('work');
    }
  }

  updateBreakLabel();
  playBeep();
}

function switchPomoModeSilent(mode) {
  pomoMode = mode;
  document.querySelectorAll('.pomo-tab').forEach((b, i) => {
    b.classList.toggle('active', ['work','short','long'][i] === mode);
  });
  resetPomo();
  // Auto-start
  setTimeout(() => { if (!pomoRunning) window.togglePomo(); }, 800);
}

window.resetPomo = () => {
  clearInterval(pomoInterval);
  pomoRunning = false;
  setIcon('pomoPlayIcon', 'play');
  const lengths = getPomoLengths();
  pomoSecondsLeft   = lengths[pomoMode];
  pomoTotalSeconds  = lengths[pomoMode];
  updatePomoDisplay();
  updateBreakLabel();
  const modeLabel = document.getElementById('pomoModeLabel');
  if (modeLabel) modeLabel.textContent = pomoMode === 'work' ? 'FOCUS' : pomoMode === 'short' ? 'SHORT BREAK' : 'LONG BREAK';
};

window.skipPomo = () => { onPomoComplete(); };

window.updatePomoSettings = () => { if (!pomoRunning) resetPomo(); };

function updateBreakLabel() {
  const el = document.getElementById('pomoBreakLabel');
  if (!el) return;
  if (pomoMode === 'work') {
    el.textContent = `Next: ${pomoSession % 4 === 0 ? 'Long' : 'Short'} Break`;
  } else {
    el.textContent = 'Next: Focus Session';
  }
}

// ════════════════════════════════════════════════════════════
// BASIC TIMER
// ════════════════════════════════════════════════════════════
window.toggleBasicTimer = () => {
  if (basicRunning) {
    clearInterval(basicInterval);
    basicRunning = false;
    setIcon('basicTimerIcon', 'play');
    document.getElementById('basicTimerStartBtn').classList.remove('primary');
  } else {
    if (basicSecondsLeft <= 0) {
      const h = +document.getElementById('btiH').value || 0;
      const m = +document.getElementById('btiM').value || 0;
      const s = +document.getElementById('btiS').value || 0;
      basicTotalSecs   = h*3600 + m*60 + s;
      basicSecondsLeft = basicTotalSecs;
    }
    if (basicSecondsLeft <= 0) { showToast('Set a time greater than 0.', 'warning'); return; }
    basicRunning = true;
    setIcon('basicTimerIcon', 'pause');
    document.getElementById('basicTimerStartBtn').classList.add('primary');
    basicInterval = setInterval(basicTick, 1000);
    updateBasicDisplay();
  }
};

function basicTick() {
  if (basicSecondsLeft <= 0) {
    clearInterval(basicInterval);
    basicRunning = false;
    setIcon('basicTimerIcon', 'play');
    document.getElementById('basicTimerStartBtn')?.classList.remove('primary');
    showToast('Timer complete!', 'success');
    addNotification('Timer Done', 'Your countdown timer has finished.', 'clock');
    playBeep();
    return;
  }
  basicSecondsLeft--;
  updateBasicDisplay();
}

function updateBasicDisplay() {
  const el = document.getElementById('basicTimerDisplay');
  if (el) el.textContent = formatTime(basicSecondsLeft, true);
}

window.resetBasicTimer = () => {
  clearInterval(basicInterval);
  basicRunning = false;
  basicSecondsLeft = 0;
  setIcon('basicTimerIcon', 'play');
  document.getElementById('basicTimerStartBtn')?.classList.remove('primary');
  const el = document.getElementById('basicTimerDisplay');
  if (el) el.textContent = '00:00:00';
};

// ════════════════════════════════════════════════════════════
// GROCERIES
// ════════════════════════════════════════════════════════════
window.addGroceryItem = () => {
  const nameEl = document.getElementById('groceryItemInput');
  const qtyEl  = document.getElementById('groceryQtyInput');
  const catEl  = document.getElementById('groceryCatInput');
  const name   = nameEl?.value.trim();
  if (!name) { showToast('Enter an item name.', 'warning'); return; }

  groceries.push({ id: uid(), name, qty: +qtyEl.value || 1, cat: catEl.value, checked: false });
  S.set('groceries', groceries);
  if (nameEl) nameEl.value = '';
  if (qtyEl)  qtyEl.value  = '1';
  renderGroceries();
  renderGroceryChart();
};

window.toggleGroceryItem = id => {
  const item = groceries.find(g => g.id === id);
  if (item) { item.checked = !item.checked; S.set('groceries', groceries); renderGroceries(); }
};

window.deleteGroceryItem = id => {
  const item = groceries.find(g => g.id === id);
  if (item) softDelete({ type: 'grocery', item });
  groceries = groceries.filter(g => g.id !== id);
  S.set('groceries', groceries);
  renderGroceries();
  renderGroceryChart();
};

window.addFreqItem = name => {
  groceries.push({ id: uid(), name, qty: 1, cat: 'Other', checked: false });
  S.set('groceries', groceries);
  renderGroceries();
  renderGroceryChart();
  showToast(`${name} added.`, 'success');
};

function renderGroceries() {
  const list = document.getElementById('groceryList');
  if (!list) return;
  if (groceries.length === 0) {
    list.innerHTML = '<li style="padding:12px;opacity:.5;font-size:.85rem;font-family:var(--font-mono);">List is empty.</li>';
  } else {
    list.innerHTML = groceries.map(g => `
      <li style="border-left-color:${g.checked ? 'var(--success)' : 'var(--border)'};">
        <div style="display:flex;align-items:center;gap:10px;flex:1;">
          <input type="checkbox" ${g.checked ? 'checked' : ''} onchange="toggleGroceryItem(${g.id})" style="accent-color:var(--neon-color);">
          <span class="${g.checked ? 'strikethrough' : ''}">${escHtml(g.name)} <span style="opacity:.5;font-size:.75rem;">&times;${g.qty}</span></span>
          <span style="font-size:.68rem;font-family:var(--font-mono);opacity:.5;margin-left:auto;">${g.cat}</span>
        </div>
        <button class="delete-btn" onclick="deleteGroceryItem(${g.id})"><i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:middle;"></i></button>
      </li>`).join('');
  }

  // Frequently bought section
  const freqGrid = document.getElementById('freqBoughtGrid');
  if (freqGrid) {
    const freqItems = ['Milk','Eggs','Bread','Butter','Coffee','Rice','Pasta','Chicken'];
    freqGrid.innerHTML = freqItems.map(item => `
      <div class="freq-item" onclick="addFreqItem('${item}')">
        <i data-lucide="plus-circle" style="width:14px;height:14px;color:var(--neon-color);"></i>
        <span>${item}</span>
      </div>`).join('');
  }

  lucide.createIcons();
}

function renderGroceryChart() {
  const canvas = document.getElementById('groceryChart');
  if (!canvas) return;
  const neon = getComputedStyle(document.documentElement).getPropertyValue('--neon-color').trim() || '#00f2ff';

  // Count items per category
  const catCounts = {};
  groceries.forEach(g => { catCounts[g.cat] = (catCounts[g.cat] || 0) + g.qty; });
  const labels = Object.keys(catCounts);
  const data   = Object.values(catCounts);
  const colors = ['#00f2ff','#7b61ff','#ff4d6d','#ffd166','#06d6a0','#118ab2','#ef476f','#a8dadc'];

  if (groceryChartInst) groceryChartInst.destroy();
  groceryChartInst = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Items', data, backgroundColor: colors.slice(0, labels.length), borderRadius: 6, borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#e6f1ff' } },
        y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#e6f1ff', stepSize: 1 } },
      }
    }
  });
}

// ════════════════════════════════════════════════════════════
// BUDGET
// ════════════════════════════════════════════════════════════
window.openBudgetEntryModal = () => {
  document.getElementById('budgetDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('budgetModal').classList.remove('hidden');
};
window.closeBudgetModal = () => document.getElementById('budgetModal').classList.add('hidden');

window.saveBudgetEntry = () => {
  const type = document.getElementById('budgetType').value;
  const desc = document.getElementById('budgetDesc').value.trim();
  const amt  = +document.getElementById('budgetAmt').value;
  const date = document.getElementById('budgetDate').value;
  const cat  = document.getElementById('budgetCat').value;
  if (!desc || !amt || !date) { showToast('Fill in all fields.', 'warning'); return; }
  budgetEntries.push({ id: uid(), type, desc, amt, cat, date });
  S.set('budget', budgetEntries);
  closeBudgetModal();
  renderBudget();
  renderBudgetChart();
  showToast('Entry saved.', 'success');
};

window.deleteBudgetEntry = id => {
  const e = budgetEntries.find(b => b.id === id);
  if (e) softDelete({ type: 'budget', item: e });
  budgetEntries = budgetEntries.filter(b => b.id !== id);
  S.set('budget', budgetEntries);
  renderBudget();
  renderBudgetChart();
};

function renderBudget() {
  const income  = budgetEntries.filter(b => b.type === 'income').reduce((s,b) => s + +b.amt, 0);
  const expense = budgetEntries.filter(b => b.type === 'expense').reduce((s,b) => s + +b.amt, 0);
  const balance = income - expense;

  setText('bIncome',  `$${income.toFixed(2)}`);
  setText('bExpense', `$${expense.toFixed(2)}`);
  setText('bBalance', `$${balance.toFixed(2)}`);

  const listEl = document.getElementById('budgetList');
  if (!listEl) return;
  if (budgetEntries.length === 0) {
    listEl.innerHTML = '<div style="opacity:.5;font-family:var(--font-mono);font-size:.82rem;padding:12px;">No transactions yet.</div>';
    return;
  }
  const sorted = [...budgetEntries].sort((a,b) => b.date > a.date ? 1 : -1);
  listEl.innerHTML = sorted.map(b => `
    <div class="budget-item ${b.type}">
      <div class="budget-item-left">
        <div class="budget-item-desc">${escHtml(b.desc)}</div>
        <div class="budget-item-meta">${b.cat} &middot; ${b.date}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="budget-item-amt ${b.type}">${b.type==='income'?'+':'-'}$${(+b.amt).toFixed(2)}</span>
        <button class="delete-btn" onclick="deleteBudgetEntry(${b.id})">
          <i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:middle;"></i>
        </button>
      </div>
    </div>`).join('');
  lucide.createIcons();
}

function renderBudgetChart() {
  const canvas = document.getElementById('budgetChart');
  if (!canvas) return;

  // Group expenses by category
  const catExpenses = {};
  budgetEntries.filter(b => b.type === 'expense').forEach(b => {
    catExpenses[b.cat] = (catExpenses[b.cat] || 0) + +b.amt;
  });
  const labels = Object.keys(catExpenses);
  const data   = Object.values(catExpenses);

  // Also show total income as one bar vs total expense
  const income  = budgetEntries.filter(b => b.type === 'income').reduce((s,b) => s + +b.amt, 0);
  const expense = budgetEntries.filter(b => b.type === 'expense').reduce((s,b) => s + +b.amt, 0);

  if (budgetChartInst) budgetChartInst.destroy();
  budgetChartInst = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses', ...labels],
      datasets: [{
        label: 'Amount ($)',
        data:  [income, expense, ...data],
        backgroundColor: [
          'rgba(6,214,160,.7)',
          'rgba(255,77,109,.7)',
          ...labels.map((_, i) => `hsla(${(i * 47) % 360},70%,60%,.7)`)
        ],
        borderRadius: 7,
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#e6f1ff', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#e6f1ff', callback: v => '$' + v } },
      }
    }
  });
}

// ════════════════════════════════════════════════════════════
// CALCULATOR
// ════════════════════════════════════════════════════════════
window.calcAction = key => {
  const display = document.getElementById('calcDisplay');
  if (!display) return;

  if (key === 'clear') {
    calcExpression = '';
    calcJustEvaled = false;
    display.textContent = '0';
    return;
  }
  if (key === 'backspace') {
    if (calcJustEvaled) { calcExpression = ''; calcJustEvaled = false; display.textContent = '0'; return; }
    calcExpression = calcExpression.slice(0, -1);
    display.textContent = calcExpression || '0';
    return;
  }
  if (key === '=') {
    try {
      // Safe eval via Function
      let expr = calcExpression.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + expr + ')')();
      const rounded = +result.toFixed(10);
      calcExpression = String(rounded);
      display.textContent = rounded;
      calcJustEvaled = true;
    } catch {
      display.textContent = 'Error';
      calcExpression = '';
    }
    return;
  }
  // Operators
  if (['+','-','*','/'].includes(key)) {
    calcJustEvaled = false;
    calcExpression += key;
    display.textContent = calcExpression;
    return;
  }
  // Digits & dot
  if (calcJustEvaled && !['.','+','-','*','/'].includes(key)) {
    calcExpression = key;
    calcJustEvaled = false;
  } else {
    calcExpression += key;
  }
  display.textContent = calcExpression;
};

// ════════════════════════════════════════════════════════════
// JOURNAL
// ════════════════════════════════════════════════════════════
window.openJournalModal = () => {
  document.getElementById('journalModalTitle').textContent = 'New Journal Entry';
  document.getElementById('journalTitleInput').value = '';
  document.getElementById('journalBodyInput').value  = '';
  document.getElementById('journalModal').classList.remove('hidden');
};
window.closeJournalModal = () => document.getElementById('journalModal').classList.add('hidden');

window.saveJournalEntry = () => {
  const title = document.getElementById('journalTitleInput').value.trim();
  const body  = document.getElementById('journalBodyInput').value.trim();
  if (!title && !body) { showToast('Write something first.', 'warning'); return; }
  journalEntries.unshift({
    id:    uid(),
    title: title || 'Untitled Entry',
    body,
    date:  new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
  });
  S.set('journal', journalEntries);
  closeJournalModal();
  renderJournal();
  showToast('Journal entry saved.', 'success');
};

window.deleteJournalEntry = id => {
  const e = journalEntries.find(j => j.id === id);
  if (e) softDelete({ type: 'journal', item: e });
  journalEntries = journalEntries.filter(j => j.id !== id);
  S.set('journal', journalEntries);
  renderJournal();
  showToast('Entry deleted.', 'info');
};

function renderJournal() {
  const grid = document.getElementById('journalGrid');
  if (!grid) return;
  if (journalEntries.length === 0) {
    grid.innerHTML = '<div class="empty-state">No journal entries yet. Start writing!</div>';
    return;
  }
  grid.innerHTML = journalEntries.map(j => `
    <div class="journal-card">
      <button class="journal-del-btn" onclick="event.stopPropagation();deleteJournalEntry(${j.id})">
        <i data-lucide="x" style="width:13px;height:13px;vertical-align:middle;"></i>
      </button>
      <div class="journal-card-title">${escHtml(j.title)}</div>
      <div class="journal-card-body">${escHtml(j.body)}</div>
      <div class="journal-card-date"><i data-lucide="calendar" style="width:12px;height:12px;vertical-align:middle;margin-right:4px;"></i>${j.date}</div>
    </div>`).join('');
  lucide.createIcons();
}

// ════════════════════════════════════════════════════════════
// MOOD TRACKER
// ════════════════════════════════════════════════════════════
window.selectMood = btn => {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
};

window.logMood = () => {
  const activeBtn = document.querySelector('.mood-btn.active');
  if (!activeBtn) { showToast('Select a mood first.', 'warning'); return; }
  const score = +activeBtn.dataset.mood;
  const label = activeBtn.dataset.label;
  const icons = { 5:'sun', 4:'smile', 3:'minus-circle', 2:'cloud', 1:'cloud-rain' };
  const note  = document.getElementById('moodNote')?.value.trim() || '';

  moodLogs.unshift({
    id:    uid(),
    score,
    label,
    icon:  icons[score],
    note,
    date:  new Date().toISOString().split('T')[0],
  });
  if (moodLogs.length > 90) moodLogs.pop();
  S.set('mood', moodLogs);

  // Reset
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  const noteEl = document.getElementById('moodNote');
  if (noteEl) noteEl.value = '';

  renderMoodHistory();
  renderMoodChart();
  showToast(`Mood logged: ${label}`, 'success');
};

function renderMoodHistory() {
  const el = document.getElementById('moodHistory');
  if (!el) return;
  if (moodLogs.length === 0) {
    el.innerHTML = '<div style="opacity:.5;font-family:var(--font-mono);font-size:.82rem;padding:10px;">No mood entries yet.</div>';
    return;
  }
  el.innerHTML = moodLogs.slice(0, 14).map(m => `
    <div class="mood-entry">
      <div class="mood-entry-icon">
        <i data-lucide="${m.icon}" style="width:16px;height:16px;"></i>
      </div>
      <div class="mood-entry-body">
        <div class="mood-entry-label">${m.label} <span style="font-family:var(--font-mono);font-size:.72rem;opacity:.5;">(${m.score}/5)</span></div>
        ${m.note ? `<div class="mood-entry-note">${escHtml(m.note)}</div>` : ''}
      </div>
      <div class="mood-entry-date">${m.date}</div>
    </div>`).join('');
  lucide.createIcons();
}

function renderMoodChart() {
  const canvas = document.getElementById('moodChart');
  if (!canvas) return;
  const neon = getComputedStyle(document.documentElement).getPropertyValue('--neon-color').trim() || '#00f2ff';

  // Last 7 days
  const days = [];
  const scores = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry   = moodLogs.find(m => m.date === dateStr);
    days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    scores.push(entry ? entry.score : null);
  }

  if (moodChartInst) moodChartInst.destroy();
  moodChartInst = new Chart(canvas, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Mood Score',
        data:  scores,
        borderColor: neon,
        backgroundColor: neon + '22',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: neon,
        pointRadius: 5,
        spanGaps: true,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#e6f1ff' } },
        y: { min: 1, max: 5, grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#e6f1ff', stepSize: 1,
          callback: v => ['','Difficult','Low','Neutral','Good','Excellent'][v] || v } },
      }
    }
  });
}

// ════════════════════════════════════════════════════════════
// PLANNER — Daily Goals, Affirmations, Weekly View
// ════════════════════════════════════════════════════════════
window.addDailyGoal = () => {
  const input = document.getElementById('dailyGoalInput');
  const text  = input?.value.trim();
  if (!text) return;
  dailyGoals.push({ id: uid(), text, done: false });
  S.set('dailyGoals', dailyGoals);
  input.value = '';
  renderPlannerView();
};

window.toggleDailyGoal = id => {
  const g = dailyGoals.find(g => g.id === id);
  if (g) { g.done = !g.done; S.set('dailyGoals', dailyGoals); renderPlannerView(); }
};

window.deleteDailyGoal = id => {
  dailyGoals = dailyGoals.filter(g => g.id !== id);
  S.set('dailyGoals', dailyGoals);
  renderPlannerView();
};

window.addAffirmation = () => {
  const input = document.getElementById('affirmationInput');
  const text  = input?.value.trim();
  if (!text) return;
  affirmations.push({ id: uid(), text });
  S.set('affirmations', affirmations);
  input.value = '';
  renderAffirmationDisplay();
  renderPlannerView();
};

window.deleteAffirmation = id => {
  affirmations = affirmations.filter(a => a.id !== id);
  S.set('affirmations', affirmations);
  renderAffirmationDisplay();
  renderPlannerView();
};

function renderAffirmationDisplay() {
  const el = document.getElementById('affirmationDisplay');
  if (!el) return;
  if (affirmations.length === 0) {
    el.textContent = 'Add your first affirmation below.';
    return;
  }
  // Show today's affirmation (cycle by day of year)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  const chosen    = affirmations[dayOfYear % affirmations.length];
  el.innerHTML = `<i data-lucide="quote" style="width:14px;height:14px;vertical-align:middle;margin-right:6px;opacity:.5;"></i>${escHtml(chosen.text)}`;
  lucide.createIcons();
}

function renderPlannerView() {
  // Daily goals list
  const goalList = document.getElementById('dailyGoalList');
  if (goalList) {
    goalList.innerHTML = dailyGoals.length === 0
      ? '<li style="padding:10px;opacity:.5;font-size:.85rem;font-family:var(--font-mono);">No daily goals set.</li>'
      : dailyGoals.map(g => `
          <li class="${g.done ? 'priority-low' : 'priority-medium'}">
            <div style="display:flex;align-items:center;gap:10px;flex:1;">
              <input type="checkbox" ${g.done ? 'checked' : ''} onchange="toggleDailyGoal(${g.id})" style="accent-color:var(--neon-color);">
              <span class="${g.done ? 'strikethrough' : ''}">${escHtml(g.text)}</span>
            </div>
            <button class="delete-btn" onclick="deleteDailyGoal(${g.id})">
              <i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:middle;"></i>
            </button>
          </li>`).join('');
  }

  // Affirmations list
  const affList = document.getElementById('affirmationList');
  if (affList) {
    affList.innerHTML = affirmations.length === 0
      ? '<li style="padding:10px;opacity:.5;font-size:.85rem;font-family:var(--font-mono);">No affirmations yet.</li>'
      : affirmations.map(a => `
          <li class="priority-low">
            <div style="flex:1;font-style:italic;font-size:.88rem;">${escHtml(a.text)}</div>
            <button class="delete-btn" onclick="deleteAffirmation(${a.id})">
              <i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:middle;"></i>
            </button>
          </li>`).join('');
  }

  // Weekly planner — show tasks for each day this week
  const plannerEl = document.getElementById('weeklyPlanner');
  if (plannerEl) {
    const now  = new Date();
    const sun  = new Date(now);
    sun.setDate(now.getDate() - now.getDay());

    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    plannerEl.innerHTML = dayNames.map((name, i) => {
      const d = new Date(sun);
      d.setDate(sun.getDate() + i);
      const dateStr  = fmtDate(d);
      const dayTasks = tasks.filter(t => t.date === dateStr && !t.completed);
      const isToday  = dateStr === fmtDate(now);

      return `
        <div class="week-day-col" style="${isToday ? 'border-color:var(--neon-color);' : ''}">
          <div class="week-day-label" style="${isToday ? 'color:var(--neon-color);' : ''}">${name}<br><span style="font-size:.65rem;opacity:.6;">${d.getDate()}</span></div>
          <div class="week-day-tasks">
            ${dayTasks.length === 0
              ? '<span style="font-size:.65rem;opacity:.3;font-family:var(--font-mono);">—</span>'
              : dayTasks.slice(0, 4).map(t =>
                  `<span class="week-task-chip" style="border-left-color:${t.priority==='high'?'var(--danger)':t.priority==='low'?'var(--success)':'var(--warning)'};">${escHtml(t.name)}</span>`
                ).join('')}
          </div>
        </div>`;
    }).join('');
  }

  lucide.createIcons();
}

// ════════════════════════════════════════════════════════════
// RECENTLY DELETED
// ════════════════════════════════════════════════════════════
function softDelete(entry) {
  deletedItems.unshift({ ...entry, deletedAt: new Date().toLocaleString() });
  if (deletedItems.length > 50) deletedItems.pop();
  S.set('deleted', deletedItems);
}

window.openRecentlyDeleted = () => {
  renderRecentlyDeleted();
  document.getElementById('recentlyDeletedModal').classList.remove('hidden');
  closeDropdowns();
};
window.closeRecentlyDeleted = () => document.getElementById('recentlyDeletedModal').classList.add('hidden');

window.clearAllDeleted = () => {
  if (!confirm('Permanently clear all deleted items?')) return;
  deletedItems = [];
  S.set('deleted', deletedItems);
  renderRecentlyDeleted();
  showToast('Cleared all deleted items.', 'info');
};

window.restoreDeletedItem = idx => {
  const entry = deletedItems[idx];
  if (!entry) return;
  if (entry.type === 'task')    { tasks.push(entry.item);         saveTasks();               renderTasks(); renderCalendar(); renderDashStats(); }
  if (entry.type === 'grocery') { groceries.push(entry.item);     S.set('groceries', groceries); renderGroceries(); }
  if (entry.type === 'budget')  { budgetEntries.push(entry.item); S.set('budget', budgetEntries); renderBudget(); renderBudgetChart(); }
  if (entry.type === 'journal') { journalEntries.push(entry.item);S.set('journal', journalEntries); renderJournal(); }
  deletedItems.splice(idx, 1);
  S.set('deleted', deletedItems);
  renderRecentlyDeleted();
  showToast('Item restored.', 'success');
};

window.permanentlyDelete = idx => {
  deletedItems.splice(idx, 1);
  S.set('deleted', deletedItems);
  renderRecentlyDeleted();
};

function renderRecentlyDeleted() {
  const el = document.getElementById('recentlyDeletedList');
  if (!el) return;
  if (deletedItems.length === 0) {
    el.innerHTML = '<div style="text-align:center;opacity:.5;font-family:var(--font-mono);font-size:.82rem;padding:20px;">Nothing here.</div>';
    return;
  }
  el.innerHTML = deletedItems.map((d, i) => {
    const name = d.item?.name || d.item?.title || d.item?.desc || 'Item';
    const typeIcon = { task:'list-checks', grocery:'shopping-cart', budget:'wallet', journal:'notebook-pen' };
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid rgba(255,255,255,.06);">
        <i data-lucide="${typeIcon[d.type]||'file'}" style="width:14px;height:14px;opacity:.5;flex-shrink:0;"></i>
        <div style="flex:1;">
          <div style="font-size:.875rem;font-weight:600;">${escHtml(name)}</div>
          <div style="font-size:.72rem;font-family:var(--font-mono);opacity:.5;">${d.type} &middot; ${d.deletedAt}</div>
        </div>
        <button class="btn-ghost" style="font-size:.75rem;padding:5px 10px;" onclick="restoreDeletedItem(${i})">Restore</button>
        <button class="delete-btn" onclick="permanentlyDelete(${i})">
          <i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:middle;"></i>
        </button>
      </div>`;
  }).join('');
  lucide.createIcons();
}

// ════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════
function uid()              { return Date.now() + Math.floor(Math.random() * 100000); }
function pad(n)             { return String(n).padStart(2, '0'); }
function fmtDate(d)         { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function setText(id, val)   { const el = document.getElementById(id); if (el) el.textContent = val; }
function setIcon(id, name)  { const el = document.getElementById(id); if (el) { el.setAttribute('data-lucide', name); lucide.createIcons(); } }
function escHtml(str = '')  { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function formatTime(secs, showHours = false) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (showHours) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function playBeep() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch(e) { /* AudioContext unavailable */ }
}
