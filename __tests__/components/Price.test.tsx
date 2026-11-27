import { render, screen } from '@testing-library/react';

import Price from '@/components/Price';
import UiProvider from '@/theme/UiProvider';

const text = (testId: string) => screen.getByTestId(testId).textContent;

/*
 * 3.2.1: the lira is written as `@handijitcom/tr` `formatLira` writes it — sign first, no space,
 * a minus in front of the sign. 3.2.0 drew "2.649,57₺" on the parts portal.
 */
describe('Price — currency placement', () => {
  it('puts "₺" before the amount by default, with no space', () => {
    render(<Price value="2.649,57" currency="₺" testId="price" />);

    expect(text('price')).toBe('₺2.649,57');
  });

  it('takes "₺" from the provider just the same', () => {
    render(
      <UiProvider labels={{ currency: '₺' }}>
        <Price value="981,47" testId="price" />
      </UiProvider>,
    );

    expect(text('price')).toBe('₺981,47');
  });

  it('keeps a minus in front of the sign, ASCII or U+2212', () => {
    render(
      <>
        <Price value="-0,05" currency="₺" testId="ascii" />
        <Price value={'−0,05'} currency="₺" testId="unicode" />
      </>,
    );

    expect(text('ascii')).toBe('-₺0,05');
    expect(text('unicode')).toBe('−₺0,05');
  });

  it('writes the list price the same way', () => {
    render(<Price value="1.000,00" listValue="1.250,00" currency="₺" testId="price" />);

    expect(screen.getByTestId('price').querySelector('s')?.textContent).toBe('₺1.250,00');
  });

  it('leaves any other symbol or code after the amount, as before', () => {
    render(<Price value="2.649,57" currency="TL" testId="price" />);

    expect(text('price')).toBe('2.649,57TL');
  });

  it('currencyPosition overrides the default either way', () => {
    render(
      <>
        <Price value="2.649,57" currency="₺" currencyPosition="suffix" testId="suffix" />
        <Price value="10,00" currency="€" currencyPosition="prefix" testId="prefix" />
      </>,
    );

    expect(text('suffix')).toBe('2.649,57₺');
    expect(text('prefix')).toBe('€10,00');
    expect(screen.getByText('€')).toHaveClass('price__currency--prefix');
  });
});
