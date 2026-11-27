/** A colour in OKLCH: lightness 0–1, chroma 0–~0.4, hue in degrees. */
type Oklch = {
  /** Perceptual lightness, 0 (black) to 1 (white). */
  l: number;
  /** Chroma; sRGB tops out near 0.32 depending on hue and lightness. */
  c: number;
  /** Hue angle in degrees. */
  h: number;
};

type ThemeName = 'light' | 'dark';

/** What the user picked; `system` follows the operating system. */
type ThemePreference = ThemeName | 'system';

/** The brand's cobalt and coral, and red, the one status colour (danger). */
type ChromaticScaleName = 'cobalt' | 'coral' | 'danger';

type ScaleName = ChromaticScaleName | 'ink';

type ChromaticStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

type NeutralStep = 0 | 25 | ChromaticStep;

type ChromaticScale = Readonly<Record<ChromaticStep, string>>;

type NeutralScale = Readonly<Record<NeutralStep, string>>;

type Scales = Readonly<Record<ChromaticScaleName, ChromaticScale>> & {
  readonly ink: NeutralScale;
};

type HueName = ChromaticScaleName;

type StatusName = 'danger' | 'info';

type ChartIndex = 1 | 2 | 3 | 4 | 5 | 6;

/** Every theme-dependent colour. Values are always opaque `#rrggbb`. */
type ColorToken =
  | 'bg-page'
  | 'bg-surface'
  | 'bg-raised'
  | 'bg-inset'
  | 'bg-overlay'
  | 'bg-disabled'
  | 'border'
  | 'border-strong'
  | 'border-control'
  | 'text'
  | 'text-2'
  | 'text-3'
  | 'text-disabled'
  | 'primary'
  | 'primary-hover'
  | 'primary-active'
  | 'on-primary'
  | 'primary-soft'
  | 'primary-soft-hover'
  | 'primary-line'
  | 'primary-text'
  | 'accent'
  | 'accent-hover'
  | 'accent-active'
  | 'on-accent'
  | 'accent-soft'
  | 'accent-text'
  | 'focus'
  | 'selection-bg'
  | `${StatusName}-${'bg' | 'fg' | 'line' | 'solid' | 'on-solid'}`
  | `chart-${ChartIndex}`
  | 'brand-surface-deep';

type Theme = Readonly<Record<ColorToken, string>>;

type Themes = Readonly<Record<ThemeName, Theme>>;

type FontRole = 'display' | 'body' | 'mono';

type Fonts = Readonly<Record<FontRole, string>>;

type FontWeightName = 'regular' | 'medium' | 'semibold' | 'bold';

type FontWeights = Readonly<Record<FontWeightName, number>>;

type TypeRole =
  'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'lead' | 'body' | 'small' | 'caption' | 'code';

type TypeStyle = {
  /** Which family stack the role is set in. */
  readonly font: FontRole;
  /** Font size in CSS pixels at a 16px root; the CSS output is in rem. */
  readonly size: number;
  /** Unitless line height. */
  readonly lineHeight: number;
  /** Font weight on the variable axis. */
  readonly weight: number;
  /** Letter spacing in em. */
  readonly letterSpacing: number;
  /** Font width in percent (`font-stretch`); 100 is the normal width. */
  readonly stretch: number;
};

type Typography = Readonly<Record<TypeRole, TypeStyle>>;

type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

type Spacing = Readonly<Record<SpaceStep, number>>;

type RadiusName = 'xs' | 'sm' | 'md' | 'lg' | 'pill';

type Radii = Readonly<Record<RadiusName, number>>;

type ShadowLevel = 1 | 2 | 3;

type ThemeEffects = {
  /** Shadow colour as space-separated sRGB channels, for `rgb(<color> / <alpha>)`. */
  readonly 'shadow-color': string;
  /** Base shadow opacity of the theme, as a CSS number. */
  readonly 'shadow-alpha': string;
  /** Resting elevation: cards and segmented controls. */
  readonly 'shadow-1': string;
  /** Raised elevation: menus, popovers, floating cards. */
  readonly 'shadow-2': string;
  /** Top elevation: dialogs and drawers. */
  readonly 'shadow-3': string;
  /** Translucent backdrop behind dialogs. */
  readonly scrim: string;
  /** How far down the brand surface holds `primary` before it deepens, as a percentage. */
  readonly 'brand-surface-hold': string;
  /** Hairline on the brand surface: white at low opacity, as a CSS colour. */
  readonly 'brand-surface-line': string;
  /** Opacity of the white glow at its centre; it fades to 0 at its edge. */
  readonly 'brand-surface-glow-alpha': string;
  /** Opacity of the white dot grid at the surface's edge; it fades to 0 towards the content. */
  readonly 'brand-surface-dot-alpha': string;
  /** Side of one cell of the dot grid. */
  readonly 'brand-surface-dot-cell': string;
  /** Radius of one dot. */
  readonly 'brand-surface-dot-radius': string;
  /** Where a blueprint supergraphic's white fill has faded out, as a percentage. */
  readonly 'brand-surface-blueprint-hold': string;
  /** Opacity of a blueprint's white fill at its top. */
  readonly 'brand-surface-blueprint-fill-alpha': string;
  /** Opacity of a blueprint's white outline. */
  readonly 'brand-surface-blueprint-stroke-alpha': string;
  /** The soft coral glow of the conversion button on the brand surface, as a `box-shadow`. */
  readonly 'brand-surface-accent-glow': string;
};

type EffectToken = keyof ThemeEffects;

type Effects = Readonly<Record<ThemeName, ThemeEffects>>;

/** A colour with its opacity: what `rgb(r g b / a)` says in CSS, as plain values. */
type EffectTone = {
  /** The colour as an opaque `#rrggbb`. */
  readonly color: string;
  /** Opacity, 0 (transparent) to 1 (solid). */
  readonly alpha: number;
};

/** One colour stop of a gradient. */
type GradientStop = {
  /** Position along the gradient, 0 (start) to 1 (end). */
  readonly offset: number;
  /** The colour as an opaque `#rrggbb`. */
  readonly color: string;
};

/** One layer of an elevation shadow; lengths are CSS pixels. */
type ShadowLayer = {
  /** Horizontal offset. */
  readonly x: number;
  /** Vertical offset. */
  readonly y: number;
  /** Blur radius. */
  readonly blur: number;
  /** Spread radius; negative pulls the shadow in under its box. */
  readonly spread: number;
  /** Opacity of this layer, painted in the theme's shadow colour. */
  readonly alpha: number;
};

/** The effects of one theme as numbers and hex, for anything that cannot read CSS. */
type ThemeEffectValues = {
  /** Shadow colour and base shadow opacity of the theme. */
  readonly shadow: EffectTone;
  /** The layers of each elevation shadow, outermost paint first as in CSS. */
  readonly shadows: Readonly<Record<ShadowLevel, readonly ShadowLayer[]>>;
  /** Translucent backdrop behind dialogs. */
  readonly scrim: EffectTone;
  /** The decorative layers of the brand surface; the same in both themes. */
  readonly brandSurface: BrandSurfaceEffectValues;
};

/** The brand surface's imagery as hex and numbers: gradient, line, glow, dot grid, blueprint. */
type BrandSurfaceEffectValues = {
  /** The surface's vertical background, top to bottom (`primary` into `brand-surface-deep`). */
  readonly gradient: readonly GradientStop[];
  /** The hairline: white and its opacity. */
  readonly line: EffectTone;
  /** The soft glow: its centre colour (white) and opacity; it fades to transparent. */
  readonly glow: EffectTone;
  /** The dot grid: dot colour (white), opacity at the edge, cell side and dot radius in pixels. */
  readonly dots: EffectTone & { readonly cell: number; readonly radius: number };
  /** A blueprint supergraphic: white fill fading out by `hold`, white outline, coral dot. */
  readonly blueprint: {
    readonly color: string;
    readonly fillAlpha: number;
    readonly hold: number;
    readonly strokeAlpha: number;
    readonly dot: string;
  };
  /** The glow of the conversion button on the surface, painted in `color`. */
  readonly accentGlow: { readonly color: string; readonly layer: ShadowLayer };
};

/**
 * The brand surface's recipe as plain numbers: what every theme's imagery is built from. The
 * colours are not here; they are the theme's `primary`, `brand-surface-deep`, `on-primary` and
 * `accent` roles.
 */
type BrandSurfaceRecipe = {
  /** Offset (0–1) down to which the surface holds `primary` before it deepens. */
  readonly gradientHold: number;
  /** Opacity of the white hairline. */
  readonly lineAlpha: number;
  /** Opacity of the white glow at its centre. */
  readonly glowAlpha: number;
  /** Side of one dot-grid cell, in CSS pixels. */
  readonly dotCell: number;
  /** Radius of one dot, in CSS pixels. */
  readonly dotRadius: number;
  /** Opacity of the dot grid at the surface's edge. */
  readonly dotAlpha: number;
  /** Offset (0–1) by which a blueprint's white fill has faded out. */
  readonly blueprintHold: number;
  /** Opacity of a blueprint's white fill at its top. */
  readonly blueprintFillAlpha: number;
  /** Opacity of a blueprint's white outline. */
  readonly blueprintStrokeAlpha: number;
  /** The conversion button's glow; its opacity applies to the accent colour. */
  readonly accentGlow: ShadowLayer;
};

type EffectValues = Readonly<Record<ThemeName, ThemeEffectValues>>;

type DurationName = 'fast' | 'base' | 'slow';

type EasingName = 'standard' | 'enter' | 'exit';

type Motion = {
  /** Durations in milliseconds. */
  readonly duration: Readonly<Record<DurationName, number>>;
  /** CSS timing functions. */
  readonly easing: Readonly<Record<EasingName, string>>;
};

type LayerName =
  'base' | 'raised' | 'sticky' | 'dropdown' | 'overlay' | 'modal' | 'popover' | 'toast' | 'tooltip';

type Layers = Readonly<Record<LayerName, number>>;

type BreakpointName = 'sm' | 'md' | 'lg' | 'xl';

type Breakpoints = Readonly<Record<BreakpointName, number>>;

type ScaleToken = `${ChromaticScaleName}-${ChromaticStep}` | `ink-${NeutralStep}`;

type TypeProperty = 'size' | 'line-height' | 'weight' | 'letter-spacing' | 'stretch';

/** Tokens that keep one value in every theme. */
type StaticToken =
  | ScaleToken
  | `font-${FontRole}`
  | `font-weight-${FontWeightName}`
  | `type-${TypeRole}-${TypeProperty}`
  | `space-${SpaceStep}`
  | `radius-${RadiusName}`
  | `duration-${DurationName}`
  | `ease-${EasingName}`
  | `z-${LayerName}`;

/** Tokens whose value follows the active theme. */
type ThemedToken = ColorToken | EffectToken;

/** Every custom property in `tokens.css`, without the `--hd-` prefix. */
type TokenName = StaticToken | ThemedToken;

type LogoName = 'mark' | 'horizontal';

type Logo = {
  /** The SVG `viewBox`. */
  readonly viewBox: string;
  /** Intrinsic width in viewBox units. */
  readonly width: number;
  /** Intrinsic height in viewBox units. */
  readonly height: number;
  /** Path data of everything except the dot; painted with `currentColor`. */
  readonly body: string;
  /** Path data of the square dot of the mark; painted with the accent. */
  readonly dot: string;
};

type Logos = Readonly<Record<LogoName, Logo>>;

export type {
  BrandSurfaceEffectValues,
  BrandSurfaceRecipe,
  BreakpointName,
  Breakpoints,
  ChartIndex,
  ChromaticScale,
  ChromaticScaleName,
  ChromaticStep,
  ColorToken,
  DurationName,
  EasingName,
  EffectToken,
  EffectTone,
  EffectValues,
  Effects,
  FontRole,
  FontWeightName,
  FontWeights,
  Fonts,
  GradientStop,
  HueName,
  LayerName,
  Layers,
  Logo,
  LogoName,
  Logos,
  Motion,
  NeutralScale,
  NeutralStep,
  Oklch,
  Radii,
  RadiusName,
  ScaleName,
  ScaleToken,
  Scales,
  ShadowLayer,
  ShadowLevel,
  SpaceStep,
  Spacing,
  StaticToken,
  StatusName,
  Theme,
  ThemeEffectValues,
  ThemeEffects,
  ThemeName,
  ThemePreference,
  ThemedToken,
  Themes,
  TokenName,
  TypeProperty,
  TypeRole,
  TypeStyle,
  Typography,
};
