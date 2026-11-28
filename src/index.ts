/**
 * @handijitcom/ui — açık genel API. Dışa verilen her ad bir SÖZLEŞMEDİR: bir sonraki büyük sürüme
 * kadar kaldırılmaz ve davranışı sessizce değişmez.
 */

// --- Theme -------------------------------------------------------------
export { default as UiProvider } from './theme/UiProvider';
export { default as UiThemeScript } from './theme/UiThemeScript';
export { useUi } from './theme/context';
/*
 * The theme contract belongs to `@handijitcom/ui/design`; these four are re-exported unchanged so an
 * application that only talks to the component library does not need a second import line, and so
 * the boot script and its CSP hash can never drift from the design package's copy.
 */
export {
  THEME_ATTRIBUTE,
  THEME_BOOT_SCRIPT,
  THEME_BOOT_SCRIPT_HASH,
  THEME_STORAGE_KEY,
} from '@handijitcom/ui/design';
/*
 * Sayfa düzeyinde `Escape` dinleyen kod (sohbetin "akışı durdur" kısayolu)
 * `event.defaultPrevented || hasOpenSurface()` sorar; yığının kendisi (`pushModal` / `isTopModal`)
 * iç API olarak kalır.
 */
export { hasOpenSurface } from './helpers/focus.helper';

// --- Kancalar ---------------------------------------------------------
export { default as useAnnounce } from './hooks/useAnnounce';
export { default as useUiTheme } from './hooks/useUiTheme';
export { default as useUiTokens } from './hooks/useUiTokens';
export { default as useStickToBottom } from './hooks/useStickToBottom';
export {
  default as useListboxNavigation,
  type ListboxNavigation,
} from './hooks/useListboxNavigation';
export { default as usePositioning } from './hooks/usePositioning';
export { default as useVirtualList } from './hooks/useVirtualList';
/*
 * Ikisi de MODUL DUZEYINDE sayac tutuyor (`lockCount`/`previous`, `openCount`/`frame`): tuketici
 * bunlari kendi bileseninde cagirdiginda kutuphanenin…
 * ⚠ `useScrollLock` ve `useSheetViewport` PUBLIC DEGIL.
 */

// --- Enum ve tipler ---------------------------------------------------
export { default as UIVariant } from './enums/ui-variant.enum';
export { default as UISize } from './enums/ui-size.enum';
export type { CommonElementProps } from './types/common-element-props.type';
export type { UiLinkComponent, UiLinkExtraProps, UiLinkProps } from './types/link.type';

// --- Sabitler ---------------------------------------------------------
export {
  ABOVE_MOBILE_MEDIA_QUERY,
  ABOVE_TABLET_MEDIA_QUERY,
  MOBILE_BREAKPOINT,
  SHEET_MEDIA_QUERY,
  TABLET_BREAKPOINT,
  TABLET_PORTRAIT_BREAKPOINT,
} from './constants/breakpoint.constants';

// --- Yardımcılar ------------------------------------------------------
export { matchesSearch, normalizeSearchTerm } from './helpers/text.helper';
/*
 * ⚠ `preventAutoKeyboard` / `isKeyboardOpeningElement` PUBLIC DEGIL: uc kip yuzeyinin (`Modal`,
 * `Drawer`, `BottomSheet`) ic ayrintisi.
 */

// --- Eylem ------------------------------------------------------------
export { default as Button } from './components/Button';
export { default as IconButton, type IconButtonVariant } from './components/IconButton';
export { default as TextLink } from './components/TextLink';
export { default as Tooltip } from './components/Tooltip';
export { ContextMenu, default as Menu, type MenuItem } from './components/Menu';
export { default as Popover } from './components/Popover';

// --- Seçim ------------------------------------------------------------
export { default as Chip, type ChipSize } from './components/Chip';
export { default as ChipGroup, type ChipOption } from './components/ChipGroup';
export {
  default as Combobox,
  type ComboboxLabels,
  type ComboboxOption,
} from './components/Combobox';
export { default as SegmentedControl, type SegmentOption } from './components/SegmentedControl';
export { default as Select, type SelectOption } from './components/Select';
export { default as Checkbox } from './components/Checkbox';
export { default as Switch } from './components/Switch';
export { default as Radio } from './components/Radio';
export { default as RadioCard } from './components/RadioCard';
export { default as RangeSlider, type RangeValue } from './components/RangeSlider';
export { default as RatingInput, type RatingLabels } from './components/RatingInput';
export { default as QuantityStepper } from './components/QuantityStepper';
export { default as TableCheckbox } from './components/TableCheckbox';

// --- Girdi ------------------------------------------------------------
export { default as Input } from './components/Input';
export { default as PasswordInput } from './components/PasswordInput';
/*
 * Scaled-integer number fields (2.4): the value is the integer of the data contract (`Kurus`,
 * `Qty4`, `Rate6`, `Pct2`), never a float. `ScaledInput` takes any scale (`Price4`, `Ppm`).
 */
export { default as ScaledInput } from './components/ScaledInput';
export { default as MoneyInput } from './components/MoneyInput';
export { default as QuantityInput } from './components/QuantityInput';
export { default as RateInput } from './components/RateInput';
export { default as PercentInput } from './components/PercentInput';
export { default as TagInput } from './components/TagInput';
export { default as Textarea } from './components/Textarea';
export { default as DateField, DateRange, type DateRangeValue } from './components/DateField';
export { default as Field, type FieldChildProps } from './components/Field';
export { default as FileUpload, type UploadFile } from './components/FileUpload';

// --- Yüzey ve geri bildirim -------------------------------------------
export { default as Alert, type AlertTone } from './components/Alert';
export { default as Avatar } from './components/Avatar';
export { default as Badge, type BadgeTone, type BadgeVariant } from './components/Badge';
export { default as Breadcrumb, type Crumb } from './components/Breadcrumb';
export {
  default as Card,
  CardBody,
  CardFooter,
  CardMedia,
  type CardMediaFit,
  CardOverlay,
} from './components/Card';
export { default as Carousel, type CarouselItemsPerView } from './components/Carousel';
export { default as CodeBadge, type CodeBadgeSize } from './components/CodeBadge';
export { default as Kbd } from './components/Kbd';
export { default as StatusDot, type StatusDotTone } from './components/StatusDot';
export { default as CopyField } from './components/CopyField';
export { default as Divider } from './components/Divider';
export {
  default as Directory,
  DirectoryGroup,
  DirectoryJump,
  DirectoryRow,
} from './components/Directory';
export { default as EmptyState } from './components/EmptyState';
export { default as PageHeader } from './components/PageHeader';
export { default as Panel, PanelForm, PanelRow } from './components/Panel';
export { default as Price, type PriceCurrencyPosition } from './components/Price';
export { default as Rating } from './components/Rating';
export { default as SectionHeader } from './components/SectionHeader';
export { default as ScrollArea } from './components/ScrollArea';
export {
  default as Skeleton,
  SkeletonCard,
  SkeletonRows,
  SkeletonTable,
} from './components/Skeleton';
export { default as Stat, type StatTrend } from './components/Stat';
export { default as SummaryCard, type SummaryCardHeadingLevel } from './components/SummaryCard';
export { default as TotalsList, type TotalsListItem } from './components/TotalsList';
export { default as Progress, ProgressCircle } from './components/Progress';
export { default as Spinner } from './components/Spinner';
export {
  default as ToastHub,
  toast,
  type ToastInset,
  type ToastOptions,
  type ToastPlacement,
  type ToastTone,
} from './components/Toast';
export { default as ToastPortal } from './components/ToastPortal';
export { default as Accordion, type AccordionItem } from './components/Accordion';
export { default as Disclosure, type DisclosureVariant } from './components/Disclosure';
export { default as Steps, type StepItem } from './components/Steps';
export { default as Tabs, type TabItem } from './components/Tabs';
export { default as Tile } from './components/Tile';
export {
  default as Timeline,
  type TimelineEvent,
  type TimelineStatus,
} from './components/Timeline';

// --- Brand surface (3.0) -----------------------------------------------
/*
 * The brand's cobalt surface and what sits on it: the surface with its SVG imagery, the eyebrow
 * label and the strip of facts. All three are server-drawable (`useId` runs on the server too). The coral glow of `ACCENT` on it lives in `Button`.
 */
export {
  BrandBlueprint,
  type BrandBlueprintShape,
  default as BrandSurface,
  type BrandSurfaceSide,
} from './components/BrandSurface';
export { default as Eyebrow, type EyebrowAlign } from './components/Eyebrow';
export {
  default as StatStrip,
  type StatStripItem,
  type StatStripVariant,
} from './components/StatStrip';

// --- Kipsel -----------------------------------------------------------
export { default as BottomSheet } from './components/BottomSheet';
export { default as Modal, type ModalTone } from './components/Modal';
export { default as CommandPalette, type CommandItem } from './components/CommandPalette';
export { default as ConfirmDialog, type ConfirmKind } from './components/ConfirmDialog';
export { default as Drawer } from './components/Drawer';
export { default as PromptDialog } from './components/PromptDialog';

// --- Veri -------------------------------------------------------------
export { default as Table, TableScroller } from './components/Table';
export {
  default as DataTable,
  DataTableRow,
  type DataTableColumn,
  type DataTableColumnAlign,
  type DataTableColumnState,
  type DataTableDensity,
} from './components/DataTable';
/* 3.1: its own module and subpath, so a `DataTable` without a column menu does not bundle it. */
export {
  default as DataTableColumnMenu,
  type DataTableColumnMenuLabels,
} from './components/DataTableColumnMenu';
/* 3.1: the parts portal's dense data and ordering components. */
export {
  default as Gallery,
  type GalleryImage,
  type GalleryImageVariant,
  type GalleryLabels,
  type GalleryRenderImageProps,
} from './components/Gallery';
export {
  default as TreeSelect,
  type TreeSelectLabels,
  type TreeSelectNode,
  type TreeSelectProps,
} from './components/TreeSelect';
export {
  default as NotificationCenter,
  type NotificationCenterLabels,
  type NotificationItem,
} from './components/NotificationCenter';
export { default as BulkPasteInput, type BulkPasteLabels } from './components/BulkPasteInput';
/*
 * The parser comes from the helper, not from the client module: a server component (or a server
 * action) can call it from the root entry.
 */
export {
  type BulkPasteInvalidLine,
  type BulkPasteInvalidReason,
  type BulkPasteOptions,
  type BulkPasteResult,
  type BulkPasteRow,
  parseBulkPaste,
} from './helpers/bulk-paste.helper';
/* 3.2: the panel frame, `@handijitcom/ui/app-shell`; the account menu on its own subpath. */
export {
  default as AppShell,
  AppShellNav,
  AppShellNavGroup,
  AppShellNavItem,
  type AppShellLabels,
  type AppShellNavGroupProps,
  type AppShellNavItemProps,
  type AppShellNavLink,
  type AppShellNavProps,
  type AppShellNavSection,
} from './components/AppShell';
export { default as UserMenu } from './components/UserMenu';
export { default as FilterBar, FilterBarField } from './components/FilterBar';
export { default as Pagination } from './components/Pagination';

// --- Commerce (3.4) ---------------------------------------------------
/*
 * A storefront's catalogue and header, each on its own subpath (`/facet-sidebar`, `/mega-menu`…):
 * filters (column, sections, applied chips, toolbar), reordering, codes, the brand mark, the
 * sticky action bar, the comparison tray and the showcase rail.
 */
export { default as FacetSidebar, type FacetSidebarLabels } from './components/FacetSidebar';
export {
  default as FacetSection,
  type FacetLabels,
  type FacetMode,
  type FacetOption,
  type FacetRange,
} from './components/FacetSection';
export {
  default as AppliedFilters,
  type AppliedFilter,
  type AppliedFiltersLabels,
} from './components/AppliedFilters';
export {
  default as FilterToolbar,
  type FilterToolbarDensity,
  type FilterToolbarLabels,
  type FilterToolbarView,
} from './components/FilterToolbar';
export {
  default as SortableList,
  type SortableItemState,
  type SortableListLabels,
} from './components/SortableList';
export { default as CodeText } from './components/CodeText';
export { default as BrandLockup, type BrandLockupSize } from './components/BrandLockup';
export { default as StickyActionBar } from './components/StickyActionBar';
export {
  default as CompareTray,
  type CompareTrayItem,
  type CompareTrayLabels,
} from './components/CompareTray';
export {
  default as ProductCarousel,
  type ProductCarouselLabels,
} from './components/ProductCarousel';
export {
  default as MegaMenu,
  type MegaMenuColumn,
  type MegaMenuItem,
  type MegaMenuLabels,
  type MegaMenuLink,
} from './components/MegaMenu';

/* Tip sozlesmeleri — govdeleri `src/types/` altinda. */
export type { AnnouncePoliteness, ListboxNavigationOptions, VirtualRange } from './types/hook.type';
export type {
  PositionAlign,
  PositionSide,
  PositioningOptions,
  PositioningState,
} from './types/positioning.type';
export type {
  UiColorPreference,
  UiColorScheme,
  UiContextValue,
  UiLabels,
  UiThemeState,
} from './types/theme.type';
