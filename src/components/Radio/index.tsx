'use client';

import { forwardRef, type InputHTMLAttributes, memo, type ReactNode, useId } from 'react';

import { ExclamationCircleFill } from 'react-bootstrap-icons';

import { isDefined } from '@handijit/utils';

import { idList } from '../../helpers/aria.helper';
import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  /** Etiketin altındaki açıklama; `aria-describedby` ile bağlanır. */
  hint?: string;
  /**
   * The error under the label (2.2): the radio is marked invalid (`aria-invalid`) and the message
   * is linked with `aria-describedby`. The error of a whole group belongs on the group (its
   * `radiogroup` element with `aria-invalid`, or a `Field` around it), not on every radio.
   */
  error?: string;
  /** Sağda gösterilen sonuç adedi (filtre listelerinde). */
  count?: number;
  testId?: string;
};

/** Radyo düğmesi. */
const Radio = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      hint,
      error,
      count,
      className,
      id,
      testId,
      'aria-describedby': describedBy,
      'aria-invalid': isInvalid,
      ...rest
    },
    ref,
  ) => {
    /* ⚠ İpucu ADA değil AÇIKLAMAYA bağlanır — gerekçe `Switch`te yazılı. */
    const generatedId = useId();
    const baseId = id ?? generatedId;
    const labelId = `${baseId}-label`;
    const hintId = `${baseId}-hint`;
    const errorId = `${baseId}-error`;
    const countId = `${baseId}-count`;

    return (
      <label className={cx(styles.radio, className)} data-testid={testId}>
        <input
          ref={ref}
          type="radio"
          id={baseId}
          className={styles.radio__input}
          /*
           * Sayaç ADIN İÇİNDE KALIR ("Disk Balata, 128"): filtre listesinde kaç sonuç olduğu
           * seçimin bir parçası.
           */
          aria-labelledby={idList(labelId, isDefined(count) && countId)}
          /* 2.2: the links are MERGED; a passed `aria-describedby` no longer drops the hint. */
          aria-describedby={idList(error && errorId, hint && hintId, describedBy)}
          aria-invalid={error ? true : isInvalid}
          {...rest}
        />
        <span className={styles.radio__body}>
          <span id={labelId} className={styles.radio__label}>
            {label}
          </span>
          {hint && (
            <span id={hintId} className={styles.radio__hint}>
              {hint}
            </span>
          )}
          {error && (
            <span id={errorId} className={styles.radio__error} role="alert">
              <ExclamationCircleFill aria-hidden />
              {error}
            </span>
          )}
        </span>
        {isDefined(count) && (
          <span id={countId} className={styles.radio__count}>
            {count}
          </span>
        )}
      </label>
    );
  },
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Radio, 'Radio')) as typeof Radio;
