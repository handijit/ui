import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import TreeSelect, { type TreeSelectNode } from '@/components/TreeSelect';
import UiProvider from '@/theme/UiProvider';
import { LABELS } from '@tests/fixtures/labels';

const NODES: TreeSelectNode[] = [
  {
    value: 'fren',
    label: 'Fren sistemi',
    children: [
      { value: 'balata', label: 'Balata' },
      { value: 'disk', label: 'Disk', isDisabled: true },
    ],
  },
  {
    value: 'filtre',
    label: 'Filtreler',
    children: [{ value: 'yag', label: 'Yağ filtresi' }],
  },
  { value: 'aku', label: 'Akü' },
];

const item = (name: string) => screen.getByRole('treeitem', { name: new RegExp(`^${name}`) });

const Single = (props: { initial?: string | null; onChange?: (value: string | null) => void }) => {
  const [value, setValue] = useState<string | null>(props.initial ?? null);

  return (
    <TreeSelect
      label="Kategoriler"
      nodes={NODES}
      value={value}
      onChange={next => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
};

const Multiple = ({ onChange }: { onChange?: (value: string[]) => void }) => {
  const [value, setValue] = useState<string[]>([]);

  return (
    <TreeSelect
      label="Kategoriler"
      nodes={NODES}
      isMultiple
      value={value}
      onChange={next => {
        setValue(next);
        onChange?.(next);
      }}
      hasSearch
    />
  );
};

const renderWithLabels = (ui: React.ReactElement) =>
  render(<UiProvider labels={LABELS}>{ui}</UiProvider>);

describe('TreeSelect — ARIA tree', () => {
  it('names the tree and describes each item', () => {
    renderWithLabels(<Single initial="aku" />);

    const tree = screen.getByRole('tree', { name: 'Kategoriler' });
    expect(tree).not.toHaveAttribute('aria-multiselectable');
    expect(item('Fren sistemi')).toHaveAttribute('aria-expanded', 'false');
    expect(item('Fren sistemi')).toHaveAttribute('aria-level', '1');
    expect(item('Fren sistemi')).toHaveAttribute('aria-posinset', '1');
    expect(item('Fren sistemi')).toHaveAttribute('aria-setsize', '3');
    expect(item('Akü')).not.toHaveAttribute('aria-expanded');
    expect(item('Akü')).toHaveAttribute('aria-selected', 'true');
    /* The selected item holds the one Tab stop. */
    expect(item('Akü')).toHaveAttribute('tabindex', '0');
    expect(item('Fren sistemi')).toHaveAttribute('tabindex', '-1');
  });

  it('the toggle opens and closes a branch', async () => {
    renderWithLabels(<Single />);
    const toggle = item('Fren sistemi').querySelector('[aria-hidden]') as HTMLElement;

    await userEvent.click(toggle);
    expect(item('Fren sistemi')).toHaveAttribute('aria-expanded', 'true');
    expect(within(item('Fren sistemi')).getByRole('group')).toBeInTheDocument();
    expect(item('Balata')).toHaveAttribute('aria-level', '2');

    await userEvent.click(toggle);
    expect(item('Fren sistemi')).toHaveAttribute('aria-expanded', 'false');

    /* The toggle of a leaf does nothing; the click selects the row instead. */
    await userEvent.click(item('Akü').querySelector('[aria-hidden]') as HTMLElement);
    expect(item('Akü')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('TreeSelect — keyboard', () => {
  it('walks, opens, closes, climbs to the parent and selects', async () => {
    const onChange = jest.fn();
    renderWithLabels(<Single onChange={onChange} />);

    await userEvent.tab();
    expect(item('Fren sistemi')).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    expect(item('Fren sistemi')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(item('Balata')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(item('Balata')).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('balata');
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(null);

    await userEvent.keyboard('{ArrowDown}');
    expect(item('Disk')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledTimes(2);

    await userEvent.keyboard('{ArrowLeft}');
    expect(item('Fren sistemi')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(item('Fren sistemi')).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{ArrowLeft}');
    expect(item('Fren sistemi')).toHaveFocus();

    await userEvent.keyboard('{End}');
    expect(item('Akü')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(item('Akü')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(item('Filtreler')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(item('Fren sistemi')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(item('Fren sistemi')).toHaveFocus();
    await userEvent.keyboard('x');
    expect(item('Fren sistemi')).toHaveFocus();
  });

  it('ignores keys that do not come from an item', () => {
    renderWithLabels(<Single />);
    const tree = screen.getByRole('tree');

    fireEvent.keyDown(tree, { key: 'ArrowDown' });
    expect(item('Fren sistemi')).toHaveAttribute('tabindex', '0');
  });
});

describe('TreeSelect — selection', () => {
  it('multiple choice toggles values and marks the tree multiselectable', async () => {
    const onChange = jest.fn();
    renderWithLabels(<Multiple onChange={onChange} />);

    expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
    await userEvent.click(within(item('Akü')).getByText('Akü'));
    await userEvent.click(within(item('Filtreler')).getByText('Filtreler'));
    expect(onChange).toHaveBeenLastCalledWith(['aku', 'filtre']);
    expect(item('Akü')).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(within(item('Akü')).getByText('Akü'));
    expect(onChange).toHaveBeenLastCalledWith(['filtre']);
  });

  it('a click on a row selects and a second click clears (single)', async () => {
    const onChange = jest.fn();
    renderWithLabels(<Single onChange={onChange} />);

    await userEvent.click(within(item('Akü')).getByText('Akü'));
    expect(onChange).toHaveBeenLastCalledWith('aku');
    expect(item('Akü')).toHaveFocus();
    await userEvent.click(within(item('Akü')).getByText('Akü'));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});

describe('TreeSelect — search', () => {
  it('keeps matches with their opened ancestors and shows an empty state', async () => {
    renderWithLabels(<Multiple />);
    const search = screen.getByRole('searchbox', { name: 'Kategori ara' });

    await userEvent.type(search, 'yag');
    expect(item('Filtreler')).toHaveAttribute('aria-expanded', 'true');
    expect(item('Yağ filtresi')).toBeInTheDocument();
    expect(screen.queryByRole('treeitem', { name: /Fren/ })).not.toBeInTheDocument();
    expect(search).toHaveAttribute('aria-controls', screen.getByRole('tree').id);

    /* A matching branch keeps its subtree, closed until opened. */
    await userEvent.clear(search);
    await userEvent.type(search, 'fren');
    expect(item('Fren sistemi')).toHaveAttribute('aria-expanded', 'false');

    await userEvent.type(search, 'zzz');
    expect(screen.getByRole('status')).toHaveTextContent('Eşleşen kategori yok');
    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
    expect(search).not.toHaveAttribute('aria-controls');

    await userEvent.clear(search);
    expect(screen.getAllByRole('treeitem')).toHaveLength(3);
  });

  it('a controlled expansion reports changes and label props win', async () => {
    const onExpandedChange = jest.fn();
    render(
      <TreeSelect
        label="Kategoriler"
        nodes={NODES}
        value={null}
        onChange={jest.fn()}
        expanded={['fren']}
        onExpandedChange={onExpandedChange}
        hasSearch
        labels={{ search: 'Ara', empty: 'Yok' }}
        className="tree"
        testId="tree"
      />,
    );

    expect(screen.getByTestId('tree')).toHaveClass('tree');
    expect(screen.getByRole('searchbox', { name: 'Ara' })).toBeInTheDocument();
    expect(item('Balata')).toBeInTheDocument();

    act(() => item('Fren sistemi').focus());
    await userEvent.keyboard('{ArrowLeft}');
    expect(onExpandedChange).toHaveBeenLastCalledWith([]);
    expect(item('Fren sistemi')).toHaveAttribute('aria-expanded', 'true');

    act(() => item('Filtreler').focus());
    await userEvent.keyboard('{ArrowRight}');
    expect(onExpandedChange).toHaveBeenLastCalledWith(['fren', 'filtre']);
  });
});
