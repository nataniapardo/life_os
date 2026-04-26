/* ============================================================
   LIFE OS — script.js  (Full Feature Edition)
   AI Router · Scientific Calculator · Currency Converter
   Notes (Rich Text) · Theme Gallery · Auto Dark Mode
   Global Search · Enlarged Date · All Existing Features
   ============================================================ */
'use strict';

// ════════════════════════════════════════════════════════════
// STORAGE
// ════════════════════════════════════════════════════════════
const S = {
  get:    (k, d=[])  => { try { return JSON.parse(localStorage.getItem('lifeos_'+k)) ?? d; } catch { return d; } },
  set:    (k, v)     => localStorage.setItem('lifeos_'+k, JSON.stringify(v)),
  str:    (k, d='')  => localStorage.getItem('lifeos_'+k) ?? d,
  setStr: (k, v)     => localStorage.setItem('lifeos_'+k, v),
};

// ════════════════════════════════════════════════════════════
// GLOBAL STATE
// ════════════════════════════════════════════════════════════
let isMilitaryTime   = false;
let currentFilter    = 'all';
let calYear, calMonth;
let selectedCalDate  = null;
let activeOverdueTask= null;
let pomoInterval     = null;
let pomoRunning      = false;
let pomoMode         = 'work';
let pomoSecondsLeft  = 25*60;
let pomoTotalSeconds = 25*60;
let pomoSession      = 1;
let pomoTodaySessions= 0;
let pomoTodayMins    = 0;
let basicInterval    = null;
let basicRunning     = false;
let basicSecondsLeft = 0;
let calcExpression   = '';
let calcJustEvaled   = false;
let calcMode         = 'basic';
let currentNoteId    = null;
let noteTags         = [];
let noteAttachments  = [];
let currentActiveTheme = '';
let themeScheduleTimer = null;

// Charts
let taskPieChartInst = null;
let groceryChartInst = null;
let budgetChartInst  = null;
let moodChartInst    = null;

// Data
let tasks         = S.get('tasks',        []);
let deletedItems  = S.get('deleted',      []);
let groceries     = S.get('groceries',    []);
let budgetEntries = S.get('budget',       []);
let journalEntries= S.get('journal',      []);
let moodLogs      = S.get('mood',         []);
let dailyGoals    = S.get('dailyGoals',   []);
let affirmations  = S.get('affirmations', []);
let notifications = S.get('notifs',       []);
let notes         = S.get('notes',        []);
let userName      = S.str('name', 'Operator');

// ════════════════════════════════════════════════════════════
// BOOT
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  const color = S.str('color', '#00f2ff');
  document.documentElement.style.setProperty('--neon-color', color);
  const ci = document.getElementById('themeColorInput');
  if (ci) ci.value = color;

  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();

  initClock();
  updateGreeting();
  renderDashStats();
  renderTasks();
  renderCalendar();
  renderNotifPanel();
  buildThemeGallery();
  populateCurrencyDropdowns();
  loadThemeScheduleSettings();
  startThemeScheduleChecker();
  seedMockData();

  // Restore active theme
  const savedTheme = S.str('theme', '');
  if (savedTheme) applyTheme(savedTheme, false);

  document.addEventListener('click', e => {
    if (!e.target.closest('.profile-group')) closeEl('profileMenu');
    if (!e.target.closest('.notif-wrap'))    closeEl('notifPanel');
  });
  document.addEventListener('keydown', e => {
    if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); openSearch(); }
    if (e.key==='Escape') { closeSearch(); closeNoteModal(); }
  });

  checkOverdueTasks();
  setInterval(checkOverdueTasks, 60000);
});

// ════════════════════════════════════════════════════════════
// MOCK DATA
// ════════════════════════════════════════════════════════════
function seedMockData() {
  if (!groceries.length) {
    groceries = [
      {id:1,name:'Whole Milk',qty:2,cat:'Dairy',checked:false},
      {id:2,name:'Sourdough Bread',qty:1,cat:'Bakery',checked:false},
      {id:3,name:'Chicken Breast',qty:3,cat:'Meat',checked:false},
      {id:4,name:'Broccoli',qty:2,cat:'Produce',checked:false},
      {id:5,name:'Orange Juice',qty:1,cat:'Beverages',checked:true},
      {id:6,name:'Pasta',qty:2,cat:'Pantry',checked:false},
      {id:7,name:'Greek Yogurt',qty:4,cat:'Dairy',checked:false},
      {id:8,name:'Frozen Pizza',qty:2,cat:'Frozen',checked:false},
    ];
    S.set('groceries', groceries);
  }
  if (!budgetEntries.length) {
    const t = new Date().toISOString().split('T')[0];
    budgetEntries = [
      {id:1,type:'income', desc:'Monthly Salary',      amt:4500,cat:'Salary',       date:t},
      {id:2,type:'expense',desc:'Rent',                amt:1200,cat:'Housing',      date:t},
      {id:3,type:'expense',desc:'Groceries',           amt:320, cat:'Food',         date:t},
      {id:4,type:'expense',desc:'Netflix + Spotify',   amt:28,  cat:'Entertainment',date:t},
      {id:5,type:'expense',desc:'Gym Membership',      amt:45,  cat:'Health',       date:t},
      {id:6,type:'income', desc:'Freelance Project',   amt:850, cat:'Salary',       date:t},
      {id:7,type:'expense',desc:'Gas & Transport',     amt:110, cat:'Transport',    date:t},
      {id:8,type:'expense',desc:'Savings Contribution',amt:500, cat:'Savings',      date:t},
    ];
    S.set('budget', budgetEntries);
  }
  if (!moodLogs.length) {
    const icons =['cloud-rain','cloud','minus-circle','smile','sun'];
    const labels=['Difficult','Low','Neutral','Good','Excellent'];
    for (let i=6;i>=0;i--) {
      const d=new Date(); d.setDate(d.getDate()-i);
      const s=Math.floor(Math.random()*5)+1;
      moodLogs.push({id:Date.now()+i,score:s,label:labels[s-1],icon:icons[s-1],note:'',date:d.toISOString().split('T')[0]});
    }
    S.set('mood', moodLogs);
  }
  if (!affirmations.length) {
    affirmations=[
      {id:1,text:'I am capable of achieving everything I set my mind to.'},
      {id:2,text:'Every day I grow stronger, wiser, and more focused.'},
      {id:3,text:'I attract success through consistency and discipline.'},
    ];
    S.set('affirmations', affirmations);
  }
  renderGroceries(); renderBudget(); renderMoodHistory(); renderPlannerView(); renderAffirmationDisplay();
}

// ════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════
function showToast(msg, type='info', duration=4000) {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons={info:'info',success:'check-circle',error:'alert-circle',warning:'alert-triangle'};
  t.innerHTML=`<i data-lucide="${icons[type]||'info'}" style="width:16px;height:16px;flex-shrink:0;"></i><span>${msg}</span>`;
  c.appendChild(t); lucide.createIcons();
  setTimeout(()=>{ t.classList.add('toast-out'); setTimeout(()=>t.remove(),350); }, duration);
}

// ════════════════════════════════════════════════════════════
// BELL NOTIFICATIONS
// ════════════════════════════════════════════════════════════
function addNotification(title, body, icon='bell') {
  notifications.unshift({id:uid(),title,body,icon,time:new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}),read:false});
  if (notifications.length>50) notifications.pop();
  S.set('notifs',notifications); renderNotifPanel(); showToast(title,'info');
}
function renderNotifPanel() {
  const list=document.getElementById('notifList'), badge=document.getElementById('notifBadge');
  const unread=notifications.filter(n=>!n.read).length;
  if (badge){ badge.textContent=unread; badge.classList.toggle('hidden',unread===0); }
  if (!list) return;
  list.innerHTML = notifications.length===0
    ? '<div class="notif-empty">No notifications</div>'
    : notifications.map(n=>`
        <div class="notif-item" onclick="markNotifRead(${n.id})" style="${n.read?'opacity:.55':''}">
          <div class="notif-item-icon"><i data-lucide="${n.icon}" style="width:14px;height:14px;"></i></div>
          <div class="notif-item-body">
            <div class="notif-item-title">${n.title}</div>
            <div style="font-size:.75rem;color:var(--text-muted);">${n.body}</div>
            <div class="notif-item-time">${n.time}</div>
          </div>
        </div>`).join('');
  lucide.createIcons();
}
window.markNotifRead=id=>{ const n=notifications.find(x=>x.id===id); if(n){n.read=true;S.set('notifs',notifications);renderNotifPanel();} };
window.clearAllNotifs=()=>{ notifications=[];S.set('notifs',notifications);renderNotifPanel(); };
window.toggleNotifPanel=e=>{ e.stopPropagation(); const p=document.getElementById('notifPanel'); const h=p.classList.contains('hidden'); closeEl('profileMenu'); p.classList.toggle('hidden',!h); if(h){notifications.forEach(n=>n.read=true);S.set('notifs',notifications);renderNotifPanel();} };

// ════════════════════════════════════════════════════════════
// GLOBAL SEARCH
// ════════════════════════════════════════════════════════════
const SEARCH_INDEX = [
  {name:'Dashboard',      sub:'Home overview & AI assistant',     icon:'layout-dashboard', action:()=>switchView('dashboard')},
  {name:'Todo List',      sub:'Manage tasks and priorities',       icon:'list-checks',      action:()=>switchView('todo')},
  {name:'Calendar',       sub:'View tasks on calendar',            icon:'calendar-days',    action:()=>switchView('calendar')},
  {name:'Notes',          sub:'Rich text notes & checklists',      icon:'sticky-note',      action:()=>switchView('notes')},
  {name:'Pomodoro Timer', sub:'Focus sessions with breaks',        icon:'timer',            action:()=>switchView('pomodoro')},
  {name:'Basic Timer',    sub:'Countdown timer with notification', icon:'clock',            action:()=>switchView('basicTimer')},
  {name:'Groceries',      sub:'Shopping list & category chart',    icon:'shopping-cart',    action:()=>switchModule('groceries')},
  {name:'Budget',         sub:'Income, expenses & calculator',     icon:'wallet',           action:()=>switchModule('budget')},
  {name:'Journal',        sub:'Personal journal entries',          icon:'notebook-pen',     action:()=>switchModule('journal')},
  {name:'Mood Tracker',   sub:'Log and track your mood',           icon:'heart-pulse',      action:()=>switchModule('mood')},
  {name:'Planner',        sub:'Goals, affirmations & weekly view', icon:'book-open',        action:()=>switchModule('planner')},
  {name:'Settings',       sub:'Customization & themes',            icon:'settings-2',       action:()=>switchView('settings')},
  {name:'Recently Deleted',sub:'Restore deleted items',            icon:'trash-2',          action:()=>openRecentlyDeleted()},
];

window.openSearch = () => {
  document.getElementById('searchOverlay').classList.remove('hidden');
  setTimeout(()=>document.getElementById('globalSearchInput')?.focus(), 80);
};
window.closeSearch = e => {
  if (e && e.target!==document.getElementById('searchOverlay')) return;
  document.getElementById('searchOverlay').classList.add('hidden');
  const inp=document.getElementById('globalSearchInput');
  if (inp) inp.value='';
  document.getElementById('searchResults').innerHTML='';
};

window.handleGlobalSearch = query => {
  const panel = document.getElementById('searchResults');
  if (!query.trim()) { panel.innerHTML=''; return; }
  const q = query.toLowerCase();

  // Static pages
  const pageHits = SEARCH_INDEX.filter(p => p.name.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q));

  // Dynamic data
  const taskHits    = tasks.filter(t=>t.name.toLowerCase().includes(q)).slice(0,4);
  const noteHits    = notes.filter(n=>(n.title||'').toLowerCase().includes(q)||(n.plainText||'').toLowerCase().includes(q)).slice(0,3);
  const journalHits = journalEntries.filter(j=>j.title.toLowerCase().includes(q)||j.body.toLowerCase().includes(q)).slice(0,3);
  const grocHits    = groceries.filter(g=>g.name.toLowerCase().includes(q)).slice(0,3);

  let html = '';

  if (pageHits.length) {
    html += `<div class="search-result-group"><div class="search-group-label">Pages & Features</div>`;
    html += pageHits.map((p,i)=>`
      <div class="search-result-item" onclick="searchResultClick(${i})">
        <div class="search-result-icon"><i data-lucide="${p.icon}" style="width:15px;height:15px;"></i></div>
        <div><div class="search-result-name">${p.name}</div><div class="search-result-sub">${p.sub}</div></div>
      </div>`).join('');
    html += '</div>';
  }
  if (taskHits.length) {
    html += `<div class="search-result-group"><div class="search-group-label">Tasks</div>`;
    html += taskHits.map(t=>`
      <div class="search-result-item" onclick="switchView('todo');closeSearch();">
        <div class="search-result-icon"><i data-lucide="check-square" style="width:15px;height:15px;"></i></div>
        <div><div class="search-result-name">${escHtml(t.name)}</div><div class="search-result-sub">${t.priority} priority${t.date?' · '+t.date:''}</div></div>
      </div>`).join('');
    html += '</div>';
  }
  if (noteHits.length) {
    html += `<div class="search-result-group"><div class="search-group-label">Notes</div>`;
    html += noteHits.map(n=>`
      <div class="search-result-item" onclick="switchView('notes');closeSearch();">
        <div class="search-result-icon"><i data-lucide="sticky-note" style="width:15px;height:15px;"></i></div>
        <div><div class="search-result-name">${escHtml(n.title||'Untitled')}</div><div class="search-result-sub">${n.date}</div></div>
      </div>`).join('');
    html += '</div>';
  }
  if (grocHits.length) {
    html += `<div class="search-result-group"><div class="search-group-label">Groceries</div>`;
    html += grocHits.map(g=>`
      <div class="search-result-item" onclick="switchModule('groceries');closeSearch();">
        <div class="search-result-icon"><i data-lucide="shopping-cart" style="width:15px;height:15px;"></i></div>
        <div><div class="search-result-name">${escHtml(g.name)}</div><div class="search-result-sub">${g.cat} · x${g.qty}</div></div>
      </div>`).join('');
    html += '</div>';
  }

  if (!html) html = '<div class="search-empty">No results found.</div>';
  panel.innerHTML = html;
  lucide.createIcons();

  // Store page hits for click handler
  panel._pageHits = pageHits;
};

window.searchResultClick = i => {
  const panel = document.getElementById('searchResults');
  const hits  = panel._pageHits || [];
  if (hits[i]) { hits[i].action(); closeSearch(); }
};

// ════════════════════════════════════════════════════════════
// AI COMMAND ROUTER — Central Intelligence
// ════════════════════════════════════════════════════════════
window.organizeWithAI = () => {
  const raw = document.getElementById('aiInput').value.trim();
  if (!raw) { showToast('Please enter some text first.','warning'); return; }

  const statusEl  = document.getElementById('aiStatus');
  const logEl     = document.getElementById('aiActionLog');
  if (statusEl) statusEl.textContent = 'Analyzing...';
  if (logEl) logEl.innerHTML = '';

  const lines   = raw.split('\n').filter(l=>l.trim());
  const actions = [];

  lines.forEach(line => {
    const result = routeAIInput(line.trim());
    if (result) actions.push(result);
  });

  // Display action log
  if (logEl) {
    logEl.innerHTML = actions.map(a => `
      <div class="ai-action-item">
        <i data-lucide="${a.icon}" style="width:14px;height:14px;"></i>
        <span><strong>${a.section}:</strong> ${escHtml(a.summary)}</span>
      </div>`).join('');
    lucide.createIcons();
  }

  if (statusEl) statusEl.textContent = actions.length ? `${actions.length} action${actions.length>1?'s':''} completed` : 'No recognisable intent found.';
  document.getElementById('aiInput').value = '';

  // Refresh all panels
  renderTasks(); renderCalendar(); renderDashStats(); renderGroceries();
  renderJournal(); renderMoodHistory(); renderNotes();

  if (actions.length) addNotification('AI Routed Input', `${actions.length} item${actions.length>1?'s':''} organized across your workspace.`, 'sparkles');
};

function routeAIInput(text) {
  if (!text) return null;
  const t = text.toLowerCase();

  // ── GROCERY INTENT ──
  // "add X to groceries/shopping list", "buy X", "get X from store"
  const groceryPatterns = [
    /add\s+(.+?)\s+to\s+(groceries|shopping\s*list|the\s*list)/i,
    /buy\s+(.+?)(?:\s+(?:tonight|today|tomorrow|from\s+\S+))?$/i,
    /get\s+(.+?)\s+(?:from\s+)?(?:the\s+)?(?:store|market|shop)/i,
    /pick\s+up\s+(.+?)(?:\s+(?:tonight|today|tomorrow))?$/i,
    /(?:groceries?|shopping):\s*(.+)/i,
  ];
  for (const rx of groceryPatterns) {
    const m = text.match(rx);
    if (m && m[1]) {
      const itemName = m[1].trim().replace(/^(some|a|an)\s+/i,'');
      groceries.push({id:uid(),name:capitalize(itemName),qty:1,cat:'Other',checked:false});
      S.set('groceries',groceries);
      return {section:'Groceries', icon:'shopping-cart', summary:`Added "${capitalize(itemName)}" to shopping list`};
    }
  }

  // ── JOURNAL INTENT ──
  // "journal: ...", "journal entry: ...", "diary: ..."
  const journalRx = /(?:journal(?:\s+entry)?|diary)[\s:\-]+(.+)/i;
  const journalM  = text.match(journalRx);
  if (journalM && journalM[1]) {
    const body = journalM[1].trim();
    journalEntries.unshift({id:uid(),title:'AI Entry — '+new Date().toLocaleDateString(),body,date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})});
    S.set('journal',journalEntries);
    return {section:'Journal', icon:'notebook-pen', summary:`Created journal entry: "${body.slice(0,50)}..."`};
  }

  // ── NOTE INTENT ──
  // "note: ...", "write down ...", "remember ..."
  const noteRx = /(?:note|jot|write\s+(?:down|this)|remember)[\s:\-]+(.+)/i;
  const noteM  = text.match(noteRx);
  if (noteM && noteM[1]) {
    const body = noteM[1].trim();
    notes.unshift({id:uid(),title:'Quick Note',html:body,plainText:body,tags:[],attachments:[],date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})});
    S.set('notes',notes);
    return {section:'Notes', icon:'sticky-note', summary:`Note saved: "${body.slice(0,50)}"`};
  }

  // ── MOOD INTENT ──
  // "mood: great", "feeling anxious", "i feel good today"
  const moodRx    = /(?:mood|feeling|i\s+feel)[\s:\-]+(.+)/i;
  const moodM     = text.match(moodRx);
  const moodWords = {5:['amazing','excellent','fantastic','great','wonderful','awesome','happy','joyful','ecstatic'],4:['good','well','nice','pretty good','positive','content'],3:['okay','ok','neutral','fine','alright','so-so'],2:['low','sad','tired','down','drained','not great'],1:['terrible','awful','anxious','stressed','horrible','bad','difficult','rough']};
  if (moodM && moodM[1]) {
    const moodDesc = moodM[1].toLowerCase();
    let score=3, label='Neutral', icon='minus-circle';
    const icons=['cloud-rain','cloud','minus-circle','smile','sun'];
    const labels=['Difficult','Low','Neutral','Good','Excellent'];
    for (const [sc, words] of Object.entries(moodWords)) {
      if (words.some(w=>moodDesc.includes(w))) { score=+sc; label=labels[+sc-1]; icon=icons[+sc-1]; break; }
    }
    moodLogs.unshift({id:uid(),score,label,icon,note:text,date:new Date().toISOString().split('T')[0]});
    S.set('mood',moodLogs);
    return {section:'Mood Tracker', icon:'heart-pulse', summary:`Logged mood: ${label} (${score}/5)`};
  }

  // ── BUDGET INTENT ──
  // "spent X on Y", "income X from Y", "expense: X for Y"
  const expenseRx = /(?:spent|paid|expense|cost)[\s:\-]+\$?([\d.]+)\s+(?:on|for)?\s*(.+)/i;
  const incomeRx  = /(?:received|earned|income|got paid|salary)[\s:\-]+\$?([\d.]+)(?:\s+from\s+(.+))?/i;
  const expM = text.match(expenseRx);
  const incM = text.match(incomeRx);
  if (expM) {
    budgetEntries.push({id:uid(),type:'expense',desc:capitalize(expM[2]||'Expense'),amt:+expM[1],cat:'Other',date:new Date().toISOString().split('T')[0]});
    S.set('budget',budgetEntries);
    return {section:'Budget', icon:'wallet', summary:`Expense added: $${expM[1]} for ${expM[2]||'item'}`};
  }
  if (incM) {
    budgetEntries.push({id:uid(),type:'income',desc:capitalize(incM[2]||'Income'),amt:+incM[1],cat:'Salary',date:new Date().toISOString().split('T')[0]});
    S.set('budget',budgetEntries);
    return {section:'Budget', icon:'wallet', summary:`Income added: $${incM[1]}`};
  }

  // ── GOAL INTENT ──
  // "goal: ...", "daily goal: ..."
  const goalRx = /(?:(?:daily\s+)?goal|objective|aim)[\s:\-]+(.+)/i;
  const goalM  = text.match(goalRx);
  if (goalM && goalM[1]) {
    dailyGoals.push({id:uid(),text:capitalize(goalM[1].trim()),done:false});
    S.set('dailyGoals',dailyGoals);
    return {section:'Planner', icon:'target', summary:`Goal added: "${goalM[1].trim()}"`};
  }

  // ── AFFIRMATION INTENT ──
  const affRx = /(?:affirmation|mantra|i\s+am\s+.+|remind\s+me\s+that)[\s:\-]+(.+)/i;
  const affM  = text.match(affRx);
  if (affM && affM[1]) {
    affirmations.push({id:uid(),text:capitalize(affM[1].trim())});
    S.set('affirmations',affirmations);
    return {section:'Planner', icon:'sparkles', summary:`Affirmation added: "${affM[1].trim()}"`};
  }

  // ── TASK INTENT (default fallback) ──
  const date     = extractDate(text);
  const time     = extractTime(text);
  const priority = detectPriority(text);
  tasks.push({id:uid(),name:text,date,time,priority,completed:false,notes:''});
  saveTasks();
  return {section:'Tasks', icon:'list-checks', summary:`Task created: "${text.slice(0,60)}"`};
}

// ════════════════════════════════════════════════════════════
// CLOCK & GREETING
// ════════════════════════════════════════════════════════════
function initClock() {
  const tick = () => {
    const now = new Date();
    const cEl = document.getElementById('clockDisplay');
    const dEl = document.getElementById('dateDisplay');
    if (cEl) cEl.textContent = isMilitaryTime ? now.toLocaleTimeString('en-GB') : now.toLocaleTimeString('en-US');
    if (dEl) dEl.textContent = now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  };
  tick(); setInterval(tick,1000);
}
window.toggleMilitaryTime = ()=>{ isMilitaryTime=!isMilitaryTime; };

function updateGreeting() {
  const el=document.getElementById('dynamicGreeting'); if (!el) return;
  const h=new Date().getHours();
  el.textContent=`${h<12?'Good Morning':h<18?'Good Afternoon':'Good Evening'}, ${userName}`;
}
window.updateUserName = ()=>{
  const i=document.getElementById('userNameInput');
  if (i?.value.trim()){ userName=i.value.trim(); S.setStr('name',userName); updateGreeting(); i.value=''; showToast('Display name updated.','success'); }
};

// ════════════════════════════════════════════════════════════
// THEME
// ════════════════════════════════════════════════════════════
window.manualThemeToggle = ()=>{
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  const isLight=document.body.classList.contains('light-mode');
  const icon=document.getElementById('themeIcon');
  if (icon){ icon.setAttribute('data-lucide',isLight?'sun':'moon'); lucide.createIcons(); }
};
window.changeSystemColor = color=>{
  document.documentElement.style.setProperty('--neon-color',color);
  S.setStr('color',color);
};
window.changeFont = ff=>{ document.body.style.fontFamily=ff; };

// ── AUTO THEME SCHEDULE ──
function loadThemeScheduleSettings() {
  const lightTime = S.str('themeLight','07:00');
  const darkTime  = S.str('themeDark', '19:00');
  const enabled   = S.str('themeScheduleOn','false')==='true';
  const lEl=document.getElementById('lightModeOnTime');
  const dEl=document.getElementById('darkModeOnTime');
  const eEl=document.getElementById('themeScheduleEnabled');
  if (lEl) lEl.value=lightTime;
  if (dEl) dEl.value=darkTime;
  if (eEl) eEl.checked=enabled;
}

window.saveThemeSchedule = ()=>{
  const lightTime=document.getElementById('lightModeOnTime')?.value||'07:00';
  const darkTime =document.getElementById('darkModeOnTime')?.value||'19:00';
  const enabled  =document.getElementById('themeScheduleEnabled')?.checked||false;
  S.setStr('themeLight',lightTime);
  S.setStr('themeDark', darkTime);
  S.setStr('themeScheduleOn',String(enabled));
  showToast(enabled?'Auto theme schedule enabled.':'Auto theme schedule disabled.','info');
};

function startThemeScheduleChecker() {
  const check=()=>{
    if (S.str('themeScheduleOn','false')!=='true') return;
    const now=new Date();
    const hhmm=`${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const lightTime=S.str('themeLight','07:00');
    const darkTime =S.str('themeDark', '19:00');
    if (hhmm===lightTime && document.body.classList.contains('dark-mode')) window.manualThemeToggle();
    if (hhmm===darkTime  && document.body.classList.contains('light-mode')) window.manualThemeToggle();
  };
  check(); setInterval(check,60000);
}

// ── WEBSITE THEMES ──
const THEMES = [
  {id:'default',     label:'Default',      colors:['#050b18','#00f2ff','#081226']},
  {id:'nature',      label:'Nature',       colors:['#0d3b2e','#4ade80','#1a5c40']},
  {id:'futuristic',  label:'Futuristic',   colors:['#020818','#7b61ff','#0a0520']},
  {id:'food',        label:'Food',         colors:['#2d1a0e','#f97316','#4a2c1a']},
  {id:'travel',      label:'Travel',       colors:['#0a1628','#38bdf8','#1a2a45']},
  {id:'cities',      label:'Cities',       colors:['#0d0d1a','#94a3b8','#1a1a2e']},
  {id:'whimsy',      label:'Whimsy',       colors:['#1a0d2e','#e879f9','#2e1a3d']},
  {id:'chic',        label:'Chic',         colors:['#1a0a14','#f43f5e','#2e1020']},
  {id:'zen',         label:'Zen',          colors:['#0a1a1a','#5eead4','#142626']},
  {id:'cartoon',     label:'Cartoon',      colors:['#1a0a2e','#a78bfa','#2e1060']},
  {id:'artistic',    label:'Artistic',     colors:['#1a0a0a','#fb923c','#2e1a0a']},
  {id:'abstract',    label:'Abstract',     colors:['#050818','#6366f1','#100520']},
  {id:'vintage',     label:'Vintage',      colors:['#1a1205','#d97706','#2e2010']},
  {id:'classy',      label:'Classy',       colors:['#0a0a14','#cbd5e1','#14141e']},
  {id:'professional',label:'Professional', colors:['#0a1020','#3b82f6','#101828']},
];

function buildThemeGallery() {
  const g=document.getElementById('themeGallery'); if (!g) return;
  g.innerHTML=THEMES.map(th=>`
    <div class="theme-card${currentActiveTheme===th.id?' active':''}" onclick="applyTheme('${th.id}')">
      <div class="theme-card-preview" style="background:linear-gradient(135deg,${th.colors[0]},${th.colors[2]});position:relative;">
        <div style="position:absolute;bottom:6px;left:6px;width:28px;height:4px;border-radius:2px;background:${th.colors[1]};box-shadow:0 0 8px ${th.colors[1]};"></div>
      </div>
      <div class="theme-card-label">${th.label}</div>
      <div class="theme-card-check"><i data-lucide="check" style="width:12px;height:12px;color:#050b18;"></i></div>
    </div>`).join('');
  lucide.createIcons();
}

window.applyTheme=(id,save=true)=>{
  // Remove all theme classes
  THEMES.forEach(th=>document.body.classList.remove('theme-'+th.id));
  currentActiveTheme=id;
  if (id!=='default') document.body.classList.add('theme-'+id);
  if (save) { S.setStr('theme',id); showToast(`Theme "${THEMES.find(t=>t.id===id)?.label}" applied.`,'success'); }
  buildThemeGallery();
  const t=THEMES.find(th=>th.id===id);
  if (t) { document.documentElement.style.setProperty('--neon-color',t.colors[1]); if (save) S.setStr('color',t.colors[1]); const ci=document.getElementById('themeColorInput'); if(ci) ci.value=t.colors[1]; }
};

// ════════════════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════════════════
window.switchView=viewId=>{
  document.querySelectorAll('.view-section').forEach(v=>v.classList.add('hidden'));
  document.getElementById(viewId+'View')?.classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(i=>i.classList.toggle('active',!!i.getAttribute('onclick')?.includes(`'${viewId}'`)));
  const crumb=document.getElementById('breadcrumb'); if(crumb)crumb.textContent=viewId.charAt(0).toUpperCase()+viewId.slice(1);
  if(viewId==='calendar')renderCalendar();
  if(viewId==='todo'){renderTasks();renderTaskPieChart();}
  if(viewId==='dashboard')renderDashStats();
  if(viewId==='notes')renderNotes();
  closeDropdowns();
};
window.switchModule=modId=>{
  switchView('module');
  document.querySelectorAll('.module-panel').forEach(p=>p.classList.add('hidden'));
  document.getElementById('mod-'+modId)?.classList.remove('hidden');
  const labels={groceries:'Groceries',budget:'Budget',journal:'Journal',mood:'Mood Tracker',planner:'Planner'};
  const crumb=document.getElementById('breadcrumb'); if(crumb)crumb.textContent=labels[modId]||modId;
  document.querySelectorAll('.nav-item').forEach(i=>i.classList.toggle('active',!!i.getAttribute('onclick')?.includes(`'${modId}'`)));
  if(modId==='groceries'){renderGroceries();renderGroceryChart();}
  if(modId==='budget'){renderBudget();renderBudgetChart();}
  if(modId==='journal')renderJournal();
  if(modId==='mood'){renderMoodHistory();renderMoodChart();}
  if(modId==='planner')renderPlannerView();
  closeDropdowns();
};
window.closeDropdowns=()=>{closeEl('profileMenu');closeEl('notifPanel');};
function closeEl(id){document.getElementById(id)?.classList.add('hidden');}
window.toggleProfileMenu=e=>{e.stopPropagation();const m=document.getElementById('profileMenu');const h=m.classList.contains('hidden');closeEl('notifPanel');m.classList.toggle('hidden',!h);};

// ════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ════════════════════════════════════════════════════════════
function renderDashStats(){
  const today=new Date().toISOString().split('T')[0];
  setText('statOpen',   tasks.filter(t=>!t.completed).length);
  setText('statDone',   tasks.filter(t=>t.completed).length);
  setText('statToday',  tasks.filter(t=>!t.completed&&t.date===today).length);
  setText('statOverdue',tasks.filter(t=>!t.completed&&t.date&&t.date<today).length);
}

// ════════════════════════════════════════════════════════════
// TASKS
// ════════════════════════════════════════════════════════════
function detectPriority(text){
  const t=text.toLowerCase();
  if(/\b(urgent|critical|asap|meeting|appointment|deadline|board)\b/.test(t))return'high';
  if(/\b(walk|hobby|leisure|game|relax|cleaning|watch|read)\b/.test(t))return'low';
  return'medium';
}
function extractTime(text){const m=text.match(/\b(\d{1,2})(:\d{2})?\s?(am|pm)\b/i);return m?m[0]:'';}
function extractDate(text){
  const t=text.toLowerCase(),today=new Date();
  if(t.includes('today'))return fmtDate(today);
  if(t.includes('tomorrow')){const d=new Date(today);d.setDate(d.getDate()+1);return fmtDate(d);}
  const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
  for(let i=0;i<months.length;i++){if(t.includes(months[i])){const d=text.match(/\d+/);if(d)return`${today.getFullYear()}-${pad(i+1)}-${pad(+d[0])}`;}}
  const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  for(let i=0;i<days.length;i++){if(t.includes('next '+days[i])){const d=new Date(today);const diff=(i-d.getDay()+7)%7||7;d.setDate(d.getDate()+diff);return fmtDate(d);}}
  return'';
}
window.openTaskModal=()=>{document.getElementById('taskModalTitle').textContent='New Task';document.getElementById('taskNameInput').value='';document.getElementById('taskDateInput').value='';document.getElementById('taskPriorityInput').value='medium';openModal();};
window.openModal =()=>document.getElementById('quickModal').classList.remove('hidden');
window.closeModal=()=>document.getElementById('quickModal').classList.add('hidden');
window.saveNewTask=()=>{
  const name=document.getElementById('taskNameInput').value.trim();
  if(!name){showToast('Enter a task name.','warning');return;}
  tasks.push({id:uid(),name,date:document.getElementById('taskDateInput').value,priority:document.getElementById('taskPriorityInput').value,completed:false,notes:''});
  saveTasks();closeModal();renderTasks();renderCalendar();renderDashStats();showToast('Task saved.','success');
};
window.toggleTask=id=>{const t=tasks.find(t=>t.id===id);if(t){t.completed=!t.completed;saveTasks();renderTasks();renderDashStats();}};
window.deleteTask=id=>{const t=tasks.find(t=>t.id===id);if(t)softDelete({type:'task',item:t});tasks=tasks.filter(t=>t.id!==id);saveTasks();renderTasks();renderCalendar();renderDashStats();showToast('Moved to Recently Deleted.','info');};
window.filterTasks=(f,btn)=>{currentFilter=f;document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderTasks();};

function getFilteredTasks(){
  const today=new Date().toISOString().split('T')[0];let list=[...tasks];
  if(currentFilter==='high')   list=list.filter(t=>t.priority==='high'&&!t.completed);
  if(currentFilter==='medium') list=list.filter(t=>t.priority==='medium'&&!t.completed);
  if(currentFilter==='low')    list=list.filter(t=>t.priority==='low'&&!t.completed);
  if(currentFilter==='done')   list=list.filter(t=>t.completed);
  if(currentFilter==='overdue')list=list.filter(t=>!t.completed&&t.date&&t.date<today);
  list.sort((a,b)=>(a.date||'9999')>(b.date||'9999')?1:-1);
  return list;
}
function renderTasks(){
  const list=document.getElementById('todoListElement');if(!list)return;
  const filtered=getFilteredTasks(),today=new Date().toISOString().split('T')[0];
  list.innerHTML=filtered.length===0?'<li style="padding:20px;opacity:.5;font-family:var(--font-mono);font-size:.82rem;">No tasks found.</li>'
    :filtered.map(t=>{const ov=!t.completed&&t.date&&t.date<today;return`
      <li class="priority-${t.priority}${t.completed?' completed':''}">
        <div style="display:flex;align-items:flex-start;gap:10px;flex:1;min-width:0;">
          <input type="checkbox" ${t.completed?'checked':''} onchange="toggleTask(${t.id})" style="margin-top:3px;accent-color:var(--neon-color);flex-shrink:0;">
          <span class="${t.completed?'strikethrough':''}" style="word-break:break-word;flex:1;">
            <span style="opacity:.45;font-size:.72rem;font-family:var(--font-mono);">[${(t.priority||'MED').toUpperCase()}]</span>
            ${escHtml(t.name)}
            ${t.date?`<span style="display:block;font-size:.72rem;font-family:var(--font-mono);color:${ov?'var(--danger)':'var(--text-muted)'};">${ov?'OVERDUE — ':''}${t.date}</span>`:''}
          </span>
        </div>
        <button class="delete-btn" onclick="deleteTask(${t.id})"><i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:middle;"></i></button>
      </li>`;}).join('');
  const total=tasks.length,done=tasks.filter(t=>t.completed).length,pct=total?Math.round(done/total*100):0;
  const fill=document.getElementById('taskProgFill');if(fill)fill.style.width=pct+'%';
  const lbl=document.getElementById('taskProgLabel');if(lbl)lbl.textContent=`${done} / ${total} complete`;
  const stats=document.getElementById('taskStatsPanel');
  const ov2=tasks.filter(t=>!t.completed&&t.date&&t.date<new Date().toISOString().split('T')[0]).length;
  if(stats)stats.innerHTML=`<div class="ts-row"><span>Total</span><strong>${total}</strong></div><div class="ts-row"><span style="color:var(--danger)">High</span><strong>${tasks.filter(t=>t.priority==='high').length}</strong></div><div class="ts-row"><span style="color:var(--warning)">Medium</span><strong>${tasks.filter(t=>t.priority==='medium').length}</strong></div><div class="ts-row"><span style="color:var(--success)">Low</span><strong>${tasks.filter(t=>t.priority==='low').length}</strong></div><div class="ts-row"><span style="color:var(--danger)">Overdue</span><strong>${ov2}</strong></div><div class="ts-row"><span style="color:var(--neon-color)">Done</span><strong>${done}</strong></div>`;
  lucide.createIcons(); renderTaskPieChart();
}
function saveTasks(){S.set('tasks',tasks);}
function renderTaskPieChart(){
  const canvas=document.getElementById('taskPieChart');if(!canvas)return;
  const done=tasks.filter(t=>t.completed).length,open=tasks.filter(t=>!t.completed).length;
  const neon=getComputedStyle(document.documentElement).getPropertyValue('--neon-color').trim()||'#00f2ff';
  if(taskPieChartInst)taskPieChartInst.destroy();
  taskPieChartInst=new Chart(canvas,{type:'doughnut',data:{labels:['Completed','Open'],datasets:[{data:[done,open],backgroundColor:[neon,'rgba(255,255,255,0.08)'],borderWidth:0,hoverOffset:6}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{labels:{color:'#e6f1ff',font:{size:12}}}},cutout:'68%'}});
}

// ════════════════════════════════════════════════════════════
// CALENDAR
// ════════════════════════════════════════════════════════════
window.changeMonth=dir=>{calMonth+=dir;if(calMonth>11){calMonth=0;calYear++;}if(calMonth<0){calMonth=11;calYear--;}renderCalendar();};
window.goToToday=()=>{const n=new Date();calYear=n.getFullYear();calMonth=n.getMonth();renderCalendar();};
function renderCalendar(){
  const grid=document.getElementById('calendarGrid'),titleEl=document.getElementById('currentMonthName');if(!grid||!titleEl)return;
  titleEl.textContent=new Date(calYear,calMonth).toLocaleString('default',{month:'long',year:'numeric'});
  grid.innerHTML='';
  const firstDay=new Date(calYear,calMonth,1).getDay(),daysInMonth=new Date(calYear,calMonth+1,0).getDate(),todayStr=new Date().toISOString().split('T')[0];
  for(let e=0;e<firstDay;e++){const em=document.createElement('div');em.className='day-box empty-cell';grid.appendChild(em);}
  for(let d=1;d<=daysInMonth;d++){
    const dateStr=`${calYear}-${pad(calMonth+1)}-${pad(d)}`;
    const dayTasks=tasks.filter(t=>t.date===dateStr);
    const dayBudget=budgetEntries.filter(b=>b.date===dateStr);
    const box=document.createElement('div');
    box.className='day-box'+(dateStr===todayStr?' today':'')+(dateStr===selectedCalDate?' selected':'');
    box.onclick=()=>selectCalDay(dateStr);
    let html=`<span class="day-num">${d}</span>`;
    dayTasks.slice(0,3).forEach(t=>{html+=`<span class="day-task-chip ${t.priority}">${escHtml(t.name)}</span>`;});
    if(dayTasks.length>3)html+=`<span class="day-task-chip" style="opacity:.5;">+${dayTasks.length-3} more</span>`;
    if(dayBudget.length>0)html+=`<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--success);margin-top:3px;"></span>`;
    box.innerHTML=html;grid.appendChild(box);
  }
}
function selectCalDay(dateStr){
  selectedCalDate=dateStr;renderCalendar();
  const panel=document.getElementById('calSelectedPanel'),titleEl=document.getElementById('cspTitle'),tasksEl=document.getElementById('cspTasks'),budgEl=document.getElementById('cspBudget');
  const dayTasks=tasks.filter(t=>t.date===dateStr),dayBudget=budgetEntries.filter(b=>b.date===dateStr);
  if(panel)panel.classList.remove('hidden');
  if(titleEl){const d=new Date(dateStr+'T00:00:00');titleEl.textContent=d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});}
  if(tasksEl)tasksEl.innerHTML=dayTasks.length===0?'<div style="opacity:.5;font-size:.85rem;font-family:var(--font-mono);">No tasks for this day.</div>':dayTasks.map(t=>`<div class="csp-task-item"><span style="width:8px;height:8px;border-radius:50%;background:${t.priority==='high'?'var(--danger)':t.priority==='low'?'var(--success)':'var(--warning)'};flex-shrink:0;display:inline-block;"></span><span>${escHtml(t.name)}</span></div>`).join('');
  if(budgEl)budgEl.innerHTML=dayBudget.length===0?'<span style="opacity:.5;">No budget entries.</span>':dayBudget.map(b=>`<div style="display:flex;justify-content:space-between;font-size:.82rem;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05);"><span>${escHtml(b.desc)}</span><span style="color:${b.type==='income'?'var(--success)':'var(--danger)'};">${b.type==='income'?'+':'-'}$${(+b.amt).toFixed(2)}</span></div>`).join('');
}

// ════════════════════════════════════════════════════════════
// OVERDUE
// ════════════════════════════════════════════════════════════
function checkOverdueTasks(){
  const today=new Date().toISOString().split('T')[0];
  const ov=tasks.filter(t=>!t.completed&&t.date&&t.date<today&&!t.overdueHandled);
  if(ov.length>0){
    activeOverdueTask=ov[0];
    const modal=document.getElementById('overdueModal'),titleEl=document.getElementById('overdueModalTitle'),msgEl=document.getElementById('overdueModalMsg');
    if(modal&&titleEl&&msgEl){titleEl.textContent='Task Overdue';msgEl.textContent=`"${activeOverdueTask.name}" was due on ${activeOverdueTask.date}. What would you like to do?`;modal.classList.remove('hidden');}
    addNotification('Overdue Task',`"${activeOverdueTask.name}" missed its due date.`,'alert-circle');
  }
}
window.resolveOverdue=action=>{
  if(!activeOverdueTask)return;
  const today=new Date();
  const ndi=document.getElementById('overdueNewDate'),cb=document.getElementById('overdueConfirmNew');
  if(action==='suggest'){const tom=new Date(today);tom.setDate(tom.getDate()+1);activeOverdueTask.date=fmtDate(tom);activeOverdueTask.overdueHandled=false;finishOverdueResolve(`Rescheduled to ${activeOverdueTask.date}.`);}
  else if(action==='nextweek'){const nw=new Date(today);nw.setDate(nw.getDate()+7);activeOverdueTask.date=fmtDate(nw);activeOverdueTask.overdueHandled=false;finishOverdueResolve(`Moved to ${activeOverdueTask.date}.`);}
  else if(action==='new'){if(ndi)ndi.style.display='block';if(cb)cb.classList.remove('hidden');}
};
window.confirmNewDate=()=>{const ndi=document.getElementById('overdueNewDate');if(!ndi?.value){showToast('Pick a date.','warning');return;}if(activeOverdueTask){activeOverdueTask.date=ndi.value;activeOverdueTask.overdueHandled=false;finishOverdueResolve(`Rescheduled to ${ndi.value}.`);}};
function finishOverdueResolve(msg){saveTasks();renderTasks();renderCalendar();renderDashStats();showToast(msg,'success');activeOverdueTask=null;document.getElementById('overdueModal').classList.add('hidden');const ndi=document.getElementById('overdueNewDate');const cb=document.getElementById('overdueConfirmNew');if(ndi)ndi.style.display='none';if(cb)cb.classList.add('hidden');}

// ════════════════════════════════════════════════════════════
// NOTES (Rich Text)
// ════════════════════════════════════════════════════════════
window.openNoteModal=(id=null)=>{
  currentNoteId=id; noteTags=[]; noteAttachments=[];
  const modal=document.getElementById('noteModal');
  if(id){
    const n=notes.find(n=>n.id===id);
    if(n){
      document.getElementById('noteTitleInput').value=n.title||'';
      document.getElementById('noteEditorBody').innerHTML=n.html||'';
      noteTags=[...(n.tags||[])];
      noteAttachments=[...(n.attachments||[])];
    }
  } else {
    document.getElementById('noteTitleInput').value='';
    document.getElementById('noteEditorBody').innerHTML='';
  }
  renderNoteTagsDisplay();
  renderNoteAttachments();
  modal.classList.remove('hidden');
  setTimeout(()=>document.getElementById('noteEditorBody')?.focus(),100);
};
window.closeNoteModal=()=>{ document.getElementById('noteModal').classList.add('hidden'); };

window.saveNote=()=>{
  const title=document.getElementById('noteTitleInput').value.trim()||'Untitled Note';
  const body=document.getElementById('noteEditorBody');
  const html=body?.innerHTML||'';
  const plainText=body?.innerText||'';
  const note={id:currentNoteId||uid(),title,html,plainText,tags:[...noteTags],attachments:[...noteAttachments],date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})};
  if(currentNoteId){const idx=notes.findIndex(n=>n.id===currentNoteId);if(idx>-1)notes[idx]=note;else notes.unshift(note);}
  else notes.unshift(note);
  S.set('notes',notes);
  closeNoteModal();
  renderNotes();
  showToast('Note saved.','success');
};

window.deleteNote=id=>{
  const n=notes.find(n=>n.id===id);if(n)softDelete({type:'note',item:n});
  notes=notes.filter(n=>n.id!==id);S.set('notes',notes);renderNotes();showToast('Note deleted.','info');
};

// Rich text commands
window.rteExec=(cmd,val=null)=>{ document.getElementById('noteEditorBody')?.focus(); document.execCommand(cmd,false,val); };

window.insertChecklist=()=>{
  const body=document.getElementById('noteEditorBody');if(!body)return;
  const div=document.createElement('div');
  div.style.cssText='display:flex;align-items:center;gap:8px;margin:4px 0;';
  div.innerHTML='<input type="checkbox" style="accent-color:var(--neon-color);width:15px;height:15px;"><span contenteditable="true">Task item</span>';
  const sel=window.getSelection();
  if(sel.rangeCount>0 && body.contains(sel.getRangeAt(0).commonAncestorContainer)){
    const range=sel.getRangeAt(0);range.collapse(false);range.insertNode(div);
  } else { body.appendChild(div); }
  div.querySelector('span')?.focus();
};

window.insertTable=()=>{
  const rows=prompt('Number of rows:',3),cols=prompt('Number of columns:',3);
  if(!rows||!cols)return;
  let html='<table><thead><tr>';
  for(let c=0;c<+cols;c++)html+=`<th>Header ${c+1}</th>`;
  html+='</tr></thead><tbody>';
  for(let r=0;r<+rows-1;r++){html+='<tr>';for(let c=0;c<+cols;c++)html+=`<td>Cell</td>`;html+='</tr>';}
  html+='</tbody></table>';
  document.getElementById('noteEditorBody')?.focus();
  document.execCommand('insertHTML',false,html);
};

window.insertNoteLink=()=>{
  const url=prompt('Enter URL:');if(!url)return;
  document.execCommand('createLink',false,url);
};

window.triggerNoteImage=()=>document.getElementById('noteImageInput')?.click();

window.handleNoteFile=input=>{
  const files=Array.from(input.files||[]);
  files.forEach(f=>{
    const type=f.type.startsWith('image')?'image':f.type==='application/pdf'?'pdf':f.type.startsWith('video')?'video':'file';
    noteAttachments.push({name:f.name,type,size:formatFileSize(f.size)});
    // For images — show inline preview
    if(type==='image'){
      const reader=new FileReader();
      reader.onload=e=>{
        document.getElementById('noteEditorBody')?.focus();
        document.execCommand('insertHTML',false,`<img src="${e.target.result}" style="max-width:100%;border-radius:8px;margin:8px 0;" alt="${f.name}">`);
      };
      reader.readAsDataURL(f);
    }
  });
  renderNoteAttachments();
  input.value='';
};

function renderNoteAttachments(){
  const el=document.getElementById('noteAttachments');if(!el)return;
  el.innerHTML=noteAttachments.map((a,i)=>`
    <div class="note-attachment-chip">
      <i data-lucide="${a.type==='image'?'image':a.type==='pdf'?'file-text':a.type==='video'?'video':'paperclip'}" style="width:13px;height:13px;color:var(--neon-color);"></i>
      <span>${escHtml(a.name)}</span>
      <span style="opacity:.5;font-size:.7rem;">${a.size}</span>
      <button onclick="removeAttachment(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;padding:0;margin-left:4px;font-size:.75rem;">x</button>
    </div>`).join('');
  lucide.createIcons();
}
window.removeAttachment=i=>{noteAttachments.splice(i,1);renderNoteAttachments();};

// Tags
window.handleTagKey=e=>{ if(e.key==='Enter'||e.key===','){e.preventDefault();const val=e.target.value.trim().replace(/,$/,'');if(val&&!noteTags.includes(val)){noteTags.push(val);renderNoteTagsDisplay();}e.target.value='';} };
function renderNoteTagsDisplay(){
  const el=document.getElementById('noteTagsDisplay');if(!el)return;
  el.innerHTML=noteTags.map((t,i)=>`<span class="note-tag-chip">${escHtml(t)}<button onclick="removeNoteTag(${i})" style="background:none;border:none;color:inherit;cursor:pointer;margin-left:4px;font-size:.7rem;">x</button></span>`).join('');
}
window.removeNoteTag=i=>{noteTags.splice(i,1);renderNoteTagsDisplay();};

// Render notes grid
window.searchNotes=query=>{renderNotes(query);};

function renderNotes(query=''){
  const grid=document.getElementById('notesGrid');if(!grid)return;
  let filtered=[...notes];
  if(query)filtered=filtered.filter(n=>(n.title||'').toLowerCase().includes(query.toLowerCase())||(n.plainText||'').toLowerCase().includes(query.toLowerCase()));

  if(filtered.length===0){grid.innerHTML='<div class="empty-state">No notes found.</div>';return;}
  grid.innerHTML=filtered.map(n=>`
    <div class="note-card" onclick="openNoteModal(${n.id})">
      <button class="note-del-btn" onclick="event.stopPropagation();deleteNote(${n.id})"><i data-lucide="x" style="width:13px;height:13px;vertical-align:middle;"></i></button>
      <div class="note-card-title">${escHtml(n.title||'Untitled')}</div>
      <div class="note-card-body">${escHtml(n.plainText||'').slice(0,120)}</div>
      <div class="note-card-footer">
        <div class="note-card-date"><i data-lucide="calendar" style="width:12px;height:12px;vertical-align:middle;margin-right:4px;"></i>${n.date}</div>
        <div class="note-card-tags">${(n.tags||[]).map(t=>`<span class="note-tag-chip">${escHtml(t)}</span>`).join('')}</div>
      </div>
    </div>`).join('');
  lucide.createIcons();
}

// ════════════════════════════════════════════════════════════
// POMODORO
// ════════════════════════════════════════════════════════════
function getPomoLengths(){return{work:(+document.getElementById('pomoWorkLen')?.value||25)*60,short:(+document.getElementById('pomoShortLen')?.value||5)*60,long:(+document.getElementById('pomoLongLen')?.value||15)*60};}
window.setPomoMode=(mode,btn)=>{pomoMode=mode;document.querySelectorAll('.pomo-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');resetPomo();};
window.togglePomo=()=>{
  if(pomoRunning){clearInterval(pomoInterval);pomoRunning=false;setIcon('pomoPlayIcon','play');}
  else{pomoRunning=true;setIcon('pomoPlayIcon','pause');pomoInterval=setInterval(pomoTick,1000);}
};
function pomoTick(){if(pomoSecondsLeft<=0){clearInterval(pomoInterval);pomoRunning=false;setIcon('pomoPlayIcon','play');onPomoComplete();return;}pomoSecondsLeft--;updatePomoDisplay();}
function updatePomoDisplay(){
  const el=document.getElementById('pomoDisplay');if(el)el.textContent=formatTime(pomoSecondsLeft);
  const ring=document.getElementById('pomoRing');if(ring){const pct=pomoSecondsLeft/(pomoTotalSeconds||1);ring.style.strokeDashoffset=(2*Math.PI*96)*(1-pct);}
}
function onPomoComplete(){
  if(pomoMode==='work'){
    pomoTodaySessions++;pomoTodayMins+=Math.round(getPomoLengths().work/60);
    setText('pomoTodaySessions',pomoTodaySessions);setText('pomoTodayMins',pomoTodayMins);
    showToast('Focus session complete! Time for a break.','success');
    addNotification('Pomodoro Complete',`Session ${pomoSession} done. Take a break!`,'timer');
    const nextMode=(pomoSession%4===0)?'long':'short';
    if(pomoSession%4===0)pomoSession=1;else pomoSession++;
    setText('pomoSessionNum',pomoSession);
    if(document.getElementById('pomoAutoBreak')?.checked)switchPomoModeSilent(nextMode);
  } else {
    showToast('Break over — time to focus!','info');
    addNotification('Break Ended','Ready to focus?','play');
    if(document.getElementById('pomoAutoBreak')?.checked)switchPomoModeSilent('work');
  }
  const bl=document.getElementById('pomoBreakLabel');
  if(bl)bl.textContent=pomoMode==='work'?`Next: ${pomoSession%4===0?'Long':'Short'} Break`:'Next: Focus Session';
  playBeep();
}
function switchPomoModeSilent(mode){
  pomoMode=mode;
  document.querySelectorAll('.pomo-tab').forEach((b,i)=>b.classList.toggle('active',['work','short','long'][i]===mode));
  resetPomo();setTimeout(()=>{if(!pomoRunning)window.togglePomo();},800);
}
window.resetPomo=()=>{
  clearInterval(pomoInterval);pomoRunning=false;setIcon('pomoPlayIcon','play');
  const l=getPomoLengths();pomoSecondsLeft=l[pomoMode];pomoTotalSeconds=l[pomoMode];updatePomoDisplay();
  const ml=document.getElementById('pomoModeLabel');if(ml)ml.textContent=pomoMode==='work'?'FOCUS':pomoMode==='short'?'SHORT BREAK':'LONG BREAK';
};
window.skipPomo=()=>onPomoComplete();
window.updatePomoSettings=()=>{if(!pomoRunning)resetPomo();};

// ════════════════════════════════════════════════════════════
// BASIC TIMER
// ════════════════════════════════════════════════════════════
window.toggleBasicTimer=()=>{
  if(basicRunning){clearInterval(basicInterval);basicRunning=false;setIcon('basicTimerIcon','play');document.getElementById('basicTimerStartBtn').classList.remove('primary');}
  else{
    if(basicSecondsLeft<=0){const h=+document.getElementById('btiH').value||0,m=+document.getElementById('btiM').value||0,s=+document.getElementById('btiS').value||0;basicSecondsLeft=h*3600+m*60+s;}
    if(basicSecondsLeft<=0){showToast('Set a time > 0.','warning');return;}
    basicRunning=true;setIcon('basicTimerIcon','pause');document.getElementById('basicTimerStartBtn').classList.add('primary');
    basicInterval=setInterval(basicTick,1000);updateBasicDisplay();
  }
};
function basicTick(){if(basicSecondsLeft<=0){clearInterval(basicInterval);basicRunning=false;setIcon('basicTimerIcon','play');document.getElementById('basicTimerStartBtn')?.classList.remove('primary');showToast('Timer complete!','success');addNotification('Timer Done','Your countdown finished.','clock');playBeep();return;}basicSecondsLeft--;updateBasicDisplay();}
function updateBasicDisplay(){const el=document.getElementById('basicTimerDisplay');if(el)el.textContent=formatTime(basicSecondsLeft,true);}
window.resetBasicTimer=()=>{clearInterval(basicInterval);basicRunning=false;basicSecondsLeft=0;setIcon('basicTimerIcon','play');document.getElementById('basicTimerStartBtn')?.classList.remove('primary');const el=document.getElementById('basicTimerDisplay');if(el)el.textContent='00:00:00';};

// ════════════════════════════════════════════════════════════
// SCIENTIFIC CALCULATOR
// ════════════════════════════════════════════════════════════
window.setCalcMode=mode=>{
  calcMode=mode;
  document.getElementById('calcModeBasicBtn')?.classList.toggle('active',mode==='basic');
  document.getElementById('calcModeSciBtn')?.classList.toggle('active',mode==='sci');
  document.getElementById('calcBasicGrid')?.classList.toggle('hidden',mode!=='basic');
  document.getElementById('calcSciGrid')?.classList.toggle('hidden',mode!=='sci');
  lucide.createIcons();
};

window.calcAction=key=>{
  const display=document.getElementById('calcDisplay'),exprEl=document.getElementById('calcExprDisplay');if(!display)return;
  if(key==='clear'){calcExpression='';calcJustEvaled=false;display.textContent='0';if(exprEl)exprEl.textContent='';return;}
  if(key==='backspace'){if(calcJustEvaled){calcExpression='';calcJustEvaled=false;display.textContent='0';if(exprEl)exprEl.textContent='';return;}calcExpression=calcExpression.slice(0,-1);display.textContent=calcExpression||'0';if(exprEl)exprEl.textContent=calcExpression;return;}
  if(key==='='){
    try{
      let expr=calcExpression.replace(/×/g,'*').replace(/÷/g,'/');
      // eslint-disable-next-line no-new-func
      const result=Function('"use strict";return('+expr+')')();
      const rounded=+result.toFixed(10);
      if(exprEl)exprEl.textContent=calcExpression+' =';
      calcExpression=String(rounded);display.textContent=rounded;calcJustEvaled=true;
    }catch{display.textContent='Error';calcExpression='';if(exprEl)exprEl.textContent='';}
    return;
  }
  if(['+','-','*','/'].includes(key)){calcJustEvaled=false;calcExpression+=key;display.textContent=calcExpression;if(exprEl)exprEl.textContent=calcExpression;return;}
  if(calcJustEvaled&&!['.','(',')'].includes(key)){calcExpression=key;calcJustEvaled=false;}else calcExpression+=key;
  display.textContent=calcExpression;if(exprEl)exprEl.textContent=calcExpression;
};

window.calcSci=fn=>{
  const display=document.getElementById('calcDisplay');if(!display)return;
  let val=parseFloat(calcExpression)||0;
  let result;
  try{
    switch(fn){
      case'sin':  result=Math.sin(val*Math.PI/180);break;
      case'cos':  result=Math.cos(val*Math.PI/180);break;
      case'tan':  result=Math.tan(val*Math.PI/180);break;
      case'log':  result=Math.log10(val);break;
      case'ln':   result=Math.log(val);break;
      case'sqrt': result=Math.sqrt(val);break;
      case'pow2': result=Math.pow(val,2);break;
      case'pow3': result=Math.pow(val,3);break;
      case'inv':  result=1/val;break;
      case'pi':   result=Math.PI;break;
      case'e':    result=Math.E;break;
      case'fact': { let f=1;for(let i=2;i<=Math.round(val);i++)f*=i;result=f;break; }
      case'pct':  result=val/100;break;
      case'abs':  result=Math.abs(val);break;
      default:    return;
    }
    result=+result.toFixed(10);
    calcExpression=String(result);display.textContent=result;calcJustEvaled=true;
    const exprEl=document.getElementById('calcExprDisplay');if(exprEl)exprEl.textContent=`${fn}(${val}) =`;
  }catch{display.textContent='Error';calcExpression='';}
};

// ════════════════════════════════════════════════════════════
// CURRENCY CONVERTER
// ════════════════════════════════════════════════════════════
const CURRENCY_RATES = {
  USD:1,EUR:0.92,GBP:0.79,JPY:149.5,CAD:1.36,AUD:1.53,CHF:0.89,CNY:7.24,
  INR:83.1,MXN:17.2,BRL:4.97,KRW:1325,SGD:1.34,HKD:7.82,NOK:10.6,
  SEK:10.4,DKK:6.88,NZD:1.63,ZAR:18.6,AED:3.67,SAR:3.75,THB:35.1,
  MYR:4.72,PHP:55.8,TRY:30.2,PLN:3.98,CZK:22.6,HUF:358,RUB:91.5,IDR:15750
};
const CURRENCY_NAMES={USD:'US Dollar',EUR:'Euro',GBP:'British Pound',JPY:'Japanese Yen',CAD:'Canadian Dollar',AUD:'Australian Dollar',CHF:'Swiss Franc',CNY:'Chinese Yuan',INR:'Indian Rupee',MXN:'Mexican Peso',BRL:'Brazilian Real',KRW:'South Korean Won',SGD:'Singapore Dollar',HKD:'Hong Kong Dollar',NOK:'Norwegian Krone',SEK:'Swedish Krona',DKK:'Danish Krone',NZD:'New Zealand Dollar',ZAR:'South African Rand',AED:'UAE Dirham',SAR:'Saudi Riyal',THB:'Thai Baht',MYR:'Malaysian Ringgit',PHP:'Philippine Peso',TRY:'Turkish Lira',PLN:'Polish Zloty',CZK:'Czech Koruna',HUF:'Hungarian Forint',RUB:'Russian Ruble',IDR:'Indonesian Rupiah'};

function populateCurrencyDropdowns(){
  const from=document.getElementById('currencyFrom'),to=document.getElementById('currencyTo');if(!from||!to)return;
  const currencies=Object.keys(CURRENCY_RATES);
  const opts=currencies.map(c=>`<option value="${c}">${c} — ${CURRENCY_NAMES[c]||c}</option>`).join('');
  from.innerHTML=opts;to.innerHTML=opts;
  from.value='USD';to.value='EUR';
  convertCurrency();
}

window.convertCurrency=()=>{
  const from=document.getElementById('currencyFrom')?.value,to=document.getElementById('currencyTo')?.value;
  const amt=+document.getElementById('currencyFromAmt')?.value||0;
  const rateFrom=CURRENCY_RATES[from]||1,rateTo=CURRENCY_RATES[to]||1;
  const result=(amt/rateFrom)*rateTo;
  const toInput=document.getElementById('currencyToAmt');if(toInput)toInput.value=result.toFixed(4);
  const rateEl=document.getElementById('currencyRateDisplay');
  if(rateEl)rateEl.textContent=`1 ${from} = ${((1/rateFrom)*rateTo).toFixed(6)} ${to}  (Indicative rates)`;
};

window.swapCurrencies=()=>{
  const from=document.getElementById('currencyFrom'),to=document.getElementById('currencyTo');
  if(!from||!to)return;[from.value,to.value]=[to.value,from.value];convertCurrency();
};

// ════════════════════════════════════════════════════════════
// GROCERIES
// ════════════════════════════════════════════════════════════
window.addGroceryItem=()=>{
  const nameEl=document.getElementById('groceryItemInput'),qtyEl=document.getElementById('groceryQtyInput'),catEl=document.getElementById('groceryCatInput');
  const name=nameEl?.value.trim();if(!name){showToast('Enter an item name.','warning');return;}
  groceries.push({id:uid(),name,qty:+qtyEl.value||1,cat:catEl.value,checked:false});
  S.set('groceries',groceries);if(nameEl)nameEl.value='';if(qtyEl)qtyEl.value='1';renderGroceries();renderGroceryChart();
};
window.toggleGroceryItem=id=>{const i=groceries.find(g=>g.id===id);if(i){i.checked=!i.checked;S.set('groceries',groceries);renderGroceries();}};
window.deleteGroceryItem=id=>{const i=groceries.find(g=>g.id===id);if(i)softDelete({type:'grocery',item:i});groceries=groceries.filter(g=>g.id!==id);S.set('groceries',groceries);renderGroceries();renderGroceryChart();};
window.addFreqItem=name=>{groceries.push({id:uid(),name,qty:1,cat:'Other',checked:false});S.set('groceries',groceries);renderGroceries();renderGroceryChart();showToast(`${name} added.`,'success');};
function renderGroceries(){
  const list=document.getElementById('groceryList');if(!list)return;
  list.innerHTML=groceries.length===0?'<li style="padding:12px;opacity:.5;font-size:.85rem;font-family:var(--font-mono);">List is empty.</li>'
    :groceries.map(g=>`<li style="border-left-color:${g.checked?'var(--success)':'var(--border)'};">
        <div style="display:flex;align-items:center;gap:10px;flex:1;">
          <input type="checkbox" ${g.checked?'checked':''} onchange="toggleGroceryItem(${g.id})" style="accent-color:var(--neon-color);">
          <span class="${g.checked?'strikethrough':''}">${escHtml(g.name)} <span style="opacity:.5;font-size:.75rem;">×${g.qty}</span></span>
          <span style="font-size:.68rem;font-family:var(--font-mono);opacity:.5;margin-left:auto;">${g.cat}</span>
        </div>
        <button class="delete-btn" onclick="deleteGroceryItem(${g.id})"><i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:middle;"></i></button>
      </li>`).join('');
  const freqGrid=document.getElementById('freqBoughtGrid');
  if(freqGrid){const items=['Milk','Eggs','Bread','Butter','Coffee','Rice','Pasta','Chicken'];freqGrid.innerHTML=items.map(item=>`<div class="freq-item" onclick="addFreqItem('${item}')"><i data-lucide="plus-circle" style="width:14px;height:14px;color:var(--neon-color);"></i><span>${item}</span></div>`).join('');}
  lucide.createIcons();
}
function renderGroceryChart(){
  const canvas=document.getElementById('groceryChart');if(!canvas)return;
  const catCounts={};groceries.forEach(g=>{catCounts[g.cat]=(catCounts[g.cat]||0)+g.qty;});
  const labels=Object.keys(catCounts),data=Object.values(catCounts);
  const colors=['#00f2ff','#7b61ff','#ff4d6d','#ffd166','#06d6a0','#118ab2','#ef476f','#a8dadc'];
  if(groceryChartInst)groceryChartInst.destroy();
  groceryChartInst=new Chart(canvas,{type:'bar',data:{labels,datasets:[{label:'Items',data,backgroundColor:colors.slice(0,labels.length),borderRadius:6,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#e6f1ff'}},y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#e6f1ff',stepSize:1}}}}});
}

// ════════════════════════════════════════════════════════════
// BUDGET
// ════════════════════════════════════════════════════════════
window.openBudgetEntryModal=()=>{document.getElementById('budgetDate').value=new Date().toISOString().split('T')[0];document.getElementById('budgetModal').classList.remove('hidden');};
window.closeBudgetModal=()=>document.getElementById('budgetModal').classList.add('hidden');
window.saveBudgetEntry=()=>{
  const type=document.getElementById('budgetType').value,desc=document.getElementById('budgetDesc').value.trim(),amt=+document.getElementById('budgetAmt').value,date=document.getElementById('budgetDate').value,cat=document.getElementById('budgetCat').value;
  if(!desc||!amt||!date){showToast('Fill in all fields.','warning');return;}
  budgetEntries.push({id:uid(),type,desc,amt,cat,date});S.set('budget',budgetEntries);closeBudgetModal();renderBudget();renderBudgetChart();showToast('Entry saved.','success');
};
window.deleteBudgetEntry=id=>{const e=budgetEntries.find(b=>b.id===id);if(e)softDelete({type:'budget',item:e});budgetEntries=budgetEntries.filter(b=>b.id!==id);S.set('budget',budgetEntries);renderBudget();renderBudgetChart();};
function renderBudget(){
  const income=budgetEntries.filter(b=>b.type==='income').reduce((s,b)=>s+(+b.amt),0);
  const expense=budgetEntries.filter(b=>b.type==='expense').reduce((s,b)=>s+(+b.amt),0);
  setText('bIncome',`$${income.toFixed(2)}`);setText('bExpense',`$${expense.toFixed(2)}`);setText('bBalance',`$${(income-expense).toFixed(2)}`);
  const listEl=document.getElementById('budgetList');if(!listEl)return;
  if(!budgetEntries.length){listEl.innerHTML='<div style="opacity:.5;font-family:var(--font-mono);font-size:.82rem;padding:12px;">No transactions yet.</div>';return;}
  listEl.innerHTML=[...budgetEntries].sort((a,b)=>b.date>a.date?1:-1).map(b=>`
    <div class="budget-item ${b.type}">
      <div class="budget-item-left"><div class="budget-item-desc">${escHtml(b.desc)}</div><div class="budget-item-meta">${b.cat} · ${b.date}</div></div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="budget-item-amt ${b.type}">${b.type==='income'?'+':'-'}$${(+b.amt).toFixed(2)}</span>
        <button class="delete-btn" onclick="deleteBudgetEntry(${b.id})"><i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:middle;"></i></button>
      </div>
    </div>`).join('');
  lucide.createIcons();
}
function renderBudgetChart(){
  const canvas=document.getElementById('budgetChart');if(!canvas)return;
  const catExpenses={};budgetEntries.filter(b=>b.type==='expense').forEach(b=>{catExpenses[b.cat]=(catExpenses[b.cat]||0)+(+b.amt);});
  const income=budgetEntries.filter(b=>b.type==='income').reduce((s,b)=>s+(+b.amt),0);
  const expense=budgetEntries.filter(b=>b.type==='expense').reduce((s,b)=>s+(+b.amt),0);
  const labels=Object.keys(catExpenses),data=Object.values(catExpenses);
  if(budgetChartInst)budgetChartInst.destroy();
  budgetChartInst=new Chart(canvas,{type:'bar',data:{labels:['Income','Expenses',...labels],datasets:[{label:'Amount ($)',data:[income,expense,...data],backgroundColor:['rgba(6,214,160,.7)','rgba(255,77,109,.7)',...labels.map((_,i)=>`hsla(${(i*47)%360},70%,60%,.7)`)],borderRadius:7,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#e6f1ff',font:{size:11}}},y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#e6f1ff',callback:v=>'$'+v}}}}});
}

// ════════════════════════════════════════════════════════════
// JOURNAL
// ════════════════════════════════════════════════════════════
window.openJournalModal=()=>{document.getElementById('journalModalTitle').textContent='New Journal Entry';document.getElementById('journalTitleInput').value='';document.getElementById('journalBodyInput').value='';document.getElementById('journalModal').classList.remove('hidden');};
window.closeJournalModal=()=>document.getElementById('journalModal').classList.add('hidden');
window.saveJournalEntry=()=>{
  const title=document.getElementById('journalTitleInput').value.trim(),body=document.getElementById('journalBodyInput').value.trim();
  if(!title&&!body){showToast('Write something first.','warning');return;}
  journalEntries.unshift({id:uid(),title:title||'Untitled Entry',body,date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})});
  S.set('journal',journalEntries);closeJournalModal();renderJournal();showToast('Journal entry saved.','success');
};
window.deleteJournalEntry=id=>{const e=journalEntries.find(j=>j.id===id);if(e)softDelete({type:'journal',item:e});journalEntries=journalEntries.filter(j=>j.id!==id);S.set('journal',journalEntries);renderJournal();};
function renderJournal(){
  const grid=document.getElementById('journalGrid');if(!grid)return;
  grid.innerHTML=journalEntries.length===0?'<div class="empty-state">No journal entries yet. Start writing!</div>'
    :journalEntries.map(j=>`
      <div class="journal-card">
        <button class="journal-del-btn" onclick="event.stopPropagation();deleteJournalEntry(${j.id})"><i data-lucide="x" style="width:13px;height:13px;vertical-align:middle;"></i></button>
        <div class="journal-card-title">${escHtml(j.title)}</div>
        <div class="journal-card-body">${escHtml(j.body)}</div>
        <div class="journal-card-date"><i data-lucide="calendar" style="width:12px;height:12px;vertical-align:middle;margin-right:4px;"></i>${j.date}</div>
      </div>`).join('');
  lucide.createIcons();
}

// ════════════════════════════════════════════════════════════
// MOOD
// ════════════════════════════════════════════════════════════
window.selectMood=btn=>{document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');};
window.logMood=()=>{
  const activeBtn=document.querySelector('.mood-btn.active');if(!activeBtn){showToast('Select a mood first.','warning');return;}
  const score=+activeBtn.dataset.mood,label=activeBtn.dataset.label;
  const icons={5:'sun',4:'smile',3:'minus-circle',2:'cloud',1:'cloud-rain'};
  const note=document.getElementById('moodNote')?.value.trim()||'';
  moodLogs.unshift({id:uid(),score,label,icon:icons[score],note,date:new Date().toISOString().split('T')[0]});
  if(moodLogs.length>90)moodLogs.pop();S.set('mood',moodLogs);
  document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('active'));
  const noteEl=document.getElementById('moodNote');if(noteEl)noteEl.value='';
  renderMoodHistory();renderMoodChart();showToast(`Mood logged: ${label}`,'success');
};
function renderMoodHistory(){
  const el=document.getElementById('moodHistory');if(!el)return;
  el.innerHTML=moodLogs.length===0?'<div style="opacity:.5;font-family:var(--font-mono);font-size:.82rem;padding:10px;">No mood entries yet.</div>'
    :moodLogs.slice(0,14).map(m=>`
      <div class="mood-entry">
        <div class="mood-entry-icon"><i data-lucide="${m.icon}" style="width:16px;height:16px;"></i></div>
        <div class="mood-entry-body"><div class="mood-entry-label">${m.label} <span style="font-family:var(--font-mono);font-size:.72rem;opacity:.5;">(${m.score}/5)</span></div>${m.note?`<div class="mood-entry-note">${escHtml(m.note)}</div>`:''}</div>
        <div class="mood-entry-date">${m.date}</div>
      </div>`).join('');
  lucide.createIcons();
}
function renderMoodChart(){
  const canvas=document.getElementById('moodChart');if(!canvas)return;
  const neon=getComputedStyle(document.documentElement).getPropertyValue('--neon-color').trim()||'#00f2ff';
  const days=[],scores=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toISOString().split('T')[0];const entry=moodLogs.find(m=>m.date===ds);days.push(d.toLocaleDateString('en-US',{weekday:'short'}));scores.push(entry?entry.score:null);}
  if(moodChartInst)moodChartInst.destroy();
  moodChartInst=new Chart(canvas,{type:'line',data:{labels:days,datasets:[{label:'Mood',data:scores,borderColor:neon,backgroundColor:neon+'22',tension:.4,fill:true,pointBackgroundColor:neon,pointRadius:5,spanGaps:true}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#e6f1ff'}},y:{min:1,max:5,grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#e6f1ff',stepSize:1,callback:v=>['','Difficult','Low','Neutral','Good','Excellent'][v]||v}}}}});
}

// ════════════════════════════════════════════════════════════
// PLANNER
// ════════════════════════════════════════════════════════════
window.addDailyGoal=()=>{const i=document.getElementById('dailyGoalInput'),text=i?.value.trim();if(!text)return;dailyGoals.push({id:uid(),text,done:false});S.set('dailyGoals',dailyGoals);i.value='';renderPlannerView();};
window.toggleDailyGoal=id=>{const g=dailyGoals.find(g=>g.id===id);if(g){g.done=!g.done;S.set('dailyGoals',dailyGoals);renderPlannerView();}};
window.deleteDailyGoal=id=>{dailyGoals=dailyGoals.filter(g=>g.id!==id);S.set('dailyGoals',dailyGoals);renderPlannerView();};
window.addAffirmation=()=>{const i=document.getElementById('affirmationInput'),text=i?.value.trim();if(!text)return;affirmations.push({id:uid(),text});S.set('affirmations',affirmations);i.value='';renderAffirmationDisplay();renderPlannerView();};
window.deleteAffirmation=id=>{affirmations=affirmations.filter(a=>a.id!==id);S.set('affirmations',affirmations);renderAffirmationDisplay();renderPlannerView();};
function renderAffirmationDisplay(){
  const el=document.getElementById('affirmationDisplay');if(!el)return;
  if(!affirmations.length){el.textContent='Add your first affirmation below.';return;}
  const day=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/86400000);
  const chosen=affirmations[day%affirmations.length];
  el.innerHTML=`<i data-lucide="quote" style="width:14px;height:14px;vertical-align:middle;margin-right:6px;opacity:.5;"></i>${escHtml(chosen.text)}`;
  lucide.createIcons();
}
function renderPlannerView(){
  const goalList=document.getElementById('dailyGoalList');
  if(goalList)goalList.innerHTML=dailyGoals.length===0?'<li style="padding:10px;opacity:.5;font-size:.85rem;font-family:var(--font-mono);">No daily goals set.</li>'
    :dailyGoals.map(g=>`<li class="${g.done?'priority-low':'priority-medium'}"><div style="display:flex;align-items:center;gap:10px;flex:1;"><input type="checkbox" ${g.done?'checked':''} onchange="toggleDailyGoal(${g.id})" style="accent-color:var(--neon-color);"><span class="${g.done?'strikethrough':''}">${escHtml(g.text)}</span></div><button class="delete-btn" onclick="deleteDailyGoal(${g.id})"><i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:middle;"></i></button></li>`).join('');
  const affList=document.getElementById('affirmationList');
  if(affList)affList.innerHTML=affirmations.length===0?'<li style="padding:10px;opacity:.5;font-size:.85rem;font-family:var(--font-mono);">No affirmations yet.</li>'
    :affirmations.map(a=>`<li class="priority-low"><div style="flex:1;font-style:italic;font-size:.88rem;">${escHtml(a.text)}</div><button class="delete-btn" onclick="deleteAffirmation(${a.id})"><i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:middle;"></i></button></li>`).join('');
  const plannerEl=document.getElementById('weeklyPlanner');
  if(plannerEl){
    const now=new Date(),sun=new Date(now);sun.setDate(now.getDate()-now.getDay());
    const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    plannerEl.innerHTML=dayNames.map((name,i)=>{
      const d=new Date(sun);d.setDate(sun.getDate()+i);const ds=fmtDate(d);const dayTasks=tasks.filter(t=>t.date===ds&&!t.completed);const isToday=ds===fmtDate(now);
      return`<div class="week-day-col" style="${isToday?'border-color:var(--neon-color);':''}"><div class="week-day-label" style="${isToday?'color:var(--neon-color);':''}">${name}<br><span style="font-size:.65rem;opacity:.6;">${d.getDate()}</span></div><div class="week-day-tasks">${dayTasks.length===0?'<span style="font-size:.65rem;opacity:.3;font-family:var(--font-mono);">—</span>':dayTasks.slice(0,4).map(t=>`<span class="week-task-chip" style="border-left-color:${t.priority==='high'?'var(--danger)':t.priority==='low'?'var(--success)':'var(--warning)'};">${escHtml(t.name)}</span>`).join('')}</div></div>`;
    }).join('');
  }
  lucide.createIcons();
}

// ════════════════════════════════════════════════════════════
// RECENTLY DELETED
// ════════════════════════════════════════════════════════════
function softDelete(entry){deletedItems.unshift({...entry,deletedAt:new Date().toLocaleString()});if(deletedItems.length>50)deletedItems.pop();S.set('deleted',deletedItems);}
window.openRecentlyDeleted=()=>{renderRecentlyDeleted();document.getElementById('recentlyDeletedModal').classList.remove('hidden');closeDropdowns();};
window.closeRecentlyDeleted=()=>document.getElementById('recentlyDeletedModal').classList.add('hidden');
window.clearAllDeleted=()=>{if(!confirm('Permanently clear all deleted items?'))return;deletedItems=[];S.set('deleted',deletedItems);renderRecentlyDeleted();showToast('Cleared.','info');};
window.restoreDeletedItem=idx=>{
  const e=deletedItems[idx];if(!e)return;
  if(e.type==='task'){tasks.push(e.item);saveTasks();renderTasks();renderCalendar();renderDashStats();}
  if(e.type==='grocery'){groceries.push(e.item);S.set('groceries',groceries);renderGroceries();}
  if(e.type==='budget'){budgetEntries.push(e.item);S.set('budget',budgetEntries);renderBudget();renderBudgetChart();}
  if(e.type==='journal'){journalEntries.push(e.item);S.set('journal',journalEntries);renderJournal();}
  if(e.type==='note'){notes.push(e.item);S.set('notes',notes);renderNotes();}
  deletedItems.splice(idx,1);S.set('deleted',deletedItems);renderRecentlyDeleted();showToast('Restored.','success');
};
window.permanentlyDelete=idx=>{deletedItems.splice(idx,1);S.set('deleted',deletedItems);renderRecentlyDeleted();};
function renderRecentlyDeleted(){
  const el=document.getElementById('recentlyDeletedList');if(!el)return;
  if(!deletedItems.length){el.innerHTML='<div style="text-align:center;opacity:.5;font-family:var(--font-mono);font-size:.82rem;padding:20px;">Nothing here.</div>';return;}
  const icons={task:'list-checks',grocery:'shopping-cart',budget:'wallet',journal:'notebook-pen',note:'sticky-note'};
  el.innerHTML=deletedItems.map((d,i)=>`
    <div style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid rgba(255,255,255,.06);">
      <i data-lucide="${icons[d.type]||'file'}" style="width:14px;height:14px;opacity:.5;flex-shrink:0;"></i>
      <div style="flex:1;"><div style="font-size:.875rem;font-weight:600;">${escHtml(d.item?.name||d.item?.title||d.item?.desc||'Item')}</div><div style="font-size:.72rem;font-family:var(--font-mono);opacity:.5;">${d.type} · ${d.deletedAt}</div></div>
      <button class="btn-ghost" style="font-size:.75rem;padding:5px 10px;" onclick="restoreDeletedItem(${i})">Restore</button>
      <button class="delete-btn" onclick="permanentlyDelete(${i})"><i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:middle;"></i></button>
    </div>`).join('');
  lucide.createIcons();
}

// ════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════
function uid()             { return Date.now()+Math.floor(Math.random()*100000); }
function pad(n)            { return String(n).padStart(2,'0'); }
function fmtDate(d)        { return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function setText(id,val)   { const el=document.getElementById(id);if(el)el.textContent=val; }
function setIcon(id,name)  { const el=document.getElementById(id);if(el){el.setAttribute('data-lucide',name);lucide.createIcons();} }
function escHtml(str='')   { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function capitalize(s)     { return s.charAt(0).toUpperCase()+s.slice(1); }
function formatTime(secs,showHours=false){ const h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=secs%60;return showHours?`${pad(h)}:${pad(m)}:${pad(s)}`:`${pad(m)}:${pad(s)}`; }
function formatFileSize(bytes){ if(bytes<1024)return bytes+'B';if(bytes<1048576)return(bytes/1024).toFixed(1)+'KB';return(bytes/1048576).toFixed(1)+'MB'; }
function playBeep(){
  try{const ctx=new(window.AudioContext||window.webkitAudioContext)(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.value=880;osc.type='sine';gain.gain.setValueAtTime(.3,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.8);osc.start(ctx.currentTime);osc.stop(ctx.currentTime+.8);}catch(e){}
}
