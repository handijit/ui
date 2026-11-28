'use client';

import {
  type KeyboardEvent,
  memo,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ArrowsFullscreen,
  ChevronLeft,
  ChevronRight,
  XLg,
  ZoomIn,
  ZoomOut,
} from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { captureFocus, isTopModal, pushModal } from '../../helpers/focus.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import useScrollLock from '../../hooks/useScrollLock';
import { useUi } from '../../theme/context';
import type { Formatter } from '../../types/theme.type';
import IconButton from '../IconButton';

import styles from './index.module.scss';

export type GalleryImage = {
  src: string;
  /** What the image shows ("Fren balatası, ön yüz"). */
  alt: string;
  /** A smaller file for the thumbnail; `src` when omitted. */
  thumbnailSrc?: string;
  width?: number;
  height?: number;
};

/** Where an image is drawn: the adapter picks sizes and priority from it. */
export type GalleryImageVariant = 'main' | 'thumbnail' | 'fullscreen';

/** What `renderImage` receives. `className` MUST reach the element: zoom is drawn through it. */
export type GalleryRenderImageProps = {
  src: string;
  alt: string;
  className: string;
  variant: GalleryImageVariant;
  /** The image's position in `images`. */
  index: number;
  width?: number;
  height?: number;
};

export type GalleryLabels = {
  thumbnails: string;
  thumbnail: Formatter<[index: number, total: number]>;
  previous: string;
  next: string;
  fullscreen: string;
  zoomIn: string;
  zoomOut: string;
  close: string;
};

type Props = {
  images: GalleryImage[];
  /** The gallery's accessible name ("Ürün görselleri"); also the full-screen view's name. */
  label: string;
  /**
   * Draws one image — the platform's own component (`next/image`, a cached Electron loader). A
   * plain `<img>` when omitted.
   */
  renderImage?: (props: GalleryRenderImageProps) => ReactNode;
  /** Controlled index of the shown image; uncontrolled when omitted. */
  index?: number;
  onIndexChange?: (index: number) => void;
  /** Magnifies the main image under a mouse pointer and lets the full-screen view zoom (default). */
  hasZoom?: boolean;
  /**
   * Drawn in the image's place when `images` is empty (3.4): the product's "no image" artwork.
   * Without it an empty gallery draws nothing.
   */
  placeholder?: ReactNode;
  /** Writes "2 / 5" on the main image (3.4): on a phone the thumbnails may be scrolled away. */
  hasCounter?: boolean;
  labels?: Partial<GalleryLabels>;
  className?: string;
  testId?: string;
};

/* A horizontal drag this long (px) is a swipe, not a tap. */
const SWIPE_DISTANCE = 40;

const defaultRenderImage = ({
  src,
  alt,
  className,
  width,
  height,
  variant,
}: GalleryRenderImageProps) => (
  <img
    src={src}
    alt={alt}
    className={className}
    width={width}
    height={height}
    loading={variant === 'thumbnail' ? 'lazy' : undefined}
    decoding="async"
    draggable={false}
  />
);

/** Writes the zoom origin as custom properties: no re-render on every pointer move. */
const setZoomOrigin = (element: HTMLElement, clientX: number, clientY: number) => {
  const rect = element.getBoundingClientRect();
  const x = rect.width > 0 ? ((clientX - rect.left) / rect.width) * 100 : 50;
  const y = rect.height > 0 ? ((clientY - rect.top) / rect.height) * 100 : 50;
  element.style.setProperty('--ui-gallery-zoom-x', `${x}%`);
  element.style.setProperty('--ui-gallery-zoom-y', `${y}%`);
};

/** Product gallery: main image, thumbnails, hover zoom and a full-screen view (3.1). */
const Gallery = ({
  images,
  label,
  renderImage = defaultRenderImage,
  index: controlledIndex,
  onIndexChange,
  hasZoom = true,
  placeholder,
  hasCounter,
  labels: labelProps,
  className,
  testId,
}: Props) => {
  const { labels: config } = useUi();
  const [innerIndex, setInnerIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbsRef = useRef<HTMLUListElement>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  /* A swipe ends with a click on the same element: that click must not open the viewer. */
  const didSwipeRef = useRef(false);

  const total = images.length;
  const current = Math.max(0, Math.min(controlledIndex ?? innerIndex, total - 1));

  const text = {
    thumbnails: resolveLabel(
      'Gallery.labels.thumbnails',
      labelProps?.thumbnails,
      config?.gallery?.thumbnails,
    ),
    previous: resolveLabel(
      'Gallery.labels.previous',
      labelProps?.previous,
      config?.gallery?.previous,
    ),
    next: resolveLabel('Gallery.labels.next', labelProps?.next, config?.gallery?.next),
    fullscreen: resolveLabel(
      'Gallery.labels.fullscreen',
      labelProps?.fullscreen,
      config?.gallery?.fullscreen,
    ),
  };

  const select = useCallback(
    (next: number) => {
      const wrapped = (next + total) % total;
      if (controlledIndex === undefined) setInnerIndex(wrapped);
      setIsZoomed(false);
      onIndexChange?.(wrapped);
    },
    [controlledIndex, onIndexChange, total],
  );

  const close = useCallback(() => {
    setIsFullscreen(false);
    setIsZoomed(false);
  }, []);

  /* The viewer is a modal `<dialog>`, opened and closed like `Modal`. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isFullscreen || !dialog) return;

    const restoreFocus = captureFocus();
    if (!dialog.open) dialog.showModal();
    const { token, pop } = pushModal();

    const handleCancel = (event: Event) => {
      event.preventDefault();
      if (isTopModal(token)) close();
    };
    dialog.addEventListener('cancel', handleCancel);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      if (dialog.open) dialog.close();
      pop();
      restoreFocus();
    };
  }, [isFullscreen, close]);

  useScrollLock(isFullscreen);

  if (total === 0)
    return placeholder ? (
      <section className={cx(styles.gallery, className)} aria-label={label} data-testid={testId}>
        <div className={cx(styles.stage, styles['stage--empty'])}>{placeholder}</div>
      </section>
    ) : null;

  const image = images[current];
  const hasMany = total > 1;

  const handleArrowKeys = (event: KeyboardEvent<HTMLElement>, moveFocus = false) => {
    const target: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowLeft: current - 1,
      Home: 0,
      End: total - 1,
    };
    if (!hasMany || !(event.key in target)) return;

    event.preventDefault();
    const next = (target[event.key] + total) % total;
    select(next);
    if (moveFocus) thumbsRef.current?.querySelectorAll('button')[next]?.focus();
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    didSwipeRef.current = false;
    swipeRef.current = isZoomed ? null : { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || !hasMany) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy)) return;

    didSwipeRef.current = true;
    select(current + (dx < 0 ? 1 : -1));
  };

  const handleStageMove = (event: PointerEvent<HTMLElement>) => {
    if (hasZoom && event.pointerType === 'mouse')
      setZoomOrigin(event.currentTarget, event.clientX, event.clientY);
  };

  const openViewer = () => {
    if (didSwipeRef.current) return;
    setIsFullscreen(true);
  };

  const toggleZoomAt = (event: MouseEvent<HTMLElement>) => {
    if (!hasZoom || didSwipeRef.current) return;
    setZoomOrigin(event.currentTarget, event.clientX, event.clientY);
    setIsZoomed(zoomed => !zoomed);
  };

  const handleViewerMove = (event: PointerEvent<HTMLElement>) => {
    if (isZoomed) setZoomOrigin(event.currentTarget, event.clientX, event.clientY);
  };

  const imageProps = (variant: GalleryImageVariant, className: string) => ({
    src: image.src,
    alt: image.alt,
    className,
    variant,
    index: current,
    width: image.width,
    height: image.height,
  });

  const arrows = hasMany && (
    <>
      <IconButton
        icon={<ChevronLeft aria-hidden className={styles.arrowIcon} />}
        label={text.previous}
        variant="secondary"
        shape="round"
        className={cx(styles.arrow, styles['arrow--previous'])}
        onClick={() => select(current - 1)}
      />
      <IconButton
        icon={<ChevronRight aria-hidden className={styles.arrowIcon} />}
        label={text.next}
        variant="secondary"
        shape="round"
        className={cx(styles.arrow, styles['arrow--next'])}
        onClick={() => select(current + 1)}
      />
    </>
  );

  return (
    <section className={cx(styles.gallery, className)} aria-label={label} data-testid={testId}>
      <div
        className={cx(styles.stage, hasZoom && styles['stage--zoom'])}
        onPointerMove={handleStageMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onKeyDown={event => handleArrowKeys(event)}
      >
        <button type="button" className={styles.stage__open} onClick={openViewer}>
          {renderImage(imageProps('main', styles.image))}
          <span className={styles.srOnly}>{text.fullscreen}</span>
          <ArrowsFullscreen aria-hidden className={styles.stage__hint} />
        </button>
        {hasCounter && hasMany && (
          <span className={styles.stage__counter}>
            {current + 1} / {total}
          </span>
        )}
        {arrows}
      </div>

      {hasMany && (
        <ul ref={thumbsRef} className={styles.thumbs} aria-label={text.thumbnails}>
          {images.map((item, position) => (
            <li key={`${item.src}-${position}`}>
              <button
                type="button"
                className={styles.thumb}
                aria-current={position === current || undefined}
                aria-label={resolveFormatter(
                  'Gallery.labels.thumbnail',
                  labelProps?.thumbnail ?? config?.gallery?.thumbnail,
                  position + 1,
                  total,
                )}
                tabIndex={position === current ? 0 : -1}
                onClick={() => select(position)}
                onKeyDown={event => handleArrowKeys(event, true)}
              >
                {renderImage({
                  src: item.thumbnailSrc ?? item.src,
                  alt: '',
                  className: styles.thumb__image,
                  variant: 'thumbnail',
                  index: position,
                  width: item.width,
                  height: item.height,
                })}
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        className={styles.viewer}
        aria-label={label}
        onKeyDown={event => handleArrowKeys(event)}
      >
        {isFullscreen && (
          <>
            <div className={styles.viewer__bar}>
              <span className={styles.viewer__count} aria-live="polite">
                {current + 1} / {total}
              </span>
              {hasZoom && (
                <IconButton
                  icon={isZoomed ? <ZoomOut aria-hidden /> : <ZoomIn aria-hidden />}
                  label={
                    isZoomed
                      ? resolveLabel(
                          'Gallery.labels.zoomOut',
                          labelProps?.zoomOut,
                          config?.gallery?.zoomOut,
                        )
                      : resolveLabel(
                          'Gallery.labels.zoomIn',
                          labelProps?.zoomIn,
                          config?.gallery?.zoomIn,
                        )
                  }
                  variant="secondary"
                  onClick={() => setIsZoomed(zoomed => !zoomed)}
                />
              )}
              <IconButton
                icon={<XLg aria-hidden />}
                label={resolveLabel('Gallery.labels.close', labelProps?.close, config?.close)}
                variant="secondary"
                onClick={close}
              />
            </div>
            <div
              className={cx(styles.viewer__stage, isZoomed && styles['viewer__stage--zoomed'])}
              onClick={toggleZoomAt}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerMove={handleViewerMove}
            >
              {renderImage(imageProps('fullscreen', styles.viewer__image))}
            </div>
            {arrows}
          </>
        )}
      </dialog>
    </section>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Gallery, 'Gallery')) as typeof Gallery;
