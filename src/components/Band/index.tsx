'use client';

import { type FC, memo, type ReactNode, useId } from 'react';

import { band } from '@handijitcom/ui/design';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

/** Where a decorative layer sits; `start` and `end` follow the writing direction. */
export type BandSide = 'start' | 'end' | 'both' | 'none';

/** A supergraphic's outline: the shape of `logos.mark` of `@handijitcom/ui/design` fits. */
export type BandBlueprintShape = {
  viewBox: string;
  /** Path data of the body, drawn in the blueprint fill and outline. */
  body: string;
  /** Path data of the mark's dot, filled with the accent like the logo's. */
  dot?: string;
};

type BandProps = {
  children: ReactNode;
  /** The element. A `section` is a landmark only with a name: pass `aria-labelledby`. */
  as?: 'section' | 'div' | 'header' | 'footer' | 'aside';
  /** Soft cobalt glows at the top corners. */
  glow?: BandSide;
  /** The dot grid, fading out towards the content. */
  dots?: BandSide;
  /** Decorative artwork at the bottom end (a `BandBlueprint`); hidden below the tablet width. */
  artwork?: ReactNode;
  /** A full-width strip under the content, outside its padding (`StatStrip variant="band"`). */
  footer?: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  id?: string;
  testId?: string;
};

type BlueprintProps = {
  shape: BandBlueprintShape;
  className?: string;
  testId?: string;
};

/*
 * The glow circles, in percent of the band: a radius in percent is measured against the band's
 * normalised diagonal, so the glow grows with the band instead of flooding a phone-sized one.
 */
const GLOWS = {
  start: { cx: '8%', cy: '14%', r: '42%' },
  end: { cx: '92%', cy: '22%', r: '38%' },
} as const;

/*
 * Where the dot grid is visible along the band's width: full at the edge, gone by a quarter of
 * the way in, so the content column stays clear.
 */
const DOT_REACH = 0.24;

const sidesOf = (side: BandSide): ('start' | 'end')[] => {
  if (side === 'both') return ['start', 'end'];
  if (side === 'none') return [];
  return [side];
};

/** The mask stops of the dot grid: `true` is the edge opacity, `false` transparent. */
const fadeStops = (side: BandSide): [offset: number, isEdge: boolean][] =>
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
 * `useId` makes the module a client one (`'use client'`): two bands on a page, or the same band
 * rendered twice, must not share gradient ids. It returns `:r1:`, `«r1»` or `_r_1_` by React
 * version; an SVG `url(#…)` wants plain characters.
 */
const svgId = (prefix: string, id: string): string => `${prefix}-${id.replace(/[^\w-]/g, '')}`;

/**
 * Band — the brand band: the navy surface of a hero, a closing call or a footer, the same in
 * both themes. Its imagery (gradient, glows, dot grid) is inline SVG, decorative and hidden from
 * assistive technology; nothing of it is a CSS gradient. Descendants draw their focus ring in
 * `band-focus`, and the `ACCENT` button glows softly on it.
 * @example <Band as="section" aria-labelledby="cta" footer={<StatStrip variant="band" … />}>
 */
const Band: FC<BandProps> = ({
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
  const base = svgId('ui-band', useId());
  const fade = fadeStops(dots);

  return (
    <Tag
      id={id}
      className={cx(styles.band, artwork !== undefined && styles['band--artwork'], className)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-ui-band=""
      data-testid={testId}
    >
      <svg className={styles.band__backdrop} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${base}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className={styles['band__stop-from']} />
            <stop offset={band.gradientHold} className={styles['band__stop-from']} />
            <stop offset="1" className={styles['band__stop-to']} />
          </linearGradient>
          <radialGradient id={`${base}-glow`}>
            <stop offset="0" className={styles['band__glow-centre']} />
            <stop offset="1" className={styles['band__glow-edge']} />
          </radialGradient>
          {fade.length > 0 && (
            <>
              <pattern
                id={`${base}-dots`}
                width={band.dotCell}
                height={band.dotCell}
                patternUnits="userSpaceOnUse"
              >
                <circle
                  className={styles.band__dot}
                  cx={band.dotCell / 2}
                  cy={band.dotCell / 2}
                  r={band.dotRadius}
                />
              </pattern>
              <linearGradient id={`${base}-fade`} x1="0" y1="0" x2="1" y2="0">
                {fade.map(([offset, isEdge]) => (
                  <stop
                    key={offset}
                    offset={offset}
                    className={isEdge ? styles['band__fade-edge'] : styles['band__fade-clear']}
                  />
                ))}
              </linearGradient>
              <mask id={`${base}-mask`} className={styles.band__mask}>
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
        <div className={styles.band__artwork} aria-hidden="true">
          {artwork}
        </div>
      )}

      <div className={styles.band__body}>{children}</div>

      {footer !== undefined && <div className={styles.band__footer}>{footer}</div>}
    </Tag>
  );
};

/**
 * BandBlueprint — a supergraphic in the band's blueprint style: a fill that fades from
 * `band-line` into `band-bg`, a `band-line-strong` outline and the solid coral dot of the logo.
 * Decorative only (`aria-hidden`); give it to `Band`'s `artwork`.
 * @example <BandBlueprint shape={logos.mark} />
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
          <stop offset={band.blueprintHold} className={styles['blueprint__stop-to']} />
        </linearGradient>
      </defs>
      <path className={styles.blueprint__body} fill={`url(#${base}-fill)`} d={shape.body} />
      {shape.dot !== undefined && <path className={styles.blueprint__dot} d={shape.dot} />}
    </svg>
  );
};

export const BandBlueprint: FC<BlueprintProps> = /*#__PURE__*/ named(Blueprint, 'BandBlueprint');

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Band, 'Band')) as typeof Band;
