'use client';

import {
  type FocusEvent,
  type KeyboardEvent,
  memo,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { ChevronDown } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { FOCUSABLE_SELECTOR } from '../../helpers/focus.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import type { UiLinkExtraProps } from '../../types/link.type';
import type { Formatter } from '../../types/theme.type';
import Disclosure from '../Disclosure';
import Drawer from '../Drawer';
import UiLink from '../Link';

import styles from './index.module.scss';

/** A sub-category link of a panel column. */
export type MegaMenuLink = {
  id: string;
  label: string;
  href: string;
  /** A small icon before the label. */
  icon?: ReactNode;
  /** A thumbnail before the label (an `<img alt="">`); wins over `icon`. */
  image?: ReactNode;
  /** A short line under the label. */
  description?: string;
  linkProps?: UiLinkExtraProps;
};

/** One column of a panel: a titled group of links ("Fren sistemi"). */
export type MegaMenuColumn = {
  id: string;
  title?: string;
  /** Makes the title a link to the group's page. */
  href?: string;
  links: MegaMenuLink[];
};

/** A top-level category: a link, or a button that opens a panel when it has `columns`. */
export type MegaMenuItem = {
  id: string;
  label: string;
  /** The category's page: the item's link, or the panel's "see all" link. */
  href?: string;
  icon?: ReactNode;
  columns?: MegaMenuColumn[];
  /** A slot at the panel's end: a campaign card, a featured brand. */
  feature?: ReactNode;
  /** The current section of the site. */
  isActive?: boolean;
  linkProps?: UiLinkExtraProps;
};

export type MegaMenuLabels = {
  navigation: string;
  menu: string;
  seeAll: Formatter<[label: string]>;
};

type Props = {
  items: MegaMenuItem[];
  /** The landmark's name; `labels.megaMenu.navigation` by default. */
  label?: string;
  /**
   * Narrow screens: the categories in a `Drawer` from the start edge, each one a section that
   * opens in place. The bar itself is hidden at tablet width and below; the app's menu button
   * opens the drawer.
   */
  isDrawerOpen?: boolean;
  onDrawerClose?: () => void;
  labels?: Partial<MegaMenuLabels>;
  className?: string;
  testId?: string;
};

/* A pointer resting this long on a category opens it; leaving for this long closes it. */
const OPEN_DELAY = 120;
const CLOSE_DELAY = 200;

const hasPanel = (item: MegaMenuItem): boolean => (item.columns?.length ?? 0) > 0;

/**
 * A storefront header's category navigation (3.4): top-level categories, a panel of sub-category
 * columns (with icons or thumbnails and a feature slot) under each, opened by click, keyboard or a
 * resting pointer; a drawer of sections on a narrow screen. A disclosure navigation, not an ARIA
 * menu: the links are links, Tab moves through them, ←/→ move along the bar, Escape closes.
 */
const MegaMenu = ({
  items,
  label,
  isDrawerOpen = false,
  onDrawerClose,
  labels: labelProps,
  className,
  testId,
}: Props) => {
  const { labels: config } = useUi();
  const text = config?.megaMenu;
  const baseId = useId();
  const navRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const [openId, setOpenId] = useState<string | null>(null);

  const navigation = resolveLabel(
    'MegaMenu.label',
    label ?? labelProps?.navigation,
    text?.navigation,
  );
  const seeAll = (item: MegaMenuItem) =>
    resolveFormatter('MegaMenu.labels.seeAll', labelProps?.seeAll ?? text?.seeAll, item.label);

  const schedule = (next: string | null, delay: number) => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpenId(next), delay);
  };

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  /* A press outside the bar closes the open panel. */
  useEffect(() => {
    if (openId === null) return;

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenId(null);
    };
    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [openId]);

  const triggerOf = (id: string) =>
    navRef.current?.querySelector<HTMLElement>(`[data-ui-mega-top="${id}"]`);

  const close = (id: string) => {
    window.clearTimeout(timerRef.current);
    setOpenId(null);
    triggerOf(id)?.focus();
  };

  /* ←/→/Home/End along the top level; ↓ opens a panel and enters it; Escape closes it. */
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, item: MegaMenuItem) => {
    const target = event.target as HTMLElement;

    if (event.key === 'Escape' && openId === item.id) {
      event.preventDefault();
      close(item.id);
      return;
    }

    if (target.dataset.uiMegaTop === undefined) return;

    if (event.key === 'ArrowDown' && hasPanel(item)) {
      event.preventDefault();
      setOpenId(item.id);
      /* The panel is shown by this render: enter it once it is in the tree. */
      window.requestAnimationFrame(() =>
        document
          .getElementById(`${baseId}-${item.id}`)
          ?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
          ?.focus(),
      );
      return;
    }

    /* The keys come from inside the navigation, so it is in the tree. */
    const nav = navRef.current as HTMLElement;
    const tops = [...nav.querySelectorAll<HTMLElement>('[data-ui-mega-top]')];
    const index = tops.indexOf(target);
    const forward = document.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = document.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const next =
      event.key === forward
        ? (index + 1) % tops.length
        : event.key === backward
          ? (index - 1 + tops.length) % tops.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tops.length - 1
              : -1;
    if (next === -1) return;

    event.preventDefault();
    if (openId !== null) setOpenId(null);
    tops[next].focus();
  };

  const handlePointerEnter = (event: PointerEvent<HTMLElement>, item: MegaMenuItem) => {
    if (event.pointerType !== 'mouse') return;
    schedule(hasPanel(item) ? item.id : null, OPEN_DELAY);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse') schedule(null, CLOSE_DELAY);
  };

  /* Tabbing out of the navigation closes the panel behind it. */
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!navRef.current?.contains(event.relatedTarget as Node | null)) setOpenId(null);
  };

  const renderLink = (link: MegaMenuLink, onNavigate?: () => void) => (
    <li key={link.id}>
      <UiLink {...link.linkProps} href={link.href} className={styles.link} onClick={onNavigate}>
        {(link.image ?? link.icon) && (
          <span
            aria-hidden
            className={cx(
              styles.link__media,
              link.image !== undefined && styles['link__media--image'],
            )}
          >
            {link.image ?? link.icon}
          </span>
        )}
        <span className={styles.link__text}>
          <span className={styles.link__label}>{link.label}</span>
          {link.description && <span className={styles.link__description}>{link.description}</span>}
        </span>
      </UiLink>
    </li>
  );

  /* `scope` keeps the ids of the bar's panel and the drawer's copy apart. */
  const renderColumns = (item: MegaMenuItem, scope: 'bar' | 'drawer', onNavigate?: () => void) =>
    item.columns?.map(column => {
      const headingId = `${baseId}-${scope}-${item.id}-${column.id}`;

      return (
        <div key={column.id} className={styles.column}>
          {column.title && (
            <p id={headingId} className={styles.column__title}>
              {column.href ? (
                <UiLink href={column.href} className={styles.column__link} onClick={onNavigate}>
                  {column.title}
                </UiLink>
              ) : (
                column.title
              )}
            </p>
          )}
          <ul
            className={styles.column__list}
            aria-labelledby={column.title ? headingId : undefined}
          >
            {column.links.map(link => renderLink(link, onNavigate))}
          </ul>
        </div>
      );
    });

  const closeDrawer = () => onDrawerClose?.();

  return (
    <>
      <nav
        ref={navRef}
        aria-label={navigation}
        className={cx(styles.menu, className)}
        data-testid={testId}
        onBlur={handleBlur}
      >
        <ul className={styles.menu__bar}>
          {items.map(item => {
            const isOpen = openId === item.id;
            const panelId = `${baseId}-${item.id}`;

            if (!hasPanel(item))
              return (
                <li
                  key={item.id}
                  className={styles.menu__entry}
                  onPointerEnter={event => handlePointerEnter(event, item)}
                >
                  <UiLink
                    {...item.linkProps}
                    href={item.href ?? '#'}
                    data-ui-mega-top={item.id}
                    className={cx(styles.top, item.isActive && styles['top--active'])}
                    aria-current={item.isActive ? 'page' : undefined}
                    onKeyDown={(event: KeyboardEvent<HTMLElement>) => handleKeyDown(event, item)}
                  >
                    {item.icon && (
                      <span aria-hidden className={styles.top__icon}>
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </UiLink>
                </li>
              );

            return (
              <li
                key={item.id}
                className={styles.menu__entry}
                onPointerEnter={event => handlePointerEnter(event, item)}
                onPointerLeave={handlePointerLeave}
                onKeyDown={event => handleKeyDown(event, item)}
              >
                <button
                  type="button"
                  data-ui-mega-top={item.id}
                  className={cx(
                    styles.top,
                    item.isActive && styles['top--active'],
                    isOpen && styles['top--open'],
                  )}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => {
                    window.clearTimeout(timerRef.current);
                    setOpenId(isOpen ? null : item.id);
                  }}
                >
                  {item.icon && (
                    <span aria-hidden className={styles.top__icon}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                  <ChevronDown aria-hidden className={styles.top__chevron} />
                </button>

                <div id={panelId} className={styles.panel} hidden={!isOpen}>
                  <div className={styles.panel__columns}>{renderColumns(item, 'bar')}</div>
                  {item.feature && <div className={styles.panel__feature}>{item.feature}</div>}
                  {item.href && (
                    <UiLink {...item.linkProps} href={item.href} className={styles.panel__all}>
                      {seeAll(item)}
                    </UiLink>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Drawn only while open, like `FacetSidebar`'s drawer. */}
      {isDrawerOpen && (
        <Drawer
          isOpen
          onClose={closeDrawer}
          title={resolveLabel('MegaMenu.labels.menu', labelProps?.menu, text?.menu)}
          side="start"
          size="sm"
        >
          <nav aria-label={navigation}>
            <ul className={styles.drawer}>
              {items.map(item =>
                hasPanel(item) ? (
                  <li key={item.id}>
                    <Disclosure variant="plain" summary={item.label} isDefaultOpen={item.isActive}>
                      <div className={styles.drawer__section}>
                        {item.href && (
                          <UiLink
                            {...item.linkProps}
                            href={item.href}
                            className={styles.panel__all}
                            onClick={closeDrawer}
                          >
                            {seeAll(item)}
                          </UiLink>
                        )}
                        {renderColumns(item, 'drawer', closeDrawer)}
                      </div>
                    </Disclosure>
                  </li>
                ) : (
                  <li key={item.id}>
                    <UiLink
                      {...item.linkProps}
                      href={item.href ?? '#'}
                      className={styles.drawer__link}
                      aria-current={item.isActive ? 'page' : undefined}
                      onClick={closeDrawer}
                    >
                      {item.label}
                    </UiLink>
                  </li>
                ),
              )}
            </ul>
          </nav>
        </Drawer>
      )}
    </>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(MegaMenu, 'MegaMenu')) as typeof MegaMenu;
