#!/usr/bin/env python3
"""Build a name-only model catalogue from JPJ registration CSVs."""
import argparse
import collections
import csv
import datetime
import json
import os
from pathlib import Path
import tempfile
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('--input', help='Local JPJ CSV for reproducible checks')
parser.add_argument('--year', type=int, default=datetime.date.today().year)
args = parser.parse_args()

def url_for(year):
    return f'https://storage.data.gov.my/transportation/cars_{year}.csv'

downloaded = None
if args.input:
    stream = open(args.input, encoding='utf-8-sig', newline='')
else:
    # curl uses the operating system's certificate store, including on macOS.
    downloaded = tempfile.NamedTemporaryFile(prefix='autokira-jpj-', suffix='.csv')
    def download(year):
        return subprocess.run(['curl', '--location', '--silent', '--show-error', '--fail', '--retry', '2', '--connect-timeout', '15', '--max-time', '180', '--output', downloaded.name, '--write-out', '%{http_code}', url_for(year)], capture_output=True, text=True, timeout=200)
    response = download(args.year)
    if response.returncode and response.stdout == '404' and args.year == datetime.date.today().year:
        args.year -= 1
        response = download(args.year)
    if response.returncode:
        raise RuntimeError(f'JPJ download failed ({response.stdout}): {response.stderr.strip()}')
    stream = open(downloaded.name, encoding='utf-8-sig', newline='')
counts = collections.Counter()
latest = ''
rows = 0
with stream:
    reader = csv.DictReader(stream)
    if not reader.fieldnames or not {'date_reg', 'maker', 'model', 'fuel'}.issubset(reader.fieldnames):
        raise ValueError('Unexpected JPJ CSV columns; keeping the previous catalogue')
    for row in reader:
        rows += 1
        maker, model, fuel = (row.get(k, '').strip() for k in ('maker', 'model', 'fuel'))
        date = row.get('date_reg', '').strip()
        if date.startswith(str(args.year)) and len(date) == 10:
            latest = max(latest, date)
        if not maker or not model or len(maker) > 60 or len(model) > 80:
            continue
        if fuel == 'electric': kind = 'ev'
        elif fuel in ('petrol', 'hybrid_petrol'): kind = 'ice'
        elif fuel in ('diesel', 'greendiesel', 'hybrid_diesel'): kind = 'diesel'
        else: continue
        counts[(maker, model, kind)] += 1
if downloaded:
    downloaded.close()
if rows < 1000 or len(counts) < 50 or not latest:
    raise ValueError('JPJ data is incomplete; keeping the previous catalogue')
vehicles = [{'maker': m, 'model': n, 'kind': k, 'registrations': count} for (m, n, k), count in sorted(counts.items(), key=lambda x: (-x[1], x[0]))]
result = {'year': args.year, 'dataThrough': latest, 'source': url_for(args.year), 'vehicles': vehicles}
output = Path('src/data/jpjVehicles.json')
output.parent.mkdir(parents=True, exist_ok=True)
with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=output.parent, delete=False) as target:
    json.dump(result, target, ensure_ascii=False, separators=(',', ':'))
    target.write('\n')
    temporary = target.name
os.replace(temporary, output)
print(f'Imported {len(vehicles)} model/fuel combinations from {rows} registrations through {latest}.')
