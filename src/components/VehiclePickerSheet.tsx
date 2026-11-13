import { useState, useId, useEffect } from 'react';
import { Search, Check, Car, Zap } from 'lucide-react';
import { PRESETS } from '../data/presets';
import { ICE_PRESETS, IceVehiclePreset } from '../data/icePresets';

import { useModalFocus } from '../hooks/useModalFocus';
import { useSheetDrag } from '../hooks/useSheetDrag';
import { ModalLayer } from './ModalLayer';
import { matchesVehicle } from '../utils/vehicleSearch';
import jpjCatalog from '../data/jpjVehicles.json';

interface VehiclePickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ev' | 'ice';
  selectedId: string;
  onSelectEv?: (preset: typeof PRESETS[0], estimateFor?: string) => void;
  onSelectIce?: (preset: IceVehiclePreset, estimateFor?: string) => void;
  language: 'zh' | 'en';
}

export function VehiclePickerSheet({
  isOpen,
  onClose,
  type,
  selectedId,
  onSelectEv,
  onSelectIce,
  language = 'zh'
}: VehiclePickerSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [estimateFor, setEstimateFor] = useState('');
  useEffect(() => { if (!isOpen) { setEstimateFor(''); setSearchQuery(''); } }, [isOpen]);
  const { sheetRef, dragHandleProps } = useSheetDrag({ isOpen, onClose });

  const titleId = useId();
  useModalFocus(isOpen, sheetRef, onClose);
  if (!isOpen) return null;

  const isEv = type === 'ev';

  const evFiltered = PRESETS.filter(p => matchesVehicle(searchQuery, p.name));
  const iceFiltered = ICE_PRESETS.filter(p => matchesVehicle(searchQuery, p.name, p.brand, p.tag));
  const catalogMatches = !estimateFor && searchQuery.trim().length >= 2
    ? jpjCatalog.vehicles.filter(car => (isEv ? car.kind === 'ev' : car.kind === 'ice' || car.kind === 'diesel') && matchesVehicle(searchQuery, car.maker, car.model)).slice(0, 30)
    : [];

  return (
    <ModalLayer>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div
        ref={sheetRef}
        role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        className="vehicle-dialog desktop-dialog relative w-full mx-auto z-10 bg-surface-raised border-t border-border-subtle rounded-t-2xl shadow-floating pb-[calc(16px+env(safe-area-inset-bottom))] flex flex-col"
      >
        {/* Grab Handle (Swipe down to dismiss) */}
        <div
          {...dragHandleProps}
          className="sheet-grip shrink-0 flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="w-12 h-1.5 bg-border-strong rounded-full pointer-events-none" />
        </div>

        {/* Header (Also draggable) */}
        <div
          {...dragHandleProps}
          className="shrink-0 px-5 py-3 border-b border-border-subtle flex items-center justify-between select-none cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center space-x-2 pointer-events-none">
            {isEv ? (
              <Zap size={18} className="text-brand-primary" />
            ) : (
              <Car size={18} className="text-brand-primary" />
            )}
            <h3 id={titleId} className="text-body font-bold text-text-primary">
              {language === 'zh'
                ? (isEv ? '选择纯电车型预设' : '选择常用燃油车型')
                : (isEv ? 'Select EV Model' : 'Select Petrol Model')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sheet-done pointer-events-auto"
          >
            {language === 'zh' ? '完成' : 'Done'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="shrink-0 px-5 pt-3 pb-2">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-text-secondary pointer-events-none" />
            <input
              type="text"
              aria-label={language === 'zh' ? '搜索车型' : 'Search cars'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'zh' ? '搜索车型或品牌，例如 Myvi、迈威' : 'Search model or brand, e.g. Myvi'}
              className="w-full pl-9 pr-4 py-2 bg-surface-overlay border border-border-subtle rounded-xl text-caption text-text-primary placeholder:text-text-secondary outline-none focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        <p className="px-5 pt-2 text-caption text-text-secondary">{estimateFor
          ? (language === 'zh' ? `未找到 ${estimateFor} 的准确规格。请选择一辆相似车型作为估算基础；结果可能差很多。` : `Exact specifications for ${estimateFor} are unavailable. Choose a similar car as the basis; results may differ substantially.`)
          : (language === 'zh' ? '选择最接近的年份和配置。规格为参考值，可在计算前调整。' : 'Choose the closest year and variant. Figures are reference values you can adjust.')}</p>
        {estimateFor && <button type="button" className="px-5 pt-2 text-left text-caption text-brand-primary" onClick={() => { setSearchQuery(estimateFor); setEstimateFor(''); }}>{language === 'zh' ? '返回搜索' : 'Back to search'}</button>}
        {/* List of Vehicles */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-2 space-y-2 min-h-0">
          {isEv ? (
            evFiltered.length === 0 ? (
              <div className="py-4 text-center text-caption text-text-secondary">
                {catalogMatches.length ? (language === 'zh' ? '没有匹配的完整车型规格。' : 'No matching car with full specifications.') : (language === 'zh' ? '暂时找不到。试试品牌或车型的其他写法，或关闭后在“调整假设”中修改车型。' : 'No match yet. Try another spelling or edit the car in Adjust assumptions.')}
              </div>
            ) : (
              evFiltered.map(preset => {
                const isSelected = selectedId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      if (onSelectEv) onSelectEv(preset, estimateFor || undefined);
                      setEstimateFor('');
                      onClose();
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'bg-brand-primary/10 border-brand-primary shadow-xs'
                        : 'bg-surface-overlay border-border-subtle hover:border-brand-primary/50'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-body font-semibold text-text-primary break-words">
                          {preset.name}
                        </span>
                      </div>
                      <div className="text-caption text-text-secondary font-mono mt-0.5">
                        {preset.consumption} kWh/100km, {preset.motorKw} kW, {preset.batteryKwh} kWh {language === 'zh' ? '电池' : 'battery'}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-brand-primary text-text-inverse flex items-center justify-center shrink-0">
                        <Check size={14} strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                );
              })
            )
          ) : (
            iceFiltered.length === 0 ? (
              <div className="py-8 text-center text-caption text-text-secondary">
                {catalogMatches.length ? (language === 'zh' ? '没有匹配的完整车型规格。' : 'No matching car with full specifications.') : (language === 'zh' ? '暂时找不到。试试品牌或车型的其他写法，或关闭后在“调整假设”中修改车型。' : 'No match yet. Try another spelling or edit the car in Adjust assumptions.')}
              </div>
            ) : (
              iceFiltered.map(preset => {
                const isSelected = selectedId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      if (onSelectIce) onSelectIce(preset, estimateFor || undefined);
                      setEstimateFor('');
                      onClose();
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'bg-brand-primary/10 border-brand-primary shadow-xs'
                        : 'bg-surface-overlay border-border-subtle hover:border-brand-primary/50'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-body font-semibold text-text-primary break-words">
                          {preset.name}
                        </span>
                        {language === 'zh' && preset.tag && (
                          <span className="px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[10px] font-medium whitespace-nowrap">
                            {preset.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-caption text-text-secondary font-mono mt-0.5">
                        {preset.consumptionLPer100Km} L/100km, {preset.engineCc}cc
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-brand-primary text-text-inverse flex items-center justify-center shrink-0">
                        <Check size={14} strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                );
              })
            )
          )}
          {catalogMatches.length > 0 && <div className="pt-4">
            <p className="text-caption text-text-secondary">{language === 'zh' ? 'JPJ 登记车型：没有油耗或电耗规格' : 'JPJ registered models: consumption data unavailable'}</p>
            {catalogMatches.map(car => <div key={`${car.maker}-${car.model}-${car.kind}`} className="mt-2 p-3 rounded-xl border border-border-subtle bg-surface-overlay">
              <div className="text-body font-semibold text-text-primary">{car.maker} {car.model}{car.kind === 'diesel' ? ' (Diesel)' : ''}</div>
              {car.kind === 'diesel' ? <p className="text-caption text-text-secondary">{language === 'zh' ? '尚无可用的柴油参考车型。' : 'A diesel reference car is not available yet.'}</p> : <button type="button" className="text-caption text-brand-primary mt-1" onClick={() => { setEstimateFor(`${car.maker} ${car.model}`); setSearchQuery(''); }}>{language === 'zh' ? '选择相似车型估算' : 'Choose a similar car for an estimate'}</button>}
            </div>)}
            <p className="text-caption text-text-secondary mt-3"><a href="https://data.gov.my/data-catalogue/registration_transactions_car" target="_blank" rel="noreferrer">JPJ / data.gov.my</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · {language === 'zh' ? '按车型及燃料汇总' : 'aggregated by model and fuel'} · {jpjCatalog.year} · {language === 'zh' ? '登记至' : 'registered through'} {jpjCatalog.dataThrough}</p>
          </div>}
        </div>
      </div>
    </ModalLayer>
  );
}
