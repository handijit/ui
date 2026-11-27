# @handijitcom/ui

Accessible React components for Han Dijit applications: the site, the staff
panel and the desktop programs. Built on SCSS Modules and drawn with the tokens
of [`@handijitcom/ui/design`](https://www.npmjs.com/package/@handijitcom/ui/design).

- **One design source.** Colours, type, radii, spacing, motion and layers come
  from `@handijitcom/ui/design` (`--hd-*`). This package holds no palette of its own.
- **Light and dark.** Both themes ship; the choice rides on `data-theme`, the
  contract `@handijitcom/ui/design` defines.
- **The router is injected.** `next/link`, `react-router`, a plain `<a>`: the
  application decides.
- **Text comes from outside, once.** The library invents no string in any
  language; user-visible strings are defined in one place, on the provider.
- **Native elements are kept.** `<dialog>`, `<input type="range">`,
  `<input type="radio">`: focus trapping, keyboard handling and screen reader
  announcements come from the browser.
- **Sub-entries, zero bytes in the main bundle.** `@handijitcom/ui/chat`
  (chat and tool interfaces), `@handijitcom/ui/charts` (dependency-free SVG
  charts), `@handijitcom/ui/calendar`, `@handijitcom/ui/scss` (token variables
  and mixins) and `@handijitcom/ui/design` (the design tokens: JavaScript API,
  `tokens.css`, `fonts.css`, `tokens.scss`, `tokens.json`, fonts and logos).

```bash
npm install @handijitcom/ui @handijitcom/utils react-bootstrap-icons
```

`react`, `react-dom`, `@handijitcom/utils` (`^1.0.0`) and `react-bootstrap-icons`
are **peer** dependencies. The design tokens ship inside the package
(`@handijitcom/ui/design`, `@handijitcom/ui/tokens.css`, see
[`docs/design.md`](./docs/design.md)): an application has exactly one copy of the
tokens, and the site, the panel and the components all read the same custom
properties.

---

## Quick start

```tsx
// Once, at the root of the application. The order matters.
import '@handijitcom/ui/tokens.css'; // the --hd-* custom properties, both themes
import '@handijitcom/ui/fonts.css'; // optional: Archivo, Inter, IBM Plex Mono
import '@handijitcom/ui/styles.css';
```

```tsx
import { Button, Field, Input, UIVariant } from '@handijitcom/ui';

<Field label="E-posta" isRequired error={error}>
  {props => <Input {...props} type="email" value={email} onChange={onChange} />}
</Field>

<Button variant={UIVariant.PRIMARY} isLoading={isSaving} onClick={save}>
  Kaydet
</Button>;
```

The provider is **optional**: the package works with no configuration. Links
are plain `<a>` elements and labels are whatever each call passes.

`@handijitcom/ui/styles.css` carries **no tokens**. Without
`@handijitcom/ui/tokens.css` every colour resolves to nothing. `fonts.css` is
optional: load the three families your own way (`next/font`, self-hosted
`@font-face`) if you prefer, the tokens only name them.

### A subset of the CSS

An application that wants less imports `base.css` (box model, `@keyframes`,
helpers) and the `components/<Name>/style.css` files of the components it uses,
and lets its own build join them:

```scss
// styles/ui.scss: Sass inlines plain CSS files.
@use '@handijitcom/ui/base.css';
@use '@handijitcom/ui/components/Button/style.css';
@use '@handijitcom/ui/components/Chip/style.css';
```

The JavaScript modules do not import CSS. That is deliberate: under Turbopack
every client boundary's CSS landed in its own file, and the number of
render-blocking files hurt LCP more than the bytes did.

Every component also has a subpath (`@handijitcom/ui/button`, `/chip-group`,
`/combobox`, …). The main entry is a pure re-export, so a bundler reaches the
same file either way.

The sub-entries have their own stylesheets, imported **after** `styles.css`:
`@handijitcom/ui/chat.css`, `@handijitcom/ui/charts.css`, `@handijitcom/ui/calendar.css`.

---

## Theme

### The choice rides on `<html data-theme>`

```html
<html data-theme="dark"></html>
```

This is the contract of `@handijitcom/ui/design`, not a setting of this package:
`data-theme="light"` or `"dark"` on the root element picks the theme, and
without the attribute `prefers-color-scheme` decides. An explicit choice is
never overridden by the system setting. The attribute also works on any
element, to draw one region in the other theme.

### Write it before the first paint: `UiThemeScript`

```tsx
// app/layout.tsx, a server layout, inside <head>.
import { UiThemeScript } from '@handijitcom/ui';

<head>
  <UiThemeScript nonce={nonce} />
</head>;
```

It renders the boot script of `@handijitcom/ui/design` (`THEME_BOOT_SCRIPT`) as an
inline `<script>`. The script reads `localStorage["hd-theme"]` (`light` or
`dark`; anything else means "follow the system"), writes `data-theme` while the
HTML is still being parsed, and follows the system setting when it changes.
Without it a user who chose dark sees one light frame.

It is a component and not a function because a plain function exported from a
package with `'use client'` files cannot be called from a Next.js server layout.

### Content Security Policy

The boot script is the **only** element this library injects. It injects no
`<style>` element at all.

| Policy style      | What to do                                                                  |
| ----------------- | --------------------------------------------------------------------------- |
| Nonce per request | `<UiThemeScript nonce={nonce} />`                                           |
| Static hash       | add `'${THEME_BOOT_SCRIPT_HASH}'` to `script-src`; the page stays cacheable |

```ts
import { THEME_BOOT_SCRIPT_HASH } from '@handijitcom/ui'; // re-exported from @handijitcom/ui/design

const policy = `script-src 'self' '${THEME_BOOT_SCRIPT_HASH}'`;
```

`THEME_ATTRIBUTE`, `THEME_STORAGE_KEY`, `THEME_BOOT_SCRIPT` and
`THEME_BOOT_SCRIPT_HASH` are re-exports, not copies: the digest always matches
the script the installed design package ships.

Some components position or size themselves with inline `style` attributes
(popover coordinates, progress width, virtual list offsets). A nonce cannot
cover an attribute; a policy that restricts inline styles needs
`style-src-attr 'unsafe-inline'`.

### Changing the theme

```tsx
const { scheme, preference, setScheme, toggle, isReady } = useUiTheme();
```

| Field        |                                                                        |
| ------------ | ---------------------------------------------------------------------- |
| `scheme`     | the **resolved** theme, the one on screen (`light` \| `dark`)          |
| `preference` | the user's **choice** (`light` \| `dark` \| `system`)                  |
| `setScheme`  | stores the choice and applies it; `'system'` removes the stored choice |
| `toggle`     | flips between light and dark                                           |
| `isReady`    | `false` on the server and on the first client frame                    |

A three-state switch (Light / Dark / System) reads `preference`; if it read
`scheme`, "System" would show "Dark" as selected.

`setScheme` writes where the boot script reads: `localStorage["hd-theme"]`
holds `light` or `dark`, "system" removes the key, and the attribute always
carries the resolved theme. A choice made through the hook therefore survives a
reload without a flash. Wait for `isReady` before drawing the switch: the
server does not know the choice, and a guessed switch mismatched on hydration
even when the guess was right.

### Brand and product overrides

There is no theme prop. A value is changed where it is defined, as a custom
property, in the application's own stylesheet:

```css
:root {
  --hd-radius-md: 10px;
}

/* The same selector the design package uses, or the override loses on <html>. */
:root[data-theme='dark'] {
  --hd-bg-page: #0b0d12;
}
```

Change the tokens of `@handijitcom/ui/design` sparingly: the contrast of every text
and focus pair is measured against the published values.

### Overriding our CSS: `@layer ui`

All of the library's CSS is inside `@layer ui`. A layered rule **always loses**
to an unlayered one, whatever the specificity or source order:

```css
/* This is enough; no `!important`, no `.app .card .card`. */
.my-card {
  padding: 0;
}
```

Without the layer your class and ours competed at the same specificity and the
winner was decided by source order, which is in your bundler's hands and need
not be the same in development and production.

### Component variables

Besides the design tokens, a few components read custom properties of their own
(`var(--ui-…, default)`) so an application can restyle one component from
`:root` without a class selector:

| Component    | Variables                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| focus ring   | `--ui-ring-width` (2px) · `--ui-ring-offset` (2px; `-2px` pulls it inside)                                                            |
| inputs       | `--ui-placeholder` (`text-3`)                                                                                                         |
| modal scrim  | `--ui-scrim-blur`                                                                                                                     |
| `Button`     | `--ui-button-radius` · `-weight` · `-tracking` · `-wrap` (`nowrap`)                                                                   |
| `Chip`       | `--ui-chip-bg` · `-line` · `-fg` · `-radius` · `-weight` · `-selected-bg` · `-selected-line` · `-selected-fg` · `-selected-weight`    |
| `Badge`      | `--ui-badge-font` · `-weight` · `-tracking` · `-transform` · `-radius` · `-bg` · `-line` · `-fg`                                      |
| `Stat`       | `--ui-stat-label-font/-size/-weight/-tracking/-transform` · `-value-font/-weight/-tracking` · `-unit-font/-size/-tracking/-transform` |
| `Tabs`       | `--ui-tab-weight`                                                                                                                     |
| `RadioCard`  | `--ui-radio-card-line` · `-radius`                                                                                                    |
| sticky parts | `--ui-header-height` (see below)                                                                                                      |

```css
:root {
  --ui-ring-offset: -2px;
  --ui-button-weight: 500;
  --ui-chip-radius: var(--hd-radius-pill);
  --ui-badge-font: var(--hd-font-mono);
  --ui-badge-transform: uppercase;
}
```

`--ui-*` is the prefix of component-private variables only. Every global value
(colour, size, radius, duration, layer) is `--hd-*`.

### Reading tokens in JavaScript

```tsx
const colors = useUiTokens(['border', 'chart-1']); // { border: '#…', 'chart-1': '#…' }
```

`useUiTokens` returns the resolved values of design tokens and follows theme
changes; it is for canvas and third-party charts that cannot read `var()`. On
the server and the first frame it returns `currentColor`. The names are
`TokenName` of `@handijitcom/ui/design`.

---

## Labels

The library cannot write "Close": it does not know the language, the tone or
the term. Spreading the same string over a hundred call sites is not right
either. Labels are given **once**, on the provider:

```tsx
<UiProvider
  labels={{
    close: 'Kapat',
    cancel: 'Vazgeç',
    submit: 'Kaydet',
    loading: 'Yükleniyor',
    required: '(zorunlu)',
    filters: 'Filtreler',
    breadcrumb: 'Konum',
    directoryJump: 'Harfe göre atla',
    selectPlaceholder: 'Seçiniz',
    locale: 'tr',
    currency: '₺',
    combobox: {
      searchPlaceholder: 'Ara…',
      emptyMessage: 'Sonuç bulunamadı',
      loadingMessage: 'Aranıyor…',
      clearLabel: 'Seçimi temizle',
    },
    pagination: { label: 'Sayfalar', previous: 'Önceki sayfa', next: 'Sonraki sayfa' },
    quantity: { label: 'Adet', decrease: 'Adeti azalt', increase: 'Adeti artır' },
    range: { min: 'En az', max: 'En çok' },
    dataTable: {
      empty: 'Kayıt bulunamadı.',
      loading: 'Yükleniyor…',
      columns: 'Sütunlar',
      moveUp: column => `${column} sütununu öne al`,
      moveDown: column => `${column} sütununu geri al`,
    },
    gallery: {
      thumbnails: 'Görseller',
      thumbnail: (index, total) => `Görsel ${index} / ${total}`,
      previous: 'Önceki görsel',
      next: 'Sonraki görsel',
      fullscreen: 'Tam ekran',
      zoomIn: 'Yakınlaştır',
      zoomOut: 'Uzaklaştır',
    },
    treeSelect: { search: 'Kategori ara', empty: 'Eşleşen kategori yok' },
    notificationCenter: {
      trigger: unread => (unread ? `Bildirimler, ${unread} okunmamış` : 'Bildirimler'),
      title: 'Bildirimler',
      markAllRead: 'Tümünü okundu işaretle',
      markRead: 'Okundu işaretle',
      empty: 'Bildirim yok',
      unread: 'Okunmamış',
      today: 'Bugün',
      yesterday: 'Dün',
    },
    bulkPaste: {
      summary: count => `${count} satır okundu`,
      invalidSummary: count => `${count} satır okunamadı`,
      line: line => `Satır ${line}`,
      missingCode: 'Kod yok',
      invalidQuantity: 'Adet okunamadı',
    },
    copyField: {
      copy: value => `${value} kopyala`,
      copied: value => `${value} kopyalandı`,
      announcement: 'Panoya kopyalandı',
    },
    calendar: {
      instructions: 'Oklarla gezinin, Enter ile açın; ⌘ ve oklarla taşıyın, ⌘ ⇧ ↑ ↓ ile kısaltıp uzatın.',
      cancelled: 'İptal',
      more: count => `+${count} daha`,
      moved: (title, when) => `${title} taşındı: ${when}`,
    },
    rating: {
      srLabel: (value, count) => `5 üzerinden ${value}${count ? `, ${count} değerlendirme` : ''}`,
      starCount: star => `${star} yıldız`,
      scale: { 1: 'Hiç memnun kalmadım', 2: 'Beklentimi karşılamadı', 3: 'İdare eder', 4: 'Memnun kaldım', 5: 'Çok memnun kaldım' },
    },
  }}
>
```

**Resolution order: prop → provider → development warning.** A prop wins when
given; pass one where the wording depends on the context
(`closeLabel="Daha sonra"`).

Text that belongs to **one element** never goes on the provider, because it
differs at every call site: `Modal.title`, `ConfirmDialog.confirmLabel` ("Sil":
it must repeat the action; "OK" does not say what is being confirmed),
`IconButton.label`, `Select.label`, `Combobox.labels.placeholder`,
`TableCheckbox.label`, `ChipGroup.label`, `RatingInput.label`.

TypeScript cannot see what the provider carries at run time, so the props are
optional. With neither a prop nor a provider value the element stays unnamed
and, in development, the console says so once per key:

```
[@handijitcom/ui] Eksik metin: Modal.closeLabel. Prop olarak geçin ya da
<UiProvider labels={…}> içinde bir kez tanımlayın.
```

---

## Router

```tsx
import NextLink from 'next/link';

<UiProvider linkComponent={NextLink}>…</UiProvider>;
```

A component library cannot choose the router: importing `next/link` ties the
package to Next.js, importing `react-router` breaks another application.
Router-specific props travel through `linkProps`:

```tsx
<Pagination buildHref={page => `?sayfa=${page}`} linkProps={{ scroll: false }} … />
```

### Back to the top after a page change

```tsx
<Pagination page={page} totalPages={totalPages} scrollTo="top" … />
```

It works in both modes (`buildHref` and `onPageChange`). The scroll is instant
and does **not** happen when the active page is pressed, when the click opens a
new tab (Ctrl/Cmd/middle button), or when the prop is absent. Do not pass it
for a list inside a page (reviews in a tab): it throws the reader to the top.

### Sticky header

Components that stick while the page scrolls (`DirectoryGroup`,
`DirectoryJump`, a `DataTable` with a caption) read their offset from
`--ui-header-height`, **0 by default**. If the application has a sticky band,
write its real height:

```tsx
useEffect(() => {
  const observer = new ResizeObserver(([entry]) =>
    document.documentElement.style.setProperty(
      '--ui-header-height',
      `${entry.contentRect.height}px`,
    ),
  );
  observer.observe(headerRef.current!);
  return () => observer.disconnect();
}, []);
```

Do not write a constant: the band grows when the search box wraps on a phone
and changes when an announcement strip appears.

---

## Component catalogue

| Group                 | Components                                                                                                                                                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Action                | `Button` · `IconButton` · `TextLink` · `Tooltip` · `Menu` · `ContextMenu` · `Popover`                                                                                                                                                                                                                                               |
| Choice                | `Chip` · `ChipGroup` · `SegmentedControl` · `Select` · `Combobox` · `TreeSelect` · `Checkbox` · `Switch` · `Radio` · `RadioCard` · `RangeSlider` · `RatingInput` · `QuantityStepper` · `TableCheckbox`                                                                                                                              |
| Input                 | `Input` · `PasswordInput` · `Textarea` · `TagInput` · `DateField` (+ `DateRange`) · `FileUpload` · `Field` · `ScaledInput` · `MoneyInput` · `QuantityInput` · `RateInput` · `PercentInput` · `BulkPasteInput`                                                                                                                       |
| Surface               | `Card` (+ `CardMedia`, `CardOverlay`, `CardBody`, `CardFooter`) · `SummaryCard` · `Panel` (+ `PanelForm`, `PanelRow`) · `PageHeader` · `SectionHeader` · `Tile` · `Directory` (+ `DirectoryGroup`, `DirectoryRow`, `DirectoryJump`) · `Carousel` · `Gallery` · `ScrollArea` · `Disclosure` · `Accordion` · `Tabs`                   |
| Feedback              | `Alert` · `Badge` · `StatusDot` · `CodeBadge` · `Kbd` · `EmptyState` · `Skeleton` (+ `SkeletonCard`, `SkeletonRows`, `SkeletonTable`) · `Spinner` · `Progress` · `Steps` · `Divider` · `Avatar` · `Rating` · `Price` · `Stat` · `CopyField` · `Breadcrumb` · `ToastHub` (+ `ToastPortal`) · `NotificationCenter`                    |
| Brand surface (3.0)   | `BrandSurface` (+ `BrandBlueprint`) · `Eyebrow` · `StatStrip`                                                                                                                                                                                                                                                                       |
| Modal                 | `Modal` · `Drawer` · `BottomSheet` · `ConfirmDialog` · `PromptDialog` · `CommandPalette`                                                                                                                                                                                                                                            |
| Data                  | `Table` (+ `TableScroller`) · `DataTable` (+ `DataTableRow`, `DataTableColumnMenu`) · `FilterBar` (+ `FilterBarField`) · `Pagination` · `Timeline`                                                                                                                                                                                  |
| Theme and hooks       | `UiProvider` · `UiThemeScript` · `useUi` · `useUiTheme` · `useUiTokens` · `useAnnounce` · `useStickToBottom` · `usePositioning` · `useVirtualList` · `useListboxNavigation` · `hasOpenSurface`                                                                                                                                      |
| Chat, `/chat`         | `ChatThread` · `ChatMessage` · `PromptInput` · `PromptSuggestions` · `Prose` · `CodeBlock` · `ReasoningBlock` (+ `ReasoningText`) · `ToolCall` (+ `ToolCallSection`) · `TerminalOutput` · `SourceList` · `Citation` · `MessageActions` · `AppBar` · `ActionList` (+ `ActionListItem`) · `SegmentBar` · `Legend` · `DescriptionList` |
| Charts, `/charts`     | `LineChart` · `AreaChart` · `BarChart` · `ComposedChart` · `PieChart` · `ScatterPlot` · `Heatmap` · `BoxPlot` · `Histogram` · `RadarChart`                                                                                                                                                                                          |
| Calendar, `/calendar` | `Calendar`                                                                                                                                                                                                                                                                                                                          |

### Variants and sizes

| `UIVariant` | Use                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------- |
| `PRIMARY`   | the one expected action of the screen: cobalt fill                                                  |
| `ACCENT`    | the conversion action (download, try, subscribe): coral fill, only that; glows on the brand surface |
| `SECONDARY` | a neutral second action: grey border, body text                                                     |
| `OUTLINE`   | a cobalt frame: an encouraged navigation that is not the primary action                             |
| `SOFT`      | a neutral fill: a secondary action inside a card                                                    |
| `GHOST`     | no surface: toolbar and inline secondary actions, in the link colour                                |
| `DANGER`    | a destructive action                                                                                |
| `ON_BRAND`  | a second action on the brand surface (cobalt in both themes): white frame, white label              |

`UISize`: `XSMALL` 28px · `SMALL` 32px · `MEDIUM` 40px · `LARGE` 48px. Fields
are 40px with 15px text on desktop and 44px with 16px text on a narrow or touch
screen (no iOS zoom, a full touch target).

`IconButton variant`: `ghost` · `secondary` · `outline` · `solid` · `accent` ·
`danger`. `secondary` and `outline` are drawn exactly like the `Button` variants
of the same name: the neutral frame and the cobalt frame. (Until 2.1 `outline`
was the neutral frame; use `secondary` for that look.)
`Badge tone`: `neutral` · `ink` · `info` · `danger`, each as `soft`, `solid` or
`outline`. The palette has one status hue, red (3.0): a good state is `info`
(cobalt), one that needs a look `ink` (the emphatic neutral). `StatusDot` and
`Calendar` tones follow the same names; `Alert`, `Toast` and `Modal` keep
`success` and `warning`, drawn in cobalt and ink and told apart by their icon.

### The number of options picks the element

| Options       | Element                                              |
| ------------- | ---------------------------------------------------- |
| ≤7            | `ChipGroup`: all on screen, one tap                  |
| 5–20          | `Select`: a list without search                      |
| 20+           | `Combobox`: type to search                           |
| A range       | `RangeSlider` (+ a number input for the exact value) |
| A single flag | `Checkbox`                                           |

### Dropdown or bottom sheet

`Select` and `Combobox` open a **dropdown anchored to the trigger** on every
screen except a narrow touch one, where they open a **bottom sheet**. The rule
is one media query, exported as `SHEET_MEDIA_QUERY`:
`(max-width: 640px) and (pointer: coarse)`. A narrow desktop window, an
Electron window included, keeps the dropdown.

### Form fields (2.2)

Every field component speaks `Field`'s contract, so a form library binds them
the same way: spread `FieldChildProps` (`id`, `aria-invalid`,
`aria-describedby`, `required`) on the control and the label, error and hint
are linked for a screen reader.

```tsx
<Field id="plan" label="Plan" hint="İstediğiniz zaman değiştirebilirsiniz" error={error}>
  {props => (
    <SegmentedControl {...props} label="Plan" options={PLANS} value={plan} onChange={setPlan} />
  )}
</Field>
```

- **`Field`** takes an `id` (the control's; the messages take `<id>-error` and
  `<id>-hint`) and a `ReactNode` label.
- **`Checkbox`, `Switch`, `Radio`** take `error`: the message under the label,
  `aria-invalid` and the link. A passed `aria-describedby` is **merged** with
  the error and the hint, each id once (until 2.1 it replaced the hint).
- **Composites** take the four props of `FieldChildProps`. Where they land:

| Component          | `id`                         | `aria-invalid` · `aria-describedby` | `required`                 |
| ------------------ | ---------------------------- | ----------------------------------- | -------------------------- |
| `QuantityStepper`  | the number box               | the number box                      | `aria-required`            |
| `SegmentedControl` | the `radiogroup`             | the `radiogroup`                    | `aria-required`            |
| `ChipGroup`        | the group                    | the group                           | single choice only         |
| `RangeSlider`      | the low thumb (`<id>-high`)  | both thumbs                         | — (always holds a value)   |
| `RatingInput`      | the `<fieldset>`             | the `<fieldset>`                    | native, on the five radios |
| `DateRange`        | the start field (`<id>-end`) | both fields                         | native, on both fields     |

- **`Select`** holds `null` (the placeholder shows) and, with **`Combobox`**,
  takes `onBlur` (focus left the whole control: moving into its own list or
  search box is not a blur) and a `ref` to the trigger.
- **Read-only**: `isReadOnly` on `Select`, `Combobox`, `QuantityStepper`,
  `SegmentedControl`, `ChipGroup`, `RangeSlider`, `RatingInput`, `DateRange`
  and `TagInput`. The value stays focusable and readable (`aria-readonly` where
  the role has it); nothing changes it.
- **`SegmentedControl` and `ChipGroup`** take a group-wide `isDisabled`.
- **`TagInput`** takes `value` like every other field (`values` still works,
  deprecated until 3.0) and `duplicateLabel` for the "already added"
  announcement (or `labels.tagInput.duplicate`).
- **`Button`** has no default `type`: inside a `<form>` a button without one
  submits, as in HTML. Write `type="button"` for every other button in a form.
  The default becomes `"button"` in 3.0.

### Notices, shortcuts and focus (2.3)

**Where the notices stand.** `ToastPortal` (and `ToastHub`) take a
`placement` — `bottom-end` (the default), `bottom-start`, `bottom-center`,
`top-end`, `top-start`, `top-center` — that holds at **every** width, and an
`inset` of CSS lengths that moves the stack off the window's edges. An
application with a sidebar keeps the notices over its content:

```tsx
<ToastPortal placement="bottom-end" inset={{ inlineStart: 'var(--app-sidebar-width)' }} />
```

`start` and `end` follow the writing direction. Until 2.2 the stack centred
its notices below 1025px whatever the application wanted.

**Which surfaces own the keyboard.** `hasOpenSurface()` is true while a
surface that takes the keyboard is open: a modal dialog (`Modal`, `Drawer`,
`BottomSheet`, `ConfirmDialog`, `PromptDialog`), the `CommandPalette`, an open
`Popover`. A visible toast and an open tooltip do **not** count: they still
close on `Escape` (newest first), but ⌘K and the application's shortcuts keep
working while they are on screen.

```ts
// An application shortcut (⌘S, ⌘N, F2…)
if (hasOpenSurface()) return;
// A page-level Escape listener: a toast or a tooltip takes that key first
if (event.defaultPrevented || hasOpenSurface({ includeTransient: true })) return;
```

**Opening focus.** `Modal`, `Drawer` and `Popover` focus, in this order, the
element of `initialFocus` (a ref inside the surface), the element marked
`data-ui-autofocus`, or the first focusable element (the close button skipped).
React's `autoFocus` does not work inside them: it runs before the dialog is
shown, and the browser ignores focus on a hidden element. In a `Modal` or a
`Drawer` a first text field keeps the focus on a desktop; only on a touch
screen does the dialog take it instead (no on-screen keyboard nobody asked
for; `BottomSheet` always does). Closing gives the focus back
to the element that opened the surface. A `Popover` gives its first focus once
it is placed (it is hidden until then), and Tab at either edge leaves it for a
real stop: past the last element to the one after the trigger, before the
first back to the trigger; it closes in both cases.

**Field heights.** `Combobox` takes `size="sm"`: at each size `Combobox`,
`Select` and `Input` are one height (40px and 32px). The placeholder of an
`isTechnical` input is drawn in the body font: it is an instruction, not code,
and in monospace it was cut short in a narrow scan field.

### Number fields: scaled integers (2.4)

`ScaledInput`, `MoneyInput`, `QuantityInput`, `RateInput` and `PercentInput`
take and give a **scaled integer**, never a float: the integer types of the
data contract. `123450` with two decimal places is "1.234,50".

| Field           | Value                    | Scale                        | At rest             |
| --------------- | ------------------------ | ---------------------------- | ------------------- |
| `MoneyInput`    | `Kurus` (the minor unit) | `minorDigits` (TRY 2, JPY 0) | "1.234,50 TL"       |
| `QuantityInput` | `Qty4`                   | 4; `unitDigits` may be typed | "2,5 kg"            |
| `RateInput`     | `Rate6`                  | 6                            | "34,1235"           |
| `PercentInput`  | `Pct2`                   | 2                            | "%12,5"             |
| `ScaledInput`   | any (`Price4`, `Ppm`)    | `scaleDigits`                | `minFractionDigits` |

```tsx
<Field label="Tutar" error={errors.amount}>
  {props => (
    <MoneyInput {...props} value={amount} onChange={setAmount} minorDigits={2} currency="TL" />
  )}
</Field>
<QuantityInput aria-label="Miktar" value={qty} onChange={setQty} unitDigits={3} unit="kg" />
<PercentInput aria-label="KDV" value={vat} onChange={setVat} />
```

- **`onChange` on every keystroke that changes the meaning**: the integer, or
  `null` while the field is empty or holds a number still being typed ("-",
  "1.250.0"). Left with such a text, the field keeps it and marks itself
  `aria-invalid`.
- **The grammar is the data contract's (§4.3)**: the comma is the
  decimal point; with a comma, dots only group by three; without one, "1.250"
  is a thousand two hundred and fifty, "0.250" and "12.5" are decimals (the dot
  key of a number pad). Spaces and signs around the number are dropped, so a
  pasted "1.234,56 TL" reads; a letter inside it does not.
- **A keystroke the field cannot hold is refused**, the text stays: a letter,
  one decimal too many (`unitDigits={0}` refuses the comma), a minus when `min`
  is 0 or more (the default), a value past `max` or past the safe integers.
  Nothing is rounded.
- **At rest grouped, while focused plain and selected** ("1234,50"), so typing
  replaces it. A value under a positive `min` is raised to it on blur or Enter.
- `Field`'s contract (`id`, `aria-invalid`, `aria-describedby`, `required`),
  `ref`, `size`, `prefix`/`suffix`, `disabled` and `readOnly` pass to the
  input. Right-aligned, tabular figures.
- The scale is never guessed: `minorDigits` comes from the caller's currency table,
  `unitDigits` from the unit. Display elsewhere is the application's
  formatters' (`formatMoney`, `formatQuantity` …); `Price` stays a
  display of an already formatted text.

### Parts portal components (3.1)

Dense data and ordering screens: every one is its own subpath
(`@handijitcom/ui/gallery`, `/tree-select`, `/notification-center`,
`/bulk-paste-input`, `/data-table-column-menu`) and works the same in Next and
Electron.

**`DataTable` data mode.** Pass `rows` and a `render` per column instead of
children; then, all opt-in:

```tsx
<DataTable
  label="Parçalar"
  columns={[
    { key: 'code', label: 'Kod', isAlwaysVisible: true, render: part => part.code },
    { key: 'name', label: 'Ad', render: part => part.name },
  ]}
  rows={parts}
  getRowKey={part => part.code}
  columnState={columns} // { order: string[]; hidden: string[] }, or uncontrolled
  onColumnStateChange={setColumns} // persist it per user
  columnMenu={<DataTableColumnMenu />} // visibility checkboxes + move up / down
  density="compact" // or 'comfortable' (default)
  onRowActivate={openPart} // ↑ ↓ Home End move, Enter (or a click) activates
  isVirtualized // only the rows in view; fixed `rowHeight` (36 / 48 px)
  hasViewportCap
/>
```

A virtualized table scrolls in its own box (`hasViewportCap`, or
`--ui-data-table-max-height`, 480px by default) with a sticky header; its rows
are `rowHeight` tall and its cells do not wrap. Children mode is unchanged and
ignores these props.

**`DataTableColumnMenu`** (`@handijitcom/ui/data-table-column-menu`) is the
column menu, a component of its own so that a table without one does not bundle
`Popover`, `Checkbox` and `IconButton` (`DataTable` alone 2.85 kB gzip, with the
menu 6.66 kB). Pass it as `columnMenu`; it is drawn in a toolbar above the
table and edits that table's `columnState`, controlled or not. Its texts come
from `UiLabels.dataTable` (`columns`, `moveUp`, `moveDown`) or its `labels`
prop. Outside a data-mode `DataTable` it draws nothing.

```tsx
import DataTable from '@handijitcom/ui/data-table';
import DataTableColumnMenu from '@handijitcom/ui/data-table-column-menu';

<DataTable
  columns={columns}
  rows={parts}
  columnMenu={<DataTableColumnMenu labels={{ columns: 'Görünüm' }} />}
/>;
```

**`Gallery`** — main image, thumbnails, a hover zoom under a mouse, a
full-screen view (← → Home End, Escape, swipe, click to zoom).
`renderImage` is the platform adapter; pass its `className` through:

```tsx
<Gallery
  label="Ürün görselleri"
  images={[{ src, alt: 'Fren balatası, ön', thumbnailSrc, width: 800, height: 800 }]}
  renderImage={({ src, alt, className, variant, width, height }) => (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      sizes={variant === 'thumbnail' ? '64px' : '(max-width: 768px) 100vw, 50vw'}
    />
  )}
/>
```

**`TreeSelect`** — an inline ARIA tree (put it in a `Popover` or a
`Drawer` for a dropdown): `isMultiple`, `value` / `onChange`, `expanded` /
`onExpandedChange` (optional), `hasSearch` (matches stay with their ancestors,
which open). Each node is selected on its own; what a parent's selection
means is the caller's.

**`NotificationCenter`** — bell with an unread badge and a panel grouped by
day (today, yesterday, then the date in `labels.locale`). Presentational:
`items`, `onItemSelect`, `onMarkRead`, `onMarkAllRead`, optional `isOpen` /
`onOpenChange`, `formatDay` / `formatTime`.

**`BulkPasteInput`** and **`parseBulkPaste(text, { defaultQuantity, isMergingDuplicates })`**
— rows `{ code, quantity, line }` and invalid lines `{ line, text, reason }`
from a spreadsheet copy (tabs), `;`, `,` or space separated lines, or one
code per line. Quantities follow the data contract's grammar ("1.250" is
1250, "2,00" is 2, "1,5" is refused). The parser is a plain function: on the
server import it from `@handijitcom/ui`, not from the client subpath.

### TypeScript resolution

The declarations resolve under every `moduleResolution`: `bundler`, `node16`
and `nodenext` (from ES modules and from CommonJS; the `require` condition has
`.d.cts` files). `npm run check:types` compiles a `nodenext` consumer against
the build with `skipLibCheck` off.

---

## Decisions the system carries

**Cobalt, coral, ink.** The palette is three colours plus red for danger:
cobalt is the primary action, the link, the selection, the focus ring and the
brand surface; coral is the conversion button (`UIVariant.ACCENT` on `Button`,
`variant="accent"` on `IconButton`) and appears nowhere else but the dot of the
brand mark and code strings; ink (`#091122`) and its lightness steps are every
neutral. There is no green, amber, violet, cyan or navy (3.0); a design test
fails on any other hue. A success is cobalt and a warning ink, each with its
icon and text. `colour-footprint.test.ts` turns a coral or brand-surface token
in any other component's stylesheet into a failing test.

**The brand surface (3.0).** `BrandSurface` is the cobalt surface of a hero, a
closing call, a sign-in side or a footer: `primary` with white on it, the same
in both themes, needing no edge on either page:

```tsx
import {
  BrandBlueprint,
  BrandSurface,
  Button,
  Eyebrow,
  StatStrip,
  UIVariant,
} from '@handijitcom/ui';
import { logos } from '@handijitcom/ui/design';

<BrandSurface
  aria-labelledby="cta-title"
  glow="both" // soft white sheens: 'start' · 'end' · 'both' (default) · 'none'
  dots="end" // the faded white dot grid: 'start' · 'end' (default) · 'both' · 'none'
  artwork={<BrandBlueprint shape={logos.mark} />} // decorative, from the tablet width up
  footer={<StatStrip variant="brand" items={[{ value: '2 saat', label: 'yanıt süresi' }]} />}
>
  <Eyebrow>Teklif</Eyebrow>
  <h2 id="cta-title">
    Projenizi konuşalım<span className="full-stop">.</span>{' '}
    {/* .full-stop: color var(--hd-accent) */}
  </h2>
  <Button variant={UIVariant.ACCENT}>Teklif alın</Button>
  <Button variant={UIVariant.ON_BRAND}>WhatsApp</Button>
</BrandSurface>;
```

- The gradient (cobalt into `brand-surface-deep`), sheens, dot grid and
  blueprint are **inline SVG**, `aria-hidden`, with ids from `useId`; nothing is
  a CSS gradient. The component renders on the server. In forced colours the
  imagery is dropped and the surface is a framed region.
- **Text on it is white only**: white on cobalt is 5.03:1, and white at 92% is
  already 4.50:1, so there is no secondary text colour; use size and weight.
  The white sheen stays at 6% so that white text over it is still 4.58:1.
- Inside it every focus ring is white: `BrandSurface` sets the `--ui-ring-color`
  hook that `$focus` reads. `Eyebrow` and the `ACCENT` button read the surface
  from `data-ui-brand-surface` (an application's own surface may carry it too).
- **Coral once per view as an action:** the surface's one action is the
  `ACCENT` button, which glows softly there (`brand-surface-accent-glow`) and
  nowhere else; coral on cobalt is 1.64:1, so its label (6.15:1) identifies it.
  A second action is `ON_BRAND`. The coral full stop and the mark's dot are the
  brand's punctuation. Opacity lives only in the surface's imagery.
- `StatStrip` (`page` or `brand`) is a list of value and label facts with thin
  dividers; `Eyebrow` is the mono capital label with its rules (`start` or
  `center`). The text is set in capitals by CSS, so give the page a `lang`.

**One `PRIMARY` per screen.** `UIVariant` is a hierarchy of emphasis: two
filled buttons side by side and neither stands out.

**Status is a tint, an action is a fill or a border.** `Alert` and the soft
`Badge` sit on tinted grounds; when that distinction blurs, users try to click
status labels.

**Colour never carries meaning alone** (WCAG 1.4.1). Every state is also told
by a text, an icon or a mark: each `Alert` tone has its own icon, the required
star of `Field` has a readable text next to it.

**Icons come from `react-bootstrap-icons`, in the filled version.** A thin
outline disappears on a tint at small sizes. Where no filled twin exists (`X`,
`Check`, `Plus`, `Dash`) the heavy `*Lg` version is used, and `Caret*Fill`
instead of a chevron. Content icons (a category mark, a logo) always come from
outside as a `ReactNode` prop.

**Icon size is separate from text size.** The scale is its own set of values
(`$icon-xs` … `$icon-xl`: 14/16/18/20/24px); every box that carries an icon
takes its size from there.

**"Could not load" and "empty" are different states.** `DataTable` never draws
the empty message while `error` is set.

**A native element beats an imitation.** `<dialog>`, `<input type="range">`,
`<input type="radio">` are kept. The one exception is `<select>`: its list
cannot be styled and its mobile wheel looks like nothing else in the
application.

**A touch target is at least 44×44px** (WCAG 2.5.8). The visual box may be
smaller; an invisible overlay keeps the area.

**Motion uses the design durations** (`fast` 120ms, `base` 200ms, `slow`
320ms for a sheet) and every animation honours `prefers-reduced-motion`.

**The focus ring is `:focus-visible`**, 2px of cobalt with a 2px offset.

---

## Next.js App Router

The package draws the `'use client'` boundary **inside itself, per file**:
components without hooks (`Alert`, `Badge`, `BrandSurface`, `Button`, `Card`, `Chip`,
`Divider`, `EmptyState`, `IconButton`, `Kbd`, `PageHeader`, `Panel`,
`Progress`, `SectionHeader`, `Skeleton`, `StatusDot`, `SummaryCard`,
`TextLink`, `Tile`) render as server components and send no JavaScript; the
interactive ones carry their own directive. No thin `Client*` wrappers are
needed, and `UIVariant` / `UISize` can be imported on the server.

```ts
// next.config.ts: the main entry is pure, so imports short-circuit to the component file.
const nextConfig = {
  experimental: { optimizePackageImports: ['@handijitcom/ui'] },
};
```

```tsx
// app/layout.tsx, a server component
import '@handijitcom/ui/tokens.css';
import '@handijitcom/ui/fonts.css';
import '@handijitcom/ui/styles.css';
import '@handijitcom/ui/chat.css'; // only if /chat is used
import '@handijitcom/ui/charts.css'; // only if /charts is used
import { UiProvider, UiThemeScript } from '@handijitcom/ui';
import NextLink from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <UiThemeScript />
      </head>
      <body>
        <UiProvider linkComponent={NextLink}>{children}</UiProvider>
      </body>
    </html>
  );
}
```

`suppressHydrationWarning`: the boot script adds an attribute to `<html>` that
the server did not write; the warning is silenced for that element only.

## Electron

The same three stylesheet imports in the renderer entry, and the boot script in
the HTML shell. With the usual strict policy of a packaged program, allow the
script by hash (`THEME_BOOT_SCRIPT_HASH`), and keep `style-src-attr
'unsafe-inline'` for the positioned components (and for `ToastPortal`'s
`inset`). With a mouse or a trackpad `Select` and `Combobox` open dropdowns
whatever the window width. A window with a sidebar gives `ToastPortal` an
`inset` (see "Notices, shortcuts and focus").

---

## Chat components: `@handijitcom/ui/chat`

A separate entry for chat and tool interfaces; it adds nothing to the main
bundle or to `styles.css`.

```tsx
import '@handijitcom/ui/styles.css';
import '@handijitcom/ui/chat.css'; // AFTER styles.css

import { ChatMessage, ChatThread, PromptInput } from '@handijitcom/ui/chat';

<ChatThread
  isStreaming={isStreaming}
  dock={
    <PromptInput
      value={draft}
      onChange={setDraft}
      onSubmit={send}
      onStop={stop}
      isBusy={isStreaming}
      placeholder="Mesajınızı yazın…"
    />
  }
>
  {messages.map(message => (
    <ChatMessage key={message.id} author={message.author}>
      {message.content}
    </ChatMessage>
  ))}
</ChatThread>;
```

Labels come from the same provider, under `labels.chat`:

```tsx
<UiProvider
  labels={{
    chat: {
      thread: 'Sohbet',
      send: 'Gönder',
      stop: 'Durdur',
      scrollToLatest: 'En yeniye in',
      replyReady: 'Yanıt hazır',
      messageActions: 'Mesaj eylemleri',
      sources: 'Kaynaklar',
      citation: index => `Kaynak ${index}`,
      stderr: 'hata çıktısı',
      toolStatus: { running: 'çalışıyor', ok: 'tamamlandı', error: 'hata', aborted: 'durduruldu', interrupted: 'kesildi' },
      codeCopy: language => `${language} kodunu kopyala`,
      codeCopied: 'Kod kopyalandı',
    },
  }}
>
```

`CodeBlock` highlights and formats the code itself, with no dependency:

```tsx
<CodeBlock language="json" code={JSON.stringify(payload)} />
```

JSON is re-indented with two spaces (values are kept as text: large numbers are
not rounded) and blank lines at the edges are dropped; other languages keep
their indentation. More than 30 languages are recognised; an unknown one is
drawn plain. The token colours are design tokens (keyword `primary-text`,
string and number `accent-text`, type `text` at medium weight), so they
follow the theme and stay inside the measured text pairs. For Shiki-grade
accuracy pass pre-highlighted HTML as `html` (its safety is yours).

Markdown parsing stays in the application: `Prose` is a typography container
only.

## Charts: `@handijitcom/ui/charts`

Ten SVG charts with no dependency (drawing, scales and statistics live in the
library).

```tsx
import '@handijitcom/ui/styles.css';
import '@handijitcom/ui/charts.css'; // AFTER styles.css

import { BarChart, LineChart, PieChart } from '@handijitcom/ui/charts';

<LineChart
  label="Aylık gelir ve gider"
  description="Gelir ekimde zirve yaptı"
  xKey="month"
  data={[
    { month: 'Oca', revenue: 120, cost: 90 },
    { month: 'Şub', revenue: 180, cost: null }, // null = no data: the line BREAKS
  ]}
  series={[
    { key: 'revenue', label: 'Gelir' },
    { key: 'cost', label: 'Gider', format: value => `${value} ₺` },
  ]}
/>;
```

| Chart                     | When                                                            |
| ------------------------- | --------------------------------------------------------------- |
| `LineChart` · `AreaChart` | a trend over time; `AreaChart isStacked` for parts of a total   |
| `BarChart`                | comparing categories; `orientation="horizontal"` for long names |
| `ComposedChart`           | bars and a line; a different unit on `axis: 'right'`            |
| `PieChart`                | at most six parts of a whole (`variant="donut"` by default)     |
| `ScatterPlot`             | the relation of two variables; a bubble with `size`             |
| `Heatmap`                 | density on two categorical axes (day × hour)                    |
| `BoxPlot` · `Histogram`   | distribution: comparing groups · the shape of one variable      |
| `RadarChart`              | a few series on one set of axes, all on the SAME scale          |

Every chart is a single tab stop: arrows walk the items (each is announced),
`Home` / `End` go to the ends, `Escape` clears the highlight. A screen reader
also reads the chart as a hidden **data table**. Width is measured from the
container (or fixed with `width`); numbers are formatted with `labels.locale`.
Colours come from the data series of the design (`tone`: `chart-1` … `chart-6`,
`muted`).

## Calendar: `@handijitcom/ui/calendar`

The base of a scheduling screen (2.4): a **time grid** (days as
columns, the drawn hours as rows; with `resources` a column per teacher, room
or technician under every day) or a **month** of day cells. A separate entry,
so the main entry's budget does not grow (5,9 kB gzip, `calendar.css` 2 kB).

```tsx
import '@handijitcom/ui/styles.css';
import '@handijitcom/ui/calendar.css'; // AFTER styles.css

import { Calendar, type CalendarEvent } from '@handijitcom/ui/calendar';

<Calendar
  label="Ders planı"
  days={week} // [{ date: '2026-11-09', label: 'Pazartesi 9 Kasım', shortLabel: 'Pzt 9', isToday, isOff }]
  resources={rooms} // optional: [{ id: 'r1', label: 'Derslik 1', detail: '7 / 8', tone: 'ink' }]
  bands={[{ label: 'Sabah', start: '08:00', end: '12:00' }]} // optional, 2.5
  events={lessons} // [{ id, title, start: '2026-11-09T09:00', end: '2026-11-09T10:30', resourceId, tone, isCancelled, isLocked }]
  startTime="08:00"
  endTime="22:00"
  slotMinutes={15}
  onEventChange={change => (conflicts(change) ? toast(why(change)) : save(change))}
  onEventOpen={id => openLesson(id)}
  onSlotSelect={slot => newLesson(slot)}
  onExternalDrop={({ data, start, resourceId }) => assign(data, start, resourceId)}
  renderEvent={lesson => `${lesson.title} · ${fill(lesson)}`}
/>;
```

- **Times are the data contract's wall clock** (`YYYY-MM-DDTHH:MM`, the firm's
  time zone) and **days come from the caller**: the calendar converts no time
  zone and does no day arithmetic (that is the caller's). The month takes
  its 35 or 42 `days` (`isOutside` for the neighbouring months), `weekdays`,
  `maxEventsPerDay` (3; the rest behind "+N" → `onDaySelect`) and
  `selectedDate`.
- **Controlled.** A drop, a stretch or a keyboard move calls `onEventChange`
  with `{ id, start, end, resourceId }`; the move stands when `events` carries
  it. A refused move (a conflict) is simply not applied: say why in a toast.
  Without `onEventChange` the calendar only shows and opens.
- **Pointer.** Drag the body to move (snapped to `slotMinutes`, into another
  column), the bottom edge to stretch; a preview shows where it lands, `Escape`
  gives up. A multi-day or `isLocked` event is drawn but not moved.
  `onExternalDrop` takes a drop from outside (an unassigned job), with its
  `text/plain` drag data.
- **Keyboard.** One event is in the tab order; ← ↑ → ↓ go to the neighbouring
  event, Enter opens it, ⌘/Ctrl + arrows move it one slot or one column (month:
  a day or a week), ⌘/Ctrl ⇧ ↑ ↓ shorten or lengthen it. The new place is
  announced (`labels.calendar.moved`) and the focus follows the event.
- **Resource headers and bands (2.5).** A resource's `detail` is a second
  header line and its `tone` tints the header (Teknik Servis: `ink` at 80%
  of the day's capacity — the percentage goes in `detail`, colour is never
  alone); `renderResource` draws the header instead. `bands` (`CalendarBand`:
  `{ label, start, end }`, `HH:MM`) draws named stretches of the day ("Sabah",
  "Öğle", "Akşam") as a labelled strip beside the hours and a shaded stretch
  across the columns, under the events; clipped to the drawn hours, they catch
  no click or drop. The band labels are visual only (the hours column is
  `aria-hidden`); every event's name already carries its time.
- **Colour is never alone**: `tone` tints an event; a cancelled one is struck
  through _and_ read as `labels.calendar.cancelled`; today is underlined and
  `aria-current="date"`.
- **Budgets of the pilots**, measured in jsdom (`__tests__/calendar/performance.test.tsx`):
  a week of 500 lessons draws in ~40–100 ms (budget 300 ms); a day of 20
  technicians and 200 jobs in ~16–30 ms (budget 500 ms). No virtualisation:
  the grid is bounded by its days and hours.
- Sizes are component variables: `--ui-calendar-hour-height` (3rem),
  `--ui-calendar-column-min` (7rem), `--ui-calendar-gutter` (3.5rem; 4.75rem
  with `bands`).

## SCSS API: `@handijitcom/ui/scss`

Variables and mixins for the application's own stylesheets. The variables are
`var(--hd-…)` references, so the theme turns at run time; the module emits no
rules.

```scss
@use '@handijitcom/ui/scss' as ui;

.panel {
  padding: ui.$space-4;
  border: 1px solid ui.$border;
  border-radius: ui.$radius-md;

  @include ui.type(small);
  @include ui.focus-ring;

  @media (max-width: ui.$breakpoint-md) {
    padding: ui.$space-3;
  }
}
```

**The values are custom properties, so SCSS arithmetic does not work.**
`$space-8 - $space-2` compiles to `var(--a)-var(--b)` without an error and the
browser drops the declaration. Write the calculation in `calc()`:

```scss
padding-inline-start: calc(#{ui.$space-8} - #{ui.$space-2});
margin-inline: calc(-1 * #{ui.$space-2});
```

Sass colour functions do not work either; mix in CSS:
`color-mix(in srgb, #{ui.$primary} 20%, transparent)`.

Next.js (Turbopack and webpack) resolves the package `exports`. For a compiler
that cannot, add `node_modules/@handijitcom/ui/build/scss` to `loadPaths` and
write `@use 'index' as ui`. An application that needs only the tokens can use
`@handijitcom/ui/tokens.scss` directly.

---

## Development

```bash
nvm use            # .nvmrc → 24
npm install
npm run verify     # contrast → typecheck → lint → coverage → build → types → API → animations → size
npm run playground # component gallery → http://localhost:5273
```

| Command                  |                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `npm run build`          | `build/`: main entry, `chat`, `charts` (ESM + CJS + `.d.ts` / `.d.cts` + CSS), `build/scss` |
| `npm run test`           | Jest + Testing Library + `jest-axe`                                                         |
| `npm run test:coverage`  | coverage gate over all of `src/`: lines 89 · statements 86 · functions 80 · branches 75     |
| `npm run check:contrast` | WCAG contrast of the pairs the components draw, both themes (254 pairs)                     |
| `npm run check:api`      | public API guard: four entries, four baselines (main 163 · chat 30 · charts 22 · SCSS 227)  |
| `npm run check:types`    | the built declarations as a `nodenext` consumer sees them, ESM and CJS, `skipLibCheck` off  |
| `npm run size`           | bundle budget (`size-limit`)                                                                |
| `npm run exports`        | writes the `exports` map of `package.json` (`check:exports` verifies; last step of `build`) |
| `npm run lint`           | ESLint (TypeScript) + stylelint (SCSS)                                                      |
| `npm run format:check`   | Prettier over `src`, `playground`, `__tests__`                                              |
| `npm run typecheck`      | `tsc --noEmit`                                                                              |
| `npm run test:visual`    | visual regression (Playwright); NOT part of `verify`, see below                             |
| `npm run test:device`    | iOS (WebKit) and Android (Chromium) behaviour guards                                        |

### What the guards protect

- **Design contract** (`__tests__/styles/design-contract.test.ts`): every
  `--hd-*` name in the compiled stylesheets, the SCSS aliases and the
  TypeScript sources exists in the tokens of `src/design`; breakpoints
  and layers match it; no stylesheet declares an `--hd-*` property or carries
  a literal colour.
- **Colour footprint** (`colour-footprint.test.ts`): coral and brand-surface
  tokens are used only by the components on a justified allow-list, and the
  removed roles (turquoise, success, warning, band, slate) cannot come back. A
  design test fails on any hue outside cobalt, coral and danger red.
- **Contrast**: text ≥ 4.5:1, icons and the focus ring ≥ 3:1, measured on the
  values of the installed design package for every pair a component draws.
- **Accessibility scan** (`__tests__/components/a11y.test.tsx`): every exported
  component in each meaningful state. A new component missing from the ledger
  fails the test.
- **Keyboard contract**: the key matrix is in each component's JSDoc; its guard
  is `keyboard.test.tsx`.
- **Control sizes** (`control-size.test.tsx`): `Input`, `DateField`,
  `DateRange` and `Select` take their size from one mixin, and a text field
  never drops below 16px on a narrow or touch screen.
- **Public API**: the exports of each entry are compared with a baseline. A
  dropped name is **breaking** and surfaces as a build error at the consumer's
  next install. For a deliberate change: `npm run build`, then
  `node scripts/check-api.mjs --update`, and a line in the CHANGELOG.
- **Bundle size**: budgets in `.size-limit.js` (whole main entry 53.5 kB,
  `styles.css` 26 kB gzip; per import, e.g. `DataTable` alone 3 kB, with
  `DataTableColumnMenu` 7 kB). When `size-limit` turns red, measure what was
  added before raising a limit.
- **Sub-entry boundary**: `chat` and `charts` import the main entry by PACKAGE
  NAME only (`subentry-boundary.test.ts`); a relative path would bundle a
  second copy of the provider context and the modal stack.
- **No fading with opacity**: any `opacity` other than `0` / `1` fails
  (`passive-opacity.test.ts`); a disabled state is drawn with tokens.
- **Focus ring and motion scale**: stylelint rejects `outline` outside the
  `focus-ring` mixin and raw durations in component SCSS.

### Device guards: `npm run test:device`

```bash
npm run test:device:install   # WebKit and Chromium binaries (once)
npm run test:device           # ios (iPhone 14 · WebKit) + android (Pixel 7 · Chromium)
```

The most expensive bugs of this repository were invisible on a desktop: a
collapsed sheet body, a bottom bar under the keyboard. They are layout and
paint bugs and can only be measured in a real layout engine. This run compares
numbers (height, overflow, focus, computed style), not pixels, so it needs no
reference files.

**Visual regression is not part of `verify`**: screenshots depend on the
platform (font rasterisation), and a reference made on macOS fails on the
ubuntu CI runner. References are stored per platform under
`__tests__/e2e/__screenshots__/{platform}/`.

> When refreshing references write `--update-snapshots=all`, not the bare
> flag: the bare flag writes only **missing** files and leaves mismatching ones
> in place while the run reports success.

### Releasing

Every push to `master` runs `.github/workflows/publish.yml`: it checks the formatting,
runs `npm run verify`, and publishes with the `NPM_ACCESS_TOKEN` repository
secret and npm provenance **when `package.json` carries a version that is not
on npm yet**; otherwise it skips. A published version gets a `vX.Y.Z` tag and a
GitHub Release whose notes are that version's section of `CHANGELOG.md`, so the
section must exist before the push.

## Design contract

Which element to use when, the surface ladder, colour roles, typography roles,
accessibility thresholds and the motion scale are in **`CLAUDE.md`**. That file
is normative for applications that use the library too. The visual language
itself (palette, type, logo) belongs to `@handijitcom/ui/design`.

<!-- handijit:about:start -->

## About Han Dijit

`@handijitcom/ui` is built and maintained by **[Han Dijit](https://www.handijit.com)**, a software company serving businesses across Türkiye: web, e-commerce, mobile, artificial intelligence, cyber security and enterprise software projects.

[www.handijit.com](https://www.handijit.com) · [All Han Dijit packages on npm](https://www.npmjs.com/org/handijitcom)
<!-- handijit:about:end -->

## License

MIT
