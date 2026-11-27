/**
 * BOYUT BÜTÇESİ.
 * ⚠ KURAL: bütçe **yeşile boyamak için** yükseltilmez.
 * ⚠ 38 → 42 kB (2026-08-15). Gerekçe: 38 kB, paket **~22 kB**ken konmuştu ve README hâlâ o eski
 * sayıyı yazıyordu (düzeltildi).
 * ⚠ 42 → 43 kB (2026-10-10). Ölçüm 42,05 kB: 5.1 bileşenleri (`Disclosure`, `StatusDot`, `Kbd`)
 * girişi tam sınıra getirmişti, `UiThemeScript` (5.2 — sunucu düzeninde çizilen tema betiği,
 * `themeBootScript()`in yerine) 49 B aştırdı. Sohbet ve grafikler bu bütçe yüzünden AYRI girişte;
 * ana girişe bundan sonra eklenen her bileşen önce alt girişe aday mı diye sorulur.
 */
export default [
  {
    name: 'ESM cephe (tüm paket, bileşen başına modüllerden paketlenir)',
    path: 'build/index.js',
    /*
     * ⚠ 43 → 44 kB (2026-11-07, 6.0). Ölçüm 43,29 kB: dosya başına `'use client'` ve CSS içe aktarım
     * satırları, bağlantı düğmesinin `inert` sınıfı. Tüketici bunu indirmez (yalnızca ulaşılan
     * modüller); asıl koruma aşağıdaki tek bileşen ölçümleri — 6.0'da `Button` 5,12 → 1,33 kB.
     * ⚠ 44 → 46 kB (2026-11-27, 2.0 of @handijitcom/ui). Measured 45.44 kB: the brand band (`Band`
     * with `BandBlueprint` 1.3 kB, `StatStrip` 0.4 kB, `Eyebrow` 0.3 kB alone; 3.0 renamed them
     * `BrandSurface` / `BrandBlueprint`, 45.45 kB). Asked first whether
     * they belong in a sub-entry: no. A sub-entry is ONE client bundle (`'use client'` banner),
     * while `Eyebrow` and `StatStrip` are drawn on the server and the band is the shop window's own
     * surface; per-component modules keep its cost to the page that draws it (measured below).
     * ⚠ 46 → 54 kB (2026-11-27, 3.1). Measured 52.84 kB (+7.39): `Gallery`, `TreeSelect`,
     * `NotificationCenter`, `BulkPasteInput` and the `DataTable` column menu / keyboard rows /
     * virtualization, asked for by the parts portal as subpaths of their own like every other
     * component (not a bundled sub-entry: two of them are drawn next to server components on the
     * product page). No consumer downloads this figure; each pays for its import, measured below.
     */
    limit: '54 kB',
    gzip: true,
  },
  {
    name: 'styles.css (TAM paket — 6.0: CJS ve paketleyicisiz kullanım için)',
    path: 'build/styles.css',
    /* ⚠ 24 → 25 kB (2026-11-07, 6.0). Ölçüm 24,22 kB: bileşen değişkenlerinin `var(…, varsayılan)` biçimi + `Select sm` dokunma alanı. */
    /* ⚠ 25 → 27 kB (2026-11-27, 3.1). Measured 25.59 kB: the four 3.1 stylesheets and the DataTable additions. */
    limit: '27 kB',
    gzip: true,
  },
  {
    /*
     * 6.0: bileşen modülleri `base.css`i (token'lar, sıfırlama, @keyframes) ve kendi `style.css`ini
     * içe aktarır; yalnızca `Button` kullanan sayfaya inen CSS budur. İlk ölçüm 2026-11-07.
     */
    name: 'base.css (token + taban)',
    path: 'build/base.css',
    limit: '4 kB',
    gzip: true,
  },
  {
    name: 'yalnızca Button CSS (components/Button/style.css)',
    path: 'build/components/Button/style.css',
    limit: '1.6 kB',
    gzip: true,
  },
  /* ASIL koruma: tuketici bunlari cekiyor. */
  {
    name: 'yalnızca Button (ağaç sarsma)',
    path: 'build/index.js',
    import: '{ Button }',
    limit: '5.2 kB',
    gzip: true,
  },
  /*
   * SOHBET GİRİŞİ — ana girişten AYRI ölçülür ve ana giriş içinde SAYILMAZ (`@handijitcom/ui`
   * dışsal: tüketici onu zaten indiriyor). Bütçe ilk ölçümden konur, yeşile boyamak için büyümez.
   */
  {
    name: 'chat girişi (tümü)',
    path: 'build/chat.js',
    ignore: ['@handijitcom/ui'],
    /*
     * İlk ölçüm (2026-10-10, 20 bileşen): 6,29 kB. ⚠ 8 → 13 kB (2026-10-10): `CodeBlock`ın
     * yerleşik vurgulayıcısı (30+ dil, 4,93 kB) ve biçimlendiricisi (0,43 kB) girişi 11,74 kB'a
     * taşıdı. Bedeli YALNIZCA `CodeBlock` alan öder — aşağıdaki iki ağaç sarsma ölçümü bunu tutar.
     * Karşılaştırma: tüketicinin tembel yüklediği Shiki bunun onlarca katı.
     */
    limit: '13 kB',
    gzip: true,
  },
  {
    name: 'yalnızca ChatThread (ağaç sarsma — vurgulayıcı SIZMAZ)',
    path: 'build/chat.js',
    import: '{ ChatThread }',
    ignore: ['@handijitcom/ui'],
    /* İlk ölçüm: 1,03 kB. Vurgulayıcı modül düzeyinde bir çağrıyla ayakta kalırsa buraya biner. */
    limit: '1.3 kB',
    gzip: true,
  },
  {
    name: 'yalnızca CodeBlock (vurgulayıcı + biçimlendirici)',
    path: 'build/chat.js',
    import: '{ CodeBlock }',
    ignore: ['@handijitcom/ui'],
    /* İlk ölçüm: 6,22 kB. Yeni bir dil buradan geçer. */
    limit: '7 kB',
    gzip: true,
  },
  {
    name: 'chat.css',
    path: 'build/chat.css',
    /* İlk ölçüm (2026-10-10): 3,90 kB. */
    limit: '5 kB',
    gzip: true,
  },
  /* GRAFİK GİRİŞİ — sohbet girişiyle aynı kural: ayrı ölçülür, ana girişte sayılmaz. */
  {
    name: 'charts girişi (tümü)',
    path: 'build/charts.js',
    ignore: ['@handijitcom/ui'],
    /* İlk ölçüm (2026-10-10, 10 grafik): 14,02 kB. */
    limit: '16 kB',
    gzip: true,
  },
  {
    name: 'yalnızca LineChart (ağaç sarsma)',
    path: 'build/charts.js',
    import: '{ LineChart }',
    ignore: ['@handijitcom/ui'],
    /* İlk ölçüm: 7,19 kB — ortak çekirdek (çerçeve, kartezyen geometri, eksenler) dahil. */
    limit: '8.5 kB',
    gzip: true,
  },
  {
    name: 'charts.css',
    path: 'build/charts.css',
    /* İlk ölçüm: 1,55 kB. */
    limit: '2 kB',
    gzip: true,
  },
  /* TAKVİM GİRİŞİ (2.4) — sohbet ve grafik girişleriyle aynı kural: ayrı ölçülür, ana girişte sayılmaz. */
  {
    name: 'calendar girişi (tümü)',
    path: 'build/calendar.js',
    ignore: ['@handijitcom/ui'],
    /* İlk ölçüm (2026-11-13, `Calendar` + çekirdek): 5,92 kB. */
    limit: '7 kB',
    gzip: true,
  },
  {
    name: 'calendar.css',
    path: 'build/calendar.css',
    /* İlk ölçüm: 2,05 kB. */
    limit: '2.5 kB',
    gzip: true,
  },
  {
    /* 2.4: the fixed-scale fields pull `ScaledInput` and `Input`, never the calendar. */
    name: 'yalnızca MoneyInput (ağaç sarsma)',
    path: 'build/index.js',
    import: '{ MoneyInput }',
    /* İlk ölçüm: 2,02 kB (`Input` + `ScaledInput` + okuyucu). Ana giriş 41,31 → 42,55 kB (44 kB bütçe). */
    limit: '2.5 kB',
    gzip: true,
  },
  {
    /* The brand surface pulls only its recipe numbers from the design entry, never the palette. */
    name: 'only BrandSurface (tree shaking)',
    path: 'build/index.js',
    import: '{ BrandSurface, BrandBlueprint }',
    /* First measurement (2026-11-27): 1.4 kB. */
    limit: '1.8 kB',
    gzip: true,
  },
  {
    name: 'only BrandSurface CSS (components/BrandSurface/style.css)',
    path: 'build/components/BrandSurface/style.css',
    /* First measurement (2026-11-27): 0.78 kB. */
    limit: '1 kB',
    gzip: true,
  },
  /*
   * 3.1 — the parts portal's components. Each is its own module and subpath; what a page pays is the
   * component it imports (measured below), never the four together. First measurements 2026-11-27.
   */
  {
    name: 'only DataTable (3.1: column menu, keyboard rows, virtualization)',
    path: 'build/index.js',
    import: '{ DataTable }',
    /* First measurement: 6.53 kB — the column menu pulls `Popover`, `Checkbox` and `IconButton`. */
    limit: '7.5 kB',
    gzip: true,
  },
  {
    name: 'only Gallery (tree shaking)',
    path: 'build/index.js',
    import: '{ Gallery }',
    /* First measurement: 3.38 kB. */
    limit: '4 kB',
    gzip: true,
  },
  {
    name: 'only TreeSelect (tree shaking)',
    path: 'build/index.js',
    import: '{ TreeSelect }',
    /* First measurement: 2.61 kB. */
    limit: '3.2 kB',
    gzip: true,
  },
  {
    name: 'only NotificationCenter (tree shaking)',
    path: 'build/index.js',
    import: '{ NotificationCenter }',
    /* First measurement: 5.71 kB (`Popover`, `Button`, `IconButton`). */
    limit: '6.5 kB',
    gzip: true,
  },
  {
    name: 'only BulkPasteInput (tree shaking)',
    path: 'build/index.js',
    import: '{ BulkPasteInput }',
    /* First measurement: 2.04 kB (`Textarea` + the parser). */
    limit: '2.5 kB',
    gzip: true,
  },
  {
    /* The parser alone: a server action pays for no React component. */
    name: 'only parseBulkPaste (tree shaking)',
    path: 'build/index.js',
    import: '{ parseBulkPaste }',
    /* First measurement: 0.52 kB. */
    limit: '0.7 kB',
    gzip: true,
  },
  {
    name: 'yalnızca Badge (ağaç sarsma)',
    path: 'build/index.js',
    import: '{ Badge }',
    limit: '4.5 kB',
    gzip: true,
  },
];
