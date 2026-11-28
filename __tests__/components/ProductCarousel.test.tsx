import { fireEvent, render, screen } from '@testing-library/react';

import Carousel from '@/components/Carousel';
import ProductCarousel from '@/components/ProductCarousel';
import UiProvider from '@/theme/UiProvider';
import { axe } from '@tests/support/axe';
import { LABELS } from '@tests/fixtures/labels';

const CARDS = ['Balata', 'Filtre', 'Buji'].map(name => (
  <article key={name}>
    <a href={`#${name}`}>{name}</a>
    <button type="button">{`${name} sepete`}</button>
  </article>
));

const renderRail = (props: Partial<React.ComponentProps<typeof ProductCarousel>> = {}) =>
  render(
    <UiProvider labels={LABELS}>
      <ProductCarousel title="Çok satanlar" seeAllHref="/cok-satanlar" testId="rail" {...props}>
        {props.children ?? CARDS}
      </ProductCarousel>
    </UiProvider>,
  );

describe('ProductCarousel', () => {
  it('draws nothing without cards', () => {
    const { container } = render(<ProductCarousel title="Boş">{[]}</ProductCarousel>);

    expect(container).toBeEmptyDOMElement();
  });

  it('heads the rail, links to the whole list and names the arrows with the title', async () => {
    renderRail({ description: 'Son 30 gün', overline: 'Vitrin' });

    expect(screen.getByRole('region', { name: 'Çok satanlar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Çok satanlar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tümünü gör' })).toHaveAttribute(
      'href',
      '/cok-satanlar',
    );
    expect(screen.getByRole('button', { name: 'Çok satanlar: önceki ürünler' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Çok satanlar: sonraki ürünler' }),
    ).toBeInTheDocument();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('lays the cards out per view with the default counts', () => {
    const { container } = renderRail({ seeAllHref: undefined, as: 'h3' });

    const track = container.querySelector('.carousel__track') as HTMLElement;
    expect(track).toHaveClass('carousel__track--fit');
    expect(track.style.getPropertyValue('--ui-carousel-per-view-base')).toBe('1.5');
    expect(track.style.getPropertyValue('--ui-carousel-per-view-xl')).toBe('5');
    expect(screen.queryByRole('link', { name: 'Tümünü gör' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('moves focus from card to card with the arrows, Home and End', () => {
    renderRail();
    const first = screen.getByRole('link', { name: 'Balata' });
    first.focus();

    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(screen.getByRole('link', { name: 'Filtre' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'End' });
    expect(screen.getByRole('link', { name: 'Buji' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    expect(screen.getByRole('link', { name: 'Buji' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(first).toHaveFocus();

    /* Inside a card a second control keeps the key: the card's own button moves to the next card. */
    const button = screen.getByRole('button', { name: 'Balata sepete' });
    button.focus();
    fireEvent.keyDown(button, { key: 'ArrowRight' });
    expect(screen.getByRole('link', { name: 'Filtre' })).toHaveFocus();
  });

  it('mirrors the arrows in a right-to-left page', () => {
    document.dir = 'rtl';
    renderRail();
    const first = screen.getByRole('link', { name: 'Balata' });
    first.focus();

    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(screen.getByRole('link', { name: 'Filtre' })).toHaveFocus();
    document.dir = '';
  });

  it('leaves keys outside the cards, other keys and form fields alone', () => {
    renderRail({
      children: [
        <input key="search" aria-label="Ara" />,
        <a key="a" href="#a">
          A
        </a>,
      ],
    });

    const field = screen.getByRole('textbox', { name: 'Ara' });
    field.focus();
    fireEvent.keyDown(field, { key: 'ArrowRight' });
    expect(field).toHaveFocus();

    const link = screen.getByRole('link', { name: 'A' });
    link.focus();
    fireEvent.keyDown(link, { key: 'Enter' });
    expect(link).toHaveFocus();

    const seeAll = screen.getByRole('link', { name: 'Tümünü gör' });
    seeAll.focus();
    fireEvent.keyDown(seeAll, { key: 'ArrowRight' });
    expect(seeAll).toHaveFocus();
  });

  it('takes its own labels', () => {
    renderRail({ labels: { seeAll: 'Hepsi', previous: () => 'Geri', next: () => 'İleri' } });

    expect(screen.getByRole('link', { name: 'Hepsi' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Geri' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'İleri' })).toBeInTheDocument();
  });
});

describe('Carousel 3.4 options', () => {
  it('draws a header in the arrows row and keeps the fixed width without itemsPerView', () => {
    const { container } = render(
      <Carousel label="Şerit" previousLabel="Önceki" nextLabel="Sonraki" header={<h2>Başlık</h2>}>
        <div>Kart</div>
      </Carousel>,
    );

    expect(container.querySelector('.carousel__controls > .carousel__header')).toHaveTextContent(
      'Başlık',
    );
    const track = container.querySelector('.carousel__track') as HTMLElement;
    expect(track).not.toHaveClass('carousel__track--fit');
    expect(track.style.getPropertyValue('--ui-carousel-per-view-base')).toBe('');
  });
});
