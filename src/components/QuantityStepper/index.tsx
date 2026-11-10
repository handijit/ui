'use client';

import { type FC, memo, useState } from 'react';

import { DashLg, PlusLg } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';

import styles from './index.module.scss';

type Props = {
  value: number;
  onChange: (value: number) => void;
  /** Grubun ve girdinin erişilebilir adı. */
  label?: string;
  /** Verilmezse `labels.quantity.decrease`. */
  decreaseLabel?: string;
  /** Verilmezse `labels.quantity.increase`. */
  increaseLabel?: string;
  min?: number;
  max?: number;
  isDisabled?: boolean;
  /**
   * Read-only (2.2): the number stays focusable and readable (`aria-readonly`); typing, the arrow
   * keys and the two buttons do not change it.
   */
  isReadOnly?: boolean;
  size?: 'sm' | 'md';
  /**
   * The id of the number box (2.2) — the `id` of `Field`'s `FieldChildProps`, so the field's label
   * and a form's focus reach the box.
   */
  id?: string;
  /** Zorunluluk — `Field`in `FieldChildProps` sözleşmesi (2.2); `aria-required` on the box. */
  required?: boolean;
  /** On the number box (2.2), with the error and hint ids of `Field`. */
  'aria-describedby'?: string;
  /** On the number box (2.2): `spinbutton` takes `aria-invalid`. */
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};

/** Adet seçici. */
const QuantityStepper: FC<Props> = ({
  value,
  onChange,
  label,
  decreaseLabel,
  increaseLabel,
  min = 1,
  max = 99,
  isDisabled,
  isReadOnly,
  size = 'md',
  id,
  required,
  'aria-describedby': describedBy,
  'aria-invalid': isInvalid,
  className,
  testId,
}) => {
  const { labels } = useUi();
  const groupLabel = resolveLabel('QuantityStepper.label', label, labels?.quantity?.label);
  const [draft, setDraft] = useState<string | null>(null);

  const clamp = (next: number) => Math.min(Math.max(next, min), max);

  const commit = (raw: string) => {
    setDraft(null);
    if (isReadOnly) return;

    /*
     * Onceki bicim `if (!parsed) return;` diyordu ve `0` falsy: `min={0}` ile kurulmus bir alanda
     * (stok duzeltme formu) kullanici `0` yazip alandan…
     * ⚠ BOSLUK KONTROLU HAM DIZEDEN yapilir, sayidan DEGIL.
     */
    const digits = raw.replace(/\D/g, '');
    if (digits === '') return;

    onChange(clamp(Number(digits)));
  };

  return (
    <div
      className={cx(styles.stepper, styles[`stepper--${size}`], className)}
      role="group"
      aria-label={groupLabel}
      data-testid={testId}
    >
      <button
        type="button"
        className={styles.stepper__button}
        onClick={() => onChange(Math.max(value - 1, min))}
        disabled={isDisabled || isReadOnly || value <= min}
        aria-label={resolveLabel(
          'QuantityStepper.decreaseLabel',
          decreaseLabel,
          labels?.quantity?.decrease,
        )}
      >
        <DashLg aria-hidden />
      </button>

      <input
        id={id}
        className={styles.stepper__input}
        value={draft ?? String(value)}
        onChange={event => setDraft(event.target.value.replace(/\D/g, '').slice(0, 2))}
        onBlur={event => commit(event.target.value)}
        /* ⚠ `spinbutton` ROLU BIR SOZ VERIR: */
        onKeyDown={event => {
          if (isReadOnly) return;

          const step = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0;

          if (step !== 0) {
            event.preventDefault();
            setDraft(null);
            onChange(clamp(value + step));
            return;
          }

          const page = event.key === 'PageUp' ? 10 : event.key === 'PageDown' ? -10 : 0;

          if (page !== 0) {
            event.preventDefault();
            setDraft(null);
            onChange(clamp(value + page));
            return;
          }

          if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            setDraft(null);
            onChange(event.key === 'Home' ? min : max);
            return;
          }

          if (event.key === 'Enter') {
            event.preventDefault();
            commit((event.target as HTMLInputElement).value);
          }
        }}
        inputMode="numeric"
        disabled={isDisabled}
        readOnly={isReadOnly}
        aria-readonly={isReadOnly || undefined}
        aria-required={required || undefined}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy}
        /* ⚠ ARALIK ETIKETE GOMULMEZ, ROLE ILE BILDIRILIR. */
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={groupLabel}
      />

      <button
        type="button"
        className={styles.stepper__button}
        onClick={() => onChange(Math.min(value + 1, max))}
        disabled={isDisabled || isReadOnly || value >= max}
        aria-label={resolveLabel(
          'QuantityStepper.increaseLabel',
          increaseLabel,
          labels?.quantity?.increase,
        )}
      >
        <PlusLg aria-hidden />
      </button>
    </div>
  );
};

export default /*#__PURE__*/ memo(QuantityStepper) as typeof QuantityStepper;
