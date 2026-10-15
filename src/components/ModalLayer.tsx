import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Anchor sheets to the visible viewport, including the iOS keyboard viewport. */
export function ModalLayer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      if (!ref.current) return;
      ref.current.style.top = `${viewport?.offsetTop ?? 0}px`;
      ref.current.style.height = `${viewport?.height ?? window.innerHeight}px`;
    };
    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return createPortal(<div ref={ref} className="result-modal-layer fixed left-0 right-0 top-0 h-dvh z-50 overflow-hidden flex flex-col justify-end">{children}</div>, document.body);
}
