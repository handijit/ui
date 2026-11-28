import { act, renderHook } from '@testing-library/react';

import usePrinting from '@/hooks/usePrinting';

type Listener = (event: MediaQueryListEvent) => void;

/** A `print` media query whose `change` the test fires. */
const stubPrintQuery = () => {
  const listeners = new Set<Listener>();
  const query = {
    matches: false,
    media: 'print',
    addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
  };
  const original = window.matchMedia;
  const matchMedia = jest.fn(() => query as unknown as MediaQueryList);
  window.matchMedia = matchMedia;

  return {
    matchMedia,
    listeners,
    fire: (matches: boolean) =>
      listeners.forEach(listener => listener({ matches } as MediaQueryListEvent)),
    restore: () => {
      window.matchMedia = original;
    },
  };
};

describe('usePrinting', () => {
  it('is true from beforeprint until afterprint', () => {
    const { result } = renderHook(() => usePrinting());
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('beforeprint'));
    });
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('afterprint'));
    });
    expect(result.current).toBe(false);
  });

  it('follows the print media query and lets it go on unmount', () => {
    const print = stubPrintQuery();
    try {
      const { result, unmount } = renderHook(() => usePrinting());
      expect(print.matchMedia).toHaveBeenCalledWith('print');

      act(() => print.fire(true));
      expect(result.current).toBe(true);
      act(() => print.fire(false));
      expect(result.current).toBe(false);

      unmount();
      expect(print.listeners.size).toBe(0);
    } finally {
      print.restore();
    }
  });

  it('listens to nothing and answers false while disabled', () => {
    const print = stubPrintQuery();
    try {
      const { result } = renderHook(() => usePrinting(false));
      act(() => {
        window.dispatchEvent(new Event('beforeprint'));
      });

      expect(result.current).toBe(false);
      expect(print.matchMedia).not.toHaveBeenCalled();
    } finally {
      print.restore();
    }
  });

  it('still answers beforeprint where there is no matchMedia', () => {
    const original = window.matchMedia;
    window.matchMedia = undefined as unknown as typeof window.matchMedia;
    try {
      const { result } = renderHook(() => usePrinting());
      act(() => {
        window.dispatchEvent(new Event('beforeprint'));
      });
      expect(result.current).toBe(true);
    } finally {
      window.matchMedia = original;
    }
  });
});
