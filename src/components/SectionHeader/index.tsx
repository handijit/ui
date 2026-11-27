import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

type Props = {
  title: string;
  description?: string;
  /** Üstte gösterilen küçük büyük-harf etiket. */
  overline?: string;
  /** The overline in capitals by CSS (default); `false` keeps a brand or proper name as written (3.2.1). */
  isOverlineUppercase?: boolean;
  /** Sağda gösterilen eylem ("Tümünü gör"). */
  action?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  testId?: string;
};

/** Bölüm başlığı. */
const SectionHeader: FC<Props> = ({
  title,
  description,
  overline,
  isOverlineUppercase = true,
  action,
  as: Heading = 'h2',
  size = 'md',
  className,
  testId,
}) => (
  <header className={cx(styles.header, styles[`header--${size}`], className)} data-testid={testId}>
    <div className={styles.header__text}>
      {overline && (
        <span
          className={cx(
            styles.header__overline,
            !isOverlineUppercase && styles['header__overline--as-written'],
          )}
        >
          {overline}
        </span>
      )}
      <Heading className={styles.header__title}>{title}</Heading>
      {description && <p className={styles.header__description}>{description}</p>}
    </div>

    {action && <div className={styles.header__action}>{action}</div>}
  </header>
);

export default /*#__PURE__*/ memo(SectionHeader) as typeof SectionHeader;
