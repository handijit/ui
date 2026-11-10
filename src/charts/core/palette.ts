import { cssVar } from '@handijit/design';

/**
 * SERIES COLOURS — the six data series tokens of `@handijit/design` (`chart-1…6`), which the design
 * package gates for contrast against the theme surfaces and for distance from each other.
 * `muted` is for a waiting or empty part.
 */
export type ChartTone =
  'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5' | 'chart-6' | 'muted';

export const TONE_ORDER: readonly ChartTone[] = [
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'chart-6',
];

/** Takes a missing tone from the order; wraps after six series (the legend name tells them apart). */
export const toneAt = (index: number, tone?: ChartTone): ChartTone =>
  tone ?? TONE_ORDER[index % TONE_ORDER.length];

/** A CSS colour — the variable resolves when the theme changes, no redraw needed. */
export const toneColor = (tone: ChartTone): string => cssVar(tone === 'muted' ? 'text-3' : tone);
