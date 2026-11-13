'use client';

import {
  type FocusEvent,
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { assignRef } from '../../helpers/ref.helper';
import {
  cleanScaledText,
  formatScaledValue,
  readScaledText,
  REFUSED,
  type ScaledReading,
} from '../../helpers/scaled-number.helper';
import Input from '../Input';

import styles from './index.module.scss';

/** Attributes the field owns: the value is a scaled integer, never the native text or number. */
type OwnedAttribute =
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'type'
  | 'size'
  | 'prefix'
  | 'min'
  | 'max'
  | 'step'
  | 'inputMode';

export type ScaledInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, OwnedAttribute> & {
  /** The scaled integer (`123456` at 2 is 1.234,56); `null` is an empty field. */
  value: number | null;
  /**
   * Every keystroke that changes the meaning: the scaled integer, or `null` while the field is
   * empty or holds a number still being typed ("-", "1.250.0").
   */
  onChange: (value: number | null) => void;
  /** Decimal places the integer carries — its scale (`Kurus` 2, `Qty4` 4, `Rate6` 6). */
  scaleDigits: number;
  /** Decimal places a person may type; a further digit is refused. Defaults to `scaleDigits`. */
  maxFractionDigits?: number;
  /** Decimal places always shown at rest ("12,50"). Defaults to 0. */
  minFractionDigits?: number;
  /**
   * The smallest scaled value; 0 by default, so a minus sign is refused. A value under a positive
   * `min` is raised to it when the field is left.
   */
  min?: number;
  /** The largest scaled value; a keystroke past it is refused. */
  max?: number;
  /** Before the number (`%`). */
  prefix?: ReactNode;
  /** After the number (a currency code, a unit). */
  suffix?: ReactNode;
  /** `Input.size`. */
  size?: 'sm' | 'md';
  testId?: string;
};

type Draft = { text: string; value: number | null };

/**
 * A number field that takes and gives a SCALED INTEGER (2.4) — the money, quantity, rate and
 * percent fields are this one with their scale fixed.
 *
 * ⚠ Not `<input type="number">` ("Yerel öğe korunur" asks for the reason): its value is a float
 * (`valueAsNumber` of "0,1" + "0,2" is not "0,3" in cents), Chromium refuses the Turkish decimal
 * comma under an English system locale, and the mouse wheel changes an amount under a scrolling
 * pointer. Here the text is read digit by digit (`helpers/scaled-number.helper.ts`) and nothing
 * goes through a float.
 *
 * At rest the number is grouped ("1.234,50"); while focused it is plain ("1234,50") and selected,
 * so typing replaces it. A keystroke no number starts with — or one decimal too many, or past
 * `max` — is refused and the text stays as it was.
 */
const ScaledInput = /*#__PURE__*/ forwardRef<HTMLInputElement, ScaledInputProps>(
  (
    {
      value,
      onChange,
      scaleDigits,
      maxFractionDigits = scaleDigits,
      minFractionDigits = 0,
      min = 0,
      max = Number.MAX_SAFE_INTEGER,
      className,
      onFocus,
      onBlur,
      onKeyDown,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    ref,
  ) => {
    const [draft, setDraft] = useState<Draft | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        assignRef(ref, node);
      },
      [ref],
    );

    /*
     * Selected AFTER focusing re-renders the plain text: selecting in the focus handler is undone
     * when React writes the ungrouped value a moment later.
     */
    useEffect(() => {
      if (isFocused) inputRef.current?.select();
    }, [isFocused]);

    const format = (next: number | null, isGrouped: boolean): string =>
      next === null || !Number.isSafeInteger(next)
        ? ''
        : formatScaledValue(next, { scaleDigits, minFractionDigits, isGrouped });

    /*
     * The draft is shown only while it still means the value it produced: a value set from
     * outside (a form reset, a computed total) replaces it without an effect.
     */
    const isDraftCurrent = draft !== null && draft.value === value;
    const text = isDraftCurrent ? draft.text : format(value, !isFocused);
    /* A number still being typed that is not one, left behind: say so, keep the text. */
    const isUnreadable = !isFocused && isDraftCurrent && draft.value === null && draft.text !== '';

    const read = (input: string): ScaledReading =>
      readScaledText(input, { scaleDigits, maxFractionDigits, min, max });

    /** The value raised to `min`, written back and the draft dropped — leaving or pressing Enter. */
    const commit = () => {
      if (!isDraftCurrent) return;
      if (draft.value !== null && draft.value < min) {
        onChange(min);
        setDraft(null);
        return;
      }
      if (draft.value !== null || draft.text === '') setDraft(null);
    };

    return (
      <Input
        ref={setRefs}
        {...rest}
        className={cx(styles.scaled, className)}
        value={text}
        inputMode={maxFractionDigits > 0 ? 'decimal' : 'numeric'}
        autoComplete="off"
        aria-invalid={isUnreadable || ariaInvalid}
        onChange={event => {
          const typed = cleanScaledText(event.target.value);
          const next = read(typed);
          if (next === REFUSED) return;
          setDraft({ text: typed, value: next });
          if (next !== value) onChange(next);
        }}
        onFocus={(event: FocusEvent<HTMLInputElement>) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          setIsFocused(false);
          commit();
          onBlur?.(event);
        }}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') commit();
          onKeyDown?.(event);
        }}
      />
    );
  },
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ScaledInput, 'ScaledInput'),
) as typeof ScaledInput;
