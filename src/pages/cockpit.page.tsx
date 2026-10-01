import { useState, useEffect } from 'react';
import { Settings, ChevronRight, ArrowLeftRight, Car, Pencil, X, Zap, Fuel, Home, Building2 } from 'lucide-react';
import { useCalculatorStore } from '../stores/calculator.store';
import { PRESETS } from '../data/presets';
import { AdvancedDrawer } from '../components/advanced-drawer';
import { IceCockpitSection } from '../components/IceCockpitSection';
import { VehiclePickerSheet } from '../components/VehiclePickerSheet';
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
    language
  } = useCalculatorStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVehiclePickerOpen, setIsVehiclePickerOpen] = useState(false);
  const [homeDisplayMode, setHomeDisplayMode] = useState<'kwh' | 'rm'>('rm');
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
      setLocalRmValue(currentTnbBill.totalAmount.toFixed(0));
    }
  }, [homeDisplayMode, baselineKwh]);

  const handleToggleDisplayMode = () => {
    if (homeDisplayMode === 'kwh') {
      setLocalRmValue(currentTnbBill.totalAmount.toFixed(0));
      setHomeDisplayMode('rm');
    } else {
      setHomeDisplayMode('kwh');
    }
  };

  const txt = evCalcTranslations[language] || evCalcTranslations.en;

  return (
    <div className="relative min-h-screen bg-background-default antialiased pb-28">
      {/* Sticky Top Header with Safe Area Inset for Standalone Web App */}
      <header className="sticky top-0 z-30 bg-background-default border-b border-border-subtle pt-[max(1.35rem,calc(env(safe-area-inset-top,47px)+1.15rem))] pb-3 px-4">
        <div className="app-container">
          {/* Global Vehicle Type Switcher (EV vs Petrol) */}
          <div className="p-1 bg-surface-overlay rounded-xl border border-border-subtle grid grid-cols-2 gap-1 shadow-xs">
            <button
              type="button"
              onClick={() => setVehicleType('ev')}
              className={`py-2 px-3 rounded-lg font-semibold text-caption sm:text-body flex items-center justify-center space-x-2 transition-all ${
                vehicleType === 'ev'
                  ? 'bg-brand-primary text-text-inverse shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Zap size={16} strokeWidth={2} />
              <span>{language === 'zh' ? '纯电 EV' : 'Electric EV'}</span>
            </button>
            <button
              type="button"
              onClick={() => setVehicleType('ice')}
              className={`py-2 px-3 rounded-lg font-semibold text-caption sm:text-body flex items-center justify-center space-x-2 transition-all ${
                vehicleType === 'ice'
                  ? 'bg-brand-primary text-text-inverse shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Fuel size={16} strokeWidth={2} />
              <span>{language === 'zh' ? '燃油 Petrol' : 'Petrol Fuel'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-container px-4 py-4 space-y-3.5">
        {/* Conditional Cockpit Content */}
        {vehicleType === 'ice' ? (
          <IceCockpitSection />
        ) : (
          <div className="space-y-3.5">
            {/* Section 1: Vehicle & Consumption */}
            <section className="bg-surface-base border border-border-subtle rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-body font-semibold text-text-primary">{txt.evJourneyTitle}</span>
                <span className="text-caption text-text-secondary">
                  {language === 'zh' ? '参考电耗' : 'Rated Spec'}
                </span>
              </div>

              {/* Stepper & Numeric Input */}
              <div className="flex items-center justify-center space-x-4 py-1">
                <button 
                  type="button"
                  onClick={() => setConsumption(Math.max(5, Math.round((consumption - 0.1) * 10) / 10))}
                  className="w-11 h-11 rounded-lg border border-border-subtle bg-surface-overlay flex items-center justify-center text-text-primary hover:border-brand-primary active:scale-95 transition-all text-xl font-bold select-none shrink-0"
                  aria-label="Decrease consumption by 0.1"
                >
                  -
                </button>

                <div className="flex flex-col items-center">
                  <div className="flex items-baseline space-x-1">
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
                      className="text-2xl sm:text-3xl font-display font-bold text-text-primary w-24 text-center tabular-nums bg-transparent outline-none focus:border-b-2 focus:border-brand-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <span className="text-caption text-text-secondary font-medium">kWh / 100km</span>
                </div>

                <button 
                  type="button"
                  onClick={() => setConsumption(Math.min(40, Math.round((consumption + 0.1) * 10) / 10))}
                  className="w-11 h-11 rounded-lg border border-border-subtle bg-surface-overlay flex items-center justify-center text-text-primary hover:border-brand-primary active:scale-95 transition-all text-xl font-bold select-none shrink-0"
                  aria-label="Increase consumption by 0.1"
                >
                  +
                </button>
              </div>

              {/* Custom Model Name Banner (if editing or customized) */}
              {isCustomConsumption && (
                <div>
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
                    <div className="flex items-center justify-between p-2 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-caption text-text-primary gap-2 animate-fade-in">
                      <div className="flex items-center space-x-2 truncate">
                        <Car size={14} className="text-brand-primary shrink-0" />
                        <span className="truncate text-text-secondary text-[11px]">
                          {language === 'zh' ? (
                            <>车型备注：<strong className="text-text-primary font-semibold">{modelName}</strong></>
                          ) : (
                            <>Model: <strong className="text-text-primary font-semibold">{modelName}</strong></>
                          )}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTempModelName(modelName);
                          setIsEditingModel(true);
                        }}
                        className="px-2 py-0.5 bg-surface-overlay border border-border-subtle hover:border-brand-primary text-text-primary rounded font-medium shrink-0 hover:text-brand-primary active:scale-95 transition-all text-[11px] whitespace-nowrap flex items-center space-x-1"
                      >
                        <Pencil size={11} />
                        <span>{language === 'zh' ? '修改' : 'Edit'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Vehicle Preset Selector Button (Opens Bottom Sheet) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsVehiclePickerOpen(true)}
                  className="w-full p-3 rounded-xl bg-surface-overlay border border-border-subtle hover:border-brand-primary active:scale-[0.99] transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                      <Zap size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-body font-semibold text-text-primary truncate">
                        {modelName}
                      </div>
                      <div className="text-caption text-text-secondary truncate">
                        {currentPreset
                          ? `${currentPreset.consumption} kWh/100km, ${currentPreset.motorKw} kW, ${currentPreset.batteryKwh} kWh 电池`
                          : (language === 'zh' ? '自定义车型参数' : 'Custom Specs')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-brand-primary text-caption font-semibold shrink-0 ml-2">
                    <span>{language === 'zh' ? '换车' : 'Change'}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>
            </section>

            {/* Section 2: Charging Setup */}
            <section className="bg-surface-base border border-border-subtle rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-xs">
              <span className="text-body font-semibold text-text-primary block">
                {txt.chargingSetupTitle}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('landed')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    mode !== 'condo'
                      ? 'bg-brand-primary/10 border-brand-primary text-text-primary shadow-xs'
                      : 'bg-surface-overlay border-border-subtle text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Home size={16} className={mode !== 'condo' ? 'text-brand-primary' : 'text-text-secondary'} />
                    <span className="font-semibold text-caption sm:text-body">{txt.setupLanded}</span>
                  </div>
                  <span className="text-caption text-text-secondary mt-1 truncate block">
                    {language === 'zh' ? '排屋 (TNB 家充阶梯电价)' : 'Home AC (Domestic Tariff)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('condo')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    mode === 'condo'
                      ? 'bg-brand-primary/10 border-brand-primary text-text-primary shadow-xs'
                      : 'bg-surface-overlay border-border-subtle text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Building2 size={16} className={mode === 'condo' ? 'text-brand-primary' : 'text-text-secondary'} />
                    <span className="font-semibold text-caption sm:text-body">{txt.setupCondo}</span>
                  </div>
                  <span className="text-caption text-text-secondary mt-1 truncate block">
                    {language === 'zh' ? '公寓 (商业直流快充)' : 'Public DC (Fast Charging)'}
                  </span>
                </button>
              </div>
            </section>

            {/* Section 3: Monthly Mileage */}
            <section className="bg-surface-base border border-border-subtle rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-body font-semibold text-text-primary">{txt.monthlyMileageTitle}</span>
                <div className="flex items-baseline space-x-1">
                  <input 
                    type="number" 
                    value={mileage}
                    onChange={e => setMileage(Math.max(0, Number(e.target.value)))}
                    className="bg-transparent text-xl sm:text-2xl font-display font-bold tabular-nums text-text-primary w-20 text-right outline-none"
                  />
                  <span className="text-caption text-text-secondary font-medium">{txt.mileageUnit}</span>
                </div>
              </div>
              <div className="flex space-x-1.5 pt-0.5">
                {[800, 1200, 1500, 2000].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMileage(m)}
                    className={`flex-1 py-1.5 px-2 text-caption rounded-lg border font-medium transition-colors text-center ${
                      mileage === m
                        ? 'bg-brand-primary text-text-inverse border-brand-primary font-bold shadow-xs'
                        : 'bg-surface-overlay border-border-subtle text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {m} km
                  </button>
                ))}
              </div>
            </section>

            {/* Section 4: Home Electricity */}
            <section className="bg-surface-base border border-border-subtle rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-xs">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-body font-semibold text-text-primary">{txt.homeElectricityTitle}</div>
                  <div className="text-[11px] text-text-secondary mt-0.5 font-mono">
                    {homeDisplayMode === 'kwh'
                      ? `(≈ RM ${currentTnbBill.totalAmount.toFixed(0)} / ${language === 'zh' ? '月' : 'mo'})`
                      : `(≈ ${baselineKwh} kWh / ${language === 'zh' ? '月' : 'mo'})`}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-baseline space-x-1">
                    {homeDisplayMode === 'rm' && <span className="text-caption text-text-secondary font-semibold">RM</span>}
                    {homeDisplayMode === 'kwh' ? (
                      <input 
                        type="number" 
                        value={baselineKwh}
                        onChange={e => setBaselineKwh(Math.max(0, Number(e.target.value)))}
                        className="bg-transparent text-xl sm:text-2xl font-display font-bold tabular-nums text-text-primary w-20 text-right outline-none"
                      />
                    ) : (
                      <input 
                        type="number" 
                        value={localRmValue}
                        onChange={e => {
                          setLocalRmValue(e.target.value);
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0) {
                            setBaselineKwh(estimateKwhFromTnbBill(val));
                          }
                        }}
                        className="bg-transparent text-xl sm:text-2xl font-display font-bold tabular-nums text-text-primary w-20 text-right outline-none"
                      />
                    )}
                    {homeDisplayMode === 'kwh' && <span className="text-caption text-text-secondary font-medium">kWh</span>}
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleDisplayMode}
                    className="p-1.5 bg-surface-overlay border border-border-subtle rounded-md text-text-secondary hover:text-text-primary active:scale-95 transition-all"
                    title={language === 'zh' ? '切换 kWh 与 RM 账单' : 'Toggle kWh / RM'}
                  >
                    <ArrowLeftRight size={13} />
                  </button>
                </div>
              </div>

              {/* Quick bill chips */}
              <div className="flex space-x-1.5 pt-1">
                {[
                  { rm: 120, kwh: 380, label: 'RM 120' },
                  { rm: 180, kwh: 501, label: 'RM 180' },
                  { rm: 280, kwh: 680, label: 'RM 280' },
                  { rm: 450, kwh: 920, label: 'RM 450' }
                ].map(item => (
                  <button
                    key={item.rm}
                    type="button"
                    onClick={() => {
                      setBaselineKwh(item.kwh);
                      setLocalRmValue(item.rm.toString());
                    }}
                    className={`flex-1 py-1.5 px-1 text-caption rounded-lg border font-medium transition-colors text-center ${
                      Math.abs(currentTnbBill.totalAmount - item.rm) < 30
                        ? 'bg-brand-primary text-text-inverse border-brand-primary font-bold shadow-xs'
                        : 'bg-surface-overlay border-border-subtle text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Section 5: Current Petrol Spend */}
            <section className="bg-surface-base border border-border-subtle rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
              <div className="flex justify-between items-center">
                <div className="text-body font-semibold text-text-primary">{txt.monthlyPetrolTitle}</div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-caption text-text-secondary font-semibold">RM</span>
                  <input 
                    type="number" 
                    value={petrolRm}
                    onChange={e => setPetrolRm(Math.max(0, Number(e.target.value)))}
                    className="bg-transparent text-xl sm:text-2xl font-display font-bold tabular-nums text-text-primary w-20 text-right outline-none"
                  />
                </div>
              </div>
              <div className="flex space-x-1.5 pt-1">
                {[150, 200, 300, 450].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPetrolRm(p)}
                    className={`flex-1 py-1.5 px-2 text-caption rounded-lg border font-medium transition-colors text-center ${
                      petrolRm === p
                        ? 'bg-brand-primary text-text-inverse border-brand-primary font-bold shadow-xs'
                        : 'bg-surface-overlay border-border-subtle text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    RM {p}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Sticky Bottom Bar (Constrained to app-container) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background-default/90 backdrop-blur-md border-t border-border-subtle px-4 py-3 pb-[calc(14px+env(safe-area-inset-bottom))]">
        <div className="app-container flex justify-between items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-12 h-12 shrink-0 flex items-center justify-center bg-surface-overlay border border-border-subtle rounded-xl text-text-secondary hover:text-text-primary hover:border-brand-primary active:scale-95 transition-all shadow-xs"
            aria-label={language === 'zh' ? '参数设置' : 'Settings'}
          >
            <Settings size={20} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onCalculate}
            className="flex-1 h-12 bg-brand-primary text-text-inverse font-semibold rounded-xl px-5 flex justify-center items-center space-x-2 active:scale-[0.99] shadow-md hover:opacity-95 transition-all text-body"
          >
            <span>{txt.calculateBtn}</span>
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <AdvancedDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <VehiclePickerSheet
        isOpen={isVehiclePickerOpen}
        onClose={() => setIsVehiclePickerOpen(false)}
        type="ev"
        selectedId={selectedPresetId}
        onSelectEv={(p) => {
          setPreset(p.id);
          setIsEditingModel(false);
          setTempModelName(p.name);
        }}
        language={language}
      />
    </div>
  );
}
