import { render, screen, within } from '@testing-library/react';

import Badge from '@/components/Badge';
import TotalsList from '@/components/TotalsList';

const ITEMS = [
  { term: 'Ara toplam', description: '₺1.200,00' },
  { term: 'İskonto', description: '-₺120,00' },
  { term: 'Kargo', description: <Badge tone="info">Ücretsiz</Badge> },
  { term: 'Genel toplam', description: '₺1.296,00', isTotal: true },
];

describe('TotalsList', () => {
  it('draws a native description list, one term and one amount per row', () => {
    const { container } = render(<TotalsList items={ITEMS} testId="totals" />);

    const list = screen.getByTestId('totals');
    expect(list.tagName).toBe('DL');
    expect([...list.querySelectorAll('dt')].map(term => term.textContent)).toEqual([
      'Ara toplam',
      'İskonto',
      'Kargo',
      'Genel toplam',
    ]);
    expect([...list.querySelectorAll('dd')].map(value => value.textContent)).toEqual([
      '₺1.200,00',
      '-₺120,00',
      'Ücretsiz',
      '₺1.296,00',
    ]);
    /* A row groups its term and amount: `<div>` is the one wrapper a `<dl>` allows. */
    expect(container.querySelectorAll('dl > div > dt + dd')).toHaveLength(4);
  });

  it('marks only the grand total row, where the divider and the emphasis are', () => {
    render(<TotalsList items={ITEMS} testId="totals" />);

    const rows = [...screen.getByTestId('totals').children];
    expect(rows.map(row => row.className)).toEqual([
      'totals__row',
      'totals__row',
      'totals__row',
      'totals__row totals__row--total',
    ]);
    expect(within(rows[3] as HTMLElement).getByText('Genel toplam')).toHaveClass('totals__term');
    expect(within(rows[3] as HTMLElement).getByText('₺1.296,00')).toHaveClass('totals__value');
  });

  it('keeps the inline badge as the amount', () => {
    render(<TotalsList items={ITEMS} />);

    expect(screen.getByText('Ücretsiz').closest('dd')).toHaveClass('totals__value');
  });

  it('takes a class name for the page layout', () => {
    render(<TotalsList items={[]} className="summary" testId="totals" />);

    expect(screen.getByTestId('totals')).toHaveClass('totals', 'summary');
  });
});
