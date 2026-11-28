'use client';

import { memo, type ReactNode, useEffect, useId } from 'react';

import { XCircleFill } from 'react-bootstrap-icons';

import { ABOVE_TABLET_MEDIA_QUERY } from '../../constants/breakpoint.constants';
import UISize from '../../enums/ui-size.enum';
import UIVariant from '../../enums/ui-variant.enum';
import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import Button from '../Button';
import Drawer from '../Drawer';

import styles from './index.module.scss';

export type FacetSidebarLabels = {
  title: string;
  clearAll: string;
  apply: string;
};

type Props = {
  /** `FacetSection`s, in the order of the decision ("my vehicle" before brands). */
  children: ReactNode;
  /** The sidebar's heading and the drawer's title; `labels.facets.title` by default. */
  title?: string;
  /** Applied filters: the "clear all" button shows while it is above zero. */
  activeCount?: number;
  onClearAll?: () => void;
  /**
   * Narrow screens: the same sections in a `Drawer` from the start edge, with clear and apply
   * buttons at the foot. The sidebar column itself is hidden at tablet width and below.
   */
  isDrawerOpen?: boolean;
  onDrawerClose?: () => void;
  /** The drawer's apply button; closes the drawer when omitted. */
  onApply?: () => void;
  /** The apply button's text with the result count ("128 ürünü göster"); `labels.facets.apply` by default. */
  applyLabel?: string;
  labels?: Partial<FacetSidebarLabels>;
  className?: string;
  testId?: string;
};

/**
 * The catalogue's filter column (3.4): a heading with "clear all" over `FacetSection`s, sticky
 * below the header on a wide screen and a drawer with an apply button on a narrow one.
 */
const FacetSidebar = ({
  children,
  title,
  activeCount = 0,
  onClearAll,
  isDrawerOpen = false,
  onDrawerClose,
  onApply,
  applyLabel,
  labels: labelProps,
  className,
  testId,
}: Props) => {
  const { labels: config } = useUi();
  const headingId = useId();

  const heading = resolveLabel(
    'FacetSidebar.title',
    title ?? labelProps?.title,
    config?.facets?.title,
  );
  const clearAllText = resolveLabel(
    'FacetSidebar.labels.clearAll',
    labelProps?.clearAll,
    config?.facets?.clearAll,
  );
  const close = () => onDrawerClose?.();

  /* The drawer belongs to a narrow window: widening it past the tablet width shows the column. */
  useEffect(() => {
    if (!isDrawerOpen || typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia(ABOVE_TABLET_MEDIA_QUERY);
    const handleChange = () => query.matches && onDrawerClose?.();
    query.addEventListener('change', handleChange);

    return () => query.removeEventListener('change', handleChange);
  }, [isDrawerOpen, onDrawerClose]);

  const canClear = Boolean(onClearAll) && activeCount > 0;

  return (
    <>
      <aside
        className={cx(styles.sidebar, className)}
        aria-labelledby={headingId}
        data-testid={testId}
      >
        <header className={styles.sidebar__header}>
          <h2 id={headingId} className={styles.sidebar__title}>
            {heading}
          </h2>
          {canClear && (
            <Button
              variant={UIVariant.GHOST}
              size={UISize.XSMALL}
              startIcon={<XCircleFill aria-hidden />}
              onClick={onClearAll}
            >
              {clearAllText}
              <span className={styles.sidebar__count}> ({activeCount})</span>
            </Button>
          )}
        </header>
        <div className={styles.sidebar__body}>{children}</div>
      </aside>

      {/* Drawn only while open: a closed drawer would keep a second copy of every section. */}
      {isDrawerOpen && (
        <Drawer
          isOpen
          onClose={close}
          title={heading}
          side="start"
          size="sm"
          footer={
            <div className={styles.footer}>
              {onClearAll && (
                <Button
                  variant={UIVariant.SECONDARY}
                  disabled={activeCount === 0}
                  onClick={onClearAll}
                >
                  {clearAllText}
                </Button>
              )}
              <Button variant={UIVariant.PRIMARY} onClick={onApply ?? close}>
                {resolveLabel(
                  'FacetSidebar.applyLabel',
                  applyLabel ?? labelProps?.apply,
                  config?.facets?.apply,
                )}
              </Button>
            </div>
          }
        >
          <div className={styles.sidebar__body}>{children}</div>
        </Drawer>
      )}
    </>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(FacetSidebar, 'FacetSidebar'),
) as typeof FacetSidebar;
