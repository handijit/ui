import { useState } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AppliedFilters, { type AppliedFilter } from '@/components/AppliedFilters';
import CompareTray, { type CompareTrayItem } from '@/components/CompareTray';
import UiProvider from '@/theme/UiProvider';
import { axe } from '@tests/support/axe';
import { LABELS } from '@tests/fixtures/labels';

const AppliedHarness = ({ onClearAll }: { onClearAll?: () => void }) => {
  const [values, setValues] = useState(['Bosch', 'Febi', 'Valeo']);
  const filters: AppliedFilter[] = values.map(value => ({
    key: value,
    group: 'Marka',
    label: value,
    onRemove: () => setValues(current => current.filter(item => item !== value)),
  }));

  return <AppliedFilters filters={filters} onClearAll={onClearAll} />;
};

describe('AppliedFilters', () => {
  it('draws nothing without filters', () => {
    const { container } = render(<AppliedFilters filters={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('names the strip, writes the group and the value, and names each remove button', async () => {
    const onRemove = jest.fn();
    render(
      <UiProvider labels={LABELS}>
        <AppliedFilters
          filters={[
            { key: 'b', group: 'Marka', label: 'Bosch', onRemove },
            { key: 's', label: 'Stokta', onRemove: jest.fn() },
          ]}
        />
      </UiProvider>,
    );

    expect(screen.getByRole('group', { name: 'Uygulanan filtreler' })).toBeInTheDocument();
    const chip = screen.getByRole('button', { name: 'Marka: Bosch filtresini kaldır' });
    expect(chip).toHaveTextContent('Marka:Bosch');
    expect(chip).not.toHaveAttribute('aria-pressed');
    expect(screen.getByRole('button', { name: ': Stokta filtresini kaldır' })).toHaveTextContent(
      'Stokta',
    );

    await userEvent.click(chip);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Tümünü temizle' })).not.toBeInTheDocument();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('moves focus to the chip that takes the place of the removed one, or the new last one', async () => {
    render(
      <UiProvider labels={LABELS}>
        <AppliedHarness />
      </UiProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Marka: Febi filtresini kaldır' }));
    expect(screen.getByRole('button', { name: 'Marka: Valeo filtresini kaldır' })).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Marka: Valeo filtresini kaldır' }));
    expect(screen.getByRole('button', { name: 'Marka: Bosch filtresini kaldır' })).toHaveFocus();
  });

  it('waits for the data to drop the chip, and falls back to the lead when no chip is left', async () => {
    const filters = (labels: string[]): AppliedFilter[] =>
      labels.map(label => ({ key: label, group: 'Marka', label, onRemove: jest.fn() }));
    const view = (labels: string[]) => (
      <UiProvider labels={LABELS}>
        <AppliedFilters filters={filters(labels)} extraCount={1} />
      </UiProvider>
    );
    const { rerender } = render(view(['Bosch', 'Febi']));

    await userEvent.click(screen.getByRole('button', { name: 'Marka: Febi filtresini kaldır' }));
    /* An unrelated render before the data changes: the pressed chip is still there and keeps focus. */
    rerender(view(['Bosch', 'Febi']));
    expect(screen.getByRole('button', { name: 'Marka: Febi filtresini kaldır' })).toHaveFocus();

    rerender(view(['Bosch']));
    expect(screen.getByRole('button', { name: 'Marka: Bosch filtresini kaldır' })).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Marka: Bosch filtresini kaldır' }));
    rerender(view([]));
    expect(screen.getByText('Uygulanan filtreler')).toHaveFocus();
  });

  it('lets focus go with the strip when the last chip is removed', async () => {
    const view = (labels: string[]) => (
      <UiProvider labels={LABELS}>
        <AppliedFilters
          filters={labels.map(label => ({
            key: label,
            group: 'Marka',
            label,
            onRemove: jest.fn(),
          }))}
        />
      </UiProvider>
    );
    const { container, rerender } = render(view(['Bosch']));

    await userEvent.click(screen.getByRole('button', { name: 'Marka: Bosch filtresini kaldır' }));
    rerender(view([]));
    expect(container).toBeEmptyDOMElement();
  });

  it('counts the unnamed filters and clears everything', async () => {
    const onClearAll = jest.fn();
    const { rerender } = render(
      <UiProvider labels={LABELS}>
        <AppliedFilters filters={[]} extraCount={2} onClearAll={onClearAll} />
      </UiProvider>,
    );

    expect(screen.getByText('+2 filtre daha')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tümünü temizle' }));
    expect(onClearAll).toHaveBeenCalledTimes(1);

    rerender(
      <UiProvider labels={LABELS}>
        <AppliedFilters
          filters={[{ key: 'a', group: 'A', label: 'B', onRemove: jest.fn() }]}
          labels={{ title: 'Seçimler', more: count => `${count} gizli` }}
          extraCount={1}
        />
      </UiProvider>,
    );
    expect(screen.getByRole('group', { name: 'Seçimler' })).toBeInTheDocument();
    expect(screen.getByText('1 gizli')).toBeInTheDocument();
  });
});

const TrayHarness = ({ initial }: { initial: CompareTrayItem[] }) => {
  const [items, setItems] = useState(initial);

  return (
    <CompareTray
      max={4}
      items={items}
      onRemove={id => setItems(current => current.filter(item => item.id !== id))}
      onClear={() => setItems([])}
    />
  );
};

describe('CompareTray', () => {
  const ITEMS = [
    { id: 'a', label: 'Bosch balata', image: <img src="a.png" alt="" /> },
    { id: 'b', label: 'Febi balata' },
    { id: 'c', label: 'Valeo balata' },
  ];

  it('draws nothing while no item is picked', () => {
    const { container } = render(<CompareTray max={4} items={[]} onRemove={jest.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('names the tray, counts against the maximum and links to the comparison', async () => {
    render(
      <UiProvider labels={LABELS}>
        <CompareTray
          max={4}
          items={ITEMS}
          onRemove={jest.fn()}
          compareHref="/karsilastir?u=a,b,c"
        />
      </UiProvider>,
    );

    expect(
      screen.getByRole('complementary', { name: 'Karşılaştırma listesi 3/4' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Karşılaştır (3)' })).toHaveAttribute(
      'href',
      '/karsilastir?u=a,b,c',
    );
    expect(screen.queryByRole('button', { name: 'Temizle' })).not.toBeInTheDocument();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('waits for the minimum and says why', async () => {
    const onCompare = jest.fn();
    render(
      <UiProvider labels={LABELS}>
        <CompareTray max={4} items={ITEMS.slice(0, 1)} onRemove={jest.fn()} onCompare={onCompare} />
      </UiProvider>,
    );

    const button = screen.getByRole('button', { name: 'En az 2 ürün seçin' });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onCompare).not.toHaveBeenCalled();
  });

  it('runs the compare action once enough items are picked', async () => {
    const onCompare = jest.fn();
    render(
      <UiProvider labels={LABELS}>
        <CompareTray
          max={3}
          minItems={3}
          items={ITEMS}
          onRemove={jest.fn()}
          onCompare={onCompare}
        />
      </UiProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Karşılaştır (3)' }));
    expect(onCompare).toHaveBeenCalledTimes(1);
  });

  it('removes an item, keeps focus in the tray and clears it', async () => {
    render(
      <UiProvider labels={LABELS}>
        <TrayHarness initial={ITEMS} />
      </UiProvider>,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Valeo balata ürününü karşılaştırmadan çıkar' }),
    );
    expect(
      screen.getByRole('button', { name: 'Febi balata ürününü karşılaştırmadan çıkar' }),
    ).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Temizle' }));
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });
});
