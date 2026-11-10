'use client';

import { type KeyboardEvent, memo, useEffect, useId, useRef, useState } from 'react';

import { XLg } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter } from '../../helpers/label.helper';
import type { Formatter } from '../../types/theme.type';
import useAnnounce from '../../hooks/useAnnounce';

import { useUi } from '../../theme/context';

import styles from './index.module.scss';

/**
 * The tags. `value` (2.2) is the name every other field uses; `values` is the 2.0 name, kept
 * until 3.0. Give one of the two.
 */
type ValueProps =
  | {
      /** The tags (2.2). */
      value: string[];
      /**
       * @deprecated 2.2: use `value`, the name every other field uses. Removed in 3.0.
       */
      values?: never;
    }
  | {
      value?: never;
      /**
       * @deprecated 2.2: use `value`, the name every other field uses. Removed in 3.0.
       */
      values: string[];
    };

/** What a tag already in the list announces (2.2); the 2.0 text when nothing is given. */
const DEFAULT_DUPLICATE_LABEL: Formatter<[value: string]> = value => `${value} zaten ekli`;

type Props = ValueProps & {
  onChange: (values: string[]) => void;
  /** Alanın erişilebilir adı. */
  label: string;
  placeholder?: string;
  /** Her etiketin kaldırma düğmesinin ad öneki ("Kaldır"). */
  removeLabel: string;
  /** Etiketi bitiren tuşlar. */
  separators?: string[];
  /** En fazla kaç etiket. */
  maxTags?: number;
  /**
   * What a screen reader hears when the typed tag is already in the list (2.2). Falls back to
   * `labels.tagInput.duplicate` of `UiProvider`, then to the Turkish text of 2.0
   * (`"<value> zaten ekli"`) so that an update stays silent; 3.0 drops that fallback and asks for
   * the label like every other text.
   */
  duplicateLabel?: Formatter<[value: string]>;
  isDisabled?: boolean;
  /**
   * Read-only (2.2): the tags are shown and the box stays focusable (native `readOnly`), but
   * nothing can be typed or removed; the remove buttons are not drawn.
   */
  isReadOnly?: boolean;
  id?: string;
  /** Zorunluluk — `Field`in `FieldChildProps` sözleşmesi. */
  required?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};

/** Etiket girdisi — yazılan metni kaldırılabilir çiplere çevirir. */
const TagInput = ({
  value: tags,
  values: legacyTags,
  onChange,
  label,
  placeholder,
  removeLabel,
  separators = ['Enter', ','],
  maxTags,
  duplicateLabel,
  isDisabled,
  isReadOnly,
  id,
  required,
  className,
  testId,
  'aria-describedby': describedBy,
  'aria-invalid': isInvalid,
}: Props) => {
  const values = tags ?? legacyTags ?? [];
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  /* ⚠ Yinelenen etiket uyarısının zamanlayıcısı REF'te tutulur ve unmount'ta temizlenir. */
  const duplicateTimerRef = useRef(0);

  useEffect(
    () => () => {
      if (duplicateTimerRef.current) window.clearTimeout(duplicateTimerRef.current);
    },
    [],
  );
  const { labels } = useUi();
  const announce = useAnnounce();

  const [draft, setDraft] = useState('');
  /* Yinelenen deger: var olan cip bir kare vurgulanir. */
  const [duplicate, setDuplicate] = useState<string | null>(null);

  const isFull = maxTags !== undefined && values.length >= maxTags;

  const commit = (raw: string) => {
    const value = raw.trim();
    if (value === '' || isReadOnly) return;

    if (values.includes(value)) {
      /* Sessizce yutmak yerine GOSTER: kullanici "yazdim, kayboldu" diyordu. */
      setDuplicate(value);
      if (duplicateTimerRef.current) window.clearTimeout(duplicateTimerRef.current);
      duplicateTimerRef.current = window.setTimeout(() => setDuplicate(null), 1_000);
      announce(
        (duplicateLabel ?? labels?.tagInput?.duplicate ?? DEFAULT_DUPLICATE_LABEL)(value),
        'assertive',
      );
      setDraft('');
      return;
    }

    if (isFull) return;

    onChange([...values, value]);
    setDraft('');
    announce(resolveFormatter('TagInput.added', labels?.tagInput?.added, value));
  };

  const remove = (value: string) => {
    onChange(values.filter(item => item !== value));
    announce(resolveFormatter('TagInput.removed', labels?.tagInput?.removed, value));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isReadOnly) return;

    if (separators.includes(event.key)) {
      event.preventDefault();
      commit(draft);
      return;
    }

    /* BOS girdide Backspace SON etiketi kaldirir — metin varken kaldirmaz. */
    if (event.key === 'Backspace' && draft === '') {
      const lastValue = values.at(-1);
      if (lastValue !== undefined) remove(lastValue);
    }
  };

  return (
    <div
      className={cx(
        styles.tagInput,
        isDisabled && styles['tagInput--disabled'],
        isInvalid && styles['tagInput--invalid'],
        isReadOnly && styles['tagInput--readOnly'],
        className,
      )}
      data-testid={testId}
      /*
       * Kutunun herhangi bir yerine tiklamak girdiyi odaklar: cipler arasindaki bosluga tiklayan
       * kullanici hicbir sey olmadigini saniyordu.
       */
      onClick={() => inputRef.current?.focus()}
    >
      {values.map(value => (
        <span
          key={value}
          className={cx(
            styles.tagInput__tag,
            duplicate === value && styles['tagInput__tag--duplicate'],
          )}
        >
          {value}

          {!isReadOnly && (
            <button
              type="button"
              className={styles.tagInput__remove}
              /*
               * Ad degeri ICERIR: on bes cipin hepsi "Kaldir" diye okundugunda hangisi oldugu belli
               * olmuyordu.
               */
              aria-label={`${value} — ${removeLabel}`}
              disabled={isDisabled}
              onClick={event => {
                event.stopPropagation();
                remove(value);
              }}
            >
              <XLg aria-hidden />
            </button>
          )}
        </span>
      ))}

      <input
        ref={inputRef}
        id={inputId}
        type="text"
        className={styles.tagInput__field}
        value={draft}
        placeholder={values.length === 0 && !isReadOnly ? placeholder : undefined}
        aria-label={label}
        aria-describedby={describedBy}
        aria-invalid={isInvalid}
        /*
         * ⚠ Yerel `required` YAZILMAZ: alanin degeri etiket listesidir, girdi kutusu ise commit'ten
         * sonra BOSALIR.
         */
        aria-required={required || undefined}
        disabled={isDisabled || isFull}
        readOnly={isReadOnly}
        onChange={event => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        /*
         * Alan terk edildiginde yazilan metin ETIKETE DONER: yarim kalmis bir metin kayboluyor ve
         * kullanici bunu ancak gonderdikten sonra fark ediyordu.
         */
        onBlur={() => commit(draft)}
      />
    </div>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(TagInput, 'TagInput')) as typeof TagInput;
