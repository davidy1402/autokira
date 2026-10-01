import { useState } from 'react';
import { Fuel, Zap, Navigation, Users, Receipt, Copy, Check, Sparkles } from 'lucide-react';

export interface TripRoutePreset {
  id: string;
  nameZh: string;
  nameEn: string;
  distanceKm: number;
  estTollRm: number;
}

export const TRIP_ROUTE_PRESETS: TripRoutePreset[] = [
  { id: 'kl-penang', nameZh: 'KL ↔ 槟城', nameEn: 'KL ↔ Penang', distanceKm: 355, estTollRm: 43.5 },
  { id: 'kl-jb', nameZh: 'KL ↔ 新山', nameEn: 'KL ↔ JB', distanceKm: 330, estTollRm: 40.2 },
  { id: 'kl-ipoh', nameZh: 'KL ↔ 怡保', nameEn: 'KL ↔ Ipoh', distanceKm: 205, estTollRm: 24.6 },
  { id: 'kl-melaka', nameZh: 'KL ↔ 马六甲', nameEn: 'KL ↔ Melaka', distanceKm: 145, estTollRm: 18.4 },
  { id: 'kl-genting', nameZh: 'KL ↔ 云顶', nameEn: 'KL ↔ Genting', distanceKm: 55, estTollRm: 6.0 },
];

interface RoadTripSplitterCardProps {
  mode: 'ev' | 'ice';
  consumption: number; // L/100km for ICE, kWh/100km for EV
  modelName: string;
  fuelPriceOrRate: number; // RM/L for ICE, RM/kWh for EV
  language?: 'zh' | 'en';
}

export function RoadTripSplitterCard({
  mode,
  consumption,
  modelName,
  fuelPriceOrRate,
  language = 'zh'
}: RoadTripSplitterCardProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('kl-penang');
  const [distanceKm, setDistanceKm] = useState<number>(355);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(true);
  const [passengerCount, setPassengerCount] = useState<number>(4);
  const [includeToll, setIncludeToll] = useState<boolean>(true);
  const [tollFeeRm, setTollFeeRm] = useState<number>(43.5);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const validConsumption = Math.max(0.1, consumption);
  const effectiveDistance = Math.max(1, distanceKm) * (isRoundTrip ? 2 : 1);
  const energyRequired = (effectiveDistance * validConsumption) / 100;
  const totalEnergyCost = energyRequired * fuelPriceOrRate;
  const effectiveToll = includeToll ? tollFeeRm * (isRoundTrip ? 2 : 1) : 0;
  const grandTotalCost = totalEnergyCost + effectiveToll;
  const perPersonCost = grandTotalCost / Math.max(1, passengerCount);
  const perPersonEnergy = totalEnergyCost / Math.max(1, passengerCount);

  // Benchmarking EV savings against a typical petrol car (7.0 L/100km @ RM 2.05 RON95)
  const benchmarkPetrolCost = (effectiveDistance * 7.0 / 100) * 2.05;
  const evSavingsVsPetrol = benchmarkPetrolCost - totalEnergyCost;

  const currentRouteName =
    selectedRouteId === 'custom'
      ? (language === 'zh' ? '自定义路线' : 'Custom Route')
      : (TRIP_ROUTE_PRESETS.find(p => p.id === selectedRouteId)?.[language === 'zh' ? 'nameZh' : 'nameEn'] || `${distanceKm} km`);

  const handleSelectRoute = (preset: TripRoutePreset) => {
    setSelectedRouteId(preset.id);
    setDistanceKm(preset.distanceKm);
    setTollFeeRm(preset.estTollRm);
  };

  const generateShareText = () => {
    const tripTypeLabel = isRoundTrip
      ? (language === 'zh' ? `来回 ${effectiveDistance} km` : `Round Trip ${effectiveDistance} km`)
      : (language === 'zh' ? `单程 ${effectiveDistance} km` : `One Way ${effectiveDistance} km`);

    if (language === 'zh') {
      return `🚗【大马出游费用分摊 AA 账单】\n` +
        `📍 行程: ${currentRouteName} (${tripTypeLabel})\n` +
        `🚘 车型: ${modelName} (${mode === 'ev' ? '纯电快充' : '燃油'})\n` +
        `👥 乘车人数: ${passengerCount} 人\n\n` +
        `💰 费用明细:\n` +
        `• ${mode === 'ev' ? '充电花费' : '燃油开销'}: RM ${totalEnergyCost.toFixed(2)} (${energyRequired.toFixed(1)} ${mode === 'ev' ? 'kWh' : 'L'})\n` +
        (includeToll ? `• 高速过路费 (Toll): RM ${effectiveToll.toFixed(2)}\n` : '') +
        `• 本趟总支出: RM ${grandTotalCost.toFixed(2)}\n\n` +
        `👉 每人人均应付: RM ${perPersonCost.toFixed(2)} / 人\n` +
        (mode === 'ev' && evSavingsVsPetrol > 0
          ? `(⚡️ 纯电长途为全车比油车多省 RM ${evSavingsVsPetrol.toFixed(1)} 🎉)\n`
          : '') +
        `来自: 大马用车成本精算器`;
    }

    return `🚗 [Road Trip Expense AA Split]\n` +
      `📍 Route: ${currentRouteName} (${tripTypeLabel})\n` +
      `🚘 Vehicle: ${modelName} (${mode === 'ev' ? 'EV DC Fast' : 'Petrol'})\n` +
      `👥 Passengers: ${passengerCount} pax\n\n` +
      `💰 Cost Breakdown:\n` +
      `• ${mode === 'ev' ? 'Charging' : 'Fuel'}: RM ${totalEnergyCost.toFixed(2)} (${energyRequired.toFixed(1)} ${mode === 'ev' ? 'kWh' : 'L'})\n` +
      (includeToll ? `• Highway Toll: RM ${effectiveToll.toFixed(2)}\n` : '') +
      `• Total Trip Cost: RM ${grandTotalCost.toFixed(2)}\n\n` +
      `👉 Split Per Person: RM ${perPersonCost.toFixed(2)} / pax\n` +
      (mode === 'ev' && evSavingsVsPetrol > 0
        ? `(⚡️ EV saved RM ${evSavingsVsPetrol.toFixed(1)} vs petrol car 🎉)\n`
        : '') +
      `Calculated via AutoKira`;
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <section id={mode === 'ev' ? 'ev-trip' : 'ice-trip'} className="bg-surface-base border border-border-subtle rounded-xl p-base space-y-4 shadow-xs">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center space-x-2">
          {mode === 'ev' ? (
            <Zap size={18} className="text-brand-accent shrink-0" strokeWidth={1.75} />
          ) : (
            <Fuel size={18} className="text-brand-primary shrink-0" strokeWidth={1.75} />
          )}
          <h3 className="text-body-lg text-text-primary font-semibold">
            {language === 'zh'
              ? (mode === 'ev' ? '长途出游电费与好友 AA 分摊' : '长途出游油费与好友 AA 分摊')
              : (mode === 'ev' ? 'EV Road Trip AA Cost Splitter' : 'Road Trip Petrol AA Splitter')}
          </h3>
        </div>

        <div className="flex items-center space-x-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsRoundTrip(false)}
            className={`px-2.5 py-1 text-caption rounded-md border font-medium transition-all ${
              !isRoundTrip
                ? 'bg-brand-primary text-text-inverse border-brand-primary font-semibold shadow-xs'
                : 'bg-surface-overlay text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            {language === 'zh' ? '单程' : 'One-Way'}
          </button>
          <button
            type="button"
            onClick={() => setIsRoundTrip(true)}
            className={`px-2.5 py-1 text-caption rounded-md border font-medium transition-all ${
              isRoundTrip
                ? 'bg-brand-primary text-text-inverse border-brand-primary font-semibold shadow-xs'
                : 'bg-surface-overlay text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            {language === 'zh' ? '来回往返' : 'Round-Trip'}
          </button>
        </div>
      </div>

      {/* Preset Route Chips */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-caption text-text-secondary flex items-center space-x-1">
            <Navigation size={13} strokeWidth={1.75} className="text-brand-primary" />
            <span>{language === 'zh' ? '大马热门自驾路线预设' : 'Malaysian Travel Corridors'}</span>
          </span>
          <span className="text-caption text-text-secondary/70">
            {language === 'zh' ? '点击秒填里程与过路费' : 'Quick select distance & toll'}
          </span>
        </div>
        <div className="flex overflow-x-auto gap-2 pb-1.5 hide-scrollbar">
          {TRIP_ROUTE_PRESETS.map(preset => {
            const isSelected = selectedRouteId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectRoute(preset)}
                className={`shrink-0 snap-start px-snug py-tight rounded-md border text-caption whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-brand-primary text-text-inverse border-brand-primary font-semibold shadow-xs'
                    : 'bg-surface-overlay border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                {language === 'zh' ? preset.nameZh : preset.nameEn}
                <span className="text-caption ml-1 opacity-80">({preset.distanceKm}km)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Distance Input */}
        <div className="p-2.5 bg-surface-overlay rounded-lg border border-border-subtle">
          <span className="text-caption text-text-secondary block mb-1">
            {language === 'zh' ? '单程距离 (公里)' : 'One-way Distance (km)'}
          </span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              value={distanceKm}
              onChange={e => {
                setSelectedRouteId('custom');
                setDistanceKm(Math.max(1, Number(e.target.value)));
              }}
              className="w-full bg-transparent text-body font-display font-semibold text-text-primary tabular-nums outline-none"
            />
            <span className="text-caption text-text-secondary">km</span>
          </div>
          <span className="text-caption text-text-secondary/80 block mt-0.5">
            {isRoundTrip ? (language === 'zh' ? `来回累计: ${effectiveDistance} km` : `Total: ${effectiveDistance} km`) : (language === 'zh' ? '单程核算' : 'One-way')}
          </span>
        </div>

        {/* Passenger Count */}
        <div className="p-2.5 bg-surface-overlay rounded-lg border border-border-subtle">
          <span className="text-caption text-text-secondary block mb-1">
            {language === 'zh' ? '同行乘车人数 (含司机)' : 'Passengers (incl. Driver)'}
          </span>
          <div className="flex items-center space-x-2">
            <Users size={16} strokeWidth={1.75} className="text-text-secondary shrink-0" />
            <input
              type="number"
              min="1"
              max="10"
              value={passengerCount}
              onChange={e => setPassengerCount(Math.max(1, Math.min(10, Number(e.target.value))))}
              className="w-full bg-transparent text-body font-display font-semibold text-text-primary tabular-nums outline-none"
            />
            <span className="text-caption text-text-secondary">{language === 'zh' ? '人' : 'pax'}</span>
          </div>
          <div className="flex space-x-1 mt-1">
            {[2, 3, 4, 5].map(cnt => (
              <button
                key={cnt}
                type="button"
                onClick={() => setPassengerCount(cnt)}
                className={`px-1.5 py-0.5 text-caption rounded border ${
                  passengerCount === cnt
                    ? 'border-brand-primary text-brand-primary font-bold bg-brand-primary/10'
                    : 'border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>

        {/* Toll Input */}
        <div className="p-2.5 bg-surface-overlay rounded-lg border border-border-subtle">
          <div className="flex justify-between items-center mb-1">
            <span className="text-caption text-text-secondary">
              {language === 'zh' ? '单程过路费 (Toll)' : 'One-way Toll Fee'}
            </span>
            <button
              type="button"
              onClick={() => setIncludeToll(!includeToll)}
              className="text-caption text-brand-accent hover:underline"
            >
              {includeToll ? (language === 'zh' ? '不计过路费' : 'Exclude') : (language === 'zh' ? '计入过路费' : 'Include')}
            </button>
          </div>
          <div className="flex items-center space-x-1.5">
            <Receipt size={16} strokeWidth={1.75} className="text-text-secondary shrink-0" />
            <span className="text-caption text-text-secondary">RM</span>
            <input
              type="number"
              step="0.1"
              disabled={!includeToll}
              value={includeToll ? tollFeeRm : 0}
              onChange={e => setTollFeeRm(Math.max(0, Number(e.target.value)))}
              className={`w-full bg-transparent text-body font-display font-semibold tabular-nums outline-none ${
                includeToll ? 'text-text-primary' : 'text-text-disabled line-through'
              }`}
            />
          </div>
          <span className="text-caption text-text-secondary/80 block mt-0.5">
            {includeToll
              ? (isRoundTrip
                  ? (language === 'zh' ? `来回 Toll: RM ${effectiveToll.toFixed(1)}` : `Round-trip Toll: RM ${effectiveToll.toFixed(1)}`)
                  : (language === 'zh' ? '单程 Toll' : 'One-way Toll'))
              : (language === 'zh' ? '已免除过路费' : 'Toll ignored')}
          </span>
        </div>
      </div>

      {/* Main Verdict Result Card */}
      <div className="p-4 bg-surface-overlay rounded-xl border border-brand-primary/40 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="text-caption text-brand-accent font-semibold uppercase tracking-wider">
              {language === 'zh' ? '好友 AA 分摊金额' : 'AA Split Per Person'}
            </div>
            <div className="text-h1 font-display font-bold text-brand-primary tabular-nums leading-tight">
              RM {perPersonCost.toFixed(2)}
              <span className="text-caption font-normal text-text-secondary ml-1.5">
                / {language === 'zh' ? `人 (${passengerCount}人均摊)` : `pax (${passengerCount} pax split)`}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-caption text-text-secondary block">
              {language === 'zh' ? '本趟全车总开销' : 'Total Group Expense'}
            </span>
            <span className="text-body-lg font-display font-bold text-text-primary tabular-nums">
              RM {grandTotalCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border-subtle/60 text-caption">
          <div>
            <span className="text-text-secondary text-caption block">
              {mode === 'ev' ? (language === 'zh' ? '充电总电费' : 'DC Charging') : (language === 'zh' ? '总汽油花费' : 'Fuel Spend')}
            </span>
            <span className="font-display font-semibold text-text-primary tabular-nums">
              RM {totalEnergyCost.toFixed(2)}
            </span>
            <span className="text-caption text-text-secondary block">
              ({language === 'zh' ? '人均' : 'per pax'} RM {perPersonEnergy.toFixed(1)})
            </span>
          </div>

          <div>
            <span className="text-text-secondary text-caption block">
              {language === 'zh' ? '过路费总额' : 'Total Toll'}
            </span>
            <span className="font-display font-semibold text-text-primary tabular-nums">
              RM {effectiveToll.toFixed(2)}
            </span>
            <span className="text-caption text-text-secondary block">
              ({language === 'zh' ? '人均' : 'per pax'} RM {(effectiveToll / Math.max(1, passengerCount)).toFixed(1)})
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-text-secondary text-caption block">
              {mode === 'ev' ? (language === 'zh' ? '百公里能耗基准' : 'Consumption') : (language === 'zh' ? '油耗与单价' : 'Fuel & Price')}
            </span>
            <span className="font-display font-medium text-text-primary tabular-nums block">
              {mode === 'ev'
                ? `${consumption.toFixed(1)} kWh/100km (@ RM ${fuelPriceOrRate.toFixed(2)})`
                : `${consumption.toFixed(1)} L/100km (@ RM ${fuelPriceOrRate.toFixed(2)})`}
            </span>
          </div>
        </div>

        {/* EV Comparison Highlight if EV */}
        {mode === 'ev' && evSavingsVsPetrol > 0 && (
          <div className="p-2.5 bg-brand-primary/10 border border-brand-primary/30 rounded-lg flex items-center space-x-2 text-caption text-brand-primary">
            <Sparkles size={16} strokeWidth={1.75} className="shrink-0" />
            <div className="leading-snug">
              {language === 'zh' ? (
                <>
                  同路线燃油车（按 7.0L/100km）约需 <strong>RM {benchmarkPetrolCost.toFixed(1)}</strong> 油费。
                  开纯电本趟为全车净省 <strong>RM {evSavingsVsPetrol.toFixed(1)}</strong> 能源费！
                </>
              ) : (
                <>
                  A comparable petrol car needs ~<strong>RM {benchmarkPetrolCost.toFixed(1)}</strong> fuel.
                  This EV saves your group <strong>RM {evSavingsVsPetrol.toFixed(1)}</strong>!
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Button: Copy Only */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleCopy}
          className="w-full px-4 py-2.5 bg-surface-overlay border border-border-subtle rounded-lg text-caption font-semibold text-text-primary hover:border-brand-primary active:scale-[0.99] transition-all flex items-center justify-center space-x-2 shadow-xs"
        >
          {copied ? <Check size={15} strokeWidth={2} className="text-status-positive" /> : <Copy size={15} strokeWidth={1.75} />}
          <span>{copied ? (language === 'zh' ? '已复制 AA 账单' : 'Copied!') : (language === 'zh' ? '复制 AA 账单' : 'Copy AA Breakdown')}</span>
        </button>
      </div>
    </section>
  );
}
