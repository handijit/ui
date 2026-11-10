import { render, screen } from '@testing-library/react';

import { useUi } from '@/theme/context';
import UiProvider from '@/theme/UiProvider';
import type { UiLinkComponent } from '@/types/link.type';

const Probe = () => {
  const { labels, linkComponent: Link } = useUi();

  return (
    <>
      <span data-testid="label">{labels?.close ?? '—'}</span>
      {Link && <Link href="/hedef">bağlantı</Link>}
    </>
  );
};

describe('UiProvider', () => {
  it('adds no element of its own — neither to the tree nor to <head>', () => {
    const before = document.head.childElementCount;
    const { container } = render(
      <UiProvider>
        <p>içerik</p>
      </UiProvider>,
    );

    expect(container.innerHTML).toBe('<p>içerik</p>');
    expect(document.head.childElementCount).toBe(before);
    expect(document.querySelector('style')).toBeNull();
  });

  it('hands the labels and the link component to the tree', () => {
    const Link: UiLinkComponent = ({ href, children }) => (
      <a href={String(href)} data-router>
        {children}
      </a>
    );

    render(
      <UiProvider labels={{ close: 'Kapat' }} linkComponent={Link}>
        <Probe />
      </UiProvider>,
    );

    expect(screen.getByTestId('label')).toHaveTextContent('Kapat');
    expect(screen.getByRole('link', { name: 'bağlantı' })).toHaveAttribute('data-router');
  });

  it('works without a provider — every value is optional', () => {
    render(<Probe />);

    expect(screen.getByTestId('label')).toHaveTextContent('—');
    expect(screen.queryByRole('link')).toBeNull();
  });
});
