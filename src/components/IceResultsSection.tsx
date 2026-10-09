import { useState, useMemo } from 'react';
import { Copy, Check, Gauge, Receipt, GitCompare, Users } from 'lucide-react';
import { useDesktopDisclosure } from '../hooks/useDesktopDisclosure';
import { useCalculatorStore } from '../stores/calculator.store';
import { ICE_PRESETS } from '../data/icePresets';
import { calculateIceMetrics } from '../utils/iceCostCalculator';
import { RoadTripSplitterCard } from './RoadTripSplitterCard';
import { ResultSheetModal } from './ResultSheetModal';

export function IceResultsSection() {
  const store = useCalculatorStore();
  const disclosureRef = useDesktopDisclosure();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
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
      `Calculated via AutoKira`;
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(generateReportText());
      setCopyError(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopyError(true); }
  };

  return (
    <div className="ice-results-grid">
      <section className="monthly-conclusion"><p className="intro-context">{store.iceModelName} · {store.mileage.toLocaleString()} km</p>
        <h1>{store.language === 'zh' ? `每月用车开支约 RM ${monthlyRunningTotalA.toFixed(2)}。` : `Allow about RM ${monthlyRunningTotalA.toFixed(2)} a month to run this car.`}</h1>
        <p>{store.language === 'zh' ? '包括油费、路税与保养预算。不包含车贷、保险或停车费。' : 'Includes fuel, road tax and your servicing budget. Loans, insurance and parking are separate.'}</p>
      </section>
      <section className="monthly-comparison"><h2>{store.language === 'zh' ? '每月开支组成' : 'Where the monthly cost goes'}</h2><dl className="cost-breakdown">
        <div><dt>{store.language === 'zh' ? '油费' : 'Fuel'}</dt><dd>RM {resultA.monthlyFuelCostRm.toFixed(2)}</dd></div>
        <div><dt>{store.language === 'zh' ? '路税（按月摊分）' : 'Road tax, spread monthly'}</dt><dd>RM {monthlyRoadTaxA.toFixed(2)}</dd></div>
        <div><dt>{store.language === 'zh' ? '保养预算（按月摊分）' : 'Servicing, spread monthly'}</dt><dd>RM {monthlyMaintenanceA.toFixed(2)}</dd></div>
      </dl><p className="field-hint">{store.language === 'zh' ? '路税与保养通常不是每月支付；这里按年预算摊分。' : 'Road tax and servicing are usually paid less often; these amounts spread the annual budget across 12 months.'}</p></section>
      <section className="decision-factors"><h2>{store.language === 'zh' ? '哪些因素影响结果？' : 'What matters for your result?'}</h2><div><h3>{store.language === 'zh' ? '里程与油耗' : 'Distance and consumption'}</h3><p>{store.mileage.toLocaleString()} km × {resultA.consumptionLPer100Km.toFixed(1)} L / 100 km · RM {fuelPrice.toFixed(2)} / L</p></div><div><h3>{store.language === 'zh' ? '保养预算' : 'Your servicing budget'}</h3><p>{store.language === 'zh' ? `现按每年 RM ${resultA.annualMaintenanceRm.toFixed(2)} 计算，可在输入页修改。` : `Currently RM ${resultA.annualMaintenanceRm.toFixed(2)} per year. Adjust this on the input screen to match your car.`}</p></div></section>
      <details ref={disclosureRef} className="result-details"><summary>{store.language === 'zh' ? '查看明细与其他工具' : 'Details and other tools'}</summary><div className="detail-links">
        <button type="button" onClick={() => setActiveSheet('breakdown')}>{store.language === 'zh' ? '开支与车贷估算' : 'Cost breakdown and loan estimate'}<span>→</span></button>
        <button type="button" onClick={() => setActiveSheet('compare')}>{store.language === 'zh' ? '与其他车型比较' : 'Compare another car'}<span>→</span></button>
        <button type="button" onClick={() => setActiveSheet('tank')}>{store.language === 'zh' ? '油箱与续航' : 'Fuel tank and range'}<span>→</span></button>
        <button type="button" onClick={() => setActiveSheet('trip')}>{store.language === 'zh' ? '分摊长途油费' : 'Split road trip costs'}<span>→</span></button>
      </div></details>
      <button type="button" className="secondary-button" onClick={handleCopySummary}>{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? (store.language === 'zh' ? '已复制报告' : 'Report copied') : (store.language === 'zh' ? '复制报告' : 'Copy report')}</button>

      <p role="status" className="field-hint">{copyError ? (store.language === 'zh' ? '无法复制。请允许剪贴板访问后重试。' : 'Could not copy. Allow clipboard access and try again.') : ''}</p>
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
              aria-label={store.language === 'zh' ? '对比燃油车' : 'Comparison petrol car'}
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
