import { useEffect, useRef } from 'react';

/** Start expanded on desktop; keep native toggling available at every width. */
export function useDesktopDisclosure() {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1100px)');
    const sync = () => { if (ref.current) ref.current.open = media.matches; };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  return ref;
}
