// contentLoader.js — 2 Deep
(async function () {
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return;
  const { createClient } = window.supabase;
  const db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, { db: { schema: 'td' } });

  const [{ data: content }, { data: events }] = await Promise.all([
    db.from('site_content').select('*'),
    db.from('site_events').select('*').eq('is_published', true).order('event_date', { ascending: true })
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
