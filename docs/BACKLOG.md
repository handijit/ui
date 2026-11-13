# Backlog

Low-severity findings that do not block a release (wrong behaviour, data loss, security, the data
contract, an accessibility gate, a pilot-required API or a breaking change would). Each line says
where it was found and what would close it.

## 2.4 — scaled number fields and the calendar

- **The typed-number grammar lives twice.** `helpers/scaled-number.helper.ts` mirrors app-kit's
  `parseDecimal` (data contract §4.3) because `ui` cannot import app-kit or `@handijit/decimal`.
  Pinned by app-kit's vectors in `__tests__/helpers/scaled-number.helper.test.ts`. Closes when the
  grammar moves to a package under both (for example `@handijit/utils`) and both call it.
- **`ScaledInput`: the caret goes to the end** when a keystroke is refused or a pasted text is
  cleaned (the controlled value is written back). Closes with a caret restore in a layout effect.
- **`Calendar`: no edge auto-scroll while dragging.** An event dragged towards the bottom of a
  scrolled time grid stops at the visible edge; the keyboard move (⌘ ↓) reaches every hour.
- **`Calendar`: no "now" line and no all-day row.** Not asked by the pilots' briefs; a due day of
  the month view is an event at `T00:00`.
- **`Calendar`: a multi-day event is drawn but never moved**, in both views (moving it needs day
  arithmetic, which belongs to `@handijit/tr`). Closes when a pilot asks: the caller would pass the
  new end.
- **Visual baselines.** The playground has scenarios for the six new components; the Playwright
  baselines (`npm run test:visual`, outside `verify`) are not redrawn yet.
