'use client';

import { memo, useContext } from 'react';

import { ArrowDown, ArrowUp, LayoutThreeColumns } from 'react-bootstrap-icons';

import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import type { Formatter } from '../../types/theme.type';
import Checkbox from '../Checkbox';
import DataTableColumnMenuContext from '../DataTable/context';
import type { DataTableColumn } from '../DataTable';
import IconButton from '../IconButton';
import Popover from '../Popover';

import styles from './index.module.scss';

export type DataTableColumnMenuLabels = {
  /** Trigger and panel name ("Sütunlar"). */
  columns: string;
  moveUp: Formatter<[column: string]>;
  moveDown: Formatter<[column: string]>;
};

type Props = {
  /** Each falls back to `UiLabels.dataTable` (`columns`, `moveUp`, `moveDown`). */
  labels?: Partial<DataTableColumnMenuLabels>;
};

const columnName = (column: DataTableColumn<never>): string =>
  column.srLabel ?? (typeof column.label === 'string' ? column.label : column.key);

/**
 * The column menu of a data-mode `DataTable` (3.1): visibility checkboxes and move up / down in a
 * `Popover`. Pass it as the table's `columnMenu`; it edits that table's `columnState`, controlled
 * or not. Outside a data-mode `DataTable` it draws nothing.
 */
const DataTableColumnMenu = ({ labels }: Props) => {
  const { labels: uiLabels } = useUi();
  const table = useContext(DataTableColumnMenuContext);
  if (!table) return null;

  const { columns, hidden, toggleColumn, moveColumn } = table;
  const title = resolveLabel(
    'DataTableColumnMenu.labels.columns',
    labels?.columns,
    uiLabels?.dataTable?.columns,
  );
  const moveUp = labels?.moveUp ?? uiLabels?.dataTable?.moveUp;
  const moveDown = labels?.moveDown ?? uiLabels?.dataTable?.moveDown;

  return (
    <Popover
      label={title}
      align="end"
      trigger={<IconButton icon={<LayoutThreeColumns aria-hidden />} label={title} size="sm" />}
    >
      <ul className={styles.columnMenu}>
        {columns.map((column, index) => {
          const name = columnName(column);

          return (
            <li key={column.key} className={styles.columnMenu__item}>
              <Checkbox
                label={name}
                checked={column.isAlwaysVisible || !hidden.has(column.key)}
                disabled={column.isAlwaysVisible}
                onChange={() => toggleColumn(column.key)}
                className={styles.columnMenu__check}
              />
              {/* `aria-disabled`, not `disabled`: the focused button keeps the focus at the edge. */}
              <IconButton
                icon={<ArrowUp aria-hidden />}
                label={resolveFormatter('DataTableColumnMenu.labels.moveUp', moveUp, name)}
                size="sm"
                aria-disabled={index === 0 || undefined}
                onClick={() => moveColumn(index, -1)}
              />
              <IconButton
                icon={<ArrowDown aria-hidden />}
                label={resolveFormatter('DataTableColumnMenu.labels.moveDown', moveDown, name)}
                size="sm"
                aria-disabled={index === columns.length - 1 || undefined}
                onClick={() => moveColumn(index, 1)}
              />
            </li>
          );
        })}
      </ul>
    </Popover>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(DataTableColumnMenu, 'DataTableColumnMenu'));
