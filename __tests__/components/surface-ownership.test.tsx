import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FC, useEffect, useState } from 'react';

import CommandPalette from '@/components/CommandPalette';
import Modal from '@/components/Modal';
import Popover from '@/components/Popover';
import ToastHub, { toast } from '@/components/Toast';
import Tooltip from '@/components/Tooltip';
import { hasOpenSurface, resetModalStack } from '@/helpers/focus.helper';

/*
 * 2.3: a visible toast and an open tooltip do not own the keyboard. 2.2 counted both in
 * `hasOpenSurface()`, so ⌘K and every application shortcut were dead for the 4–8 seconds a notice
 * stayed on screen (the desktop program wrapped its own `hasOpenDialog()` around it).
 */

/** An application shortcut as an app writes it: it yields to a surface that owns the keyboard. */
const useSaveShortcut = (onSave: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== 's' || hasOpenSurface()) return;
      event.preventDefault();
      onSave();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);
};

const App: FC<{ onSave: () => void }> = ({ onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  useSaveShortcut(onSave);

  return (
    <>
      <Tooltip content="Kaydeder">
        <button type="button">Kaydet</button>
      </Tooltip>
      <CommandPalette
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        hotkey="mod+k"
        items={[{ id: 'a', label: 'Ürünler', onSelect: () => {} }]}
        label="Komut paleti"
        searchPlaceholder="Komut ara"
        emptyMessage="Sonuç yok"
      />
      <ToastHub closeLabel="Kapat" regionLabel="Bildirimler" />
    </>
  );
};

const pressMod = (key: string) =>
  fireEvent.keyDown(document, { key, ctrlKey: true, metaKey: true });

const palette = () => screen.queryByRole('dialog', { name: 'Komut paleti', hidden: true });

beforeEach(() => {
  /* jsdom has no `scrollTo`; the scroll lock of the palette and the modal calls it on unlock. */
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  resetModalStack();
  act(() => toast.clear());
});

afterEach(() => {
  act(() => toast.clear());
  jest.restoreAllMocks();
});

describe('surface ownership — toasts and tooltips do not take the keyboard', () => {
  it('a visible toast is not an open surface; it still counts for Escape', () => {
    render(<App onSave={() => {}} />);

    act(() => {
      toast.success('Ürün kaydedildi');
    });

    expect(screen.getByText('Ürün kaydedildi')).toBeInTheDocument();
    expect(hasOpenSurface()).toBe(false);
    expect(hasOpenSurface({ includeTransient: true })).toBe(true);
  });

  it('⌘K opens the command palette while a toast is visible', () => {
    render(<App onSave={() => {}} />);

    act(() => {
      toast.success('Ürün kaydedildi');
    });
    act(() => {
      pressMod('k');
    });

    expect(palette()).toHaveAttribute('open');
  });

  it('⌘K opens the command palette while a tooltip is open', async () => {
    render(<App onSave={() => {}} />);

    act(() => screen.getByRole('button', { name: 'Kaydet' }).focus());
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(hasOpenSurface()).toBe(false);

    act(() => {
      pressMod('k');
    });

    expect(palette()).toHaveAttribute('open');
  });

  it('an application shortcut runs while a toast and a tooltip are visible', async () => {
    const onSave = jest.fn();
    render(<App onSave={onSave} />);

    act(() => {
      toast.info('Bilgi');
    });
    act(() => screen.getByRole('button', { name: 'Kaydet' }).focus());
    await screen.findByRole('tooltip');

    pressMod('s');

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('an application shortcut still yields to an open command palette', () => {
    const onSave = jest.fn();
    render(<App onSave={onSave} />);

    act(() => {
      pressMod('k');
    });
    pressMod('s');

    expect(onSave).not.toHaveBeenCalled();
  });

  it('Escape still closes the newest toast first and marks the key', () => {
    render(<App onSave={() => {}} />);

    act(() => {
      toast.info('Bilgi');
    });

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    act(() => {
      document.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
    expect(screen.queryByText('Bilgi')).not.toBeInTheDocument();
  });
});

describe('surface ownership — surfaces that take the keyboard still count', () => {
  it('an open Popover blocks ⌘K and app shortcuts', async () => {
    const onSave = jest.fn();
    const onOpen = jest.fn();
    render(
      <>
        <Popover label="Başlangıç" trigger={<button type="button">Aç</button>}>
          <button type="button">Başla</button>
        </Popover>
        <CommandPalette
          isOpen={false}
          onClose={() => {}}
          onOpen={onOpen}
          hotkey="mod+k"
          items={[]}
          label="Komut paleti"
          searchPlaceholder="Komut ara"
          emptyMessage="Sonuç yok"
        />
      </>,
    );
    const Shortcut = () => {
      useSaveShortcut(onSave);
      return null;
    };
    render(<Shortcut />);

    await userEvent.click(screen.getByRole('button', { name: 'Aç' }));
    expect(hasOpenSurface()).toBe(true);

    pressMod('k');
    pressMod('s');

    expect(onOpen).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('an open Modal is an open surface even with a toast on top of it', async () => {
    render(
      <>
        <Modal isOpen onClose={() => {}} title="Sevk" closeLabel="Kapat">
          <input aria-label="Saat" />
        </Modal>
        <ToastHub closeLabel="Kapat" regionLabel="Bildirimler" />
      </>,
    );

    act(() => {
      toast.info('Bilgi');
    });

    await waitFor(() => expect(hasOpenSurface()).toBe(true));
    expect(hasOpenSurface({ includeTransient: true })).toBe(true);
  });
});
