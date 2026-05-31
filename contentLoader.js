// contentLoader.js — 2 Deep
(async function () {
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return;
  const { createClient } = window.supabase;
  const db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, { db: { schema: 'td' } });

  const BUCKET_URL = `${window.SUPABASE_URL}/storage/v1/object/public/td-site`;

  const [{ data: content }, { data: events }, { data: images }, { data: videos }, { data: repertoire }] = await Promise.all([
    db.from('site_content').select('*'),
    db.from('site_events').select('*').eq('is_published', true).order('event_date', { ascending: true }),
    db.from('site_images').select('*').eq('is_active', true).order('display_order'),
    db.from('site_videos').select('*').eq('is_visible', true).order('display_order', { ascending: true }),
    db.from('site_repertoire').select('*').eq('is_active', true).order('display_order', { ascending: true })
  ]);

  // ── Text content ──
  (content || []).forEach(item => {
    const key = `${item.section}.${item.content_key}`;
    document.querySelectorAll(`[data-content="${key}"]`).forEach(el => {
      if (item.content_type === 'html') el.innerHTML = item.content_value;
      else el.textContent = item.content_value;
    });

    // Href handling
    document.querySelectorAll(`[data-href="${key}"]`).forEach(el => {
      if (item.section === 'contact') {
        if (item.content_key === 'whatsapp') {
          const n = item.content_value.replace(/[^0-9]/g, '');
          el.href = `https://wa.me/${n}?text=Ciao%202Deep!%20Vorrei%20info%20per%20una%20serata.`;
          document.querySelectorAll('[data-href="contact.whatsapp_float"]').forEach(f => {
            f.href = `https://wa.me/${n}?text=Ciao%202Deep!%20Vorrei%20info%20per%20una%20serata.`;
          });
        } else if (item.content_key === 'instagram') {
          el.href = `https://www.instagram.com/${item.content_value.replace('@', '')}/`;
          if (el.getAttribute('data-content-text-same') === 'true') el.textContent = item.content_value;
        } else if (item.content_key === 'email') {
          el.href = `mailto:${item.content_value}`;
          if (el.getAttribute('data-content-text-same') === 'true') el.textContent = item.content_value;
        }
      }
    });
  });

  // ── Images ──
  (images || []).forEach(img => {
    const url = `${BUCKET_URL}/${img.filename}`;
    // Hero background
    document.querySelectorAll(`[data-bg-role="${img.role}"]`).forEach(el => {
      el.style.backgroundImage = `url('${url}')`;
      el.style.backgroundSize  = (img.bg_size || 100) + '%';
      el.style.backgroundPosition = 'center';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.filter = `brightness(${img.brightness || 100}%)`;
    });
    // Member avatar
    document.querySelectorAll(`[data-img-role="${img.role}"]`).forEach(el => {
      el.innerHTML = `<img src="${url}" alt="${img.alt_text || ''}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    });
    // Sound circle
    if (img.role === 'sound') {
      const imgEl = document.getElementById('sound-circle-img');
      const fallback = document.getElementById('sound-circle-fallback');
      if (imgEl) { imgEl.src = url; imgEl.style.display = 'block'; }
      if (fallback) fallback.style.display = 'none';
    }
  });

  // ── Repertoire ──
  const repGrid = document.getElementById('repertoire-grid');
  if (repGrid && repertoire && repertoire.length) {
    repGrid.innerHTML = '';
    repertoire.forEach(s => {
      const div = document.createElement('div');
      div.className = 'song-item';
      div.innerHTML = `<span class="song-title">${s.song_title}</span><span class="song-artist">${s.artist || ''}</span>`;
      repGrid.appendChild(div);
    });
    document.getElementById('repertorio').style.display = '';
  }

  // ── Videos ──
  const vidGrid = document.getElementById('videos-grid');
  if (vidGrid && videos && videos.length) {
    vidGrid.innerHTML = '';
    videos.forEach(v => {
      const ytId = (v.youtube_url || '').match(/(?:youtu\.be\/|v=|embed\/)([^#&?]{11})/)?.[1];
      if (!ytId) return;
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <div class="video-thumb"><iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen loading="lazy"></iframe></div>
        <div class="video-info">${v.title ? `<h3>${v.title}</h3>` : ''}${v.description ? `<p>${v.description}</p>` : ''}</div>`;
      vidGrid.appendChild(card);
    });
    document.getElementById('video').style.display = '';
  }

  // ── Events ──
  const evList = document.getElementById('events-list');
  if (evList && events && events.length) {
    evList.innerHTML = '';
    events.forEach(ev => {
      const d = new Date(ev.event_date);
      const day   = d.toLocaleDateString('it-IT', { day: '2-digit' });
      const month = d.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase();
      const li = document.createElement('div');
      li.className = 'event-item';
      li.innerHTML = `
        <div class="event-date"><span class="event-day">${day}</span><span class="event-month">${month}</span></div>
        <div class="event-info">
          <strong class="event-venue">${ev.venue}</strong>
          <span class="event-city">${ev.city}${ev.event_time ? ' · ' + ev.event_time.slice(0,5) : ''}</span>
          ${ev.description ? `<span class="event-desc">${ev.description}</span>` : ''}
        </div>`;
      evList.appendChild(li);
    });
    document.getElementById('events-section').style.display = '';
  }
})();
