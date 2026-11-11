import { render, screen } from '@testing-library/react';
import { type FC, useRef } from 'react';

import Drawer from '@/components/Drawer';
import Modal from '@/components/Modal';
import { resetModalStack } from '@/helpers/focus.helper';
import { DESKTOP, mockViewport, PHONE } from '@tests/support/viewport';

/*
 * Opening focus of the modal dialogs (2.3). 2.2 pulled the focus back to the `<dialog>` whenever the
 * first field was a text box, on every device; on a desktop the user had to click into the field
 * before typing (the desktop program refocused each one with `setTimeout`). React's `autoFocus`
 * cannot help: it runs before `showModal()`. `initialFocus` is the way to name the field.
 */

const DispatchDialog: FC<{ withInitialFocus?: boolean; isOpen?: boolean }> = ({
  withInitialFocus = false,
  isOpen = true,
}) => {
  const timeRef = useRef<HTMLInputElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title="Sevk bilgisi"
      closeLabel="Kapat"
      initialFocus={withInitialFocus ? timeRef : undefined}
    >
      <input aria-label="Tarih" />
      <input aria-label="Saat" ref={timeRef} />
    </Modal>
  );
};

beforeEach(() => {
  resetModalStack();
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  mockViewport(DESKTOP);
  jest.restoreAllMocks();
});

describe('Modal — opening focus', () => {
  it('on a desktop the first text field keeps the focus', () => {
    mockViewport(DESKTOP);
    render(<DispatchDialog />);

    expect(screen.getByRole('textbox', { name: 'Tarih' })).toHaveFocus();
  });

  it('on a touch screen a text field does not take it (no on-screen keyboard by itself)', () => {
    mockViewport(PHONE);
    render(<DispatchDialog />);

    expect(screen.getByRole('textbox', { name: 'Tarih' })).not.toHaveFocus();
    expect(screen.getByRole('dialog', { hidden: true })).toHaveFocus();
  });

  it('`initialFocus` names the field, on a desktop', () => {
    mockViewport(DESKTOP);
    render(<DispatchDialog withInitialFocus />);

    expect(screen.getByRole('textbox', { name: 'Saat' })).toHaveFocus();
  });

  it('`initialFocus` is an explicit request: kept on a touch screen too', () => {
    mockViewport(PHONE);
    render(<DispatchDialog withInitialFocus />);

    expect(screen.getByRole('textbox', { name: 'Saat' })).toHaveFocus();
  });

  it('closes the dialog BEFORE giving the focus back (outside the modal nothing is focusable)', () => {
    const Harness: FC<{ isOpen: boolean }> = ({ isOpen }) => (
      <>
        <button type="button">Sevk et</button>
        <DispatchDialog isOpen={isOpen} />
      </>
    );
    const { rerender } = render(<Harness isOpen={false} />);
    const opener = screen.getByRole('button', { name: 'Sevk et' });
    opener.focus();

    rerender(<Harness isOpen />);
    const dialog = screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement;
    let wasOpenOnFocus: boolean | null = null;
    opener.addEventListener('focus', () => {
      wasOpenOnFocus = dialog.open;
    });

    rerender(<Harness isOpen={false} />);

    expect(opener).toHaveFocus();
    expect(wasOpenOnFocus).toBe(false);
  });

  it('gives the focus back when the dialog is unmounted while open', () => {
    const Harness: FC<{ isShown: boolean }> = ({ isShown }) => (
      <>
        <button type="button">Sevk et</button>
        {isShown && <DispatchDialog />}
      </>
    );
    const { rerender } = render(<Harness isShown={false} />);
    const opener = screen.getByRole('button', { name: 'Sevk et' });
    opener.focus();

    rerender(<Harness isShown />);
    expect(opener).not.toHaveFocus();

    rerender(<Harness isShown={false} />);
    expect(opener).toHaveFocus();
  });
});

describe('Drawer — opening focus', () => {
  const UserDrawer: FC = () => {
    const nameRef = useRef<HTMLInputElement>(null);

    return (
      <Drawer isOpen onClose={() => {}} title="Kullanıcı" closeLabel="Kapat" initialFocus={nameRef}>
        <input aria-label="Rol" />
        <input aria-label="Ad" ref={nameRef} />
      </Drawer>
    );
  };

  it('`initialFocus` names the field', () => {
    mockViewport(DESKTOP);
    render(<UserDrawer />);

    expect(screen.getByRole('textbox', { name: 'Ad' })).toHaveFocus();
  });

  it('without it the first text field keeps the focus on a desktop', () => {
    mockViewport(DESKTOP);
    render(
      <Drawer isOpen onClose={() => {}} title="Kullanıcı" closeLabel="Kapat">
        <input aria-label="Rol" />
      </Drawer>,
    );

    expect(screen.getByRole('textbox', { name: 'Rol' })).toHaveFocus();
  });
});
