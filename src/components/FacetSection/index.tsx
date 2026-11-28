'use client';

import { type FormEvent, memo, type ReactNode, useEffect, useId, useMemo, useState } from 'react';

import { Search } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { foldedOptions } from '../../helpers/facet.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { matchesSearch } from '../../helpers/text.helper';
import { useUi } from '../../theme/context';
import type { UiLinkExtraProps } from '../../types/link.type';
import type { Formatter } from '../../types/theme.type';
import Button from '../Button';
import Checkbox from '../Checkbox';
import Disclosure from '../Disclosure';
import Field from '../Field';
import Input from '../Input';
import UiLink from '../Link';
import MoneyInput from '../MoneyInput';
import Radio from '../Radio';
import UIVariant from '../../enums/ui-variant.enum';
import UISize from '../../enums/ui-size.enum';

import styles from './index.module.scss';

/** One value of a facet: a brand, a category, a quality level. */
export type FacetOption = {
  value: string;
  label: string;
  /** Matching results; an option with `0` and not selected is disabled (it leads to no result). */
  count?: number;
  /** The option's page, in `link` mode (a category tree navigates instead of filtering). */
  href?: string;
  linkProps?: UiLinkExtraProps;
  isDisabled?: boolean;
};

/**
 * `checkbox` many values · `radio` one value · `link` a navigation list (the current one is
 * `aria-current="page"`) · `range` a min/max amount.
 */
export type FacetMode = 'checkbox' | 'radio' | 'link' | 'range';

/** An amount range in the currency's minor unit (`MoneyInput`'s scaled integer); `null` = open. */
export type FacetRange = { min: number | null; max: number | null };

export type FacetLabels = {
  clear: string;
  applyRange: string;
  showMore: Formatter<[count: number]>;
  showLess: string;
  search: Formatter<[title: string]>;
  noMatch: Formatter<[term: string]>;
  selected: Formatter<[count: number]>;
  /** The range fields; `labels.range.min` / `labels.range.max` of the provider by default. */
  min: string;
  max: string;
};

type Props = {
  title: string;
  mode?: FacetMode;
  options?: FacetOption[];
  /** The selected values (`checkbox`, `radio`, `link`). */
  selected?: string[];
  /** The next selection; `radio` gives one value. Not called in `link` mode: the link navigates. */
  onChange?: (selected: string[]) => void;
  /** `range` mode: the applied range. */
  range?: FacetRange;
  /** `range` mode: called by the apply button (or Enter), not on every keystroke. */
  onRangeChange?: (range: FacetRange) => void;
  /** `range` mode: the currency's minor digits (`MoneyInput.minorDigits`), 2 by default. */
  minorDigits?: number;
  /** `range` mode: the currency after the amounts ("TL"). */
  currency?: ReactNode;
  /** Options shown before "show more"; selected options always stay visible. Default 6. */
  visibleCount?: number;
  /** Above this many options the list gets a search field. Default 10. */
  searchThreshold?: number;
  /** Shows the section's clear button while something is selected. */
  onClear?: () => void;
  /** Open at first (default). A section with a selection always opens: an applied filter is seen. */
  isDefaultOpen?: boolean;
  /** Your own content instead of the options (a vehicle picker, switches). */
  children?: ReactNode;
  /** The badge count of custom `children`; derived from `selected` / `range` otherwise. */
  selectedCount?: number;
  labels?: Partial<FacetLabels>;
  className?: string;
  testId?: string;
};

const DEFAULT_VISIBLE = 6;
const DEFAULT_SEARCH_THRESHOLD = 10;

/**
 * One collapsible filter group of a `FacetSidebar` (3.4): a checkbox, radio or link list with
 * counts, "show more", a search field for a long list, a min/max range, and a clear button.
 */
const FacetSection = ({
  title,
  mode = 'checkbox',
  options = [],
  selected = [],
  onChange,
  range,
  onRangeChange,
  minorDigits = 2,
  currency,
  visibleCount = DEFAULT_VISIBLE,
  searchThreshold = DEFAULT_SEARCH_THRESHOLD,
  onClear,
  isDefaultOpen = true,
  children,
  selectedCount,
  labels: labelProps,
  className,
  testId,
}: Props) => {
  const { labels: config } = useUi();
  const facets = config?.facets;
  const name = useId();
  const [term, setTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState<FacetRange>(range ?? { min: null, max: null });

  /* The applied range can change from outside (back button, "clear all"): the fields follow it. */
  const rangeMin = range?.min ?? null;
  const rangeMax = range?.max ?? null;
  useEffect(() => setDraft({ min: rangeMin, max: rangeMax }), [rangeMin, rangeMax]);

  const count =
    selectedCount ??
    (mode === 'range'
      ? Number(rangeMin !== null) + Number(rangeMax !== null)
      : children
        ? 0
        : selected.length);

  const query = term.trim();
  const matched = useMemo(
    () => (query ? options.filter(option => matchesSearch(option.label, query)) : options),
    [options, query],
  );
  const visible = query || isExpanded ? matched : foldedOptions(matched, selected, visibleCount);
  const hiddenCount = matched.length - visible.length;
  const canFold = !query && matched.length > visibleCount;

  const toggle = (value: string) =>
    onChange?.(
      selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value],
    );

  const applyRange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onRangeChange?.(draft);
  };

  const renderOption = (option: FacetOption) => {
    const isSelected = selected.includes(option.value);
    const isDisabled = option.isDisabled || (option.count === 0 && !isSelected);
    const row = (
      <span className={styles.option__row}>
        <span className={styles.option__label}>{option.label}</span>
        {option.count !== undefined && <span className={styles.option__count}>{option.count}</span>}
      </span>
    );

    if (mode === 'link')
      return (
        <li key={option.value}>
          <UiLink
            {...option.linkProps}
            href={option.href ?? '#'}
            className={cx(
              styles.option,
              styles['option--link'],
              isSelected && styles['option--current'],
            )}
            aria-current={isSelected ? 'page' : undefined}
          >
            {row}
          </UiLink>
        </li>
      );

    if (mode === 'radio')
      return (
        <div key={option.value} className={styles.option}>
          <Radio
            name={name}
            label={option.label}
            count={option.count}
            checked={isSelected}
            disabled={isDisabled}
            onChange={() => onChange?.([option.value])}
          />
        </div>
      );

    return (
      <div key={option.value} className={styles.option}>
        <Checkbox
          label={row}
          checked={isSelected}
          disabled={isDisabled}
          onChange={() => toggle(option.value)}
        />
      </div>
    );
  };

  const list =
    mode === 'link' ? (
      <ul className={styles.list}>{visible.map(renderOption)}</ul>
    ) : (
      <div
        className={styles.list}
        role={mode === 'radio' ? 'radiogroup' : 'group'}
        aria-label={title}
      >
        {visible.map(renderOption)}
      </div>
    );

  const rangeForm = (
    <form className={styles.range} onSubmit={applyRange}>
      <div className={styles.range__fields}>
        <Field label={resolveLabel('FacetSection.labels.min', labelProps?.min, config?.range?.min)}>
          {props => (
            <MoneyInput
              {...props}
              size="sm"
              minorDigits={minorDigits}
              currency={currency}
              value={draft.min}
              onChange={min => setDraft(current => ({ ...current, min }))}
            />
          )}
        </Field>
        <Field label={resolveLabel('FacetSection.labels.max', labelProps?.max, config?.range?.max)}>
          {props => (
            <MoneyInput
              {...props}
              size="sm"
              minorDigits={minorDigits}
              currency={currency}
              value={draft.max}
              onChange={max => setDraft(current => ({ ...current, max }))}
            />
          )}
        </Field>
      </div>
      <Button type="submit" variant={UIVariant.SECONDARY} size={UISize.SMALL} isFullWidth>
        {resolveLabel('FacetSection.labels.applyRange', labelProps?.applyRange, facets?.applyRange)}
      </Button>
    </form>
  );

  const searchLabel =
    options.length > searchThreshold && mode !== 'range'
      ? resolveFormatter('FacetSection.labels.search', labelProps?.search ?? facets?.search, title)
      : null;

  return (
    <Disclosure
      variant="plain"
      className={cx(styles.facet, className)}
      isDefaultOpen={isDefaultOpen || count > 0}
      testId={testId}
      summary={title}
      meta={
        count > 0 ? (
          <>
            <span aria-hidden className={styles.facet__badge}>
              {count}
            </span>
            <span className={styles.srOnly}>
              {resolveFormatter(
                'FacetSection.labels.selected',
                labelProps?.selected ?? facets?.selected,
                count,
              )}
            </span>
          </>
        ) : undefined
      }
    >
      <div className={styles.facet__body}>
        {onClear && count > 0 && (
          <Button
            variant={UIVariant.GHOST}
            size={UISize.XSMALL}
            className={styles.facet__clear}
            onClick={onClear}
          >
            {resolveLabel('FacetSection.labels.clear', labelProps?.clear, facets?.clear)}
          </Button>
        )}

        {children ?? (
          <>
            {searchLabel !== null && (
              <Input
                type="search"
                size="sm"
                value={term}
                placeholder={searchLabel}
                aria-label={searchLabel}
                prefix={<Search aria-hidden />}
                onChange={event => setTerm(event.target.value)}
              />
            )}

            {mode === 'range' ? rangeForm : list}

            {query && matched.length === 0 && (
              <p role="status" className={styles.facet__empty}>
                {resolveFormatter(
                  'FacetSection.labels.noMatch',
                  labelProps?.noMatch ?? facets?.noMatch,
                  query,
                )}
              </p>
            )}

            {canFold && mode !== 'range' && (
              <Button
                variant={UIVariant.GHOST}
                size={UISize.XSMALL}
                className={styles.facet__more}
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded(expanded => !expanded)}
              >
                {isExpanded
                  ? resolveLabel(
                      'FacetSection.labels.showLess',
                      labelProps?.showLess,
                      facets?.showLess,
                    )
                  : resolveFormatter(
                      'FacetSection.labels.showMore',
                      labelProps?.showMore ?? facets?.showMore,
                      hiddenCount,
                    )}
              </Button>
            )}
          </>
        )}
      </div>
    </Disclosure>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(FacetSection, 'FacetSection'),
) as typeof FacetSection;
