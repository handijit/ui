# @handijit/ui

Accessible React components of Han Dijit, drawn with the tokens of `@handijit/design`.
React 19 · TypeScript strict · SCSS Modules · Vite.

This file keeps the **design contract and the measured decisions**. Installation, usage, the theme
contract, Content Security Policy, labels and the development commands are in `README.md`; the
migration from 1.x is in `CHANGELOG.md`.

⚠ This contract is **normative** for the applications that use the library too. Their documents
only record what deviates.

⚠ **This file describes 2.x.** The visual language (palette, type, radii, spacing, motion, layers,
shadows) belongs to `@handijit/design`. This library declares no colour and decides no value; what
it decides is WHICH token a component draws with, and that is what the sections below record.

⚠ **Two languages, on purpose.** Everything written for 2.0 is in English. The measured history of
earlier majors (5.x of `@ahmetilhn/hanui`, 1.0 of `@handijit/ui`) stays in Turkish as it was
recorded: the measurements still explain the rules, but a token name inside such a note is the
name of its time (`surface-2`, `action`, `shell`, `ring-color` …). The 2.0 name of every one of
them is in the migration table of `CHANGELOG.md`. New text is written in English.

## Öğe seçimi — hangisi, ne zaman

| Soru | Cevap | Ayrımın nedeni |
|---|---|---|
| Seçim mi eylem mi? | `Select` / `Menu` | `listbox` "2 seçenekten biri seçili" der, `menu` "menü, 3 öğe". Eylemi listbox sunmak kalıcı bir seçim vaat ediyordu |
| Düğmeden mi sağ tıktan mı? | `Menu` / `ContextMenu` | Aynı yüzey (klavye, odak, dışarı tıklama tek yerde); `ContextMenu` tetikleyicisiz, imleç noktasında açılır ve eylemlerin üstüne `role="menu"` DIŞINDA bir başlık alır |
| Kaç seçenek? | ≤7 `ChipGroup` · 5-20 `Select` · 20+ `Combobox` | Aramasız liste 20 satırdan sonra taranamıyor |
| Filtre mi görünüm mü? | `ChipGroup` / `SegmentedControl` | Çipe ikinci kez basmak seçimi KALDIRIR; bölmeli denetimde "hiçbiri" yok |
| Panel mi sekme mi? | `Tabs` / `SegmentedControl` | `Tabs` `aria-controls` ile bir panele bağlanır; yoksa var olmayan panel vaat ediliyor |
| Form seçimi mi ayar mı? | `Checkbox` / `Switch` | Checkbox GÖNDERİLİR, switch ANINDA uygulanır — ekran okuyucuda duyuluyor |
| Bilinen liste mi serbest değer mi? | `Combobox` / `TagInput` | |
| Açıklama mı eylem mi? | `Tooltip` / `Popover` | Tooltip `pointer-events: none` — içine konan bağlantıya ulaşılamaz |
| Dar ekran mı geniş mi? | `BottomSheet` / `Drawer` | Tercih değil EKRAN kararı |
| Karar bekliyor mu? | `Modal` / `Popover` | Popover kipsel değil; kullanıcıyı hapsetmez |
| İleri mi geri mi bakıyor? | `Steps` / `Timeline` | Bir ADIM "başarısız" olamaz, bir OLAY olabilir |
| Sonu biliniyor mu? | `Progress` / `Spinner` | |
| Tek bölüm mü bölümler listesi mi? | `Disclosure` / `Accordion` | `Accordion` her bölümünü bir `Disclosure` olarak çizer; `<details>` mantığı tek yerde |
| Durum noktası mı rozet mi? | `StatusDot` / `Badge` | Nokta süren bir durumu (bağlı, çalışıyor) ADIYLA taşır — `label` zorunlu, görsel olarak gizli. Rozet okunan bir etikettir |
| Boş mu yüklenemedi mi? | `EmptyState` · `tone="error"` | Ağ hatasını "kayıt kalmamış" diye okuyan kullanıcı yanlış karar veriyor |
| Satır listesi seçim mi eylem mi? | `ActionListItem isSelected` / `ActionListItem` | `isSelected` verilince satır `aria-pressed` taşır ve kalıcı bir durum vaat eder; eylemi seçim gibi sunmak yanlış söz |
| Öneriler seçim mi eylem mi? | `ChipGroup` / `PromptSuggestions` | Öneri bir EYLEM (`onPick`); çip ise geri alınabilir bir seçim |
| Parçaların toplamı mı zaman çizelgesi mi? | `SegmentBar` (`value`) / `SegmentBar` (`from`/`to`) | Tek görsel (`role="img"`); tam bir eksen gerekiyorsa `/charts` |
| Hangi grafik? | `/charts` — bkz. "`@handijit/ui/charts`" | Eğilim, karşılaştırma, parça-bütün ve dağılım ayrı grafikler; ayrımlar orada ölçülü |

## Surfaces and elevation

| Component | Context | Surface | Elevation |
|---|---|---|---|
| `Tile` · `SummaryCard` · interactive `Card` | Navigation | `bg-surface` + `border` | a border at rest; hover lifts 2px with `shadow-2` and `border-strong`, pressed falls back to `shadow-1` |
| `Card` | Content | `bg-surface` + `border` | NO shadow |
| `Panel` | Form / data | `bg-surface` + `border` | NO shadow |
| `Popover` · `Menu` · `Tooltip` · `Select`/`Combobox` list · `Toast` | Transient layer | `bg-overlay` | `shadow-2` |
| `Modal` · `Drawer` · `BottomSheet` · `CommandPalette` | Modal | `bg-overlay` | `shadow-3` |

**Colour block first, shadow rarely.** A card and a panel carry no shadow at rest; depth is the
difference between the page and the surface, plus the border (`card` / `panel` mixins). When every
card had a shadow (4.x) the shadow stopped meaning "this sits above the surface".

⚠ **A floating layer sits on `bg-overlay`, never on `bg-surface`.** In dark a shadow does not read
on the page; what separates a menu from the card under it is that `bg-overlay` is a step LIGHTER
than `bg-surface`. In 1.x a dark dropdown had the colour of the card it covered.

⚠ **Known limit, measured:** a control that fills itself with `bg-surface` (a field, a `SECONDARY`
button) inside a dark dialog is darker than the dialog. It reads as a well, which is acceptable for
a field; there is no "surface on overlay" token in the design and none is invented here.

Layers are design's (`$z-*`): dropdown 1000 · overlay 1100 · modal 1200 · popover 1300 ·
toast 1400 · tooltip 1500. A component never writes a number.

## Radius rhythm

The scale is design's: `radius-xs` 6 · `radius-sm` 10 · `radius-md` 14 · `radius-lg` 20 ·
`radius-pill`.

| Radius | Who |
|---|---|
| `radius-xs` | small marks and rows inside a surface (a menu item, the box of a checkbox) |
| `radius-sm` | controls: `Button` (`--ui-button-radius`), fields (`input-base`), `Menu`; `Card` and `Panel` on a narrow screen |
| `radius-md` | `Card`, `Panel`, `Popover` |
| `radius-lg` | `Modal`; the top corners of a bottom sheet |
| `radius-pill` | `Button shape="pill"`, the `Switch` track, `Badge` (`--ui-badge-radius`), a radio |

**Inner radius = outer radius − padding.** Two nested surfaces never share a radius: a field with
the radius of the panel around it is not concentric and looks off. The rule is applied by hand;
there is NO mixin that computes it.

## State layers

One rule set (`interactive-surface()`):

- **hover** — a veil of the text colour over the resting fill (`$state-hover`, 8%); nothing else
- **active** — the veil deepens (`$state-pressed`, 14%) and the control is pressed 1px
  (tactile feedback, not colour)
- **selected** — cobalt, and never by fill alone: the soft fill `primary-soft` + a cobalt line
  (`primary-line` on `RadioCard` and `Tile`, `primary` on `Chip`) + the label in `primary-text`.
  The mark of a control or of progress (checked `Checkbox` / `Radio` / `Switch`, the `Tabs` line,
  `Progress`, `Spinner`, `RangeSlider`, `Steps`, the current page) fills `primary`
- **disabled** — the fill withdraws. A field: `passive-surface()` = `bg-raised` · `border` ·
  `text-3`. A filled control (`Button`, `IconButton`, `Switch`): design's disabled pair
  `bg-disabled` + `text-disabled`. A disabled **selection** drops cobalt and is carried by a
  `text-3` mark (the border of a `Chip`)

⚠ **Why a veil and not "one surface step up" (the 1.x rule).** A step is a fixed colour and only
reads on the surface it was chosen for: in dark `bg-raised` is DARKER than `bg-overlay`, so a row
hovered inside a menu or a dialog sank instead of lighting up. A translucent layer of the text
colour darkens a light surface and lightens a dark one, on every surface, in both themes, with one
token. Rows that had their own hover recipe (`Directory`, `Disclosure`, `Steps`) go through
`interactive-surface`; guard for the row rules: `__tests__/styles/hover-surfaces.test.ts`.

Measured (5.x): hover feedback came from **six different property paths** in 28 component files
(`background-color` 30, `color` 18, `border-color` 16, `transform` 7, `box-shadow` 3, `opacity` 2).
The same gesture did two different things in two components.

⚠ Fading with `opacity` is **forbidden**: it fades the text too and silently drops the contrast
threshold. The rule was written and still broken in eleven components (2026-10-10); stylelint
cannot forbid `opacity` (it is legitimate in transitions), so the guard is
`__tests__/styles/passive-opacity.test.ts` — every `opacity` other than `0` / `1` is a fade and
fails. There is no exception list.

⚠ **The resting sort arrow of `DataTable` is NOT passive** — the column can be sorted, it just is
not yet. So no `passive-*` mixin: resting `text-3`, hovered and sorted `text`. In forced colours
the resting arrow writes `GrayText`; otherwise every colour becomes `CanvasText` and the resting
`▴` is drawn exactly like the arrow of an ascending sort.

⚠ **`opacity` also faded in forced colours; tokens do not.** There `text-3` becomes `CanvasText`
and the passive state could not be told from the active one (measured: `Switch`, `FileUpload`,
`RatingInput`, `RadioCard`). `passive-text()` / `passive-surface()` write `GrayText` in that mode.
⚠ A system colour is **not inherited**: every child that writes its own colour asks for it
separately — a disabled `fieldset` got `GrayText` while its `legend` was drawn `CanvasText`.
Native `:disabled` elements are covered by `base.scss`.

⚠ **The resting boundary of a form control is `border-control` (2.1), never `border` or
`border-strong`.** The edge is all that marks an EMPTY control, so WCAG 1.4.11 asks 3:1 of it;
`border-strong` on a surface is 1.53:1 in light and 2.11:1 in dark (2.0 drew fields with it).
`border-control` is design 1.1's role for exactly this: 3.08 – 3.52:1 in light, 3.10 – 4.32:1 in
dark on every surface and on `bg-disabled`.

| Control | Drawn with `border-control` | Hover | Disabled |
|---|---|---|---|
| `Input` · `PasswordInput` · `Textarea` · `Select` · `Combobox` · `DateField` · `TagInput` (`input-base`) | the 1px edge | the edge mixed 40% towards `text` (`color-mix`, follows the theme) | `passive-surface()` |
| `Checkbox` · `Radio` · `TableCheckbox` (`choice-control`) | the 1.5px edge | `text-2` | `bg-disabled` + `border-strong` |
| `Switch` | the OFF track (the thumb is `bg-surface`: same ratio on the track) | the row veil | `bg-disabled` + a `border-strong` line |
| `QuantityStepper` · `SegmentedControl` | the outer frame (inner separators stay `border`) | the button / segment | per button / segment |
| `FileUpload` | the dashed edge of the drop zone | `primary` | `passive-surface()` |
| `RadioCard` | the indicator circle (the card outline stays `border`, it is a card) | card `border-strong` | `border` |
| `PromptInput` | the box | — (focus-within) | `passive-surface()` |

Focus (`focus` + halo) and invalid (`danger-solid`) are unchanged and still read against the
resting edge. Separators, cards, table rules, popups and the BUTTON family (`Button` SECONDARY,
`IconButton`, `Chip`, `Pagination`) keep `border` / `border-strong`: a button is identified by its
label, not by its edge. Guard: `__tests__/styles/control-boundary.test.ts` lists every control and
fails when a stylesheet outside the list reaches for the role; the pairs are in the contrast gate.
A new form control is added to both.

⚠ **`Switch`: an OFF track is `border-control`, a disabled track is `bg-disabled` + a
`border-strong` line.** An off switch still has to be seen as a control (`border-control` passes
the 3:1 of a graphic on every surface; 2.0 used `text-3`); with a surface-coloured track the thumb
disappeared in dark (measured in 5.x: 1.12:1). On: `primary` track, `on-primary` thumb.

The one exception is **rising surfaces** (`Card`, `Tile`): a clickable card lifts on hover and does
not change its fill. Not valid for a row, a menu item or a button.

## Colour roles (2.0)

**One sentence: cobalt is the interface, coral is the button that converts, turquoise is a
highlight.** The palette, both themes and every value live in `@handijit/design`; this library
loads none of it (`styles.css` and `base.css` declare no token) and the application imports
`@handijit/design/tokens.css` once.

- There is **no palette, no recipe and no token build step** in this repository. `palette.ts`,
  `scripts/lib/palette-recipe.mjs`, `build-palette.mjs`, `npm run tokens`, `check:palette`, the
  `_*.generated.scss` files, `theme/tokens.ts` and the `--ui-*` design tokens of 1.x are gone.
- `src/styles/_variables.scss` is a list of **aliases**: `$primary: var(--hd-primary)`. A component
  writes the alias, never `var(--hd-…)` by hand and never a literal colour.
- The `--ui-*` names that remain are **component-private hooks** (`--ui-button-radius`,
  `--ui-chip-*`, `--ui-badge-*`, `--ui-stat-*`, `--ui-header-height`, `--ui-sheet-height`,
  `--ui-ring-width` …) and animation names. None of them is a colour scale.
- A brand override is the application's: a plain `--hd-*` declaration in its own stylesheet
  (`:root[data-theme='dark']` for the dark value on `<html>`). The library never declares one.

### Who draws with what

| Family | Role | Where it lives |
|---|---|---|
| Cobalt — `primary`, `primary-hover/-active`, `on-primary`, `primary-soft`, `primary-line`, `primary-text`, `focus` | primary action, link, selection, focus | everywhere it is the interface colour: `Button` PRIMARY / OUTLINE / GHOST, links, selected states, progress, the focus ring |
| Coral — `accent*`, `on-accent` | the CONVERSION action: download, try, subscribe | `Button` `UIVariant.ACCENT`, `IconButton variant="accent"` — **and nowhere else** |
| Turquoise — `highlight*`, `on-highlight` | a highlight or a "live" / "new" mark, never an action | `Badge tone="highlight"`, `Avatar tone="highlight"`, type names in `CodeBlock` |
| Brand band — `band-*` | the deep cobalt band of the brand, the SAME in both themes | `Button` `UIVariant.ON_BAND`, `Avatar tone="brand"`; the band itself is the application's |
| Inverse — `inverse-*` | a dark technical surface, the SAME in both themes | `TerminalOutput`, `CodeBadge` |
| Status — `success` / `warning` / `danger` / `info` × `-bg` `-fg` `-line` `-solid` `-on-solid` | a state, not an action | `Alert`, `Badge`, `Toast`, `StatusDot`, field errors; `danger-solid` is also the fill of a destructive BUTTON |
| Series — `chart-1…6` | chart series, legend squares, category dots | `/charts`, `Legend`, `SegmentBar`; `muted` is the neutral tone |
| Neutrals — `bg-page/-surface/-raised/-inset/-overlay/-disabled`, `border`, `border-strong`, `border-control`, `text`, `text-2`, `text-3`, `text-disabled` | everything else | `border-control` is the resting edge of a form control and nothing else (see "State layers") |

⚠ **Guard `__tests__/styles/colour-footprint.test.ts`.** Coral, turquoise and the band are tied to
an allow-list of components, each with its reason. A component outside the list that reaches for
one of them fails the test; so does a stale allowance, and so does a 1.x role name coming back
(`cart`, `oem`, `shell` …). No single declaration is ever wrong on its own: a coral chip here, a
coral progress bar there, and coral stops meaning "this is the button that converts". Cobalt is not
listed: it is the general interface colour. A new use enters the list **with its reason**.

⚠ **Guard `__tests__/styles/design-contract.test.ts`.** Every `--hd-*` name in a compiled
stylesheet, in an alias and in TypeScript exists in the INSTALLED design package; the global
stylesheet declares no palette; no stylesheet declares an `--hd-*` property; breakpoints and layers
equal design's; no stylesheet carries a literal colour. A token renamed in design fails here, not
in a consumer.

### Rules that do not move

- **A saturated fill is clickable.** A state label is always a tint (`@include tint($tone)`:
  soft fill + matching line + readable text), an action is always filled or framed. When that line
  blurs, users try to click a status label. `Badge variant="solid"` is the one filled label.
- **One `PRIMARY` per screen.** `ACCENT` is the conversion action (download, try, subscribe)
  and only that: not a second primary, not a decoration.
- **Turquoise is never body text on a light surface** — use `highlight-text`, the readable step
  (`highlight` itself is 2.79:1 on a light surface; `highlight-text` ≥ 4.93:1 on every surface).
- **The price stays in the text colour** (`Price`): the current price inherits the text colour,
  the struck-through old price is `$text-3`, the discount is a small solid badge.
- **Selection is cobalt** (see "State layers"), **status is a tint with an icon or a text**
  (1.4.1), **a link is text**: the three never look alike, so they are told apart by shape and not
  by hue.

### Buttons

| `UIVariant` | Drawn with | For |
|---|---|---|
| `PRIMARY` | `primary` fill, `on-primary` label | the primary action of the screen |
| `ACCENT` | `accent` fill, `on-accent` label | the conversion action (download, try, subscribe) |
| `SECONDARY` | `bg-surface` + `border-strong`, body text | the neutral second action ("Cancel") |
| `OUTLINE` | cobalt frame | an encouraged navigation that is not the primary action ("See all") |
| `SOFT` | neutral fill | a secondary action inside a card |
| `GHOST` | no surface, link colour | toolbar and inline secondary actions |
| `DANGER` | `danger-solid` fill | a destructive action: a delete confirmation |
| `ON_BAND` | `band-*` | an action on the brand band |

`IconButton variant`: `ghost` (default) · `secondary` · `outline` · `solid` · `accent` · `danger`.
`secondary` and `outline` are `SECONDARY` and `OUTLINE` of the table above, value for value in
every state (resting, hover, pressed, disabled): an icon button next to a button of that variant is
its pair. ⚠ Until 2.1 `IconButton` `outline` was the NEUTRAL frame (while `Button` `OUTLINE` was
cobalt) and `secondary` did not exist. 2.1 made `outline` cobalt; the neutral look is `secondary`.
The library's own chrome (the arrows of `Pagination` and `Carousel`, "scroll to latest" of
`ChatThread`, "stop" of `PromptInput`) is `secondary`. Guard:
`__tests__/styles/button-pairs.test.ts` compiles both stylesheets and compares the colours.

Heights: `UISize` XSMALL 28 · SMALL 32 · MEDIUM 40 · LARGE 48 (px). A field is 40px with 15px text
on a desktop pointer and 44px with 16px text on a narrow or touch screen; `input-sm` is 32px. A
MEDIUM button and a field share one line. Guard: `__tests__/components/control-size.test.tsx`.

Measured (`check:contrast`, light / dark): `on-primary` on `primary` 5.03 / 5.03:1;
`on-accent` on `accent` 6.15 / 6.15:1. The tightest step of the two families is `on-primary` on
`primary-hover` in dark: 4.60:1.

### Theme-independent surfaces: `band-*` and `inverse-*`

Both are the same in light and dark **by token**, not by scoping a theme: a button on the brand
band reads `band-text` / `band-line-strong`, terminal output reads `inverse-text` /
`inverse-text-2` and `inverse-danger` for stderr (a light theme's `danger-fg` is unreadable on a
dark surface). Nothing that sits on such a surface may read `text-2` or `border`.

A subtree CAN be themed in 2.0 — `data-theme="dark"` on any element re-declares the tokens for
that subtree (design's selectors). That is the application's tool for a dark section; a component
never sets the attribute.

### Link and focus

- A link is `primary-text`. Inside running text (`Prose`, `Alert`, `Toast`, `SourceList`) it is
  underlined: colour alone does not carry a link (1.4.1). `TextLink` stands alone with its arrow,
  so its underline appears on hover.
- **The focus ring is `focus` (cobalt), 2px, offset 2px, on `:focus-visible`** — `focus-ring()`.
  The width and the offset are hooks (`--ui-ring-width`, `--ui-ring-offset`). Measured: 3.12 –
  3.37:1 on page, surface, raised and overlay in light, 6.08 – 8.17:1 in dark.
- ⚠ **In a well the ring is `$focus-inset`** (`primary-text`): `focus` is **2.95:1** on `bg-inset`
  in light. `CodeBlock` and anything else that sits IN `bg-inset` passes `$focus-inset` to
  `focus-ring()`.
- A text field shows its focus on the border plus a 3px halo (`$focus-halo`); an invalid field the
  same in red (`$danger-halo`). `outline: none` is written only where another indicator is drawn.

### Status tints

`@include tint($tone)` — `success`, `warning`, `danger`, `info`, `highlight`, `neutral`. An unknown
tone is a **compile error** (in 1.x it fell back to neutral and a typo shipped as a grey label).

- The shop tones are gone: `oem`, `alt`, `sale`, `off`, `action`, `link`. A domain tone is the
  application's wording on a generic tone, not a new colour.
- `info` is cobalt (`info-solid` is the value of `primary`), `neutral` is `bg-raised` +
  `border` + `text-2`.
- The line of a tint is advisory (1.22 – 1.29:1 in light, 1.57 – 1.63:1 in dark): it is not the only carrier of the meaning, the
  text and the icon are. Forcing 3:1 would turn every badge into a framed label.

### Contrast gate — `scripts/check-contrast.mjs`

It measures **the pairs the components actually draw**, with the values of the installed design
package, in both themes: 127 pairs per theme, 254 in total, text ≥ 4.5:1, focus and graphics
≥ 3:1. `UI_CONTRAST_VERBOSE=1 npm run check:contrast` prints every number. A failing pair is fixed
by drawing with **another token**, never with a one-off colour, and never by editing a value: the
value is design's.

Advisory pairs (measured and printed, never failing) and what they mean:

| Pair | Light | Dark | Decision |
|---|---|---|---|
| `text-disabled` on `bg-disabled` | 2.06 | 2.28 | The label of a disabled `Button` / `IconButton`. WCAG 1.4.3 exempts disabled controls and the pair is design's. ⚠ This REPLACES the 1.x rule "the disabled label is gated at 4.5:1": with design's tokens the nearest passing label is `text-2` (5.98:1), which no longer looks disabled; `text-3` is 4.35:1 |
| `focus` on `bg-inset` | 2.95 | 8.48 | hence `$focus-inset` |
| `text-3` on `bg-inset` | 4.35 | 6.97 | tertiary text is not written in a well; `CodeBlock` comments use `text-2` |
| `primary` / `danger-solid` / `info-solid` on `bg-overlay` | 5.03 – 5.31 | **2.70 – 2.85** | Design gates these fills on page, surface and raised only. On a dark menu or dialog a filled control is never the only carrier (its glyph is measured as text on a fill), but a bare status ICON in that colour, e.g. in a dark toast, is under 3:1. Known limit; the fix belongs to design (an overlay-safe fill), not to a local colour |
| `border` / `border-strong` on surfaces | 1.19 – 1.53 | 1.25 – 2.27 | hairlines; a card is separated from the page by the border AND the fill. A form control is NOT drawn with them: its edge is `border-control`, gated at 3:1 |
| `highlight` on `bg-surface` | 2.79 | 8.91 | turquoise is a tint and a text colour here, never a state on its own |

## Typography roles

The roles are design's; a component takes a whole role, never a size.

| Role | Size | Used for |
|---|---:|---|
| `display` | 56px | marketing hero — not used by a component |
| `h1` | 40px | |
| `h2` | 30px | page title (`page-title`, balanced wrapping) |
| `h3` | 22px | section heading (`heading()` default) |
| `h4` | 18px | |
| `lead` | 17px | intro paragraph |
| `body` | 15px | body, field text on a desktop pointer |
| `small` | 13px | interface text: labels, table, dense controls |
| `caption` | 12px | help text, overline; the smallest size there is |
| `code` | 13px | IBM Plex Mono |

- `@include type($role)` writes family, size, weight, stretch, line height and letter spacing of a
  role; `@include heading($role)` is a heading role in the text colour. An unknown role is a
  compile error. Headings are Archivo, text is Inter, code is IBM Plex Mono (`fonts.css` of the
  design package; the application decides whether to load it).
- ⚠ **A block title inside a surface is NOT a heading role** (`block-title`: body size, semibold,
  body font). The smallest heading role is 18px and is too loud next to 13 – 15px content in a
  panel, a dialog or a sheet.
- The 1.x steps (`font-size-2xs … 4xl`, `font-size-base`, `heading(xl)`) are gone; the table in
  `CHANGELOG.md` maps each one.
- `$font-size-control` is `max(16px, body)`: the size of a text field on a narrow or touch screen
  (see "Değişmez kurallar").

## Erişilebilirlik

### Kontrast eşikleri

| Tür | Eşik |
|---|---|
| Gövde metni | 4,5:1 (WCAG 1.4.3) |
| ≥19 px ya da ≥16 px kalın | 3:1 |
| İkon, odak halkası, denetim sınırı | 3:1 (WCAG 1.4.11) |

**Advisory** (ölçülür, kırmaz): hairline'lar ve pasif dolgular. 1.4.11 "bilgiyi
ayırt etmek için GEREKLİ" görsel bilgiyi kapsar; rozetin kenarlığı anlamın tek
taşıyıcısı değil ve 3:1'e zorlamak her rozeti çerçeveli bir etikete çevirirdi.

⚠ **2.0 — the label of a disabled control is ADVISORY.** Through 1.x the text on a disabled fill
was gated at 4.5:1 (the measured cost of the exemption then: a disabled button label drawn at
**1.55:1** in light, absent from the checker's list). In 2.0 a disabled `Button` / `IconButton`
draws design's disabled pair, `text-disabled` on `bg-disabled`: **2.06:1** light, **2.28:1** dark.
WCAG 1.4.3 exempts disabled controls; the pair is still measured and printed on every run, so it
cannot drift silently. The decision and the alternatives are in the table of "Contrast gate".
A disabled FIELD (`passive-surface()`, `text-3` on `bg-raised`) stays readable.

### Değişmez kurallar

- **Renk tek başına anlam taşımaz** (1.4.1). Her durum ikon/biçim/metinle de
  bildirilir: `Switch` kulbun konumu, `Steps` üç ayrı işaret, `Timeline` tik ve
  çarpı, `Stat` ok yönü + okunan metin.
- **Dokunma hedefi ≥ 44×44** (2.5.8) — görsel kutu büyütülmeden
  `@include tap-target`.
  ⚠ **KURAL İKİ BİLEŞENDE ÇİĞNENİYORDU ve nöbetçi bunu göremedi** (2026-09-22):
  `Chip` 40px, `Pagination` dar ekranda **36×40**. `__tests__/styles/tap-targets.test.ts`
  ELLE bakılan bir liste ve ikisi listede değildi — yani kural yazılıydı,
  kısmen zorlanıyordu ve aradan geçen iki bileşen sessizce kaldı. İkisi de
  TÜKETİCİDE ölçüldü (e-ticaret vitrini, 390px ve 320px gerçek tarayıcı),
  @handijit/ui'nin kendi ızgarasında değil.
  ⚠ Türetilmiş bir kural denendi ve **elendi**: "44px altında sabit yükseklik
  yazan her dosya `tap-target` içermeli" 32 satır işaretliyor ve ezici
  çoğunluğu süs (`Progress` 4px çubuk, `Spinner`, `Steps` 1px bağlayıcı çizgi).
  Liste kalıyor — yeni etkileşimli bileşen oraya da eklenir.
- **Metin girdisi dar ekranda 16px ALTINA inmez.** iOS Safari 16px altındaki
  bir girdiye odaklanıldığında sayfayı **büyütür ve geri küçültmez**.
  `input-base` ölçüyü bu yüzden `$font-size-control` (`max(16px, …)`) ile kurar.
  ⚠ **`Input --technical` kuralı çiğniyordu:** ölçüyü `$font-size-base`
  (`clamp(15px, …, 16px)`) ile yeniden yazıyor ve dar ekranda **15,03px**
  çiziyordu (ölçüldü: bir şase sorgulama formu). Düzeltme 5.3'te
  yapıldı — dar ekranda alan 1px uzuyor ve görsel tabanların toplu
  yenilenmesiyle birlikte girdi. Nöbetçi `__tests__/e2e/mobile.spec.ts`
  "metin girdileri dar ekranda 16px ALTINA inmez": galerinin TAMAMINDA
  hesaplanmış stili ölçer (düzeltmeden önce `Input` 15,06px ile kırıyordu).
  Tüketicideki geçici ölçü (`MaskedInput`) 5.3'e geçince kaldırılabilir.
- **Odak halkası `:focus-visible`**, kobalt (`$focus`; kuyuda `$focus-inset` — bkz. "Link and
  focus"), asla kaldırılmaz. `outline: none`
  yalnızca yerine başka bir gösterge çizildiği yerlerde. `:focus` kullanmak
  fareyle tıklandığında da halka gösteriyor ve kullanıcılar bunu hata sanıyordu.
- **Kaydırılabilir bölge klavyeyle ulaşılabilir** (2.1.1). `ScrollArea` taşmayı
  ölçüp `tabindex`i yalnızca gerçekten gerekiyorsa yazar.
- **Metin kütüphaneden gelmez.** Erişilebilir adlar `labels` sözleşmesinden;
  eksik metin geliştirme kipinde konsola düşer.

### Yerel öğe korunur

`<dialog>`, `<input type="range">`, `<input type="radio">`,
`<input type="checkbox">`, `<input type="date">`, `<input type="file">`,
`<details>`. Taklit yazmanın tek gerekçesi **ölçülmüş bir kusur** ve o gerekçe
bileşenin JSDoc'una yazılır.

⚠ **Bugünkü tek istisna `Select`.** Kural onu da kapsıyordu ve uzun süre doğru
karardı; ancak açılır listesinin içine hiçbir biçimde girilemiyor — seçili değeri
işaretlemek, satırı yükseltmek, ikon koymak mümkün değil ve her tarayıcı onu
başka türlü çiziyor. `Select` tetikleyici + listbox olarak kuruldu; bedeli (odak
yönetimi, ok tuşları, `aria-activedescendant`) **bir kez** ödenip tek bileşene
kapatıldı. Yeni bir yerde ham `<select>` yazılmaz.

## Hareket

Bileşenler kendi sürelerini SEÇMEZ; ölçek dışı süre gerekiyorsa token'a eklenir.
Nöbetçi `stylelint.config.mjs` — bileşen SCSS'inde ham `ms`/`s` yasak.

2.0: the scale is design's (three steps; the 1.x `duration-instant` 80 ms and `duration-normal`
are gone, `duration-fast` moved from 140 to 120 ms).

| Token | Süre | Ne için |
|---|---:|---|
| `duration-fast` | 120 ms | Hover, odak, renk, kenarlık, basma |
| `duration-base` | 200 ms | Kip pencere, çekmece, dipten açılan panel, `Disclosure`, `Progress`, `Toast` |
| `duration-slow` | 320 ms | Uzun kayma (`Card` görselinin büyümesi) |

⚠ **200 ms üzerindeki geçişler** tıklama ile sonuç arasında görünür gecikme
yaratır ve arayüz yavaş hissedilir.

**Döngü süreleri ölçekten AYRI** ve kütüphanenin kendi sabitleri (design'da karşılığı yok):
`duration-spin` 700 ms, `duration-shimmer`
1400 ms, `duration-pulse` 1600 ms (`StatusDot` nabzı — 700 ms telaş, 2 sn ölü gibi
okunuyordu; nabız noktayı soluklaştırmaz, etrafında sönen bir HALE çizer). Sürekli dönen bir gösterge bir *geçiş* değil — 320 ms'lik dönüş baş
döndürücü, 120 ms'lik parıltı titreşim gibi okunuyor. Ayrı isim vermenin sebebi
ölçekten kaçmak değil **ölçeği korumak**.

**Eğriler (2.0, design'ın):** `ease-standard` her geçişin eğrisi. `ease-enter` / `ease-exit`
takma ad olarak duruyor, bugün hiçbir bileşen kullanmıyor. 1.x'in `ease-out`, `ease-in-out` ve
`ease-spring` eğrileri yok: dipten açılan panel de `ease-standard` ile açılır.

**Giriş ve çıkış SİMETRİK.** Kipsel yüzeyler açılırken canlanıp kapanırken bir
karede yok oluyordu; kullanıcı neyin kapandığını göremiyordu.
`surface-transition` bunu `@starting-style` + `transition-behavior:
allow-discrete` ile tek kural kümesinde verir.

⚠ `animation` ile bu **mümkün değil**: bir animasyon öğenin `display: none`
olmasını geciktiremez. `::backdrop` için **ayrı** mixin
(`backdrop-transition`) — `&[open]` sözde öğeye uygulanamaz, çünkü
`dialog::backdrop[open]` hiçbir zaman eşleşmez.

`prefers-reduced-motion` her animasyonda karşılanır.

### `Pagination.scrollTo="top"` — kaydırma kodu ÇAĞIRANDA yazılmaz

Sayfa değiştikten sonra başa dönme her tüketicide elle yazılıyordu (ya da hiç
yazılmıyordu: uzun katalog listesinde 2. sayfaya geçen kullanıcı listenin
**dibinde** kalıyordu). Kural artık bileşende: `scrollTo="top"` iki kipte de
(`buildHref` ve `onPageChange`) çalışır.

⚠ **Kaydırma ANİDİR** (`behavior: 'instant'`), yumuşak değil. Yumuşak kaydırma
içerik değişirken sürüyor olur — kullanıcı yeni listeyi hareket hâlinde görür —
ve uzun sayfada tıklama ile üste varış arasında saniyeler geçer. Anî kaydırma
ayrıca `prefers-reduced-motion` sorusunu tamamen ortadan kaldırır.

⚠ **Üç durumda kaydırılmaz:** etkin sayfaya basıldığında (içerik değişmiyor),
yeni sekmede açan tıklamada (Ctrl/Cmd/Shift/orta tuş — mevcut sayfa yerinde
kalmalı) ve `linkProps.onClick` `preventDefault` çağırdığında (gezinme iptal
edilmiş).

⚠ **`linkProps.onClick` DÜŞMEZ:** bileşenin kendi `onClick`i spread'den sonra
yazılıyor, bu yüzden tüketicininki zincirlenerek önce çağrılır.

### ⚠ Bağlantı kipinde OKLAR ölü tuştu

Aynı turda ölçüldü: `buildHref` verildiğinde sayfa numaraları `<a>` oluyordu ama
önceki/sonraki okları `onPageChange` çağıran birer `<button>` olarak kalıyordu —
o kipte `onPageChange` tanımsız olduğu için **tıklama hiçbir şey yapmıyordu**.
Hata yok, log yok; yalnızca çalışmayan iki tuş. Oklar artık numaralarla aynı
kipi izler.

⚠ **Sınırdaki ok bağlantı DEĞİL devre dışı düğmedir** — bir `<a>` devre dışı
bırakılamaz ve `aria-disabled` taşıyan bir bağlantı hâlâ tıklanır.

## Ankrajlı yüzeyler — panel tetikleyicisine bağlı kalır

Açılır her yüzey (`Menu`, `Popover`, `Tooltip`, `Combobox`, `Select`) konumunu
`usePositioning`ten alır; kanca **viewport koordinatı** üretir ve yüzeye
`position: fixed` + `top`/`left` yazar.

⚠ **`position: fixed` TEK BAŞINA "viewport'a göre konumlan" DEMEK DEĞİL.**
`none` olmayan bir `transform`/`translate`/`scale`/`rotate`, bir `filter`,
`backdrop-filter`, `perspective`, `will-change` ya da `contain: paint|layout`
taşıyan **her ata** sabit konumlu torunları için kapsayıcı blok yaratır. Kapsayıcı
blok kayınca kancanın ürettiği koordinatlar atanın sol üstüne göre yorumlanır ve
yüzey **atanın sayfa içindeki konumu kadar kayar**; aynı ata `overflow: hidden`
de taşıyorsa yüzey ayrıca **kırpılır**.

**Kural: ankrajlı yüzey PORTALLANIR.** Tek yol `hooks/usePortalSurface` —
hedef seçimi (`document.body` ya da en yakın açık `<dialog>`) ve üst katman
kararı `helpers/portal.helper.ts`te.

⚠ **`Combobox` ve `Select` bu düzeltmeyi ALMAMIŞTI** ve ikisi de panelini kökün
içinde çiziyordu. Ölçüldü (2026-08-19, chromium 1280×900, `.gallery__stage`
üzerinde `transform: translateZ(0)`):

| yüzey | panelin tetikleyiciden yatay kayması |
|---|---|
| `Menu` / `Popover` / `Tooltip` | 0px (portallanmış) |
| `Combobox` | **46px** |
| `Select` | **46px** |

Kırpan bir ata eklendiğinde (`overflow: hidden`) panel isabet testini de
kaybediyordu — yani görünür sayılıyor ama tıklanamıyordu.

⚠ **PORTALLAMAK DIŞARI-TIKLAMA DENETİMİNİ KIRAR ve kırılma SESSİZDİR.** Panel
artık kökün içinde olmadığı için `rootRef.current.contains(target)` tek başına
panelin **içine** yapılan `mousedown`u "dışarı" sayar: panel, seçeneğin
`onClick`i ateşlenmeden kapanır ve liste açılır ama **hiçbir seçenek
seçilemez**. Denetim iki ref'e birden bakmak zorunda (`Menu` baştan öyle
yapıyordu). Nöbetçi `__tests__/components/Combobox.portal.test.tsx`.

⚠ **Panel genişliği render sırasında DOM'dan okunmaz.** İki bileşen de
`triggerRef.current?.offsetWidth` yazıyordu; render sırasında DOM okumak ilk
render'da `undefined` verir ve değer bir daha **güncellenmez** — pencere yeniden
boyutlandığında panel bayat genişlikte kalır. Ölçüm `usePositioning`in kendi
`ResizeObserver`ında: `PositioningState.anchorWidth`.

### ⚠ Tetikleyici içi süsler — `tap-target` SIRALAMASI üç arıza üretiyordu

`.combobox__clear` `position: absolute` yazıyor, ama `@include tap-target`
ondan **sonra** gelip `position: relative` yazıyordu; aynı özgüllükte son
bildirim kazanır ve `absolute` **ölü** kalıyordu. Dosyayı okuyan kişi doğru
sanıyor — bildirim orada duruyor.

Ölçüldü (2026-08-19, `?solo=Combobox`, `isClearable` + seçili değer):

| ne | beklenen | ölçülen |
|---|---|---|
| `✕` `position` | `absolute` | **`relative`** |
| `.combobox` kök yüksekliği | 48px (tetikleyici) | **73px** |
| `✕` yatay konumu | tetikleyicinin içinde | kökün **36px SOLUNDA** |
| caret dikey kayması | 0px | **12px** |

Zincir tek yönlü ve üç arıza **tek** hatadan doğuyor: düğme akışta kaldı →
tetikleyicinin altına blok olarak dizildi → kök 48'den 73px'e şişti →
`right: 36px` göreli bir öteleme olarak yorumlanıp düğmeyi bileşenin tümüyle
dışına attı → köke çapalı caret'in `top: 50%`i artık tetikleyicinin merkezini
göstermiyor.

**İki düzeltme, iki ayrı gerekçe:**

| ne | nasıl |
|---|---|
| `✕` | `position` artık `@include tap-target`TAN SONRA yazılır. `absolute` de konumlu kutu kurar, `::after` çapası korunur |
| caret | mutlak konum bırakıldı, **düz esnek çocuk** oldu — hizalamayı tetikleyicinin `align-items: center`ı yapar, kapsayıcı bloktan bağımsız. Kardeş `Select` baştan böyleydi ve arızayı hiç taşımadı |

⚠ **Caret esnek akışa girince `--clearable` DOLGUSU DÜŞTÜ.** Eski dolgu
(`$space-3 + $icon-sm + $space-2 + $clear-size + $space-2` = 66px) iki süsün
payını birlikte ayırıyordu; caret artık gerçek yer tuttuğu için o dolgu onu içe
itiyor ve caret sağ kenardan **67px** kopup `✕`in soluna düşüyordu. `✕`in payı
bugün caret'in `margin-inline-start`ıyla açılır.

⚠ **Mixin artık uyarıyor:** `tap-target` `position` yazar, yani çağrı yerinde
**en başta** include edilmeli. Kalan yedi kullanıcı tarandı; sıralama hatası
yalnızca burada vardı.

### Nöbetçiler ve ölçülemeyen boşluk

| nöbetçi | ne tutuyor |
|---|---|
| `__tests__/e2e/anchored-panel.spec.ts` (7) | panelin dönüştürülmüş/kırpan atada kaymaması, caret ve `✕`in tetikleyici içinde kalması, kök yüksekliği == tetikleyici yüksekliği |
| `__tests__/components/Combobox.portal.test.tsx` (7) | panelin kökün DIŞINA çizilmesi; portallanan panelde seçim ve arama kutusunun paneli kapatmaması |

⚠ **`desktop-behavior` PLAYWRIGHT PROJESİ BU TUR AÇILDI ve boşluk yapısaldı.**
Öncesinde davranış ölçen her spec yalnızca `ios` + `android` projelerinde
koşuyordu (tek masaüstü projesi `visual` ekran görüntüsü alıyor) ve
`Combobox`/`Select` dar ekranda **alt sayfa** açıyor. Yani bu iki bileşenin
`popover` dalı — panelin konumlandırıldığı **tek** dal — hiçbir tarayıcı testi
tarafından çalıştırılmıyordu. (2.0: alt sayfa yalnızca dar VE dokunmatik ekranda açılır,
`SHEET_MEDIA_QUERY`; dar bir masaüstü penceresi de `popover` dalını çalıştırır.)

⚠ **Görsel nöbetçi arızayı ZATEN GÖRMÜŞTÜ, kimse bakmadı.** Depodaki
`Combobox-light.png` **1232×155**; hatalı kod aynı bölümü **1232×180** çiziyor,
yani taban çizgisi hatadan ÖNCE kaydedilmiş ve `visual.spec.ts` o günden beri
kırmızı. Düzeltme taban çizgisini **bayt bayt** geri getiriyor — güncelleme
gerekmedi. ⚠ `ızgara` testi ilk uyuşmazlıkta DURUR ve yalnızca tek bir bileşen
bildirir — arkasındaki bayat tabanları göstermez. 5.0 ve 5.3'teki toplu
yenilemelerden sonra masaüstü ve mobil görsel süit **yeşil** (40/40).
2.0: the theme changed every pixel, so all 480 baselines were regenerated
(`--update-snapshots=all`, the pinned Chromium of `npm run test:device:install`) and the four
compact-density shots were removed with the density; the suite is 40/40 again. `test:visual` and
`test:device` are NOT part of `verify` or CI: run them by hand after a visual change.
⚠ `--update-snapshots=changed` küçük farkı YENİDEN YAZMAZ: eşik
`maxDiffPixelRatio: 0.002`, yani iki küçük yazının kalktığı bir değişiklik eşiğin
altında kalıp eski taban dosyada durur (ölçüldü: radar ölçek sayıları). Küçük
değişiklikte bölümün tabanı silinip `--update-snapshots=missing` ile yazılır.

## Kaydırma kabı kapsayıcı bloktur (5.3.2)

**Kural:** `overflow: auto|scroll` yazan her kural `position` da yazar (durağansa `relative`).

Görsel olarak gizli metin (`visually-hidden` — `StatusDot` adı, `TerminalOutput` stderr öneki,
`Citation`, grafiklerin gizli tablosu) `position: absolute` taşır ve **en yakın konumlu ataya** göre
yerleşir. Kaydırma kabı konumlu değilse o ata kabın DIŞINDADIR: etiket kabın kırpmasına girmez,
kabın içindeki statik yerinde (katlamanın çok altında) durur ve her atanın kaydırılabilir taşmasını
uzatır.

⚠ **Tüketicide ölçüldü (hanration, 2026-10-10):** `ChatThread`in KÖKÜ (`.thread`) konumluydu,
kaydırma kabı (`.thread__scroll`) değil. `ToolCall` kartlarındaki nokta adları ana bölgenin
`scrollHeight`ini 843 → 1053 px'e çıkardı; `overflow: hidden` uygulama çerçevesi programla
kaydırılabilir oldu ve kipsel pencere kapanıp odağı geri verdiğinde tüm yerleşim ~210 px yukarı
kaydı. Tüketici bunu çerçevesine `overflow: clip` yazarak örttü; kök düzeltme burada.

Taramada **18 kaydırma kabından 16'sı konumsuzdu** — yalnızca `DataTable` (SCSS) ve `Menu` (satır
içi `position: fixed`) konumluydu. Galeride ölçülen sızıntı (gizli etiket kabın 1200 px dibinde,
chromium 1280×900; Pixel 7'de aynı mertebe):

| kab | büyüyen | ne kadar |
|---|---|---|
| `ChatThread` | kök ve tüm atalar | +1024 px |
| `TerminalOutput` | sayfa | +514 px — kendi stderr öneki de sızıyordu |
| `ScrollArea` | sayfa | +626 px |
| `ActionList` (sanal) | sayfa | +2171 px |

Düzeltmeden sonra dördü de 0 ve görsel süitte tek piksel değişmedi (40/40; değişen tek taban
`ActionList`in yeni `virtual` durumu).

⚠ **Düzeltme mixin'de DEĞİL, kapta.** `clip-path` ve `overflow: hidden` gizli kutunun KENDİSİNİ
taşmadan çıkarmaz (1×1 px kutu statik yerinde durur). Etiketi kapsayıcı bloğunun köşesine sabitlemek
(`inset: 0`) taşmayı keserdi, ama ekran okuyucunun imleci etikete gittiğinde tarayıcı onu
görünür alana getirmek için sayfayı o köşeye kaydırır.

⚠ **`position: relative` kabın içindeki mutlak konumlu öğelerin dayanağını değiştirir.** Taranan
kaplarda kabın dışına dayanmak İSTEYEN öğe yoktu: `ChatThread`in "en yeniye in" düğmesi dokta,
`Carousel`in okları şeridin dışında, `Table`ın yapışkan başlığı `sticky` (zaten kaydırma kabına
göre), `Tabs` çizgisi sekmenin kendisine göre.

⚠ **`overflow: hidden` kırpma kapları kapsam dışı** (`Card`, `Avatar`, `Disclosure`…): içerik
kutuyu aşmadıkça gizli etiketin statik yeri kutunun içinde kalıyor. Nöbetçi yalnızca `auto|scroll`
okur.

| nöbetçi | ne tutuyor |
|---|---|
| `__tests__/styles/scroll-containment.test.ts` | SCSS'te `overflow: auto\|scroll` yazan her kural konumlu; BEM değiştiricisi (`&--x`) ebeveyninden, `position` yazan mixin'in include'u (`tap-target`, `sticky-below-header`) sayılır. Tek istisna `Menu` — gerekçesiyle ve bayatlık denetimiyle |
| `__tests__/e2e/scroll-containment.spec.ts` (4 × 3 proje) | gerçek yerleşim: kabın dibine konan gizli etiket hiçbir atanın `scrollHeight`ini büyütmez, `scrollIntoView` yalnızca kabı kaydırır. `desktop-behavior` + `ios` + `android` (`ANY_VIEWPORT_SPEC`) |

## `@handijit/ui/chat` — sohbet bileşenlerinin AYRI girişi (5.2)

**Neden ayrı:** 5.1 tüm girişi bütçenin sınırına taşıdı (42,00 / 42 kB) ve
sohbet bileşenlerinin e-ticaret vitrininde çağıranı yok. Ana girişe girselerdi vitrinin
indirdiği paket ve `styles.css` büyürdü. Ayrı girişte ana pakete **sıfır bayt**
eklendi (ölçüldü: ana giriş 42 000 bayt, önce ve sonra).

| Ne | Nerede |
|---|---|
| Kaynak | `src/chat/<Bileşen>/` · cephe `src/chat/index.ts` |
| Derleme | `vite.chat.config.ts` (`vite.subentry.ts`) → `build/chat.js`, `chat.cjs`, `chat.css` |
| Tipler | `tsconfig.subentries.json` → `build/types/chat/` (dosya başına) |
| Dışa aktarım | `exports["./chat"]`, `exports["./chat.css"]` |
| Bütçe | `chat.js` 13 kB (2.0'da ölçülen 11,76; vurgulayıcıdan önce 6,29) · yalnızca `CodeBlock` 7 kB (6,25) · yalnızca `ChatThread` 1,3 kB (1,04) · `chat.css` 5 kB (4,06) |
| API taban çizgisi | `scripts/api-baseline.chat.txt` (30 ad) |

⚠ **ANA GİRİŞ DIŞSAL — sohbet kodu onu PAKET ADIYLA alır.** Bir sohbet
dosyası `../../components/…` ya da `../../theme/context` gibi göreli bir yolla
ana girişe uzanırsa o modülün İKİNCİ BİR KOPYASI `chat.js`e paketlenir ve
derleme yine de yeşil biter:
- `theme/context` kopyası → sohbet bileşenleri `UiProvider`ın metinlerini
  ve yönlendiricisini GÖRMEZ
- `helpers/focus.helper` kopyası → kipsel yüzey yığını ikiye bölünür, `Escape`
  yanlış yüzeyi kapatır
- bir bileşen kopyası → CSS'i `chat.css`e de girer

Nöbetçi `__tests__/subentry-boundary.test.ts`: göreli yolla yalnızca DURUMSUZ
yardımcılar (`cx`, `named`, metin çözümü, tipler, sabitler) ve SCSS alınabilir;
`@/` takma adı da yasak (dosya başına tiplerde çözülmeden kalıyor). Aynı test ana
girişin sohbeti içe aktarmadığını da ölçer. Derlenmiş `chat.js`te
`createContext` SIFIR.

⚠ **Depo içinde paket adı kaynağa eşlenir** (tsconfig `paths`, jest
`moduleNameMapper`, playground `alias`). Paketin kendi adı tüketicide `exports`
üzerinden derlenmiş ana girişe çözülür.

⚠ **Tipler neden `vite-plugin-dts` ile DEĞİL:** toplama adımı girişi
`<outDir>/index.d.ts` diye hesaplıyor ve ortak `build/`da duran ANA girişin
tiplerini toplayıp üzerine yazıyordu (ölçüldü: `chat.d.ts` 176 ana adı
taşıyordu). Dosya başına `tsc` çıktısı bu sorunu taşımaz ve `check:api` sohbet
girişinin cephe dosyasındaki `export { … } from` satırlarını okur.

**Bileşenler** (20; hepsi eksen taramasında, davranışları `__tests__/chat/`):

| Grup | Bileşen | Not |
|---|---|---|
| İskelet | `ChatThread` | Sona yapışık kaydırma, "en yeniye in", alt dok. ⚠ Akan belirteçler OKUNMAZ (`aria-live` yok, `role="log"` değil); yanıt bitince TEK cümle duyurulur (`labels.chat.replyReady`) |
| | `ChatMessage` (`author`) | Kullanıcı balonu `bg-raised`; eylemler hover'da VE `:focus-within`de belirginleşir (renkle, `opacity` değil) |
| | `PromptInput` | `Enter` gönderir, `Shift+Enter` satır, IME yazımında `Enter` GÖNDERMEZ; `Escape` akışı durdurur ama açık bir yüzey varken DOKUNMAZ (`hasOpenSurface`). Gönder = kobalt dolgu (`IconButton variant="solid"`, ekranın tek birincil eylemi) |
| | `PromptSuggestions` | EYLEM ızgarası, seçim değil (`ChipGroup` değil) |
| Yanıt | `Prose` | Tipografi kabı; ayrıştırıcı İÇERMEZ (markdown/KaTeX tüketicide) |
| | `CodeBlock` | Yerleşik vurgulayıcı + biçimlendirici, bağımlılıksız (aşağıda); `html` (Shiki) verilirse onun yerine geçer — güvenliği ÇAĞIRANIN |
| | `ReasoningBlock` + `ReasoningText` | Tur sürerken açık, bitince kapanır — kullanıcı dokunduysa tercihine DOKUNULMAZ |
| | `ToolCall` + `ToolCallSection` | Durum nokta + OKUNAN metin (`labels.chat.toolStatus`); çalışan nokta NÖTR nabız |
| | `TerminalOutput` | Temadan bağımsız koyu yüzey (`inverse-*`), sona yapışık; stderr gizli önek taşır (renk tek başına anlam taşımaz) |
| | `SourceList` + `Citation` | Atıfın okunan adı `labels.chat.citation(n)` |
| | `MessageActions` | `role="toolbar"`, ok/`Home`/`End` |
| Uygulama | `AppBar` | Kendi yüksekliğini `--ui-header-height`e yazar |
| | `ActionList` + `ActionListItem` | `isSelected` verilirse SEÇİM (`aria-pressed`), verilmezse EYLEM; `rowHeight` ile sanal (`aria-posinset`/`aria-setsize`) |
| Veri | `SegmentBar` | Yığılmış (`value`) ya da zaman çizelgesi (`from`/`to`); TEK görsel (`role="img"`), adı tüm parçaları okur |
| | `Legend` · `DescriptionList` | Kategorik palet; `tone` (`color` değil — tek ad kuralı) |

**Plandan sapmalar:** `ChatMessage.role` → `author` (`role` HTML özniteliğiyle
çakışıyordu); `StatusDot`ta `brand` tonu yok (tonlar: `neutral`, `success`, `warning`,
`danger`); `SegmentBar`
parça başına `Tooltip` yerine tek bir okunan özet (çubuğun içinde sekme durağı
dizmek daha az bilgi verip daha çok tuş istiyordu); `code-bg` / `terminal-*`
token'ları eklenmedi (2.0 adlarıyla `bg-inset` ve `inverse-*` karşılıyor).

### `CodeBlock` — yerleşik vurgulayıcı ve biçimlendirici (5.4)

5.2'de `CodeBlock` "vurgulayıcı İÇERMEZ" diye kuruldu, Shiki tüketicideydi. Sonuç:
Shiki bağlamayan her tüketicide (galeri dahil) kod **renksiz** çiziliyordu; bağlayanda
da renkler Shiki'nin `github-*` temasından geliyordu — kontrastı ölçülmüyor, @handijit/ui
paletiyle hiçbir bağı yok.

| Karar | Gerekçe |
|---|---|
| Bağımlılıksız sözcük çözümleyici: dilin kuralları TEK birleşik düzenli ifadede, tek geçiş | Shiki bunun onlarca katı ve eşzamansız (ilk boyama renksiz, sunucu çiziminde renk yok). Grafikler de sıfır bağımlılıkla kuruldu |
| Dilbilgisi çözümleyicisi DEĞİL — bilinen yaklaşıklıklar | JSX metnindeki büyük harfli kelime tip boyanır; kesme işaretli JSX metni (`Don't`) satırın kalanını dize sayar; YAML düz değerleri boyanmaz. Shiki doğruluğu gerekiyorsa `html` |
| Diller: ts/tsx/js/jsx, json, bash/sh/zsh, python, ruby, yaml, toml, css/scss/less, html/xml/svg, markdown, sql, diff, graphql, dockerfile, c/c++/c#, java, kotlin, swift, go, rust, php (takma adlarla 56 ad) | hanration'ın Shiki'ye verdiği listenin tamamı. Tanınmayan dil düz |
| Geriye bakış (`(?<=…)`) YOK | Safari 16.4 öncesinde ifade kurulurken `SyntaxError` — kod bloğu hiç çizilmezdi. Önceki karaktere bağlı kurallar `reject` ile (`a#b` yorum değil, `useState<string>` etiket değil) |
| `/` bağlama göre düzenli ifade ya da bölme | Bağlamsız kural `a / b / c`yi düzenli ifade boyuyordu. Karakter sınıfının kapanışı tam kuralda zorunlu: isteğe bağlı `]` birkaç bin `[`de üstel geri dönüş yapıp sayfayı kilitliyordu |
| Özellik erişimi anahtar kelime değil (`map.get`, `obj.type`) | Bağlamsal anahtar kelimeler (`get`, `type`, `of`) en sık özellik adı |
| Rust yaşam süresi (`'a`) dize açmaz | Tek tırnağı dize sayan kural satırın kalanını boyuyordu |
| Kapanmamış yorum ve dize METNİN SONUNA kadar | Akan yanıtta blok bitmeden renk doğru tarafta kalır |
| `<span>` + sınıf; `dangerouslySetInnerHTML` YOK | Yerleşik yol XSS yüzeyi açmaz (`html` yolunun güvenliği yine çağıranın) |

⚠ **20 000 karakterin üstü düz çizilir** (`HIGHLIGHT_LIMIT`). Maliyet çözümlemede
değil `<span>` sayısında. Ölçüldü (chromium, galeri sunucusu, React geliştirme
kipi):

| kod | çözümleme | parça | DOM + yerleşim | React ilk çizim | akışta güncelleme |
|---|---:|---:|---:|---:|---:|
| 20 000 karakter | 3,8 ms | 1 555 | 17 ms | 139 ms | 78 ms |
| 50 000 karakter | 8,5 ms | 4 333 | 66 ms | 590 ms | 173 ms |

**Biçimlendirici** (`format.ts`):

- JSON **metin üzerinden** yeniden girintilenir. `JSON.parse` + `stringify`
  2^53'ün üstünü yuvarlıyor (`12345678901234567890` → `12345678901234567000`),
  kaçışları çözüyor ve yinelenen anahtarın ilkini siliyordu — biçimlendirici
  gösterdiği veriyi değiştiriyordu. Ayrıştırma yalnızca geçerliliği sınar; çıktı
  `JSON.stringify(…, null, 2)` ile birebir. Geçersiz JSON (akan yarım blok, JSONC)
  dokunulmaz.
- Kenarlardaki boş satırlar atılır: çitli bloğun son `\n`i gövdede boş bir satır
  çiziyordu (hanration bunu `replace(/\n$/, '')` ile elle yapıyordu).
- ⚠ **Başka dilde girinti DEĞİŞMEZ.** Ortak girintiyi atan bir biçimlendirici
  reddedildi: dosyadan alınmış parçanın girintisi o dosyadaki derinliği anlatıyor,
  Python'da anlamın kendisi.
- Kopyalanan metin ekranda görünendir. `html` verildiyse `code` biçimlendirilmez
  ve olduğu gibi kopyalanır — HTML ondan üretildi, ikisi ayrışmamalı.

**Syntax colours (2.0) — semantic design tokens, no `syntax-*` family:**

| Kind | Token | On the code well (`bg-inset`), light / dark |
|---|---|---|
| keyword, HTML tag, diff header | `primary-text` | 6.42 / 11.62:1 |
| string, regular expression | `success-fg` | 4.88 / 13.00:1 |
| number, literal (`true`, `null`), CONSTANT | `warning-fg` | 4.61 / 13.03:1 |
| function call, property / key, attribute, variable | `text` | 16.47 / 18.04:1 |
| type, class, JSX component | `highlight-text` | 4.93 / 12.82:1 |
| comment (italic), punctuation | `text-2` | 5.98 / 11.08:1 |
| diff `+` / `-` line | `success-fg` / `danger-fg` | 4.88 / 13.00 · 6.44 / 11.24:1 |

- The five `syntax-*` tokens of 1.x (plum, clay, violet, blue, ochre; generated into
  `_syntax.generated.scss`, overridden through `--ui-syntax-*`) are gone with the palette recipe.
  Design has no syntax family and none is invented here: a code block draws with text pairs that
  `check:contrast` already measures, in both themes.
- ⚠ The 1.x rule "no green in a code block" is gone with the green brand: a string is
  `success-fg`. Type names are turquoise (`highlight-text`), which is why `CodeBlock` is on the
  allow-list of `colour-footprint.test.ts`.
- ⚠ A comment is `text-2`, NOT `text-3`: `text-3` is 4.35:1 on `bg-inset` in light. The italic
  carries the difference from punctuation.
- The Shiki path (`html`) is unchanged: `--shiki-light` / `--shiki-dark` picked with
  `light-dark()`, which follows design's `color-scheme` on the root and on a `data-theme` island.
  Its colours are the caller's and are not measured here.
- The tightest pair is a number in light (4.61:1). 1.x also gated the distance BETWEEN the kinds
  (ΔE ≥ 8); that gate is gone with the generator — keyword and name now differ by cobalt against
  the text colour, string and number by green against amber.

**Bütçe:** sohbet girişi 6,29 → 11,78 kB (vurgulayıcı 4,93, biçimlendirici 0,43);
bütçe 8 → 13 kB. Bedeli yalnızca `CodeBlock` alan öder — diller ve kelime kümeleri
ilk kullanımda kurulur (fabrika), modül düzeyinde açıklamasız çağrı yok.

| nöbetçi | ne tutuyor |
|---|---|
| `__tests__/chat/code-block.test.tsx` | parçalar birleşince kodun KENDİSİ; hiçbir kural bayrak, yakalayan grup ya da boş eşleşme taşımaz; dil başına ölçülmüş kararlar; biçimlendiricinin `JSON.stringify` eşdeğerliği ve metni koruması; kopyalanan metin |
| `__tests__/styles/design-contract.test.ts` · `scripts/check-contrast.mjs` | sözdizimi renkleri design'da VAR OLAN token'lar ve kod kuyusundaki (`bg-inset`) çiftleri ölçülüyor (2.0; 1.x'in `tokens.contract.test.ts` nöbetçisi üreteçle birlikte kalktı) |
| `.size-limit.js` "yalnızca ChatThread" (1,3 kB) | vurgulayıcı başka bir sohbet bileşenine sızarsa |
| `.size-limit.js` "yalnızca CodeBlock" (7 kB) | yeni bir dil buradan geçer |

## `@handijit/ui/charts` — SVG grafikleri (5.3)

On grafik, **sıfır bağımlılık**: ölçek, istatistik ve yol üretimi
`src/charts/core/`ta saf fonksiyon. Sohbet girişiyle aynı kurgu
(`vite.subentry.ts`, `tsconfig.subentries.json`, `subentry-boundary` nöbetçisi)
— ana pakete **sıfır bayt**.

| Ne | Nerede |
|---|---|
| Kaynak | `src/charts/<Grafik>/` · ortak çekirdek `src/charts/core/` · cephe `src/charts/index.ts` |
| Derleme | `vite.charts.config.ts` → `build/charts.js`, `charts.cjs`, `charts.css` |
| Bütçe | tümü 16 kB (2.0'da ölçülen 14,17) · yalnızca `LineChart` 8,5 kB (7,36) · `charts.css` 2 kB (1,6) |
| API taban çizgisi | `scripts/api-baseline.charts.txt` (22 ad) |
| Testler | `__tests__/charts/` — çekirdek (37), davranış (22), eksen taraması (her senaryo × {kapalı, ipucu açık}) |

| Grafik | Hangisi, ne zaman | Ayrımın nedeni |
|---|---|---|
| `LineChart` / `AreaChart` | Eğilim / toplamın parçaları | Alan dolgusu bir HACİM vaat eder; yığılmamış alanlar birbirini örter |
| `BarChart` / `Histogram` | Ayrık kategori / sürekli değişkenin bölmeleri | Histogramın x'i SÜREKLİ ve sütunlar bitişik — kategori çubuğu gibi aralıklı çizmek dağılımı parçalıyordu |
| `ComposedChart` | Farklı birimde iki ölçü | Sağ eksen yalnızca bir seri ona bağlıysa çizilir |
| `PieChart` / `BarChart` | ≤6 parça / daha çok | Kategorik palet altı tonda döner; yedinci dilim birinciyle aynı renk |
| `BoxPlot` / `Histogram` | Grupları karşılaştırma / tek grubun şekli | |
| `Heatmap` / `ScatterPlot` | İki KATEGORİK eksen / iki SAYISAL eksen | |
| `RadarChart` | Aynı ölçekte 3+ eksen | Birimleri farklı eksenler önce 0-100'e normalleştirilir — ortak ölçek yoksa alan bir şey söylemez |

⚠ **Ana giriş bütçesi 42 → 43 kB (5.3'te; bugün 44 kB, 2.0'da ölçülen 39,47).** Aşım grafiklerden DEĞİL:
`UiThemeScript` (5.2) 42 000 baytlık girişi 42 050'ye taşıdı ve önceki dalda
`size-limit` koşulmamıştı. Sohbet ve grafikler tam da bu bütçe yüzünden ayrı
girişte; ana girişe eklenecek her yeni bileşen önce "alt girişe aday mı?"
sorusundan geçer. Gerekçe `.size-limit.js`te.

### Çerçeve sözleşmesi — `core/ChartFrame.tsx`

Her grafik aynı çerçeveyi kullanır; yeni grafik bu maddelerin HİÇBİRİNİ
kendisi yazmaz:

- **`<svg role="img">` + `aria-label`**, açıklama `aria-describedby` ile. Tek
  sekme durağı (`tabIndex=0`; öğe yoksa hiç). Oklar gezer, `Home`/`End`,
  `Escape`; ızgarada (`columns`) `↑`/`↓` satır atlar. Gelinen öğe
  `useAnnounce` ile **duyurulur** — ipucu `aria-hidden`, çünkü okunan karşılığı
  duyuru ve tablo.
- **Gizli veri tablosu** (`caption` = grafiğin adı, ilk hücre `th scope="row"`).
  Ekran okuyucu grafiği tablo olarak da okur; eksik değer `—`.
  ⚠ Gizleme sınıfı tablonun KABINDA, tablonun kendisinde değil: `<table>`
  `width: 1px` ve `overflow: hidden`ı yok sayıp içeriği kadar genişliyor. 390 px
  görünümde ısı haritasının tablosu 424 px'e çıkıp sayfaya görünmez bir yatay
  kaydırma açıyordu ve Pixel 7 öykünmesinde (DPR 2,625) bu, görsel testlerin
  YANLIŞ BÖLÜMÜ yakalamasına yol açtı (`RadarChart-light.png` içinde Histogram).
  Nöbetçi `behaviour.test.tsx` + Android `mobile.spec.ts` "sayfa yatayda KAYMAZ".
- **Genişlik** kapsayıcıdan ölçülür (`ResizeObserver`, boyamadan önce). Ölçüm
  gelene kadar 640 px; ⚠ içerik boyutlu bir kapta (genişliksiz flex öğesi,
  `inline-block`) bu değer grafiğin **tercih edilen genişliği** olur — sığmazsa
  küçülür ama geniş bir kapta 640'ta kalır. Tam genişlik için kaba genişlik verin
  (blok, `flex: 1`) ya da `width` geçin. Galeride grafikler bu yüzden 640 px.
- **Lejant** aç/kapa düğmeleri (`aria-pressed`). Gizli seri içi boş kare +
  üstü çizili ad (renk tek başına anlam taşımaz). ⚠ SON görünen seri
  gizlenemez — boş bir grafik "veri yok" gibi okunuyordu.
- **İşaretçi**: tek dinleyici, kare başına bir isabet hesabı
  (`requestAnimationFrame`). Ağır çizim (`plot`) belleğe alınmış öğe; üzerine
  gelindiğinde yeniden çizilen yalnızca vurgu katmanı (`overlay`/`underlay`).
- **Renk (2.0)**: design'ın altı seri token'ı, `chart-1…6` (`core/palette.ts` → `cssVar`, yani
  `var(--hd-chart-N)`; `muted` = `text-3`) + `color-mix` ile tint. Mercan, turkuaz ve bant
  grafiklerde YOK (`colour-footprint.test.ts` `src/charts`i de tarıyor). 1.x'in `cat-*` /
  `series-*` ton adları kalktı.

⚠ **İpucunun yatay konumu ÖLÇÜLEREK yazılır** (`useLayoutEffect`, boyamadan
önce). Genişlik içeriğe bağlı; sabit bir varsayımla dar ekranda ipucu kutudan
taşıp yatay kaydırma açıyordu. `inward` (kartezyen) sığmayınca öteki yana
çevrilir; `outward` (pasta, radar) **kenara kırpılır** — çevirmek ipucunu
halkanın ortasındaki toplamın üstüne atıyordu (ölçüldü: 10 px eksik yüzünden).
Fiziksel `left`: SVG koordinatları RTL'de aynalanmaz.

### Ölçülmüş veri kararları

| Karar | Gerekçe |
|---|---|
| `null` çizgiyi KESER, sıfıra indirmez | Eksik veri ≠ sıfır; sıfıra inen çizgi olmamış bir düşüş çiziyordu |
| İki boşluk arasındaki TEK değer işaretle çizilir | Tek noktalı yol görünmez — veri vardı ama grafikte yoktu |
| Çubuk/alan varken sıfır tanım aralığında | Sıfırdan başlamayan çubuğun boyu oranı yalan söyler |
| Yığında artı ve eksi AYRI birikir | Eksi çubuk artı yığının ortasından başlıyordu |
| Yatay yön yalnızca tümü çubuksa | Yatay çizgi grafiği zamanı dikey eksene koyar |
| Monoton kübik eğri (Fritsch–Carlson) | Catmull-Rom veri noktaları arasında AŞIYOR — olmayan bir tepe çiziyordu |
| Bıyık ucu bir GÖZLEM (Tukey, 1,5 × IQR) | Q3 + 1,5 × IQR'ye kadar çizmek verinin hiç ulaşmadığı bir değeri gösterirdi |
| Histogramın son bölmesi en büyük değeri İÇERİR | `[alt, üst)` kuralı en büyük gözlemi dışarıda bırakıyordu |
| Pasta: sıfır ve eksi değer dilim açmaz, tabloda görünür | Bütünün parçası olamaz; gizlemek veriyi yok saymak olurdu |
| Isı haritasında `NaN`/`null` BOŞ hücre (kesik kenarlık) | Sıfır rengiyle boyamak "değer sıfır" demekti |
| Bant ölçekleri DİZİNLE anahtarlanır | Aynı adlı iki satır ("Pzt", "Pzt") tek banda çöküyordu |
| Bir sayfada iki ısı haritası farklı `linearGradient` kimliği (`useId`) | Aynı kimlik ikinci haritanın ölçeğini ilkinin rengiyle boyar |
| Radar ölçek sayıları halkalar sıkışınca seyrelir (en dıştaki kalır) | 300 px'te halka aralığı 14 px, yazı 11 px — beş sayı üst üste biniyordu |
| Eksen bölmesinin basamağı bölme LİSTESİNDEN (`tickLabels`) | Sabit "en çok bir ondalık" 0,1'in altındaki her adımı sıfıra çökertiyordu: 0,001-0,014 USD'lik maliyet ekseni "0 · 0 · 0" (ölçüldü: hanration, 5.3.2'de düzeldi); kısa gösterimde 12 050 ile 12 100 ikisi de "12,1 B" |

⚠ **Kayan nokta payı iki yerde ölçüldü ve ikisi de SESSİZDİ:**
`ticks(0.1, 0.3)` → `0.3 / 0.1 = 2.9999999999999996` → uçtaki bölme
düşüyordu; histogramda `(max − start) / step` `5.000000001` çıkıp boş bir
altıncı bölme açıyordu. İkisi de `1e-9` payıyla ve nöbetçisi `core.test.ts`.

⚠ **Eksen `formatValue` KULLANMAZ — bilerek.** `formatValue` / seri `format`ı ipucunu, duyuruyu ve
gizli tabloyu yazar; eksen kısa gösterimde ve birimsiz kalır ("$0,0140" dar eksende üst üste
biniyor). Birim grafiğin adında. Bu yüzden 5.3.1'deki "0 · 0 · 0" hatası tüketicinin
`formatValue`sundan DEĞİLDİ: eksen biçimleyicisi bölme adımını hiç bilmiyordu ve her değeri tek tek
`maximumFractionDigits: 1` ile yazıyordu. `tickLabels` bölme listesini alır; gereken basamak tek
değerden değil en ince bölmeden çıkar. ⚠ `TickFormat` bilerek LİSTE alır: tek değer alan bir
biçimleyiciye ikinci parametre (adım) eklemek `ticks.map(format)` çağrısında DİZİNİ adım diye
geçirirdi.

⚠ **`Math.min(...dizi)` / `Math.max(...dizi)` YASAK** (veri dizisi üzerinde).
Yayma argüman sayısı sınırına takılır: ~125 000 gözlemde `RangeError`. Tek yol
`core/stats.ts` → `extent`; nöbetçi 200 000 gözlemli test. Etiket listesi gibi
sınırlı dizilerde (eksen yazıları) serbest.

⚠ **`check:api` grafik girişinin tip adlarını SAYMIYORDU.** Cephe
`export type { ChartRow } from …` yazıyor ve desen yalnızca `export { … }`
okuyordu: taban çizgisi 22 yerine **17** ad tutuyordu ve `ChartTone`,
`ValueFormat` gibi adların düşmesi yeşil geçerdi. Desen düzeltildi; sohbet
girişi etkilenmemişti (orada `export type {` satırı yok).

## Göç ve `@deprecated` yollar

**Kural:** bir prop adı ya da davranışı değişecekse eski yol **bir sürüm boyunca
çalışmaya devam eder**, `@deprecated` işaretlenir ve buraya yazılır. Sessiz
kırılma yok. Nöbetçi: `__tests__/api-consistency.test.ts` — burada kayıtlı
olmayan bir `@deprecated` prop derlemeyi kırar.

### 2.2 — form fields speak `Field`'s contract (additive)

Found while building `@handijit/forms` 1.0 and the desktop template, where every gap below had a
workaround in the binder. Nothing is renamed or removed; `CHANGELOG.md` has the full list.

| Gap | 2.2 |
|---|---|
| `Checkbox` / `Switch` / `Radio` had no error; a passed `aria-describedby` REPLACED the hint | `error` (message under the label, `aria-invalid`, the link); the description is `error · hint · passed`, merged by `helpers/aria.helper.ts` `idList` |
| `Field` had no `id`, its label was a string | `id` (messages `<id>-error`, `<id>-hint`), `label: ReactNode` |
| Composites took none of `FieldChildProps` | `id`, `aria-invalid`, `aria-describedby`, `required` on `QuantityStepper`, `SegmentedControl`, `ChipGroup`, `RangeSlider`, `RatingInput`, `DateRange`; where each lands is a table in `README.md` ("Form fields") |
| `Select` / `Combobox`: no `onBlur`, no `ref`; `Select` could not hold `null` | `onBlur` (React's focus events bubble through the portal: the root hears the trigger AND the panel; focus moving between them, or into the open sheet, is not a blur), `ref` → trigger, `Select value: T \| null` |
| No read-only composite; no group-wide disabled | `isReadOnly` on nine controls (`aria-readonly` where the role has it); `isDisabled` on `SegmentedControl`, `ChipGroup` |
| `TagInput.values`, a hard-coded Turkish announcement | `value`; `duplicateLabel` → `labels.tagInput.duplicate` → the 2.0 text (see below) |
| `Button isLoading` drew a `role="status"` with an empty name | `Spinner label=""` is DECORATIVE (`aria-hidden`, no role); the button keeps `aria-busy` |
| `Progress` demanded `label` | `label` OR `aria-labelledby` (a union: one of the two) |
| `Alert action` squeezed the text in a narrow box | the action moved INTO the body, a wrapping row: the text keeps `$alert-text-min` (16rem) beside it, below that the action goes under the text |
| Declarations broke under `nodenext` | `scripts/build-declarations.mjs`: Node-resolvable specifiers (the `@/` alias of the sub-entries too) and `.d.cts` twins for `require`; `check:types` compiles a `nodenext` consumer with `skipLibCheck` off |

**`@deprecated` in 2.2:** `TagInput.values` → `value`. Both work until 3.0; giving `value` wins.

⚠ **`TagInput.duplicateLabel` falls back to Turkish — a measured exception to "Metin kütüphaneden
gelmez".** 2.0 announced `"<value> zaten ekli"` hard-coded. Turning it into a label without a
default would make every existing `TagInput` silent on a duplicate (and warn) after a MINOR
update. The fallback stays until 3.0, where it goes through `resolveLabel` like every other text.
`i18n/no-hardcoded-strings.test.ts` does not list "zaten ekli"; that is why it slipped in.

⚠ **Deferred to 3.0: `Button` defaults to `type="button"`.** Today a `Button` without `type` inside
a `<form>` submits (the HTML default), and applications rely on that: a "Kaydet" button with no
`type` is a submit button. Defaulting to `"button"` would turn those into dead buttons with no
type error — a silent break, so not in a minor.

⚠ **`Spinner label=""` changed meaning.** It drew an empty live region; it draws a decorative
spinner. An empty `role="status"` never announced anything, so no reader loses a message; a test
that queried `getByRole('status')` for it does.

### 2.0 (`@handijit/ui`) — the tokens of `@handijit/design`; BREAKING, no alias

The whole migration, old → new for every token, CSS variable, SCSS name, prop, variant, export and
stylesheet path, is in `CHANGELOG.md` ("Migration from 1.x", nine steps and one table). Kept here:
what changed in the contract, so that the older entries below are read correctly.

| What | 1.x | 2.0 |
|---|---|---|
| Tokens | the library's own recipe and `--ui-*` palette, shipped in `base.css` / `styles.css` | `@handijit/design` (peer `^1.0.0`), `--hd-*`, loaded once by the application; the library ships none |
| Theme attribute | `data-ui-theme`, absent when following the system | design's `data-theme`, always the resolved theme; stored choice in `localStorage["hd-theme"]` |
| Boot script | written here | `THEME_BOOT_SCRIPT` and `THEME_BOOT_SCRIPT_HASH` of design, re-exported; `UiThemeScript` takes a `nonce` |
| Theme API | `UiProvider theme`, `initUi`, `applyThemeConfig`, `buildThemeCss`, `resolveTokens`, an injected `<style>` | removed; an override is a `--hd-*` declaration in the application's stylesheet. The library injects no `<style>` |
| Density | `data-ui-density`, `UiDensity` | removed |
| Variants | `UIVariant.CART` / `LIGHT` / `DARK`, `IconButton` `cart`, `Badge` tones `oem` `alt` `sale` `action` `link` | `ACCENT` / `SOFT` / `ON_BAND`, `accent`; the shop tones are removed |
| Control height | 30 / 36 / 44 / 52, fields always 44px / 16px | 28 / 32 / 40 / 48; fields 40px / 15px on a desktop pointer, 44px / 16px on a narrow or touch screen |
| `Select` / `Combobox` | a bottom sheet under 640px, by width alone | a bottom sheet only when narrow AND touch (`SHEET_MEDIA_QUERY`); a dropdown everywhere else |
| Layers | 200 – 500 | design's: 1000 – 1500 |

⚠ **Superseded by 2.0, kept as history:** "5.0 token sözleşmesi" (every name in its table is
gone), "5.6.3 — Tema ezmesi" (`UiProvider theme`, `initUi` and `<style id="ui-theme-overrides">`
no longer exist; an application override is unlayered CSS and still wins over `@layer ui`), and
the token and breakpoint names inside "5.3 — SCSS API" (`var(--ui-…)`, `_tokens.generated.scss`,
`$breakpoint-tablet-portrait`; the SCSS surface is 227 names today, `scripts/api-baseline.scss.txt`).
The mechanics those entries describe (per-component modules, the client boundary, CSS delivery,
the anchored surfaces) are unchanged.

### 5.0 token sözleşmesi — KIRICI, takma ad YOK

⚠ 2.0'da geçersiz (yukarıdaki not); tarihçe olarak duruyor.

Renk token'ları prop değil, ama `--ui-*` adları tüketicinin sözleşmesi. 5.0
büyük sürüm olduğu için eski adlar **bırakılmadı**: `role*` iki farklı renk
taşıyacaktı ve 4.0.0'da `blue*`/`amber*` adlarının yanlış rengi anlatması tam
olarak bu hataydı.

| 4.x | 5.0 | Not |
|---|---|---|
| `role`, `role-hover`, `role-active` | `selected`, `selected-hover`, `selected-active` | mürekkep — yeşil DEĞİL |
| `on-role` | `on-selected` | koyu temada siyah |
| `role-tint` | `selected-tint` | |
| `role-line` | `selected-line` | |
| `role-text` | `link` (+ yeni `link-hover`) | yeşil kalır |
| `ring`, `ring-color` | aynı ad | değer bağlantı ailesinden |
| `shell*` | aynı ad | **değer çamdan mürekkebe** ve temaya göre dönmüyor; yeni `on-shell`, `on-shell-2`, `on-shell-danger`, `shell-line` |
| — | `cat-1…5`, `series-1/2` | yeni |

Tüketicide değer ezmesi yazan yerler (`--ui-page: #ffffff` gibi) ayrıca
gözden geçirilir: 5.0'da açık sayfa krem.

### 1.0 (`@handijit/ui`) — yeni ad; bileşen başına modül, dosya başına `'use client'`, CSS bileşen başına dosyada

Paket `@ahmetilhn/hanui` 5.6.3'ten `@handijit/ui` 1.0.0'a taşındı (handijit organizasyonu). İç adlar da
değişti: `hanui-` → `ui-`, `--hanui-*` → `--ui-*`, `@layer ui`, `data-ui-*`, `Hanui*` → `Ui*`. Aşağıdaki
teknik değişiklikler 6.0 olarak hazırlandı ve 1.0.0 adıyla yayımlandı.

Tüketicide ölçüldü (handijit.com, Next 16 / Turbopack, 6–7 Kasım 2026): 5.x paketi tek 203 KB'lık
modül ve ilk satırı `'use client'`; her sayfaya 40 KB gz @handijit/ui JS iniyor, `styles.css` (173 KB ham,
23 KB gz) tamamen yükleniyor ve ~%90'ı kullanılmıyor, ana sayfada 37 düğme + 121 çip = 420–548
istemci referansı (her `Button` bir hidrasyon sınırı), `turbopackModuleFragments` tek dosyayı
~2.000 halkalık değerlendirme zincirine bölüp tarayıcı yığınını taşırıyordu ("Maximum call stack
size exceeded"; tüketici ayarı kapatmak zorunda kaldı).

| Ne | 5.x | 6.0 |
|---|---|---|
| Çıktı | tek `index.js` + `styles.css` | Rollup `preserveModules`: `build/components/<Ad>/index.js` + `style.css`; cephe saf yeniden dışa aktarım; `exports` 68 alt yol (`scripts/build-exports.mjs`) |
| `'use client'` | kaynaktan sökülüp paketin başına tek satır | kaynakta dosya başına; `vite.modules.ts` aynı modülün çıktısına geri yazar. 18 bileşen yönergesiz (`__tests__/client-boundary.test.ts`) |
| CSS | tüketici `styles.css`i içe aktarır | aynı; ek olarak `base.css` + `components/<Ad>/style.css` dosyaları (tüketici kendi derlemesinde TEK dosyaya birleştirir). JS CSS içe aktarmaz — aşağıda |
| Tipler | `rollupTypes` tek dosya | dosya başına; `check-api` cepheyi `export { … } from` satırlarından okur |

Kararlar ve neden öyle:
- **Sınıf haritası gömülür.** `preserveModules` her `index.module.scss`i ayrı bir JS parçası yapar
  (`index.module.scss.js`). Parça çalıştırılarak okunur (biçimi kestirmek yerine) ve ithalatçısına
  tek satırlık nesne olarak gömülür; ESM'de `import x from`, CJS'de sıkıştırılmış
  `x=require("…")` → `x={default:{…}}`. Satır haritası kaymaz (tek satır ↔ tek satır).
- **JS çıktısı CSS içe aktarmaz; cephe de `base.scss` içe aktarmaz.** Modüllerin `import './style.css'`
  taşıdığı sürüm tüketicide ölçüldü (Next 16.4.5 / Turbopack, Lighthouse yavaş 4G, 3 koşu medyanı):
  render-blocking CSS 6 → 12–15 dosya (her istemci sınırının CSS'i ayrı dosya), LCP 1,9 → 2,5 s —
  bayt 46,7 → 33,3 kB AZALMIŞKEN. Dosya sayısı LCP'yi bayttan çok etkiliyor; `cssChunking: 'graph'`
  19 dosyaya çıkardı. Karar: CSS'in nasıl ineceği tüketicinin açık seçimi (`styles.css` tek dosya, ya da
  taban + bileşen dosyalarının tüketici derlemesinde birleştirilmesi). Cephe yan etki taşımaz ki Next'in
  `optimizePackageImports` dönüşümü onu saf saysın. `src/styles/base.ts` yalnızca derlemeye `base.css`
  girişi vermek için var.
- **Bağlantı `Button`/`IconButton` işlev prop'u üretmez.** Sunucu bileşeni, istemci bileşenine
  (`UiLink`) işlev geçiremez. Pasif bağlantı: `aria-disabled` + `tabIndex=-1` + `pointer-events:
  none`. `UiLink` istemci kalır (`useUi` ile yönlendirici okur) — sunucuda çizilen `Button`un
  içinde istemci yaprak olarak durur; `children` serileştirilebilir.
- **`Breadcrumb`/`Stat`/`Steps`/`Spinner`/`Field` istemci kaldı.** Sağlayıcı metinlerini `useUi` ile
  okuyorlar; sunucuya almak metinleri zorunlu prop yapmayı gerektirirdi — sağlayıcıya güvenen tüketicide
  ekran okuyucu metni düşerdi. handijit.com'da sayfa başına 1'er tane; kazanç yok.
- **`memo` ve `forwardRef` sunucuda sorun değil.** React Flight sunucu çizimi ikisini de çözer
  (`REACT_MEMO_TYPE` → `type.type`). `named()`/`#__PURE__` deseni aynen kalır.
- **Üç paketleyici, üç davranış (CSS içe aktaran JS denemesinde).** esbuild erişilemeyen modüllerin
  CSS'ini de topluyordu (yalnızca `Badge` → 67 CSS dosyası, 180 kB); Turbopack her sınırı ayrı dosyaya
  böldü; `turbopackModuleFragments` açıkken CSS tamamen düştü. Bu da JS'in CSS taşımaması kararının
  ikinci gerekçesi.
- **Alt girişler (`chat`, `charts`) değişmedi:** tek dosya + tepe yönerge. Hepsi zaten istemci.
- **`turbopackModuleFragments` tüketicide KAPALI kalır.** 5.x'te parçalara ihtiyaç duyuran şey tek
  dosyaydı; bileşen başına modülle o ihtiyaç bitti (hizmet sayfası toplam JS 191,8 → 162,1 kB parçalar
  kapalıyken). Açıkken yan etkisiz modüllerin CSS içe aktarımlarını düşürdüğü de ölçüldü (Next 16.4.5).

### 5.6.3 — Tema ezmesi katmanda ve sunucu çiziminde

⚠ 2.0'da geçersiz (bkz. "2.0" notu): sağlayıcı artık tema almıyor ve `<style>` çizmiyor. Tarihçe.

Tüketicide ölçüldü (2026-11-02, yönetim paneli, koyu tema; JS kapalı ve açık çizimin hesaplanmış
stilleri karşılaştırıldı): panel `<html>`e kendi paletini yazıyor
(`html:has(.panel-root-layout) { --ui-danger-solid: #dc2626 }`, 0,1,1). Sunucu çiziminde sil
düğmesi kırmızı, hidrasyondan sonra `#ededed` (sitenin teması); alanların zemini `#161618 → #121212`,
çizgisi `#36363c → #4d4d4d`, `action` indigodan griye dönüyordu. Neden: `UiProvider` ezmeyi
`useEffect` içinde, `<head>`in sonuna, KATMANSIZ bir `<style>`a yazıyordu; koyu temanın
`:root:not([data-ui-theme])` seçicisi (0,2,0) tüketicinin ezmesini yeniyordu. "Kütüphane CSS'inin
tamamı `@layer ui` içinde" sözleşmesini bozan tek kural buydu.

| Ne | Eskiden | Şimdi |
|---|---|---|
| Ezmenin katmanı | katmansız: tüketicinin katmansız kuralıyla özgüllük ve sıra yarışı | `@layer ui` içinde: tüketicinin katmansız kuralı her zaman kazanır |
| Seçici | varsayılanla aynı (`:root`, `:root:not([…])`…) | `html:root…` — karşılığından bir öğe özgül: katman içinde varsayılanı **sıradan bağımsız** yener |
| Açık ezme koyu temada | katmansız `:root` koyu varsayılanı da yeniyordu: `light`a yazılan `ring-color` koyu temaya sızıyordu | `html:root` (0,1,1) koyu varsayılana (0,2,0) yenilir; `resolveTokens`in "açık koyuya sızmaz" sözleşmesiyle aynı |
| Ne zaman | `useEffect`: sunucu çıktısında yok; ilk kare varsayılan palet, bir kare sonra tema (tüketici bu yüzden temanın statik kopyasını üretiyordu) | sağlayıcı ezmeyi çocuklarından önce `<style id="ui-theme-overrides">` olarak **çizer**; sunucu çıktısında var, hidrasyonda aynı düğüm kullanılır |
| `useUiTokens` | `<head>`e eklenen etiketi gözlüyordu | sağlayıcının teması değişince (bağlamdaki tema nesnesi) yeniden okur |

- ⚠ Sağlayıcı `<body>` içinde olmalı: `<html>`i sararsa `<style>` belgenin köküne düşer. Ağaçta
  çizilmesinin ikinci nedeni katman sırası: `<body>`deki etiket `<head>`deki stil sayfalarından ve
  tüketicinin `@layer reset, @handijit/ui;` bildiriminden HER ZAMAN sonra gelir. React 19'un
  `<style precedence>` taşıması `<head>`te nereye koyacağını garanti etmiyor; önce gelirse `@handijit/ui`
  katmanı ilk orada görülür ve tüketicinin `reset` katmanı kütüphanenin üstüne çıkar.
- ⚠ `dangerouslySetInnerHTML` zorunlu: React 18 `<style>` çocuğunu HTML olarak kaçışlıyor,
  seçicideki `'` `&#x27;` oluyordu. Değer veritabanından gelebileceği için `</style` dizisi
  `toStyleHtml` ile `<\/style`a çevrilir (CSS'te `\/` = `/`).
- `initUi` (`applyThemeConfig`) `<head>`e yazmaya devam eder, artık katmanlı; stil sayfalarından
  SONRA çağrılmalı (README).
- jsdom'un CSS ayrıştırıcısı `@layer`ı tanımıyor; `jest.setup.ts` yalnız bu hatayı susturur.

Nöbetçi: `__tests__/helpers/theme.helper.test.ts` (katman, `html:root`, `toStyleHtml`),
`__tests__/theme/UiProvider.test.tsx` (ağaçta çizim, ilk efekt, hidrasyon),
`__tests__/theme/UiProvider.server.test.tsx` (sunucu çıktısı). Tüketici temanın statik kopyasını
yalnızca ilk boyama için üretiyorsa 5.6.3'te kaldırabilir.

### 5.6.2 — `DirectoryRow`, `Disclosure`, alanlar: hover ve önek payı

Dört bulgu tüketicide ölçüldü (2026-11-01, bir kurumsal site ve yönetim paneli; sayfaların üzerine
gelip basarak stil farkını ölçen betikle): üçü "Durum katmanları" ve "Yarıçap ritmi" kurallarını
çiğniyordu, biri akışkan bölüm aralığını bileşen içinde kullanıyordu.

| Ne | Eskiden | Şimdi |
|---|---|---|
| `DirectoryRow` hover | zemin `surface` + kenarlık `border` + ad `link`: satır kutusunda bir çerçeve belirip kayboluyordu | `interactive-surface`: yalnız zemin bir kademe (`surface-2`), basılınca 1 px. Saydam 1 px kenarlığın yeri dolguya katıldı, satır ölçüsü aynı |
| `Disclosure` başlığı hover | kare `surface-2` zemin kenardan kenara; `Accordion`un ortadaki bölümlerinde yuvarlak çerçevenin içinde köşesiz bir bant | Zemin `space-1` içeride (saydam kenarlık + `background-clip: padding-box`), yarıçap `radius-lg − 1px` (çerçevenin iç eğrisiyle eş merkezli). Dolgu kenarlık kadar azaldı; başlık ve içerik hizası aynı |
| Önek/sonek payı (`Input`) | `space-8 − space-2`: akışkan bölüm aralığı; 18 px ikonla metin arası dar ekranda 2 px, geniş ekranda 26 px; tek karakterli para simgesinde tutar simgeden kopuk | `space-3` + ölçülen genişlik + `space-2`. `Input` önek/soneki `ResizeObserver` ile ölçüp `--ui-input-prefix-width` / `--ui-input-suffix-width` yazar; ölçüm yokken (sunucu, jsdom) `icon-md` varsayılır |
| Alan hover çizgisi (`input-base`) | `text-3`e atlıyordu: ince çizgili temalarda hover'da kalın çerçeve | `color-mix(in oklab, border-control, text 40%)` (2.1; 2.0'da `border-strong`, %30) — bir ton koyu; token tanımlamaz, temayı izler. `Input`, `Textarea`, `Select`, `Combobox`, `DateField`, `TagInput` aynı mixin'den |

⚠ `prefix={0}` artık hiçbir şey basmaz; eskiden `prefix && …` girdinin yanına başıboş bir "0" metni
yazıyordu.

Nöbetçi: `__tests__/styles/hover-surfaces.test.ts` (dört kural), `__tests__/components/Input.test.tsx`
(ölçüm ve değişkenler). Tüketici kendi katmanında aynı düzeltmeleri yaptıysa (ör. `[class*='ui-row-']:hover`)
5.6.2'ye geçince kaldırabilir.

### 5.6.1 — `Popover`, `Tooltip`, `Toast` `Escape`i İŞARETLER

Üçü `Escape`i belge düzeyindeki ortak dinleyicide (`hooks/useDismissOnEscape`) tüketiyor ama tuşu
işaretlemiyordu. `hasOpenSurface`in belgesi "dinleyici o tuş vuruşunda hâlâ `true` görür" diyordu;
gerçek tarayıcıda YANLIŞ: React ayrık olayın güncellemesini dinleyiciler arasında boşaltıyor, yüzey
aynı tuş vuruşunda yığından düşüyor ve yüzeyin dinleyicisinden SONRA koşan sayfa dinleyicisi `false`
görüyor. Ölçüldü (2026-10-27, backtest paneli): grafiğin yardım `Popover`ını kapatan `Escape` son
grafik seçimini de siliyordu. jsdom testleri bunu göremiyordu — `fireEvent` betikten gönderiliyor ve
dinleyiciler arasında mikro görev boşaltılmıyor.

| Ne | Nasıl |
|---|---|
| Kanca | En üstteki yüzey tuşu tüketince `event.preventDefault()`; üç yüzey tek yerden |
| Sayfa dinleyicisi | `event.defaultPrevented \|\| hasOpenSurface()`: yüzeyden ÖNCE koşan dinleyici yığını, SONRA koşan işareti görür. `PromptInput` ikisini zaten soruyordu, şimdi doğru cevap alıyor |
| `<dialog>` yüzeyleri | `Modal`, `Drawer`, `BottomSheet`, `CommandPalette` tuş olayı bittikten sonra `cancel` ile kapanır; tuş boyunca yığında. Değişmedi |
| Nöbetçi | `anchored-panel.spec.ts` → "Escape — sayfa düzeyindeki dinleyici" (`desktop-behavior`): düzeltmeden önce `Popover` ve `Tooltip` kırmızıydı. Kanca: `__tests__/hooks/useDismissOnEscape.test.tsx` |

### 5.6 — `ContextMenu`: imleç noktasında açılan menü (yalnızca ekleme)

Tüketicide elle yazılmış bir sağ tık menüsü vardı (backtest panelinin grafiği):
odak, oklar, Escape ve dışarı tıklama `Menu`nün kopyasıydı, `role="menu"`nün içinde
bir `<dl>` duruyordu (menü yalnız `menuitem` taşır) ve konum çağıranda sabit bir
genişlik/yükseklik tahminiyle kırpılıyordu. `Menu` yalnız bir tetikleyiciye
bağlanabildiği için kütüphane bunu karşılamıyordu.

| Ne | Nasıl |
|---|---|
| Ortak gövde | `Menu` içindeki iç `MenuSurface`: konum, portal, odak, klavye, dışarı tıklama TEK yerde; `Menu` ve `ContextMenu` yalnız açılışı yönetir. `Menu`nün DOM'u ve davranışı DEĞİŞMEDİ (testleri dokunulmadan geçiyor) |
| Nokta çapası | `usePositioning` artık `{ getBoundingClientRect }` taşıyan her çapayı ölçer; nokta 0×0 dikdörtgen. `ResizeObserver` yalnız gerçek `Element` gözler (nokta `TypeError` fırlatırdı). Tipi genişledi, mevcut çağıranlar aynı |
| Konum | Noktanın sağ altı (2px boşluk), sığmazsa üste döner, görünüm alanına kırpılır — çağıran kırpmaz |
| Portal | Noktanın DOM öğesi yok; ağaçtaki gizli bir `<span hidden>` sahibi en yakın açık `<dialog>`u bulur (modalın içindeki menü üst katmanın ALTINDA kalmasın) |
| Başlık | `header` `role="menu"`nün DIŞINDA, menüye `aria-describedby` ile bağlı — ok tuşları öğelerde gezerken bağlam okunur |
| Odak | Açılışta ilk etkin öğe; kapanışta (Escape, Tab, dışarı tıklama, seçim, sökülme) açılıştan önceki öğe. Yakalama `useLayoutEffect`te: yüzeyin "ilk öğeye odak" etkisinden ÖNCE koşmalı |
| Escape | `preventDefault` — sayfa düzeyinde Escape dinleyen kod `event.defaultPrevented` ile menüyü kapatan tuşu kendi eylemine saymaz (`hasOpenSurface` yalnız kipsel yığını bilir) |
| Yeni nokta | Yüzey noktayla anahtarlı: yeniden ölçülür, odak ilk öğeye döner |

⚠ **5.5'e kadarki `Menu` açılışta odağı HİÇ taşımıyordu (gerçek tarayıcıda).**
Yüzey konumu ölçülene kadar `visibility: hidden` taşır; ölçüm `useLayoutEffect`te
durum yazar, ama ayrık olayda (tık, sağ tık) React o commit'in pasif etkilerini
yeniden çizimden ÖNCE boşaltıyor — "ilk öğeye odak" etkisi gizli yüzeye gidip
sessizce düşüyor, odak `<body>`de kalıyordu. Ok tuşları da bu yüzden menüye
ulaşmıyordu. jsdom görünürlüğü bilmediği için birim testleri yeşildi. Ölçüldü:
chromium, 5.5.0 `Menu` ve yeni `ContextMenu` ikisi de kırmızı; düzeltme (odak
`isPositioned`i bekler) ikisini de yeşile çevirdi. Nöbetçi
`anchored-panel.spec.ts` → "menü açılışında odak" (`desktop-behavior`).

⚠ **Çağıranın iki işi var:** `contextmenu` olayında `preventDefault()` ve
`point = { x: clientX, y: clientY }`. Portallanan yüzeydeki olaylar React ağacında
çağırana KABARCIKLANIR — menünün içindeki sağ tık çağıranın `onContextMenu`sine de
düşer; çağıran `event.currentTarget.contains(event.target)` ile süzer.

Galeri: `ContextMenu` `SOLO_ONLY`de (`?solo=ContextMenu`) — ızgarada çizilseydi
`position: fixed` yüzey komşu bölümlerin ekran görüntüsünü örterdi; ızgara tabanları
bu yüzden DEĞİŞMEDİ. `mobile.spec` "görünen alanın içinde durur" testi yüzeyi
`dialog[open]` ya da `data-testid="solo-surface"` ile bulur.

### 5.5 — `Input`, `DateField`, `DateRange`: `size="sm"` (yalnızca ekleme)

`Select`in `sm`i vardı, girdilerin yoktu: aynı araç çubuğunda `Select sm` **36px**,
yanındaki `DateField` **45,7px** çiziliyordu (ölçüldü: bir backtest panelinin üst
çubuğu, Chrome, 1024px). Yoğun ölçü artık `input-sm` mixin'inde TEK yerde;
`Select`, `Input` ve `DateField` onu kullanır, `DateRange` iki alana geçirir.
`Button` SMALL da 36px — şeritte düğme, seçim ve girdi tek hizada.

| | `md` (varsayılan) | `sm` |
|---|---|---|
| Yükseklik | 44px | 36px |
| Dolgu | `space-3` / `space-4` | dikey 0 / yatay `space-3` |
| Yazı | `font-size-control` | `font-size-sm`; metin girdisi dar ekranda (≤640px) ve dokunmatikte `font-size-control` (≥16px) |

⚠ **Yerel `size` niteliği `Input`, `DateField` ve `PasswordInput` tiplerinden
ÇIKTI.** Yerelde karakter genişliği (`number`), burada ölçü adı — `Select.size`
ile aynı. Kütüphanede ve iki tüketicide (hanration, backtest paneli) sayısal
`size` geçen çağrı yok (aranarak ölçüldü); genişlik CSS'ten gelir. Sayısal
geçen bir tüketici varsa derleme kırılır: `style={{ width: '12ch' }}` yazılır.

⚠ **`sm` dokunma hedefini 44px'e TAMAMLAMAZ.** `<input>` sözde öğe taşımıyor,
yani `tap-target` (`::after`) orada çalışmaz. `Select sm` ile aynı karar: `sm`
masaüstü şeritleri içindir; dokunmatik formda `md` kalır.

⚠ `isTechnical` + `sm`: `--technical` ölçüyü `font-size-control`a yazar ve
`--sm`den sonra gelir — teknik girdi yoğun ölçüde de 16px yazar. Çağıranı yok,
ayrıca çözülmedi (YAGNI).

Görsel tabanlar: `Input`, `DateField`, `DateRange` (yeni `small` senaryoları)
ve `FilterBar` (`default` artık `Input sm` + `Button` SMALL — şeridin doğru
kullanımı; `mixed` bilerek karışık kalır) — 16 dosya. Galeride bu bölümlerin
altındaki 27 bölüm yalnızca KAYDI: sayfa uzayınca alt piksel konumları değişti
ve eşiği aşan 80 dosya `--update-snapshots=changed` ile yenilendi (içerik farkı
yok; `LineChart` ve `FilterBarField` fark görüntüleriyle doğrulandı — yalnızca
metin kenarları). Temiz `master`da aynı koşu 40/40 geçiyordu.

### 5.4 — `CodeBlock` kendisi vurgular ve biçimlendirir

API değişmedi (yeni prop yok), çizim değişti: `html` verilmeyen blok artık renkli,
JSON yeniden girintili, kenar boş satırları atılmış ve **kopyalanan metin ekranda
görünen** metin. `html` veren tüketicide (hanration'ın Shiki sarmalayıcısı) Shiki
yanıtı gelene kadar @handijit/ui renkleri görünür, sonra Shiki'ninkiler — iki palet arasında
bir renk sıçraması. Sarmalayıcıyı kaldırıp `language` + `code` geçmek bu sıçramayı ve
Shiki'nin tembel yüklemesini birlikte kaldırır; Shiki doğruluğu gerekiyorsa kalır.

### 5.1 — `CommandPalette` komutu KAPANDIKTAN SONRA çalıştırır

API değişmedi, çağrı SIRASI değişti: `onSelect` artık palet kapanıp odak açan
öğeye geri verildikten **sonra** çağrılır. Önce çağrıldığında komutun açtığı
pencere, paletin odak iadesiyle odağını kaybediyordu; tüketici bunu
`requestAnimationFrame(() => setTimeout(fn, 0))` ile atlatıyordu — o geçici
çözüm artık gereksiz ve kaldırılabilir. Kapanış sırası zorunlu: önce `<dialog>`
kapanır (açık kipsel pencerenin dışındaki öğe odak alamaz), sonra odak döner,
sonra komut çalışır. Nöbetçi `__tests__/components/CommandPalette.test.tsx`.

Yeni `hotkey` (`'mod+k'`) + `onOpen`: kısayol kapalıyken açar, açıkken kapatır,
başka bir kipsel yüzey açıkken dokunmaz (`hasOpenSurface`).

### 5.3 — SCSS API (`@handijit/ui/scss`)

Tüketici token değişkenlerini ve mixin'leri KOPYALAMADAN alır:

```scss
@use '@handijit/ui/scss' as ui;

.panel {
  padding: ui.$space-4;
  @include ui.focus-ring;
  @media (max-width: ui.$breakpoint-md) { … }
}
```

⚠ 2.0: the variables are aliases of design tokens (`ui.$primary` is `var(--hd-primary)`), the
breakpoints are `$breakpoint-sm` / `-md` / `-lg` / `-xl`, and the module is three files (`_index`,
`_variables`, `_mixins`). Renamed and removed names: `CHANGELOG.md`.

**Neden:** hanration değişkenleri kopyalamıştı ve değerler kaymıştı
(`$tablet-breakpoint: 760px`; @handijit/ui'de 768 / 1024).

| Ne | Nerede |
|---|---|
| Kaynak | `src/styles/_index.scss` → `variables` + `mixins` iletir |
| Derleme | `scripts/build-scss.mjs` → `build/scss/` (2.0: 3 dosya, KAPALI liste) |
| Dışa aktarım | `exports["./scss"]` — `sass` / `style` / `default` koşulları |
| Ad taban çizgisi | `scripts/api-baseline.scss.txt` (`$değişken` + `@mixin`; 2.2'de 227 ad — `field-error` —, 2.1'de 226, 2.0'da 225, 5.5'te 253'tü) |
| Nöbetçi | `__tests__/styles/scss-api.test.ts` |

⚠ **Modül KURAL BASMAZ.** `base.scss` (ve 1.x'te `_tokens.generated.scss`, `:root`
kuralları) bilerek dışarıda: tüketiciye `styles.css` zaten iniyor, modüle
girselerdi her `@use` onları yeniden üretirdi (hanration'da her modül dosyasına
`additionalData` ile enjekte ediliyor). Nöbetçi bunu ölçer: yalnızca `@use`
edilen modülün çıktısı BOŞ.

⚠ **Önce tüketicide denendi, sonra ihraç edildi** (kırılma yayından sonra
görünürdü): hanration'da `npm pack` paketiyle Next 16.4 **Turbopack** ve
**webpack** derlemelerinin ikisi de `exports` üzerinden çözdü; webpack çıktısında
kırılma noktası `768px`. Değişkenler `var(--hd-…)` (o gün `var(--ui-…)`) dizeleri olduğu için tema
çalışma zamanında döner — derleme anında sabitlenmez.

⚠ **SCSS'teki her ad da bir SÜRÜM TAAHHÜDÜ.** `check:api` dördüncü girişi
kopyalanan dosyalardaki üst düzey `$ad:` ve `@mixin ad` kümesini taban çizgisiyle
karşılaştırır; bir değişkenin adı değişirse tüketicinin Sass derlemesi kırılır.

⚠ jest'te Sass derlemesi **`@jest-environment node`** ister: dart2js Sass jsdom
ortamında `Null check operator used on a null value` ile düşüyor.

### 5.1 — Faz 1 eklemeleri (yalnızca ekleme, kırıcı değil)

| Bileşen | Ekleme |
|---|---|
| `Modal` | `size="xl"` (≈1040 px) |
| `Button` | `size={UISize.XSMALL}` (görsel 30 px; `tap-target` 44 px kalır) + `shape="pill"` |
| `IconButton` | `shape="round"` |
| `Textarea` | `variant="bare"` — çerçeve ve odak göstergesi KAPSAYICININ (`:focus-within`) |
| `Progress` | `size="xs"` (2 px) |
| `CodeBadge` | `onClick` / `href` ile etkileşimli kod (+ `label`), `size="xs"` |
| `Avatar` | `icon` yuvası, `shape="rounded"`, `tone="brand"` (marka madalyonu — yeşil ayak izi listesinde) |
| `Stat` | `variant="inline"` — etiket ve değer tek satır, değer teknik fontta |
| `ScrollArea` | `isFollowingEnd` |
| `Accordion` | iç yapı `Disclosure`; API aynı |

### `Card.isContained` → `fit`

Görselin çerçeveyi nasıl doldurduğu artık **üç değerli** tek bir prop:
`fit="cover"` (doldurur, taşanı kırpar) · `fit="contain"` (kırpmadan sığdırır,
varsayılan) · `fit="inset"` (sığdırır + %85'e çekip merkezler).

`isContained` bir sürüm daha çalışır; iki prop birlikte verilirse **`fit`
kazanır**. Ters öncelik, `isContained`ın varsayılanı `true` olduğu için yeni
prop'u sessizce etkisiz bırakırdı.

⚠ **Davranış değişikliği — `cover`:** bu dal eskiden hiç `object-fit`
taşımıyordu, yani tarayıcı varsayılanı `fill` yürürlükteydi ve oranı çerçeveden
farklı bir fotoğraf kırpılmıyor **eziliyordu**.

### `Tooltip.position` → `side`

Ad değişti çünkü davranış değişti: `position` SABİT bir kenar yazıyordu ve balon
oraya sığmadığında görünüm alanının dışına taşıyordu. `side` bir *tercih*tir;
sığmazsa karşı kenara çevrilir.

### `ConfirmDialog.kind` → `variant`

Ölçü/ton/varyant için sistemde **tek ad** kullanılır; `kind` o sözleşmenin
dışında kalmış tek isimdi.

### `Carousel.itemMinWidth` → `itemWidth` — şerit artık kart GERMİYOR

Ad davranışla birlikte değişti. Şerit `grid-auto-columns: minmax(item, 1fr)`
yazıyordu ve o `1fr` **yalnızca şerit dolmadığında** devreye giriyor: kart
sayısı görünümü doldurmuyorsa sütunlar boş alanı paylaşıp genişliyordu.
Ölçülen sonuç iki kartlık bir şeritte **biri başta, biri tam ortada** —
kartın kendi genişliği sabitse (tüketiciler öyle yazıyor) aradaki fark boşluk
olarak görünüyor, kart genişliği serbestse bu sefer kartlar absürt geniş
çiziliyordu. İki durumda da "şerit" izlenimi kayboluyordu.

Sütun genişliği artık **sabit** ve dolmayan şerit `justify-content: start` ile
başa yaslanıyor. `itemMinWidth` bir sürüm daha çalışır (`itemWidth` verilirse
o kazanır), ama adı artık yalan: değer asgari değil, kartın genişliğinin
kendisi.

⚠ **Duyarlı genişlik prop'tan GELMEZ.** Sayı tek bir kırılma noktası
anlatabilir; kart genişliği ise mobilde ayrı, masaüstünde ayrıdır. Inline
yazılan değer bu yüzden `--ui-carousel-item-default` adını taşıyor ve
tüketici kendi medya sorgusundan `--ui-carousel-item` ile eziyor — inline
stil bir sınıf kuralına yenilmediği için tek isim kullanılsaydı ezme
**imkânsız** olurdu. "Yarım kart görünsün" gibi ölçüler de aynı kapıdan:
`--ui-carousel-item: max(232px, calc((100% - 4.3 * 16px) / 4.3))`.

Nöbetçi: `__tests__/components/Carousel.track.test.ts` — `fr` biriminin ya da
`minmax(`in geri gelmesi ve ezme zincirinin düşmesi ayrı ayrı kırar.

## Kod düzeni ve tasarım prensipleri — ZORUNLU

**Bundan sonraki her geliştirme bu prensiplere uyar; kurallar aşağıdaki
otomatik denetçilerle zorlanır** — `npm run verify` zinciri (2.0): `check:contrast` →
`typecheck` → `lint` → `test:coverage` (satır 89 ·
ifade 86 · fonksiyon 80 · dal 75) → `build` (ana giriş + `chat` + `charts` +
`build/scss` + `exports` denetimi) → **`check:api`** (dört giriş) → `check:animations` →
`size-limit`. 1.x'in `check:palette` ve `tokens` adımları üreteçle birlikte kalktı. CI ve yayın
iş akışı ayrıca `format:check` koşar.

**Release (2.0).** A push to `master` runs `.github/workflows/publish.yml`: when the version in
`package.json` is not on npm yet it reads the release notes from the `## [x.y.z]` section of
`CHANGELOG.md` (no section, no release), runs `format:check` and `verify`, checks the token with
`npm whoami` and publishes with `npm publish --access public --provenance`
(`NODE_AUTH_TOKEN` = the repository secret `NPM_ACCESS_TOKEN`; no trusted publishing), then tags
and creates the GitHub Release. A version that is already on npm is skipped, not failed.

| Prensip | Ne demek |
|---|---|
| **KISS** | Uzun ve dolambaçlı yerine sade ve okunur. |
| **DRY** | Aynı kural iki yerde yaşamaz. |
| **SRP** | Bir dosya tek sebeple değişir. |
| **SoC** | Konumlandırma/erişilebilirlik mantığı `hooks/`ta, çizim bileşende, renk ve her ölçek `@handijit/design`da (2.0; bileşen yalnızca hangi token'la çizeceğini seçer). |
| **OCP** | Yeni görünüm yeni varyant token'ıdır; bileşen gövdesine `if` eklemek değil. |
| **YAGNI** | Çağıranı olmayan prop eklenmez — her prop bir API taahhüdüdür. |
| **Immutability** | Prop'lar ve token nesneleri yerinde değiştirilmez. |

### Klasör sözleşmesi

| Ne | Nerede |
|---|---|
| Paylaşılan / alanı anlatan `type` | `src/types/*.type.ts` |
| `enum` | `src/enums/*.enum.ts` |
| Sabit değerler | `src/constants/*.constants.ts` |
| Birden fazla yerde kullanılan fonksiyon | `src/helpers/*.helper.ts` |

⚠ **Bileşenin KENDİ genel API tipi bileşenin yanında kalır** (`BadgeTone`
`Badge`de, `TabItem` `Tabs`ta, `UploadFile` `FileUpload`ta). Bunlar "o an
çalışılan dosyaya rastgele eklenmiş" tipler değil, bileşenin sözleşmesidir;
bileşen ile sözleşmesini ayırmak, tüketicinin iki dosya açmasını gerektirir
ve bir bileşen kütüphanesinde okunurluğu **düşürür**.

**Taşınanlar — gerçekten dağınık olanlar:** tema tipleri (bugün `UiLabels`, `UiThemeState`,
`UiColorScheme`, `UiColorPreference`; 1.x'in `UiToken`, `UiThemeConfig`, `InitUiOptions` tipleri
ve `theme/tokens.ts` veri dosyası 2.0'da kalktı), kanca
tipleri (`PositionSide`, `PositioningOptions`, `VirtualRange`,
`AnnouncePoliteness`…) ve `ClassValue`.

**`Combobox` istisnası — 515 satır bir sinyaldi.** Tipleri (`ComboboxOption`,
`ComboboxLabels`, `ComboboxProps`) `types/combobox.type.ts`e, ölçüleri
(`VIRTUAL_THRESHOLD`, `OPTION_HEIGHT`) `constants/combobox.constants.ts`e
taşındı; dosya **460** satıra indi. Kural bozulmadı: tipler bileşenden
**yine de dışa açılıyor**

```ts
export type { ComboboxLabels, ComboboxOption, ComboboxProps } from '../../types/combobox.type';
```

çünkü çağıranlar (uygulamalar ve testler) `@/components/Combobox` yolundan
alıyordu ve yalnızca dosya yeri değişti diye bir sürüm kırılması olmamalı.

⚠ **Dosya boyu bir kapı değil sinyaldir.** 1.x'te `theme/tokens.ts` (422 satır) bölünmedi: bir
**veri tablosuydu** ve iki dosyaya ayırmak "hangi token nerede" sorusunu üretirdi. Dosya 2.0'da
yok (tablo `@handijit/design`da); ilke duruyor.

⚠ **Public API DEĞİŞMEDİ, ölçüldü.** `build/index.d.ts` içindeki dışa
aktarım kümesi taşımadan önce ve sonra **birebir aynı**.
`src/index.ts` bir cephedir; tip gövdeleri nerede yaşarsa yaşasın tüketici
(vitrin ve yönetim paneli) aynı adları aynı yerden alır.

### `src/index.ts`teki her ad bir SÜRÜM TAAHHÜDÜDÜR — `check:api` bunu ölçer

Ölçüm artık elle değil: `scripts/check-api.mjs` `build/index.d.ts`ten dışa
aktarım adlarını çıkarır ve `scripts/api-baseline.txt` ile karşılaştırır
(2.0'da **163 ad**; 5.6'da 177'ydi — tema nesneleri, `initUi` ve token tipleri kalktı, design'ın
tema sabitleri eklendi. Alt girişler ayrı taban çizgilerinde: sohbet 30, grafikler 22, SCSS 227). Kapı
`verify` içinde, `build`ten hemen sonra.

```bash
npm run check:api               # doğrula
node scripts/check-api.mjs --update   # taban çizgisini BİLİNÇLİ tazele
```

⚠ **Eski elle ölçüm yanlış sayıyordu.** CLAUDE.md'de kayıtlı komut
`grep -oE 'export (type )?\{[^}]*\}'` idi; vite-plugin-dts her bildirimi tek tek
`export declare …` olarak yazıyor ve dosyanın sonunda yalnızca **boş** bir
`export { }` bırakıyor. Yani o komut ne değişirse değişsin **tek satır**
(`export { }`) döndürüyordu: küme hiç ölçülmüyordu ama ölçülüyor sanılıyordu.
Betiğin deseni `export declare (const|type|function|class|interface|enum) Ad`
ve **sıfır eşleşmede açıkça düşer** — ölçemediği şeyi yeşil geçmez.

**Tip taşımalarında diff ZORUNLU.** Tüketiciler @handijit/ui'yi **caret** ile alıyor
(`^4.1.0`, `^5.3.0`), yani küçük sürümde düşen bir ad
bir sonraki `npm install`da, sebebi çoktan unutulmuşken derleme hatası üretir.
Taban çizgisi bu yüzden repoda duruyor. (Bu satır bir dönem "iki tüketici de
`2.4.0` ile tam pinli" diyordu; artık doğru değil.)

**Bu turda taşınan iki tip** ve neden kırıcı olmadıkları:

| Tip | Önce | Sonra | Neden güvenli |
|---|---|---|---|
| `Formatter<TArgs>` | `helpers/label.helper.ts` **ve** `types/theme.type.ts` — birebir aynı imza, iki bildirim | tek bildirim `types/theme.type.ts`te | `index.ts`ten **dışa verilmiyor**; `.d.ts`te zaten tek `declare type` olarak görünüyordu |
| `ListboxNavigation` | `hooks/useListboxNavigation.ts` (kardeşleri `types/hook.type.ts`te) | gövde `types/hook.type.ts`te, **hook yeniden ihraç ediyor** | `Combobox` deseninin aynısı: `src/index.ts` **değişmedi**, ad aynı yoldan geliyor |

**5.1'de açılan adlar — her birinin kütüphane dışında çağıranı var:**

| Ad | Neden dışa açık | Çağıran |
|---|---|---|
| `useUiTokens` | Çizim kütüphaneleri (recharts) `stroke`/`fill` için `var(--…)` okuyamıyor; çözülmüş değer gerekiyor ve tema değişince yenilenmeli | hanration `MetricsPanel` (kendi `useCssVars` kopyasıyla yapıyordu) |
| `UiThemeScript` | Tema ilk boyamadan ÖNCE yazılmalı; iki tüketici aynı betiği elle yazıyordu. ⚠ BİLEŞEN, fonksiyon değil: paket `'use client'` taşıdığı için dışa verilen düz bir fonksiyon Next'in sunucu bileşeninde çağrılamıyor (ölçüldü: `next build` "Attempted to call themeBootScript() from the server" ile kırıldı). Bileşen sunucuda da çizilir | hanration `layout.tsx` (`THEME_BOOT_SCRIPT`) |
| `hasOpenSurface` | Sayfa düzeyinde `Escape` dinleyen kod `event.defaultPrevented \|\| hasOpenSurface()` sormalı; sormayan, yüzeyi kapatan tuşla arkadaki akışı da durduruyordu. Tek başına yetmez — bkz. 5.6.1 | hanration `Composer` |
| `Disclosure` (+ `DisclosureVariant`) | Tek başına açılır bölüm; aynı kalıp hanration'da üç kez elle yazılmıştı | hanration `Disclosure`, `ProcessBlock`, `ToolCallCard` |
| `StatusDot` (+ `StatusDotTone`) | Adı olan durum noktası; dört yerde elle çiziliyordu ve hiçbiri durumu okutmuyordu | hanration `Header`, `LiveStatusBar`, `ToolCallCard`, `EventsPanel` |
| `Kbd` | Klavye kısayolu; `CommandPalette`in kısayolu da artık bunu kullanıyor | hanration `Composer` ipucu satırı |
| `useStickToBottom` | Kaydırma kutusunu sona yapışık tutar, kullanıcı yukarı kaydırınca bırakır; `ScrollArea isFollowingEnd` de bunu kullanır | hanration `ChatView` (kendi kopyası vardı) |

⚠ **Paket bütçesi SINIRDA (2026-10-10):** 5.1'in eklemeleri tüm girişi 40,17 →
**42,00 kB** taşıdı (bütçe 42 kB) ve `styles.css`i 23,07 / 24 kB'a. Sohbet
bileşenleri bu yüzden ana girişe GİRMEZ, ayrı `chat` girişine gider — plan bunu
"vitrinin bütçesi büyümesin" diye öneriyordu, ölçüm artık zorunlu kılıyor.
5.2'nin `UiThemeScript`i girişi 42,05 kB'a taşıdı ve bütçe 43 kB'a çekildi
(gerekçe `.size-limit.js` ve "`@handijit/ui/charts`" bölümünde).

⚠ Sohbet planı `hasOpenSurface` yerine bir **kanca** (`useIsModalOpen`) öneriyordu.
Çağıranın ihtiyacı reaktif bir durum değil, tuşa basıldığı ANDAKİ tek bir soru;
kanca her yüzey açılıp kapandığında çağıranı yeniden çizdirirdi (KISS). Yığının
kendisi (`pushModal` / `isTopModal`) iç API olarak kalır.

**İç kancalar `src/index.ts`e EKLENMEZ.** Bu turda açılan `useDismissOnEscape`
ve `useAsyncSearch` dışa verilmedi — her ihraç bir sürüm taahhüdüdür ve
ikisinin de kütüphane dışında çağıranı yok (YAGNI).

⚠ **14 CSS varyant union'ı enum dönüşümünden KALICI MUAF.** `AlertTone`,
`BadgeTone`, `BadgeVariant`, `ChipSize`, `CardMediaFit`, `ConfirmKind`,
`IconButtonVariant`, `ModalTone`, `StatTrend`, `TimelineStatus`, `ToastTone`,
`PositionSide`, `PositionAlign`, `UiColorScheme` (`UiDensity` 2.0'da kalktı) —
hepsi `className` besliyor ve tüketiciler düz dize geçiyor
(`<Badge tone="success">`). Enum'a çevirmek o çağrıları **derlenmez** yapardı:
`TS2322` ile, üstelik iki uygulamada onlarca yerde. Monorepodaki "tel değeri
olan union → enum" kuralı **backend'i aynalayan** değerler içindir; bunların
telde karşılığı yok, CSS sınıf adı sonekleri.

### Node 24 · ECMAScript 2025

`tsconfig.json` → `target: ES2023`, `lib: ["DOM", "DOM.Iterable", "ESNext"]`.

⚠ **`target` burada ES2024 DEĞİL ve bunun ölçülmüş bir sebebi var.** Diğer
depolar `ES2024` yazıyor; @handijit/ui'de o değer her derlemede **89 uyarı** basıyordu:

```
▲ [WARNING] Unrecognized target environment "es2024" [tsconfig.json]
```

Vite 5.4'ün getirdiği esbuild **0.21.5** ve o sürümün *tsconfig* ayrıştırıcısı
`es2024`ü tanımıyor (`--target=es2024` bayrağı ayrı bir yol ve kabul ediyor —
bu yüzden ilk bakışta çelişkili görünüyor). Tanımadığı değeri **sessizce yok
sayıp** kendi varsayılanına düşüyordu, yani yapılandırma çalışmıyor ama
başarısız da olmuyordu.

**Kaybedilen bir şey yok:** `target` yalnızca *downlevel* üretimini belirler,
ES2025 API'lerini veren şey `lib: ESNext`. Yayınlanan bir kütüphane için
`ES2023` çıktısı zaten daha güvenli. Vite/esbuild yükseltildiğinde `ES2024`
yazılabilir; ölçüm `npm run build 2>&1 | grep -c "Unrecognized target"` → `0`.

**Bu turda uygulanan modern dizi yolları** — kütüphane daha önce hiçbirini
kullanmıyordu:

| Yer | Ne | Neden |
|---|---|---|
| `helpers/focus.helper.ts` `isTopModal` | `.at(-1)` | Yığının tepesi; karşılaştırma, dar tip gerekmiyor |
| `TagInput` Backspace dalı | `.at(-1)` | `values.length > 0` guard'ı doğal olarak `!== undefined`a dönüştü |
| `Toast` Escape dalı | `.at(-1)` | Kanca çıkarımı zaten `useCallback` istiyordu |

⚠ **`.at(-1)` HER YERE uygulanmadı ve sebebi tsconfig'de.**
`noUncheckedIndexedAccess: false` olduğu için `dizi[dizi.length - 1]` **dar**
tip döner (`number`), `dizi.at(-1)` ise imzası gereği `number | undefined`.
Yani `Menu:82,155` ve `Avatar:29` gibi **zaten korunmuş** çağrı yerlerinde
dönüşüm bir okunurluk kazancı değil, `?? …` / `!` gürültüsü üretiyordu
(`Menu`de liste boşken menü hiç açılmıyor, `Avatar`da `words.length === 0`
erken dönüyor). Uygulanmayan yer bir eksiklik değil ölçülmüş karar.

⚠ **`Pagination:63` `toSorted`a ÇEVRİLMEDİ.** İfade `[...pages].sort(cmp)` ve
`pages` bir `Set` — spread zaten **taze bir dizi** üretiyor, yani ortada
mutasyon riski yok. `toSorted` eklemek ikinci bir kopya ayırmak olurdu:
immutability kazancı sıfır, allokasyon iki katı.

⚠ **`memo()` çağrısı `/*#__PURE__*/` OLMADAN yazılmaz — ağaç sarsmayı kırar.**
`PasswordInput` ve `ToastPortal` eklenirken bu atlandı ve `size-limit`
yakaladı: yalnızca `Button` ithal eden bir uygulama **3,93 → 5,68 kB**
indiriyordu (`Badge` 3,31 → 5,19). İki bileşen de anlaşılabilir biçimde
"küçük"tü ama modül düzeyindeki açıklamasız çağrı, bundler için yan etki ve
hedefin **tüm bağımlılık zincirini** ayakta tutuyor. Doğru biçim istisnasız:

```ts
export default /*#__PURE__*/ memo(/*#__PURE__*/ named(PasswordInput, 'PasswordInput')) as typeof PasswordInput;
```

Düzeltmeden sonra ölçüm tabana **birebir** döndü (3,93 / 3,31). Bu kural
`helpers/component.helper.ts` javadoc'unda ve `Toast`taki `new Set()`
açıklamasında zaten yazılıydı; nöbetçi `.size-limit.js` — **ve yalnızca tam
`npm run verify` koşusunda çalışır**, `npm test` bunu görmez.

### Ön-commit kancası

`.githooks/pre-commit` (bu turda **eklendi**) — **Prettier** → **ESLint** →
**Stylelint** → **TAM test süiti**. Ölçüldü (2026-10-10): süit ~7 sn (65 dosya /
861 test). `package.json`daki `prepare` betiği `core.hooksPath`i
`npm install` sırasında ayarlar.

### `PasswordInput` ve `ToastPortal` — iki uygulamadan buraya taşındı

Her ikisi de iki tüketici uygulamada (yönetim paneli ve vitrin) **birebir aynı dosya**
olarak duruyordu ve ikisi de zaten bu kütüphanenin bileşenlerini sarmalıyordu
(`Input`+`IconButton`, `ToastHub`) — yani en baştan buraya aitlerdi.

| Bileşen | Neden burada |
|---|---|
| `PasswordInput` | `Input` + `IconButton` sarmalayıcısı. Etiketler `labels.passwordShow` / `labels.passwordHide` üzerinden; sabit Türkçe metin gömülü DEĞİL. |
| `ToastPortal` | `ToastHub` portal kullanıyor ve `document` olmadan çalışamıyor; sunucuda çizilen ağaçta hidrasyon uyuşmazlığı üretir. Montaj bekleyen sarmalayıcı uygulamanın değil bileşenin sorunu. |

⚠ **Uygulamalar HENÜZ GEÇMEDİ.** Yönetim paneli ve vitrin
@handijit/ui'yi npm'den alıyor (`2.1.1`) ve bu bileşenler `2.1.0`da. Geçiş için
sırasıyla: `npm publish` → iki uygulamada bağımlılığı yükselt → yerel
`components/PasswordInput` ve `components/ToastPortal` klasörlerini sil →
`import { PasswordInput, ToastPortal } from '@handijit/ui'`. Yayın
yapılmadan yerel kopyaları silmek her iki uygulamayı da kırar.

⚠ **`2.2.0` (kurumsal palet) de aynı kapıda bekliyor.** Bağımlılık tam sürüme
sabit (`"2.1.1"`, aralık değil), yani yeni palet **yayınlanana ve iki
uygulamada `@handijit/ui@2.2.0`'a yükseltilene kadar** vitrine/panele
inmez. Uygulamaların kendi dosyalarında duran marka yüzeyleri (logo varlıkları,
panel rayı, `og.png`, `themeColor`, manifest, mail token'ları) bundan bağımsız
ve **zaten güncel** — yani geçiş penceresinde kurumsal logo yeni, gövde
renkleri eski görünür. Doğru sıra: `npm publish` → iki uygulamada dep bump.

### `ThemeToggle` ve `Logo` neden BURAYA TAŞINMADI

⚠ 2.0: the `nav-*` tokens named below no longer exist in any package, and the brand assets now
ship with the design package (`@handijit/design/logos/*`). The note is history; the two components
are still the applications'.

- **`ThemeToggle`** `nav-fg`, `nav-bg`, `nav-hover`, `nav-line` token'larını
  okuyor; bunlar uygulamanın üst bandına ait ve @handijit/ui'nin token
  sözleşmesinde **yok**. Buraya taşımak ya o token'ları kütüphaneye sokmayı
  (bir uygulamanın kroması genel bir tasarım sistemine girer) ya da bileşeni
  yeniden tasarlamayı gerektirir (zemin rengi tüketiciden gelen CSS özel
  değişkenleriyle). İkincisi doğru yol ama ayrı bir tur.
- **`Logo`** marka varlığı taşıyor (`/brand/*.svg`, uygulamanın markası). MIT
  lisanslı, genel amaçlı bir tasarım sistemine tek bir şirketin markasını
  koymak yanlış olur. Doğru ayrıştırma: mekanizma (temaya göre kaynak
  değiştirme, orana göre boyutlandırma) @handijit/ui'ye, varlıklar uygulamada.

⚠ İkisi de bugün **iki depoda kopya** ve ikisi de **ayrışmış** (`ThemeToggle`
101 vs 96 satır — admin'de `Tooltip`, vitrinde `IconButton`; `Logo` 117 vs
128 — vitrinde ek `app` varyantı). Bu bilinen bir borçtur, görünmez bir
kopya değil.
