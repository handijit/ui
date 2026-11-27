import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Gallery, { type GalleryRenderImageProps } from '@/components/Gallery';
import { resetModalStack } from '@/helpers/focus.helper';
import UiProvider from '@/theme/UiProvider';
import { LABELS } from '@tests/fixtures/labels';

/* jsdom has no `PointerEvent`; a `MouseEvent` carries the same coordinates. */
class TestPointerEvent extends MouseEvent {
  pointerType: string;

  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? 'mouse';
  }
}

beforeAll(() => {
  Object.defineProperty(window, 'PointerEvent', { configurable: true, value: TestPointerEvent });
});

beforeEach(() => {
  resetModalStack();
  /* The scroll lock restores the page position; jsdom does not implement `scrollTo`. */
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

const IMAGES = [
  { src: 'a.png', alt: 'Ön yüz', thumbnailSrc: 'a-thumb.png', width: 800, height: 600 },
  { src: 'b.png', alt: 'Arka yüz' },
  { src: 'c.png', alt: 'Yan yüz' },
];

const renderGallery = (props: Partial<React.ComponentProps<typeof Gallery>> = {}) =>
  render(
    <UiProvider labels={LABELS}>
      <Gallery label="Ürün görselleri" images={IMAGES} {...props} />
    </UiProvider>,
  );

const mainImage = () => within(screen.getByRole('button', { name: /Tam ekran/ })).getByRole('img');

const thumbs = () => within(screen.getByRole('list', { name: 'Görseller' })).getAllByRole('button');

describe('Gallery', () => {
  it('draws the main image, thumbnails and a named region', () => {
    renderGallery();

    expect(screen.getByRole('region', { name: 'Ürün görselleri' })).toBeInTheDocument();
    expect(mainImage()).toHaveAttribute('alt', 'Ön yüz');
    expect(mainImage()).toHaveAttribute('width', '800');
    expect(thumbs()).toHaveLength(3);
    expect(thumbs()[0]).toHaveAttribute('aria-current', 'true');
    expect(thumbs()[0]).toHaveAccessibleName('Görsel 1 / 3');
    expect(thumbs()[0].querySelector('img')).toHaveAttribute('src', 'a-thumb.png');
    expect(thumbs()[1].querySelector('img')).toHaveAttribute('src', 'b.png');
  });

  it('draws nothing without images, and no strip or arrows for one image', () => {
    const { container, rerender } = renderGallery({ images: [] });
    expect(container).toBeEmptyDOMElement();

    rerender(
      <UiProvider labels={LABELS}>
        <Gallery label="Tek" images={IMAGES.slice(0, 1)} />
      </UiProvider>,
    );
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sonraki görsel' })).not.toBeInTheDocument();
  });

  it('a thumbnail, the arrows and the arrow keys change the image (wrapping)', async () => {
    const onIndexChange = jest.fn();
    renderGallery({ onIndexChange });

    await userEvent.click(thumbs()[2]);
    expect(mainImage()).toHaveAttribute('alt', 'Yan yüz');

    await userEvent.click(screen.getByRole('button', { name: 'Sonraki görsel' }));
    expect(mainImage()).toHaveAttribute('alt', 'Ön yüz');

    await userEvent.click(screen.getByRole('button', { name: 'Önceki görsel' }));
    expect(mainImage()).toHaveAttribute('alt', 'Yan yüz');
    expect(onIndexChange).toHaveBeenLastCalledWith(2);

    act(() => thumbs()[2].focus());
    await userEvent.keyboard('{ArrowRight}');
    expect(thumbs()[0]).toHaveFocus();
    expect(mainImage()).toHaveAttribute('alt', 'Ön yüz');

    await userEvent.keyboard('{End}');
    expect(thumbs()[2]).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(thumbs()[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(mainImage()).toHaveAttribute('alt', 'Yan yüz');
    await userEvent.keyboard('a');
    expect(mainImage()).toHaveAttribute('alt', 'Yan yüz');

    act(() => screen.getByRole('button', { name: /Tam ekran/ }).focus());
    await userEvent.keyboard('{ArrowRight}');
    expect(mainImage()).toHaveAttribute('alt', 'Ön yüz');
  });

  it('a controlled index only changes through the callback', async () => {
    const onIndexChange = jest.fn();
    renderGallery({ index: 7, onIndexChange });

    /* Out of range clamps to the last image. */
    expect(mainImage()).toHaveAttribute('alt', 'Yan yüz');
    await userEvent.click(thumbs()[0]);
    expect(onIndexChange).toHaveBeenCalledWith(0);
    expect(mainImage()).toHaveAttribute('alt', 'Yan yüz');
  });

  it('passes the adapter what it needs to draw each image', () => {
    const renderImage = jest.fn(({ src, alt, className, variant }: GalleryRenderImageProps) => (
      <span
        data-variant={variant}
        data-src={src}
        className={className}
        role="img"
        aria-label={alt}
      />
    ));
    renderGallery({ renderImage });

    expect(renderImage).toHaveBeenCalledWith(
      expect.objectContaining({
        src: 'a.png',
        alt: 'Ön yüz',
        variant: 'main',
        index: 0,
        width: 800,
      }),
    );
    expect(renderImage).toHaveBeenCalledWith(
      expect.objectContaining({ src: 'b.png', alt: '', variant: 'thumbnail', index: 1 }),
    );
  });

  it('swipes change the image and the click after a swipe does not open the view', () => {
    const { container } = renderGallery();
    const open = screen.getByRole('button', { name: /Tam ekran/ });
    const stage = open.parentElement as HTMLElement;

    fireEvent.pointerDown(stage, { clientX: 200, clientY: 10 });
    fireEvent.pointerUp(stage, { clientX: 100, clientY: 20 });
    fireEvent.click(open);
    expect(mainImage()).toHaveAttribute('alt', 'Arka yüz');
    expect(container.querySelector('dialog')).not.toHaveAttribute('open');

    fireEvent.pointerDown(stage, { clientX: 100, clientY: 10 });
    fireEvent.pointerUp(stage, { clientX: 200, clientY: 10 });
    expect(mainImage()).toHaveAttribute('alt', 'Ön yüz');

    /* Too short, mostly vertical, or without a start: a tap, not a swipe. */
    fireEvent.pointerDown(stage, { clientX: 100, clientY: 10 });
    fireEvent.pointerUp(stage, { clientX: 120, clientY: 10 });
    fireEvent.pointerDown(stage, { clientX: 100, clientY: 10 });
    fireEvent.pointerUp(stage, { clientX: 160, clientY: 200 });
    fireEvent.pointerUp(stage, { clientX: 400, clientY: 10 });
    expect(mainImage()).toHaveAttribute('alt', 'Ön yüz');
  });

  it('a mouse over the stage moves the zoom origin; touch and hasZoom=false do not', () => {
    const { rerender } = renderGallery();
    const stage = screen.getByRole('button', { name: /Tam ekran/ }).parentElement as HTMLElement;
    stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;

    fireEvent.pointerMove(stage, { clientX: 50, clientY: 25, pointerType: 'mouse' });
    expect(stage.style.getPropertyValue('--ui-gallery-zoom-x')).toBe('25%');
    expect(stage.style.getPropertyValue('--ui-gallery-zoom-y')).toBe('25%');

    fireEvent.pointerMove(stage, { clientX: 150, clientY: 25, pointerType: 'touch' });
    expect(stage.style.getPropertyValue('--ui-gallery-zoom-x')).toBe('25%');

    rerender(
      <UiProvider labels={LABELS}>
        <Gallery label="Ürün görselleri" images={IMAGES} hasZoom={false} />
      </UiProvider>,
    );
    fireEvent.pointerMove(stage, { clientX: 150, clientY: 25, pointerType: 'mouse' });
    expect(stage.style.getPropertyValue('--ui-gallery-zoom-x')).toBe('25%');
    expect(stage.className).not.toMatch(/stage--zoom/);
  });

  it('a zero-sized stage zooms from the centre', () => {
    renderGallery();
    const stage = screen.getByRole('button', { name: /Tam ekran/ }).parentElement as HTMLElement;

    fireEvent.pointerMove(stage, { clientX: 50, clientY: 25, pointerType: 'mouse' });
    expect(stage.style.getPropertyValue('--ui-gallery-zoom-x')).toBe('50%');
  });
});

describe('Gallery full-screen view', () => {
  const openViewer = async () => {
    renderGallery();
    await userEvent.click(screen.getByRole('button', { name: /Tam ekran/ }));

    return screen.getByRole('dialog', { name: 'Ürün görselleri' });
  };

  it('opens a modal dialog with the position, keys walk the images, close returns focus', async () => {
    const viewer = await openViewer();

    expect(viewer).toHaveAttribute('open');
    expect(within(viewer).getByText('1 / 3')).toBeInTheDocument();

    fireEvent.keyDown(viewer, { key: 'ArrowRight' });
    expect(within(viewer).getByText('2 / 3')).toBeInTheDocument();
    expect(within(viewer).getByRole('img')).toHaveAttribute('alt', 'Arka yüz');

    await userEvent.click(within(viewer).getByRole('button', { name: 'Önceki görsel' }));
    expect(within(viewer).getByText('1 / 3')).toBeInTheDocument();

    await userEvent.click(within(viewer).getByRole('button', { name: 'Kapat' }));
    expect(viewer).not.toHaveAttribute('open');
    expect(screen.getByRole('button', { name: /Tam ekran/ })).toHaveFocus();
  });

  it('Escape (the cancel event) closes the view', async () => {
    const viewer = await openViewer();

    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(viewer, cancel);

    expect(cancel.defaultPrevented).toBe(true);
    expect(viewer).not.toHaveAttribute('open');
  });

  it('zooms by button and by click at the point; a zoomed image does not swipe', async () => {
    const viewer = await openViewer();
    const image = within(viewer).getByRole('img');
    const stage = image.parentElement as HTMLElement;
    stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 400 }) as DOMRect;

    await userEvent.click(within(viewer).getByRole('button', { name: 'Yakınlaştır' }));
    expect(stage.className).toMatch(/viewer__stage--zoomed/);
    await userEvent.click(within(viewer).getByRole('button', { name: 'Uzaklaştır' }));
    expect(stage.className).not.toMatch(/viewer__stage--zoomed/);

    fireEvent.click(stage, { clientX: 100, clientY: 300 });
    expect(stage.className).toMatch(/viewer__stage--zoomed/);
    expect(stage.style.getPropertyValue('--ui-gallery-zoom-x')).toBe('25%');
    expect(stage.style.getPropertyValue('--ui-gallery-zoom-y')).toBe('75%');

    fireEvent.pointerMove(stage, { clientX: 200, clientY: 200 });
    expect(stage.style.getPropertyValue('--ui-gallery-zoom-x')).toBe('50%');

    fireEvent.pointerDown(stage, { clientX: 300, clientY: 10 });
    fireEvent.pointerUp(stage, { clientX: 100, clientY: 10 });
    expect(within(viewer).getByText('1 / 3')).toBeInTheDocument();
  });

  it('swipes in the view; the click after a swipe does not zoom; unzoomed moves are ignored', async () => {
    const viewer = await openViewer();
    const stage = within(viewer).getByRole('img').parentElement as HTMLElement;

    fireEvent.pointerMove(stage, { clientX: 10, clientY: 10 });
    expect(stage.style.getPropertyValue('--ui-gallery-zoom-x')).toBe('');

    fireEvent.pointerDown(stage, { clientX: 300, clientY: 10 });
    fireEvent.pointerUp(stage, { clientX: 100, clientY: 10 });
    fireEvent.click(stage);
    expect(within(viewer).getByText('2 / 3')).toBeInTheDocument();
    expect(stage.className).not.toMatch(/viewer__stage--zoomed/);
  });

  it('without zoom: no zoom button and a click does not zoom', async () => {
    renderGallery({ hasZoom: false, labels: { fullscreen: 'Büyüt', close: 'Kapat şunu' } });
    await userEvent.click(screen.getByRole('button', { name: /Büyüt/ }));
    const viewer = screen.getByRole('dialog');

    expect(within(viewer).queryByRole('button', { name: 'Yakınlaştır' })).not.toBeInTheDocument();
    const stage = within(viewer).getByRole('img').parentElement as HTMLElement;
    fireEvent.click(stage);
    expect(stage.className).not.toMatch(/viewer__stage--zoomed/);
    expect(within(viewer).getByRole('button', { name: 'Kapat şunu' })).toBeInTheDocument();
  });
});
