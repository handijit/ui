'use client';

import { useCallback, useEffect, useState } from 'react';

import { THEME_ATTRIBUTE } from '@handijit/design';
import { isClient } from '@handijit/utils';

import {
  applyThemePreference,
  readActiveTheme,
  readStoredPreference,
  THEME_SWITCHING_CLASS,
} from '../helpers/theme.helper';
import type { UiColorPreference, UiColorScheme, UiThemeState } from '@/types/theme.type';

/**
 * Reads and changes the light/dark choice, on the `data-theme` contract of `@handijit/design`.
 *
 * The choice lives where the design boot script reads it (`localStorage["hd-theme"]`), so a choice
 * made here survives a reload without a flash when `UiThemeScript` is in `<head>`.
 * @example const { scheme, toggle, isReady } = useUiTheme();
 */
const useUiTheme = (): UiThemeState => {
  /*
   * The first value is a constant: the server has no `document`, and reading the real value during
   * the first client render produced a hydration mismatch. `isReady` tells when it is real.
   */
  const [preference, setPreferenceState] = useState<UiColorPreference>('system');
  const [scheme, setSchemeState] = useState<UiColorScheme>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isClient()) return;

    const sync = () => {
      setPreferenceState(readStoredPreference());
      setSchemeState(readActiveTheme());
    };

    sync();
    setIsReady(true);

    /* The boot script, another hook instance or the application may write the attribute. */
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [THEME_ATTRIBUTE],
    });

    /*
     * Without the boot script nobody rewrites the attribute when the system setting changes; a page
     * that follows the system has to be moved here.
     */
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (readStoredPreference() === 'system') applyThemePreference('system');
      sync();
    };
    query?.addEventListener('change', handleSystemChange);

    return () => {
      observer.disconnect();
      query?.removeEventListener('change', handleSystemChange);
    };
  }, []);

  const setScheme = useCallback((next: UiColorPreference) => {
    if (!isClient()) return;

    const root = document.documentElement;

    root.classList.add(THEME_SWITCHING_CLASS);
    applyThemePreference(next);
    setPreferenceState(next);
    setSchemeState(readActiveTheme());

    /* The class comes off on the NEXT frame, after the new colours have been painted once. */
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => root.classList.remove(THEME_SWITCHING_CLASS));
    });
  }, []);

  const toggle = useCallback(
    () => setScheme(scheme === 'dark' ? 'light' : 'dark'),
    [scheme, setScheme],
  );

  return { scheme, preference, setScheme, toggle, isReady };
};

export default useUiTheme;
