"""Rebuild the link preview of 2deep.it/gioca (assets/flipper/og-gioca.jpg, 1200x630).
   1. python3 flipper/build.py --artifact /tmp/og      (a local copy of the game, no network needed)
   2. node flipper/og/shots.cjs /tmp/og                (a frame of the table, without dates, then the composed image)
   This script is step 2's helper: it joins the shared sprite sources and compose.js into og.html next to table.png."""
import sys, os
V = os.path.join(os.path.dirname(__file__), '..', '..', 'video-promo')
out = sys.argv[1]
parts = ["let W=1200,H=630;let ctx=null;"] + [open(os.path.join(V, f)).read() for f in ['part_utils.js', 'part_spritefn.js', 'sprites.js']]
parts += ["const OUTC='#0a0716';", open(os.path.join(V, 'part_misc.js')).read(), open(os.path.join(V, 'monkey', 'part_sprites.js')).read(),
          open(os.path.join(os.path.dirname(__file__), 'compose.js')).read()]
html = ('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#000}canvas{display:block}</style></head>'
        '<body><canvas id="c" width="1200" height="630"></canvas><script>\n' + '\n'.join(parts) + '\n</script></body></html>')
open(os.path.join(out, 'og.html'), 'w').write(html)
