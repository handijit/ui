import { forwardRef, memo } from 'react';

import { RATE6_DIGITS, RATE_MIN_SHOWN_DIGITS } from '../../constants/scale.constants';
import { named } from '../../helpers/component.helper';
import ScaledInput, { type ScaledInputProps } from '../ScaledInput';

type Props = Omit<ScaledInputProps, 'scaleDigits' | 'maxFractionDigits' | 'minFractionDigits'>;

/**
 * Exchange-rate field (2.4): takes and gives a `Rate6`, the lira value of one foreign unit in
 * millionths — "34,123456" is `34123456`. At least four places are shown at rest ("34,1200").
 */
const RateInput = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>((props, ref) => (
  <ScaledInput
    ref={ref}
    {...props}
    scaleDigits={RATE6_DIGITS}
    minFractionDigits={RATE_MIN_SHOWN_DIGITS}
  />
));

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(RateInput, 'RateInput')) as typeof RateInput;
