'use client';

import { forwardRef, type InputHTMLAttributes, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { useUi } from '../../theme/context';

import styles from './index.module.scss';

/* `size` yerel ozellikte karakter genisligi (`number`); burada olcu adi — `Input` ile ayni. */
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  /** `date` (varsayılan) · `datetime-local` · `month` · `time`. */
  type?: 'date' | 'datetime-local' | 'month' | 'time';
  /** `sm` yoğun şeritler içindir (araç çubuğu, `Select size="sm"` yanında); varsayılan form ölçüsü `md`. */
  size?: 'sm' | 'md';
  testId?: string;
};

/** Tarih alanı — yerel `<input type="date">`. */
const DateField = forwardRef<HTMLInputElement, Props>(
  ({ type = 'date', size = 'md', className, testId, ...rest }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cx(styles.dateField, size === 'sm' && styles['dateField--sm'], className)}
      data-testid={testId}
      {...rest}
    />
  ),
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(DateField, 'DateField')) as typeof DateField;

export type DateRangeValue = {
  /** ISO tarih (`YYYY-MM-DD`) ya da boş dize. */
  start: string;
  end: string;
};

type RangeProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  /** Başlangıç alanının erişilebilir adı ("Başlangıç"). */
  startLabel: string;
  /** Bitiş alanının erişilebilir adı ("Bitiş"). */
  endLabel: string;
  /** İki alanın arasındaki ayraç. */
  separator?: string;
  /** Ölçeğin uçları; ikisi de yerel öğeye geçer. */
  min?: string;
  max?: string;
  /** Seçilen aralığın okunur özetini gösterir. */
  isSummaryVisible?: boolean;
  /** İki alanın ölçüsü — `DateField.size`. */
  size?: Props['size'];
  isDisabled?: boolean;
  /** Read-only (2.2): the native `readOnly` of both fields — focusable and readable, not editable. */
  isReadOnly?: boolean;
  /**
   * The id of the START field (2.2) — the `id` of `Field`'s `FieldChildProps`, so a form's focus
   * reaches the range. The end field takes `<id>-end`.
   */
  id?: string;
  /** Zorunluluk — `Field`in `FieldChildProps` sözleşmesi (2.2); native `required` on both fields. */
  required?: boolean;
  /** On both fields (2.2), with the error and hint ids of `Field`. */
  'aria-describedby'?: string;
  /** On both fields (2.2); each draws the danger edge of an invalid field. */
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};

/** Tarih aralığı — iki yerel alan, taklit takvim değil. */
const DateRangeBase = ({
  value,
  onChange,
  startLabel,
  endLabel,
  separator = '–',
  min,
  max,
  isSummaryVisible,
  size,
  isDisabled,
  isReadOnly,
  id,
  required,
  'aria-describedby': describedBy,
  'aria-invalid': isInvalid,
  className,
  testId,
}: RangeProps) => {
  const { labels } = useUi();

  /* OZET `Intl` ile ve `labels.locale`den. */
  const summary = (() => {
    if (!isSummaryVisible || !labels?.locale || value.start === '' || value.end === '') return null;

    try {
      const format = new Intl.DateTimeFormat(labels.locale, { dateStyle: 'medium' });
      return `${format.format(new Date(value.start))} ${separator} ${format.format(new Date(value.end))}`;
    } catch {
      /* Gecersiz yerel ayar ya da tarih: ozet cizilmez, alanlar calismaya devam eder. */
      return null;
    }
  })();

  /* The same state and links on both fields: each is a stop of its own for a screen reader. */
  const fieldProps = {
    className: styles.range__field,
    size,
    disabled: isDisabled,
    readOnly: isReadOnly,
    required,
    'aria-describedby': describedBy,
    'aria-invalid': isInvalid || undefined,
  };

  return (
    <div className={cx(styles.range, className)} data-testid={testId}>
      <div className={styles.range__row}>
        <DateField
          {...fieldProps}
          id={id}
          aria-label={startLabel}
          value={value.start}
          min={min}
          /* Baslangic bitisi GECEMEZ: tarayici gecersiz araligi en bastan sectirmiyor. */
          max={value.end || max}
          onChange={event => onChange({ ...value, start: event.target.value })}
        />

        <span className={styles.range__separator} aria-hidden>
          {separator}
        </span>

        <DateField
          {...fieldProps}
          id={id === undefined ? undefined : `${id}-end`}
          aria-label={endLabel}
          value={value.end}
          min={value.start || min}
          max={max}
          onChange={event => onChange({ ...value, end: event.target.value })}
        />
      </div>

      {summary && <span className={styles.range__summary}>{summary}</span>}
    </div>
  );
};

export const DateRange = /*#__PURE__*/ named(/*#__PURE__*/ memo(DateRangeBase), 'DateRange');
