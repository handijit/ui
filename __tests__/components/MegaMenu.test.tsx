import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MegaMenu, { type MegaMenuItem } from '@/components/MegaMenu';
import { resetModalStack } from '@/helpers/focus.helper';
import UiProvider from '@/theme/UiProvider';
import { axe } from '@tests/support/axe';
import { LABELS } from '@tests/fixtures/labels';

class TestPointerEvent extends MouseEvent {
  pointerType: string;

  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? 'mouse';
  }
}

beforeAll(() => {
  Object.defineProperty(window, 'PointerEvent', { configurable: true, value: TestPointerEvent });
});

beforeEach(() => {
  resetModalStack();
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    callback(0);
    return 0;
  });
});

const ITEMS: MegaMenuItem[] = [
  {
    id: 'fren',
    label: 'Fren',
    href: '/fren',
    isActive: true,
    feature: <p>Kampanya kartı</p>,
    columns: [
      {
        id: 'balata',
        title: 'Balata',
        href: '/fren/balata',
        links: [
          { id: 'on', label: 'Ön balata', href: '/fren/on', icon: <svg /> },
          {
            id: 'arka',
            label: 'Arka balata',
            href: '/fren/arka',
            image: <img src="a.png" alt="" />,
            description: 'Seramik',
          },
        ],
      },
      { id: 'disk', links: [{ id: 'disk', label: 'Disk', href: '/fren/disk' }] },
    ],
  },
  {
    id: 'filtre',
    label: 'Filtre',
    icon: <svg />,
    columns: [
      {
        id: 'yag',
        title: 'Yağ',
        links: [{ id: 'yag', label: 'Yağ filtresi', href: '/filtre/yag' }],
      },
    ],
  },
  { id: 'kampanya', label: 'Kampanyalar', href: '/kampanya', icon: <svg /> },
  { id: 'yeni', label: 'Yeni', isActive: true },
];

const renderMenu = (props: Partial<React.ComponentProps<typeof MegaMenu>> = {}) =>
  render(
    <UiProvider labels={LABELS}>
      <button type="button">Dışarı</button>
      <MegaMenu items={ITEMS} testId="menu" {...props} />
    </UiProvider>,
  );

const panelOf = (name: string) =>
  document.getElementById(
    screen.getByRole('button', { name }).getAttribute('aria-controls') ?? '',
  ) as HTMLElement;

describe('MegaMenu', () => {
  it('is a named navigation of category buttons and links', async () => {
    renderMenu();

    const nav = screen.getByRole('navigation', { name: 'Kategoriler' });
    expect(within(nav).getByRole('button', { name: 'Fren' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(within(nav).getByRole('link', { name: 'Kampanyalar' })).toHaveAttribute(
      'href',
      '/kampanya',
    );
    expect(within(nav).getByRole('link', { name: 'Yeni' })).toHaveAttribute('aria-current', 'page');
    expect(panelOf('Fren')).not.toBeVisible();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('opens a panel of columns on click, with the feature and "see all", and closes it again', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Fren' });

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = panelOf('Fren');
    expect(panel).toBeVisible();
    expect(within(panel).getByRole('list', { name: 'Balata' })).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: 'Balata' })).toHaveAttribute(
      'href',
      '/fren/balata',
    );
    expect(within(panel).getByRole('link', { name: 'Arka balata Seramik' })).toHaveAttribute(
      'href',
      '/fren/arka',
    );
    expect(within(panel).getByText('Kampanya kartı')).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: 'Tüm Fren' })).toHaveAttribute('href', '/fren');
    expect(await axe(document.body)).toHaveNoViolations();

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens with ↓ into the panel, closes with Escape back on the button', () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Filtre' });
    trigger.focus();

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('link', { name: 'Yağ filtresi' })).toHaveFocus();
    expect(panelOf('Filtre')).not.toHaveTextContent('Tüm');

    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('moves along the top level with ←/→/Home/End and closes the open panel', async () => {
    renderMenu();
    const fren = screen.getByRole('button', { name: 'Fren' });
    await userEvent.click(fren);

    fireEvent.keyDown(fren, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: 'Filtre' })).toHaveFocus();
    expect(fren).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(document.activeElement as Element, { key: 'End' });
    expect(screen.getByRole('link', { name: 'Yeni' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    expect(fren).toHaveFocus();
    fireEvent.keyDown(fren, { key: 'ArrowLeft' });
    expect(screen.getByRole('link', { name: 'Yeni' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    expect(fren).toHaveFocus();

    fireEvent.keyDown(fren, { key: 'a' });
    expect(fren).toHaveFocus();
    /* ↓ on a plain link does nothing; Escape with nothing open does nothing. */
    const link = screen.getByRole('link', { name: 'Kampanyalar' });
    link.focus();
    fireEvent.keyDown(link, { key: 'ArrowDown' });
    fireEvent.keyDown(link, { key: 'Escape' });
    expect(link).toHaveFocus();
  });

  it('mirrors ←/→ in a right-to-left page', () => {
    document.dir = 'rtl';
    renderMenu();
    const fren = screen.getByRole('button', { name: 'Fren' });
    fren.focus();

    fireEvent.keyDown(fren, { key: 'ArrowLeft' });
    expect(screen.getByRole('button', { name: 'Filtre' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    expect(fren).toHaveFocus();
    document.dir = '';
  });

  it('ignores keys from inside a panel other than Escape', async () => {
    renderMenu();
    await userEvent.click(screen.getByRole('button', { name: 'Fren' }));
    const link = screen.getByRole('link', { name: 'Disk' });
    link.focus();

    fireEvent.keyDown(link, { key: 'ArrowRight' });
    expect(link).toHaveFocus();
  });

  it('opens on a resting mouse pointer, closes when it leaves, and ignores touch', () => {
    jest.useFakeTimers();
    renderMenu();
    const entry = screen.getByRole('button', { name: 'Fren' }).parentElement as HTMLElement;

    fireEvent.pointerEnter(entry, { pointerType: 'touch' });
    act(() => jest.advanceTimersByTime(300));
    expect(screen.getByRole('button', { name: 'Fren' })).toHaveAttribute('aria-expanded', 'false');

    fireEvent.pointerEnter(entry, { pointerType: 'mouse' });
    act(() => jest.advanceTimersByTime(150));
    expect(screen.getByRole('button', { name: 'Fren' })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.pointerLeave(entry, { pointerType: 'touch' });
    act(() => jest.advanceTimersByTime(300));
    expect(screen.getByRole('button', { name: 'Fren' })).toHaveAttribute('aria-expanded', 'true');

    /* Resting on a plain link closes the open panel. */
    fireEvent.pointerEnter(
      screen.getByRole('link', { name: 'Kampanyalar' }).parentElement as HTMLElement,
      {
        pointerType: 'mouse',
      },
    );
    act(() => jest.advanceTimersByTime(150));
    expect(screen.getByRole('button', { name: 'Fren' })).toHaveAttribute('aria-expanded', 'false');

    fireEvent.pointerEnter(entry, { pointerType: 'mouse' });
    act(() => jest.advanceTimersByTime(150));
    fireEvent.pointerLeave(entry, { pointerType: 'mouse' });
    act(() => jest.advanceTimersByTime(250));
    expect(screen.getByRole('button', { name: 'Fren' })).toHaveAttribute('aria-expanded', 'false');
    jest.useRealTimers();
  });

  it('closes on a press outside and when focus leaves the navigation', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Fren' });

    await userEvent.click(trigger);
    fireEvent.pointerDown(screen.getByRole('link', { name: 'Ön balata' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    fireEvent.blur(trigger, { relatedTarget: screen.getByRole('link', { name: 'Ön balata' }) });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.blur(trigger, { relatedTarget: screen.getByRole('button', { name: 'Dışarı' }) });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('lists the categories in a drawer, the current one open, and closes it on a link', async () => {
    const onDrawerClose = jest.fn();
    renderMenu({ isDrawerOpen: true, onDrawerClose, label: 'Ürünler' });

    const dialog = screen.getByRole('dialog', { name: 'Menü' });
    const nav = within(dialog).getByRole('navigation', { name: 'Ürünler' });
    expect(within(nav).getByRole('link', { name: 'Ön balata' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Yeni' })).toHaveAttribute('aria-current', 'page');
    expect(await axe(document.body)).toHaveNoViolations();

    await userEvent.click(within(nav).getByRole('link', { name: 'Tüm Fren' }));
    await userEvent.click(within(nav).getByRole('link', { name: 'Kampanyalar' }));
    await userEvent.click(within(nav).getByRole('link', { name: 'Balata' }));
    expect(onDrawerClose).toHaveBeenCalledTimes(3);
  });

  it('works without a close handler and takes its own labels', async () => {
    renderMenu({
      isDrawerOpen: true,
      labels: { menu: 'Kategoriler', seeAll: label => `${label} hepsi` },
    });

    const dialog = screen.getByRole('dialog', { name: 'Kategoriler' });
    await userEvent.click(within(dialog).getByRole('link', { name: 'Fren hepsi' }));
    expect(dialog).toBeInTheDocument();
  });

  it('clears its pointer timer when unmounted', () => {
    jest.useFakeTimers();
    const { unmount } = renderMenu();
    fireEvent.pointerEnter(
      screen.getByRole('button', { name: 'Fren' }).parentElement as HTMLElement,
      {
        pointerType: 'mouse',
      },
    );

    unmount();
    expect(() => act(() => jest.advanceTimersByTime(300))).not.toThrow();
    jest.useRealTimers();
  });
});
