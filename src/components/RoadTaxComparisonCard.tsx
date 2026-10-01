import React, { useState } from 'react';
import { EvCalculationResult, UserInputs } from '../types/calculator';
import { formatRm } from '../utils/formatter';
import { calculateEvRoadTax, calculatePetrolRoadTax } from '../utils/roadTax';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck, ChevronDown, ChevronUp, FileText, CheckCircle2 } from 'lucide-react';

interface RoadTaxComparisonCardProps {
  inputs: UserInputs;
  result: EvCalculationResult;
  onChange?: (patch: Partial<UserInputs>) => void;
}

export const RoadTaxComparisonCard: React.FC<RoadTaxComparisonCardProps> = ({
  inputs,
  result,
  onChange
}) => {
  const { t } = useLanguage();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const evMotorKw = inputs.motorPowerKw || 160;
  const petrolCc = inputs.petrolEngineCc || 1500;

  const evRoadTaxInfo = calculateEvRoadTax(evMotorKw);
  const petrolRoadTaxInfo = calculatePetrolRoadTax(petrolCc);

  const isEvCheaper = result.annualRoadTaxDifferenceRm > 0;
  const diffVerb = isEvCheaper ? t.roadTax.diffCheaper : t.roadTax.diffPricier;

  return (
    <div className="doppelrand-shell">
      <div className="doppelrand-core space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <ShieldCheck size={16} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-ink">
                  {t.roadTax.title}
                </h3>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand border border-brand/20 whitespace-nowrap">
                  {t.roadTax.officialGovBadge}
                </span>
              </div>
              <p className="text-[11px] text-muted">
                {t.roadTax.sub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-muted btn-spring hover:border-line-strong hover:text-ink shadow-sm whitespace-nowrap"
          >
            <span>{isDetailsOpen ? '收起政策解读' : '查看政策解读'}</span>
            {isDetailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Petrol ICE Road Tax */}
          <div className="space-y-2.5 rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-oil block">
                  {t.roadTax.iceTitle}
                </span>
                <h4 className="text-xs font-semibold text-ink whitespace-nowrap">{petrolCc} cc ({petrolRoadTaxInfo.engineBand})</h4>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-bold text-oil whitespace-nowrap">
                  {formatRm(result.petrolRoadTaxAnnualRm)}
                </span>
                <span className="text-[10px] text-faint block">/ 年</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-muted pt-0.5">
              <span className="font-sans text-[11px] whitespace-nowrap">排量档位</span>
              <div className="flex items-center gap-1">
                {[1500, 1800, 2000].map((cc) => (
                  <button
                    key={cc}
                    type="button"
                    onClick={() => onChange?.({ petrolEngineCc: cc })}
                    className={`rounded px-2 py-0.5 text-[10px] font-medium btn-spring whitespace-nowrap ${
                      petrolCc === cc
                        ? 'bg-oil-soft text-oil border border-oil/30 font-bold'
                        : 'bg-paper text-muted hover:text-ink border border-line'
                    }`}
                  >
                    {cc}cc
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* EV 2026 Road Tax */}
          <div className="space-y-2.5 rounded-2xl border border-brand/35 bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">
                  {t.roadTax.evTitle}
                </span>
                <h4 className="text-xs font-semibold text-brand whitespace-nowrap">
                  {inputs.modelName} ({evMotorKw} kW, {evRoadTaxInfo.powerBand})
                </h4>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-bold text-brand whitespace-nowrap">
                  {formatRm(result.evRoadTaxAnnualRm)}
                </span>
                <span className="text-[10px] text-muted block">/ 年</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-muted pt-0.5">
              <span className="font-sans text-[11px] whitespace-nowrap">计算公式</span>
              <span className="text-brand font-sans text-[11px] font-semibold whitespace-nowrap">{evRoadTaxInfo.rateDescription}</span>
            </div>
          </div>
        </div>

        {/* Difference Summary */}
        <div className="rounded-xl bg-surface/90 p-3 text-xs text-ink leading-relaxed border border-line flex items-center justify-between flex-wrap gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} strokeWidth={2.25} className="text-brand shrink-0" />
            <span className="font-medium">
              {t.roadTax.taxDiffNote
                .replace('{diffVerb}', diffVerb)
                .replace('{amount}', formatRm(Math.abs(result.annualRoadTaxDifferenceRm)))}
            </span>
          </div>
          <span className="font-mono text-xs text-brand font-bold whitespace-nowrap">
            {t.roadTax.tco5yrImpact.replace('{amount}', formatRm(Math.abs(result.annualRoadTaxDifferenceRm * 5)))}
          </span>
        </div>

        {/* Policy Details Accordion */}
        {isDetailsOpen && (
          <div className="space-y-3 rounded-2xl border border-line bg-surface p-4 text-xs text-ink leading-relaxed shadow-sm">
            <div className="flex items-center gap-2 font-bold text-ink">
              <FileText size={15} strokeWidth={2} className="text-brand" />
              <span>{t.roadTax.whyCheaperTitle}</span>
            </div>
            <p className="text-muted">
              {t.roadTax.whyCheaperDesc}
            </p>

            <div className="overflow-x-auto no-scrollbar rounded-xl border border-line text-[11px]">
              <table className="w-full text-left min-w-[320px]">
                <thead className="bg-paper text-muted font-bold border-b border-line">
                  <tr>
                    <th className="p-2.5 whitespace-nowrap">功率档位 (kW)</th>
                    <th className="p-2.5 whitespace-nowrap">2026 新年费</th>
                    <th className="p-2.5 whitespace-nowrap">代表车型</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line font-mono text-ink">
                  <tr>
                    <td className="p-2.5 whitespace-nowrap">100.1 - 150 kW</td>
                    <td className="p-2.5 text-brand font-bold whitespace-nowrap">RM 80 - RM 160</td>
                    <td className="p-2.5 font-sans whitespace-nowrap">BYD Dolphin, Atto 3, Omoda E5</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 whitespace-nowrap">150.1 - 160 kW</td>
                    <td className="p-2.5 text-brand font-bold whitespace-nowrap">RM 180</td>
                    <td className="p-2.5 font-sans font-bold text-brand whitespace-nowrap">Proton e.MAS 7 (160 kW)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 whitespace-nowrap">200.1 - 210 kW</td>
                    <td className="p-2.5 text-brand font-bold whitespace-nowrap">RM 280</td>
                    <td className="p-2.5 font-sans whitespace-nowrap">Tesla Model 3 RWD (208 kW)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 whitespace-nowrap">310.1 - 410 kW</td>
                    <td className="p-2.5 text-oil font-bold whitespace-nowrap">RM 615 - RM 1,065</td>
                    <td className="p-2.5 font-sans whitespace-nowrap">BYD Seal Performance (390 kW)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
