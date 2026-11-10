import { type FC, memo } from 'react';

import { cssVar } from '@handijit/design';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

/** The data series tokens of `@handijit/design` (`chart-1…6`) + `muted` for a waiting or empty part. */
export type LegendTone =
  'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5' | 'chart-6' | 'muted';

export type LegendItem = {
  id: string;
  label: string;
  tone: LegendTone;
};

type Props = {
  items: LegendItem[];
  className?: string;
  testId?: string;
};

export const legendToneColor = (tone: LegendTone): string =>
  cssVar(tone === 'muted' ? 'text-3' : tone);

/**
 * Grafik lejantı — renk karesi + ad. Renk yalnızca kategorik paletten gelir (iki temanın üç
 * yüzeyinde ≥3:1); ad her zaman metin olarak yazılır, renk tek başına anlam taşımaz.
 */
const Legend: FC<Props> = ({ items, className, testId }) => (
  <ul className={cx(styles.legend, className)} data-testid={testId}>
    {items.map(item => (
      <li key={item.id} className={styles.legend__item}>
        <span
          aria-hidden
          className={styles.legend__swatch}
          style={{ backgroundColor: legendToneColor(item.tone) }}
        />
        {item.label}
      </li>
    ))}
  </ul>
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Legend, 'Legend')) as typeof Legend;
