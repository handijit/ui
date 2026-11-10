'use client';

import { useEffect, useState } from 'react';

import { cssVarName, THEME_ATTRIBUTE, type TokenName } from '@handijit/design';
import { isClient } from '@handijit/utils';

/** Returned on the server and in the first frame: drawing libraries paint an empty string black. */
const FALLBACK = 'currentColor';

const read = <TName extends TokenName>(
  names: readonly TName[],
  element: Element,
): Record<TName, string> => {
  const style = getComputedStyle(element);

  return Object.fromEntries(
    names.map(name => [name, style.getPropertyValue(cssVarName(name)).trim() || FALLBACK]),
  ) as Record<TName, string>;
};

const isSame = (first: Record<string, string>, second: Record<string, string>): boolean =>
  Object.keys(first).every(key => first[key] === second[key]);

/**
 * The RESOLVED values of design tokens — for drawing libraries that cannot read a CSS variable
 * (a canvas, an SVG attribute that rejects `var(--…)`).
 * Names are the token names of `@handijit/design` without the `--hd-` prefix. The values follow the
 * root theme (`data-theme`, the system setting, an inline override on `<html>`).
 * ⚠ Every value is `currentColor` in the server output and in the first frame before hydration.
 * @example const colors = useUiTokens(['chart-1', 'chart-2', 'border']);
 */
const useUiTokens = <TName extends TokenName>(names: readonly TName[]): Record<TName, string> => {
  /* The array may be a new object on every render; the subscription follows the NAMES. */
  const key = names.join('|');

  const [values, setValues] = useState(
    () => Object.fromEntries(names.map(name => [name, FALLBACK])) as Record<TName, string>,
  );

  useEffect(() => {
    if (!isClient()) return;

    const list = key.split('|') as TName[];
    const update = () =>
      setValues(previous => {
        const next = read(list, document.documentElement);
        return isSame(previous, next) && Object.keys(previous).length === list.length
          ? previous
          : next;
      });

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [THEME_ATTRIBUTE, 'style', 'class'],
    });
    /* A stylesheet added later (the application's brand override) changes the values too. */
    observer.observe(document.head, { childList: true });

    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    query?.addEventListener('change', update);

    return () => {
      observer.disconnect();
      query?.removeEventListener('change', update);
    };
  }, [key]);

  return values;
};

export default useUiTokens;
