'use client';

import {
  type CSSProperties,
  type KeyboardEvent,
  memo,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { cx } from '../../helpers/class-name.helper';
import type { PlacedEvent } from '../core/layout';
import { minutesOf, timeRange, toTime } from '../core/time';
import type { CalendarEvent } from '../core/types';

import styles from './index.module.scss';

export type EventHandlers = {
  onPointerDown: (item: PlacedEvent, event: PointerEvent, isResize: boolean) => void;
  onClick: (item: PlacedEvent, event: MouseEvent) => void;
  onKeyDown: (item: PlacedEvent, event: KeyboardEvent) => void;
  onFocus: (item: PlacedEvent) => void;
};

type Props = {
  item: PlacedEvent;
  view: 'time' | 'month';
  /** The one event of the calendar in the tab order (roving `tabindex`). */
  isActive: boolean;
  /** Being dragged: the source keeps its place, marked, while the preview travels. */
  isDragSource: boolean;
  /** Can be resized with the pointer (time grid, movable, a change handler given). */
  isResizable: boolean;
  /** Time grid: the drawn hours, for the position in the column. */
  rangeStart: number;
  rangeLength: number;
  /** The day (and resource) of the column, read after the event. */
  columnLabel: string;
  cancelledLabel: string;
  renderEvent?: (event: CalendarEvent) => ReactNode;
  handlers: EventHandlers;
};

/** Percentages of the column for the time grid; the month cell lists its events instead. */
const placement = (item: PlacedEvent, rangeStart: number, rangeLength: number): CSSProperties =>
  ({
    '--ui-calendar-top': `${((item.startMin - rangeStart) / rangeLength) * 100}%`,
    '--ui-calendar-height': `${((item.endMin - item.startMin) / rangeLength) * 100}%`,
    '--ui-calendar-lane': item.lane,
    '--ui-calendar-lanes': item.lanes,
  }) as CSSProperties;

/**
 * One event: a button (Enter opens it), its time and its body, the day of its column read after
 * it. A struck-through title is not the only sign of a cancelled event: the "cancelled" text is
 * read first.
 */
const EventBlock = ({
  item,
  view,
  isActive,
  isDragSource,
  isResizable,
  rangeStart,
  rangeLength,
  columnLabel,
  cancelledLabel,
  renderEvent,
  handlers,
}: Props) => {
  const { event } = item;
  const time =
    view === 'time'
      ? timeRange(minutesOf(event.start), minutesOf(event.end))
      : toTime(minutesOf(event.start));

  return (
    <button
      type="button"
      className={cx(
        styles.event,
        styles[`event--${view}`],
        styles[`event--${event.tone ?? 'primary'}`],
        event.isCancelled && styles['event--cancelled'],
        item.isMovable && styles['event--movable'],
        isDragSource && styles['event--dragging'],
      )}
      style={view === 'time' ? placement(item, rangeStart, rangeLength) : undefined}
      tabIndex={isActive ? 0 : -1}
      data-key={item.key}
      onPointerDown={pointerEvent => handlers.onPointerDown(item, pointerEvent, false)}
      onClick={mouseEvent => handlers.onClick(item, mouseEvent)}
      onKeyDown={keyEvent => handlers.onKeyDown(item, keyEvent)}
      onFocus={() => handlers.onFocus(item)}
    >
      {event.isCancelled && <span className={styles.srOnly}>{`${cancelledLabel}: `}</span>}
      <span className={styles.event__time}>{time}</span>
      <span className={styles.event__body}>{renderEvent ? renderEvent(event) : event.title}</span>
      <span className={styles.srOnly}>{`, ${columnLabel}`}</span>
      {isResizable && (
        <span
          className={styles.event__handle}
          aria-hidden
          onPointerDown={pointerEvent => {
            pointerEvent.stopPropagation();
            handlers.onPointerDown(item, pointerEvent, true);
          }}
        />
      )}
    </button>
  );
};

export default /*#__PURE__*/ memo(EventBlock);
