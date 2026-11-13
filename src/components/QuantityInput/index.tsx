import { forwardRef, memo, type ReactNode } from 'react';

import { QTY4_DIGITS } from '../../constants/scale.constants';
import { named } from '../../helpers/component.helper';
import ScaledInput, { type ScaledInputProps } from '../ScaledInput';

type Props = Omit<
  ScaledInputProps,
  'scaleDigits' | 'maxFractionDigits' | 'minFractionDigits' | 'suffix'
> & {
  /**
   * The decimal places the unit takes (a piece 0, a kilogram 3; at most 4). The stored scale stays
   * 4 whatever the unit: "2,5" kg is `25000`.
   */
  unitDigits: number;
  /** The unit after the number ("kg", "adet"). */
  unit?: ReactNode;
};

/**
 * Quantity field (2.4): takes and gives a `Qty4`, ten-thousandths of the base unit — "2,5" is
 * `25000`, "3" pieces `30000`. Not `QuantityStepper`, which counts whole pieces with two buttons.
 */
const QuantityInput = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  ({ unitDigits, unit, ...rest }, ref) => (
    <ScaledInput
      ref={ref}
      {...rest}
      scaleDigits={QTY4_DIGITS}
      maxFractionDigits={Math.min(unitDigits, QTY4_DIGITS)}
      suffix={unit}
    />
  ),
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(QuantityInput, 'QuantityInput'),
) as typeof QuantityInput;
