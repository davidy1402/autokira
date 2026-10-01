import { useState } from 'react';
import { X, Search, Check, Car, Zap } from 'lucide-react';
import { PRESETS } from '../data/presets';
import { ICE_PRESETS, IceVehiclePreset } from '../data/icePresets';

import { useSheetDrag } from '../hooks/useSheetDrag';

interface VehiclePickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ev' | 'ice';
  selectedId: string;
  onSelectEv?: (preset: typeof PRESETS[0]) => void;
  onSelectIce?: (preset: IceVehiclePreset) => void;
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
  const { sheetRef, dragHandleProps } = useSheetDrag({ isOpen, onClose });

  if (!isOpen) return null;

  const isEv = type === 'ev';

  const evFiltered = PRESETS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const iceFiltered = ICE_PRESETS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-surface-raised border-t border-border-subtle rounded-t-2xl shadow-floating pb-[calc(16px+env(safe-area-inset-bottom))] max-h-[85vh] flex flex-col will-change-transform"
      >
        {/* Grab Handle (Swipe down to dismiss) */}
        <div
          {...dragHandleProps}
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="w-12 h-1.5 bg-border-strong rounded-full pointer-events-none" />
        </div>

        {/* Header (Also draggable) */}
        <div
          {...dragHandleProps}
          className="px-5 py-3 border-b border-border-subtle flex items-center justify-between select-none cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center space-x-2 pointer-events-none">
            {isEv ? (
              <Zap size={18} className="text-brand-primary" />
            ) : (
              <Car size={18} className="text-brand-primary" />
            )}
            <h3 className="text-body font-bold text-text-primary">
              {language === 'zh'
                ? (isEv ? '选择纯电车型预设' : '选择常用燃油车型')
                : (isEv ? 'Select EV Model' : 'Select Petrol Model')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-overlay active:scale-95 transition-all pointer-events-auto"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 pt-3 pb-2">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-text-secondary pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'zh' ? '搜索车型、品牌 (如 Myvi, BYD, City)' : 'Search model (e.g. Myvi, BYD, City)'}
              className="w-full pl-9 pr-4 py-2 bg-surface-overlay border border-border-subtle rounded-xl text-caption text-text-primary placeholder:text-text-secondary outline-none focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {/* List of Vehicles */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2 min-h-0">
          {isEv ? (
            evFiltered.length === 0 ? (
              <div className="py-8 text-center text-caption text-text-secondary">
                {language === 'zh' ? '未找到匹配的电车，您可以直接自定义输入' : 'No matching EV found. You can enter custom values.'}
              </div>
            ) : (
              evFiltered.map(preset => {
                const isSelected = selectedId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      if (onSelectEv) onSelectEv(preset);
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
                        <span className="text-body font-semibold text-text-primary truncate">
                          {preset.name}
                        </span>
                        {preset.price && (
                          <span className="text-[11px] font-mono text-text-secondary">
                            RM {(preset.price / 1000).toFixed(0)}k
                          </span>
                        )}
                      </div>
                      <div className="text-caption text-text-secondary font-mono mt-0.5">
                        {preset.consumption} kWh/100km, {preset.motorKw} kW, {preset.batteryKwh} kWh 电池
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
                {language === 'zh' ? '未找到匹配车型，您可以直接自定义输入' : 'No matching car found. You can enter custom values.'}
              </div>
            ) : (
              iceFiltered.map(preset => {
                const isSelected = selectedId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      if (onSelectIce) onSelectIce(preset);
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
                        <span className="text-body font-semibold text-text-primary truncate">
                          {preset.name}
                        </span>
                        {preset.tag && (
                          <span className="px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[10px] font-medium whitespace-nowrap">
                            {preset.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-caption text-text-secondary font-mono mt-0.5">
                        {preset.consumptionLPer100Km} L/100km, {preset.engineCc}cc, RM {preset.priceRm.toLocaleString()}
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
        </div>
      </div>
    </>
  );
}
