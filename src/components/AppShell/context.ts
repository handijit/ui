'use client';

import { createContext, useContext } from 'react';

import { useUi } from '../../theme/context';
import type { Formatter } from '../../types/theme.type';

export type AppShellLabels = {
  skipToContent: string;
  navigation: string;
  openNavigation: string;
  collapse: string;
  expand: string;
  badge: Formatter<[count: number]>;
  userMenu: string;
};

/**
 * What `AppShell` hands its navigation (3.2). The parts also work outside a shell (a settings
 * page's own list): then nothing is collapsed and a click only follows the link.
 */
export type AppShellContextValue = {
  /** The sidebar shows icons only. Always `false` inside the narrow-window drawer. */
  isCollapsed: boolean;
  /** A link was followed: the drawer closes. */
  onNavigate?: () => void;
  /** A group was opened from the icon rail: the sidebar expands to show its links. */
  onExpandSidebar?: () => void;
  /** The shell's `labels` prop, over the provider's. */
  labels?: Partial<AppShellLabels>;
};

const AppShellContext = createContext<AppShellContextValue>({ isCollapsed: false });

export const useAppShell = (): AppShellContextValue => useContext(AppShellContext);

/** The shell's labels: its `labels` prop first, then `UiProvider`'s `appShell`. */
export const useAppShellLabels = (): Partial<AppShellLabels> => {
  const { labels: config } = useUi();
  const { labels } = useAppShell();

  return { ...config?.appShell, ...labels };
};

export default AppShellContext;
