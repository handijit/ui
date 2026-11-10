'use client';

import { memo, useCallback } from 'react';

import { normalize } from '@handijit/utils';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';

import styles from './index.module.scss';

export type RangeValue = [number, number];

type Props = {
  min: number;
  max: number;
  step?: number;
  value: RangeValue;
  /** Sürükleme sürerken her adımda çağrılır — ekrandaki değeri günceller. */
  onChange: (value: RangeValue) => void;
  /** Sürükleme bittiğinde çağrılır. */
  onCommit?: (value: RangeValue) => void;
  /** Ham sayıyı okunur metne çevirir ("125000" → "1.250 TL"). */
  formatValue?: (value: number) => string;
  /** Grubun erişilebilir adı ("Fiyat aralığı"). */
  label: string;
  /** Alt kulbun erişilebilir ad eki. */
  minLabel?: string;
  /** Üst kulbun erişilebilir ad eki. */
  maxLabel?: string;
  isDisabled?: boolean;
  /**
   * Read-only (2.2): both thumbs stay focusable and announce their value (`aria-readonly`), but
   * dragging and the arrow keys do not move them.
   */
  isReadOnly?: boolean;
  /**
   * The id of the LOW thumb (2.2) — the `id` of `Field`'s `FieldChildProps`, so a form's focus
   * reaches the slider. The high thumb takes `<id>-high`.
   */
  id?: string;
  /**
   * Accepted so `Field`'s `FieldChildProps` can be spread (2.2). A range always holds a value and
   * ARIA gives a slider no required state, so it writes nothing.
   */
  required?: boolean;
  /** On both thumbs (2.2), with the error and hint ids of `Field`. */
  'aria-describedby'?: string;
  /** On both thumbs (2.2). */
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};

/** Çift kulplu aralık kaydırıcı. */
const RangeSlider = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  onCommit,
  formatValue = String,
  label,
  minLabel,
  maxLabel,
  isDisabled,
  isReadOnly,
  id,
  'aria-describedby': describedBy,
  'aria-invalid': isInvalid,
  className,
  testId,
}: Props) => {
  const { labels } = useUi();
  const lowName = resolveLabel('RangeSlider.minLabel', minLabel, labels?.range?.min);
  const highName = resolveLabel('RangeSlider.maxLabel', maxLabel, labels?.range?.max);
  const [low, high] = value;

  /* Read-only: the controlled value is not handed on, so React puts the thumb back. */
  const handleLowChange = useCallback(
    (raw: number) => !isReadOnly && onChange([Math.min(raw, high), high]),
    [high, isReadOnly, onChange],
  );

  const handleHighChange = useCallback(
    (raw: number) => !isReadOnly && onChange([low, Math.max(raw, low)]),
    [low, isReadOnly, onChange],
  );

  const commit = useCallback(
    () => !isReadOnly && onCommit?.([low, high]),
    [low, high, isReadOnly, onCommit],
  );

  /* The same links on both thumbs: each is a stop of its own for a screen reader. */
  const thumbProps = {
    disabled: isDisabled,
    'aria-readonly': isReadOnly || undefined,
    'aria-invalid': isInvalid || undefined,
    'aria-describedby': describedBy,
  };

  /*
   * `normalize` yuzdeyi verir ve 100'de kirpar; olcek sifir genislikte oldugunda (min === max) 0
   * doner.
   */
  const span = max - min;
  const lowPercent = span === 0 ? 0 : normalize(low - min, span);
  const highPercent = span === 0 ? 0 : normalize(high - min, span);

  /* Iki kulp ust uste geldiginde hangisinin tutulacagi belirsizlesir. */
  const isLowOnTop = lowPercent > 50;

  return (
    <div
      className={cx(
        styles.range,
        isDisabled && styles['range--disabled'],
        isReadOnly && styles['range--readOnly'],
        className,
      )}
      role="group"
      aria-label={label}
      data-testid={testId}
    >
      <div className={styles.range__readout}>
        <span className={styles.range__value}>{formatValue(low)}</span>
        <span className={styles.range__separator} aria-hidden>
          —
        </span>
        <span className={styles.range__value}>{formatValue(high)}</span>
      </div>

      <div className={styles.range__track}>
        {/* Secili aralik: kullanicinin nerede durdugunu tek bakista gosterir. */}
        <span
          className={styles.range__fill}
          style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
          aria-hidden
        />

        <input
          {...thumbProps}
          id={id}
          type="range"
          className={styles.range__input}
          style={{ zIndex: isLowOnTop ? 4 : 3 }}
          min={min}
          max={max}
          step={step}
          value={low}
          aria-label={`${label} — ${lowName}`}
          aria-valuetext={formatValue(low)}
          onChange={event => handleLowChange(Number(event.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
        />

        <input
          {...thumbProps}
          id={id === undefined ? undefined : `${id}-high`}
          type="range"
          className={styles.range__input}
          style={{ zIndex: isLowOnTop ? 3 : 4 }}
          min={min}
          max={max}
          step={step}
          value={high}
          aria-label={`${label} — ${highName}`}
          aria-valuetext={formatValue(high)}
          onChange={event => handleHighChange(Number(event.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
        />
      </div>

      {/* Olcegin uclari: kullanici kendi araligini baglama oturtabilmeli. */}
      <div className={styles.range__bounds} aria-hidden>
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

export default /*#__PURE__*/ memo(RangeSlider) as typeof RangeSlider;
