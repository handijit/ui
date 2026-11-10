'use client';

import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';

import styles from './index.module.scss';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  /**
   * Ekran okuyucuya okunacak metin; görsel olarak gizli. An empty string (2.2) draws a DECORATIVE
   * spinner — no `role="status"`, hidden from assistive technology — for a spinner inside a
   * control that announces its own busy state (`Button isLoading` → `aria-busy`). Until 2.1 it
   * drew a status region with an empty name.
   */
  label?: string;
  className?: string;
};

/** Yükleme göstergesi. */
const Spinner: FC<Props> = ({ size = 'md', label, className }) => {
  const { labels } = useUi();
  const classNames = cx(styles.spinner, styles[`spinner--${size}`], className);

  if (label === '') return <span className={classNames} aria-hidden />;

  return (
    <span className={classNames} role="status">
      <span className={styles.spinner__label}>
        {label ?? resolveLabel('Spinner.label', labels?.loading)}
      </span>
    </span>
  );
};

export default /*#__PURE__*/ memo(Spinner) as typeof Spinner;
