# @handijitcom/ui/design

The design tokens of Han Dijit, from one TypeScript source. The same colours,
type, spacing, radii, shadows, motion and breakpoints reach a Next.js site, a
web panel and Electron desktop apps as CSS custom properties, SCSS variables,
JSON and typed constants, together with the fonts, the logos and a theme boot
script that works under a strict Content Security Policy.

- **One source, five outputs.** `tokens.css`, `tokens.scss`, `tokens.json`,
  `fonts.css` and the logo SVGs are generated from the TypeScript tokens at
  build time; the build fails if they disagree with the JavaScript entry.
- **198 tokens, 0 runtime dependencies.** 136 theme-independent custom
  properties and 62 per theme (46 colours, 16 effects), all prefixed `--hd-`.
- **Cobalt, coral and ink.** The palette is cobalt (the interface and the brand
  surface), coral (the conversion action) and ink with its neutral steps, plus
  red for danger, the one status colour. A test fails on any other hue (3.0).
- **Light and dark, gated.** Both themes pass the same contrast gates in the
  test suite: text at 4.5:1 or better (primary text 7:1), focus rings, control
  boundaries and chart colours at 3:1, chart colours at least 10 ΔE apart
  ([Semantics](#semantics)).
- **Theme islands.** `data-theme` works on the root element and on any
  container, nested in either direction; with no attribute the page follows the
  system.
- **CSP-ready theme boot script.** A 283-byte inline script and its `sha256-…`
  digest, computed at build time, for a `script-src` without `unsafe-inline`.
- **2.56 kB gzip** for `tokens.css`; **5.08 kB gzip** for the whole minified
  browser bundle ([Bundle size](#bundle-size)).
- **Self-hosted fonts.** Archivo (variable weight and width), Inter (variable
  weight) and IBM Plex Mono (400, 500) as 8 `woff2` files, 366 kB in total,
  split by `unicode-range` so a page downloads only the subsets it uses.
- **ESM, CommonJS and a `<script>` build**, each with type declarations. The
  JavaScript entry has no import side effects.
- **233 tests, 100% coverage** of statements, branches, functions and
  lines, enforced in CI.

---

## Table of contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start](#quick-start)
- [When to use it](#when-to-use-it)
- [API reference](#api-reference)
  - [Entry points](#entry-points)
  - [Theme model](#theme-model)
  - [Colour tokens](#colour-tokens)
  - [Effect tokens](#effect-tokens)
  - [Colour scales](#colour-scales)
  - [Typography tokens](#typography-tokens)
  - [Spacing, radii, motion and layers](#spacing-radii-motion-and-layers)
  - [Breakpoints](#breakpoints)
  - [SCSS](#scss) — `$hd-*`, `hd-up`, `hd-down`, `hd-between`, `hd-type`, `hd-reduced-motion`, `hd-var`, `hd-breakpoint`
  - [JSON](#json)
  - [TypeScript API](#typescript-api) — `cssVar`, `cssVarName`, `contrast`, `deltaE`, `oklchToHex`, `hexToOklch`, `maxChroma`, token maps, theme constants
  - [Fonts](#fonts)
  - [Logos](#logos)
- [Guides](#guides)
- [Framework integration](#framework-integration)
- [Semantics](#semantics)
- [Performance](#performance)
- [Bundle size](#bundle-size)
- [TypeScript](#typescript)
- [FAQ and troubleshooting](#faq-and-troubleshooting)
- [Working on the tokens](#working-on-the-tokens)
- [License](#license)

---

## Requirements

- **Node.js 24 or newer** for the JavaScript entry and for building.
- **Browsers:** current evergreen browsers. The stylesheets use custom
  properties, `:not()`, the space-separated `rgb(r g b / a)` syntax and
  `color-scheme` (Chrome 81, Safari 13, Firefox 96); the fonts are `woff2`
  variable fonts. The JavaScript builds target ES2022.
- **Sass:** `tokens.scss` uses the module system (`@use`, `sass:map`), so it
  needs Dart Sass; it is tested with Sass 1.108. `node-sass` and LibSass cannot
  compile it.

## Installation

The tokens ship inside `@handijitcom/ui`; there is nothing else to install.

```sh
npm install @handijitcom/ui
```

| Import                                               | What it is                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| `@handijitcom/ui/design`                             | the JavaScript API: tokens, themes, colour helpers, the theme boot script |
| `@handijitcom/ui/tokens.css`                         | the `--hd-*` custom properties of both themes                             |
| `@handijitcom/ui/fonts.css`                          | the `@font-face` rules (Archivo, Inter, IBM Plex Mono)                    |
| `@handijitcom/ui/tokens.scss`                        | the tokens as SCSS variables                                              |
| `@handijitcom/ui/tokens.json`                        | the tokens as JSON                                                        |
| `@handijitcom/ui/fonts/*`, `@handijitcom/ui/logos/*` | the font files and the logos                                              |

## Quick start

Load the tokens once, at the root of the application, then use the custom
properties anywhere:

```ts
import '@handijitcom/ui/tokens.css';
import '@handijitcom/ui/fonts.css';
```

```css
.card {
  background: var(--hd-bg-surface);
  color: var(--hd-text);
  border: 1px solid var(--hd-border);
  border-radius: var(--hd-radius-md);
  padding: var(--hd-space-6);
  box-shadow: var(--hd-shadow-1);
  font: var(--hd-type-body-weight) var(--hd-type-body-size) / var(--hd-type-body-line-height)
    var(--hd-font-body);
}

.card:focus-visible {
  outline: 2px solid var(--hd-focus);
  outline-offset: 2px;
}
```

The page is light, and dark when the system is dark. To choose explicitly, set
the attribute on the root element or on any container:

```html
<html data-theme="dark">
  <body>
    <aside data-theme="light">A light island inside a dark page.</aside>
  </body>
</html>
```

The same tokens in TypeScript:

```ts
import { cssVar, themes, contrast } from '@handijitcom/ui/design';

cssVar('bg-page'); // "var(--hd-bg-page)"
themes.dark['bg-page']; // "#080e1b"
contrast(themes.light.text, themes.light['bg-page']); // 18.203…
```

## When to use it

Use it when a Han Dijit product needs to look like the others: it is the single
place where a colour, a font size or a breakpoint is decided.

- Use the **semantic tokens** (`--hd-bg-surface`, `--hd-text-2`, `--hd-primary`)
  in components. They change with the theme and their pairings are tested.
- Use the **scales** (`--hd-cobalt-600`) only for a one-off that no semantic
  token covers; a scale step is the same colour in both themes, so the dark
  theme is then your job.
- Use the **TypeScript constants** where CSS does not reach: a canvas chart, an
  Electron window background, an e-mail template, a contrast check in a test.

It is not a component library and ships no component CSS, no reset and no
utility classes; `@handijitcom/ui` builds those on top of it. It is not a general
theming toolkit either: the palette is Han Dijit's, and the package does not
generate a palette from your brand colour.

---

## API reference

### Entry points

| Import                               | File                 | What it is                                                       | Side effects |
| ------------------------------------ | -------------------- | ---------------------------------------------------------------- | ------------ |
| `@handijitcom/ui/design`             | `build/index.mjs`    | ES module: token maps, helpers, theme constants                  | none         |
| `@handijitcom/ui/design` (`require`) | `build/index.cjs`    | The same API as CommonJS                                         | none         |
| `<script>` via unpkg or jsDelivr     | `build/index.umd.js` | Minified UMD bundle; global `handijitDesign`                     | one global   |
| `@handijitcom/ui/tokens.css`         | `build/tokens.css`   | Every token as a `--hd-*` custom property, with the theme rules  | yes          |
| `@handijitcom/ui/fonts.css`          | `build/fonts.css`    | `@font-face` rules for the three families                        | yes          |
| `@handijitcom/ui/tokens.scss`        | `build/tokens.scss`  | `$hd-*` variables, breakpoint constants and mixins; emits no CSS | none         |
| `@handijitcom/ui/tokens.json`        | `build/tokens.json`  | The token data as JSON                                           | none         |
| `@handijitcom/ui/fonts/<file>.woff2` | `build/fonts/`       | The font files `fonts.css` points at, and their licences         | none         |
| `@handijitcom/ui/logos/<name>.svg`   | `build/logos/`       | `mark.svg` and `horizontal.svg`                                  | none         |
| `@handijitcom/ui/package.json`       | `package.json`       | The manifest                                                     | none         |

`package.json` declares `"sideEffects": ["./build/tokens.css", "./build/fonts.css"]`:
a bundler keeps the two stylesheets when they are imported for their effect and
is free to drop everything you do not use from the JavaScript entry.

### Theme model

`tokens.css` consists of five rules, in this order:

| Rule                                                                      | Declares                                  |
| ------------------------------------------------------------------------- | ----------------------------------------- |
| `:root`                                                                   | The 136 theme-independent tokens          |
| `:root, [data-theme="light"]`                                             | The light theme and `color-scheme: light` |
| `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` | The dark theme and `color-scheme: dark`   |
| `:root[data-theme="dark"], [data-theme="dark"]`                           | The dark theme and `color-scheme: dark`   |
| `@media (prefers-reduced-motion: reduce) { :root }`                       | The three durations as `0.01ms`           |

Which theme an element gets:

| Root element         | System | Page  | Inside `[data-theme="dark"]` | Inside `[data-theme="light"]` |
| -------------------- | ------ | ----- | ---------------------------- | ----------------------------- |
| no attribute         | light  | light | dark                         | light                         |
| no attribute         | dark   | dark  | dark                         | light                         |
| `data-theme="light"` | either | light | dark                         | light                         |
| `data-theme="dark"`  | either | dark  | dark                         | light                         |

Containers nest to any depth; the nearest `data-theme` ancestor wins. Any other
attribute value is ignored: a container with `data-theme="sepia"` keeps the
theme around it, and a root element with it behaves as if it had no attribute.

A container changes the _variables_ below it, not the properties that were
already computed above it. Give an island its own paint:

```css
[data-theme] {
  background: var(--hd-bg-page);
  color: var(--hd-text);
}
```

### Colour tokens

46 per theme. Every value is a six-digit hex colour. In TypeScript the names are
the `ColorToken` union and the values are `themes.light` and `themes.dark`.

The palette is **cobalt, coral and ink**, plus red for danger: cobalt is the
interface and the brand surface, coral the conversion action, ink (`#091122`,
the text colour) and its lightness steps every neutral. There is no other hue
(3.0): no green, amber, violet, magenta, cyan or navy, and a test fails on any.

| Custom property           | Light     | Dark      | Use                                                             |
| ------------------------- | --------- | --------- | --------------------------------------------------------------- |
| `--hd-bg-page`            | `#fafbfe` | `#080e1b` | Page background                                                 |
| `--hd-bg-surface`         | `#ffffff` | `#0f1727` | Cards, panels, inputs                                           |
| `--hd-bg-raised`          | `#f4f6fb` | `#172032` | Hovered rows and fills one step above a surface                 |
| `--hd-bg-inset`           | `#ecf0f6` | `#040813` | Wells, code blocks, table headers                               |
| `--hd-bg-overlay`         | `#ffffff` | `#202a3e` | Menus, popovers, dialogs                                        |
| `--hd-bg-disabled`        | `#ecf0f6` | `#172032` | Fill of a disabled control                                      |
| `--hd-border`             | `#dee3ed` | `#283145` | Default hairline                                                |
| `--hd-border-strong`      | `#cbd1de` | `#414d64` | Dividers that must be seen, outlines of neutral buttons         |
| `--hd-border-control`     | `#80899b` | `#69758d` | Boundary of a form control; 3:1 on every background             |
| `--hd-text`               | `#091122` | `#f1f3f9` | Primary text: ink                                               |
| `--hd-text-2`             | `#515b6e` | `#bac1d0` | Secondary text                                                  |
| `--hd-text-3`             | `#677083` | `#8f99ab` | Tertiary text and placeholders                                  |
| `--hd-text-disabled`      | `#a1a9ba` | `#4e586d` | Disabled text; deliberately below 4.5:1                         |
| `--hd-primary`            | `#2661fa` | `#2661fa` | Primary action fill; the brand surface                          |
| `--hd-primary-hover`      | `#053dea` | `#2e69fe` | Primary fill, hovered                                           |
| `--hd-primary-active`     | `#0631b2` | `#053dea` | Primary fill, pressed                                           |
| `--hd-on-primary`         | `#ffffff` | `#ffffff` | Text and icons on the primary fill and on the brand surface     |
| `--hd-primary-soft`       | `#f4f7fd` | `#11234f` | Tinted background of a selected item                            |
| `--hd-primary-soft-hover` | `#e6edfb` | `#172c62` | Tinted background, hovered                                      |
| `--hd-primary-line`       | `#cfddf9` | `#24418d` | Border of a tinted primary area                                 |
| `--hd-primary-text`       | `#053dea` | `#adc6f7` | Links and primary-coloured text                                 |
| `--hd-accent`             | `#fb6041` | `#fb6041` | Conversion button fill                                          |
| `--hd-accent-hover`       | `#f99884` | `#f99884` | Accent fill, hovered                                            |
| `--hd-accent-active`      | `#f05133` | `#f05133` | Accent fill, pressed                                            |
| `--hd-on-accent`          | `#091122` | `#091122` | Text on the accent fill: ink in both themes                     |
| `--hd-accent-soft`        | `#fdf5f2` | `#3f1a12` | Tinted accent background                                        |
| `--hd-accent-text`        | `#b72e11` | `#f9bdb0` | Accent-coloured text                                            |
| `--hd-focus`              | `#5487fa` | `#82a8f7` | Focus ring                                                      |
| `--hd-selection-bg`       | `#cfddf9` | `#24418d` | `::selection` background, under `text`                          |
| `--hd-danger-bg`          | `#fdf4f5` | `#3e141a` | Danger message background                                       |
| `--hd-danger-fg`          | `#a9143c` | `#f8afb5` | Text and icons on `danger-bg`                                   |
| `--hd-danger-line`        | `#f9d1d3` | `#742633` | Border of a danger message                                      |
| `--hd-danger-solid`       | `#d2154c` | `#d2154c` | Solid danger fill: buttons, badges, icons on a surface          |
| `--hd-danger-on-solid`    | `#ffffff` | `#ffffff` | Text on `danger-solid`                                          |
| `--hd-info-bg`            | `#f4f7fd` | `#11234f` | Info message background (cobalt)                                |
| `--hd-info-fg`            | `#053dea` | `#adc6f7` | Text and icons on `info-bg`                                     |
| `--hd-info-line`          | `#cfddf9` | `#24418d` | Border of an info message                                       |
| `--hd-info-solid`         | `#2661fa` | `#2661fa` | Solid info fill: buttons, badges, icons on a surface            |
| `--hd-info-on-solid`      | `#ffffff` | `#ffffff` | Text on `info-solid`                                            |
| `--hd-chart-1`            | `#2661fa` | `#82a8f7` | Chart series 1 (cobalt)                                         |
| `--hd-chart-2`            | `#e03611` | `#f99884` | Chart series 2 (coral)                                          |
| `--hd-chart-3`            | `#677083` | `#ffffff` | Chart series 3 (ink)                                            |
| `--hd-chart-4`            | `#05247e` | `#2661fa` | Chart series 4 (deep cobalt / cobalt)                           |
| `--hd-chart-5`            | `#87230f` | `#e03611` | Chart series 5 (deep coral / coral)                             |
| `--hd-chart-6`            | `#091122` | `#677083` | Chart series 6 (ink)                                            |
| `--hd-brand-surface-deep` | `#0631b2` | `#0631b2` | The brand surface's deeper cobalt step; the same in both themes |

The status families are `danger` and `info`. `info` is the cobalt family, so an
informational message and a primary action share a hue. There is no success or
warning family (3.0): a success is drawn in cobalt and a warning in ink, each
with its icon and its text, which carry the meaning (WCAG 1.4.1).

The chart series are tints of the three brand colours (3.0). Measured with
`deltaE` and `contrast` over every step of cobalt, coral and ink at 3:1 or more
on the page, surface and raised backgrounds, these six lie furthest apart: 17.9
ΔE at the closest pair in light (cobalt 600, coral 600, ink 500, cobalt 900,
coral 800, ink 950), 20.2 ΔE in dark (cobalt 400, coral 400, ink 0, cobalt 600,
coral 600, ink 500). Two series of one hue differ only in lightness, so a chart
with more than three series names them in a legend and, where it can, adds
direct labels, markers or dash patterns.

`brand-surface-deep` is the brand surface's one deeper step: cobalt 800, the
light theme's pressed primary, 10.05:1 under white. The surface itself is
`primary` with `on-primary` on it, the same in both themes; it stands out of the
page without an edge (4.86:1 light, 3.83:1 dark).

### Effect tokens

16 per theme. Shadows and the scrim are complete values, resolved per theme, so
they are correct inside a theme island as well. The `brand-surface-*` effects
are the brand surface's imagery and, like the surface, the same in both themes.

| Custom property                             | Light                                                                  | Dark                                                              |
| ------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `--hd-shadow-color`                         | `15 23 60`                                                             | `0 0 0`                                                           |
| `--hd-shadow-alpha`                         | `0.1`                                                                  | `0.45`                                                            |
| `--hd-shadow-1`                             | `0 1px 2px rgb(15 23 60 / 0.1)`                                        | `0 1px 2px rgb(0 0 0 / 0.45)`                                     |
| `--hd-shadow-2`                             | `0 1px 2px rgb(15 23 60 / 0.1), 0 12px 32px -12px rgb(15 23 60 / 0.2)` | `0 1px 2px rgb(0 0 0 / 0.45), 0 12px 32px -12px rgb(0 0 0 / 0.9)` |
| `--hd-shadow-3`                             | `0 2px 4px rgb(15 23 60 / 0.1), 0 24px 56px -16px rgb(15 23 60 / 0.3)` | `0 2px 4px rgb(0 0 0 / 0.45), 0 24px 56px -16px rgb(0 0 0 / 0.9)` |
| `--hd-scrim`                                | `rgb(9 17 34 / 0.48)`                                                  | `rgb(4 8 19 / 0.64)`                                              |
| `--hd-brand-surface-hold`                   | `55%`                                                                  | `55%`                                                             |
| `--hd-brand-surface-line`                   | `rgb(255 255 255 / 0.24)`                                              | `rgb(255 255 255 / 0.24)`                                         |
| `--hd-brand-surface-glow-alpha`             | `0.06`                                                                 | `0.06`                                                            |
| `--hd-brand-surface-dot-alpha`              | `0.22`                                                                 | `0.22`                                                            |
| `--hd-brand-surface-dot-cell`               | `22px`                                                                 | `22px`                                                            |
| `--hd-brand-surface-dot-radius`             | `1.6px`                                                                | `1.6px`                                                           |
| `--hd-brand-surface-blueprint-hold`         | `70%`                                                                  | `70%`                                                             |
| `--hd-brand-surface-blueprint-fill-alpha`   | `0.16`                                                                 | `0.16`                                                            |
| `--hd-brand-surface-blueprint-stroke-alpha` | `0.4`                                                                  | `0.4`                                                             |
| `--hd-brand-surface-accent-glow`            | `0 8px 24px -10px rgb(251 96 65 / 0.45)`                               | `0 8px 24px -10px rgb(251 96 65 / 0.45)`                          |

`--hd-shadow-color` and `--hd-shadow-alpha` are the parts, for a shadow the three
levels do not cover: `box-shadow: 0 8px 24px rgb(var(--hd-shadow-color) / var(--hd-shadow-alpha))`.

The brand surface's imagery is white and cobalt at an opacity, plus the coral of
the logo; no new colour:

| Layer           | Tokens                                                                                                                                                   | Drawn as                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Background      | `primary` held to `brand-surface-hold`, then `brand-surface-deep`                                                                                        | a vertical gradient of two cobalt steps                                                       |
| Glow            | `on-primary` at `brand-surface-glow-alpha` (0.06), fading to 0                                                                                           | a white sheen; white text over its centre is still 4.58:1 (gated). At 0.08 it would be 4.40:1 |
| Hairline        | `brand-surface-line` (white at 0.24)                                                                                                                     | dividers, the rules of an eyebrow, the top of the strip of facts                              |
| Dot grid        | `on-primary` dots of `brand-surface-dot-radius` every `brand-surface-dot-cell`, at most `brand-surface-dot-alpha`                                        | a pattern of white dots, masked so it fades towards the content                               |
| Blueprint       | white fill at `brand-surface-blueprint-fill-alpha` fading out by `brand-surface-blueprint-hold`, white outline at `brand-surface-blueprint-stroke-alpha` | a supergraphic (the mark); its dot is the solid `accent` of the logo                          |
| Conversion glow | `brand-surface-accent-glow`                                                                                                                              | the `box-shadow` of the one coral button on the surface                                       |

Text on the brand surface is white only. White at 92% is already 4.50:1 on
cobalt and falls below 4.5:1 over a glow, so there is no secondary text colour
there: hierarchy comes from size and weight. Coral on cobalt is 1.64:1, so the
coral button is identified by its label (`on-accent`, 6.15:1), not by its edge.

Draw the layers as SVG (`<linearGradient>`, `<radialGradient>`, `<pattern>`,
`<mask>`): SVG attributes cannot read custom properties, so the geometry is also
exported as numbers in [`brandSurface`](#token-maps). `@handijitcom/ui` draws all
of it in its `BrandSurface` component.

Outside CSS, read the same values as hex and numbers from
[`effectValues`](#effect-values).

### Colour scales

46 custom properties, `--hd-<scale>-<step>`, identical in both themes. Three
chromatic scales of 11 steps (cobalt, coral, danger) and the neutral scale of
13, `ink`. In TypeScript: `scales.cobalt[600]`, `scales.ink[950]`.

| Scale    | 0         | 25        | 50        | 100       | 200       | 300       | 400       | 500       | 600       | 700       | 800       | 900       | 950       |
| -------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| `cobalt` |           |           | `#f4f7fd` | `#e6edfb` | `#cfddf9` | `#adc6f7` | `#82a8f7` | `#5487fa` | `#2661fa` | `#053dea` | `#0631b2` | `#05247e` | `#031650` |
| `coral`  |           |           | `#fdf5f2` | `#fbe8e3` | `#fad7cf` | `#f9bdb0` | `#f99884` | `#fb6041` | `#e03611` | `#b72e11` | `#87230f` | `#5d190c` | `#380e06` |
| `danger` |           |           | `#fdf4f5` | `#fbe7e8` | `#f9d1d3` | `#f8afb5` | `#f87e8d` | `#fa2f61` | `#d2154c` | `#a9143c` | `#81142e` | `#5c1020` | `#3a0913` |
| `ink`    | `#ffffff` | `#fafbfe` | `#f4f6fb` | `#ecf0f6` | `#dee3ed` | `#cbd1de` | `#a1a9ba` | `#677083` | `#515b6e` | `#3f495d` | `#263044` | `#141e31` | `#091122` |

Each chromatic scale is derived in OKLCH from one hue angle (`hues`): cobalt
264°, coral 33°, danger 14°. `ink` is the text colour (`ink-950`, `#091122`) and
its lightness steps; it leans to ink's own hue, the cobalt angle, at a chroma
low enough to read as neutral. 3.0 renamed it from `slate`.

### Typography tokens

| Custom property             | Value                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `--hd-font-display`         | `Archivo, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif`                      |
| `--hd-font-body`            | `Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`                |
| `--hd-font-mono`            | `"IBM Plex Mono", ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace` |
| `--hd-font-weight-regular`  | `400`                                                                                                     |
| `--hd-font-weight-medium`   | `500`                                                                                                     |
| `--hd-font-weight-semibold` | `600`                                                                                                     |
| `--hd-font-weight-bold`     | `700`                                                                                                     |

Ten type roles, five custom properties each: `--hd-type-<role>-size`,
`-line-height`, `-weight`, `-letter-spacing` and `-stretch`. Sizes are in `rem`
at a 16px root, so they follow the reader's font size setting.

| Role      | Font    | Size             | Line height | Weight | Letter spacing | Stretch |
| --------- | ------- | ---------------- | ----------- | ------ | -------------- | ------- |
| `display` | display | 56px (3.5rem)    | 1.05        | 700    | -0.03em        | 112%    |
| `h1`      | display | 40px (2.5rem)    | 1.1         | 700    | -0.025em       | 110%    |
| `h2`      | display | 30px (1.875rem)  | 1.15        | 700    | -0.02em        | 110%    |
| `h3`      | display | 22px (1.375rem)  | 1.2         | 650    | -0.015em       | 108%    |
| `h4`      | display | 18px (1.125rem)  | 1.3         | 650    | -0.01em        | 108%    |
| `lead`    | body    | 17px (1.0625rem) | 1.55        | 400    | 0em            | 100%    |
| `body`    | body    | 15px (0.9375rem) | 1.55        | 400    | 0em            | 100%    |
| `small`   | body    | 13px (0.8125rem) | 1.5         | 400    | 0em            | 100%    |
| `caption` | body    | 12px (0.75rem)   | 1.4         | 500    | 0.01em         | 100%    |
| `code`    | mono    | 13px (0.8125rem) | 1.5         | 400    | 0em            | 100%    |

```css
h1 {
  font-family: var(--hd-font-display);
  font-size: var(--hd-type-h1-size);
  line-height: var(--hd-type-h1-line-height);
  font-weight: var(--hd-type-h1-weight);
  letter-spacing: var(--hd-type-h1-letter-spacing);
  font-stretch: var(--hd-type-h1-stretch);
}
```

In TypeScript, `typography.h1` holds the same values as numbers
(`{ font: "display", size: 40, lineHeight: 1.1, weight: 700, letterSpacing: -0.025, stretch: 110 }`).

### Spacing, radii, motion and layers

| Group     | Custom properties                                                                                        | Values                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Spacing   | `--hd-space-0`, `-1`, `-2`, `-3`, `-4`, `-5`, `-6`, `-8`, `-10`, `-12`, `-16`, `-20`, `-24`              | The step times 4px, in `rem`: `--hd-space-4` is `1rem` (16px)                          |
| Radii     | `--hd-radius-xs`, `-sm`, `-md`, `-lg`, `-pill`                                                           | `6px`, `10px`, `14px`, `20px`, `999px`                                                 |
| Durations | `--hd-duration-fast`, `-base`, `-slow`                                                                   | `120ms`, `200ms`, `320ms`; all `0.01ms` under `prefers-reduced-motion: reduce`         |
| Easings   | `--hd-ease-standard`, `-enter`, `-exit`                                                                  | `cubic-bezier(0.2, 0, 0, 1)`, `cubic-bezier(0, 0, 0, 1)`, `cubic-bezier(0.3, 0, 1, 1)` |
| Layers    | `--hd-z-base`, `-raised`, `-sticky`, `-dropdown`, `-overlay`, `-modal`, `-popover`, `-toast`, `-tooltip` | `0`, `1`, `100`, `1000`, `1100`, `1200`, `1300`, `1400`, `1500`                        |

In TypeScript: `spacing[4]` is `16`, `radii.md` is `14`, `motion.duration.base`
is `200`, `motion.easing.standard` is the `cubic-bezier()` string and
`layers.modal` is `1200`.

### Breakpoints

| Name | Minimum width |
| ---- | ------------- |
| `sm` | 640px         |
| `md` | 768px         |
| `lg` | 1024px        |
| `xl` | 1280px        |

Breakpoints are not custom properties, because a media query cannot read one.
They are compile-time constants in SCSS (`$hd-breakpoint-md`, the `hd-up` family
of mixins) and numbers in TypeScript (`breakpoints.md`).

### SCSS

```scss
@use '@handijitcom/ui/tokens.scss' as *;

.card {
  @include hd-type(body);
  background: $hd-bg-surface; // var(--hd-bg-surface)
  padding: $hd-space-4;

  @include hd-up(md) {
    padding: $hd-space-6;
  }
}
```

`tokens.scss` emits no CSS of its own: it names what `tokens.css` declares, so
load `tokens.css` once as well. With the plain `sass` CLI or API, which does not
read `exports` by itself, use the package importer:
`@use "pkg:@handijitcom/ui/tokens.scss" as *;` with `--pkg-importer=node`.

| Member                                   | Kind     | What it gives                                                                                  |
| ---------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `$hd-<token>`                            | variable | `var(--hd-<token>)` for each of the 198 tokens: `$hd-text`, `$hd-cobalt-600`, `$hd-space-4`    |
| `$hd-tokens`                             | map      | Token name to `var()` reference                                                                |
| `$hd-breakpoint-sm`, `-md`, `-lg`, `-xl` | variable | `640px`, `768px`, `1024px`, `1280px`: real lengths, usable in a media query                    |
| `$hd-breakpoints`                        | map      | Breakpoint name to length                                                                      |
| `$hd-type-fonts`                         | map      | Type role to font role (`h1` to `display`)                                                     |
| `hd-var($name)`                          | function | The `var()` reference of a token given as a string; an unknown name is a compile error         |
| `hd-breakpoint($name)`                   | function | The length of a breakpoint; an unknown name is a compile error                                 |
| `hd-up($breakpoint)`                     | mixin    | `@media (min-width: <breakpoint>)`                                                             |
| `hd-down($breakpoint)`                   | mixin    | `@media (max-width: <breakpoint> - 0.02px)`, so `hd-up(md)` and `hd-down(md)` never both match |
| `hd-between($from, $to)`                 | mixin    | From `$from` up to, not including, `$to`                                                       |
| `hd-reduced-motion`                      | mixin    | `@media (prefers-reduced-motion: reduce)`                                                      |
| `hd-type($role)`                         | mixin    | The six font properties of a type role; an unknown role is a compile error                     |

The `$hd-*` token variables hold `var()` references, not colours, so Sass colour
functions (`color.adjust`, `color.mix`) cannot take them. That is deliberate: a
value baked in at compile time could not follow the theme. Reach for another
token, or for `color-mix()` in CSS.

### JSON

```ts
import tokens from '@handijitcom/ui/tokens.json' with { type: 'json' };

tokens.themes.dark['bg-page']; // "#080e1b"
```

For places with no CSS and no bundler, such as an Electron main process or a
build script in another language. The keys are `prefix`, `themeAttribute`,
`themeStorageKey`, `hues`, `scales`, `themes`, `effects`, `effectValues`, `fonts`,
`fontWeights`, `typography`, `spacing`, `radii`, `motion`, `layers` and
`breakpoints`, with the same values as the exports of the same name in the
JavaScript entry.

### TypeScript API

```ts
import {
  // token maps
  scales,
  brandSurface,
  themes,
  effects,
  effectValues,
  hues,
  fonts,
  fontWeights,
  typography,
  spacing,
  radii,
  motion,
  layers,
  breakpoints,
  logos,
  // CSS references
  cssVar,
  cssVarName,
  CSS_VARIABLE_PREFIX,
  // colour helpers
  contrast,
  deltaE,
  oklchToHex,
  hexToOklch,
  maxChroma,
  // theme
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  THEME_BOOT_SCRIPT,
  THEME_BOOT_SCRIPT_HASH,
} from '@handijitcom/ui/design';
```

#### Token maps

| Export         | Type                                | Example                                                            |
| -------------- | ----------------------------------- | ------------------------------------------------------------------ |
| `scales`       | `Scales`                            | `scales.cobalt[600]` is `"#2661fa"`                                |
| `themes`       | `Themes`                            | `themes.dark.text` is `"#f1f3f9"`                                  |
| `effects`      | `Effects`                           | `effects.light["shadow-1"]`                                        |
| `effectValues` | `EffectValues`                      | `effectValues.dark.scrim` is `{ color: "#040813", alpha: 0.64 }`   |
| `hues`         | `Readonly<Record<HueName, number>>` | `hues.coral` is `33`                                               |
| `fonts`        | `Fonts`                             | `fonts.mono` is the IBM Plex Mono stack                            |
| `fontWeights`  | `FontWeights`                       | `fontWeights.semibold` is `600`                                    |
| `typography`   | `Typography`                        | `typography.body.size` is `15`                                     |
| `spacing`      | `Spacing`                           | `spacing[6]` is `24`                                               |
| `radii`        | `Radii`                             | `radii.pill` is `999`                                              |
| `motion`       | `Motion`                            | `motion.duration.fast` is `120`                                    |
| `layers`       | `Layers`                            | `layers.toast` is `1400`                                           |
| `breakpoints`  | `Breakpoints`                       | `breakpoints.lg` is `1024`                                         |
| `logos`        | `Logos`                             | `logos.mark.viewBox` is `"0 0 618.034 1000"`                       |
| `brandSurface` | `BrandSurfaceRecipe`                | `brandSurface.dotCell` is `22`, `brandSurface.glowAlpha` is `0.06` |

Lengths are numbers of CSS pixels and durations are numbers of milliseconds; the
CSS output adds the units. The maps are typed `Readonly` and are plain objects:
they are literals in the bundle, not computed when the module loads.

#### Effect values

`effects` holds CSS strings (`"rgb(9 17 34 / 0.48)"`), which only a CSS engine
can use. `effectValues` holds the same shadows and scrim as hex colours and
numbers, for an Electron main process, an Open Graph image or a PDF; so does
the brand surface's imagery (`brandSurface`). It is the
source the strings in `effects` and the custom properties in `tokens.css` are
rendered from, and the test suite re-renders them to prove it, so the two cannot
drift apart.

```ts
import { effectValues } from '@handijitcom/ui/design';

const { shadow, shadows, scrim } = effectValues.light;

shadow; // { color: "#0f173c", alpha: 0.1 }: --hd-shadow-color and --hd-shadow-alpha
scrim; // { color: "#091122", alpha: 0.48 }: --hd-scrim
shadows[2];
// [
//   { x: 0, y: 1, blur: 2, spread: 0, alpha: 0.1 },
//   { x: 0, y: 12, blur: 32, spread: -12, alpha: 0.2 },
// ]: the layers of --hd-shadow-2, each painted in shadow.color
```

| Field          | Type                                                    | Description                                             |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `shadow`       | `EffectTone`                                            | Shadow colour (`#rrggbb`) and base opacity of the theme |
| `shadows`      | `Readonly<Record<ShadowLevel, readonly ShadowLayer[]>>` | Layers of the three elevation shadows, in CSS order     |
| `scrim`        | `EffectTone`                                            | Backdrop colour (`#rrggbb`) and opacity behind a dialog |
| `brandSurface` | `BrandSurfaceEffectValues`                              | The brand surface's imagery, the same in both themes    |

`brandSurface` holds `gradient` (three `GradientStop`s, `{ offset, color }`:
`primary`, `primary`, `brand-surface-deep`), `line`, `glow` (`EffectTone`s of
white), `dots` (`EffectTone` with `cell` and `radius`), `blueprint` (`color`,
`fillAlpha`, `hold`, `strokeAlpha`, `dot`) and `accentGlow` (`{ color, layer }`).
An Open Graph image draws the cobalt surface from it without a stylesheet:

```tsx
const { gradient, glow, dots } = effectValues.light.brandSurface;

<radialGradient id="glow">
  <stop offset="0" stopColor={glow.color} stopOpacity={glow.alpha} />
  <stop offset="1" stopColor={glow.color} stopOpacity={0} />
</radialGradient>;
```

A `ShadowLayer` is `{ x, y, blur, spread, alpha }`: lengths in CSS pixels, opacity
from 0 to 1. Every colour is opaque; the opacity is always the separate `alpha`.

#### `cssVar(name, fallback?)`

```ts
const cssVar: (name: TokenName, fallback?: string) => string;
```

| Parameter  | Type        | Default | Description                              |
| ---------- | ----------- | ------- | ---------------------------------------- |
| `name`     | `TokenName` |         | A token name without the prefix          |
| `fallback` | `string`    | none    | Emitted verbatim after the property name |

Returns the `var()` reference of a token, for inline styles and CSS-in-JS.

```ts
cssVar('bg-page'); // "var(--hd-bg-page)"
cssVar('bg-page', '#fff'); // "var(--hd-bg-page, #fff)"
```

The name is checked by the type system only. From untyped JavaScript an unknown
name still produces a reference (`cssVar("nope")` is `"var(--hd-nope)"`), which
CSS treats as invalid at computed-value time.

#### `cssVarName(name)`

```ts
const cssVarName: <Name extends TokenName>(name: Name) => `--hd-${Name}`;
```

Returns the custom property name itself, typed as a literal, for
`style.setProperty` and `getComputedStyle`.

```ts
cssVarName('space-4'); // "--hd-space-4"
getComputedStyle(element).getPropertyValue(cssVarName('primary'));
```

`CSS_VARIABLE_PREFIX` is the `"hd"` in those names.

#### `contrast(first, second)`

```ts
const contrast: (first: string, second: string) => number;
```

| Parameter | Type     | Description                       |
| --------- | -------- | --------------------------------- |
| `first`   | `string` | A hex colour, `#rrggbb` or `#rgb` |
| `second`  | `string` | A hex colour, `#rrggbb` or `#rgb` |

Returns the WCAG 2 contrast ratio, from `1` (the same colour) to `21` (black on
white). The order of the arguments does not matter.

```ts
contrast('#ffffff', '#000000'); // 21
contrast(themes.light['on-accent'], themes.light.accent); // 6.15…
```

Throws `TypeError` for anything that is not a hex colour, including a hex
without `#`, a colour name and a non-string.

#### `deltaE(first, second)`

```ts
const deltaE: (first: string, second: string) => number;
```

Returns the perceptual distance between two hex colours: the Euclidean distance
in OKLab, times 100. `0` is the same colour, about `2` is a just-noticeable
difference and black to white is `100`. The palette keeps chart colours at least
`10` apart. Throws `TypeError` like `contrast`.

```ts
deltaE(themes.light.accent, themes.light['danger-solid']); // 14.8…
```

#### `oklchToHex(color)`

```ts
const oklchToHex: (color: Oklch) => string;
type Oklch = { readonly l: number; readonly c: number; readonly h: number };
```

| Field | Range                       | Description                                      |
| ----- | --------------------------- | ------------------------------------------------ |
| `l`   | `0` to `1`                  | Lightness                                        |
| `c`   | `0` to about `0.32` in sRGB | Chroma                                           |
| `h`   | degrees                     | Hue angle; any finite number, `624` equals `264` |

Returns `#rrggbb`. A colour outside sRGB keeps its lightness and hue and gives
up chroma until it fits; channels are never clipped one by one, so the hue does
not drift.

```ts
oklchToHex({ l: 0.6, c: 0.1, h: 264 }); // "#617fbc"
oklchToHex({ l: 0.6, c: 0.4, h: 264 }); // "#3a73ff", the most chromatic blue at that lightness
```

A lightness above `1` gives `"#ffffff"` and one below `0` gives `"#000000"`; a
negative chroma is read as `0`. Throws `TypeError` when a field is missing,
`NaN` or infinite.

#### `hexToOklch(hex)`

```ts
const hexToOklch: (hex: string) => Oklch;
```

The inverse. A grey has chroma `0` and hue `0`. Every colour of the scales
survives a round trip through `oklchToHex` unchanged (tested). Throws
`TypeError` like `contrast`.

```ts
hexToOklch('#2661fa'); // { l: 0.5554…, c: 0.2359…, h: 263.99… }
```

#### `maxChroma(l, h)`

```ts
const maxChroma: (l: number, h: number) => number;
```

Returns the highest chroma sRGB can show at a lightness and hue, found by
bisection. It is how the scales stay inside the gamut.

```ts
maxChroma(0.6, 264); // 0.2167…
maxChroma(0.6, 33); // 0.2214…
```

Next to black the result is small but not zero (`maxChroma(0, 264)` is `0.022`),
because the gamut test has a tolerance of `0.0001` per channel; the colour it
describes is still `#000000`. Throws `TypeError` for a `NaN` or infinite
argument.

#### Theme constants

| Export                   | Value                                                   | Use                                                     |
| ------------------------ | ------------------------------------------------------- | ------------------------------------------------------- |
| `THEME_ATTRIBUTE`        | `"data-theme"`                                          | The attribute the stylesheet reads                      |
| `THEME_STORAGE_KEY`      | `"hd-theme"`                                            | The `localStorage` key the boot script reads            |
| `THEME_BOOT_SCRIPT`      | A 283-byte script, as text                              | Inline it in `<head>`, before the first paint           |
| `THEME_BOOT_SCRIPT_HASH` | `"sha256-yBtu0+cpsTaiuo7oykT/pEhxNmKXW7Q0szD6rE70zOM="` | The CSP source expression that allows exactly that text |

The boot script sets `data-theme` on the root element before the first paint, so
a stored choice does not flash the other theme:

1. It reads `localStorage["hd-theme"]`. `"light"` and `"dark"` are used as they
   are; anything else, and a storage that throws, means "no choice".
2. With no choice it uses the system setting (`prefers-color-scheme`).
3. It listens for the system setting changing and runs again.

It writes nothing to storage and defines no global. The script is optional:
without it, `tokens.css` still follows the system by itself, and only a stored
choice needs JavaScript. See [Switch the theme](#switch-the-theme) and
[Content Security Policy](#content-security-policy).

### Fonts

```ts
import '@handijitcom/ui/fonts.css';
```

| Family        | Token               | Axes and weights                               | Files |
| ------------- | ------------------- | ---------------------------------------------- | ----- |
| Archivo       | `--hd-font-display` | Variable: weight 100 to 900, width 62% to 125% | 2     |
| Inter         | `--hd-font-body`    | Variable: weight 100 to 900                    | 2     |
| IBM Plex Mono | `--hd-font-mono`    | Static: 400 and 500                            | 4     |

Each family comes as a `latin` and a `latin-ext` file with a `unicode-range`, so
the browser downloads a file only when the page uses a character in it. Turkish
needs both: `ğ`, `ş` and `İ` are in `latin-ext`. Every rule has
`font-display: swap`. Italics are not included; the browser synthesises them.

`fonts.css` refers to the files with relative URLs (`./fonts/…`), which every
bundler resolves. To preload the font of the first screen, import the file to
get its URL:

```ts
import interLatin from '@handijitcom/ui/fonts/inter-latin-wght-normal.woff2';
// <link rel="preload" as="font" type="font/woff2" href={interLatin} crossOrigin="anonymous" />
```

What that import returns is up to the bundler (a URL in Vite and webpack), and
TypeScript needs the bundler's declaration for `*.woff2` modules.

The fonts are copied from the Fontsource packages at build time and are licensed
under the SIL Open Font License 1.1; the licence of each family is at
`@handijitcom/ui/fonts/LICENSE-<family>.txt`.

### Logos

| Name         | File                                   | `viewBox`               |
| ------------ | -------------------------------------- | ----------------------- |
| `mark`       | `@handijitcom/ui/logos/mark.svg`       | `0 0 618.034 1000`      |
| `horizontal` | `@handijitcom/ui/logos/horizontal.svg` | `0 0 6004.732 1109.971` |

Each logo is two paths: the body, painted with `currentColor`, and the square
dot, painted with `var(--hd-logo-dot, var(--hd-accent, #fb6041))`. Inline in the
page, the logo therefore takes the text colour and the accent of the theme
around it, and `--hd-logo-dot` overrides the dot alone:

```tsx
import { logos } from '@handijitcom/ui/design';

const Mark = () => (
  <svg viewBox={logos.mark.viewBox} role="img" aria-label="Han Dijit" height="32">
    <path fill="currentColor" d={logos.mark.body} />
    <path fill="var(--hd-logo-dot, var(--hd-accent))" d={logos.mark.dot} />
  </svg>
);
```

```css
.footer-logo {
  color: var(--hd-on-primary);
  --hd-logo-dot: currentColor; /* one-colour version */
}
```

An SVG loaded as an image (`<img src>`, CSS `background-image`) cannot see the
page's colours: the body is then black and the dot is the coral fallback. Use
the files that way only on a light background; inline the paths everywhere else.

The Han Dijit name and logo are trademarks of Han Dijit. The MIT licence of this
package covers the code, not the right to use the logo for another product.

---

## Guides

### Switch the theme

```ts
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY, type ThemePreference } from '@handijitcom/ui/design';

const setTheme = (preference: ThemePreference): void => {
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  if (preference === 'system') {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } else {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  }
  root.setAttribute(THEME_ATTRIBUTE, preference === 'system' ? system : preference);
};
```

Store only `"light"` or `"dark"`; "system" is the absence of the key. The boot
script keeps following the system afterwards, because it reads the storage again
whenever the system setting changes.

### Theme islands

```html
<body>
  <main>Follows the page.</main>
  <footer data-theme="dark">
    Always dark.
    <div class="card" data-theme="light">Light again.</div>
  </footer>
</body>
```

```css
[data-theme] {
  background: var(--hd-bg-page);
  color: var(--hd-text);
}
```

For a brand section that is the same in both themes, use the brand surface
instead of an island: `--hd-primary` with `--hd-on-primary` on it, and
`--hd-brand-surface-deep` for its deeper step.

### Colour a chart

```ts
import { cssVarName } from '@handijitcom/ui/design';

const CHART_TOKENS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6'] as const;

// Reads the colours where the chart is, so a chart inside a theme island and a
// page that follows the system both get the right set.
const seriesColours = (element: Element): string[] => {
  const style = getComputedStyle(element);
  return CHART_TOKENS.map(token => style.getPropertyValue(cssVarName(token)).trim());
};
```

Use the six colours in order. They are at least 10 ΔE apart (17.9 light, 20.2
dark) and at least 3:1 against the page, surface and raised backgrounds in both
themes. They are tints of cobalt, coral and ink, so series 4 to 6 repeat the hues
of 1 to 3 in another lightness: with more than three series, label the lines or
bars directly, or add markers or dash patterns, and keep the legend. For an SVG
chart, `stroke: var(--hd-chart-1)` needs no JavaScript at all.

### Content Security Policy

```ts
import { THEME_BOOT_SCRIPT, THEME_BOOT_SCRIPT_HASH } from '@handijitcom/ui/design';

const html = `<script>${THEME_BOOT_SCRIPT}</script>`;
const policy = `script-src 'self' '${THEME_BOOT_SCRIPT_HASH}'; font-src 'self'`;
```

The digest covers the text of the script exactly as exported. Do not minify,
indent or wrap it, and do not let a template add whitespace inside the
`<script>` element, or the browser will refuse to run it. The digest changes
only when a new version of the package changes the script; import the constant
rather than copying the string.

---

## Framework integration

### Next.js (App Router)

```tsx
// app/layout.tsx
import '@handijitcom/ui/tokens.css';
import '@handijitcom/ui/fonts.css';
import { THEME_BOOT_SCRIPT } from '@handijitcom/ui/design';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- `suppressHydrationWarning` on `<html>` is required: the boot script adds
  `data-theme` before React hydrates, so the attribute differs from the server
  markup on purpose.
- With a CSP, add `'${THEME_BOOT_SCRIPT_HASH}'` to `script-src` in the header
  that `next.config` or the middleware sets. A hash, unlike a nonce, keeps the
  page statically cacheable.
- The JavaScript entry touches neither `window` nor `document`, so it is safe to
  import in Server Components, route handlers and the Edge runtime.
- For SCSS modules, `@use "@handijitcom/ui/tokens.scss" as *;` works as it is.

### Electron

```ts
// main process
import { BrowserWindow, nativeTheme } from 'electron';
import { effectValues, themes } from '@handijitcom/ui/design';

const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';

const window = new BrowserWindow({
  // The colour the window shows before the renderer paints.
  backgroundColor: themes[theme]['bg-page'],
});

// The scrim of a native sheet, where no custom property can be read.
const { color, alpha } = effectValues[theme].scrim; // "#091122", 0.48
```

In the renderer, load `tokens.css` and `fonts.css` through the bundler like any
web page. `prefers-color-scheme` follows `nativeTheme`, so system mode works
without code. A main process that cannot `import` the package can read
`@handijitcom/ui/tokens.json` instead.

### Plain HTML

```html
<link rel="stylesheet" href="/vendor/handijit-design/tokens.css" />
<link rel="stylesheet" href="/vendor/handijit-design/fonts.css" />
<script src="https://unpkg.com/@handijitcom/ui/design"></script>
<script>
  document.body.style.background = handijitDesign.cssVar('bg-page');
</script>
```

Copy `build/tokens.css`, `build/fonts.css` and `build/fonts/` together: the
stylesheet finds the fonts by relative URL.

---

## Semantics

### What the test suite guarantees, in both themes

| Pair                                                                                              | Minimum                 |
| ------------------------------------------------------------------------------------------------- | ----------------------- |
| `text` on `bg-page`, `bg-surface`, `bg-raised`, `bg-overlay`, `bg-inset`, `selection-bg`          | 7:1                     |
| `text-2` on `bg-page`, `bg-surface`, `bg-raised`, `bg-overlay`, `bg-inset`                        | 4.5:1                   |
| `text-3` on `bg-page`, `bg-surface`, `bg-raised`, `bg-overlay`                                    | 4.5:1                   |
| `primary-text`, `accent-text` on `bg-page`, `bg-surface`, `bg-raised` and on their own `-soft`    | 4.5:1                   |
| `on-primary` on `primary`, `primary-hover`, `primary-active`                                      | 4.5:1                   |
| `on-accent` on `accent`, `accent-hover`, `accent-active`                                          | 4.5:1                   |
| `<status>-fg` on `<status>-bg`; `<status>-on-solid` on `<status>-solid`                           | 4.5:1                   |
| `on-primary` on `brand-surface-deep`                                                              | 7:1                     |
| `focus`, `chart-1` to `chart-6`, `<status>-solid` on `bg-page`, `bg-surface`, `bg-raised`         | 3:1                     |
| `on-primary` (the white ring and outlines) on `primary`, `brand-surface-deep`                     | 3:1                     |
| `on-primary` over the centre of a glow on `primary`                                               | 4.5:1                   |
| `primary` on `bg-page` (the brand surface needs no edge)                                          | 3:1                     |
| `border-control` on `bg-page`, `bg-surface`, `bg-raised`, `bg-inset`, `bg-overlay`, `bg-disabled` | 3:1, and below `text-3` |
| `border-strong` on `bg-page`, `bg-surface`, `bg-raised`                                           | 1.25:1                  |
| `text-disabled` on `bg-page`, `bg-surface`, `bg-raised`, `bg-disabled`                            | 2:1, and below `text-3` |
| Any two chart colours                                                                             | 10 ΔE                   |
| `accent` and `danger-solid`                                                                       | 10 ΔE                   |

Not guaranteed, by design:

- `text-3` on `bg-inset` is 4.35:1 in the light theme. Use `text-2` in wells.
- Every chromatic colour, scale step and hue is cobalt (250°–275°), coral
  (25°–45°) or danger red (355°–25°) in OKLCH; everything else is an ink neutral
  (chroma ≤ 0.045). The palette has no green, amber, violet, cyan or navy (3.0).
- Coral on cobalt is 1.64:1: the coral button on the brand surface is identified
  by its label (6.15:1), and coral punctuation there is decoration.
- `border` is a hairline between surfaces, not a WCAG-rated indicator. Use
  `border-control` where an outline is what identifies a control. `border-strong`
  is a stronger hairline, 1.3:1 to 2.4:1, and is not rated either.
- No theme colour is pure black (`#000000`); the dark theme is a night navy.
  Shadows in the dark theme are black, with alpha.

### How inputs are handled

| Input                                               | Result                                                  |
| --------------------------------------------------- | ------------------------------------------------------- |
| `data-theme="light"` or `"dark"` on any element     | That theme for the element and what is inside it        |
| Any other `data-theme` value                        | Ignored                                                 |
| No `data-theme`, system dark                        | Dark                                                    |
| `prefers-reduced-motion: reduce`                    | The three duration tokens become `0.01ms`               |
| `localStorage["hd-theme"]` is `"light"` or `"dark"` | The boot script applies it                              |
| Any other stored value, or storage that throws      | The boot script applies the system setting              |
| `#rrggbb` or `#rgb`, any letter case                | Accepted by `contrast`, `deltaE`, `hexToOklch`          |
| A hex without `#`, a colour name, a non-string      | `TypeError`                                             |
| An OKLCH colour outside sRGB                        | Chroma is reduced until it fits; lightness and hue stay |
| `NaN`, `Infinity` or a missing OKLCH field          | `TypeError`                                             |

Durations become `0.01ms` rather than `0ms` so that `transitionend` and
`animationend` still fire and code waiting for them does not hang.

---

## Performance

There is no benchmark, because nothing is computed at run time: the scales, the
themes, the shadows and the script digest are derived when the package is built
and shipped as literals. Importing the entry evaluates object literals and seven
small functions. `cssVar` and `cssVarName` build one string; the colour helpers
do a fixed amount of arithmetic per call (`maxChroma` and an out-of-gamut
`oklchToHex` run a 24-step bisection).

## Bundle size

Measured on the design build (`build/design/`), 3.0.0 (gzip level 9, Brotli
quality 11):

| File                         | Raw      | Gzip    | Brotli  |
| ---------------------------- | -------- | ------- | ------- |
| `build/design/index.mjs`     | 25.42 kB | 7.97 kB | 6.72 kB |
| `build/design/index.cjs`     | 25.93 kB | 8.04 kB | 6.78 kB |
| `build/design/index.umd.cjs` | 13.67 kB | 5.08 kB | 4.33 kB |
| `build/design/index.d.mts`   | 17.46 kB | 5.69 kB | 4.87 kB |
| `build/design/tokens.css`    | 11.47 kB | 2.56 kB | 2.09 kB |
| `build/design/tokens.scss`   | 19.29 kB | 3.44 kB | 2.42 kB |
| `build/design/tokens.json`   | 12.77 kB | 2.35 kB | 1.96 kB |
| `build/design/fonts.css`     | 3.13 kB  | 0.52 kB | 0.43 kB |
| `build/logos/mark.svg`       | 0.60 kB  | 0.31 kB | 0.27 kB |
| `build/logos/horizontal.svg` | 2.83 kB  | 1.04 kB | 0.88 kB |

| Font file                                  | Raw       |
| ------------------------------------------ | --------- |
| `archivo-latin-wdth-normal.woff2`          | 90.10 kB  |
| `archivo-latin-ext-wdth-normal.woff2`      | 86.24 kB  |
| `inter-latin-wght-normal.woff2`            | 48.26 kB  |
| `inter-latin-ext-wght-normal.woff2`        | 85.07 kB  |
| `ibm-plex-mono-latin-400-normal.woff2`     | 14.71 kB  |
| `ibm-plex-mono-latin-500-normal.woff2`     | 14.89 kB  |
| `ibm-plex-mono-latin-ext-400-normal.woff2` | 13.35 kB  |
| `ibm-plex-mono-latin-ext-500-normal.woff2` | 13.43 kB  |
| 8 files                                    | 366.04 kB |

The ESM and CJS builds are not minified; your bundler does that, and drops the
token maps you do not import. CI fails when the minified browser bundle exceeds
6000 B gzip, `tokens.css` exceeds 3500 B gzip or the fonts exceed 400 000 B.

| Consumer    | Resolves to                                         | Types                      |
| ----------- | --------------------------------------------------- | -------------------------- |
| `import`    | `build/design/index.mjs`                            | `build/design/index.d.mts` |
| `require`   | `build/design/index.cjs`                            | `build/design/index.d.ts`  |
| `<script>`  | `build/design/index.umd.cjs` (`handijitDesign`)     |                            |
| Stylesheets | `build/design/tokens.css`, `build/design/fonts.css` | `build/*.d.css.ts`         |

## TypeScript

- Token names are unions, so a typo is a compile error: `TokenName` is every
  token, `ColorToken` the 46 theme colours, `EffectToken` the 16 effects,
  `ThemedToken` both, `ScaleToken` the 46 scale steps and `StaticToken` every
  theme-independent token.
- `Theme` is `Readonly<Record<ColorToken, string>>`: a theme cannot miss a token,
  and neither can an object you declare as `Theme`.
- The remaining exported types name the keys and shapes of the maps:
  `ThemeName`, `ThemePreference`, `Themes`, `ThemeEffects`, `Effects`,
  `EffectValues`, `ThemeEffectValues`, `EffectTone`, `ShadowLayer`,
  `BrandSurfaceEffectValues`, `BrandSurfaceRecipe`, `GradientStop`,
  `ShadowLevel`, `Scales`, `ScaleName`, `ChromaticScaleName`, `ChromaticScale`,
  `ChromaticStep`, `NeutralScale`, `NeutralStep`, `HueName`, `StatusName`,
  `ChartIndex`, `Oklch`, `FontRole`, `Fonts`, `FontWeightName`, `FontWeights`,
  `TypeRole`, `TypeProperty`, `TypeStyle`, `Typography`, `SpaceStep`, `Spacing`,
  `RadiusName`, `Radii`, `DurationName`, `EasingName`, `Motion`, `LayerName`,
  `Layers`, `BreakpointName`, `Breakpoints`, `LogoName`, `Logo`, `Logos`.
- `import "@handijitcom/ui/tokens.css"` type-checks under
  `noUncheckedSideEffectImports`: the package ships a declaration for each
  stylesheet.
- `import tokens from "@handijitcom/ui/tokens.json"` needs `resolveJsonModule`.

## FAQ and troubleshooting

**The page flashes light before turning dark.** The stored choice is applied by
JavaScript. Inline `THEME_BOOT_SCRIPT` in `<head>`, before any stylesheet that
is not render-blocking; do not load it with `defer` or from a module.

**The boot script does not run and the console reports a CSP violation.** The
text in the page is not byte-for-byte the exported string. See
[Content Security Policy](#content-security-policy).

**A dark island has dark text on a dark background.** `color` was computed on an
ancestor. Set `background` and `color` on the island itself; see
[Theme islands](#theme-islands).

**React warns that `data-theme` did not match.** Add `suppressHydrationWarning`
to `<html>`.

**Sass says it cannot find the stylesheet.** The plain Sass compiler does not
read `exports`. Use `pkg:@handijitcom/ui/tokens.scss` with the Node package
importer, or let the bundler's Sass integration resolve the import.

**Can I use a `$hd-*` variable in `color.adjust()`?** No; it is a `var()`
reference. See [SCSS](#scss).

**Why is body text 15px?** The products are data-dense panels and desktop tools.
The value is in `rem` (`0.9375rem`), so it still follows the reader's setting.

### Known limitations

- Italic styles are not shipped.
- The fonts cover the `latin` and `latin-ext` subsets only.
- In the horizontal logo the descender of the "J" reaches 12 units below the
  `viewBox`, as it does in the source artwork, and is clipped there.
- The token maps are read-only for the type system but are not frozen at run
  time; do not write to them.

## Working on the tokens

- The tokens live in `src/design/tokens/`; everything in `build/design/` is
  generated from them by `src/design/generators/` (`npm run build:design`, part
  of `npm run build`). Do not edit a generated file.
- The tests are in `__tests__/design/`. A colour change must keep
  `gates.test.ts` green and is expected to break `recipe.test.ts` and the tables
  in this file; update the approved fixture, the snapshot and the tables in the
  same commit.
- Removing or renaming a token, custom property, SCSS member, export or file
  path, or changing the value of an existing token, is a major version of
  `@handijitcom/ui`; adding one is a minor version.

## License

[MIT](../LICENSE) © Han Dijit, for the code and the generated token files.

The bundled fonts are licensed separately under the
[SIL Open Font License 1.1](https://openfontlicense.org): Archivo © The Archivo
Project Authors, Inter © The Inter Project Authors, IBM Plex Mono © IBM Corp.
Their licence texts ship in `build/design/fonts/`. The Han Dijit name and logo are
trademarks and are not licensed for other use.
