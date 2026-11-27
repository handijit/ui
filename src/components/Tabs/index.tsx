'use client';

import {
  type FC,
  type KeyboardEvent,
  memo,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { isDefined } from '@handijitcom/utils';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { scrollIntoInlineView } from '../../helpers/scroll.helper';
import IconButton from '../IconButton';

import styles from './index.module.scss';

export type TabItem = {
  id: string;
  label: string;
  /** Etiketin yanında gösterilen sayı. */
  count?: number;
  /** Sekmenin paneli. */
  content?: ReactNode;
};

type Props = {
  items: TabItem[];
  /** Kontrolsüz kullanımda açılışta seçili sekme. */
  defaultTabId?: string;
  /** Kontrollü kullanım: seçili sekme çağıranın durumunda. */
  activeId?: string;
  onChange?: (id: string) => void;
  /** Sekme çubuğunun erişilebilir adı. */
  ariaLabel?: string;
  /** Ok tuşu yalnızca ODAĞI taşır; seçim `Enter`/`Space` ile yapılır. */
  isManualActivation?: boolean;
  className?: string;
  testId?: string;
};

/** Width (px) of the edge fade over a strip that scrolls; the selected tab is kept clear of it. */
const EDGE_FADE = 24;

/** Sekmeler. */
const Tabs: FC<Props> = ({
  items,
  defaultTabId,
  activeId: controlledId,
  onChange,
  ariaLabel,
  isManualActivation,
  className,
  testId,
}) => {
  const baseId = useId();
  const [uncontrolledId, setUncontrolledId] = useState(defaultTabId ?? items[0]?.id);

  const isControlled = isDefined(controlledId);
  const activeId = isControlled ? controlledId : uncontrolledId;

  const activeIndex = items.findIndex(item => item.id === activeId);
  /* Manuel kipte ODAKLANAN sekme ile SECILI sekme ayrisir. */
  const [focusIndex, setFocusIndex] = useState(activeIndex < 0 ? 0 : activeIndex);
  const listRef = useRef<HTMLDivElement>(null);
  const active = items[activeIndex] ?? items[0];

  /*
   * 1. COKME: `items` kisaldiginda indeks kirpilmiyordu.
   * ⚠ `focusIndex` HAM OKUNMAZ — iki ayri ariza uretiyordu.
   */
  const safeFocusIndex =
    focusIndex >= 0 && focusIndex < items.length ? focusIndex : Math.max(activeIndex, 0);

  useEffect(() => {
    /* Secim degistiginde odak da ona hizalanir. */
    setFocusIndex(activeIndex < 0 ? 0 : activeIndex);
  }, [activeIndex]);

  /*
   * SECILI SEKME GORUNURE KAYDIRILIR — yalnizca SERIT kayar (3.2.1).
   * ⚠ 3.2.0'a dek `scrollIntoView` kullaniliyordu ve mount'ta atlaniyordu: o cagri SAYFAYI da
   * kaydiriyordu (ekranin altindaki bir serit ilk boyamada sayfayi asagi cekiyordu). Seridin kendi
   * `scrollLeft`i sayfaya dokunmaz; secili sekme ilk boyamada da gorunur, solmanin altinda kalmaz.
   */
  useEffect(() => {
    const list = listRef.current;
    scrollIntoInlineView(list, list?.querySelector('[aria-selected="true"]'), EDGE_FADE);
  }, [activeId]);

  /* Hangi ucta gizli sekme var: solma ve kaydirma dugmesi YALNIZCA o uca cizilir. */
  const [hiddenEdges, setHiddenEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      /* RTL'de `scrollLeft` negatif; onemli olan baslangica UZAKLIK. 1 px kesirli yerlesim payi. */
      const offset = Math.abs(list.scrollLeft);
      const start = offset > 1;
      const end = offset + list.clientWidth < list.scrollWidth - 1;
      setHiddenEdges(prev => (prev.start === start && prev.end === end ? prev : { start, end }));
    };

    measure();
    list.addEventListener('scroll', measure, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(list);

    return () => {
      list.removeEventListener('scroll', measure);
      observer?.disconnect();
    };
  }, [items]);

  /** Seridi bir ekranin ucte ikisi kadar kaydirir; `direction` 1 sona, -1 basa dogru. */
  const scrollBy = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;

    const isRtl = getComputedStyle(list).direction === 'rtl';
    list.scrollLeft += direction * (isRtl ? -1 : 1) * Math.round((list.clientWidth * 2) / 3);
  };

  const select = (id: string) => {
    if (!isControlled) setUncontrolledId(id);
    onChange?.(id);
  };

  /** Ok tuşlarıyla gezinme; başta/sonda döner. */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (isManualActivation && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      const focused = items[safeFocusIndex];
      if (focused) select(focused.id);
      return;
    }

    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (offset === 0) return;

    event.preventDefault();
    const next =
      ((isManualActivation ? safeFocusIndex : activeIndex) + offset + items.length) % items.length;

    setFocusIndex(next);
    if (!isManualActivation) select(items[next].id);

    /*
     * Odak HER IKI kipte de tasinir: manuel kipte seciliyle odaklanan sekme ayrisiyor ve `tabindex`
     * odaklanani izlemek zorunda.
     */
    document.getElementById(`${baseId}-tab-${items[next].id}`)?.focus();
  };

  if (items.length === 0) return null;

  /*
   * Panelsiz kullanimda `aria-controls` VERILMEZ: var olmayan bir kimligi isaret etmek ekran
   * okuyucuda kirik bir bag uretir.
   */
  const hasPanel = isDefined(active?.content);

  /*
   * Kaydirma dugmeleri FARE icin (dokunmatikte CSS gizler, parmak seridi kaydirir). Klavye ok
   * tuslariyla gezer ve secili sekme kendiliginden gorunur: dugmeler sekme sirasina girmez ve ekran
   * okuyucudan gizlidir.
   */
  const scrollButton = (direction: 1 | -1) => (
    <IconButton
      icon={
        direction < 0 ? (
          <ChevronLeft aria-hidden className={styles.tabs__scrollIcon} />
        ) : (
          <ChevronRight aria-hidden className={styles.tabs__scrollIcon} />
        )
      }
      label=""
      size="sm"
      variant="secondary"
      shape="round"
      tabIndex={-1}
      aria-hidden
      className={cx(
        styles.tabs__scroll,
        styles[`tabs__scroll--${direction < 0 ? 'start' : 'end'}`],
      )}
      onClick={() => scrollBy(direction)}
    />
  );

  return (
    <div className={cx(styles.tabs, className)} data-testid={testId}>
      <div
        className={styles.tabs__bar}
        data-fade-start={hiddenEdges.start ? '' : undefined}
        data-fade-end={hiddenEdges.end ? '' : undefined}
      >
        <div
          ref={listRef}
          className={styles.tabs__list}
          role="tablist"
          aria-label={ariaLabel}
          onKeyDown={handleKeyDown}
        >
          {items.map(item => {
            const isActive = item.id === active.id;

            return (
              <button
                key={item.id}
                id={`${baseId}-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                /* ⚠ YALNIZCA SECILI SEKMEDE. */
                aria-controls={isActive && hasPanel ? `${baseId}-panel-${item.id}` : undefined}
                // Yalnızca seçili sekme sekme sırasında; gezinme ok tuşlarıyla.
                /*
                 * Donen `tabindex` ODAKLANANI izler: manuel kipte secili sekme ile odaklanan sekme
                 * ayri ve Tab'in geri donecegi yer odaklanan olmali.
                 */
                tabIndex={
                  (isManualActivation ? items[safeFocusIndex]?.id === item.id : isActive) ? 0 : -1
                }
                className={cx(styles.tabs__tab, isActive && styles['tabs__tab--active'])}
                onClick={() => select(item.id)}
              >
                {item.label}
                {isDefined(item.count) && <span className={styles.tabs__count}>{item.count}</span>}
              </button>
            );
          })}
        </div>
        {hiddenEdges.start && scrollButton(-1)}
        {hiddenEdges.end && scrollButton(1)}
      </div>

      {hasPanel && (
        <div
          id={`${baseId}-panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active.id}`}
          className={styles.tabs__panel}
          tabIndex={0}
        >
          {active.content}
        </div>
      )}
    </div>
  );
};

export default /*#__PURE__*/ memo(Tabs) as typeof Tabs;
