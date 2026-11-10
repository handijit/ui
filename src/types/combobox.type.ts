import type { FocusEvent, ReactNode } from 'react';

export type ComboboxOption<T extends string = string> = {
  value: T;
  label: string;
  /** İkincil satır: kod, numara, ayırt edici bilgi. */
  description?: string;
  isDisabled?: boolean;
};

/** Bileşenin çizdiği metinler. */
export type ComboboxLabels = {
  /** Seçim yokken tetikleyicide ve alt sayfa başlığında görünen metin. */
  placeholder: string;
  /** Arama kutusunun yer tutucusu ve erişilebilir adı. */
  searchPlaceholder?: string;
  /** Liste boşken gösterilen metin. */
  emptyMessage?: string;
  /** Arama sürerken liste yerine gösterilen metin. */
  loadingMessage?: string;
  /** Seçimi kaldıran çarpının erişilebilir adı. */
  clearLabel?: string;
  /** Alt sayfanın kapatma düğmesinin erişilebilir adı. */
  closeLabel?: string;
};

export type ComboboxProps<T extends string> = {
  options: ComboboxOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  /**
   * Focus left the combobox (2.2): the trigger, the clear button and the open panel count as one
   * control, so moving between them is not a blur. While the bottom sheet is open the combobox is
   * still being used; the trigger takes the focus back when the sheet closes.
   */
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  labels: ComboboxLabels;
  /**
   * Verilirse arama sunucuda yapılır: bileşen listeyi kendisi filtrelemez, yazılanı 300 ms bekleyip
   * buraya bildirir.
   */
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  /**
   * Read-only (2.2): the value is shown, focusable and announced (`aria-readonly`), but the panel
   * does not open and the clear button is not drawn.
   */
  isReadOnly?: boolean;
  /** Seçimi kaldıran çarpı düğmesi gösterilir. */
  isClearable?: boolean;
  /** Arama kutusu GİZLENİR. */
  isSearchHidden?: boolean;
  /** Tetikleyicinin solundaki ikon. */
  icon?: ReactNode;
  id?: string;
  /** Zorunluluk — `Field`in `FieldChildProps` sözleşmesi. */
  required?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};
