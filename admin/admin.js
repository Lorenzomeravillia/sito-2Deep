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

const _SB_URL = 'https://jvcvxzampxopvihahwbh.supabase.co';
const _SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y3Z4emFtcHhvcHZpaGFod2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDMyNDMsImV4cCI6MjA4Nzg3OTI0M30.x2seoq8KYJdWLles7H8n0uD2Qm77MCbWEGNDnN6DWrc';

const BUCKET    = 'td-site';
const BUCKET_URL = () => `${_SB_URL}/storage/v1/object/public/${BUCKET}`;

function extractYouTubeId(url) {
    const m = (url || '').match(/(?:youtu\.be\/|v=|embed\/)([^#&?]{11})/);
    return m ? m[1] : null;
}

let tdAdmin       = null;
let contentData   = [];
let eventsData    = [];
let imagesData    = [];
let videosData    = [];
let repertoireData = [];

document.addEventListener('DOMContentLoaded', () => {
    try {
        if (!window.supabase) throw new Error('Supabase CDN non caricato');
        tdAdmin = window.supabase.createClient(_SB_URL, _SB_KEY, { db: { schema: 'td' } });
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
    document.getElementById('form-vibes').addEventListener('submit',    e => saveSection(e, 'vibes'));
    document.getElementById('form-venues').addEventListener('submit',   e => saveSection(e, 'venues'));
    document.getElementById('form-sound').addEventListener('submit',    e => saveSection(e, 'sound'));
    document.getElementById('form-hz').addEventListener('submit',       e => saveSection(e, 'hz'));
    document.getElementById('form-footer').addEventListener('submit',   e => saveSection(e, 'footer'));
    document.getElementById('form-membri').addEventListener('submit',   e => saveSection(e, 'members'));
    document.getElementById('form-contatti').addEventListener('submit', e => saveSection(e, 'contact'));
    document.getElementById('form-new-event').addEventListener('submit', addEvent);
    document.getElementById('form-new-song').addEventListener('submit', addSong);
    document.getElementById('form-new-video').addEventListener('submit', addVideo);
    document.getElementById('form-edit-video').addEventListener('submit', saveVideoEdit);
    document.getElementById('modal-edit-video').addEventListener('click', function(e) {
        if (e.target === this) closeVideoModal();
    });
    document.getElementById('form-upload-photo').addEventListener('submit', uploadPhoto);
    document.getElementById('form-edit-photo').addEventListener('submit', saveImageEdit);
    document.getElementById('modal-edit-photo').addEventListener('click', function(e) {
        if (e.target === this) closeEditModal();
    });
    document.getElementById('form-password').addEventListener('submit', changePassword);

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

async function changePassword(e) {
    e.preventDefault();
    const np = document.getElementById('new-password').value;
    const cp = document.getElementById('confirm-password').value;
    if (np.length < 6) { showToast('La password deve essere di almeno 6 caratteri.', 'error'); return; }
    if (np !== cp) { showToast('Le password non coincidono.', 'error'); return; }
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = 'Aggiornamento...'; btn.disabled = true;
    try {
        const { error } = await tdAdmin.auth.updateUser({ password: np });
        if (error) throw error;
        showToast('Password aggiornata ✓');
        e.target.reset();
    } catch (err) { showToast('Errore: ' + err.message, 'error'); }
    finally { btn.innerText = 'Aggiorna Password'; btn.disabled = false; }
}

async function logout() {
    if (tdAdmin) await tdAdmin.auth.signOut();
    checkSession();
}

async function loadAdminData() {
    setLoading(true);
    try {
        const [cnt, ev, img, vid, rep] = await Promise.all([
            tdAdmin.from('site_content').select('*'),
            tdAdmin.from('site_events').select('*').order('event_date', { ascending: true }),
            tdAdmin.from('site_images').select('*').order('display_order'),
            tdAdmin.from('site_videos').select('*').order('display_order', { ascending: true }),
            tdAdmin.from('site_repertoire').select('*').order('display_order', { ascending: true })
        ]);
        if (cnt.error) throw cnt.error;
        if (ev.error)  throw ev.error;
        if (img.error) throw img.error;
        if (vid.error) throw vid.error;
        if (rep.error) throw rep.error;
        contentData    = cnt.data || [];
        eventsData     = ev.data  || [];
        imagesData     = img.data || [];
        videosData     = vid.data || [];
        repertoireData = rep.data || [];
        populateForms();
        renderEvents();
        renderImages();
        renderVideos();
        renderRepertoire();
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
    fillFormFields('form-vibes',    'vibes');
    fillFormFields('form-venues',   'venues');
    fillFormFields('form-sound',    'sound');
    fillFormFields('form-hz',       'hz');
    fillFormFields('form-footer',   'footer');
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

// ── Repertoire ──
async function addSong(e) {
    e.preventDefault();
    const nextOrder = repertoireData.length ? Math.max(...repertoireData.map(r => r.display_order || 0)) + 1 : 1;
    const { error } = await tdAdmin.from('site_repertoire').insert([{
        song_title: document.getElementById('song-title').value.trim(),
        artist:     document.getElementById('song-artist').value.trim(),
        display_order: nextOrder, is_active: true
    }]);
    if (error) showToast('Errore: ' + error.message, 'error');
    else { showToast('Brano aggiunto ✓'); e.target.reset(); loadAdminData(); }
}

async function deleteSong(id) {
    if (!confirm('Eliminare questo brano?')) return;
    const { error } = await tdAdmin.from('site_repertoire').delete().eq('id', id);
    if (error) showToast('Errore: ' + error.message, 'error');
    else { showToast('Eliminato'); loadAdminData(); }
}

async function moveSong(id, dir) {
    const idx = repertoireData.findIndex(s => s.id === id);
    if (idx < 0 || (dir === -1 && idx === 0) || (dir === 1 && idx === repertoireData.length - 1)) return;
    const cur = repertoireData[idx], swp = repertoireData[idx + dir];
    await Promise.all([
        tdAdmin.from('site_repertoire').update({ display_order: swp.display_order }).eq('id', cur.id),
        tdAdmin.from('site_repertoire').update({ display_order: cur.display_order }).eq('id', swp.id)
    ]);
    loadAdminData();
}

function renderRepertoire() {
    const list = document.getElementById('songs-admin-list');
    if (!list) return;
    list.innerHTML = '';
    if (!repertoireData.length) { list.innerHTML = '<li style="color:#999;padding:1rem;">Nessun brano.</li>'; return; }
    repertoireData.forEach((s, idx) => {
        const li = document.createElement('li');
        li.className = 'data-item';
        li.innerHTML = `
            <div><strong>${s.song_title}</strong>${s.artist ? ' — <em>' + s.artist + '</em>' : ''}</div>
            <div class="data-item-actions">
                <button onclick="moveSong('${s.id}',-1)" ${idx===0?'disabled':''}>▲</button>
                <button onclick="moveSong('${s.id}',1)"  ${idx===repertoireData.length-1?'disabled':''}>▼</button>
                <button class="danger" onclick="deleteSong('${s.id}')">Elimina</button>
            </div>`;
        list.appendChild(li);
    });
}

// ── Video ──
async function addVideo(e) {
    e.preventDefault();
    const url  = document.getElementById('video-url').value.trim();
    const ytId = extractYouTubeId(url);
    if (!ytId) { showToast('URL YouTube non valido', 'error'); return; }
    const nextOrder = videosData.length ? Math.max(...videosData.map(v => v.display_order || 0)) + 1 : 1;
    const { error } = await tdAdmin.from('site_videos').insert([{
        youtube_url:   `https://www.youtube.com/watch?v=${ytId}`,
        title:         document.getElementById('video-title').value.trim() || 'Video',
        description:   document.getElementById('video-desc').value.trim(),
        display_order: nextOrder,
        is_visible:    document.getElementById('video-visible').checked
    }]);
    if (error) showToast('Errore: ' + error.message, 'error');
    else { showToast('Video aggiunto ✓'); e.target.reset(); loadAdminData(); }
}

function editVideo(id) {
    const v = videosData.find(v => v.id === id);
    if (!v) return;
    document.getElementById('edit-vid-id').value       = v.id;
    document.getElementById('edit-vid-url').value      = v.youtube_url || '';
    document.getElementById('edit-vid-title').value    = v.title || '';
    document.getElementById('edit-vid-desc').value     = v.description || '';
    document.getElementById('edit-vid-visible').checked = v.is_visible;
    const ytId = extractYouTubeId(v.youtube_url);
    const wrap = document.getElementById('edit-vid-thumb-wrap');
    const thumb = document.getElementById('edit-vid-thumb');
    if (ytId) { thumb.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`; wrap.style.display = 'block'; }
    else { wrap.style.display = 'none'; }
    document.getElementById('edit-vid-url').oninput = function() {
        const id2 = extractYouTubeId(this.value);
        if (id2) { thumb.src = `https://img.youtube.com/vi/${id2}/hqdefault.jpg`; wrap.style.display = 'block'; }
        else { wrap.style.display = 'none'; }
    };
    document.getElementById('modal-edit-video').style.display = 'flex';
}

function closeVideoModal() { document.getElementById('modal-edit-video').style.display = 'none'; }

async function saveVideoEdit(e) {
    e.preventDefault();
    const id   = document.getElementById('edit-vid-id').value;
    const url  = document.getElementById('edit-vid-url').value.trim();
    const ytId = extractYouTubeId(url);
    if (!ytId) { showToast('URL YouTube non valido', 'error'); return; }
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = 'Salvataggio...'; btn.disabled = true;
    try {
        const { error } = await tdAdmin.from('site_videos').update({
            youtube_url: `https://www.youtube.com/watch?v=${ytId}`,
            title:       document.getElementById('edit-vid-title').value.trim(),
            description: document.getElementById('edit-vid-desc').value.trim(),
            is_visible:  document.getElementById('edit-vid-visible').checked
        }).eq('id', id);
        if (error) throw error;
        showToast('Video aggiornato ✓'); closeVideoModal(); loadAdminData();
    } catch (err) { showToast('Errore: ' + err.message, 'error'); }
    finally { btn.innerText = 'Salva'; btn.disabled = false; }
}

async function deleteVideo(id) {
    if (!confirm('Eliminare questo video?')) return;
    const { error } = await tdAdmin.from('site_videos').delete().eq('id', id);
    if (error) showToast('Errore: ' + error.message, 'error');
    else { showToast('Video eliminato'); closeVideoModal(); loadAdminData(); }
}

async function moveVideo(id, dir) {
    const idx = videosData.findIndex(v => v.id === id);
    if (idx < 0 || (dir === -1 && idx === 0) || (dir === 1 && idx === videosData.length - 1)) return;
    const cur = videosData[idx], swp = videosData[idx + dir];
    await Promise.all([
        tdAdmin.from('site_videos').update({ display_order: swp.display_order }).eq('id', cur.id),
        tdAdmin.from('site_videos').update({ display_order: cur.display_order }).eq('id', swp.id)
    ]);
    loadAdminData();
}

function renderVideos() {
    const list = document.getElementById('videos-admin-list');
    if (!list) return;
    list.innerHTML = '';
    if (!videosData.length) { list.innerHTML = '<li style="color:#999;padding:1rem;">Nessun video.</li>'; return; }
    videosData.forEach((v, idx) => {
        const li = document.createElement('li');
        li.className = 'data-item';
        const ytId = extractYouTubeId(v.youtube_url);
        const thumb = ytId ? `<img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" style="width:80px;border-radius:4px;flex-shrink:0">` : '';
        li.innerHTML = `
            <div style="display:flex;gap:1rem;align-items:center;flex:1">
                ${thumb}
                <div>
                    <strong>${v.title || 'Video'}</strong>
                    <div style="font-size:.8rem;color:#666">${v.description || ''}</div>
                    <div style="font-size:.75rem;color:${v.is_visible?'green':'#aaa'}">${v.is_visible?'● Pubblico':'○ Nascosto'}</div>
                </div>
            </div>
            <div class="data-item-actions">
                <button onclick="editVideo('${v.id}')">✏️ Modifica</button>
                <div style="display:flex;flex-direction:column;gap:.2rem">
                    <button onclick="moveVideo('${v.id}',-1)" ${idx===0?'disabled':''} style="padding:2px 8px">▲</button>
                    <button onclick="moveVideo('${v.id}',1)"  ${idx===videosData.length-1?'disabled':''} style="padding:2px 8px">▼</button>
                </div>
                <button class="danger" onclick="deleteVideo('${v.id}')">Elimina</button>
            </div>`;
        list.appendChild(li);
    });
}

// ── Folder → role auto-derive ──
document.addEventListener('DOMContentLoaded', () => {
    const folderEl = document.getElementById('upload-folder');
    const roleEl   = document.getElementById('upload-role');
    if (folderEl && roleEl) {
        folderEl.addEventListener('change', () => { roleEl.value = folderEl.value; });
        roleEl.value = folderEl.value;
    }
});

function previewUploadFile(input) {
    const preview = document.getElementById('upload-preview');
    const file = input.files[0];
    if (!file) { preview.style.display = 'none'; return; }
    const reader = new FileReader();
    reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);
}

async function uploadPhoto(e) {
    e.preventDefault();
    const file    = document.getElementById('upload-file').files[0];
    const folder  = document.getElementById('upload-folder').value;
    const role    = document.getElementById('upload-role').value.trim();
    const alt     = document.getElementById('upload-alt').value.trim();
    const order   = parseInt(document.getElementById('upload-order').value) || 1;
    const active  = document.getElementById('upload-active').checked;
    if (!file) { showToast('Seleziona un file.', 'error'); return; }
    const safeName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
    const path = `${folder}/${safeName}`;
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = 'Caricamento...'; btn.disabled = true;
    try {
        const { error: upErr } = await tdAdmin.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) throw new Error('Storage: ' + upErr.message);
        const { error: dbErr } = await tdAdmin.from('site_images').insert([{
            filename: path, role, alt_text: alt, display_order: order, is_active: active, bg_size: 100, brightness: 100
        }]);
        if (dbErr) throw new Error('DB: ' + dbErr.message);
        showToast('Foto caricata ✓');
        e.target.reset();
        document.getElementById('upload-preview').style.display = 'none';
        loadAdminData();
    } catch (err) { showToast('Errore: ' + err.message, 'error'); }
    finally { btn.innerText = 'Carica Foto'; btn.disabled = false; }
}

function editImage(id) {
    const img = imagesData.find(i => i.id === id);
    if (!img) return;
    document.getElementById('edit-img-id').value        = img.id;
    document.getElementById('edit-img-alt').value       = img.alt_text || '';
    document.getElementById('edit-img-role').value      = img.role || '';
    document.getElementById('edit-img-order').value     = img.display_order || 1;
    document.getElementById('edit-img-active').checked  = img.is_active;
    document.getElementById('edit-img-filename').innerText = img.filename;
    const bgSize = img.bg_size || 100;
    const bright = img.brightness || 100;
    const sliderZ = document.getElementById('edit-img-bgsize');
    const sliderB = document.getElementById('edit-img-brightness');
    sliderZ.value = bgSize; document.getElementById('edit-img-bgsize-val').innerText = bgSize + '%';
    sliderB.value = bright; document.getElementById('edit-img-brightness-val').innerText = bright + '%';
    const preview = document.getElementById('edit-img-preview');
    preview.style.backgroundImage = `url('${BUCKET_URL()}/${img.filename}')`;
    preview.style.backgroundSize = bgSize + '%';
    preview.style.backgroundPosition = 'center';
    preview.style.backgroundRepeat = 'no-repeat';
    preview.style.backgroundColor = '#111';
    preview.style.filter = `brightness(${bright}%)`;
    sliderZ.oninput = function() {
        document.getElementById('edit-img-bgsize-val').innerText = this.value + '%';
        preview.style.backgroundSize = this.value + '%';
    };
    sliderB.oninput = function() {
        document.getElementById('edit-img-brightness-val').innerText = this.value + '%';
        preview.style.filter = `brightness(${this.value}%)`;
    };
    document.getElementById('modal-edit-photo').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('modal-edit-photo').style.display = 'none';
}

async function saveImageEdit(e) {
    e.preventDefault();
    const id  = document.getElementById('edit-img-id').value;
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = 'Salvataggio...'; btn.disabled = true;
    try {
        const { error } = await tdAdmin.from('site_images').update({
            alt_text: document.getElementById('edit-img-alt').value.trim(),
            role: document.getElementById('edit-img-role').value.trim(),
            display_order: parseInt(document.getElementById('edit-img-order').value) || 1,
            is_active: document.getElementById('edit-img-active').checked,
            bg_size: parseInt(document.getElementById('edit-img-bgsize').value) || 100,
            brightness: parseInt(document.getElementById('edit-img-brightness').value) || 100
        }).eq('id', id);
        if (error) throw error;
        showToast('Modifiche salvate ✓');
        closeEditModal();
        loadAdminData();
    } catch (err) { showToast('Errore: ' + err.message, 'error'); }
    finally { btn.innerText = 'Salva Modifiche'; btn.disabled = false; }
}

async function deleteImage(id) {
    const img = imagesData.find(i => i.id === id);
    if (!img || !confirm(`Eliminare "${img.filename}"?`)) return;
    try {
        await tdAdmin.storage.from(BUCKET).remove([img.filename]);
        const { error } = await tdAdmin.from('site_images').delete().eq('id', id);
        if (error) throw error;
        showToast('Foto eliminata ✓');
        closeEditModal();
        loadAdminData();
    } catch (err) { showToast('Errore: ' + err.message, 'error'); }
}

function renderImages() {
    const container = document.getElementById('images-container');
    if (!container) return;
    container.innerHTML = '';
    if (!imagesData.length) {
        container.innerHTML = '<p style="color:#999;padding:1rem 0;">Nessuna immagine.</p>';
        return;
    }
    const grouped = {};
    imagesData.forEach(img => {
        const folder = img.filename?.includes('/') ? img.filename.split('/')[0] : 'root';
        if (!grouped[folder]) grouped[folder] = [];
        grouped[folder].push(img);
    });
    for (const [folder, imgs] of Object.entries(grouped)) {
        const wrap = document.createElement('div');
        wrap.style.marginBottom = '2rem';
        wrap.innerHTML = `<h4 style="margin-bottom:.8rem;text-transform:capitalize;">📁 ${folder}/</h4>`;
        const grid = document.createElement('div');
        grid.className = 'img-grid';
        imgs.forEach(img => {
            const card = document.createElement('div');
            card.className = 'img-card';
            const imgEl = document.createElement('img');
            imgEl.src = BUCKET_URL() + '/' + img.filename;
            imgEl.alt = img.alt_text || '';
            imgEl.style.cssText = 'width:100%;height:auto;display:block;border-radius:4px;margin-bottom:.5rem;';
            imgEl.onerror = function() { this.style.cssText += 'background:#eee;min-height:60px;'; this.removeAttribute('src'); };
            const info = document.createElement('div');
            info.innerHTML = `<div class="img-status">${img.is_active ? '✅ Attiva' : '⬜ Nascosta'}</div>
                <div style="font-size:.75rem;color:#555"><strong>${img.role || '—'}</strong> | ord: ${img.display_order}</div>`;
            const actions = document.createElement('div');
            actions.style.cssText = 'display:flex;gap:.4rem;margin-top:.5rem;';
            const btnEdit = document.createElement('button');
            btnEdit.textContent = '✏️';
            btnEdit.style.cssText = 'flex:1;padding:.3rem;font-size:.75rem;';
            btnEdit.onclick = () => editImage(img.id);
            const btnDel = document.createElement('button');
            btnDel.textContent = '🗑️';
            btnDel.className = 'danger';
            btnDel.style.cssText = 'flex:1;padding:.3rem;font-size:.75rem;';
            btnDel.onclick = () => deleteImage(img.id);
            actions.appendChild(btnEdit);
            actions.appendChild(btnDel);
            card.appendChild(imgEl);
            card.appendChild(info);
            card.appendChild(actions);
            grid.appendChild(card);
        });
        wrap.appendChild(grid);
        container.appendChild(wrap);
    }
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
