'use client';

import { forwardRef, type InputHTMLAttributes, memo, type ReactNode, useId } from 'react';

import { ExclamationCircleFill } from 'react-bootstrap-icons';

import { idList } from '../../helpers/aria.helper';
import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  /** Etiketin altındaki açıklama; `aria-describedby` ile bağlanır. */
  hint?: string;
  /**
   * The error under the label (2.2): the box is marked invalid (`aria-invalid`) and the message is
   * linked with `aria-describedby`, next to the hint and any `aria-describedby` passed in.
   */
  error?: string;
  testId?: string;
};

/** Onay kutusu. */
const Checkbox = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      hint,
      error,
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

    return (
      <label className={cx(styles.checkbox, className)} data-testid={testId}>
        <input
          ref={ref}
          type="checkbox"
          id={baseId}
          className={styles.checkbox__input}
          aria-labelledby={labelId}
          /* 2.2: the links are MERGED; a passed `aria-describedby` no longer drops the hint. */
          aria-describedby={idList(error && errorId, hint && hintId, describedBy)}
          aria-invalid={error ? true : isInvalid}
          {...rest}
        />
        <span className={styles.checkbox__body}>
          <span id={labelId} className={styles.checkbox__label}>
            {label}
          </span>
          {hint && (
            <span id={hintId} className={styles.checkbox__hint}>
              {hint}
            </span>
          )}
          {error && (
            <span id={errorId} className={styles.checkbox__error} role="alert">
              <ExclamationCircleFill aria-hidden />
              {error}
            </span>
          )}
        </span>
      </label>
    );
  },
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Checkbox, 'Checkbox')) as typeof Checkbox;
