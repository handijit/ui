'use client';

import { memo } from 'react';

import { ChevronDown } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import Avatar from '../Avatar';
import Menu, { type MenuItem } from '../Menu';

import styles from './index.module.scss';

type Props = {
  /** The signed-in person's name: the avatar's initials and the trigger's text. */
  name: string;
  /** A second line: the role, the branch, the e-mail address. */
  meta?: string;
  imageUrl?: string;
  /** Profile, settings, sign out… (`isDanger` for sign out is the caller's call). */
  items: MenuItem[];
  /** The menu's name; `labels.appShell.userMenu` by default. */
  label?: string;
  className?: string;
  testId?: string;
};

/**
 * The account button of a top bar (3.2): avatar, name and role opening a `Menu`. Below the mobile
 * width only the avatar shows; the name is still read.
 */
const UserMenu = ({ name, meta, imageUrl, items, label, className, testId }: Props) => {
  const { labels } = useUi();

  return (
    <Menu
      label={resolveLabel('UserMenu.label', label, labels?.appShell?.userMenu)}
      items={items}
      align="end"
      testId={testId}
      trigger={
        <button type="button" className={cx(styles.trigger, className)}>
          {/* The avatar repeats the name: the button reads it once, from the text. */}
          <span aria-hidden className={styles.trigger__avatar}>
            <Avatar name={name} imageUrl={imageUrl} locale={labels?.locale} size="sm" />
          </span>
          <span className={styles.trigger__text}>
            <span className={styles.trigger__name}>{name}</span>
            {meta && <span className={styles.trigger__meta}>{meta}</span>}
          </span>
          <ChevronDown aria-hidden className={styles.trigger__chevron} />
        </button>
      }
    />
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(UserMenu, 'UserMenu')) as typeof UserMenu;
