import { buildColumns, placeMonthEvents, placeTimeEvents } from '@/calendar/core/layout';
import {
  changeOf,
  isArrowKey,
  keyboardTarget,
  type MoveBounds,
  neighbourOf,
  targetOf,
} from '@/calendar/core/moves';
import { minutesOf, timeRange, toMinutes, toTime, toWall } from '@/calendar/core/time';
import type { CalendarDay, CalendarEvent } from '@/calendar/core/types';

const day = (date: string): CalendarDay => ({ date, label: date });
const DAYS = [day('2026-11-09'), day('2026-11-10'), day('2026-11-11')];
const ROOMS = [
  { id: 'r1', label: 'Derslik 1' },
  { id: 'r2', label: 'Derslik 2' },
];

const event = (id: string, start: string, end: string, extra: Partial<CalendarEvent> = {}) => ({
  id,
  title: id,
  start,
  end,
  ...extra,
});

const TIME: MoveBounds = {
  view: 'time',
  columnCount: 3,
  rangeStart: 8 * 60,
  rangeEnd: 20 * 60,
  slotMinutes: 30,
};

describe('time', () => {
  it('turns wall clock text into minutes and back', () => {
    expect(toMinutes('09:30')).toBe(570);
    expect(toMinutes('9')).toBe(540);
    expect(toMinutes('')).toBe(0);
    expect(toTime(570)).toBe('09:30');
    expect(toTime(1440)).toBe('24:00');
    expect(minutesOf('2026-11-12T14:05')).toBe(845);
    expect(toWall('2026-11-12', 845)).toBe('2026-11-12T14:05');
    expect(timeRange(570, 660)).toBe('09:30–11:00');
  });
});

describe('buildColumns', () => {
  it('a column per day, or per resource under every day', () => {
    expect(buildColumns(DAYS, undefined).map(column => column.label)).toEqual([
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
    ]);
    expect(buildColumns(DAYS, []).length).toBe(3);

    const columns = buildColumns(DAYS.slice(0, 2), ROOMS);
    expect(columns.map(column => [column.index, column.label])).toEqual([
      [0, '2026-11-09, Derslik 1'],
      [1, '2026-11-09, Derslik 2'],
      [2, '2026-11-10, Derslik 1'],
      [3, '2026-11-10, Derslik 2'],
    ]);
  });
});

describe('placeTimeEvents', () => {
  const columns = buildColumns(DAYS, undefined);

  it('places an event in its day, clipped to the drawn hours', () => {
    const [first, second] = placeTimeEvents(
      [
        event('a', '2026-11-09T09:00', '2026-11-09T10:30'),
        event('early', '2026-11-10T07:00', '2026-11-10T09:00'),
        event('before', '2026-11-10T06:00', '2026-11-10T07:30'),
        event('elsewhere', '2026-11-20T09:00', '2026-11-20T10:00'),
      ],
      columns,
      TIME.rangeStart,
      TIME.rangeEnd,
      true,
    );

    expect(first).toEqual([
      expect.objectContaining({ key: 'a@0', startMin: 540, endMin: 630, isMovable: true }),
    ]);
    /* Partly before the drawn hours: drawn from 08:00, not moved (its start is not on screen). */
    expect(second).toEqual([
      expect.objectContaining({ key: 'early@1', startMin: 480, endMin: 540, isMovable: false }),
    ]);
  });

  it('nothing moves without a change handler, nor a locked event', () => {
    const [list] = placeTimeEvents(
      [
        event('a', '2026-11-09T09:00', '2026-11-09T10:00'),
        event('b', '2026-11-09T11:00', '2026-11-09T12:00', { isLocked: true }),
      ],
      columns,
      TIME.rangeStart,
      TIME.rangeEnd,
      false,
    );
    expect(list.map(item => item.isMovable)).toEqual([false, false]);

    const [locked] = placeTimeEvents(
      [event('b', '2026-11-09T11:00', '2026-11-09T12:00', { isLocked: true })],
      columns,
      TIME.rangeStart,
      TIME.rangeEnd,
      true,
    );
    expect(locked[0]?.isMovable).toBe(false);
  });

  it('a multi-day event is drawn in every day it covers and never moved', () => {
    const placed = placeTimeEvents(
      [
        event('trip', '2026-11-09T18:00', '2026-11-11T10:00'),
        event('night', '2026-11-10T19:00', '2026-11-11T00:00'),
      ],
      columns,
      TIME.rangeStart,
      TIME.rangeEnd,
      true,
    );

    expect(placed.map(list => list.map(item => [item.key, item.startMin, item.endMin]))).toEqual([
      [['trip@0', 1080, 1200]],
      [
        ['trip@1', 480, 1200],
        ['night@1', 1140, 1200],
      ],
      [['trip@2', 480, 600]],
    ]);
    expect(placed.flat().every(item => !item.isMovable)).toBe(true);
  });

  it('with resources an event goes to its resource; one without a resource is not drawn', () => {
    const withRooms = buildColumns(DAYS.slice(0, 1), ROOMS);
    const placed = placeTimeEvents(
      [
        event('a', '2026-11-09T09:00', '2026-11-09T10:00', { resourceId: 'r2' }),
        event('pool', '2026-11-09T09:00', '2026-11-09T10:00'),
        event('gone', '2026-11-09T09:00', '2026-11-09T10:00', { resourceId: 'r9' }),
        event('long', '2026-11-08T09:00', '2026-11-09T09:00', { resourceId: 'r1' }),
      ],
      withRooms,
      TIME.rangeStart,
      TIME.rangeEnd,
      true,
    );

    expect(placed.map(list => list.map(item => item.key))).toEqual([['long@0'], ['a@1']]);
  });

  it('overlapping events share the column in lanes; a free lane is taken again', () => {
    const [list] = placeTimeEvents(
      [
        event('a', '2026-11-09T09:00', '2026-11-09T11:00'),
        event('b', '2026-11-09T09:30', '2026-11-09T10:00'),
        event('c', '2026-11-09T10:00', '2026-11-09T10:30'),
        event('d', '2026-11-09T12:00', '2026-11-09T13:00'),
        event('zero', '2026-11-09T14:00', '2026-11-09T14:00'),
        event('zero2', '2026-11-09T14:00', '2026-11-09T14:00'),
      ],
      columns,
      TIME.rangeStart,
      TIME.rangeEnd,
      true,
    );

    expect(list.map(item => [item.event.id, item.lane, item.lanes])).toEqual([
      ['a', 0, 2],
      ['b', 1, 2],
      ['c', 1, 2],
      ['d', 0, 1],
      ['zero', 0, 2],
      ['zero2', 1, 2],
    ]);
  });
});

describe('placeMonthEvents', () => {
  it('lists the events of each day in time order; a multi-day one in every day, not movable', () => {
    const placed = placeMonthEvents(
      [
        event('late', '2026-11-09T15:00', '2026-11-09T16:00'),
        event('early', '2026-11-09T09:00', '2026-11-09T10:00'),
        event('same', '2026-11-09T09:00', '2026-11-09T09:30'),
        event('span', '2026-11-10T09:00', '2026-11-11T09:00'),
        event('lock', '2026-11-11T09:00', '2026-11-11T10:00', { isLocked: true }),
        event('away', '2026-12-01T09:00', '2026-12-01T10:00'),
      ],
      DAYS,
      true,
    );

    expect(placed.map(list => list.map(item => item.key))).toEqual([
      ['early@0', 'same@0', 'late@0'],
      ['span@1'],
      ['span@2', 'lock@2'],
    ]);
    expect(placed.flat().map(item => item.isMovable)).toEqual([
      true,
      true,
      true,
      false,
      false,
      false,
    ]);
  });
});

describe('targetOf and changeOf', () => {
  const columns = buildColumns(DAYS, undefined);
  const [[item]] = placeTimeEvents(
    [event('a', '2026-11-09T09:00', '2026-11-09T10:00', { resourceId: 'x' })],
    columns,
    TIME.rangeStart,
    TIME.rangeEnd,
    true,
  );

  it('moves inside the drawn hours and the columns', () => {
    expect(targetOf(item, false, 30, 1, TIME)).toEqual({ column: 1, startMin: 570, endMin: 630 });
    expect(targetOf(item, false, -600, -4, TIME)).toEqual({
      column: 0,
      startMin: 480,
      endMin: 540,
    });
    expect(targetOf(item, false, 900, 9, TIME)).toEqual({
      column: 2,
      startMin: 1140,
      endMin: 1200,
    });
  });

  it('stretches to at least one slot and up to the end of the drawn hours', () => {
    expect(targetOf(item, true, 60, 2, TIME)).toEqual({ column: 0, startMin: 540, endMin: 660 });
    expect(targetOf(item, true, -120, 0, TIME)).toEqual({ column: 0, startMin: 540, endMin: 570 });
    expect(targetOf(item, true, 900, 0, TIME)).toEqual({ column: 0, startMin: 540, endMin: 1200 });
  });

  it('the change carries the column day and resource; nothing when nothing moved', () => {
    const rooms = buildColumns(DAYS.slice(0, 1), ROOMS);
    expect(changeOf(item, { column: 1, startMin: 600, endMin: 660 }, 'time', rooms, DAYS)).toEqual({
      id: 'a',
      start: '2026-11-09T10:00',
      end: '2026-11-09T11:00',
      resourceId: 'r2',
    });
    expect(
      changeOf(item, { column: 2, startMin: 540, endMin: 600 }, 'time', columns, DAYS),
    ).toEqual({ id: 'a', start: '2026-11-11T09:00', end: '2026-11-11T10:00', resourceId: 'x' });
    expect(changeOf(item, { column: 0, startMin: 540, endMin: 600 }, 'time', columns, DAYS)).toBe(
      undefined,
    );
  });

  it('the month keeps the time of day and refuses a day off the grid', () => {
    const month: MoveBounds = { ...TIME, view: 'month' };
    const [[monthItem]] = placeMonthEvents(
      [event('m', '2026-11-09T09:00', '2026-11-09T10:00')],
      DAYS,
      true,
    );

    expect(targetOf(monthItem, false, 0, 2, month)).toEqual({
      column: 2,
      startMin: 540,
      endMin: 600,
    });
    expect(targetOf(monthItem, false, 0, 3, month)).toBe(undefined);
    expect(targetOf(monthItem, false, 0, -1, month)).toBe(undefined);
    expect(
      changeOf(monthItem, { column: 2, startMin: 540, endMin: 600 }, 'month', columns, DAYS),
    ).toEqual({
      id: 'm',
      start: '2026-11-11T09:00',
      end: '2026-11-11T10:00',
      resourceId: undefined,
    });
  });
});

describe('keyboard', () => {
  const columns = buildColumns(DAYS, undefined);
  const placed = placeTimeEvents(
    [
      event('a', '2026-11-09T09:00', '2026-11-09T10:00'),
      event('b', '2026-11-09T13:00', '2026-11-09T14:00'),
      event('c', '2026-11-11T12:00', '2026-11-11T13:00'),
      event('d', '2026-11-11T09:30', '2026-11-11T10:00'),
    ],
    columns,
    TIME.rangeStart,
    TIME.rangeEnd,
    true,
  );
  const [[a, b], , [d, c]] = placed;

  it('knows its arrow keys', () => {
    expect(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].every(isArrowKey)).toBe(true);
    expect(isArrowKey('Enter')).toBe(false);
  });

  it('↑ ↓ walk the column; ← → reach the nearest in time in the closest column with events', () => {
    expect(neighbourOf(placed, a, 'ArrowDown')?.key).toBe('b@0');
    expect(neighbourOf(placed, b, 'ArrowUp')?.key).toBe('a@0');
    expect(neighbourOf(placed, b, 'ArrowDown')).toBe(undefined);
    expect(neighbourOf(placed, a, 'ArrowRight')?.key).toBe(d.key);
    expect(neighbourOf(placed, b, 'ArrowRight')?.key).toBe(c.key);
    expect(neighbourOf(placed, c, 'ArrowLeft')?.key).toBe('b@0');
    expect(neighbourOf(placed, a, 'ArrowLeft')).toBe(undefined);
  });

  it('⌘ arrows move by a slot or a column; ⌘ ⇧ ↑ ↓ stretch; ⌘ ⇧ ← → do nothing', () => {
    expect(keyboardTarget(a, 'ArrowDown', false, TIME)).toEqual({
      column: 0,
      startMin: 570,
      endMin: 630,
    });
    expect(keyboardTarget(a, 'ArrowUp', false, TIME)).toEqual({
      column: 0,
      startMin: 510,
      endMin: 570,
    });
    expect(keyboardTarget(a, 'ArrowRight', false, TIME)).toEqual({
      column: 1,
      startMin: 540,
      endMin: 600,
    });
    expect(keyboardTarget(a, 'ArrowLeft', false, TIME)).toEqual({
      column: 0,
      startMin: 540,
      endMin: 600,
    });
    expect(keyboardTarget(a, 'ArrowDown', true, TIME)).toEqual({
      column: 0,
      startMin: 540,
      endMin: 630,
    });
    expect(keyboardTarget(a, 'ArrowRight', true, TIME)).toBe(undefined);
  });

  it('the month moves by a day or a week and does not stretch', () => {
    const days = Array.from({ length: 14 }, (_, index) =>
      day(`2026-11-${String(index + 1).padStart(2, '0')}`),
    );
    const [[item]] = placeMonthEvents(
      [event('m', '2026-11-02T09:00', '2026-11-02T10:00')],
      days.slice(1),
      true,
    );
    const month: MoveBounds = { ...TIME, view: 'month', columnCount: 13 };

    expect(keyboardTarget(item, 'ArrowRight', false, month)?.column).toBe(1);
    expect(keyboardTarget(item, 'ArrowDown', false, month)?.column).toBe(7);
    expect(keyboardTarget(item, 'ArrowUp', false, month)).toBe(undefined);
    expect(keyboardTarget(item, 'ArrowDown', true, month)).toBe(undefined);
  });
});
