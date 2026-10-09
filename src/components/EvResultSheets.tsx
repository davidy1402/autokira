import { useMemo } from 'react';
import { Info, Sparkles, ShieldCheck, Receipt, GitCompare, Users } from 'lucide-react';
import { useCalculatorStore } from '../stores/calculator.store';
import { useResultsStore } from '../stores/results.store';
import { calculateAllEvMetrics } from '../utils/tnbTariff';
import type { UserInputs, EvCalculationResult } from '../types/calculator';
import { PRESETS } from '../data/presets';
import { evCalcTranslations } from '../i18n/evCalcTranslations';
import { ResultSheetModal } from './ResultSheetModal';
import { RoadTripSplitterCard } from './RoadTripSplitterCard';

/** Existing optional calculator tools, kept separate from the monthly decision. */
export function EvResultSheets({ inputsA, resultA, activeSheet, onClose }: {
  inputsA: UserInputs;
  resultA: EvCalculationResult;
  activeSheet: 'waterfall-tnb' | 'comparator' | 'roadtax' | 'trip' | null;
  onClose: () => void;
}) {
  const store = useCalculatorStore();
  const { selectedComparatorId, setSelectedComparatorId } = useResultsStore();
  const txt = evCalcTranslations[store.language] || evCalcTranslations.en;
  // Comparator candidate Car B (ensure Car B does not default to identical Car A)
  const comparatorVehicle = useMemo(() => {
    if (selectedComparatorId && selectedComparatorId !== store.selectedPresetId) {
      const match = PRESETS.find(p => p.id === selectedComparatorId);
      if (match) return match;
    }
    return PRESETS.find(p => p.id !== store.selectedPresetId) || PRESETS[0];
  }, [selectedComparatorId, store.selectedPresetId]);

  const inputsB = useMemo<UserInputs>(() => ({
    ...inputsA,
    modelName: comparatorVehicle.name,
    consumptionKwhPer100Km: comparatorVehicle.consumption,
    motorPowerKw: comparatorVehicle.motorKw,
    batteryCapacityKwh: comparatorVehicle.batteryKwh,
  }), [inputsA, comparatorVehicle]);

  const resultB = useMemo(() => calculateAllEvMetrics(inputsB), [inputsB]);

  const fiveYearTcoDiff = Math.round((resultA.fiveYearTcoWithRoadTaxSavings - resultB.fiveYearTcoWithRoadTaxSavings) * 100) / 100;
  const petrolCost100Km = store.mileage > 0 ? (store.petrolRm / store.mileage) * 100 : 0;
  const petrol5YrSpend = (store.petrolRm * 60) + (resultA.petrolRoadTaxAnnualRm * 5);
  const evA5YrSpend = (resultA.totalEvChargingCost * 60) + (resultA.evRoadTaxAnnualRm * 5);
  const evB5YrSpend = (resultB.totalEvChargingCost * 60) + (resultB.evRoadTaxAnnualRm * 5);

  return <>
      {/* MODAL 1: Monthly Waterfall & TNB Bill Audit */}
      <ResultSheetModal
        isOpen={activeSheet === 'waterfall-tnb'}
        onClose={onClose}
        title={store.language === 'zh' ? '月度收支明细与 TNB 电费账单' : 'Monthly spending and TNB breakdown'}
        subtitle={store.modelName}
        icon={<Receipt size={18} className="text-brand-primary" />}
      >
        <div className="space-y-4">
          {/* Waterfall */}
          <div className="p-3 bg-surface-overlay rounded-xl border border-border-subtle space-y-2 text-caption sm:text-body">
            <div className="text-caption font-semibold text-text-primary mb-1">
              {store.language === 'zh' ? '月度收支明细拆解' : 'Monthly Cost Breakdown'}
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-text-secondary truncate">{txt.oldPetrolSpend}</span>
              <span className="font-display tabular-nums text-text-primary whitespace-nowrap shrink-0">
                RM {store.petrolRm.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-text-secondary truncate">{txt.marginalHomeElec}</span>
              <span className="font-display tabular-nums text-text-primary whitespace-nowrap shrink-0">
                RM {resultA.marginalHomeElectricityCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border-subtle gap-2">
              <span className="text-text-secondary truncate">{txt.publicDcCost}</span>
              <span className="font-display tabular-nums text-text-primary whitespace-nowrap shrink-0">
                RM {resultA.publicChargingCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-0.5 gap-2">
              <span className="text-text-primary font-bold truncate">{txt.totalEvCharging}</span>
              <span className="font-display tabular-nums text-brand-primary font-bold text-body-lg whitespace-nowrap shrink-0">
                RM {resultA.totalEvChargingCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* TNB Bill Audit Table */}
          <div className="p-3 bg-surface-overlay rounded-xl border border-border-subtle space-y-2">
            <div className="text-caption font-semibold text-text-primary mb-1">
              {txt.tnbAuditTitle}
            </div>

            {resultA.crossed600Threshold && (
              <div className="p-2.5 bg-status-warning/10 border border-status-warning/20 rounded-lg flex items-start space-x-2">
                <Info size={15} className="text-status-warning shrink-0 mt-0.5" />
                <p className="text-[11px] text-text-primary leading-relaxed">
                  {txt.thresholdWarning}
                </p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-caption">
                <thead>
                  <tr className="text-[11px] text-text-secondary border-b border-border-subtle whitespace-nowrap">
                    <th className="font-normal py-2 pr-2">{txt.tableItem}</th>
                    <th className="font-normal py-2 px-2 text-right">{txt.tableBaseline}</th>
                    <th className="font-normal py-2 px-2 text-right">{txt.tableNew}</th>
                    <th className="font-normal py-2 pl-2 text-right">{txt.tableDelta}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/60 font-display tabular-nums text-text-primary whitespace-nowrap">
                  <tr>
                    <td className="py-2 text-text-secondary font-body pr-2">{txt.baseGen}</td>
                    <td className="py-2 px-2 text-right">{resultA.baselineBill.baseEnergySubtotal.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right">{resultA.newCombinedBill.baseEnergySubtotal.toFixed(2)}</td>
                    <td className="py-2 pl-2 text-right text-brand-accent">+{(resultA.newCombinedBill.baseEnergySubtotal - resultA.baselineBill.baseEnergySubtotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-text-secondary font-body pr-2">
                      {store.language === 'zh' ? 'EEI 节能激励返现' : 'EEI Efficiency Rebate'}
                    </td>
                    <td className="py-2 px-2 text-right text-status-positive">-{resultA.baselineBill.eeiRebateAmount.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right text-status-positive">-{resultA.newCombinedBill.eeiRebateAmount.toFixed(2)}</td>
                    <td className="py-2 pl-2 text-right text-brand-accent">+{(resultA.baselineBill.eeiRebateAmount - resultA.newCombinedBill.eeiRebateAmount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-text-secondary font-body pr-2">{txt.sstTax}</td>
                    <td className="py-2 px-2 text-right">{resultA.baselineBill.sstTax.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right">{resultA.newCombinedBill.sstTax.toFixed(2)}</td>
                    <td className="py-2 pl-2 text-right text-brand-accent">+{(resultA.newCombinedBill.sstTax - resultA.baselineBill.sstTax).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-text-secondary font-body pr-2">{txt.kwtbb}</td>
                    <td className="py-2 px-2 text-right">{resultA.baselineBill.kwtbbFund.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right">{resultA.newCombinedBill.kwtbbFund.toFixed(2)}</td>
                    <td className="py-2 pl-2 text-right text-brand-accent">+{(resultA.newCombinedBill.kwtbbFund - resultA.baselineBill.kwtbbFund).toFixed(2)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-border-subtle font-semibold whitespace-nowrap bg-surface-raised/40">
                    <td className="py-2.5 text-text-primary font-body pr-2">{txt.totalRm}</td>
                    <td className="py-2.5 px-2 text-right font-display tabular-nums text-text-primary">{resultA.baselineBill.totalAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-2 text-right font-display tabular-nums text-text-primary">{resultA.newCombinedBill.totalAmount.toFixed(2)}</td>
                    <td className="py-2.5 pl-2 text-right font-display tabular-nums text-brand-primary">+{resultA.marginalHomeElectricityCost.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </ResultSheetModal>

      {/* MODAL 2: 3-Way Comparator */}
      <ResultSheetModal
        isOpen={activeSheet === 'comparator'}
        onClose={onClose}
        title={txt.comparatorTitle}
        subtitle={txt.comparatorSub}
        icon={<GitCompare size={18} className="text-brand-accent" />}
      >
        <div className="space-y-3">
          {/* Candidate B Picker */}
          <div className="flex items-center justify-between gap-2 p-2.5 bg-surface-overlay rounded-xl border border-border-subtle">
            <span className="text-caption text-text-secondary whitespace-nowrap">
              {store.language === 'zh' ? '选择对比电车 B:' : 'Select EV B:'}
            </span>
            <select
              aria-label={store.language === 'zh' ? '对比电车' : 'Comparison electric car'}
              value={comparatorVehicle.id}
              onChange={e => setSelectedComparatorId(e.target.value)}
              className="bg-surface-base border border-border-subtle rounded-lg px-2.5 py-1 text-caption font-semibold text-text-primary outline-none cursor-pointer truncate max-w-[200px]"
            >
              {PRESETS.map(p => (
                <option key={p.id} value={p.id} className="bg-surface-base text-text-primary">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Comparison Delta Highlight */}
          {fiveYearTcoDiff !== 0 && (
            <div className="p-3 bg-brand-primary/10 border border-brand-primary/30 rounded-xl flex items-center space-x-2 text-caption text-brand-primary">
              <Sparkles size={16} className="shrink-0" />
              <span>
                <strong>{fiveYearTcoDiff > 0 ? store.modelName : comparatorVehicle.name}</strong>
                <span> {store.language === 'zh' ? `5 年多省 RM ${Math.abs(fiveYearTcoDiff).toFixed(0)}` : `saves RM ${Math.abs(fiveYearTcoDiff).toFixed(0)} over 5 years`}</span>
              </span>
            </div>
          )}

          {/* Table */}
          <div className="bg-surface-overlay rounded-xl border border-border-subtle p-3 overflow-x-auto">
            <table className="w-full text-left text-caption whitespace-nowrap">
              <thead>
                <tr className="border-b border-border-subtle text-text-secondary">
                  <th className="py-2 pr-2 font-normal">{store.language === 'zh' ? '项目' : 'Item'}</th>
                  <th className="py-2 px-1 text-center font-normal">{txt.currentIceCar}</th>
                  <th className="py-2 px-1 text-center font-semibold text-brand-primary">{store.modelName}</th>
                  <th className="py-2 pl-1 text-center font-normal text-text-primary">{comparatorVehicle.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60 tabular-nums">
                <tr>
                  <td className="py-2 text-text-secondary pr-2">{txt.motorKw}</td>
                  <td className="py-2 px-1 text-center text-text-secondary">{store.petrolEngineCc || 1500} cc</td>
                  <td className="py-2 px-1 text-center font-medium text-brand-primary">{store.motorKw} kW</td>
                  <td className="py-2 pl-1 text-center text-text-primary">{comparatorVehicle.motorKw} kW</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-secondary pr-2">{txt.batteryKwh}</td>
                  <td className="py-2 px-1 text-center text-text-secondary">-</td>
                  <td className="py-2 px-1 text-center font-medium text-brand-primary">{store.batteryKwh} kWh</td>
                  <td className="py-2 pl-1 text-center text-text-primary">{comparatorVehicle.batteryKwh} kWh</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-secondary pr-2">{txt.cost100km}</td>
                  <td className="py-2 px-1 text-center text-text-secondary">RM {petrolCost100Km.toFixed(2)}</td>
                  <td className="py-2 px-1 text-center font-semibold text-brand-primary">RM {resultA.evCostPer100Km.toFixed(2)}</td>
                  <td className="py-2 pl-1 text-center font-semibold text-text-primary">RM {resultB.evCostPer100Km.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-secondary pr-2">{txt.monthlyEvCost}</td>
                  <td className="py-2 px-1 text-center text-text-secondary">RM {store.petrolRm.toFixed(2)}</td>
                  <td className="py-2 px-1 text-center font-semibold text-brand-primary">RM {resultA.totalEvChargingCost.toFixed(2)}</td>
                  <td className="py-2 pl-1 text-center text-text-primary">RM {resultB.totalEvChargingCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-secondary pr-2">{txt.roadTaxEvLabel}</td>
                  <td className="py-2 px-1 text-center text-text-secondary">RM {resultA.petrolRoadTaxAnnualRm}</td>
                  <td className="py-2 px-1 text-center font-medium text-brand-primary">RM {resultA.evRoadTaxAnnualRm}</td>
                  <td className="py-2 pl-1 text-center text-text-primary">RM {resultB.evRoadTaxAnnualRm}</td>
                </tr>
                <tr className="bg-surface-raised/40 font-semibold">
                  <td className="py-2.5 text-text-primary pr-2">{txt.fiveYearTotalCost}</td>
                  <td className="py-2.5 px-1 text-center text-text-secondary">RM {petrol5YrSpend.toFixed(0)}</td>
                  <td className="py-2.5 px-1 text-center font-bold text-brand-primary">RM {evA5YrSpend.toFixed(0)}</td>
                  <td className="py-2.5 pl-1 text-center font-bold text-text-primary">RM {evB5YrSpend.toFixed(0)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary font-semibold pr-2">{txt.fiveYearEnergySavings}</td>
                  <td className="py-2 px-1 text-center text-text-secondary">{txt.baselineTag}</td>
                  <td className="py-2 px-1 text-center font-bold text-status-positive">+RM {resultA.fiveYearTcoWithRoadTaxSavings.toFixed(0)}</td>
                  <td className="py-2 pl-1 text-center font-bold text-status-positive">+RM {resultB.fiveYearTcoWithRoadTaxSavings.toFixed(0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ResultSheetModal>

      {/* MODAL 3: 2026 Road Tax Deep Dive */}
      <ResultSheetModal
        isOpen={activeSheet === 'roadtax'}
        onClose={onClose}
        title={txt.roadTaxSectionTitle}
        subtitle={store.language === 'zh' ? '大马交通部 2026 电车路税新制计算' : 'MOT 2026 Electric Vehicle Road Tax Formula'}
        icon={<ShieldCheck size={18} className="text-brand-accent" />}
      >
        <div className="space-y-3">
          <p className="text-caption text-text-secondary leading-relaxed">
            {txt.roadTaxSub}
          </p>

          {/* Benchmark ICE Displacement Picker */}
          <div className="p-3 bg-surface-overlay rounded-xl border border-border-subtle space-y-2">
            <span className="text-caption text-text-secondary block">{txt.roadTaxIceCcSelect}</span>
            <div className="flex space-x-1.5 w-full">
              {[1500, 1800, 2000].map(cc => (
                <button
                  key={cc}
                  type="button"
                  onClick={() => store.setPetrolEngineCc(cc)}
                  className={`flex-1 py-1.5 text-caption rounded-lg border transition-colors whitespace-nowrap text-center ${
                    (store.petrolEngineCc || 1500) === cc
                      ? 'bg-brand-primary text-text-inverse border-brand-primary font-semibold shadow-xs'
                      : 'bg-surface-base text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  {cc === 1500 ? '1.5L (RM90)' : cc === 1800 ? '1.8L (RM280)' : '2.0L (RM380)'}
                </button>
              ))}
            </div>
          </div>

          {/* Side by Side Tax comparison */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-overlay border border-border-subtle rounded-xl p-3 text-center">
              <div className="text-[11px] text-text-secondary font-medium">{txt.roadTaxEvLabel}</div>
              <div className="text-[10px] text-text-secondary/70 font-mono mt-0.5">({store.motorKw} kW)</div>
              <div className="mt-2 flex items-baseline justify-center">
                <span className="text-h2 font-display font-bold text-text-primary tabular-nums">
                  RM {resultA.evRoadTaxAnnualRm}
                </span>
                <span className="text-[10px] text-text-secondary ml-1">{txt.perYearUnit}</span>
              </div>
            </div>

            <div className="bg-surface-overlay border border-border-subtle rounded-xl p-3 text-center">
              <div className="text-[11px] text-text-secondary font-medium">{txt.roadTaxIceLabel}</div>
              <div className="text-[10px] text-text-secondary/70 font-mono mt-0.5">({store.petrolEngineCc || 1500} cc)</div>
              <div className="mt-2 flex items-baseline justify-center">
                <span className="text-h2 font-display font-bold text-text-primary tabular-nums">
                  RM {resultA.petrolRoadTaxAnnualRm}
                </span>
                <span className="text-[10px] text-text-secondary ml-1">{txt.perYearUnit}</span>
              </div>
            </div>
          </div>

          {/* Summary Delta Banner */}
          <div className="p-3 bg-surface-overlay border border-border-subtle rounded-xl flex justify-between items-center text-caption gap-2">
            <div className="truncate">
              <div className="font-semibold text-text-primary whitespace-nowrap">{txt.annualDiff}</div>
              <div className="text-[11px] text-text-secondary mt-0.5 truncate">
                {resultA.annualRoadTaxDifferenceRm >= 0
                  ? (store.language === 'zh' ? '纯电每年少付路税' : 'EV saves on road tax')
                  : (store.language === 'zh' ? '纯电每年多付路税' : 'EV pays more road tax')}
              </div>
            </div>
            <div className={`font-display font-bold text-body tabular-nums whitespace-nowrap shrink-0 ${
              resultA.annualRoadTaxDifferenceRm >= 0 ? 'text-status-positive' : 'text-status-warning'
            }`}>
              {resultA.annualRoadTaxDifferenceRm >= 0 ? '+' : ''}RM {resultA.annualRoadTaxDifferenceRm.toFixed(2)} {txt.perYearUnit}
            </div>
          </div>
        </div>
      </ResultSheetModal>

      {/* MODAL 4: Road Trip AA Cost Splitter */}
      <ResultSheetModal
        isOpen={activeSheet === 'trip'}
        onClose={onClose}
        title={store.language === 'zh' ? '长途出游电费 AA 分摊计算器' : 'Split road trip charging costs'}
        subtitle={store.modelName}
        icon={<Users size={18} className="text-brand-primary" />}
      >
        <RoadTripSplitterCard
          mode="ev"
          consumption={store.consumption}
          modelName={store.modelName}
          fuelPriceOrRate={store.advanced.publicDcRate || 1.40}
          language={store.language}
        />
      </ResultSheetModal>
  </>;
}
