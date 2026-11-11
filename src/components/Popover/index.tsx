'use client';

import {
  cloneElement,
  isValidElement,
  type KeyboardEvent,
  memo,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import useDismissOnEscape from '../../hooks/useDismissOnEscape';
import {
  captureFocus,
  type FocusTarget,
  focusableWithin,
  focusInitial,
  nextFocusableAfter,
} from '../../helpers/focus.helper';
import usePortalSurface from '../../hooks/usePortalSurface';
import usePositioning from '../../hooks/usePositioning';

import styles from './index.module.scss';
import type { PositionAlign, PositionSide } from '@/types/positioning.type';

type Props = {
  /** Tetikleyici. */
  trigger: ReactElement;
  children: ReactNode;
  /** Yüzeyin erişilebilir adı. */
  label: string;
  side?: PositionSide;
  align?: PositionAlign;
  /** Kontrollü kullanım. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Açılınca odaklanacak öğe (yüzeyin içinde). Verilmezse `data-ui-autofocus` taşıyan öğe, o da
   * yoksa ilk odaklanabilir öğe.
   */
  initialFocus?: FocusTarget;
  className?: string;
  testId?: string;
};

/** Popover — eylem taşıyabilen, odaklanabilir yüzey. */
const Popover = ({
  trigger,
  children,
  label,
  side = 'bottom',
  align = 'start',
  isOpen: controlledOpen,
  onOpenChange,
  initialFocus,
  className,
  testId,
}: Props) => {
  const id = useId();
  const anchorRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  /* Bu acilista ilk odak verildi mi: yeniden konumlanma (kaydirma, boyut) odagi tekrar CALMAZ. */
  const hasFocusedRef = useRef(false);
  /* `Tab` ile cikis kapanisi ZATEN bildirdi: ardindan gelen `blur` ikinci kez bildirmez. */
  const isLeavingRef = useRef(false);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const positioning = usePositioning(anchorRef, surfaceRef, { side, align, isOpen });

  const portal = usePortalSurface(isOpen, anchorRef, surfaceRef);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  /*
   * KAPANISTA odak TETIKLEYICIYE doner — ama yalnizca odak yuzeyle birlikte DUSTUYSE (`<body>`) ya da
   * hala icerdeyse. Kullanici `Tab` ile ya da bir alana tiklayarak baska bir yere gectiyse odak orada
   * kalir; eskiden tetikleyiciye geri cekiliyordu.
   */
  useEffect(() => {
    if (!isOpen) return;

    hasFocusedRef.current = false;
    isLeavingRef.current = false;
    const restore = captureFocus();
    const surface = surfaceRef.current;

    return () => {
      const active = document.activeElement;
      if (!active || active === document.body || surface?.contains(active)) restore();
    };
  }, [isOpen]);

  /*
   * ACILIS odagi yuzey KONUMLANDIKTAN SONRA verilir. Yuzey olculene kadar `visibility: hidden`
   * cizilir ve gizli bir ogeye `focus()` tarayicida sessizce yok sayilir: odak tetikleyicide kaliyor,
   * klavye kullanicisi panele hic giremiyordu (masaüstü programi iki `requestAnimationFrame` ile
   * atlatiyordu). jsdom gorunurluk denetlemedigi icin bunu yalnizca tarayici testi gorur.
   */
  const isPositioned = positioning.isPositioned;
  useEffect(() => {
    if (!isOpen || !isPositioned || hasFocusedRef.current) return;

    const surface = surfaceRef.current;
    if (!surface) return;

    hasFocusedRef.current = true;
    if (!surface.contains(document.activeElement)) focusInitial(surface, initialFocus);
  }, [isOpen, isPositioned, initialFocus]);

  const close = useCallback(() => setOpen(false), [setOpen]);
  useDismissOnEscape(isOpen, close);

  /*
   * DISARI tiklama da belge duzeyinde: odak yuzeyin icinde olmayabilir (fareyle acilmis bir
   * popover).
   */
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (surfaceRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      setOpen(false);
    };

    /* `mousedown`: `click` beklerken kullanici surukleyerek secim yaparsa yuzey kapanmiyordu. */
    document.addEventListener('mousedown', handlePointerDown);

    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, setOpen]);

  /*
   * `Tab` SINIRDA: yuzey `<body>`nin sonuna portallanmis, tarayicinin kendi sirasi odagi sayfanin
   * disina atiyordu. Son ogeden `Tab` tetikleyiciden SONRAKI durağa, ilk ogeden `Shift+Tab`
   * tetikleyiciye gider; ikisinde de yuzey kapanir (kipsel olmayan yuzeyde odak tuzagi yok).
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || event.defaultPrevented) return;

    const surface = event.currentTarget;
    const active = document.activeElement;
    const focusable = focusableWithin(surface);
    const edge = event.shiftKey ? focusable[0] : focusable.at(-1);
    /* Odak yuzeyin KENDISINDEYSE (odaklanabilir ogesi olmayan panel) geri yon de sinirdir. */
    const isAtEdge =
      edge === undefined || active === edge || (event.shiftKey && active === surface);
    const anchor = anchorRef.current;
    if (!isAtEdge || !anchor) return;

    event.preventDefault();
    isLeavingRef.current = true;
    setOpen(false);
    const next = event.shiftKey ? anchor : (nextFocusableAfter(anchor, surface) ?? anchor);
    next.focus();
  };

  if (!isValidElement(trigger)) return null;

  const triggerProps = trigger.props as Record<string, unknown>;

  const anchor = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    ref: anchorRef,
    'aria-expanded': isOpen,
    'aria-haspopup': 'dialog',
    'aria-controls': isOpen ? id : undefined,
    onClick: (event: React.MouseEvent) => {
      (triggerProps.onClick as ((event: React.MouseEvent) => void) | undefined)?.(event);
      setOpen(!isOpen);
    },
  });

  return (
    <>
      {anchor}

      {isOpen &&
        portal.container &&
        createPortal(
          <div
            ref={surfaceRef}
            id={id}
            /* ⚠ Modal içinden açıldığında üst katman ZORUNLU — `portal.helper`. */
            {...portal.attributes}
            /*
             * `role="dialog"` ama `aria-modal` YOK: yuzey kipsel degil ve `aria-modal="true"`
             * yazmak ekran okuyucuya sayfanin geri kalaninin erisilemez oldugunu…
             */
            role="dialog"
            aria-label={label}
            className={cx(styles.popover, styles[`popover--${positioning.side}`], className)}
            style={{
              ...positioning.style,
              ...portal.style,
              visibility: positioning.isPositioned ? 'visible' : 'hidden',
            }}
            data-testid={testId}
            onKeyDown={handleKeyDown}
            /*
             * Odak yuzeyin DISINA ciktiginda kapanir: kipsel olmayan bir yuzeyde odagi hapsetmek
             * kullaniciyi sayfadan koparirdi.
             * ⚠ AMA "DISI" DOM AGACIYLA OLCULEMEZ.
             */
            onBlur={event => {
              const next = event.relatedTarget as HTMLElement | null;
              if (!next || isLeavingRef.current) return;
              if (event.currentTarget.contains(next)) return;
              if (anchorRef.current?.contains(next)) return;

              /*
               * Bu yuzeyden PORTALLANMIS bir katman mi? `Menu`/`Select`/ `Combobox` panelleri
               * `aria-controls`/`id` zinciriyle degil, acildiklari an odagi tasiyarak…
               */
              if (next.closest('[role="listbox"],[role="menu"],[role="dialog"]')) return;

              setOpen(false);
            }}
          >
            {children}
          </div>,
          portal.container,
        )}
    </>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Popover, 'Popover')) as typeof Popover;
