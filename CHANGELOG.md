# Changelog

One section per version: **breaking**, **added**, **fixed**, and for a major version a migration
section that can be followed line by line. Headings are `## [x.y.z] — date`: the publish workflow
reads the section of the version being released and uses it as the GitHub Release note. Sections up
to 1.0.0 are in Turkish, as written at the time; the 5.x tables of `@ahmetilhn/hanui` live in the
README of the 1.0.0 tarball.

## [2.2.0] — 2026-11-10

**Form fields speak `Field`'s contract.** The gaps found while building `@handijit/forms` 1.0 and
the desktop template, each of which needed a workaround in a binder. Everything is additive;
three things look or behave differently and are listed under "Changed".

### Added

- **`Checkbox`, `Switch`, `Radio` `error`**: the message under the label (`role="alert"`, the
  danger icon), `aria-invalid` and the `aria-describedby` link. An invalid box, radio or switch
  track draws the danger edge of an invalid field, also from a passed `aria-invalid`.
- **`Field` `id`** (the control's id; the messages take `<id>-error` and `<id>-hint`) and a
  `ReactNode` `label`.
- **`id`, `aria-invalid`, `aria-describedby`, `required`** on `QuantityStepper`,
  `SegmentedControl`, `ChipGroup`, `RangeSlider`, `RatingInput` and `DateRange`, so
  `{...props}` from `Field` links the error and hint. Where each lands: the number box, the
  `radiogroup`, the group, the low thumb (`<id>-high` on the high one) and both thumbs, the
  `<fieldset>`, the start field (`<id>-end`) and both fields; the table is in the README ("Form
  fields"). `QuantityStepper` and `SegmentedControl` draw the danger edge when invalid.
- **`Select`**: `value` can be `null` (the placeholder shows); `onBlur`; a `ref` to the trigger.
- **`Combobox`**: `onBlur`; a `ref` to the trigger. `onBlur` fires when focus leaves the whole
  control, not when it moves between the trigger, the search box and the options, nor while the
  bottom sheet is open.
- **`isReadOnly`** on `Select`, `Combobox`, `QuantityStepper`, `SegmentedControl`, `ChipGroup`,
  `RangeSlider`, `RatingInput`, `DateRange` and `TagInput`: the value stays focusable and readable
  (`aria-readonly` where the role has it, native `readOnly` on the text boxes), nothing changes
  it. A read-only `Select` / `Combobox` draws no caret and no clear button; a read-only
  `TagInput` no remove buttons.
- **`isDisabled`** on `SegmentedControl` and `ChipGroup`: every item at once.
- **`TagInput` `value`** (the name every other field uses) and **`duplicateLabel`** (also
  `labels.tagInput.duplicate` on `UiProvider`) for the "already in the list" announcement.
- **`Progress` / `ProgressCircle` `aria-labelledby`** as the alternative to `label`, for a bar
  named by text already on screen. One of the two is required (`ProgressNameProps`).
- **`@mixin field-error`** in `@handijit/ui/scss`: the error message of a control, as `Field`
  and the choice controls draw it. The SCSS API is 227 names.
- **`npm run check:types`** in `verify`: the built declarations compiled as a `nodenext`
  consumer, ES modules and CommonJS, with `skipLibCheck` off.

### Fixed

- **The declarations resolve under `moduleResolution: "node16"` / `"nodenext"`.** Relative imports
  in the emitted `.d.ts` had no extension (and the sub-entries kept the `@/` source alias), so
  Node's resolution found nothing and a consumer got `any` for the props, silently under
  `skipLibCheck`. Every specifier now names the file (`./Spinner.js`, `./Spinner/index.js`), and
  each `.d.ts` has a `.d.cts` twin: the `require` condition of every `exports` entry points at it
  (`{ import: { types, default }, require: { types, default } }`), so a CommonJS consumer is no
  longer told the package is ESM-only. `attw --pack`: green for `node16` and `bundler` on every
  entry (was "Internal resolution error" and "Masquerading as ESM").
- **A passed `aria-describedby` no longer drops the hint** of `Checkbox`, `Switch` and `Radio`:
  the description is the error, the hint and the passed ids, in that order, each id once (a
  passed list that already names the hint, as `@handijit/forms` 1.0 builds it, does not repeat
  it).
- **`Alert`'s `action` no longer squeezes the text in a narrow container.** The action sits in
  the body beside the text while the text keeps at least 16rem, and moves under it, aligned with
  the text, below that. The phone-only rule is gone; the wrap is the rule at every width.
- **`Button isLoading` no longer renders an empty `role="status"`.** The spinner is decorative;
  the button announces the wait with `aria-busy`.
- **`Combobox`**: pressing an option keeps the focus in the search box (or on the trigger when
  the search is hidden) instead of dropping it on `<body>` before the choice arrives.

### Changed

- **`Spinner label=""`** draws a decorative spinner (`aria-hidden`, no `role="status"`). It drew
  an empty live region, which never announced anything; a test querying `getByRole('status')`
  for an empty-label spinner no longer finds one.
- **`Alert`**: the action is inside the body element (after a new `alert__text` wrapper), not a
  third child of the alert. The class names are hashed CSS-module names, so only a test or
  stylesheet that walked the DOM structure notices.
- **`exports`**: every JavaScript entry nests its types per condition (`import.types` → `.d.ts`,
  `require.types` → `.d.cts`) instead of one top-level `types`. Bundlers and TypeScript resolve
  the same files as before for ES modules.

### Deprecated

- **`TagInput.values`** → `value`. Both work until 3.0.

### Deferred to 3.0

- **`Button` defaults to `type="button"`.** Today a `Button` without `type` inside a `<form>`
  submits, as an HTML `<button>` does, and applications rely on it. Changing the default would
  turn those buttons into dead ones without a type error, so it waits for a major. Until then,
  write `type="button"` on every non-submit `Button` inside a form.
- **`TagInput.duplicateLabel` without a Turkish fallback**: 2.2 keeps the 2.0 text
  (`"<value> zaten ekli"`) when neither the prop nor the provider gives one; 3.0 asks for the label
  like every other text.
- **`TagInput.values`** is removed.

## [2.1.1] — 2026-11-10

### Fixed

- **`SegmentedControl` draws the chosen segment above its track in dark too.** The segment was
  filled with `bg-surface`, which is a step DARKER than the `bg-raised` track in the dark theme,
  so the choice looked pressed into the control. It is now `bg-overlay`: white on the light
  track, a step lighter on the dark one. A test holds both the declaration and the order of the
  two tokens in each theme.

## [2.1.0] — 2026-11-10

**The edge of a form control is 3:1, and `IconButton` has the variants of `Button`.** Nothing is
renamed or removed. Two things look different after the update: every form control has a darker
resting edge, and `IconButton variant="outline"` is cobalt.

> **`IconButton variant="outline"` changed colour.** In 2.0 it was a neutral frame, while `Button`
> `OUTLINE` was the cobalt one, so the two variants of the same name did not match. It is now the
> cobalt frame of `Button` `OUTLINE`. **Migration, one line: use `variant="secondary"` for the
> neutral look.**

### Requires

- **`@handijit/design ^1.1.0`** (was `^1.0.0`). The control edge is design 1.1's `border-control`;
  with design 1.0 the custom property does not exist and a field is drawn without a border.

### Added

- **`IconButton` `secondary`**: the neutral framed button, the colours of `Button` `SECONDARY` in
  every state (resting, hover, pressed, disabled). `IconButtonVariant` is now `ghost` ·
  `secondary` · `outline` · `solid` · `accent` · `danger`.
- **`$border-control`** in `@handijit/ui/scss` (`var(--hd-border-control)`): the resting edge of a
  form control, for an application that draws a control of its own. The SCSS API is 226 names.

### Changed

- **`IconButton` `outline`** is the cobalt frame of `Button` `OUTLINE` (see above). The library's
  own chrome moved to `secondary` and stays neutral: the arrows of `Carousel`, the stop button of
  `PromptInput`, the scroll-to-latest button of `ChatThread` (and the arrows of `Pagination`, which
  draw their own colours and look as before). Their glyph is `text` (was `text-2`), and a disabled
  `Carousel` arrow or stop button has the disabled look of `Button` `SECONDARY` (`bg-disabled`, no
  frame).
- **The resting edge of every form control is `border-control`** (WCAG 1.4.11, 3:1 against the
  background it sits on; `border-strong` was 1.5:1 in light and 2.1:1 in dark). Fields: `Input`,
  `PasswordInput`, `Textarea`, `Select`, `Combobox`, `DateField`, `DateRange`, `TagInput`,
  `QuantityStepper`, `PromptInput`. Choices: `Checkbox`, `Radio`, `TableCheckbox`, the indicator of
  `RadioCard`, the off track of `Switch`, the frame of `SegmentedControl`. The drop zone of
  `FileUpload`. Separators, cards, table rules and popups keep `border` / `border-strong`.
- **A field on hover** mixes its edge 40% towards `text` (was `border-strong`, 30%), so hover is
  still a visible step from the darker resting edge. Focus, invalid and disabled are unchanged.
- `Checkbox`, `Radio` and the off track of `Switch` were already above 3:1 (`text-3`); they take
  the same role as the fields and are a little lighter than in 2.0.
- `check:contrast` gates `border-control` against every surface and `bg-disabled`: 127 pairs per
  theme, 254 in total.

### Fixed

- **`Radio`: a group with nothing chosen is no longer drawn with every option selected.**
  `:indeterminate` matches each radio of an unanswered group, and the shared style filled it. Only
  `:checked` fills a radio now; `Checkbox` keeps its mixed state.

## [2.0.0] — 2026-11-10

**The library draws with the tokens of `@handijit/design` and owns none.** Han Dijit's site, staff
panel and desktop programs share one theme (cobalt, coral, turquoise; light and dark), defined once
in `@handijit/design`. Until 1.x this library generated its own palette (`--ui-*`, an OKLCH recipe,
a token build step) and carried roles named after a parts shop (`cart`, `oem`, `off`, `sale`). All
of that is gone: component styles read `--hd-*`, the theme switch is design's `data-theme`
contract, and the roles have the names of the design system.

Nothing in 1.x is kept as an alias. An application moves in one step, with the tables below.

### Breaking

- **Tokens.** `@handijit/ui/styles.css` and `base.css` no longer declare a palette. The application
  loads `@handijit/design/tokens.css` once (and `fonts.css` for Archivo, Inter and IBM Plex Mono).
  Every `--ui-*` design token is removed; component-private hooks (`--ui-button-radius`,
  `--ui-chip-*`, `--ui-badge-*`, `--ui-stat-*`, `--ui-header-height`, `--ui-sheet-height`, …) keep
  their names.
- **Peer dependencies.** `@handijit/design ^1.0.0` is new. `@handijit/utils` moves from `^1.0.0` to
  `^2.0.0`.
- **Theme contract.** `data-ui-theme` → `data-theme`; the stored choice lives in
  `localStorage["hd-theme"]`; the attribute always carries the resolved theme (`light` or `dark`),
  also when the user follows the system. `data-ui-density` and the compact density are removed.
- **Theme API.** `initUi`, `applyThemeConfig`, `buildThemeCss`, `resolveTokens`, the theme objects
  and their types are removed. `UiProvider` lost `theme` and renders no `<style>`. A brand override
  is a plain `--hd-*` declaration in the application's stylesheet.
- **Variants and tones.** `UIVariant.CART` → `ACCENT`, `LIGHT` → `SOFT`, `DARK` → `ON_BAND`;
  `IconButton` `cart` → `accent`; `Badge` tones `oem`, `alt`, `sale`, `action`, `link` are removed;
  chart and legend tones `cat-*` / `series-*` → `chart-1…6`.
- **SCSS API** (`@use '@handijit/ui/scss' as ui`). 128 variables renamed or removed, 7 kept their
  name with a different meaning, `for-dark` removed, `heading()` takes a role.
- **Sizes.** Buttons are 28 / 32 / 40 / 48px tall (were 30 / 36 / 44 / 52). Fields are 40px with
  15px text on a desktop pointer and 44px with 16px text on a narrow or touch screen (were always
  44px / 16px). Dense fields (`input-sm`) are 32px (were 36px). Touch targets stay 44px through the
  invisible `tap-target` area.
- **Select and Combobox** open a bottom sheet only when the viewport is at most 640px wide **and**
  the pointer is coarse. A desktop window, however narrow, gets the anchored dropdown. In 1.x the
  rule was width alone.
- **Layers.** z-index values are design's: dropdown 1000, overlay 1100, modal 1200, popover 1300,
  toast 1400, tooltip 1500 (were 200 – 500). An application layer that had to sit above or below
  the library needs a new number, or better, a `--hd-z-*` token.
- **Disabled controls.** A disabled `Button`, `IconButton` and `Switch` draw design's disabled pair
  (`text-disabled` on `bg-disabled`: 2.06:1 in light, 2.28:1 in dark). 1.x gated the label of a
  disabled control at 4.5:1; WCAG 1.4.3 exempts disabled controls, and `check:contrast` now prints
  the number without failing on it. A disabled field keeps readable text (`text-3` on `bg-raised`).

### Added

- `UIVariant.ACCENT`: the coral conversion button (download, try, subscribe). Coral appears on
  `Button` and `IconButton` and nowhere else; a test holds that line.
- `UiThemeScript` takes `nonce` and inlines design's boot script unchanged, so a policy can also
  allow it by hash: `THEME_BOOT_SCRIPT_HASH`. `THEME_BOOT_SCRIPT`, `THEME_BOOT_SCRIPT_HASH` and
  `THEME_STORAGE_KEY` are re-exported from `@handijit/design`.
- `SHEET_MEDIA_QUERY`: the media query of the sheet rule above.
- `useUiTheme()` stores the choice where the boot script reads it; `UiThemeState` is its return
  type. `useUiTokens()` takes design token names (`'chart-1'`, `'border'`), typed by design's
  `TokenName`.
- SCSS: `type($role)` (a whole design type role), `block-title`, `choice-control($shape)`,
  `$state-hover` / `$state-pressed` (state layers that work on any surface), `$focus`,
  `$focus-halo`, `$focus-inset`, the `$primary-*`, `$accent-*`, `$highlight-*`, `$success-*`,
  `$warning-*`, `$danger-*`, `$info-*`, `$chart-1…6`, `$bg-*`, `$inverse-*` families and the
  `$z-*` layers of the design package.
- `Badge` tone `highlight` (turquoise: new, live).
- Guard tests: every `--hd-*` name the library writes exists in the installed design package, no
  stylesheet carries a literal colour or declares a token, coral / turquoise / band stay inside
  their components, and no 1.x role name comes back.

### Fixed

- Floating surfaces (menu, popover, select and combobox lists, dialog, drawer, command palette,
  toast) sit on `bg-overlay`, which is lighter than the page in dark mode; in 1.x a dark dropdown
  was the colour of the card under it.
- Checkbox and radio are drawn with tokens instead of an embedded image, so the mark follows the
  theme; forced-colours mode gets the native control.
- Hover and pressed states are a text-colour layer, visible on every surface in both themes.
- Slider, progress and switch tracks are visible in dark mode.

### Migration from 1.x

Work through the steps in order. Each table is old → new.

#### 1. Dependencies

```sh
npm install @handijit/ui@^2.0.0 @handijit/design@^1.0.0 @handijit/utils@^2.0.0
```

`@handijit/design` is a peer dependency: the application installs it, so the page has one copy of
the tokens no matter how many packages draw with them.

#### 2. Stylesheets

Stylesheet paths of this package did not change (`styles.css`, `base.css`,
`components/*/style.css`, `chat.css`, `charts.css`, `scss`). What changed is that the tokens are a
separate import, **before** the library's:

```ts
import '@handijit/design/tokens.css'; // every --hd-* token, light and dark
import '@handijit/design/fonts.css'; // optional: Archivo, Inter, IBM Plex Mono
import '@handijit/ui/styles.css';
```

Without `tokens.css` every component renders without colour, radius and spacing.

#### 3. Theme attribute, storage and boot script

| 1.x | 2.0 |
| --- | --- |
| `<html data-ui-theme="dark">` | `<html data-theme="dark">` |
| `[data-ui-theme='dark'] .x { … }` | `[data-theme='dark'] .x { … }` |
| no attribute = follow the system | the boot script and `useUiTheme` write the resolved theme; without either, `tokens.css` still follows `prefers-color-scheme` |
| `<UiThemeScript storageKey="theme" />` | `<UiThemeScript />` or `<UiThemeScript nonce={nonce} />`; the key is always `hd-theme` |
| the application's own storage key | `localStorage["hd-theme"]` (`THEME_STORAGE_KEY`), values `light` / `dark`, absent = system. Copy a stored choice over once if it must survive the upgrade. |
| `data-ui-density="compact"`, `COMPACT_DENSITY`, `DENSITY_ATTRIBUTE` | removed, no replacement |
| `THEME_ATTRIBUTE` (`'data-ui-theme'`) | `THEME_ATTRIBUTE` (`'data-theme'`), re-exported from design |
| `<style id="ui-theme-overrides">` | no longer rendered |

Content-Security-Policy: pass the request nonce to `UiThemeScript`, or add
`THEME_BOOT_SCRIPT_HASH` (`'sha256-…'`, already quoted for the header) to `script-src`. The library
injects nothing else: no `<style>` element, no other script.

#### 4. Theme overrides

| 1.x | 2.0 |
| --- | --- |
| `initUi({ theme, colorScheme, density })` | delete the call; see the rows below |
| `<UiProvider theme={{ light: { link: '#0a58ca' } }}>` | `:root { --hd-primary-text: #0a58ca; }` in the application's stylesheet (per theme: `[data-theme='dark'] { … }`) |
| `applyThemeConfig(config)`, `buildThemeCss(config)`, `resolveTokens(config)` | removed; write `--hd-*` declarations |
| `LIGHT_THEME`, `DARK_THEME` | `themes.light`, `themes.dark` from `@handijit/design` |
| `DEFAULT_FONTS`, `UiFonts` | `--hd-font-display`, `--hd-font-body`, `--hd-font-mono` |
| `METRIC_TOKENS`, `UiMetrics`, `UiMetricToken` | `radii`, `spacing`, `typography`, `motion` from `@handijit/design` |
| `UiToken`, `UiThemeTokens`, `UiResolvedTokens` | `TokenName` from `@handijit/design` |
| `UiThemeConfig`, `InitUiOptions`, `UiDensity` | removed |
| `useUi().theme` | removed; `useUi()` returns `linkComponent` and `labels` |
| `useUiTokens(['series-1', 'border'])` | `useUiTokens(['chart-1', 'border'])`: design token names without `--hd-` |
| `setScheme('system')` removed the attribute | removes the stored key and writes the system's theme to the attribute |

#### 5. Variants, tones and props

| Component | 1.x | 2.0 |
| --- | --- | --- |
| `Button` | `UIVariant.CART` | `UIVariant.ACCENT` |
| `Button` | `UIVariant.LIGHT` | `UIVariant.SOFT` |
| `Button` | `UIVariant.DARK` | `UIVariant.ON_BAND` |
| `Button` | `PRIMARY`, `SECONDARY`, `OUTLINE`, `GHOST`, `DANGER` | unchanged names; `PRIMARY` is cobalt, `OUTLINE` a cobalt frame, `GHOST` link-coloured text |
| `IconButton` | `variant="cart"` | `variant="accent"` |
| `Badge` | `tone="oem"` | `tone="info"` |
| `Badge` | `tone="alt"` | `tone="highlight"` |
| `Badge` | `tone="sale"` | `tone="danger" variant="solid"` (a discount) or `tone="success"` (a positive change) |
| `Badge` | `tone="action"` | `tone="info" variant="solid"` |
| `Badge` | `tone="link"` | `tone="info"` |
| charts, `Legend`, `SegmentBar` | `tone="cat-1"` … `"cat-5"` | `"chart-1"` … `"chart-5"` |
| charts, `Legend`, `SegmentBar` | `tone="series-1"` | `"chart-1"` |
| charts, `Legend`, `SegmentBar` | `tone="series-2"` | `"chart-6"` |
| `UiThemeScript` | `storageKey` (required) | removed; `nonce` (optional) added |
| `UiProvider` | `theme` | removed |

`UISize` kept its four members; the heights changed (see Breaking).

#### 6. Removed and added exports of `@handijit/ui`

Removed: `COMPACT_DENSITY`, `DARK_THEME`, `DEFAULT_FONTS`, `DENSITY_ATTRIBUTE`, `InitUiOptions`,
`LIGHT_THEME`, `METRIC_TOKENS`, `UiDensity`, `UiFonts`, `UiMetricToken`, `UiMetrics`,
`UiResolvedTokens`, `UiThemeConfig`, `UiThemeTokens`, `UiToken`, `applyThemeConfig`,
`buildThemeCss`, `initUi`, `resolveTokens` (replacements in step 4).

Added: `SHEET_MEDIA_QUERY`, `THEME_BOOT_SCRIPT`, `THEME_BOOT_SCRIPT_HASH`, `THEME_STORAGE_KEY`,
`UiThemeState`.

`@handijit/ui/chat` and `@handijit/ui/charts` export the same names as in 1.0.0.

#### 7. Custom properties and SCSS variables

In 1.x every SCSS variable `$name` was `var(--ui-name)`, so one table serves both: a stylesheet that
wrote `var(--ui-action)` follows the row of `$action` and writes the custom property of the third
column.

**Rename in a single pass.** Seven names exist on both sides with different meanings
(`$radius-sm`, `$radius-md`, `$radius-lg`, `$space-8`, `$font-size-body`, `$z-base`, `$z-raised`);
applying the rows one after another would rename a value twice.

| 1.x (`$name` and `--ui-name`) | 2.0 SCSS variable | 2.0 custom property | Note |
| --- | --- | --- | --- |
| `$action` | `$primary` | `--hd-primary` |  |
| `$action-active` | `$primary-active` | `--hd-primary-active` |  |
| `$action-hover` | `$primary-hover` | `--hd-primary-hover` |  |
| `$action-line` | `$primary` | `--hd-primary` | the primary fill has no separate line |
| `$action-soft` | `$bg-disabled` | `--hd-bg-disabled` | the disabled fill |
| `$alt-bg` | `$highlight-soft` | `--hd-highlight-soft` |  |
| `$alt-fg` | `$highlight-text` | `--hd-highlight-text` |  |
| `$alt-line` | `$highlight` | `--hd-highlight` |  |
| `$bad-bg` | `$danger-bg` | `--hd-danger-bg` |  |
| `$bad-fg` | `$danger-fg` | `--hd-danger-fg` |  |
| `$bad-line` | `$danger-line` | `--hd-danger-line` |  |
| `$band-accent` | `$highlight` | `--hd-highlight` |  |
| `$band-fg` | `$band-text` | `--hd-band-text` |  |
| `$band-fg-2` | `$band-text-2` | `--hd-band-text-2` |  |
| `$band-fg-3` | `$band-text-2` | `--hd-band-text-2` |  |
| `$band-hover` | `$band-line` | `--hd-band-line` |  |
| `$breakpoint-desktop` | `$breakpoint-xl` | — (SCSS only) |  |
| `$breakpoint-mobile` | `$breakpoint-sm` | — (SCSS only) |  |
| `$breakpoint-tablet` | `$breakpoint-lg` | — (SCSS only) |  |
| `$breakpoint-tablet-portrait` | `$breakpoint-md` | — (SCSS only) |  |
| `$cart` | `$accent` | `--hd-accent` |  |
| `$cart-active` | `$accent-active` | `--hd-accent-active` |  |
| `$cart-hover` | `$accent-hover` | `--hd-accent-hover` |  |
| `$cart-soft` | `$bg-disabled` | `--hd-bg-disabled` | the disabled fill |
| `$cat-1` | `$chart-1` | `--hd-chart-1` |  |
| `$cat-2` | `$chart-2` | `--hd-chart-2` |  |
| `$cat-3` | `$chart-3` | `--hd-chart-3` |  |
| `$cat-4` | `$chart-4` | `--hd-chart-4` |  |
| `$cat-5` | `$chart-5` | `--hd-chart-5` |  |
| `$danger-solid-hover` | — | — | no token; `color-mix(in oklab, #{ui.$danger-solid} 88%, black)` is what `Button` uses |
| `$duration-instant` | `$duration-fast` | `--hd-duration-fast` |  |
| `$duration-normal` | `$duration-base` | `--hd-duration-base` |  |
| `$ease-in-out` | `$ease-standard` | `--hd-ease-standard` |  |
| `$ease-out` | `$ease-standard` | `--hd-ease-standard` | or `$ease-enter` for something that appears |
| `$ease-spring` | `$ease-standard` | `--hd-ease-standard` | no overshoot curve in the design |
| `$font-heading` | `$font-display` | `--hd-font-display` |  |
| `$font-size-2xl` | `$font-size-h2` | `--hd-type-h2-size` |  |
| `$font-size-2xs` | `$font-size-caption` | `--hd-type-caption-size` | 12px; the design has nothing smaller |
| `$font-size-3xl` | `$font-size-h2` | `--hd-type-h2-size` | or `$font-size-h1` |
| `$font-size-4xl` | `$font-size-h1` | `--hd-type-h1-size` |  |
| `$font-size-base` | `$font-size-body` | `--hd-type-body-size` |  |
| `$font-size-body` | `$font-size-lead` | `--hd-type-lead-size` | 17px; `$font-size-body` is now 15px |
| `$font-size-lg` | `$font-size-h4` | `--hd-type-h4-size` |  |
| `$font-size-sm` | `$font-size-small` | `--hd-type-small-size` |  |
| `$font-size-xl` | `$font-size-h3` | `--hd-type-h3-size` |  |
| `$font-size-xs` | `$font-size-caption` | `--hd-type-caption-size` |  |
| `$font-steps` | `$type-roles` | — (SCSS only) | the list of type roles |
| `$font-ui` | `$font-body` | `--hd-font-body` |  |
| `$footer-bg` | `$bg-raised` | `--hd-bg-raised` |  |
| `$glass` | `$bg-overlay` | `--hd-bg-overlay` | opaque; the design has no translucent surface |
| `$glass-solid` | `$bg-overlay` | `--hd-bg-overlay` |  |
| `$glow-1` | — | — | removed, no replacement: decorative glows are gone |
| `$glow-2` | — | — | removed, no replacement |
| `$glow-cart` | — | — | removed, no replacement |
| `$green-accent` | `$success-solid` | `--hd-success-solid` |  |
| `$green-accent-hover` | `$success-solid` | `--hd-success-solid` | one success fill |
| `$leading-relaxed` | `$leading-normal` | `--hd-type-body-line-height` |  |
| `$link` | `$primary-text` | `--hd-primary-text` |  |
| `$link-hover` | `$primary-text` | `--hd-primary-text` | the hover is an underline, not a second colour |
| `$media-bg` | `$bg-inset` | `--hd-bg-inset` |  |
| `$nav-bg` | `$bg-surface` | `--hd-bg-surface` | a plain surface; `$band-*` is the cobalt brand band |
| `$nav-bg-2` | `$bg-raised` | `--hd-bg-raised` |  |
| `$nav-fg` | `$text` | `--hd-text` |  |
| `$nav-fg-2` | `$text-2` | `--hd-text-2` |  |
| `$nav-fg-3` | `$text-3` | `--hd-text-3` |  |
| `$nav-hover` | `$state-hover` | — (SCSS only) |  |
| `$nav-line` | `$border` | `--hd-border` |  |
| `$nav-line-strong` | `$border-strong` | `--hd-border-strong` |  |
| `$oem-bg` | `$info-bg` | `--hd-info-bg` |  |
| `$oem-fg` | `$info-fg` | `--hd-info-fg` |  |
| `$oem-line` | `$info-line` | `--hd-info-line` |  |
| `$off-bg` | `$bg-raised` | `--hd-bg-raised` | the "off" role is the neutral tone |
| `$off-fg` | `$text-2` | `--hd-text-2` |  |
| `$off-line` | `$border` | `--hd-border` |  |
| `$ok-bg` | `$success-bg` | `--hd-success-bg` |  |
| `$ok-fg` | `$success-fg` | `--hd-success-fg` |  |
| `$ok-line` | `$success-line` | `--hd-success-line` |  |
| `$on-action` | `$on-primary` | `--hd-on-primary` |  |
| `$on-action-soft` | `$text-disabled` | `--hd-text-disabled` | text on the disabled fill |
| `$on-cart` | `$on-accent` | `--hd-on-accent` |  |
| `$on-danger` | `$danger-on-solid` | `--hd-danger-on-solid` |  |
| `$on-green` | `$success-on-solid` | `--hd-success-on-solid` |  |
| `$on-scrim` | `$inverse-text` | `--hd-slate-50` | light text on a dark, theme-independent backdrop |
| `$on-selected` | `$on-primary` | `--hd-on-primary` |  |
| `$on-shell` | `$inverse-text` | `--hd-slate-50` |  |
| `$on-shell-2` | `$inverse-text-2` | `--hd-slate-300` |  |
| `$on-shell-danger` | `$inverse-danger` | `--hd-danger-300` |  |
| `$page` | `$bg-page` | `--hd-bg-page` |  |
| `$radius-lg` | `$radius-md` | `--hd-radius-md` | 12px → 14px |
| `$radius-md` | `$radius-sm` | `--hd-radius-sm` | 8px → 10px |
| `$radius-sm` | `$radius-xs` | `--hd-radius-xs` | 6px stays 6px |
| `$radius-xl` | `$radius-lg` | `--hd-radius-lg` |  |
| `$red-accent` | `$danger-solid` | `--hd-danger-solid` |  |
| `$ring` | `$focus-halo` | — (SCSS only) | the 3px focus halo of fields |
| `$ring-color` | `$focus` | `--hd-focus` | the 2px focus outline |
| `$ring-danger` | `$danger-halo` | — (SCSS only) |  |
| `$ring-ok` | — | — | removed, no replacement: a valid field has no halo |
| `$sale-bg` | `$danger-solid` | `--hd-danger-solid` | the "sale" role is `Badge tone="danger" variant="solid"` |
| `$sale-fg` | `$danger-on-solid` | `--hd-danger-on-solid` |  |
| `$scrim-soft` | `$scrim` | `--hd-scrim` |  |
| `$selected` | `$primary` | `--hd-primary` |  |
| `$selected-active` | `$primary-active` | `--hd-primary-active` |  |
| `$selected-hover` | `$primary-hover` | `--hd-primary-hover` |  |
| `$selected-line` | `$primary-line` | `--hd-primary-line` |  |
| `$selected-tint` | `$primary-soft` | `--hd-primary-soft` |  |
| `$series-1` | `$chart-1` | `--hd-chart-1` |  |
| `$series-2` | `$chart-6` | `--hd-chart-6` |  |
| `$shadow-lg` | `$shadow-2` | `--hd-shadow-2` |  |
| `$shadow-md` | `$shadow-2` | `--hd-shadow-2` |  |
| `$shadow-sm` | `$shadow-1` | `--hd-shadow-1` |  |
| `$shadow-xl` | `$shadow-3` | `--hd-shadow-3` |  |
| `$shadow-xs` | `$shadow-1` | `--hd-shadow-1` |  |
| `$shell` | `$inverse-bg` | `--hd-slate-900` |  |
| `$shell-2` | `$inverse-bg-2` | `--hd-slate-800` |  |
| `$shell-3` | `$inverse-bg-2` | `--hd-slate-800` |  |
| `$shell-line` | `$inverse-line` | `--hd-slate-700` |  |
| `$skeleton-a` | `$bg-disabled` | `--hd-bg-disabled` | use `@include ui.skeleton` |
| `$skeleton-b` | `$border` | `--hd-border` | use `@include ui.skeleton` |
| `$space-7` | `$space-10` | `--hd-space-10` |  |
| `$space-8` | `$space-12` | `--hd-space-12` | up to 64px → 48px |
| `$space-9` | `$space-16` | `--hd-space-16` |  |
| `$space-scale` | — | — | removed with the density setting |
| `$star` | `$warning-solid` | `--hd-warning-solid` |  |
| `$surface` | `$bg-surface` | `--hd-bg-surface` |  |
| `$surface-2` | `$bg-raised` | `--hd-bg-raised` |  |
| `$surface-3` | `$bg-inset` | `--hd-bg-inset` |  |
| `$surface-inset` | `$bg-inset` | `--hd-bg-inset` |  |
| `$track` | `$bg-inset` | `--hd-bg-inset` |  |
| `$tracking-logo` | — | — | removed, no replacement: the logo is an asset of `@handijit/design` |
| `$type-scale` | — | — | removed with the density setting |
| `$warn-bg` | `$warning-bg` | `--hd-warning-bg` |  |
| `$warn-fg` | `$warning-fg` | `--hd-warning-fg` |  |
| `$warn-line` | `$warning-line` | `--hd-warning-line` |  |
| `$z-base` | `$z-raised` | `--hd-z-raised` | 1; `$z-base` is now 0 |
| `$z-raised` | `$z-sticky` | `--hd-z-sticky` | a sticky layer; `$z-raised` is now 1 |

Names that stayed and now carry the design value (no edit needed, but the pixels moved):

| Variable | 1.x | 2.0 |
| --- | --- | --- |
| `$space-1` … `$space-6` | 4, 8, then fluid up to 12 / 16 / 24 / 32px | 4, 8, 12, 16, 20, 24px (`$space-8` is 32px) |
| `$radius-xs` | 4px | 6px |
| `$radius-pill` | 999px | 999px |
| `$container-max-width` | 1360px | 1280px (`$breakpoint-xl`) |
| `$duration-fast` / `$duration-slow` | 140ms / 320ms | 120ms / 320ms |
| `$z-dropdown` / `$z-toast` / `$z-tooltip` | 200 / 500 / 450 | 1000 / 1400 / 1500 |
| `$font-size-control` | at least 16px | at least 16px (unchanged rule, design body size) |
| `$weight-*`, `$leading-*`, `$tracking-tight`, `$tracking-snug` | constants | the design type tokens |
| `$text`, `$text-2`, `$text-3`, `$border`, `$border-strong`, `$scrim`, `$band-bg`, `$band-line`, `$danger-solid`, `$font-body`, `$font-mono` | `var(--ui-…)` | `var(--hd-…)` of the same name |

Custom properties without an SCSS twin:

| 1.x | 2.0 |
| --- | --- |
| `--ui-font-size-<step>` | `--hd-type-<role>-size` (roles in the table above) |
| `--ui-syntax-keyword`, `-name`, `-number`, `-string`, `-type` | removed; `CodeBlock` colours its tokens from the design palette |
| `--ui-anim-*` | unchanged (`$anim-*`) |

#### 8. Mixins

| 1.x | 2.0 |
| --- | --- |
| `@include ui.for-dark { … }` | removed. Tokens change with the theme; for a rule that really differs, `[data-theme='dark'] & { … }` |
| `@include ui.heading(4xl)` | `@include ui.heading(h1)` |
| `@include ui.heading(3xl)`, `heading(2xl)` | `@include ui.heading(h2)` |
| `@include ui.heading(xl)` (the default) | `@include ui.heading(h3)` (the default) |
| `@include ui.heading(lg)` | `@include ui.heading(h4)` |
| `@include ui.heading(base)`, `(sm)`, `(xs)`, `(2xs)`, `(body)` | `@include ui.block-title`, or `@include ui.type(body)` / `type(small)` / `type(caption)` / `type(lead)` plus a weight |
| `heading($step, $weight)` | the second argument is gone: the role carries its weight |
| `@include ui.tint(oem)` | `@include ui.tint(info)` |
| `@include ui.tint(alt)` | `@include ui.tint(highlight)` |
| `@include ui.tint(info)` (neutral in 1.x) | `tint(info)` is cobalt now; for the old look use `tint(neutral)` |
| `tint(<unknown>)` fell back to neutral | a compile error |
| `interactive-surface($hover: $surface-2, $pressed: $surface-3)` | the defaults are `$state-hover` / `$state-pressed` |
| `card($radius: $radius-lg)`, `panel($radius: $radius-lg)` | default `$radius-md` (14px) |
| `muted($size: $font-size-sm)`, `technical-text(…)`, `money($size: $font-size-lg)` | defaults `$font-size-small`, `$font-size-small`, `$font-size-h4` |
| `focus-ring($color: $ring-color)` | default `$focus` |
| `bottom-sheet($duration: $duration-normal)` | default `$duration-base` |

New: `type($role)`, `block-title`, `choice-control($shape)`.

#### 9. Check the result

- Search the application for `--ui-`, `data-ui-`, `ui.$` followed by a name of the first column,
  and the removed exports; nothing should be left except component hooks.
- Sass fails on a removed variable or an unknown `heading` / `tint` argument, and TypeScript on a
  removed export, variant or tone, so a clean build covers most of the list. Custom properties are
  the exception: a misspelt `var(--hd-…)` is silently dropped, so search for them.
- Look at one screen in both themes at desktop and phone width.

## [1.0.0] — 2026-11-07 — `@handijit/ui`

**Paket ve marka adı değişti.** `@ahmetilhn/hanui` (son sürüm 5.6.3) handijit organizasyonuna taşındı:
npm adı `@handijit/ui`, depo `github.com/handijit/ui`, sürüm 1.0.0'dan başlar. İç adlar da yeni
markayı taşır: CSS sınıf öneki `ui-` (eski `hanui-`), token'lar `--ui-*` (eski `--hanui-*`), katman
`@layer ui`, öznitelikler `data-ui-theme` / `data-ui-density`, bileşen ve kanca adları `UiProvider`,
`UiThemeScript`, `initUi`, `useUi`, `useUiTheme`, `useUiTokens`, tipler `Ui*` (eski `Hanui*`),
`<style id="ui-theme-overrides">`, keyframes `ui-*`, SCSS `@use '@handijit/ui/scss' as ui`. Eski
adlara takma ad yok. Eşlik eden paket: `@ahmetilhn/handy-utils` → `@handijit/utils` (peer bağımlılık).

Aşağıdaki maddeler 5.6.3'ten bu sürüme gelen teknik değişikliklerdir (6.0.0 adıyla hazırlanmış, 1.0.0
olarak yayımlanmıştır).

Bir **paketleme** sürümü: bileşen API'si değişmedi (`check:api`: 177 + 30 + 22 + 253 ad aynı),
kırılan şey paketin dosya düzeni, `'use client'` sınırı ve CSS'in nasıl indiği. Gerekçe: tek
dosyalık 5.x paketi tüketicide (Next 16, Turbopack) bileşen düzeyinde ağaçtan sarsılamıyor, her
`Button`/`Chip` bir hidrasyon sınırı oluyor ve `turbopackModuleFragments` tek dosyayı ~2.000 halkalık
bir değerlendirme zincirine bölüp tarayıcı yığınını taşırıyordu (handijit.com ölçümü, Kasım 2026).

### Kırıcı

- **Bileşen başına modül.** `build/index.js` tek dosya değil, `src/` ağacının birebir çıktısı:
  `build/components/Button/index.js`, `build/hooks/usePositioning.js`… Cephe `build/index.js`
  yalnızca yeniden dışa aktarım taşır. Paket içi derin yollar (`@handijit/ui/build/…`) **hâlâ
  kapalı**; her bileşenin resmî alt yolu var: `@handijit/ui/button`, `/chip-group`,
  `/combobox`… (68 alt yol; `node scripts/build-exports.mjs` üretir, `--check` doğrular).
- **`'use client'` dosya başına.** Kanca, tarayıcı API'si ya da kendi olay işleyicisi olmayan 18
  bileşen yönergesiz: `Alert`, `Badge`, `Button`, `Card` (+`CardBody/Footer/Media/Overlay`), `Chip`,
  `Divider`, `EmptyState`, `IconButton`, `Kbd`, `PageHeader`, `Panel` (+`PanelForm/Row`), `Progress`
  (+`ProgressCircle`), `SectionHeader`, `Skeleton` (+`SkeletonCard/Rows/Table`), `StatusDot`,
  `SummaryCard`, `TextLink`, `Tile`. Sunucu bileşeninden doğrudan çizilirler; istemciye JS inmez.
  Diğer her bileşen, kanca ve tema bağlamı yönergeli kalır. Nöbetçi: `__tests__/client-boundary.test.ts`.
  - Sonuç: 5.x'te "paket `'use client'` olduğu için sunucu bileşeni @handijit/ui enum'unu değer olarak içe
    aktaramaz" kısıtı kalktı (`UIVariant`, `UISize` sunucuda da içe aktarılır).
  - `Button`/`IconButton` bağlantı dalı (`href`) artık `UiLink`e işlev prop'u geçirmez: pasif
    bağlantı (`disabled` / `isLoading`) `aria-disabled` + `tabIndex=-1` + `pointer-events: none`
    ile durdurulur, tüketicinin `onClick`i yalnızca etkinken iletilir. Öncesinde `preventDefault`
    çağıran bir sarmalayıcı işlev vardı; sunucu bileşeninden çizimde RSC serileştirmesi düşerdi.
  - `Breadcrumb`, `Stat`, `Steps`, `Spinner`, `Field` sağlayıcı metinlerini (`useUi`) okuduğu için
    **istemci kalır** — metinleri zorunlu prop yapmak sağlayıcıya güvenen tüketicide erişilebilirlik
    metnini düşürürdü.
- **CSS bileşen başına dosyada; JS CSS içe aktarmaz.** `build/components/<Ad>/style.css` (bileşen
  başına), `build/base.css` (token'lar, kutu modeli, `@keyframes` — 3,4 kB gz) ve `build/styles.css`
  (TAM paket, 5.x ile aynı kullanım) üretilir; alt yollar `./styles.css`, `./base.css`,
  `./components/*/style.css`. Tüketici CSS'i **tek dosya** olarak alır: ya `styles.css`, ya da
  `base.css` + kullandığı bileşenlerin `style.css` dosyalarını kendi derlemesinde birleştirerek.
  - Neden modül kendi CSS'ini getirmiyor (ölçüldü, handijit.com, Next 16.4.5 / Turbopack): modüllerin
    `import './style.css'` taşıdığı denemede Turbopack her istemci sınırının CSS'ini ayrı dosyaya koydu;
    render-blocking CSS 6 → 12–15 dosya ve LCP yavaş 4G'de 1,9 → 2,5 s (bayt 46,7 → 33,3 kB
    azalmasına rağmen). `turbopackModuleFragments` açıkken aynı içe aktarımlar çıktıdan tamamen
    düşüyordu; esbuild ise erişilemeyen modüllerin CSS'ini de topluyordu. Üç paketleyicide üç farklı
    davranış: CSS'in nasıl ineceği tüketicinin açık kararı olarak kalır.
  - Alt girişler (`chat.css`, `charts.css`) değişmedi: `styles.css`ten (ya da `base.css`ten) sonra içe
    aktarılır.
- **Tipler dosya başına.** `build/index.d.ts` toplanmış tek dosya değil; her modülün yanında
  `index.d.ts`. `import type { … } from '@handijit/ui'` aynı çalışır.
- **`Combobox` tetikleyicisi `role="combobox"`** (`Select` ile aynı): `aria-expanded`,
  `aria-controls` (kapalıyken de), `aria-invalid` ve `aria-required` tetikleyicide. Arama kutusu
  artık `role="combobox"` DEĞİL, metin kutusu (`aria-autocomplete="list"`, `aria-controls`,
  `aria-activedescendant` textbox rolünde geçerli — ARIA 1.2): panel açıkken sayfada tek combobox.
  Testte `getByRole('button', { name: placeholder })` → `getByRole('combobox', …)`; arama kutusu
  `getByRole('textbox', { name: searchPlaceholder })`. Gerekçe: düğme rolünde `aria-invalid`
  tanımsızdı ve form hatasında ilk hatalı alana odaklanılamıyordu (eksen taraması, handijit.com D-12).

### Eklenen

- **Bileşen değişkenleri** — tüketicinin `:root`a yazdığı, bileşenin `var(--ui-…, varsayılan)`
  ile okuduğu CSS özel özellikleri. Token sözleşmesine (`LIGHT_THEME`/`DARK_THEME`, 110 ad) girmez;
  `check-contrast` ve tema testleri değişmedi. Liste `README.md` → "Bileşen değişkenleri".
  `--ui-ring-width/offset`, `--ui-placeholder`, `--ui-scrim-blur`,
  `--ui-button-{radius,weight,tracking,wrap}`,
  `--ui-chip-{bg,line,fg,radius,weight,selected-bg,selected-line,selected-fg,selected-weight}`,
  `--ui-badge-{font,weight,tracking,transform,radius}` (+ 5.x'ten `bg/line/fg`),
  `--ui-stat-{label-font,label-size,label-weight,label-tracking,label-transform,value-font,value-weight,value-tracking,unit-font,unit-size,unit-tracking,unit-transform}`,
  `--ui-tab-weight`, `--ui-radio-card-{line,radius}`. Ölçüldü: handijit.com'un 497 satırlık
  `_ui-overrides.scss` dosyasının ~80 satırı (odak halkası, düğme, çip, rozet, istatistik, seçim
  kartı, yer tutucu) bu değişkenlerle `:root`ta 25 satıra iner.
- **`Select size="sm"`** 36 px kutuyu büyütmeden görünmez `::after` ile 44 px dokunma alanı
  (WCAG 2.5.8; `Chip` ile aynı kurgu). Nöbetçi listesi `__tests__/styles/tap-targets.test.ts`.
- `npm run exports` / `check:exports` — `exports` haritası üreteci ve doğrulayıcısı (`build`in son
  adımı).

### Düzeltilen

- `CommandPalette` girdisi `font-size-control` (≥ 16 px): iOS Safari küçük metin alanına odaklanınca
  sayfayı yakınlaştırıp yana kaydırıyordu.
- 5.x'te yönergesiz kalmış ama kanca kullanan 16 bileşene (`Avatar`, `Breadcrumb`, `Checkbox`,
  `DataTable`, `Directory`, `Field`, `FilterBar`, `Input`, `PasswordInput`, `Price`, `Radio`,
  `RadioCard`, `Rating`, `Spinner`, `TableCheckbox`, `ToastPortal`) `'use client'` yazıldı — tek
  dosyada bunun önemi yoktu, dosya başına çıktıda sunucu bileşeni sayılıp ilk kancada düşerlerdi.

### Ölçüm — tüketicide (handijit.com, Next 16.4.5 / Turbopack, `SITE_ENV=production`, gz)

| Hizmet sayfası | hanui 5.6.3 | ui 1.0.0 |
|---|---|---|
| Toplam JS (check-bundle) | 191,8 kB | **162,1 kB** |
| @handijit/ui içeren istemci parçaları | 39,7 kB | 27,8 kB (Combobox, Modal, Drawer, Toast, palet… istemci bileşenlerinin kullandıkları) |
| Render-blocking CSS (`styles.css` tek dosya) | 6 dosya, 46,7 kB (hanui 22,6) | 6 dosya (ui 24,0) |

Denenen ve geri alınan: modüllerin CSS'i kendilerinin getirmesi → 12 dosya, 33,3 kB, LCP (yavaş 4G,
Lighthouse medyan) 1,9 s → 2,5 s. Tek dosya ile LCP ölçümü tüketici raporunda.

### Ölçüm (`size-limit`, gz)

| | hanui 5.6.3 | ui 1.0.0 |
|---|---|---|
| yalnızca `Button` (JS) | 5,12 kB | **1,33 kB** |
| yalnızca `Badge` (JS) | 4,33 kB | **0,45 kB** |
| tüm paket (cephe) | 42,05 kB | 43,29 kB |
| `styles.css` (tam) | 23,07 kB | 24,22 kB |
| `base.css` + `Button/style.css` | — | 3,41 + 1,30 kB |

### `@ahmetilhn/hanui` 5.x'ten geçiş

0. Bağımlılık: `npm rm @ahmetilhn/hanui @ahmetilhn/handy-utils && npm i @handijit/ui @handijit/utils`;
   içe aktarımlarda paket adı, kodda `Hanui*` → `Ui*`, `useHanui*` → `useUi*`, `initHanui` → `initUi`;
   CSS'te `hanui-` → `ui-`, `--hanui-` → `--ui-`, `@layer hanui` → `@layer ui`, `data-hanui-*` →
   `data-ui-*`; SCSS'te `@use '@handijit/ui/scss' as ui`.

1. `import '@handijit/ui/styles.css'` aynen kalır (tek dosya). Alt küme isteyen tüketici
   `@handijit/ui/base.css` + `@handijit/ui/components/<Ad>/style.css` dosyalarını kendi derlemesinde
   TEK dosyaya birleştirir (bkz. yukarıdaki ölçüm: dosya sayısı LCP'yi bayttan çok etkiliyor).
2. Testlerde `Combobox` tetikleyicisini `combobox`, arama kutusunu `textbox` rolüyle sor.
3. Next.js App Router: `experimental.optimizePackageImports: ['@handijit/ui']` — cephe saf;
   içe aktarım bileşen dosyasına kısa devre yapılır. Sunucu bileşenlerinden yönergesiz bileşenler
   doğrudan içe aktarılır; `Client*` sarmalayıcıları yalnızca istemci bileşenleri için gerekir.
   ⚠ `experimental.turbopackModuleFragments` KAPALI kalır: açıkken Turbopack yan etkisiz sayılan
   modüllerin CSS içe aktarımlarını düşürüyor (ölçüldü, Next 16.4.5: @handijit/ui CSS'i çıktıda hiç yok;
   `optimizePackageImports` açık ya da kapalı fark etmiyor). Bileşen başına modülle parçalara gerek
   de kalmadı: ağaç sarsma modül düzeyinde (handijit.com hizmet sayfası toplam JS 191,8 → 162,1 kB).
4. Bağlantı düğmesinde `isLoading`/`disabled` iken `onClick`in çağrılmamasına güveniyorsan davranış
   aynı; `preventDefault`e güveniyorsan artık `pointer-events: none` + `tabIndex=-1` ile sağlanır.
5. Test ortamı değişmez: JS çıktısı CSS içe aktarmadığı için Node ESM modülleri doğrudan yükler.
