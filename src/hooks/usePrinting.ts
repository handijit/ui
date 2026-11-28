'use client';

import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import { PRINT_MEDIA_QUERY } from '../constants/breakpoint.constants';

/**
 * Whether the page is being printed (3.2.2): `true` from `beforeprint` — or the print media query
 * starting to match — until `afterprint`. The state is flushed synchronously: the browser lays the
 * pages out as soon as `beforeprint` returns, so a render that waited for the next frame would miss
 * the paper. Listens only while `isEnabled`; disabled, it answers `false`.
 */
const usePrinting = (isEnabled = true): boolean => {
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;

    const update = (next: boolean) => flushSync(() => setIsPrinting(next));
    const handleBeforePrint = () => update(true);
    const handleAfterPrint = () => update(false);
    const handleChange = (event: MediaQueryListEvent) => update(event.matches);
    const query =
      typeof window.matchMedia === 'function' ? window.matchMedia(PRINT_MEDIA_QUERY) : null;

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    query?.addEventListener('change', handleChange);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      query?.removeEventListener('change', handleChange);
    };
  }, [isEnabled]);

  return isEnabled && isPrinting;
};

export default usePrinting;
