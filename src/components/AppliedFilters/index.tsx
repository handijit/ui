'use client';

import { memo, useId, useRef } from 'react';

import { XCircleFill, XLg } from 'react-bootstrap-icons';

import UISize from '../../enums/ui-size.enum';
import UIVariant from '../../enums/ui-variant.enum';
import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useRemovalFocus } from '../../hooks/useRemovalFocus';
import { useUi } from '../../theme/context';
import type { Formatter } from '../../types/theme.type';
import Button from '../Button';
import Chip from '../Chip';

import styles from './index.module.scss';

/** One applied filter: "Marka: Bosch". */
export type AppliedFilter = {
  /** Unique among the chips (`brand:12`). */
  key: string;
  /** The facet's name ("Marka"); a chip without one shows only its value. */
  group?: string;
  /** The value ("Bosch", "₺100 – ₺500"). */
  label: string;
  onRemove: () => void;
};

export type AppliedFiltersLabels = {
  title: string;
  remove: Formatter<[group: string, value: string]>;
  clearAll: string;
  more: Formatter<[count: number]>;
};

type Props = {
  filters: AppliedFilter[];
  onClearAll?: () => void;
  /** Applied filters the page cannot name as a chip (a flag from an old link): "+2 filtre daha". */
  extraCount?: number;
  labels?: Partial<AppliedFiltersLabels>;
  className?: string;
  testId?: string;
};

/**
 * The strip of applied filters above a result list (3.4): one removable chip per value with its
 * group's name, and "clear all". Draws nothing when no filter is applied.
 */
const AppliedFilters = ({
  filters,
  onClearAll,
  extraCount = 0,
  labels: labelProps,
  className,
  testId,
}: Props) => {
  const { labels: config } = useUi();
  const text = config?.appliedFilters;
  const leadId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);
  const markRemoved = useRemovalFocus(listRef, 'button', leadRef);

  if (filters.length === 0 && extraCount === 0) return null;

  return (
    <div
      role="group"
      aria-labelledby={leadId}
      className={cx(styles.applied, className)}
      data-testid={testId}
    >
      <span id={leadId} ref={leadRef} tabIndex={-1} className={styles.applied__lead}>
        {resolveLabel('AppliedFilters.labels.title', labelProps?.title, text?.title)}
      </span>

      <ul ref={listRef} className={styles.applied__list}>
        {filters.map((filter, index) => (
          <li key={filter.key}>
            <Chip
              size="sm"
              className={styles.applied__chip}
              endIcon={<XLg />}
              aria-pressed={undefined}
              aria-label={resolveFormatter(
                'AppliedFilters.labels.remove',
                labelProps?.remove ?? text?.remove,
                filter.group ?? '',
                filter.label,
              )}
              onClick={() => {
                markRemoved(index);
                filter.onRemove();
              }}
            >
              {filter.group && <span className={styles.applied__group}>{filter.group}:</span>}
              <span className={styles.applied__value}>{filter.label}</span>
            </Chip>
          </li>
        ))}

        {extraCount > 0 && (
          <li className={styles.applied__extra}>
            {resolveFormatter(
              'AppliedFilters.labels.more',
              labelProps?.more ?? text?.more,
              extraCount,
            )}
          </li>
        )}
      </ul>

      {onClearAll && (
        <Button
          variant={UIVariant.GHOST}
          size={UISize.SMALL}
          startIcon={<XCircleFill aria-hidden />}
          className={styles.applied__clear}
          onClick={onClearAll}
        >
          {resolveLabel('AppliedFilters.labels.clearAll', labelProps?.clearAll, text?.clearAll)}
        </Button>
      )}
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(AppliedFilters, 'AppliedFilters'),
) as typeof AppliedFilters;
