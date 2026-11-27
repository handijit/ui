import { render, screen } from '@testing-library/react';

import PageHeader from '@/components/PageHeader';
import SectionHeader from '@/components/SectionHeader';

/*
 * 3.2.1: a brand in the eyebrow ("Mann-Filter") was capitalised by CSS, and under `lang="tr"` the
 * browser wrote "MANN-FİLTER". Capitals stay the default; `false` keeps the text as written.
 */
describe('header eyebrows keep a proper name as written', () => {
  it('PageHeader: isEyebrowUppercase={false}', () => {
    const { rerender } = render(<PageHeader title="Ön fren diski" eyebrow="Mann-Filter" />);
    expect(screen.getByText('Mann-Filter')).not.toHaveClass('header__eyebrow--as-written');

    rerender(<PageHeader title="Ön fren diski" eyebrow="Mann-Filter" isEyebrowUppercase={false} />);
    expect(screen.getByText('Mann-Filter')).toHaveClass(
      'header__eyebrow',
      'header__eyebrow--as-written',
    );
  });

  it('SectionHeader: isOverlineUppercase={false}', () => {
    const { rerender } = render(<SectionHeader title="Muadiller" overline="Febi Bilstein" />);
    expect(screen.getByText('Febi Bilstein')).not.toHaveClass('header__overline--as-written');

    rerender(
      <SectionHeader title="Muadiller" overline="Febi Bilstein" isOverlineUppercase={false} />,
    );
    expect(screen.getByText('Febi Bilstein')).toHaveClass(
      'header__overline',
      'header__overline--as-written',
    );
  });
});
