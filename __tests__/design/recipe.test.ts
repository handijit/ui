/** @jest-environment node */
import effects from '@/design/tokens/effects';
import scales from '@/design/tokens/scales';
import themes from '@/design/tokens/themes';
import type { ThemeName } from '@/design/types';
import approved from './fixtures/approved-recipe.json';

// The fixture is the approved output of the design recipe. These tests are meant to turn
// red when the palette changes: update the fixture only together with a design decision.
// 2.0: turquoise left the palette (its scale and the `highlight*` roles) and `chart-3` became
// the green of the success family (CHANGELOG 2.0.0).
const THEME_NAMES: ThemeName[] = ['light', 'dark'];

// The recipe kept the shadow tone next to the colours; the package moved it to `effects`.
const MOVED_TO_EFFECTS = ['shadow', 'shadow-alpha'];

describe('approved recipe', () => {
  test('should reproduce every scale hex exactly', () => {
    expect(scales).toEqual(approved.scales);
  });

  test.each(THEME_NAMES)('should reproduce every approved %s colour exactly', name => {
    const expected = Object.entries(approved.themes[name]).filter(
      ([token]) => !MOVED_TO_EFFECTS.includes(token),
    );
    const theme: Record<string, string> = themes[name];

    expect(expected).toHaveLength(46);
    for (const [token, hex] of expected) {
      expect(theme[token]).toBe(hex);
    }
  });

  test.each(THEME_NAMES)('should keep the approved %s shadow tone', name => {
    expect(effects[name]['shadow-color']).toBe(approved.themes[name].shadow);
    expect(Number(effects[name]['shadow-alpha'])).toBe(
      Number(approved.themes[name]['shadow-alpha']),
    );
  });

  test('should lock the complete colour set, additions included', () => {
    expect(themes).toMatchSnapshot();
  });

  test('should lock the shadows and scrims', () => {
    expect(effects).toMatchSnapshot();
  });
});
