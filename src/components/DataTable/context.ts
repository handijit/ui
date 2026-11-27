'use client';

import { createContext } from 'react';

import type { DataTableColumn } from './index';

/**
 * What `DataTable` hands its column menu (3.1): the columns in display order and the two edits.
 * The table owns the state (controlled or not); the menu, a separate module, only draws it, so a
 * table without a menu never bundles `Popover`, `Checkbox` and `IconButton`.
 */
export type DataTableColumnMenuContextValue = {
  /** Every column in display order, the hidden ones included. */
  columns: readonly DataTableColumn<never>[];
  hidden: ReadonlySet<string>;
  toggleColumn: (key: string) => void;
  /** Swaps the column at `index` with its neighbour; nothing at an edge. */
  moveColumn: (index: number, step: -1 | 1) => void;
};

/** `null` outside a data-mode `DataTable`. */
const DataTableColumnMenuContext = createContext<DataTableColumnMenuContextValue | null>(null);

export default DataTableColumnMenuContext;
