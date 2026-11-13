'use client';

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

import type { PlacedEvent } from './layout';
import { type CalendarTarget, type MoveBounds, targetOf } from './moves';

/** A press that travels less than this is a click, not a drag (px). */
const DRAG_THRESHOLD = 4;

const WEEK = 7;

type Origin = { item: PlacedEvent; isResize: boolean; x: number; y: number; isStarted: boolean };

export type DragPreview = { key: string; isResize: boolean; target: CalendarTarget };

/**
 * POINTER DRAG of an event: move it (the body) or stretch it (the bottom handle), snapped to the
 * slot, with a preview while the pointer travels and `Escape` to give up.
 *
 * The listeners go on `window` for the length of one drag, not on the event's element: the
 * preview is drawn in the target column while the source stays where it is, and a pointer
 * released outside the calendar still ends the drag. The click a drag ends with is swallowed
 * (`isClickSwallowed`) so that dropping an event does not also open it.
 */
const useCalendarDrag = ({
  bodyRef,
  bounds,
  onDrop,
}: {
  /** The element whose box is the grid of columns (time) or of day cells (month). */
  bodyRef: RefObject<HTMLElement | null>;
  bounds: MoveBounds;
  onDrop: (item: PlacedEvent, target: CalendarTarget) => void;
}) => {
  const [preview, setPreview] = useState<DragPreview | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isSwallowingRef = useRef(false);
  const latest = useRef({ bounds, onDrop });
  latest.current = { bounds, onDrop };

  const targetAt = (event: PointerEvent, origin: Origin): CalendarTarget | undefined => {
    const box = bodyRef.current?.getBoundingClientRect();
    const { bounds: current } = latest.current;
    if (!box || box.width === 0 || box.height === 0) return undefined;

    if (current.view === 'time') {
      const minutesPerPixel = (current.rangeEnd - current.rangeStart) / box.height;
      const minutes = (event.clientY - origin.y) * minutesPerPixel;
      const delta = Math.round(minutes / current.slotMinutes) * current.slotMinutes;
      const column = Math.floor(((event.clientX - box.left) / box.width) * current.columnCount);

      return targetOf(origin.item, origin.isResize, delta, column, current);
    }

    const rows = Math.ceil(current.columnCount / WEEK);
    const column = Math.floor(((event.clientX - box.left) / box.width) * WEEK);
    const row = Math.floor(((event.clientY - box.top) / box.height) * rows);
    if (column < 0 || column >= WEEK || row < 0 || row >= rows) return undefined;

    return targetOf(origin.item, false, 0, row * WEEK + column, current);
  };

  const begin = useCallback(
    (
      item: PlacedEvent,
      event: { button: number; clientX: number; clientY: number },
      isResize: boolean,
    ) => {
      isSwallowingRef.current = false;
      if (event.button !== 0 || !item.isMovable) return;

      cleanupRef.current?.();
      const origin: Origin = {
        item,
        isResize,
        x: event.clientX,
        y: event.clientY,
        isStarted: false,
      };

      const stop = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
        window.removeEventListener('pointercancel', cancel);
        window.removeEventListener('keydown', escape, true);
        cleanupRef.current = null;
        setPreview(null);
      };

      /* The click that follows the release in the same task is the drag's, not an "open". */
      const swallowNextClick = () => {
        isSwallowingRef.current = true;
        window.setTimeout(() => {
          isSwallowingRef.current = false;
        }, 0);
      };

      const move = (moveEvent: PointerEvent) => {
        const travelled = Math.hypot(moveEvent.clientX - origin.x, moveEvent.clientY - origin.y);
        if (!origin.isStarted && travelled < DRAG_THRESHOLD) return;
        origin.isStarted = true;

        const target = targetAt(moveEvent, origin);
        setPreview(target ? { key: origin.item.key, isResize: origin.isResize, target } : null);
      };

      const end = (upEvent: PointerEvent) => {
        stop();
        if (!origin.isStarted) return;

        swallowNextClick();
        const target = targetAt(upEvent, origin);
        if (target) latest.current.onDrop(origin.item, target);
      };

      const cancel = () => stop();

      /* Captured: the `Escape` that gives up a drag must not also close the dialog around it. */
      const escape = (keyEvent: KeyboardEvent) => {
        if (keyEvent.key !== 'Escape' || !origin.isStarted) return;
        keyEvent.preventDefault();
        keyEvent.stopPropagation();
        swallowNextClick();
        stop();
      };

      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', cancel);
      window.addEventListener('keydown', escape, true);
      cleanupRef.current = stop;
    },
    // `targetAt` reads the box and the bounds through refs at the moment of the event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* A calendar unmounted mid-drag leaves no listener behind. */
  useEffect(() => () => cleanupRef.current?.(), []);

  const isClickSwallowed = useCallback(() => isSwallowingRef.current, []);

  return { preview, begin, isClickSwallowed };
};

export default useCalendarDrag;
