"""Prepare index.html for deploy. Run after editing assets/style.css or the JS files:

    python3 scripts/build.py

- Inlines assets/style.css into index.html (no render-blocking stylesheet request).
- Stamps ?v=<hash> on common.js / home.js so visitors never get a stale copy.
"""
import hashlib, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
html = open('index.html', encoding='utf-8').read()

css = open('assets/style.css', encoding='utf-8').read()
css = css.replace("url('fonts/", "url('/assets/fonts/")
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)          # comments
css = re.sub(r'\s+', ' ', css)                            # whitespace
css = re.sub(r'\s*([{};:,>])\s*', r'\1', css).replace(';}', '}').strip()
block = '<style id="site-css">' + css + '</style>'
if '<style id="site-css">' in html:
    html = re.sub(r'<style id="site-css">.*?</style>', lambda m: block, html, flags=re.S)
else:
    html = re.sub(r'<link rel="stylesheet" href="/assets/style\.css(\?v=[0-9a-f]+)?" />', lambda m: block, html)

for f in ['assets/common.js', 'assets/home.js']:
    v = hashlib.sha1(open(f, 'rb').read()).hexdigest()[:8]
    html = re.sub(r'(/' + re.escape(f) + r')(\?v=[0-9a-f]+)?"', r'\1?v=' + v + '"', html)

open('index.html', 'w', encoding='utf-8').write(html)
print('inlined css:', len(css), 'bytes;', re.findall(r'\?v=[0-9a-f]+', html))
