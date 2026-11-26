/** @jest-environment node */
import { parseHex } from '@/design/helpers/srgb.helper';
import effectValues from '@/design/tokens/effect-values';
import effects from '@/design/tokens/effects';
import themes from '@/design/tokens/themes';
import type { ShadowLayer, ShadowLevel, ThemeName } from '@/design/types';

const THEME_NAMES: ThemeName[] = ['light', 'dark'];
const LEVELS: ShadowLevel[] = [1, 2, 3];

/** The CSS a consumer would write by hand from the numbers. */
const channels = (hex: string): string => {
  const { r, g, b } = parseHex(hex, 'test');
  return [r, g, b].map(channel => Math.round(channel * 255)).join(' ');
};

const length = (pixels: number): string => (pixels === 0 ? '0' : `${pixels}px`);

const percent = (offset = 0): string => `${Math.round(offset * 100)}%`;

const layerCss = (color: string, layer: ShadowLayer): string => {
  const lengths = [layer.x, layer.y, layer.blur];
  if (layer.spread !== 0) lengths.push(layer.spread);

  return `${lengths.map(length).join(' ')} rgb(${channels(color)} / ${layer.alpha})`;
};

describe.each(THEME_NAMES)('effect values: %s theme', theme => {
  const values = effectValues[theme];

  test('should say the same as the CSS shadow colour and opacity', () => {
    expect(channels(values.shadow.color)).toBe(effects[theme]['shadow-color']);
    expect(String(values.shadow.alpha)).toBe(effects[theme]['shadow-alpha']);
  });

  test.each(LEVELS)('should say the same as the CSS of shadow %i', level => {
    expect(
      values.shadows[level].map(layer => layerCss(values.shadow.color, layer)).join(', '),
    ).toBe(effects[theme][`shadow-${level}`]);
  });

  test('should say the same as the CSS scrim', () => {
    expect(`rgb(${channels(values.scrim.color)} / ${values.scrim.alpha})`).toBe(
      effects[theme].scrim,
    );
  });

  test('should say the same as the CSS band imagery', () => {
    const { band } = values;
    const css = effects[theme];

    expect(band.gradient.map(stop => stop.color)).toEqual([
      css['band-gradient-from'],
      css['band-gradient-from'],
      css['band-gradient-to'],
    ]);
    expect(percent(band.gradient[1]?.offset)).toBe(css['band-gradient-hold']);
    expect([band.glow.color, String(band.glow.alpha)]).toEqual([
      css['band-glow'],
      css['band-glow-alpha'],
    ]);
    expect([band.dots.color, String(band.dots.alpha)]).toEqual([
      css['band-dot'],
      css['band-dot-alpha'],
    ]);
    expect([length(band.dots.cell), length(band.dots.radius)]).toEqual([
      css['band-dot-cell'],
      css['band-dot-radius'],
    ]);
    expect(band.blueprint.fill.map(stop => stop.color)).toEqual([
      css['band-blueprint-from'],
      css['band-blueprint-to'],
    ]);
    expect(percent(band.blueprint.fill[1]?.offset)).toBe(css['band-blueprint-hold']);
    expect(band.blueprint.stroke).toBe(css['band-blueprint-stroke']);
    expect(layerCss(band.accentGlow.color, band.accentGlow.layer)).toBe(css['band-accent-glow']);
  });

  test('should compose the band imagery from the theme roles, no new colour', () => {
    const colours = themes[theme];
    const { band } = values;

    expect(band.gradient.map(stop => stop.color)).toEqual([
      colours['band-bg'],
      colours['band-bg'],
      colours['band-deep'],
    ]);
    expect(band.glow.color).toBe(colours.primary);
    expect(band.dots.color).toBe(colours['band-line-strong']);
    expect(band.blueprint.fill.map(stop => stop.color)).toEqual([
      colours['band-line'],
      colours['band-bg'],
    ]);
    expect(band.blueprint.stroke).toBe(colours['band-line-strong']);
    expect(band.accentGlow.color).toBe(colours.accent);
  });

  test('should hold opaque six-digit hex and opacities a shadow can have', () => {
    const alphas = [
      values.shadow.alpha,
      values.scrim.alpha,
      ...LEVELS.flatMap(level => values.shadows[level].map(layer => layer.alpha)),
    ];

    expect(values.shadow.color).toMatch(/^#[0-9a-f]{6}$/);
    expect(values.scrim.color).toMatch(/^#[0-9a-f]{6}$/);
    expect(alphas.every(alpha => alpha > 0 && alpha <= 0.9)).toBe(true);
  });

  test('should deepen the shadow with every level', () => {
    const reach = LEVELS.map(level =>
      Math.max(...values.shadows[level].map(layer => layer.y + layer.blur)),
    );

    expect(reach).toEqual([...reach].sort((first, second) => first - second));
    expect(new Set(reach).size).toBe(LEVELS.length);
  });
});

describe('effect values', () => {
  test('should take the scrim colour from the theme it dims', () => {
    expect(effectValues.light.scrim.color).toBe(themes.light.text);
    expect(effectValues.dark.scrim.color).toBe(themes.dark['bg-inset']);
  });

  test('should draw the band the same in both themes, like its colours', () => {
    expect(effectValues.dark.band).toEqual(effectValues.light.band);
  });

  test('should need a denser shadow and scrim on the dark theme', () => {
    expect(effectValues.dark.shadow.alpha).toBeGreaterThan(effectValues.light.shadow.alpha);
    expect(effectValues.dark.scrim.alpha).toBeGreaterThan(effectValues.light.scrim.alpha);
  });
});
