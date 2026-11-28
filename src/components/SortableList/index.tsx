'use client';

import {
  type KeyboardEvent,
  memo,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { GripVertical } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { moveItem, nearestIndex } from '../../helpers/sortable.helper';
import useAnnounce from '../../hooks/useAnnounce';
import { useUi } from '../../theme/context';
import type { SortableItemState } from '../../types/sortable.type';
import type { Formatter } from '../../types/theme.type';

import styles from './index.module.scss';

/*
 * `SortableItemState` is what `renderItem` RECEIVES, not a prop: its `moveTo` is a function the list
 * hands out, so it lives with the other argument shapes (`types/`), away from the props' naming rules.
 */
export type { SortableItemState } from '../../types/sortable.type';

export type SortableListLabels = {
  instructions: string;
  handle: Formatter<[item: string]>;
  grabbed: Formatter<[item: string, position: number, total: number]>;
  moved: Formatter<[item: string, position: number, total: number]>;
  dropped: Formatter<[item: string, position: number, total: number]>;
  cancelled: Formatter<[item: string]>;
};

type Props<T> = {
  items: T[];
  getKey: (item: T) => string;
  /** The item's name in the handle's label and the announcements ("Ön yüz görseli"). */
  getLabel: (item: T) => string;
  /** The new order, once a move is dropped; never called while dragging. */
  onReorder: (items: T[]) => void;
  renderItem: (item: T, state: SortableItemState) => ReactNode;
  /** The list's accessible name ("Ürün görselleri"). */
  label: string;
  /** `list` a column · `grid` a wrapping row of tiles (image order). */
  layout?: 'list' | 'grid';
  isDisabled?: boolean;
  labels?: Partial<SortableListLabels>;
  className?: string;
  testId?: string;
};

type Drag = { key: string; mode: 'keyboard' | 'pointer'; from: number };

const KEY_STEP: Record<string, number> = {
  ArrowUp: -1,
  ArrowLeft: -1,
  ArrowDown: 1,
  ArrowRight: 1,
};

/**
 * A reorderable list (3.4) — image order and cover choice, a column order — moved by pointer drag
 * or by the keyboard on each item's handle (Space grabs, arrows move, Space drops, Escape cancels),
 * with every step announced. No library: the arithmetic is `helpers/sortable.helper.ts`.
 */
const SortableList = <T,>({
  items,
  getKey,
  getLabel,
  onReorder,
  renderItem,
  label,
  layout = 'list',
  isDisabled,
  labels: labelProps,
  className,
  testId,
}: Props<T>) => {
  const { labels: config } = useUi();
  const text = config?.sortableList;
  const announce = useAnnounce();
  const instructionsId = useId();

  const [draft, setDraft] = useState<T[] | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const draftRef = useRef<T[] | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const handleRefs = useRef(new Map<string, HTMLButtonElement>());

  const order = draft ?? items;
  const total = order.length;

  const format = <TArgs extends unknown[]>(
    key: Exclude<keyof SortableListLabels, 'instructions'>,
    ...args: TArgs
  ): string =>
    resolveFormatter(
      `SortableList.labels.${key}`,
      (labelProps?.[key] ?? text?.[key]) as Formatter<TArgs> | undefined,
      ...args,
    );

  const updateDraft = (next: T[] | null) => {
    draftRef.current = next;
    setDraft(next);
  };

  const startDrag = (next: Drag) => {
    dragRef.current = next;
    setDrag(next);
    updateDraft([...items]);
  };

  /* Ends a drag: drops (commit) or puts the order back (cancel). */
  const finish = (commit: boolean) => {
    const current = dragRef.current;
    const next = draftRef.current ?? items;
    dragRef.current = null;
    setDrag(null);
    updateDraft(null);
    /* A second pointer event can arrive before the listeners are gone. */
    if (!current) return;

    const position = next.findIndex(item => getKey(item) === current.key);
    const item = next[position];
    if (!commit) announce(format('cancelled', getLabel(item)), 'assertive');
    else if (position !== current.from) {
      onReorder(next);
      announce(format('dropped', getLabel(item), position + 1, next.length), 'assertive');
    }
  };
  /* The window listeners live across renders; they call the latest `finish`. */
  const finishRef = useRef(finish);
  finishRef.current = finish;

  /* A moved node loses focus in the browser: the keyboard drag puts it back on the handle. */
  useLayoutEffect(() => {
    if (drag?.mode === 'keyboard') handleRefs.current.get(drag.key)?.focus();
  }, [drag, draft]);

  /* Pointer drag: the window follows the pointer, so leaving the handle does not end the drag. */
  useEffect(() => {
    if (drag?.mode !== 'pointer') return;

    const handleMove = (event: PointerEvent) => {
      const current = draftRef.current;
      if (!current) return;

      /* Every item of the drawn order has its node: the draft is what is drawn. */
      const rects = current.map(item =>
        (itemRefs.current.get(getKey(item)) as HTMLLIElement).getBoundingClientRect(),
      );
      const target = nearestIndex(rects, event.clientX, event.clientY);
      const position = current.findIndex(item => getKey(item) === drag.key);
      if (target === -1 || target === position) return;

      const next = moveItem(current, position, target);
      draftRef.current = next;
      setDraft(next);
    };
    const handleUp = () => finishRef.current(true);
    const handleCancel = () => finishRef.current(false);
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') finishRef.current(false);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleCancel);
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleCancel);
      window.removeEventListener('keydown', handleKey);
    };
  }, [drag, getKey]);

  const startPointer = (
    event: ReactPointerEvent<HTMLButtonElement>,
    key: string,
    index: number,
  ) => {
    if (event.button !== 0 || drag) return;
    /* No text selection and no page scroll under the finger while dragging. */
    event.preventDefault();
    startDrag({ key, mode: 'pointer', from: index });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, item: T, index: number) => {
    const key = getKey(item);
    const isGrabbed = drag?.key === key && drag.mode === 'keyboard';

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (isGrabbed) {
        finish(true);
        return;
      }
      if (drag) return;
      startDrag({ key, mode: 'keyboard', from: index });
      announce(format('grabbed', getLabel(item), index + 1, items.length), 'assertive');
      return;
    }

    if (!isGrabbed) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      finish(false);
      return;
    }
    if (event.key === 'Tab') {
      finish(true);
      return;
    }

    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? total - 1
          : event.key in KEY_STEP
            ? index + KEY_STEP[event.key]
            : null;
    if (target === null) return;

    event.preventDefault();
    const clamped = Math.max(0, Math.min(total - 1, target));
    if (clamped === index) return;

    updateDraft(moveItem(order, index, clamped));
    announce(format('moved', getLabel(item), clamped + 1, total), 'assertive');
  };

  const moveTo = (index: number, target: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, target));
    if (drag || clamped === index) return;

    const next = moveItem(items, index, clamped);
    onReorder(next);
    announce(format('dropped', getLabel(items[index]), clamped + 1, next.length), 'assertive');
  };

  const instructions = resolveLabel(
    'SortableList.labels.instructions',
    labelProps?.instructions,
    text?.instructions,
  );

  return (
    <>
      <ul
        className={cx(
          styles.list,
          styles[`list--${layout}`],
          drag && styles['list--active'],
          className,
        )}
        aria-label={label}
        data-testid={testId}
      >
        {order.map((item, index) => {
          const key = getKey(item);
          const isDragging = drag?.key === key;

          const handle = (
            <button
              ref={node => {
                if (node) handleRefs.current.set(key, node);
                else handleRefs.current.delete(key);
              }}
              type="button"
              className={styles.handle}
              aria-label={format('handle', getLabel(item))}
              aria-describedby={instructionsId}
              aria-pressed={isDragging && drag.mode === 'keyboard'}
              disabled={isDisabled}
              onKeyDown={event => handleKeyDown(event, item, index)}
              onPointerDown={event => startPointer(event, key, index)}
            >
              <GripVertical aria-hidden />
            </button>
          );

          return (
            <li
              key={key}
              ref={node => {
                if (node) itemRefs.current.set(key, node);
                else itemRefs.current.delete(key);
              }}
              className={cx(styles.item, isDragging && styles['item--dragging'])}
            >
              {renderItem(item, {
                index,
                isDragging,
                handle,
                moveTo: target => moveTo(index, target),
              })}
            </li>
          );
        })}
      </ul>
      <span id={instructionsId} hidden>
        {instructions}
      </span>
    </>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(SortableList, 'SortableList'),
) as typeof SortableList;
