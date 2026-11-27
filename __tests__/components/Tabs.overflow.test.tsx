import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Tabs, { type TabItem } from '@/components/Tabs';

const ITEMS: TabItem[] = [
  { id: 'specs', label: 'Teknik özellikler' },
  { id: 'oem', label: 'Uyumlu parça numaraları', count: 4 },
  { id: 'vehicles', label: 'Uyumlu araçlar', count: 3 },
  { id: 'docs', label: 'Açıklama ve dokümanlar' },
  { id: 'alternatives', label: 'Muadil ürünler', count: 1 },
];

type Geometry = { scrollLeft: number; scrollWidth: number; clientWidth: number };

/*
 * jsdom lays nothing out: the strip's scroll geometry and the boxes are stubbed on the prototypes,
 * so they are in place for the first effect too.
 */
const stubStrip = (geometry: Geometry, selectedBox = { left: 40, right: 140 }) => {
  const prototype = HTMLElement.prototype as unknown as Record<string, unknown>;
  for (const key of ['scrollLeft', 'scrollWidth', 'clientWidth'] as const)
    Object.defineProperty(prototype, key, {
      configurable: true,
      get() {
        return this.getAttribute('role') === 'tablist' ? geometry[key] : 0;
      },
      set(value: number) {
        if (this.getAttribute('role') === 'tablist') geometry[key] = value;
      },
    });

  jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: Element,
  ) {
    if (this.getAttribute('role') === 'tablist') return { left: 0, right: 320 } as DOMRect;
    if (this.getAttribute('aria-selected') === 'true') return selectedBox as DOMRect;

    return { left: 0, right: 0 } as DOMRect;
  });
};

afterEach(() => {
  const prototype = HTMLElement.prototype as unknown as Record<string, unknown>;
  for (const key of ['scrollLeft', 'scrollWidth', 'clientWidth']) delete prototype[key];
});

const bar = () => screen.getByRole('tablist').parentElement as HTMLElement;
const scrollButtons = () => bar().querySelectorAll('button[aria-hidden="true"]');

/*
 * 3.2.1: tabs that did not fit were cut at the screen's edge with nothing saying that the strip
 * went on, and a selected tab past the edge stayed hidden on the first paint.
 */
describe('Tabs — a strip that does not fit', () => {
  it('fits: no fade, no scroll buttons', () => {
    stubStrip({ scrollLeft: 0, scrollWidth: 320, clientWidth: 320 });
    render(<Tabs items={ITEMS} ariaLabel="Ürün" />);

    expect(bar()).not.toHaveAttribute('data-fade-start');
    expect(bar()).not.toHaveAttribute('data-fade-end');
    expect(scrollButtons()).toHaveLength(0);
  });

  it('fades and offers a button only at the edges that hide tabs, following the scroll', () => {
    const geometry = { scrollLeft: 0, scrollWidth: 900, clientWidth: 320 };
    stubStrip(geometry);
    render(<Tabs items={ITEMS} ariaLabel="Ürün" />);

    expect(bar()).not.toHaveAttribute('data-fade-start');
    expect(bar()).toHaveAttribute('data-fade-end');
    expect(scrollButtons()).toHaveLength(1);

    geometry.scrollLeft = 300;
    act(() => {
      fireEvent.scroll(screen.getByRole('tablist'));
    });
    expect(bar()).toHaveAttribute('data-fade-start');
    expect(bar()).toHaveAttribute('data-fade-end');
    expect(scrollButtons()).toHaveLength(2);

    geometry.scrollLeft = 580;
    act(() => {
      fireEvent.scroll(screen.getByRole('tablist'));
    });
    expect(bar()).not.toHaveAttribute('data-fade-end');
  });

  it('the buttons scroll two thirds of the strip, out of the tab order and hidden from AT', async () => {
    const geometry = { scrollLeft: 300, scrollWidth: 900, clientWidth: 300 };
    stubStrip(geometry);
    render(<Tabs items={ITEMS} ariaLabel="Ürün" />);

    const [start, end] = scrollButtons();
    expect(end).toHaveAttribute('tabindex', '-1');

    await userEvent.click(end);
    expect(geometry.scrollLeft).toBe(500);
    await userEvent.click(start);
    expect(geometry.scrollLeft).toBe(300);
  });

  it('in a right-to-left page "towards the end" is a negative scroll', async () => {
    const geometry = { scrollLeft: 0, scrollWidth: 900, clientWidth: 300 };
    stubStrip(geometry);
    const computed = window.getComputedStyle;
    jest
      .spyOn(window, 'getComputedStyle')
      .mockImplementation(element =>
        Object.assign(computed(element), { direction: 'rtl' } as Partial<CSSStyleDeclaration>),
      );
    render(<Tabs items={ITEMS} ariaLabel="Ürün" />);

    await userEvent.click(scrollButtons()[0]);
    expect(geometry.scrollLeft).toBe(-200);
  });

  it('scrolls a selected tab past the edge into view on the first paint — the strip, not the page', () => {
    const geometry = { scrollLeft: 0, scrollWidth: 900, clientWidth: 320 };
    stubStrip(geometry, { left: 600, right: 700 });
    const scrollIntoView = jest.spyOn(Element.prototype, 'scrollIntoView');
    render(<Tabs items={ITEMS} ariaLabel="Ürün" defaultTabId="alternatives" />);

    /* 700 - (320 - 24): clear of the 24px fade. */
    expect(geometry.scrollLeft).toBe(404);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
