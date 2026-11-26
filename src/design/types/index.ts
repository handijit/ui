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

type ChromaticScaleName =
  'cobalt' | 'coral' | 'success' | 'warning' | 'danger' | 'violet' | 'magenta';

type ScaleName = ChromaticScaleName | 'slate';

type ChromaticStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

type NeutralStep = 0 | 25 | ChromaticStep;

type ChromaticScale = Readonly<Record<ChromaticStep, string>>;

type NeutralScale = Readonly<Record<NeutralStep, string>>;

type Scales = Readonly<Record<ChromaticScaleName, ChromaticScale>> & {
  readonly slate: NeutralScale;
};

type HueName = ChromaticScaleName;

type StatusName = 'success' | 'warning' | 'danger' | 'info';

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
  | 'band-bg'
  | 'band-deep'
  | 'band-line'
  | 'band-line-strong'
  | 'band-text'
  | 'band-text-2'
  | 'band-focus'
  | 'band-edge';

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
  /** First stop of the band's vertical gradient (`band-bg`). */
  readonly 'band-gradient-from': string;
  /** Last stop of the band's vertical gradient (`band-deep`). */
  readonly 'band-gradient-to': string;
  /** How far down the band holds its first colour before it deepens, as a percentage. */
  readonly 'band-gradient-hold': string;
  /** Centre colour of the soft glows on the band (`primary`). */
  readonly 'band-glow': string;
  /** Opacity of a glow at its centre; it fades to 0 at its edge. */
  readonly 'band-glow-alpha': string;
  /** Colour of the dots of the band's dot grid (`band-line-strong`). */
  readonly 'band-dot': string;
  /** Opacity of the dot grid at the band's edge; it fades to 0 towards the content. */
  readonly 'band-dot-alpha': string;
  /** Side of one cell of the dot grid. */
  readonly 'band-dot-cell': string;
  /** Radius of one dot. */
  readonly 'band-dot-radius': string;
  /** Top stop of a blueprint supergraphic's fill (`band-line`). */
  readonly 'band-blueprint-from': string;
  /** Bottom stop of a blueprint supergraphic's fill (`band-bg`). */
  readonly 'band-blueprint-to': string;
  /** Where the blueprint fill reaches its bottom colour, as a percentage. */
  readonly 'band-blueprint-hold': string;
  /** Outline of a blueprint supergraphic (`band-line-strong`). */
  readonly 'band-blueprint-stroke': string;
  /** The soft coral glow of the conversion button on the band, as a `box-shadow`. */
  readonly 'band-accent-glow': string;
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
  /** The decorative layers of the brand band; the same in both themes. */
  readonly band: BandEffectValues;
};

/** The brand band's imagery as hex and numbers: gradient, glow, dot grid, blueprint, CTA glow. */
type BandEffectValues = {
  /** The band's vertical background, top to bottom. */
  readonly gradient: readonly GradientStop[];
  /** The soft glow: its centre colour and opacity; it fades to transparent at its edge. */
  readonly glow: EffectTone;
  /** The dot grid: dot colour, opacity at the band's edge, cell side and dot radius in pixels. */
  readonly dots: EffectTone & { readonly cell: number; readonly radius: number };
  /** A blueprint supergraphic: its fill top to bottom and its outline colour. */
  readonly blueprint: { readonly fill: readonly GradientStop[]; readonly stroke: string };
  /** The glow of the conversion button on the band, painted in `color`. */
  readonly accentGlow: { readonly color: string; readonly layer: ShadowLayer };
};

/**
 * The brand band's recipe as plain numbers: what every theme's band imagery is built from.
 * The colours are not here; they are the theme's `band-*`, `primary` and `accent` roles.
 */
type BandRecipe = {
  /** Offset (0–1) down to which the band holds `band-bg` before it deepens into `band-deep`. */
  readonly gradientHold: number;
  /** Opacity of a glow at its centre. */
  readonly glowAlpha: number;
  /** Side of one dot-grid cell, in CSS pixels. */
  readonly dotCell: number;
  /** Radius of one dot, in CSS pixels. */
  readonly dotRadius: number;
  /** Opacity of the dot grid at the band's edge. */
  readonly dotAlpha: number;
  /** Offset (0–1) at which a blueprint fill reaches `band-bg`. */
  readonly blueprintHold: number;
  /** The conversion button's glow on the band; its opacity applies to the accent colour. */
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

type ScaleToken = `${ChromaticScaleName}-${ChromaticStep}` | `slate-${NeutralStep}`;

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
  BandEffectValues,
  BandRecipe,
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
