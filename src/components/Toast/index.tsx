'use client';

import {
  type CSSProperties,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import {
  CheckCircleFill,
  ExclamationTriangleFill,
  InfoCircleFill,
  XCircleFill,
  XLg,
} from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';
import useDismissOnEscape from '../../hooks/useDismissOnEscape';
import { useUi } from '../../theme/context';
import IconButton from '../IconButton';

import styles from './index.module.scss';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export type ToastOptions = {
  tone?: ToastTone;
  /** Görüntülenme süresi (ms). `0` → kendiliğinden kapanmaz. */
  duration?: number;
  /** Başlığın altındaki bir cümlelik ayrıntı. */
  description?: ReactNode;
  /** Bildirimin içindeki tek eylem ("Geri al"). */
  action?: { label: string; onClick: () => void };
};

type ToastRecord = ToastOptions & { id: number; message: string };

/**
 * Yığının pencerede durduğu kenar ve hizası. `start`/`end` yazı yönünü izler (sağdan sola dilde
 * `end` soldur). Her genişlikte AYNI: 2.2 1025px altında bildirimleri kendiliğinden ortalıyordu.
 */
export type ToastPlacement =
  'bottom-end' | 'bottom-start' | 'bottom-center' | 'top-end' | 'top-start' | 'top-center';

/**
 * Yığının pencere kenarlarından uzaklığı, CSS uzunluğu olarak (`'240px'`, `'var(--app-sidebar)'`).
 * Kenar çubuğu olan uygulama `inlineStart` verir: bildirimler çubuğun üstüne binmez.
 */
export type ToastInset = {
  top?: string;
  bottom?: string;
  inlineStart?: string;
  inlineEnd?: string;
};

/** `inset` → yığının okuduğu özel özellikler (`--ui-toast-inset-*`). */
const insetStyle = (inset: ToastInset | undefined): CSSProperties | undefined => {
  if (!inset) return undefined;

  const entries = [
    ['--ui-toast-inset-top', inset.top],
    ['--ui-toast-inset-bottom', inset.bottom],
    ['--ui-toast-inset-start', inset.inlineStart],
    ['--ui-toast-inset-end', inset.inlineEnd],
  ].filter((entry): entry is [string, string] => entry[1] !== undefined);

  return entries.length > 0 ? (Object.fromEntries(entries) as CSSProperties) : undefined;
};

/** Ton başına ikon: renk TEK BAŞINA anlam taşımaz (WCAG 1.4.1). */
const ICONS: Record<ToastTone, ReactNode> = {
  info: <InfoCircleFill aria-hidden />,
  success: <CheckCircleFill aria-hidden />,
  warning: <ExclamationTriangleFill aria-hidden />,
  danger: <XCircleFill aria-hidden />,
};

/** Ton başına varsayılan süre. */
const DEFAULT_DURATION: Record<ToastTone, number> = {
  info: 4_000,
  success: 4_000,
  warning: 6_000,
  danger: 8_000,
};

/** Aynı anda ekranda duran en fazla bildirim. */
const MAX_VISIBLE = 3;

/* YAYIN MERKEZI — modul duzeyinde, saglayicidan BAGIMSIZ. */
let counter = 0;
/*
 * `new Set()` modul duzeyinde bir CAGRI ve acilama olmadan bundler onu yan etkili sayabilir — Faz
 * 0'da `memo()` cagrilarinda tam olarak bu olmustu.
 */
const listeners = /*#__PURE__*/ new Set<(toasts: ToastRecord[]) => void>();
let queue: ToastRecord[] = [];

const emit = () => listeners.forEach(listener => listener(queue));

const dismiss = (id: number) => {
  queue = queue.filter(item => item.id !== id);
  emit();
};

const push = (message: string, options: ToastOptions = {}): number => {
  counter += 1;
  const id = counter;

  /*
   * SIRAYA ALMA: ekranda en fazla `MAX_VISIBLE` bildirim durur, fazlasi EN ESKIsini duserek yerini
   * alir.
   */
  queue = [...queue, { ...options, id, message }].slice(-MAX_VISIBLE);
  emit();

  return id;
};

/**
 * BİLDİRİM SÖZLEŞMESİ — süre, ikon ve renk kararları TEK YERDE.
 * @example toast.success('Adres kaydedildi'); toast.error('Kart reddedildi', { action: { label…
 */
export const toast = {
  show: push,
  info: (message: string, options?: ToastOptions) => push(message, { ...options, tone: 'info' }),
  success: (message: string, options?: ToastOptions) =>
    push(message, { ...options, tone: 'success' }),
  warning: (message: string, options?: ToastOptions) =>
    push(message, { ...options, tone: 'warning' }),
  error: (message: string, options?: ToastOptions) => push(message, { ...options, tone: 'danger' }),
  dismiss,
  /** Tümünü kapatır — sayfa geçişinde bayat bildirim taşınmasın. */
  clear: () => {
    queue = [];
    emit();
  },
};

type ItemProps = {
  toast: ToastRecord;
  closeLabel: string;
  onDismiss: (id: number) => void;
};

/** Tek bir bildirim satırı; kendi zamanlayıcısını kendisi taşır. */
const ToastItem = ({ toast: record, closeLabel, onDismiss }: ItemProps) => {
  const tone = record.tone ?? 'info';
  const duration = record.duration ?? DEFAULT_DURATION[tone];

  const [isPaused, setIsPaused] = useState(false);
  const remainingRef = useRef(duration);
  const startedRef = useRef(0);

  useEffect(() => {
    if (duration === 0 || isPaused) return;

    startedRef.current = Date.now();
    const timer = window.setTimeout(() => onDismiss(record.id), remainingRef.current);

    return () => {
      window.clearTimeout(timer);
      /*
       * Kalan sure KORUNUR: imlec ayrilinca sayac bastan baslasaydi, uzerine bir kez gelinen
       * bildirim ekranda cok daha uzun kaliyordu.
       */
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedRef.current));
    };
  }, [duration, isPaused, onDismiss, record.id]);

  return (
    <div
      className={cx(styles.toast, styles[`toast--${tone}`])}
      /*
       * `role="alert"` YALNIZCA hatada: o rol `aria-live="assertive"` demek ve kullanicinin okudugu
       * seyi BOLER.
       */
      role={tone === 'danger' ? 'alert' : 'status'}
      /*
       * Fare uzerindeyken sayac DURUR: kullanici bildirimi okuyor ya da icindeki eylemi tiklamaya
       * gidiyor.
       */
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      /* Klavye odagi da duraklatir: */
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <span className={styles.toast__icon} aria-hidden>
        {ICONS[tone]}
      </span>

      <div className={styles.toast__text}>
        <span className={styles.toast__message}>{record.message}</span>
        {record.description && (
          <span className={styles.toast__description}>{record.description}</span>
        )}
      </div>

      {record.action && (
        <button
          type="button"
          className={styles.toast__action}
          onClick={() => {
            record.action?.onClick();
            onDismiss(record.id);
          }}
        >
          {record.action.label}
        </button>
      )}

      <IconButton
        icon={<XLg aria-hidden />}
        label={closeLabel}
        variant="ghost"
        size="sm"
        className={styles.toast__close}
        onClick={() => onDismiss(record.id)}
      />
    </div>
  );
};

type HubProps = {
  /** Kapatma düğmelerinin erişilebilir adı. */
  closeLabel?: string;
  /**
   * Yığının erişilebilir adı ("Bildirimler").
   * ⚠ Yığın artık bir `role="region"` ve canlı bölge; adsız bir bölge ekran okuyucuda yalnızca
   * "bölge" diye okunur.
   */
  regionLabel?: string;
  /** Yığının kenarı ve hizası; varsayılan `bottom-end` (her genişlikte). */
  placement?: ToastPlacement;
  /** Pencere kenarlarından uzaklık (CSS uzunlukları); kenar çubuğunu boş bırakmak için. */
  inset?: ToastInset;
  className?: string;
};

/** Bildirim yığını — uygulamada BİR KEZ çizilir. */
const ToastHub = ({
  closeLabel,
  regionLabel,
  placement = 'bottom-end',
  inset,
  className,
}: HubProps) => {
  const { labels } = useUi();
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  useEffect(() => {
    listeners.add(setToasts);
    setToasts(queue);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  const handleDismiss = useCallback((id: number) => dismiss(id), []);

  /*
   * Escape en YENI bildirimi kapatir: yigilmis bildirimleri tek tek kapatmanin klavyeyle tek yolu
   * buydu.
   */
  const dismissLatest = useCallback(() => {
    const latest = toasts.at(-1);
    if (latest) dismiss(latest.id);
  }, [toasts]);

  /*
   * Gecici kayit: bildirim klavyeyi ALMAZ. Kipsel sayildiginda bildirim ekranda durdugu 4-8 saniye
   * boyunca ⌘K ve uygulama kisayollari olu kaliyordu (`hasOpenSurface`).
   */
  useDismissOnEscape(toasts.length > 0, dismissLatest, { isTransient: true });

  /* HIDRASYON: `isClient()` RENDER İÇİNDE OKUNAMAZ */
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const [edge, align] = placement.split('-') as ['top' | 'bottom', 'start' | 'center' | 'end'];

  return createPortal(
    /*
     * Bildirimin üzerindeki `role="status"`/`role="alert"` öğe DOM'a girdiği ANDA yaratılıyordu
     * ⚠ CANLI BÖLGE YIĞININ KENDİSİNDE, tek tek bildirimlerde DEĞİL.
     */
    <div
      className={cx(
        styles.hub,
        styles[`hub--${edge}`],
        align !== 'end' && styles[`hub--${align}`],
        className,
      )}
      style={insetStyle(inset)}
      role="region"
      aria-label={resolveLabel('ToastHub.regionLabel', regionLabel, labels?.notifications)}
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map(record => (
        <ToastItem
          key={record.id}
          toast={record}
          closeLabel={resolveLabel('ToastHub.closeLabel', closeLabel, labels?.close)}
          onDismiss={handleDismiss}
        />
      ))}
    </div>,
    document.body,
  );
};

export type { HubProps as ToastHubProps };
export default /*#__PURE__*/ memo(/*#__PURE__*/ named(ToastHub, 'ToastHub')) as typeof ToastHub;
