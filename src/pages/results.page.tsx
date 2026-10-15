import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { useDesktopDisclosure } from '../hooks/useDesktopDisclosure';
import { useCalculatorStore } from '../stores/calculator.store';
import { calculateAllEvMetrics } from '../utils/tnbTariff';
import { UserInputs } from '../types/calculator';
import { IceResultsSection } from '../components/IceResultsSection';
import { AppHeader } from '../components/DrivingForm';
import { EvResultSheets } from '../components/EvResultSheets';
import { MonthlyDecision } from '../components/MonthlyDecision';
import { evCalcTranslations } from '../i18n/evCalcTranslations';

export default function ResultsPage({ onBack = () => {} }: { onBack?: () => void }) {
  const store = useCalculatorStore();
  const disclosureRef = useDesktopDisclosure();
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
    isTouEnabled: false,
    touOffPeakRateSen: 28.0
  }), [store]);

  const resultA = useMemo(() => calculateAllEvMetrics(inputsA), [inputsA]);

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

  const [copyError, setCopyError] = useState(false);
  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(generateReportText());
      setCopied(true); setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopyError(true); }
  };

  if (store.vehicleType === 'ice') {
    return <div className="driving-app"><AppHeader onBack={onBack} /><main id="main-content" tabIndex={-1} className="results-content ice-results"><IceResultsSection /><button type="button" className="secondary-button" onClick={onBack}>{store.language === 'zh' ? '修改输入，重新计算' : 'Edit inputs and recalculate'}</button></main></div>;
  }
  const zh = store.language === 'zh';
  return (
    <div className="driving-app">
      <AppHeader onBack={onBack} />
      <main id="main-content" tabIndex={-1} className="results-content ev-results">
        <MonthlyDecision result={resultA} />
        {store.baselineBillRm !== null && Math.abs(store.baselineBillRm - resultA.baselineBill.totalAmount) > 0.1 && <p className="field-hint" role="status">{zh ? `本结果采用估算用电量 ${store.baselineKwh.toFixed(1)} kWh。输入电费为 RM ${store.baselineBillRm.toFixed(2)}，模型电费为 RM ${resultA.baselineBill.totalAmount.toFixed(2)}；请使用账单上的 kWh，以提高准确度。` : `This result uses an estimated ${store.baselineKwh.toFixed(1)} kWh. Your entered bill is RM ${store.baselineBillRm.toFixed(2)}; the model bill is RM ${resultA.baselineBill.totalAmount.toFixed(2)}. Use the kWh on your bill for a more accurate result.`}</p>}
        <details ref={disclosureRef} className="result-details"><summary>{zh ? '查看明细与其他工具' : 'Details and other tools'}</summary>
          <h3>{zh ? '保持相同用车习惯' : 'If your routine stays the same'}</h3>
          <dl className="cost-breakdown projection-breakdown">
            <div><dt>{zh ? '一年能源开支差额' : 'One-year energy savings'}</dt><dd>RM {resultA.yearlyNetSavings.toFixed(2)}</dd></div>
            <div><dt>{zh ? '五年能源开支差额' : 'Five-year energy savings'}</dt><dd>RM {resultA.fiveYearNetSavings.toFixed(2)}</dd></div>
            <div><dt>{zh ? '五年差额，含路税' : 'Five-year savings with road tax'}</dt><dd>RM {resultA.fiveYearTcoWithRoadTaxSavings.toFixed(2)}</dd></div>
          </dl>
          <p className="field-hint">{zh ? '负数表示多花的钱。假设里程、收费与电价保持不变；不含车价或保养。' : 'Negative savings mean extra spending. Assumes the same distance, rates and tariff throughout; excludes purchase price and servicing.'}</p>
          <div className="detail-links">
            <button type="button" onClick={() => setActiveSheet('waterfall-tnb')}>{zh ? '家庭电费与 TNB 明细' : 'Household bill and TNB breakdown'}<span>→</span></button>
            <button type="button" onClick={() => setActiveSheet('roadtax')}>{zh ? '路税对比' : 'Compare road tax'}<span>→</span></button>
          </div>
          <h3>{zh ? '进一步比较' : 'Explore further'}</h3>
          <div className="detail-links">
            <button type="button" onClick={() => setActiveSheet('comparator')}>{zh ? '与其他车型比较' : 'Compare another car'}<span>→</span></button>
            <button type="button" onClick={() => setActiveSheet('trip')}>{zh ? '分摊长途充电费' : 'Split road trip costs'}<span>→</span></button>
          </div>
        </details>
        <div className="result-actions"><button type="button" className="primary-button" onClick={onBack}>{zh ? '修改输入，重新计算' : 'Edit inputs and recalculate'}</button><button type="button" className="secondary-button" onClick={handleCopyReport}>{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? (zh ? '已复制报告' : 'Report copied') : (zh ? '复制报告' : 'Copy report')}</button><p role="status">{copyError ? (zh ? '无法复制。请允许浏览器访问剪贴板后重试。' : 'Could not copy. Allow clipboard access and try again.') : ''}</p></div>
      </main>

      <EvResultSheets inputsA={inputsA} resultA={resultA} activeSheet={activeSheet} onClose={() => setActiveSheet(null)} />
    </div>
  );
}
