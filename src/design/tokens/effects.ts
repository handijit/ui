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

const render = ({
  shadow: tone,
  shadows,
  scrim,
  brandSurface,
}: ThemeEffectValues): ThemeEffects => {
  const { gradient, line, glow, dots, blueprint, accentGlow } = brandSurface;

  return {
    'shadow-color': channels(tone.color),
    'shadow-alpha': String(tone.alpha),
    'shadow-1': shadow(tone.color, shadows[1]),
    'shadow-2': shadow(tone.color, shadows[2]),
    'shadow-3': shadow(tone.color, shadows[3]),
    scrim: rgb(scrim),
    'brand-surface-hold': percent((gradient[1] as GradientStop).offset),
    'brand-surface-line': rgb(line),
    'brand-surface-glow-alpha': String(glow.alpha),
    'brand-surface-dot-alpha': String(dots.alpha),
    'brand-surface-dot-cell': px(dots.cell),
    'brand-surface-dot-radius': px(dots.radius),
    'brand-surface-blueprint-hold': percent(blueprint.hold),
    'brand-surface-blueprint-fill-alpha': String(blueprint.fillAlpha),
    'brand-surface-blueprint-stroke-alpha': String(blueprint.strokeAlpha),
    'brand-surface-accent-glow': shadow(accentGlow.color, [accentGlow.layer]),
  };
};

/**
 * Theme-dependent values that are not plain colours: the three elevation shadows, the raw
 * shadow colour and opacity for custom shadows, the dialog scrim, and the brand surface's
 * imagery (gradient hold, white hairline, glow, dot grid, blueprint, the conversion button's
 * glow; the same in both themes, like the cobalt surface). These are the CSS strings of `effectValues`, which holds
 * the same data as hex and numbers.
 */
const effects: Effects = {
  light: render(effectValues.light),
  dark: render(effectValues.dark),
};

export default effects;
