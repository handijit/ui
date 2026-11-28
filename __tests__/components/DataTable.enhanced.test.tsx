import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import DataTable, {
  DataTableRow,
  type DataTableColumn,
  type DataTableColumnState,
} from '@/components/DataTable';
import DataTableColumnMenu from '@/components/DataTableColumnMenu';
import UiProvider from '@/theme/UiProvider';
import { LABELS } from '@tests/fixtures/labels';

type Part = { code: string; name: string; stock: number };

const PARTS: Part[] = [
  { code: 'SP-1', name: 'Fren balatası', stock: 4 },
  { code: 'SP-2', name: 'Fren diski', stock: 0 },
  { code: 'SP-3', name: 'Yağ filtresi', stock: 12 },
];

const COLUMNS: DataTableColumn<Part>[] = [
  { key: 'code', label: 'Kod', isAlwaysVisible: true, render: part => part.code },
  { key: 'name', label: 'Ad', render: part => part.name },
  { key: 'stock', srLabel: 'Stok', render: part => <button type="button">{part.stock}</button> },
];

const renderTable = (ui: React.ReactElement) =>
  render(<UiProvider labels={LABELS}>{ui}</UiProvider>);

const headers = () => screen.getAllByRole('columnheader').map(cell => cell.textContent);
const firstRowCells = () =>
  within(screen.getAllByRole('row')[1])
    .getAllByRole('cell')
    .map(cell => cell.textContent);

describe('DataTable data mode', () => {
  it('draws one row per item with each column render', () => {
    renderTable(<DataTable columns={COLUMNS} rows={PARTS} getRowKey={part => part.code} />);

    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(firstRowCells()).toEqual(['SP-1', 'Fren balatası', '4']);
  });

  it('a column without render draws an empty cell', () => {
    renderTable(<DataTable columns={[{ key: 'x', label: 'X' }]} rows={[{}]} />);

    expect(within(screen.getAllByRole('row')[1]).getByRole('cell')).toHaveTextContent('');
  });

  it('keeps the state rows in data mode', () => {
    renderTable(<DataTable columns={COLUMNS} rows={[]} />);

    expect(screen.getByText('Kayıt yok')).toBeInTheDocument();
  });

  it('ignores children when rows are given', () => {
    renderTable(
      <DataTable columns={COLUMNS} rows={PARTS}>
        <DataTableRow>
          <td>ESKI</td>
        </DataTableRow>
      </DataTable>,
    );

    expect(screen.queryByText('ESKI')).not.toBeInTheDocument();
  });

  it('draws the compact density on the table', () => {
    const { container } = renderTable(
      <DataTable columns={COLUMNS} rows={PARTS} density="compact" />,
    );

    expect(container.querySelector('table')?.className).toMatch(/table--compact/);
  });
});

describe('DataTable column state', () => {
  it('orders and hides columns from a controlled state', () => {
    renderTable(
      <DataTable
        columns={COLUMNS}
        rows={PARTS}
        columnState={{ order: ['stock', 'code', 'stock', 'gone'], hidden: ['name', 'code'] }}
      />,
    );

    /* `code` cannot be hidden; a duplicate and an unknown key in `order` are skipped. */
    expect(headers()).toEqual(['Stok', 'Kod']);
    expect(firstRowCells()).toEqual(['4', 'SP-1']);
  });

  it('applies no column state to children rows', () => {
    renderTable(
      <DataTable
        columns={COLUMNS}
        columnState={{ order: ['stock'], hidden: ['name'] }}
        columnMenu={<DataTableColumnMenu />}
      >
        <DataTableRow>
          <td>SP-1</td>
          <td>Ad</td>
          <td>4</td>
        </DataTableRow>
      </DataTable>,
    );

    expect(headers()).toEqual(['Kod', 'Ad', 'Stok']);
    expect(screen.queryByRole('button', { name: 'Sütunlar' })).not.toBeInTheDocument();
  });

  it('the column menu hides a column and reorders (uncontrolled)', async () => {
    const onColumnStateChange = jest.fn();
    renderTable(
      <DataTable
        columns={COLUMNS}
        rows={PARTS}
        columnMenu={<DataTableColumnMenu />}
        onColumnStateChange={onColumnStateChange}
        testId="parts"
        className="custom"
      />,
    );

    expect(screen.getByTestId('parts')).toHaveClass('custom');
    await userEvent.click(screen.getByRole('button', { name: 'Sütunlar' }));
    const menu = screen.getByRole('dialog', { name: 'Sütunlar' });

    expect(within(menu).getByRole('checkbox', { name: 'Kod' })).toBeDisabled();

    await userEvent.click(within(menu).getByRole('checkbox', { name: 'Ad' }));
    expect(headers()).toEqual(['Kod', 'Stok']);
    expect(onColumnStateChange).toHaveBeenLastCalledWith({ order: [], hidden: ['name'] });

    await userEvent.click(within(menu).getByRole('checkbox', { name: 'Ad' }));
    expect(headers()).toEqual(['Kod', 'Ad', 'Stok']);

    await userEvent.click(within(menu).getByRole('button', { name: 'Stok sütununu öne al' }));
    expect(headers()).toEqual(['Kod', 'Stok', 'Ad']);

    await userEvent.click(within(menu).getByRole('button', { name: 'Kod sütununu geri al' }));
    expect(headers()).toEqual(['Stok', 'Kod', 'Ad']);
    expect(onColumnStateChange).toHaveBeenLastCalledWith({
      order: ['stock', 'code', 'name'],
      hidden: [],
    });
  });

  it('the edge move buttons are aria-disabled and do nothing', async () => {
    const onColumnStateChange = jest.fn();
    renderTable(
      <DataTable
        columns={COLUMNS}
        rows={PARTS}
        columnMenu={<DataTableColumnMenu />}
        columnState={{ order: [], hidden: [] }}
        onColumnStateChange={onColumnStateChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Sütunlar' }));
    const up = screen.getByRole('button', { name: 'Kod sütununu öne al' });
    const down = screen.getByRole('button', { name: 'Stok sütununu geri al' });

    expect(up).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(up);
    await userEvent.click(down);
    expect(onColumnStateChange).not.toHaveBeenCalled();
  });

  it('a controlled state only changes through the callback', async () => {
    const Controlled = () => {
      const [state, setState] = useState<DataTableColumnState>({ order: [], hidden: ['name'] });

      return (
        <DataTable
          columns={COLUMNS}
          rows={PARTS}
          columnMenu={
            <DataTableColumnMenu
              labels={{
                columns: 'Görünüm',
                moveUp: name => `${name} yukarı`,
                moveDown: name => `${name} aşağı`,
              }}
            />
          }
          columnState={state}
          onColumnStateChange={setState}
        />
      );
    };
    renderTable(<Controlled />);

    expect(headers()).toEqual(['Kod', 'Stok']);
    await userEvent.click(screen.getByRole('button', { name: 'Görünüm' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ad aşağı' }));
    expect(headers()).toEqual(['Kod', 'Stok']);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Ad' }));
    expect(headers()).toEqual(['Kod', 'Stok', 'Ad']);
  });

  it('draws no toolbar for a falsy columnMenu', () => {
    renderTable(<DataTable columns={COLUMNS} rows={PARTS} columnMenu={false} testId="parts" />);

    expect(screen.getByTestId('parts').querySelector('table')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sütunlar' })).not.toBeInTheDocument();
  });

  it('the column menu draws nothing outside a data-mode DataTable', () => {
    const { container } = renderTable(<DataTableColumnMenu />);

    expect(container).toBeEmptyDOMElement();
  });

  it('a column with a node label is named by its key in the menu', async () => {
    renderTable(
      <DataTable
        columns={[{ key: 'icon', label: <span>★</span>, render: () => '' }]}
        rows={PARTS}
        columnMenu={<DataTableColumnMenu />}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Sütunlar' }));
    expect(screen.getByRole('checkbox', { name: 'icon' })).toBeChecked();
  });
});

describe('DataTable keyboard rows', () => {
  const setup = () => {
    const onRowActivate = jest.fn();
    renderTable(<DataTable columns={COLUMNS} rows={PARTS} onRowActivate={onRowActivate} />);
    const rows = screen.getAllByRole('row').slice(1);

    return { onRowActivate, rows };
  };

  it('only the first row is a Tab stop', () => {
    const { rows } = setup();

    expect(rows.map(row => row.tabIndex)).toEqual([0, -1, -1]);
  });

  it('arrows move the active row, Home and End jump, Enter activates', async () => {
    const { onRowActivate, rows } = setup();

    await userEvent.tab();
    expect(rows[0]).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(rows[1]).toHaveFocus();
    expect(rows[1].className).toMatch(/row--active/);
    expect(rows.map(row => row.tabIndex)).toEqual([-1, 0, -1]);

    await userEvent.keyboard('{End}');
    expect(rows[2]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(rows[2]).toHaveFocus();

    await userEvent.keyboard('{Home}');
    expect(rows[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(rows[0]).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onRowActivate).toHaveBeenCalledWith(PARTS[1], 1);
  });

  it('other keys and keys from a cell control are left alone', async () => {
    const { onRowActivate, rows } = setup();

    act(() => rows[0].focus());
    await userEvent.keyboard('a');
    expect(rows[0]).toHaveFocus();

    const control = within(rows[0]).getByRole('button');
    act(() => control.focus());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(control).toHaveFocus();
    expect(onRowActivate).not.toHaveBeenCalledWith(PARTS[0], 0);
  });

  it('a click activates the row, a click on a cell control does not', async () => {
    const { onRowActivate, rows } = setup();

    await userEvent.click(within(rows[2]).getAllByRole('cell')[1]);
    expect(onRowActivate).toHaveBeenCalledWith(PARTS[2], 2);

    onRowActivate.mockClear();
    await userEvent.click(within(rows[1]).getByRole('button'));
    expect(onRowActivate).not.toHaveBeenCalled();
  });

  it('a click outside a row does nothing', () => {
    const { onRowActivate } = setup();
    const tbody = screen.getAllByRole('rowgroup')[1];

    fireEvent.click(tbody);
    expect(onRowActivate).not.toHaveBeenCalled();
  });

  it('no navigation without onRowActivate', () => {
    renderTable(<DataTable columns={COLUMNS} rows={PARTS} />);

    expect(screen.getAllByRole('row')[1]).not.toHaveAttribute('tabindex');
  });

  it('no navigation on a state row', () => {
    renderTable(<DataTable columns={COLUMNS} rows={PARTS} isLoading onRowActivate={jest.fn()} />);

    expect(screen.getAllByRole('row')[1]).not.toHaveAttribute('tabindex');
  });
});

describe('DataTable virtualization', () => {
  const MANY: Part[] = Array.from({ length: 10_000 }, (_, index) => ({
    code: `SP-${index}`,
    name: 'Parça',
    stock: index,
  }));

  const box = (node: HTMLElement, height: number) =>
    Object.defineProperty(node, 'clientHeight', { configurable: true, value: height });

  it('draws only the first window before a measurement', () => {
    const { container } = renderTable(
      <DataTable columns={COLUMNS} rows={MANY} isVirtualized label="Parçalar" />,
    );

    const rows = container.querySelectorAll('tbody tr[data-row-index]');
    /* 20 rows of the first view + 8 overscan; the rest is one spacer row. */
    expect(rows).toHaveLength(28);
    expect(container.querySelector('table')).toHaveAttribute('aria-rowcount', '10001');
    expect(rows[0]).toHaveAttribute('aria-rowindex', '2');
    expect(container.querySelectorAll('tbody tr[aria-hidden="true"]')).toHaveLength(1);
  });

  it('draws every row while printing and windows again afterwards (3.2.2)', () => {
    const { container } = renderTable(
      <DataTable columns={COLUMNS} rows={MANY.slice(0, 500)} isVirtualized label="Parçalar" />,
    );
    const drawn = () => container.querySelectorAll('tbody tr[data-row-index]').length;
    const spacers = () => container.querySelectorAll('tbody tr[aria-hidden="true"]').length;
    expect(drawn()).toBe(28);

    act(() => {
      window.dispatchEvent(new Event('beforeprint'));
    });
    expect(drawn()).toBe(500);
    expect(spacers()).toBe(0);

    act(() => {
      window.dispatchEvent(new Event('afterprint'));
    });
    expect(drawn()).toBe(28);
    expect(spacers()).toBe(1);
  });

  it('follows the scroll position with a fixed row height', () => {
    const { container } = renderTable(
      <DataTable columns={COLUMNS} rows={MANY} isVirtualized density="compact" />,
    );
    const scroller = container.querySelector<HTMLElement>('[class*="wrapper--virtual"]');
    if (!scroller) throw new Error('no scroll box');

    expect(scroller.style.getPropertyValue('--ui-data-table-row-height')).toBe('36px');

    box(scroller, 360);
    scroller.scrollTop = 36 * 1000;
    act(() => {
      scroller.dispatchEvent(new Event('scroll'));
    });

    const indexes = [...container.querySelectorAll('tbody tr[data-row-index]')].map(row =>
      Number(row.getAttribute('data-row-index')),
    );
    expect(indexes[0]).toBe(992);
    expect(indexes.at(-1)).toBe(1017);
    expect(container.querySelectorAll('tbody tr[aria-hidden="true"]')).toHaveLength(2);
  });

  it('End scrolls the box and focuses the last row; Home brings the first back', async () => {
    const { container } = renderTable(
      <DataTable
        columns={COLUMNS}
        rows={MANY}
        isVirtualized
        rowHeight={40}
        onRowActivate={jest.fn()}
      />,
    );
    const scroller = container.querySelector<HTMLElement>('[class*="wrapper--virtual"]');
    if (!scroller) throw new Error('no scroll box');
    box(scroller, 400);

    await userEvent.tab();
    await userEvent.keyboard('{End}');

    expect(scroller.scrollTop).toBe(40 * 10_000 - 400);
    expect(document.activeElement).toHaveAttribute('data-row-index', '9999');

    await userEvent.keyboard('{Home}');
    expect(scroller.scrollTop).toBe(0);
    expect(document.activeElement).toHaveAttribute('data-row-index', '0');
  });

  it('keeps a Tab stop on the first drawn row when the active row is out of view', async () => {
    const { container } = renderTable(
      <DataTable columns={COLUMNS} rows={MANY} isVirtualized onRowActivate={jest.fn()} />,
    );
    const scroller = container.querySelector<HTMLElement>('[class*="wrapper--virtual"]');
    if (!scroller) throw new Error('no scroll box');
    box(scroller, 480);

    await userEvent.tab();
    scroller.scrollTop = 48 * 5000;
    act(() => {
      scroller.dispatchEvent(new Event('scroll'));
    });

    const stops = container.querySelectorAll('tbody tr[tabindex="0"]');
    expect(stops).toHaveLength(1);
    expect(stops[0]).toHaveAttribute('data-row-index', String(5000 - 8));
  });

  it('is off in children mode', () => {
    const { container } = renderTable(
      <DataTable columns={COLUMNS} isVirtualized>
        <DataTableRow>
          <td>SP-1</td>
        </DataTableRow>
      </DataTable>,
    );

    expect(container.querySelector('[class*="wrapper--virtual"]')).toBeNull();
  });
});
