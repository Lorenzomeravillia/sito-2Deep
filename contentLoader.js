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
      let val = item.content_value;
      /* the copyright year follows the calendar */
      if (key === 'footer.copy') val = val.replace(/©\s*\d{4}/, '© ' + new Date().getFullYear());
      if (item.content_type === 'html') el.innerHTML = val;
      else el.textContent = val;
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
  /* a description for every photo even when the panel leaves it empty: screen readers and Google Images */
  const ALT = { hero: 'Katia e Lorenzo, i 2Deep, dal vivo', katia: 'Katia dei 2Deep', lorenzo: 'Lorenzo dei 2Deep', sound: 'I 2Deep, accordati a 432 Hz', logo: '2Deep' };
  (images || []).forEach(img => {
    const url = `${BUCKET_URL}/${img.filename}`;
    // Hero photo (split layout)
    if (img.role === 'hero') {
      const heroImg = document.getElementById('hero-photo');
      const heroPlaceholder = document.getElementById('hero-photo-placeholder');
      if (heroImg) { heroImg.src = url; heroImg.alt = img.alt_text || ALT.hero; heroImg.style.display = 'block'; }
      if (heroPlaceholder) heroPlaceholder.style.display = 'none';
    }
    // Member avatar
    document.querySelectorAll(`[data-img-role="${img.role}"]`).forEach(el => {
      el.innerHTML = `<img src="${url}" alt="${img.alt_text || ALT[img.role] || ''}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    });
    // Logo (navbar + footer)
    if (img.role === 'logo') {
      const navImg  = document.getElementById('nav-logo-img');
      const navText = document.getElementById('nav-logo-text');
      const footImg = document.getElementById('footer-logo-img');
      if (navImg)  { navImg.src  = url; navImg.style.display  = 'block'; }
      if (navText) navText.style.display = 'none';
      if (footImg) { footImg.src = url; footImg.style.display = 'block'; }
    }
    // Sound circle
    if (img.role === 'sound') {
      const imgEl = document.getElementById('sound-circle-img');
      const fallback = document.getElementById('sound-circle-fallback');
      if (imgEl) { imgEl.src = url; imgEl.alt = img.alt_text || ALT.sound; imgEl.style.display = 'block'; }
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
      const ytId = (v.youtube_url || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([^#&?]{11})/)?.[1];
      if (!ytId) return;
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <div class="video-thumb"><button type="button" class="yt-facade" style="background-image:url(https://i.ytimg.com/vi/${ytId}/hqdefault.jpg)" aria-label="Guarda il video${v.title ? ': ' + v.title.replace(/"/g, '') : ''}"><span></span></button></div>
        <div class="video-info">${v.title ? `<h3>${v.title}</h3>` : ''}${v.description ? `<p>${v.description}</p>` : ''}</div>`;
      card.querySelector('.yt-facade').addEventListener('click', e => {
        const f = document.createElement('iframe');
        f.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`;
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        f.allowFullscreen = true;
        f.title = v.title || 'Video dei 2Deep';
        e.currentTarget.replaceWith(f);
      });
      vidGrid.appendChild(card);
    });
    document.getElementById('video').style.display = '';
  }

  // ── Events ──
  if (events && events.length) {
    const today = new Date(); today.setHours(0,0,0,0);
    const future = events.filter(ev => new Date(ev.event_date) >= today);
    /* the upcoming dates also as structured data, so search engines can show them */
    try {
      const ld = future.filter(ev => ev.venue && ev.city && !/misterios/i.test(ev.venue)).map(ev => ({
        '@context': 'https://schema.org', '@type': 'MusicEvent',
        name: '2Deep live · ' + ev.venue,
        startDate: ev.event_date + (ev.event_time ? 'T' + ev.event_time.slice(0, 5) : ''),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: ev.venue, address: ev.city.trim() },
        performer: { '@type': 'MusicGroup', name: '2Deep', url: 'https://www.2deep.it/' },
        url: 'https://www.2deep.it/#events-section'
      }));
      if (ld.length) { const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld); document.head.appendChild(s); }
    } catch (e) {}
    const past   = events.filter(ev => new Date(ev.event_date) <  today).reverse();

    function buildEventItem(ev, isPast) {
      const d = new Date(ev.event_date);
      const day   = d.toLocaleDateString('it-IT', { day: '2-digit' });
      const month = d.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase();
      const el = document.createElement('div');
      el.className = 'event-item' + (isPast ? ' past' : '');
      el.innerHTML = `
        <div class="event-date"><span class="event-day">${day}</span><span class="event-month">${month}</span></div>
        <div class="event-info">
          <strong class="event-venue">${ev.venue}</strong>
          <span class="event-city">${ev.city}${ev.event_time ? ' · ' + ev.event_time.slice(0,5) : ''}</span>
          ${ev.description ? `<span class="event-desc">${ev.description}</span>` : ''}
        </div>`;
      return el;
    }

    const futureWrap = document.getElementById('events-future-wrap');
    const futureList = document.getElementById('events-future');
    if (future.length && futureWrap && futureList) {
      future.forEach(ev => futureList.appendChild(buildEventItem(ev, false)));
      futureWrap.style.display = '';
    }

    const pastWrap = document.getElementById('events-past-wrap');
    const pastList = document.getElementById('events-past');
    if (past.length && pastWrap && pastList) {
      past.forEach(ev => pastList.appendChild(buildEventItem(ev, true)));
      pastWrap.style.display = '';
      const pastBtn  = document.getElementById('past-toggle');
      const pastBody = document.getElementById('past-body');
      const pastArrow = document.getElementById('past-arrow');
      if (pastBtn && pastBody) {
        pastBtn.addEventListener('click', function() {
          const open = pastBtn.getAttribute('aria-expanded') === 'true';
          if (open) {
            pastBody.style.maxHeight = '0';
            pastBtn.setAttribute('aria-expanded', 'false');
            if (pastArrow) pastArrow.style.transform = '';
          } else {
            pastBody.style.maxHeight = pastBody.scrollHeight + 'px';
            pastBtn.setAttribute('aria-expanded', 'true');
            if (pastArrow) pastArrow.style.transform = 'rotate(180deg)';
          }
        });
      }
    }
  }
})();
