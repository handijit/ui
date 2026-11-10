'use client';

import { type FC, memo, type ReactNode, useId } from 'react';

import { ExclamationCircleFill } from 'react-bootstrap-icons';

import { idList } from '../../helpers/aria.helper';
import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';

import styles from './index.module.scss';

/** Girdiye yayılacak erişilebilirlik bağları. */
export type FieldChildProps = {
  id: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  required?: boolean;
};

type BaseProps = {
  /** The visible label. Text, or an element (a link, a badge) inside the `<label>`. */
  label: ReactNode;
  /**
   * The id of the control (the `id` of `FieldChildProps`); generated when left out. The error
   * and hint take `<id>-error` and `<id>-hint`.
   */
  id?: string;
  /** Girdi bileşenini alan `id` ve `aria-*` bağlarıyla üretir. */
  children: (props: FieldChildProps) => ReactNode;
  hint?: string;
  error?: string;
  /** Etiketi gizler ama ekran okuyucuya bırakır (arama kutusu gibi). */
  isLabelHidden?: boolean;
  className?: string;
};

type Props = BaseProps & {
  isRequired?: boolean;
  /** Zorunluluk yıldızının ekran okuyucu karşılığı ("(zorunlu)"). */
  requiredLabel?: string;
};

/**
 * Form alanı sarmalayıcısı.
 * @example <Field label="E-posta" isRequired requiredLabel="(zorunlu)"…
 * @example // `{...props}` yaymayan bileşenlerde (Combobox, Select) yalnızca `id`…
 */
const Field: FC<Props> = ({
  label,
  id: ownId,
  children,
  hint,
  error,
  isRequired,
  requiredLabel,
  isLabelHidden,
  className,
}) => {
  const { labels } = useUi();
  const generatedId = useId();
  const id = ownId ?? generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={cx(styles.field, className)}>
      <label
        htmlFor={id}
        className={cx(styles.field__label, isLabelHidden && styles['field__label--hidden'])}
      >
        {label}
        {isRequired && (
          <>
            <span className={styles.field__required} aria-hidden>
              *
            </span>
            <span className={styles.field__srOnly}>
              {resolveLabel('Field.requiredLabel', requiredLabel, labels?.required)}
            </span>
          </>
        )}
      </label>

      {children({
        id,
        required: isRequired || undefined,
        'aria-invalid': error ? true : undefined,
        /* HATA VE YARDIM BIRLIKTE baglanir, biri digerini EZMEZ. */
        'aria-describedby': idList(error && errorId, hint && hintId),
      })}

      {/*
        HATA VE IPUCU BIRLIKTE cizilir.

        Ipucu eskiden hatanin ALTERNATIFIYDI: hata belirir belirmez kural
        ekrandan siliniyordu. Yani kullanici tam olarak kurali okumasi gereken
        anda onu kaybediyordu — "Cok kisa" diyor ama neye gore kisa oldugunu
        artik hicbir yer yazmiyor. `aria-describedby` de ikisini birden
        gosteriyor; biri cizilmediginde bag BOS bir dugume isaret ediyordu.
      */}
      {error && (
        <p id={errorId} className={styles.field__error} role="alert">
          <ExclamationCircleFill aria-hidden />
          {error}
        </p>
      )}

      {hint && (
        <p id={hintId} className={styles.field__hint}>
          {hint}
        </p>
      )}
    </div>
  );
};

export default /*#__PURE__*/ memo(Field) as typeof Field;
