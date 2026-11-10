import { THEME_ATTRIBUTE, THEME_BOOT_SCRIPT, THEME_STORAGE_KEY } from '@handijit/design';

import {
  applyThemePreference,
  readActiveTheme,
  readStoredPreference,
  readSystemTheme,
} from '@/helpers/theme.helper';

const root = document.documentElement;

const mockSystem = (prefersDark: boolean) =>
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: prefersDark,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });

beforeEach(() => {
  root.removeAttribute(THEME_ATTRIBUTE);
  window.localStorage.clear();
  mockSystem(false);
});

afterEach(() => jest.restoreAllMocks());

describe('readSystemTheme', () => {
  it('follows prefers-color-scheme', () => {
    expect(readSystemTheme()).toBe('light');

    mockSystem(true);
    expect(readSystemTheme()).toBe('dark');
  });

  it('is light where matchMedia does not exist', () => {
    Object.defineProperty(window, 'matchMedia', { writable: true, value: undefined });

    expect(readSystemTheme()).toBe('light');
  });
});

describe('readStoredPreference', () => {
  it('is "system" when nothing is stored', () => {
    expect(readStoredPreference()).toBe('system');
  });

  it('reads the key of @handijit/design', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    expect(readStoredPreference()).toBe('dark');
  });

  it('treats an unknown value as no choice — the boot script does the same', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    expect(readStoredPreference()).toBe('system');
  });

  it('treats a storage that throws as no choice', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(readStoredPreference()).toBe('system');
  });
});

describe('readActiveTheme', () => {
  it('reads the root attribute', () => {
    root.setAttribute(THEME_ATTRIBUTE, 'dark');

    expect(readActiveTheme()).toBe('dark');
  });

  it('falls back to the system when the attribute is missing or unknown', () => {
    mockSystem(true);
    expect(readActiveTheme()).toBe('dark');

    root.setAttribute(THEME_ATTRIBUTE, 'sepia');
    expect(readActiveTheme()).toBe('dark');
  });
});

describe('applyThemePreference', () => {
  it('stores an explicit choice and writes it to the root', () => {
    applyThemePreference('dark');

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('"system" REMOVES the key and writes the resolved theme', () => {
    applyThemePreference('dark');
    mockSystem(true);

    applyThemePreference('system');

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('still applies the theme when the storage throws', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    expect(() => applyThemePreference('dark')).not.toThrow();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  /*
   * Two writers of one attribute: this function and the design boot script. Run the real script
   * after a choice and the page must not move — otherwise a reload would flash the other theme.
   */
  it.each(['light', 'dark', 'system'] as const)(
    'agrees with the design boot script after "%s"',
    preference => {
      mockSystem(true);
      applyThemePreference(preference);
      const applied = root.getAttribute(THEME_ATTRIBUTE);

      root.removeAttribute(THEME_ATTRIBUTE);
      new Function(THEME_BOOT_SCRIPT)();

      expect(root.getAttribute(THEME_ATTRIBUTE)).toBe(applied);
    },
  );
});
