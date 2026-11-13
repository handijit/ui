/**
 * The data the calendar draws (2.4). Every time is the data contract's (§5.1) local wall clock,
 * `YYYY-MM-DDTHH:MM` in the firm's time zone, and every day a calendar day `YYYY-MM-DD`: the
 * calendar never converts a time zone and never does day arithmetic — the days to draw come from
 * the caller, who has `@handijit/tr` for that.
 */

/** The tone of an event — a tint of the design's status colours. Never the only signal. */
export type CalendarEventTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export type CalendarEvent = {
  id: string;
  title: string;
  /** Local wall clock, `YYYY-MM-DDTHH:MM`. */
  start: string;
  /** Local wall clock, exclusive. An event that ends on a later day is drawn but not moved. */
  end: string;
  /** The column it belongs to when the calendar has resources. */
  resourceId?: string;
  tone?: CalendarEventTone;
  /** Drawn struck through with the "cancelled" text read before it. */
  isCancelled?: boolean;
  /** Not moved or resized (a past lesson, a closed job); still opened. */
  isLocked?: boolean;
};

export type CalendarDay = {
  /** `YYYY-MM-DD`. */
  date: string;
  /** The full name of the day, read by a screen reader ("Salı 12 Kasım"). */
  label: string;
  /** What the header shows when it is shorter than `label` ("Sal 12", "12"). */
  shortLabel?: string;
  /** Today: `aria-current="date"` and a marked header. */
  isToday?: boolean;
  /** A day off (weekend, public holiday): a shaded column. */
  isOff?: boolean;
  /** Month view: a day of the neighbouring month, drawn quieter. */
  isOutside?: boolean;
};

export type CalendarResource = {
  id: string;
  /** The column header ("Ali Yılmaz", "Derslik 2"). */
  label: string;
};

/** Where an event goes: a drop, a resize, a keyboard move. The caller decides whether it may. */
export type CalendarEventChange = {
  id: string;
  start: string;
  end: string;
  resourceId?: string;
};

/** An empty stretch of a column: a click on it, or something dropped on it from outside. */
export type CalendarSlot = {
  start: string;
  end: string;
  resourceId?: string;
};
