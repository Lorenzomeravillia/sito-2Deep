"""Skanoid: the 2Deep's breakout (the name: Arkanoid with ska in it). Neon bricks over a neon sign with the next gig, two musics.

   python3 skanoid/build.py                    -> ../skanoid.html, the page at 2deep.it/skanoid: the dates and the band's song come
                                                    from Supabase when the page opens (libera/site_data.json if it does not answer
                                                    within 5 seconds); the player picks the music before playing
   python3 skanoid/build.py --artifact DIR  -> DIR/skanoid.html for claude.ai: dates frozen from the snapshot, music lab on,
                                                    pinned to the date in --evento (default: the next one)
   --musica relax|ska                          -> one music only, no choice, the game starts at once (the promo video tools)

   game.js is the game, built twice: with music_relax.js + ui_relax.js (the relaxing version: the wall plays, spa harmonies, the
   Atmosfera button and the music lab) and with music_ska.js + ui_ska.js (the ska-reggae version: the band's MIDI in 8 bit, made
   "in levare", with the flipper's song engine and BRANO panel: video-promo/part_audio.js, flipper/music.js, store_site.js,
   songui.js, libera/gamesong.js, patched below for Skanoid's own song and the levare tracks). head.html styles and markup.
   Re Divano is drawn by libera/hd.js (paintSofa), with the 3D crown from assets/giochi/icone.
   Address options: ?evento=<date id> shows that date, ?lab=1 opens the music lab, ?musica=relax|ska skips the choice, #brano
   shows the BRANO button to anyone."""
import base64, json, pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
H = lambda n: (HERE / n).read_text()
FL = lambda n: (ROOT / 'flipper' / n).read_text()

hd = (ROOT / 'libera' / 'hd.js').read_text()
sofa = re.search(r'^function paintSofa\(.*?^  g\.restore\(\);\}$', hd, re.S | re.M).group(0)
SNAP = json.loads((ROOT / 'libera' / 'site_data.json').read_text())
events = [{k: e.get(k) for k in ('id', 'event_date', 'event_time', 'venue', 'city', 'description', 'is_published')} for e in SNAP['events']]
head = H('head.html')
# fonts: served by the site itself (no call to Google); the claude.ai artifact cannot reach /assets, so it keeps Google Fonts
head = head.replace('<!--FONTS-->', '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Tilt+Neon&display=swap">' if '--artifact' in sys.argv else "<style>@font-face{font-family:'Fredoka';font-style:normal;font-weight:500;font-display:swap;src:url(/assets/fonts/fredoka-latin-500-normal.woff2) format('woff2')}@font-face{font-family:'Fredoka';font-style:normal;font-weight:600;font-display:swap;src:url(/assets/fonts/fredoka-latin-600-normal.woff2) format('woff2')}@font-face{font-family:'Fredoka';font-style:normal;font-weight:700;font-display:swap;src:url(/assets/fonts/fredoka-latin-700-normal.woff2) format('woff2')}@font-face{font-family:'Tilt Neon';font-style:normal;font-weight:400;font-display:swap;src:url(/assets/fonts/tilt-neon-latin-400-normal.woff2) format('woff2')}</style>")
SITEBAR = FL('sitebar.html') + FL('nozoom.html')


def patched(text, reps, what):
    for x, y in reps:
        n = text.count(x)
        if n != 1:
            raise SystemExit('%s: %r found %d times' % (what, x[:60], n))
        text = text.replace(x, y)
    return text


BARS = re.compile(r'240/\((\w+)\.tempo\|\|120\)')  # one bar in 4/4 -> one bar in the song's meter


def ska_parts():
    audio = patched((ROOT / 'video-promo' / 'part_audio.js').read_text(), [
        ('function analyzeMidi(m){', 'function analyzeMidiBase(m){'),
        ("window.__audioWav=async sr=>b64(pcm16(await renderSoundtrack({mode:'default',sfx:true,vol:1},sr)));", '')], 'part_audio')
    store = patched(FL('store_site.js'), [("section:'pinball',content_key:'song'", "section:'skanoid',content_key:'song'"),
                                          ('(td.site_content, section pinball, key song)', '(td.site_content, section skanoid, key song)')], 'store')
    music = patched(FL('music.js'), [("SONG_KEY='2deep_pinball_song'", "SONG_KEY='skanoid_song'"),
        ('v:nt.v,i:c.inst});', 'v:nt.v,i:c.inst,lev:nt.lev});'),
        ("return{name:cfg.name||'',len,steps,midi:true,beat:", "return{name:cfg.name||'',len,steps,midi:true,barLen:barSec(info)/sp,beat:"),
        ('MSRC.loop=true;', 'MSRC.loop=true;SONG_RATE=S.tune/440;MSRC.playbackRate.value=SONG_RATE;SONG_T0=AC.currentTime;'),
        ('function useSong(song){SONG=song;', 'function useSong(song){SONG=song;LEV=levareTimes(song);')], 'music')
    music, n = BARS.subn(lambda m: 'barSec(%s)' % m.group(1), music)
    assert n == 1, n
    ui = patched(FL('songui.js'), [('function autoCfg(info,name){', 'function autoCfgBase(info,name){'),
        ('function renderPanel(){', 'function renderPanelBase(){'),
        ("(CANEDIT||location.hash==='#brano')", "(CANEDIT||location.hash==='#brano'||adminDevice())"),
        ('const info=analyzeMidi(parseMidi(b64d(cfg.midi)));', 'const info=analyzeMidi(parseMidi(b64d(cfg.midi)),cfg.levare);'),
        ('const bl=beatLen(info)*4,span=bars*bl;let best=info.first,bs=-1;', 'const bl=barSec(info),span=bars*bl;let best=Math.floor(info.first/bl+1e-6)*bl,bs=-1;'),
        ('for(let off=info.first;off+span<=info.end+0.01;off+=bl)', 'for(let off=Math.floor(info.first/bl+1e-6)*bl;off+span<=info.end+0.01;off+=bl)'),
        ("' · battuta '+(Math.floor(b/4)+1)+(b%4?', tempo '+(b%4+1):'')", "' · battuta '+(Math.floor(b/barQ(PINFO))+1)+(b%barQ(PINFO)?', tempo '+(b%barQ(PINFO)+1):'')"),
        ("(g.drum?'percussioni':(g.prog!=null?GMF[g.prog>>3]:'strumento non indicato'))", "(g.gen?'traccia in levare calcolata dal brano':g.drum?'percussioni':(g.prog!=null?GMF[g.prog>>3]:'strumento non indicato'))"),
        ("+info.tempo+' bpm';renderPanel();", "+info.tempo+' bpm · '+meterText(info);renderPanel();"),
        ("+PINFO.tempo+' bpm';}", "+PINFO.tempo+' bpm · '+meterText(PINFO);}"),
        ('Ho proposto un ordine: batteria, basso, le altre parti, la melodia per ultima. Cambialo quando vuoi e ascolta.',
         'Ho aggiunto le tracce in levare e proposto un ordine: batteria ska, skank, basso, melodia, il resto alla fine. La batteria del brano e le sue tracce di accordi partono escluse, perché il gioco usa le sue: rimettile se servono. Cambia quando vuoi e ascolta.'),
        ('Salvato: chi apre il flipper o Libera ora sente «', 'Salvato: chi apre Skanoid in versione ska-reggae ora sente «')], 'songui')
    ui, n = BARS.subn(lambda m: 'barSec(%s)' % m.group(1), ui)
    assert n == 4, n
    return '\n'.join([audio, (ROOT / 'libera' / 'gamesong.js').read_text(), H('music_ska.js'), store, music]), ui


def game(crown, mode):
    g = H('game.js').replace('/*__SOFA__*/', sofa).replace('/*__CROWN__*/', crown)
    if mode == 'relax':
        mus, ui = H('music_relax.js'), H('ui_relax.js')
    else:
        mus, songui = ska_parts()
        ui = H('ui_ska.js').replace('/*__SONGUI__*/', '(function(){\n' + songui + '\n' + H('songui_extra.js') + '\n})();')
    for k, v in (('/*__MUSIC__*/', mus), ('/*__MUSIC_UI__*/', ui)):
        assert g.count(k) == 1, k
        g = g.replace(k, v)
    return g.replace('window.__GAME__=function(){', 'window.SKANOID_' + mode.upper() + '=function(){', 1)


ONLY = sys.argv[sys.argv.index('--musica') + 1] if '--musica' in sys.argv else None
MODES = [ONLY] if ONLY else ['ska', 'relax']
# the choice of music: the game starts when the data is in and the music is picked; a pick made after the data keeps the touch,
# so the sound starts at once
CHOOSE = """function SKANOID_START(m,touch){(m==='relax'?window.SKANOID_RELAX:window.SKANOID_SKA)();if(touch&&window.__SKANOID)window.__SKANOID.startAudio();}
/* the music lab (relaxing version): options open, lab unfolded and in view, the game paused; the first touch inside starts the sound */
function SKANOID_LAB(){var o=document.getElementById('opt'),l=document.getElementById('labBox'),sh=document.getElementById('sheet');if(o)o.click();
  if(l){l.open=true;setTimeout(function(){l.scrollIntoView({block:'start'});},80);}
  if(sh)sh.addEventListener('pointerdown',function(){if(window.__SKANOID)window.__SKANOID.startAudio();},{once:true});}
function SKANOID_CHOOSE(ready,only){var q=new URLSearchParams(location.search),m=only||q.get('musica');
  /* 2deep.it/skanoid?laboratorio (or #laboratorio): straight into the music lab, the link to share with musicians */
  if((q.has('laboratorio')||location.hash==='#laboratorio'||window.__SKANOID_LAB_PAGE)&&only!=='ska'){ready(function(){SKANOID_START('relax',false);SKANOID_LAB();});return;}
  if(m==='ska'||m==='relax'){ready(function(){SKANOID_START(m,false);});return;}
  var ch=document.getElementById('chooser'),last=null;try{last=localStorage.getItem('skanoid_musica');}catch(e){}ch.hidden=false;
  var bs=ch.querySelectorAll('button[data-m]');Array.prototype.forEach.call(bs,function(b){var mm=b.getAttribute('data-m');if(mm===last)b.classList.add('last');
    b.addEventListener('click',function(){try{localStorage.setItem('skanoid_musica',mm);}catch(e){}ch.hidden=true;ready(function(now){SKANOID_START(mm,now);});});});
  var lb=ch.querySelector('button[data-lab]');if(lb)lb.addEventListener('click',function(){try{localStorage.setItem('skanoid_musica','relax');}catch(e){}ch.hidden=true;ready(function(now){SKANOID_START('relax',now);SKANOID_LAB();});});
  (ch.querySelector('button.last')||bs[0]).focus();}"""


if '--artifact' in sys.argv:
    out = pathlib.Path(sys.argv[sys.argv.index('--artifact') + 1])
    out.mkdir(parents=True, exist_ok=True)
    evento = sys.argv[sys.argv.index('--evento') + 1] if '--evento' in sys.argv else None
    crown = 'data:image/webp;base64,' + base64.b64encode((ROOT / 'assets/giochi/icone/corona.webp').read_bytes()).decode()
    js = ('window.__GAME_DATA=' + json.dumps({'events': events, 'evento': evento}, ensure_ascii=False) + ';window.__SITE_DATA={};window.__SB=null;window.__LAB=true;\n' +
          '\n'.join(game(crown, m) for m in MODES) + '\n' + CHOOSE + "\nSKANOID_CHOOSE(function(cb){cb(true);}," + json.dumps(ONLY) + ");")
    page = head.replace('<!--SITEBAR-->', SITEBAR.replace(' data-site>', ' data-site target="_blank" rel="noopener">')) + '\n<script>\n' + js + '\n</script>\n'
    (out / 'skanoid.html').write_text(page)
    (out / 'skanoid_page.html').write_text('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"></head><body>' + page + '</body></html>')
    print('artifact', len(page))
else:
    boot = """(function(){var SNAP=%s,q=new URLSearchParams(location.search),done=false,wait=null;
  function ready(cb){if(done)cb(true);else wait=cb;}
  function go(ev,song){if(done)return;window.__GAME_DATA={events:ev,evento:q.get('evento')};window.__SITE_DATA=song===undefined?{}:{song:song};done=true;if(wait){var w=wait;wait=null;w(false);}}
  var timer=setTimeout(function(){go(SNAP);},5000),fail=function(){clearTimeout(timer);go(SNAP);};
  try{var sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY,{db:{schema:'td'}});window.__SB=sb;
    Promise.all([sb.from('site_events').select('id,event_date,event_time,venue,city,description,is_published'),
      sb.from('site_content').select('content_value').eq('section','skanoid').eq('content_key','song').maybeSingle()]).then(function(r){clearTimeout(timer);
      var ev=r[0].error||!r[0].data?SNAP:r[0].data,song=r[1].error?undefined:(r[1].data?r[1].data.content_value:null);go(ev,song);},fail);}catch(e){fail();}
  SKANOID_CHOOSE(ready,%s);
})();""" % (json.dumps(events, ensure_ascii=False), json.dumps(ONLY))
    meta = """<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="description" content="Skanoid, il gioco dei 2Deep: spacca il muro al neon e accendi l'insegna con la prossima serata. Con una colonna sonora ska-reggae in 8 bit o con il muro che suona a 432 Hz.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.2deep.it/skanoid">
<meta property="og:title" content="Skanoid · il gioco dei 2Deep">
<meta property="og:description" content="Spacca il muro e accendi l'insegna della prossima serata, con lo ska-reggae in 8 bit dei 2Deep o con il muro che suona a 432 Hz.">
<meta property="og:image" content="https://www.2deep.it/assets/giochi/og-skanoid-2.jpg">
<meta property="og:image:secure_url" content="https://www.2deep.it/assets/giochi/og-skanoid-2.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Skanoid: il gioco dei 2Deep, un muro al neon sopra l'insegna della serata">
<meta property="og:locale" content="it_IT">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://www.2deep.it/assets/giochi/og-skanoid-2.jpg">
<meta name="theme-color" content="#05030c">
<link rel="canonical" href="https://www.2deep.it/skanoid">
"""
    pre, post = head.split('<!--SITEBAR-->', 1)
    page = (meta + pre + '</head>\n<body>\n' + SITEBAR + post +
            '\n<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js"></script>\n<script src="/config.js"></script>\n<script>\n' +
            '\n'.join(game('/assets/giochi/icone/corona.webp', m) for m in MODES) + '\n' + CHOOSE + '\n' + boot + '\n</script>\n</body>\n</html>\n')
    (ROOT / 'skanoid.html').write_text(page)
    print('skanoid.html', len(page))
    # the same game at 2deep.it/skanoid-lab, opening straight into the music lab, with its own title and link preview
    lab = page
    for old, new in [('<title>Skanoid · 2Deep</title>', '<title>Laboratorio musicale di Skanoid · 2Deep</title>'),
                     ('<meta name="description" content="Skanoid, il gioco dei 2Deep: spacca il muro al neon e accendi l\'insegna con la prossima serata. Con una colonna sonora ska-reggae in 8 bit o con il muro che suona a 432 Hz.">',
                      '<meta name="description" content="Il laboratorio musicale di Skanoid, il gioco dei 2Deep: il muro diventa uno strumento. Cambia atmosfera, armonia, timbri, percussioni e la melodia della pallina, a 432 Hz.">'),
                     ('<meta property="og:url" content="https://www.2deep.it/skanoid">', '<meta property="og:url" content="https://www.2deep.it/skanoid-lab">'),
                     ('<link rel="canonical" href="https://www.2deep.it/skanoid">', '<link rel="canonical" href="https://www.2deep.it/skanoid-lab">'),
                     ('<meta property="og:title" content="Skanoid · il gioco dei 2Deep">', '<meta property="og:title" content="Il laboratorio musicale di Skanoid · 2Deep">'),
                     ('<meta property="og:description" content="Spacca il muro e accendi l\'insegna della prossima serata, con lo ska-reggae in 8 bit dei 2Deep o con il muro che suona a 432 Hz.">',
                      '<meta property="og:description" content="Il muro diventa uno strumento: atmosfere, armonia, timbri e melodia della pallina, a 432 Hz. Per musicisti e curiosi.">'),
                     ('<meta property="og:image:alt" content="Skanoid: il gioco dei 2Deep, un muro al neon sopra l\'insegna della serata">',
                      '<meta property="og:image:alt" content="Il laboratorio musicale di Skanoid: i comandi della musica sopra il muro al neon">'),
                     ('og-skanoid-2.jpg', 'og-laboratorio.jpg'), ('<script src="/config.js"></script>\n<script>\n', '<script src="/config.js"></script>\n<script>\nwindow.__SKANOID_LAB_PAGE=true;\n')]:
        assert old in lab, old[:60]
        lab = lab.replace(old, new)
    (ROOT / 'skanoid-lab.html').write_text(lab)
    print('skanoid-lab.html', len(lab))
