import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FilterToolbar from '@/components/FilterToolbar';
import UiProvider from '@/theme/UiProvider';
import { axe } from '@tests/support/axe';
import { LABELS } from '@tests/fixtures/labels';

const SORT = [
  { value: 'relevance', label: 'Önerilen' },
  { value: 'price-asc', label: 'Fiyat ↑' },
];

describe('FilterToolbar', () => {
  it('draws only the controls whose props are given', () => {
    const { container } = render(
      <UiProvider labels={LABELS}>
        <FilterToolbar testId="bar" />
      </UiProvider>,
    );

    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('writes the count politely and a skeleton while it loads', () => {
    const { rerender } = render(
      <UiProvider labels={LABELS}>
        <FilterToolbar
          count={
            <>
              <strong>1.284</strong> ürün
            </>
          }
        />
      </UiProvider>,
    );
    expect(screen.getByText('ürün', { exact: false })).toHaveAttribute('aria-live', 'polite');

    rerender(
      <UiProvider labels={LABELS}>
        <FilterToolbar count="1.284 ürün" isCountLoading />
      </UiProvider>,
    );
    expect(screen.queryByText('1.284 ürün')).not.toBeInTheDocument();
  });

  it('opens the filters with a button that reads the applied count', async () => {
    const onFilterClick = jest.fn();
    const { rerender } = render(
      <UiProvider labels={LABELS}>
        <FilterToolbar onFilterClick={onFilterClick} activeFilterCount={3} />
      </UiProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Filtrele , 3 filtre uygulandı' }));
    expect(onFilterClick).toHaveBeenCalledTimes(1);

    rerender(
      <UiProvider labels={LABELS}>
        <FilterToolbar onFilterClick={onFilterClick} />
      </UiProvider>,
    );
    expect(screen.getByRole('button', { name: 'Filtrele' })).toBeInTheDocument();
  });

  it('switches view and density and changes sort and page size', async () => {
    const onViewChange = jest.fn();
    const onDensityChange = jest.fn();
    const onSortChange = jest.fn();
    const onPageSizeChange = jest.fn();
    render(
      <UiProvider labels={LABELS}>
        <FilterToolbar
          view="table"
          onViewChange={onViewChange}
          density="comfortable"
          onDensityChange={onDensityChange}
          sortOptions={SORT}
          sortValue="relevance"
          onSortChange={onSortChange}
          pageSizeOptions={[24, 48]}
          pageSize={24}
          onPageSizeChange={onPageSizeChange}
        >
          <span>Ek denetim</span>
        </FilterToolbar>
      </UiProvider>,
    );

    expect(screen.getByText('Ek denetim')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Tablo' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Kartlar' }));
    expect(onViewChange).toHaveBeenCalledWith('cards');

    await userEvent.click(screen.getByRole('radio', { name: 'Sıkı' }));
    expect(onDensityChange).toHaveBeenCalledWith('compact');

    await userEvent.click(screen.getByRole('combobox', { name: /Sırala/ }));
    await userEvent.click(screen.getByRole('option', { name: 'Fiyat ↑' }));
    expect(onSortChange).toHaveBeenCalledWith('price-asc');

    await userEvent.click(screen.getByRole('combobox', { name: /Sayfa başına/ }));
    await userEvent.click(screen.getByRole('option', { name: '48 / sayfa' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(48);

    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('takes its own labels over the provider and can stick', () => {
    render(
      <UiProvider labels={LABELS}>
        <FilterToolbar
          isSticky
          view="cards"
          onViewChange={jest.fn()}
          labels={{ view: 'Düzen' }}
          testId="bar"
        />
      </UiProvider>,
    );

    expect(screen.getByRole('radiogroup', { name: 'Düzen' })).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toHaveClass('toolbar--sticky');
  });
});
