"""Libera: a calm Xonix where the note uncovers the poster of the 2Deep's next gig.
   Built from the promo engine's font, sprites and synth (../video-promo) and the files in this folder.

   python3 libera/build.py                 -> ../libera.html, the page at 2deep.it/libera: dates, venue profiles,
                                                 songs and the band's photos come from Supabase when the page opens
                                                 (site_data.json if it does not answer within 5 seconds)
   python3 libera/build.py --artifact DIR  -> DIR/libera.html for claude.ai: data frozen from site_data.json, the
                                                 venue photos inline, pinned to the date in --evento (default: the Cantonet)

   content.js turns the data into what the game shows (CFG), game.js the game, song.js how the flipper's song engine and BRANO
   panel (../flipper/music.js, songui.js, store_site.js) work here: same song as the flipper, layers by uncovered share;
   gamesong.js the built-in 2Deep loop, head.html styles and markup. Address options: ?evento=<date id> shows that date,
   ?scheda=<profile id> previews a venue profile on the next date (used by the admin)."""
import base64, io, json, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
SRC = ROOT / 'video-promo'
FL = lambda n: (ROOT / 'flipper' / n).read_text()
P = lambda n: (SRC / n).read_text()
H = lambda n: (HERE / n).read_text()

PREFIX = "let W=270,H=480;const cv=document.getElementById('c');let ctx=cv.getContext('2d');"


def game_js():
    return '\n'.join([PREFIX, P('part_utils.js'), P('part_spritefn.js'), P('sprites.js'), "const OUTC='#0a0716';", P('part_misc.js'),
                      P('part_audio.js'), P('monkey/part_sprites.js'), H('content.js'), H('gamesong.js'), H('song.js'),
                      FL('store_site.js'), FL('music.js'), H('hd.js'), H('game.js'), FL('songui.js')])


SNAP = json.loads(H('site_data.json'))
head = H('head.html')
# the way back to the site (the flipper's bar), first thing in the body
SITEBAR = FL('sitebar.html') + FL('nozoom.html')  # and no page zoom

if '--artifact' in sys.argv:
    from PIL import Image
    out = pathlib.Path(sys.argv[sys.argv.index('--artifact') + 1])
    out.mkdir(parents=True, exist_ok=True)
    evento = sys.argv[sys.argv.index('--evento') + 1] if '--evento' in sys.argv else 'f93c1503-53ec-42f1-83e0-1d42d595c403'

    def inline(url):
        # site paths become small inline JPEGs (claude.ai pages cannot load the site's files)
        if not url or not url.startswith('/'):
            return None
        if url.endswith('.webp'):  # cut-out photos keep their transparency
            return 'data:image/webp;base64,' + base64.b64encode((ROOT / url.lstrip('/')).read_bytes()).decode()
        im = Image.open(ROOT / url.lstrip('/')).convert('RGB')
        im.thumbnail((640, 800))
        b = io.BytesIO(); im.save(b, 'JPEG', quality=78)
        return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    data = json.loads(json.dumps(SNAP))
    for v in data['venues']:
        for it in v.get('items', []):
            it['photo'] = inline(it.get('photo'))
            it['cut'] = inline(it.get('cut'))
        if v.get('mystery'):
            v['mystery']['photo'] = inline(v['mystery'].get('photo'))
    data['photos'] = []
    # the 3D icons and the handwriting font, inline too
    icons = {f.stem: 'data:image/webp;base64,' + base64.b64encode(f.read_bytes()).decode() for f in sorted((ROOT / 'assets/giochi/icone').glob('*.webp'))}
    font = 'data:font/woff2;base64,' + base64.b64encode((ROOT / 'assets/giochi/caveat-700.woff2').read_bytes()).decode()
    data['evento'] = evento
    # no song in the snapshot: the claude.ai page plays the 2Deep loop (or a song set up on that page, kept in its browser)
    js = '(()=>{\n"use strict";\nwindow.__GAME_DATA=' + json.dumps(data, ensure_ascii=False) + ';window.__SITE_DATA={};window.__SB=null;\nwindow.__GAME_ICONS=' + json.dumps(icons) + ';window.__GAME_FONT=' + json.dumps(font) + ';\n' + game_js() + '\n})();'
    page = head.replace('<!--SITEBAR-->', SITEBAR.replace(' data-site>', ' data-site target="_blank" rel="noopener">')) + '\n<script>\n' + js + '\n</script>\n'
    (out / 'libera.html').write_text(page)
    (out / 'libera_page.html').write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"></head><body>' + page + '</body></html>')
    print('artifact', len(page))
else:
    snap = json.dumps(SNAP, ensure_ascii=False)
    # read the dates, the venue profiles, the songs and the band's photos, then start the game (the snapshot after 5 s without an answer)
    boot = """(function(){var SNAP=%s,done=false,q=new URLSearchParams(location.search);
  function go(d,song){if(done)return;done=true;d.evento=q.get('evento');d.scheda=q.get('scheda');window.__GAME_DATA=d;window.__SITE_DATA=song===undefined?{}:{song:song};GAME();}
  var timer=setTimeout(function(){go(SNAP);},5000),fail=function(){clearTimeout(timer);go(SNAP);};
  try{var sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY,{db:{schema:'td'}});window.__SB=sb;var B=window.SUPABASE_URL+'/storage/v1/object/public/td-site/';
    Promise.all([sb.from('site_events').select('id,event_date,event_time,venue,city,description,is_published,game_venue_id'),
                 sb.from('game_venues').select('id,short_name,tagline,colors,items,mystery'),
                 sb.from('site_repertoire').select('song_title,artist').eq('is_active',true),
                 sb.from('site_images').select('role,filename').eq('is_active',true).in('role',['hero','katia','lorenzo','sound']),
                 sb.from('site_content').select('content_value').eq('section','video').eq('content_key','settings'),
                 sb.from('site_content').select('content_value').eq('section','pinball').eq('content_key','song')]).then(function(r){
      if(r[0].error)return fail();
      var ok=function(i,def){return r[i].error||!r[i].data?def:r[i].data;},set=ok(4,[]);
      clearTimeout(timer);
      go({events:r[0].data||[],venues:ok(1,SNAP.venues),songs:ok(2,SNAP.songs),photos:ok(3,[]).map(function(x){return B+x.filename;}),
          settings:set.length?set[0].content_value:SNAP.settings},r[5].error?undefined:(r[5].data&&r[5].data.length?r[5].data[0].content_value:null));},fail);}catch(e){fail();}
})();""" % snap
    meta = """<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="description" content="Libera, il gioco dei 2Deep: chiudi le aree, scopri dove suoniamo la prossima serata e segnala in calendario.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.2deep.it/libera">
<meta property="og:title" content="Libera · il gioco dei 2Deep">
<meta property="og:description" content="Un gioco tranquillo: chiudi le aree e scopri la locandina della prossima serata dei 2Deep.">
<meta property="og:image" content="https://www.2deep.it/assets/giochi/og-libera.jpg">
<meta property="og:image:secure_url" content="https://www.2deep.it/assets/giochi/og-libera.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Libera: il gioco dei 2Deep con Katia, Lorenzo e Re Divano">
<meta property="og:locale" content="it_IT">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://www.2deep.it/assets/giochi/og-libera.jpg">
<meta name="theme-color" content="#07050f">
<link rel="canonical" href="https://www.2deep.it/libera">
"""
    page = (meta + head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '').split('<!--SITEBAR-->')[0] + '</head>\n<body>\n' + SITEBAR +
            head.split('<!--SITEBAR-->', 1)[1] +
            '\n<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js"></script>\n<script src="/config.js"></script>\n<script>\nfunction GAME(){\n"use strict";\n' +
            game_js() + '\n}\n' + boot + '\n</script>\n</body>\n</html>\n')
    (ROOT / 'libera.html').write_text(page)
    print('libera.html', len(page))
