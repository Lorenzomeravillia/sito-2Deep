"""Skanoid: the 2Deep's breakout (the name: Arkanoid with ska in it). Candy-glass bricks over a neon sign with the next gig, music made by the ball (A=432 Hz).

   python3 skanoid/build.py                    -> ../skanoid.html, the page at 2deep.it/skanoid: the dates come from Supabase
                                                    when the page opens (libera/site_data.json if it does not answer within 5 seconds)
   python3 skanoid/build.py --artifact DIR  -> DIR/skanoid.html for claude.ai: dates frozen from the snapshot, music lab on,
                                                    pinned to the date in --evento (default: the next one)

   head.html styles and markup, game.js the game (window.SKANOID). Re Divano is drawn by libera/hd.js (paintSofa), with the
   3D crown from assets/giochi/icone. Address options: ?evento=<date id> shows that date, ?lab=1 opens the music lab."""
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


def game(crown):
    return H('game.js').replace('/*__SOFA__*/', sofa).replace('/*__CROWN__*/', crown)


if '--artifact' in sys.argv:
    out = pathlib.Path(sys.argv[sys.argv.index('--artifact') + 1])
    out.mkdir(parents=True, exist_ok=True)
    evento = sys.argv[sys.argv.index('--evento') + 1] if '--evento' in sys.argv else None
    crown = 'data:image/webp;base64,' + base64.b64encode((ROOT / 'assets/giochi/icone/corona.webp').read_bytes()).decode()
    js = 'window.__GAME_DATA=' + json.dumps({'events': events, 'evento': evento}, ensure_ascii=False) + ';window.__LAB=true;\n' + game(crown) + '\nSKANOID();'
    page = head.replace('<!--SITEBAR-->', SITEBAR.replace(' data-site>', ' data-site target="_blank" rel="noopener">')) + '\n<script>\n' + js + '\n</script>\n'
    (out / 'skanoid.html').write_text(page)
    (out / 'skanoid_page.html').write_text('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"></head><body>' + page + '</body></html>')
    print('artifact', len(page))
else:
    boot = """(function(){var SNAP=%s,done=false,q=new URLSearchParams(location.search);
  function go(ev){if(done)return;done=true;window.__GAME_DATA={events:ev,evento:q.get('evento')};SKANOID();}
  var timer=setTimeout(function(){go(SNAP);},5000),fail=function(){clearTimeout(timer);go(SNAP);};
  try{var sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY,{db:{schema:'td'}});
    sb.from('site_events').select('id,event_date,event_time,venue,city,description,is_published').then(function(r){clearTimeout(timer);if(r.error||!r.data)return fail();go(r.data);},fail);}catch(e){fail();}
})();""" % json.dumps(events, ensure_ascii=False)
    meta = """<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="description" content="Skanoid, il gioco dei 2Deep: spacca il muro al neon, accendi l'insegna al neon con la prossima serata. Ogni colpo suona una nota, a 432 Hz.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.2deep.it/skanoid">
<meta property="og:title" content="Skanoid · il gioco dei 2Deep">
<meta property="og:description" content="Spacca il muro e accendi l'insegna della prossima serata. Il muro suona: ogni colpo è una nota, a 432 Hz.">
<meta property="og:image" content="https://www.2deep.it/assets/giochi/og-skanoid.jpg">
<meta property="og:image:secure_url" content="https://www.2deep.it/assets/giochi/og-skanoid.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Skanoid: il gioco dei 2Deep, un muro al neon sopra l'insegna della serata">
<meta property="og:locale" content="it_IT">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://www.2deep.it/assets/giochi/og-skanoid.jpg">
<meta name="theme-color" content="#05030c">
<link rel="canonical" href="https://www.2deep.it/skanoid">
"""
    pre, post = head.split('<!--SITEBAR-->', 1)
    page = (meta + pre + '</head>\n<body>\n' + SITEBAR + post +
            '\n<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js"></script>\n<script src="/config.js"></script>\n<script>\n' +
            game('/assets/giochi/icone/corona.webp') + '\n' + boot + '\n</script>\n</body>\n</html>\n')
    (ROOT / 'skanoid.html').write_text(page)
    print('skanoid.html', len(page))
