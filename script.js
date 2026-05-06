// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://bzwnjtofcduxllafdybw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl';
// Fixed: Using global "supabase" from CDN
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============================================================
   AUTH SYSTEM — Now using Supabase DB for Persistance
   ============================================================ */

// Helper to handle the UI session (Still useful for quick UI state)
function _saveLocalSession(user) {
    localStorage.setItem('lifeos_session', JSON.stringify(user));
}

// ── LOGIN WITH SUPABASE
window.handleLogin = async function() {
    const username = (document.getElementById('loginUsername')?.value || '').trim().toLowerCase();
    const password = document.getElementById('loginPassword')?.value || '';

    _hideAuthError('loginError');
    if (!username || !password) {
        _showAuthError('loginError', 'loginErrorMsg', 'Please enter your username and password.');
        return;
    }

    _setAuthBtnLoading('loginBtn', 'loginBtnLabel', true, 'Sign In');

    try {
        // Query user from Supabase
        const { data: user, error } = await db
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            throw new Error('No account found with that username.');
        }

        // Compare Hashed Passwords
        if (user.passwordHash !== _hashPassword(password)) {
            throw new Error('Incorrect password. Please try again.');
        }

        // Success
        _saveLocalSession(user);
        _bootApp(user);
    } catch (err) {
        _showAuthError('loginError', 'loginErrorMsg', err.message);
    } finally {
        _setAuthBtnLoading('loginBtn', 'loginBtnLabel', false, 'Sign In');
    }
};

// ── SIGN UP WITH SUPABASE
window.handleSignup = async function() {
    const displayName = (document.getElementById('signupDisplayName')?.value || '').trim();
    const username = (document.getElementById('signupUsername')?.value || '').trim().toLowerCase();
    const password = document.getElementById('signupPassword')?.value || '';
    const confirm = document.getElementById('signupConfirm')?.value || '';

    _hideAuthError('signupError');

    // Basic Validation
    if (username.length < 3) {
        _showAuthError('signupError', 'signupErrorMsg', 'Username too short.'); return;
    }
    if (password !== confirm) {
        _showAuthError('signupError', 'signupErrorMsg', 'Passwords do not match.'); return;
    }

    _setAuthBtnLoading('signupBtn', 'signupBtnLabel', true, 'Create Account');

    try {
        // Insert into Supabase
        const { error } = await db.from('users').insert([{
            username,
            displayName: displayName || username,
            passwordHash: _hashPassword(password),
            createdAt: new Date().toISOString()
        }]);

        if (error) {
            if (error.code === '23505') throw new Error('Username already taken.');
            throw error;
        }

        // UI Success
        document.getElementById('signupSuccess')?.classList.remove('hidden');
        setTimeout(() => showAuthPanel('login'), 1600);
    } catch (err) {
        _showAuthError('signupError', 'signupErrorMsg', err.message);
    } finally {
        _setAuthBtnLoading('signupBtn', 'signupBtnLabel', false, 'Create Account');
    }
};

/* ============================================================
   DATA SYNC — Replacing S.get/S.set with Supabase
   ============================================================ */

// Generic fetcher
async function syncDataFromCloud(table, localVarRef) {
    const session = JSON.parse(localStorage.getItem('lifeos_session'));
    if (!session) return;

    const { data, error } = await db
        .from(table)
        .select('*')
        .eq('user_id', session.username);
    
    if (!error && data) {
        return data;
    }
    return [];
}

// ════════════════════════════════════════════════════════════
// MODIFIED BOOT SEQUENCE
// ════════════════════════════════════════════════════════════
async function _bootApp(user) {
    userName = user.displayName || user.username;
    
    // FETCH DATA FROM SUPABASE INSTEAD OF LOCALSTORAGE
    tasks = await syncDataFromCloud('tasks') || [];
    groceries = await syncDataFromCloud('groceries') || [];
    budgetEntries = await syncDataFromCloud('budget') || [];

    // Proceed to show UI
    const screen = document.getElementById('authScreen');
    const app = document.getElementById('appContainer');

    screen.classList.add('auth-exit');
    setTimeout(() => {
        screen.classList.add('hidden');
        app.classList.remove('hidden');
        renderTasks();
        renderCalendar();
        renderGroceries();
        if (window.lucide) lucide.createIcons();
    }, 400);
}

// Simple Helper for Password Hashing
function _hashPassword(password) {
    let hash = 5381;
    for (let i = 0; i < password.length; i++) {
        hash = ((hash << 5) + hash) + password.charCodeAt(i);
        hash |= 0;
    }
    return hash.toString(36);
}
