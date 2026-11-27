import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NotificationCenter, { type NotificationItem } from '@/components/NotificationCenter';
import UiProvider from '@/theme/UiProvider';
import { LABELS } from '@tests/fixtures/labels';

const now = new Date();
const at = (daysAgo: number, hour: number) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, 15);

const ITEMS: NotificationItem[] = [
  {
    id: 'old',
    title: 'Fiyat listesi',
    date: new Date(2025, 4, 6, 9, 30).toISOString(),
    isRead: true,
  },
  { id: 'y', title: 'İade onaylandı', date: at(1, 10).getTime() },
  { id: 't1', title: 'Sipariş kargoda', date: at(0, 8), description: 'SP-1042', icon: <svg /> },
  { id: 't2', title: 'Stok geldi', date: at(0, 11), isRead: true },
];

const renderCenter = (props: Partial<React.ComponentProps<typeof NotificationCenter>> = {}) =>
  render(
    <UiProvider labels={{ ...LABELS, locale: 'tr-TR' }}>
      <NotificationCenter items={ITEMS} {...props} />
    </UiProvider>,
  );

const bell = () => screen.getByRole('button', { name: /^Bildirimler/ });

describe('NotificationCenter', () => {
  it('the bell says how many are unread and shows the count', () => {
    renderCenter();

    expect(bell()).toHaveAccessibleName('Bildirimler, 2 okunmamış');
    expect(bell()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(bell()).toHaveTextContent('2');
  });

  it('caps the badge at 99+ and drops it when all are read', () => {
    const many = Array.from({ length: 120 }, (_, index) => ({
      id: String(index),
      title: `Bildirim ${index}`,
      date: now,
    }));
    const { rerender } = renderCenter({ items: many });
    expect(bell()).toHaveTextContent('99+');

    rerender(
      <UiProvider labels={LABELS}>
        <NotificationCenter items={ITEMS.map(item => ({ ...item, isRead: true }))} />
      </UiProvider>,
    );
    expect(bell()).toHaveAccessibleName('Bildirimler');
    expect(bell()).toHaveTextContent('');
  });

  it('groups by day, newest first, and marks the unread', async () => {
    renderCenter();
    await userEvent.click(bell());

    const panel = screen.getByRole('dialog', { name: 'Bildirimler' });
    const groups = within(panel).getAllByRole('group');
    expect(groups.map(group => group.firstChild?.textContent)).toEqual([
      'Bugün',
      'Dün',
      '6 Mayıs 2025',
    ]);
    expect(
      within(groups[0])
        .getAllByRole('listitem')
        .map(item => item.textContent),
    ).toEqual([
      expect.stringContaining('Stok geldi'),
      expect.stringContaining('Okunmamış: Sipariş kargoda'),
    ]);
    expect(within(groups[0]).getByText('SP-1042')).toBeInTheDocument();
    expect(within(groups[0]).getAllByRole('listitem')[1].className).toMatch(/item--unread/);
    expect(within(groups[2]).getByText('09:30')).toHaveAttribute(
      'datetime',
      new Date(2025, 4, 6, 9, 30).toISOString(),
    );
    /* Without callbacks the rows are text, with no buttons. */
    expect(within(panel).queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens an item, marks one and marks all read', async () => {
    const onItemSelect = jest.fn();
    const onMarkRead = jest.fn();
    const onMarkAllRead = jest.fn();
    renderCenter({ onItemSelect, onMarkRead, onMarkAllRead });
    await userEvent.click(bell());
    const panel = screen.getByRole('dialog');

    await userEvent.click(within(panel).getByRole('button', { name: /Stok geldi/ }));
    expect(onItemSelect).toHaveBeenCalledWith(ITEMS[3]);

    const markButtons = within(panel).getAllByRole('button', { name: 'Okundu işaretle' });
    expect(markButtons).toHaveLength(2);
    await userEvent.click(markButtons[0]);
    expect(onMarkRead).toHaveBeenCalledWith(ITEMS[2]);

    await userEvent.click(within(panel).getByRole('button', { name: 'Tümünü okundu işaretle' }));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state and no "mark all read" with nothing unread', () => {
    renderCenter({ items: [], isOpen: true, onMarkAllRead: jest.fn() });

    const panel = screen.getByRole('dialog');
    expect(within(panel).getByText('Bildirim yok')).toBeInTheDocument();
    expect(within(panel).queryByRole('button')).not.toBeInTheDocument();
  });

  it('formatters and label props win; a controlled panel reports its changes', async () => {
    const onOpenChange = jest.fn();
    render(
      <NotificationCenter
        items={ITEMS}
        isOpen
        onOpenChange={onOpenChange}
        formatDay={date => `gün ${date.getDate()}`}
        formatTime={() => 'saat'}
        labels={{
          trigger: unread => `Zil ${unread}`,
          title: 'Uyarılar',
          today: 'Bu gün',
          yesterday: 'Dünkü',
          unread: 'Yeni',
        }}
        testId="center"
        className="center"
      />,
    );

    const panel = screen.getByTestId('center');
    expect(panel).toHaveClass('center');
    expect(panel).toHaveAccessibleName('Uyarılar');
    expect(within(panel).getByText('gün 6')).toBeInTheDocument();
    expect(within(panel).getByText('Bu gün')).toBeInTheDocument();
    expect(within(panel).getByText('Dünkü')).toBeInTheDocument();
    expect(within(panel).getAllByText('saat')).toHaveLength(4);

    await userEvent.click(screen.getByRole('button', { name: 'Zil 2' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
