import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, Info, Sparkles, ShieldCheck, Copy, Check, Receipt, GitCompare, Users, ChevronRight } from 'lucide-react';
import { useCalculatorStore } from '../stores/calculator.store';
import { useResultsStore } from '../stores/results.store';
import { calculateAllEvMetrics } from '../utils/tnbTariff';
import { UserInputs } from '../types/calculator';
import { PRESETS } from '../data/presets';
import { IceResultsSection } from '../components/IceResultsSection';
import { RoadTripSplitterCard } from '../components/RoadTripSplitterCard';
import { ResultSheetModal } from '../components/ResultSheetModal';
import { evCalcTranslations } from '../i18n/evCalcTranslations';

function CountUp({ to, duration = 0.8 }: { to: number; duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = to;
    if (start === end) return;
    
    let startTime: number;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setValue(start + easeProgress * (end - start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [to, duration]);

  return <>{value.toFixed(2)}</>;
}

export default function ResultsPage({ onBack = () => {} }: { onBack?: () => void }) {
  const store = useCalculatorStore();
  const { selectedComparatorId, setSelectedComparatorId } = useResultsStore();
  const txt = evCalcTranslations[store.language] || evCalcTranslations.en;
  const [copied, setCopied] = useState(false);
  const [activeSheet, setActiveSheet] = useState<'waterfall-tnb' | 'comparator' | 'roadtax' | 'trip' | null>(null);

  // Active Car A inputs (EV mode)
  const inputsA = useMemo<UserInputs>(() => ({
    modelName: store.modelName,
    consumptionKwhPer100Km: store.consumption,
    motorPowerKw: store.motorKw,
    batteryCapacityKwh: store.batteryKwh,
    monthlyMileageKm: store.mileage,
    baselineHomeKwh: store.baselineKwh,
    baselineHomeBillRm: 0,
    fatherPetrolCostRm: store.petrolRm,
    petrolEngineCc: store.petrolEngineCc || 1500,
    chargingMode: store.mode === 'condo' ? 'public_only' : 'mixed',
    petrolPricePerLiter: store.advanced.petrolPrice,
    petrolFuelEfficiencyKmPerL: store.advanced.fuelEconomy,
    chargingEfficiency: 1 - store.advanced.chargingLoss,
    homeChargingRatio: store.mode === 'condo' ? 0.0 : 0.9,
    publicDcPricePerKwh: store.advanced.publicDcRate,
    afaRateSen: 3.80,
    isTouEnabled: store.advanced.touEnabled,
    touOffPeakRateSen: 28.0
  }), [store]);

  const resultA = useMemo(() => calculateAllEvMetrics(inputsA), [inputsA]);

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

  const isPositive = resultA.monthlyNetSavings >= 0;
  const fiveYearTcoDiff = Math.round((resultA.fiveYearTcoWithRoadTaxSavings - resultB.fiveYearTcoWithRoadTaxSavings) * 100) / 100;
  const petrolCost100Km = store.mileage > 0 ? (store.petrolRm / store.mileage) * 100 : 0;
  const petrol5YrSpend = (store.petrolRm * 60) + (resultA.petrolRoadTaxAnnualRm * 5);
  const evA5YrSpend = (resultA.totalEvChargingCost * 60) + (resultA.evRoadTaxAnnualRm * 5);
  const evB5YrSpend = (resultB.totalEvChargingCost * 60) + (resultB.evRoadTaxAnnualRm * 5);

  const energySavingsRatio = Math.max(0, Math.min(100, Math.round(((store.petrolRm - resultA.totalEvChargingCost) / Math.max(1, store.petrolRm)) * 100)));

  const generateReportText = () => {
    return txt.reportSummary
      .replace('{model}', store.modelName)
      .replace('{consumption}', store.consumption.toFixed(1))
      .replace('{mileage}', store.mileage.toString())
      .replace('{petrol}', store.petrolRm.toFixed(0))
      .replace('{savings}', resultA.monthlyNetSavings.toFixed(2))
      .replace('{evCost}', resultA.totalEvChargingCost.toFixed(2))
      .replace('{tcoSavings}', resultA.fiveYearTcoWithRoadTaxSavings.toFixed(0));
  };

  const handleCopyReport = () => {
    try {
      navigator.clipboard.writeText(generateReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // If in ICE Mode, render dedicated ICE results
  if (store.vehicleType === 'ice') {
    return (
      <div className="relative min-h-screen bg-background-default antialiased pb-12">
        <header className="sticky top-0 z-30 bg-background-default/90 backdrop-blur-md border-b border-border-subtle pt-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))] pb-3.5 px-4 sm:px-5">
          <div className="app-container flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onBack}
                className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary active:scale-95 transition-all rounded-lg bg-surface-overlay border border-border-subtle hover:border-brand-primary shadow-xs"
                aria-label={store.language === 'zh' ? '返回' : 'Back'}
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <span className="text-body font-bold text-text-primary whitespace-nowrap">
                {store.language === 'zh' ? '燃油精算对比结果' : 'Petrol Cost Comparison'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyReport}
              className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary active:scale-95 transition-all rounded-lg bg-surface-overlay border border-border-subtle hover:border-brand-primary shadow-xs"
              aria-label={store.language === 'zh' ? '复制摘要' : 'Copy'}
            >
              {copied ? <Check size={16} className="text-status-positive" /> : <Copy size={16} strokeWidth={1.75} />}
            </button>
          </div>
        </header>
        <main className="app-container px-4 py-4 space-y-4">
          <IceResultsSection />
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background-default antialiased pb-12">
      {/* Sticky Clean Header (No Theme Button, No Text on Back) */}
      <header className="sticky top-0 z-30 bg-background-default/90 backdrop-blur-md border-b border-border-subtle pt-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))] pb-3.5 px-4 sm:px-5">
        <div className="app-container flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary active:scale-95 transition-all rounded-lg bg-surface-overlay border border-border-subtle hover:border-brand-primary shadow-xs"
              aria-label={store.language === 'zh' ? '返回' : 'Back'}
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <span className="text-body font-bold text-text-primary whitespace-nowrap">
              {txt.verdictTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyReport}
            className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary active:scale-95 transition-all rounded-lg bg-surface-overlay border border-border-subtle hover:border-brand-primary shadow-xs"
            aria-label={store.language === 'zh' ? '复制摘要' : 'Copy'}
          >
            {copied ? <Check size={16} className="text-status-positive" /> : <Copy size={16} strokeWidth={1.75} />}
          </button>
        </div>
      </header>

      {/* Main Verdict Flow */}
      <main className="app-container px-4 py-4 space-y-4">
        {/* 1. Verdict Hero Card (Primary Takeaway) */}
        <section className="bg-surface-base border border-border-subtle rounded-xl p-5 flex flex-col items-center shadow-xs">
          <div className="text-caption text-text-secondary font-medium tracking-wide uppercase">
            {txt.monthlyNetSavings}
          </div>

          <div className={`my-1 text-display font-display font-bold tracking-tight leading-none whitespace-nowrap ${isPositive ? 'text-status-positive' : 'text-status-error'}`}>
            {isPositive ? '+' : '-'}RM <CountUp to={Math.abs(resultA.monthlyNetSavings)} />
            <span className="text-body font-normal text-text-secondary ml-1">
              {store.language === 'zh' ? '/ 月' : '/ mo'}
            </span>
          </div>

          <div className="text-[11px] text-text-secondary font-mono mt-0.5 text-center">
            {store.language === 'zh'
              ? `开 ${store.modelName} 每月能源实开支仅 RM ${resultA.totalEvChargingCost.toFixed(0)}`
              : `Total EV monthly energy: RM ${resultA.totalEvChargingCost.toFixed(0)}`}
          </div>

          {/* 3 Metrics Pillars */}
          <div className="grid grid-cols-3 w-full mt-4 pt-3.5 border-t border-border-subtle text-center gap-1 sm:gap-2">
            <div>
              <div className="text-caption text-text-secondary whitespace-nowrap">{txt.oneYear}</div>
              <div className="text-body-lg font-display font-bold text-text-primary whitespace-nowrap mt-0.5">
                RM {(resultA.monthlyNetSavings * 12).toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-caption text-text-secondary whitespace-nowrap">{txt.fiveYear}</div>
              <div className="text-body-lg font-display font-bold text-text-primary whitespace-nowrap mt-0.5">
                RM {resultA.fiveYearNetSavings.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-caption text-text-secondary font-medium whitespace-nowrap">{txt.tco}</div>
              <div className="text-body-lg font-display font-bold text-brand-accent whitespace-nowrap mt-0.5">
                {resultA.fiveYearTcoWithRoadTaxSavings >= 0 ? '+' : ''}RM {resultA.fiveYearTcoWithRoadTaxSavings.toFixed(0)}
              </div>
              <div className="text-[10px] text-text-secondary truncate mt-0.5">
                {txt.inclRoadTax}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Visual Cost Comparison Bar */}
        <section className="bg-surface-base border border-border-subtle rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex justify-between items-center text-caption font-medium">
            <span className="text-text-secondary">
              {store.language === 'zh' ? '月度能源开销直观对比' : 'Monthly Energy Spend Comparison'}
            </span>
            <span className="text-brand-primary font-bold">
              {store.language === 'zh' ? `能源开销立降 ${energySavingsRatio}%` : `Saves ${energySavingsRatio}% on energy`}
            </span>
          </div>

          <div className="space-y-2">
            {/* Petrol Bar */}
            <div>
              <div className="flex justify-between text-[11px] text-text-secondary mb-1">
                <span>{store.language === 'zh' ? '原燃油车每月油费' : 'Current Petrol Spend'}</span>
                <span className="font-mono font-bold text-text-primary">RM {store.petrolRm.toFixed(0)}</span>
              </div>
              <div className="h-3 w-full bg-surface-overlay rounded-full overflow-hidden">
                <div className="h-full bg-text-secondary/40 rounded-full w-full" />
              </div>
            </div>

            {/* EV Bar */}
            <div>
              <div className="flex justify-between text-[11px] text-text-secondary mb-1">
                <span className="text-brand-primary font-semibold">
                  {store.language === 'zh' ? `换开 ${store.modelName} (家充+外充)` : `With ${store.modelName}`}
                </span>
                <span className="font-mono font-bold text-brand-primary">RM {resultA.totalEvChargingCost.toFixed(0)}</span>
              </div>
              <div className="h-3 w-full bg-surface-overlay rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-primary rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(10, (resultA.totalEvChargingCost / Math.max(1, store.petrolRm)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Deep Dive Hub: Bento Action Cards */}
        <section className="space-y-2">
          <div className="text-caption font-semibold text-text-secondary uppercase tracking-wider px-1">
            {store.language === 'zh' ? '精算深度专题' : 'Detailed Analysis Hub'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Tile 1: Monthly Waterfall & TNB */}
            <div
              onClick={() => setActiveSheet('waterfall-tnb')}
              className="p-3.5 bg-surface-base border border-border-subtle hover:border-brand-primary rounded-xl cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between shadow-xs group"
            >
              <div className="flex items-center space-x-3 truncate pr-2">
                <div className="w-9 h-9 rounded-lg bg-surface-overlay border border-border-subtle flex items-center justify-center shrink-0 group-hover:border-brand-primary/60 transition-colors">
                  <Receipt size={17} className="text-brand-primary" strokeWidth={1.75} />
                </div>
                <div className="truncate">
                  <div className="text-body font-semibold text-text-primary truncate">
                    {store.language === 'zh' ? '月度收支明细与 TNB 账单' : 'Monthly Cost & TNB Audit'}
                  </div>
                  <div className="text-[11px] text-text-secondary truncate mt-0.5">
                    {store.language === 'zh'
                      ? `家充 RM ${resultA.marginalHomeElectricityCost.toFixed(0)} + 快充 RM ${resultA.publicChargingCost.toFixed(0)}`
                      : `Home RM ${resultA.marginalHomeElectricityCost.toFixed(0)} + DC RM ${resultA.publicChargingCost.toFixed(0)}`}
                  </div>
                </div>
              </div>
              <ChevronRight size={17} className="text-text-secondary group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

            {/* Tile 2: 3-Way Comparator */}
            <div
              onClick={() => setActiveSheet('comparator')}
              className="p-3.5 bg-surface-base border border-border-subtle hover:border-brand-primary rounded-xl cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between shadow-xs group"
            >
              <div className="flex items-center space-x-3 truncate pr-2">
                <div className="w-9 h-9 rounded-lg bg-surface-overlay border border-border-subtle flex items-center justify-center shrink-0 group-hover:border-brand-primary/60 transition-colors">
                  <GitCompare size={17} className="text-brand-accent" strokeWidth={1.75} />
                </div>
                <div className="truncate">
                  <div className="text-body font-semibold text-text-primary truncate">
                    {store.language === 'zh' ? '3 车全方位横向对比' : '3-Way Comparison Matrix'}
                  </div>
                  <div className="text-[11px] text-text-secondary truncate mt-0.5">
                    {store.modelName} vs {comparatorVehicle.name}
                  </div>
                </div>
              </div>
              <ChevronRight size={17} className="text-text-secondary group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

            {/* Tile 3: 2026 Road Tax */}
            <div
              onClick={() => setActiveSheet('roadtax')}
              className="p-3.5 bg-surface-base border border-border-subtle hover:border-brand-primary rounded-xl cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between shadow-xs group"
            >
              <div className="flex items-center space-x-3 truncate pr-2">
                <div className="w-9 h-9 rounded-lg bg-surface-overlay border border-border-subtle flex items-center justify-center shrink-0 group-hover:border-brand-primary/60 transition-colors">
                  <ShieldCheck size={17} className="text-status-positive" strokeWidth={1.75} />
                </div>
                <div className="truncate">
                  <div className="text-body font-semibold text-text-primary truncate">
                    {store.language === 'zh' ? '2026 JPJ 新制路税精算' : '2026 JPJ Road Tax Audit'}
                  </div>
                  <div className="text-[11px] text-text-secondary truncate mt-0.5">
                    {store.language === 'zh'
                      ? `电车 RM ${resultA.evRoadTaxAnnualRm} / 年 (对比油车 1.5L~2.0L)`
                      : `EV RM ${resultA.evRoadTaxAnnualRm} / yr vs Petrol CC`}
                  </div>
                </div>
              </div>
              <ChevronRight size={17} className="text-text-secondary group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

            {/* Tile 4: Road Trip AA Cost Splitter */}
            <div
              onClick={() => setActiveSheet('trip')}
              className="p-3.5 bg-surface-base border border-border-subtle hover:border-brand-primary rounded-xl cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between shadow-xs group"
            >
              <div className="flex items-center space-x-3 truncate pr-2">
                <div className="w-9 h-9 rounded-lg bg-surface-overlay border border-border-subtle flex items-center justify-center shrink-0 group-hover:border-brand-primary/60 transition-colors">
                  <Users size={17} className="text-brand-primary" strokeWidth={1.75} />
                </div>
                <div className="truncate">
                  <div className="text-body font-semibold text-text-primary truncate">
                    {store.language === 'zh' ? '长途出游电费 AA 分摊计算' : 'Road Trip AA Cost Splitter'}
                  </div>
                  <div className="text-[11px] text-text-secondary truncate mt-0.5">
                    {store.language === 'zh' ? '5 条自驾路线，一键算人均' : '5 corridor presets + toll'}
                  </div>
                </div>
              </div>
              <ChevronRight size={17} className="text-text-secondary group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </div>
        </section>

        {/* 4. Bottom Action: Clean Copy Button (Zero WhatsApp spam) */}
        <section className="pt-2">
          <button
            type="button"
            onClick={handleCopyReport}
            className="w-full py-3 px-4 bg-surface-base border border-border-subtle hover:border-brand-primary text-text-primary rounded-xl text-caption font-semibold active:scale-[0.99] transition-all flex items-center justify-center space-x-2 shadow-xs"
          >
            {copied ? <Check size={16} className="text-status-positive" /> : <Copy size={16} />}
            <span>
              {copied
                ? (store.language === 'zh' ? '已复制测算报告' : 'Copied Report!')
                : (store.language === 'zh' ? '复制完整电车测算报告' : 'Copy Full EV Verdict Report')}
            </span>
          </button>
        </section>
      </main>

      {/* MODAL 1: Monthly Waterfall & TNB Bill Audit */}
      <ResultSheetModal
        isOpen={activeSheet === 'waterfall-tnb'}
        onClose={() => setActiveSheet(null)}
        title={store.language === 'zh' ? '月度收支明细与 TNB 电费账单' : 'Monthly Breakdown & TNB Audit'}
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
        onClose={() => setActiveSheet(null)}
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
        onClose={() => setActiveSheet(null)}
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
        onClose={() => setActiveSheet(null)}
        title={store.language === 'zh' ? '长途出游电费 AA 分摊计算器' : 'Road Trip AA Electric Splitter'}
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
    </div>
  );
}
