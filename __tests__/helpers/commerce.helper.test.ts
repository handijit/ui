import { itemsPerViewStyle } from '@/helpers/carousel.helper';
import { foldedOptions } from '@/helpers/facet.helper';
import { moveItem, nearestIndex } from '@/helpers/sortable.helper';
import { isScrolledPast } from '@/helpers/sticky-bar.helper';

describe('moveItem', () => {
  it('moves an item forward and backward without touching the input', () => {
    const items = ['a', 'b', 'c', 'd'];

    expect(moveItem(items, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(items, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(items).toEqual(['a', 'b', 'c', 'd']);
  });

  it('clamps indexes outside the list and returns a fresh copy for the same index', () => {
    const items = ['a', 'b', 'c'];

    expect(moveItem(items, -4, 9)).toEqual(['b', 'c', 'a']);
    const same = moveItem(items, 1, 1);
    expect(same).toEqual(items);
    expect(same).not.toBe(items);
  });

  it('returns an empty list for an empty list', () => {
    expect(moveItem([], 0, 1)).toEqual([]);
  });
});

describe('nearestIndex', () => {
  const column = [
    { left: 0, top: 0, width: 100, height: 40 },
    { left: 0, top: 48, width: 100, height: 40 },
    { left: 0, top: 96, width: 100, height: 40 },
  ];

  it('picks the box under the pointer', () => {
    expect(nearestIndex(column, 50, 60)).toBe(1);
  });

  it('picks the nearest box in a gap or outside the list', () => {
    expect(nearestIndex(column, 50, 43)).toBe(0);
    expect(nearestIndex(column, 50, 46)).toBe(1);
    expect(nearestIndex(column, 50, 300)).toBe(2);
    expect(nearestIndex(column, -20, -20)).toBe(0);
  });

  it('reads a wrapping grid by its boxes', () => {
    const grid = [
      { left: 0, top: 0, width: 80, height: 80 },
      { left: 90, top: 0, width: 80, height: 80 },
      { left: 0, top: 90, width: 80, height: 80 },
    ];

    expect(nearestIndex(grid, 120, 30)).toBe(1);
    expect(nearestIndex(grid, 30, 150)).toBe(2);
  });

  it('gives -1 without boxes', () => {
    expect(nearestIndex([], 0, 0)).toBe(-1);
  });
});

describe('foldedOptions', () => {
  const options = ['a', 'b', 'c', 'd', 'e'].map(value => ({ value, label: value.toUpperCase() }));

  it('keeps the first options and every selected one after them, in order', () => {
    expect(foldedOptions(options, ['e', 'a'], 2).map(option => option.value)).toEqual([
      'a',
      'b',
      'e',
    ]);
  });
});

describe('itemsPerViewStyle', () => {
  it('fills every breakpoint from the one below', () => {
    expect(itemsPerViewStyle({ base: 1.5, md: 3, xl: 5 })).toEqual({
      '--ui-carousel-per-view-base': '1.5',
      '--ui-carousel-per-view-sm': '1.5',
      '--ui-carousel-per-view-md': '3',
      '--ui-carousel-per-view-lg': '3',
      '--ui-carousel-per-view-xl': '5',
    });
  });

  it('starts at one card and never goes below it', () => {
    expect(itemsPerViewStyle({ sm: 0.5 })['--ui-carousel-per-view-base']).toBe('1');
    expect(itemsPerViewStyle({ sm: 0.5 })['--ui-carousel-per-view-sm']).toBe('1');
  });
});

describe('isScrolledPast', () => {
  const entry = (isIntersecting: boolean, bottom: number, top: number | null = 0) => ({
    isIntersecting,
    boundingClientRect: { bottom } as DOMRectReadOnly,
    rootBounds: top === null ? null : ({ top } as DOMRectReadOnly),
  });

  it('is true once the target is out of view above the viewport', () => {
    expect(isScrolledPast(entry(false, -10))).toBe(true);
    expect(isScrolledPast(entry(false, -10, null))).toBe(true);
  });

  it('is false while the target is visible or still below the fold', () => {
    expect(isScrolledPast(entry(true, 200))).toBe(false);
    expect(isScrolledPast(entry(false, 1400))).toBe(false);
  });
});
