'use client';

import { type KeyboardEvent, memo, type ReactNode, useRef } from 'react';

import { cx } from '../../helpers/class-name.helper';
import Chip, { type ChipSize } from '../Chip';

import styles from './index.module.scss';

export type ChipOption<T extends string = string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
  isDisabled?: boolean;
};

type BaseProps<T extends string> = {
  options: ChipOption<T>[];
  /** Grubun erişilebilir adı ("Sıralama", "Kalite"). */
  label: string;
  size?: ChipSize;
  /** Taşan çipleri alta sarmak yerine yatay kaydırır (mobil filtre şeridi). */
  isScrollable?: boolean;
  /** Every chip disabled at once (2.2); `ChipOption.isDisabled` still disables one. */
  isDisabled?: boolean;
  /**
   * Read-only (2.2): the chips stay focusable and readable but a press does not change the
   * choice. A single choice announces it (`aria-readonly` on the `radiogroup`); `group`, the role
   * of a multiple choice, has no read-only state in ARIA.
   */
  isReadOnly?: boolean;
  /** The id of the group (2.2) — the `id` of `Field`'s `FieldChildProps`. */
  id?: string;
  /**
   * Zorunluluk — `Field`in `FieldChildProps` sözleşmesi (2.2); `aria-required` on a single
   * choice's `radiogroup` (a multiple choice's `group` has no required state in ARIA).
   */
  required?: boolean;
  /** On the group (2.2), with the error and hint ids of `Field`. */
  'aria-describedby'?: string;
  /** On the group (2.2). */
  'aria-invalid'?: boolean;
  className?: string;
};

type SingleProps<T extends string> = BaseProps<T> & {
  isMultiple?: false;
  value: T | null;
  /** Seçili çipe tekrar basılırsa `null` gelir — seçim geri alınabilir. */
  onChange: (value: T | null) => void;
};

type MultipleProps<T extends string> = BaseProps<T> & {
  isMultiple: true;
  value: T[];
  onChange: (value: T[]) => void;
};

type Props<T extends string> = SingleProps<T> | MultipleProps<T>;

/** Çip grubu — açılır liste yerine tek dokunuşla seçim. */
const ChipGroup = <T extends string>({
  options,
  label,
  size = 'md',
  isScrollable,
  isDisabled,
  isReadOnly,
  id,
  required,
  'aria-describedby': describedBy,
  'aria-invalid': isInvalid,
  className,
  ...selection
}: Props<T>) => {
  const listRef = useRef<HTMLDivElement>(null);

  const isSelected = (value: T) =>
    selection.isMultiple ? selection.value.includes(value) : selection.value === value;

  const handleSelect = (value: T) => {
    if (isReadOnly) return;

    if (selection.isMultiple) {
      const next = selection.value.includes(value)
        ? selection.value.filter(item => item !== value)
        : [...selection.value, value];
      selection.onChange(next);
      return;
    }

    // Seçili çipe tekrar basmak seçimi kaldırır: "hepsi" seçeneği olmayan filtrelerde kullanıcının
    // geri dönebileceği tek yol bu.
    selection.onChange(selection.value === value ? null : value);
  };

  /** Ok tuşlarıyla gezinme; başta/sonda döner (yalnızca tek seçimde). */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (selection.isMultiple) return;

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

    const currentIndex = enabled.findIndex(option => option.value === selection.value);
    const next = enabled[(currentIndex + offset + enabled.length) % enabled.length];

    selection.onChange(next.value);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-chip-value="${next.value}"]`)?.focus();
  };

  // Roving tabindex: seçili çip tabbable; hiçbiri seçili değilse ilki.
  const tabbableValue = selection.isMultiple
    ? null
    : (selection.value ?? options.find(option => !option.isDisabled)?.value ?? null);

  return (
    <div
      ref={listRef}
      className={cx(
        styles.group,
        isScrollable && styles['group--scrollable'],
        isReadOnly && styles['group--readOnly'],
        className,
      )}
      id={id}
      role={selection.isMultiple ? 'group' : 'radiogroup'}
      aria-label={label}
      aria-describedby={describedBy}
      aria-invalid={isInvalid || undefined}
      aria-required={(!selection.isMultiple && required) || undefined}
      aria-readonly={(!selection.isMultiple && isReadOnly) || undefined}
      onKeyDown={handleKeyDown}
    >
      {options.map(option => (
        <Chip
          key={option.value}
          size={size}
          icon={option.icon}
          count={option.count}
          isSelected={isSelected(option.value)}
          disabled={isDisabled || option.isDisabled}
          role={selection.isMultiple ? undefined : 'radio'}
          tabIndex={selection.isMultiple || option.value === tabbableValue ? 0 : -1}
          data-chip-value={option.value}
          onClick={() => handleSelect(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
};

export default /*#__PURE__*/ memo(ChipGroup) as typeof ChipGroup;
