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
  /** A second header line under the label ("6 / 8 iş", "%85 dolu") (2.5). */
  detail?: string;
  /**
   * Tints the column header (2.5): a technician at 80% of the day's capacity is `warning`. Never
   * the only signal — say why in `detail` (or in `renderResource`).
   */
  tone?: CalendarEventTone;
};

/**
 * A named stretch of the drawn hours (2.5): "Sabah 08:00–12:00", "Öğle", "Akşam". Drawn as a
 * labelled band beside the hours and a shaded stretch across the columns, under the events; it
 * catches no click, so a slot under it is still selected and dropped on.
 */
export type CalendarBand = {
  /** The band's name, shown beside the hours ("Sabah"). */
  label: string;
  /** `HH:MM`; clipped to the drawn hours. */
  start: string;
  /** `HH:MM`, exclusive; clipped to the drawn hours. */
  end: string;
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
