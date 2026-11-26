import type { BandRecipe } from '../types';

/**
 * The brand band's recipe: the numbers its imagery is drawn with, the same in every theme.
 * The colours are the theme's roles (`band-*`, `primary`, `accent`); `effectValues` and
 * `effects` pair the two. A component that draws the band reads its geometry here, because
 * an SVG attribute (a pattern's cell, a gradient stop's offset) cannot read a custom property.
 */
const band: BandRecipe = {
  gradientHold: 0.55,
  // A glow at its centre over `band-bg` keeps `band-text-2` at 5.85:1 (gated).
  glowAlpha: 0.5,
  dotCell: 22,
  dotRadius: 1.6,
  dotAlpha: 0.7,
  blueprintHold: 0.6,
  accentGlow: { x: 0, y: 8, blur: 24, spread: -10, alpha: 0.45 },
};

export default band;
