import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  forwardRef,
  memo,
  type MouseEventHandler,
  type ReactNode,
} from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import type { UiLinkExtraProps } from '../../types/link.type';
import UiLink from '../Link';

import styles from './index.module.scss';

/**
 * `secondary` and `outline` are drawn exactly like `Button` `UIVariant.SECONDARY` (the neutral
 * frame) and `UIVariant.OUTLINE` (the cobalt frame). Until 2.1 `outline` was the neutral frame.
 */
export type IconButtonVariant = 'ghost' | 'secondary' | 'outline' | 'solid' | 'accent' | 'danger';

/** Köşe biçimi. `round` tam daire — sohbet girdisindeki gönder / durdur gibi. Ölçü değişmez. */
export type IconButtonShape = 'rounded' | 'round';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  /** Görsel etiketi olmayan düğmenin erişilebilir adı — ZORUNLU. */
  label: string;
  /** `accent` (coral) is for the conversion action only: download, try, subscribe. */
  variant?: IconButtonVariant;
  size?: 'sm' | 'md';
  shape?: IconButtonShape;
  /** Verilirse öğe bir bağlantı olarak çizilir. */
  href?: string;
  /** Yönlendiriciye geçirilecek ek props. */
  linkProps?: UiLinkExtraProps;
  testId?: string;
};

/** Yalnızca ikon taşıyan düğme. */
const IconButton = /*#__PURE__*/ forwardRef<HTMLButtonElement, Props>(
  (
    {
      icon,
      label,
      variant = 'ghost',
      size = 'md',
      shape = 'rounded',
      className,
      type = 'button',
      href,
      linkProps,
      testId,
      ...rest
    },
    ref,
  ) => {
    const classNames = cx(
      styles.iconButton,
      styles[`iconButton--${variant}`],
      styles[`iconButton--${size}`],
      shape === 'round' && styles['iconButton--round'],
      className,
    );

    /*
     * Onceki bicim yalnizca `href`/`className`/`aria-label`/`title`/`testId` iletiyordu
     * ⚠ BAGLANTI DALI DA `...rest` YAYAR — `Button` ile ayni ariza.
     */
    const isInert = Boolean(rest.disabled);

    if (href)
      return (
        <UiLink
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
          href={href}
          className={classNames}
          aria-label={label}
          aria-disabled={isInert || undefined}
          tabIndex={isInert ? -1 : rest.tabIndex}
          onClick={
            isInert
              ? undefined
              : (rest.onClick as unknown as MouseEventHandler<HTMLAnchorElement> | undefined)
          }
          data-testid={testId}
          {...linkProps}
        >
          {icon}
        </UiLink>
      );

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        aria-label={label}
        data-testid={testId}
        {...rest}
      >
        {icon}
      </button>
    );
  },
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(IconButton, 'IconButton'),
) as typeof IconButton;
