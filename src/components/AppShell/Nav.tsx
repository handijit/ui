'use client';

import { type MouseEvent, type ReactNode, memo, useEffect, useId, useMemo, useState } from 'react';

import { ChevronDown } from 'react-bootstrap-icons';

import { findActiveHref } from '../../helpers/app-shell.helper';
import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import type { UiLinkExtraProps } from '../../types/link.type';
import UiLink from '../Link';
import { useAppShell, useAppShellLabels } from './context';

import styles from './index.module.scss';

/** One entry of `AppShellNav`'s data: a link, or a collapsible group when it has `items`. */
export type AppShellNavLink = {
  id: string;
  label: string;
  /** Without it the entry is a passive row (a screen that is not there yet). */
  href?: string;
  icon?: ReactNode;
  /** A count drawn at the end of the row (and at the icon's corner on the icon rail). */
  badge?: number;
  /** Overrides the `currentPath` match for this entry. */
  isActive?: boolean;
  isDisabled?: boolean;
  /** Nested links: the entry becomes a group that opens and closes. */
  items?: AppShellNavLink[];
  /** An action row without `href` ("Çıkış yap"), 3.4: a button with the link rows' metrics. */
  onClick?: () => void;
  /** Extra props for the router's link component. */
  linkProps?: UiLinkExtraProps;
};

/** A titled block of entries ("Satış", "Raporlar"). */
export type AppShellNavSection = {
  id: string;
  /** Shown above the entries; read as the group's name. */
  label?: string;
  items: AppShellNavLink[];
};

/* Above this the badge reads "99+": a wider badge pushes the label out. */
const BADGE_MAX = 99;

const CountBadge = ({ count }: { count: number }) => {
  const labels = useAppShellLabels();

  return (
    <>
      <span aria-hidden className={styles.nav__badge}>
        {count > BADGE_MAX ? `${BADGE_MAX}+` : count}
      </span>
      <span className={styles.srOnly}>
        {', '}
        {resolveFormatter('AppShell.labels.badge', labels.badge, count)}
      </span>
    </>
  );
};

export type AppShellNavItemProps = {
  label: string;
  /** Without it (or with `isDisabled`) the row is passive. */
  href?: string;
  icon?: ReactNode;
  badge?: number;
  /** The current page: drawn as selected and read as `aria-current="page"`. */
  isActive?: boolean;
  isDisabled?: boolean;
  /**
   * An action instead of a page (3.4) — "Çıkış yap" at the end of an account menu: without `href`
   * the row is a `<button>` that shares the link rows' size, icon column and hover.
   */
  onClick?: () => void;
  linkProps?: UiLinkExtraProps;
  className?: string;
  testId?: string;
};

/** One navigation row: icon, label, count. Rendered through the provider's link component. */
const AppShellNavItemBase = ({
  label,
  href,
  icon,
  badge,
  isActive = false,
  isDisabled = false,
  onClick,
  linkProps,
  className,
  testId,
}: AppShellNavItemProps) => {
  const { isCollapsed, onNavigate } = useAppShell();

  const content = (
    <>
      {icon && (
        <span aria-hidden className={styles.nav__icon}>
          {icon}
        </span>
      )}
      <span className={styles.nav__label}>{label}</span>
      {badge !== undefined && badge > 0 && <CountBadge count={badge} />}
    </>
  );

  /* On the icon rail the label is hidden: the native tooltip names the icon for the pointer. */
  const title = isCollapsed ? label : undefined;

  if (href === undefined && onClick && !isDisabled)
    return (
      <li className={className} data-testid={testId}>
        <button
          type="button"
          className={styles.nav__item}
          title={title}
          onClick={() => {
            onClick();
            onNavigate?.();
          }}
        >
          {content}
        </button>
      </li>
    );

  if (href === undefined || isDisabled)
    return (
      <li className={className} data-testid={testId}>
        <span
          className={cx(styles.nav__item, styles['nav__item--disabled'])}
          aria-disabled="true"
          title={title}
        >
          {content}
        </span>
      </li>
    );

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    (linkProps?.onClick as ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined)?.(event);
    onNavigate?.();
  };

  return (
    <li className={className} data-testid={testId}>
      <UiLink
        {...linkProps}
        href={href}
        className={cx(styles.nav__item, isActive && styles['nav__item--active'])}
        aria-current={isActive ? 'page' : undefined}
        title={title}
        onClick={handleClick}
      >
        {content}
      </UiLink>
    </li>
  );
};

export const AppShellNavItem = /*#__PURE__*/ memo(
  /*#__PURE__*/ named(AppShellNavItemBase, 'AppShellNavItem'),
) as typeof AppShellNavItemBase;

export type AppShellNavGroupProps = {
  label: string;
  icon?: ReactNode;
  badge?: number;
  /**
   * The current page is one of its links: the group opens (at first, and whenever this turns true)
   * and its row is marked on the icon rail.
   */
  hasActiveItem?: boolean;
  /** `AppShellNavItem`s (or nested groups). */
  children: ReactNode;
  className?: string;
  testId?: string;
};

/** A row that opens and closes a nested list of links. */
const AppShellNavGroupBase = ({
  label,
  icon,
  badge,
  hasActiveItem = false,
  children,
  className,
  testId,
}: AppShellNavGroupProps) => {
  const { isCollapsed, onExpandSidebar } = useAppShell();
  const listId = useId();
  const [isExpanded, setIsExpanded] = useState(hasActiveItem);

  /* The page moved into the group (a link elsewhere, the browser's back button): show it. */
  useEffect(() => {
    if (hasActiveItem) setIsExpanded(true);
  }, [hasActiveItem]);

  /* The icon rail has no room for nested links: the list is closed there whatever the state. */
  const isOpen = isExpanded && !isCollapsed;

  const handleClick = () => {
    if (isCollapsed) {
      setIsExpanded(true);
      onExpandSidebar?.();
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <li className={className} data-testid={testId}>
      <button
        type="button"
        className={cx(
          styles.nav__item,
          styles['nav__item--group'],
          hasActiveItem && isCollapsed && styles['nav__item--active'],
        )}
        aria-expanded={isOpen}
        aria-controls={listId}
        title={isCollapsed ? label : undefined}
        onClick={handleClick}
      >
        {icon && (
          <span aria-hidden className={styles.nav__icon}>
            {icon}
          </span>
        )}
        <span className={styles.nav__label}>{label}</span>
        {badge !== undefined && badge > 0 && <CountBadge count={badge} />}
        <ChevronDown
          aria-hidden
          className={cx(styles.nav__chevron, isOpen && styles['nav__chevron--open'])}
        />
      </button>
      <ul id={listId} className={styles.nav__sublist} hidden={!isOpen}>
        {children}
      </ul>
    </li>
  );
};

export const AppShellNavGroup = /*#__PURE__*/ memo(
  /*#__PURE__*/ named(AppShellNavGroupBase, 'AppShellNavGroup'),
) as typeof AppShellNavGroupBase;

const linkHrefs = (links: readonly AppShellNavLink[]): string[] =>
  links.flatMap(link => [
    ...(link.href !== undefined && link.isActive === undefined ? [link.href] : []),
    ...linkHrefs(link.items ?? []),
  ]);

export type AppShellNavProps = {
  /** Titled blocks of links. */
  sections?: AppShellNavSection[];
  /** The router's current path: the longest matching `href` is the current page. */
  currentPath?: string;
  /** The landmark's name; `labels.appShell.navigation` by default. */
  label?: string;
  /** Your own `AppShellNavItem` / `AppShellNavGroup` rows, after the sections. */
  children?: ReactNode;
  className?: string;
  testId?: string;
};

/** The sidebar's `<nav>`: sections of links with icons, counts and nested groups. */
const AppShellNavBase = ({
  sections = [],
  currentPath,
  label,
  children,
  className,
  testId,
}: AppShellNavProps) => {
  const labels = useAppShellLabels();
  const baseId = useId();

  const activeHref = useMemo(
    () => findActiveHref(linkHrefs(sections.flatMap(section => section.items)), currentPath),
    [sections, currentPath],
  );

  const isActive = (link: AppShellNavLink): boolean =>
    link.isActive ?? (link.href !== undefined && link.href === activeHref);

  const containsActive = (link: AppShellNavLink): boolean =>
    (link.items ?? []).some(child => isActive(child) || containsActive(child));

  const renderLink = (link: AppShellNavLink): ReactNode =>
    link.items && link.items.length > 0 ? (
      <AppShellNavGroup
        key={link.id}
        label={link.label}
        icon={link.icon}
        badge={link.badge}
        hasActiveItem={containsActive(link)}
      >
        {link.items.map(renderLink)}
      </AppShellNavGroup>
    ) : (
      <AppShellNavItem
        key={link.id}
        label={link.label}
        href={link.href}
        icon={link.icon}
        badge={link.badge}
        isActive={isActive(link)}
        isDisabled={link.isDisabled}
        onClick={link.onClick}
        linkProps={link.linkProps}
      />
    );

  return (
    <nav
      aria-label={resolveLabel('AppShellNav.label', label, labels.navigation)}
      className={cx(styles.nav, className)}
      data-testid={testId}
    >
      {sections.map(section => {
        const headingId = `${baseId}-${section.id}`;

        return (
          <div
            key={section.id}
            className={styles.nav__section}
            role={section.label ? 'group' : undefined}
            aria-labelledby={section.label ? headingId : undefined}
          >
            {section.label && (
              <p id={headingId} className={styles['nav__section-label']}>
                {section.label}
              </p>
            )}
            <ul className={styles.nav__list}>{section.items.map(renderLink)}</ul>
          </div>
        );
      })}
      {children && <ul className={styles.nav__list}>{children}</ul>}
    </nav>
  );
};

export const AppShellNav = /*#__PURE__*/ memo(
  /*#__PURE__*/ named(AppShellNavBase, 'AppShellNav'),
) as typeof AppShellNavBase;
