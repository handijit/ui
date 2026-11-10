'use client';

import { type KeyboardEvent, memo, type ReactNode, useRef } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

export type SegmentOption<T extends string = string> = {
  value: T;
  label: string;
  /** Yalnızca ikon gösterilecekse `label` erişilebilir ad olarak kalır. */
  icon?: ReactNode;
  isDisabled?: boolean;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Grubun erişilebilir adı ("Görünüm"). */
  label: string;
  /** Etiketler gizlenir, yalnızca ikon çizilir. `label` yine okunur. */
  isIconOnly?: boolean;
  size?: 'sm' | 'md';
  /** Every segment disabled at once (2.2); `SegmentOption.isDisabled` still disables one. */
  isDisabled?: boolean;
  /**
   * Read-only (2.2): the choice stays focusable and announced (`aria-readonly` on the group), but
   * neither a press nor the arrow keys change it.
   */
  isReadOnly?: boolean;
  /** The id of the `radiogroup` (2.2) — the `id` of `Field`'s `FieldChildProps`. */
  id?: string;
  /** Zorunluluk — `Field`in `FieldChildProps` sözleşmesi (2.2); `aria-required` on the group. */
  required?: boolean;
  /** On the `radiogroup` (2.2), with the error and hint ids of `Field`. */
  'aria-describedby'?: string;
  /** On the `radiogroup` (2.2), which takes `aria-invalid`; the frame turns danger. */
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};

/** Bölmeli denetim — görünüm değiştirme. */
const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  label,
  isIconOnly,
  size = 'md',
  isDisabled,
  isReadOnly,
  id,
  required,
  'aria-describedby': describedBy,
  'aria-invalid': isInvalid,
  className,
  testId,
}: Props<T>) => {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const offset =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;

    if (offset === 0) return;
    event.preventDefault();
    if (isReadOnly || isDisabled) return;

    const enabled = options.filter(option => !option.isDisabled);
    if (enabled.length === 0) return;

    const current = enabled.findIndex(option => option.value === value);
    const next = enabled[(current + offset + enabled.length) % enabled.length];

    onChange(next.value);
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)
      ?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={listRef}
      id={id}
      role="radiogroup"
      aria-label={label}
      aria-describedby={describedBy}
      aria-invalid={isInvalid || undefined}
      aria-required={required || undefined}
      aria-readonly={isReadOnly || undefined}
      className={cx(
        styles.segmented,
        styles[`segmented--${size}`],
        isReadOnly && styles['segmented--readOnly'],
        className,
      )}
      data-testid={testId}
      onKeyDown={handleKeyDown}
    >
      {options.map(option => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={isIconOnly ? option.label : undefined}
            data-value={option.value}
            disabled={isDisabled || option.isDisabled}
            /* Donen `tabindex`: grup Tab sirasinda TEK durak. */
            tabIndex={isSelected ? 0 : -1}
            className={cx(
              styles.segmented__item,
              isSelected && styles['segmented__item--selected'],
            )}
            /*
             * Secili ogeye ikinci kez basmak HICBIR SEY yapmaz: gorunum anahtarinda "hicbiri" diye
             * bir hal yok. `ChipGroup`ta ayni hareket secimi kaldiriyor ve iki…
             */
            onClick={() => !isSelected && !isReadOnly && onChange(option.value)}
          >
            {option.icon && (
              <span className={styles.segmented__icon} aria-hidden>
                {option.icon}
              </span>
            )}
            {!isIconOnly && <span className={styles.segmented__label}>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(SegmentedControl, 'SegmentedControl'),
) as typeof SegmentedControl;
