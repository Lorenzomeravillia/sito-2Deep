"""The games hub, 2deep.it/giochi: python3 sala-giochi/build.py -> ../giochi.html (the top bar back to the site is flipper/sitebar.html)."""
import pathlib
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
page = (HERE / 'giochi.src.html').read_text().replace('<!--SITEBAR-->', (ROOT / 'flipper' / 'sitebar.html').read_text())
(ROOT / 'giochi.html').write_text(page)
print('giochi.html', len(page))
