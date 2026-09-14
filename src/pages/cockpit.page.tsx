import { useState, useEffect } from 'react';
import { Settings, ChevronRight, Moon, Sun, ArrowLeftRight, Car, Pencil, X, Zap, Fuel } from 'lucide-react';
import { useCalculatorStore } from '../stores/calculator.store';
import { PRESETS } from '../data/presets';
import { AdvancedDrawer } from '../components/advanced-drawer';
import { IceCockpitSection } from '../components/IceCockpitSection';
import { evCalcTranslations } from '../i18n/evCalcTranslations';
import { calculateTnbBill, estimateKwhFromTnbBill } from '../utils/tnbTariff';

export default function CockpitPage({ onCalculate = () => {} }: { onCalculate?: () => void }) {
  const {
    vehicleType, setVehicleType,
    selectedPresetId, setPreset,
    modelName, setModelName,
    consumption, setConsumption,
    mileage, setMileage,
    baselineKwh, setBaselineKwh,
    petrolRm, setPetrolRm,
    mode, setMode,
    language, setLanguage,
    theme, setTheme
  } = useCalculatorStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [homeDisplayMode, setHomeDisplayMode] = useState<'kwh' | 'rm'>('kwh');
  const [localRmValue, setLocalRmValue] = useState<string>('');
  const [isEditingModel, setIsEditingModel] = useState(false);
  const [tempModelName, setTempModelName] = useState(modelName);

  const currentPreset = PRESETS.find(p => p.id === selectedPresetId);
  const isCustomConsumption = currentPreset
    ? Math.abs(consumption - currentPreset.consumption) > 0.05 || modelName !== currentPreset.name
    : true;

  // Sync tempModelName when store modelName changes externally
  useEffect(() => {
    setTempModelName(modelName);
  }, [modelName]);

  const currentTnbBill = calculateTnbBill(baselineKwh);

  // Sync local RM value when switching to RM mode or when baseline changes externally
  useEffect(() => {
    if (homeDisplayMode === 'rm') {
      setLocalRmValue(currentTnbBill.totalAmount.toFixed(2));
    }
  }, [homeDisplayMode]);

  const handleToggleDisplayMode = () => {
    if (homeDisplayMode === 'kwh') {
      setLocalRmValue(currentTnbBill.totalAmount.toFixed(2));
      setHomeDisplayMode('rm');
    } else {
      setHomeDisplayMode('kwh');
    }
  };

  const txt = evCalcTranslations[language] || evCalcTranslations.en;

  return (
    <div className="relative min-h-screen bg-background-default antialiased pb-[calc(100px+env(safe-area-inset-bottom))]">
      <div className="absolute inset-0 z-0 bg-background-default" />
      
      <main className="relative z-10 pt-[env(safe-area-inset-top)] px-base space-y-section-y">
        
        {/* Header */}
        <header className="flex justify-between items-center py-base">
          <div className="flex items-center space-x-2.5">
            <img src="./logo.png" alt="Car Calc MY" className="w-8 h-8 rounded-lg shadow-sm" />
            <h1 className="text-h2 font-display text-text-primary tracking-tight">{txt.appTitle}</h1>
          </div>
          <div className="flex space-x-3">
             <button
               onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
               className="px-2.5 py-1 text-caption border border-border-subtle rounded text-text-secondary hover:text-text-primary hover:border-brand-primary active:scale-95 transition-colors font-medium"
             >
               {txt.langToggle}
             </button>
             <button
               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               className="p-1 text-text-secondary hover:text-text-primary active:scale-95 transition-colors"
               aria-label="Toggle theme"
             >
               {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
             </button>
          </div>
        </header>

        {/* Global Vehicle Type Switcher (EV vs Petrol) */}
        <div className="p-1 bg-surface-overlay rounded-xl border border-border-subtle grid grid-cols-2 gap-1 shadow-xs">
          <button
            type="button"
            onClick={() => setVehicleType('ev')}
            className={`py-2 px-3 rounded-lg font-medium text-caption sm:text-body flex items-center justify-center space-x-1.5 transition-all ${
              vehicleType === 'ev'
                ? 'bg-brand-primary text-text-inverse font-semibold shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Zap size={15} />
            <span>{txt.modeEv}</span>
          </button>
          <button
            type="button"
            onClick={() => setVehicleType('ice')}
            className={`py-2 px-3 rounded-lg font-medium text-caption sm:text-body flex items-center justify-center space-x-1.5 transition-all ${
              vehicleType === 'ice'
                ? 'bg-brand-primary text-text-inverse font-semibold shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Fuel size={15} />
            <span>{txt.modeIce}</span>
          </button>
        </div>


        {/* Conditional Cockpit Content */}
        {vehicleType === 'ice' ? (
          <IceCockpitSection />
        ) : (
          <>
            {/* Vehicle Selection */}
            <section className="space-y-stack-md">
              <h2 className="text-body-lg text-text-primary font-semibold">{txt.evJourneyTitle}</h2>

          
          <div className="bg-surface-base border border-border-subtle rounded-xl p-base space-y-stack-md">
            <div className="flex justify-between items-center">
              <span className="text-body text-text-secondary">{txt.consumptionLabel}</span>
            </div>
            
            <div className="flex justify-center items-center space-x-loose">
               <button 
                  type="button"
                  onClick={() => setConsumption(Math.max(5, Math.round((consumption - 0.1) * 10) / 10))}
                  className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center text-text-primary active:bg-surface-overlay active:scale-95 transition-all text-h3 select-none"
                  aria-label="Decrease by 0.1"
               >
                 -
               </button>
               <input
                 type="number"
                 step="0.1"
                 min="5"
                 max="40"
                 value={consumption}
                 onChange={(e) => {
                   const val = parseFloat(e.target.value);
                   if (!isNaN(val)) {
                     setConsumption(Math.round(val * 10) / 10);
                   }
                 }}
                 className="text-h1 font-display text-text-primary w-28 text-center tabular-nums bg-transparent outline-none focus:border-b focus:border-brand-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
               />
               <button 
                  type="button"
                  onClick={() => setConsumption(Math.min(40, Math.round((consumption + 0.1) * 10) / 10))}
                  className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center text-text-primary active:bg-surface-overlay active:scale-95 transition-all text-h3 select-none"
                  aria-label="Increase by 0.1"
               >
                 +
               </button>
            </div>

            {/* Custom Consumption Model Name Remark Banner */}
            {isCustomConsumption && (
              <div className="pt-1">
                {isEditingModel ? (
                  <div className="flex items-center space-x-2 p-2 bg-surface-overlay border border-brand-primary rounded-lg text-caption animate-fade-in">
                    <Car size={15} className="text-brand-primary shrink-0" />
                    <input
                      type="text"
                      value={tempModelName}
                      onChange={e => setTempModelName(e.target.value)}
                      placeholder={language === 'zh' ? '输入自定义车型备注，例如: Proton e.MAS 7 试驾版' : 'e.g. Proton e.MAS 7 Test Drive'}
                      className="flex-1 bg-transparent text-text-primary outline-none text-caption"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (tempModelName.trim()) setModelName(tempModelName.trim());
                          setIsEditingModel(false);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempModelName.trim()) setModelName(tempModelName.trim());
                        setIsEditingModel(false);
                      }}
                      className="px-2.5 py-1 bg-brand-primary text-text-inverse rounded font-medium text-[11px] hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
                    >
                      {language === 'zh' ? '保存' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingModel(false)}
                      className="p-1 text-text-secondary hover:text-text-primary active:scale-95 transition-all"
                      aria-label="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-caption text-text-primary gap-2 animate-fade-in">
                    <div className="flex items-center space-x-2 truncate">
                      <Car size={15} className="text-brand-primary shrink-0" />
                      <span className="truncate text-text-secondary">
                        {language === 'zh' ? (
                          <>
                            已调整电耗。车型备注：<strong className="text-text-primary font-semibold">{modelName}</strong>
                          </>
                        ) : (
                          <>
                            Custom consumption. Model: <strong className="text-text-primary font-semibold">{modelName}</strong>
                          </>
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTempModelName(modelName);
                        setIsEditingModel(true);
                      }}
                      className="px-2.5 py-1 bg-surface-overlay border border-border-subtle hover:border-brand-primary text-text-primary rounded font-medium shrink-0 hover:text-brand-primary active:scale-95 transition-all text-[11px] whitespace-nowrap flex items-center space-x-1 shadow-xs"
                    >
                      <Pencil size={11} />
                      <span>{language === 'zh' ? '修改车型备注' : 'Note Model'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Presets Carousel */}
            <div className="flex overflow-x-auto space-x-tight pb-2 -mx-base px-base snap-x hide-scrollbar">
              {PRESETS.map(p => {
                const isSelected = selectedPresetId === p.id && !isCustomConsumption;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPreset(p.id);
                      setIsEditingModel(false);
                      setTempModelName(p.name);
                    }}
                    className={`shrink-0 snap-start px-snug py-tight rounded-md border text-caption whitespace-nowrap transition-colors ${isSelected ? 'bg-brand-primary text-text-inverse border-brand-primary font-semibold' : 'bg-surface-overlay border-border-subtle text-text-secondary'}`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-stack-md">
           
           {/* Charging Environment: Landed vs Condo Pill */}
           <div className="bg-surface-base border border-border-subtle rounded-xl p-base space-y-2">
             <div className="flex justify-between items-center">
               <span className="text-caption text-text-secondary">{txt.chargingSetupTitle}</span>
             </div>
             <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-overlay rounded-lg border border-border-subtle">
               <button
                 type="button"
                 onClick={() => setMode('landed')}
                 className={`py-2 px-1.5 rounded-md font-medium transition-all text-center whitespace-nowrap text-[12px] sm:text-caption ${
                   mode !== 'condo'
                     ? 'bg-brand-primary text-text-inverse font-semibold shadow-xs'
                     : 'text-text-secondary hover:text-text-primary'
                 }`}
               >
                 {txt.setupLanded}
               </button>
               <button
                 type="button"
                 onClick={() => setMode('condo')}
                 className={`py-2 px-1.5 rounded-md font-medium transition-all text-center whitespace-nowrap text-[12px] sm:text-caption ${
                   mode === 'condo'
                     ? 'bg-brand-primary text-text-inverse font-semibold shadow-xs'
                     : 'text-text-secondary hover:text-text-primary'
                 }`}
               >
                 {txt.setupCondo}
               </button>
             </div>
           </div>

           <div className="bg-surface-base border border-border-subtle rounded-xl p-base flex justify-between items-center">
             <div>
               <div className="text-caption text-text-secondary">{txt.monthlyMileageTitle}</div>
               <div className="flex items-center space-x-2 mt-1">
                 <input 
                   type="number" 
                   value={mileage}
                   onChange={e => setMileage(Number(e.target.value))}
                   className="bg-transparent text-h3 font-display tabular-nums text-text-primary w-20 outline-none"
                 />
                 <span className="text-body text-text-secondary">{txt.mileageUnit}</span>
               </div>
             </div>
             <div className="flex space-x-2">
                {[800, 1200, 1500, 2000].map(m => (
                  <button key={m} onClick={() => setMileage(m)} className="px-2 py-1 text-caption bg-surface-overlay border border-border-subtle rounded text-text-secondary">
                    {m}
                  </button>
                ))}
             </div>
           </div>

           <div className="bg-surface-base border border-border-subtle rounded-xl p-base flex justify-between items-center">
             <div>
               <div className="text-caption text-text-secondary flex items-center gap-1.5 flex-wrap">
                 <span className="whitespace-nowrap">{txt.homeElectricityTitle}</span>
                 <span className="text-[11px] text-text-secondary/70 font-mono whitespace-nowrap">
                   {homeDisplayMode === 'kwh'
                     ? `(≈ RM ${currentTnbBill.totalAmount.toFixed(2)} / ${language === 'zh' ? '月' : 'mo'})`
                     : `(≈ ${baselineKwh} kWh / ${language === 'zh' ? '月' : 'mo'})`}
                 </span>
               </div>
               <div className="flex items-center space-x-2 mt-1">
                 {homeDisplayMode === 'rm' && (
                   <span className="text-body text-text-secondary font-medium">RM</span>
                 )}
                 {homeDisplayMode === 'kwh' ? (
                   <input 
                     type="number" 
                     value={baselineKwh}
                     onChange={e => setBaselineKwh(Math.max(0, Number(e.target.value)))}
                     className="bg-transparent text-h3 font-display tabular-nums text-text-primary w-24 outline-none"
                   />
                 ) : (
                   <input 
                     type="number" 
                     step="0.01"
                     value={localRmValue}
                     onChange={e => {
                       setLocalRmValue(e.target.value);
                       const val = parseFloat(e.target.value);
                       if (!isNaN(val) && val >= 0) {
                         setBaselineKwh(estimateKwhFromTnbBill(val));
                       }
                     }}
                     className="bg-transparent text-h3 font-display tabular-nums text-text-primary w-24 outline-none"
                   />
                 )}
                 {homeDisplayMode === 'kwh' && (
                   <span className="text-body text-text-secondary">{txt.kwhUnit}</span>
                 )}
               </div>
             </div>
             <button
                type="button"
                onClick={handleToggleDisplayMode}
                className="px-2.5 py-1 text-caption bg-surface-overlay border border-border-subtle rounded text-text-secondary flex items-center space-x-1 hover:text-text-primary hover:border-brand-primary active:scale-95 transition-all shadow-sm"
                title={language === 'zh' ? '点击在 kWh 用电度数与 RM 账单金额之间切换' : 'Toggle between kWh usage and RM bill amount'}
              >
                <span className={`transition-colors ${homeDisplayMode === 'kwh' ? 'text-brand-accent font-bold' : 'text-text-secondary'}`}>kWh</span>
                <ArrowLeftRight size={12} className="text-text-secondary" />
                <span className={`transition-colors ${homeDisplayMode === 'rm' ? 'text-brand-accent font-bold' : 'text-text-secondary'}`}>RM</span>
              </button>
           </div>

           <div className="bg-surface-base border border-border-subtle rounded-xl p-base flex justify-between items-center">
             <div>
               <div className="text-caption text-text-secondary">{txt.monthlyPetrolTitle}</div>
               <div className="flex items-center space-x-2 mt-1">
                 <span className="text-body text-text-secondary">{txt.currencyUnit}</span>
                 <input 
                   type="number" 
                   value={petrolRm}
                   onChange={e => setPetrolRm(Number(e.target.value))}
                   className="bg-transparent text-h3 font-display tabular-nums text-text-primary w-20 outline-none"
                 />
               </div>
             </div>
           </div>

         </section>
          </>
        )}

      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background-default/80 backdrop-blur-md border-t border-border-subtle p-base pb-[calc(16px+env(safe-area-inset-bottom))] flex justify-between items-center space-x-base">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-3 bg-surface-overlay border border-border-subtle rounded-lg text-text-primary active:scale-[0.98] hover:border-brand-primary transition-colors"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
        <button
          onClick={onCalculate}
          className="flex-1 bg-brand-primary text-text-inverse font-body font-semibold rounded-lg px-comfortable py-3 flex justify-center items-center space-x-2 active:scale-[0.98] shadow-md hover:opacity-95 transition-opacity"
        >
          <span>{txt.calculateBtn}</span>
          <ChevronRight size={18} />
        </button>
      </div>

      <AdvancedDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
