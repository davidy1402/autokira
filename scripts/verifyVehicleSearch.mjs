import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const output = join(mkdtempSync(join(tmpdir(), 'autokira-search-')), 'search.mjs');
await build({ entryPoints: ['src/utils/vehicleSearch.ts'], outfile: output, bundle: true, platform: 'node', format: 'esm' });
const { matchesVehicle } = await import(pathToFileURL(output).href);

// Basic brand & model queries
for (const query of ['Myvi', '迈威', 'myvii', 'perodua myvi', 'PERODUA MYVI 2021']) {
  assert.equal(matchesVehicle(query, 'Perodua Myvi 1.5 X/H/AV D-CVT (2021 generation)'), true, query);
}
assert.equal(matchesVehicle('迈威 2020', 'Perodua Myvi 1.5 D-CVT (2021 generation)'), false);
assert.equal(matchesVehicle('Bezza', 'Perodua Myvi 1.5'), false);

// EV queries & Chinese aliases
assert.equal(matchesVehicle('byd atto', 'BYD Atto 3 SR'), true);
assert.equal(matchesVehicle('atto3', 'BYD Atto 3 SR'), true);
assert.equal(matchesVehicle('比亚迪 海豚', 'BYD Dolphin ER', 'BYD'), true);
assert.equal(matchesVehicle('特斯拉 m3', 'Tesla Model 3 RWD', 'Tesla'), true);
assert.equal(matchesVehicle('极氪 7x', 'Zeekr 7X RWD', 'Zeekr'), true);
assert.equal(matchesVehicle('emas 7', 'Proton e.MAS 7', 'Proton'), true);
assert.equal(matchesVehicle('e.mas 7', 'Proton e.MAS 7', 'Proton'), true);
assert.equal(matchesVehicle('好猫', 'GWM Ora Good Cat', 'GWM'), true);

// Hybrid & ICE queries
assert.equal(matchesVehicle('hrv hybrid', 'Honda HR-V 1.5 e:HEV RS Hybrid (2025 update)'), true);
assert.equal(matchesVehicle('HR-V', 'Honda HR-V 1.5 S CVT'), true);
assert.equal(matchesVehicle('丰田 威驰', 'Toyota Vios 1.5 E/G', 'Toyota'), true);
assert.equal(matchesVehicle('海拉克斯', 'Toyota Hilux 2.4 Double Cab', 'Toyota'), true);
assert.equal(matchesVehicle('dmax', 'Isuzu D-Max 1.9 Ddi BluePower', 'Isuzu'), true);
assert.equal(matchesVehicle('cx-5', 'Mazda CX-5 2.0G', 'Mazda'), true);
assert.equal(matchesVehicle('cx5', 'Mazda CX-5 2.0G', 'Mazda'), true);

console.log('PASS: car search handles brands, models, years, Chinese aliases, hyphens, and typos.');
