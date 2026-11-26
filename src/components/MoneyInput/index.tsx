import { forwardRef, memo, type ReactNode } from 'react';

import { named } from '../../helpers/component.helper';
import ScaledInput, { type ScaledInputProps } from '../ScaledInput';

type Props = Omit<
  ScaledInputProps,
  'scaleDigits' | 'maxFractionDigits' | 'minFractionDigits' | 'suffix'
> & {
  /**
   * The minor-unit digits of the currency — the scale of the amount (TRY, USD, EUR 2; JPY 0;
   * `HAS-G` 3). The currency table belongs to the caller.
   */
  minorDigits: number;
  /** The currency code or sign after the amount ("TL", "USD"). */
  currency?: ReactNode;
};

/**
 * Money field (2.4): takes and gives the amount in the currency's minor unit (`Kurus`) —
 * `123450` with `minorDigits={2}` reads "1.234,50". Every minor digit is shown at rest.
 */
const MoneyInput = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  ({ minorDigits, currency, ...rest }, ref) => (
    <ScaledInput
      ref={ref}
      {...rest}
      scaleDigits={minorDigits}
      minFractionDigits={minorDigits}
      suffix={currency}
    />
  ),
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(MoneyInput, 'MoneyInput'),
) as typeof MoneyInput;
