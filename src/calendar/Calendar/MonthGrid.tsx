'use client';

import { type CSSProperties, type ReactNode, type RefObject } from 'react';

import { cx } from '../../helpers/class-name.helper';
import type { PlacedEvent } from '../core/layout';
import type { CalendarDay, CalendarEvent } from '../core/types';
import type { DragPreview } from '../core/useCalendarDrag';

import EventBlock, { type EventHandlers } from './EventBlock';
import styles from './index.module.scss';

type Props = {
  days: readonly CalendarDay[];
  /** The events of each day, already cut to the ones the cell shows. */
  shown: readonly (readonly PlacedEvent[])[];
  /** How many more events each day has than it shows. */
  hiddenCounts: readonly number[];
  weekdays?: readonly string[];
  selectedDate?: string;
  bodyRef: RefObject<HTMLDivElement | null>;
  activeKey: string | undefined;
  preview: DragPreview | null;
  cancelledLabel: string;
  formatMore: (count: number) => string;
  renderEvent?: (event: CalendarEvent) => ReactNode;
  handlers: EventHandlers;
  onDaySelect?: (date: string) => void;
};

const WEEK = 7;

/**
 * The month — a cell per day, seven to a row, each listing its first events in time order and a
 * "+N" for the rest. The day number opens the day (`onDaySelect`), so does the "+N".
 */
const MonthGrid = ({
  days,
  shown,
  hiddenCounts,
  weekdays,
  selectedDate,
  bodyRef,
  activeKey,
  preview,
  cancelledLabel,
  formatMore,
  renderEvent,
  handlers,
  onDaySelect,
}: Props) => (
  <div
    className={styles.month}
    style={{ '--ui-calendar-rows': Math.ceil(days.length / WEEK) } as CSSProperties}
  >
    {weekdays && (
      /* Each cell is named by its full day; the row of weekday names is for the eye. */
      <div className={styles.weekdays} aria-hidden>
        {weekdays.map(weekday => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
    )}
    <div ref={bodyRef} className={styles.cells}>
      {days.map((day, index) => {
        const hidden = hiddenCounts[index];
        const dayText = day.shortLabel ?? day.label;

        return (
          <div
            key={day.date}
            role="group"
            aria-label={day.label}
            className={cx(
              styles.cell,
              day.isOff && styles['cell--off'],
              day.isOutside && styles['cell--outside'],
              preview?.target.column === index && styles['cell--target'],
            )}
          >
            {onDaySelect ? (
              <button
                type="button"
                className={cx(styles.cell__day, day.isToday && styles['cell__day--today'])}
                aria-label={day.label}
                aria-current={day.isToday ? 'date' : undefined}
                aria-pressed={selectedDate === undefined ? undefined : day.date === selectedDate}
                onClick={() => onDaySelect(day.date)}
              >
                {dayText}
              </button>
            ) : (
              <span
                className={cx(styles.cell__day, day.isToday && styles['cell__day--today'])}
                aria-hidden
              >
                {dayText}
              </span>
            )}
            {shown[index].map(item => (
              <EventBlock
                key={item.key}
                item={item}
                view="month"
                isActive={item.key === activeKey}
                isDragSource={item.key === preview?.key}
                isResizable={false}
                rangeStart={0}
                rangeLength={1}
                columnLabel={day.label}
                cancelledLabel={cancelledLabel}
                renderEvent={renderEvent}
                handlers={handlers}
              />
            ))}
            {hidden > 0 &&
              (onDaySelect ? (
                <button
                  type="button"
                  className={styles.cell__more}
                  onClick={() => onDaySelect(day.date)}
                >
                  {formatMore(hidden)}
                </button>
              ) : (
                <span className={styles.cell__more}>{formatMore(hidden)}</span>
              ))}
          </div>
        );
      })}
    </div>
  </div>
);

export default MonthGrid;
