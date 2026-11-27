'use client';

import { type FC, Fragment, memo, useEffect, useRef, useState } from 'react';

import { CaretRightFill } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import type { UiLinkExtraProps } from '../../types/link.type';
import UiLink from '../Link';

import styles from './index.module.scss';

export type Crumb = {
  label: string;
  /** Son öğede verilmez: bulunduğumuz sayfa bağlantı olmaz. */
  href?: string;
};

type Props = {
  items: Crumb[];
  /** Gezinme bölgesinin erişilebilir adı. */
  label?: string;
  /**
   * The name of the "…" button that shows the whole trail on a narrow screen ("Tüm yolu göster";
   * `UiLabels.breadcrumbExpand`). Without one it is named by the crumbs it hides (3.2.1).
   */
  expandLabel?: string;
  /** Yönlendiriciye geçirilecek ek props. */
  linkProps?: UiLinkExtraProps;
  className?: string;
  testId?: string;
};

/*
 * A trail longer than this collapses on a narrow screen to the first crumb, "…", the parent and the
 * current page (3.2.1).
 */
const COLLAPSE_AFTER = 3;

/**
 * Kırıntı yolu. On a narrow screen (≤ tablet portrait) it stays on one line: the middle crumbs fold
 * into a "…" button that unfolds the whole trail, and the current page is cut with an ellipsis (its
 * full text in `title`). The page never scrolls sideways (3.2.1; until 3.2.0 the trail was a
 * scrolling strip that ran to the screen's edge).
 */
const Breadcrumb: FC<Props> = ({ items, label, expandLabel, linkProps, className, testId }) => {
  const { labels } = useUi();
  const [isExpanded, setIsExpanded] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const didExpandRef = useRef(false);

  const isCollapsible = items.length > COLLAPSE_AFTER && !isExpanded;
  const hidden = items.slice(1, -2);

  /* The button that had the focus is gone: the focus moves to the first crumb it revealed. */
  useEffect(() => {
    if (!didExpandRef.current) return;
    didExpandRef.current = false;
    listRef.current?.querySelector<HTMLElement>(':scope > li:nth-child(2) a')?.focus();
  }, [isExpanded]);

  const expand = () => {
    didExpandRef.current = true;
    setIsExpanded(true);
  };

  const separator = <CaretRightFill aria-hidden className={styles.breadcrumb__separator} />;

  return (
    <nav
      className={className}
      aria-label={resolveLabel('Breadcrumb.label', label, labels?.breadcrumb)}
      data-testid={testId}
    >
      <ol
        ref={listRef}
        className={cx(styles.breadcrumb, isExpanded && styles['breadcrumb--expanded'])}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isHidden = isCollapsible && index > 0 && index < items.length - 2;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <li
                className={cx(
                  styles.breadcrumb__item,
                  isHidden && styles['breadcrumb__item--collapsible'],
                  isLast && styles['breadcrumb__item--current'],
                )}
              >
                {item.href && !isLast ? (
                  <UiLink href={item.href} className={styles.breadcrumb__link} {...linkProps}>
                    {item.label}
                  </UiLink>
                ) : (
                  <span
                    className={styles.breadcrumb__current}
                    aria-current="page"
                    title={isLast ? item.label : undefined}
                  >
                    {item.label}
                  </span>
                )}

                {!isLast && separator}
              </li>

              {index === 0 && isCollapsible && (
                <li className={styles.breadcrumb__more}>
                  <button
                    type="button"
                    className={styles.breadcrumb__expand}
                    aria-expanded={false}
                    aria-label={
                      expandLabel ??
                      labels?.breadcrumbExpand ??
                      hidden.map(crumb => crumb.label).join(', ')
                    }
                    onClick={expand}
                  >
                    …
                  </button>
                  {separator}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default /*#__PURE__*/ memo(Breadcrumb) as typeof Breadcrumb;
