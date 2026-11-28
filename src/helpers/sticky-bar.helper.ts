/**
 * Whether a watched target has been scrolled PAST (3.4, `StickyActionBar`): out of view and above
 * the viewport. A target still below the fold is out of view too, but its action is ahead of the
 * reader, not behind — the bar would only repeat what is coming.
 */
export const isScrolledPast = (
  entry: Pick<IntersectionObserverEntry, 'isIntersecting' | 'boundingClientRect' | 'rootBounds'>,
): boolean =>
  !entry.isIntersecting && entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0);
