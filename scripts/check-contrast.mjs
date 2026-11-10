/**
 * CONTRAST GATE — `npm run check:contrast`, part of `verify`.
 *
 * The library owns no colour: every value comes from `@handijit/design`, which gates its own
 * palette. What the design package cannot know is WHICH TOKEN THIS LIBRARY PUTS ON WHICH — a
 * caption in a well, a syntax colour on a code block, white on a hover fill. Those pairings are
 * decisions made in the component styles, and this file is the list of them, measured against the
 * values of the installed design package in both themes.
 *
 * Text ≥ 4.5:1 (WCAG 1.4.3) · focus ring and state-carrying graphics ≥ 3:1 (WCAG 1.4.11).
 * A pairing a component starts to use is ADDED here; a failing pairing is fixed in the component
 * (pick another token), never by writing a one-off colour.
 */
import { contrast, scales, themes } from '@handijit/design';

const THRESHOLD = { text: 4.5, graphic: 3 };

/** Everything a component can sit on. */
const SURFACES = ['bg-page', 'bg-surface', 'bg-raised', 'bg-inset', 'bg-overlay'];

/**
 * What a form control can sit on: every surface, plus the passive fill a neighbouring control
 * shows. The resting edge of a field, a checkbox, a radio and the off track of a switch are drawn
 * with `border-control`, the only thing that marks an EMPTY control (WCAG 1.4.11).
 */
const CONTROL_SURFACES = [...SURFACES, 'bg-disabled'];

/** Where the default focus ring is drawn — every surface but the well. */
const GRAPHIC_SURFACES = ['bg-page', 'bg-surface', 'bg-raised', 'bg-overlay'];

/** The surfaces a caption (`text-3`) is allowed on — NOT the well (`bg-inset`), see below. */
const CAPTION_SURFACES = ['bg-page', 'bg-surface', 'bg-raised', 'bg-overlay'];

const STATUSES = ['success', 'warning', 'danger', 'info'];

/** The fixed dark surface (`$inverse-*`): terminal output and the code badge, same in both themes. */
const INVERSE = {
  'inverse-bg': scales.slate[900],
  'inverse-bg-2': scales.slate[800],
  'inverse-text': scales.slate[50],
  'inverse-text-2': scales.slate[300],
  'inverse-danger': scales.danger[300],
};

const buildPairs = () => {
  const pairs = [];
  const add = (fg, bg, tier = 'text') => pairs.push({ fg, bg, tier });

  // --- Body text ---
  for (const surface of SURFACES) {
    add('text', surface);
    add('text-2', surface);
  }
  /*
   * `text-3` is 4.35:1 on the light well. Component styles use `text-2` inside `bg-inset`
   * (code blocks, segmented tracks, input adornments); the pair is deliberately absent here.
   */
  for (const surface of CAPTION_SURFACES) add('text-3', surface);

  // --- Text on a fill: every interaction state is its own pair ---
  for (const fill of ['primary', 'primary-hover', 'primary-active']) add('on-primary', fill);
  for (const fill of ['accent', 'accent-hover', 'accent-active']) add('on-accent', fill);
  add('on-highlight', 'highlight');
  for (const status of STATUSES) add(`${status}-on-solid`, `${status}-solid`);

  // --- Cobalt text: links, ghost and outline buttons, the selected option ---
  for (const surface of [...SURFACES, 'primary-soft', 'primary-soft-hover'])
    add('primary-text', surface);
  add('text', 'primary-soft');
  add('text', 'primary-soft-hover');
  add('text', 'selection-bg');

  // --- Status tints, and status text straight on a surface (field errors, diff lines) ---
  for (const status of STATUSES) {
    add(`${status}-fg`, `${status}-bg`);
    for (const surface of SURFACES) add(`${status}-fg`, surface);
  }
  add('highlight-text', 'highlight-soft');
  for (const surface of SURFACES) add('highlight-text', surface);

  // --- Brand band ---
  for (const fill of ['band-bg', 'band-deep']) {
    add('band-text', fill);
    add('band-text-2', fill);
  }

  // --- Fixed dark surface ---
  for (const fill of ['inverse-bg', 'inverse-bg-2']) {
    add('inverse-text', fill);
    add('inverse-text-2', fill);
    add('inverse-danger', fill);
  }

  // --- Focus ring (1.4.11) ---
  /*
   * `focus` is 2.95:1 on the light well, so a control that sits IN a well (a segment of a
   * segmented control, the copy button of a code block) draws its ring with `$focus-inset`
   * (`primary-text`) instead. Both halves are gated: the ring everywhere else, the stronger ring
   * in the well.
   */
  for (const surface of GRAPHIC_SURFACES) add('focus', surface, 'graphic');
  add('primary-text', 'bg-inset', 'graphic');

  // --- The boundary of a form control at rest (1.4.11) ---
  for (const surface of CONTROL_SURFACES) add('border-control', surface, 'graphic');
  /* The thumb of an OFF switch on its track. */
  add('bg-surface', 'border-control', 'graphic');

  // --- Fills that carry a state on their own: checkbox, switch, radio, progress, slider ---
  /*
   * `bg-overlay` is absent on purpose: the cobalt and red fills are 2.7–2.85:1 on the dark overlay
   * surface (the design package gates them on page, surface and raised only). On a menu or a dialog
   * a filled control is never the only carrier — the glyph inside it is measured above as text on
   * a fill. The numbers are printed in the advisory list.
   */
  for (const surface of ['bg-page', 'bg-surface', 'bg-raised', 'bg-inset']) {
    add('primary', surface, 'graphic');
    for (const status of STATUSES) add(`${status}-solid`, surface, 'graphic');
  }
  for (const surface of ['bg-page', 'bg-surface', 'bg-raised'])
    for (const index of [1, 2, 3, 4, 5, 6]) add(`chart-${index}`, surface, 'graphic');
  /* The ring of a button that sits on the band. */
  add('band-text', 'band-bg', 'graphic');
  add('band-line-strong', 'band-bg', 'graphic');

  return pairs;
};

/** Measured and printed with UI_CONTRAST_VERBOSE=1, never failing — WCAG exempts these. */
const buildAdvisoryPairs = () => {
  const pairs = [];
  const add = (fg, bg) => pairs.push({ fg, bg, tier: 'advisory' });

  /* Disabled controls are exempt from 1.4.3; the number is kept visible, not gated. */
  add('text-disabled', 'bg-disabled');
  add('text-disabled', 'bg-surface');
  add('text-3', 'bg-inset');
  add('focus', 'bg-inset');
  for (const fill of ['primary', 'danger-solid', 'info-solid']) add(fill, 'bg-overlay');
  /* Turquoise is a tint and a text colour here, never a state on its own. */
  add('highlight', 'bg-surface');
  for (const surface of ['bg-page', 'bg-surface', 'bg-raised']) {
    add('border', surface);
    add('border-strong', surface);
  }
  for (const status of STATUSES) add(`${status}-line`, `${status}-bg`);
  for (const fill of ['primary', 'accent', 'danger-solid']) add(fill, 'bg-page');

  return pairs;
};

const measure = (theme, pairs) =>
  pairs.map(pair => {
    const foreground = theme[pair.fg];
    const background = theme[pair.bg];

    if (!foreground || !background)
      throw new Error(`ui: unknown token in the contrast list: ${pair.fg} / ${pair.bg}`);

    const ratio = Math.round(contrast(foreground, background) * 100) / 100;
    const required = THRESHOLD[pair.tier] ?? 0;

    return { ...pair, ratio, required, isFailing: pair.tier !== 'advisory' && ratio < required };
  });

const format = row =>
  `${row.isFailing ? '✗' : '·'} ${row.ratio.toFixed(2).padStart(6)}:1 ` +
  `(≥${row.required || '—'})  ${row.fg} / ${row.bg}`;

const pairs = buildPairs();
const advisory = buildAdvisoryPairs();
const failures = [];

for (const name of ['light', 'dark']) {
  const theme = { ...themes[name], ...INVERSE };
  const rows = measure(theme, pairs);
  const failed = rows.filter(row => row.isFailing);
  failures.push(...failed);

  console.log(`\n${name.toUpperCase()} — ${rows.length} pairs, ${failed.length} failing`);
  for (const row of failed) console.log(`  ${format(row)}`);

  if (process.env.UI_CONTRAST_VERBOSE) {
    for (const row of rows) console.log(`  ${format(row)}`);
    console.log(`  — advisory (never fails) —`);
    for (const row of measure(theme, advisory)) console.log(`  ${format(row)}`);
  }
}

if (failures.length > 0) {
  console.error(
    `\nui: ${failures.length} contrast failure(s). The colours belong to @handijit/design; fix the` +
      ` PAIRING in the component style (another token for the text or the surface).\n`,
  );
  process.exit(1);
}

console.log(
  `\nui: ${pairs.length * 2} contrast pairs clean` +
    ` (text ≥${THRESHOLD.text}:1, focus and graphics ≥${THRESHOLD.graphic}:1).` +
    ` Every number: UI_CONTRAST_VERBOSE=1\n`,
);
