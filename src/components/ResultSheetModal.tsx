import React from 'react';
import { useCalculatorStore } from '../stores/calculator.store';
import { useId } from 'react';
import { useModalFocus } from '../hooks/useModalFocus';
import { useSheetDrag } from '../hooks/useSheetDrag';
import { ModalLayer } from './ModalLayer';

interface ResultSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function ResultSheetModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
}: ResultSheetModalProps) {
  const { sheetRef, dragHandleProps } = useSheetDrag({ isOpen, onClose });

  const language = useCalculatorStore(s => s.language);
  const titleId = useId();
  useModalFocus(isOpen, sheetRef, onClose);

  if (!isOpen) return null;

  return (
    <ModalLayer>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Content Card */}
      <div
        ref={sheetRef}
        role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        className="desktop-dialog relative w-full max-w-lg mx-auto bg-surface-raised border-t border-x border-border-subtle rounded-t-2xl shadow-floating pb-[calc(18px+env(safe-area-inset-bottom))] flex flex-col animate-slide-up z-10"
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
          <div className="flex items-center space-x-2.5 truncate pr-2 pointer-events-none">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="truncate">
              <h3 id={titleId} className="text-body font-bold text-text-primary truncate">{title}</h3>
              {subtitle && <p className="text-caption text-text-secondary truncate mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sheet-done pointer-events-auto"
          >
            {language === 'zh' ? '完成' : 'Done'}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-4 sm:px-5 py-4 overflow-y-auto overscroll-contain flex-1 min-h-0 space-y-4">
          {children}
        </div>
      </div>
    </ModalLayer>
  );
}
