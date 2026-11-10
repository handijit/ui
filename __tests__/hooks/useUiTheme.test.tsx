import { act, renderHook } from '@testing-library/react';

import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from '@handijit/design';

import { THEME_SWITCHING_CLASS } from '@/helpers/theme.helper';
import useUiTheme from '@/hooks/useUiTheme';

const mockMatchMedia = (prefersDark: boolean) => {
  const listeners = new Set<() => void>();

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: prefersDark,
      media: query,
      onchange: null,
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
      dispatchEvent: () => false,
    }),
  });

  return { emit: () => listeners.forEach(listener => listener()), listeners };
};

describe('useUiTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    document.documentElement.classList.remove(THEME_SWITCHING_CLASS);
    window.localStorage.clear();
    mockMatchMedia(false);
  });

  it('monte olmadan önce `light` ve `isReady: false`', async () => {
    const { result } = renderHook(() => useUiTheme());

    expect(result.current.isReady).toBe(true);
    expect(result.current.scheme).toBe('light');
  });

  it('`<html data-theme>` neyse onu okur', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');

    const { result } = renderHook(() => useUiTheme());

    expect(result.current.scheme).toBe('dark');
  });

  it('öznitelik yokken SİSTEM tercihini okur', async () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useUiTheme());

    expect(result.current.scheme).toBe('dark');
  });

  it('geçersiz öznitelik değeri sistem tercihine düşer', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'sepia');
    mockMatchMedia(true);

    const { result } = renderHook(() => useUiTheme());

    expect(result.current.scheme).toBe('dark');
  });

  it('`setScheme` özniteliği yazar ve seçimi tasarım paketinin anahtarında saklar', async () => {
    const { result } = renderHook(() => useUiTheme());

    await act(async () => result.current.setScheme('dark'));

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(result.current.scheme).toBe('dark');
    expect(result.current.preference).toBe('dark');
  });

  it('saklanan seçim tercihi olarak okunur — yeniden yüklemeden sonra "system" görünmez', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');

    const { result } = renderHook(() => useUiTheme());

    expect(result.current.preference).toBe('dark');
    expect(result.current.scheme).toBe('dark');
  });

  it('özniteliği başkası (önyükleme betiği, başka bir kanca) yazınca izler', async () => {
    const { result } = renderHook(() => useUiTheme());

    await act(async () => {
      document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');
      await Promise.resolve();
    });

    expect(result.current.scheme).toBe('dark');
  });

  it('`toggle` iki yönde de çalışır', async () => {
    const { result } = renderHook(() => useUiTheme());

    await act(async () => result.current.toggle());
    expect(result.current.scheme).toBe('dark');

    await act(async () => result.current.toggle());
    expect(result.current.scheme).toBe('light');
  });

  it('geçiş sınıfı yazılır ve iki kare sonra kaldırılır', async () => {
    const { result } = renderHook(() => useUiTheme());

    /* Synchronous on purpose: an awaited `act` may let the two frames pass before the assertion. */
    act(() => result.current.setScheme('dark'));
    expect(document.documentElement).toHaveClass(THEME_SWITCHING_CLASS);

    await act(
      () =>
        new Promise<void>(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 0))),
        ),
    );

    expect(document.documentElement).not.toHaveClass(THEME_SWITCHING_CLASS);
  });

  it('AÇIK seçim varken sistem tercihi değişimi görmezden gelinir', async () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => useUiTheme());

    await act(async () => result.current.setScheme('light'));
    await act(async () => media.emit());

    expect(result.current.scheme).toBe('light');
  });

  it('seçim yokken sistem tercihi izlenmeye devam eder', async () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => useUiTheme());

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });

    await act(async () => media.emit());

    expect(result.current.scheme).toBe('dark');
  });

  describe('`system` tercihi', () => {
    it('öznitelik yokken tercih `system`, çözülmüş şema sistemden gelir', async () => {
      mockMatchMedia(true);

      const { result } = renderHook(() => useUiTheme());

      expect(result.current.preference).toBe('system');
      expect(result.current.scheme).toBe('dark');
    });

    /*
     * 1.x özniteliği siliyordu. Tasarım sözleşmesinde öznitelik HER ZAMAN çözülmüş temayı taşır;
     * "sistem" saklanan anahtarın yokluğudur.
     */
    it('`setScheme("system")` anahtarı SİLER, özniteliğe çözülmüş temayı yazar', async () => {
      const { result } = renderHook(() => useUiTheme());

      await act(async () => result.current.setScheme('dark'));
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

      await act(async () => result.current.setScheme('system'));

      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('light');
      expect(result.current.preference).toBe('system');
    });

    it('`system`e dönüldüğünde ARADA değişen sistem tercihi görülür', async () => {
      const media = mockMatchMedia(false);
      const { result } = renderHook(() => useUiTheme());

      await act(async () => result.current.setScheme('light'));

      mockMatchMedia(true);
      await act(async () => media.emit());
      expect(result.current.scheme).toBe('light');

      await act(async () => result.current.setScheme('system'));
      expect(result.current.scheme).toBe('dark');
    });

    it('`toggle` `system` iken ÇÖZÜLMÜŞ değerin tersine geçer', async () => {
      mockMatchMedia(true);
      const { result } = renderHook(() => useUiTheme());

      expect(result.current.scheme).toBe('dark');

      await act(async () => result.current.toggle());

      expect(result.current.preference).toBe('light');
      expect(result.current.scheme).toBe('light');
    });
  });

  it('sökülünce sistem dinleyicisi kaldırılır', async () => {
    const media = mockMatchMedia(false);
    const { unmount } = renderHook(() => useUiTheme());

    expect(media.listeners.size).toBe(1);
    unmount();
    expect(media.listeners.size).toBe(0);
  });
});
