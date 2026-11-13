/**
 * Minutes of a day and the wall-clock text around them — string work only. Day arithmetic (adding
 * a day, the weekday of a date) is NOT here: it belongs to `@handijit/tr` and the caller passes
 * the days already computed.
 */

export const MINUTES_PER_DAY = 1440;

/** "09:30" → 570. */
export const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':') as [string, string?];

  return Number(hours) * 60 + Number(minutes ?? 0);
};

/** 570 → "09:30". */
export const toTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** "2026-11-12T09:30" → "2026-11-12". */
export const dateOf = (wall: string): string => wall.slice(0, 10);

/** "2026-11-12T09:30" → 570. */
export const minutesOf = (wall: string): number => toMinutes(wall.slice(11, 16));

/** ("2026-11-12", 570) → "2026-11-12T09:30". */
export const toWall = (date: string, minutes: number): string => `${date}T${toTime(minutes)}`;

/** The time range an event or a segment covers, as it is read: "09:30–11:00". */
export const timeRange = (start: number, end: number): string => `${toTime(start)}–${toTime(end)}`;

export const clamp = (value: number, low: number, high: number): number =>
  Math.min(Math.max(value, low), high);
