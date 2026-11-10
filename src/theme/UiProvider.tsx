'use client';

import { type FC, type ReactNode, useMemo } from 'react';

import type { UiLinkComponent } from '../types/link.type';
import UiContext from './context';
import type { UiLabels } from '@/types/theme.type';

type Props = {
  children: ReactNode;
  /**
   * The application's link component.
   * @example import NextLink from 'next/link'; <UiProvider linkComponent={NextLink}>…</UiProvider>
   */
  linkComponent?: UiLinkComponent;
  /** Interface strings — once, here. */
  labels?: UiLabels;
};

/**
 * Library provider: the router's link component and the interface strings.
 *
 * It renders nothing of its own and injects no style. Colours, type, spacing and motion come from
 * `@handijit/design/tokens.css`, which the application loads once; a brand override is a plain
 * `--hd-*` declaration in the application's own stylesheet.
 * @example <UiProvider linkComponent={NextLink} labels={{ close: 'Kapat' }}><App /></UiProvider>
 */
const UiProvider: FC<Props> = ({ children, linkComponent, labels }) => {
  const value = useMemo(() => ({ linkComponent, labels }), [linkComponent, labels]);

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
};

export default UiProvider;
