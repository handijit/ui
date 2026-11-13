import { forwardRef, memo } from 'react';

import { PCT2_DIGITS } from '../../constants/scale.constants';
import { named } from '../../helpers/component.helper';
import ScaledInput, { type ScaledInputProps } from '../ScaledInput';

type Props = Omit<ScaledInputProps, 'scaleDigits' | 'maxFractionDigits' | 'minFractionDigits'>;

/**
 * Percent field (2.4): takes and gives a `Pct2`, hundredths of a percent — "%20" is `2000`,
 * "%12,5" is `1250`. The sign goes before the number, the Turkish way; pass `prefix={null}` and
 * `suffix="%"` for the other order. Typed "%" signs are ignored.
 */
const PercentInput = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  ({ prefix = '%', ...rest }, ref) => (
    <ScaledInput ref={ref} {...rest} prefix={prefix} scaleDigits={PCT2_DIGITS} />
  ),
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(PercentInput, 'PercentInput'),
) as typeof PercentInput;
