import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

/** One fact: the value is read first, then its label ("12 yıl" · "tecrübe"). */
export type StatStripItem = {
  value: ReactNode;
  label: ReactNode;
};

/** `page`: on a theme surface. `band`: the deep strip at the foot of a `Band`, full width. */
export type StatStripVariant = 'page' | 'band';

type Props = {
  items: readonly StatStripItem[];
  variant?: StatStripVariant;
  /** Names the list when the facts need a context ("Han Dijit in numbers"). */
  'aria-label'?: string;
  className?: string;
  testId?: string;
};

/**
 * StatStrip — a row of short facts (value and label) separated by thin dividers: the trust
 * line under a hero or at the foot of the brand band. A list, read value then label; the
 * dividers are borders, never content. Rows wrap on a narrow screen and a wrapped row starts
 * without a divider.
 */
const StatStrip: FC<Props> = ({
  items,
  variant = 'page',
  'aria-label': ariaLabel,
  className,
  testId,
}) => (
  /*
   * `role="list"`: Safari drops the list semantics of a `ul` whose markers are removed, and the
   * count ("list, 4 items") is what tells a screen reader these facts belong together.
   */
  <ul
    role="list"
    className={cx(styles.strip, styles[`strip--${variant}`], className)}
    aria-label={ariaLabel}
    data-testid={testId}
  >
    {items.map((item, index) => (
      // The facts are a fixed, ordered list given at once: the position is their identity.
      <li key={index} className={styles.strip__item}>
        <span className={styles.strip__value}>{item.value}</span>{' '}
        <span className={styles.strip__label}>{item.label}</span>
      </li>
    ))}
  </ul>
);

export default /*#__PURE__*/ memo(StatStrip) as typeof StatStrip;
