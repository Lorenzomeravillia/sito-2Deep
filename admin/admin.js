// admin.js — 2 Deep Admin Panel

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) { alert((type === 'error' ? '⚠️ ' : '✓ ') + msg); return; }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

let tdAdmin = null;
let contentData = [];
let eventsData  = [];

document.addEventListener('DOMContentLoaded', () => {
    try {
        if (!window.supabase) throw new Error('Supabase CDN non caricato');
        if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) throw new Error('config.js mancante');
        tdAdmin = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, { db: { schema: 'td' } });
    } catch (err) {
        showToast('Errore init: ' + err.message, 'error');
        return;
    }

    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const t = document.getElementById(tab.getAttribute('data-target'));
            if (t) t.classList.add('active');
        });
    });

    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('logout-btn').addEventListener('click', logout);

    document.getElementById('form-hero').addEventListener('submit',     e => saveSection(e, 'hero'));
    document.getElementById('form-venues').addEventListener('submit',   e => saveSection(e, 'venues'));
    document.getElementById('form-about').addEventListener('submit',    e => saveSection(e, 'about'));
    document.getElementById('form-membri').addEventListener('submit',   e => saveSection(e, 'members'));
    document.getElementById('form-contatti').addEventListener('submit', e => saveSection(e, 'contact'));
    document.getElementById('form-new-event').addEventListener('submit', addEvent);

    checkSession();
});

async function checkSession() {
    const as = document.getElementById('auth-section');
    const ds = document.getElementById('dashboard-section');
    try {
        const { data } = await tdAdmin.auth.getSession();
        if (data.session) {
            as.style.display = 'none';
            ds.style.display = 'block';
            loadAdminData();
        } else {
            as.style.display = 'flex';
            ds.style.display = 'none';
        }
    } catch (e) { showToast('Errore sessione: ' + e.message, 'error'); }
}

async function login() {
    const email = document.getElementById('email').value.trim();
    const pass  = document.getElementById('password').value;
    const btn   = document.getElementById('login-btn');
    if (!email || !pass) { showToast('Inserisci email e password.', 'error'); return; }
    btn.innerText = 'Accesso...'; btn.disabled = true;
    try {
        const { error } = await tdAdmin.auth.signInWithPassword({ email, password: pass });
        if (error) showToast('Login fallito: ' + error.message, 'error');
        else { showToast('Accesso effettuato ✓'); checkSession(); }
    } catch (e) { showToast('Eccezione: ' + e.message, 'error'); }
    finally { btn.innerText = 'Accedi'; btn.disabled = false; }
}

async function logout() {
    if (tdAdmin) await tdAdmin.auth.signOut();
    checkSession();
}

async function loadAdminData() {
    setLoading(true);
    try {
        const [cnt, ev] = await Promise.all([
            tdAdmin.from('site_content').select('*'),
            tdAdmin.from('site_events').select('*').order('event_date', { ascending: true })
        ]);
        if (cnt.error) throw cnt.error;
        if (ev.error)  throw ev.error;
        contentData = cnt.data || [];
        eventsData  = ev.data  || [];
        populateForms();
        renderEvents();
        setLoading(false);
    } catch (e) {
        setLoading(false, true);
        showToast('Errore caricamento: ' + e.message, 'error');
    }
}

function setLoading(loading, failed) {
    const bar = document.getElementById('loading-bar');
    if (!bar) return;
    if (loading) {
        bar.textContent = '⏳ Caricamento…';
        bar.style.cssText = 'background:#fff3cd;color:#856404;display:block;padding:.7rem 1rem;border-radius:4px;font-size:.85rem;margin-bottom:1rem;';
        document.querySelectorAll('.section-save-btn').forEach(b => b.disabled = true);
    } else if (failed) {
        bar.textContent = '⚠️ Errore caricamento — i campi potrebbero non essere aggiornati.';
        bar.style.cssText = 'background:#f8d7da;color:#721c24;display:block;padding:.7rem 1rem;border-radius:4px;font-size:.85rem;margin-bottom:1rem;';
        document.querySelectorAll('.section-save-btn').forEach(b => b.disabled = false);
    } else {
        bar.style.display = 'none';
        document.querySelectorAll('.section-save-btn').forEach(b => b.disabled = false);
    }
}

function populateForms() {
    fillFormFields('form-hero',     'hero');
    fillFormFields('form-venues',   'venues');
    fillFormFields('form-about',    'about');
    fillFormFields('form-membri',   'members');
    fillFormFields('form-contatti', 'contact');
}

function fillFormFields(formId, sectionName) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('[data-key]').forEach(input => {
        const r = contentData.find(c => c.section === sectionName && c.content_key === input.getAttribute('data-key'));
        input.value = r ? r.content_value : '';
    });
}

async function saveSection(e, sectionName) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const orig = btn.innerText;
    btn.innerText = 'Salvataggio...'; btn.disabled = true;
    try {
        const upserts = [];
        e.target.querySelectorAll('[data-key]').forEach(input => {
            upserts.push({
                section: sectionName,
                content_key: input.getAttribute('data-key'),
                content_value: input.value,
                content_type: input.tagName.toLowerCase() === 'textarea' ? 'html' : 'text',
                updated_at: new Date().toISOString()
            });
        });
        const { error } = await tdAdmin.from('site_content').upsert(upserts, { onConflict: 'section,content_key' });
        if (error) throw error;
        showToast('Salvato ✓');
        loadAdminData();
    } catch (err) { showToast('Errore: ' + err.message, 'error'); }
    finally { btn.innerText = orig; btn.disabled = false; }
}

async function addEvent(e) {
    e.preventDefault();
    const { error } = await tdAdmin.from('site_events').insert([{
        event_date:   document.getElementById('ev-date').value,
        event_time:   document.getElementById('ev-time').value || null,
        venue:        document.getElementById('ev-venue').value,
        city:         document.getElementById('ev-city').value,
        description:  document.getElementById('ev-desc').value || null,
        is_published: document.getElementById('ev-pub').checked,
        updated_at:   new Date().toISOString(),
        created_at:   new Date().toISOString()
    }]);
    if (error) showToast('Errore: ' + error.message, 'error');
    else { showToast('Data aggiunta ✓'); e.target.reset(); loadAdminData(); }
}

async function toggleEvent(id, cur) {
    const { error } = await tdAdmin.from('site_events').update({ is_published: !cur }).eq('id', id);
    if (error) showToast('Errore: ' + error.message, 'error');
    else loadAdminData();
}

async function deleteEvent(id) {
    if (!confirm('Eliminare questa data?')) return;
    const { error } = await tdAdmin.from('site_events').delete().eq('id', id);
    if (error) showToast('Errore: ' + error.message, 'error');
    else { showToast('Eliminata'); loadAdminData(); }
}

function renderEvents() {
    const list = document.getElementById('events-admin-list');
    if (!list) return;
    list.innerHTML = '';
    if (!eventsData.length) {
        list.innerHTML = '<li style="color:#999;padding:1rem;">Nessuna data.</li>';
        return;
    }
    eventsData.forEach(ev => {
        const li = document.createElement('li');
        li.className = 'data-item';
        li.innerHTML = `
            <div>
                <strong>${ev.venue}</strong> — ${ev.city} — ${ev.event_date}${ev.event_time ? ' · ' + ev.event_time.slice(0,5) : ''}
                ${ev.description ? `<br><span style="font-size:.8rem;color:#666">${ev.description}</span>` : ''}
                <br><span style="font-size:.8rem;color:${ev.is_published ? 'green' : '#aaa'}">${ev.is_published ? '● Pubblico' : '○ Nascosto'}</span>
            </div>
            <div class="data-item-actions">
                <button onclick="toggleEvent('${ev.id}', ${ev.is_published})">${ev.is_published ? 'Nascondi' : 'Pubblica'}</button>
                <button class="danger" onclick="deleteEvent('${ev.id}')">Elimina</button>
            </div>`;
        list.appendChild(li);
    });
}
