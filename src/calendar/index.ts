/**
 * @handijit/ui/calendar — the calendar (2.4), the base of app-kit's `takvim` pattern. Every
 * exported name is a CONTRACT.
 *
 * ⚠ A separate entry for the main entry's size budget (`.size-limit.js`): the main entry stays
 * what a shop window downloads. Everything of the main entry is taken by the package name
 * (`@handijit/ui`); a relative path only reaches stateless helpers and SCSS. Guard:
 * `__tests__/subentry-boundary.test.ts`. Styles: `@handijit/ui/calendar.css`, imported AFTER
 * `styles.css`.
 */

export { default as Calendar } from './Calendar';
export type {
  CalendarBand,
  CalendarDay,
  CalendarEvent,
  CalendarEventChange,
  CalendarEventTone,
  CalendarResource,
  CalendarSlot,
} from './core/types';
export type { CalendarView } from './core/moves';
