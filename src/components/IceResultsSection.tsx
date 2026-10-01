import { useState, useMemo, useEffect } from 'react';
import { Copy, Check, Sparkles, Gauge, Receipt, GitCompare, Users, ChevronRight } from 'lucide-react';
import { useCalculatorStore } from '../stores/calculator.store';
import { ICE_PRESETS } from '../data/icePresets';
import { calculateIceMetrics } from '../utils/iceCostCalculator';
import { RoadTripSplitterCard } from './RoadTripSplitterCard';
import { ResultSheetModal } from './ResultSheetModal';

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

  return <>{Math.round(value).toLocaleString()}</>;
}

export function IceResultsSection() {
  const store = useCalculatorStore();
  const [copied, setCopied] = useState(false);
  const [activeSheet, setActiveSheet] = useState<'breakdown' | 'compare' | 'tank' | 'trip' | null>(null);

  // Active fuel price
  const fuelPrice =
    store.iceFuelType === 'budi_madani'
      ? 1.99
      : store.iceFuelType === 'ron95'
      ? 2.05
      : store.iceFuelType === 'ron95_unsub'
      ? 2.60
      : store.iceFuelType === 'ron97'
      ? 3.19
      : 2.95;

  const fuelGradeLabel = store.language === 'zh'
    ? (store.iceFuelType === 'budi_madani'
        ? 'BUDI MADANI (RM1.99)'
        : store.iceFuelType === 'ron95'
        ? 'RON95 津贴油 (RM2.05)'
        : store.iceFuelType === 'ron95_unsub'
        ? 'RON95 浮动预估 (RM2.60)'
        : store.iceFuelType === 'ron97'
        ? 'RON97 市价 (RM3.19)'
        : 'Euro 5 柴油 (RM2.95)')
    : (store.iceFuelType === 'budi_madani'
        ? 'BUDI MADANI (RM1.99)'
        : store.iceFuelType === 'ron95'
        ? 'RON95 Subsidised (RM2.05)'
        : store.iceFuelType === 'ron95_unsub'
        ? 'RON95 Floating (RM2.60)'
        : store.iceFuelType === 'ron97'
        ? 'RON97 Market (RM3.19)'
        : 'Euro 5 Diesel (RM2.95)');

  // Primary Car A (Current inputs)
  const resultA = useMemo(() => calculateIceMetrics({
    consumptionLPer100Km: store.iceConsumptionL,
    fuelPricePerLiter: fuelPrice,
    monthlyMileageKm: store.mileage,
    engineCc: store.iceEngineCc,
    carPriceRm: store.icePriceRm,
    tankLiters: store.iceTankLiters,
    annualMaintenanceRm: store.iceAnnualMaintenanceRm
  }), [store.iceConsumptionL, fuelPrice, store.mileage, store.iceEngineCc, store.icePriceRm, store.iceTankLiters, store.iceAnnualMaintenanceRm]);

  // Comparator Car B (ensure Car B does not default to identical Car A)
  const carBPreset = useMemo(() => {
    if (store.selectedIceCompareId && store.selectedIceCompareId !== store.selectedIcePresetId) {
      const match = ICE_PRESETS.find(p => p.id === store.selectedIceCompareId);
      if (match) return match;
    }
    return ICE_PRESETS.find(p => p.id !== store.selectedIcePresetId) || ICE_PRESETS[1];
  }, [store.selectedIceCompareId, store.selectedIcePresetId]);

  const resultB = useMemo(() => calculateIceMetrics({
    consumptionLPer100Km: carBPreset.consumptionLPer100Km,
    fuelPricePerLiter: fuelPrice,
    monthlyMileageKm: store.mileage,
    engineCc: carBPreset.engineCc,
    carPriceRm: carBPreset.priceRm,
    tankLiters: carBPreset.fuelTankLiters,
    annualMaintenanceRm: carBPreset.annualMaintenanceEstRm
  }), [carBPreset, fuelPrice, store.mileage]);

  // 5-Year TCO Difference (A vs B)
  const fiveYearDiff = resultB.fiveYearTotalCostRm - resultA.fiveYearTotalCostRm;
  const isAOverallCheaper = fiveYearDiff >= 0;
  const isIdentical = Math.abs(fiveYearDiff) < 1;

  // Monthly breakdown computations
  const monthlyRoadTaxA = resultA.annualRoadTaxRm / 12;
  const monthlyMaintenanceA = resultA.annualMaintenanceRm / 12;
  const monthlyRunningTotalA = resultA.monthlyFuelCostRm + monthlyRoadTaxA + monthlyMaintenanceA;
  const monthlyLoanEstimateA = (resultA.carPurchasePriceRm * 0.9 * 1.15) / 60; // 5yr 90% loan @ 3% flat
  const monthlyGrandTotalA = monthlyRunningTotalA + monthlyLoanEstimateA;

  const generateReportText = () => {
    if (store.language === 'zh') {
      return `【大马燃油车选车与开销对比精算】\n` +
        `已选车型 A: ${store.iceModelName} (落地价: RM ${resultA.carPurchasePriceRm.toLocaleString()})\n` +
        `• 油耗表现: ${resultA.consumptionLPer100Km.toFixed(1)} L/100km (约 ${resultA.fuelCostSenPerKm.toFixed(1)} sen/km)\n` +
        `• 油价基准: ${fuelGradeLabel}\n` +
        `• 每月油费: RM ${resultA.monthlyFuelCostRm.toFixed(0)} (${store.mileage} km/月)\n` +
        `• 每月实付用车开支 (油+税+保养): RM ${monthlyRunningTotalA.toFixed(0)} / 月\n` +
        `• 5 年用车总花费 (车价+油+税+保养): RM ${resultA.fiveYearTotalCostRm.toFixed(0)}\n\n` +
        `对比车型 B: ${carBPreset.name} (落地价: RM ${resultB.carPurchasePriceRm.toLocaleString()})\n` +
        `• 5 年用车总花费: RM ${resultB.fiveYearTotalCostRm.toFixed(0)}\n\n` +
        `5 年综合选购结论:\n` +
        `${isIdentical ? '两款燃油车 5 年总开销基本持平' : isAOverallCheaper ? `${store.iceModelName} 5 年总开销比 ${carBPreset.name} 多省 RM ${Math.abs(fiveYearDiff).toFixed(0)}` : `${carBPreset.name} 5 年总开销比 ${store.iceModelName} 多省 RM ${Math.abs(fiveYearDiff).toFixed(0)}`}\n` +
        `来自: 大马用车成本精算器`;
    }

    return `[Malaysia Petrol Car Cost & Value Comparison]\n` +
      `Car A: ${store.iceModelName} (OTR Price: RM ${resultA.carPurchasePriceRm.toLocaleString()})\n` +
      `• Consumption: ${resultA.consumptionLPer100Km.toFixed(1)} L/100km (${resultA.fuelCostSenPerKm.toFixed(1)} sen/km)\n` +
      `• Fuel Grade: ${fuelGradeLabel}\n` +
      `• Monthly Fuel: RM ${resultA.monthlyFuelCostRm.toFixed(0)} (${store.mileage} km/mo)\n` +
      `• Monthly Running Cost (Fuel+Tax+Service): RM ${monthlyRunningTotalA.toFixed(0)} / mo\n` +
      `• 5-Yr Total Cost (Price+Fuel+Tax+Maint): RM ${resultA.fiveYearTotalCostRm.toFixed(0)}\n\n` +
      `Car B: ${carBPreset.name} (OTR Price: RM ${resultB.carPurchasePriceRm.toLocaleString()})\n` +
      `• 5-Yr Total Cost: RM ${resultB.fiveYearTotalCostRm.toFixed(0)}\n\n` +
      `Verdict: ${isIdentical ? 'Both cars have identical 5-year cost' : isAOverallCheaper ? `${store.iceModelName} saves RM ${Math.abs(fiveYearDiff).toFixed(0)} over 5 years` : `${carBPreset.name} saves RM ${Math.abs(fiveYearDiff).toFixed(0)} over 5 years`}\n` +
      `Calculated via Malaysia Car Cost Calculator`;
  };

  const handleCopySummary = () => {
    try {
      navigator.clipboard.writeText(generateReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* 1. Verdict Hero Card (Immediate Clarity) */}
      <section className="bg-surface-base border border-border-subtle rounded-xl p-5 flex flex-col items-center shadow-xs">
        <div className="text-caption text-text-secondary font-medium tracking-wide uppercase">
          {store.language === 'zh' ? '每月实付养车纯开支' : 'Total Monthly Running Cost'}
        </div>

        <div className="my-1.5 text-display font-display font-bold tracking-tight leading-none text-text-primary whitespace-nowrap">
          RM <CountUp to={monthlyRunningTotalA} />
          <span className="text-body font-normal text-text-secondary ml-1">
            {store.language === 'zh' ? '/ 月' : '/ mo'}
          </span>
        </div>

        <div className="text-caption text-text-secondary font-mono mt-0.5 text-center">
          {store.iceModelName} ({fuelGradeLabel.split(' ')[0]})
        </div>

        {/* 3 Key Metrics Row */}
        <div className="grid grid-cols-3 w-full mt-4 pt-3.5 border-t border-border-subtle text-center gap-1 sm:gap-2">
          <div>
            <div className="text-caption text-text-secondary whitespace-nowrap">
              {store.language === 'zh' ? '每公里油费' : 'Cost / km'}
            </div>
            <div className="text-body-lg font-display text-text-primary whitespace-nowrap font-semibold mt-0.5">
              {resultA.fuelCostSenPerKm.toFixed(1)} sen
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5 truncate">
              {resultA.consumptionLPer100Km.toFixed(1)} L/100km
            </div>
          </div>

          <div>
            <div className="text-caption text-text-secondary whitespace-nowrap">
              {store.language === 'zh' ? '每月行驶油费' : 'Monthly Fuel'}
            </div>
            <div className="text-body-lg font-display text-text-primary whitespace-nowrap font-semibold mt-0.5">
              RM {resultA.monthlyFuelCostRm.toFixed(0)}
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5 truncate">
              {store.mileage} km
            </div>
          </div>

          <div>
            <div className="text-caption text-text-secondary font-medium whitespace-nowrap">
              {store.language === 'zh' ? '5 年总花费' : '5-Yr Total'}
            </div>
            <div className="text-body-lg font-display font-bold text-brand-accent whitespace-nowrap mt-0.5">
              RM {(resultA.fiveYearTotalCostRm / 1000).toFixed(1)}k
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5 truncate">
              {store.language === 'zh' ? '车价+油+税+保' : 'Price+Fuel+Tax+Svc'}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Side-by-Side Quick Summary Bar */}
      <section className="bg-surface-base border border-border-subtle rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-brand-primary" strokeWidth={2} />
          </div>
          <div className="truncate">
            <div className="text-caption font-semibold text-text-primary truncate">
              {isIdentical
                ? (store.language === 'zh' ? '与对比车型 5 年开销持平' : 'Equal 5-Year Total Cost')
                : store.language === 'zh'
                ? `${isAOverallCheaper ? store.iceModelName : carBPreset.name} 5 年更省`
                : `${isAOverallCheaper ? store.iceModelName : carBPreset.name} Saves More`}
            </div>
            <div className="text-[11px] text-text-secondary truncate mt-0.5">
              {isIdentical
                ? (store.language === 'zh' ? `对比 ${carBPreset.name}` : `Compared with ${carBPreset.name}`)
                : store.language === 'zh'
                ? `比 ${isAOverallCheaper ? carBPreset.name : store.iceModelName} 5 年少付 RM ${Math.abs(fiveYearDiff).toLocaleString()}`
                : `Saves RM ${Math.abs(fiveYearDiff).toLocaleString()} vs ${isAOverallCheaper ? carBPreset.name : store.iceModelName}`}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveSheet('compare')}
          className="w-full sm:w-auto px-3.5 py-1.5 bg-surface-overlay border border-border-subtle hover:border-brand-primary rounded-lg text-caption font-semibold text-text-primary active:scale-95 transition-all whitespace-nowrap shadow-xs"
        >
          {store.language === 'zh' ? '切换对比车型' : 'Change Car B'}
        </button>
      </section>

      {/* 3. Deep Dive Hub: Bento Action Cards */}
      <section className="space-y-2">
        <div className="text-caption font-semibold text-text-secondary uppercase tracking-wider px-1">
          {store.language === 'zh' ? '精算深度专题' : 'Detailed Analysis Hub'}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Tile 1: Monthly Running Breakdown */}
          <div
            onClick={() => setActiveSheet('breakdown')}
            className="p-3.5 bg-surface-base border border-border-subtle hover:border-brand-primary rounded-xl cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between shadow-xs group"
          >
            <div className="flex items-center space-x-3 truncate pr-2">
              <div className="w-9 h-9 rounded-lg bg-surface-overlay border border-border-subtle flex items-center justify-center shrink-0 group-hover:border-brand-primary/60 transition-colors">
                <Receipt size={17} className="text-brand-primary" strokeWidth={1.75} />
              </div>
              <div className="truncate">
                <div className="text-body font-semibold text-text-primary truncate">
                  {store.language === 'zh' ? '每月养车开支明细与车贷' : 'Monthly Cost Breakdown'}
                </div>
                <div className="text-[11px] text-text-secondary truncate mt-0.5">
                  {store.language === 'zh'
                    ? `油费 RM ${resultA.monthlyFuelCostRm.toFixed(0)} + 税保 RM ${(monthlyRoadTaxA + monthlyMaintenanceA).toFixed(0)}`
                    : `Fuel RM ${resultA.monthlyFuelCostRm.toFixed(0)} + Tax/Svc RM ${(monthlyRoadTaxA + monthlyMaintenanceA).toFixed(0)}`}
                </div>
              </div>
            </div>
            <ChevronRight size={17} className="text-text-secondary group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          {/* Tile 2: Side-by-Side Comparison */}
          <div
            onClick={() => setActiveSheet('compare')}
            className="p-3.5 bg-surface-base border border-border-subtle hover:border-brand-primary rounded-xl cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between shadow-xs group"
          >
            <div className="flex items-center space-x-3 truncate pr-2">
              <div className="w-9 h-9 rounded-lg bg-surface-overlay border border-border-subtle flex items-center justify-center shrink-0 group-hover:border-brand-primary/60 transition-colors">
                <GitCompare size={17} className="text-brand-accent" strokeWidth={1.75} />
              </div>
              <div className="truncate">
                <div className="text-body font-semibold text-text-primary truncate">
                  {store.language === 'zh' ? '双车 5 年综合总支出对照' : '5-Year TCO Comparison'}
                </div>
                <div className="text-[11px] text-text-secondary truncate mt-0.5">
                  {store.iceModelName} vs {carBPreset.name}
                </div>
              </div>
            </div>
            <ChevronRight size={17} className="text-text-secondary group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          {/* Tile 3: Tank Capacity & Range */}
          <div
            onClick={() => setActiveSheet('tank')}
            className="p-3.5 bg-surface-base border border-border-subtle hover:border-brand-primary rounded-xl cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between shadow-xs group"
          >
            <div className="flex items-center space-x-3 truncate pr-2">
              <div className="w-9 h-9 rounded-lg bg-surface-overlay border border-border-subtle flex items-center justify-center shrink-0 group-hover:border-brand-primary/60 transition-colors">
                <Gauge size={17} className="text-status-positive" strokeWidth={1.75} />
              </div>
              <div className="truncate">
                <div className="text-body font-semibold text-text-primary truncate">
                  {store.language === 'zh' ? '油箱容积与高速/市区续航' : 'Tank Capacity & Cruising'}
                </div>
                <div className="text-[11px] text-text-secondary truncate mt-0.5">
                  {store.language === 'zh'
                    ? `加满 RM ${resultA.fullTankCostRm.toFixed(0)}, 续航 ~${resultA.fullTankEstimatedRangeKm.toFixed(0)} km`
                    : `Full tank RM ${resultA.fullTankCostRm.toFixed(0)}, ~${resultA.fullTankEstimatedRangeKm.toFixed(0)} km range`}
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
                  {store.language === 'zh' ? '长途出游油费 AA 分摊计算' : 'Road Trip AA Cost Splitter'}
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
          onClick={handleCopySummary}
          className="w-full py-3 px-4 bg-surface-base border border-border-subtle hover:border-brand-primary text-text-primary rounded-xl text-caption font-semibold active:scale-[0.99] transition-all flex items-center justify-center space-x-2 shadow-xs"
        >
          {copied ? <Check size={16} className="text-status-positive" /> : <Copy size={16} />}
          <span>
            {copied
              ? (store.language === 'zh' ? '已复制燃油测算摘要' : 'Copied Report!')
              : (store.language === 'zh' ? '复制完整燃油测算摘要' : 'Copy Petrol Summary Report')}
          </span>
        </button>
      </section>

      {/* MODAL 1: Monthly Running Cost Breakdown */}
      <ResultSheetModal
        isOpen={activeSheet === 'breakdown'}
        onClose={() => setActiveSheet(null)}
        title={store.language === 'zh' ? '每月真实养车开支明细' : 'Monthly Running Cost Breakdown'}
        subtitle={store.iceModelName}
        icon={<Receipt size={18} className="text-brand-primary" />}
      >
        <div className="space-y-3">
          <div className="p-3 bg-surface-overlay rounded-xl border border-border-subtle space-y-2.5 text-caption sm:text-body">
            <div className="flex justify-between items-center gap-2">
              <span className="text-text-secondary truncate">
                {store.language === 'zh' ? '每月行驶油费' : 'Monthly Fuel Spend'}
                <span className="text-[11px] text-text-secondary/70 ml-1">({store.mileage} km)</span>
              </span>
              <span className="font-display tabular-nums text-text-primary whitespace-nowrap shrink-0">
                RM {resultA.monthlyFuelCostRm.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center gap-2">
              <span className="text-text-secondary truncate">
                {store.language === 'zh' ? '每月路税分摊' : 'Monthly Road Tax (Amortised)'}
                <span className="text-[11px] text-text-secondary/70 ml-1">
                  ({store.language === 'zh' ? `RM ${resultA.annualRoadTaxRm} / 年` : `RM ${resultA.annualRoadTaxRm} / yr`})
                </span>
              </span>
              <span className="font-display tabular-nums text-text-primary whitespace-nowrap shrink-0">
                RM {monthlyRoadTaxA.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-border-subtle gap-2">
              <span className="text-text-secondary truncate">
                {store.language === 'zh' ? '每月常规定期保养分摊' : 'Monthly Servicing (Amortised)'}
                <span className="text-[11px] text-text-secondary/70 ml-1">
                  ({store.language === 'zh' ? `约 RM ${resultA.annualMaintenanceRm} / 年` : `~RM ${resultA.annualMaintenanceRm} / yr`})
                </span>
              </span>
              <span className="font-display tabular-nums text-text-primary whitespace-nowrap shrink-0">
                RM {monthlyMaintenanceA.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-0.5 gap-2">
              <span className="text-text-primary font-bold truncate">
                {store.language === 'zh' ? '每月养车纯开销 (不含车贷)' : 'Total Monthly Running Cost'}
              </span>
              <span className="font-display tabular-nums text-brand-primary font-bold text-body-lg whitespace-nowrap shrink-0">
                RM {monthlyRunningTotalA.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Reference Loan Repayment */}
          <div className="p-3 bg-surface-overlay rounded-xl border border-border-subtle flex justify-between items-center text-caption gap-2">
            <div>
              <span className="text-text-primary font-semibold block truncate">
                {store.language === 'zh' ? '参考 5 年车贷月供 (90% 贷款, 3% 年息)' : 'Est. 5-Yr Car Loan (90% loan @ 3% flat)'}
              </span>
              <span className="text-[11px] text-text-secondary mt-0.5 block">
                {store.language === 'zh' ? `车贷加养车总月供约: RM ${monthlyGrandTotalA.toFixed(0)}` : `Loan + Running: ~RM ${monthlyGrandTotalA.toFixed(0)}`}
              </span>
            </div>
            <span className="font-display font-semibold text-text-primary tabular-nums shrink-0">
              ~RM {monthlyLoanEstimateA.toFixed(0)} {store.language === 'zh' ? '/ 月' : '/ mo'}
            </span>
          </div>
        </div>
      </ResultSheetModal>

      {/* MODAL 2: Side-by-Side 5-Year Comparison */}
      <ResultSheetModal
        isOpen={activeSheet === 'compare'}
        onClose={() => setActiveSheet(null)}
        title={store.language === 'zh' ? '双车 5 年综合总支出对照' : '5-Year Total Expense Comparison'}
        subtitle={store.language === 'zh' ? '车价 + 5 年油费 + 5 年路税 + 5 年保养' : 'Factoring Purchase Price, 5-Yr Fuel, Tax, Service'}
        icon={<GitCompare size={18} className="text-brand-accent" />}
      >
        <div className="space-y-3">
          {/* Vehicle B Selector */}
          <div className="flex items-center justify-between gap-2 p-2.5 bg-surface-overlay rounded-xl border border-border-subtle">
            <span className="text-caption text-text-secondary whitespace-nowrap">
              {store.language === 'zh' ? '选择对比车型 B:' : 'Select Car B:'}
            </span>
            <select
              value={carBPreset.id}
              onChange={e => store.setIceCompareId(e.target.value)}
              className="bg-surface-base border border-border-subtle rounded-lg px-2.5 py-1 text-caption font-semibold text-text-primary outline-none cursor-pointer truncate max-w-[200px]"
            >
              {ICE_PRESETS.map(p => (
                <option key={p.id} value={p.id} className="bg-surface-base text-text-primary">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cards Pair */}
          <div className="grid grid-cols-2 gap-2 text-caption">
            <div className="p-3 bg-surface-overlay rounded-xl border border-brand-primary/40 space-y-1">
              <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider block truncate">
                {store.language === 'zh' ? '已选车型 A' : 'Selected Car A'}
              </span>
              <span className="font-bold text-text-primary block truncate">{store.iceModelName}</span>
              <span className="text-[11px] font-mono text-text-secondary block">RM {resultA.fuelCostSenPerKm.toFixed(1)} sen/km</span>
              <div className="pt-2 border-t border-border-subtle">
                <span className="text-[11px] text-text-secondary block">{store.language === 'zh' ? '5 年总花费' : '5-Yr Total'}</span>
                <span className="font-display font-bold text-body text-text-primary tabular-nums">
                  RM {Math.round(resultA.fiveYearTotalCostRm).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-surface-overlay rounded-xl border border-border-subtle space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block truncate">
                {store.language === 'zh' ? '对比车型 B' : 'Comparison Car B'}
              </span>
              <span className="font-bold text-text-primary block truncate">{carBPreset.name}</span>
              <span className="text-[11px] font-mono text-text-secondary block">RM {resultB.fuelCostSenPerKm.toFixed(1)} sen/km</span>
              <div className="pt-2 border-t border-border-subtle">
                <span className="text-[11px] text-text-secondary block">{store.language === 'zh' ? '5 年总花费' : '5-Yr Total'}</span>
                <span className="font-display font-bold text-body text-text-primary tabular-nums">
                  RM {Math.round(resultB.fiveYearTotalCostRm).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-surface-overlay rounded-xl border border-border-subtle p-3 overflow-x-auto">
            <table className="w-full text-left text-caption">
              <thead>
                <tr className="border-b border-border-subtle text-text-secondary">
                  <th className="py-2 font-normal">{store.language === 'zh' ? '对比项目' : 'Item'}</th>
                  <th className="py-2 text-right font-normal">{store.iceModelName}</th>
                  <th className="py-2 text-right font-normal">{carBPreset.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60 tabular-nums">
                <tr>
                  <td className="py-2 text-text-secondary">{store.language === 'zh' ? '落地车价' : 'Car Price'}</td>
                  <td className="py-2 text-right text-text-primary">RM {resultA.carPurchasePriceRm.toLocaleString()}</td>
                  <td className="py-2 text-right text-text-primary">RM {resultB.carPurchasePriceRm.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-secondary">{store.language === 'zh' ? '排量' : 'Engine'}</td>
                  <td className="py-2 text-right text-text-primary">{store.iceEngineCc} cc</td>
                  <td className="py-2 text-right text-text-primary">{carBPreset.engineCc} cc</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-secondary">{store.language === 'zh' ? '综合油耗' : 'Consumption'}</td>
                  <td className="py-2 text-right text-text-primary">{resultA.consumptionLPer100Km.toFixed(1)} L/100km</td>
                  <td className="py-2 text-right text-text-primary">{resultB.consumptionLPer100Km.toFixed(1)} L/100km</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-secondary">{store.language === 'zh' ? '每月油费' : 'Monthly Fuel'}</td>
                  <td className="py-2 text-right text-text-primary">RM {resultA.monthlyFuelCostRm.toFixed(0)}</td>
                  <td className="py-2 text-right text-text-primary">RM {resultB.monthlyFuelCostRm.toFixed(0)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-secondary">{store.language === 'zh' ? '每年路税' : 'Annual Road Tax'}</td>
                  <td className="py-2 text-right text-text-primary">RM {resultA.annualRoadTaxRm}</td>
                  <td className="py-2 text-right text-text-primary">RM {resultB.annualRoadTaxRm}</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-secondary">{store.language === 'zh' ? '年保养预估' : 'Annual Service'}</td>
                  <td className="py-2 text-right text-text-primary">RM {resultA.annualMaintenanceRm}</td>
                  <td className="py-2 text-right text-text-primary">RM {resultB.annualMaintenanceRm}</td>
                </tr>
                <tr className="font-semibold bg-surface-raised/40">
                  <td className="py-2.5 text-text-primary">{store.language === 'zh' ? '5 年总花费' : '5-Yr Total Spend'}</td>
                  <td className="py-2.5 text-right font-bold text-brand-primary">RM {Math.round(resultA.fiveYearTotalCostRm).toLocaleString()}</td>
                  <td className="py-2.5 text-right font-bold text-text-primary">RM {Math.round(resultB.fiveYearTotalCostRm).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ResultSheetModal>

      {/* MODAL 3: Tank Capacity & Range */}
      <ResultSheetModal
        isOpen={activeSheet === 'tank'}
        onClose={() => setActiveSheet(null)}
        title={store.language === 'zh' ? '油箱续航与单次加满精算' : 'Tank Capacity & Cruising Range'}
        subtitle={store.iceModelName}
        icon={<Gauge size={18} className="text-status-positive" />}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5 text-center">
            <div className="p-3 bg-surface-overlay rounded-xl border border-border-subtle">
              <span className="text-[11px] text-text-secondary block">
                {store.language === 'zh' ? '油箱标称容积' : 'Tank Capacity'}
              </span>
              <span className="text-h3 font-display font-bold text-text-primary tabular-nums mt-0.5 block">
                {resultA.tankCapacityLiters} <span className="text-caption font-normal">L</span>
              </span>
            </div>

            <div className="p-3 bg-surface-overlay rounded-xl border border-border-subtle">
              <span className="text-[11px] text-text-secondary block">
                {store.language === 'zh' ? '加满一箱实付' : 'Full Tank Cost'}
              </span>
              <span className="text-h3 font-display font-bold text-brand-primary tabular-nums mt-0.5 block">
                RM {resultA.fullTankCostRm.toFixed(1)}
              </span>
            </div>

            <div className="p-3 bg-surface-overlay rounded-xl border border-border-subtle">
              <span className="text-[11px] text-text-secondary block">
                {store.language === 'zh' ? '理论续航 (综合)' : 'Combined Range'}
              </span>
              <span className="text-h3 font-display font-bold text-status-positive tabular-nums mt-0.5 block">
                ~{resultA.fullTankEstimatedRangeKm.toFixed(0)} <span className="text-caption font-normal">km</span>
              </span>
            </div>

            <div className="p-3 bg-surface-overlay rounded-xl border border-border-subtle">
              <span className="text-[11px] text-text-secondary block">
                {store.language === 'zh' ? '折合每公里油费' : 'Cost Per Km'}
              </span>
              <span className="text-h3 font-display font-bold text-text-primary tabular-nums mt-0.5 block">
                {resultA.fuelCostSenPerKm.toFixed(1)} <span className="text-caption font-normal">sen</span>
              </span>
            </div>
          </div>

          {/* Clean Road Condition Scenarios (Replaces wordy paragraph) */}
          <div className="space-y-2 pt-1">
            <div className="text-caption font-semibold text-text-primary px-1">
              {store.language === 'zh' ? '实际路况续航预估' : 'Real-World Range Scenarios'}
            </div>

            <div className="p-3 bg-surface-overlay rounded-xl border border-border-subtle flex justify-between items-center">
              <div>
                <span className="text-caption font-medium text-text-primary block">
                  {store.language === 'zh' ? '高速顺畅巡航 (~110km/h)' : 'Highway Cruising (~110km/h)'}
                </span>
                <span className="text-[11px] text-text-secondary">
                  {store.language === 'zh' ? '省油高效区间' : 'Optimal fuel efficiency'}
                </span>
              </div>
              <span className="font-display font-bold text-status-positive text-body tabular-nums">
                ~{(resultA.fullTankEstimatedRangeKm * 1.15).toFixed(0)} km
              </span>
            </div>

            <div className="p-3 bg-surface-overlay rounded-xl border border-border-subtle flex justify-between items-center">
              <div>
                <span className="text-caption font-medium text-text-primary block">
                  {store.language === 'zh' ? '市区日常走走停停' : 'City Stop-and-Go'}
                </span>
                <span className="text-[11px] text-text-secondary">
                  {store.language === 'zh' ? '红绿灯与拥堵损耗' : 'Traffic lights and congestion'}
                </span>
              </div>
              <span className="font-display font-bold text-status-warning text-body tabular-nums">
                ~{(resultA.fullTankEstimatedRangeKm * 0.85).toFixed(0)} km
              </span>
            </div>
          </div>
        </div>
      </ResultSheetModal>

      {/* MODAL 4: Road Trip AA Cost Splitter */}
      <ResultSheetModal
        isOpen={activeSheet === 'trip'}
        onClose={() => setActiveSheet(null)}
        title={store.language === 'zh' ? '长途出游油费 AA 分摊计算器' : 'Road Trip AA Petrol Splitter'}
        subtitle={store.iceModelName}
        icon={<Users size={18} className="text-brand-primary" />}
      >
        <RoadTripSplitterCard
          mode="ice"
          consumption={store.iceConsumptionL}
          modelName={store.iceModelName}
          fuelPriceOrRate={fuelPrice}
          language={store.language}
        />
      </ResultSheetModal>
    </div>
  );
}
