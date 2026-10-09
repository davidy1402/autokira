import type { EvCalculationResult } from '../types/calculator';
import { useCalculatorStore } from '../stores/calculator.store';

export function MonthlyDecision({ result }: { result: EvCalculationResult }) {
  const s = useCalculatorStore();
  const zh = s.language === 'zh';
  const amount = Math.abs(result.monthlyNetSavings).toFixed(2);
  const conclusion = Math.abs(result.monthlyNetSavings) < 0.01
    ? (zh ? '每月能源开支基本持平。' : 'Your monthly energy spending is about the same.')
    : result.monthlyNetSavings > 0
    ? (zh ? `每月可能节省约 RM ${amount}。` : `You may save about RM ${amount} each month.`)
    : (zh ? `每月可能多花约 RM ${amount}。` : `You may spend about RM ${amount} more each month.`);
  const maxCost = Math.max(s.petrolRm, result.totalEvChargingCost, 1);
  return <>
    <section className="monthly-conclusion"><p className="intro-context">{s.modelName} · {s.mileage.toLocaleString()} {zh ? 'km / 月' : 'km / month'}</p><h1>{conclusion}</h1>
      <p>{s.mode === 'condo'
        ? (zh ? `全部使用公共充电，按 RM ${s.advanced.publicDcRate.toFixed(2)} / kWh 计算。` : `All charging is at public chargers, using RM ${s.advanced.publicDcRate.toFixed(2)} per kWh.`)
        : (zh ? '以 90% 家充和 10% 公共充电计算。家充费用按家庭电费的实际增量估算。' : 'Based on 90% home charging and 10% public charging. Home charging uses the increase in your household bill.')}</p>
      <p className="scope-note">{zh ? '这里只比较能源开支。路税单独列出；不含车价、车贷、保险或保养。' : 'This compares energy spending. Road tax is shown separately; purchase price, loans, insurance and servicing are excluded.'}</p>
    </section>
    <section className="monthly-comparison"><h2>{zh ? '每月油费与充电费' : 'Petrol now, charging after'} </h2>
      {[{ label: zh ? '目前油费' : 'Current petrol spending', value: s.petrolRm, ev: false }, { label: zh ? '换车后充电费' : 'New charging spending', value: result.totalEvChargingCost, ev: true }].map(row => <div className="cost-row" key={row.label}><div><span>{row.label}</span><strong>RM {row.value.toFixed(2)}</strong></div><div className="cost-track"><div className={row.ev ? 'ev-bar' : 'petrol-bar'} style={{ width: `${row.value / maxCost * 100}%` }} /></div></div>)}
      <dl className="cost-breakdown"><div><dt>{zh ? '家充增加的电费' : 'Added home electricity'}</dt><dd>RM {result.marginalHomeElectricityCost.toFixed(2)}</dd></div><div><dt>{zh ? '公共充电费' : 'Public charging'}</dt><dd>RM {result.publicChargingCost.toFixed(2)}</dd></div></dl>
      <p className="field-hint">{zh ? '原本的家庭电费不是充电费，不会重复计算。' : 'Your existing household electricity bill is separate and is not counted as charging.'}</p>
    </section>
    <section className="decision-factors"><h2>{zh ? '哪些因素影响结果？' : 'What matters for your result?'}</h2>
      {s.mode === 'condo' ? <div><h3>{zh ? '公共充电的单价' : 'The public charger rate'}</h3><p>{zh ? `每月约需 ${result.evPublicChargingKwh.toFixed(1)} kWh，全部按充电站单价收费。` : `You need about ${result.evPublicChargingKwh.toFixed(1)} kWh each month, all billed at the charger rate.`}</p></div> : <div><h3>{result.crossed600Threshold ? (zh ? '家庭用电将超过 600 kWh' : 'Your home usage crosses 600 kWh') : (zh ? '家庭原有用电量' : 'Your existing home electricity use')}</h3><p>{zh ? `家庭用电由 ${result.baselineBill.kwh.toFixed(0)} 增至 ${result.newCombinedBill.kwh.toFixed(1)} kWh。${result.crossed600Threshold ? '现有电价模型会取消部分豁免，影响整张账单。' : '充电开支取决于增加的电费，而不是平均电价。'}` : `Home usage rises from ${result.baselineBill.kwh.toFixed(0)} to ${result.newCombinedBill.kwh.toFixed(1)} kWh. ${result.crossed600Threshold ? 'The tariff model removes some waivers, affecting the whole bill.' : 'Charging cost depends on the added bill, rather than the average electricity rate.'}`}</p></div>}
      <div><h3>{zh ? '你输入的里程与油费' : 'Your distance and current petrol spending'}</h3><p>{zh ? `结果将 ${s.mileage.toLocaleString()} km 的充电费与 RM ${s.petrolRm.toFixed(2)} 的油费比较。请确认两者代表相同的出行量。` : `This compares charging for ${s.mileage.toLocaleString()} km with RM ${s.petrolRm.toFixed(2)} of petrol. Check that both represent the same amount of driving.`}</p></div>
    </section>
  </>;
}
