import { useState } from 'react';
import { Copy, X, Check, Sun, Moon, Globe, Sliders } from 'lucide-react';
import { useCalculatorStore } from '../stores/calculator.store';
import { calculateAllEvMetrics } from '../utils/tnbTariff';
import { evCalcTranslations } from '../i18n/evCalcTranslations';

interface AdvancedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedDrawer({ isOpen, onClose }: AdvancedDrawerProps) {
  const store = useCalculatorStore();
  const { advanced, updateAdvanced, language, setLanguage, theme, setTheme } = store;
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const txt = evCalcTranslations[language] || evCalcTranslations.en;
  const metrics = calculateAllEvMetrics({
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
  });

  const reportText = txt.reportSummary
    .replace('{model}', store.modelName)
    .replace('{consumption}', store.consumption.toFixed(1))
    .replace('{mileage}', store.mileage.toString())
    .replace('{petrol}', store.petrolRm.toFixed(2))
    .replace('{savings}', metrics.monthlyNetSavings.toFixed(2))
    .replace('{evCost}', metrics.totalEvChargingCost.toFixed(2))
    .replace('{tcoSavings}', metrics.fiveYearTcoWithRoadTaxSavings.toFixed(0));

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(reportText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-raised border-t border-border-subtle rounded-t-2xl shadow-floating pb-[calc(18px+env(safe-area-inset-bottom))] max-h-[88vh] flex flex-col">
        {/* Grab Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-border-strong rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders size={18} className="text-brand-primary" strokeWidth={2} />
            <h2 className="text-body font-bold text-text-primary">
              {language === 'zh' ? '偏好与精算参数' : 'Preferences & Settings'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-overlay active:scale-95 transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sheet Body */}
        <div className="px-5 py-4 overflow-y-auto flex-1 min-h-0 space-y-5">
          {/* Section 1: Display & Preferences (Language and Theme) */}
          <div className="space-y-3 bg-surface-overlay p-3.5 rounded-xl border border-border-subtle">
            <div className="text-caption font-semibold text-text-primary">
              {language === 'zh' ? '界面与显示偏好' : 'Display & Appearance'}
            </div>

            {/* Language Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-caption text-text-secondary">
                <Globe size={15} />
                <span>{language === 'zh' ? '界面语言' : 'Language'}</span>
              </div>
              <div className="flex bg-surface-base border border-border-subtle rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setLanguage('zh')}
                  className={`px-3 py-1 rounded-md text-caption font-medium transition-all ${
                    language === 'zh'
                      ? 'bg-brand-primary text-text-inverse font-semibold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  中文
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md text-caption font-medium transition-all ${
                    language === 'en'
                      ? 'bg-brand-primary text-text-inverse font-semibold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-caption text-text-secondary">
                {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
                <span>{language === 'zh' ? '外观模式' : 'Theme'}</span>
              </div>
              <div className="flex bg-surface-base border border-border-subtle rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 rounded-md text-caption font-medium flex items-center space-x-1 transition-all ${
                    theme === 'light'
                      ? 'bg-brand-primary text-text-inverse font-semibold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Sun size={13} />
                  <span>{language === 'zh' ? '浅色' : 'Light'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 rounded-md text-caption font-medium flex items-center space-x-1 transition-all ${
                    theme === 'dark'
                      ? 'bg-brand-primary text-text-inverse font-semibold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Moon size={13} />
                  <span>{language === 'zh' ? '深色' : 'Dark'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Advanced Actuarial Parameters */}
          <div className="space-y-3">
            <div className="text-caption font-semibold text-text-primary">
              {language === 'zh' ? '精算深度参数设置' : 'Actuarial Parameters'}
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center p-2.5 bg-surface-overlay rounded-lg border border-border-subtle">
                <div>
                  <div className="text-caption font-medium text-text-primary">{txt.petrolPriceLabel}</div>
                  <div className="text-[11px] text-text-secondary">
                    {language === 'zh' ? '大马 RON95 官方补贴油价' : 'Current RON95 subsidised price'}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-caption text-text-secondary font-semibold">RM</span>
                  <input
                    type="number"
                    value={advanced.petrolPrice}
                    onChange={(e) => updateAdvanced({ petrolPrice: Number(e.target.value) })}
                    className="w-16 bg-surface-base border border-border-subtle rounded-md px-2 py-1 text-right text-caption font-mono font-bold text-text-primary outline-none focus:border-brand-primary"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-surface-overlay rounded-lg border border-border-subtle">
                <div>
                  <div className="text-caption font-medium text-text-primary">{txt.fuelEconomyLabel}</div>
                  <div className="text-[11px] text-text-secondary">
                    {language === 'zh' ? '普通燃油家用车平均油耗' : 'Average petrol car fuel efficiency'}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={advanced.fuelEconomy}
                    onChange={(e) => updateAdvanced({ fuelEconomy: Number(e.target.value) })}
                    className="w-16 bg-surface-base border border-border-subtle rounded-md px-2 py-1 text-right text-caption font-mono font-bold text-text-primary outline-none focus:border-brand-primary"
                  />
                  <span className="text-caption text-text-secondary">km/L</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-surface-overlay rounded-lg border border-border-subtle">
                <div>
                  <div className="text-caption font-medium text-text-primary">{txt.chargingLossLabel}</div>
                  <div className="text-[11px] text-text-secondary">
                    {language === 'zh' ? '慢充过程热量损耗 (通常约 10%)' : 'AC to battery heat loss'}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={Math.round(advanced.chargingLoss * 100)}
                    onChange={(e) => updateAdvanced({ chargingLoss: Number(e.target.value) / 100 })}
                    className="w-16 bg-surface-base border border-border-subtle rounded-md px-2 py-1 text-right text-caption font-mono font-bold text-text-primary outline-none focus:border-brand-primary"
                  />
                  <span className="text-caption text-text-secondary">%</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-surface-overlay rounded-lg border border-border-subtle">
                <div>
                  <div className="text-caption font-medium text-text-primary">{txt.publicDcRateLabel}</div>
                  <div className="text-[11px] text-text-secondary">
                    {language === 'zh' ? '商用直流快充均价 (如 Gentari / JomCharge)' : 'Public DC fast charger average rate'}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-caption text-text-secondary font-semibold">RM</span>
                  <input
                    type="number"
                    value={advanced.publicDcRate}
                    onChange={(e) => updateAdvanced({ publicDcRate: Number(e.target.value) })}
                    className="w-16 bg-surface-base border border-border-subtle rounded-md px-2 py-1 text-right text-caption font-mono font-bold text-text-primary outline-none focus:border-brand-primary"
                    step="0.1"
                  />
                  <span className="text-caption text-text-secondary">/kWh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Share & Export */}
          <div className="pt-2 border-t border-border-subtle space-y-2.5">
            <h3 className="text-caption font-semibold text-text-primary">{txt.shareReportTitle}</h3>
            <div className="bg-surface-overlay p-3 rounded-lg border border-border-subtle text-caption text-text-secondary font-mono leading-relaxed max-h-32 overflow-y-auto">
              {reportText}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="w-full flex items-center justify-center space-x-1.5 bg-surface-overlay border border-border-subtle text-text-primary py-2.5 rounded-lg active:scale-[0.98] hover:border-brand-primary transition-all text-caption font-medium shadow-xs"
            >
              {isCopied ? <Check size={15} className="text-brand-primary" /> : <Copy size={15} />}
              <span>{isCopied ? txt.copied : txt.copyReport}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
