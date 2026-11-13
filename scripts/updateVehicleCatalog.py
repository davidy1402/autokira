#!/usr/bin/env python3
"""Build a name-only model catalogue from JPJ registration CSVs.

Supports multi-year aggregation, offline CSV inputs, and incremental merges.
Data source: Malaysian Road Transport Department (JPJ) via data.gov.my under CC BY 4.0.
"""
import argparse
import collections
import csv
import datetime
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile

def parse_year_range(value: str) -> list[int]:
    if '-' in value:
        start_s, end_s = value.split('-', 1)
        return list(range(int(start_s), int(end_s) + 1))
    if ',' in value:
        return [int(y.strip()) for y in value.split(',') if y.strip()]
    return [int(value)]

parser = argparse.ArgumentParser(description='Refresh JPJ vehicle registration catalogue.')
parser.add_argument('--input', help='Local JPJ CSV file for reproducible offline checks')
parser.add_argument('--year', type=int, help='Single calendar year to import (default: current year)')
parser.add_argument('--years', help='Range or list of years to import, e.g. 2020-2026 or 2020,2024,2026')
parser.add_argument('--all-years', action='store_true', help='Import full 2020-present historical window')
parser.add_argument('--merge', action=argparse.BooleanOptionalAction, default=True,
                    help='Merge imported year data into existing catalogue rather than overwriting completely')
parser.add_argument('--output', default='src/data/jpjVehicles.json', help='Output JSON path')
args = parser.parse_args()

current_year = datetime.date.today().year

if args.all_years:
    target_years = list(range(2020, current_year + 1))
elif args.years:
    target_years = parse_year_range(args.years)
elif args.year:
    target_years = [args.year]
else:
    target_years = [current_year]

def url_for(year: int) -> str:
    return f'https://storage.data.gov.my/transportation/cars_{year}.csv'

counts = collections.Counter()
latest_date = ''
total_rows = 0
processed_years = []

def process_stream(stream, year_filter: int | None = None) -> tuple[int, str]:
    rows = 0
    local_latest = ''
    reader = csv.DictReader(stream)
    if not reader.fieldnames or not {'date_reg', 'maker', 'model', 'fuel'}.issubset(reader.fieldnames):
        raise ValueError('Unexpected JPJ CSV columns; keeping the previous catalogue')
    for row in reader:
        rows += 1
        maker, model, fuel = (row.get(k, '').strip() for k in ('maker', 'model', 'fuel'))
        date = row.get('date_reg', '').strip()
        if len(date) == 10:
            if year_filter is None or date.startswith(str(year_filter)):
                if not local_latest or date > local_latest:
                    local_latest = date
        if not maker or not model or len(maker) > 60 or len(model) > 80:
            continue
        if fuel == 'electric':
            kind = 'ev'
        elif fuel in ('petrol', 'hybrid_petrol'):
            kind = 'ice'
        elif fuel in ('diesel', 'greendiesel', 'hybrid_diesel'):
            kind = 'diesel'
        else:
            continue
        counts[(maker, model, kind)] += 1
    return rows, local_latest

if args.input:
    print(f'Processing local file: {args.input}')
    with open(args.input, encoding='utf-8-sig', newline='') as f:
        rows, l_date = process_stream(f, args.year if args.year else None)
        total_rows += rows
        if l_date and l_date > latest_date:
            latest_date = l_date
        processed_years = [args.year or current_year]
else:
    for y in target_years:
        print(f'Downloading JPJ catalogue for {y}...')
        proc = subprocess.Popen(
            ['curl', '--location', '--silent', '--show-error', '--fail', '--retry', '2',
             '--connect-timeout', '15', '--max-time', '180', url_for(y)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=False
        )
        assert proc.stdout is not None
        stream = io.TextIOWrapper(proc.stdout, encoding='utf-8-sig', errors='replace')
        try:
            rows, l_date = process_stream(stream, y)
        except Exception as e:
            proc.kill()
            if y == current_year and len(target_years) == 1:
                # If current year is not yet published (e.g. Jan 1), try previous year
                print(f'Year {y} returned an error ({e}), retrying {y - 1}...')
                proc = subprocess.Popen(
                    ['curl', '--location', '--silent', '--show-error', '--fail', '--retry', '2',
                     '--connect-timeout', '15', '--max-time', '180', url_for(y - 1)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=False
                )
                assert proc.stdout is not None
                stream = io.TextIOWrapper(proc.stdout, encoding='utf-8-sig', errors='replace')
                rows, l_date = process_stream(stream, y - 1)
                y = y - 1
            else:
                raise RuntimeError(f'Failed to process JPJ year {y}: {e}')
        proc.wait()
        if proc.returncode != 0:
            err = proc.stderr.read().decode('utf-8', errors='ignore') if proc.stderr else ''
            raise RuntimeError(f'curl failed for year {y} with code {proc.returncode}: {err}')
        total_rows += rows
        if l_date and l_date > latest_date:
            latest_date = l_date
        processed_years.append(y)
        print(f'Year {y}: {rows} rows processed. Total unique models so far: {len(counts)}')

output_path = Path(args.output)
output_path.parent.mkdir(parents=True, exist_ok=True)

final_years = sorted(set(processed_years))

# If merge is enabled and an existing catalogue exists, combine registrations
if args.merge and output_path.exists() and len(processed_years) < 5:
    try:
        with open(output_path, encoding='utf-8') as ef:
            existing_data = json.load(ef)
            existing_vehicles = existing_data.get('vehicles', [])
            existing_years = existing_data.get('years', [existing_data.get('year')])
            for v in existing_vehicles:
                key = (v['maker'], v['model'], v['kind'])
                # If the key was already counted from current run, keep max or accumulated
                if key not in counts:
                    counts[key] = v.get('registrations', 1)
            final_years = sorted(set(existing_years + processed_years))
            if existing_data.get('dataThrough', '') > latest_date:
                latest_date = existing_data['dataThrough']
            print(f'Merged with existing catalogue. Combined unique models: {len(counts)}')
    except Exception as e:
        print(f'Notice: Could not merge existing catalogue ({e}), generating afresh.')

if len(counts) < 50:
    raise ValueError(f'JPJ data incomplete ({len(counts)} models, {total_rows} rows); aborting save.')

vehicles = [
    {'maker': m, 'model': n, 'kind': k, 'registrations': count}
    for (m, n, k), count in sorted(counts.items(), key=lambda x: (-x[1], x[0]))
]

result = {
    'year': final_years[-1] if final_years else current_year,
    'years': final_years,
    'dataThrough': latest_date,
    'totalRegistrations': sum(v['registrations'] for v in vehicles),
    'source': 'https://data.gov.my/data-catalogue/registration_transactions_car',
    'vehicles': vehicles
}

with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=output_path.parent, delete=False) as target:
    json.dump(result, target, ensure_ascii=False, separators=(',', ':'))
    target.write('\n')
    temporary = target.name

os.replace(temporary, output_path)
print(f'Successfully wrote {len(vehicles)} models ({result["totalRegistrations"]} registrations, years {final_years}, through {latest_date}) to {output_path}.')
