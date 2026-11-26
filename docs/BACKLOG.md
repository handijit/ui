# Backlog

Low-severity findings that do not block a release (wrong behaviour, data loss, security, the data
contract, an accessibility gate, a pilot-required API or a breaking change would). Each line says
where it was found and what would close it.

## 2.4 — scaled number fields and the calendar

- **The typed-number grammar lives twice.** `helpers/scaled-number.helper.ts` follows the data
  contract's grammar (§4.3); an application that reads imported numbers keeps its own copy.
  Pinned by the vectors in `__tests__/helpers/scaled-number.helper.test.ts`. Closes when the
  grammar moves to a package under both (for example `@handijitcom/utils`) and both call it.
- **`ScaledInput`: the caret goes to the end** when a keystroke is refused or a pasted text is
  cleaned (the controlled value is written back). Closes with a caret restore in a layout effect.
- **`Calendar`: no edge auto-scroll while dragging.** An event dragged towards the bottom of a
  scrolled time grid stops at the visible edge; the keyboard move (⌘ ↓) reaches every hour.
- **`Calendar`: no "now" line and no all-day row.** The "not asked by the pilots" reason was
  wrong: Ön Muhasebe's Vade Takvimi (EKRAN_OZETI §3.9) asks for day, week and month views, and its
  due items carry only a date. In the time grid a zero-length item at `T00:00` is never drawn in
  the day or the week (it is before the default `startTime` of 08:00, and an all-day row does not
  exist). Until an all-day row lands, the pattern builds them on the month view: **week** = the
  month view with the week's seven `days` (one row of cells, `maxEventsPerDay` raised); **day** =
  the month view with that week, the day as `selectedDate`, and the day's list with its total
  beside the calendar (the brief's right pane), which already holds every item of that day. Closes
  with an all-day row on top of the time grid (events whose `start` and `end` are `T00:00` of a
  day), drawn and reached with the keyboard like the month's cells.
- **`Calendar`: a multi-day event is drawn but never moved**, in both views (moving it needs day
  arithmetic, which belongs to the caller). Closes when a pilot asks: the caller would pass the
  new end.
- **Visual baselines.** The playground has scenarios for the six new components; the Playwright
  baselines (`npm run test:visual`, outside `verify`) are not redrawn yet.
- **`readScaledText` throws on an infinite `min` or `max`.** With `min={-Infinity}` or
  `max={Infinity}`, `BigInt(Math.trunc(±Infinity))` in the change handler throws a `RangeError`
  (seen in a probe). Closes by guarding with `Number.isFinite` (an infinite bound is no bound) or
  clamping it to `Number.MAX_SAFE_INTEGER`, with a test for both signs.
- **Mutation testing: 42 of 48 mutants killed.** Two survivors are equivalent (`Number(signed) + 0`
  in the helper, `resourceId === undefined` in the layout). Four need boundary tests: (1)
  `layout.ts` `isMovable` without `end <= rangeEnd` breaks no test — the code is right, but an
  event running past the drawn hours made movable would shrink to its clipped length; (2) the
  boundary comparisons `end <= rangeStart || start >= rangeEnd`, `startMin >= clusterEnd` at the
  close of a cluster, and `minutesOf(end) > 0` in `covers()` (the last one is a multi-day event
  ending at midnight in the month view); (3) `useCalendarDrag` without `button !== 0` lets a
  right click start a drag and breaks no test; (4) `Math.min(minFractionDigits, scaleDigits)` in
  `formatScaledValue`. Closes with a test for each.
- **`Calendar` always asks for `Calendar.cancelled`.** An application with no cancelled event still
  gets the "missing text" warning (seen in an SSR run of the tarball). Closes by resolving the label
  only when an event is cancelled (or lazily in `EventBlock`).
- **Keyboard ways the application must give.** In the month view without `onDaySelect` the "+N" is
  plain text: the day's hidden events are reached neither with the keyboard nor the pointer. A
  click on an empty slot (`onSlotSelect`) and a drop from outside (`onExternalDrop`) are pointer
  only inside the calendar; the keyboard way (a "new" button, an "assign" menu on a pool row) is
  the application's. Neither the README nor the JSDoc says so plainly. Closes by saying it in both
  (and by making "+N" a button that focuses the first hidden event when `onDaySelect` is absent).
- **Touch targets under 44 px.** A short event and the day button of a month cell are smaller than
  the 44 px target (DESIGN_SYSTEM §4). The exception is documented in `CLAUDE.md` and every action
  has a keyboard way; the visual baselines (above) are not redrawn yet.
- **Checked in the 2.4 round (no action):** `npm run verify` green, 90 suites, 1353/1353 tests;
  sizes in budget (main entry; `calendar` 5.94 / 7 kB, `calendar.css` 2.07 / 2.5 kB, `MoneyInput`
  2.01 / 2.5 kB); program-tools `verify contract` 11/11 GREEN; the API surface only added to; the
  2.4.0 tarball in a scratch copy of handijit-frontend: vitest 79 files, 721/721 tests, `tsc` 0
  errors. The typed-number grammar is the data contract's; the one difference — an
  extra decimal place typed is refused, not rounded — is documented. Tree clean at `a409561`.
