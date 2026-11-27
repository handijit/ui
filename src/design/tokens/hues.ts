import type { HueName } from '../types';

/**
 * OKLCH hue angle of every chromatic family: the brand's cobalt and coral, and red for danger,
 * the one status colour. The neutrals (`ink`) lean to the cobalt angle, which is ink's own.
 */
const hues: Readonly<Record<HueName, number>> = {
  cobalt: 264,
  coral: 33,
  danger: 14,
};

export default hues;
