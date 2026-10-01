import { useRef, useEffect, useCallback } from 'react';

interface UseSheetDragOptions {
  isOpen: boolean;
  onClose: () => void;
  dismissThreshold?: number; // pixels pulled down to dismiss, default 70
}

export function useSheetDrag({
  isOpen,
  onClose,
  dismissThreshold = 70,
}: UseSheetDragOptions) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const currentDeltaY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Reset transform and transition whenever sheet opens or closes
  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
      sheetRef.current.style.transition = '';
    }
    currentDeltaY.current = 0;
    isDragging.current = false;
  }, [isOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    currentDeltaY.current = 0;
    isDragging.current = true;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    const clientY = e.touches[0].clientY;
    const deltaY = clientY - touchStartY.current;

    if (deltaY > 0) {
      currentDeltaY.current = deltaY;
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    } else {
      currentDeltaY.current = 0;
      if (sheetRef.current) {
        // slight resistance when dragging upward
        sheetRef.current.style.transform = `translateY(${deltaY * 0.15}px)`;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const deltaY = currentDeltaY.current;
    const timeElapsed = Math.max(1, Date.now() - touchStartTime.current);
    const velocity = deltaY / timeElapsed; // px per ms

    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)';

      // Dismiss if pulled down past threshold or fast downward flick
      if (deltaY > dismissThreshold || (velocity > 0.45 && deltaY > 20)) {
        sheetRef.current.style.transform = 'translateY(100%)';
        setTimeout(() => {
          onClose();
        }, 180);
      } else {
        // Snap back into place
        sheetRef.current.style.transform = 'translateY(0)';
      }
    }
  }, [dismissThreshold, onClose]);

  return {
    sheetRef,
    dragHandleProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      style: { touchAction: 'none' as const },
    },
  };
}
