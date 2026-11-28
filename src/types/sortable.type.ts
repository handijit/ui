import type { ReactNode } from 'react';

/** What `renderItem` receives for one item. */
export type SortableItemState = {
  /** The item's position in the order being drawn (0-based). */
  index: number;
  /** The item is being moved, by pointer or keyboard. */
  isDragging: boolean;
  /** The drag handle; place it in the item. Pointer drag and the keyboard both start on it. */
  handle: ReactNode;
  /** Moves the item to a position at once — `moveTo(0)` makes an image the cover. */
  moveTo: (index: number) => void;
};
