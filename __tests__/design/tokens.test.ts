/** @jest-environment node */
import hexToOklch from '@/design/modules/hex-to-oklch';
import breakpoints from '@/design/tokens/breakpoints';
import CSS_VARIABLE_PREFIX from '@/design/tokens/css-variable-prefix';
import fontFaces from '@/design/tokens/font-faces';
import fontWeights from '@/design/tokens/font-weights';
import fonts from '@/design/tokens/fonts';
import hues from '@/design/tokens/hues';
import layers from '@/design/tokens/layers';
import motion from '@/design/tokens/motion';
import radii from '@/design/tokens/radii';
import scales from '@/design/tokens/scales';
import spacing from '@/design/tokens/spacing';
import band from '@/design/tokens/band';
import themes from '@/design/tokens/themes';
import typography from '@/design/tokens/typography';

const ascending = (values: number[]): boolean =>
  values.every((value, index) => index === 0 || value > (values[index - 1] as number));

describe('scales', () => {
  test('should run from light to dark in every family', () => {
    for (const scale of Object.values(scales)) {
      const lightness = Object.values(scale).map(hex => hexToOklch(hex).l);

      expect(ascending([...lightness].reverse())).toBe(true);
    }
  });

  test('should keep every chromatic family on its hue', () => {
    for (const [name, hue] of Object.entries(hues)) {
      const { h } = hexToOklch(scales[name as keyof typeof hues][600]);
      const distance = Math.abs(((h - hue + 540) % 360) - 180);

      expect(distance).toBeLessThan(6);
    }
  });

  test('should lean the neutrals to cobalt without colouring them', () => {
    const { c, h } = hexToOklch(scales.slate[500]);

    expect(c).toBeLessThan(0.04);
    expect(Math.abs(h - hues.cobalt)).toBeLessThan(6);
    expect(scales.slate[0]).toBe('#ffffff');
  });
});

// 2.0 removed turquoise: the palette is cobalt, coral, the navy band, neutrals and the status
// and series hues. Cyan, teal and turquoise sit between these angles in OKLCH.
const CYAN_FROM = 170;
const CYAN_TO = 240;
// Below this chroma a colour reads as a neutral whatever its hue angle.
const NEUTRAL_CHROMA = 0.02;

describe('palette', () => {
  test('should carry no cyan: no hue, scale step or theme colour in the cyan range', () => {
    const colours = [
      ...Object.entries(scales).flatMap(([name, steps]) =>
        Object.entries(steps).map(([step, hex]) => [`${name}-${step}`, hex] as const),
      ),
      ...(['light', 'dark'] as const).flatMap(theme =>
        Object.entries(themes[theme]).map(([token, hex]) => [`${theme} ${token}`, hex] as const),
      ),
    ];
    const cyan = colours
      .filter(([, hex]) => {
        const { c, h } = hexToOklch(hex);
        return c > NEUTRAL_CHROMA && h > CYAN_FROM && h < CYAN_TO;
      })
      .map(([name]) => name);

    expect(Object.values(hues).filter(hue => hue > CYAN_FROM && hue < CYAN_TO)).toEqual([]);
    expect(cyan).toEqual([]);
  });
});

describe('band', () => {
  test('should hold offsets and opacities between 0 and 1, and lengths in pixels', () => {
    for (const value of [band.gradientHold, band.glowAlpha, band.dotAlpha, band.blueprintHold])
      expect(value > 0 && value < 1).toBe(true);
    expect(band.dotRadius * 2).toBeLessThan(band.dotCell);
    expect(band.accentGlow.alpha).toBeLessThan(1);
  });
});

describe('spacing', () => {
  test('should make every step its name times four pixels', () => {
    for (const [step, pixels] of Object.entries(spacing)) {
      expect(pixels).toBe(Number(step) * 4);
    }
    expect(Object.keys(spacing)).toHaveLength(13);
  });
});

describe('radii', () => {
  test('should hold the four corner sizes and the pill', () => {
    expect(radii).toEqual({ xs: 6, sm: 10, md: 14, lg: 20, pill: 999 });
  });
});

describe('typography', () => {
  test('should set body text at 15 pixels', () => {
    expect(typography.body.size).toBe(15);
    expect(typography.body.font).toBe('body');
  });

  test('should shrink from display to caption', () => {
    const sizes = [
      typography.display,
      typography.h1,
      typography.h2,
      typography.h3,
      typography.h4,
      typography.lead,
      typography.body,
      typography.small,
      typography.caption,
    ].map(({ size }) => size);

    expect(ascending([...sizes].reverse())).toBe(true);
  });

  test('should set headings wide and only in the family that has a width axis', () => {
    const styles = Object.values(typography);
    for (const style of styles.filter(item => item.font === 'display')) {
      expect(style.stretch).toBeGreaterThanOrEqual(108);
      expect(style.stretch).toBeLessThanOrEqual(112);
    }
    for (const style of styles.filter(item => item.font !== 'display')) {
      expect(style.stretch).toBe(100);
    }
  });

  test('should use only weights and widths the shipped font files contain', () => {
    for (const style of Object.values(typography)) {
      const family = (fonts[style.font].split(',')[0] as string).replaceAll('"', '');
      const available = fontFaces
        .filter(face => face.family === family)
        .some(({ weight, stretch }) => {
          const [low, high = low] = weight.split(' ').map(Number);
          const [narrow, wide = narrow] = (stretch ?? '100% 100%')
            .split(' ')
            .map(value => parseFloat(value));
          return (
            style.weight >= (low as number) &&
            style.weight <= (high as number) &&
            style.stretch >= (narrow as number) &&
            style.stretch <= (wide as number)
          );
        });

      expect(available).toBe(true);
    }
  });

  test('should keep line heights unitless and readable', () => {
    for (const { lineHeight } of Object.values(typography)) {
      expect(lineHeight).toBeGreaterThanOrEqual(1);
      expect(lineHeight).toBeLessThanOrEqual(1.6);
    }
    expect(typography.body.lineHeight).toBeGreaterThanOrEqual(1.5);
  });
});

describe('fonts', () => {
  test('should end every stack with a generic family', () => {
    expect(fonts.display.endsWith(', sans-serif')).toBe(true);
    expect(fonts.body.endsWith(', sans-serif')).toBe(true);
    expect(fonts.mono.endsWith(', monospace')).toBe(true);
  });

  test('should name the weights by their numeric value', () => {
    expect(fontWeights).toEqual({
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    });
  });
});

describe('motion', () => {
  test('should order the durations and keep them short', () => {
    const { fast, base, slow } = motion.duration;

    expect(ascending([fast, base, slow])).toBe(true);
    expect(fast).toBe(120);
    expect(slow).toBeLessThanOrEqual(400);
  });

  test('should describe every easing as a cubic bezier', () => {
    for (const curve of Object.values(motion.easing)) {
      expect(curve).toMatch(/^cubic-bezier\((?:[\d.]+, ){3}[\d.]+\)$/);
    }
  });
});

describe('layers', () => {
  test('should stack in the documented order', () => {
    expect(Object.keys(layers)).toEqual([
      'base',
      'raised',
      'sticky',
      'dropdown',
      'overlay',
      'modal',
      'popover',
      'toast',
      'tooltip',
    ]);
    expect(ascending(Object.values(layers))).toBe(true);
  });
});

describe('breakpoints', () => {
  test('should grow from sm to xl', () => {
    expect(breakpoints).toEqual({ sm: 640, md: 768, lg: 1024, xl: 1280 });
    expect(ascending(Object.values(breakpoints))).toBe(true);
  });
});

describe('CSS_VARIABLE_PREFIX', () => {
  test('should be hd', () => {
    expect(CSS_VARIABLE_PREFIX).toBe('hd');
  });
});
