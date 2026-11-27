'use client';

import { memo, type ReactNode, useId } from 'react';

import { BellFill, Check2 } from 'react-bootstrap-icons';

import UISize from '../../enums/ui-size.enum';
import UIVariant from '../../enums/ui-variant.enum';
import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import type { Formatter } from '../../types/theme.type';
import Button from '../Button';
import IconButton from '../IconButton';
import Popover from '../Popover';

import styles from './index.module.scss';

export type NotificationItem = {
  id: string;
  title: string;
  description?: ReactNode;
  /** When it happened: a `Date`, an ISO string or epoch milliseconds. */
  date: Date | string | number;
  isRead?: boolean;
  /** A leading icon (the kind of notification). */
  icon?: ReactNode;
};

export type NotificationCenterLabels = {
  trigger: Formatter<[unread: number]>;
  title: string;
  markAllRead: string;
  markRead: string;
  empty: string;
  unread: string;
  today: string;
  yesterday: string;
};

type Props = {
  items: NotificationItem[];
  /** A notification was opened. Without it the rows are plain text. */
  onItemSelect?: (item: NotificationItem) => void;
  /** Shows a "mark read" button on each unread notification. */
  onMarkRead?: (item: NotificationItem) => void;
  /** Shows "mark all read" while something is unread. */
  onMarkAllRead?: () => void;
  /** Controlled panel; uncontrolled when omitted. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Heading of a day older than yesterday; the day and month in `labels.locale` by default. */
  formatDay?: (date: Date) => string;
  /** Time of one notification; hours and minutes in `labels.locale` by default. */
  formatTime?: (date: Date) => string;
  labels?: Partial<NotificationCenterLabels>;
  className?: string;
  testId?: string;
};

/* Above this the badge reads "99+": a wider badge would cover the bell. */
const BADGE_MAX = 99;

const dayKey = (date: Date): string => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

type DayGroup = { key: string; date: Date; items: { item: NotificationItem; date: Date }[] };

/** Newest first, one group per local calendar day. */
const groupByDay = (items: NotificationItem[]): DayGroup[] => {
  const groups = new Map<string, DayGroup>();
  const dated = items
    .map(item => ({ item, date: new Date(item.date) }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  for (const entry of dated) {
    const key = dayKey(entry.date);
    const group = groups.get(key) ?? { key, date: entry.date, items: [] };
    group.items.push(entry);
    groups.set(key, group);
  }

  return [...groups.values()];
};

/** Bell with an unread badge and a panel of notifications grouped by day (3.1). Presentational. */
const NotificationCenter = ({
  items,
  onItemSelect,
  onMarkRead,
  onMarkAllRead,
  isOpen,
  onOpenChange,
  formatDay,
  formatTime,
  labels: labelProps,
  className,
  testId,
}: Props) => {
  const { labels: config } = useUi();
  const baseId = useId();
  const unread = items.filter(item => !item.isRead).length;
  const text = { ...config?.notificationCenter, ...labelProps };

  const title = resolveLabel('NotificationCenter.labels.title', text.title);
  const locale = config?.locale;

  const dayHeading = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    if (dayKey(date) === dayKey(today))
      return resolveLabel('NotificationCenter.labels.today', text.today);
    if (dayKey(date) === dayKey(yesterday))
      return resolveLabel('NotificationCenter.labels.yesterday', text.yesterday);

    return (
      formatDay?.(date) ??
      new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
        date,
      )
    );
  };

  const time = (date: Date): string =>
    formatTime?.(date) ??
    new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date);

  const renderContent = (item: NotificationItem, date: Date) => (
    <>
      {item.icon && (
        <span aria-hidden className={styles.icon}>
          {item.icon}
        </span>
      )}
      <span className={styles.body}>
        <span className={styles.title}>
          {!item.isRead && (
            <span className={styles.srOnly}>
              {resolveLabel('NotificationCenter.labels.unread', text.unread)}:{' '}
            </span>
          )}
          {item.title}
        </span>
        {item.description && <span className={styles.description}>{item.description}</span>}
        <time className={styles.time} dateTime={date.toISOString()}>
          {time(date)}
        </time>
      </span>
    </>
  );

  return (
    <Popover
      label={title}
      align="end"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={cx(styles.panel, className)}
      testId={testId}
      trigger={
        <IconButton
          icon={
            <span className={styles.bell}>
              <BellFill aria-hidden />
              {unread > 0 && (
                <span aria-hidden className={styles.badge}>
                  {unread > BADGE_MAX ? `${BADGE_MAX}+` : unread}
                </span>
              )}
            </span>
          }
          label={resolveFormatter('NotificationCenter.labels.trigger', text.trigger, unread)}
        />
      }
    >
      <div className={styles.header}>
        <p className={styles.heading}>{title}</p>
        {unread > 0 && onMarkAllRead && (
          <Button variant={UIVariant.GHOST} size={UISize.SMALL} onClick={onMarkAllRead}>
            {resolveLabel('NotificationCenter.labels.markAllRead', text.markAllRead)}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>
          <BellFill aria-hidden className={styles.empty__icon} />
          {resolveLabel('NotificationCenter.labels.empty', text.empty)}
        </p>
      ) : (
        <div className={styles.list}>
          {groupByDay(items).map(group => {
            const headingId = `${baseId}-${group.key}`;

            return (
              <div key={group.key} role="group" aria-labelledby={headingId}>
                <p id={headingId} className={styles.day}>
                  {dayHeading(group.date)}
                </p>
                <ul className={styles.items}>
                  {group.items.map(({ item, date }) => (
                    <li
                      key={item.id}
                      className={cx(styles.item, !item.isRead && styles['item--unread'])}
                    >
                      {onItemSelect ? (
                        <button
                          type="button"
                          className={cx(styles.item__main, styles['item__main--button'])}
                          onClick={() => onItemSelect(item)}
                        >
                          {renderContent(item, date)}
                        </button>
                      ) : (
                        <div className={styles.item__main}>{renderContent(item, date)}</div>
                      )}
                      {!item.isRead && onMarkRead && (
                        <IconButton
                          icon={<Check2 aria-hidden />}
                          label={resolveLabel('NotificationCenter.labels.markRead', text.markRead)}
                          size="sm"
                          onClick={() => onMarkRead(item)}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </Popover>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(NotificationCenter, 'NotificationCenter'),
) as typeof NotificationCenter;
