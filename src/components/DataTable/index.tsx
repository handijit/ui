'use client';

import {
  Children,
  type CSSProperties,
  type FC,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  memo,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ArrowDown,
  ArrowUp,
  ExclamationCircleFill,
  LayoutThreeColumns,
} from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import type { Formatter } from '../../types/theme.type';
import Checkbox from '../Checkbox';
import IconButton from '../IconButton';
import Popover from '../Popover';

import styles from './index.module.scss';

export type DataTableColumn<T = unknown> = {
  /** Sütun kimliği (React key). */
  key: string;
  /** Başlık hücresinin içeriği. */
  label?: ReactNode;
  /** Görsel başlığı olmayan sütunun erişilebilir adı (eylem sütunu gibi). */
  srLabel?: string;
  /** Sıralanabilir sütunun yönü (`aria-sort`). */
  ariaSort?: 'ascending' | 'descending';
  /**
   * Sütun sıralanabilir. `DataTable.onSort` ile birlikte anlamlı; ikisinden biri eksikse başlık düz
   * metin kalır
   */
  isSortable?: boolean;
  /** Sütun yatay kaydırmada YERİNDE kalır. */
  isSticky?: boolean;
  /** Data mode (`rows`, 3.1): the cell of this column for one row. */
  render?: (row: T, index: number) => ReactNode;
  /** The column menu cannot hide this column (the code column of a parts list), 3.1. */
  isAlwaysVisible?: boolean;
  className?: string;
};

/** Column order and visibility (3.1). Keys missing from `order` follow in definition order. */
export type DataTableColumnState = {
  order: string[];
  hidden: string[];
};

/** Row density (3.1): `comfortable` is the 3.0 spacing. */
export type DataTableDensity = 'compact' | 'comfortable';

export type DataTableColumnMenuLabels = {
  /** Trigger and panel name ("Sütunlar"). */
  columns: string;
  moveUp: Formatter<[column: string]>;
  moveDown: Formatter<[column: string]>;
};

type Props<T> = {
  columns: DataTableColumn<T>[];
  /**
   * Tablonun erişilebilir adı ("Bekleyen siparişler").
   * ⚠ ADSIZ TABLO EKRAN OKUYUCUDA YALNIZCA "tablo" DİYE OKUNUR.
   */
  label?: string;
  /**
   * Gövde satırları (` `). Ekranların özel hücreleri, bağlantıları ve satır tintleri burada yaşar;
   * tablo yalnızca kabuğu ve durum satırlarını üstlenir. `rows` verilirse yok sayılır.
   */
  children?: ReactNode;
  /**
   * Data mode (3.1): the table draws one row per item with each column's `render`. Column state,
   * the column menu, keyboard row navigation and virtualization work in this mode only.
   */
  rows?: readonly T[];
  /** The React key of a row in data mode; the index when omitted. */
  getRowKey?: (row: T, index: number) => string;
  /** Satır yokken gösterilen metin. */
  emptyMessage?: string;
  /** Yükleme sürerken gösterilen metin. */
  loadingMessage?: string;
  isLoading?: boolean;
  /**
   * Liste ÇEKİLEMEDİ. "Yüklenemedi" ile "boş" ayrı durumlardır: hata verilmişken boş mesajı asla
   * çizilmez
   */
  error?: string | null;
  /** Gövde `100dvh - <bant>` ile sınırlanır ve başlık satırı kendi kaydırma alanına yapışır. */
  hasViewportCap?: boolean;
  /** Sıralanabilir bir başlığa basıldığında çağrılır. */
  onSort?: (key: string, direction: 'ascending' | 'descending') => void;
  /** Satır seçildiğinde beliren TOPLU EYLEM şeridi. */
  bulkBar?: ReactNode;
  /** Controlled column order and visibility (data mode); uncontrolled when omitted. */
  columnState?: DataTableColumnState;
  onColumnStateChange?: (state: DataTableColumnState) => void;
  /** Shows the column menu (visibility and order) above the table, data mode. */
  hasColumnMenu?: boolean;
  columnMenuLabels?: Partial<DataTableColumnMenuLabels>;
  /** Row density; `comfortable` by default. */
  density?: DataTableDensity;
  /**
   * Turns on keyboard row navigation (data mode): ↑ ↓ move the active row, Home / End jump, Enter
   * (or a click outside the cell's own controls) calls this.
   */
  onRowActivate?: (row: T, index: number) => void;
  /**
   * Draws only the rows in view (data mode). Every row is `rowHeight` tall and its cells do not
   * wrap; the table scrolls in its own box (`hasViewportCap`, or `--ui-data-table-max-height`).
   */
  isVirtualized?: boolean;
  /** The fixed row height of a virtualized table in px; 36 compact, 48 comfortable. */
  rowHeight?: number;
  className?: string;
  testId?: string;
};

const ROW_HEIGHT: Record<DataTableDensity, number> = { compact: 36, comfortable: 48 };

/* Before the first measurement (and on the server) a virtualized table draws this many rows. */
const INITIAL_VIEWPORT_ROWS = 20;
const OVERSCAN = 8;

/* A click on the cell's own control (a link, a button, a field) does not activate the row. */
const INTERACTIVE = 'a,button,input,select,textarea,label,[role="button"],[contenteditable="true"]';

const columnName = (column: DataTableColumn<never>): string =>
  column.srLabel ?? (typeof column.label === 'string' ? column.label : column.key);

/** Every column in display order: the keys of `order` first, the rest in definition order. */
const orderColumns = <T,>(
  columns: DataTableColumn<T>[],
  state: DataTableColumnState,
): DataTableColumn<T>[] => {
  const byKey = new Map(columns.map(column => [column.key, column]));
  const ordered = [...new Set(state.order)].flatMap(key => byKey.get(key) ?? []);
  const placed = new Set(ordered.map(column => column.key));

  return [...ordered, ...columns.filter(column => !placed.has(column.key))];
};

const EMPTY_STATE: DataTableColumnState = { order: [], hidden: [] };

/** Only the rows in view of a fixed-height list (scrolling is the box's own, `node`). */
const useRowWindow = (count: number, rowHeight: number, isEnabled: boolean) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ top: 0, height: 0 });

  const measure = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    setView(previous =>
      previous.top === node.scrollTop && previous.height === node.clientHeight
        ? previous
        : { top: node.scrollTop, height: node.clientHeight },
    );
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (!isEnabled || !node) return;

    measure();
    node.addEventListener('scroll', measure, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(node);

    return () => {
      node.removeEventListener('scroll', measure);
      observer?.disconnect();
    };
  }, [isEnabled, measure]);

  /*
   * The header scrolls with the box, so `top` overstates the first row by the header's height:
   * less than one row, which the overscan covers.
   */
  const viewport = view.height > 0 ? view.height : INITIAL_VIEWPORT_ROWS * rowHeight;
  const first = Math.floor(view.top / rowHeight);
  const start = isEnabled ? Math.min(count, Math.max(0, first - OVERSCAN)) : 0;
  const end = isEnabled
    ? Math.min(count, first + Math.ceil(viewport / rowHeight) + OVERSCAN)
    : count;

  /** Brings a row into view under the sticky header and draws it. */
  const scrollToIndex = useCallback(
    (index: number) => {
      const node = scrollRef.current;
      if (!isEnabled || !node) return;

      const header = node.querySelector('thead')?.getBoundingClientRect().height ?? 0;
      const top = index * rowHeight;
      if (top < node.scrollTop) node.scrollTop = top;
      else if (header + top + rowHeight > node.scrollTop + node.clientHeight)
        node.scrollTop = header + top + rowHeight - node.clientHeight;
      measure();
    },
    [isEnabled, measure, rowHeight],
  );

  return { scrollRef, start, end, scrollToIndex };
};

/** Operasyon veri tablosu — durum satırlı tablo sözleşmesi. */
const DataTable = <T,>({
  columns,
  label,
  children,
  rows,
  getRowKey,
  isLoading,
  error,
  emptyMessage,
  loadingMessage,
  hasViewportCap,
  onSort,
  bulkBar,
  columnState,
  onColumnStateChange,
  hasColumnMenu,
  columnMenuLabels,
  density,
  onRowActivate,
  isVirtualized,
  rowHeight,
  className,
  testId,
}: Props<T>) => {
  /* Bosluk karari satir SAYISINDAN verilir; cagiranin ayrica `isEmpty` gecmesi gerekmez. */
  const { labels } = useUi();
  const isDataMode = rows !== undefined;
  const rowCount = isDataMode ? rows.length : Children.count(children);

  const [innerState, setInnerState] = useState<DataTableColumnState>(EMPTY_STATE);
  const state = (isDataMode && (columnState ?? innerState)) || EMPTY_STATE;
  const orderedColumns = orderColumns(columns, state);
  const hidden = new Set(state.hidden);
  const visibleColumns = orderedColumns.filter(
    column => column.isAlwaysVisible || !hidden.has(column.key),
  );

  const commitState = (next: DataTableColumnState) => {
    if (columnState === undefined) setInnerState(next);
    onColumnStateChange?.(next);
  };

  const hasNavigation = isDataMode && onRowActivate !== undefined;
  const isWindowed = isDataMode && Boolean(isVirtualized);
  const height = rowHeight ?? ROW_HEIGHT[density ?? 'comfortable'];
  const rowWindow = useRowWindow(rowCount, height, isWindowed);

  const [activeIndex, setActiveIndex] = useState(-1);
  const current = Math.min(activeIndex, rowCount - 1);
  /* Set by the keyboard: the newly active row takes the focus once it is drawn. */
  const pendingFocusRef = useRef(false);

  useEffect(() => {
    if (!pendingFocusRef.current) return;
    pendingFocusRef.current = false;
    rowWindow.scrollRef.current
      ?.querySelector<HTMLElement>(`tr[data-row-index="${current}"]`)
      ?.focus({ preventScroll: isWindowed });
  });

  const moveTo = (index: number) => {
    if (rowCount === 0) return;
    const next = Math.max(0, Math.min(rowCount - 1, index));
    pendingFocusRef.current = true;
    setActiveIndex(next);
    rowWindow.scrollToIndex(next);
  };

  const activate = (index: number) => {
    if (!rows || index < 0) return;
    onRowActivate?.(rows[index], index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTableSectionElement>) => {
    const row = (event.target as HTMLElement).dataset.rowIndex;
    if (row === undefined) return;
    const index = Number(row);

    const target: Record<string, number | undefined> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      Home: 0,
      End: rowCount - 1,
    };

    if (event.key === 'Enter') {
      event.preventDefault();
      activate(index);
    } else if (target[event.key] !== undefined) {
      event.preventDefault();
      moveTo(target[event.key] as number);
    }
  };

  const handleFocus = (event: FocusEvent<HTMLTableSectionElement>) => {
    const row = (event.target as HTMLElement).dataset.rowIndex;
    if (row !== undefined) setActiveIndex(Number(row));
  };

  const handleClick = (event: MouseEvent<HTMLTableSectionElement>) => {
    const target = event.target as HTMLElement;
    const row = target.closest<HTMLElement>('tr[data-row-index]');
    if (!row) return;
    const control = target.closest(INTERACTIVE);
    if (control && row.contains(control)) return;
    const index = Number(row.dataset.rowIndex);
    setActiveIndex(index);
    activate(index);
  };

  const renderStateRow = (content: ReactNode, modifier?: 'error') => (
    <tr>
      <td
        colSpan={visibleColumns.length}
        className={cx(styles.state, modifier && styles[`state--${modifier}`])}
      >
        {content}
      </td>
    </tr>
  );

  const renderSpacer = (size: number, key: string) =>
    size > 0 && (
      <tr key={key} aria-hidden className={styles.spacer} style={{ height: size }}>
        <td colSpan={visibleColumns.length} />
      </tr>
    );

  const renderDataRows = (items: readonly T[]) => {
    /* The row that holds the Tab stop: the active one if drawn, else the first drawn. */
    const tabStop =
      current >= rowWindow.start && current < rowWindow.end ? current : rowWindow.start;

    return [
      renderSpacer(rowWindow.start * height, 'before'),
      ...items.slice(rowWindow.start, rowWindow.end).map((item, offset) => {
        const index = rowWindow.start + offset;

        return (
          <tr
            key={getRowKey?.(item, index) ?? index}
            data-row-index={index}
            aria-rowindex={isWindowed ? index + 2 : undefined}
            tabIndex={hasNavigation ? (index === tabStop ? 0 : -1) : undefined}
            className={cx(
              hasNavigation && styles['row--navigable'],
              index === current && styles['row--active'],
            )}
          >
            {visibleColumns.map(column => (
              <td
                key={column.key}
                className={cx(column.className, column.isSticky && styles.sticky)}
              >
                {column.render?.(item, index)}
              </td>
            ))}
          </tr>
        );
      }),
      renderSpacer((rowCount - rowWindow.end) * height, 'after'),
    ];
  };

  const body = error
    ? renderStateRow(
        <span role="alert" className={styles.state__message}>
          <ExclamationCircleFill aria-hidden />
          {error}
        </span>,
        'error',
      )
    : isLoading
      ? renderStateRow(
          resolveLabel('DataTable.loadingMessage', loadingMessage, labels?.dataTable?.loading),
        )
      : rowCount === 0
        ? renderStateRow(
            resolveLabel('DataTable.emptyMessage', emptyMessage, labels?.dataTable?.empty),
          )
        : rows
          ? renderDataRows(rows)
          : children;

  const isShowingRows = !error && !isLoading && rowCount > 0;
  const hasMenu = isDataMode && Boolean(hasColumnMenu);

  const scroller = (
    <div
      ref={rowWindow.scrollRef}
      className={cx(
        styles.wrapper,
        hasViewportCap && styles['wrapper--capped'],
        isWindowed && styles['wrapper--virtual'],
        !hasMenu && className,
      )}
      style={
        isWindowed ? ({ '--ui-data-table-row-height': `${height}px` } as CSSProperties) : undefined
      }
      data-testid={hasMenu ? undefined : testId}
    >
      {bulkBar && <div className={styles.bulkBar}>{bulkBar}</div>}

      <table
        className={cx(styles.table, density === 'compact' && styles['table--compact'])}
        aria-label={label}
        aria-rowcount={isWindowed ? rowCount + 1 : undefined}
      >
        <thead>
          <tr aria-rowindex={isWindowed ? 1 : undefined}>
            {visibleColumns.map(column => {
              const isSortable = Boolean(column.isSortable && onSort);
              /* Ilk tikta ARTAN; ikinci tik yonu cevirir. */
              const nextDirection = column.ariaSort === 'ascending' ? 'descending' : 'ascending';

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={column.ariaSort}
                  className={cx(column.className, column.isSticky && styles.sticky)}
                >
                  {isSortable ? (
                    /* Siralama bir DUGME, ` `ye yazilan `onClick` degil. */
                    <button
                      type="button"
                      className={styles.sort}
                      onClick={() => onSort?.(column.key, nextDirection)}
                    >
                      {column.label}
                      {column.srLabel && <span className={styles.srOnly}>{column.srLabel}</span>}

                      {/*
                        Yon oku: `aria-hidden` cunku ayni bilgi `aria-sort`ta.
                        Siralanabilir ama siralanmamis sutunda SOLUK bir cift
                        ok duruyor — sutunun siralanabildigi ancak uzerine
                        gelince anlasiliyordu.
                      */}
                      <span
                        aria-hidden
                        className={cx(
                          styles.sort__arrow,
                          column.ariaSort && styles[`sort__arrow--${column.ariaSort}`],
                        )}
                      >
                        {column.ariaSort === 'descending' ? '▾' : '▴'}
                      </span>
                    </button>
                  ) : (
                    <>
                      {column.label}
                      {column.srLabel && <span className={styles.srOnly}>{column.srLabel}</span>}
                    </>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody
          onKeyDown={hasNavigation && isShowingRows ? handleKeyDown : undefined}
          onFocus={hasNavigation && isShowingRows ? handleFocus : undefined}
          onClick={hasNavigation && isShowingRows ? handleClick : undefined}
        >
          {body}
        </tbody>
      </table>
    </div>
  );

  if (!hasMenu) return scroller;

  const menuLabels = {
    columns: resolveLabel(
      'DataTable.columnMenuLabels.columns',
      columnMenuLabels?.columns,
      labels?.dataTable?.columns,
    ),
    moveUp: columnMenuLabels?.moveUp ?? labels?.dataTable?.moveUp,
    moveDown: columnMenuLabels?.moveDown ?? labels?.dataTable?.moveDown,
  };

  const toggleColumn = (key: string) =>
    commitState({
      order: state.order,
      hidden: hidden.has(key) ? state.hidden.filter(item => item !== key) : [...state.hidden, key],
    });

  const moveColumn = (index: number, step: -1 | 1) => {
    const order = orderedColumns.map(column => column.key);
    const target = index + step;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    commitState({ order, hidden: state.hidden });
  };

  return (
    <div className={cx(styles.frame, className)} data-testid={testId}>
      <div className={styles.toolbar}>
        <Popover
          label={menuLabels.columns}
          align="end"
          trigger={
            <IconButton
              icon={<LayoutThreeColumns aria-hidden />}
              label={menuLabels.columns}
              size="sm"
            />
          }
        >
          <ul className={styles.columnMenu}>
            {orderedColumns.map((column, index) => {
              const name = columnName(column);
              const isFirst = index === 0;
              const isLast = index === orderedColumns.length - 1;

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
                    label={resolveFormatter(
                      'DataTable.columnMenuLabels.moveUp',
                      menuLabels.moveUp,
                      name,
                    )}
                    size="sm"
                    aria-disabled={isFirst || undefined}
                    onClick={() => moveColumn(index, -1)}
                  />
                  <IconButton
                    icon={<ArrowDown aria-hidden />}
                    label={resolveFormatter(
                      'DataTable.columnMenuLabels.moveDown',
                      menuLabels.moveDown,
                      name,
                    )}
                    size="sm"
                    aria-disabled={isLast || undefined}
                    onClick={() => moveColumn(index, 1)}
                  />
                </li>
              );
            })}
          </ul>
        </Popover>
      </div>
      {scroller}
    </div>
  );
};

type RowProps = HTMLAttributes<HTMLTableRowElement> & {
  children: ReactNode;
  /** Satır dikkat bekleyen iş taşıyor (kritik stok, karar bekleyen talep). */
  isWarning?: boolean;
};

export const DataTableRow: FC<RowProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ isWarning, className, children, ...rest }) => (
    <tr className={cx(isWarning && styles['row--warning'], className)} {...rest}>
      {children}
    </tr>
  )),
  'DataTableRow',
);

export default /*#__PURE__*/ memo(DataTable) as typeof DataTable;
