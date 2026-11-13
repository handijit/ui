/**
 * The fixed scales of the data contract (§4.1) — the decimal places each scaled type carries.
 * The single owner of the types is `@handijit/decimal`; `ui` cannot import it (a platform package
 * under it), so the numbers are repeated here and only here. Money has no fixed scale: it is the
 * minor unit of its currency (`MoneyInput.minorDigits`).
 */
export const QTY4_DIGITS = 4;
export const RATE6_DIGITS = 6;
export const PCT2_DIGITS = 2;

/** `formatRate` of app-kit shows at least four places ("34,1235"); the field matches it. */
export const RATE_MIN_SHOWN_DIGITS = 4;
