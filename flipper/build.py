"""2Deep Pinball, built from the promo engine's font, sprites and synth (../video-promo), the levels engine of the
   "Prossimi livelli" video (../assets/2deep-engine.js) and the files in this folder.

   python3 flipper/build.py                  -> ../gioca.html, the page at 2deep.it/gioca: dates, song and admin rights
                                                 come from Supabase when the page opens (site_data.json if it does not answer)
   python3 flipper/build.py --artifact DIR   -> DIR/pinball.html for claude.ai (dates frozen from site_data.json, song in the
                                                 page's own database) and DIR/pinball_page.html, a wrapper for local tests

   game.js the table, music.js the song in layers, songui.js the BRANO editor, bridge.js dates -> levels,
   store_site.js / store_artifact.js where the song is saved, head.html styles and markup."""
import json, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
SRC = ROOT / 'video-promo'
P = lambda n: (SRC / n).read_text()
H = lambda n: (HERE / n).read_text()

PREFIX = """let W=270,H=480;
const cv=document.getElementById('c');const OUTX=cv.getContext('2d');
const LG=document.createElement('canvas');LG.width=270;LG.height=480;
let ctx=LG.getContext('2d');ctx.imageSmoothingEnabled=false;"""

SNAP = json.dumps(json.loads(H('site_data.json')), ensure_ascii=False)


def game_js(store):
    # the levels engine exactly as the site serves it, in its own scope and with its own canvas
    eng = (ROOT / 'assets' / '2deep-engine.js').read_text()
    assert "const cv=document.getElementById('c');" in eng
    eng = eng.replace("const cv=document.getElementById('c');", "const cv=document.createElement('canvas');cv.width=216;cv.height=384;")
    levels = '(()=>{\n' + eng + '\n' + H('bridge.js').replace('/*SITE_DATA*/null', SNAP) + '\n})();'
    game = '\n'.join(['(()=>{\n"use strict";', PREFIX, P('part_utils.js'), P('part_spritefn.js'), P('sprites.js'), "const OUTC='#0a0716';",
                      P('part_misc.js'), P('part_audio.js'), P('monkey/part_sprites.js'), H(store), H('music.js'), H('game.js'), H('songui.js'), '})();'])
    return levels + '\n' + game


head = H('head.html')
cut = head.index('<div id="stage"')
HEAD, BODY = head[:cut], head[cut:]

if '--artifact' in sys.argv:
    out = pathlib.Path(sys.argv[sys.argv.index('--artifact') + 1])
    out.mkdir(parents=True, exist_ok=True)
    page = HEAD + BODY + '\n<script>\n' + game_js('store_artifact.js') + '\n</script>\n'
    (out / 'pinball.html').write_text(page)
    (out / 'pinball_page.html').write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + page + '</body></html>')
    print('artifact', len(page))
else:
    # on the site: read dates, video names and the song first, then start the game (snapshot after 5 s without an answer)
    boot = """(function(){var SNAP=%s,done=false;
  function go(d){if(done)return;done=true;window.__SITE_DATA=d;GAME();}
  var timer=setTimeout(function(){go(SNAP);},5000),fail=function(){clearTimeout(timer);go(SNAP);};
  try{var sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY,{db:{schema:'td'}});window.__SB=sb;
    Promise.all([sb.from('site_events').select('id,event_date,event_time,venue,city,description,is_published'),
                 sb.from('site_content').select('section,content_key,content_value').in('section',['video','pinball'])]).then(function(r){
      if(r[0].error||r[1].error)return fail();var c=r[1].data||[],get=function(s,k){for(var i=0;i<c.length;i++)if(c[i].section===s&&c[i].content_key===k)return c[i].content_value;return null;};
      clearTimeout(timer);go({events:r[0].data||[],settings:get('video','settings')||'{}',song:get('pinball','song')});},fail);}catch(e){fail();}
})();""" % SNAP
    meta = """<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Il flipper dei 2Deep: gioca, scopri le prossime serate dal vivo e segnale in calendario.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.2deep.it/gioca">
<meta property="og:title" content="2Deep Pinball">
<meta property="og:description" content="Gioca al flipper dei 2Deep e scopri dove suoniamo le prossime serate.">
<meta property="og:image" content="https://jvcvxzampxopvihahwbh.supabase.co/storage/v1/object/public/td-site/hero/img_3378.jpeg">
<meta property="og:locale" content="it_IT">
<meta name="theme-color" content="#07050f">
"""
    HEAD_SITE = HEAD.replace('<title>2Deep Pinball</title>', '<title>2Deep Pinball · gioca e scopri le prossime serate</title>').replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
    BODY_SITE = BODY.replace('<a class="site" href="https://www.2deep.it" target="_blank" rel="noopener">', '<a class="site" href="/#events-section">')
    assert BODY_SITE != BODY
    page = (meta + HEAD_SITE + '</head>\n<body>\n' + BODY_SITE +
            '\n<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js"></script>\n<script src="/config.js"></script>\n<script>\nfunction GAME(){\n' +
            game_js('store_site.js') + '\n}\n' + boot + '\n</script>\n</body>\n</html>\n')
    (ROOT / 'gioca.html').write_text(page)
    print('gioca.html', len(page))
