'use client';

import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';

import styles from './index.module.scss';

/** `prefix`: "₺2.649,57". `suffix`: "2.649,57₺". */
export type PriceCurrencyPosition = 'prefix' | 'suffix';

type Props = {
  /** BİÇİMLENMİŞ tutar: "1.299,90". */
  value: string;
  /** Para birimi simgesi ya da kodu. */
  currency?: string;
  /**
   * Where the symbol sits. Default: `prefix` for "₺" — the ecosystem's lira format, as
   * `@handijitcom/tr` `formatLira` writes it ("₺2.649,57", "-₺0,05", no space) — and `suffix` for any
   * other symbol or code ("2.649,57 TL" style, as before 3.2.1).
   */
  currencyPosition?: PriceCurrencyPosition;
  /** Değeri `Intl.NumberFormat` ile biçimlendirir. */
  isFormatted?: boolean;
  /** Üstü çizili liste fiyatı; indirim varsa verilir (biçimlenmiş). */
  listValue?: string;
  /** İndirim oranı (tam sayı yüzde). */
  discountPercent?: number;
  /** İndirim rozetinin metnini üretir ("%20", "-20%"). */
  formatDiscount?: (percent: number) => string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  testId?: string;
};

/** The lira sign: written before the amount by default (3.2.1). */
const LIRA_SIGN = '₺';
/* A leading minus (ASCII or U+2212) stays in front of a prefixed symbol: "-₺0,05". */
const SIGN = /^[-\u2212]/;

/** Tutar gösterimi. */
const Price: FC<Props> = ({
  value,
  currency,
  currencyPosition,
  listValue,
  discountPercent,
  formatDiscount = percent => `%${percent}`,
  isFormatted,
  size = 'md',
  className,
  testId,
}) => {
  const { labels } = useUi();
  const symbol = resolveLabel('Price.currency', currency, labels?.currency);
  const isPrefix = (currencyPosition ?? (symbol === LIRA_SIGN ? 'prefix' : 'suffix')) === 'prefix';

  /* BICIMLENDIRME OPSIYONEL ve yerel ayara BAGLI. */
  const format = (raw: string): string => {
    if (!isFormatted || !labels?.locale) return raw;

    /* RAKAM ICERMEYEN deger biciMLENDIRILMEZ. */
    if (!/\d/.test(raw)) return raw;

    const numeric = Number(
      raw
        .replace(/[^\d.,-]/g, '')
        .replace(/\.(?=\d{3}\b)/g, '')
        .replace(',', '.'),
    );
    if (!Number.isFinite(numeric)) return raw;

    try {
      return new Intl.NumberFormat(labels.locale).format(numeric);
    } catch {
      return raw;
    }
  };

  const amount = (raw: string): ReactNode => {
    const text = format(raw);
    if (!isPrefix) {
      return (
        <>
          {text}
          <span className={styles.price__currency}>{symbol}</span>
        </>
      );
    }

    const sign = SIGN.exec(text)?.[0] ?? '';
    return (
      <>
        {sign}
        <span className={cx(styles.price__currency, styles['price__currency--prefix'])}>
          {symbol}
        </span>
        {text.slice(sign.length)}
      </>
    );
  };

  return (
    <span className={cx(styles.price, styles[`price--${size}`], className)} data-testid={testId}>
      <span className={styles.price__current}>{amount(value)}</span>

      {listValue && <s className={styles.price__list}>{amount(listValue)}</s>}

      {/* `isDefined` DEGIL acik karsilastirma: handy-utils'in koruyucusu
        `Exclude<any, …>` donuyor ve TypeScript'te daraltma uretmiyor. */}
      {discountPercent !== undefined && discountPercent > 0 && (
        <span className={styles.price__discount}>{formatDiscount(discountPercent)}</span>
      )}
    </span>
  );
};

export default /*#__PURE__*/ memo(Price) as typeof Price;
