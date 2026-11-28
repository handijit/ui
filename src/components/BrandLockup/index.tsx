import { memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import type { UiLinkExtraProps } from '../../types/link.type';
import UiLink from '../Link';

import styles from './index.module.scss';

export type BrandLockupSize = 'sm' | 'md' | 'lg';

type Props = {
  /** The client's name, always written: it is the lockup's text and the link's name. */
  name: string;
  /**
   * The client's mark (an `<img alt="">` or an inline SVG): decorative, since the name is written
   * next to it. Without it a tile with the initial stands in.
   */
  logo?: ReactNode;
  /** The tile's letter(s); the name's first letter by default. */
  initial?: string;
  /** A short line under the name ("Yedek parça"). */
  tagline?: string;
  size?: BrandLockupSize;
  /** Makes the lockup a link (the home page), through the provider's link component. */
  href?: string;
  linkProps?: UiLinkExtraProps;
  className?: string;
  testId?: string;
};

/**
 * A client's brand mark for an app's header or footer (3.4): the logo, or a tile with the initial,
 * next to the name and an optional tagline, in three sizes. A link when `href` is given.
 */
const BrandLockup = ({
  name,
  logo,
  initial,
  tagline,
  size = 'md',
  href,
  linkProps,
  className,
  testId,
}: Props) => {
  const content = (
    <>
      <span aria-hidden className={cx(styles.lockup__mark, !logo && styles['lockup__mark--tile'])}>
        {logo ?? (initial ?? Array.from(name.trim())[0] ?? '').toLocaleUpperCase()}
      </span>
      <span className={styles.lockup__text}>
        <span className={styles.lockup__name}>{name}</span>
        {tagline && <span className={styles.lockup__tagline}>{tagline}</span>}
      </span>
    </>
  );

  const classNames = cx(styles.lockup, styles[`lockup--${size}`], className);

  if (href)
    return (
      <UiLink
        {...linkProps}
        href={href}
        className={cx(classNames, styles['lockup--link'])}
        data-testid={testId}
      >
        {content}
      </UiLink>
    );

  return (
    <span className={classNames} data-testid={testId}>
      {content}
    </span>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(BrandLockup, 'BrandLockup'),
) as typeof BrandLockup;
