/** Kaydırma yardımcıları. */

import { isClient } from '@handijitcom/utils';

/**
 * Pencereyi en üste alır; ortam desteklemiyorsa sessizce geçer.
 * ⚠ Kaydırma ANIDIR.
 */
export const scrollWindowToTop = (): void => {
  if (!isClient() || typeof window.scrollTo !== 'function') return;

  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
};

/** Öğeyi görünür alana kaydırır; ortam desteklemiyorsa sessizce geçer. */
export const scrollIntoViewIfPossible = (
  element: Element | null | undefined,
  options?: ScrollIntoViewOptions,
): void => {
  if (typeof element?.scrollIntoView === 'function') element.scrollIntoView(options);
};

/**
 * Scrolls a horizontal strip so that `child` is fully in view, `margin` px clear of its edges (3.2.1).
 * Only the strip moves — `scrollIntoView` would scroll the page too, so a strip below the fold would
 * pull the page down on the first paint.
 */
export const scrollIntoInlineView = (
  container: HTMLElement | null | undefined,
  child: Element | null | undefined,
  margin = 0,
): void => {
  if (!container || !child) return;

  const box = container.getBoundingClientRect();
  const rect = child.getBoundingClientRect();
  const before = rect.left - (box.left + margin);
  const after = rect.right - (box.right - margin);

  if (before < 0) container.scrollLeft += before;
  else if (after > 0) container.scrollLeft += after;
};
