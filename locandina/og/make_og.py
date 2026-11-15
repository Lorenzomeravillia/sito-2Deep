"""Rebuild the link preview of 2deep.it/locandina (assets/giochi/og-locandina.jpg, 1200x630): node locandina/og/shots.cjs
   takes frame.png from the local page and calls this script, which joins the shared sprite sources and compose.js into og.html."""
import sys, os
V = os.path.join(os.path.dirname(__file__), '..', '..', 'video-promo')
out = sys.argv[1]
parts = ["let W=1200,H=630;let ctx=null;"] + [open(os.path.join(V, f)).read() for f in ['part_utils.js']] + [open(os.path.join(os.path.dirname(__file__), 'compose.js')).read()]
open(os.path.join(out, 'og.html'), 'w').write('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#000}canvas{display:block}</style></head>'
    '<body><canvas id="c" width="1200" height="630"></canvas><script>\n' + '\n'.join(parts) + '\n</script></body></html>')
