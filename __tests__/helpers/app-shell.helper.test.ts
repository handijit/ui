import { findActiveHref, matchesPath } from '@/helpers/app-shell.helper';

describe('matchesPath', () => {
  it.each([
    ['/orders', '/orders', true],
    ['/orders', '/orders/42', true],
    ['/orders/', '/orders', true],
    ['/orders', '/orders/?tab=open#top', true],
    ['/orders?status=open', '/orders', true],
    ['/orders', '/orders-archive', false],
    ['/orders/42', '/orders', false],
    ['/', '/', true],
    ['/', '/orders', false],
  ])('%s against %s → %s', (href, current, expected) => {
    expect(matchesPath(href, current)).toBe(expected);
  });
});

describe('findActiveHref', () => {
  const hrefs = ['/panel', '/panel/orders', '/panel/orders/new', '/'];

  it('picks the longest matching link', () => {
    expect(findActiveHref(hrefs, '/panel/orders/42')).toBe('/panel/orders');
    expect(findActiveHref(hrefs, '/panel/orders/new')).toBe('/panel/orders/new');
    expect(findActiveHref(hrefs, '/panel/settings')).toBe('/panel');
  });

  it('keeps the first of two equally long matches', () => {
    expect(findActiveHref(['/a', '/a/'], '/a')).toBe('/a');
  });

  it('has no active link without a path or a match', () => {
    expect(findActiveHref(hrefs, undefined)).toBeUndefined();
    expect(findActiveHref(hrefs, '/elsewhere')).toBeUndefined();
  });
});
