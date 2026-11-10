/**
 * An id reference list (`aria-describedby`, `aria-labelledby`): the given ids in order, each once,
 * empty entries dropped, `undefined` when nothing is left (an empty attribute points at nothing).
 * An entry may itself be a list (`"a b"`): a passed `aria-describedby` that already names the
 * control's hint does not make the hint read twice.
 */
export const idList = (...ids: (string | false | null | undefined)[]): string | undefined =>
  [...new Set(ids.flatMap(id => (id ? id.split(/\s+/) : [])).filter(Boolean))].join(' ') ||
  undefined;
