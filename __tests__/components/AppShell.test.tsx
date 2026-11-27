import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps, ReactNode } from 'react';

import AppShell, {
  AppShellNav,
  AppShellNavGroup,
  AppShellNavItem,
  type AppShellNavSection,
} from '@/components/AppShell';
import { resetLabelWarnings } from '@/helpers/label.helper';
import UiProvider from '@/theme/UiProvider';
import type { UiLinkProps } from '@/types/link.type';
import { LABELS } from '@tests/fixtures/labels';

const SECTIONS: AppShellNavSection[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Özet', href: '/panel', icon: <svg /> },
      { id: 'orders', label: 'Siparişler', href: '/panel/orders', badge: 3 },
    ],
  },
  {
    id: 'stock',
    label: 'Stok',
    items: [
      {
        id: 'depot',
        label: 'Depo',
        icon: <svg />,
        badge: 4,
        items: [
          { id: 'levels', label: 'Seviyeler', href: '/panel/stock' },
          { id: 'transfers', label: 'Transferler', href: '/panel/stock/transfers', badge: 120 },
        ],
      },
      { id: 'returns', label: 'İadeler' },
      { id: 'pinned', label: 'Sabit', href: '/elsewhere', isActive: true },
      { id: 'off', label: 'Kapalı', href: '/off', isDisabled: true },
    ],
  },
];

/* A `matchMedia` whose answer can change, with the listeners it was given. */
const mockMedia = (initial: boolean) => {
  let matches = initial;
  const listeners = new Set<(event: { matches: boolean }) => void>();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      addEventListener: (_: string, listener: (event: { matches: boolean }) => void) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: (event: { matches: boolean }) => void) =>
        listeners.delete(listener),
    }),
  });

  return {
    change(next: boolean) {
      matches = next;
      act(() => listeners.forEach(listener => listener({ matches: next })));
    },
    listeners,
  };
};

const RouterLink = ({ children, ...rest }: UiLinkProps) => (
  <a data-router="yes" {...(rest as object)}>
    {children}
  </a>
);

const renderShell = (
  props: Partial<ComponentProps<typeof AppShell>> = {},
  currentPath = '/panel/stock/transfers',
  wrap: (node: ReactNode) => ReactNode = node => node,
) =>
  render(
    <UiProvider labels={LABELS} linkComponent={RouterLink}>
      {wrap(
        <AppShell
          brand={<span>Marka</span>}
          navigation={<AppShellNav sections={SECTIONS} currentPath={currentPath} />}
          title="Transferler"
          search={<span>arama</span>}
          actions={<span>eylemler</span>}
          sidebarFooter={<span>sürüm</span>}
          {...props}
        >
          <h1>Sayfa</h1>
        </AppShell>,
      )}
    </UiProvider>,
  );

beforeEach(() => {
  resetLabelWarnings();
  mockMedia(false);
  /* jsdom has no `scrollTo`; the drawer's scroll lock calls it on unlock. */
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

describe('AppShell', () => {
  it('draws the landmarks and the regions', () => {
    renderShell();

    expect(screen.getByRole('navigation', { name: 'Ana menü' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveTextContent('Transferler');
    expect(screen.getByRole('banner')).toHaveTextContent('arama');
    expect(screen.getByRole('banner')).toHaveTextContent('eylemler');
    expect(screen.getByRole('main')).toHaveTextContent('Sayfa');
    expect(screen.getByRole('complementary')).toHaveTextContent('Marka');
    expect(screen.getByRole('complementary')).toHaveTextContent('sürüm');
  });

  it('leaves out the empty regions', () => {
    renderShell({ brand: undefined, title: undefined, search: undefined, actions: undefined });

    expect(screen.getByRole('banner')).toHaveTextContent('');
  });

  it('the skip link focuses the content without touching the address', async () => {
    renderShell();
    const skip = screen.getByRole('link', { name: 'İçeriğe atla' });
    const main = screen.getByRole('main');

    expect(skip).toHaveAttribute('href', `#${main.id}`);
    await userEvent.click(skip);

    expect(main).toHaveFocus();
    expect(window.location.hash).toBe('');
  });

  it('marks the longest matching link as the current page, through the router link', () => {
    renderShell();
    const current = screen.getByRole('link', { name: /Transferler/ });

    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('data-router', 'yes');
    expect(screen.getByRole('link', { name: 'Seviyeler' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Özet' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Sabit' })).toHaveAttribute('aria-current', 'page');
  });

  it('reads counts through the badge label and caps the visible number', () => {
    renderShell();

    /* The visible number is hidden from the name: it is read once, through the label. */
    expect(screen.getByRole('link', { name: /^Siparişler\s*,\s*3 yeni$/ })).toHaveTextContent('3');
    expect(screen.getByRole('link', { name: /Transferler/ })).toHaveTextContent('99+');
  });

  it('draws passive rows without a link', () => {
    renderShell();

    expect(screen.queryByRole('link', { name: 'İadeler' })).not.toBeInTheDocument();
    expect(screen.getByText('İadeler').parentElement).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Kapalı').parentElement).toHaveAttribute('aria-disabled', 'true');
  });

  it('names a section with its label', () => {
    renderShell();

    expect(screen.getByRole('group', { name: 'Stok' })).toBeInTheDocument();
  });

  it('opens the group of the current page and toggles a group', async () => {
    renderShell();
    const group = screen.getByRole('button', { name: /Depo/ });

    expect(group).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(group);
    expect(group).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Seviyeler' })).not.toBeInTheDocument();
    await userEvent.click(group);
    expect(screen.getByRole('link', { name: 'Seviyeler' })).toBeVisible();
  });

  it('opens a group when the page moves into it', () => {
    const { rerender } = renderShell({}, '/panel');
    const group = screen.getByRole('button', { name: /Depo/ });
    expect(group).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <UiProvider labels={LABELS}>
        <AppShell navigation={<AppShellNav sections={SECTIONS} currentPath="/panel/stock" />}>
          <h1>Sayfa</h1>
        </AppShell>
      </UiProvider>,
    );

    expect(screen.getByRole('button', { name: /Depo/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('collapses to icons, uncontrolled', async () => {
    const onCollapsedChange = jest.fn();
    const { container } = renderShell({ onCollapsedChange });

    await userEvent.click(screen.getByRole('button', { name: 'Kenar çubuğunu daralt' }));

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(container.firstElementChild).toHaveClass('shell--collapsed');
    expect(screen.getByRole('link', { name: 'Özet' })).toHaveAttribute('title', 'Özet');
    expect(screen.getByRole('button', { name: /Depo/ })).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(screen.getByRole('button', { name: 'Kenar çubuğunu genişlet' }));
    expect(container.firstElementChild).not.toHaveClass('shell--collapsed');
  });

  it('a controlled sidebar follows its prop only', async () => {
    const onCollapsedChange = jest.fn();
    const { container } = renderShell({ isCollapsed: true, onCollapsedChange });

    await userEvent.click(screen.getByRole('button', { name: 'Kenar çubuğunu genişlet' }));

    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(container.firstElementChild).toHaveClass('shell--collapsed');
    expect(screen.getByText('İadeler').parentElement).toHaveAttribute('title', 'İadeler');
  });

  it('a group on the icon rail expands the sidebar', async () => {
    const { container } = renderShell({ isDefaultCollapsed: true }, '/panel');

    await userEvent.click(screen.getByRole('button', { name: /Depo/ }));

    expect(container.firstElementChild).not.toHaveClass('shell--collapsed');
    expect(screen.getByRole('button', { name: /Depo/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens the drawer from the menu button and closes it on navigation', async () => {
    renderShell();
    const menu = screen.getByRole('button', { name: 'Menüyü aç' });

    expect(menu).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'true');

    const drawer = screen.getByRole('dialog', { name: 'Ana menü' });
    expect(within(drawer).getByText('Marka')).toBeInTheDocument();
    const link = within(drawer).getByRole('link', { name: 'Özet' });
    expect(link).not.toHaveAttribute('title');

    link.addEventListener('click', event => event.preventDefault());
    await userEvent.click(link);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the drawer with its close button', async () => {
    renderShell({ brand: undefined });
    await userEvent.click(screen.getByRole('button', { name: 'Menüyü aç' }));

    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Kapat' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the drawer when the window grows past the tablet width', async () => {
    const media = mockMedia(false);
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: 'Menüyü aç' }));

    media.change(false);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    media.change(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(media.listeners.size).toBe(0);
  });

  it('does not keep a drawer opened on a wide window', async () => {
    mockMedia(true);
    renderShell();

    await userEvent.click(screen.getByRole('button', { name: 'Menüyü aç' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('labels given as a prop win over the provider', () => {
    renderShell({ labels: { navigation: 'Gezinme', skipToContent: 'Atla' } });

    expect(screen.getByRole('navigation', { name: 'Gezinme' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Atla' })).toBeInTheDocument();
  });

  it('publishes the top bar height for the sticky components', () => {
    const observed: Element[] = [];
    let callback: ResizeObserverCallback = () => {};
    const disconnect = jest.fn();
    window.ResizeObserver = class {
      constructor(next: ResizeObserverCallback) {
        callback = next;
      }
      observe(element: Element) {
        observed.push(element);
      }
      unobserve() {}
      disconnect = disconnect;
    } as unknown as typeof ResizeObserver;

    const { unmount } = renderShell();
    expect(observed[0]).toBe(screen.getByRole('banner'));

    act(() =>
      callback([{ contentRect: { height: 52 } } as ResizeObserverEntry], {} as ResizeObserver),
    );
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--ui-header-height')).toBe('52px');

    unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(root.style.getPropertyValue('--ui-header-height')).toBe('');
    delete (window as { ResizeObserver?: unknown }).ResizeObserver;
  });
});

describe('AppShellNav parts', () => {
  it('compose outside a shell, and pass the router props and the click on', async () => {
    const onClick = jest.fn((event: Event) => event.preventDefault());
    render(
      <UiProvider labels={LABELS}>
        <AppShellNav label="Ayarlar">
          <AppShellNavItem
            label="Profil"
            href="/profile"
            isActive
            linkProps={{ onClick, 'data-prefetch': 'no' }}
            testId="profile"
          />
          <AppShellNavGroup label="Raporlar" testId="reports">
            <AppShellNavItem label="Satış" href="/reports/sales" />
          </AppShellNavGroup>
        </AppShellNav>
      </UiProvider>,
    );

    const profile = screen.getByRole('link', { name: 'Profil' });
    expect(profile).toHaveAttribute('aria-current', 'page');
    expect(profile).toHaveAttribute('data-prefetch', 'no');
    await userEvent.click(profile);
    expect(onClick).toHaveBeenCalled();

    const group = screen.getByRole('button', { name: 'Raporlar' });
    expect(group).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(group);
    expect(screen.getByRole('link', { name: 'Satış' })).toBeVisible();
    expect(screen.getByTestId('reports')).toBeInTheDocument();
  });

  it('draws nothing but the landmark without sections or children', () => {
    render(
      <UiProvider labels={LABELS}>
        <AppShellNav />
      </UiProvider>,
    );

    expect(screen.getByRole('navigation', { name: 'Ana menü' })).toBeEmptyDOMElement();
  });

  it('warns once when the badge label is missing', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <AppShellNav label="Menü">
        <AppShellNavItem label="Siparişler" href="/orders" badge={2} />
        <AppShellNavItem label="İadeler" href="/returns" badge={0} />
      </AppShellNav>,
    );

    expect(screen.getByRole('link', { name: /Siparişler/ })).toHaveTextContent('2');
    expect(screen.getByRole('link', { name: 'İadeler' })).toBeInTheDocument();
    expect(error).toHaveBeenCalledWith(expect.stringContaining('AppShell.labels.badge'));
  });
});
