import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const output = join(mkdtempSync(join(tmpdir(), 'autokira-search-')), 'search.mjs');
await build({ entryPoints: ['src/utils/vehicleSearch.ts'], outfile: output, bundle: true, platform: 'node', format: 'esm' });
const { matchesVehicle } = await import(pathToFileURL(output).href);
for (const query of ['Myvi', '迈威', 'myvii', 'perodua myvi', 'PERODUA MYVI 2021']) {
  assert.equal(matchesVehicle(query, 'Perodua Myvi 1.5 X/H/AV D-CVT (2021 generation)'), true, query);
}
assert.equal(matchesVehicle('迈威 2020', 'Perodua Myvi 1.5 D-CVT (2021 generation)'), false);
assert.equal(matchesVehicle('Bezza', 'Perodua Myvi 1.5'), false);
assert.equal(matchesVehicle('byd atto', 'BYD Atto 3 SR'), true);
assert.equal(matchesVehicle('hrv hybrid', 'Honda HR-V 1.5 e:HEV RS Hybrid (2025 update)'), true);
assert.equal(matchesVehicle('HR-V', 'Honda HR-V 1.5 S CVT'), true);
console.log('PASS: car search handles brand, model, year, Chinese aliases and one-character typo.');
