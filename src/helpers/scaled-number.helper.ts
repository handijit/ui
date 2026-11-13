/**
 * A SCALED INTEGER as a person types and reads it — the text side of `ScaledInput` (2.4).
 *
 * The value is a safe integer that carries `scaleDigits` decimal places (`123456` at 2 is
 * "1.234,56"): the scaled types of the data contract (`Kurus`, `Qty4`, `Price4`, `Rate6`, `Pct2`).
 * Nothing here goes through a float: the digits are read as text and put together with `BigInt`,
 * so "0,1" at 2 is exactly `10`, never `10.000000000000002`.
 *
 * ⚠ The GRAMMAR is the one of `@handijit/app-kit` `parseDecimal` (data contract §4.3), on
 * purpose and pinned by the same vectors in `__tests__/helpers/scaled-number.helper.test.ts`:
 * the comma is the decimal point; with a comma, dots may only group the whole part by three;
 * without one, a dot followed by groups of three groups thousands ("1.250" is 1250) unless the
 * first group starts with zero ("0.250" is 0,25), and any other single dot is the point ("12.5"
 * is 12,5 — the dot key of a number pad). `ui` is a platform package and cannot import app-kit or
 * `@handijit/decimal`; the two copies must say the same thing, and the test is where they meet.
 */

/** Text the field cannot hold: the keystroke that produced it is refused. */
export const REFUSED = Symbol('refused');

export type ScaledReadOptions = {
  /** Decimal places the integer carries. */
  scaleDigits: number;
  /** Decimal places a person may type (≤ `scaleDigits`). */
  maxFractionDigits: number;
  /** The smallest value; a minus sign is refused when it is 0 or more. */
  min: number;
  /** The largest value; a keystroke past it is refused. */
  max: number;
};

/**
 * What the typed text means: a scaled integer, `null` (nothing yet, or a number still being
 * typed that is not one on its own: "-", ",", "1.250.0"), or `REFUSED` (no number starts this
 * way, or it has more decimals than allowed, or it is out of range).
 */
export type ScaledReading = number | null | typeof REFUSED;

/** The whole part grouped by three, every group complete: "1.250", "12.345.678". */
const THOUSANDS = /^[1-9]\d{0,2}(\.\d{3})+$/;
/** On the way to `THOUSANDS`: the last group may still be short ("1.250.0"). */
const THOUSANDS_PREFIX = /^[1-9]\d{0,2}(\.\d{3})*\.\d{0,3}$/;

/**
 * Drops spaces anywhere and signs around the number (a currency code, "%", a plus) — a pasted
 * "1.234,56 TL" reads. A letter INSIDE the number stays and refuses it: "1e3" is not 13.
 */
export const cleanScaledText = (input: string): string =>
  input.replace(/\s/g, '').replace(/^[^\d.,-]+|[^\d.,-]+$/g, '');

/** Sign, whole digits and fraction digits of a complete number, or `null`. */
const split = (text: string): { isNegative: boolean; whole: string; fraction: string } | null => {
  const isNegative = text.startsWith('-');
  const body = isNegative ? text.slice(1) : text;
  const [whole, fraction, ...more] = body.split(',') as [string, ...string[]];

  if (more.length > 0 || body.includes('-')) return null;

  if (fraction !== undefined) {
    if (fraction.includes('.')) return null;
    if (whole.includes('.') && !THOUSANDS.test(whole)) return null;

    return { isNegative, whole: whole.replaceAll('.', ''), fraction };
  }

  if (THOUSANDS.test(whole)) return { isNegative, whole: whole.replaceAll('.', ''), fraction: '' };

  const [integer, point, ...rest] = whole.split('.') as [string, ...string[]];
  if (rest.length > 0) return null;

  return { isNegative, whole: integer, fraction: point ?? '' };
};

/** Reads typed text as a scaled integer; see `ScaledReading`. */
export const readScaledText = (input: string, options: ScaledReadOptions): ScaledReading => {
  const text = cleanScaledText(input);
  if (/[^\d.,-]/.test(text)) return REFUSED;
  const parts = split(text);

  if (!parts) {
    /* Not a number, but maybe the start of one: "1.250.0" on the way to "1.250.000". */
    const body = text.startsWith('-') ? text.slice(1) : text;
    return THOUSANDS_PREFIX.test(body) && (options.min < 0 || !text.startsWith('-'))
      ? null
      : REFUSED;
  }

  const { isNegative, whole, fraction } = parts;
  if (isNegative && options.min >= 0) return REFUSED;
  const allowedFraction = Math.min(options.maxFractionDigits, options.scaleDigits);
  if (fraction.length > allowedFraction) return REFUSED;
  /* A whole-number field takes no decimal comma at all — "3," would wait for a digit it refuses. */
  if (allowedFraction === 0 && text.includes(',')) return REFUSED;
  if (whole === '' && fraction === '') return null;

  const magnitude = BigInt(`${whole}${fraction.padEnd(options.scaleDigits, '0')}`);
  const signed = isNegative ? -magnitude : magnitude;

  const isTooLarge = signed > BigInt(Math.trunc(options.max));
  /* Under a positive `min` the field still takes the digits on the way up ("0" towards "5"). */
  const isTooSmall = signed < BigInt(Math.trunc(Math.min(options.min, 0)));
  if (isTooLarge || isTooSmall) return REFUSED;

  /* No negative zero: "-0" is 0. */
  return Number(signed) + 0;
};

export type ScaledFormatOptions = {
  /** Decimal places the integer carries. */
  scaleDigits: number;
  /** Decimal places always shown ("12,50" at 2); trailing zeros past them are dropped. */
  minFractionDigits: number;
  /** Groups the whole part by three with a dot ("1.234,5"); off while the field is edited. */
  isGrouped: boolean;
};

/**
 * A scaled integer as text: `123450` at 2 → "1.234,50" (min 2) or "1234,5" (min 0, ungrouped).
 * Every carried digit that is not a trailing zero is shown — the field never hides part of the
 * value it holds.
 */
export const formatScaledValue = (value: number, options: ScaledFormatOptions): string => {
  const { scaleDigits, minFractionDigits, isGrouped } = options;
  const digits = String(Math.abs(value)).padStart(scaleDigits + 1, '0');
  const whole = digits.slice(0, digits.length - scaleDigits);
  const fraction = digits.slice(digits.length - scaleDigits).replace(/0+$/, '');
  const shownFraction = fraction.padEnd(Math.min(minFractionDigits, scaleDigits), '0');
  const shownWhole = isGrouped ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : whole;
  const sign = value < 0 ? '-' : '';

  return `${sign}${shownWhole}${shownFraction === '' ? '' : `,${shownFraction}`}`;
};
