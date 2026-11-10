'use client';

import {
  type FocusEvent,
  type ForwardedRef,
  forwardRef,
  type KeyboardEvent,
  memo,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { createPortal } from 'react-dom';
import { CaretDownFill, CheckLg } from 'react-bootstrap-icons';

import useListboxNavigation from '../../hooks/useListboxNavigation';
import usePortalSurface from '../../hooks/usePortalSurface';
import usePositioning from '../../hooks/usePositioning';

import { SHEET_MEDIA_QUERY } from '../../constants/breakpoint.constants';
import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { assignRef } from '../../helpers/ref.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import BottomSheet from '../BottomSheet';

import styles from './index.module.scss';

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  isDisabled?: boolean;
};

/** Seçenek listesinin nerede açıldığı. */
type OpenMode = 'popover' | 'sheet';

type Props<T extends string> = {
  options: SelectOption<T>[];
  /** The chosen value. `null` (2.2), or a value no option has, shows the placeholder. */
  value: T | null;
  onChange: (value: T) => void;
  /**
   * Focus left the select (2.2): the trigger and its open list count as one control, so moving
   * between them is not a blur. While the bottom sheet is open the select is still being used;
   * the trigger takes the focus back when the sheet closes.
   */
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  /** Alanın adı. */
  label: string;
  /** Seçim yokken tetikleyicide görünen metin. */
  placeholder?: string;
  /** Alt sayfanın kapatma düğmesinin erişilebilir adı. */
  closeLabel?: string;
  /** Tetikleyicinin solundaki ikon. */
  icon?: ReactNode;
  /** `sm` yoğun şeritler içindir (araç çubuğu); varsayılan form ölçüsü `md`. */
  size?: 'sm' | 'md';
  /** Panelin hangi kenardan hizalanacağı. */
  align?: 'start' | 'end';
  isDisabled?: boolean;
  /**
   * Read-only (2.2): the value is shown, focusable and announced (`aria-readonly`), but the list
   * does not open. A disabled select drops out of the tab order; a read-only one does not.
   */
  isReadOnly?: boolean;
  id?: string;
  /**
   * Zorunluluk — `Field`in `FieldChildProps` sözleşmesinden gelir.
   * ⚠ Bileşen `...rest` YAYMIYOR, yani `Props`ta bildirilmeyen her alan sessizce buharlaşır.
   * `required` bir dönem tam olarak öyleydi: `<Field…
   */
  required?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};

/** Seçim kutusu. `ref` reaches the trigger (2.2): the element to focus for an error. */
const SelectBase = <T extends string>(
  {
    options,
    value,
    onChange,
    onBlur,
    label,
    placeholder,
    closeLabel,
    icon,
    size = 'md',
    align = 'start',
    isDisabled,
    isReadOnly,
    id,
    className,
    testId,
    required,
    'aria-describedby': describedBy,
    'aria-invalid': isInvalid,
  }: Props<T>,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const { labels } = useUi();
  const emptyText = resolveLabel('Select.placeholder', placeholder, labels?.selectPlaceholder);
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /* The caller's `ref` and the inner one hold the same trigger. */
  const setTrigger = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );
  const [openMode, setOpenMode] = useState<OpenMode | null>(null);

  /* PANEL SABIT KONUMLU, MUTLAK DEGIL — gerekce SCSS'te (`.panel`). */
  const positioning = usePositioning(triggerRef, panelRef, {
    side: 'bottom',
    align,
    isOpen: openMode === 'popover',
  });

  /*
   * Panel BODY'e (ya da icinde bulundugu acik `<dialog>`a) portallanir; gerekce
   * `hooks/usePortalSurface.ts`.
   */
  const portal = usePortalSurface(openMode === 'popover', triggerRef, panelRef);

  const isOpen = openMode !== null;
  const selectedIndex = options.findIndex(option => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  const close = useCallback(() => setOpenMode(null), []);

  const open = useCallback(() => {
    if (isDisabled || isReadOnly || options.length === 0) return;

    /*
     * Etkin secenek SECILI olandan baslar (kancanin `initialIndex`i); kullanici listeyi bastan
     * taramaz.
     */
    /* A sheet only on a narrow TOUCH screen; a desktop window gets the dropdown at any width. */
    setOpenMode(window.matchMedia(SHEET_MEDIA_QUERY).matches ? 'sheet' : 'popover');
  }, [isDisabled, isReadOnly, options.length]);

  const selectOption = (option: SelectOption<T>) => {
    if (option.isDisabled) return;
    onChange(option.value);
    close();
  };

  /* Kapaninca odak TETIKLEYICIYE doner. */
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) triggerRef.current?.focus();
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  /*
   * Disari tiklamada panel kapanir.
   * ⚠ PANEL ARTIK KOKUN ICINDE DEGIL — portallandi. `rootRef` tek basina bakilsaydi panelin ICINE
   * yapilan `mousedown` "disari" sayilir ve panel…
   */
  useEffect(() => {
    if (openMode !== 'popover') return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [openMode, close]);

  /* KLAVYE MODELI `useListboxNavigation`da — `Combobox`la AYNI kanca. */
  const { activeIndex, setActiveIndex, listRef, handleKeyDown } =
    useListboxNavigation<HTMLUListElement>({
      count: options.length,
      isOpen,
      initialIndex: selectedIndex >= 0 ? selectedIndex : 0,
      onSelect: index => {
        const option = options[index];
        if (option) selectOption(option);
      },
      onClose: close,
    });

  /* Alt sayfada odak listenin kendisine gecer: ok tuslari orada isler. */
  useEffect(() => {
    if (openMode === 'sheet') listRef.current?.focus({ preventScroll: true });
    /* `listRef` kancadan geliyor ve `useRef` kimligi SABIT; bagimlilikta
       olmasi etkiyi yeniden calistirmaz, denetci ise kancadan gelen bir
       degerin referans oldugunu kanitlayamiyor. */
  }, [openMode, listRef]);

  /*
   * 2.2 `onBlur`: React's focus events bubble through the portal, so the root hears the trigger
   * AND the list. Focus moving to the other part, or into the open sheet, is not a blur.
   */
  const openModeRef = useRef(openMode);
  openModeRef.current = openMode;
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!onBlur || openModeRef.current === 'sheet') return;
    const next = event.relatedTarget;
    if (
      next instanceof Node &&
      (rootRef.current?.contains(next) || panelRef.current?.contains(next))
    )
      return;
    onBlur(event);
  };

  /* KAPALIYKEN ok/Enter/Space paneli ACAR. */
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }

    handleKeyDown(event);
  };

  const renderList = (isSheet: boolean) => (
    <ul
      ref={listRef}
      id={listboxId}
      role="listbox"
      /*
       * Alt sayfada baslik `BottomSheet`in icinde ve kimligi bize kapali; listenin adi dogrudan
       * yazilir.
       */
      aria-label={label}
      /*
       * Odak alt sayfada listede, panelde tetikleyicide: etkin seçeneği bildiren öznitelik odağın
       * olduğu öğede durmak zorunda.
       */
      aria-activedescendant={isSheet && options[activeIndex] ? optionId(activeIndex) : undefined}
      tabIndex={isSheet ? 0 : -1}
      className={cx(styles.list, isSheet && styles['list--sheet'])}
      onKeyDown={isSheet ? onKeyDown : undefined}
    >
      {options.map((option, index) => {
        const isChosen = option.value === value;

        return (
          <li
            key={option.value}
            id={optionId(index)}
            role="option"
            data-index={index}
            aria-selected={isChosen}
            aria-disabled={option.isDisabled}
            className={cx(
              styles.option,
              index === activeIndex && styles['option--active'],
              isChosen && styles['option--selected'],
              option.isDisabled && styles['option--disabled'],
            )}
            // Fare imleci seçeneğin üstündeyken etkin seçenek de oraya taşınır; iki ayrı vurgu
            // kullanıcıyı şaşırtıyordu.
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => selectOption(option)}
          >
            <span className={styles.option__label}>{option.label}</span>
            {isChosen && <CheckLg aria-hidden className={styles.option__check} />}
          </li>
        );
      })}
    </ul>
  );

  return (
    <span
      ref={rootRef}
      className={cx(styles.select, className)}
      data-testid={testId}
      onBlur={handleBlur}
    >
      <button
        ref={setTrigger}
        id={baseId}
        type="button"
        role="combobox"
        className={cx(
          styles.trigger,
          styles[`trigger--${size}`],
          !selectedOption && styles['trigger--empty'],
          isOpen && styles['trigger--open'],
          isInvalid && styles['trigger--invalid'],
          isReadOnly && styles['trigger--readOnly'],
        )}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={
          openMode === 'popover' && options[activeIndex] ? optionId(activeIndex) : undefined
        }
        /* ⚠ `aria-label` KULLANILMAZ — SECILI DEGERI MASKELIYORDU. */
        aria-labelledby={selectedOption ? `${baseId}-name ${baseId}-value` : `${baseId}-name`}
        aria-describedby={describedBy}
        aria-invalid={isInvalid}
        /* Tetikleyici bir `<button>`; yerel `required` yok, karsiligi bu. */
        aria-required={required || undefined}
        aria-readonly={isReadOnly || undefined}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={onKeyDown}
      >
        {icon && (
          <span className={styles.trigger__icon} aria-hidden>
            {icon}
          </span>
        )}

        {/* Kontrolün adı — yalnızca erişilebilirlik ağacında. */}
        <span id={`${baseId}-name`} className={styles.trigger__srName}>
          {label}
        </span>

        <span id={`${baseId}-value`} className={styles.trigger__value}>
          {selectedOption?.label ?? emptyText}
        </span>

        {/*
         * Ok DOLU CARET: ince chevron, kutunun sag ucunda `$text-2` tonunda
         * iki hairline cizgiye iniyor ve kutunun acilir oldugu uzaktan
         * okunmuyordu. Acikken 180° donuyor — yon hâlâ durumu bildiriyor.
         */}
        {/* A read-only select does not open: no caret promising a list. */}
        {!isReadOnly && (
          <CaretDownFill
            aria-hidden
            className={cx(styles.trigger__chevron, isOpen && styles['trigger__chevron--open'])}
          />
        )}
      </button>

      {openMode === 'popover' &&
        portal.container &&
        createPortal(
          <div
            ref={panelRef}
            className={styles.panel}
            {...portal.attributes}
            style={{
              ...positioning.style,
              ...portal.style,
              /* Panel tetikleyiciyle EN AZ ayni genislikte. */
              minWidth: positioning.anchorWidth || undefined,
              /* Ilk karede olcu yok; yanlis yerde bir kare parlamasin. */
              visibility: positioning.isPositioned ? undefined : 'hidden',
            }}
          >
            {renderList(false)}
          </div>,
          portal.container,
        )}

      {/* Dar ekranda liste alt sayfada acilir; panel klavye acilinca sikisiyor
          ve alt ucu ekranin disinda kaliyordu (bkz. `BottomSheet`). */}
      {openMode === 'sheet' && (
        <BottomSheet title={label} closeLabel={closeLabel ?? labels?.close} onClose={close}>
          {renderList(true)}
        </BottomSheet>
      )}
    </span>
  );
};

/* A generic component keeps its type parameter through `forwardRef` only with this cast. */
const Select = /*#__PURE__*/ forwardRef(SelectBase) as <T extends string>(
  props: Props<T> & { ref?: Ref<HTMLButtonElement> },
) => ReactElement;

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Select, 'Select')) as typeof Select;
