import { useState, useEffect } from 'react';
import { Car, Pencil, X, Fuel, ShieldCheck, ChevronRight } from 'lucide-react';
import { useCalculatorStore } from '../stores/calculator.store';
import { ICE_PRESETS } from '../data/icePresets';
import { calculateIceRoadTax } from '../utils/iceCostCalculator';
import { VehiclePickerSheet } from './VehiclePickerSheet';

export function IceCockpitSection() {
  const {
    selectedIcePresetId, setIcePreset,
    iceModelName, setIceModelName,
    iceConsumptionL, setIceConsumptionL,
    icePriceRm, setIcePriceRm,
    iceEngineCc, setIceEngineCc,
    mileage, setMileage,
    iceFuelType, setIceFuelType,
    language
  } = useCalculatorStore();

  const [isEditingModel, setIsEditingModel] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempModelName, setTempModelName] = useState(iceModelName);
  const [displayUnit, setDisplayUnit] = useState<'l100km' | 'kml'>('l100km');

  const currentPreset = ICE_PRESETS.find(p => p.id === selectedIcePresetId);
  const isCustom = currentPreset
    ? Math.abs(iceConsumptionL - currentPreset.consumptionLPer100Km) > 0.05 || iceModelName !== currentPreset.name
    : true;

  useEffect(() => {
    setTempModelName(iceModelName);
  }, [iceModelName]);

  // Conversion calculations
  const kmPerL = Math.round((100 / Math.max(0.1, iceConsumptionL)) * 10) / 10;

  // Active fuel price
  const fuelPrice =
    iceFuelType === 'budi_madani'
      ? 1.99
      : iceFuelType === 'ron95'
      ? 2.05
      : iceFuelType === 'ron95_unsub'
      ? 2.60
      : iceFuelType === 'ron97'
      ? 3.19
      : 2.95;

  const senPerKm = ((iceConsumptionL * fuelPrice) / 100) * 100;
  const currentRoadTax = Math.round(calculateIceRoadTax(iceEngineCc || 1500));

  const fuelOptions = [
    { id: 'ron95', nameZh: 'RON95 津贴油', nameEn: 'RON95 Subsidised', price: 'RM 2.05' },
    { id: 'budi_madani', nameZh: 'BUDI MADANI', nameEn: 'BUDI MADANI', price: 'RM 1.99' },
    { id: 'ron95_unsub', nameZh: 'RON95 浮动预估', nameEn: 'RON95 Floating', price: 'RM 2.60' },
    { id: 'ron97', nameZh: 'RON97 市价油', nameEn: 'RON97 Market', price: 'RM 3.19' }
  ];

  return (
    <div className="space-y-3.5">
      {/* 1. Fuel Consumption Card */}
      <section className="bg-surface-base border border-border-subtle rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex justify-between items-center">
          <span className="text-body font-semibold text-text-primary">
            {language === 'zh' ? '百公里油耗' : 'Fuel Economy'}
          </span>
          <span className="text-caption font-mono text-brand-primary font-bold">
            ≈ {senPerKm.toFixed(1)} sen / km
          </span>
        </div>

        {/* Stepper & Numeric Input */}
        <div className="flex items-center justify-center space-x-5 py-1">
          <button 
            type="button"
            onClick={() => {
              if (displayUnit === 'l100km') {
                setIceConsumptionL(Math.max(2, Math.round((iceConsumptionL - 0.1) * 10) / 10));
              } else {
                const newKml = kmPerL + 0.5;
                setIceConsumptionL(Math.round((100 / newKml) * 10) / 10);
              }
            }}
            className="w-11 h-11 rounded-xl border border-border-subtle bg-surface-overlay flex items-center justify-center text-text-primary hover:border-brand-primary active:scale-95 transition-all text-xl font-bold select-none shrink-0"
            aria-label="Decrease"
          >
            -
          </button>

          <div className="flex flex-col items-center">
            <input
              type="number"
              step="0.1"
              min="2"
              max="30"
              value={displayUnit === 'l100km' ? iceConsumptionL : kmPerL}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val > 0) {
                  if (displayUnit === 'l100km') {
                    setIceConsumptionL(Math.round(val * 10) / 10);
                  } else {
                    setIceConsumptionL(Math.round((100 / val) * 10) / 10);
                  }
                }
              }}
              className="text-3xl font-display font-bold text-text-primary w-28 text-center tabular-nums bg-transparent outline-none focus:border-b-2 focus:border-brand-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setDisplayUnit(displayUnit === 'l100km' ? 'kml' : 'l100km')}
              className="text-caption text-text-secondary hover:text-text-primary font-medium mt-0.5 transition-colors cursor-pointer"
              title={language === 'zh' ? '点击切换单位' : 'Click to toggle unit'}
            >
              {displayUnit === 'l100km' ? `L / 100km (${kmPerL} km/L)` : `km / L (${iceConsumptionL} L/100km)`}
            </button>
          </div>

          <button 
            type="button"
            onClick={() => {
              if (displayUnit === 'l100km') {
                setIceConsumptionL(Math.min(30, Math.round((iceConsumptionL + 0.1) * 10) / 10));
              } else {
                const newKml = Math.max(1, kmPerL - 0.5);
                setIceConsumptionL(Math.round((100 / newKml) * 10) / 10);
              }
            }}
            className="w-11 h-11 rounded-xl border border-border-subtle bg-surface-overlay flex items-center justify-center text-text-primary hover:border-brand-primary active:scale-95 transition-all text-xl font-bold select-none shrink-0"
            aria-label="Increase"
          >
            +
          </button>
        </div>

        {/* Custom Model Name Remark (if customized or editing) */}
        {isCustom && (
          <div>
            {isEditingModel ? (
              <div className="flex items-center space-x-2 p-2 bg-surface-overlay border border-brand-primary rounded-xl text-caption">
                <Car size={15} className="text-brand-primary shrink-0" />
                <input
                  type="text"
                  value={tempModelName}
                  onChange={e => setTempModelName(e.target.value)}
                  placeholder={language === 'zh' ? '输入自定义车型备注' : 'e.g. Myvi 1.5 Custom'}
                  className="flex-1 bg-transparent text-text-primary outline-none text-caption"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      if (tempModelName.trim()) setIceModelName(tempModelName.trim());
                      setIsEditingModel(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (tempModelName.trim()) setIceModelName(tempModelName.trim());
                    setIsEditingModel(false);
                  }}
                  className="px-2.5 py-1 bg-brand-primary text-text-inverse rounded-lg font-medium text-caption hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
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
              <div className="flex items-center justify-between p-2 bg-brand-primary/10 border border-brand-primary/30 rounded-xl text-caption text-text-primary gap-2">
                <div className="flex items-center space-x-2 truncate">
                  <Car size={14} className="text-brand-primary shrink-0" />
                  <span className="truncate text-text-secondary text-caption">
                    {language === 'zh' ? '车型备注：' : 'Model: '}
                    <strong className="text-text-primary font-semibold">{iceModelName}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTempModelName(iceModelName);
                    setIsEditingModel(true);
                  }}
                  className="px-2 py-0.5 bg-surface-overlay border border-border-subtle hover:border-brand-primary text-text-primary rounded-lg font-medium shrink-0 hover:text-brand-primary active:scale-95 transition-all text-caption whitespace-nowrap flex items-center space-x-1"
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
            onClick={() => setIsPickerOpen(true)}
            className="w-full p-3 rounded-xl bg-surface-overlay border border-border-subtle hover:border-brand-primary active:scale-[0.99] transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <Car size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-body font-semibold text-text-primary truncate">
                  {iceModelName}
                </div>
                <div className="text-caption text-text-secondary truncate">
                  {currentPreset
                    ? `${currentPreset.consumptionLPer100Km} L/100km, ${currentPreset.engineCc}cc${currentPreset.tag ? `, ${currentPreset.tag}` : ''}`
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

      {/* 2. Fuel Grade & Subsidy Selector */}
      <section className="bg-surface-base border border-border-subtle rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-xs">
        <div className="flex justify-between items-center">
          <span className="text-body font-semibold text-text-primary flex items-center space-x-1.5">
            <Fuel size={16} className="text-brand-primary" strokeWidth={1.75} />
            <span>{language === 'zh' ? '燃油等级' : 'Fuel Grade'}</span>
          </span>
          <span className="text-caption font-mono font-bold text-text-primary">
            RM {fuelPrice.toFixed(2)} / L
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {fuelOptions.map(fuel => {
            const isSelected = iceFuelType === fuel.id;
            return (
              <button
                key={fuel.id}
                type="button"
                onClick={() => setIceFuelType(fuel.id as any)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-brand-primary/10 border-brand-primary text-text-primary shadow-xs font-semibold'
                    : 'bg-surface-overlay border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="text-caption truncate mr-1">
                  {language === 'zh' ? fuel.nameZh : fuel.nameEn}
                </span>
                <span className="font-mono text-caption font-bold text-brand-primary shrink-0">
                  {fuel.price}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Engine CC & Road Tax */}
      <section className="bg-surface-base border border-border-subtle rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1.5 text-body font-semibold text-text-primary">
            <ShieldCheck size={16} className="text-brand-accent" strokeWidth={1.75} />
            <span>{language === 'zh' ? '排量与官方路税' : 'Engine CC & Road Tax'}</span>
          </div>
          <span className="text-caption font-mono font-bold text-brand-primary">
            {language === 'zh' ? `年税: RM ${currentRoadTax}` : `Tax: RM ${currentRoadTax}/yr`}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <input
              type="number"
              step="50"
              value={iceEngineCc}
              onChange={e => setIceEngineCc(Math.max(500, Number(e.target.value)))}
              className="w-20 p-1.5 bg-surface-overlay border border-border-subtle rounded-lg text-text-primary font-display font-semibold tabular-nums text-caption text-center outline-none focus:border-brand-primary"
            />
            <span className="text-caption text-text-secondary">cc</span>
          </div>

          <div className="flex space-x-1">
            {[1000, 1300, 1500, 1800, 2000].map(cc => (
              <button
                key={cc}
                type="button"
                onClick={() => setIceEngineCc(cc)}
                className={`px-2 py-1 text-caption rounded-lg border font-medium transition-colors ${
                  iceEngineCc === cc
                    ? 'bg-brand-primary text-text-inverse border-brand-primary font-bold shadow-xs'
                    : 'bg-surface-overlay text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
              >
                {cc >= 1000 ? `${(cc / 1000).toFixed(1)}L` : `${cc}`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Monthly Distance & Car Price */}
      <section className="space-y-3.5">
        <div className="bg-surface-base border border-border-subtle rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-body font-semibold text-text-primary">
              {language === 'zh' ? '每月行驶里程' : 'Monthly Distance'}
            </span>
            <div className="flex items-baseline space-x-1">
              <input 
                type="number" 
                value={mileage}
                onChange={e => setMileage(Math.max(0, Number(e.target.value)))}
                className="bg-transparent text-xl sm:text-2xl font-display font-bold tabular-nums text-text-primary w-20 text-right outline-none"
              />
              <span className="text-caption text-text-secondary font-medium">km</span>
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
        </div>

        <div className="bg-surface-base border border-border-subtle rounded-2xl p-4 sm:p-5 flex justify-between items-center shadow-xs">
          <span className="text-body font-semibold text-text-primary">
            {language === 'zh' ? '新车落地价' : 'Car Purchase Price'}
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-caption text-text-secondary font-semibold">RM</span>
            <input 
              type="number" 
              step="1000"
              value={icePriceRm}
              onChange={e => setIcePriceRm(Math.max(0, Number(e.target.value)))}
              className="bg-transparent text-xl sm:text-2xl font-display font-bold tabular-nums text-text-primary w-24 text-right outline-none"
            />
          </div>
        </div>
      </section>

      {/* Vehicle Picker Bottom Sheet */}
      <VehiclePickerSheet
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        type="ice"
        selectedId={selectedIcePresetId}
        onSelectIce={(p) => {
          setIcePreset(p.id);
          setIsEditingModel(false);
          setTempModelName(p.name);
        }}
        language={language}
      />
    </div>
  );
}
