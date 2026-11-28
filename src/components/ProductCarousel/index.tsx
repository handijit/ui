'use client';

import { Children, type KeyboardEvent, memo, type ReactNode } from 'react';

import { ArrowRight } from 'react-bootstrap-icons';

import UISize from '../../enums/ui-size.enum';
import UIVariant from '../../enums/ui-variant.enum';
import type { CarouselItemsPerView } from '../../helpers/carousel.helper';
import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { FOCUSABLE_SELECTOR } from '../../helpers/focus.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import type { UiLinkExtraProps } from '../../types/link.type';
import type { Formatter } from '../../types/theme.type';
import Button from '../Button';
import Carousel from '../Carousel';
import SectionHeader from '../SectionHeader';

import styles from './index.module.scss';

export type ProductCarouselLabels = {
  previous: Formatter<[title: string]>;
  next: Formatter<[title: string]>;
  seeAll: string;
};

type Props = {
  /** The rail's heading ("Çok satanlar"); also its name and the arrows' context. */
  title: string;
  description?: string;
  overline?: string;
  /** The heading level; `h2` by default. */
  as?: 'h2' | 'h3';
  /** The catalogue page this rail is a preview of: the "see all" link. */
  seeAllHref?: string;
  seeAllLinkProps?: UiLinkExtraProps;
  /** The cards, one per child. */
  children: ReactNode;
  /** Cards side by side per width; `{ base: 1.5, sm: 2.5, md: 3, lg: 4, xl: 5 }` by default. */
  itemsPerView?: CarouselItemsPerView;
  labels?: Partial<ProductCarouselLabels>;
  className?: string;
  testId?: string;
};

const DEFAULT_PER_VIEW: CarouselItemsPerView = { base: 1.5, sm: 2.5, md: 3, lg: 4, xl: 5 };

const STEP: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 };

/**
 * A showcase rail (3.4) — "best sellers", "on sale" — on `Carousel`: a section heading with "see
 * all", arrows that page the rail, snap, responsive card counts, and ←/→ (Home/End) moving focus
 * from card to card. Draws nothing without cards.
 */
const ProductCarousel = ({
  title,
  description,
  overline,
  as = 'h2',
  seeAllHref,
  seeAllLinkProps,
  children,
  itemsPerView = DEFAULT_PER_VIEW,
  labels: labelProps,
  className,
  testId,
}: Props) => {
  const { labels: config } = useUi();
  const text = config?.productCarousel;
  const cards = Children.toArray(children);

  if (cards.length === 0) return null;

  /* Arrows between cards: the focus moves to the next card's first control (its link). */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const item = target.closest<HTMLElement>(`.${styles.rail__item}`);
    if (!item?.parentElement || target.matches('input, textarea, select')) return;

    const items = [...item.parentElement.children] as HTMLElement[];
    const index = items.indexOf(item);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : event.key in STEP
            ? index + STEP[event.key] * (document.dir === 'rtl' ? -1 : 1)
            : -1;
    const focusable = items[next]?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable || next === index) return;

    event.preventDefault();
    focusable.focus();
  };

  return (
    // The keys bubble up from the cards' own links; the wrapper only listens.
    <div className={cx(styles.rail, className)} onKeyDown={handleKeyDown} data-testid={testId}>
      <Carousel
        label={title}
        previousLabel={resolveFormatter(
          'ProductCarousel.labels.previous',
          labelProps?.previous ?? text?.previous,
          title,
        )}
        nextLabel={resolveFormatter(
          'ProductCarousel.labels.next',
          labelProps?.next ?? text?.next,
          title,
        )}
        itemsPerView={itemsPerView}
        header={
          <SectionHeader
            title={title}
            description={description}
            overline={overline}
            as={as}
            size="sm"
            action={
              seeAllHref && (
                <Button
                  variant={UIVariant.GHOST}
                  size={UISize.SMALL}
                  href={seeAllHref}
                  linkProps={seeAllLinkProps}
                  endIcon={<ArrowRight aria-hidden />}
                >
                  {resolveLabel('ProductCarousel.labels.seeAll', labelProps?.seeAll, text?.seeAll)}
                </Button>
              )
            }
          />
        }
      >
        {cards.map((card, index) => (
          <div key={index} className={styles.rail__item}>
            {card}
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ProductCarousel, 'ProductCarousel'),
) as typeof ProductCarousel;
