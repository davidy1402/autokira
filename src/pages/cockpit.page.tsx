import { useState } from 'react';
import { ArrowRight, Home, Building2, Check, Car, Gauge, SlidersHorizontal } from 'lucide-react';
import { useCalculatorStore } from '../stores/calculator.store';
import { calculateTnbBill, estimateKwhFromTnbBill } from '../utils/tnbTariff';
import { VehiclePickerSheet } from '../components/VehiclePickerSheet';
import { IceCockpitSection } from '../components/IceCockpitSection';
import { AppHeader, Assumptions, NumberField, PresetChips, VehicleSelection } from '../components/DrivingForm';

export default function CockpitPage({ onCalculate = () => {} }: { onCalculate?: () => void }) {
  const s = useCalculatorStore();
  const zh = s.language === 'zh';
  const [picker, setPicker] = useState(false);
  const [billUnit, setBillUnit] = useState<'rm' | 'kwh'>('rm');
  const bill = calculateTnbBill(s.baselineKwh);
  return <div className="driving-app"><AppHeader />
    <main id="main-content" className="decision-layout" tabIndex={-1}>
      <div className="decision-intro">
        <h1>{zh ? '算算每月用车开支' : 'Your monthly driving costs'}</h1>
        <p>{zh ? '选一辆车，按你的里程与充电习惯来算。' : 'Choose a car. Use your own distance and charging routine.'}</p>
        <div className="desktop-scenario">
          <h2>{zh ? '当前方案' : 'Your scenario'}</h2>
          <dl>
            <div><dt><Car size={17} />{zh ? '车型' : 'Vehicle'}</dt><dd>{s.vehicleType === 'ev' ? s.modelName : s.iceModelName}</dd></div>
            <div><dt><Gauge size={17} />{zh ? '每月里程' : 'Monthly distance'}</dt><dd>{s.mileage.toLocaleString()} km</dd></div>
            <div><dt><SlidersHorizontal size={17} />{zh ? '计算方式' : 'Calculation'}</dt><dd>{s.vehicleType === 'ev' ? (zh ? '充电费与油费对比' : 'Charging vs petrol') : (zh ? '油费、路税与保养' : 'Fuel, tax and servicing')}</dd></div>
          </dl>
          <p>{zh ? '调整右侧输入，再查看完整费用报告。' : 'Adjust your inputs, then open the full cost report.'}</p>
        </div>
      </div>
      <form className={`decision-form ${s.vehicleType}-form`} onSubmit={e => { e.preventDefault(); onCalculate(); }}>
        <fieldset className="mode-switch"><legend>{zh ? '你在考虑哪种车？' : 'What kind of car are you considering?'}</legend>
          <div className="segmented-control">{(['ev', 'ice'] as const).map(type => <button type="button" key={type} aria-pressed={s.vehicleType === type} onClick={() => s.setVehicleType(type)}>{type === 'ev' ? (zh ? '电车' : 'Electric car') : (zh ? '燃油车' : 'Petrol car')}</button>)}</div>
        </fieldset>
        {s.vehicleType === 'ice' ? <IceCockpitSection /> : <>
          <section className="form-section vehicle-section"><h2>{zh ? '你在考虑哪辆车？' : 'Which car are you considering?'}</h2>
            <VehicleSelection name={s.modelName} consumption={s.consumption} unit="kWh / 100 km" onChoose={() => setPicker(true)} />
          </section>
          <fieldset className="form-section charging-section"><legend>{zh ? '你通常在哪里充电？' : 'Where will you usually charge?'}</legend>
            <div className="charging-options">{(['landed', 'condo'] as const).map(mode => <button type="button" key={mode} className="charging-option" aria-pressed={s.mode === mode} onClick={() => s.setMode(mode)}>
              <span className="charging-title">{mode === 'landed' ? <Home size={20} /> : <Building2 size={20} />}<strong>{mode === 'landed' ? (zh ? '主要在家充' : 'Mostly at home') : (zh ? '公寓或公共充电站' : 'Condo or public chargers')}</strong>{s.mode === mode && <Check size={18} className="selected-check" />}</span>
              <span>{mode === 'landed' ? (zh ? '使用家里的 TNB 电表。按 90% 家充、10% 公共充电计算。' : 'Use your household TNB meter. Assumes 90% at home and 10% at public chargers.') : (zh ? '没有家用充电桩。按全部使用公共充电站的收费计算。' : 'No home charger. Assumes all charging is billed at the public charger rate.')}</span>
            </button>)}</div>
            {s.mode === 'condo' && <NumberField label={zh ? '充电站收费' : 'Your charger rate'} unit="RM / kWh" value={s.advanced.publicDcRate} min={0.01} onChange={n => s.updateAdvanced({ publicDcRate: n })} hint={zh ? '以你常用充电站的收费为准。' : 'Use the rate shown at the charger you expect to use.'} />}
          </fieldset>
          <section className="form-section distance-section"><h2>{zh ? '每月大约开多远？' : 'How far do you drive each month?'}</h2>
            <NumberField label={zh ? '每月里程' : 'Monthly distance'} unit="km" value={s.mileage} onChange={s.setMileage} />
            <PresetChips values={[800, 1500, 2000]} value={s.mileage} onChange={s.setMileage} unit="km" />
          </section>
          <section className="form-section spending-section"><h2>{zh ? '目前每月花多少钱？' : 'What do you spend now?'}</h2>
            <div className="bill-unit-row"><span>{zh ? '家庭用电，不含电车充电' : 'Household electricity, before the EV'}</span><div className="unit-switch">{(['rm', 'kwh'] as const).map(u => <button type="button" key={u} aria-pressed={billUnit === u} onClick={() => setBillUnit(u)}>{u === 'rm' ? 'RM' : 'kWh'}</button>)}</div></div>
            <NumberField label={billUnit === 'rm' ? (zh ? '每月电费' : 'Monthly electricity bill') : (zh ? '每月用电量' : 'Monthly electricity use')} unit={billUnit === 'rm' ? 'RM' : 'kWh'} value={billUnit === 'rm' ? Number(bill.totalAmount.toFixed(2)) : s.baselineKwh} min={0.01} onChange={n => s.setBaselineKwh(billUnit === 'rm' ? estimateKwhFromTnbBill(n) : n)} hint={billUnit === 'rm' ? (zh ? `按现有电价模型估算为 ${s.baselineKwh.toFixed(0)} kWh。` : `Estimated as ${s.baselineKwh.toFixed(0)} kWh using the existing tariff model.`) : (zh ? `估算电费 RM ${bill.totalAmount.toFixed(2)}。` : `Estimated bill: RM ${bill.totalAmount.toFixed(2)}.`)} />
            <NumberField label={zh ? '目前每月油费' : 'Current monthly petrol spending'} unit="RM" value={s.petrolRm} onChange={s.setPetrolRm} hint={zh ? '请输入与上方里程相对应的油费。' : 'Use petrol spending for the same monthly distance above.'} />
          </section>
          <Assumptions>
            <label className="text-field">{zh ? '车型备注' : 'Car name'}<input value={s.modelName} onChange={e => s.setModelName(e.target.value)} /></label>
            <NumberField label={zh ? '车辆电耗' : 'Vehicle consumption'} unit="kWh / 100 km" value={s.consumption} min={5} max={40} onChange={s.setConsumption} />
            {s.mode === 'landed' && <NumberField label={zh ? '公共充电收费' : 'Public charger rate'} unit="RM / kWh" min={0.01} value={s.advanced.publicDcRate} onChange={n => s.updateAdvanced({ publicDcRate: n })} />}
            <NumberField label={zh ? '燃油单价' : 'Petrol price assumption'} unit="RM / L" min={0.5} value={s.advanced.petrolPrice} onChange={n => s.updateAdvanced({ petrolPrice: n })} />
            <NumberField label={zh ? '目前燃油车效率' : 'Current petrol car efficiency'} unit="km / L" min={1} value={s.advanced.fuelEconomy} onChange={n => s.updateAdvanced({ fuelEconomy: n })} />
            <NumberField label={zh ? '燃油车排量' : 'Petrol engine size'} unit="cc" min={500} value={s.petrolEngineCc} onChange={s.setPetrolEngineCc} />
            <label className="checkbox-field"><input type="checkbox" checked={s.advanced.touEnabled} onChange={e => s.updateAdvanced({ touEnabled: e.target.checked })} /><span>{zh ? '使用分时电价的非高峰充电' : 'Use off-peak charging (ToU)'}</span></label>
            <p className="field-hint">{zh ? '仅在家庭已采用分时电价且你会在非高峰充电时启用。' : 'Enable only if your household is on ToU and you will charge off-peak.'}</p>
            <p className="field-hint">{zh ? '现有模型固定增加 10% 充电损耗，并使用其内置电价与 AFA 假设。这不是实时电价报价。' : 'The existing model adds a fixed 10% charging overhead and uses its built-in tariff and AFA assumptions. This is not a live tariff quote.'}</p>
          </Assumptions>
        </>}
        <div className="calculate-action"><button type="submit" className="primary-button">{zh ? '查看每月开支' : 'Show my monthly costs'}<ArrowRight size={20} /></button><p>{s.vehicleType === 'ev' ? (zh ? '比较能源开支，路税单独列出。车贷、保险与保养另计。' : 'Compares energy spending; road tax is separate. Loans, insurance and servicing are excluded.') : (zh ? '包含油费、路税与保养预算。车贷与保险另计。' : 'Includes fuel, road tax and your servicing budget. Loans and insurance are separate.')}</p></div>
      </form>
    </main>
    <VehiclePickerSheet isOpen={picker} onClose={() => setPicker(false)} type="ev" selectedId={s.selectedPresetId} onSelectEv={p => s.setPreset(p.id)} language={s.language} />
  </div>;
}
