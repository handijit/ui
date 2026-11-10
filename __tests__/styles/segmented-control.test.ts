/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';

import { themes } from '@handijit/design';

const source = readFileSync('src/components/SegmentedControl/index.module.scss', 'utf8');

/** Relative luminance of a `#rrggbb` colour (WCAG 2.x). */
const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map(index => {
    const channel = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

describe('SegmentedControl', () => {
  it('draws the chosen segment on bg-overlay over the bg-raised track', () => {
    expect(source).toMatch(/\.segmented \{[^}]*background-color: \$bg-raised;/);
    expect(source).toMatch(/&--selected \{[^}]*background-color: \$bg-overlay;/);
  });

  it.each(['light', 'dark'] as const)(
    'lifts the chosen segment above the track in the %s theme',
    theme => {
      const { 'bg-overlay': chosen, 'bg-raised': track } = themes[theme];

      expect(luminance(chosen)).toBeGreaterThan(luminance(track));
    },
  );
});
