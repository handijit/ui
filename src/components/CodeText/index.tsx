import { memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import CodeTextCopy from './CodeTextCopy';

import styles from './index.module.scss';

type Props = {
  /** The part, OEM or order number, written as given ("1K0 615 301 AA"). */
  code: string;
  /** Adds a small copy button after the code (`labels.copyField` texts). */
  isCopyable?: boolean;
  /** The copy button's name; `labels.copyField.copy(code)` by default. */
  copyLabel?: string;
  /** Its name once copied; `labels.copyField.copied(code)` by default. */
  copiedLabel?: string;
  /** Announced after copying; `labels.copyField.announcement` by default. */
  copiedAnnouncement?: string;
  /** `sm` caption size, `md` small size; without it the code follows the text around it. */
  size?: 'sm' | 'md';
  /** Secondary text colour: an OEM number under a product's name. */
  isMuted?: boolean;
  className?: string;
  testId?: string;
};

/**
 * A calm inline code (3.4): a part or OEM number inside a sentence, a card or a table cell, in the
 * mono family with tabular figures, no surface — `CodeBadge` is the heavy, ink-filled one. One
 * click selects the whole code; `isCopyable` adds a copy button. Drawn on the server unless copyable.
 */
const CodeText = ({
  code,
  isCopyable,
  copyLabel,
  copiedLabel,
  copiedAnnouncement,
  size,
  isMuted,
  className,
  testId,
}: Props) => {
  const classNames = cx(
    styles.code,
    size && styles[`code--${size}`],
    isMuted && styles['code--muted'],
    className,
  );

  if (isCopyable)
    return (
      <CodeTextCopy
        code={code}
        className={classNames}
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
        copiedAnnouncement={copiedAnnouncement}
        testId={testId}
      />
    );

  return (
    <code className={classNames} data-testid={testId}>
      <span className={styles.code__value}>{code}</span>
    </code>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(CodeText, 'CodeText')) as typeof CodeText;
