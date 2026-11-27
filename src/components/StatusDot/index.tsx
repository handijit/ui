import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

/** `info` (cobalt) for a good or live state, `ink` for one that needs a look, `danger` for a fault. */
export type StatusDotTone = 'neutral' | 'info' | 'ink' | 'danger';

type Props = {
  tone?: StatusDotTone;
  /**
   * Durumun okunan adı ("Bağlı", "Çalışıyor"). ZORUNLU: nokta yalnızca renk ve renk tek başına
   * anlam taşıyamaz (WCAG 1.4.1). Görsel olarak gizli metin olarak yazılır.
   */
  label: string;
  /** Süren bir iş — "çalışıyor", "bağlanıyor". Azaltılmış harekette durur. */
  isPulsing?: boolean;
  className?: string;
  testId?: string;
};

/**
 * Durum noktası — bağlantı, araç çağrısı, meşguliyet.
 *
 * ⚠ No brand tone (`brand`): a dot carries a state, not the brand. Ongoing work is `neutral` +
 * `isPulsing`. 3.0: the palette has no green or amber; a good state is `info` (cobalt), one
 * that needs a look `ink`, and the label says which.
 */
const StatusDot: FC<Props> = ({ tone = 'neutral', label, isPulsing, className, testId }) => (
  <span className={cx(styles.status, className)} data-testid={testId}>
    <span
      aria-hidden
      className={cx(
        styles.status__dot,
        styles[`status__dot--${tone}`],
        isPulsing && styles['status__dot--pulsing'],
      )}
    />
    <span className={styles.status__label}>{label}</span>
  </span>
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(StatusDot, 'StatusDot')) as typeof StatusDot;
