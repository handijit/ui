import type { ThemeName, ThemePreference } from '@handijitcom/ui/design';

import type { UiLinkComponent } from '@/types/link.type';

/**
 * Sayı biçimlendiricileri: değere bağlı metinler dizeyle verilemez.
 * ⚠ `helpers/label.helper.ts` de aynı imzayı ELLE taşıyordu.
 */
export type Formatter<TArgs extends unknown[]> = (...args: TArgs) => string;

/**
 * The user's CHOICE. `system` = no explicit choice, the operating system's setting is followed.
 * The same union as `ThemePreference` of `@handijitcom/ui/design`.
 */
export type UiColorPreference = ThemePreference;

/** The RESOLVED theme — the one actually drawn. The same union as design's `ThemeName`. */
export type UiColorScheme = ThemeName;

export type UiContextValue = {
  /** Tüketicinin yönlendiricisi (`next/link`, `react-router`ın `Link`i…). */
  linkComponent?: UiLinkComponent;
  /**
   * Arayüz metinleri.
   * ⚠ Referans bir dönem `theme/labels.ts`yi gösteriyordu; o dosya yalnızca tek satırlık bir başlık
   * yorumu taşıyordu (sıfır export, sıfır…
   */
  labels?: UiLabels;
};

export type UiLabels = Partial<{
  /** Kip pencere ve alt sayfanın kapatma düğmesi. `Modal`, `BottomSheet`. */
  close: string;
  /**
   * Bildirim yığınının bölge adı ("Bildirimler"). `ToastHub`.
   * ⚠ Yığın bir `role="region"` ve `aria-live` bölgesi; adsız bir bölge ekran okuyucuda yalnızca
   * "bölge" diye okunur.
   */
  notifications: string;
  /** Vazgeçme eylemi. `ConfirmDialog`, `PromptDialog`. */
  cancel: string;
  /** Kaydetme/gönderme eylemi. `PromptDialog`. */
  submit: string;
  /** Bekleme göstergesinin ekran okuyucu metni. `Spinner`. */
  loading: string;
  /** Zorunlu alanın yıldızının yanındaki okunabilir karşılık. `Field`. */
  required: string;
  /** Filtre şeridinin erişilebilir adı. `FilterBar`. */
  filters: string;
  /** Kırıntı yolunun gezinme bölgesi adı. `Breadcrumb`. */
  breadcrumb: string;
  /**
   * The "…" button that unfolds a long trail on a narrow screen ("Tüm yolu göster"). `Breadcrumb`
   * (3.2.1). Optional: without it the button is named by the crumbs it hides.
   */
  breadcrumbExpand: string;
  /** Alfabe atlama şeridinin gezinme bölgesi adı. `DirectoryJump`. */
  directoryJump: string;
  /** Seçim yokken `Select` tetikleyicisinde görünen metin. */
  selectPlaceholder: string;

  /** Şifreyi görünür kılan düğmenin erişilebilir adı. `PasswordInput`. */
  passwordShow: string;
  /** Şifreyi gizleyen düğmenin erişilebilir adı. `PasswordInput`. */
  passwordHide: string;

  /** Baş harf büyütmesinde kullanılacak dil etiketi. `Avatar`. */
  locale: string;

  /** Para birimi simgesi ya da kodu. `Price`. */
  currency: string;

  combobox: Partial<{
    searchPlaceholder: string;
    emptyMessage: string;
    loadingMessage: string;
    clearLabel: string;
  }>;

  pagination: Partial<{
    /** Gezinme bölgesinin adı ("Sayfalar"). */
    label: string;
    previous: string;
    next: string;
  }>;

  quantity: Partial<{
    label: string;
    decrease: string;
    increase: string;
  }>;

  range: Partial<{
    /** Alt kulbun ad eki ("En az"). */
    min: string;
    /** Üst kulbun ad eki ("En çok"). */
    max: string;
  }>;

  dataTable: Partial<{
    empty: string;
    loading: string;
    /** The column menu: its trigger and panel name ("Sütunlar"), 3.1. */
    columns: string;
    /** Moves a column one place earlier, e.g. `column => column + ' sütununu öne al'` (3.1). */
    moveUp: Formatter<[column: string]>;
    /** Moves a column one place later, e.g. `column => column + ' sütununu geri al'` (3.1). */
    moveDown: Formatter<[column: string]>;
  }>;

  /** `Gallery` (3.1). */
  gallery: Partial<{
    /** The thumbnail strip's name ("Görseller"). */
    thumbnails: string;
    /** One thumbnail, e.g. `(index, total) => 'Görsel ' + index + ' / ' + total`. */
    thumbnail: Formatter<[index: number, total: number]>;
    previous: string;
    next: string;
    /** Opens the full-screen view ("Tam ekran"). */
    fullscreen: string;
    zoomIn: string;
    zoomOut: string;
  }>;

  /** `TreeSelect` (3.1). */
  treeSelect: Partial<{
    /** The search field's name and placeholder ("Kategori ara"). */
    search: string;
    /** No node matches the search ("Eşleşen kategori yok"). */
    empty: string;
  }>;

  /** `NotificationCenter` (3.1). */
  notificationCenter: Partial<{
    /** The bell, e.g. `unread => unread ? 'Bildirimler, ' + unread + ' okunmamış' : 'Bildirimler'`. */
    trigger: Formatter<[unread: number]>;
    /** The panel's title ("Bildirimler"). */
    title: string;
    markAllRead: string;
    markRead: string;
    /** No notification at all ("Bildirim yok"). */
    empty: string;
    /** Read before an unread notification's title ("Okunmamış"): the dot is not read. */
    unread: string;
    /** Day headings of today and yesterday ("Bugün", "Dün"); older days use the date. */
    today: string;
    yesterday: string;
  }>;

  /** `AppShell`, its navigation and `UserMenu` (3.2). */
  appShell: Partial<{
    /** The first link of the page, shown on focus ("İçeriğe atla"). */
    skipToContent: string;
    /** The navigation landmark and the narrow-window drawer's title ("Ana menü"). */
    navigation: string;
    /** The menu button of a narrow window ("Menüyü aç"). */
    openNavigation: string;
    /** The sidebar toggle while expanded ("Kenar çubuğunu daralt"). */
    collapse: string;
    /** The sidebar toggle while collapsed to icons ("Kenar çubuğunu genişlet"). */
    expand: string;
    /** A link's count, read after its name, e.g. `count => count + ' yeni'`. */
    badge: Formatter<[count: number]>;
    /** The account menu's name ("Hesap"). `UserMenu`. */
    userMenu: string;
  }>;

  /** `FacetSidebar` and `FacetSection` (3.4). */
  facets: Partial<{
    /** The sidebar's name and the drawer's title ("Filtreler"). */
    title: string;
    /** Clears every filter ("Tümünü temizle"). */
    clearAll: string;
    /** Clears one section ("Temizle"). */
    clear: string;
    /** The drawer's apply button when the call passes no `applyLabel` ("Sonuçları göster"). */
    apply: string;
    /** Applies a min/max range ("Uygula"). */
    applyRange: string;
    /** Unfolds a long list, e.g. `count => count + ' seçenek daha'`. */
    showMore: Formatter<[count: number]>;
    /** Folds it back ("Daha az göster"). */
    showLess: string;
    /** The search field of a long list, e.g. `title => title + ' içinde ara'`. */
    search: Formatter<[title: string]>;
    /** No option matches the search, e.g. `term => '“' + term + '” için sonuç yok'`. */
    noMatch: Formatter<[term: string]>;
    /** Read after a section's title, e.g. `count => count + ' seçili'`: the badge is not read. */
    selected: Formatter<[count: number]>;
  }>;

  /** `AppliedFilters` (3.4). */
  appliedFilters: Partial<{
    /** The strip's name and its lead ("Uygulanan filtreler"). */
    title: string;
    /** One chip, e.g. `(group, value) => group + ': ' + value + ' filtresini kaldır'`. */
    remove: Formatter<[group: string, value: string]>;
    clearAll: string;
    /** Filters without a chip, e.g. `count => '+' + count + ' filtre daha'`. */
    more: Formatter<[count: number]>;
  }>;

  /** `FilterToolbar` (3.4). */
  filterToolbar: Partial<{
    /** The narrow-screen button that opens the filters ("Filtrele"). */
    filter: string;
    /** Read after it, e.g. `count => count + ' filtre uygulandı'`. */
    activeFilters: Formatter<[count: number]>;
    sort: string;
    /** The view switch's name and its two options ("Görünüm", "Tablo", "Kartlar"). */
    view: string;
    viewTable: string;
    viewCards: string;
    /** The density switch ("Yoğunluk", "Rahat", "Sıkı"). */
    density: string;
    densityComfortable: string;
    densityCompact: string;
    /** The page size select's name ("Sayfa başına"). */
    pageSize: string;
    /** One page size, e.g. `size => size + ' / sayfa'`. */
    perPage: Formatter<[size: number]>;
  }>;

  /** `SortableList` (3.4). Positions are 1-based. */
  sortableList: Partial<{
    /** Read once by the handles, e.g. "Boşluk ile tutun, oklarla taşıyın, Boşluk ile bırakın, Escape ile vazgeçin." */
    instructions: string;
    /** A handle's name, e.g. `item => item + ' öğesini taşı'`. */
    handle: Formatter<[item: string]>;
    grabbed: Formatter<[item: string, position: number, total: number]>;
    moved: Formatter<[item: string, position: number, total: number]>;
    dropped: Formatter<[item: string, position: number, total: number]>;
    cancelled: Formatter<[item: string]>;
  }>;

  /** `CompareTray` (3.4). */
  compareTray: Partial<{
    /** The tray's name and title ("Karşılaştırma listesi"). */
    title: string;
    /** e.g. `(count, max) => count + '/' + max`. */
    count: Formatter<[count: number, max: number]>;
    /** e.g. `item => item + ' ürününü karşılaştırmadan çıkar'`. */
    remove: Formatter<[item: string]>;
    clear: string;
    /** e.g. `count => 'Karşılaştır (' + count + ')'`. */
    compare: Formatter<[count: number]>;
    /** Why compare is disabled, e.g. `min => 'En az ' + min + ' ürün seçin'`. */
    needMore: Formatter<[min: number]>;
  }>;

  /** `ProductCarousel` (3.4). */
  productCarousel: Partial<{
    /** e.g. `title => title + ': önceki ürünler'`. */
    previous: Formatter<[title: string]>;
    next: Formatter<[title: string]>;
    /** The rail's "see all" link ("Tümünü gör"). */
    seeAll: string;
  }>;

  /** `MegaMenu` (3.4). */
  megaMenu: Partial<{
    /** The navigation landmark's name ("Kategoriler"). */
    navigation: string;
    /** The narrow-screen drawer's title ("Menü"). */
    menu: string;
    /** The panel's link to the whole category, e.g. `label => 'Tüm ' + label`. */
    seeAll: Formatter<[label: string]>;
  }>;

  /** `BulkPasteInput` (3.1). */
  bulkPaste: Partial<{
    /** Parsed rows, e.g. `count => count + ' satır okundu'`. */
    summary: Formatter<[count: number]>;
    /** Lines that could not be read, e.g. `count => count + ' satır okunamadı'`. */
    invalidSummary: Formatter<[count: number]>;
    /** A line number, e.g. `line => 'Satır ' + line`. */
    line: Formatter<[line: number]>;
    /** Why a line was skipped. */
    missingCode: string;
    invalidQuantity: string;
  }>;

  /**
   * Sohbet bileşenleri (`@handijitcom/ui/chat`). Çağrı yerine ÖZGÜ metinler buraya girmez:
   * `PromptInput.placeholder`, `ReasoningBlock.summary`, `ToolCall.name`.
   */
  chat: Partial<{
    /** Sohbet akışının bölge adı ("Sohbet"). `ChatThread`. */
    thread: string;
    /** Gönder düğmesi. `PromptInput`. */
    send: string;
    /** Akışı durdur düğmesi. `PromptInput`. */
    stop: string;
    /** Kullanıcı yukarı kaydırınca beliren düğme ("En yeniye in"). `ChatThread`. */
    scrollToLatest: string;
    /** Yanıt tamamlandığında duyurulan cümle ("Yanıt hazır"). `ChatThread`. */
    replyReady: string;
    /** Mesaj eylemleri araç çubuğunun adı. `MessageActions`. */
    messageActions: string;
    /** Kaynak listesinin adı ("Kaynaklar"). `SourceList`. */
    sources: string;
    /** Atıf numarasının okunan adı, örn. `n => 'Kaynak ' + n`. `Citation`. */
    citation: Formatter<[index: number]>;
    /** stderr satırının önündeki gizli işaret ("hata çıktısı"): renk tek başına anlam taşımaz. */
    stderr: string;
    /** Araç çağrısının durum metinleri. `ToolCall`. */
    toolStatus: Partial<Record<'running' | 'ok' | 'error' | 'aborted' | 'interrupted', string>>;
    /** Kod bloğunu kopyalama düğmesi, örn. `language => language + ' kodunu kopyala'`. `CodeBlock`. */
    codeCopy: Formatter<[language: string]>;
    /** Kopyalandıktan sonra duyurulan cümle. `CodeBlock`. */
    codeCopied: string;
  }>;

  /** The calendar (`@handijitcom/ui/calendar`, 2.4). */
  calendar: Partial<{
    /**
     * How the keyboard works, read when the calendar is entered, e.g. "Oklarla etkinlikler
     * arasında gezinin, Enter ile açın; ⌘ ve oklarla taşıyın, ⌘ ⇧ ↑ ↓ ile kısaltıp uzatın."
     */
    instructions: string;
    /** Read before a cancelled event's title ("İptal"): the strike-through is not read. */
    cancelled: string;
    /** The rest of a month cell's events, e.g. `count => '+' + count + ' daha'`. */
    more: Formatter<[count: number]>;
    /** Announced when a keyboard move stands, e.g. `(title, when) => title + ' taşındı: ' + when`. */
    moved: Formatter<[title: string, when: string]>;
  }>;

  copyField: Partial<{
    /** Kopyalama düğmesinin adı. */
    copy: Formatter<[value: string]>;
    copied: Formatter<[value: string]>;
    announcement: string;
  }>;

  /**
   * Dosya yukleme.
   * ⚠ `tooLarge` bir BICIMLENDIRICI: mesaj dosya adini ve siniri TASIMALI.
   */
  fileUpload: Partial<{
    tooLarge: Formatter<[name: string, max: string]>;
    /** Yukleme sirasindaki ekran okuyucu duyurusu. */
    uploading: Formatter<[name: string]>;
    /** Dosya secildiginde yapilan duyuru. */
    added: Formatter<[count: number]>;
  }>;

  /**
   * Sayisal gostergenin YON metni.
   * ⚠ Uc deger de SR-ONLY: ok isareti gorsel bir sinyal ve ekran okuyucuya hicbir sey soylemiyor.
   */
  stat: Partial<{
    increase: string;
    decrease: string;
    unchanged: string;
  }>;

  /** Adim gostergesinin DURUM metinleri — hepsi sr-only. */
  steps: Partial<{
    completed: string;
    current: string;
    upcoming: string;
  }>;

  /** Zaman cizelgesinin DURUM metinleri — hepsi sr-only. */
  timeline: Partial<{
    completed: string;
    current: string;
    failed: string;
  }>;

  /** Etiket girisi. `removed` bir bicimlendirici: hangi etiketin kalktigi. */
  tagInput: Partial<{
    added: Formatter<[value: string]>;
    removed: Formatter<[value: string]>;
    /** The typed tag is already in the list (2.2), e.g. `value => value + ' zaten ekli'`. */
    duplicate: Formatter<[value: string]>;
  }>;

  rating: Partial<{
    /** Yıldızların ekran okuyucu karşılığı ("5 üzerinden 4,5 — 12 değerlendirme"). */
    srLabel: Formatter<[value: number, count: number | undefined]>;
    /** Puan girişinde yıldız sayısı ("4 yıldız"). */
    starCount: Formatter<[star: number]>;
    /** Beş puanın anlamı. */
    scale: Record<1 | 2 | 3 | 4 | 5, string>;
  }>;
}>;

export type UiThemeState = {
  /**
   * ÇÖZÜLMÜŞ tema — ekranda çizili olan. `preference` `system` iken bu alan işletim sisteminin o
   * anki tercihini taşır.
   */
  scheme: UiColorScheme;
  /** Kullanıcının SEÇİMİ. */
  preference: UiColorPreference;
  /** `'system'` verildiğinde AÇIK seçim silinir ve sistem tercihi izlenir. */
  setScheme: (preference: UiColorPreference) => void;
  /** Açık ↔ koyu. `system` iken ÇÖZÜLMÜŞ değerin tersine geçer. */
  toggle: () => void;
  /** Sunucu çıktısında ve hidrasyondan önceki ilk karede `false`. */
  isReady: boolean;
};
