'use client';

import {
  type ChangeEvent,
  forwardRef,
  memo,
  type TextareaHTMLAttributes,
  useId,
  useMemo,
  useState,
} from 'react';

import { ExclamationCircleFill } from 'react-bootstrap-icons';

import { idList } from '../../helpers/aria.helper';
import {
  type BulkPasteOptions,
  type BulkPasteResult,
  parseBulkPaste,
} from '../../helpers/bulk-paste.helper';
import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import type { Formatter } from '../../types/theme.type';
import Textarea from '../Textarea';

import styles from './index.module.scss';

export type {
  BulkPasteInvalidLine,
  BulkPasteInvalidReason,
  BulkPasteOptions,
  BulkPasteResult,
  BulkPasteRow,
} from '../../helpers/bulk-paste.helper';
/*
 * Re-exported for the `@handijitcom/ui/bulk-paste-input` subpath. ⚠ This module is a client module:
 * a server component imports the parser from the root entry, which takes it from the helper.
 */
export { parseBulkPaste } from '../../helpers/bulk-paste.helper';

export type BulkPasteLabels = {
  summary: Formatter<[count: number]>;
  invalidSummary: Formatter<[count: number]>;
  line: Formatter<[line: number]>;
  missingCode: string;
  invalidQuantity: string;
};

type Props = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'defaultValue' | 'children'
> &
  BulkPasteOptions & {
    value?: string;
    defaultValue?: string;
    /** Called with the parsed rows on every change of the text (typing, pasting, clearing). */
    onParse?: (result: BulkPasteResult, text: string) => void;
    labels?: Partial<BulkPasteLabels>;
    testId?: string;
  };

/**
 * A text area for a pasted list of part codes and quantities (a spreadsheet copy, a CSV, one code
 * per line); shows how many rows it read and which lines it could not (3.1).
 */
const BulkPasteInput = /*#__PURE__*/ forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      value,
      defaultValue,
      onChange,
      onParse,
      defaultQuantity,
      isMergingDuplicates,
      labels: labelProps,
      rows = 6,
      className,
      testId,
      'aria-describedby': describedBy,
      'aria-invalid': isInvalid,
      ...rest
    },
    ref,
  ) => {
    const { labels: config } = useUi();
    const summaryId = useId();
    const [innerText, setInnerText] = useState(defaultValue ?? '');
    const text = value ?? innerText;
    const options = { defaultQuantity, isMergingDuplicates };

    const result = useMemo(
      () => parseBulkPaste(text, { defaultQuantity, isMergingDuplicates }),
      [text, defaultQuantity, isMergingDuplicates],
    );

    const texts = { ...config?.bulkPaste, ...labelProps };

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const next = event.target.value;
      if (value === undefined) setInnerText(next);
      onChange?.(event);
      onParse?.(parseBulkPaste(next, options), next);
    };

    const hasText = text.trim().length > 0;
    const invalidCount = result.invalid.length;

    return (
      <div className={cx(styles.bulkPaste, className)} data-testid={testId}>
        <Textarea
          ref={ref}
          rows={rows}
          value={text}
          onChange={handleChange}
          spellCheck={false}
          aria-describedby={idList(hasText && summaryId, describedBy)}
          aria-invalid={invalidCount > 0 || isInvalid || undefined}
          className={styles.field}
          {...rest}
        />

        <div id={summaryId} role="status" className={styles.summary}>
          {hasText && (
            <>
              <span className={styles.count}>
                {resolveFormatter(
                  'BulkPasteInput.labels.summary',
                  texts.summary,
                  result.rows.length,
                )}
              </span>
              {invalidCount > 0 && (
                <span className={styles.invalidCount}>
                  <ExclamationCircleFill aria-hidden />
                  {resolveFormatter(
                    'BulkPasteInput.labels.invalidSummary',
                    texts.invalidSummary,
                    invalidCount,
                  )}
                </span>
              )}
            </>
          )}
        </div>

        {invalidCount > 0 && (
          <ul className={styles.invalid}>
            {result.invalid.map(line => (
              <li key={line.line} className={styles.invalid__line}>
                <span className={styles.invalid__number}>
                  {resolveFormatter('BulkPasteInput.labels.line', texts.line, line.line)}
                </span>
                <code className={styles.invalid__text}>{line.text}</code>
                <span className={styles.invalid__reason}>
                  {resolveLabel(`BulkPasteInput.labels.${line.reason}`, texts[line.reason])}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(BulkPasteInput, 'BulkPasteInput'),
) as typeof BulkPasteInput;
