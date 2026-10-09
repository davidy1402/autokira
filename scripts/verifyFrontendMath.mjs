/** Compare all numeric outputs with the pre-redesign calculator from Git HEAD. */
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const dir = mkdtempSync(join(tmpdir(), 'autokira-regression-'));
mkdirSync(join(dir, 'original'));
for (const file of ['tnbTariff.ts', 'roadTax.ts', 'iceCostCalculator.ts']) {
  writeFileSync(join(dir, 'original', file), execFileSync('git', ['show', `HEAD:src/utils/${file}`]));
}
async function load(entry, name) {
  const outfile = join(dir, `${name}.mjs`);
  await build({ entryPoints: [entry], outfile, bundle: true, platform: 'node', format: 'esm' });
  return import(pathToFileURL(outfile).href);
}
const before = await load(join(dir, 'original/tnbTariff.ts'), 'ev-before');
const after = await load(resolve('src/utils/tnbTariff.ts'), 'ev-after');
const iceBefore = await load(join(dir, 'original/iceCostCalculator.ts'), 'ice-before');
const iceAfter = await load(resolve('src/utils/iceCostCalculator.ts'), 'ice-after');
const base = {
  modelName: 'Proton e.MAS 7', consumptionKwhPer100Km: 14.5, motorPowerKw: 160,
  batteryCapacityKwh: 49.52, monthlyMileageKm: 1477, baselineHomeKwh: 501,
  baselineHomeBillRm: 0, fatherPetrolCostRm: 210, petrolEngineCc: 1500,
  chargingMode: 'mixed', petrolPricePerLiter: 1.99, petrolFuelEfficiencyKmPerL: 14,
  chargingEfficiency: .9, homeChargingRatio: .9, publicDcPricePerKwh: 1.4,
  afaRateSen: 3.8, isTouEnabled: false, touOffPeakRateSen: 28,
};
let scenarios = 0;
for (const kwh of [200, 501, 600, 601, 700, 1501]) {
  for (const mileage of [0, 800, 1477, 2000]) {
    for (const mode of ['mixed', 'public_only']) {
      for (const tou of [false, true]) {
        const input = { ...base, baselineHomeKwh: kwh, monthlyMileageKm: mileage, chargingMode: mode, homeChargingRatio: mode === 'public_only' ? 0 : .9, isTouEnabled: tou };
        assert.deepEqual(after.calculateAllEvMetrics(input), before.calculateAllEvMetrics(input));
        scenarios++;
      }
    }
  }
  assert.deepEqual(after.calculateTnbBill(kwh), before.calculateTnbBill(kwh));
}
for (const consumption of [5.5, 7, 10]) for (const mileage of [0, 1477, 2000]) {
  const input = { consumptionLPer100Km: consumption, fuelPricePerLiter: 1.99, monthlyMileageKm: mileage, engineCc: 1496, carPriceRm: 54000, tankLiters: 36, annualMaintenanceRm: 1200 };
  assert.deepEqual(iceAfter.calculateIceMetrics(input), iceBefore.calculateIceMetrics(input));
  scenarios++;
}
console.log(`PASS: ${scenarios} EV/petrol scenarios and 6 TNB boundary cases match Git HEAD exactly.`);
console.log('Default monthly savings: RM', after.calculateAllEvMetrics(base).monthlyNetSavings.toFixed(2));
