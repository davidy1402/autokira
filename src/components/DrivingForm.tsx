import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Moon, Sun } from 'lucide-react';
import { useDesktopDisclosure } from '../hooks/useDesktopDisclosure';
import { useCalculatorStore } from '../stores/calculator.store';

/** Keep an editable draft so clearing a number or typing a decimal never jumps the cursor. */
export function NumberField({ label, unit, value, onChange, min = 0, max, step = 'any', hint }: {
  label: string; unit: string; value: number; onChange: (value: number) => void;
  min?: number; max?: number; step?: string; hint?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  const [editing, setEditing] = useState(false);
  const dirty = useRef(false);
  useEffect(() => { if (!editing) setDraft(String(value)); }, [value, editing]);
  return <div className="number-field">
    <label htmlFor={id}>{label}</label>
    <div className="number-control">
      <input id={id} type="number" inputMode="decimal" min={min} max={max} step={step} value={draft}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onFocus={() => { dirty.current = false; setEditing(true); }}
        onChange={e => {
          dirty.current = true;
          setDraft(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value !== '' && Number.isFinite(n) && n >= min && (max === undefined || n <= max)) onChange(n);
        }}
        onBlur={() => {
          const n = draft === '' ? value : Number(draft);
          const safe = Number.isFinite(n) ? Math.min(max ?? Infinity, Math.max(min, n)) : value;
          if (dirty.current) onChange(safe);
          setDraft(String(safe)); setEditing(false);
        }} />
      <span>{unit}</span>
    </div>
    {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
  </div>;
}

export function PresetChips({ values, value, onChange, unit = '' }: { values: number[]; value: number; onChange: (n: number) => void; unit?: string }) {
  return <div className="preset-chips">{values.map(n => <button type="button" key={n} aria-pressed={value === n} onClick={() => onChange(n)}>{n.toLocaleString()} {unit}</button>)}</div>;
}

export function AppHeader({ onBack }: { onBack?: () => void }) {
  const { language, setLanguage, theme, setTheme } = useCalculatorStore();
  const zh = language === 'zh';
  return <header className="product-header"><div className="header-inner">
    <a className="skip-link" href="#main-content">{zh ? '跳至主要内容' : 'Skip to content'}</a>
    <div className="brand"><span className="wordmark">Auto<span className="brand-kira">Kira</span></span><span className="brand-location">{zh ? '马来西亚' : 'Malaysia'}</span></div>
    <span className="desktop-header-label">{zh ? '用车成本计算器' : 'Driving cost calculator'}</span>
    <div className="header-actions">
      <button type="button" onClick={() => setLanguage(zh ? 'en' : 'zh')} aria-label={zh ? 'Switch to English' : '切换至中文'}>{zh ? 'EN' : '中文'}</button>
      <button type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={zh ? (theme === 'light' ? '切换深色模式' : '切换浅色模式') : (theme === 'light' ? 'Use dark theme' : 'Use light theme')}>{theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}</button>
    </div>
  </div>{onBack && <div className="header-inner"><button className="back-link" type="button" onClick={onBack}>{zh ? '← 修改输入' : '← Edit my inputs'}</button></div>}</header>;
}

export function VehicleSelection({ name, consumption, unit, onChoose }: { name: string; consumption: number; unit: string; onChoose: () => void }) {
  const zh = useCalculatorStore(s => s.language) === 'zh';
  return <button className="vehicle-selection" type="button" onClick={onChoose}>
    <span><strong>{name}</strong><small>{consumption} {unit} · {zh ? '电耗或油耗可修改' : 'Consumption can be adjusted'}</small></span>
    <span className="change-link">{zh ? '换车' : 'Change'}<ChevronRight size={18} /></span>
  </button>;
}

export function Assumptions({ children }: { children: React.ReactNode }) {
  const disclosureRef = useDesktopDisclosure();
  const zh = useCalculatorStore(s => s.language) === 'zh';
  return <details ref={disclosureRef} className="assumptions"><summary>{zh ? '调整假设' : 'Adjust assumptions'}<ChevronDown size={18} /></summary><div className="assumption-body">{children}</div></details>;
}
