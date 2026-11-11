'use client';

import {
  memo,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react';

import { XLg } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import {
  captureFocus,
  focusDialogContent,
  type FocusTarget,
  isTopModal,
  pushModal,
} from '../../helpers/focus.helper';
import { resolveLabel } from '../../helpers/label.helper';
import useScrollLock from '../../hooks/useScrollLock';
import { useUi } from '../../theme/context';
import IconButton from '../IconButton';

import styles from './index.module.scss';

export type ModalTone = 'neutral' | 'danger' | 'warning' | 'success' | 'info';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Kapatma düğmesinin erişilebilir adı. */
  closeLabel?: string;
  children?: ReactNode;
  /** Başlığın altındaki bir cümlelik açıklama. */
  description?: ReactNode;
  /** Altta duran eylemler. */
  footer?: ReactNode;
  /** Başlığın solunda duran ikon madalyonu; `tone` rengini alır. */
  icon?: ReactNode;
  /** İkon madalyonunun tonu. */
  tone?: ModalTone;
  /** `xl` (≈1040 px) sekmeli, tablolu panolar için; dar ekranda diğerleri gibi tam genişlik. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** `false` iken arka plana tıklama, Escape ve kapatma düğmesi kapatmaz. */
  isDismissable?: boolean;
  /**
   * Açılınca odaklanacak öğe (pencerenin içinde). Verilmezse `data-ui-autofocus` taşıyan öğe, o da
   * yoksa kapatma düğmesinden sonraki ilk odaklanabilir öğe. ⚠ İçerikteki React `autoFocus`u
   * `showModal()`dan ÖNCE koştuğu için etkisizdir; yerine bu prop.
   */
  initialFocus?: FocusTarget;
  className?: string;
  testId?: string;
};

/** Kip pencere (modal). */
const Modal = ({
  isOpen,
  onClose,
  title,
  closeLabel,
  children,
  description,
  footer,
  icon,
  tone = 'neutral',
  size = 'md',
  isDismissable = true,
  initialFocus,
  className,
  testId,
}: Props) => {
  const { labels } = useUi();
  const dialogRef = useRef<HTMLDialogElement>(null);
  /* Yigindaki yerimiz: */
  const tokenRef = useRef<symbol | null>(null);
  /* Acilis etkisi yalnizca `isOpen`a bagli; hedef her cizimde guncel okunur. */
  const initialFocusRef = useRef(initialFocus);
  initialFocusRef.current = initialFocus;
  const titleId = useId();
  const descriptionId = useId();

  /* ACILIS: `showModal()` + odak + yigina katilma. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!isOpen) {
      if (dialog.open) dialog.close();
      return;
    }

    const restoreFocus = captureFocus();
    if (!dialog.open) dialog.showModal();

    /*
     * Odak KAPATMA DUGMESINE degil ilk anlamli ogeye (ya da `initialFocus`a). `showModal()` DOM
     * sirasindaki ilk odaklanabilir ogeye gidiyor ve o neredeyse her zaman basliktaki kapatma dugmesi.
     * Ilk oge bir metin alaniysa odak YALNIZCA dokunmatik cihazda geri alinir (ekran klavyesi
     * kullanici istemeden aciliyordu); masaustunde alan odakta kalir (bkz. `helpers/focus.helper`).
     */
    focusDialogContent(dialog, initialFocusRef.current, `.${styles.modal__close}`);

    const { token, pop } = pushModal();
    tokenRef.current = token;

    return () => {
      /*
       * Siralama ZORUNLU (`CommandPalette` gibi): kipsel pencere acikken disaridaki oge odak ALAMAZ.
       * Pencere once kapanir, sonra odak acan ogeye doner.
       */
      if (dialog.open) dialog.close();
      pop();
      tokenRef.current = null;
      restoreFocus();
    };
  }, [isOpen]);

  /*
   * Arka plan kaydirmasi kilitlenir. `showModal()` arka plani etkilesime kapatir ama kaydirmayi her
   * tarayicida engellemiyor: kullanici pencereyi…
   */
  useScrollLock(isOpen);

  /*
   * Escape'i tarayici isliyor ama React durumu bundan haberdar olmuyor; `cancel` olayi yakalanmazsa
   * pencere kapanip `isOpen` true kaliyor ve bir daha…
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      /*
       * Varsayilan HER ZAMAN engellenir: kapanis karari React'te veriliyor ve tarayicinin pencereyi
       * kendi basina kapatmasi durumu `isOpen: true` birakiyordu.
       */
      event.preventDefault();
      if (!isDismissable) return;

      /* Yalnizca EN USTTEKI panel kapanir. */
      if (tokenRef.current && !isTopModal(tokenRef.current)) return;

      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose, isDismissable]);

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (!isDismissable) return;
      // Hedef dialog'un KENDISI ise arka plana tiklanmistir; panel degil.
      if (event.target === dialogRef.current) onClose();
    },
    [isDismissable, onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      className={cx(styles.modal, styles[`modal--${size}`], className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-testid={testId}
      onClick={handleBackdropClick}
    >
      <div className={styles.modal__panel}>
        <header className={styles.modal__header}>
          {icon && (
            <span className={cx(styles.modal__icon, styles[`modal__icon--${tone}`])}>{icon}</span>
          )}

          <div className={styles.modal__heading}>
            <h2 id={titleId} className={styles.modal__title}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className={styles.modal__description}>
                {description}
              </p>
            )}
          </div>

          {isDismissable && (
            <IconButton
              icon={<XLg aria-hidden />}
              label={resolveLabel('Modal.closeLabel', closeLabel, labels?.close)}
              variant="ghost"
              size="sm"
              className={styles.modal__close}
              onClick={onClose}
            />
          )}
        </header>

        {/*
          Gövde yalnızca içerik VARSA çizilir: onay pencerelerinin çoğunda soru
          başlıkta ve açıklamada duruyor, gövde boş kalıyor ve boş bir kutu
          40 px'lik bir boşluk bırakıyordu.
        */}
        {children && <div className={styles.modal__body}>{children}</div>}

        {footer && <footer className={styles.modal__footer}>{footer}</footer>}
      </div>
    </dialog>
  );
};

export default /*#__PURE__*/ memo(Modal) as typeof Modal;
