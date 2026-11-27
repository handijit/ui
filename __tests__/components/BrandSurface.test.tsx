import { render, screen } from '@testing-library/react';

import BrandSurface, { BrandBlueprint } from '@/components/BrandSurface';
import Eyebrow from '@/components/Eyebrow';
import StatStrip from '@/components/StatStrip';
import { brandSurface } from '@handijitcom/ui/design';

const SHAPE = { viewBox: '0 0 10 10', body: 'M0 0h10v10H0z', dot: 'M1 1h2v2H1z' };

/** Every `url(#…)` an element of the tree points at, and every id it declares. */
const references = (root: Element): { urls: string[]; ids: string[] } => ({
  urls: [...root.querySelectorAll('[fill], [mask]')]
    .flatMap(element => [element.getAttribute('fill'), element.getAttribute('mask')])
    .flatMap(value => /^url\(#(.+)\)$/.exec(value ?? '')?.slice(1) ?? []),
  ids: [...root.querySelectorAll('[id]')].map(element => element.id),
});

describe('BrandSurface', () => {
  it('is a named region with its content, and marks itself for what sits on it', () => {
    render(
      <BrandSurface aria-labelledby="surface-title" testId="surface">
        <h2 id="surface-title">Projenizi konuşalım</h2>
      </BrandSurface>,
    );

    const region = screen.getByRole('region', { name: 'Projenizi konuşalım' });
    expect(region.tagName).toBe('SECTION');
    expect(region).toHaveAttribute('data-ui-brand-surface', '');
    expect(screen.getByTestId('surface')).toBe(region);
  });

  it('draws the imagery as decorative SVG, not as a CSS gradient', () => {
    const { container } = render(<BrandSurface as="div">Metin</BrandSurface>);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(container.firstElementChild?.getAttribute('style')).toBeNull();
  });

  it('points every url() at an id of its own, unique per surface', () => {
    const { container } = render(
      <>
        <BrandSurface as="div" dots="both">
          A
        </BrandSurface>
        <BrandSurface as="div" dots="both">
          B
        </BrandSurface>
      </>,
    );
    const { urls, ids } = references(container);

    expect(new Set(ids).size).toBe(ids.length);
    expect(urls).toHaveLength(12);
    expect(urls.every(url => ids.includes(url))).toBe(true);
    expect(ids.every(id => /^[\w-]+$/.test(id))).toBe(true);
  });

  it('draws the glows and the dot grid on the sides asked for', () => {
    const count = (glow: 'start' | 'end' | 'both' | 'none', dots: typeof glow) => {
      const { container, unmount } = render(
        <BrandSurface as="div" glow={glow} dots={dots}>
          x
        </BrandSurface>,
      );
      const svg = container.querySelector('svg') as SVGSVGElement;
      const result = {
        glows: svg.querySelectorAll(':scope > circle').length,
        fadeStops: svg.querySelectorAll('linearGradient[x2="1"] stop').length,
        hasDots: svg.querySelector('pattern') !== null,
      };
      unmount();
      return result;
    };

    expect(count('both', 'both')).toEqual({ glows: 2, fadeStops: 4, hasDots: true });
    expect(count('start', 'start')).toEqual({ glows: 1, fadeStops: 2, hasDots: true });
    expect(count('end', 'end')).toEqual({ glows: 1, fadeStops: 2, hasDots: true });
    expect(count('none', 'none')).toEqual({ glows: 0, fadeStops: 0, hasDots: false });
  });

  it('takes the geometry from the design recipe', () => {
    const { container } = render(<BrandSurface as="div">x</BrandSurface>);
    const pattern = container.querySelector('pattern');

    expect(pattern).toHaveAttribute('width', String(brandSurface.dotCell));
    expect(pattern?.querySelector('circle')).toHaveAttribute('r', String(brandSurface.dotRadius));
    expect(container.querySelector('linearGradient stop:nth-child(2)')).toHaveAttribute(
      'offset',
      String(brandSurface.gradientHold),
    );
  });

  it('hides the artwork from assistive technology and puts the footer under the content', () => {
    const { container } = render(
      <BrandSurface
        aria-label="Kapanış"
        artwork={<BrandBlueprint shape={SHAPE} testId="art" />}
        footer={<StatStrip variant="brand" items={[{ value: '4,9', label: 'puan' }]} />}
      >
        <p>İçerik</p>
      </BrandSurface>,
    );

    expect(screen.getByTestId('art').parentElement).toHaveAttribute('aria-hidden', 'true');
    const region = screen.getByRole('region', { name: 'Kapanış' });
    expect(region.lastElementChild).toContainElement(screen.getByRole('list'));
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);
  });
});

describe('BrandBlueprint', () => {
  it('draws the body in its own gradient and the dot only when given', () => {
    const { container, rerender } = render(<BrandBlueprint shape={SHAPE} />);
    const { urls, ids } = references(container);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', SHAPE.viewBox);
    expect(urls).toEqual(ids);
    expect(container.querySelectorAll('path')).toHaveLength(2);

    rerender(<BrandBlueprint shape={{ viewBox: SHAPE.viewBox, body: SHAPE.body }} />);
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });
});

describe('Eyebrow', () => {
  it('is text in the element asked for; the rules are not content', () => {
    const { container } = render(
      <Eyebrow align="center" as="span" testId="eyebrow">
        Sektör · Çözüm
      </Eyebrow>,
    );

    const eyebrow = screen.getByTestId('eyebrow');
    expect(eyebrow.tagName).toBe('SPAN');
    expect(eyebrow).toHaveTextContent(/^Sektör · Çözüm$/);
    expect(container.querySelectorAll('span')).toHaveLength(1);
  });

  it('is a paragraph by default', () => {
    render(<Eyebrow>Hizmetler</Eyebrow>);

    expect(screen.getByText('Hizmetler').tagName).toBe('P');
  });

  /* 3.2.1: under `lang="tr"` CSS capitals turn "Mann-Filter" into "MANN-FİLTER". */
  it('keeps a proper name as written with isUppercase={false}; capitals stay the default', () => {
    render(
      <>
        <Eyebrow>Hizmetler</Eyebrow>
        <Eyebrow isUppercase={false}>Mann-Filter</Eyebrow>
      </>,
    );

    expect(screen.getByText('Hizmetler')).not.toHaveClass('eyebrow--as-written');
    expect(screen.getByText('Mann-Filter')).toHaveClass('eyebrow', 'eyebrow--as-written');
  });
});

describe('StatStrip', () => {
  it('is a list read value first, then label', () => {
    render(
      <StatStrip
        aria-label="Rakamlarla"
        items={[
          { value: '4,9', label: 'ortalama puan' },
          { value: '2 saat', label: 'yanıt süresi' },
        ]}
      />,
    );

    const list = screen.getByRole('list', { name: 'Rakamlarla' });
    const items = screen.getAllByRole('listitem');
    expect(list).toHaveAttribute('role', 'list');
    expect(items.map(item => item.textContent)).toEqual([
      '4,9 ortalama puan',
      '2 saat yanıt süresi',
    ]);
  });
});
