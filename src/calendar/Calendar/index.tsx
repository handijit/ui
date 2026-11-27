'use client';

import {
  type KeyboardEvent,
  memo,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAnnounce, useUi } from '@handijitcom/ui';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import {
  buildColumns,
  placeBands,
  type PlacedEvent,
  placeMonthEvents,
  placeTimeEvents,
} from '../core/layout';
import {
  type CalendarTarget,
  type CalendarView,
  changeOf,
  isArrowKey,
  keyboardTarget,
  type MoveBounds,
  neighbourOf,
} from '../core/moves';
import { timeRange, toMinutes } from '../core/time';
import type {
  CalendarBand,
  CalendarDay,
  CalendarEvent,
  CalendarEventChange,
  CalendarResource,
  CalendarSlot,
} from '../core/types';
import useCalendarDrag from '../core/useCalendarDrag';

import type { EventHandlers } from './EventBlock';
import styles from './index.module.scss';
import MonthGrid from './MonthGrid';
import TimeGrid from './TimeGrid';

type Props = {
  /** The calendar's accessible name ("Ders planı"). */
  label: string;
  /** The days to draw, in order — computed by the caller (the caller owns day arithmetic). */
  days: readonly CalendarDay[];
  events: readonly CalendarEvent[];
  /** `time` (default): days as columns, hours as rows — day and week. `month`: day cells. */
  view?: CalendarView;
  /**
   * Time grid: a column per resource under every day (teacher, room, technician). A resource's
   * `detail` is a second header line and its `tone` tints the header (a full day: `ink`).
   */
  resources?: readonly CalendarResource[];
  /** Time grid (2.5): the header of a resource column; its label and detail by default. */
  renderResource?: (resource: CalendarResource) => ReactNode;
  /**
   * Time grid (2.5): named stretches of the day ("Sabah", "Öğle", "Akşam") drawn beside the hours
   * and shaded across the columns, under the events and the hour blocks.
   */
  bands?: readonly CalendarBand[];
  /** Time grid: the first drawn hour, `HH:MM`. */
  startTime?: string;
  /** Time grid: the end of the drawn hours, `HH:MM` (at most "24:00"). */
  endTime?: string;
  /** Time grid: the snap of a move, a resize and a keyboard step, and the grid lines (minutes). */
  slotMinutes?: number;
  /** Month: the weekday names over the columns ("Pzt" … "Paz"). */
  weekdays?: readonly string[];
  /** Month: how many events a day cell lists before its "+N". */
  maxEventsPerDay?: number;
  /** Month: the day whose list the caller shows beside the calendar (`aria-pressed`). */
  selectedDate?: string;
  /**
   * An event dropped, stretched or moved with the keyboard. Without it the calendar only shows
   * and opens. The calendar is controlled: the move stands once `events` carries it, and a
   * refused move (a conflict) is simply not applied — say why in a toast.
   */
  onEventChange?: (change: CalendarEventChange) => void;
  /** Enter or a click on an event. */
  onEventOpen?: (id: string) => void;
  /** Time grid: a click on an empty slot (a new lesson there). */
  onSlotSelect?: (slot: CalendarSlot) => void;
  /** Month: the day number or the "+N" of a cell. */
  onDaySelect?: (date: string) => void;
  /**
   * Time grid: something dragged in from outside (an unassigned job of a pool) and dropped on a
   * slot; `data` is its `text/plain` drag data.
   */
  onExternalDrop?: (drop: CalendarSlot & { data: string }) => void;
  /** The body of an event under its time; its title by default. */
  renderEvent?: (event: CalendarEvent) => ReactNode;
  className?: string;
  testId?: string;
};

const DEFAULT_MAX_PER_DAY = 3;

type Pending = { key: string; before: CalendarEvent };

/**
 * Calendar (2.4) — the base of a scheduling screen: a time grid of days or of days and
 * resources, or a month; events moved and stretched with the pointer and with the keyboard.
 *
 * Keyboard: Tab reaches ONE event (roving `tabindex`; 500 lessons are not 500 tab stops);
 * ← ↑ → ↓ go to the neighbouring event; Enter opens it; ⌘/Ctrl + an arrow moves it one slot or
 * one column (month: a day or a week); ⌘/Ctrl ⇧ ↑ ↓ shortens or lengthens it. The move is
 * announced once `events` carries it. A short event can be smaller than the 44px touch target:
 * its size is its duration, and every pointer action has the keyboard way above.
 */
const Calendar = ({
  label,
  days,
  events,
  view = 'time',
  resources,
  renderResource,
  bands,
  startTime = '08:00',
  endTime = '20:00',
  slotMinutes = 30,
  weekdays,
  maxEventsPerDay = DEFAULT_MAX_PER_DAY,
  selectedDate,
  onEventChange,
  onEventOpen,
  onSlotSelect,
  onDaySelect,
  onExternalDrop,
  renderEvent,
  className,
  testId,
}: Props) => {
  const { labels } = useUi();
  const announce = useAnnounce();
  const instructionsId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [activeKey, setActiveKey] = useState<string>();
  const pendingRef = useRef<Pending | null>(null);

  const isEditable = Boolean(onEventChange);
  const rangeStart = toMinutes(startTime);
  const rangeEnd = toMinutes(endTime);

  const columns = useMemo(() => buildColumns(days, resources), [days, resources]);
  const placedBands = useMemo(
    () => placeBands(bands, rangeStart, rangeEnd),
    [bands, rangeStart, rangeEnd],
  );
  const placed = useMemo(
    () =>
      view === 'time'
        ? placeTimeEvents(events, columns, rangeStart, rangeEnd, isEditable)
        : placeMonthEvents(events, days, isEditable),
    [view, events, columns, days, rangeStart, rangeEnd, isEditable],
  );
  /* The month shows the first events of a day; the rest are behind "+N" and out of the tab order. */
  const focusable = useMemo(
    () => (view === 'month' ? placed.map(list => list.slice(0, maxEventsPerDay)) : placed),
    [view, placed, maxEventsPerDay],
  );

  const bounds: MoveBounds = {
    view,
    columnCount: view === 'time' ? columns.length : days.length,
    rangeStart,
    rangeEnd,
    slotMinutes,
  };

  const items = focusable.flat();
  const tabbableKey = items.some(item => item.key === activeKey) ? activeKey : items[0]?.key;

  const columnLabel = (item: PlacedEvent) =>
    view === 'time' ? columns[item.column].label : days[item.column].label;

  /* The latest props for the stable handlers the memoised events hold. */
  const latest = useRef({ view, columns, days, onEventChange, onEventOpen, focusable, bounds });
  latest.current = { view, columns, days, onEventChange, onEventOpen, focusable, bounds };

  const apply = useCallback((item: PlacedEvent, target: CalendarTarget) => {
    const current = latest.current;
    const change = changeOf(item, target, current.view, current.columns, current.days);
    if (!change || !current.onEventChange) return undefined;
    current.onEventChange(change);

    return change;
  }, []);

  const drag = useCalendarDrag({ bodyRef, bounds, onDrop: apply });

  const focusKey = (key: string) => {
    /* Only called from the calendar's own handlers and effect: the root is there. */
    const root = rootRef.current as HTMLDivElement;
    const element = [...root.querySelectorAll<HTMLElement>('[data-key]')].find(
      candidate => candidate.dataset.key === key,
    );
    element?.focus();
  };

  const handlers = useMemo<EventHandlers>(
    () => ({
      onPointerDown: (item: PlacedEvent, event: PointerEvent, isResize: boolean) => {
        pendingRef.current = null;
        if (latest.current.onEventChange) drag.begin(item, event, isResize);
      },
      onClick: (item: PlacedEvent, _event: MouseEvent) => {
        if (drag.isClickSwallowed()) return;
        latest.current.onEventOpen?.(item.event.id);
      },
      onFocus: (item: PlacedEvent) => setActiveKey(item.key),
      onKeyDown: (item: PlacedEvent, event: KeyboardEvent) => {
        pendingRef.current = null;
        if (!isArrowKey(event.key)) return;
        const current = latest.current;

        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          if (!item.isMovable) return;
          const target = keyboardTarget(item, event.key, event.shiftKey, current.bounds);
          if (!target) return;
          pendingRef.current = {
            key: `${item.event.id}@${target.column}`,
            before: item.event,
          };
          if (!apply(item, target)) pendingRef.current = null;
          return;
        }

        const next = neighbourOf(current.focusable, item, event.key);
        if (!next) return;
        event.preventDefault();
        setActiveKey(next.key);
        focusKey(next.key);
      },
    }),
    // `drag.begin` and `drag.isClickSwallowed` are stable; the rest is read through `latest`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apply],
  );

  /*
   * A keyboard move stands once `events` carries it: the focus follows the event into its new
   * column (its button there is a new element) and the new place is announced.
   */
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    const item = placed.flat().find(candidate => candidate.key === pending.key);
    const { before } = pending;
    const isMoved =
      item !== undefined &&
      (item.event.start !== before.start ||
        item.event.end !== before.end ||
        item.event.resourceId !== before.resourceId);
    if (!isMoved) return;

    pendingRef.current = null;
    setActiveKey(item.key);
    focusKey(item.key);
    announce(
      resolveFormatter(
        'Calendar.moved',
        labels?.calendar?.moved,
        item.event.title,
        `${columnLabel(item)}, ${timeRange(item.startMin, item.endMin)}`,
      ),
    );
    // Runs when the events change: that is when a move stands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const cancelledLabel = resolveLabel('Calendar.cancelled', labels?.calendar?.cancelled);
  const instructions = resolveLabel('Calendar.instructions', labels?.calendar?.instructions);

  return (
    <div
      ref={rootRef}
      className={cx(styles.calendar, className)}
      role="group"
      aria-label={label}
      aria-describedby={instructionsId}
      data-testid={testId}
    >
      <span id={instructionsId} className={styles.srOnly}>
        {instructions}
      </span>
      {view === 'time' ? (
        <TimeGrid
          label={label}
          days={days}
          resources={resources}
          columns={columns}
          bands={placedBands}
          placed={placed}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          slotMinutes={slotMinutes}
          bodyRef={bodyRef}
          activeKey={tabbableKey}
          preview={drag.preview}
          isEditable={isEditable}
          cancelledLabel={cancelledLabel}
          renderEvent={renderEvent}
          renderResource={renderResource}
          handlers={handlers}
          isClickSwallowed={drag.isClickSwallowed}
          onSlotSelect={onSlotSelect}
          onExternalDrop={onExternalDrop}
        />
      ) : (
        <MonthGrid
          days={days}
          shown={focusable}
          hiddenCounts={placed.map((list, index) => list.length - focusable[index].length)}
          weekdays={weekdays}
          selectedDate={selectedDate}
          bodyRef={bodyRef}
          activeKey={tabbableKey}
          preview={drag.preview}
          cancelledLabel={cancelledLabel}
          formatMore={count => resolveFormatter('Calendar.more', labels?.calendar?.more, count)}
          renderEvent={renderEvent}
          handlers={handlers}
          onDaySelect={onDaySelect}
        />
      )}
    </div>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Calendar, 'Calendar')) as typeof Calendar;
