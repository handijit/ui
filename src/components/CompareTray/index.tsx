'use client';

import { memo, type ReactNode, useId, useRef } from 'react';

import { Sliders, XLg } from 'react-bootstrap-icons';

import UISize from '../../enums/ui-size.enum';
import UIVariant from '../../enums/ui-variant.enum';
import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useRemovalFocus } from '../../hooks/useRemovalFocus';
import { useUi } from '../../theme/context';
import type { UiLinkExtraProps } from '../../types/link.type';
import type { Formatter } from '../../types/theme.type';
import Button from '../Button';
import IconButton from '../IconButton';

import styles from './index.module.scss';

/** One item picked for comparison. */
export type CompareTrayItem = {
  id: string;
  /** The name written in the chip and read by its remove button (saved when the item was added). */
  label: string;
  /** A small thumbnail before the name (an `<img alt="">`). */
  image?: ReactNode;
};

export type CompareTrayLabels = {
  title: string;
  count: Formatter<[count: number, max: number]>;
  remove: Formatter<[item: string]>;
  clear: string;
  compare: Formatter<[count: number]>;
  needMore: Formatter<[min: number]>;
};

type Props = {
  items: CompareTrayItem[];
  /** The most items the comparison takes; shown as "2/4". */
  max: number;
  /** Comparison needs at least this many (default 2); below it the button says why it waits. */
  minItems?: number;
  onRemove: (id: string) => void;
  onClear?: () => void;
  /** The comparison page, through the provider's link component… */
  compareHref?: string;
  compareLinkProps?: UiLinkExtraProps;
  /** …or an action. */
  onCompare?: () => void;
  labels?: Partial<CompareTrayLabels>;
  className?: string;
  testId?: string;
};

/**
 * A floating tray of the items picked for comparison (3.4): their names as removable chips, the
 * count against the maximum, clear and compare. Fixed to the bottom edge, above a
 * `StickyActionBar` when one is shown. Draws nothing while no item is picked.
 */
const CompareTray = ({
  items,
  max,
  minItems = 2,
  onRemove,
  onClear,
  compareHref,
  compareLinkProps,
  onCompare,
  labels: labelProps,
  className,
  testId,
}: Props) => {
  const { labels: config } = useUi();
  const text = config?.compareTray;
  const titleId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const markRemoved = useRemovalFocus(listRef, 'button', titleRef);

  if (items.length === 0) return null;

  const canCompare = items.length >= minItems;

  return (
    <aside className={cx(styles.tray, className)} aria-labelledby={titleId} data-testid={testId}>
      <div className={styles.tray__inner}>
        <span aria-hidden className={styles.tray__icon}>
          <Sliders />
        </span>

        <div className={styles.tray__body}>
          <h2 id={titleId} ref={titleRef} tabIndex={-1} className={styles.tray__title}>
            {resolveLabel('CompareTray.labels.title', labelProps?.title, text?.title)}
            <span className={styles.tray__count}>
              {resolveFormatter(
                'CompareTray.labels.count',
                labelProps?.count ?? text?.count,
                items.length,
                max,
              )}
            </span>
          </h2>

          <ul ref={listRef} className={styles.tray__chips}>
            {items.map((item, index) => (
              <li key={item.id} className={styles.tray__chip}>
                {item.image && (
                  <span aria-hidden className={styles.tray__image}>
                    {item.image}
                  </span>
                )}
                <span className={styles.tray__label}>{item.label}</span>
                <IconButton
                  icon={<XLg aria-hidden />}
                  label={resolveFormatter(
                    'CompareTray.labels.remove',
                    labelProps?.remove ?? text?.remove,
                    item.label,
                  )}
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    markRemoved(index);
                    onRemove(item.id);
                  }}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.tray__actions}>
          {onClear && (
            <Button variant={UIVariant.GHOST} size={UISize.SMALL} onClick={onClear}>
              {resolveLabel('CompareTray.labels.clear', labelProps?.clear, text?.clear)}
            </Button>
          )}
          <Button
            variant={UIVariant.PRIMARY}
            size={UISize.SMALL}
            disabled={!canCompare}
            href={canCompare ? compareHref : undefined}
            linkProps={compareLinkProps}
            onClick={canCompare ? onCompare : undefined}
          >
            {canCompare
              ? resolveFormatter(
                  'CompareTray.labels.compare',
                  labelProps?.compare ?? text?.compare,
                  items.length,
                )
              : resolveFormatter(
                  'CompareTray.labels.needMore',
                  labelProps?.needMore ?? text?.needMore,
                  minItems,
                )}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(CompareTray, 'CompareTray'),
) as typeof CompareTray;
