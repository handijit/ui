/** Izgarada çizilmeyen, `?solo=<ad>` ile tek başına açılan bileşenler. */
export const SOLO_ONLY = [
  'Modal',
  'BottomSheet',
  'ConfirmDialog',
  'PromptDialog',
  'Drawer',
  'CommandPalette',
  'ContextMenu',
  /* 3.2: a whole-window frame (`min-height: 100dvh`, sticky sidebar). */
  'AppShell',
] as const;
