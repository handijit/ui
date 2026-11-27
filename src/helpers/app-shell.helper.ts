/** Which navigation link is the current page — `AppShellNav` (3.2). */

/** The path of an address without its query, fragment and trailing slash (`/a/?b#c` → `/a`). */
const pathOf = (href: string): string => {
  const path = href.split(/[?#]/)[0];

  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
};

/**
 * True when `href` is the current page or one of its ancestors, by whole segments: `/orders`
 * matches `/orders` and `/orders/42`, never `/orders-archive`. The root (`/`) matches only
 * itself: it is the ancestor of every page, not the page of every address.
 */
export const matchesPath = (href: string, currentPath: string): boolean => {
  const base = pathOf(href);
  const current = pathOf(currentPath);

  return current === base || (base !== '/' && current.startsWith(`${base}/`));
};

/**
 * The link of the current page among `hrefs`: the LONGEST one that matches. A panel's home
 * (`/panel`) is an ancestor of every page, so "any match" would mark it next to `/panel/orders`.
 */
export const findActiveHref = (
  hrefs: readonly string[],
  currentPath: string | undefined,
): string | undefined => {
  if (currentPath === undefined) return undefined;

  let active: string | undefined;
  for (const href of hrefs) {
    if (!matchesPath(href, currentPath)) continue;
    if (active === undefined || pathOf(href).length > pathOf(active).length) active = href;
  }

  return active;
};
