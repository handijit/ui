import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppShellNav, AppShellNavItem } from '@/components/AppShell';
import DataTable, { type DataTableColumn } from '@/components/DataTable';
import Gallery from '@/components/Gallery';
import Steps from '@/components/Steps';
import Table from '@/components/Table';
import UiProvider from '@/theme/UiProvider';
import { axe } from '@tests/support/axe';
import { LABELS } from '@tests/fixtures/labels';

const read = (path: string) => readFileSync(resolve(__dirname, '../../src', path), 'utf8');

describe('DataTable column alignment (3.4)', () => {
  type Row = { code: string; stock: number; price: string };
  const COLUMNS: DataTableColumn<Row>[] = [
    { key: 'code', label: 'Kod', render: row => row.code },
    { key: 'stock', label: 'Stok', isNumeric: true, isSortable: true, render: row => row.stock },
    { key: 'price', label: 'Fiyat', align: 'center', isNumeric: true, render: row => row.price },
  ];

  it('aligns numeric columns to the end in tabular figures, and keeps the default at the start', async () => {
    render(
      <UiProvider labels={LABELS}>
        <DataTable
          label="Parçalar"
          columns={COLUMNS}
          rows={[{ code: 'A1', stock: 12, price: '₺1,00' }]}
          onSort={jest.fn()}
        />
      </UiProvider>,
    );

    const [code, stock, price] = screen.getAllByRole('columnheader');
    expect(code).toHaveClass('cell--start');
    expect(code).not.toHaveClass('cell--numeric');
    expect(stock).toHaveClass('cell--end', 'cell--numeric');
    expect(price).toHaveClass('cell--center', 'cell--numeric');
    expect(screen.getByRole('cell', { name: '12' })).toHaveClass('cell--end', 'cell--numeric');
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('moves the sort button with the alignment', () => {
    const scss = read('components/DataTable/index.module.scss');

    expect(scss).toMatch(
      /\.cell--end \{\s*text-align: end;\s*\.sort \{\s*justify-content: flex-end;/,
    );
    expect(scss).toMatch(/\.cell--numeric \{\s*font-variant-numeric: tabular-nums;/);
  });
});

describe('Gallery placeholder and counter (3.4)', () => {
  it('draws the placeholder in the image place when there is no image', () => {
    render(
      <Gallery
        label="Ürün görselleri"
        images={[]}
        placeholder={<span>Görsel yok</span>}
        labels={{ fullscreen: 'Tam ekran' }}
      />,
    );

    expect(screen.getByRole('region', { name: 'Ürün görselleri' })).toHaveTextContent('Görsel yok');
  });

  it('writes the position on the main image for more than one image', () => {
    const images = [
      { src: 'a.png', alt: 'Ön' },
      { src: 'b.png', alt: 'Arka' },
    ];
    const { rerender } = render(
      <UiProvider labels={LABELS}>
        <Gallery label="Görseller" images={images} hasCounter />
      </UiProvider>,
    );
    expect(screen.getByText('1 / 2')).toHaveClass('stage__counter');

    rerender(
      <UiProvider labels={LABELS}>
        <Gallery label="Görseller" images={images.slice(0, 1)} hasCounter />
      </UiProvider>,
    );
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument();
  });
});

describe('Steps mobileLayout (3.4)', () => {
  const STEPS = ['Sepet', 'Teslimat', 'Ödeme'].map(label => ({ id: label, label }));

  it('keeps a horizontal stepper on one line on a phone only when asked', () => {
    const { rerender } = render(
      <UiProvider labels={LABELS}>
        <Steps
          label="Sipariş adımları"
          steps={STEPS}
          currentIndex={1}
          mobileLayout="row"
          testId="steps"
        />
      </UiProvider>,
    );
    expect(screen.getByTestId('steps')).toHaveClass('steps--mobile-row');

    rerender(
      <UiProvider labels={LABELS}>
        <Steps
          label="Sipariş adımları"
          steps={STEPS}
          currentIndex={1}
          orientation="vertical"
          mobileLayout="row"
          testId="steps"
        />
      </UiProvider>,
    );
    expect(screen.getByTestId('steps')).not.toHaveClass('steps--mobile-row');

    expect(read('components/Steps/index.module.scss')).toMatch(
      /\.steps__item:not\(\.steps__item--current\) \.steps__text \{\s*@include visually-hidden;/,
    );
  });
});

describe('Table spec variant (3.4)', () => {
  it('marks a key → value table and styles row headers and values', async () => {
    render(
      <Table variant="spec" data-testid="spec">
        <caption>Teknik özellikler</caption>
        <tbody>
          <tr>
            <th scope="row">Çap</th>
            <td>280 mm</td>
          </tr>
        </tbody>
      </Table>,
    );

    expect(screen.getByTestId('spec')).toHaveClass('table--spec');
    expect(screen.getByRole('rowheader', { name: 'Çap' })).toBeInTheDocument();
    expect(read('components/Table/index.module.scss')).toMatch(
      /&--spec \{[\s\S]*@include technical-text;/,
    );
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('AppShellNav action rows (3.4)', () => {
  it('draws a button row for an action, from data or as a part', async () => {
    const signOut = jest.fn();
    const help = jest.fn();
    render(
      <UiProvider labels={LABELS}>
        <AppShellNav
          label="Hesap menüsü"
          sections={[{ id: 's', items: [{ id: 'out', label: 'Çıkış yap', onClick: signOut }] }]}
        >
          <AppShellNavItem label="Yardım" onClick={help} />
          <AppShellNavItem label="Pasif" onClick={help} isDisabled />
        </AppShellNav>
      </UiProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Çıkış yap' }));
    await userEvent.click(screen.getByRole('button', { name: 'Yardım' }));
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(help).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Pasif' })).not.toBeInTheDocument();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('overline font hook (3.4)', () => {
  it('every overline reads `--ui-overline-font`, with its own family as the fallback', () => {
    expect(read('styles/_mixins.scss')).toMatch(
      /@mixin overline \{\s*font-family: var\(--ui-overline-font, #\{\$font-body\}\);/,
    );
    expect(read('components/Eyebrow/index.module.scss')).toContain(
      'font-family: var(--ui-overline-font, #{$font-mono});',
    );
    expect(read('components/Table/index.module.scss')).toContain(
      'font-family: var(--ui-overline-font, #{$font-body});',
    );
  });
});
