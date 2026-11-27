import { type FC, memo, type ReactNode, useId } from 'react';

import { brandSurface } from '@handijitcom/ui/design';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

/** Where a decorative layer sits; `start` and `end` follow the writing direction. */
export type BrandSurfaceSide = 'start' | 'end' | 'both' | 'none';

/** A supergraphic's outline: the shape of `logos.mark` of `@handijitcom/ui/design` fits. */
export type BrandBlueprintShape = {
  viewBox: string;
  /** Path data of the body, drawn in the blueprint's white fill and outline. */
  body: string;
  /** Path data of the mark's dot, filled with the accent like the logo's. */
  dot?: string;
};

type BrandSurfaceProps = {
  children: ReactNode;
  /** The element. A `section` is a landmark only with a name: pass `aria-labelledby`. */
  as?: 'section' | 'div' | 'header' | 'footer' | 'aside';
  /** Soft white sheens at the top corners. */
  glow?: BrandSurfaceSide;
  /** The white dot grid, fading out towards the content. */
  dots?: BrandSurfaceSide;
  /** Decorative artwork at the bottom end (a `BrandBlueprint`); hidden below the tablet width. */
  artwork?: ReactNode;
  /** A full-width strip under the content, outside its padding (`StatStrip variant="brand"`). */
  footer?: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  id?: string;
  testId?: string;
};

type BlueprintProps = {
  shape: BrandBlueprintShape;
  className?: string;
  testId?: string;
};

/*
 * The glow circles, in percent of the surface: a radius in percent is measured against the
 * surface's normalised diagonal, so the glow grows with it instead of flooding a phone-sized one.
 */
const GLOWS = {
  start: { cx: '8%', cy: '14%', r: '42%' },
  end: { cx: '92%', cy: '22%', r: '38%' },
} as const;

/*
 * Where the dot grid is visible along the surface's width: full at the edge, gone by a quarter of
 * the way in, so the content column stays clear.
 */
const DOT_REACH = 0.24;

const sidesOf = (side: BrandSurfaceSide): ('start' | 'end')[] => {
  if (side === 'both') return ['start', 'end'];
  if (side === 'none') return [];
  return [side];
};

/** The mask stops of the dot grid: `true` is the edge opacity, `false` transparent. */
const fadeStops = (side: BrandSurfaceSide): [offset: number, isEdge: boolean][] =>
  sidesOf(side).flatMap(edge =>
    edge === 'start'
      ? [
          [0, true],
          [DOT_REACH, false],
        ]
      : [
          [1 - DOT_REACH, false],
          [1, true],
        ],
  );

/*
 * Ids come from `useId`: two surfaces on a page, or the same one rendered twice, must not share
 * gradient ids. `useId` also runs in a server component, so the module carries no `'use client'`
 * and the surface sends no JavaScript. It returns `:r1:`, `«r1»` or `_r_1_` by React version; an
 * SVG `url(#…)` wants plain characters.
 */
const svgId = (prefix: string, id: string): string => `${prefix}-${id.replace(/[^\w-]/g, '')}`;

/**
 * BrandSurface — the brand's cobalt surface: a hero, a closing call, a sign-in side, a footer,
 * the same in both themes. Cobalt (`primary`) with white on it, deepening to one darker cobalt
 * step; its imagery (gradient, white sheens, white dot grid) is inline SVG, decorative and hidden
 * from assistive technology, never a CSS gradient. Descendants draw a white focus ring, and the
 * `ACCENT` button glows softly on it.
 * @example <BrandSurface as="section" aria-labelledby="cta" footer={<StatStrip variant="brand" … />}>
 */
const BrandSurface: FC<BrandSurfaceProps> = ({
  children,
  as: Tag = 'section',
  glow = 'both',
  dots = 'end',
  artwork,
  footer,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
  id,
  testId,
}) => {
  const base = svgId('ui-brand', useId());
  const fade = fadeStops(dots);

  return (
    <Tag
      id={id}
      className={cx(styles.surface, artwork !== undefined && styles['surface--artwork'], className)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-ui-brand-surface=""
      data-testid={testId}
    >
      <svg className={styles.surface__backdrop} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${base}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className={styles['surface__stop-from']} />
            <stop offset={brandSurface.gradientHold} className={styles['surface__stop-from']} />
            <stop offset="1" className={styles['surface__stop-to']} />
          </linearGradient>
          <radialGradient id={`${base}-glow`}>
            <stop offset="0" className={styles['surface__glow-centre']} />
            <stop offset="1" className={styles['surface__glow-edge']} />
          </radialGradient>
          {fade.length > 0 && (
            <>
              <pattern
                id={`${base}-dots`}
                width={brandSurface.dotCell}
                height={brandSurface.dotCell}
                patternUnits="userSpaceOnUse"
              >
                <circle
                  className={styles.surface__dot}
                  cx={brandSurface.dotCell / 2}
                  cy={brandSurface.dotCell / 2}
                  r={brandSurface.dotRadius}
                />
              </pattern>
              <linearGradient id={`${base}-fade`} x1="0" y1="0" x2="1" y2="0">
                {fade.map(([offset, isEdge]) => (
                  <stop
                    key={offset}
                    offset={offset}
                    className={
                      isEdge ? styles['surface__fade-edge'] : styles['surface__fade-clear']
                    }
                  />
                ))}
              </linearGradient>
              <mask id={`${base}-mask`} className={styles.surface__mask}>
                <rect width="100%" height="100%" fill={`url(#${base}-fade)`} />
              </mask>
            </>
          )}
        </defs>
        <rect width="100%" height="100%" fill={`url(#${base}-fill)`} />
        {sidesOf(glow).map(side => (
          <circle key={side} {...GLOWS[side]} fill={`url(#${base}-glow)`} />
        ))}
        {fade.length > 0 && (
          <rect
            width="100%"
            height="100%"
            fill={`url(#${base}-dots)`}
            mask={`url(#${base}-mask)`}
          />
        )}
      </svg>

      {artwork !== undefined && (
        <div className={styles.surface__artwork} aria-hidden="true">
          {artwork}
        </div>
      )}

      <div className={styles.surface__body}>{children}</div>

      {footer !== undefined && <div className={styles.surface__footer}>{footer}</div>}
    </Tag>
  );
};

/**
 * BrandBlueprint — a supergraphic in the blueprint style: a white fill that fades out, a white
 * outline at low opacity and the solid coral dot of the logo. Decorative only (`aria-hidden`);
 * give it to `BrandSurface`'s `artwork`.
 * @example <BrandBlueprint shape={logos.mark} />
 */
const Blueprint: FC<BlueprintProps> = ({ shape, className, testId }) => {
  const base = svgId('ui-blueprint', useId());

  return (
    <svg
      className={cx(styles.blueprint, className)}
      viewBox={shape.viewBox}
      aria-hidden="true"
      focusable="false"
      data-testid={testId}
    >
      <defs>
        <linearGradient id={`${base}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles['blueprint__stop-from']} />
          <stop offset={brandSurface.blueprintHold} className={styles['blueprint__stop-to']} />
        </linearGradient>
      </defs>
      <path className={styles.blueprint__body} fill={`url(#${base}-fill)`} d={shape.body} />
      {shape.dot !== undefined && <path className={styles.blueprint__dot} d={shape.dot} />}
    </svg>
  );
};

export const BrandBlueprint: FC<BlueprintProps> = /*#__PURE__*/ named(Blueprint, 'BrandBlueprint');

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(BrandSurface, 'BrandSurface'),
) as typeof BrandSurface;
