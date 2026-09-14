import { useState, useMemo } from 'react';
import { Copy, Check, Car, Fuel } from 'lucide-react';
import { useCalculatorStore } from '../stores/calculator.store';
import { ICE_PRESETS } from '../data/icePresets';
import { calculateIceMetrics } from '../utils/iceCostCalculator';
import { evCalcTranslations } from '../i18n/evCalcTranslations';

export function IceResultsSection() {
  const store = useCalculatorStore();
  const txt = evCalcTranslations[store.language] || evCalcTranslations.en;
  const [copied, setCopied] = useState(false);

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

  // Long distance trip AA split calculator
  const [tripDistanceKm, setTripDistanceKm] = useState<number>(350); // e.g. KL to Penang ~355km
  const [tripPassengers, setTripPassengers] = useState<number>(4);
  const tripFuelCostA = (tripDistanceKm * store.iceConsumptionL / 100) * fuelPrice;
  const tripSplitPerPersonA = tripFuelCostA / Math.max(1, tripPassengers);

  // 5-Year TCO Difference (A vs B)
  const fiveYearDiff = resultB.fiveYearTotalCostRm - resultA.fiveYearTotalCostRm;
  const isAOverallCheaper = fiveYearDiff >= 0;
  const isIdentical = Math.abs(fiveYearDiff) < 1;

  const handleCopySummary = () => {
    const text = store.language === 'zh'
      ? `【大马燃油车选车与开销对比】\n` +
        `已选车型 A: ${store.iceModelName} (车价: RM ${resultA.carPurchasePriceRm.toLocaleString()})\n` +
        `• 油耗: ${resultA.consumptionLPer100Km.toFixed(1)} L/100km (约 ${resultA.fuelCostSenPerKm.toFixed(1)} sen/km)\n` +
        `• 每月油费: RM ${resultA.monthlyFuelCostRm.toFixed(0)}\n` +
        `• 5年总开销 (车价+油费+路税+保养): RM ${resultA.fiveYearTotalCostRm.toFixed(0)}\n\n` +
        `对比车型 B: ${carBPreset.name} (车价: RM ${resultB.carPurchasePriceRm.toLocaleString()})\n` +
        `• 5年总开销: RM ${resultB.fiveYearTotalCostRm.toFixed(0)}\n\n` +
        `5年综合选购结论: ${isIdentical ? '两车5年综合开销基本一致' : isAOverallCheaper ? `${store.iceModelName} 5年多省 RM ${Math.abs(fiveYearDiff).toFixed(0)}` : `${carBPreset.name} 5年多省 RM ${Math.abs(fiveYearDiff).toFixed(0)}`}`
      : `[Malaysia Petrol Car Cost & Value Compare]\n` +
        `Selected Car A: ${store.iceModelName} (Price: RM ${resultA.carPurchasePriceRm.toLocaleString()})\n` +
        `• Fuel: ${resultA.consumptionLPer100Km.toFixed(1)} L/100km (${resultA.fuelCostSenPerKm.toFixed(1)} sen/km)\n` +
        `• Monthly Fuel: RM ${resultA.monthlyFuelCostRm.toFixed(0)}\n` +
        `• 5-Yr Total Cost (Price + Fuel + Tax + Maintenance): RM ${resultA.fiveYearTotalCostRm.toFixed(0)}\n\n` +
        `Compare Car B: ${carBPreset.name} (Price: RM ${resultB.carPurchasePriceRm.toLocaleString()})\n` +
        `• 5-Yr Total Cost: RM ${resultB.fiveYearTotalCostRm.toFixed(0)}\n\n` +
        `Verdict: ${isIdentical ? 'Both cars have identical 5-year cost' : isAOverallCheaper ? `${store.iceModelName} saves RM ${Math.abs(fiveYearDiff).toFixed(0)} over 5 years` : `${carBPreset.name} saves RM ${Math.abs(fiveYearDiff).toFixed(0)} over 5 years`}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-stack-md">
      {/* Section 1: Verdict Hero (Exact match with EV Results Page design) */}
      <section id="verdict" className="space-y-stack-md">
        <div className="bg-surface-base border border-border-subtle rounded-xl p-comfortable flex flex-col items-center shadow-xs">
          <div className="text-body text-text-secondary whitespace-nowrap">
            {isIdentical
              ? (store.language === 'zh' ? '两车5年综合开销相当' : 'Both Cars Equal Over 5 Years')
              : store.language === 'zh'
              ? `${isAOverallCheaper ? store.iceModelName : carBPreset.name} 5年多省`
              : `${isAOverallCheaper ? store.iceModelName : carBPreset.name} Saves`}
          </div>

          <div className="mt-2 text-[52px] sm:text-[57px] font-display font-bold tracking-tight leading-none text-status-positive whitespace-nowrap">
            RM {Math.round(Math.abs(fiveYearDiff)).toLocaleString()}
          </div>

          <div className="text-caption text-text-secondary mt-1 font-mono">
            {isIdentical
              ? (store.language === 'zh' ? '5年总花费无显著差额' : 'No 5-Year Cost Difference')
              : store.language === 'zh'
              ? `对比 ${isAOverallCheaper ? carBPreset.name : store.iceModelName} (5年总开销)`
              : `vs ${isAOverallCheaper ? carBPreset.name : store.iceModelName}`}
          </div>

          {/* 3 Key Metrics Row */}
          <div className="grid grid-cols-3 w-full mt-stack-md pt-stack-md border-t border-border-subtle text-center gap-1 sm:gap-2">
            <div>
              <div className="text-caption text-text-secondary whitespace-nowrap">
                {store.language === 'zh' ? '每公里油费' : 'Cost / km'}
              </div>
              <div className="text-body-lg font-display text-text-primary whitespace-nowrap font-semibold">
                {resultA.fuelCostSenPerKm.toFixed(1)} sen
              </div>
              <div className="text-[10px] text-text-secondary mt-0.5 truncate">
                {resultA.consumptionLPer100Km.toFixed(1)} L/100km
              </div>
            </div>

            <div>
              <div className="text-caption text-text-secondary whitespace-nowrap">
                {store.language === 'zh' ? '每月油费' : 'Monthly Fuel'}
              </div>
              <div className="text-body-lg font-display text-text-primary whitespace-nowrap font-semibold">
                RM {resultA.monthlyFuelCostRm.toFixed(0)}
              </div>
              <div className="text-[10px] text-text-secondary mt-0.5 truncate">
                {store.iceFuelType === 'budi_madani' ? 'BUDI MADANI' : 'RON95'}
              </div>
            </div>

            <div>
              <div className="text-caption text-text-secondary font-medium whitespace-nowrap">
                {store.language === 'zh' ? '5年买车+养车' : '5-Yr Total TCO'}
              </div>
              <div className="text-body-lg font-display font-bold text-brand-accent whitespace-nowrap">
                RM {(resultA.fiveYearTotalCostRm / 1000).toFixed(1)}k
              </div>
              <div className="text-[10px] text-text-secondary mt-0.5 truncate">
                {store.language === 'zh' ? '含车价+油+税' : 'Price+Fuel+Tax'}
              </div>
            </div>
          </div>
        </div>

        {/* 5-Year TCO Breakdown: Car A vs Car B */}
        <div className="bg-surface-base border border-border-subtle rounded-xl p-base space-y-3">
          <div className="flex justify-between items-center text-caption border-b border-border-subtle pb-2">
            <span className="font-semibold text-text-primary">
              {store.language === 'zh' ? '5年总支出横向对比' : '5-Year Total Expense'}
            </span>
            <button
              onClick={handleCopySummary}
              className="flex items-center space-x-1 text-[11px] text-text-secondary hover:text-text-primary active:scale-95 transition-colors"
            >
              {copied ? <Check size={12} className="text-status-positive" /> : <Copy size={12} />}
              <span>{copied ? txt.copied : txt.copyReport}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Column 1: Car A */}
            <div className="p-3 bg-surface-overlay rounded-lg border border-brand-primary/40 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-brand-accent font-semibold uppercase tracking-wider">
                  {store.language === 'zh' ? '已选车型 A' : 'Car A'}
                </div>
                <div className="text-caption font-bold text-text-primary truncate mt-0.5">
                  {store.iceModelName}
                </div>
                <div className="text-[11px] text-text-secondary font-mono mt-0.5">
                  RM {resultA.fuelCostSenPerKm.toFixed(1)} sen/km
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-border-subtle/50">
                <div className="text-caption text-text-secondary text-[11px]">
                  {store.language === 'zh' ? '5年总支出' : '5-Yr Total'}
                </div>
                <div className="text-body-lg font-display font-bold text-text-primary tabular-nums">
                  RM {Math.round(resultA.fiveYearTotalCostRm).toLocaleString()}
                </div>
                <div className="text-[10px] text-text-secondary truncate mt-0.5">
                  车价 RM {resultA.carPurchasePriceRm.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Column 2: Car B */}
            <div className="p-3 bg-surface-overlay rounded-lg border border-border-subtle flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">
                  {store.language === 'zh' ? '候选车型 B' : 'Car B'}
                </div>
                <select
                  value={carBPreset.id}
                  onChange={e => store.setIceCompareId(e.target.value)}
                  className="w-full bg-surface-base border border-border-subtle rounded px-1.5 py-0.5 text-caption text-text-primary font-bold outline-none cursor-pointer truncate mt-0.5 text-[11px]"
                >
                  {ICE_PRESETS.map(p => (
                    <option key={p.id} value={p.id} className="bg-surface-base text-text-primary">
                      {p.name}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-text-secondary font-mono mt-0.5">
                  RM {resultB.fuelCostSenPerKm.toFixed(1)} sen/km
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-border-subtle/50">
                <div className="text-caption text-text-secondary text-[11px]">
                  {store.language === 'zh' ? '5年总支出' : '5-Yr Total'}
                </div>
                <div className="text-body-lg font-display font-bold text-text-primary tabular-nums">
                  RM {Math.round(resultB.fiveYearTotalCostRm).toLocaleString()}
                </div>
                <div className="text-[10px] text-text-secondary truncate mt-0.5">
                  车价 RM {resultB.carPurchasePriceRm.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Anchor Quick Links */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => document.getElementById('ice-table')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-3 py-1.5 bg-surface-overlay border border-border-subtle rounded-full text-caption text-text-secondary hover:text-text-primary active:scale-95 transition-colors whitespace-nowrap"
          >
            {store.language === 'zh' ? '查看逐项对比 ↓' : 'Detailed Table ↓'}
          </button>
          <button
            onClick={() => document.getElementById('ice-trip')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-3 py-1.5 bg-surface-overlay border border-border-subtle rounded-full text-caption text-text-secondary hover:text-text-primary active:scale-95 transition-colors whitespace-nowrap"
          >
            {store.language === 'zh' ? '长途出行 AA 算油钱 ↓' : 'Road Trip AA Split ↓'}
          </button>
        </div>
      </section>

      {/* Head-to-Head Detailed Comparison Table */}
      <section id="ice-table" className="space-y-stack-md pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-text-primary font-semibold flex items-center gap-2">
            <Car size={18} className="text-brand-accent" />
            <span>{store.language === 'zh' ? '两车全方位参数与花费对比' : 'Two-Car Side-by-Side Breakdown'}</span>
          </h2>
        </div>

        <div className="bg-surface-base border border-border-subtle rounded-xl p-base">
          {/* Table Header */}
          <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-2 text-caption text-text-secondary pb-3 border-b border-border-subtle items-center">
            <span className="font-medium text-[11px] uppercase tracking-wider">{store.language === 'zh' ? '指标' : 'Item'}</span>
            <span className="font-bold text-brand-primary text-center truncate text-caption">{store.iceModelName}</span>
            <span className="font-bold text-text-primary text-center truncate text-caption">{carBPreset.name}</span>
          </div>


          {/* Rows */}
          <div className="divide-y divide-border-subtle text-caption sm:text-body">
            {/* New Car Price */}
            <div className="grid grid-cols-[1.2fr_1.1fr_1.1fr] py-2.5 items-center gap-2">
              <span className="text-text-secondary whitespace-nowrap">{store.language === 'zh' ? '新车参考车价' : 'Car Price'}</span>
              <span className="text-center font-display tabular-nums font-semibold text-text-primary">RM {resultA.carPurchasePriceRm.toLocaleString()}</span>
              <span className="text-center font-display tabular-nums font-semibold text-text-primary">RM {resultB.carPurchasePriceRm.toLocaleString()}</span>
            </div>

            {/* Consumption */}
            <div className="grid grid-cols-[1.2fr_1.1fr_1.1fr] py-2.5 items-center gap-2">
              <span className="text-text-secondary whitespace-nowrap">{store.language === 'zh' ? '百公里油耗' : 'Consumption'}</span>
              <span className="text-center font-display tabular-nums text-text-primary">{resultA.consumptionLPer100Km.toFixed(1)} L/100km</span>
              <span className="text-center font-display tabular-nums text-text-primary">{resultB.consumptionLPer100Km.toFixed(1)} L/100km</span>
            </div>

            {/* Sen per km */}
            <div className="grid grid-cols-[1.2fr_1.1fr_1.1fr] py-2.5 items-center gap-2">
              <span className="text-text-secondary whitespace-nowrap">{store.language === 'zh' ? '每公里油费' : 'Fuel Cost / km'}</span>
              <span className="text-center font-display tabular-nums font-bold text-brand-accent">{resultA.fuelCostSenPerKm.toFixed(1)} sen</span>
              <span className="text-center font-display tabular-nums font-bold text-brand-accent">{resultB.fuelCostSenPerKm.toFixed(1)} sen</span>
            </div>

            {/* Monthly Fuel Spend */}
            <div className="grid grid-cols-[1.2fr_1.1fr_1.1fr] py-2.5 items-center gap-2">
              <span className="text-text-secondary whitespace-nowrap">{store.language === 'zh' ? '月行驶油费' : 'Monthly Fuel'}</span>
              <span className="text-center font-display tabular-nums text-text-primary">RM {resultA.monthlyFuelCostRm.toFixed(0)}</span>
              <span className="text-center font-display tabular-nums text-text-primary">RM {resultB.monthlyFuelCostRm.toFixed(0)}</span>
            </div>

            {/* Annual Road Tax */}
            <div className="grid grid-cols-[1.2fr_1.1fr_1.1fr] py-2.5 items-center gap-2">
              <span className="text-text-secondary whitespace-nowrap">{store.language === 'zh' ? '每年路税' : 'Annual Road Tax'}</span>
              <span className="text-center font-display tabular-nums text-text-primary">RM {resultA.annualRoadTaxRm} / 年</span>
              <span className="text-center font-display tabular-nums text-text-primary">RM {resultB.annualRoadTaxRm} / 年</span>
            </div>

            {/* Annual Maintenance */}
            <div className="grid grid-cols-[1.2fr_1.1fr_1.1fr] py-2.5 items-center gap-2">
              <span className="text-text-secondary whitespace-nowrap">{store.language === 'zh' ? '年常规保养预估' : 'Annual Service'}</span>
              <span className="text-center font-display tabular-nums text-text-primary">RM {resultA.annualMaintenanceRm}</span>
              <span className="text-center font-display tabular-nums text-text-primary">RM {resultB.annualMaintenanceRm}</span>
            </div>

            {/* 5-Year Fuel Spend */}
            <div className="grid grid-cols-[1.2fr_1.1fr_1.1fr] py-2.5 items-center gap-2 bg-surface-overlay/30">
              <span className="text-text-secondary font-medium whitespace-nowrap">{store.language === 'zh' ? '5年总油费' : '5-Yr Total Fuel'}</span>
              <span className="text-center font-display tabular-nums text-text-primary font-semibold">RM {Math.round(resultA.fiveYearFuelCostRm).toLocaleString()}</span>
              <span className="text-center font-display tabular-nums text-text-primary font-semibold">RM {Math.round(resultB.fiveYearFuelCostRm).toLocaleString()}</span>
            </div>

            {/* 5-Year Total Cost (TCO) */}
            <div className="grid grid-cols-[1.2fr_1.1fr_1.1fr] py-3 items-center gap-2 bg-brand-primary/5">
              <span className="text-text-primary font-bold whitespace-nowrap">{store.language === 'zh' ? '5年买车+养车总额' : '5-Yr Total TCO'}</span>
              <span className={`text-center font-display tabular-nums font-bold ${isAOverallCheaper ? 'text-status-positive' : 'text-text-primary'}`}>
                RM {Math.round(resultA.fiveYearTotalCostRm).toLocaleString()}
              </span>
              <span className={`text-center font-display tabular-nums font-bold ${!isAOverallCheaper ? 'text-status-positive' : 'text-text-primary'}`}>
                RM {Math.round(resultB.fiveYearTotalCostRm).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Long-Distance Road Trip AA Cost Splitter */}
      <section className="bg-surface-base border border-border-subtle rounded-xl p-base space-y-3">
        <div className="flex items-center space-x-2">
          <Fuel size={18} className="text-brand-primary" />
          <h3 className="text-body-lg text-text-primary font-semibold">
            {store.language === 'zh' ? '长途出游油费与好友 AA 分摊计算器' : 'Road Trip Petrol AA Cost Splitter'}
          </h3>
        </div>
        <p className="text-caption text-text-secondary">
          {store.language === 'zh'
            ? '针对朋友出游、返乡开车的实际需求，输入公里数即可秒算单程/来回油钱及人均费用。'
            : 'Calculate trip fuel cost and split per person for road trips.'}
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <span className="text-caption text-text-secondary block mb-1">
              {store.language === 'zh' ? '单程距离 (公里)' : 'Distance (km)'}
            </span>
            <input
              type="number"
              value={tripDistanceKm}
              onChange={e => setTripDistanceKm(Math.max(1, Number(e.target.value)))}
              className="w-full p-2 bg-surface-overlay border border-border-subtle rounded-lg text-text-primary font-display tabular-nums text-body outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <span className="text-caption text-text-secondary block mb-1">
              {store.language === 'zh' ? '同行乘车人数 (人)' : 'Passengers'}
            </span>
            <input
              type="number"
              min="1"
              max="10"
              value={tripPassengers}
              onChange={e => setTripPassengers(Math.max(1, Number(e.target.value)))}
              className="w-full p-2 bg-surface-overlay border border-border-subtle rounded-lg text-text-primary font-display tabular-nums text-body outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Trip Results */}
        <div className="p-3 bg-surface-overlay rounded-lg border border-border-subtle flex justify-between items-center text-caption">
          <div>
            <span className="text-text-secondary block">单程总油钱: <strong className="text-text-primary">RM {tripFuelCostA.toFixed(2)}</strong></span>
            <span className="text-text-secondary block mt-0.5">来回总油钱: <strong className="text-text-primary">RM {(tripFuelCostA * 2).toFixed(2)}</strong></span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-text-secondary block">人均单程 / 来回</span>
            <span className="text-body-lg font-display font-bold text-brand-accent tabular-nums">
              RM {tripSplitPerPersonA.toFixed(1)} / RM {(tripSplitPerPersonA * 2).toFixed(1)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
