import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

/** `start`: one rule before the text. `center`: the text framed by a rule on each side. */
export type EyebrowAlign = 'start' | 'center';

type Props = {
  /** Short text; set in capitals by CSS unless `isUppercase={false}` (the element's `lang` picks İ). */
  children: ReactNode;
  /**
   * Capitals by CSS (default, as before 3.2.1). Pass `false` for a brand or a proper name: under
   * `lang="tr"` the browser capitalises "Mann-Filter" as "MANN-FİLTER" (3.2.1).
   */
  isUppercase?: boolean;
  align?: EyebrowAlign;
  as?: 'p' | 'span' | 'div';
  className?: string;
  testId?: string;
};

/**
 * Eyebrow — the small label above a heading: monospace capitals framed by thin rules. On the
 * brand surface (`BrandSurface`) it turns white by itself. The rules are decoration (CSS
 * pseudo-elements); the text is read as written.
 */
const Eyebrow: FC<Props> = ({
  children,
  align = 'start',
  isUppercase = true,
  as: Tag = 'p',
  className,
  testId,
}) => (
  <Tag
    className={cx(
      styles.eyebrow,
      styles[`eyebrow--${align}`],
      !isUppercase && styles['eyebrow--as-written'],
      className,
    )}
    data-testid={testId}
  >
    {children}
  </Tag>
);

export default /*#__PURE__*/ memo(Eyebrow) as typeof Eyebrow;
