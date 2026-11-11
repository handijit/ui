import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FC, useRef, useState } from 'react';

import Popover from '@/components/Popover';
import { resetModalStack } from '@/helpers/focus.helper';

/*
 * Focus contract of `Popover` (2.3): the first focus lands inside once the surface is placed, an
 * `initialFocus` ref wins, closing gives the focus back to the trigger, and Tab at either edge of
 * the portalled surface leaves it for a real stop instead of `<body>`.
 */

const Harness: FC<{ withInitialFocus?: boolean; onOpenChange?: (isOpen: boolean) => void }> = ({
  withInitialFocus = false,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const secondRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button type="button">Önce</button>
      <Popover
        label="Başlangıç listesi"
        isOpen={isOpen}
        onOpenChange={next => {
          onOpenChange?.(next);
          setIsOpen(next);
        }}
        initialFocus={withInitialFocus ? secondRef : undefined}
        trigger={<button type="button">Liste</button>}
      >
        <button type="button">Ürün ekle</button>
        <button type="button" ref={secondRef}>
          Turu başlat
        </button>
      </Popover>
      <button type="button">Sonra</button>
    </>
  );
};

const trigger = () => screen.getByRole('button', { name: 'Liste' });

beforeEach(() => resetModalStack());

describe('Popover — focus', () => {
  it('the first focusable element inside takes the focus on open', async () => {
    render(<Harness />);

    await userEvent.click(trigger());

    expect(screen.getByRole('button', { name: 'Ürün ekle' })).toHaveFocus();
  });

  it('`initialFocus` wins over the first focusable element', async () => {
    render(<Harness withInitialFocus />);

    await userEvent.click(trigger());

    expect(screen.getByRole('button', { name: 'Turu başlat' })).toHaveFocus();
  });

  it('Escape closes and gives the focus back to the trigger', async () => {
    render(<Harness />);

    await userEvent.click(trigger());
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('Tab past the last element goes to the stop after the trigger and closes, once', async () => {
    const onOpenChange = jest.fn();
    render(<Harness onOpenChange={onOpenChange} />);

    await userEvent.click(trigger());
    onOpenChange.mockClear();
    act(() => screen.getByRole('button', { name: 'Turu başlat' }).focus());
    await userEvent.tab();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sonra' })).toHaveFocus();
    expect(document.activeElement).not.toBe(document.body);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Shift+Tab before the first element goes back to the trigger and closes', async () => {
    render(<Harness />);

    await userEvent.click(trigger());
    await userEvent.tab({ shift: true });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('Tab between the elements inside stays inside', async () => {
    render(<Harness />);

    await userEvent.click(trigger());
    const surface = screen.getByRole('dialog');
    fireEvent.keyDown(screen.getByRole('button', { name: 'Ürün ekle' }), { key: 'Tab' });

    expect(surface).toBeInTheDocument();
  });

  it('a surface without focusable content takes the focus itself and Tab leaves it', async () => {
    render(
      <>
        <Popover label="Yardım" trigger={<button type="button">Yardım</button>}>
          Yalnızca metin
        </Popover>
        <button type="button">Sonra</button>
      </>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Yardım' }));
    expect(screen.getByRole('dialog')).toHaveFocus();

    await userEvent.tab();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sonra' })).toHaveFocus();
  });

  it('the trigger is the stop when nothing follows it', async () => {
    render(
      <Popover label="Yardım" trigger={<button type="button">Yardım</button>}>
        <button type="button">Tamam</button>
      </Popover>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Yardım' }));
    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'Yardım' })).toHaveFocus();
  });
});
