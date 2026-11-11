import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Popover from '@/components/Popover';
import { resetModalStack } from '@/helpers/focus.helper';

/*
 * The surface is drawn `visibility: hidden` until `usePositioning` has measured it, and a browser
 * ignores `focus()` on a hidden element. 2.2 moved the focus in that first commit, so the keyboard
 * stayed on the trigger (the desktop program waited two animation frames and focused it itself).
 * jsdom does not check visibility; the hook is held here to prove the order.
 */
let isPositioned = false;

jest.mock('@/hooks/usePositioning', () => ({
  __esModule: true,
  default: () => ({
    style: { position: 'fixed', top: 0, left: 0 },
    side: 'bottom',
    anchorWidth: 0,
    isPositioned,
  }),
}));

beforeEach(() => {
  resetModalStack();
  isPositioned = false;
});

describe('Popover — the first focus waits for the placement', () => {
  it('does not move the focus while the surface is hidden, and moves it once placed', async () => {
    const { rerender } = render(
      <Popover label="Liste" trigger={<button type="button">Aç</button>}>
        <button type="button">Başla</button>
      </Popover>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Aç' }));

    /* By text: a `visibility: hidden` surface is out of the accessibility tree. */
    const inside = screen.getByText('Başla');
    expect(document.querySelector('[role="dialog"]')).toHaveStyle({ visibility: 'hidden' });
    expect(inside).not.toHaveFocus();

    isPositioned = true;
    act(() => {
      rerender(
        <Popover label="Liste" trigger={<button type="button">Aç</button>}>
          <button type="button">Başla</button>
        </Popover>,
      );
    });

    expect(inside).toHaveFocus();
  });

  it('a later placement (scroll, resize) does not take the focus back', async () => {
    isPositioned = true;
    const view = (
      <>
        <Popover label="Liste" trigger={<button type="button">Aç</button>}>
          <input aria-label="Ara" />
          <button type="button">Başla</button>
        </Popover>
      </>
    );
    const { rerender } = render(view);

    await userEvent.click(screen.getByRole('button', { name: 'Aç' }));
    act(() => screen.getByRole('button', { name: 'Başla' }).focus());

    isPositioned = false;
    act(() => rerender(view));
    isPositioned = true;
    act(() => rerender(view));

    expect(screen.getByRole('button', { name: 'Başla' })).toHaveFocus();
  });
});
