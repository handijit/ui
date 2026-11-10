import { breakpoints } from '@handijit/design';

/** Breakpoints — the values of `@handijit/design` (`$breakpoint-*` in `styles/_variables.scss`). */
export const MOBILE_BREAKPOINT = breakpoints.sm;

export const TABLET_PORTRAIT_BREAKPOINT = breakpoints.md;

export const TABLET_BREAKPOINT = breakpoints.lg;

/** A sidebar is on screen above this width, so a filter panel is hidden there. */
export const ABOVE_TABLET_MEDIA_QUERY = `(min-width: ${TABLET_BREAKPOINT + 1}px)`;

export const ABOVE_MOBILE_MEDIA_QUERY = `(min-width: ${MOBILE_BREAKPOINT + 1}px)`;

/**
 * When a select-like control opens a bottom sheet instead of a dropdown: a NARROW viewport on a
 * TOUCH device. A desktop window is never a sheet, however narrow — a pointer reaches a dropdown
 * next to the trigger faster than a sheet at the bottom edge of the window.
 */
export const SHEET_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT}px) and (pointer: coarse)`;
