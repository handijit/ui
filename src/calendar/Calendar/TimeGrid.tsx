'use client';

import {
  type CSSProperties,
  type DragEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import { cx } from '../../helpers/class-name.helper';
import type { CalendarColumn, PlacedBand, PlacedEvent } from '../core/layout';
import { clamp, timeRange, toTime, toWall } from '../core/time';
import type { CalendarDay, CalendarEvent, CalendarResource, CalendarSlot } from '../core/types';
import type { DragPreview } from '../core/useCalendarDrag';

import EventBlock, { type EventHandlers } from './EventBlock';
import styles from './index.module.scss';

type Props = {
  label: string;
  days: readonly CalendarDay[];
  resources?: readonly CalendarResource[];
  columns: readonly CalendarColumn[];
  bands: readonly PlacedBand[];
  placed: readonly (readonly PlacedEvent[])[];
  rangeStart: number;
  rangeEnd: number;
  slotMinutes: number;
  bodyRef: RefObject<HTMLDivElement | null>;
  activeKey: string | undefined;
  preview: DragPreview | null;
  isEditable: boolean;
  cancelledLabel: string;
  renderEvent?: (event: CalendarEvent) => ReactNode;
  renderResource?: (resource: CalendarResource) => ReactNode;
  handlers: EventHandlers;
  /** True for the click that ends a drag: released on an empty slot, it is not a new event. */
  isClickSwallowed: () => boolean;
  onSlotSelect?: (slot: CalendarSlot) => void;
  onExternalDrop?: (drop: CalendarSlot & { data: string }) => void;
};

/** The header of a day: the short text shown, the full name read. */
const DayHeader = ({ day, span }: { day: CalendarDay; span: number }) => (
  <div
    className={cx(styles.header, day.isToday && styles['header--today'])}
    style={{ gridColumn: `span ${span}` }}
    aria-current={day.isToday ? 'date' : undefined}
  >
    {day.shortLabel ? (
      <>
        <span aria-hidden>{day.shortLabel}</span>
        <span className={styles.srOnly}>{day.label}</span>
      </>
    ) : (
      day.label
    )}
  </div>
);

/** The header of a resource column: its label and detail, tinted by its tone. */
const ResourceHeader = ({
  resource,
  renderResource,
}: {
  resource: CalendarResource;
  renderResource?: (resource: CalendarResource) => ReactNode;
}) => (
  <div
    className={cx(styles.resource, resource.tone && styles[`resource--${resource.tone}`])}
    data-tone={resource.tone}
  >
    {renderResource ? (
      renderResource(resource)
    ) : (
      <>
        {resource.label}
        {resource.detail && <span className={styles.resource__detail}>{resource.detail}</span>}
      </>
    )}
  </div>
);

/**
 * The time grid — days (and their resources) as columns, the drawn hours as rows. Events sit at
 * their time; overlapping ones share the column side by side. One scroll box: the headers stay
 * on top and the hours on the left while it scrolls both ways.
 */
const TimeGrid = ({
  label,
  days,
  resources,
  columns,
  bands,
  placed,
  rangeStart,
  rangeEnd,
  slotMinutes,
  bodyRef,
  activeKey,
  preview,
  isEditable,
  cancelledLabel,
  renderEvent,
  renderResource,
  handlers,
  isClickSwallowed,
  onSlotSelect,
  onExternalDrop,
}: Props) => {
  const rangeLength = rangeEnd - rangeStart;
  const resourceCount = resources?.length ?? 0;
  const hasResources = resourceCount > 0;
  const hours = Array.from(
    { length: Math.floor((rangeEnd - 1) / 60) - Math.ceil(rangeStart / 60) + 1 },
    (_, index) => (Math.ceil(rangeStart / 60) + index) * 60,
  );
  /** A length of minutes as a share of the drawn hours; `percent(t)` is where time `t` sits. */
  const share = (minutes: number) => `${(minutes / rangeLength) * 100}%`;
  const percent = (minutes: number) => share(minutes - rangeStart);
  const previewItem = preview ? placed.flat().find(item => item.key === preview.key) : undefined;

  /** The slot under a pointer in a column, snapped down to the slot. */
  const slotAt = (column: CalendarColumn, element: HTMLElement, clientY: number): CalendarSlot => {
    const box = element.getBoundingClientRect();
    const ratio = box.height > 0 ? clamp((clientY - box.top) / box.height, 0, 1) : 0;
    const minutes = Math.floor((ratio * rangeLength) / slotMinutes) * slotMinutes;
    const start = clamp(rangeStart + minutes, rangeStart, rangeEnd - slotMinutes);

    return {
      start: toWall(column.day.date, start),
      end: toWall(column.day.date, start + slotMinutes),
      resourceId: column.resource?.id,
    };
  };

  const style = {
    '--ui-calendar-columns': columns.length,
    '--ui-calendar-hours': rangeLength / 60,
    '--ui-calendar-slot-ratio': slotMinutes / 60,
  } as CSSProperties;

  return (
    /*
     * With no event to focus, the scroll box itself takes the focus (2.1.1): the hours past the
     * fold are reached with the arrow keys of the box.
     */
    <div
      className={styles.scroller}
      {...(placed.some(list => list.length > 0)
        ? {}
        : { tabIndex: 0, role: 'region', 'aria-label': label })}
    >
      <div className={cx(styles.time, bands.length > 0 && styles['time--bands'])} style={style}>
        <div className={styles.corner} />
        <div className={styles.headers}>
          {days.map(day => (
            <DayHeader key={day.date} day={day} span={hasResources ? resourceCount : 1} />
          ))}
          {hasResources &&
            columns.map(column => (
              <ResourceHeader
                key={column.index}
                resource={column.resource as CalendarResource}
                renderResource={renderResource}
              />
            ))}
        </div>

        <div className={styles.gutter} aria-hidden>
          {hours.map(minutes => (
            <span key={minutes} className={styles.gutter__hour} style={{ top: percent(minutes) }}>
              {toTime(minutes)}
            </span>
          ))}
          {bands.map(band => (
            <span
              key={band.key}
              className={styles.gutter__band}
              style={{ top: percent(band.startMin), height: share(band.endMin - band.startMin) }}
            >
              {band.label}
            </span>
          ))}
        </div>

        <div ref={bodyRef} className={styles.columns}>
          {columns.map(column => (
            <div
              key={column.index}
              role="group"
              aria-label={column.label}
              className={cx(styles.column, column.day.isOff && styles['column--off'])}
              onClick={
                onSlotSelect
                  ? (event: MouseEvent<HTMLDivElement>) => {
                      if (event.target !== event.currentTarget || isClickSwallowed()) return;
                      onSlotSelect(slotAt(column, event.currentTarget, event.clientY));
                    }
                  : undefined
              }
              onDragOver={
                onExternalDrop
                  ? (event: DragEvent<HTMLDivElement>) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                    }
                  : undefined
              }
              onDrop={
                onExternalDrop
                  ? (event: DragEvent<HTMLDivElement>) => {
                      event.preventDefault();
                      onExternalDrop({
                        ...slotAt(column, event.currentTarget, event.clientY),
                        data: event.dataTransfer.getData('text/plain'),
                      });
                    }
                  : undefined
              }
            >
              {bands.map((band, index) => (
                <div
                  key={band.key}
                  className={cx(styles.band, index % 2 === 1 && styles['band--alternate'])}
                  style={{
                    top: percent(band.startMin),
                    height: share(band.endMin - band.startMin),
                  }}
                  aria-hidden
                />
              ))}
              {placed[column.index].map(item => (
                <EventBlock
                  key={item.key}
                  item={item}
                  view="time"
                  isActive={item.key === activeKey}
                  isDragSource={item.key === preview?.key}
                  isResizable={isEditable && item.isMovable}
                  rangeStart={rangeStart}
                  rangeLength={rangeLength}
                  columnLabel={column.label}
                  cancelledLabel={cancelledLabel}
                  renderEvent={renderEvent}
                  handlers={handlers}
                />
              ))}
              {preview && previewItem && preview.target.column === column.index && (
                <div
                  className={styles.preview}
                  style={
                    {
                      '--ui-calendar-top': percent(preview.target.startMin),
                      '--ui-calendar-height': `${((preview.target.endMin - preview.target.startMin) / rangeLength) * 100}%`,
                    } as CSSProperties
                  }
                  aria-hidden
                >
                  {timeRange(preview.target.startMin, preview.target.endMin)}
                  <span className={styles.preview__title}>{previewItem.event.title}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeGrid;
