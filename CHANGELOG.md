# Changelog

One section per version: **breaking**, **added**, **fixed**, and for a major version a migration
section that can be followed line by line. Headings are `## [x.y.z] — date`: the publish workflow
reads the section of the version being released and uses it as the GitHub Release note. Sections up
to 1.0.0 are in Turkish, as written at the time; the 5.x tables of `@ahmetilhn/hanui` live in the
README of the 1.0.0 tarball.

## [Unreleased]

## [3.3.0] - 2026-11-28

**Print styles and a totals list, asked for by the parts portal.** Additive; nothing to change for
a 3.2.1 caller. A minor release because `TotalsList` adds public names (`check:api` records it).

### Added

- **`TotalsList`** (`@handijitcom/ui/totals-list`, type `TotalsListItem`): the "label → amount"
  totals of a cart, an order or an invoice as a native `<dl>`. Labels at the start, amounts at the
  end in tabular figures so the digits line up; an amount may be a `Price` (a negative discount
  too), text or an inline `Badge` ("Ücretsiz"); an `isTotal` row is emphasized below a divider.
  Items have `DescriptionList`'s `term` / `description` shape: the portal's `Panel` +
  `DescriptionList` totals switch with the import and one flag. `SummaryCard` stays a link card.
- **Print styles.** `AppShell` hides the sidebar, the top bar and the skip link and gives the
  content the full width. `Drawer`, `Modal` (and the dialogs on it), `BottomSheet`, `Popover`
  and the toasts never print. `DataTable` and `Table` print every row: no scroll box, cap or
  sticky header/column, the header repeated on each page, rows never broken across pages;
  `DataTable`'s column menu, bulk bar and windowing spacers are hidden.
- **A virtualized `DataTable` renders all of its rows while printing** (`beforeprint` or the
  `print` media query, rendered synchronously; `afterprint` restores the window). Headless PDF
  renderers that skip `beforeprint` are covered in the README.

### Budgets

- `styles.css` 28 → 28.5 kB (measured 28.22 kB: the print rules and the totals sheet); "only
  DataTable" 3 → 3.3 kB (3.15 kB: `usePrinting` and the table's print rules); new "only
  TotalsList" 500 B (358 B). The facade stays at 57 kB (56.95 kB).

### Tests

- `__tests__/styles/print.test.ts` compiles the stylesheets and checks each `@media print` rule
  (and the totals' alignment); `usePrinting`, the printing `DataTable` and `TotalsList` have unit
  tests; `TotalsList` is in the axe and gallery registries.

## [3.2.1] - 2026-11-28

**Defects found on the parts portal's screens.** Fixes and small additive props; nothing to change
for a 3.2.0 caller except the lira's place in `Price` (see Changed).

### Fixed

- **`AppShell` sidebar stopped short of a long page.** Its background and rule were painted by the
  viewport-tall sticky box, so they ended under the first screen (visible in a full-page view of a
  long list). The sidebar column now stretches to the page's height and paints them; an inner box
  is the sticky part (`position: sticky; top: 0; height: 100dvh`) with the brand, the links (which
  scroll on their own) and the toggle.
- **`AppShell` brand.** A brand link of an icon and a name (`<TextLink><Icon />Name</TextLink>`) had
  no gap between them; the brand slot (sidebar and drawer) now lines them up a gap apart.
  Following the brand link inside the narrow-window drawer now closes the drawer, as a nav link
  does.
- **`Gallery` arrows** were drawn squeezed and overlapping in a pill at the main image's
  bottom-left corner: `.iconButton`'s `position: relative` (same specificity, later in
  `styles.css`) beat the arrows' one-class `position: absolute`, so they fell into the flow under
  the image. They are now round 40px `IconButton`s centred on the image's left and right edges,
  shown on hover or focus under a mouse and always on touch; the full-screen view's arrows are the
  same buttons on the viewport's edges.
- **`Tabs` cut off on a narrow screen** with nothing saying that the strip went on. The strip fades
  out at each edge that hides tabs, a round scroll button sits on that edge under a mouse (out of
  the tab order, hidden from screen readers: the arrow keys already move through the tabs), and the
  selected tab is kept in view, now on the first paint too, by scrolling the strip only (until
  3.2.0 `scrollIntoView` was skipped on mount because it also scrolled the page).
- **`Breadcrumb` ran to the screen's edge on mobile** (a scrolling strip). At tablet-portrait width
  and below it stays on one line inside its box: a trail of more than three crumbs folds the
  middle ones into a "…" button that unfolds the whole trail (focus moves to the first revealed
  crumb), and the current page is cut with an ellipsis, its full text in `title`. No horizontal
  page overflow.
- **Subpath named exports were missing at run time.** `@handijitcom/ui/app-shell` declared
  `AppShellNav`, `AppShellNavGroup` and `AppShellNavItem` in its `.d.ts`, but its JavaScript
  (`import` and `require`) exported only `default`: under `preserveModules` a module that is not an
  entry keeps only what another module imports from it. Every component subpath is now a build
  entry, so it carries its full signature. The convention is unchanged and now documented: a
  subpath's **default export is its component, its parts and types are named exports**, as on the
  main entry (`import AppShell, { AppShellNav } from '@handijitcom/ui/app-shell'`), in Node, Vitest
  and bundlers alike. `npm run build` (`build-exports.mjs --check`) imports every subpath in both
  formats and fails on a missing name.

### Changed

- **`Price` writes "₺" before the amount**, as `@handijitcom/tr` `formatLira` does:
  "₺2.649,57", a negative "-₺0,05", no space (3.2.0: "2.649,57₺"). Any other symbol or code stays
  after the amount. The new `currencyPosition: 'prefix' | 'suffix'` (type `PriceCurrencyPosition`)
  overrides the default; `currencyPosition="suffix"` restores the 3.2.0 rendering.

### Added

- **Case opt-out for labels set in capitals by CSS.** Under `lang="tr"` the browser writes
  "Mann-Filter" as "MANN-FİLTER"; a brand or a proper name must not be capitalised by CSS.
  Capitals stay the default (3.x compatibility): `Eyebrow` `isUppercase={false}`, `PageHeader`
  `isEyebrowUppercase={false}`, `SectionHeader` `isOverlineUppercase={false}`, and the SCSS mixin
  `overline-as-written` (after `overline`) keep the text as written, with normal tracking.
- **`Breadcrumb` `expandLabel`** and **`UiLabels.breadcrumbExpand`**: the "…" button's name
  ("Tüm yolu göster"). Optional; without it the button is named by the crumbs it hides.

### Size

- Whole facade 55.54 → 56.59 kB (budget 56 → 57 kB); `styles.css` 27.18 → 27.86 kB (27.5 → 28
  kB): `Tabs`' fade, scroll buttons and strip-only scrolling, `Breadcrumb`'s fold, `Price`'s
  placement, the case opt-outs. `AppShell` + navigation 5.43 → 5.49 kB, its stylesheet 2.05 → 2.12
  kB; `Gallery` 3.38 kB (unchanged).
- Public API 214 → 215 names (`PriceCurrencyPosition`); SCSS API 214 → 215 (`overline-as-written`).

## [3.2.0] - 2026-11-28

**The application shell.** Every signed-in panel and desktop program was writing its own sidebar
frame; `AppShell` is that frame, on its own subpath. Additive: nothing changes for a 3.1 caller.

### Added

- **`AppShell`** (`@handijitcom/ui/app-shell`): `brand`, `navigation`, `sidebarFooter` (sidebar);
  `title`, `search`, `actions` (sticky top bar); the content in `<main>`. The sidebar (232px)
  collapses to a 56px icon rail: `isCollapsed` / `onCollapsedChange`, uncontrolled with
  `isDefaultCollapsed`; the consumer persists it. Below the tablet width it is a `Drawer` opened by
  a menu button, closed by a followed link or when the window grows. Skip link to `<main>` (no
  hash change), `header` / `nav` / `main` landmarks. Publishes `--app-sidebar-width` on `<html>`
  in CSS (for `ToastPortal`'s `inset`) and `--ui-header-height` (the top bar's measured height,
  read by the sticky components). Light and dark from the tokens; compact metrics.
- **`AppShellNav`**, **`AppShellNavItem`**, **`AppShellNavGroup`**: sections of links with icon,
  label and count (`badge`, "99+" above 99, read through `labels.appShell.badge`), the current
  page as `aria-current="page"` from `currentPath` (the longest matching `href`) or `isActive`,
  passive rows, nested groups that open and close (open while they hold the current page). Links
  render through `UiProvider`'s `linkComponent`; `linkProps` pass router props on. Types
  `AppShellNavLink`, `AppShellNavSection`, `AppShellNavProps`, `AppShellNavItemProps`,
  `AppShellNavGroupProps`, `AppShellLabels`.
- **`UserMenu`** (`@handijitcom/ui/user-menu`): avatar, name and `meta` opening a `Menu` of
  `MenuItem`s; only the avatar below the mobile width (the name is still read).
- **Labels** (`UiLabels.appShell`): `skipToContent`, `navigation`, `openNavigation`, `collapse`,
  `expand`, `badge`, `userMenu`.

### Size

- Whole facade 52.97 → 55.54 kB (budget 53.5 → 56 kB); `styles.css` 25.59 → 27.18 kB (26 → 27.5
  kB). What a page pays: `AppShell` + `AppShellNav` 5.43 kB, `UserMenu` 3.9 kB, the shell's
  stylesheet 2.05 kB.
- Public API 203 → 214 names (`scripts/api-baseline.txt`).

## [3.1.0] - 2026-11-27

**Dense data and ordering for a parts portal.** `DataTable` gains a data mode with column state, a
column menu (`DataTableColumnMenu`), density, keyboard rows and virtualization; four new
components arrive, each on its own subpath. Additive: nothing changes for a 3.0 caller.

### Added

- **`DataTable` data mode** (opt-in; children mode is unchanged and ignores these props):
  `rows` + `DataTableColumn.render(row, index)`, `getRowKey`; `columnState` /
  `onColumnStateChange` (`DataTableColumnState = { order, hidden }`, uncontrolled when omitted) and
  `DataTableColumn.isAlwaysVisible`; the `columnMenu` slot, drawn in a toolbar above the table;
  `density: 'compact' | 'comfortable'`; `onRowActivate` turns on
  keyboard row navigation (↑ ↓ Home End move a roving active row, Enter or a click activates; a
  click on a cell's own control does not); `isVirtualized` + `rowHeight` (36 compact / 48
  comfortable) draw only the rows in view with `aria-rowcount` / `aria-rowindex`, spacer rows and
  the sticky header, in a box capped by `hasViewportCap` or `--ui-data-table-max-height` (480px).
  New types `DataTableColumnState`, `DataTableDensity`; `DataTableColumn` takes the row type
  (`DataTableColumn<T = unknown>`).
- **`DataTableColumnMenu`** (`@handijitcom/ui/data-table-column-menu`): the column menu of a
  data-mode `DataTable` (visibility checkboxes, move up / down, in a `Popover`), passed as
  `columnMenu={<DataTableColumnMenu />}`. It edits the table's `columnState`, controlled or not;
  `labels` (`DataTableColumnMenuLabels`) override `UiLabels.dataTable`. A module of its own, so a
  `DataTable` without a menu does not bundle `Popover`, `Checkbox` and `IconButton`.
- **`Gallery`** (`@handijitcom/ui/gallery`): main image, thumbnails (roving focus, ← → Home End),
  hover zoom toward the pointer, a full-screen modal view with keys, swipe and click-to-zoom.
  `renderImage` is the platform adapter (`next/image`, an Electron loader); `index` /
  `onIndexChange` optional. Types `GalleryImage`, `GalleryImageVariant`,
  `GalleryRenderImageProps`, `GalleryLabels`.
- **`TreeSelect`** (`@handijitcom/ui/tree-select`): ARIA tree with expand / collapse, single or
  multiple choice (`isMultiple`), search that keeps matches with their opened ancestors, the APG
  keyboard (↑ ↓ ← → Home End Enter Space). Types `TreeSelectNode`, `TreeSelectProps`,
  `TreeSelectLabels`.
- **`NotificationCenter`** (`@handijitcom/ui/notification-center`): bell with an unread badge
  (99+), a panel grouped by day (today, yesterday, then the date), read / unread, "mark all read",
  "mark read", empty state. Presentational. Types `NotificationItem`, `NotificationCenterLabels`.
- **`BulkPasteInput`** (`@handijitcom/ui/bulk-paste-input`) and the pure **`parseBulkPaste`**:
  a pasted spreadsheet copy, CSV or list → `{ code, quantity, line }` rows and invalid lines with
  their reason; quantities in the data contract's grammar; `defaultQuantity`,
  `isMergingDuplicates`. The root entry exports the parser from a non-client module, callable on
  the server. Types `BulkPasteRow`, `BulkPasteResult`, `BulkPasteInvalidLine`,
  `BulkPasteInvalidReason`, `BulkPasteOptions`, `BulkPasteLabels`.
- **Labels** (`UiLabels`): `dataTable.columns / moveUp / moveDown`, `gallery.*`, `treeSelect.*`,
  `notificationCenter.*`, `bulkPaste.*`. As every label, given on the provider or as a prop; the
  README shows the Turkish set.

### Size

- Whole facade 45.45 → 52.97 kB (budget 46 → 53.5 kB); `styles.css` 24.22 → 25.59 kB (25 → 26 kB).
  What a page pays is its import: `DataTable` alone 2.85 kB (3.0: no data mode), with
  `DataTableColumnMenu` 6.66 kB, `Gallery` 3.38, `TreeSelect` 2.61, `NotificationCenter` 5.71,
  `BulkPasteInput` 2.03, `parseBulkPaste` 0.52 kB.
- Public API 179 → 203 names (`scripts/api-baseline.txt`).

## [3.0.0] - 2026-11-27

**Cobalt, coral and ink.** The palette is the brand's three colours plus red for danger: cobalt is
the interface and the brand surface, coral the conversion action, ink (`#091122`) and its lightness
steps every neutral. The navy band, the success and warning families, violet and magenta leave;
the chart series become tints of cobalt, coral and ink. A design test now fails on any hue outside
cobalt, coral and danger red. 2.0.0 and 2.0.1 were published with the navy band, so this is a
major; nothing removed is kept as an alias. Migration below, line by line.

### Breaking

- **Palette (`@handijitcom/ui/design`).** Removed: the scales `success`, `warning`, `violet`,
  `magenta` (`--hd-<scale>-*`, `scales.*`, `hues.*`, `ChromaticScaleName` members) and the colour
  roles `success-bg/-fg/-line/-solid/-on-solid`, `warning-bg/-fg/-line/-solid/-on-solid`,
  `band-bg`, `band-deep`, `band-line`, `band-line-strong`, `band-text`, `band-text-2`,
  `band-focus`, `band-edge`. `StatusName` is `'danger' | 'info'`. The neutral scale `slate` is
  renamed **`ink`** (`--hd-slate-*` → `--hd-ink-*`, `scales.slate` → `scales.ink`,
  `ScaleToken` `slate-*` → `ink-*`; values unchanged). Static tokens 180 → 136; colours per theme
  63 → 46; effects per theme 20 → 16.
- **Band effects → brand surface effects.** `band-gradient-from/-to/-hold`, `band-glow`,
  `band-glow-alpha`, `band-dot`, `band-dot-alpha/-cell/-radius`, `band-blueprint-from/-to/-hold/
-stroke`, `band-accent-glow` are replaced by `brand-surface-*` (below). `effectValues[theme].band`
  → `effectValues[theme].brandSurface`; the recipe `band` → `brandSurface`; types
  `BandEffectValues` / `BandRecipe` → `BrandSurfaceEffectValues` / `BrandSurfaceRecipe`.
- **Chart series.** `chart-1…6` are cobalt 600, coral 600, ink 500, cobalt 900, coral 800, ink 950
  in light and cobalt 400, coral 400, ink 0, cobalt 600, coral 600, ink 500 in dark: the six steps
  of the three brand colours at 3:1 or more on every light (dark) ground that lie furthest apart
  (17.9 / 20.2 ΔE at the closest pair; the gate is 10). Series 4–6 repeat the hues of 1–3 in another
  lightness: over three series, label directly or add markers or dash patterns.
- **Components renamed** (2.0.x names removed): `Band` → `BrandSurface`, `BandBlueprint` →
  `BrandBlueprint`, `BandBlueprintShape` → `BrandBlueprintShape`, `BandSide` →
  `BrandSurfaceSide`, subpath `@handijitcom/ui/band` → `@handijitcom/ui/brand-surface`,
  `data-ui-band` → `data-ui-brand-surface`, `StatStrip variant="band"` → `variant="brand"`,
  `UIVariant.ON_BAND` → `UIVariant.ON_BRAND` (class `button--on-band` → `button--on-brand`), hooks
  `--ui-band-radius/-padding/-artwork-width` → `--ui-brand-surface-radius/-padding/-artwork-width`.
- **The brand surface is cobalt.** `BrandSurface` draws `primary` with white on it, deepening to
  `brand-surface-deep` (cobalt 800); white sheens (6%), white dots, a white blueprint with the coral
  dot. All text on it is white (there is no secondary text colour), the focus ring is white, and
  it has no edge in either theme. `ON_BRAND` is a white frame with a white label that hovers to
  `brand-surface-deep`.
- **Colour-only tones.** `Badge` `tone`: `success`, `warning` removed, `ink` added (`neutral ·
ink · info · danger`). `StatusDot` `tone`: `neutral · info · ink · danger`. `Progress` and
  `ProgressCircle` `tone`: `brand · ink · danger`. `CalendarEventTone` (events and resources):
  `neutral · primary · ink · danger · info`.
- **SCSS API.** `$success-*`, `$warning-*` (10) and `$band-*` (18) are removed; `tint()` takes
  `danger · info · ink · neutral` (`tint(success)` / `tint(warning)` fail the build). The inverse
  aliases now read `--hd-ink-*`.
- **Recoloured, same API:** `Alert`, `Toast`, `Modal` and `ConfirmDialog` keep their `success` and
  `warning` values, drawn in cobalt (`tint(info)`) and ink (`tint(ink)`), told apart by their icon;
  `Timeline` done marks, `CopyField` copied state, `Rating` / `RatingInput` stars and a positive
  `Stat` trend are cobalt; a `DataTable` warning row, a `TagInput` duplicate and a `Textarea` near
  its limit are ink; `Avatar` buckets 1 and 2 are ink and cobalt fills, the brand medallion is
  cobalt with a white mark; `CodeBlock` strings and literals are `accent-text`, inserted lines
  `primary-text`; `ToolCall` status dots are `info` / `ink`.

### Added

- Colour role `brand-surface-deep` (cobalt 800, both themes) and effects `brand-surface-hold`
  (55%), `brand-surface-line` (white at 0.24), `brand-surface-glow-alpha` (0.06),
  `brand-surface-dot-alpha` (0.22), `brand-surface-dot-cell` (22px), `brand-surface-dot-radius`
  (1.6px), `brand-surface-blueprint-hold` (70%), `brand-surface-blueprint-fill-alpha` (0.16),
  `brand-surface-blueprint-stroke-alpha` (0.4), `brand-surface-accent-glow`. SCSS: `$brand-surface-*`
  (7 names).
- `tint(ink)`: the emphatic neutral (`bg-raised` + `border-strong` + `text`); `Badge tone="ink"`.
- Gates: white text on `brand-surface-deep` ≥ 7:1 (10.05), the white ring on `primary` and
  `brand-surface-deep` ≥ 3:1 (5.03, 10.05), white text over a glow's centre ≥ 4.5:1 (4.58),
  `primary` on the page ≥ 3:1 (4.86 light, 3.83 dark), `accent-text` on every surface; the palette
  test (only cobalt, coral, danger red and ink neutrals). `check:contrast`: 100 pairs per theme.

### Migration

| 2.0.x                                                                              | 3.0.0                                                                                                |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `import { Band, BandBlueprint } from '@handijitcom/ui'` (or `/band`)               | `import { BrandSurface, BrandBlueprint } from '@handijitcom/ui'` (or `/brand-surface`)               |
| `BandBlueprintShape`, `BandSide`                                                   | `BrandBlueprintShape`, `BrandSurfaceSide`                                                            |
| `<StatStrip variant="band">`                                                       | `<StatStrip variant="brand">`                                                                        |
| `UIVariant.ON_BAND`                                                                | `UIVariant.ON_BRAND`                                                                                 |
| `[data-ui-band]` (an application's own band)                                       | `[data-ui-brand-surface]`                                                                            |
| `--ui-band-radius`, `--ui-band-padding`, `--ui-band-artwork-width`                 | `--ui-brand-surface-radius`, `--ui-brand-surface-padding`, `--ui-brand-surface-artwork-width`        |
| `--hd-band-bg`, `$band-bg`, `band-gradient-from`                                   | `--hd-primary` / `$primary` (the surface is cobalt)                                                  |
| `--hd-band-deep`, `$band-deep`, `band-gradient-to`                                 | `--hd-brand-surface-deep` / `$brand-surface-deep`                                                    |
| `--hd-band-text`, `--hd-band-text-2`, `--hd-band-focus`                            | `--hd-on-primary` (white; no secondary text colour on the surface)                                   |
| `--hd-band-line`, `--hd-band-line-strong`, `band-dot`, `band-blueprint-stroke`     | `--hd-brand-surface-line` (hairlines); `on-primary` at an opacity for imagery                        |
| `--hd-band-edge`                                                                   | nothing: cobalt needs no edge on either page                                                         |
| `band-gradient-hold`, `band-glow-alpha`, `band-dot-*`, `band-blueprint-*`          | `brand-surface-hold`, `brand-surface-glow-alpha`, `brand-surface-dot-*`, `brand-surface-blueprint-*` |
| `band-glow` (cobalt on navy)                                                       | white at `brand-surface-glow-alpha` (0.06)                                                           |
| `band-accent-glow`, `$band-accent-glow`                                            | `brand-surface-accent-glow`, `$brand-surface-accent-glow`                                            |
| `effectValues.light.band`, `band` (recipe), `BandEffectValues`, `BandRecipe`       | `effectValues.light.brandSurface`, `brandSurface`, `BrandSurfaceEffectValues`, `BrandSurfaceRecipe`  |
| `--hd-success-bg/-fg/-line`, `$success-*`, `tint(success)`                         | `--hd-info-bg/-fg/-line`, `$info-*`, `tint(info)` (cobalt, with a check icon)                        |
| `--hd-success-solid`, `--hd-success-on-solid`                                      | `--hd-primary`, `--hd-on-primary`                                                                    |
| `--hd-warning-bg/-fg/-line`, `$warning-*`, `tint(warning)`                         | `--hd-bg-raised` / `--hd-text` / `--hd-border-strong`, `tint(ink)` (with a warning icon)             |
| `--hd-warning-solid`, `--hd-warning-on-solid`                                      | `--hd-text`, `--hd-bg-surface` (ink fill)                                                            |
| `--hd-success-*` / `--hd-warning-*` scale steps, `--hd-violet-*`, `--hd-magenta-*` | the role that says what it is for (above); a raw step: `cobalt-*`, `coral-*` or `ink-*`              |
| `--hd-slate-<step>`, `scales.slate`, `slate-<step>`                                | `--hd-ink-<step>`, `scales.ink`, `ink-<step>` (same values)                                          |
| `<Badge tone="success">`                                                           | `<Badge tone="info">`                                                                                |
| `<Badge tone="warning">`                                                           | `<Badge tone="ink">`                                                                                 |
| `<StatusDot tone="success">` / `tone="warning"`                                    | `tone="info"` / `tone="ink"`                                                                         |
| `<Progress tone="success">` / `tone="warning"`                                     | `tone="brand"` (or omit) / `tone="ink"`                                                              |
| `CalendarEvent` / `CalendarResource` `tone: 'success'` / `'warning'`               | `tone: 'info'` / `tone: 'ink'`                                                                       |
| `<Alert tone="success">`, `toast.success()`, `Modal tone="warning"` …              | unchanged; drawn in cobalt and ink                                                                   |
| `--hd-chart-1…6` (cobalt, coral, green, amber, magenta, violet)                    | same names, new values (tints of cobalt, coral, ink); over three series add labels or patterns       |

`check:api`: the main entry still has 179 names (four renamed); the SCSS API has 214 (−28, +7).

## [2.0.1] — 2026-11-27

### Fixed

- **`Band` and `BandBlueprint` render as server components.** 2.0.0 marked the module
  `'use client'` because of `useId`, but `useId` runs in a server component too; the directive made
  every band a hydration boundary and shipped its code and the `band` tokens to the browser
  (measured on handijit.com: service page 169.8 → 167.8 KB gz). The ids are unchanged. The
  client-boundary test now treats `useId` as server-safe.

## [2.0.0] - 2026-11-27

**No cyan, and the brand band is part of the system.** Turquoise leaves the palette: the brand is
cobalt (the interface), coral (the conversion action) and the navy band, on neutrals and the
status colours; a design test now fails on any hue between 170° and 240°. The band that every
application drew by hand (hero, closing call, footer, share image) is a component with its own
tokens. Nothing removed is kept as an alias. Migration below, line by line.

### Breaking

- **Turquoise is removed from `@handijitcom/ui/design`.** The `turquoise` hue and scale
  (`--hd-turquoise-50` … `-950`, `hues.turquoise`, `scales.turquoise`, the `'turquoise'` member of
  `ChromaticScaleName` / `HueName`) and the colour roles `highlight`, `on-highlight`,
  `highlight-soft`, `highlight-text` (both themes; CSS, SCSS `$hd-*`, JSON, TypeScript
  `ColorToken`) are gone. Static tokens 191 → 180; colours per theme 65 → 63.
- **`chart-3` is green**, no longer turquoise: `success` 600 / 400 (`#159358` light, `#3ad184`
  dark). Measured with `deltaE` and `contrast`: the only family of the palette at least 16 ΔE from
  every other series in both themes (16.6 light, 20.1 dark; the gate is 10) and at least 3.63:1 on
  the light backgrounds. Red sat 6.6–8 ΔE from coral and magenta, a second amber or violet step
  under 12 ΔE from its own series, and a new hue would have added a scale. A chart names its series
  in a legend, so the shared hue never says "success" alone.
- **`Badge tone="highlight"`** is removed (`BadgeTone` loses the member).
- **SCSS API** (`@handijitcom/ui/scss`): `$highlight`, `$on-highlight`, `$highlight-soft`,
  `$highlight-text` and the `tint(highlight)` tone are removed (`tint()` fails the build on it).
- **`Avatar`**: the `brand` medallion draws a white mark (`band-text`) instead of a turquoise one;
  initials bucket 3 is `primary-text` in `bg-inset` instead of the turquoise tint. A name keeps its
  bucket (still six).
- **`CodeBlock`**: type names are the text colour at medium weight instead of `highlight-text`.
- **`$focus`** (SCSS) is `var(--ui-ring-color, var(--hd-focus))`: a surface can set the ring of its
  descendants (`Band` does). A stylesheet that declares `--ui-ring-color` for another purpose now
  recolours rings.

### Added

- **Band tokens** in `@handijitcom/ui/design`, composed from existing colours, the same in both
  themes:
  - colours `band-focus` (`#ffffff`, the ring on the band) and `band-edge` (`band-bg` in light,
    `band-line` in dark, where navy is 1.24:1 on the page);
  - effects `band-gradient-from`, `band-gradient-to`, `band-gradient-hold` (55%), `band-glow`
    (`primary`), `band-glow-alpha` (0.5), `band-dot` (`band-line-strong`), `band-dot-alpha` (0.7),
    `band-dot-cell` (22px), `band-dot-radius` (1.6px), `band-blueprint-from` (`band-line`),
    `band-blueprint-to` (`band-bg`), `band-blueprint-hold` (60%), `band-blueprint-stroke`
    (`band-line-strong`), `band-accent-glow` (`0 8px 24px -10px` coral at 0.45). Effects per theme
    6 → 20;
  - `effectValues[theme].band` (hex and numbers, for an Open Graph image or Electron) and the
    `band` recipe (`BandRecipe`: the geometry an SVG attribute needs); types `BandEffectValues`,
    `BandRecipe`, `GradientStop`.
- **Gates**: `band-focus` and `accent` on `band-bg` / `band-deep` ≥ 3:1 (15.53 / 18.33, 5.07 / 5.98),
  `band-text` ≥ 7:1 and `band-text-2` ≥ 4.5:1 over the centre of a glow (8.95, 5.85), `band-edge`
  on `bg-page` ≥ 1.25:1, and no hue in the cyan range. `check:contrast`: 124 pairs per theme.
- **`Band`** (`@handijitcom/ui/band`): the navy surface with its imagery as inline SVG (gradient,
  glows, faded dot grid; ids from `useId`, `aria-hidden`; never a CSS gradient). Props `as`
  (`section` default · `div` · `header` · `footer` · `aside`), `glow` and `dots` (`BandSide`:
  `start` · `end` · `both` · `none`; defaults `both` / `end`), `artwork` (decorative, bottom end,
  from the tablet width up), `footer` (full width under the content), `aria-label`,
  `aria-labelledby`, `id`, `className`, `testId`. Sets `band-focus` as every descendant's ring
  (`--ui-ring-color`) and `data-ui-band` for what sits on it; a hairline edge in dark; the imagery
  is dropped in forced colours. Hooks `--ui-band-radius`, `--ui-band-padding`,
  `--ui-band-artwork-width`.
- **`BandBlueprint`**: a supergraphic in the blueprint style (`shape: BandBlueprintShape` —
  `viewBox`, `body`, optional `dot`; `logos.mark` fits): gradient fill, `band-line-strong`
  outline, the coral dot of the logo.
- **`Eyebrow`** (`@handijitcom/ui/eyebrow`): mono capital label framed by thin rules; `align`
  (`EyebrowAlign`: `start` · `center`), `as` (`p` · `span` · `div`). Takes the band's colours on a
  band. Hook `--ui-eyebrow-tracking`.
- **`StatStrip`** (`@handijitcom/ui/stat-strip`): a list of facts (`items: StatStripItem[]`,
  `{ value, label }`) with thin dividers; `variant` (`StatStripVariant`: `page` · `band`, the deep
  strip at the foot of the band), `aria-label`.
- **`Button` `ACCENT` on the band** glows softly (`band-accent-glow`); every other button, and
  `ACCENT` anywhere else, stays flat.
- SCSS: `$band-focus`, `$band-edge`, `$band-gradient-from`, `$band-gradient-to`, `$band-glow`,
  `$band-glow-alpha`, `$band-dot`, `$band-dot-alpha`, `$band-blueprint-from`, `$band-blueprint-to`,
  `$band-blueprint-stroke`, `$band-accent-glow`.
- Guards: the band components on the colour footprint allow-list with their reasons, the turquoise
  names barred from coming back, `Band`, `Eyebrow`, `StatStrip` and `src/design` held at 100%
  coverage, size budgets for `Band` (1.4 kB) and its CSS (0.78 kB).

### Changed

- The main entry's size budget is 46 kB (was 44): measured 45.44 kB with the band. The band is not
  a sub-entry: a sub-entry is one client bundle, while `Eyebrow` and `StatStrip` render on the
  server; per-component modules keep the cost on the page that draws it.

### Migration

Work through the table; every row is old → new.

| 1.x                                                                   | 2.0.0                                                                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `<Badge tone="highlight">Yeni</Badge>` (a "New" mark)                 | `<Badge tone="info">Yeni</Badge>`                                                                            |
| `<Badge tone="highlight">Canlı</Badge>` (a "Live" state)              | `<Badge tone="success">Canlı</Badge>`, or `<StatusDot tone="success" label="Canlı" isPulsing />`             |
| `<Badge tone="highlight" variant="solid">`                            | `tone="info" variant="solid"` (cobalt fill, white text)                                                      |
| `--hd-highlight`, `$hd-highlight`, `$highlight` (a fill or graphic)   | `--hd-primary` / `$primary` for an interface mark; `--hd-success-solid` for a live state                     |
| `--hd-on-highlight`, `$on-highlight`                                  | `--hd-on-primary` / `$on-primary` (or `success-on-solid` with `success-solid`)                               |
| `--hd-highlight-soft`, `$highlight-soft`                              | `--hd-info-bg` / `$info-bg` (or `success-bg`)                                                                |
| `--hd-highlight-text`, `$highlight-text`                              | `--hd-info-fg` / `$info-fg` (or `success-fg`)                                                                |
| `@include tint(highlight)`                                            | `@include tint(info)` (or `tint(success)`)                                                                   |
| `--hd-turquoise-<step>`, `scales.turquoise[step]`, `hues.turquoise`   | the token that says what it is for (above); a raw step: `cobalt-<step>` or `success-<step>`                  |
| `themes[theme].highlight*`, `ColorToken` `'highlight'` …              | `themes[theme].info-*` / `primary` (TypeScript flags every use)                                              |
| `--hd-chart-3` turquoise (`#158e8a` / `#3acac6`)                      | the same name, now green (`#159358` / `#3ad184`): nothing to change; recheck a legend that said "turquoise"  |
| an application band: `background: var(--hd-band-bg)` + hand-drawn SVG | `<Band>` (+ `BandBlueprint`, `Eyebrow`, `StatStrip variant="band"`); delete the local imagery                |
| `--hd-focus: var(--hd-band-text)` declared inside an application band | nothing: `Band` sets `--ui-ring-color` (`band-focus`); a band of your own sets `--ui-ring-color` instead     |
| a coral CTA on the band with a hand-made glow                         | `<Button variant={UIVariant.ACCENT}>` inside `Band` (or under `[data-ui-band]`)                              |
| an Open Graph image reading `palette['band-bg']` … for its gradient   | `effectValues.light.band` (`gradient`, `glow`, `dots`, `blueprint`, `accentGlow`) and `band` for the numbers |

`check:api`: the main entry has 179 names (+9: `Band`, `BandBlueprint`, `BandBlueprintShape`,
`BandSide`, `Eyebrow`, `EyebrowAlign`, `StatStrip`, `StatStripItem`, `StatStripVariant`); the SCSS
API 235 (−4, +12).

## [1.1.1] - 2026-11-26

### Fixed

- The headers of the generated `tokens.css`, `fonts.css` and `tokens.scss` name `@handijitcom/ui/design`
  instead of the retired `@handijit/design`.

## [1.1.0] - 2026-11-26

The design tokens are now part of this package; `@handijit/design` is no longer a dependency.

### Added

- `@handijitcom/ui/design`: the design tokens' JavaScript API (tokens, themes, colour helpers,
  `THEME_BOOT_SCRIPT`, `THEME_BOOT_SCRIPT_HASH`), built from `src/design`.
- `@handijitcom/ui/tokens.css`, `fonts.css`, `tokens.scss`, `tokens.json`, `fonts/*`, `logos/*`.
- `docs/design.md`: the token reference.

### Migration

- `import … from '@handijit/design'` → `import … from '@handijitcom/ui/design'`.
- `@handijit/design/tokens.css` → `@handijitcom/ui/tokens.css` (the same for `fonts.css`,
  `tokens.scss`, `tokens.json`, `fonts/*`, `logos/*`).
- Remove `@handijit/design` from the application's dependencies.

## [1.0.0] - 2026-11-26

First release under the `@handijitcom` npm organization. The package was previously published as `@handijit/ui` (last version 2.5.0); the API is unchanged, only the package name and the version line reset.

### Changed

- Package name: `@handijit/ui` → `@handijitcom/ui`.
- CI/CD follows the Han Dijit standard (`ci.yml`, `publish.yml`).

## [2.5.0] — 2026-11-13

**What Teknik Servis's day plan needs from the calendar** (EKRAN_OZETI §3.7): a resource header
that turns to the warning tone at 80% of the day's capacity, and the morning, noon and evening
bands beside the hour blocks. Additive only; a calendar without the new props draws as in 2.4.

### Added

- **`CalendarResource.detail`** — a second header line under the label ("7 / 8 iş · %88").
- **`CalendarResource.tone`** — tints the resource's column header with the event tones
  (`warning` for a technician near capacity); `data-tone` on the header. Never alone: the reason
  goes in `detail`.
- **`Calendar` `renderResource(resource)`** — draws the header of a resource column instead of
  its label and detail (an icon, a fill bar); the tone tint stays.
- **`Calendar` `bands`** and the type **`CalendarBand`** (`{ label, start: 'HH:MM', end }`) —
  named stretches of the day drawn as a labelled strip beside the hours (the hours column widens
  to 4.75rem, still `--ui-calendar-gutter`) and a shaded stretch across every column, under the
  events; clipped to the drawn hours, they catch no click or drop.

## [2.4.0] — 2026-11-13

**What the pilot programs need from the component library**: number fields that hold the data
contract's scaled integers, and a calendar. Additive only; nothing is renamed, removed or changes
behaviour.

### Added

- **`ScaledInput`, `MoneyInput`, `QuantityInput`, `RateInput`, `PercentInput`** (main entry, a
  subpath each): number fields that take and give a **scaled integer** (`value: number | null`,
  `onChange(value: number | null)`), never a float. `MoneyInput` takes the currency's
  `minorDigits` (`Kurus`) and a `currency` suffix; `QuantityInput` stores `Qty4` and takes the
  unit's `unitDigits` and a `unit` suffix; `RateInput` stores `Rate6` (at least four places at
  rest); `PercentInput` stores `Pct2` with the `%` before the number; `ScaledInput` takes any
  `scaleDigits` (`Price4`, `Ppm`) with `maxFractionDigits` and `minFractionDigits`. All take
  `min` (0 by default: no minus sign) and `max`, `Field`'s contract, `ref`, `size`,
  `prefix`/`suffix`. The text is read digit by digit with the grammar of app-kit's
  `parseDecimal` (`helpers/scaled-number.helper.ts`, pinned by the same vectors); a keystroke the
  field cannot hold is refused, nothing is rounded. Grouped at rest ("1.234,50"), plain and
  selected while focused.
- **`@handijit/ui/calendar`** — a new entry with **`Calendar`** and its types (`CalendarDay`,
  `CalendarEvent`, `CalendarEventChange`, `CalendarEventTone`, `CalendarResource`,
  `CalendarSlot`, `CalendarView`); styles in `@handijit/ui/calendar.css`. A time grid of days or
  of days and resources, or a month; events moved (into another column) and stretched with the
  pointer, snapped to `slotMinutes`, with a preview and `Escape`; the same with the keyboard
  (roving focus, arrows between events, ⌘/Ctrl + arrows to move, ⌘/Ctrl ⇧ ↑ ↓ to stretch, the
  move announced); a click on an empty slot (`onSlotSelect`), a drop from outside
  (`onExternalDrop`), the day of a month cell and its "+N" (`onDaySelect`). Controlled: a change
  stands when `events` carries it. Times are wall clock text, days come from the caller.
- **`labels.calendar`**: `instructions`, `cancelled`, `more(count)`, `moved(title, when)`.
- **Guards**: the new files are held at 100% coverage (`jest.config.mjs`); the calendar's budgets
  of the pilots as a test (a week of 500 lessons under 300 ms, a day of 20 resources and 200 jobs
  under 500 ms; measured 40–100 ms and 16–30 ms in jsdom); size budgets for the calendar entry
  (5.92 kB), `calendar.css` (2.05 kB) and `MoneyInput` alone (2.02 kB). The main entry grows from
  41.31 to 42.55 kB of its 44 kB.

### Fixed

- **The data contract gate passes on this package** (`program-tools verify contract`, 11/11): the
  SQL keyword list of `CodeBlock`'s highlighter read `insert into values` and the gate took it for
  a write to an unprefixed table `values`. The words are a set; `into` moved, the colouring is
  unchanged.

## [2.3.1] — 2026-11-11

Repository hygiene; the code and styles are those of 2.3.0. 2.3.0 was not published to npm, so
this is the first release of the 2.3 line and carries everything listed under 2.3.0.

### Fixed

- **No machine-specific file in the repository.** `.claude/launch.json` (a local launch
  configuration with an absolute path and the name of an unrelated private project) was tracked; it
  is removed and `.claude/` is ignored.
- **No private project names in the notes and tests.** The design contract (`CLAUDE.md`), the 2.3.0
  entry below, one SCSS comment, one end-to-end test comment, two chat tests and the playground
  named the applications the measurements were taken in; they now describe them (“a chat
  application”, “a desktop program”). The playground's `AppBar` brand is “Acme Chat”, and its four
  visual baselines are redrawn.

### Added

- **`__tests__/public-hygiene.test.ts`**: every file `git ls-files` lists is scanned for an
  absolute path into one machine (a home directory, a temporary folder) and for a denylist of
  private names, kept as SHA-256 digests so the test does not publish them; `.claude/` must stay
  untracked and ignored.

## [2.3.0] — 2026-11-11

**What the first desktop program needed.** The gaps found while building a desktop program
(Electron, a sidebar, keyboard-first), each of which had a workaround in the program. Everything is
additive except three behaviours, listed under "Changed" with the line that restores the old one.

### Added

- **`ToastHub` / `ToastPortal` `placement`**: `bottom-end` (default), `bottom-start`,
  `bottom-center`, `top-end`, `top-start`, `top-center`. `start` and `end` follow the writing
  direction. New types `ToastPlacement` and `ToastInset`.
- **`ToastHub` / `ToastPortal` `inset`**: `{ top, bottom, inlineStart, inlineEnd }` as CSS lengths
  (`'232px'`, `'var(--app-sidebar-width)'`), the stack's distance from the window's edges. An
  application with a sidebar keeps its notices over the content. Written as `--ui-toast-inset-*`
  on the stack (an inline `style`, covered by `style-src-attr 'unsafe-inline'`).
- **`ToastPortal` passes every `ToastHub` prop** (`placement`, `inset`, `closeLabel`,
  `regionLabel`, `className`); it took none.
- **`hasOpenSurface({ includeTransient: true })`**: also counts a visible toast and an open
  tooltip, for a page-level `Escape` listener (both still take that key first).
- **`Popover` `initialFocus`**, **`Modal` `initialFocus`**, **`Drawer` `initialFocus`**: a ref to
  the element that takes the focus on open (inside the surface). Order: `initialFocus`, then
  `data-ui-autofocus`, then the first focusable element (the close button skipped). React's
  `autoFocus` cannot do this inside them: it runs before the dialog is shown.
- **`Combobox` `size="sm"`**: 32px, the box of `Select size="sm"` and `Input size="sm"` from the
  same mixin. At each size the three controls are one height (measured in Chromium: 40px and
  32px).

### Changed

- **A visible toast and an open tooltip are no longer open surfaces.** `hasOpenSurface()` counts
  only what takes the keyboard: modal dialogs (`Modal`, `Drawer`, `BottomSheet`, `ConfirmDialog`,
  `PromptDialog`), the `CommandPalette` and an open `Popover`. In 2.2 ⌘K and every shortcut that
  asks `hasOpenSurface()` were dead for the 4–8 seconds a notice stayed on screen. `Escape` is
  unchanged: one stack, the newest surface closes first, the key is marked (`defaultPrevented`).
  Old answer: `hasOpenSurface({ includeTransient: true })`.
- **Toasts stand at the bottom end at every width.** 2.2 centred them below 1025px, where they
  covered a sidebar and took its clicks. Centred notices: `placement="bottom-center"`.
- **`Modal` and `Drawer` keep a first text field focused on a desktop.** 2.2 pulled the focus back
  to the `<dialog>` on every device to avoid an on-screen keyboard nobody asked for; the guard now
  runs only on a touch screen (`(hover: none) and (pointer: coarse)`) and never after an
  `initialFocus`. `BottomSheet` keeps it everywhere.

### Fixed

- **`Popover` gives its first focus once it is placed.** The surface is hidden until
  `usePositioning` has measured it and the browser ignores `focus()` on a hidden element, so the
  keyboard stayed on the trigger (measured in Chromium; jsdom cannot see it). A later re-placement
  (scroll, resize) does not take the focus back.
- **Tab no longer falls out of a `Popover`.** Past the last element the focus goes to the stop
  after the trigger, before the first it goes back to the trigger; the popover closes and
  `onOpenChange(false)` fires once. The surface is portalled to the end of `<body>`, so the
  browser's own order left the page.
- **`Popover` gives the focus back to the trigger only when it would be lost.** On close the focus
  returns when it was inside the surface or fell to `<body>` with it; a user who tabbed away or
  clicked into a field keeps it there.
- **`Modal` and `Drawer` close the dialog before giving the focus back.** Outside an open modal
  dialog nothing can take the focus; the return worked only through the browser's own dialog
  focus restore.
- **`Combobox`'s clear button is 24px** (was 22px): the visible box meets WCAG 2.5.8 by itself, as
  axe measures it. The 44px tap area is unchanged.
- **The placeholder of an `isTechnical` `Input` is drawn in the body font**, without the letter
  spacing. It is an instruction ("Barkod okutun"), and in monospace with 0.06em it ran about a
  third wider and was cut short in a 320px scan field. The typed value stays monospace.
- **`PromptInput`'s `Escape`** asks `hasOpenSurface({ includeTransient: true })`: a visible toast
  still takes the key before the stream is stopped, as in 2.2.

### Migration

Nothing has to change to update. To drop the workarounds this release makes unnecessary:

1. **Toasts beside a sidebar.** Replace a class that moved the stack (`inset-inline-start`,
   `align-items`) with props:
   `<ToastPortal inset={{ inlineStart: '232px' }} />` (or `ToastHub` with the same props). The
   default placement is already `bottom-end`.
2. **Shortcuts.** Replace a home-made "is a dialog open" check
   (`document.querySelector('dialog[open], [role="dialog"]')`) with `hasOpenSurface()`. It also
   answers for the command palette and an open `Popover`, and no longer for a toast or a tooltip.
   A page-level `Escape` listener writes
   `event.defaultPrevented || hasOpenSurface({ includeTransient: true })`.
3. **Opening focus.** Replace `setTimeout`/`requestAnimationFrame` focus calls and `autoFocus` in
   a `Modal`, `Drawer` or `Popover` with `initialFocus={ref}` (or `data-ui-autofocus` on the
   element). With a text field first, nothing at all: on a desktop it keeps the focus now.
4. **Popover Tab handling.** Delete a `keydown` handler that closed the popover and refocused the
   trigger on Tab from the last control.
5. **Small combobox.** Replace a stylesheet override of the trigger (`min-height: 32px`,
   `padding-block: 0`) with `size="sm"`.
6. **A test** that expected `hasOpenSurface()` to be `true` while only a toast or a tooltip was
   open asks `hasOpenSurface({ includeTransient: true })`.

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

| 1.x                                                                 | 2.0                                                                                                                                                        |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<html data-ui-theme="dark">`                                       | `<html data-theme="dark">`                                                                                                                                 |
| `[data-ui-theme='dark'] .x { … }`                                   | `[data-theme='dark'] .x { … }`                                                                                                                             |
| no attribute = follow the system                                    | the boot script and `useUiTheme` write the resolved theme; without either, `tokens.css` still follows `prefers-color-scheme`                               |
| `<UiThemeScript storageKey="theme" />`                              | `<UiThemeScript />` or `<UiThemeScript nonce={nonce} />`; the key is always `hd-theme`                                                                     |
| the application's own storage key                                   | `localStorage["hd-theme"]` (`THEME_STORAGE_KEY`), values `light` / `dark`, absent = system. Copy a stored choice over once if it must survive the upgrade. |
| `data-ui-density="compact"`, `COMPACT_DENSITY`, `DENSITY_ATTRIBUTE` | removed, no replacement                                                                                                                                    |
| `THEME_ATTRIBUTE` (`'data-ui-theme'`)                               | `THEME_ATTRIBUTE` (`'data-theme'`), re-exported from design                                                                                                |
| `<style id="ui-theme-overrides">`                                   | no longer rendered                                                                                                                                         |

Content-Security-Policy: pass the request nonce to `UiThemeScript`, or add
`THEME_BOOT_SCRIPT_HASH` (`'sha256-…'`, already quoted for the header) to `script-src`. The library
injects nothing else: no `<style>` element, no other script.

#### 4. Theme overrides

| 1.x                                                                          | 2.0                                                                                                              |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `initUi({ theme, colorScheme, density })`                                    | delete the call; see the rows below                                                                              |
| `<UiProvider theme={{ light: { link: '#0a58ca' } }}>`                        | `:root { --hd-primary-text: #0a58ca; }` in the application's stylesheet (per theme: `[data-theme='dark'] { … }`) |
| `applyThemeConfig(config)`, `buildThemeCss(config)`, `resolveTokens(config)` | removed; write `--hd-*` declarations                                                                             |
| `LIGHT_THEME`, `DARK_THEME`                                                  | `themes.light`, `themes.dark` from `@handijit/design`                                                            |
| `DEFAULT_FONTS`, `UiFonts`                                                   | `--hd-font-display`, `--hd-font-body`, `--hd-font-mono`                                                          |
| `METRIC_TOKENS`, `UiMetrics`, `UiMetricToken`                                | `radii`, `spacing`, `typography`, `motion` from `@handijit/design`                                               |
| `UiToken`, `UiThemeTokens`, `UiResolvedTokens`                               | `TokenName` from `@handijit/design`                                                                              |
| `UiThemeConfig`, `InitUiOptions`, `UiDensity`                                | removed                                                                                                          |
| `useUi().theme`                                                              | removed; `useUi()` returns `linkComponent` and `labels`                                                          |
| `useUiTokens(['series-1', 'border'])`                                        | `useUiTokens(['chart-1', 'border'])`: design token names without `--hd-`                                         |
| `setScheme('system')` removed the attribute                                  | removes the stored key and writes the system's theme to the attribute                                            |

#### 5. Variants, tones and props

| Component                      | 1.x                                                  | 2.0                                                                                        |
| ------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `Button`                       | `UIVariant.CART`                                     | `UIVariant.ACCENT`                                                                         |
| `Button`                       | `UIVariant.LIGHT`                                    | `UIVariant.SOFT`                                                                           |
| `Button`                       | `UIVariant.DARK`                                     | `UIVariant.ON_BAND`                                                                        |
| `Button`                       | `PRIMARY`, `SECONDARY`, `OUTLINE`, `GHOST`, `DANGER` | unchanged names; `PRIMARY` is cobalt, `OUTLINE` a cobalt frame, `GHOST` link-coloured text |
| `IconButton`                   | `variant="cart"`                                     | `variant="accent"`                                                                         |
| `Badge`                        | `tone="oem"`                                         | `tone="info"`                                                                              |
| `Badge`                        | `tone="alt"`                                         | `tone="highlight"`                                                                         |
| `Badge`                        | `tone="sale"`                                        | `tone="danger" variant="solid"` (a discount) or `tone="success"` (a positive change)       |
| `Badge`                        | `tone="action"`                                      | `tone="info" variant="solid"`                                                              |
| `Badge`                        | `tone="link"`                                        | `tone="info"`                                                                              |
| charts, `Legend`, `SegmentBar` | `tone="cat-1"` … `"cat-5"`                           | `"chart-1"` … `"chart-5"`                                                                  |
| charts, `Legend`, `SegmentBar` | `tone="series-1"`                                    | `"chart-1"`                                                                                |
| charts, `Legend`, `SegmentBar` | `tone="series-2"`                                    | `"chart-6"`                                                                                |
| `UiThemeScript`                | `storageKey` (required)                              | removed; `nonce` (optional) added                                                          |
| `UiProvider`                   | `theme`                                              | removed                                                                                    |

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

| 1.x (`$name` and `--ui-name`) | 2.0 SCSS variable    | 2.0 custom property          | Note                                                                                  |
| ----------------------------- | -------------------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| `$action`                     | `$primary`           | `--hd-primary`               |                                                                                       |
| `$action-active`              | `$primary-active`    | `--hd-primary-active`        |                                                                                       |
| `$action-hover`               | `$primary-hover`     | `--hd-primary-hover`         |                                                                                       |
| `$action-line`                | `$primary`           | `--hd-primary`               | the primary fill has no separate line                                                 |
| `$action-soft`                | `$bg-disabled`       | `--hd-bg-disabled`           | the disabled fill                                                                     |
| `$alt-bg`                     | `$highlight-soft`    | `--hd-highlight-soft`        |                                                                                       |
| `$alt-fg`                     | `$highlight-text`    | `--hd-highlight-text`        |                                                                                       |
| `$alt-line`                   | `$highlight`         | `--hd-highlight`             |                                                                                       |
| `$bad-bg`                     | `$danger-bg`         | `--hd-danger-bg`             |                                                                                       |
| `$bad-fg`                     | `$danger-fg`         | `--hd-danger-fg`             |                                                                                       |
| `$bad-line`                   | `$danger-line`       | `--hd-danger-line`           |                                                                                       |
| `$band-accent`                | `$highlight`         | `--hd-highlight`             |                                                                                       |
| `$band-fg`                    | `$band-text`         | `--hd-band-text`             |                                                                                       |
| `$band-fg-2`                  | `$band-text-2`       | `--hd-band-text-2`           |                                                                                       |
| `$band-fg-3`                  | `$band-text-2`       | `--hd-band-text-2`           |                                                                                       |
| `$band-hover`                 | `$band-line`         | `--hd-band-line`             |                                                                                       |
| `$breakpoint-desktop`         | `$breakpoint-xl`     | — (SCSS only)                |                                                                                       |
| `$breakpoint-mobile`          | `$breakpoint-sm`     | — (SCSS only)                |                                                                                       |
| `$breakpoint-tablet`          | `$breakpoint-lg`     | — (SCSS only)                |                                                                                       |
| `$breakpoint-tablet-portrait` | `$breakpoint-md`     | — (SCSS only)                |                                                                                       |
| `$cart`                       | `$accent`            | `--hd-accent`                |                                                                                       |
| `$cart-active`                | `$accent-active`     | `--hd-accent-active`         |                                                                                       |
| `$cart-hover`                 | `$accent-hover`      | `--hd-accent-hover`          |                                                                                       |
| `$cart-soft`                  | `$bg-disabled`       | `--hd-bg-disabled`           | the disabled fill                                                                     |
| `$cat-1`                      | `$chart-1`           | `--hd-chart-1`               |                                                                                       |
| `$cat-2`                      | `$chart-2`           | `--hd-chart-2`               |                                                                                       |
| `$cat-3`                      | `$chart-3`           | `--hd-chart-3`               |                                                                                       |
| `$cat-4`                      | `$chart-4`           | `--hd-chart-4`               |                                                                                       |
| `$cat-5`                      | `$chart-5`           | `--hd-chart-5`               |                                                                                       |
| `$danger-solid-hover`         | —                    | —                            | no token; `color-mix(in oklab, #{ui.$danger-solid} 88%, black)` is what `Button` uses |
| `$duration-instant`           | `$duration-fast`     | `--hd-duration-fast`         |                                                                                       |
| `$duration-normal`            | `$duration-base`     | `--hd-duration-base`         |                                                                                       |
| `$ease-in-out`                | `$ease-standard`     | `--hd-ease-standard`         |                                                                                       |
| `$ease-out`                   | `$ease-standard`     | `--hd-ease-standard`         | or `$ease-enter` for something that appears                                           |
| `$ease-spring`                | `$ease-standard`     | `--hd-ease-standard`         | no overshoot curve in the design                                                      |
| `$font-heading`               | `$font-display`      | `--hd-font-display`          |                                                                                       |
| `$font-size-2xl`              | `$font-size-h2`      | `--hd-type-h2-size`          |                                                                                       |
| `$font-size-2xs`              | `$font-size-caption` | `--hd-type-caption-size`     | 12px; the design has nothing smaller                                                  |
| `$font-size-3xl`              | `$font-size-h2`      | `--hd-type-h2-size`          | or `$font-size-h1`                                                                    |
| `$font-size-4xl`              | `$font-size-h1`      | `--hd-type-h1-size`          |                                                                                       |
| `$font-size-base`             | `$font-size-body`    | `--hd-type-body-size`        |                                                                                       |
| `$font-size-body`             | `$font-size-lead`    | `--hd-type-lead-size`        | 17px; `$font-size-body` is now 15px                                                   |
| `$font-size-lg`               | `$font-size-h4`      | `--hd-type-h4-size`          |                                                                                       |
| `$font-size-sm`               | `$font-size-small`   | `--hd-type-small-size`       |                                                                                       |
| `$font-size-xl`               | `$font-size-h3`      | `--hd-type-h3-size`          |                                                                                       |
| `$font-size-xs`               | `$font-size-caption` | `--hd-type-caption-size`     |                                                                                       |
| `$font-steps`                 | `$type-roles`        | — (SCSS only)                | the list of type roles                                                                |
| `$font-ui`                    | `$font-body`         | `--hd-font-body`             |                                                                                       |
| `$footer-bg`                  | `$bg-raised`         | `--hd-bg-raised`             |                                                                                       |
| `$glass`                      | `$bg-overlay`        | `--hd-bg-overlay`            | opaque; the design has no translucent surface                                         |
| `$glass-solid`                | `$bg-overlay`        | `--hd-bg-overlay`            |                                                                                       |
| `$glow-1`                     | —                    | —                            | removed, no replacement: decorative glows are gone                                    |
| `$glow-2`                     | —                    | —                            | removed, no replacement                                                               |
| `$glow-cart`                  | —                    | —                            | removed, no replacement                                                               |
| `$green-accent`               | `$success-solid`     | `--hd-success-solid`         |                                                                                       |
| `$green-accent-hover`         | `$success-solid`     | `--hd-success-solid`         | one success fill                                                                      |
| `$leading-relaxed`            | `$leading-normal`    | `--hd-type-body-line-height` |                                                                                       |
| `$link`                       | `$primary-text`      | `--hd-primary-text`          |                                                                                       |
| `$link-hover`                 | `$primary-text`      | `--hd-primary-text`          | the hover is an underline, not a second colour                                        |
| `$media-bg`                   | `$bg-inset`          | `--hd-bg-inset`              |                                                                                       |
| `$nav-bg`                     | `$bg-surface`        | `--hd-bg-surface`            | a plain surface; `$band-*` is the cobalt brand band                                   |
| `$nav-bg-2`                   | `$bg-raised`         | `--hd-bg-raised`             |                                                                                       |
| `$nav-fg`                     | `$text`              | `--hd-text`                  |                                                                                       |
| `$nav-fg-2`                   | `$text-2`            | `--hd-text-2`                |                                                                                       |
| `$nav-fg-3`                   | `$text-3`            | `--hd-text-3`                |                                                                                       |
| `$nav-hover`                  | `$state-hover`       | — (SCSS only)                |                                                                                       |
| `$nav-line`                   | `$border`            | `--hd-border`                |                                                                                       |
| `$nav-line-strong`            | `$border-strong`     | `--hd-border-strong`         |                                                                                       |
| `$oem-bg`                     | `$info-bg`           | `--hd-info-bg`               |                                                                                       |
| `$oem-fg`                     | `$info-fg`           | `--hd-info-fg`               |                                                                                       |
| `$oem-line`                   | `$info-line`         | `--hd-info-line`             |                                                                                       |
| `$off-bg`                     | `$bg-raised`         | `--hd-bg-raised`             | the "off" role is the neutral tone                                                    |
| `$off-fg`                     | `$text-2`            | `--hd-text-2`                |                                                                                       |
| `$off-line`                   | `$border`            | `--hd-border`                |                                                                                       |
| `$ok-bg`                      | `$success-bg`        | `--hd-success-bg`            |                                                                                       |
| `$ok-fg`                      | `$success-fg`        | `--hd-success-fg`            |                                                                                       |
| `$ok-line`                    | `$success-line`      | `--hd-success-line`          |                                                                                       |
| `$on-action`                  | `$on-primary`        | `--hd-on-primary`            |                                                                                       |
| `$on-action-soft`             | `$text-disabled`     | `--hd-text-disabled`         | text on the disabled fill                                                             |
| `$on-cart`                    | `$on-accent`         | `--hd-on-accent`             |                                                                                       |
| `$on-danger`                  | `$danger-on-solid`   | `--hd-danger-on-solid`       |                                                                                       |
| `$on-green`                   | `$success-on-solid`  | `--hd-success-on-solid`      |                                                                                       |
| `$on-scrim`                   | `$inverse-text`      | `--hd-slate-50`              | light text on a dark, theme-independent backdrop                                      |
| `$on-selected`                | `$on-primary`        | `--hd-on-primary`            |                                                                                       |
| `$on-shell`                   | `$inverse-text`      | `--hd-slate-50`              |                                                                                       |
| `$on-shell-2`                 | `$inverse-text-2`    | `--hd-slate-300`             |                                                                                       |
| `$on-shell-danger`            | `$inverse-danger`    | `--hd-danger-300`            |                                                                                       |
| `$page`                       | `$bg-page`           | `--hd-bg-page`               |                                                                                       |
| `$radius-lg`                  | `$radius-md`         | `--hd-radius-md`             | 12px → 14px                                                                           |
| `$radius-md`                  | `$radius-sm`         | `--hd-radius-sm`             | 8px → 10px                                                                            |
| `$radius-sm`                  | `$radius-xs`         | `--hd-radius-xs`             | 6px stays 6px                                                                         |
| `$radius-xl`                  | `$radius-lg`         | `--hd-radius-lg`             |                                                                                       |
| `$red-accent`                 | `$danger-solid`      | `--hd-danger-solid`          |                                                                                       |
| `$ring`                       | `$focus-halo`        | — (SCSS only)                | the 3px focus halo of fields                                                          |
| `$ring-color`                 | `$focus`             | `--hd-focus`                 | the 2px focus outline                                                                 |
| `$ring-danger`                | `$danger-halo`       | — (SCSS only)                |                                                                                       |
| `$ring-ok`                    | —                    | —                            | removed, no replacement: a valid field has no halo                                    |
| `$sale-bg`                    | `$danger-solid`      | `--hd-danger-solid`          | the "sale" role is `Badge tone="danger" variant="solid"`                              |
| `$sale-fg`                    | `$danger-on-solid`   | `--hd-danger-on-solid`       |                                                                                       |
| `$scrim-soft`                 | `$scrim`             | `--hd-scrim`                 |                                                                                       |
| `$selected`                   | `$primary`           | `--hd-primary`               |                                                                                       |
| `$selected-active`            | `$primary-active`    | `--hd-primary-active`        |                                                                                       |
| `$selected-hover`             | `$primary-hover`     | `--hd-primary-hover`         |                                                                                       |
| `$selected-line`              | `$primary-line`      | `--hd-primary-line`          |                                                                                       |
| `$selected-tint`              | `$primary-soft`      | `--hd-primary-soft`          |                                                                                       |
| `$series-1`                   | `$chart-1`           | `--hd-chart-1`               |                                                                                       |
| `$series-2`                   | `$chart-6`           | `--hd-chart-6`               |                                                                                       |
| `$shadow-lg`                  | `$shadow-2`          | `--hd-shadow-2`              |                                                                                       |
| `$shadow-md`                  | `$shadow-2`          | `--hd-shadow-2`              |                                                                                       |
| `$shadow-sm`                  | `$shadow-1`          | `--hd-shadow-1`              |                                                                                       |
| `$shadow-xl`                  | `$shadow-3`          | `--hd-shadow-3`              |                                                                                       |
| `$shadow-xs`                  | `$shadow-1`          | `--hd-shadow-1`              |                                                                                       |
| `$shell`                      | `$inverse-bg`        | `--hd-slate-900`             |                                                                                       |
| `$shell-2`                    | `$inverse-bg-2`      | `--hd-slate-800`             |                                                                                       |
| `$shell-3`                    | `$inverse-bg-2`      | `--hd-slate-800`             |                                                                                       |
| `$shell-line`                 | `$inverse-line`      | `--hd-slate-700`             |                                                                                       |
| `$skeleton-a`                 | `$bg-disabled`       | `--hd-bg-disabled`           | use `@include ui.skeleton`                                                            |
| `$skeleton-b`                 | `$border`            | `--hd-border`                | use `@include ui.skeleton`                                                            |
| `$space-7`                    | `$space-10`          | `--hd-space-10`              |                                                                                       |
| `$space-8`                    | `$space-12`          | `--hd-space-12`              | up to 64px → 48px                                                                     |
| `$space-9`                    | `$space-16`          | `--hd-space-16`              |                                                                                       |
| `$space-scale`                | —                    | —                            | removed with the density setting                                                      |
| `$star`                       | `$warning-solid`     | `--hd-warning-solid`         |                                                                                       |
| `$surface`                    | `$bg-surface`        | `--hd-bg-surface`            |                                                                                       |
| `$surface-2`                  | `$bg-raised`         | `--hd-bg-raised`             |                                                                                       |
| `$surface-3`                  | `$bg-inset`          | `--hd-bg-inset`              |                                                                                       |
| `$surface-inset`              | `$bg-inset`          | `--hd-bg-inset`              |                                                                                       |
| `$track`                      | `$bg-inset`          | `--hd-bg-inset`              |                                                                                       |
| `$tracking-logo`              | —                    | —                            | removed, no replacement: the logo is an asset of `@handijit/design`                   |
| `$type-scale`                 | —                    | —                            | removed with the density setting                                                      |
| `$warn-bg`                    | `$warning-bg`        | `--hd-warning-bg`            |                                                                                       |
| `$warn-fg`                    | `$warning-fg`        | `--hd-warning-fg`            |                                                                                       |
| `$warn-line`                  | `$warning-line`      | `--hd-warning-line`          |                                                                                       |
| `$z-base`                     | `$z-raised`          | `--hd-z-raised`              | 1; `$z-base` is now 0                                                                 |
| `$z-raised`                   | `$z-sticky`          | `--hd-z-sticky`              | a sticky layer; `$z-raised` is now 1                                                  |

Names that stayed and now carry the design value (no edit needed, but the pixels moved):

| Variable                                                                                                                                    | 1.x                                        | 2.0                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------ |
| `$space-1` … `$space-6`                                                                                                                     | 4, 8, then fluid up to 12 / 16 / 24 / 32px | 4, 8, 12, 16, 20, 24px (`$space-8` is 32px)      |
| `$radius-xs`                                                                                                                                | 4px                                        | 6px                                              |
| `$radius-pill`                                                                                                                              | 999px                                      | 999px                                            |
| `$container-max-width`                                                                                                                      | 1360px                                     | 1280px (`$breakpoint-xl`)                        |
| `$duration-fast` / `$duration-slow`                                                                                                         | 140ms / 320ms                              | 120ms / 320ms                                    |
| `$z-dropdown` / `$z-toast` / `$z-tooltip`                                                                                                   | 200 / 500 / 450                            | 1000 / 1400 / 1500                               |
| `$font-size-control`                                                                                                                        | at least 16px                              | at least 16px (unchanged rule, design body size) |
| `$weight-*`, `$leading-*`, `$tracking-tight`, `$tracking-snug`                                                                              | constants                                  | the design type tokens                           |
| `$text`, `$text-2`, `$text-3`, `$border`, `$border-strong`, `$scrim`, `$band-bg`, `$band-line`, `$danger-solid`, `$font-body`, `$font-mono` | `var(--ui-…)`                              | `var(--hd-…)` of the same name                   |

Custom properties without an SCSS twin:

| 1.x                                                           | 2.0                                                             |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| `--ui-font-size-<step>`                                       | `--hd-type-<role>-size` (roles in the table above)              |
| `--ui-syntax-keyword`, `-name`, `-number`, `-string`, `-type` | removed; `CodeBlock` colours its tokens from the design palette |
| `--ui-anim-*`                                                 | unchanged (`$anim-*`)                                           |

#### 8. Mixins

| 1.x                                                                               | 2.0                                                                                                                   |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `@include ui.for-dark { … }`                                                      | removed. Tokens change with the theme; for a rule that really differs, `[data-theme='dark'] & { … }`                  |
| `@include ui.heading(4xl)`                                                        | `@include ui.heading(h1)`                                                                                             |
| `@include ui.heading(3xl)`, `heading(2xl)`                                        | `@include ui.heading(h2)`                                                                                             |
| `@include ui.heading(xl)` (the default)                                           | `@include ui.heading(h3)` (the default)                                                                               |
| `@include ui.heading(lg)`                                                         | `@include ui.heading(h4)`                                                                                             |
| `@include ui.heading(base)`, `(sm)`, `(xs)`, `(2xs)`, `(body)`                    | `@include ui.block-title`, or `@include ui.type(body)` / `type(small)` / `type(caption)` / `type(lead)` plus a weight |
| `heading($step, $weight)`                                                         | the second argument is gone: the role carries its weight                                                              |
| `@include ui.tint(oem)`                                                           | `@include ui.tint(info)`                                                                                              |
| `@include ui.tint(alt)`                                                           | `@include ui.tint(highlight)`                                                                                         |
| `@include ui.tint(info)` (neutral in 1.x)                                         | `tint(info)` is cobalt now; for the old look use `tint(neutral)`                                                      |
| `tint(<unknown>)` fell back to neutral                                            | a compile error                                                                                                       |
| `interactive-surface($hover: $surface-2, $pressed: $surface-3)`                   | the defaults are `$state-hover` / `$state-pressed`                                                                    |
| `card($radius: $radius-lg)`, `panel($radius: $radius-lg)`                         | default `$radius-md` (14px)                                                                                           |
| `muted($size: $font-size-sm)`, `technical-text(…)`, `money($size: $font-size-lg)` | defaults `$font-size-small`, `$font-size-small`, `$font-size-h4`                                                      |
| `focus-ring($color: $ring-color)`                                                 | default `$focus`                                                                                                      |
| `bottom-sheet($duration: $duration-normal)`                                       | default `$duration-base`                                                                                              |

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

| Hizmet sayfası                               | hanui 5.6.3                   | ui 1.0.0                                                                              |
| -------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| Toplam JS (check-bundle)                     | 191,8 kB                      | **162,1 kB**                                                                          |
| @handijit/ui içeren istemci parçaları        | 39,7 kB                       | 27,8 kB (Combobox, Modal, Drawer, Toast, palet… istemci bileşenlerinin kullandıkları) |
| Render-blocking CSS (`styles.css` tek dosya) | 6 dosya, 46,7 kB (hanui 22,6) | 6 dosya (ui 24,0)                                                                     |

Denenen ve geri alınan: modüllerin CSS'i kendilerinin getirmesi → 12 dosya, 33,3 kB, LCP (yavaş 4G,
Lighthouse medyan) 1,9 s → 2,5 s. Tek dosya ile LCP ölçümü tüketici raporunda.

### Ölçüm (`size-limit`, gz)

|                                 | hanui 5.6.3 | ui 1.0.0       |
| ------------------------------- | ----------- | -------------- |
| yalnızca `Button` (JS)          | 5,12 kB     | **1,33 kB**    |
| yalnızca `Badge` (JS)           | 4,33 kB     | **0,45 kB**    |
| tüm paket (cephe)               | 42,05 kB    | 43,29 kB       |
| `styles.css` (tam)              | 23,07 kB    | 24,22 kB       |
| `base.css` + `Button/style.css` | —           | 3,41 + 1,30 kB |

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

[Unreleased]: https://github.com/handijit/ui/compare/v2.3.1...HEAD
[2.3.1]: https://github.com/handijit/ui/compare/v2.2.0...v2.3.1
[2.3.0]: https://github.com/handijit/ui/compare/v2.2.0...v2.3.1
[2.2.0]: https://github.com/handijit/ui/compare/v2.1.1...v2.2.0
[2.1.1]: https://github.com/handijit/ui/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/handijit/ui/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/handijit/ui/releases/tag/v2.0.0
[1.0.0]: https://www.npmjs.com/package/@handijit/ui/v/1.0.0
