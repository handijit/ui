'use client';

import { memo, type ReactNode, type RefObject, useEffect, useRef, useState } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { isScrolledPast } from '../../helpers/sticky-bar.helper';

import styles from './index.module.scss';

/** The custom property the bar writes on `<html>` while shown: its height, for what floats above it. */
const STICKY_BAR_HEIGHT_PROPERTY = '--ui-sticky-bar-height';

type Props = {
  /** The actions (the add-to-cart button). */
  children: ReactNode;
  /** What they are about, at the start: the product's name and price. */
  info?: ReactNode;
  /** The region's accessible name ("Sepete ekle"). */
  label: string;
  /**
   * The element the bar stands in for (the buy box): once it is scrolled past, the bar appears.
   * Watched with an `IntersectionObserver`; without one (server, old browser) the bar stays hidden.
   */
  targetRef?: RefObject<Element | null>;
  /** The same target by `id`, when the bar lives in another component than the target. */
  targetId?: string;
  /** Controlled visibility: overrides the observer. */
  isVisible?: boolean;
  onVisibilityChange?: (isVisible: boolean) => void;
  className?: string;
  testId?: string;
};

/**
 * A bar that keeps the page's main action in reach (3.4): an edge-to-edge bottom bar on a phone, a
 * docked bar centred at the bottom on a wide screen. It slides in once its target has been
 * scrolled past and writes its height to `--ui-sticky-bar-height` (a `CompareTray` sits above it).
 */
const StickyActionBar = ({
  children,
  info,
  label,
  targetRef,
  targetId,
  isVisible: controlledVisible,
  onVisibilityChange,
  className,
  testId,
}: Props) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isPast, setIsPast] = useState(false);
  const callbackRef = useRef(onVisibilityChange);
  callbackRef.current = onVisibilityChange;

  const isVisible = controlledVisible ?? isPast;

  useEffect(() => {
    if (controlledVisible !== undefined || typeof IntersectionObserver === 'undefined') return;

    const target = targetRef?.current ?? (targetId ? document.getElementById(targetId) : null);
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => setIsPast(isScrolledPast(entry)));
    observer.observe(target);

    return () => observer.disconnect();
  }, [controlledVisible, targetRef, targetId]);

  /* Hidden, the bar is out of the tab order and the accessibility tree, but kept for the slide. */
  useEffect(() => {
    const bar = barRef.current as HTMLDivElement;
    bar.toggleAttribute('inert', !isVisible);
    const root = document.documentElement;
    if (isVisible) root.style.setProperty(STICKY_BAR_HEIGHT_PROPERTY, `${bar.offsetHeight}px`);
    else root.style.removeProperty(STICKY_BAR_HEIGHT_PROPERTY);
    callbackRef.current?.(isVisible);

    return () => {
      root.style.removeProperty(STICKY_BAR_HEIGHT_PROPERTY);
    };
  }, [isVisible]);

  return (
    <div
      ref={barRef}
      role="region"
      aria-label={label}
      aria-hidden={!isVisible}
      className={cx(styles.bar, isVisible && styles['bar--visible'], className)}
      data-testid={testId}
    >
      <div className={styles.bar__inner}>
        {info && <div className={styles.bar__info}>{info}</div>}
        <div className={styles.bar__actions}>{children}</div>
      </div>
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(StickyActionBar, 'StickyActionBar'),
) as typeof StickyActionBar;
