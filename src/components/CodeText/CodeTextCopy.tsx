'use client';

import { ClipboardCheck, Clipboard } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useCopyFeedback } from '../../hooks/useCopyFeedback';
import { useUi } from '../../theme/context';

import styles from './index.module.scss';

type Props = {
  code: string;
  className: string;
  copyLabel?: string;
  copiedLabel?: string;
  copiedAnnouncement?: string;
  testId?: string;
};

/** The copyable `CodeText`: the client part, so a plain code stays a server component. */
const CodeTextCopy = ({
  code,
  className,
  copyLabel,
  copiedLabel,
  copiedAnnouncement,
  testId,
}: Props) => {
  const { labels } = useUi();
  const { isCopied, copy, nodeRef } = useCopyFeedback(code);

  return (
    <span className={cx(styles.copyable, className)} data-testid={testId}>
      <code className={styles.copyable__code}>
        <span ref={nodeRef} className={styles.code__value}>
          {code}
        </span>
      </code>
      <button
        type="button"
        className={cx(styles.copy, isCopied && styles['copy--done'])}
        aria-label={
          isCopied
            ? (copiedLabel ??
              resolveFormatter('CodeText.copiedLabel', labels?.copyField?.copied, code))
            : (copyLabel ?? resolveFormatter('CodeText.copyLabel', labels?.copyField?.copy, code))
        }
        onClick={copy}
      >
        {isCopied ? <ClipboardCheck aria-hidden /> : <Clipboard aria-hidden />}
      </button>
      <span aria-live="polite" className={styles.srOnly}>
        {isCopied
          ? resolveLabel(
              'CodeText.copiedAnnouncement',
              copiedAnnouncement,
              labels?.copyField?.announcement,
            )
          : ''}
      </span>
    </span>
  );
};

export default CodeTextCopy;
