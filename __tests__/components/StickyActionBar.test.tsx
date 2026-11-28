import { act, render, screen } from '@testing-library/react';

import StickyActionBar from '@/components/StickyActionBar';

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let observed: { callback: Callback; target?: Element; disconnect: jest.Mock }[] = [];

class FakeObserver {
  callback: Callback;
  disconnect = jest.fn();

  constructor(callback: Callback) {
    this.callback = callback;
    observed.push(this);
  }

  observe(target: Element) {
    (this as { target?: Element }).target = target;
  }
}

const scroll = (isIntersecting: boolean, bottom: number) =>
  act(() =>
    observed.at(-1)?.callback([
      {
        isIntersecting,
        boundingClientRect: { bottom } as DOMRectReadOnly,
        rootBounds: { top: 0 } as DOMRectReadOnly,
      },
    ]),
  );

beforeEach(() => {
  observed = [];
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: FakeObserver,
  });
});

afterEach(() => {
  document.documentElement.style.removeProperty('--ui-sticky-bar-height');
});

describe('StickyActionBar', () => {
  it('stays hidden, inert and out of the tree until its target is scrolled past', () => {
    const onVisibilityChange = jest.fn();
    render(
      <>
        <div id="buy-box">Sepete ekle</div>
        <StickyActionBar
          label="Hızlı satın al"
          targetId="buy-box"
          info="Balata"
          onVisibilityChange={onVisibilityChange}
          testId="bar"
        >
          <button type="button">Ekle</button>
        </StickyActionBar>
      </>,
    );

    const bar = screen.getByTestId('bar');
    expect(observed[0].target).toBe(document.getElementById('buy-box'));
    expect(bar).toHaveAttribute('inert');
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('region', { name: 'Hızlı satın al' })).not.toBeInTheDocument();

    scroll(false, -40);
    expect(bar).not.toHaveAttribute('inert');
    expect(bar).toHaveClass('bar--visible');
    expect(screen.getByRole('region', { name: 'Hızlı satın al' })).toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue('--ui-sticky-bar-height')).toBe('0px');
    expect(onVisibilityChange).toHaveBeenLastCalledWith(true);

    scroll(true, 300);
    expect(bar).toHaveAttribute('inert');
    expect(document.documentElement.style.getPropertyValue('--ui-sticky-bar-height')).toBe('');
    expect(onVisibilityChange).toHaveBeenLastCalledWith(false);
  });

  it('watches a ref and stops watching when unmounted', () => {
    const target = document.createElement('div');
    const { unmount } = render(
      <StickyActionBar label="Satın al" targetRef={{ current: target }}>
        <button type="button">Ekle</button>
      </StickyActionBar>,
    );

    expect(observed[0].target).toBe(target);
    unmount();
    expect(observed[0].disconnect).toHaveBeenCalled();
  });

  it('does nothing without a target or an observer, and obeys a controlled visibility', () => {
    const { rerender } = render(
      <StickyActionBar label="Satın al" targetId="yok" testId="bar">
        <button type="button">Ekle</button>
      </StickyActionBar>,
    );
    expect(observed).toHaveLength(0);

    rerender(
      <StickyActionBar label="Satın al" targetRef={{ current: null }} testId="bar">
        <button type="button">Ekle</button>
      </StickyActionBar>,
    );
    expect(observed).toHaveLength(0);

    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    rerender(
      <StickyActionBar label="Satın al" targetRef={{ current: document.body }} testId="bar">
        <button type="button">Ekle</button>
      </StickyActionBar>,
    );
    expect(screen.getByTestId('bar')).toHaveAttribute('inert');

    rerender(
      <StickyActionBar label="Satın al" isVisible testId="bar">
        <button type="button">Ekle</button>
      </StickyActionBar>,
    );
    expect(screen.getByTestId('bar')).not.toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: 'Ekle' })).toBeInTheDocument();
  });

  it('clears its height from the page when unmounted while shown', () => {
    const { unmount } = render(
      <StickyActionBar label="Satın al" isVisible>
        <button type="button">Ekle</button>
      </StickyActionBar>,
    );
    expect(document.documentElement.style.getPropertyValue('--ui-sticky-bar-height')).toBe('0px');

    unmount();
    expect(document.documentElement.style.getPropertyValue('--ui-sticky-bar-height')).toBe('');
  });
});
