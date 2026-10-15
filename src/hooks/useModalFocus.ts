import { useLayoutEffect, useRef, type RefObject } from 'react';

/** Focus is contained in the sheet and returned to the trigger on dismissal. */
export function useModalFocus(open: boolean, ref: RefObject<HTMLDivElement | null>, onClose: () => void) {
  const close = useRef(onClose);
  close.current = onClose;
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const previous = document.activeElement;
    const root = ref.current;
    const body = document.body;
    const saved = { position: body.style.position, top: body.style.top, left: body.style.left, width: body.style.width, overflow: body.style.overflow };
    const scrollX = window.scrollX, scrollY = window.scrollY;
    // iOS standalone mode can still scroll a body with only overflow:hidden.
    Object.assign(body.style, { position: 'fixed', top: `${-scrollY}px`, left: `${-scrollX}px`, width: '100%', overflow: 'hidden' });
    const controls = () => Array.from(root.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex="0"]')).filter(el => !el.hasAttribute('disabled') && el.getClientRects().length > 0);
    root.focus({ preventScroll: true });
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); }
      if (e.key !== 'Tab') return;
      const items = controls();
      const first = items[0], last = items[items.length - 1];
      if (!first) { e.preventDefault(); root.focus({ preventScroll: true }); return; }
      if (e.shiftKey && (document.activeElement === root || document.activeElement === first || !root.contains(document.activeElement))) { e.preventDefault(); last.focus({ preventScroll: true }); }
      if (!e.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) { e.preventDefault(); first.focus({ preventScroll: true }); }
    };
    root.addEventListener('keydown', handler);
    return () => {
      root.removeEventListener('keydown', handler);
      Object.assign(body.style, saved);
      window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open, ref]);
}
