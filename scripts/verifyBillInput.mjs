import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const outfile = join(mkdtempSync(join(tmpdir(), 'autokira-bill-')), 'store.mjs');
await build({ entryPoints: ['src/stores/calculator.store.ts'], outfile, bundle: true, platform: 'node', format: 'esm' });
const { useCalculatorStore: store } = await import(pathToFileURL(outfile).href);
assert.equal(typeof store.getState().setBaselineBillRm, 'function', 'Household bill must be stored independently from estimated kWh');
for (const amount of [100, 172.71, 200, 220, 230, 250]) {
  store.getState().setBaselineBillRm(amount);
  assert.equal(store.getState().baselineBillRm, amount, 'Preserve the entered amount, including tariff gaps');
  assert.ok(Number.isFinite(store.getState().baselineKwh));
  store.getState().setMileage(1500);
  assert.equal(store.getState().baselineBillRm, amount, 'Other edits must not overwrite the bill');
}
store.getState().setBaselineKwh(501);
assert.equal(store.getState().baselineBillRm, null, 'An explicit kWh edit replaces the bill estimate');
assert.equal(store.getState().baselineKwh, 501);
console.log('PASS: entered bills survive tariff gaps and unrelated edits; explicit kWh replaces the estimate.');
