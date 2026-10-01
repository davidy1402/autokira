import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Info, Zap, ArrowRightLeft, ShieldCheck, MapPin, Share2, Sparkles, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { UserInputs, EvCalculationResult, VehiclePreset } from '../types/calculator';
import { POPULAR_EV_PRESETS } from '../constants/presets';
import { calculateAllEvMetrics } from '../utils/tnbTariff';
import { calculateEvRoadTax, calculatePetrolRoadTax } from '../utils/roadTax';
import { formatRm } from '../utils/formatter';
import { useLanguage } from '../i18n/LanguageContext';
import { AdvancedDrawer } from './AdvancedDrawer';
import confetti from 'canvas-confetti';

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

interface ResultsPageProps {
  inputs: UserInputs;
  result: EvCalculationResult;
  onBack: () => void;
  onChange: (patch: Partial<UserInputs>) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  inputs,
  result,
  onBack,
  onChange
}) => {
  const { t } = useLanguage();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRoadTaxDetailsOpen, setIsRoadTaxDetailsOpen] = useState(false);
  const [isThresholdDetailsOpen, setIsThresholdDetailsOpen] = useState(false);

  // Comparator Car B Selection
  const defaultPresetB = useMemo(() => {
    const isEmas7 = inputs.modelName.toLowerCase().includes('emas 7') || inputs.modelName.toLowerCase().includes('e.mas 7');
    return isEmas7
      ? POPULAR_EV_PRESETS.find((p) => p.id === 'byd-atto3') || POPULAR_EV_PRESETS[2]
      : POPULAR_EV_PRESETS.find((p) => p.id === 'emas-7') || POPULAR_EV_PRESETS[0];
  }, [inputs.modelName]);

  const [carBPreset, setCarBPreset] = useState<VehiclePreset>(defaultPresetB);

  const inputsB = useMemo<UserInputs>(() => {
    return {
      ...inputs,
      modelName: carBPreset.name,
      consumptionKwhPer100Km: carBPreset.consumptionKwhPer100Km,
      motorPowerKw: carBPreset.motorPowerKw,
      batteryCapacityKwh: carBPreset.batteryCapacityKwh
    };
  }, [inputs, carBPreset]);

  const resultB = useMemo(() => calculateAllEvMetrics(inputsB), [inputsB]);

  const isPositive = result.monthlyNetSavings >= 0;
  const fiveYearSavingsDiff = Math.round((resultB.fiveYearTcoWithRoadTaxSavings - result.fiveYearTcoWithRoadTaxSavings) * 100) / 100;

  useEffect(() => {
    if (isPositive && result.monthlyNetSavings > 15) {
      try {
        confetti({
          particleCount: 26,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6']
        });
      } catch (e) {
        /* ignore */
      }
    }
  }, [inputs.modelName]);

  // Road tax calculations
  const evMotorKw = inputs.motorPowerKw || 160;
  const petrolCc = inputs.petrolEngineCc || 1500;
  const evRoadTaxInfo = calculateEvRoadTax(evMotorKw);
  const petrolRoadTaxInfo = calculatePetrolRoadTax(petrolCc);

  // Travel route calculations
  const fullBatteryKwh = inputs.batteryCapacityKwh || 60.22;
  const fullChargeCostHome = result.singleFullChargeMarginalCost;
  const fullChargeCostPublic = Math.round(fullBatteryKwh * (inputs.publicDcPricePerKwh || 1.40) * 100) / 100;

  const trips = [
    {
      name: t.cost100km.commuteTrip,
      distance: 50,
      petrolCost: (50 / 100) * result.petrolCostPer100Km,
      evCost: (50 / 100) * result.evCostPer100Km
    },
    {
      name: t.cost100km.jbKlTrip,
      distance: 330,
      petrolCost: (330 / 100) * result.petrolCostPer100Km,
      evCost: (330 / 100) * result.evCostPer100Km
    },
    {
      name: t.cost100km.klPenangTrip,
      distance: 350,
      petrolCost: (350 / 100) * result.petrolCostPer100Km,
      evCost: (350 / 100) * result.evCostPer100Km
    }
  ];

  const tnbCombined = result.newCombinedBill;
  const tnbBaseline = result.baselineBill;

  return (
    <div className="relative min-h-[100dvh] bg-background-default text-text-primary pb-[calc(90px+env(safe-area-inset-bottom))]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-subtle bg-background-default/90 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface-overlay text-text-secondary hover:text-text-primary active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-text-primary">
              {t.verdict.tag}
            </h1>
            <span className="text-[10px] text-text-secondary block">
              {inputs.modelName} ({inputs.chargingMode === 'home_only' ? '100% 纯家充' : '90% 家充 + 10% 外充'})
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-overlay px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-brand-primary active:scale-95"
        >
          <Share2 size={14} />
          <span>{t.navbar.share}</span>
        </button>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 pt-4 sm:px-6 space-y-6">
        {/* Section 1: Financial Verdict Hero */}
        <section id="verdict" className="space-y-4">
          <div className="rounded-2xl border border-border-subtle bg-surface-base p-5 sm:p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-text-secondary">
              <Sparkles size={14} className="text-brand-primary" />
              <span>{t.verdict.totalExpenseSub}</span>
            </div>

            {/* Giant CountUp Savings */}
            <div>
              <div className={`text-4xl sm:text-5xl font-display font-bold tracking-tight ${isPositive ? 'text-brand-primary' : 'text-status-error'}`}>
                {isPositive ? '+' : '−'}RM <CountUp to={Math.abs(result.monthlyNetSavings)} />
                <span className="text-xs sm:text-sm font-sans font-normal text-text-secondary ml-1.5">/ 月 (Monthly)</span>
              </div>
            </div>

            {/* 1-Yr, 5-Yr, TCO badges */}
            <div className="grid grid-cols-3 divide-x divide-border-subtle border-t border-border-subtle pt-4 text-center">
              <div>
                <span className="text-[11px] text-text-secondary block">1 年累计净省</span>
                <span className="font-display text-sm sm:text-base font-bold text-text-primary mt-0.5 block">
                  {formatRm(result.yearlyNetSavings)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-text-secondary block">5 年电费省下</span>
                <span className="font-display text-sm sm:text-base font-bold text-text-primary mt-0.5 block">
                  {formatRm(result.fiveYearNetSavings)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-brand-accent block font-semibold">5年TCO(含路税)</span>
                <span className="font-display text-sm sm:text-base font-bold text-brand-accent mt-0.5 block">
                  {formatRm(result.fiveYearTcoWithRoadTaxSavings)}
                </span>
              </div>
            </div>
          </div>

          {/* Waterfall Breakdown Card */}
          <div className="rounded-2xl border border-border-subtle bg-surface-base p-4 space-y-2.5 text-xs shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-text-primary border-b border-border-subtle pb-2">
              <CheckCircle2 size={15} className="text-brand-primary" />
              <span>收支对冲计算明细 (Waterfall Breakdown)</span>
            </div>

            <div className="space-y-1.5 text-text-secondary divide-y divide-border-subtle/60 font-display">
              <div className="flex items-center justify-between pt-1">
                <span className="font-sans">当前每月燃油支出 (彻底免除)</span>
                <span className="font-bold text-text-primary">{formatRm(inputs.fatherPetrolCostRm)}</span>
              </div>
              <div className="flex items-center justify-between pt-1.5">
                <span className="font-sans">− 家庭电费每月增加 (TNB 增量)</span>
                <span className="text-text-primary">−{formatRm(result.marginalHomeElectricityCost)}</span>
              </div>
              {inputs.chargingMode === 'mixed' && (
                <div className="flex items-center justify-between pt-1.5">
                  <span className="font-sans">− 商业直流快充开销 (10% 外充)</span>
                  <span className="text-text-primary">−{formatRm(result.publicChargingCost)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle font-bold text-sm text-text-primary">
                <span className="font-sans text-brand-primary">＝ 每月最终净省 (Net Savings)</span>
                <span className="text-brand-primary">{formatRm(result.monthlyNetSavings)}</span>
              </div>
            </div>
          </div>

          {/* Jump Anchor Nav Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: '双车对比 (Comparator)', id: 'comparator' },
              { label: '100km & 路线 (Routes)', id: 'routes' },
              { label: '2026 路税 (Road Tax)', id: 'roadtax' },
              { label: 'TNB 账单明细 (Audit)', id: 'tnb' }
            ].map((anchor) => (
              <button
                key={anchor.id}
                type="button"
                onClick={() => document.getElementById(anchor.id)?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full border border-border-subtle bg-surface-overlay px-3 py-1 text-[11px] font-medium text-text-secondary hover:text-text-primary active:scale-95"
              >
                {anchor.label} ↓
              </button>
            ))}
          </div>
        </section>

        {/* Section 2: Dual Car Comparator */}
        <section id="comparator" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <ArrowRightLeft size={16} className="text-brand-primary" />
              <span>{t.multiCar.title}</span>
            </h2>

            {fiveYearSavingsDiff !== 0 && (
              <span className="rounded-full bg-brand-primary/15 border border-brand-primary/30 px-2.5 py-0.5 text-[10px] font-bold text-brand-primary">
                {fiveYearSavingsDiff > 0
                  ? `${carBPreset.name} 5年多省 ${formatRm(fiveYearSavingsDiff)}`
                  : `${inputs.modelName} 5年多省 ${formatRm(Math.abs(fiveYearSavingsDiff))}`}
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-base p-4 space-y-3 shadow-sm">
            {/* Selector Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs border-b border-border-subtle pb-3">
              <div className="font-semibold text-text-secondary self-center">对比项目</div>
              <div className="text-center rounded-lg bg-surface-overlay p-2">
                <span className="text-[10px] text-brand-primary font-bold block">当前试驾车 (A)</span>
                <span className="font-bold text-text-primary truncate block">{inputs.modelName}</span>
              </div>
              <div>
                <select
                  value={carBPreset.id}
                  onChange={(e) => {
                    const found = POPULAR_EV_PRESETS.find((p) => p.id === e.target.value);
                    if (found) setCarBPreset(found);
                  }}
                  className="w-full h-full rounded-lg border border-border-subtle bg-surface-overlay p-2 text-center text-xs font-bold text-text-primary outline-none"
                >
                  {POPULAR_EV_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Metrics */}
            <div className="space-y-2 text-xs font-display divide-y divide-border-subtle/60">
              <div className="grid grid-cols-3 py-1">
                <span className="font-sans text-text-secondary">电机功率</span>
                <span className="text-center text-text-primary">{inputs.motorPowerKw || 160} kW</span>
                <span className="text-center text-text-primary">{carBPreset.motorPowerKw} kW</span>
              </div>

              <div className="grid grid-cols-3 py-1.5">
                <span className="font-sans text-text-secondary">2026 年路税</span>
                <span className="text-center text-brand-primary">RM {result.evRoadTaxAnnualRm}/年</span>
                <span className="text-center text-brand-primary">RM {resultB.evRoadTaxAnnualRm}/年</span>
              </div>

              <div className="grid grid-cols-3 py-1.5">
                <span className="font-sans text-text-secondary">百公里综合花费</span>
                <span className="text-center text-text-primary">{formatRm(result.evCostPer100Km)}</span>
                <span className="text-center text-text-primary">{formatRm(resultB.evCostPer100Km)}</span>
              </div>

              <div className="grid grid-cols-3 py-1.5">
                <span className="font-sans text-text-secondary">TNB 月度增量</span>
                <span className="text-center text-text-primary">+{formatRm(result.marginalHomeElectricityCost)}</span>
                <span className="text-center text-text-primary">+{formatRm(resultB.marginalHomeElectricityCost)}</span>
              </div>

              <div className="grid grid-cols-3 py-2 bg-surface-overlay/50 p-2 rounded-lg font-bold">
                <span className="font-sans text-brand-primary">每月净省</span>
                <span className="text-center text-brand-primary">{formatRm(result.monthlyNetSavings)}</span>
                <span className="text-center text-brand-primary">{formatRm(resultB.monthlyNetSavings)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: 100km & Travel Route Matrix */}
        <section id="routes" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <MapPin size={16} className="text-brand-primary" />
              <span>{t.cost100km.title}</span>
            </h2>
            <span className="text-xs font-display text-text-secondary">
              满电 ({fullBatteryKwh}kWh): 家充 {formatRm(fullChargeCostHome)}, 外充 {formatRm(fullChargeCostPublic)}
            </span>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-base p-4 space-y-3.5 shadow-sm">
            {/* Visual Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border-subtle bg-surface-overlay p-3 space-y-1.5">
                <div className="flex items-center justify-between text-text-secondary">
                  <span>燃油车 (14 km/L)</span>
                  <span className="font-display font-bold text-text-primary">{formatRm(result.petrolCostPer100Km)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-border-strong" />
              </div>

              <div className="rounded-xl border border-brand-primary/40 bg-surface-overlay p-3 space-y-1.5">
                <div className="flex items-center justify-between text-brand-primary">
                  <span>电车 (综合)</span>
                  <span className="font-display font-bold">{formatRm(result.evCostPer100Km)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-brand-primary" />
              </div>
            </div>

            {/* Travel Route Table */}
            <div className="overflow-x-auto no-scrollbar rounded-xl border border-border-subtle">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-overlay text-text-secondary border-b border-border-subtle">
                  <tr>
                    <th className="p-2.5 font-medium">出行场景</th>
                    <th className="p-2.5 text-right font-medium">燃油车</th>
                    <th className="p-2.5 text-right font-medium">电车</th>
                    <th className="p-2.5 text-right font-medium text-brand-primary">单趟省下</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/60 font-display text-text-primary">
                  {trips.map((trip) => {
                    const diff = Math.round((trip.petrolCost - trip.evCost) * 100) / 100;
                    return (
                      <tr key={trip.name}>
                        <td className="p-2.5 font-sans text-text-secondary">{trip.name}</td>
                        <td className="p-2.5 text-right text-text-disabled">{formatRm(trip.petrolCost)}</td>
                        <td className="p-2.5 text-right font-semibold">{formatRm(trip.evCost)}</td>
                        <td className="p-2.5 text-right font-bold text-brand-primary">+{formatRm(diff)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 4: 2026 Malaysia JPJ Official EV Road Tax */}
        <section id="roadtax" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-brand-primary" />
              <span>{t.roadTax.title}</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsRoadTaxDetailsOpen(!isRoadTaxDetailsOpen)}
              className="text-xs text-brand-primary font-medium hover:underline flex items-center gap-0.5"
            >
              <span>{isRoadTaxDetailsOpen ? '收起解读' : '政策解读'}</span>
              {isRoadTaxDetailsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-base p-4 space-y-3 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {/* Petrol Road Tax */}
              <div className="rounded-xl border border-border-subtle bg-surface-overlay p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-secondary">原燃油车路税</span>
                  <span className="font-display text-sm font-bold text-text-primary">
                    {formatRm(result.petrolRoadTaxAnnualRm)} / 年
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1500, 1800, 2000].map((cc) => (
                    <button
                      key={cc}
                      type="button"
                      onClick={() => onChange({ petrolEngineCc: cc })}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-display ${
                        petrolCc === cc
                          ? 'bg-brand-primary text-text-inverse font-bold'
                          : 'bg-surface-raised text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {cc}cc
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-text-secondary block truncate">
                  {petrolCc} cc ({petrolRoadTaxInfo.engineBand})
                </span>
              </div>

              {/* EV 2026 Road Tax */}
              <div className="rounded-xl border border-brand-primary/40 bg-surface-overlay p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-brand-primary">2026 新电车路税</span>
                  <span className="font-display text-sm font-bold text-brand-primary">
                    {formatRm(result.evRoadTaxAnnualRm)} / 年
                  </span>
                </div>
                <span className="text-[10px] text-text-secondary block truncate">
                  {evMotorKw} kW ({evRoadTaxInfo.powerBand})
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-surface-overlay p-2.5 text-xs text-text-secondary flex items-center justify-between flex-wrap gap-1">
              <span>{t.roadTax.taxDiffNote.replace('{diffVerb}', result.annualRoadTaxDifferenceRm >= 0 ? '少支出' : '多支出').replace('{amount}', formatRm(Math.abs(result.annualRoadTaxDifferenceRm)))}</span>
              <span className="font-display text-brand-primary font-semibold">5年差额: {formatRm(Math.abs(result.annualRoadTaxDifferenceRm * 5))}</span>
            </div>

            {isRoadTaxDetailsOpen && (
              <div className="space-y-2 pt-2 border-t border-border-subtle text-xs text-text-secondary leading-relaxed">
                <p>{t.roadTax.whyCheaperDesc}</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 5: Real TNB Bill Breakdown Audit */}
        <section id="tnb" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <Zap size={16} className="text-brand-accent" />
              <span>{t.tnb.title}</span>
            </h2>
            <span className="text-xs font-display text-text-secondary">
              总用电: <strong className="text-text-primary">{tnbCombined.kwh} kWh</strong>
            </span>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-base p-4 space-y-3 shadow-sm">
            {/* Threshold warning */}
            {tnbCombined.isOver600Threshold && !tnbBaseline.isOver600Threshold && (
              <div className="rounded-xl border border-status-warning/40 bg-status-warning/10 p-3 text-xs flex items-start gap-2 text-status-warning">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>
                  总用电量跨过 600 kWh 敏感线。TNB 恢复征收 RM 10 服务费与 AFA 燃油费，但家庭免除燃油开销后整体仍净省 {formatRm(result.monthlyNetSavings)}/月。
                </span>
              </div>
            )}

            {/* Audit Table */}
            <div className="overflow-x-auto no-scrollbar rounded-xl border border-border-subtle">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-overlay text-text-secondary border-b border-border-subtle">
                  <tr>
                    <th className="p-2.5 font-medium">TNB 账单项目</th>
                    <th className="p-2.5 text-right font-medium">买车前</th>
                    <th className="p-2.5 text-right font-medium">买车后</th>
                    <th className="p-2.5 text-right font-medium text-brand-primary">增量</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/60 font-display text-text-primary">
                  <tr>
                    <td className="p-2.5 font-sans text-text-secondary">基础电费 (44.43 sen)</td>
                    <td className="p-2.5 text-right">{tnbBaseline.baseEnergySubtotal.toFixed(2)}</td>
                    <td className="p-2.5 text-right">{tnbCombined.baseEnergySubtotal.toFixed(2)}</td>
                    <td className="p-2.5 text-right text-brand-primary">+{(tnbCombined.baseEnergySubtotal - tnbBaseline.baseEnergySubtotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans text-text-secondary">EEI 节能返现</td>
                    <td className="p-2.5 text-right">−{tnbBaseline.eeiRebateAmount.toFixed(2)}</td>
                    <td className="p-2.5 text-right">−{tnbCombined.eeiRebateAmount.toFixed(2)}</td>
                    <td className="p-2.5 text-right">{(tnbBaseline.eeiRebateAmount - tnbCombined.eeiRebateAmount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans text-text-secondary">Retail 服务费</td>
                    <td className="p-2.5 text-right">{tnbBaseline.retailCharge.toFixed(2)}</td>
                    <td className="p-2.5 text-right">{tnbCombined.retailCharge.toFixed(2)}</td>
                    <td className="p-2.5 text-right">+{(tnbCombined.retailCharge - tnbBaseline.retailCharge).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans text-text-secondary">AFA 燃油调整费</td>
                    <td className="p-2.5 text-right">{tnbBaseline.afaSurcharge.toFixed(2)}</td>
                    <td className="p-2.5 text-right">{tnbCombined.afaSurcharge.toFixed(2)}</td>
                    <td className="p-2.5 text-right">+{(tnbCombined.afaSurcharge - tnbBaseline.afaSurcharge).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans text-text-secondary">KWTBB 基金 (1.6%)</td>
                    <td className="p-2.5 text-right">{tnbBaseline.kwtbbFund.toFixed(2)}</td>
                    <td className="p-2.5 text-right">{tnbCombined.kwtbbFund.toFixed(2)}</td>
                    <td className="p-2.5 text-right">+{(tnbCombined.kwtbbFund - tnbBaseline.kwtbbFund).toFixed(2)}</td>
                  </tr>
                  <tr className="bg-surface-overlay/60 font-bold">
                    <td className="p-2.5 font-sans text-brand-primary">最终实付总额 (RM)</td>
                    <td className="p-2.5 text-right">{tnbBaseline.totalAmount.toFixed(2)}</td>
                    <td className="p-2.5 text-right">{tnbCombined.totalAmount.toFixed(2)}</td>
                    <td className="p-2.5 text-right text-brand-primary">+{result.marginalHomeElectricityCost.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 6: 600 kWh Threshold Escalation Deep-Dive */}
        <section id="threshold-explainer" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-status-warning" />
              <span>{t.threshold.title}</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsThresholdDetailsOpen(!isThresholdDetailsOpen)}
              className="text-xs text-brand-primary font-medium hover:underline flex items-center gap-0.5"
            >
              <span>{isThresholdDetailsOpen ? '收起解析' : '展开解析'}</span>
              {isThresholdDetailsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          {isThresholdDetailsOpen && (
            <div className="rounded-2xl border border-border-subtle bg-surface-base p-4 space-y-3 text-xs text-text-secondary leading-relaxed shadow-sm">
              <div className="space-y-1">
                <strong className="text-text-primary block font-semibold">{t.threshold.r1Title}</strong>
                <p>{t.threshold.r1Desc}</p>
              </div>
              <div className="space-y-1">
                <strong className="text-text-primary block font-semibold">{t.threshold.r2Title}</strong>
                <p>{t.threshold.r2Desc}</p>
              </div>
              <div className="space-y-1">
                <strong className="text-text-primary block font-semibold">{t.threshold.r3Title}</strong>
                <p>{t.threshold.r3Desc}</p>
              </div>
              <div className="rounded-xl bg-surface-overlay p-3 border border-border-subtle space-y-1">
                <strong className="text-brand-accent block font-semibold flex items-center gap-1">
                  <Clock size={14} />
                  <span>{t.threshold.touTitle}</span>
                </strong>
                <p>{t.threshold.touDesc}</p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-background-default/90 backdrop-blur-md p-3.5 pb-[calc(14px+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-xl items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-overlay px-4 text-xs font-semibold text-text-primary active:scale-95"
          >
            <ChevronLeft size={16} />
            <span>调整参数</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-1 h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 text-sm font-bold text-text-inverse shadow-md active:scale-[0.98]"
          >
            <Share2 size={16} />
            <span>导出并分享报告 (Share)</span>
          </button>
        </div>
      </div>

      {/* Advanced Settings & Share Drawer */}
      <AdvancedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        inputs={inputs}
        result={result}
        onChange={onChange}
      />
    </div>
  );
};
