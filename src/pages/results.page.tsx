import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, Info, Sun, Moon, Sparkles, ShieldCheck, Share2, Copy, Check } from 'lucide-react';
import { useCalculatorStore } from '../stores/calculator.store';
import { useResultsStore } from '../stores/results.store';
import { calculateAllEvMetrics } from '../utils/tnbTariff';
import { UserInputs } from '../types/calculator';
import { PRESETS } from '../data/presets';
import { IceResultsSection } from '../components/IceResultsSection';
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

  // If in ICE Mode, render dedicated ICE results
  if (store.vehicleType === 'ice') {
    return (
      <div className="relative min-h-screen bg-background-default antialiased pb-[calc(40px+env(safe-area-inset-bottom))]">
        <header className="sticky top-0 z-50 bg-background-default/80 backdrop-blur-md border-b border-border-subtle pt-[env(safe-area-inset-top)] px-base py-tight flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button onClick={onBack} className="p-2 -ml-2 text-text-secondary hover:text-text-primary active:scale-[0.98]" aria-label="Back">
              <ChevronLeft size={24} />
            </button>
            <img src="./logo.png" alt="Car Calc MY" className="w-6 h-6 rounded-md shadow-sm ml-1" />
            <h1 className="text-body-lg font-semibold text-text-primary whitespace-nowrap">
              {store.language === 'zh' ? '选车对比结果' : 'Comparison Results'}
            </h1>
          </div>

          <button
            onClick={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')}
            className="p-1 text-text-secondary hover:text-text-primary active:scale-95 transition-colors"
            aria-label="Toggle theme"
          >
            {store.theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
        </header>
        <main className="px-base py-section space-y-section-y">
          <IceResultsSection />
        </main>
      </div>

    );
  }

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

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateReportText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="relative min-h-screen bg-background-default antialiased pb-[calc(40px+env(safe-area-inset-bottom))]">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-default/80 backdrop-blur-md border-b border-border-subtle pt-[env(safe-area-inset-top)] px-base py-tight flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-2 -ml-2 text-text-secondary hover:text-text-primary active:scale-[0.98]" aria-label="Back">
            <ChevronLeft size={24} />
          </button>
          <img src="./logo.png" alt="EV Calc MY" className="w-6 h-6 rounded-md shadow-sm ml-1" />
          <h1 className="text-body-lg font-semibold text-text-primary whitespace-nowrap">{txt.verdictTitle}</h1>
        </div>
        <button
          onClick={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')}
          className="p-1 text-text-secondary hover:text-text-primary active:scale-95 transition-colors"
          aria-label="Toggle theme"
        >
          {store.theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
        </button>
      </header>

      <main className="px-base py-section space-y-section-y">
        
        {/* Section 1: Verdict Hero */}
        <section id="verdict" className="space-y-stack-md">
           <div className="bg-surface-base border border-border-subtle rounded-xl p-comfortable flex flex-col items-center">
             <div className="text-body text-text-secondary whitespace-nowrap">{txt.monthlyNetSavings}</div>
             <div className={`mt-2 text-[57px] font-display font-bold tracking-tight leading-none whitespace-nowrap ${isPositive ? 'text-status-positive' : 'text-status-error'}`}>
               {isPositive ? '+' : '-'}RM <CountUp to={Math.abs(resultA.monthlyNetSavings)} />
             </div>
             
             <div className="grid grid-cols-3 w-full mt-stack-md pt-stack-md border-t border-border-subtle text-center gap-1 sm:gap-2">
               <div>
                 <div className="text-caption text-text-secondary whitespace-nowrap">{txt.oneYear}</div>
                 <div className="text-body-lg font-display text-text-primary whitespace-nowrap">RM {(resultA.monthlyNetSavings * 12).toFixed(0)}</div>
               </div>
               <div>
                 <div className="text-caption text-text-secondary whitespace-nowrap">{txt.fiveYear}</div>
                 <div className="text-body-lg font-display text-text-primary whitespace-nowrap">RM {resultA.fiveYearNetSavings.toFixed(0)}</div>
               </div>
               <div>
                 <div className="text-caption text-text-secondary font-medium whitespace-nowrap">{txt.tco}</div>
                 <div className="text-body-lg font-display font-bold text-brand-accent whitespace-nowrap">
                   {resultA.fiveYearTcoWithRoadTaxSavings >= 0 ? '+' : ''}RM {resultA.fiveYearTcoWithRoadTaxSavings.toFixed(0)}
                 </div>
                 <div className="text-[10px] text-text-secondary mt-0.5 whitespace-nowrap truncate">
                   {txt.inclRoadTax}
                 </div>
               </div>
             </div>
           </div>

           {/* Waterfall Breakdown */}
           <div className="bg-surface-base border border-border-subtle rounded-xl p-base">
             <div className="space-y-tight">
               <div className="flex justify-between text-body items-center gap-2">
                 <span className="text-text-secondary truncate">{txt.oldPetrolSpend}</span>
                 <span className="font-display tabular-nums text-text-primary whitespace-nowrap shrink-0">RM {store.petrolRm.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-body items-center gap-2">
                 <span className="text-text-secondary truncate">{txt.marginalHomeElec}</span>
                 <span className="font-display tabular-nums text-text-primary whitespace-nowrap shrink-0">RM {resultA.marginalHomeElectricityCost.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-body pb-tight border-b border-border-subtle items-center gap-2">
                 <span className="text-text-secondary truncate">{txt.publicDcCost}</span>
                 <span className="font-display tabular-nums text-text-primary whitespace-nowrap shrink-0">RM {resultA.publicChargingCost.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-body pt-tight items-center gap-2">
                 <span className="text-text-primary font-semibold truncate">{txt.totalEvCharging}</span>
                 <span className="font-display tabular-nums text-text-primary font-bold whitespace-nowrap shrink-0">RM {resultA.totalEvChargingCost.toFixed(2)}</span>
               </div>
             </div>
           </div>

           {/* Anchor Nav */}
           <div className="flex flex-wrap gap-2 pt-1">
             <button
               onClick={() => document.getElementById('comparator')?.scrollIntoView({ behavior: 'smooth' })}
               className="px-3 py-1.5 bg-surface-overlay border border-border-subtle rounded-full text-caption text-text-secondary hover:text-text-primary active:scale-95 transition-colors whitespace-nowrap"
             >
               {txt.seeComparator}
             </button>
             <button
               onClick={() => document.getElementById('roadtax')?.scrollIntoView({ behavior: 'smooth' })}
               className="px-3 py-1.5 bg-surface-overlay border border-border-subtle rounded-full text-caption text-text-secondary hover:text-text-primary active:scale-95 transition-colors whitespace-nowrap"
             >
               {store.language === 'zh' ? '查看 2026 路税 ↓' : 'See Road Tax ↓'}
             </button>
             <button
               onClick={() => document.getElementById('tnb')?.scrollIntoView({ behavior: 'smooth' })}
               className="px-3 py-1.5 bg-surface-overlay border border-border-subtle rounded-full text-caption text-text-secondary hover:text-text-primary active:scale-95 transition-colors whitespace-nowrap"
             >
               {txt.seeTnbAudit}
             </button>
           </div>
        </section>

        {/* Section 2: 3-Way Comparator */}
        <section id="comparator" className="space-y-stack-md">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
             <div>
               <h2 className="text-h3 text-text-primary font-semibold whitespace-nowrap">{txt.comparatorTitle}</h2>
               <p className="text-caption text-text-secondary mt-0.5">{txt.comparatorSub}</p>
             </div>
             {fiveYearTcoDiff !== 0 ? (
               <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 rounded-full text-caption text-brand-primary font-semibold shadow-sm max-w-full">
                 <Sparkles size={13} className="shrink-0" />
                 <div className="truncate whitespace-nowrap">
                   <span className="font-bold">{fiveYearTcoDiff > 0 ? store.modelName : comparatorVehicle.name}</span>
                   <span> {store.language === 'zh' ? `比另一款 5 年更省 RM ${Math.abs(fiveYearTcoDiff).toFixed(0)}` : `saves RM ${Math.abs(fiveYearTcoDiff).toFixed(0)} more (5-yr)`}</span>
                 </div>
               </div>
             ) : (
               <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-overlay border border-border-subtle rounded-full text-caption text-text-secondary font-medium w-fit whitespace-nowrap">
                 <span>{txt.tieTag}</span>
               </div>
             )}
           </div>

           <div className="bg-surface-base border border-border-subtle rounded-xl p-base overflow-hidden">
             
             {/* Horizontal scroll container for mobile narrow viewports */}
             <div className="overflow-x-auto -mx-base px-base pb-1">
               <div className="min-w-[430px]">
                 
                 {/* Table Header: 3 Vehicles */}
                 <div className="grid grid-cols-[1.1fr_1fr_1.1fr_1.1fr] gap-2 text-caption text-text-secondary mb-3 items-stretch">
                   <div className="flex items-end pb-2">
                     <span className="text-[11px] text-text-secondary/70 uppercase tracking-wider">{store.language === 'zh' ? '项目' : 'Item'}</span>
                   </div>
                   
                   {/* Col 1: Current Petrol Car */}
                   <div className="text-center p-2 bg-surface-overlay/70 rounded border border-border-subtle flex flex-col justify-center">
                     <span className="font-bold text-text-primary block truncate whitespace-nowrap">{txt.currentIceCar}</span>
                     <span className="text-[11px] text-text-secondary font-medium whitespace-nowrap">({store.petrolEngineCc || 1500}cc · {txt.baselineTag})</span>
                   </div>

                   {/* Col 2: Selected EV A */}
                   <div className="text-center p-2 bg-brand-primary/10 rounded border border-brand-primary/40 flex flex-col justify-center shadow-xs">
                     <span className="font-bold text-brand-primary block truncate whitespace-nowrap">{store.modelName}</span>
                     <span className="text-brand-accent text-[11px] font-medium whitespace-nowrap">{txt.activeInputs}</span>
                   </div>

                   {/* Col 3: Candidate EV B */}
                   <div className="flex flex-col justify-center">
                      <select 
                        value={comparatorVehicle.id}
                        onChange={e => setSelectedComparatorId(e.target.value)}
                        className="w-full h-full p-2 bg-surface-overlay border border-border-subtle rounded text-center text-text-primary appearance-none outline-none font-medium cursor-pointer truncate hover:border-brand-primary transition-colors text-caption"
                      >
                        {PRESETS.map(p => (
                          <option key={p.id} value={p.id} className="bg-surface-base text-text-primary">
                            {p.name}
                          </option>
                        ))}
                      </select>
                   </div>
                 </div>

                 {/* Comparison Rows */}
                 <div className="space-y-0 divide-y divide-border-subtle text-caption sm:text-body">
                   
                   {/* Row: Motor / Spec */}
                   <div className="grid grid-cols-[1.1fr_1fr_1.1fr_1.1fr] py-2.5 items-center gap-2">
                     <div className="text-text-secondary whitespace-nowrap truncate">{txt.motorKw}</div>
                     <div className="text-center font-display tabular-nums text-text-secondary whitespace-nowrap">{store.petrolEngineCc || 1500} cc</div>
                     <div className="text-center font-display tabular-nums text-brand-primary font-medium whitespace-nowrap">{store.motorKw} kW</div>
                     <div className="text-center font-display tabular-nums text-text-primary whitespace-nowrap">{comparatorVehicle.motorKw} kW</div>
                   </div>

                   {/* Row: Battery / Capacity */}
                   <div className="grid grid-cols-[1.1fr_1fr_1.1fr_1.1fr] py-2.5 items-center gap-2">
                     <div className="text-text-secondary whitespace-nowrap truncate">{txt.batteryKwh}</div>
                     <div className="text-center font-display tabular-nums text-text-secondary whitespace-nowrap">-</div>
                     <div className="text-center font-display tabular-nums text-brand-primary font-medium whitespace-nowrap">{store.batteryKwh} kWh</div>
                     <div className="text-center font-display tabular-nums text-text-primary whitespace-nowrap">{comparatorVehicle.batteryKwh} kWh</div>
                   </div>

                   {/* Row: Cost per 100km */}
                   <div className="grid grid-cols-[1.1fr_1fr_1.1fr_1.1fr] py-2.5 items-center gap-2">
                     <div className="text-text-secondary whitespace-nowrap truncate">{txt.cost100km}</div>
                     <div className="text-center font-display tabular-nums text-text-secondary whitespace-nowrap">
                       RM {petrolCost100Km.toFixed(2)}
                     </div>
                     <div className="text-center font-display tabular-nums font-semibold text-brand-primary whitespace-nowrap">
                       RM {resultA.evCostPer100Km.toFixed(2)}
                     </div>
                     <div className="text-center font-display tabular-nums font-semibold text-text-primary whitespace-nowrap">
                       RM {resultB.evCostPer100Km.toFixed(2)}
                     </div>
                   </div>

                   {/* Row: Monthly Energy */}
                   <div className="grid grid-cols-[1.1fr_1fr_1.1fr_1.1fr] py-2.5 items-center gap-2">
                     <div className="text-text-secondary whitespace-nowrap truncate">{txt.monthlyEvCost}</div>
                     <div className="text-center font-display tabular-nums text-text-secondary whitespace-nowrap">
                       RM {store.petrolRm.toFixed(2)}
                     </div>
                     <div className="text-center font-display tabular-nums font-semibold text-brand-primary whitespace-nowrap">
                       RM {resultA.totalEvChargingCost.toFixed(2)}
                     </div>
                     <div className="text-center font-display tabular-nums text-text-primary whitespace-nowrap">
                       RM {resultB.totalEvChargingCost.toFixed(2)}
                     </div>
                   </div>

                   {/* Row: Road Tax */}
                   <div className="grid grid-cols-[1.1fr_1fr_1.1fr_1.1fr] py-2.5 items-center gap-2">
                     <div className="text-text-secondary whitespace-nowrap truncate">{txt.roadTaxEvLabel}</div>
                     <div className="text-center font-display tabular-nums text-text-secondary whitespace-nowrap">
                       RM {resultA.petrolRoadTaxAnnualRm} <span className="text-[10px] text-text-secondary">{txt.perYearUnit}</span>
                     </div>
                     <div className="text-center font-display tabular-nums font-medium text-brand-primary whitespace-nowrap">
                       RM {resultA.evRoadTaxAnnualRm} <span className="text-[10px] text-text-secondary">{txt.perYearUnit}</span>
                     </div>
                     <div className="text-center font-display tabular-nums text-text-primary whitespace-nowrap">
                       RM {resultB.evRoadTaxAnnualRm} <span className="text-[10px] text-text-secondary">{txt.perYearUnit}</span>
                     </div>
                   </div>

                   {/* Row: 5-Yr Total Spend (Fuel + Road Tax) */}
                   <div className="grid grid-cols-[1.1fr_1fr_1.1fr_1.1fr] py-2.5 items-center gap-2 bg-surface-overlay/30 -mx-base px-base rounded">
                     <div className="text-text-primary font-medium whitespace-nowrap truncate">{txt.fiveYearTotalCost}</div>
                     <div className="text-center font-display tabular-nums text-text-secondary whitespace-nowrap">
                       RM {petrol5YrSpend.toFixed(0)}
                     </div>
                     <div className="text-center font-display tabular-nums font-bold text-brand-primary whitespace-nowrap">
                       RM {evA5YrSpend.toFixed(0)}
                     </div>
                     <div className="text-center font-display tabular-nums font-semibold text-text-primary whitespace-nowrap">
                       RM {evB5YrSpend.toFixed(0)}
                     </div>
                   </div>

                   {/* Row: 5-Yr Savings vs Petrol */}
                   <div className="grid grid-cols-[1.1fr_1fr_1.1fr_1.1fr] py-2.5 items-center gap-2">
                     <div className="text-text-primary font-semibold whitespace-nowrap truncate">{txt.fiveYearEnergySavings}</div>
                     <div className="text-center font-display tabular-nums text-text-secondary whitespace-nowrap">
                       {txt.baselineTag}
                     </div>
                     <div className={`text-center font-display tabular-nums font-bold whitespace-nowrap ${
                       resultA.fiveYearTcoWithRoadTaxSavings >= 0 ? 'text-status-positive' : 'text-status-warning'
                     }`}>
                       {resultA.fiveYearTcoWithRoadTaxSavings >= 0 ? '+' : ''}RM {resultA.fiveYearTcoWithRoadTaxSavings.toFixed(0)}
                     </div>
                     <div className={`text-center font-display tabular-nums font-bold whitespace-nowrap ${
                       resultB.fiveYearTcoWithRoadTaxSavings >= 0 ? 'text-status-positive' : 'text-status-warning'
                     }`}>
                       {resultB.fiveYearTcoWithRoadTaxSavings >= 0 ? '+' : ''}RM {resultB.fiveYearTcoWithRoadTaxSavings.toFixed(0)}
                     </div>
                   </div>

                 </div>

               </div>
             </div>

           </div>
        </section>

        {/* Section 3: 2026 Road Tax Deep Dive */}
        <section id="roadtax" className="space-y-stack-md">
           <div className="flex items-center gap-2">
             <ShieldCheck size={20} className="text-brand-accent" />
             <h2 className="text-h3 text-text-primary font-semibold whitespace-nowrap">{txt.roadTaxSectionTitle}</h2>
           </div>
           
           <div className="bg-surface-base border border-border-subtle rounded-xl p-base space-y-4">
             <p className="text-caption text-text-secondary leading-relaxed">
               {txt.roadTaxSub}
             </p>

             {/* Benchmark ICE Displacement Picker */}
             <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-border-subtle py-3 gap-2 text-body">
               <span className="text-caption text-text-secondary whitespace-nowrap">{txt.roadTaxIceCcSelect}</span>
               <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
                 {[1500, 1800, 2000].map(cc => (
                   <button
                     key={cc}
                     type="button"
                     onClick={() => store.setPetrolEngineCc(cc)}
                     className={`px-2.5 py-1 text-caption rounded border transition-colors whitespace-nowrap text-center ${
                       (store.petrolEngineCc || 1500) === cc
                         ? 'bg-brand-primary text-text-inverse border-brand-primary font-semibold shadow-sm'
                         : 'bg-surface-overlay text-text-secondary border-border-subtle hover:text-text-primary'
                     }`}
                   >
                     {cc === 1500 ? '1.5L (RM90)' : cc === 1800 ? '1.8L (RM280)' : '2.0L (RM380)'}
                   </button>
                 ))}
               </div>
             </div>

              {/* Side by Side Tax comparison */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-surface-overlay border border-border-subtle rounded-lg p-3 text-center flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-text-secondary font-medium leading-tight">{txt.roadTaxEvLabel}</div>
                    <div className="text-[10px] text-text-secondary/70 font-mono mt-0.5">({store.motorKw} kW)</div>
                  </div>
                  <div className="mt-2 flex items-baseline justify-center">
                    <span className="text-h2 font-display font-bold text-text-primary tabular-nums">
                      RM {resultA.evRoadTaxAnnualRm}
                    </span>
                    <span className="text-[10px] text-text-secondary ml-1">{txt.perYearUnit}</span>
                  </div>
                </div>

                <div className="bg-surface-overlay border border-border-subtle rounded-lg p-3 text-center flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-text-secondary font-medium leading-tight">{txt.roadTaxIceLabel}</div>
                    <div className="text-[10px] text-text-secondary/70 font-mono mt-0.5">({store.petrolEngineCc || 1500} cc)</div>
                  </div>
                  <div className="mt-2 flex items-baseline justify-center">
                    <span className="text-h2 font-display font-bold text-text-primary tabular-nums">
                      RM {resultA.petrolRoadTaxAnnualRm}
                    </span>
                    <span className="text-[10px] text-text-secondary ml-1">{txt.perYearUnit}</span>
                  </div>
                </div>
              </div>

             {/* Summary Delta Banner */}
             <div className="p-3 bg-surface-overlay/80 border border-border-subtle rounded-lg flex justify-between items-center text-body gap-2">
               <div className="truncate">
                 <div className="text-caption font-medium text-text-primary whitespace-nowrap">{txt.annualDiff}</div>
                 <div className="text-[11px] text-text-secondary mt-0.5 truncate">
                   {resultA.annualRoadTaxDifferenceRm >= 0
                     ? (store.language === 'zh' ? '纯电每年少付路税' : 'EV saves on road tax')
                     : (store.language === 'zh' ? '纯电每年多付路税' : 'EV pays more road tax')}
                 </div>
               </div>
               <div className={`font-display font-bold text-body-lg tabular-nums whitespace-nowrap shrink-0 ${
                 resultA.annualRoadTaxDifferenceRm >= 0 ? 'text-status-positive' : 'text-status-warning'
               }`}>
                 {resultA.annualRoadTaxDifferenceRm >= 0 ? '+' : ''}RM {resultA.annualRoadTaxDifferenceRm.toFixed(2)} {txt.perYearUnit}
               </div>
             </div>
           </div>
        </section>

        {/* Section 4: TNB Bill Audit */}
        <section id="tnb" className="space-y-stack-md">
           <h2 className="text-h3 text-text-primary font-semibold whitespace-nowrap">{txt.tnbAuditTitle}</h2>
           
           <div className="bg-surface-base border border-border-subtle rounded-xl p-base">
             
             {/* Threshold Warning */}
             {resultA.crossed600Threshold && (
               <div className="mb-4 p-3 bg-status-warning/10 border border-status-warning/20 rounded flex items-start space-x-2">
                 <Info size={16} className="text-status-warning shrink-0 mt-0.5" />
                 <p className="text-caption text-text-primary leading-relaxed">
                   {txt.thresholdWarning}
                 </p>
               </div>
             )}

             {/* Table */}
             <div className="overflow-x-auto">
               <table className="w-full text-left text-body">
                 <thead>
                   <tr className="text-caption text-text-secondary border-b border-border-subtle whitespace-nowrap">
                     <th className="font-normal py-2 pr-2">{txt.tableItem}</th>
                     <th className="font-normal py-2 px-2 text-right">{txt.tableBaseline}</th>
                     <th className="font-normal py-2 px-2 text-right">{txt.tableNew}</th>
                     <th className="font-normal py-2 pl-2 text-right">{txt.tableDelta}</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border-subtle font-display tabular-nums text-text-primary whitespace-nowrap">
                   <tr>
                     <td className="py-3 text-text-secondary font-body pr-2">{txt.baseGen}</td>
                     <td className="py-3 px-2 text-right">{resultA.baselineBill.baseEnergySubtotal.toFixed(2)}</td>
                     <td className="py-3 px-2 text-right">{resultA.newCombinedBill.baseEnergySubtotal.toFixed(2)}</td>
                     <td className="py-3 pl-2 text-right text-brand-accent">+{(resultA.newCombinedBill.baseEnergySubtotal - resultA.baselineBill.baseEnergySubtotal).toFixed(2)}</td>
                   </tr>
                   <tr>
                     <td className="py-3 text-text-secondary font-body pr-2">EEI Rebate</td>
                     <td className="py-3 px-2 text-right text-status-positive">-{resultA.baselineBill.eeiRebateAmount.toFixed(2)}</td>
                     <td className="py-3 px-2 text-right text-status-positive">-{resultA.newCombinedBill.eeiRebateAmount.toFixed(2)}</td>
                     <td className="py-3 pl-2 text-right text-brand-accent">+{(resultA.baselineBill.eeiRebateAmount - resultA.newCombinedBill.eeiRebateAmount).toFixed(2)}</td>
                   </tr>
                   <tr>
                     <td className="py-3 text-text-secondary font-body pr-2">{txt.sstTax}</td>
                     <td className="py-3 px-2 text-right">{resultA.baselineBill.sstTax.toFixed(2)}</td>
                     <td className="py-3 px-2 text-right">{resultA.newCombinedBill.sstTax.toFixed(2)}</td>
                     <td className="py-3 pl-2 text-right text-brand-accent">+{(resultA.newCombinedBill.sstTax - resultA.baselineBill.sstTax).toFixed(2)}</td>
                   </tr>
                   <tr>
                     <td className="py-3 text-text-secondary font-body pr-2">{txt.kwtbb}</td>
                     <td className="py-3 px-2 text-right">{resultA.baselineBill.kwtbbFund.toFixed(2)}</td>
                     <td className="py-3 px-2 text-right">{resultA.newCombinedBill.kwtbbFund.toFixed(2)}</td>
                     <td className="py-3 pl-2 text-right text-brand-accent">+{(resultA.newCombinedBill.kwtbbFund - resultA.baselineBill.kwtbbFund).toFixed(2)}</td>
                   </tr>
                 </tbody>
                 <tfoot>
                   <tr className="border-t border-border-subtle font-semibold whitespace-nowrap">
                     <td className="py-3 text-text-primary font-body pr-2">{txt.totalRm}</td>
                     <td className="py-3 px-2 text-right font-display tabular-nums text-text-primary">{resultA.baselineBill.totalAmount.toFixed(2)}</td>
                     <td className="py-3 px-2 text-right font-display tabular-nums text-text-primary">{resultA.newCombinedBill.totalAmount.toFixed(2)}</td>
                     <td className="py-3 pl-2 text-right font-display tabular-nums text-brand-primary">+{resultA.marginalHomeElectricityCost.toFixed(2)}</td>
                   </tr>
                 </tfoot>
               </table>
             </div>

           </div>
        </section>

        {/* Section 5: Quick Share Section */}
        <section className="bg-surface-base border border-border-subtle rounded-xl p-base flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <h3 className="text-body font-semibold text-text-primary whitespace-nowrap">
              {store.language === 'zh' ? '保存或分享测算结果' : 'Share or Save Verdict'}
            </h3>
            <p className="text-caption text-text-secondary mt-0.5 whitespace-nowrap">
              {store.language === 'zh' ? '一键生成试驾精算摘要发给家人或销售' : 'Send summary report via WhatsApp or clipboard'}
            </p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <button
              onClick={handleCopyReport}
              className="flex-1 sm:flex-initial px-4 py-2 bg-surface-overlay border border-border-subtle rounded-lg text-caption font-medium text-text-primary hover:border-brand-primary active:scale-95 transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap"
            >
              {copied ? <Check size={14} className="text-status-positive" /> : <Copy size={14} />}
              <span>{copied ? txt.copied : txt.copyReport}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#25D366] text-white rounded-lg text-caption font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap shadow-sm"
            >
              <Share2 size={14} />
              <span>WhatsApp</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
