import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Languages, Moon, Settings, Sun } from 'lucide-react';
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
  const [error, setError] = useState(false);
  const language = useCalculatorStore(s => s.language);
  const previousValue = useRef(value);
  useEffect(() => {
    if (!editing && (previousValue.current !== value || !error)) { setDraft(String(value)); setError(false); }
    previousValue.current = value;
  }, [value, editing, error]);
  const validDraft = (text: string) => text.trim() !== '' && Number.isFinite(Number(text)) && Number(text) >= min && (max === undefined || Number(text) <= max);
  const message = language === 'zh'
    ? (max === undefined ? `请输入不小于 ${min} 的数值。` : `请输入 ${min} 至 ${max} 之间的数值。`)
    : (max === undefined ? `Enter a number of at least ${min}.` : `Enter a number between ${min} and ${max}.`);
  return <div className="number-field">
    <label htmlFor={id}>{label}</label>
    <div className="number-control">
      <input id={id} type="number" inputMode="decimal" min={min} max={max} step={step} required value={draft}
        aria-invalid={error || undefined} aria-describedby={[hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined}
        onInvalid={e => { setError(true); e.currentTarget.closest('details')?.setAttribute('open', ''); }}
        onFocus={() => setEditing(true)}
        onChange={e => {
          const text = e.target.value;
          setDraft(text);
          if (validDraft(text)) { onChange(Number(text)); setError(false); }
          else setError(true);
        }}
        onBlur={() => { setError(!validDraft(draft)); setEditing(false); }} />
      <span>{unit}</span>
    </div>
    {error && <p id={`${id}-error`} className="field-error" role="alert">{message}</p>}
    {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
  </div>;
}

export function PresetChips({ values, value, onChange, unit = '' }: { values: number[]; value: number; onChange: (n: number) => void; unit?: string }) {
  return <div className="preset-chips">{values.map(n => <button type="button" key={n} aria-pressed={value === n} onClick={() => onChange(n)}>{n.toLocaleString()} {unit}</button>)}</div>;
}

export function AppHeader({ onBack }: { onBack?: () => void }) {
  const { language, setLanguage, theme, setTheme } = useCalculatorStore();
  const zh = language === 'zh';
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const closeSettings = () => {
    setClosing(true);
  };

  useEffect(() => {
    if (!settingsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !settingsRef.current?.contains(event.target)) closeSettings();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { closeSettings(); triggerRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown); };
  }, [settingsOpen]);

  const handleToggle = () => {
    if (settingsOpen) {
      closeSettings();
    } else {
      setClosing(false);
      setSettingsOpen(true);
    }
  };

  const handlePanelAnimationEnd = () => {
    if (closing) {
      setSettingsOpen(false);
      setClosing(false);
    }
  };

  return <header className="product-header"><div className="header-inner">
    <a className="skip-link" href="#main-content">{zh ? '跳至主要内容' : 'Skip to content'}</a>
    <div className="brand"><img className="brand-symbol" src="./brand/autokira-refined/mark.svg" alt="" aria-hidden="true" /><span className="brand-text"><span className="wordmark" role="img" aria-label="AutoKira">Auto<span className="brand-kira">Kira</span></span><span className="brand-location">{zh ? '马来西亚用车成本' : 'Car costs in Malaysia'}</span></span></div>
    <span className="desktop-header-label">{zh ? '用车成本计算器' : 'Driving cost calculator'}</span>
    <div className="header-actions settings-wrap" ref={settingsRef} onBlur={event => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) closeSettings(); }}>
      <button
        ref={triggerRef}
        className="settings-trigger"
        type="button"
        aria-label={zh ? '设置' : 'Settings'}
        aria-expanded={settingsOpen && !closing}
        aria-controls={panelId}
        onClick={handleToggle}
        data-open={settingsOpen && !closing ? '' : undefined}
      >
        <Settings size={19} className="settings-icon" aria-hidden="true" />
      </button>
      {settingsOpen && (
        <div
          id={panelId}
          className={`settings-panel${closing ? ' settings-panel--closing' : ''}`}
          role="group"
          aria-label={zh ? '设置' : 'Settings'}
          onAnimationEnd={handlePanelAnimationEnd}
        >
          <button type="button" onClick={() => setLanguage(zh ? 'en' : 'zh')} aria-label={zh ? '切换语言至英语' : 'Switch language to Chinese'}><Languages size={19} aria-hidden="true" /><span>{zh ? '语言' : 'Language'}</span><strong>{zh ? 'English' : '中文'}</strong></button>
          <button type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={zh ? (theme === 'light' ? '切换深色模式' : '切换浅色模式') : (theme === 'light' ? 'Use dark mode' : 'Use light mode')}>{theme === 'light' ? <Moon size={19} aria-hidden="true" /> : <Sun size={19} aria-hidden="true" />}<span>{zh ? '外观' : 'Appearance'}</span><strong>{theme === 'light' ? (zh ? '切换深色' : 'Use dark') : (zh ? '切换浅色' : 'Use light')}</strong></button>
        </div>
      )}
    </div>
  </div>{onBack && <div className="header-inner"><button className="back-link" type="button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" />{zh ? '修改输入' : 'Edit inputs'}</button></div>}</header>;
}

export function VehicleSelection({ name, consumption, unit, onChoose }: { name: string; consumption: number; unit: string; onChoose: () => void }) {
  const zh = useCalculatorStore(s => s.language) === 'zh';
  return <button className="vehicle-selection" type="button" onClick={onChoose}>
    <span><strong>{name}</strong><small><span>{consumption} {unit}</span><span>{zh ? '可在假设中调整' : 'Adjustable in assumptions'}</span></small></span>
    <span className="change-link">{zh ? '换车' : 'Change'}<ChevronRight size={18} /></span>
  </button>;
}

export function Assumptions({ children }: { children: React.ReactNode }) {
  const disclosureRef = useDesktopDisclosure();
  const zh = useCalculatorStore(s => s.language) === 'zh';
  return <details ref={disclosureRef} className="assumptions"><summary>{zh ? '调整假设' : 'Adjust assumptions'}<ChevronDown size={18} /></summary><div className="assumption-body">{children}</div></details>;
}
