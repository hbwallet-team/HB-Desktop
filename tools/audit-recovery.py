#!/usr/bin/env python3
"""Static, offline completeness check for a recovered Electron app.
No dependencies, network, execution of recovered JS, or installer launch.
"""
from pathlib import Path
import json
import re
import sys

root = Path(__file__).resolve().parents[1]
issues = []
package_path = root / 'package.json'
if not package_path.is_file():
    print('ERROR: package.json missing')
    sys.exit(2)
package = json.loads(package_path.read_text(encoding='utf-8'))
main = package.get('main', 'index.js')
checks = {
    'package.json': package_path.is_file(),
    f'Electron main ({main})': (root / main).is_file(),
    'src/': (root / 'src').is_dir(),
    'node_modules/': (root / 'node_modules').is_dir(),
    'build/static/js/': (root / 'build/static/js').is_dir(),
    'build/static/css/': (root / 'build/static/css').is_dir(),
    'build/favicon.ico': (root / 'build/favicon.ico').is_file(),
    'npm scripts': bool(package.get('scripts')),
    'lockfile': any((root / name).exists() for name in ('package-lock.json','yarn.lock','pnpm-lock.yaml')),
}
html = root / 'build/index.html'
if html.is_file():
    content = html.read_text(encoding='utf-8', errors='replace')
    for target in re.findall(r'(?:src|href)=["\']([^"\']+)', content):
        if target.startswith(('http://','https://','data:','#')):
            continue
        target = target.lstrip('./').split('?')[0]
        checks[f'HTML asset: {target}'] = (root / 'build' / target).exists()
print('HB Wallet Desktop — offline recovery completeness audit')
print(f"Package: {package.get('name', 'unknown')} {package.get('version', 'unknown')}")
for name, present in checks.items():
    print(f"{'OK     ' if present else 'MISSING'} {name}")
missing = [name for name, present in checks.items() if not present]
print(f'\n{len(missing)} missing items. No code was executed.')
if missing:
    print('Result: incomplete recovery; build/run readiness NOT established.')
    sys.exit(1)
print('Result: file presence checks passed; build/run readiness still NOT established.')
