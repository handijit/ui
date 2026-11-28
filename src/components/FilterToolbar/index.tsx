'use client';

import { memo, type ReactNode } from 'react';

import {
  ArrowsCollapse,
  ArrowsExpand,
  FunnelFill,
  Grid3x3GapFill,
  SortDown,
  Table as TableIcon,
} from 'react-bootstrap-icons';

import UISize from '../../enums/ui-size.enum';
import UIVariant from '../../enums/ui-variant.enum';
import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import type { Formatter } from '../../types/theme.type';
import Button from '../Button';
import SegmentedControl from '../SegmentedControl';
import Select, { type SelectOption } from '../Select';
import Skeleton from '../Skeleton';

import styles from './index.module.scss';

/** How a result list is drawn. */
export type FilterToolbarView = 'table' | 'cards';

/** Row spacing of a result table. */
export type FilterToolbarDensity = 'comfortable' | 'compact';

export type FilterToolbarLabels = {
  filter: string;
  activeFilters: Formatter<[count: number]>;
  sort: string;
  view: string;
  viewTable: string;
  viewCards: string;
  density: string;
  densityComfortable: string;
  densityCompact: string;
  pageSize: string;
  perPage: Formatter<[size: number]>;
};

type Props<TSort extends string> = {
  /** The result count slot ("<strong>1.284</strong> ürün"); the app formats the number. */
  count?: ReactNode;
  /** The count is not known yet: a skeleton, not "0" (which reads as "no result"). */
  isCountLoading?: boolean;
  /** Shows the narrow-screen "filter" button (hidden above tablet width, where the column is). */
  onFilterClick?: () => void;
  /** Its badge: the applied filters. */
  activeFilterCount?: number;
  sortOptions?: SelectOption<TSort>[];
  sortValue?: TSort;
  onSortChange?: (value: TSort) => void;
  view?: FilterToolbarView;
  onViewChange?: (view: FilterToolbarView) => void;
  density?: FilterToolbarDensity;
  onDensityChange?: (density: FilterToolbarDensity) => void;
  /** Page sizes for the select ("24 / sayfa"). */
  pageSizeOptions?: number[];
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  /** Your own controls, before the built-in ones at the end of the row. */
  children?: ReactNode;
  /** Sticks below the application's header while the list scrolls (`--ui-header-height`). */
  isSticky?: boolean;
  labels?: Partial<FilterToolbarLabels>;
  className?: string;
  testId?: string;
};

/**
 * The bar above a result list (3.4): result count, sort, view (table / cards), density and page
 * size — each control appears when its props are given — and slots for the app's own controls.
 */
const FilterToolbar = <TSort extends string = string>({
  count,
  isCountLoading,
  onFilterClick,
  activeFilterCount = 0,
  sortOptions,
  sortValue,
  onSortChange,
  view,
  onViewChange,
  density,
  onDensityChange,
  pageSizeOptions,
  pageSize,
  onPageSizeChange,
  children,
  isSticky,
  labels: labelProps,
  className,
  testId,
}: Props<TSort>) => {
  const { labels: config } = useUi();
  const text = config?.filterToolbar;
  const label = (key: Exclude<keyof FilterToolbarLabels, 'activeFilters' | 'perPage'>) =>
    resolveLabel(`FilterToolbar.labels.${key}`, labelProps?.[key], text?.[key]);

  return (
    <div
      className={cx(styles.toolbar, isSticky && styles['toolbar--sticky'], className)}
      data-testid={testId}
    >
      {onFilterClick && (
        <Button
          variant={UIVariant.SECONDARY}
          size={UISize.SMALL}
          startIcon={<FunnelFill aria-hidden />}
          className={styles.toolbar__filter}
          onClick={onFilterClick}
        >
          {label('filter')}
          {activeFilterCount > 0 && (
            <>
              <span aria-hidden className={styles.toolbar__badge}>
                {activeFilterCount}
              </span>
              <span className={styles.srOnly}>
                {', '}
                {resolveFormatter(
                  'FilterToolbar.labels.activeFilters',
                  labelProps?.activeFilters ?? text?.activeFilters,
                  activeFilterCount,
                )}
              </span>
            </>
          )}
        </Button>
      )}

      {isCountLoading ? (
        <Skeleton width={72} height={14} className={styles.toolbar__skeleton} />
      ) : (
        count !== undefined && (
          <p className={styles.toolbar__count} aria-live="polite">
            {count}
          </p>
        )
      )}

      <div className={styles.toolbar__controls}>
        {children}

        {view && onViewChange && (
          <SegmentedControl<FilterToolbarView>
            size="sm"
            isIconOnly
            label={label('view')}
            value={view}
            onChange={onViewChange}
            className={styles.toolbar__view}
            options={[
              { value: 'table', label: label('viewTable'), icon: <TableIcon aria-hidden /> },
              { value: 'cards', label: label('viewCards'), icon: <Grid3x3GapFill aria-hidden /> },
            ]}
          />
        )}

        {density && onDensityChange && (
          <SegmentedControl<FilterToolbarDensity>
            size="sm"
            isIconOnly
            label={label('density')}
            value={density}
            onChange={onDensityChange}
            className={styles.toolbar__density}
            options={[
              {
                value: 'comfortable',
                label: label('densityComfortable'),
                icon: <ArrowsExpand aria-hidden />,
              },
              {
                value: 'compact',
                label: label('densityCompact'),
                icon: <ArrowsCollapse aria-hidden />,
              },
            ]}
          />
        )}

        {pageSizeOptions && pageSize !== undefined && onPageSizeChange && (
          <Select
            size="sm"
            align="end"
            label={label('pageSize')}
            className={styles.toolbar__select}
            value={String(pageSize)}
            onChange={value => onPageSizeChange(Number(value))}
            options={pageSizeOptions.map(size => ({
              value: String(size),
              label: resolveFormatter(
                'FilterToolbar.labels.perPage',
                labelProps?.perPage ?? text?.perPage,
                size,
              ),
            }))}
          />
        )}

        {sortOptions && sortValue !== undefined && onSortChange && (
          <Select<TSort>
            size="sm"
            align="end"
            label={label('sort')}
            icon={<SortDown aria-hidden />}
            className={styles.toolbar__select}
            options={sortOptions}
            value={sortValue}
            onChange={onSortChange}
          />
        )}
      </div>
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(FilterToolbar, 'FilterToolbar'),
) as typeof FilterToolbar;
