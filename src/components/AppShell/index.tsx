'use client';

import {
  type MouseEvent,
  type ReactNode,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ChevronDoubleLeft, List } from 'react-bootstrap-icons';

import { ABOVE_TABLET_MEDIA_QUERY } from '../../constants/breakpoint.constants';
import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import Drawer from '../Drawer';
import IconButton from '../IconButton';
import AppShellContext, { type AppShellContextValue, type AppShellLabels } from './context';

import styles from './index.module.scss';

export {
  AppShellNav,
  AppShellNavGroup,
  AppShellNavItem,
  type AppShellNavGroupProps,
  type AppShellNavItemProps,
  type AppShellNavLink,
  type AppShellNavProps,
  type AppShellNavSection,
} from './Nav';
export type { AppShellLabels } from './context';

type Props = {
  /** The top of the sidebar: the logo or the product's name (usually a link home). */
  brand?: ReactNode;
  /** The sidebar's navigation, usually `<AppShellNav>`; drawn again in the narrow-window drawer. */
  navigation: ReactNode;
  /** Above the collapse toggle: help, version, a theme switch. */
  sidebarFooter?: ReactNode;
  /** The top bar's start: the page title or a `Breadcrumb`. */
  title?: ReactNode;
  /** The top bar's middle: a search field or a command palette trigger. */
  search?: ReactNode;
  /** The top bar's end: `NotificationCenter`, `UserMenu`… */
  actions?: ReactNode;
  /** The page. */
  children: ReactNode;
  /** The sidebar shows icons only. Controlled; uncontrolled when omitted. Persist it yourself. */
  isCollapsed?: boolean;
  /** The first state of an uncontrolled sidebar. */
  isDefaultCollapsed?: boolean;
  onCollapsedChange?: (isCollapsed: boolean) => void;
  labels?: Partial<AppShellLabels>;
  className?: string;
  testId?: string;
};

/**
 * The frame of a signed-in panel (3.2): a sidebar that collapses to icons (a drawer below the
 * tablet width), a sticky top bar and the content. Presentational and router-agnostic: links go
 * through `UiProvider`'s `linkComponent`, the current path comes from `AppShellNav.currentPath`.
 *
 * It publishes two lengths on `<html>`: `--app-sidebar-width` (CSS, for `ToastPortal`'s `inset`)
 * and `--ui-header-height` (the top bar's height, read by the sticky components).
 */
const AppShell = ({
  brand,
  navigation,
  sidebarFooter,
  title,
  search,
  actions,
  children,
  isCollapsed,
  isDefaultCollapsed = false,
  onCollapsedChange,
  labels: labelProps,
  className,
  testId,
}: Props) => {
  const { labels: config } = useUi();
  const text = { ...config?.appShell, ...labelProps };
  const mainId = useId();
  const mainRef = useRef<HTMLElement>(null);
  const topbarRef = useRef<HTMLElement>(null);

  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(isDefaultCollapsed);
  const collapsed = isCollapsed ?? uncontrolledCollapsed;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const setCollapsed = useCallback(
    (next: boolean) => {
      if (isCollapsed === undefined) setUncontrolledCollapsed(next);
      onCollapsedChange?.(next);
    },
    [isCollapsed, onCollapsedChange],
  );

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const expandSidebar = useCallback(() => setCollapsed(false), [setCollapsed]);

  /* The window grew past the tablet width with the drawer open: the sidebar is back, close it. */
  useEffect(() => {
    if (!isDrawerOpen) return;
    const query = window.matchMedia(ABOVE_TABLET_MEDIA_QUERY);
    if (query.matches) {
      setIsDrawerOpen(false);
      return;
    }

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsDrawerOpen(false);
    };
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, [isDrawerOpen]);

  /* Sticky components (`DataTable` captions, `DirectoryGroup`) stop below the sticky top bar. */
  useEffect(() => {
    const topbar = topbarRef.current;
    if (!topbar || typeof ResizeObserver === 'undefined') return;

    const root = document.documentElement;
    const observer = new ResizeObserver(([entry]) =>
      root.style.setProperty('--ui-header-height', `${entry.contentRect.height}px`),
    );
    observer.observe(topbar);

    return () => {
      observer.disconnect();
      root.style.removeProperty('--ui-header-height');
    };
  }, []);

  /* A hash link would be read as a route by a hash router (Electron): focus the content instead. */
  const handleSkip = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    mainRef.current?.focus();
  };

  const sidebarContext = useMemo<AppShellContextValue>(
    () => ({ isCollapsed: collapsed, onExpandSidebar: expandSidebar, labels: labelProps }),
    [collapsed, expandSidebar, labelProps],
  );
  const drawerContext = useMemo<AppShellContextValue>(
    () => ({ isCollapsed: false, onNavigate: closeDrawer, labels: labelProps }),
    [closeDrawer, labelProps],
  );

  const navigationLabel = resolveLabel('AppShell.labels.navigation', text.navigation);
  const toggleLabel = collapsed
    ? resolveLabel('AppShell.labels.expand', text.expand)
    : resolveLabel('AppShell.labels.collapse', text.collapse);

  return (
    <div
      className={cx(styles.shell, collapsed && styles['shell--collapsed'], className)}
      data-testid={testId}
    >
      <a href={`#${mainId}`} className={styles.shell__skip} onClick={handleSkip}>
        {resolveLabel('AppShell.labels.skipToContent', text.skipToContent)}
      </a>

      <aside className={styles.shell__sidebar}>
        {brand && <div className={styles.shell__brand}>{brand}</div>}
        <AppShellContext.Provider value={sidebarContext}>
          <div className={styles.shell__navigation}>{navigation}</div>
        </AppShellContext.Provider>
        <div className={styles.shell__footer}>
          {sidebarFooter}
          <IconButton
            icon={<ChevronDoubleLeft aria-hidden className={styles.shell__toggle} />}
            label={toggleLabel}
            size="sm"
            className={styles['shell__toggle-button']}
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>
      </aside>

      <div className={styles.shell__frame}>
        <header ref={topbarRef} className={styles.shell__topbar}>
          <IconButton
            icon={<List aria-hidden />}
            label={resolveLabel('AppShell.labels.openNavigation', text.openNavigation)}
            className={styles['shell__menu-button']}
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen(true)}
          />
          {title && <div className={styles.shell__title}>{title}</div>}
          {search && <div className={styles.shell__search}>{search}</div>}
          {actions && <div className={styles.shell__actions}>{actions}</div>}
        </header>

        <main ref={mainRef} id={mainId} tabIndex={-1} className={styles.shell__content}>
          {children}
        </main>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={navigationLabel}
        side="start"
        size="sm"
        className={styles.shell__drawer}
      >
        {/* Drawn only while open: a closed dialog must not hold a second navigation landmark. */}
        {isDrawerOpen && (
          <AppShellContext.Provider value={drawerContext}>
            {brand && <div className={styles['shell__drawer-brand']}>{brand}</div>}
            {navigation}
          </AppShellContext.Provider>
        )}
      </Drawer>
    </div>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(AppShell, 'AppShell')) as typeof AppShell;
