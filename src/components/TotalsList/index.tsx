import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

/** One row of a `TotalsList`: the same `term` / `description` shape as `DescriptionList`'s items. */
export type TotalsListItem = {
  /** The label: "Ara toplam", "İskonto", "KDV (%20)". */
  term: ReactNode;
  /**
   * The amount: usually a `Price` (a negative one for a discount, "-₺120,00"), plain text, or an
   * inline `Badge` ("Ücretsiz"). Right-aligned with tabular figures, so the digits line up.
   */
  description: ReactNode;
  /** The grand total: emphasized and set apart by a divider above it. */
  isTotal?: boolean;
};

type Props = {
  items: TotalsListItem[];
  className?: string;
  testId?: string;
};

/**
 * Label → amount totals of a cart, an order or an invoice (3.2.2) — a native `<dl>`. Labels sit at
 * the start, amounts at the end in tabular figures; an `isTotal` row is emphasized below a divider.
 * @example <TotalsList items={[{ term: 'Ara toplam', description: <Price value="1.200,00" size="sm" /> }, { term: 'Genel toplam', description: <Price value="1.440,00" />, isTotal: true }]} />
 */
const TotalsList: FC<Props> = ({ items, className, testId }) => (
  <dl className={cx(styles.totals, className)} data-testid={testId}>
    {items.map((item, index) => (
      <div
        key={index}
        className={cx(styles.totals__row, item.isTotal && styles['totals__row--total'])}
      >
        <dt className={styles.totals__term}>{item.term}</dt>
        <dd className={styles.totals__value}>{item.description}</dd>
      </div>
    ))}
  </dl>
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(TotalsList, 'TotalsList'),
) as typeof TotalsList;
