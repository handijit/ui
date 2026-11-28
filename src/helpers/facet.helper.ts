import type { FacetOption } from '../components/FacetSection';

/**
 * The options a folded facet list shows (3.4): the first `count`, then every selected one after
 * them, in their own order. A selected value hidden behind "show more" could not be seen or removed.
 */
export const foldedOptions = (
  options: readonly FacetOption[],
  selected: readonly string[],
  count: number,
): FacetOption[] =>
  options.filter((option, index) => index < count || selected.includes(option.value));
