import { useState, useEffect } from 'react';
import { Car, Pencil, X, Fuel } from 'lucide-react';
import { useCalculatorStore } from '../stores/calculator.store';
import { ICE_PRESETS } from '../data/icePresets';
import { evCalcTranslations } from '../i18n/evCalcTranslations';

export function IceCockpitSection() {
  const {
    selectedIcePresetId, setIcePreset,
    iceModelName, setIceModelName,
    iceConsumptionL, setIceConsumptionL,
    icePriceRm, setIcePriceRm,
    mileage, setMileage,
    iceFuelType, setIceFuelType,
    language
  } = useCalculatorStore();

  const [isEditingModel, setIsEditingModel] = useState(false);
  const [tempModelName, setTempModelName] = useState(iceModelName);
  const [displayUnit, setDisplayUnit] = useState<'l100km' | 'kml'>('l100km');

  const currentPreset = ICE_PRESETS.find(p => p.id === selectedIcePresetId);
  const isCustom = currentPreset
    ? Math.abs(iceConsumptionL - currentPreset.consumptionLPer100Km) > 0.05 || iceModelName !== currentPreset.name
    : true;

  useEffect(() => {
    setTempModelName(iceModelName);
  }, [iceModelName]);

  const txt = evCalcTranslations[language] || evCalcTranslations.en;

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


  return (
    <div className="space-y-stack-md">
      {/* Fuel Consumption Card */}
      <section className="space-y-stack-md">
        <div className="flex justify-between items-center">
          <h2 className="text-body-lg text-text-primary font-semibold">{txt.iceJourneyTitle}</h2>
          <button
            type="button"
            onClick={() => setDisplayUnit(displayUnit === 'l100km' ? 'kml' : 'l100km')}
            className="text-[11px] px-2 py-0.5 rounded border border-border-subtle bg-surface-overlay text-text-secondary hover:text-text-primary transition-colors"
          >
            {displayUnit === 'l100km' ? '切至 km/L' : '切至 L/100km'}
          </button>
        </div>

        <div className="bg-surface-base border border-border-subtle rounded-xl p-base space-y-stack-md">
          <div className="flex justify-between items-center">
            <span className="text-body text-text-secondary">{txt.iceConsumptionLabel}</span>
            <span className="text-caption font-mono text-brand-accent font-semibold">
              ≈ {senPerKm.toFixed(1)} sen / km
            </span>
          </div>

          <div className="flex justify-center items-center space-x-loose">
            <button 
              type="button"
              onClick={() => {
                if (displayUnit === 'l100km') {
                  setIceConsumptionL(Math.max(2, Math.round((iceConsumptionL - 0.1) * 10) / 10));
                } else {
                  // increase km/l = decrease l/100km
                  const newKml = kmPerL + 0.5;
                  setIceConsumptionL(Math.round((100 / newKml) * 10) / 10);
                }
              }}
              className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center text-text-primary active:bg-surface-overlay active:scale-95 transition-all text-h3 select-none"
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
                className="text-h1 font-display text-text-primary w-28 text-center tabular-nums bg-transparent outline-none focus:border-b focus:border-brand-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[11px] text-text-secondary font-medium mt-0.5">
                {displayUnit === 'l100km' ? `L / 100km (${kmPerL} km/L)` : `km / L (${iceConsumptionL} L/100km)`}
              </span>
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
              className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center text-text-primary active:bg-surface-overlay active:scale-95 transition-all text-h3 select-none"
              aria-label="Increase"
            >
              +
            </button>
          </div>

          {/* Model Name Remark */}
          {isCustom && (
            <div className="pt-1">
              {isEditingModel ? (
                <div className="flex items-center space-x-2 p-2 bg-surface-overlay border border-brand-primary rounded-lg text-caption animate-fade-in">
                  <Car size={15} className="text-brand-primary shrink-0" />
                  <input
                    type="text"
                    value={tempModelName}
                    onChange={e => setTempModelName(e.target.value)}
                    placeholder={language === 'zh' ? '输入自定义车型备注，例如: Myvi 1.5 代步版' : 'e.g. Perodua Myvi 1.5'}
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
                        <>车型备注：<strong className="text-text-primary font-semibold">{iceModelName}</strong></>
                      ) : (
                        <>Model: <strong className="text-text-primary font-semibold">{iceModelName}</strong></>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTempModelName(iceModelName);
                      setIsEditingModel(true);
                    }}
                    className="px-2.5 py-1 bg-surface-overlay border border-border-subtle hover:border-brand-primary text-text-primary rounded font-medium shrink-0 hover:text-brand-primary active:scale-95 transition-all text-[11px] whitespace-nowrap flex items-center space-x-1 shadow-xs"
                  >
                    <Pencil size={11} />
                    <span>{language === 'zh' ? '修改' : 'Edit'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Popular ICE Presets Carousel */}
          <div className="flex overflow-x-auto space-x-tight pb-2 -mx-base px-base snap-x hide-scrollbar">
            {ICE_PRESETS.map(p => {
              const isSelected = selectedIcePresetId === p.id && !isCustom;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setIcePreset(p.id);
                    setIsEditingModel(false);
                    setTempModelName(p.name);
                  }}
                  className={`shrink-0 snap-start px-snug py-tight rounded-md border text-caption whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-brand-primary text-text-inverse border-brand-primary font-semibold'
                      : 'bg-surface-overlay border-border-subtle text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fuel Type & Price Selector */}
      <section className="bg-surface-base border border-border-subtle rounded-xl p-base space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-caption text-text-secondary flex items-center gap-1.5">
            <Fuel size={14} className="text-brand-primary" />
            <span>{txt.iceFuelPriceLabel}</span>
          </span>
          <span className="text-caption font-mono font-bold text-text-primary">
            RM {fuelPrice.toFixed(2)} / L
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-overlay rounded-lg border border-border-subtle">
          <button
            type="button"
            onClick={() => setIceFuelType('budi_madani')}
            className={`py-2 px-1.5 rounded-md font-medium transition-all text-center whitespace-nowrap text-[12px] sm:text-caption ${
              iceFuelType === 'budi_madani'
                ? 'bg-brand-primary text-text-inverse font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            BUDI MADANI (RM 1.99)
          </button>
          <button
            type="button"
            onClick={() => setIceFuelType('ron95')}
            className={`py-2 px-1.5 rounded-md font-medium transition-all text-center whitespace-nowrap text-[12px] sm:text-caption ${
              iceFuelType === 'ron95'
                ? 'bg-brand-primary text-text-inverse font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            RON95 统定价 (RM 2.05)
          </button>
          <button
            type="button"
            onClick={() => setIceFuelType('ron95_unsub')}
            className={`py-2 px-1.5 rounded-md font-medium transition-all text-center whitespace-nowrap text-[12px] sm:text-caption ${
              iceFuelType === 'ron95_unsub'
                ? 'bg-brand-primary text-text-inverse font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            RON95 浮动预估 (RM 2.60)
          </button>
          <button
            type="button"
            onClick={() => setIceFuelType('ron97')}
            className={`py-2 px-1.5 rounded-md font-medium transition-all text-center whitespace-nowrap text-[12px] sm:text-caption ${
              iceFuelType === 'ron97'
                ? 'bg-brand-primary text-text-inverse font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            RON97 市价 (RM 3.19)
          </button>
        </div>
      </section>


      {/* Monthly Mileage & Car Price */}
      <section className="space-y-stack-md">
        <div className="bg-surface-base border border-border-subtle rounded-xl p-base flex justify-between items-center">
          <div>
            <div className="text-caption text-text-secondary">{txt.monthlyMileageTitle}</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <input 
                type="number" 
                value={mileage}
                onChange={e => setMileage(Number(e.target.value))}
                className="bg-transparent text-h3 font-display tabular-nums text-text-primary w-24 outline-none"
              />
              <span className="text-body text-text-secondary">{txt.mileageUnit}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-caption text-text-secondary block">月预估油费</span>
            <span className="text-body-lg font-display font-bold text-text-primary tabular-nums">
              RM {(((mileage * iceConsumptionL) / 100) * fuelPrice).toFixed(0)}
            </span>
          </div>
        </div>

        <div className="bg-surface-base border border-border-subtle rounded-xl p-base flex justify-between items-center">
          <div>
            <div className="text-caption text-text-secondary">{txt.iceCarPriceLabel}</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-body text-text-secondary">RM</span>
              <input 
                type="number" 
                step="1000"
                value={icePriceRm}
                onChange={e => setIcePriceRm(Number(e.target.value))}
                className="bg-transparent text-h3 font-display tabular-nums text-text-primary w-28 outline-none"
              />
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-text-secondary block">5年车贷月供 (预估)</span>
            <span className="text-caption font-mono font-medium text-text-secondary">
              ~RM {((icePriceRm * 0.9 * (1 + 0.03 * 5)) / 60).toFixed(0)} / 月
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
