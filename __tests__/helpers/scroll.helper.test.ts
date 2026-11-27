import {
  scrollIntoInlineView,
  scrollIntoViewIfPossible,
  scrollWindowToTop,
} from '@/helpers/scroll.helper';

describe('scrollIntoViewIfPossible', () => {
  it('destekleniyorsa çağırır ve seçenekleri geçirir', () => {
    const scrollIntoView = jest.fn();
    const element = { scrollIntoView } as unknown as Element;

    scrollIntoViewIfPossible(element, { block: 'nearest' });

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  });

  it('ortam desteklemiyorsa ATMAZ', () => {
    const element = {} as Element;

    expect(() => scrollIntoViewIfPossible(element, { block: 'nearest' })).not.toThrow();
  });

  it('öğe yoksa ATMAZ', () => {
    expect(() => scrollIntoViewIfPossible(null)).not.toThrow();
    expect(() => scrollIntoViewIfPossible(undefined)).not.toThrow();
  });
});

describe('scrollWindowToTop', () => {
  it('pencereyi ANIDA başa alır', () => {
    const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

    scrollWindowToTop();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
    scrollTo.mockRestore();
  });

  it('ortam desteklemiyorsa ATMAZ', () => {
    const original = window.scrollTo;
    Object.defineProperty(window, 'scrollTo', { value: undefined, configurable: true });

    expect(() => scrollWindowToTop()).not.toThrow();

    Object.defineProperty(window, 'scrollTo', { value: original, configurable: true });
  });
});

describe('scrollIntoInlineView (3.2.1)', () => {
  const box = (left: number, right: number) => ({ left, right }) as DOMRect;

  const strip = (child: { left: number; right: number }) => {
    const container = document.createElement('div');
    const element = document.createElement('button');
    container.append(element);
    container.getBoundingClientRect = () => box(0, 300);
    element.getBoundingClientRect = () => box(child.left, child.right);
    let scrollLeft = 100;
    Object.defineProperty(container, 'scrollLeft', {
      get: () => scrollLeft,
      set: (value: number) => {
        scrollLeft = value;
      },
    });

    return { container, element, scrollLeft: () => scrollLeft };
  };

  it('moves only the strip, toward a child cut at either edge, clear of the margin', () => {
    const before = strip({ left: -50, right: 40 });
    scrollIntoInlineView(before.container, before.element, 24);
    expect(before.scrollLeft()).toBe(100 - 74);

    const after = strip({ left: 250, right: 350 });
    scrollIntoInlineView(after.container, after.element, 24);
    expect(after.scrollLeft()).toBe(100 + 74);
  });

  it('leaves a child in view where it is, and passes over a missing node', () => {
    const inside = strip({ left: 30, right: 200 });
    scrollIntoInlineView(inside.container, inside.element, 24);
    expect(inside.scrollLeft()).toBe(100);

    expect(() => scrollIntoInlineView(null, inside.element)).not.toThrow();
    expect(() => scrollIntoInlineView(inside.container, null)).not.toThrow();
  });
});
