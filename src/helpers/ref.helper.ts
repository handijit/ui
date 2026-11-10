import type { Ref } from 'react';

/** Hands a node to a forwarded ref of either kind (callback or object). */
export const assignRef = <T>(ref: Ref<T> | undefined, node: T | null): void => {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
};
