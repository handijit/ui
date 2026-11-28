/** Reordering arithmetic of `SortableList` (3.4): pure, so the layout-free tests can measure it. */

/** A box on the screen, as `getBoundingClientRect()` gives it. */
export type SortableRect = { left: number; top: number; width: number; height: number };

/**
 * A copy of `items` with the item at `from` moved to `to`. Out-of-range indexes are clamped; the
 * same index returns an equal copy, never the array itself (the caller may keep it as new state).
 */
export const moveItem = <T>(items: readonly T[], from: number, to: number): T[] => {
  const next = [...items];
  if (next.length === 0) return next;

  const source = Math.max(0, Math.min(next.length - 1, from));
  const target = Math.max(0, Math.min(next.length - 1, to));
  const [moved] = next.splice(source, 1);
  next.splice(target, 0, moved);

  return next;
};

/** Distance from a point to a box: 0 inside it. */
const distanceTo = (rect: SortableRect, x: number, y: number): number => {
  const dx = Math.max(rect.left - x, 0, x - (rect.left + rect.width));
  const dy = Math.max(rect.top - y, 0, y - (rect.top + rect.height));

  return Math.hypot(dx, dy);
};

/**
 * The slot a dragged item belongs in: the box under the pointer, else the nearest one. Works the
 * same for a column, a row and a wrapping grid, because it reads the boxes and not an axis. `-1`
 * when there is no box.
 */
export const nearestIndex = (rects: readonly SortableRect[], x: number, y: number): number => {
  let best = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  rects.forEach((rect, index) => {
    const distance = distanceTo(rect, x, y);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });

  return best;
};
