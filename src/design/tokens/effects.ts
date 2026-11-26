import { parseHex } from '../helpers/srgb.helper';
import type {
  Effects,
  EffectTone,
  GradientStop,
  ShadowLayer,
  ThemeEffects,
  ThemeEffectValues,
} from '../types';
import effectValues from './effect-values';

/** Space-separated sRGB channels of a hex colour, for `rgb(<channels> / <alpha>)`. */
const channels = (hex: string): string => {
  const { r, g, b } = parseHex(hex, 'effects');
  return [r, g, b].map(channel => Math.round(channel * 255)).join(' ');
};

// A zero length is written bare and a zero spread is left out, as one writes it by hand.
const px = (pixels: number): string => (pixels === 0 ? '0' : `${pixels}px`);

const geometry = ({ x, y, blur, spread }: ShadowLayer): string =>
  [x, y, blur, ...(spread === 0 ? [] : [spread])].map(px).join(' ');

const rgb = ({ color, alpha }: EffectTone): string => `rgb(${channels(color)} / ${alpha})`;

const shadow = (color: string, layers: readonly ShadowLayer[]): string =>
  layers.map(layer => `${geometry(layer)} ${rgb({ color, alpha: layer.alpha })}`).join(', ');

// An offset of 0–1 as a CSS percentage, without the float noise of `0.55 * 100`.
const percent = (offset: number): string => `${Math.round(offset * 1000) / 10}%`;

const render = ({ shadow: tone, shadows, scrim, band }: ThemeEffectValues): ThemeEffects => {
  const [gradientFrom, gradientHold, gradientTo] = band.gradient as [
    GradientStop,
    GradientStop,
    GradientStop,
  ];
  const [blueprintFrom, blueprintTo] = band.blueprint.fill as [GradientStop, GradientStop];

  return {
    'shadow-color': channels(tone.color),
    'shadow-alpha': String(tone.alpha),
    'shadow-1': shadow(tone.color, shadows[1]),
    'shadow-2': shadow(tone.color, shadows[2]),
    'shadow-3': shadow(tone.color, shadows[3]),
    scrim: rgb(scrim),
    'band-gradient-from': gradientFrom.color,
    'band-gradient-to': gradientTo.color,
    'band-gradient-hold': percent(gradientHold.offset),
    'band-glow': band.glow.color,
    'band-glow-alpha': String(band.glow.alpha),
    'band-dot': band.dots.color,
    'band-dot-alpha': String(band.dots.alpha),
    'band-dot-cell': px(band.dots.cell),
    'band-dot-radius': px(band.dots.radius),
    'band-blueprint-from': blueprintFrom.color,
    'band-blueprint-to': blueprintTo.color,
    'band-blueprint-hold': percent(blueprintTo.offset),
    'band-blueprint-stroke': band.blueprint.stroke,
    'band-accent-glow': shadow(band.accentGlow.color, [band.accentGlow.layer]),
  };
};

/**
 * Theme-dependent values that are not plain colours: the three elevation shadows, the raw
 * shadow colour and opacity for custom shadows, the dialog scrim, and the brand band's
 * imagery (gradient stops, glow, dot grid, blueprint, the conversion button's glow; the same
 * in both themes, like the band). These are the CSS strings of `effectValues`, which holds
 * the same data as hex and numbers.
 */
const effects: Effects = {
  light: render(effectValues.light),
  dark: render(effectValues.dark),
};

export default effects;
