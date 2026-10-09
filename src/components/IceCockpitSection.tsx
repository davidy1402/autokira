import { useState } from 'react';
import { useCalculatorStore, type CalculatorState } from '../stores/calculator.store';
import { VehiclePickerSheet } from './VehiclePickerSheet';
import { Assumptions, NumberField, PresetChips, VehicleSelection } from './DrivingForm';

export function IceCockpitSection() {
  const s = useCalculatorStore();
  const zh = s.language === 'zh';
  const [picker, setPicker] = useState(false);
  const [unit, setUnit] = useState<'l100km' | 'kml'>('l100km');
  const options: { id: CalculatorState['iceFuelType']; label: string; rate: number }[] = [
    { id: 'budi_madani', label: 'BUDI MADANI', rate: 1.99 },
    { id: 'ron95', label: zh ? 'RON95 津贴油' : 'RON95 subsidised', rate: 2.05 },
    { id: 'ron95_unsub', label: zh ? 'RON95 无津贴' : 'RON95 unsubsidised', rate: 2.60 },
    { id: 'ron97', label: 'RON97', rate: 3.19 },
    { id: 'diesel', label: zh ? '柴油' : 'Diesel', rate: 2.95 },
  ];
  return <>
    <section className="form-section vehicle-section"><h2>{zh ? '你在考虑哪辆车？' : 'Which car are you considering?'}</h2>
      <VehicleSelection name={s.iceModelName} consumption={s.iceConsumptionL} unit="L / 100 km" onChoose={() => setPicker(true)} />
    </section>
    <section className="form-section distance-section"><h2>{zh ? '每月大约开多远？' : 'How far do you drive each month?'}</h2>
      <NumberField label={zh ? '每月里程' : 'Monthly distance'} unit="km" value={s.mileage} onChange={s.setMileage} />
      <PresetChips values={[800, 1500, 2000]} value={s.mileage} onChange={s.setMileage} unit="km" />
    </section>
    <section className="form-section fuel-section"><h2>{zh ? '你通常加哪种油？' : 'Which fuel do you usually use?'}</h2>
      <label className="text-field" htmlFor="fuel-grade">{zh ? '燃油类型' : 'Fuel type'}</label>
      <select id="fuel-grade" className="product-select" value={s.iceFuelType} onChange={e => s.setIceFuelType(e.target.value as CalculatorState['iceFuelType'])}>{options.map(o => <option key={o.id} value={o.id}>{o.label} · RM {o.rate.toFixed(2)} / L</option>)}</select>
      <p className="field-hint">{zh ? '以上为现有模型的油价假设，不是实时油价。' : 'These are the existing model’s price assumptions, not live fuel prices.'}</p>
      <div className="bill-unit-row"><span>{zh ? '车辆油耗' : 'Vehicle consumption'}</span><div className="unit-switch"><button type="button" aria-pressed={unit === 'l100km'} onClick={() => setUnit('l100km')}>L / 100 km</button><button type="button" aria-pressed={unit === 'kml'} onClick={() => setUnit('kml')}>km / L</button></div></div>
      <NumberField label={zh ? '平均油耗' : 'Average fuel consumption'} unit={unit === 'l100km' ? 'L / 100 km' : 'km / L'} min={0.1} value={unit === 'l100km' ? s.iceConsumptionL : Math.round(1000 / Math.max(0.1, s.iceConsumptionL)) / 10} onChange={n => s.setIceConsumptionL(unit === 'l100km' ? n : Math.round(1000 / n) / 10)} />
    </section>
    <Assumptions>
      <label className="text-field">{zh ? '车型备注' : 'Car name'}<input value={s.iceModelName} onChange={e => s.setIceModelName(e.target.value)} /></label>
      <NumberField label={zh ? '车辆售价' : 'Car purchase price'} unit="RM" value={s.icePriceRm} onChange={s.setIcePriceRm} />
      <NumberField label={zh ? '发动机排量' : 'Engine size'} unit="cc" min={500} value={s.iceEngineCc} onChange={s.setIceEngineCc} />
      <NumberField label={zh ? '每年保养预算' : 'Annual servicing budget'} unit="RM" value={s.iceAnnualMaintenanceRm} onChange={s.setIceAnnualMaintenanceRm} />
      <NumberField label={zh ? '油箱容量' : 'Fuel tank capacity'} unit="L" min={1} value={s.iceTankLiters} onChange={s.setIceTankLiters} />
    </Assumptions>
    <VehiclePickerSheet isOpen={picker} onClose={() => setPicker(false)} type="ice" selectedId={s.selectedIcePresetId} onSelectIce={p => s.setIcePreset(p.id)} language={s.language} />
  </>;
}
