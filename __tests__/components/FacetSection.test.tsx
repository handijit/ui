import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FacetSection from '@/components/FacetSection';
import FacetSidebar from '@/components/FacetSidebar';
import UiProvider from '@/theme/UiProvider';
import { axe } from '@tests/support/axe';
import { LABELS } from '@tests/fixtures/labels';

const BRANDS = ['Bosch', 'Mann-Filter', 'Febi', 'Valeo', 'Sachs', 'Hella', 'Brembo', 'Şahin'].map(
  (label, index) => ({ value: label.toLowerCase(), label, count: 40 - index * 5 }),
);

const withLabels = (element: React.ReactElement) =>
  render(<UiProvider labels={LABELS}>{element}</UiProvider>);

describe('FacetSection', () => {
  it('lists checkbox options with counts and toggles a value in and out', async () => {
    const onChange = jest.fn();
    const { rerender } = withLabels(
      <FacetSection title="Marka" options={BRANDS.slice(0, 3)} selected={[]} onChange={onChange} />,
    );

    const group = screen.getByRole('group', { name: 'Marka' });
    expect(within(group).getAllByRole('checkbox')).toHaveLength(3);
    expect(within(group).getByRole('checkbox', { name: 'Bosch 40' })).not.toBeChecked();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Bosch 40' }));
    expect(onChange).toHaveBeenLastCalledWith(['bosch']);

    rerender(
      <UiProvider labels={LABELS}>
        <FacetSection
          title="Marka"
          options={BRANDS.slice(0, 3)}
          selected={['bosch', 'febi']}
          onChange={onChange}
        />
      </UiProvider>,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Bosch 40' }));
    expect(onChange).toHaveBeenLastCalledWith(['febi']);
  });

  it('shows the selection count as a badge and reads it as text', () => {
    withLabels(
      <FacetSection
        title="Marka"
        options={BRANDS}
        selected={['bosch', 'febi']}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText('2 seçili')).toBeInTheDocument();
    expect(screen.getByText('2', { selector: '[aria-hidden]' })).toBeInTheDocument();
  });

  it('disables an option that leads to no result unless it is selected', () => {
    const options = [
      { value: 'a', label: 'Boş', count: 0 },
      { value: 'b', label: 'Seçili boş', count: 0 },
      { value: 'c', label: 'Kapalı', count: 4, isDisabled: true },
    ];
    withLabels(
      <FacetSection title="Marka" options={options} selected={['b']} onChange={jest.fn()} />,
    );

    expect(screen.getByRole('checkbox', { name: 'Boş 0' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Seçili boş 0' })).toBeEnabled();
    expect(screen.getByRole('checkbox', { name: 'Kapalı 4' })).toBeDisabled();
  });

  it('folds a long list, keeps a hidden selection visible and unfolds it', async () => {
    withLabels(
      <FacetSection
        title="Marka"
        options={BRANDS}
        selected={['şahin']}
        visibleCount={3}
        searchThreshold={20}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    expect(screen.getByRole('checkbox', { name: 'Şahin 5' })).toBeChecked();

    const more = screen.getByRole('button', { name: '4 seçenek daha' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);

    expect(screen.getAllByRole('checkbox')).toHaveLength(8);
    expect(screen.getByRole('button', { name: 'Daha az göster' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('searches a long list without case or accents and says when nothing matches', async () => {
    withLabels(
      <FacetSection title="Marka" options={BRANDS} searchThreshold={5} onChange={jest.fn()} />,
    );

    const search = screen.getByRole('searchbox', { name: 'Marka içinde ara' });
    await userEvent.type(search, 'sahin');
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /seçenek daha/ })).not.toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    expect(screen.getByRole('status')).toHaveTextContent('“zzz” için sonuç yok');
  });

  it('draws one radio group whose choice gives one value', async () => {
    const onChange = jest.fn();
    withLabels(
      <FacetSection
        title="Kalite"
        mode="radio"
        options={[
          { value: 'oem', label: 'OEM', count: 3 },
          { value: 'oes', label: 'OES', count: 7 },
        ]}
        selected={['oem']}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('radiogroup', { name: 'Kalite' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /OEM/ })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: /OES/ }));
    expect(onChange).toHaveBeenCalledWith(['oes']);
  });

  it('draws links in link mode, the current one as the page', () => {
    withLabels(
      <FacetSection
        title="Kategori"
        mode="link"
        options={[
          { value: 'fren', label: 'Fren', count: 9, href: '/fren' },
          { value: 'yag', label: 'Yağ', count: 2 },
        ]}
        selected={['fren']}
      />,
    );

    expect(screen.getByRole('link', { name: 'Fren 9' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Fren 9' })).toHaveAttribute('href', '/fren');
    expect(screen.getByRole('link', { name: 'Yağ 2' })).not.toHaveAttribute('aria-current');
  });

  it('applies a min/max range with the button or Enter, and follows the applied range', async () => {
    const onRangeChange = jest.fn();
    const { rerender } = withLabels(
      <FacetSection
        title="Fiyat"
        mode="range"
        currency="TL"
        range={{ min: 10000, max: null }}
        onRangeChange={onRangeChange}
      />,
    );

    const min = screen.getByRole('textbox', { name: 'En az' });
    const max = screen.getByRole('textbox', { name: 'En çok' });
    expect(min).toHaveValue('100,00');
    expect(screen.getByText('1 seçili')).toBeInTheDocument();

    await userEvent.type(max, '500');
    fireEvent.blur(max);
    await userEvent.click(screen.getByRole('button', { name: 'Uygula' }));
    expect(onRangeChange).toHaveBeenLastCalledWith({ min: 10000, max: 50000 });

    await userEvent.clear(min);
    await userEvent.type(min, '50{Enter}');
    expect(onRangeChange).toHaveBeenLastCalledWith({ min: 5000, max: 50000 });

    rerender(
      <UiProvider labels={LABELS}>
        <FacetSection
          title="Fiyat"
          mode="range"
          range={{ min: null, max: null }}
          onRangeChange={onRangeChange}
        />
      </UiProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'En az' })).toHaveValue('');
    expect(screen.queryByText(/seçili/)).not.toBeInTheDocument();
  });

  it('shows a clear button only while something is selected', async () => {
    const onClear = jest.fn();
    const { rerender } = withLabels(
      <FacetSection
        title="Marka"
        options={BRANDS}
        selected={['bosch']}
        onChange={jest.fn()}
        onClear={onClear}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Temizle' }));
    expect(onClear).toHaveBeenCalledTimes(1);

    rerender(
      <UiProvider labels={LABELS}>
        <FacetSection
          title="Marka"
          options={BRANDS}
          selected={[]}
          onChange={jest.fn()}
          onClear={onClear}
        />
      </UiProvider>,
    );
    expect(screen.queryByRole('button', { name: 'Temizle' })).not.toBeInTheDocument();
  });

  it('starts folded when asked, but open while it holds a selection', () => {
    const { container, rerender } = withLabels(
      <FacetSection title="Marka" options={BRANDS} isDefaultOpen={false} onChange={jest.fn()} />,
    );
    expect(container.querySelector('details')).not.toHaveAttribute('open');

    rerender(
      <UiProvider labels={LABELS}>
        <span />
      </UiProvider>,
    );
    rerender(
      <UiProvider labels={LABELS}>
        <FacetSection
          title="Marka"
          options={BRANDS}
          selected={['febi']}
          isDefaultOpen={false}
          onChange={jest.fn()}
        />
      </UiProvider>,
    );
    expect(container.querySelector('details')).toHaveAttribute('open');
  });

  it('draws custom content with its own count, and prop labels win over the provider', () => {
    withLabels(
      <FacetSection
        title="Aracım"
        selectedCount={1}
        labels={{ selected: count => `${count} araç` }}
      >
        <p>Araç seçici</p>
      </FacetSection>,
    );

    expect(screen.getByText('Araç seçici')).toBeInTheDocument();
    expect(screen.getByText('1 araç')).toBeInTheDocument();
  });

  it('counts nothing for custom content without a count', () => {
    withLabels(
      <FacetSection title="Fırsatlar" selected={['x']}>
        <p>Anahtarlar</p>
      </FacetSection>,
    );

    expect(screen.queryByText(/seçili/)).not.toBeInTheDocument();
  });

  it('has no axe violations open, searched and folded', async () => {
    withLabels(
      <FacetSection
        title="Marka"
        options={BRANDS}
        selected={['bosch']}
        searchThreshold={4}
        visibleCount={3}
        onChange={jest.fn()}
        onClear={jest.fn()}
      />,
    );

    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('FacetSidebar', () => {
  const sections = (
    <FacetSection
      title="Marka"
      options={BRANDS.slice(0, 2)}
      selected={['bosch']}
      onChange={jest.fn()}
    />
  );

  it('names the column by its heading and offers "clear all" with the count', async () => {
    const onClearAll = jest.fn();
    withLabels(
      <FacetSidebar activeCount={3} onClearAll={onClearAll}>
        {sections}
      </FacetSidebar>,
    );

    expect(screen.getByRole('complementary', { name: 'Filtreler' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tümünü temizle (3)' }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('hides "clear all" without applied filters', () => {
    withLabels(
      <FacetSidebar activeCount={0} onClearAll={jest.fn()} title="Süz">
        {sections}
      </FacetSidebar>,
    );

    expect(screen.getByRole('complementary', { name: 'Süz' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tümünü temizle/ })).not.toBeInTheDocument();
  });

  it('opens the same sections in a drawer with clear and apply buttons', async () => {
    const onDrawerClose = jest.fn();
    const onApply = jest.fn();
    const onClearAll = jest.fn();
    const { rerender } = withLabels(
      <FacetSidebar
        isDrawerOpen
        onDrawerClose={onDrawerClose}
        onApply={onApply}
        applyLabel="128 ürünü göster"
        activeCount={1}
        onClearAll={onClearAll}
      >
        {sections}
      </FacetSidebar>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Filtreler' });
    expect(within(dialog).getByRole('checkbox', { name: /Bosch/ })).toBeChecked();
    await userEvent.click(within(dialog).getByRole('button', { name: '128 ürünü göster' }));
    expect(onApply).toHaveBeenCalledTimes(1);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Tümünü temizle' }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
    expect(await axe(document.body)).toHaveNoViolations();

    rerender(
      <UiProvider labels={LABELS}>
        <FacetSidebar isDrawerOpen onDrawerClose={onDrawerClose}>
          {sections}
        </FacetSidebar>
      </UiProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Sonuçları göster' }));
    expect(onDrawerClose).toHaveBeenCalledTimes(1);
  });

  it('closes the drawer when the window widens past tablet width', () => {
    let listener: (() => void) | undefined;
    const query = {
      matches: false,
      addEventListener: (_: string, handler: () => void) => {
        listener = handler;
      },
      removeEventListener: jest.fn(),
    };
    jest.spyOn(window, 'matchMedia').mockReturnValue(query as unknown as MediaQueryList);
    const onDrawerClose = jest.fn();
    const { unmount } = withLabels(
      <FacetSidebar isDrawerOpen onDrawerClose={onDrawerClose}>
        {sections}
      </FacetSidebar>,
    );

    act(() => listener?.());
    expect(onDrawerClose).not.toHaveBeenCalled();
    query.matches = true;
    act(() => listener?.());
    expect(onDrawerClose).toHaveBeenCalledTimes(1);

    unmount();
    expect(query.removeEventListener).toHaveBeenCalled();
  });
});
