import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useSheetDrag } from '../hooks/useSheetDrag';

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Content Card */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg mx-auto bg-surface-raised border-t border-x border-border-subtle rounded-t-2xl shadow-floating pb-[calc(18px+env(safe-area-inset-bottom))] max-h-[88vh] flex flex-col animate-slide-up z-10 will-change-transform"
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
          <div className="flex items-center space-x-2.5 truncate pr-2 pointer-events-none">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="truncate">
              <h3 className="text-body font-bold text-text-primary truncate">{title}</h3>
              {subtitle && <p className="text-caption text-text-secondary truncate mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-overlay active:scale-95 transition-all pointer-events-auto"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-4 sm:px-5 py-4 overflow-y-auto flex-1 min-h-0 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
