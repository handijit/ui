import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

/** `start`: one rule before the text. `center`: the text framed by a rule on each side. */
export type EyebrowAlign = 'start' | 'center';

type Props = {
  /** Short text; it is set in capitals by CSS, so the element's `lang` picks the casing (İ). */
  children: ReactNode;
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
const Eyebrow: FC<Props> = ({ children, align = 'start', as: Tag = 'p', className, testId }) => (
  <Tag className={cx(styles.eyebrow, styles[`eyebrow--${align}`], className)} data-testid={testId}>
    {children}
  </Tag>
);

export default /*#__PURE__*/ memo(Eyebrow) as typeof Eyebrow;
