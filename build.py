#!/usr/bin/env python3
"""Arma index.html a partir de src/ y assets/img/.

Uso:
    python build.py            -> index.html con las fotos como archivos (para GitHub Pages)
    python build.py --inline   -> un solo archivo con las fotos adentro (para mandarlo suelto)

Solo usa la biblioteca estándar de Python 3.
"""
import base64
import json
import os
import re
import sys

# Dirección pública del sitio: se usa en la vista previa al compartir el link (WhatsApp, redes).
SITE_URL = 'https://brianmettica97-creator.github.io/novantiq-cafe/'

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
IMG = os.path.join(ROOT, 'assets', 'img')
INLINE = '--inline' in sys.argv

PRODUCTS = ['espresso', 'cortado', 'flatwhite', 'cappuccino', 'submarino', 'iced', 'coldbrew', 'jugo',
            'filtrado_et', 'filtrado_co', 'medialunas', 'alfajores', 'cookie', 'cheesecake', 'budin', 'tostado', 'avocado']


def read(*parts):
    with open(os.path.join(SRC, *parts), encoding='utf-8') as f:
        return f.read()


def img(name):
    if INLINE:
        with open(os.path.join(IMG, name + '.webp'), 'rb') as f:
            return 'data:image/webp;base64,' + base64.b64encode(f.read()).decode()
    return 'assets/img/' + name + '.webp'


icons = json.loads(read('icons.json'))
svg = lambda n: f'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">{icons[n]}</svg>'

page = read('page.html')
css = read('styles.css')
js = read('app.js')
sim = ''.join(read('sim', f) for f in sorted(os.listdir(os.path.join(SRC, 'sim'))) if f.endswith('.js'))
js = js.replace('/*{{SIM}}*/', sim).replace('/*{{MOTION}}*/', read('motion.js'))
js = js.replace('{{IMAGES}}', json.dumps({k: img(k) for k in PRODUCTS})).replace('{{ICONS}}', json.dumps(icons))
js = js.replace('{{PUBLIC_URL}}', '')  # vacío: los QR de mesa usan la dirección donde está publicada la página

page = page.replace('{{CSS}}', css)
page = re.sub(r'\{\{IMG:(\w+)\}\}', lambda m: img(m.group(1)), page)
page = re.sub(r'\{\{ICON:(\w+)\}\}', lambda m: svg(m.group(1)), page)
seat = f'<svg class="seat" viewBox="0 0 24 24" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round">{icons["seat"]}</svg>'
page = page.replace('{{SEATS}}', seat * 10)
page = page.replace('{{JS}}', js)
left = [m for m in re.findall(r'\{\{[^}]*\}\}', page) if not m.startswith("{{'")]
assert not left, left[:5]

# el encabezado va en <head>; el resto, en <body>
cut = page.index('</style>') + len('</style>')
head, body = page[:cut], page[cut:]
head = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
desc = re.search(r'<meta name="description" content="([^"]*)"', head).group(1)
share = (f'<meta property="og:type" content="website">\n<meta property="og:title" content="NOVANTIQ Café: el sistema para cafeterías">\n'
         f'<meta property="og:description" content="{desc}">\n<meta property="og:url" content="{SITE_URL}">\n'
         f'<meta property="og:image" content="{SITE_URL}assets/img/og.jpg">\n<meta name="twitter:card" content="summary_large_image">\n')
base_css = (':root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
            'body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}')
html = ('<!doctype html>\n<html lang="es-AR">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        f'<style>{base_css}</style>\n{share}{head}\n</head>\n<body>\n{body.strip()}\n</body>\n</html>\n')

out = os.path.join(ROOT, 'novantiq-cafe.html' if INLINE else 'index.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(html)
print('Listo:', os.path.relpath(out, ROOT), f'({os.path.getsize(out) // 1024} KB)')
