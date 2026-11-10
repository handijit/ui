import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

export type BadgeTone =
  | 'neutral'
  | 'success'
  | 'danger'
  | 'warning'
  /** Cobalt: information, a counter, a navigation label. */
  | 'info'
  /** Turquoise: a highlight or a live state ("New", "Live"). */
  | 'highlight';

/** `soft` is the tint, `solid` the filled pair (a counter, a discount), `outline` line and text. */
export type BadgeVariant = 'soft' | 'solid' | 'outline';

type Props = {
  children: ReactNode;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  /** A small icon, shown before the text. */
  icon?: ReactNode;
  className?: string;
  testId?: string;
};

/** Badge — a status or classification label. */
const Badge: FC<Props> = ({
  children,
  tone = 'neutral',
  variant = 'soft',
  icon,
  className,
  testId,
}) => (
  <span
    className={cx(styles.badge, styles[`badge--${tone}`], styles[`badge--${variant}`], className)}
    data-testid={testId}
  >
    {icon && <span className={styles.badge__icon}>{icon}</span>}
    {children}
  </span>
);

export default /*#__PURE__*/ memo(Badge) as typeof Badge;
