import { dateOf, MINUTES_PER_DAY, minutesOf } from './time';
import type { CalendarDay, CalendarEvent, CalendarResource } from './types';

/** One column of the time grid: a day, or a day of one resource. */
export type CalendarColumn = {
  index: number;
  day: CalendarDay;
  resource?: CalendarResource;
  /** What a screen reader hears for the column: "Salı 12 Kasım, Derslik 2". */
  label: string;
};

/** An event as drawn in one column (time grid) or one day cell (month). */
export type PlacedEvent = {
  /** `<id>@<column>`: a multi-day event is drawn once per day it covers. */
  key: string;
  event: CalendarEvent;
  column: number;
  /** The drawn stretch, clipped to the visible hours (time grid). */
  startMin: number;
  endMin: number;
  /** Side-by-side position among overlapping events: lane `lane` of `lanes`. */
  lane: number;
  lanes: number;
  /** Starts and ends on the same day inside the drawn hours, not locked: it can be moved. */
  isMovable: boolean;
};

const columnKey = (date: string, resourceId?: string) => `${date}|${resourceId ?? ''}`;

/** The columns, day by day; with resources, every resource of a day under that day. */
export const buildColumns = (
  days: readonly CalendarDay[],
  resources: readonly CalendarResource[] | undefined,
): CalendarColumn[] =>
  resources && resources.length > 0
    ? days.flatMap((day, dayIndex) =>
        resources.map((resource, resourceIndex) => ({
          index: dayIndex * resources.length + resourceIndex,
          day,
          resource,
          label: `${day.label}, ${resource.label}`,
        })),
      )
    : days.map((day, index) => ({ index, day, label: day.label }));

/** Does the event cover the day? Days compare as text: `YYYY-MM-DD` sorts in time. */
const covers = (event: CalendarEvent, date: string): boolean => {
  const startDate = dateOf(event.start);
  const endDate = dateOf(event.end);

  return startDate <= date && (date < endDate || (date === endDate && minutesOf(event.end) > 0));
};

const isSameDay = (event: CalendarEvent) => dateOf(event.start) === dateOf(event.end);

/**
 * Lanes: overlapping events share a column side by side. A cluster is a run of events that
 * overlap one another directly or through a neighbour; every member is as wide as the cluster has
 * lanes, and each takes the first lane that is free at its start.
 */
const assignLanes = (items: PlacedEvent[]): void => {
  items.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  let cluster: PlacedEvent[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -1;

  const close = () => {
    for (const item of cluster) item.lanes = laneEnds.length;
    cluster = [];
    laneEnds = [];
  };

  for (const item of items) {
    if (item.startMin >= clusterEnd) close();

    const free = laneEnds.findIndex(end => end <= item.startMin);
    item.lane = free === -1 ? laneEnds.length : free;
    /* A zero-length event still holds its lane for a minute: two at 09:00 sit side by side. */
    const laneEnd = Math.max(item.endMin, item.startMin + 1);
    laneEnds[item.lane] = laneEnd;
    clusterEnd = Math.max(clusterEnd, laneEnd);
    cluster.push(item);
  }

  close();
};

/**
 * Places the events in the time grid, column by column, clipped to `[rangeStart, rangeEnd)`.
 * With resources an event goes to its resource's column; one without a known resource is not
 * drawn (it belongs to the caller's pool of unassigned work).
 */
export const placeTimeEvents = (
  events: readonly CalendarEvent[],
  columns: readonly CalendarColumn[],
  rangeStart: number,
  rangeEnd: number,
  isEditable: boolean,
): PlacedEvent[][] => {
  const byKey = new Map(
    columns.map(column => [columnKey(column.day.date, column.resource?.id), column]),
  );
  const hasResources = columns.some(column => column.resource);
  const placed = columns.map((): PlacedEvent[] => []);

  const place = (event: CalendarEvent, column: CalendarColumn) => {
    const date = column.day.date;
    const start = dateOf(event.start) === date ? minutesOf(event.start) : 0;
    const end = dateOf(event.end) === date ? minutesOf(event.end) : MINUTES_PER_DAY;
    if (end <= rangeStart || start >= rangeEnd) return;

    placed[column.index].push({
      key: `${event.id}@${column.index}`,
      event,
      column: column.index,
      startMin: Math.max(start, rangeStart),
      endMin: Math.min(end, rangeEnd),
      lane: 0,
      lanes: 1,
      isMovable:
        isEditable && !event.isLocked && isSameDay(event) && start >= rangeStart && end <= rangeEnd,
    });
  };

  for (const event of events) {
    const resourceId = hasResources ? event.resourceId : undefined;
    if (hasResources && resourceId === undefined) continue;

    if (isSameDay(event)) {
      const column = byKey.get(columnKey(dateOf(event.start), resourceId));
      if (column) place(event, column);
      continue;
    }

    for (const column of columns)
      if (column.resource?.id === resourceId && covers(event, column.day.date))
        place(event, column);
  }

  for (const column of placed) assignLanes(column);

  return placed;
};

/** The events of every day cell of the month, in time order. */
export const placeMonthEvents = (
  events: readonly CalendarEvent[],
  days: readonly CalendarDay[],
  isEditable: boolean,
): PlacedEvent[][] => {
  const byDate = new Map(days.map((day, index) => [day.date, index]));
  const placed = days.map((): PlacedEvent[] => []);

  const place = (event: CalendarEvent, index: number) =>
    placed[index].push({
      key: `${event.id}@${index}`,
      event,
      column: index,
      startMin: minutesOf(event.start),
      endMin: minutesOf(event.end),
      lane: 0,
      lanes: 1,
      isMovable: isEditable && !event.isLocked && isSameDay(event),
    });

  for (const event of events) {
    if (isSameDay(event)) {
      const index = byDate.get(dateOf(event.start));
      if (index !== undefined) place(event, index);
      continue;
    }

    days.forEach((day, index) => {
      if (covers(event, day.date)) place(event, index);
    });
  }

  for (const cell of placed)
    cell.sort((a, b) =>
      a.event.start < b.event.start ? -1 : a.event.start > b.event.start ? 1 : 0,
    );

  return placed;
};
