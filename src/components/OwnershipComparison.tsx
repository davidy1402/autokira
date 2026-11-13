import { useId, useState } from 'react';

export function OwnershipComparison({ petrolMonthly, evMonthly, zh }: { petrolMonthly: number; evMonthly: number; zh: boolean }) {
  const id = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  const fields = [
    ['price', zh ? '购买价格' : 'Purchase price'],
    ['insurance', zh ? '每年保险' : 'Annual insurance'],
    ['service', zh ? '每年保养' : 'Annual servicing'],
    ['tax', zh ? '每年路税' : 'Annual road tax'],
    ['resale', zh ? '五年后预计转售价值' : 'Estimated resale value after five years'],
  ];
  const hasNegative = Object.values(values).some(value => value !== '' && Number(value) < 0);
  const valid = fields.every(([key]) => ['petrol', 'ev'].every(car => values[`${car}-${key}`] !== undefined && values[`${car}-${key}`] !== '' && Number.isFinite(Number(values[`${car}-${key}`])) && Number(values[`${car}-${key}`]) >= 0));
  const total = (car: string, energy: number) => Number(values[`${car}-price`]) - Number(values[`${car}-resale`]) + 5 * (Number(values[`${car}-insurance`]) + Number(values[`${car}-service`]) + Number(values[`${car}-tax`])) + energy * 60;
  const petrol = valid ? total('petrol', petrolMonthly) : 0;
  const ev = valid ? total('ev', evMonthly) : 0;
  return <details className="ownership-section"><summary>{zh ? '比较五年拥有成本' : 'Compare five-year ownership costs'}</summary>
    <p>{zh ? '加入你的价格与年度费用，估算两辆车五年的总成本。所有项目都需要填写；没有费用时填 0。' : 'Add your own prices and annual costs to estimate the cost of owning each car for five years. Complete every field; enter 0 where a cost does not apply.'}</p>
    <div className="ownership-columns">{(['petrol', 'ev'] as const).map(car => <fieldset key={car}><legend>{car === 'petrol' ? (zh ? '燃油车' : 'Petrol car') : (zh ? '电动车' : 'Electric car')}</legend>
      {fields.map(([key, label]) => <label key={key} htmlFor={`${id}-${car}-${key}`}>{label}<span className="ownership-input"><span>RM</span><input id={`${id}-${car}-${key}`} type="number" min="0" step="any" inputMode="decimal" aria-invalid={values[`${car}-${key}`] !== undefined && Number(values[`${car}-${key}`]) < 0} value={values[`${car}-${key}`] ?? ''} onChange={e => setValues({ ...values, [`${car}-${key}`]: e.target.value })} /></span></label>)}
    </fieldset>)}</div>
    {valid ? <div className="ownership-result" aria-live="polite"><h3>{zh ? '五年估算' : 'Estimated five-year cost'}</h3><dl><div><dt>{zh ? '燃油车' : 'Petrol car'}</dt><dd>RM {petrol.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd></div><div><dt>{zh ? '电动车' : 'Electric car'}</dt><dd>RM {ev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd></div></dl><p>{Math.abs(petrol - ev) < .01 ? (zh ? '两者估算成本相同。' : 'The estimated costs are equal.') : `${ev < petrol ? (zh ? '电动车' : 'Electric car') : (zh ? '燃油车' : 'Petrol car')} ${zh ? '预计少花' : 'estimated lower by'} RM ${Math.abs(petrol - ev).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`}</p></div> : <p className="field-hint">{hasNegative ? (zh ? '金额不能为负数。' : 'Amounts cannot be negative.') : (zh ? '填写所有金额后显示比较。' : 'Complete all amounts to see the comparison.')}</p>}
    <p className="field-hint">{zh ? '计算方式：车价减转售价，加五年能源、保险、保养和路税。能源费用沿用上方每月估算；假设费用不变。不含贷款利息、通行费、停车费或其他费用。' : 'Purchase price minus resale value, plus five years of energy, insurance, servicing and road tax. Energy uses the monthly estimates above; all costs are assumed constant. Loan interest, tolls, parking and other costs are excluded.'}</p>
  </details>;
}
