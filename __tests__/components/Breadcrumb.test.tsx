import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Breadcrumb, { type Crumb } from '@/components/Breadcrumb';
import UiProvider from '@/theme/UiProvider';
import { LABELS } from '@tests/fixtures/labels';

const TRAIL: Crumb[] = [
  { label: 'Ana sayfa', href: '/' },
  { label: 'Fren sistemi', href: '/kategori/fren' },
  { label: 'Fren diski', href: '/kategori/fren/disk' },
  { label: 'Ön fren diski, havalı' },
];

const items = () => within(screen.getByRole('list')).getAllByRole('listitem');

/*
 * 3.2.1: on a narrow screen the trail was a scrolling strip that ran to the screen's edge. It now
 * folds the middle crumbs into "…" (CSS shows the button and hides the crumbs only there) and cuts
 * the current page with an ellipsis, its full text in `title`.
 */
describe('Breadcrumb — a long trail on a narrow screen', () => {
  it('marks the middle crumbs foldable behind a "…" after the first one', () => {
    render(
      <UiProvider labels={LABELS}>
        <Breadcrumb items={TRAIL} />
      </UiProvider>,
    );

    const [first, more, middle, parent, current] = items();
    expect(first).toHaveTextContent('Ana sayfa');
    expect(within(more).getByRole('button', { name: 'Tüm yolu göster' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(middle).toHaveClass('breadcrumb__item--collapsible');
    expect(parent).not.toHaveClass('breadcrumb__item--collapsible');
    expect(current).toHaveClass('breadcrumb__item--current');
    expect(within(current).getByText('Ön fren diski, havalı')).toHaveAttribute(
      'title',
      'Ön fren diski, havalı',
    );
  });

  it('"…" unfolds the whole trail and hands the focus to the first crumb it revealed', async () => {
    render(<Breadcrumb items={TRAIL} label="Yol" expandLabel="Yolu aç" />);

    await userEvent.click(screen.getByRole('button', { name: 'Yolu aç' }));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveClass('breadcrumb--expanded');
    expect(items()).toHaveLength(4);
    expect(items().some(item => item.classList.contains('breadcrumb__item--collapsible'))).toBe(
      false,
    );
    expect(screen.getByRole('link', { name: 'Fren sistemi' })).toHaveFocus();
  });

  it('without a label the button is named by the crumbs it hides', () => {
    render(
      <Breadcrumb
        label="Yol"
        items={[
          { label: 'A', href: '/a' },
          { label: 'B', href: '/b' },
          { label: 'C', href: '/c' },
          ...TRAIL.slice(2),
        ]}
      />,
    );

    expect(screen.getByRole('button', { name: 'B, C' })).toBeInTheDocument();
  });

  it('a short trail has nothing to fold', () => {
    render(<Breadcrumb label="Yol" items={TRAIL.slice(1)} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(items()).toHaveLength(3);
  });
});
