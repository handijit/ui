/**
 * An id reference list (`aria-describedby`, `aria-labelledby`): the given ids in order, empty
 * entries dropped, `undefined` when nothing is left — an empty attribute points at nothing.
 */
export const idList = (...ids: (string | false | null | undefined)[]): string | undefined =>
  ids.filter(Boolean).join(' ') || undefined;
