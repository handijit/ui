'use client';

import { type RefObject, useCallback, useLayoutEffect, useRef } from 'react';

/**
 * FOCUS AFTER A REMOVAL (3.4) — `AppliedFilters` and `CompareTray`.
 *
 * The button that removes a chip removes itself: focus falls to `<body>` and a keyboard user is
 * thrown to the top of the page. After the list re-renders, focus goes to the button that took the
 * removed one's place (or the new last one), and to `fallbackRef` when the list is empty.
 *
 * @param containerRef the element that holds the remove buttons.
 * @param selector picks the remove buttons inside it.
 * @returns `markRemoved(index)`: call it in the click handler, before the item leaves the data.
 */
export const useRemovalFocus = (
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  fallbackRef: RefObject<HTMLElement | null>,
): ((index: number) => void) => {
  const pendingRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const index = pendingRef.current;
    if (index === null) return;

    const buttons = containerRef.current?.querySelectorAll<HTMLElement>(selector) ?? [];
    /* The data has not changed yet (the caller removes asynchronously): wait for that render. */
    if (buttons.length > index && buttons[index] === document.activeElement) return;

    pendingRef.current = null;
    const target = buttons[Math.min(index, buttons.length - 1)] ?? fallbackRef.current;
    target?.focus();
  });

  return useCallback((index: number) => {
    pendingRef.current = index;
  }, []);
};
