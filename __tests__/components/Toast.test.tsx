import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { UiProvider, ToastPortal, toast } from '../../src';
import { LABELS } from '../fixtures/labels';

const renderPortal = () =>
  render(
    <UiProvider labels={LABELS}>
      <ToastPortal />
    </UiProvider>,
  );

beforeEach(() => {
  act(() => toast.clear());
});

afterEach(() => {
  act(() => toast.clear());
  jest.useRealTimers();
});

describe('Toast', () => {
  it('bildirim CANLI BÖLGEDE duyurulur', () => {
    renderPortal();

    act(() => {
      toast.success('Adres kaydedildi');
    });

    expect(screen.getByRole('status')).toHaveTextContent('Adres kaydedildi');
  });

  it('kuyruk GÖRÜNÜR TAVANI aşmaz', () => {
    renderPortal();

    act(() => {
      toast.info('bir');
      toast.info('iki');
      toast.info('üç');
      toast.info('dört');
    });

    expect(screen.queryByText('bir')).not.toBeInTheDocument();
    expect(screen.getByText('dört')).toBeInTheDocument();
  });

  it('süre DOLUNCA kendiliğinden kapanır', () => {
    jest.useFakeTimers();
    renderPortal();

    act(() => {
      toast.success('Kaydedildi');
    });
    expect(screen.getByText('Kaydedildi')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4_000);
    });

    expect(screen.queryByText('Kaydedildi')).not.toBeInTheDocument();
  });

  it('HATA bildirimi bilgi bildiriminden UZUN durur', () => {
    jest.useFakeTimers();
    renderPortal();

    act(() => {
      toast.info('bilgi');
      toast.error('hata');
    });

    act(() => {
      jest.advanceTimersByTime(4_000);
    });

    expect(screen.queryByText('bilgi')).not.toBeInTheDocument();
    expect(screen.getByText('hata')).toBeInTheDocument();
  });

  it('`duration: 0` bildirimi KALICI yapar', () => {
    jest.useFakeTimers();
    renderPortal();

    act(() => {
      toast.show('Sürekli', { duration: 0 });
    });

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(screen.getByText('Sürekli')).toBeInTheDocument();
  });

  it('`clear()` sayfa geçişinde bayat bildirim bırakmaz', () => {
    renderPortal();

    act(() => {
      toast.info('eski');
    });
    expect(screen.getByText('eski')).toBeInTheDocument();

    act(() => toast.clear());

    expect(screen.queryByText('eski')).not.toBeInTheDocument();
  });

  it('`dismiss(id)` YALNIZCA hedefi kapatır', () => {
    renderPortal();

    let id = 0;
    act(() => {
      id = toast.info('kapanacak');
      toast.info('kalacak');
    });

    act(() => toast.dismiss(id));

    expect(screen.queryByText('kapanacak')).not.toBeInTheDocument();
    expect(screen.getByText('kalacak')).toBeInTheDocument();
  });

  it('EYLEM düğmesi çalışır ve bildirimi kapatır', async () => {
    const user = userEvent.setup();
    const retry = jest.fn();
    renderPortal();

    act(() => {
      toast.error('Kart reddedildi', { action: { label: 'Yeniden dene', onClick: retry } });
    });

    await user.click(screen.getByRole('button', { name: 'Yeniden dene' }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('portal YOKKEN `toast.*` PATLAMAZ', () => {
    expect(() => act(() => void toast.error('portalsız'))).not.toThrow();
  });
});

describe('ToastHub — placement and inset (2.3)', () => {
  const region = () => screen.getByRole('region', { name: 'Bildirimler' });
  const renderHub = (props: ComponentProps<typeof ToastPortal> = {}) =>
    render(
      <UiProvider labels={LABELS}>
        <ToastPortal regionLabel="Bildirimler" {...props} />
      </UiProvider>,
    );

  it('`bottom-end` by default, at every width: no centring class', () => {
    renderHub();

    expect(region()).toHaveClass('hub', 'hub--bottom');
    expect(region()).not.toHaveClass('hub--center');
    expect(region()).not.toHaveClass('hub--start');
  });

  it.each([
    ['bottom-start', 'hub--bottom', 'hub--start'],
    ['bottom-center', 'hub--bottom', 'hub--center'],
    ['top-end', 'hub--top', null],
    ['top-start', 'hub--top', 'hub--start'],
    ['top-center', 'hub--top', 'hub--center'],
  ] as const)('`%s` picks the edge and the alignment', (placement, edge, align) => {
    renderHub({ placement });

    expect(region()).toHaveClass(edge, ...(align ? [align] : []));
  });

  it('`inset` writes CSS lengths to the stack box (a sidebar stays clear)', () => {
    renderHub({ inset: { inlineStart: '232px', bottom: 'var(--status-bar)' } });

    expect(region().style.getPropertyValue('--ui-toast-inset-start')).toBe('232px');
    expect(region().style.getPropertyValue('--ui-toast-inset-bottom')).toBe('var(--status-bar)');
    expect(region().style.getPropertyValue('--ui-toast-inset-top')).toBe('');
  });

  it('no `inset`, no inline style', () => {
    renderHub({ inset: {} });

    expect(region()).not.toHaveAttribute('style');
  });

  it('`ToastPortal` passes the labels and the class name through', () => {
    renderHub({ regionLabel: 'Uyarılar', className: 'app-toasts' });

    expect(screen.getByRole('region', { name: 'Uyarılar' })).toHaveClass('app-toasts');
  });
});
