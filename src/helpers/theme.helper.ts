import {
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  type ThemeName,
  type ThemePreference,
} from '@handijit/design';
import { isClient } from '@handijit/utils';

/** Turns transitions off for one frame while the theme flips (see `base.scss`). */
export const THEME_SWITCHING_CLASS = 'ui-theme-switching';

const DARK_QUERY = '(prefers-color-scheme: dark)';

const isThemeName = (value: unknown): value is ThemeName => value === 'light' || value === 'dark';

/** The operating system's setting; `light` on the server. */
export const readSystemTheme = (): ThemeName =>
  isClient() && window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';

/**
 * The user's stored choice. "System" is the absence of the key, and a storage that throws (private
 * window, blocked site data) counts as no choice — the same reading as the design boot script.
 */
export const readStoredPreference = (): ThemePreference => {
  if (!isClient()) return 'system';

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeName(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
};

/** The theme drawn on the page: the root attribute when it names a theme, else the system's. */
export const readActiveTheme = (): ThemeName => {
  if (!isClient()) return 'light';

  const attribute = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  return isThemeName(attribute) ? attribute : readSystemTheme();
};

/**
 * Stores the choice and applies it to the root element, the way `@handijit/design` documents it:
 * only `light` / `dark` are stored, "system" removes the key, and the attribute always carries the
 * resolved theme so the boot script and this function agree.
 */
export const applyThemePreference = (preference: ThemePreference): void => {
  if (!isClient()) return;

  try {
    if (preference === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* The choice still applies for this page view; it just cannot be remembered. */
  }

  document.documentElement.setAttribute(
    THEME_ATTRIBUTE,
    preference === 'system' ? readSystemTheme() : preference,
  );
};
