import type { BrandSurfaceRecipe } from '../types';

/**
 * The brand surface's recipe: the numbers its imagery is drawn with, the same in every theme.
 * The colours are the theme's roles (`primary`, `brand-surface-deep`, `on-primary`, `accent`);
 * `effectValues` and `effects` pair the two. A component that draws the surface reads its
 * geometry here, because an SVG attribute (a pattern's cell, a gradient stop's offset) cannot
 * read a custom property.
 */
const brandSurface: BrandSurfaceRecipe = {
  gradientHold: 0.55,
  lineAlpha: 0.24,
  // White text on `primary` is 5.03:1; over a glow's centre at 6% it is still 4.58:1 (gated).
  // At 8% it would fall to 4.40:1, which is why the glow is a sheen and not a light.
  glowAlpha: 0.06,
  dotCell: 22,
  dotRadius: 1.6,
  dotAlpha: 0.22,
  blueprintHold: 0.7,
  blueprintFillAlpha: 0.16,
  blueprintStrokeAlpha: 0.4,
  accentGlow: { x: 0, y: 8, blur: 24, spread: -10, alpha: 0.45 },
};

export default brandSurface;
