/**
 * A `matchMedia` that ANSWERS THE QUERY instead of returning one constant for every question.
 *
 * A constant was enough while the library asked a single thing ("above the mobile width?"). The
 * sheet rule asks two (`max-width` AND `pointer: coarse`), and a stub that says "yes" to both
 * describes a phone while the test believes it set up a desktop.
 */
type Viewport = {
  width: number;
  /** A touch screen as the primary pointer (`pointer: coarse`). */
  isTouch?: boolean;
};

export const DESKTOP: Viewport = { width: 1280 };
export const PHONE: Viewport = { width: 390, isTouch: true };
/** A narrow DESKTOP window: the width of a phone, the pointer of a mouse. */
export const NARROW_DESKTOP: Viewport = { width: 390 };

const matchesFeature = (feature: string, { width, isTouch = false }: Viewport): boolean => {
  const [name, value = ''] = feature
    .replace(/[()]/g, '')
    .split(':')
    .map(part => part.trim());

  if (name === 'min-width') return width >= parseFloat(value);
  if (name === 'max-width') return width <= parseFloat(value);
  if (name === 'pointer') return value === (isTouch ? 'coarse' : 'fine');
  if (name === 'hover') return value === (isTouch ? 'none' : 'hover');

  return false;
};

export const matchesQuery = (query: string, viewport: Viewport): boolean =>
  query.split(/\s+and\s+/).every(feature => matchesFeature(feature, viewport));

export const mockViewport = (viewport: Viewport): void => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: matchesQuery(query, viewport),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
};
