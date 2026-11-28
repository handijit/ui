/**
 * How many cards a rail shows side by side, from a width up (3.4): `base` below 641px, `sm` from
 * 641px, `md` from 769px, `lg` from 1025px, `xl` from 1281px (the design breakpoints). A fraction
 * (`1.5`) leaves the next card peeking, which tells a touch user the rail scrolls.
 */
export type CarouselItemsPerView = Partial<Record<'base' | 'sm' | 'md' | 'lg' | 'xl', number>>;

const STEPS = ['base', 'sm', 'md', 'lg', 'xl'] as const;

/**
 * Every step filled from the one below it, as custom properties for the track. A missing `base`
 * is 1; counts below 1 are 1.
 */
export const itemsPerViewStyle = (perView: CarouselItemsPerView): Record<string, string> => {
  let current = 1;

  return Object.fromEntries(
    STEPS.map(step => {
      current = Math.max(1, perView[step] ?? current);
      return [`--ui-carousel-per-view-${step}`, String(current)];
    }),
  );
};
