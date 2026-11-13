import type { CalendarColumn, PlacedEvent } from './layout';
import { clamp, toWall } from './time';
import type { CalendarDay, CalendarEventChange } from './types';

export type CalendarView = 'time' | 'month';

/** Where a moved or resized event lands: a column (or day cell) and its minutes. */
export type CalendarTarget = { column: number; startMin: number; endMin: number };

export type MoveBounds = {
  view: CalendarView;
  columnCount: number;
  rangeStart: number;
  rangeEnd: number;
  slotMinutes: number;
};

/**
 * The target of moving (`resize: false`) or stretching an event by `deltaMinutes` into `column`.
 * The time grid keeps the event inside the drawn hours and at least one slot long; the month
 * keeps the time of day and refuses a day off the drawn grid (`undefined`).
 */
export const targetOf = (
  item: PlacedEvent,
  isResize: boolean,
  deltaMinutes: number,
  column: number,
  bounds: MoveBounds,
): CalendarTarget | undefined => {
  if (bounds.view === 'month')
    return column < 0 || column >= bounds.columnCount
      ? undefined
      : { column, startMin: item.startMin, endMin: item.endMin };

  if (isResize) {
    const shortest = Math.min(item.startMin + bounds.slotMinutes, bounds.rangeEnd);
    return {
      column: item.column,
      startMin: item.startMin,
      endMin: clamp(item.endMin + deltaMinutes, shortest, bounds.rangeEnd),
    };
  }

  const duration = item.endMin - item.startMin;
  const startMin = clamp(
    item.startMin + deltaMinutes,
    bounds.rangeStart,
    bounds.rangeEnd - duration,
  );

  return {
    column: clamp(column, 0, bounds.columnCount - 1),
    startMin,
    endMin: startMin + duration,
  };
};

/** The change a target means for the caller, or `undefined` when nothing moved. */
export const changeOf = (
  item: PlacedEvent,
  target: CalendarTarget,
  view: CalendarView,
  columns: readonly CalendarColumn[],
  days: readonly CalendarDay[],
): CalendarEventChange | undefined => {
  const isSame =
    target.column === item.column &&
    target.startMin === item.startMin &&
    target.endMin === item.endMin;
  if (isSame) return undefined;

  const column = view === 'time' ? columns[target.column] : undefined;
  const date = column ? column.day.date : days[target.column].date;

  return {
    id: item.event.id,
    start: toWall(date, target.startMin),
    end: toWall(date, target.endMin),
    resourceId: column?.resource?.id ?? item.event.resourceId,
  };
};

export type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

export const isArrowKey = (key: string): key is ArrowKey =>
  key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight';

/**
 * The event an arrow key moves the focus to: ↑ ↓ the previous and next in the same column (or
 * day), ← → the nearest in time in the closest column that has one.
 */
export const neighbourOf = (
  lists: readonly (readonly PlacedEvent[])[],
  from: PlacedEvent,
  key: ArrowKey,
): PlacedEvent | undefined => {
  if (key === 'ArrowUp' || key === 'ArrowDown') {
    const list = lists[from.column];
    const index = list.findIndex(item => item.key === from.key);

    return list[index + (key === 'ArrowDown' ? 1 : -1)];
  }

  const step = key === 'ArrowRight' ? 1 : -1;
  for (let column = from.column + step; column >= 0 && column < lists.length; column += step) {
    const list = lists[column];
    if (list.length === 0) continue;

    return list.reduce((best, item) =>
      Math.abs(item.startMin - from.startMin) < Math.abs(best.startMin - from.startMin)
        ? item
        : best,
    );
  }

  return undefined;
};

/**
 * The keyboard move of a focused event — ⌘/Ctrl with an arrow: ↑ ↓ one slot earlier or later
 * (month: a week), ← → the previous or next column (month: a day). ⌘/Ctrl ⇧ ↑ ↓ shortens or
 * lengthens it by one slot (time grid only).
 */
export const keyboardTarget = (
  item: PlacedEvent,
  key: ArrowKey,
  isResize: boolean,
  bounds: MoveBounds,
): CalendarTarget | undefined => {
  const isVertical = key === 'ArrowUp' || key === 'ArrowDown';
  const direction = key === 'ArrowDown' || key === 'ArrowRight' ? 1 : -1;

  if (bounds.view === 'month') {
    if (isResize) return undefined;
    return targetOf(item, false, 0, item.column + direction * (isVertical ? 7 : 1), bounds);
  }

  if (isResize && !isVertical) return undefined;

  return isVertical
    ? targetOf(item, isResize, direction * bounds.slotMinutes, item.column, bounds)
    : targetOf(item, false, 0, item.column + direction, bounds);
};
