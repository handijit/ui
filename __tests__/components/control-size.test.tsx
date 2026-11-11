import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';

import Combobox from '@/components/Combobox';
import DateField, { DateRange } from '@/components/DateField';
import Input from '@/components/Input';

const noop = () => {};
const read = (path: string): string => readFileSync(path, 'utf8');

/*
 * `size="sm"` — ayni seritteki `Select sm`, `Button` SMALL ve girdiler tek yukseklikte (32px).
 * Olcu `input-sm` mixin'inde TEK yerde; bilesenler yalniz sinifi takar.
 */
describe('yoğun ölçü (`size="sm"`)', () => {
  it('`Input` sınıfı takar ve `size`ı yerel öğeye SIZDIRMAZ', () => {
    render(<Input aria-label="Ara" size="sm" />);

    const input = screen.getByRole('textbox', { name: 'Ara' });

    expect(input).toHaveClass('input--sm');
    /* Yerel `size` karakter genisligi; `size="sm"` DOM'a inseydi gecersiz bir nitelik olurdu. */
    expect(input).not.toHaveAttribute('size');
  });

  it('varsayılan `md`: yoğun sınıf YOK', () => {
    render(<Input aria-label="Ara" />);

    expect(screen.getByRole('textbox', { name: 'Ara' })).not.toHaveClass('input--sm');
  });

  it('`DateField` sınıfı takar ve `size`ı sızdırmaz', () => {
    render(<DateField aria-label="Tarih" size="sm" defaultValue="2026-03-01" />);

    const field = screen.getByLabelText('Tarih');

    expect(field).toHaveClass('dateField--sm');
    expect(field).not.toHaveAttribute('size');
  });

  it('`DateRange` ölçüyü İKİ alana da geçirir', () => {
    render(
      <DateRange
        value={{ start: '2026-03-01', end: '2026-03-14' }}
        onChange={noop}
        startLabel="Başlangıç"
        endLabel="Bitiş"
        size="sm"
      />,
    );

    expect(screen.getByLabelText('Başlangıç')).toHaveClass('dateField--sm');
    expect(screen.getByLabelText('Bitiş')).toHaveClass('dateField--sm');
  });

  it('`Combobox` sınıfı takar (2.3): bir cari seçici küçük `Select`lerin yanında 32px', () => {
    render(
      <Combobox
        options={[{ value: 'a', label: 'Birinci' }]}
        value="a"
        onChange={noop}
        size="sm"
        labels={{ placeholder: 'Cari' }}
      />,
    );

    expect(screen.getByRole('combobox')).toHaveClass('combobox__trigger--sm');
  });

  it('`Combobox` varsayılanı `md`: yoğun sınıf YOK', () => {
    render(
      <Combobox
        options={[{ value: 'a', label: 'Birinci' }]}
        value={null}
        onChange={noop}
        labels={{ placeholder: 'Cari' }}
      />,
    );

    expect(screen.getByRole('combobox')).not.toHaveClass('combobox__trigger--sm');
  });

  it('ölçü TEK yerde: `Select`, `Combobox`, `Input` ve `DateField` aynı mixin', () => {
    expect(read('src/components/Select/index.module.scss')).toMatch(/@include\s+input-sm;/);
    expect(read('src/components/Combobox/index.module.scss')).toMatch(
      /&--sm\s*\{\s*@include\s+input-sm;/,
    );
    expect(read('src/components/Input/index.module.scss')).toMatch(/@include\s+input-sm\(true\)/);
    expect(read('src/components/DateField/index.module.scss')).toMatch(
      /@include\s+input-sm\(true\)/,
    );
  });

  it('metin girdisi dar ekranda ve dokunmatikte 16px altına İNMEZ', () => {
    const mixins = read('src/styles/_mixins.scss');
    const start = mixins.indexOf('@mixin input-sm');
    /* The mixin only: up to the next one, so a later mixin cannot satisfy the match. */
    const block = mixins.slice(start, mixins.indexOf('@mixin', start + 1));

    expect(block).toMatch(/@include\s+for-mobile[\s\S]*font-size-control/);
    expect(block).toMatch(/@include\s+for-touch[\s\S]*font-size-control/);
  });
});

describe('desktop program findings (2.3)', () => {
  it('the clear button of `Combobox` is at least 24px by itself (WCAG 2.5.8, what axe measures)', () => {
    const size = /\$clear-size:\s*(\d+)px/.exec(read('src/components/Combobox/index.module.scss'));

    expect(Number(size?.[1])).toBeGreaterThanOrEqual(24);
  });

  it('a technical input draws its placeholder in the body font, without letter spacing', () => {
    const scss = read('src/components/Input/index.module.scss');
    const block = scss.slice(scss.indexOf('&--technical'));

    expect(block).toMatch(
      /&::placeholder\s*\{[^}]*font-family:\s*\$font-body;[^}]*letter-spacing:\s*normal;/,
    );
  });

  it('the toast stack has no width rule of its own: the placement decides at every width', () => {
    const scss = read('src/components/Toast/index.module.scss');
    const hub = scss.slice(scss.indexOf('.hub {'), scss.indexOf('.toast {'));

    expect(hub).not.toMatch(/for-desktop-up|for-mobile|min-width|max-width/);
  });
});
