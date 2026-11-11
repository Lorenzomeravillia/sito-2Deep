"""Build the 2Deep video generator.

  python3 build.py            -> build/artifact.html (claude.ai artifact, one self-contained file)
                                 build/page.html, build/test.html (local checks)
  and, when this folder sits inside the site repo (../admin/index.html exists):
                                 ../assets/2deep-engine.js  shared engine: font, sprites, map scenes, closing scene, synth
                                 ../admin/video.html        the admin page (dates from the site database)

The engine is a plain script (no wrapper) so other pages of the site can load it too,
for example a future playable version: they get render(t), setCfg(), the sprites and the synth.
"""
import hashlib, pathlib, sys
SRC = pathlib.Path(__file__).resolve().parent
P = lambda n: (SRC / n).read_text()
OUT = SRC / 'build'; OUT.mkdir(exist_ok=True)

PREFIX = '''let W=216,H=384;const DUR=36.8;
const EXPORT=new URLSearchParams(location.search).has('export');
const cv=document.getElementById('c');
let ctx=cv.getContext('2d');const MAINCTX=ctx;
ctx.imageSmoothingEnabled=false;'''
ENGINE = [P('part_utils.js'), P('part_spritefn.js'), P('sprites.js'), "const OUTC='#0a0716';", P('part_misc.js'), P('part_world.js'),
          P('part_bg.js'), P('part_core.js'), P('part_side.js'), P('part_screens.js'), P('part_audio.js'), P('part_levels_music.js')]
UI = lambda store: [P('part_ui.js'), P('part_dates.js'), P(store), P('part_render.js')]
MB = 'https://cdn.jsdelivr.net/npm/mediabunny@1.62.1/dist/bundles/mediabunny.min.mjs'
AAC = 'https://cdn.jsdelivr.net/npm/@mediabunny/aac-encoder@1.62.1/dist/bundles/mediabunny-aac-encoder.min.mjs'
SUPA = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js'
# login uses the same public (anon) key as admin/admin.js, read from there at build time
import re as _re
_adm = SRC.parent / 'admin' / 'admin.js'
ADMIN_KEY = _re.search(r"const _SB_KEY = '([^']+)'", _adm.read_text()).group(1) if _adm.exists() else ''

head_raw = P('part_head.html')
def strip(h, tag):
    import re as _r
    return _r.sub(r'<!--%s-->.*?<!--/%s-->' % (tag, tag), '', h, flags=_r.S)
head = head_raw.replace('<!--DATES-->', '').replace('<!--/DATES-->', '').replace('{DURS}', '36,8').replace('{DUR}', '36.8').replace('{RENDER_NOTE}', ' e si apre sulla schermata con le date')
NOTE_ART = ('<p class="note">Le scritte escono in maiuscolo e senza accenti. Lo scenario si sceglie da solo in base al locale '
            '(Monkey’s, Feltre, Cimolais); ogni altro locale riceve l’osteria con il suo nome sull’insegna, e dal menu Scenario puoi cambiarlo. '
            'Un livello lasciato vuoto diventa la scheda IN ARRIVO. Il numero accanto ai livelli superati si calcola da solo.</p>')
NOTE_SITE = ('<p class="note">Le date arrivano dalla scheda Date dell’admin: le prossime tre diventano i livelli, le passate lo storico, '
             'e una data con «annullato» nelle note risulta saltata. Qui accorci i nomi, scegli lo scenario e la frase finale: '
             'queste modifiche valgono solo per il video e restano salvate nel sito. Per aggiungere o spostare una data usa la scheda Date dell’admin.</p>')
GATE = '''<div class="panel gate" id="gate" role="dialog" aria-modal="true" aria-labelledby="gTitle">
  <div class="sheet">
    <div class="head"><h2 id="gTitle">2DEEP · VIDEO PROMO</h2></div>
    <p class="meta">Accedi con le credenziali dell’admin del sito.</p>
    <label class="fld">Email<input id="gEmail" class="txt" type="email" autocomplete="username" style="text-transform:none"></label>
    <label class="fld">Password<input id="gPass" class="txt" type="password" autocomplete="current-password" style="text-transform:none"></label>
    <button id="gLogin" class="btn primary wide" type="button">Accedi</button>
    <p class="status" id="gStatus" aria-live="polite"></p>
    <a class="btn small" href="/admin">← Torna all’admin</a>
  </div>
</div>'''

# ---- artifact: one file, everything inside one wrapper ----
art_head = head.replace('<!--HEAD_EXTRA-->', '').replace('<!--BAR_EXTRA-->', '').replace('<!--DATES_NOTE-->', NOTE_ART).replace('<!--GATE-->', '')
art_js = '\n'.join(['(()=>{\n"use strict";', PREFIX] + ENGINE + UI('part_store_artifact.js') + ['})();'])
src = art_head + '\n<script>\n' + art_js + '\n</script>\n'
wrap = lambda x: '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + x + '</body></html>'
(OUT / 'artifact.html').write_text(src)
(OUT / 'page.html').write_text(wrap(src))
local = src.replace(MB, '/mb/node_modules/mediabunny/dist/bundles/mediabunny.min.mjs').replace(AAC, '/mb/node_modules/@mediabunny/aac-encoder/dist/bundles/mediabunny-aac-encoder.min.mjs')
assert local.count('/mb/node_modules') == 3
(OUT / 'test.html').write_text(wrap(local))
print('artifact', len(src))

# ---- site: shared engine file + admin page ----
site = SRC.parent
if (site / 'admin' / 'index.html').exists() or '--site' in sys.argv:
    engine = '\n'.join(['"use strict";',
        '/* 2Deep game engine (pixel font, sprites, map scenes, closing scene, chiptune synth).',
        '   Generated by video-promo/build.py: edit the sources in video-promo/, then rebuild. */', PREFIX] + ENGINE) + '\n'
    (site / 'assets').mkdir(exist_ok=True)
    (site / 'assets' / '2deep-engine.js').write_text(engine)
    v = hashlib.sha1(engine.encode()).hexdigest()[:10]
    h = head.replace('<title>2Deep Prossimi Livelli</title>', '<title>2Deep · Video promo</title>')
    h = h.replace('<!--HEAD_EXTRA-->', '<meta name="robots" content="noindex,nofollow">')
    h = h.replace('<!--BAR_EXTRA-->', '  <a id="toAdmin" class="btn small corner" href="/admin">← Admin</a>\n')
    h = h.replace('<!--DATES_NOTE-->', NOTE_SITE).replace('<!--GATE-->', GATE)
    cut = h.index('<div id="stage">')
    ui_js = '\n'.join(['(()=>{\n"use strict";'] + UI('part_store_site.js') + ['})();'])
    page = ('<!doctype html>\n<html lang="it">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
            '<!-- Generated by video-promo/build.py: edit the sources in video-promo/, then rebuild. -->\n'
            + h[:cut] + '\n</head>\n<body>\n' + h[cut:] +
            f'\n<script src="{SUPA}"></script>\n<script src="/config.js"></script>\n'
            f'<script>window.SUPABASE_ADMIN_KEY="{ADMIN_KEY}";/* same public key admin/admin.js uses to log in */</script>\n'
            f'<script src="/assets/2deep-engine.js?v={v}"></script>\n<script>\n{ui_js}\n</script>\n</body>\n</html>\n')
    (site / 'admin' / 'video.html').write_text(page)
    print('site', len(engine), len(page))

# ---- one-night promo (Monkey's Bar, 14 November): same player, MIDI music and MP4 render, its own scene ----
MPRE = """let W=216,H=384;const DUR=32.0;
const EXPORT=new URLSearchParams(location.search).has('export');
const cv=document.getElementById('c');const OUTX=cv.getContext('2d');
const LG=document.createElement('canvas');LG.width=216;LG.height=384;
const LGW=document.createElement('canvas');LGW.width=270;LGW.height=480;
let ctx=LG.getContext('2d');const MAINCTX=ctx;ctx.imageSmoothingEnabled=false;"""
M = lambda n: (SRC / 'monkey' / n).read_text()
mhead = strip(head_raw, 'DATES').replace('{DURS}', '32').replace('{DUR}', '32').replace('{RENDER_NOTE}', ', dal menu iniziale alla scheda con la data')
mhead = mhead.replace('<title>2Deep Prossimi Livelli</title>', "<title>2Deep Monkey's Bar</title>").replace('<!--HEAD_EXTRA-->', '').replace('<!--BAR_EXTRA-->', '').replace('<!--GATE-->', '')
mhead = mhead.replace('<canvas id="c" width="216" height="384"', '<canvas id="c" width="1080" height="1920"')
import re as _re
mhead = _re.sub(r'aria-label="Animazione[^"]*"', 'aria-label="Video in stile videogioco: i 2Deep e la scimmia del Monkey\'s Bar convertono la noia del sabato sera e arrivano al locale. Sabato 14 novembre dalle 18 al Monkey\'s Bar di Cugnan"', mhead, count=1)
mjs = '\n'.join(['(()=>{\n"use strict";', MPRE, P('part_utils.js'), P('part_spritefn.js'), P('sprites.js'), "const OUTC='#0a0716';", P('part_misc.js'), P('part_audio.js'),
                 M('part_sprites.js'), M('part_scene.js'), M('part_music.js'), P('part_ui.js'), P('part_render.js'), '})();'])
msrc = mhead + '\n<script>\n' + mjs + '\n</script>\n'
(OUT / 'monkey_artifact.html').write_text(msrc)
(OUT / 'monkey_page.html').write_text(wrap(msrc))
mlocal = msrc.replace(MB, '/mb/node_modules/mediabunny/dist/bundles/mediabunny.min.mjs').replace(AAC, '/mb/node_modules/@mediabunny/aac-encoder/dist/bundles/mediabunny-aac-encoder.min.mjs')
(OUT / 'monkey_test.html').write_text(wrap(mlocal))
print('monkey', len(msrc))
