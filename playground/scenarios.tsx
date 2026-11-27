import { type ReactElement } from 'react';

import {
  ArrowRepeat,
  ArrowUp,
  Clipboard,
  HeartFill,
  HouseFill,
  MoonStarsFill,
  StarFill,
  TerminalFill,
  TrashFill,
  ZoomIn,
} from 'react-bootstrap-icons';

import { logos } from '../src/design';
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  BrandBlueprint,
  BrandSurface,
  BottomSheet,
  Breadcrumb,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardMedia,
  CardOverlay,
  Carousel,
  Checkbox,
  Chip,
  ChipGroup,
  CodeBadge,
  Combobox,
  CommandPalette,
  ConfirmDialog,
  ContextMenu,
  CopyField,
  DataTable,
  DataTableRow,
  DateField,
  DateRange,
  Directory,
  DirectoryGroup,
  DirectoryJump,
  DirectoryRow,
  Disclosure,
  Divider,
  Eyebrow,
  Drawer,
  EmptyState,
  Field,
  FileUpload,
  FilterBar,
  FilterBarField,
  UiProvider,
  UiThemeScript,
  IconButton,
  Input,
  MoneyInput,
  Kbd,
  Menu,
  Modal,
  PageHeader,
  Pagination,
  Panel,
  PanelForm,
  PanelRow,
  PasswordInput,
  PercentInput,
  Popover,
  Price,
  Progress,
  ProgressCircle,
  PromptDialog,
  QuantityInput,
  QuantityStepper,
  Radio,
  RadioCard,
  RangeSlider,
  Rating,
  RateInput,
  RatingInput,
  ScaledInput,
  ScrollArea,
  SectionHeader,
  SegmentedControl,
  Select,
  Skeleton,
  SkeletonCard,
  SkeletonRows,
  SkeletonTable,
  Spinner,
  Stat,
  StatusDot,
  Steps,
  SummaryCard,
  Switch,
  Table,
  TableCheckbox,
  StatStrip,
  TableScroller,
  Tabs,
  TagInput,
  Textarea,
  TextLink,
  Tile,
  Timeline,
  toast,
  ToastHub,
  ToastPortal,
  Tooltip,
  type DataTableColumn,
  type UiLabels,
  UISize,
  UIVariant,
} from '../src/index';
import {
  ActionList,
  ActionListItem,
  AppBar,
  ChatMessage,
  ChatThread,
  Citation,
  CodeBlock,
  DescriptionList,
  Legend,
  MessageActions,
  PromptInput,
  PromptSuggestions,
  Prose,
  ReasoningBlock,
  ReasoningText,
  SegmentBar,
  SourceList,
  TerminalOutput,
  ToolCall,
  ToolCallSection,
} from '../src/chat';
import {
  AreaChart,
  BarChart,
  BoxPlot,
  ComposedChart,
  Heatmap,
  Histogram,
  LineChart,
  PieChart,
  RadarChart,
  ScatterPlot,
} from '../src/charts';
import { Calendar, type CalendarDay, type CalendarEvent } from '../src/calendar';

import { SOLO_ONLY } from './solo';

/** GALERİ DEFTERİ — görsel dilin tek görüldüğü yer. */

export const LABELS: UiLabels = {
  close: 'Kapat',
  notifications: 'Bildirimler',
  cancel: 'Vazgeç',
  submit: 'Kaydet',
  loading: 'Yükleniyor',
  required: 'zorunlu',
  filters: 'Filtreler',
  breadcrumb: 'Yol',
  directoryJump: 'Harfe atla',
  selectPlaceholder: 'Seçin',
  locale: 'tr-TR',
  currency: 'TL',
  combobox: {
    searchPlaceholder: 'Ara',
    emptyMessage: 'Sonuç yok',
    loadingMessage: 'Aranıyor',
    clearLabel: 'Temizle',
  },
  pagination: { label: 'Sayfalar', previous: 'Önceki', next: 'Sonraki' },
  quantity: { label: 'Adet', decrease: 'Azalt', increase: 'Artır' },
  range: { min: 'En az', max: 'En çok' },
  dataTable: { empty: 'Kayıt yok', loading: 'Yükleniyor' },
  copyField: {
    copy: value => `${value} kopyala`,
    copied: value => `${value} kopyalandı`,
    announcement: 'Kopyalandı',
  },
  calendar: {
    instructions:
      'Oklarla etkinlikler arasında gezinin, Enter ile açın; ⌘ ve oklarla taşıyın, ⌘ ⇧ ↑ ↓ ile kısaltıp uzatın.',
    cancelled: 'İptal',
    more: count => `+${count} daha`,
    moved: (title, when) => `${title} taşındı: ${when}`,
  },
  rating: {
    srLabel: (value, count) => `5 üzerinden ${value}${count ? ` — ${count} değerlendirme` : ''}`,
    starCount: star => `${star} yıldız`,
    scale: { 1: 'Çok kötü', 2: 'Kötü', 3: 'Orta', 4: 'İyi', 5: 'Çok iyi' },
  },
};

const OPTIONS = [
  { value: 'a', label: 'Birinci seçenek' },
  { value: 'b', label: 'İkinci seçenek', description: 'Ayırt edici satır' },
  { value: 'c', label: 'Üçüncü seçenek' },
];

const COLUMNS: DataTableColumn[] = [
  { key: 'code', label: 'Kod' },
  { key: 'name', label: 'Ad' },
  { key: 'actions', srLabel: 'Eylemler' },
];

const noop = () => {};

/* Takvim: bir hafta (Pazartesi 9 Kasım 2026'dan), iki derslik ve bir ay. Günler ÇAĞIRANDAN gelir. */
const WEEK_DAYS: CalendarDay[] = [
  ['2026-11-09', 'Pazartesi 9 Kasım', 'Pzt 9'],
  ['2026-11-10', 'Salı 10 Kasım', 'Sal 10'],
  ['2026-11-11', 'Çarşamba 11 Kasım', 'Çar 11'],
  ['2026-11-12', 'Perşembe 12 Kasım', 'Per 12'],
  ['2026-11-13', 'Cuma 13 Kasım', 'Cum 13'],
  ['2026-11-14', 'Cumartesi 14 Kasım', 'Cmt 14'],
  ['2026-11-15', 'Pazar 15 Kasım', 'Paz 15'],
].map(([date, label, shortLabel], index) => ({
  date,
  label,
  shortLabel,
  isToday: index === 4,
  isOff: index >= 5,
}));

const LESSONS: CalendarEvent[] = [
  {
    id: 'l1',
    title: 'İngilizce B1',
    start: '2026-11-09T09:00',
    end: '2026-11-09T10:30',
    resourceId: 'r1',
  },
  {
    id: 'l2',
    title: 'Matematik 8',
    start: '2026-11-09T10:00',
    end: '2026-11-09T11:00',
    resourceId: 'r2',
    tone: 'info',
  },
  {
    id: 'l3',
    title: 'Almanca A2',
    start: '2026-11-10T13:00',
    end: '2026-11-10T14:30',
    resourceId: 'r1',
    tone: 'info',
  },
  {
    id: 'l4',
    title: 'Fizik 11',
    start: '2026-11-11T09:30',
    end: '2026-11-11T11:00',
    resourceId: 'r2',
    tone: 'ink',
  },
  {
    id: 'l5',
    title: 'Kimya 10',
    start: '2026-11-11T10:00',
    end: '2026-11-11T11:30',
    resourceId: 'r2',
    isCancelled: true,
  },
  {
    id: 'l6',
    title: 'Türkçe 7',
    start: '2026-11-13T15:00',
    end: '2026-11-13T16:00',
    resourceId: 'r1',
    isLocked: true,
    tone: 'neutral',
  },
];

const ROOMS = [
  { id: 'r1', label: 'Derslik 1' },
  { id: 'r2', label: 'Derslik 2' },
];

/* Kasım 2026 Pazartesi başlangıçlı altı satır: 26 Ekim – 6 Aralık. */
const MONTH_DAYS: CalendarDay[] = [
  ...Array.from({ length: 6 }, (_, index) => ['10', 'Ekim', 26 + index] as const),
  ...Array.from({ length: 30 }, (_, index) => ['11', 'Kasım', 1 + index] as const),
  ...Array.from({ length: 6 }, (_, index) => ['12', 'Aralık', 1 + index] as const),
].map(([month, monthName, number], index) => ({
  date: `2026-${month}-${String(number).padStart(2, '0')}`,
  label: `${number} ${monthName}`,
  shortLabel: String(number),
  isOutside: month !== '11',
  isOff: index % 7 >= 5,
  isToday: month === '11' && number === 13,
}));

const DUES: CalendarEvent[] = [
  { id: 'd1', title: 'Kira', start: '2026-11-05T00:00', end: '2026-11-05T00:00', tone: 'danger' },
  {
    id: 'd2',
    title: 'Çek 0042',
    start: '2026-11-12T00:00',
    end: '2026-11-12T00:00',
    tone: 'ink',
  },
  {
    id: 'd3',
    title: 'Tahsilat — Yıldız Ltd.',
    start: '2026-11-12T00:00',
    end: '2026-11-12T00:00',
    tone: 'info',
  },
  { id: 'd4', title: 'Senet 12', start: '2026-11-12T00:00', end: '2026-11-12T00:00' },
  { id: 'd5', title: 'Elektrik', start: '2026-11-12T00:00', end: '2026-11-12T00:00' },
];

const MONTHLY = [
  'Oca',
  'Şub',
  'Mar',
  'Nis',
  'May',
  'Haz',
  'Tem',
  'Ağu',
  'Eyl',
  'Eki',
  'Kas',
  'Ara',
].map((month, index) => ({
  month,
  revenue: Math.round(120 + 60 * Math.sin(index / 2) + index * 9),
  cost: Math.round(90 + 30 * Math.cos(index / 3) + index * 4),
  rate: Math.round((2.4 + Math.sin(index) * 0.8) * 10) / 10,
}));

/**
 * Tohumlu sözde rastgele dizi — galeri ve görsel taban çizgisi her koşuda AYNI veriyi çizer.
 * `Math.random` taban çizgisini her koşuda kırardı.
 */
const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

/** Yaklaşık normal dağılım (on iki tekdüze örneğin toplamı). */
const normal = (next: () => number, mean: number, spread: number) =>
  mean + (Array.from({ length: 12 }, next).reduce((sum, value) => sum + value, 0) - 6) * spread;

const DELIVERY_DAYS = (() => {
  const next = seeded(7);
  return Array.from({ length: 240 }, () =>
    Math.max(0.5, Math.round(normal(next, 3.2, 1.1) * 10) / 10),
  );
})();

const CARRIER_DAYS = ['Aras', 'Yurtiçi', 'MNG', 'PTT'].map((label, index) => {
  const next = seeded(11 + index);
  const values = Array.from(
    { length: 60 },
    () => Math.round(normal(next, 2.4 + index * 0.6, 0.5 + index * 0.15) * 10) / 10,
  );
  /* Her grupta birkaç gerçek aykırı: bıyıkların gözleme oturduğu görünsün. */
  return { id: label.toLowerCase(), label, values: [...values, 6.8 + index, 0.4] };
});

const HOURS = ['00', '03', '06', '09', '12', '15', '18', '21'];
const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const ORDERS_BY_HOUR = WEEKDAYS.map((_, day) =>
  HOURS.map((__, hour) =>
    day === 6 && hour === 1
      ? null
      : Math.round(
          20 +
            80 * Math.max(0, Math.sin(((hour - 1.5) / 7) * Math.PI)) +
            (day >= 5 ? 25 : 0) +
            day * 3,
        ),
  ),
);

/** The trust facts of the brand surface scenarios: value first, then the label. */
const BRAND_FACTS = [
  { value: '4,9', label: 'ortalama puan' },
  { value: '2 saat', label: 'yanıt süresi' },
  { value: '30 gün', label: 'koşulsuz iade' },
  { value: '7/24', label: 'destek' },
];

/** MEDYA ÖRNEĞİ — gömülü, ağdan gelmeyen ve ÇERÇEVEDEN FARKLI oranda. */
const MEDIA_SAMPLE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">' +
    '<rect width="200" height="100" fill="#4b5563"/>' +
    '<circle cx="100" cy="50" r="42" fill="#f59e0b"/>' +
    '<rect x="3" y="3" width="194" height="94" fill="none" stroke="#ffffff" stroke-width="2"/>' +
    '</svg>',
)}`;

export const SCENARIOS: Record<string, Record<string, ReactElement>> = {
  UiProvider: {
    description: (
      <p style={{ maxWidth: '52ch' }}>
        Sağlayıcı görünür bir şey çizmez ve stil enjekte etmez: metinleri ve yönlendirici bileşenini
        ağaca dağıtır. Bu sayfanın tamamı zaten onun içinde.
      </p>
    ),
  },
  /* Görünür bir şey çizmez — `<head>`deki tema betiği. */
  UiThemeScript: { default: <UiThemeScript /> },

  // --- Eylem ---
  Button: {
    primary: <Button variant={UIVariant.PRIMARY}>Kaydet</Button>,
    secondary: <Button variant={UIVariant.SECONDARY}>Vazgeç</Button>,
    accent: <Button variant={UIVariant.ACCENT}>Ücretsiz dene</Button>,
    outline: <Button variant={UIVariant.OUTLINE}>İncele</Button>,
    soft: <Button variant={UIVariant.SOFT}>Filtrele</Button>,
    ghost: <Button variant={UIVariant.GHOST}>Daha fazla</Button>,
    danger: <Button variant={UIVariant.DANGER}>Sil</Button>,
    /* On the brand surface: the one coral action (with its glow) and the white-framed second action. */
    onBrand: (
      <BrandSurface as="div" glow="none" dots="none">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant={UIVariant.ACCENT}>Teklif alın</Button>
          <Button variant={UIVariant.ON_BRAND}>Belgeleri oku</Button>
        </div>
      </BrandSurface>
    ),
    accentDisabled: (
      <Button variant={UIVariant.ACCENT} disabled>
        Ücretsiz dene
      </Button>
    ),
    sizes: (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button size={UISize.XSMALL}>28</Button>
        <Button size={UISize.SMALL}>32</Button>
        <Button size={UISize.MEDIUM}>40</Button>
        <Button size={UISize.LARGE}>48</Button>
      </div>
    ),
    loading: <Button isLoading>Kaydet</Button>,
    disabled: <Button disabled>Kaydet</Button>,
    link: <Button href="#">Bağlantı düğmesi</Button>,
    xsmallPill: (
      <Button variant={UIVariant.SECONDARY} size={UISize.XSMALL} shape="pill">
        Sohbeti bitir
      </Button>
    ),
  },
  IconButton: {
    ghost: <IconButton icon={<HeartFill aria-hidden />} label="Favorilere ekle" />,
    secondary: (
      <IconButton icon={<HeartFill aria-hidden />} label="Favorilere ekle" variant="secondary" />
    ),
    outline: <IconButton icon={<HeartFill aria-hidden />} label="Tümünü gör" variant="outline" />,
    /* The filled variants belong in the gallery: a colour decision has to show up in a visual diff. */
    solid: <IconButton icon={<HeartFill aria-hidden />} label="Favorilere ekle" variant="solid" />,
    accent: <IconButton icon={<HeartFill aria-hidden />} label="İndir" variant="accent" />,
    danger: <IconButton icon={<HeartFill aria-hidden />} label="Sil" variant="danger" />,
    disabled: <IconButton icon={<HeartFill aria-hidden />} label="Favorilere ekle" disabled />,
    round: (
      <IconButton icon={<ArrowUp aria-hidden />} label="Gönder" variant="solid" shape="round" />
    ),
  },
  TextLink: {
    brand: <TextLink href="#">Tüm ürünleri gör</TextLink>,
    arrow: (
      <TextLink href="#" hasArrow>
        Devamını oku
      </TextLink>
    ),
    muted: (
      <TextLink href="#" tone="muted">
        Gizlilik
      </TextLink>
    ),
  },
  Tooltip: {
    default: (
      <Tooltip content="Kısa bir açıklama">
        <Button variant={UIVariant.SECONDARY}>Üzerine gel</Button>
      </Tooltip>
    ),
  },

  // --- Seçim ---
  Chip: {
    default: <Chip>Etiket</Chip>,
    selected: <Chip isSelected>Seçili</Chip>,
    count: <Chip count={12}>Sayaçlı</Chip>,
    disabled: <Chip disabled>Pasif</Chip>,
    selectedDisabled: (
      <Chip isSelected disabled>
        Pasif seçili
      </Chip>
    ),
  },
  ChipGroup: {
    single: <ChipGroup label="Sıralama" options={OPTIONS} value="a" onChange={noop} />,
    multiple: (
      <ChipGroup isMultiple label="Süzgeç" options={OPTIONS} value={['a', 'c']} onChange={noop} />
    ),
    disabled: <ChipGroup label="Sıralama" options={OPTIONS} value="a" onChange={noop} isDisabled />,
    readOnly: <ChipGroup label="Sıralama" options={OPTIONS} value="b" onChange={noop} isReadOnly />,
  },
  Combobox: {
    empty: (
      <Combobox
        options={OPTIONS}
        value={null}
        onChange={noop}
        labels={{ placeholder: 'Marka seçin' }}
      />
    ),
    selected: (
      <Combobox
        options={OPTIONS}
        value="b"
        onChange={noop}
        isClearable
        labels={{ placeholder: 'Marka seçin' }}
      />
    ),
    disabled: (
      <Combobox
        options={OPTIONS}
        value={null}
        onChange={noop}
        isDisabled
        labels={{ placeholder: 'Marka seçin' }}
      />
    ),
    readOnly: (
      <Combobox
        options={OPTIONS}
        value="b"
        onChange={noop}
        isReadOnly
        isClearable
        labels={{ placeholder: 'Marka seçin' }}
      />
    ),
    small: (
      <Combobox
        options={OPTIONS}
        value="b"
        onChange={noop}
        isClearable
        size="sm"
        labels={{ placeholder: 'Marka seçin' }}
      />
    ),
  },
  Select: {
    default: <Select options={OPTIONS} value="a" onChange={noop} label="Sıralama" />,
    small: <Select options={OPTIONS} value="b" onChange={noop} label="Sıralama" size="sm" />,
    disabled: <Select options={OPTIONS} value="a" onChange={noop} label="Sıralama" isDisabled />,
    empty: <Select options={OPTIONS} value={null} onChange={noop} label="Sıralama" />,
    readOnly: <Select options={OPTIONS} value="a" onChange={noop} label="Sıralama" isReadOnly />,
  },
  Checkbox: {
    default: <Checkbox label="Kampanyalardan haberdar ol" defaultChecked />,
    hint: <Checkbox label="Sözleşmeyi okudum" hint="Metin yeni sekmede açılır" />,
    disabled: <Checkbox label="Pasif seçim" disabled />,
    error: (
      <Checkbox
        label="Mesafeli satış sözleşmesini okudum"
        hint="Metin yeni sekmede açılır"
        error="Devam etmek için sözleşmeyi onaylayın"
      />
    ),
  },
  Radio: {
    default: <Radio name="teslimat" label="Kargo" defaultChecked />,
    count: <Radio name="teslimat" label="Mağazadan teslim" count={3} />,
    error: <Radio name="fatura" label="Kurumsal fatura" error="Vergi numarası eksik" />,
  },
  RadioCard: {
    selected: (
      <RadioCard name="ödeme" value="kart" isSelected onChange={noop}>
        <strong>Kredi kartı</strong>
        <div>Tek çekim ya da taksitli</div>
      </RadioCard>
    ),
    unselected: (
      <RadioCard name="ödeme" value="havale" isSelected={false} onChange={noop}>
        <strong>Havale / EFT</strong>
        <div>Ödeme onayı bir iş günü sürebilir</div>
      </RadioCard>
    ),
    selectedDisabled: (
      <RadioCard name="ödeme-pasif" value="kapida" isSelected isDisabled onChange={noop}>
        <strong>Kapıda ödeme</strong>
        <div>Bu adres için kullanılamıyor</div>
      </RadioCard>
    ),
  },
  RangeSlider: {
    default: (
      <RangeSlider
        min={0}
        max={100000}
        step={500}
        value={[20000, 70000]}
        onChange={noop}
        label="Fiyat aralığı"
        formatValue={value => `${value.toLocaleString('tr-TR')} TL`}
      />
    ),
    disabled: (
      <RangeSlider
        min={0}
        max={100000}
        step={500}
        value={[20000, 70000]}
        onChange={noop}
        label="Fiyat aralığı"
        formatValue={value => `${value.toLocaleString('tr-TR')} TL`}
        isDisabled
      />
    ),
    readOnly: (
      <RangeSlider
        min={0}
        max={100000}
        step={500}
        value={[20000, 70000]}
        onChange={noop}
        label="Fiyat aralığı"
        formatValue={value => `${value.toLocaleString('tr-TR')} TL`}
        isReadOnly
      />
    ),
  },
  RatingInput: {
    selected: <RatingInput value={4} onChange={noop} label="Ürün puanı" />,
    empty: <RatingInput value={null} onChange={noop} label="Ürün puanı" />,
    disabled: <RatingInput value={3} onChange={noop} label="Ürün puanı" isDisabled />,
    readOnly: <RatingInput value={4} onChange={noop} label="Ürün puanı" isReadOnly />,
  },
  QuantityStepper: {
    default: <QuantityStepper value={2} onChange={noop} />,
    atMin: <QuantityStepper value={1} onChange={noop} min={1} />,
    invalid: <QuantityStepper value={0} onChange={noop} min={0} aria-invalid />,
    readOnly: <QuantityStepper value={4} onChange={noop} isReadOnly />,
  },
  TableCheckbox: {
    default: (
      <Table>
        <tbody>
          <tr>
            <td>
              <TableCheckbox label="SP-1 seç" defaultChecked />
            </td>
            <td>SP-1</td>
          </tr>
        </tbody>
      </Table>
    ),
  },

  // --- Girdi ---
  Input: {
    default: <Input aria-label="Ad" placeholder="Ad soyad" />,
    invalid: <Input aria-label="Ad" defaultValue="—" aria-invalid />,
    disabled: <Input aria-label="Ad" defaultValue="Değiştirilemez" disabled />,
    technical: <Input aria-label="Şase" defaultValue="WVWZZZ1KZAW000001" isTechnical />,
    small: <Input aria-label="Ara" placeholder="Kod ya da ad" size="sm" />,
  },
  ScaledInput: {
    price4: (
      <ScaledInput
        aria-label="Birim fiyat"
        value={123_456}
        onChange={noop}
        scaleDigits={4}
        minFractionDigits={2}
        suffix="TL"
      />
    ),
  },
  MoneyInput: {
    default: (
      <MoneyInput
        aria-label="Tutar"
        value={123_450}
        onChange={noop}
        minorDigits={2}
        currency="TL"
      />
    ),
    empty: (
      <MoneyInput
        aria-label="Tutar"
        value={null}
        onChange={noop}
        minorDigits={2}
        placeholder="0,00"
      />
    ),
    invalid: (
      <MoneyInput aria-label="Tutar" value={null} onChange={noop} minorDigits={2} aria-invalid />
    ),
    disabled: (
      <MoneyInput aria-label="Tutar" value={9_900} onChange={noop} minorDigits={2} disabled />
    ),
  },
  QuantityInput: {
    default: (
      <QuantityInput aria-label="Miktar" value={25_000} onChange={noop} unitDigits={3} unit="kg" />
    ),
    pieces: (
      <QuantityInput
        aria-label="Miktar"
        value={30_000}
        onChange={noop}
        unitDigits={0}
        unit="adet"
      />
    ),
  },
  RateInput: {
    default: <RateInput aria-label="Kur" value={34_123_456} onChange={noop} suffix="TL" />,
  },
  PercentInput: {
    default: <PercentInput aria-label="KDV" value={2000} onChange={noop} />,
    small: <PercentInput aria-label="İskonto" value={1250} onChange={noop} size="sm" />,
  },
  PasswordInput: {
    default: <PasswordInput aria-label="Şifre" placeholder="••••••••" />,
    filled: <PasswordInput aria-label="Şifre" defaultValue="cok-gizli-parola" />,
    disabled: <PasswordInput aria-label="Şifre" defaultValue="degistirilemez" disabled />,
  },
  /* `ToastPortal` montajdan SONRA çizer; galeride tek başına GÖRÜNMEZ bir öğedir. */
  ToastPortal: { default: <ToastPortal /> },
  Textarea: {
    default: <Textarea aria-label="Not" placeholder="Notunuz" />,
    /* Çerçeveyi kapsayıcı çizer — galeride kapsayıcıyla birlikte gösterilir. */
    bare: (
      <div style={{ padding: 12, border: '1px solid var(--hd-border)', borderRadius: 12 }}>
        <Textarea
          aria-label="Mesaj"
          placeholder="Mesajınızı yazın…"
          variant="bare"
          rows={1}
          isAutoSize
        />
      </div>
    ),
  },
  Field: {
    default: <Field label="Ad">{props => <Input {...props} placeholder="Ad soyad" />}</Field>,
    hint: (
      <Field label="TCKN" hint="Kimlikteki hâliyle, 11 hane">
        {props => <Input {...props} />}
      </Field>
    ),
    error: (
      <Field label="Telefon" error="Telefon numarası geçersiz" isRequired>
        {props => <Input {...props} defaultValue="05" />}
      </Field>
    ),
  },

  // --- Yüzey ve geri bildirim ---
  Alert: {
    info: <Alert>Siparişiniz hazırlanıyor.</Alert>,
    success: <Alert tone="success">Ödeme alındı.</Alert>,
    warning: <Alert tone="warning">Stok azalıyor.</Alert>,
    danger: (
      <Alert tone="danger" title="İşlem tamamlanamadı">
        Kart bankası isteği reddetti.
      </Alert>
    ),
    action: (
      <Alert
        title="Ödeme sayfası açık"
        action={
          <Button size={UISize.SMALL} variant={UIVariant.SECONDARY}>
            Yeniden aç
          </Button>
        }
      >
        Ödemeyi tarayıcıda tamamlayın; bu pencere kendiliğinden güncellenir.
      </Alert>
    ),
    /* 2.2: in a narrow card the action moves under the text instead of squeezing it. */
    narrowAction: (
      <div style={{ maxWidth: 320 }}>
        <Alert
          title="Ödeme sayfası açık"
          action={
            <Button size={UISize.SMALL} variant={UIVariant.SECONDARY}>
              Yeniden aç
            </Button>
          }
        >
          Ödemeyi tarayıcıda tamamlayın; bu pencere kendiliğinden güncellenir.
        </Alert>
      </div>
    ),
  },
  Avatar: {
    initial: <Avatar name="Ahmet İlhan" />,
    small: <Avatar name="İlkay Yılmaz" size="sm" />,
    large: <Avatar name="Zeynep Kaya" size="lg" />,
    brand: <Avatar name="Asistan" icon={<StarFill />} tone="brand" shape="rounded" size="sm" />,
    brandLarge: (
      <Avatar name="Asistan" icon={<StarFill />} tone="brand" shape="rounded" size="lg" />
    ),
  },
  Badge: {
    soft: <Badge>Yeni</Badge>,
    solid: <Badge variant="solid">Kampanya</Badge>,
    outline: <Badge variant="outline">Muadil</Badge>,
    ink: <Badge tone="ink">Son 2 adet</Badge>,
    danger: <Badge tone="danger">Tükendi</Badge>,
    info: <Badge tone="info">Yeni</Badge>,
    solidTones: (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Badge tone="ink" variant="solid">
          Bekliyor
        </Badge>
        <Badge tone="danger" variant="solid">
          %20
        </Badge>
        <Badge tone="info" variant="solid">
          3
        </Badge>
      </div>
    ),
    outlineTones: (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Badge tone="ink" variant="outline">
          Bekliyor
        </Badge>
        <Badge tone="danger" variant="outline">
          Hata
        </Badge>
        <Badge tone="info" variant="outline">
          Kategori
        </Badge>
      </div>
    ),
  },
  BrandSurface: {
    /* The closing call: eyebrow, heading with the coral full stop, one coral action, the facts. */
    closingWide: (
      <BrandSurface
        aria-labelledby="brand-heading"
        artwork={<BrandBlueprint shape={logos.mark} />}
        footer={<StatStrip variant="brand" items={BRAND_FACTS} />}
      >
        <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
          <Eyebrow>Teklif</Eyebrow>
          <h2 id="brand-heading" style={{ margin: 0, fontSize: 30, lineHeight: 1.15 }}>
            Projenizi konuşalım
            <span style={{ color: 'var(--hd-accent)' }}>.</span>
          </h2>
          <p style={{ margin: 0, maxWidth: '52ch', color: 'var(--hd-on-primary)' }}>
            Yazılı teklif bir iş günü içinde gelir; fiyat ve takvim baştan bellidir.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant={UIVariant.ACCENT}>Teklif alın</Button>
            <Button variant={UIVariant.ON_BRAND}>WhatsApp</Button>
          </div>
        </div>
      </BrandSurface>
    ),
    /* Centred, the dot grid on both sides, as in the share image. */
    centeredWide: (
      <BrandSurface aria-label="Tanıtım" dots="both">
        <div style={{ display: 'grid', gap: 12, justifyItems: 'center', textAlign: 'center' }}>
          <Eyebrow align="center">Yazılım · Kurumsal site</Eyebrow>
          <p style={{ margin: 0, fontSize: 30, lineHeight: 1.15 }}>
            Hızlı ve güvenilir yazılım
            <span style={{ color: 'var(--hd-accent)' }}>.</span>
          </p>
        </div>
      </BrandSurface>
    ),
    plain: (
      <BrandSurface as="div" glow="none" dots="none">
        Düz bant: yalnızca degrade.
      </BrandSurface>
    ),
  },
  BrandBlueprint: {
    default: (
      <BrandSurface as="div" glow="none" dots="none">
        <div style={{ width: 96 }}>
          <BrandBlueprint shape={logos.mark} />
        </div>
      </BrandSurface>
    ),
  },
  Breadcrumb: {
    default: (
      <Breadcrumb
        items={[
          { label: 'Ana sayfa', href: '#' },
          { label: 'Fren sistemi', href: '#' },
          { label: 'Fren balatası' },
        ]}
      />
    ),
  },
  Card: {
    default: (
      <Card>
        <CardBody>Kart gövdesi</CardBody>
      </Card>
    ),
    interactive: (
      <Card isInteractive>
        <CardBody>Tıklanabilir kart</CardBody>
      </Card>
    ),
  },
  CardBody: {
    default: (
      <Card>
        <CardBody>Gövde bölümü</CardBody>
      </Card>
    ),
  },
  CardFooter: {
    default: (
      <Card>
        <CardBody>Gövde</CardBody>
        <CardFooter>
          <Price value="1.250" />
        </CardFooter>
      </Card>
    ),
  },
  /* GERCEK bir `<img>` — ve TEK durum. */
  CardMedia: {
    inset: (
      <Card>
        <CardMedia ratio={1.4} fit="inset">
          <img src={MEDIA_SAMPLE} alt="" />
        </CardMedia>
        <CardBody>sığdırır, %85</CardBody>
      </Card>
    ),
  },
  CardOverlay: {
    default: (
      <Card>
        <CardMedia ratio={1.4}>
          <div style={{ width: '100%', height: '100%', background: 'var(--hd-bg-inset)' }} />
          <CardOverlay position="top-left">
            <Badge tone="danger" variant="solid">
              %20
            </Badge>
          </CardOverlay>
        </CardMedia>
      </Card>
    ),
  },
  StatusDot: {
    neutral: <StatusDot label="Hazır" />,
    pulsing: <StatusDot label="Çalışıyor" isPulsing />,
    info: <StatusDot tone="info" label="Bağlı" />,
    ink: <StatusDot tone="ink" label="Yeniden bağlanıyor" isPulsing />,
    danger: <StatusDot tone="danger" label="Bağlantı yok" />,
  },
  Kbd: {
    single: <Kbd keys={['⌘K']} />,
    combo: <Kbd keys={['Shift', 'Enter']} />,
  },
  CodeBadge: {
    default: <CodeBadge code="P0101" />,
    copyable: <CodeBadge code="P0101" isCopyable size="lg" />,
    interactive: <CodeBadge code="A3" size="xs" onClick={noop} label="A3 kaynağını aç" />,
  },
  CopyField: { default: <CopyField value="SP-2026-000123" /> },
  Divider: { plain: <Divider />, labelled: <Divider label="veya" /> },
  Eyebrow: {
    start: <Eyebrow>Hizmetler</Eyebrow>,
    center: <Eyebrow align="center">Sektör · Çözüm</Eyebrow>,
    onBrand: (
      <BrandSurface as="div" glow="none" dots="none">
        <Eyebrow>Teklif</Eyebrow>
      </BrandSurface>
    ),
  },
  Directory: {
    default: (
      <Directory>
        <DirectoryGroup label="A" meta="2 marka">
          <DirectoryRow href="#" name="Audi" />
          <DirectoryRow href="#" name="Alfa Romeo" />
        </DirectoryGroup>
      </Directory>
    ),
  },
  DirectoryGroup: {
    default: (
      <Directory>
        <DirectoryGroup label="B" href="#" meta="1 marka">
          <DirectoryRow href="#" name="BMW" />
        </DirectoryGroup>
      </Directory>
    ),
  },
  DirectoryRow: {
    marker: (
      <Directory>
        <DirectoryGroup label="B">
          <DirectoryRow href="#" name="BMW" marker={<Badge>OEM</Badge>} />
        </DirectoryGroup>
      </Directory>
    ),
  },
  DirectoryJump: {
    default: <DirectoryJump labels={['A', 'B', 'C', 'D']} toId={label => `grup-${label}`} />,
  },
  EmptyState: {
    default: <EmptyState title="Sonuç bulunamadı" description="Süzgeçleri genişletmeyi deneyin." />,
    error: (
      <EmptyState
        tone="error"
        title="Liste yüklenemedi"
        description="Bağlantı kurulamadı."
        action={<Button>Yeniden dene</Button>}
      />
    ),
    withAction: (
      <EmptyState
        title="Henüz bir programınız yok"
        description="Deneme sürümü 14 gün ücretsiz."
        action={<Button variant={UIVariant.ACCENT}>Ücretsiz dene</Button>}
      />
    ),
  },
  PageHeader: {
    default: (
      <PageHeader
        title="Siparişlerim"
        description="Son 12 ayın siparişleri"
        actions={<Button variant={UIVariant.SECONDARY}>Dışa aktar</Button>}
      />
    ),
  },
  Panel: {
    default: <Panel title="İletişim bilgileri">Gövde</Panel>,
    withFooter: (
      <Panel title="Fatura adresi" footer={<Button>Kaydet</Button>}>
        Gövde
      </Panel>
    ),
    /* NOBETCI: dip seridi `PanelForm`un sutununda bitmeli. */
    /* Ad `Wide` ile BITIYOR: hucre satirin tamamini alir (bkz. `playground.css`). */
    formWithFooterWide: (
      <Panel title="Fatura adresi" footer={<Button>Kaydet</Button>}>
        <PanelForm>
          <Field label="Adres başlığı">{props => <Input {...props} />}</Field>
          <Field label="Şehir">{props => <Input {...props} />}</Field>
        </PanelForm>
      </Panel>
    ),
  },
  PanelForm: {
    default: (
      <Panel title="Bilgiler">
        <PanelForm columns={2}>
          <Field label="Ad">{props => <Input {...props} />}</Field>
          <Field label="Soyad">{props => <Input {...props} />}</Field>
        </PanelForm>
      </Panel>
    ),
  },
  PanelRow: {
    default: (
      <Panel title="Özet">
        <PanelRow>Ara toplam</PanelRow>
        <PanelRow>Kargo</PanelRow>
      </Panel>
    ),
  },
  Price: {
    default: <Price value="1.250" />,
    discounted: <Price value="1.250" listValue="1.500" discountPercent={17} />,
    large: <Price value="12.499" size="xl" />,
  },
  Rating: {
    default: <Rating value={4.5} count={128} />,
    small: <Rating value={3} size="sm" />,
  },
  SectionHeader: {
    default: (
      <SectionHeader
        overline="Kampanya"
        title="Öne çıkan ürünler"
        description="Bu hafta en çok tercih edilenler"
      />
    ),
  },
  Skeleton: {
    block: <Skeleton height={72} />,
    text: <Skeleton variant="text" lines={3} />,
    circle: <Skeleton variant="circle" width={48} height={48} />,
  },
  Spinner: { small: <Spinner size="sm" />, medium: <Spinner />, large: <Spinner size="lg" /> },
  Tabs: {
    withPanel: (
      <Tabs
        ariaLabel="Ürün bilgisi"
        items={[
          { id: 'a', label: 'Açıklama', content: 'Ürün açıklaması' },
          { id: 'b', label: 'Uyumluluk', count: 12, content: 'Uyumlu araçlar' },
          { id: 'c', label: 'Yorumlar', count: 3, content: 'Yorumlar' },
        ]}
      />
    ),
  },
  Tile: {
    default: <Tile label="Ana sayfa" href="#" icon={<HouseFill aria-hidden />} />,
    active: <Tile label="Garajım" href="#" icon={<HouseFill aria-hidden />} isActive />,
  },

  Disclosure: {
    framed: (
      <Disclosure summary="Düşündü · 3 araç" meta="2,4 sn" isDefaultOpen>
        Bağlam haritası okundu, iki kaynak tarandı.
      </Disclosure>
    ),
    plain: (
      <Disclosure variant="plain" summary="Ayrıntılar">
        Kapalı başlar.
      </Disclosure>
    ),
    disabled: (
      <Disclosure summary="Kapalı bölüm" isDisabled>
        Gövde
      </Disclosure>
    ),
  },
  Accordion: {
    multiple: (
      <Accordion
        defaultOpenIds={['a']}
        items={[
          { id: 'a', title: 'Kargo ne zaman çıkar?', content: 'Saat 16:00`a kadar aynı gün.' },
          { id: 'b', title: 'İade koşulları', meta: '2 madde', content: 'On dört gün içinde.' },
          { id: 'c', title: 'Ödeme seçenekleri', content: 'Kredi kartı, havale/EFT.' },
        ]}
      />
    ),
    singleOpen: (
      <Accordion
        isSingle
        defaultOpenIds={['a']}
        items={[
          { id: 'a', title: 'Marka', content: 'Filtre gövdesi' },
          { id: 'b', title: 'Fiyat', content: 'Filtre gövdesi' },
        ]}
      />
    ),
  },
  Switch: {
    default: <Switch label="Kampanya bildirimleri" defaultChecked />,
    hint: <Switch label="Stok uyarısı" hint="Ürün stoğa girince e-posta gönderilir" />,
    labelFirst: <Switch label="Koyu tema" isLabelFirst />,
    disabled: <Switch label="Pasif ayar" disabled />,
    checkedDisabled: <Switch label="Pasif açık ayar" defaultChecked disabled />,
    error: (
      <Switch label="Otomatik yenileme" hint="Her ay kartınızdan" error="Önce bir kart ekleyin" />
    ),
  },
  Progress: {
    determinate: <Progress value={60} label="Yükleme" isValueVisible />,
    withText: (
      <Progress value={60} max={100} label="Yükleme" valueText="3 / 5 dosya" isValueVisible />
    ),
    indeterminate: <Progress label="Yükleme" />,
    ink: <Progress value={92} label="Kota" tone="ink" isValueVisible />,
    danger: <Progress value={35} label="Yükleme" tone="danger" isValueVisible />,
    xsmall: <Progress value={72} label="Bağlam doluluğu" size="xs" />,
  },
  ProgressCircle: {
    determinate: <ProgressCircle value={70} label="Yükleme" isValueVisible />,
    large: <ProgressCircle value={40} label="Yükleme" size={72} isValueVisible />,
    indeterminate: <ProgressCircle label="Yükleme" />,
  },
  Popover: {
    closed: (
      <Popover label="Yardım" trigger={<Button variant={UIVariant.SECONDARY}>Popover aç</Button>}>
        <strong>Uyumluluk nasıl belirlenir?</strong>
        <p style={{ margin: '8px 0 0' }}>Aracın şase numarasından üretici verisi çözümlenir.</p>
      </Popover>
    ),
  },
  Menu: {
    closed: (
      <Menu
        label="Satır eylemleri"
        trigger={<Button variant={UIVariant.SECONDARY}>Eylemler</Button>}
        items={[
          { id: 'copy', label: 'Kopyala', onSelect: noop },
          { id: 'export', label: 'Dışa aktar', onSelect: noop },
          { id: 'archive', label: 'Arşivle', onSelect: noop, isDisabled: true },
          { id: 'delete', label: 'Sil', onSelect: noop, isDanger: true },
        ]}
      />
    ),
  },
  /*
   * Imlec noktasinda ACIK hali — `?solo=ContextMenu`. Izgarada cizilmez: yuzey `position: fixed`
   * ile sayfanin uzerine konumlanir ve komsu bolumlerin ekran goruntusunu orterdi.
   */
  ContextMenu: {
    open: (
      <ContextMenu
        point={{ x: 48, y: 96 }}
        onClose={noop}
        label="Seçim seçenekleri"
        testId="solo-surface"
        header={
          <>
            <strong>Seçim #2</strong> · 12 mum · +1,8 %
          </>
        }
        items={[
          { id: 'copy', label: 'Verisini kopyala', icon: <Clipboard />, onSelect: noop },
          { id: 'zoom', label: 'Yakınlaştır', icon: <ZoomIn />, onSelect: noop },
          { id: 'delete', label: 'Sil', icon: <TrashFill />, onSelect: noop, isDanger: true },
        ]}
      />
    ),
  },
  ToastHub: {
    /* Yigin GORUNUR bir sey kaplamaz; bildirimler `toast.*` ile aciliyor. */
    example: (
      <>
        <ToastHub />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant={UIVariant.SECONDARY} onClick={() => toast.success('Adres kaydedildi')}>
            Başarı
          </Button>
          <Button
            variant={UIVariant.SECONDARY}
            onClick={() =>
              toast.error('Kart reddedildi', {
                description: 'Bankanız işlemi onaylamadı.',
                action: { label: 'Yeniden dene', onClick: noop },
              })
            }
          >
            Hata
          </Button>
        </div>
      </>
    ),
  },

  SegmentedControl: {
    text: (
      <SegmentedControl
        label="Görünüm"
        value="list"
        onChange={noop}
        options={[
          { value: 'list', label: 'Liste' },
          { value: 'grid', label: 'Izgara' },
        ]}
      />
    ),
    triple: (
      <SegmentedControl
        label="Dönem"
        value="year"
        onChange={noop}
        size="sm"
        options={[
          { value: 'week', label: 'Hafta' },
          { value: 'month', label: 'Ay' },
          { value: 'year', label: 'Yıl' },
        ]}
      />
    ),
    invalid: (
      <SegmentedControl
        label="Teslimat"
        value=""
        onChange={noop}
        aria-invalid
        options={[
          { value: 'cargo', label: 'Kargo' },
          { value: 'store', label: 'Mağaza' },
        ]}
      />
    ),
    disabled: (
      <SegmentedControl
        label="Görünüm"
        value="list"
        onChange={noop}
        isDisabled
        options={[
          { value: 'list', label: 'Liste' },
          { value: 'grid', label: 'Izgara' },
        ]}
      />
    ),
    readOnly: (
      <SegmentedControl
        label="Görünüm"
        value="grid"
        onChange={noop}
        isReadOnly
        options={[
          { value: 'list', label: 'Liste' },
          { value: 'grid', label: 'Izgara' },
        ]}
      />
    ),
  },
  Steps: {
    horizontal: (
      <Steps
        label="Ödeme adımları"
        currentIndex={1}
        steps={[
          { id: 'a', label: 'Adres' },
          { id: 'b', label: 'Ödeme' },
          { id: 'c', label: 'Onay' },
        ]}
      />
    ),
    static: (
      <Steps
        label="Kontrol sırası"
        orientation="vertical"
        steps={[
          { id: 'a', label: 'Hava filtresi', description: 'En düşük maliyetli ihtimal' },
          { id: 'b', label: 'Sensör temizliği' },
          { id: 'c', label: 'Sensör değişimi' },
        ]}
      />
    ),
    vertical: (
      <Steps
        label="Sipariş durumu"
        orientation="vertical"
        currentIndex={2}
        steps={[
          { id: 'a', label: 'Alındı', description: 'Sipariş oluşturuldu' },
          { id: 'b', label: 'Hazırlanıyor', description: 'Depoda toplanıyor' },
          { id: 'c', label: 'Kargoda', description: 'Yola çıktı' },
          { id: 'd', label: 'Teslim' },
        ]}
      />
    ),
  },
  FileUpload: {
    empty: (
      <FileUpload
        files={[]}
        onSelect={noop}
        onRemove={noop}
        label="Ruhsat yükleyin"
        dropLabel="Dosyaları buraya bırakın"
        removeLabel="Kaldır"
        hint="PDF ya da JPG, en fazla 5 MB"
      />
    ),
    withFiles: (
      <FileUpload
        files={[
          { id: '1', name: 'ruhsat-on.jpg', size: 240_000 },
          { id: '2', name: 'ruhsat-arka.jpg', size: 910_000, progress: 45 },
          { id: '3', name: 'eski.pdf', size: 12_000_000, error: 'Dosya çok büyük' },
        ]}
        onSelect={noop}
        onRemove={noop}
        label="Ruhsat yükleyin"
        dropLabel="Dosyaları buraya bırakın"
        removeLabel="Kaldır"
      />
    ),
    disabled: (
      <FileUpload
        files={[]}
        onSelect={noop}
        onRemove={noop}
        label="Ruhsat yükleyin"
        dropLabel="Dosyaları buraya bırakın"
        removeLabel="Kaldır"
        hint="Başvuru onaylandıktan sonra yüklenemez"
        isDisabled
      />
    ),
  },

  ScrollArea: {
    scrollable: (
      <ScrollArea label="Uzun metin" maxHeight={120}>
        <p>Satır bir</p>
        <p>Satır iki</p>
        <p>Satır üç</p>
        <p>Satır dört</p>
        <p>Satır beş</p>
      </ScrollArea>
    ),
    /* Solma AÇIK. Galeride bunun bir karşılığı yoktu ve `hasFade` hiçbir yüzeyde çizilmiyordu */
    faded: (
      <ScrollArea label="Solmalı uzun metin" maxHeight={120} hasFade>
        <p>Satır bir</p>
        <p>Satır iki</p>
        <p>Satır üç</p>
        <p>Satır dört</p>
        <p>Satır beş</p>
      </ScrollArea>
    ),
    fits: (
      <ScrollArea label="Kısa metin" maxHeight={400} hasFade>
        <p>Tek satır</p>
      </ScrollArea>
    ),
  },
  StatStrip: {
    pageWide: <StatStrip items={BRAND_FACTS} aria-label="Rakamlarla" />,
    brandWide: (
      <BrandSurface
        as="div"
        glow="none"
        dots="none"
        footer={<StatStrip variant="brand" items={BRAND_FACTS} />}
      >
        Yüzeyin altındaki şerit.
      </BrandSurface>
    ),
  },
  Stat: {
    up: <Stat label="Bugünkü sipariş" value="128" delta="%12" trend="up" description="düne göre" />,
    down: (
      <Stat
        label="İade oranı"
        value="%3,4"
        delta="%0,8"
        trend="down"
        isUpPositive={false}
        description="geçen haftaya göre"
      />
    ),
    flat: <Stat label="Aktif kullanıcı" value="1.204" delta="0" trend="flat" />,
    inline: <Stat label="Gecikme" value="412" unit="ms" variant="inline" />,
    valueOnly: <Stat label="Toplam ürün" value="12.480" unit="adet" />,
    /* Kutusuz olcum: kendi zemini olan bandin uzerinde kullanilir. */
    plain: <Stat variant="plain" label="Toplam ürün" value="12.480" unit="adet" />,
  },
  SummaryCard: {
    default: (
      <SummaryCard
        title="Periyodik Bakım (Yağ + Filtreler)"
        href="#"
        description="Motor yağı, yağ filtresi, hava filtresi, polen filtresi ve genel kontrol."
        meta={<Badge tone="info">1.500 – 18.000 TL</Badge>}
      />
    ),
    withMedia: (
      <SummaryCard
        title="Araba titriyor"
        href="#"
        headingLevel={2}
        description="Buji, bobin veya motor takozu kaynaklı olabilir."
        media={<HeartFill />}
      />
    ),
  },
  Timeline: {
    default: (
      <Timeline
        label="Sipariş geçmişi"
        events={[
          { id: '1', title: 'Sipariş alındı', time: '12 Mart 09:14', status: 'done' },
          { id: '2', title: 'Hazırlanıyor', time: '12 Mart 11:02', status: 'current' },
          { id: '3', title: 'Kargoya verildi', status: 'pending' },
        ]}
      />
    ),
    failed: (
      <Timeline
        label="Ödeme geçmişi"
        events={[
          { id: '1', title: 'Ödeme denendi', time: '12 Mart 09:14', status: 'failed' },
          { id: '2', title: 'Yeniden denendi', time: '12 Mart 09:20', status: 'done' },
        ]}
      />
    ),
  },
  TagInput: {
    withTags: (
      <TagInput
        value={['fren balatası', 'OEM']}
        onChange={noop}
        label="Etiketler"
        removeLabel="Kaldır"
        placeholder="Etiket ekleyin"
      />
    ),
    empty: (
      <TagInput
        value={[]}
        onChange={noop}
        label="Etiketler"
        removeLabel="Kaldır"
        placeholder="Etiket ekleyin"
      />
    ),
    readOnly: (
      <TagInput
        value={['fren balatası', 'OEM']}
        onChange={noop}
        label="Etiketler"
        removeLabel="Kaldır"
        isReadOnly
      />
    ),
  },

  DateField: {
    default: <DateField aria-label="Doğum tarihi" defaultValue="1990-05-12" />,
    month: <DateField type="month" aria-label="Dönem" defaultValue="2026-03" />,
    disabled: <DateField aria-label="Tarih" defaultValue="2026-03-01" disabled />,
    small: <DateField aria-label="Tarih" defaultValue="2026-03-01" size="sm" />,
  },
  DateRange: {
    default: (
      <DateRange
        value={{ start: '2026-03-01', end: '2026-03-14' }}
        onChange={noop}
        startLabel="Başlangıç"
        endLabel="Bitiş"
        isSummaryVisible
      />
    ),
    empty: (
      <DateRange
        value={{ start: '', end: '' }}
        onChange={noop}
        startLabel="Başlangıç"
        endLabel="Bitiş"
      />
    ),
    small: (
      <DateRange
        value={{ start: '2026-03-01', end: '2026-03-14' }}
        onChange={noop}
        startLabel="Başlangıç"
        endLabel="Bitiş"
        separator="→"
        size="sm"
      />
    ),
  },
  Carousel: {
    default: (
      <Carousel
        label="Öne çıkan ürünler"
        previousLabel="Önceki"
        nextLabel="Sonraki"
        formatDotLabel={(index, total) => `${total} sayfadan ${index}.`}
        itemWidth={160}
      >
        <Card>
          <CardBody>Kart 1</CardBody>
        </Card>
        <Card>
          <CardBody>Kart 2</CardBody>
        </Card>
        <Card>
          <CardBody>Kart 3</CardBody>
        </Card>
        <Card>
          <CardBody>Kart 4</CardBody>
        </Card>
        <Card>
          <CardBody>Kart 5</CardBody>
        </Card>
      </Carousel>
    ),
  },

  SkeletonCard: { default: <SkeletonCard /> },
  SkeletonRows: { default: <SkeletonRows count={3} /> },
  SkeletonTable: { default: <SkeletonTable count={3} columns={3} /> },

  // --- Kipsel (yalnızca `?solo=`) ---
  Modal: {
    default: (
      <Modal
        isOpen
        onClose={noop}
        title="Adresi sil"
        description="Bu adres siparişlerinizde görünmeye devam eder."
        footer={
          <>
            <Button variant={UIVariant.SECONDARY}>Vazgeç</Button>
            <Button variant={UIVariant.DANGER}>Sil</Button>
          </>
        }
      >
        Gövde metni.
      </Modal>
    ),
    /*
     * ⚠ ÜST KATMAN SENARYOSU — süs değil, nöbetçi. `<dialog>.showModal()` elemanı üst katmana taşır
     * ve orası `z-index`ten bağımsız olarak her…
     */
    withMenu: (
      <Modal isOpen onClose={noop} title="Satırı düzenle">
        <Menu
          label="Satır eylemleri"
          trigger={<Button variant={UIVariant.SECONDARY}>Eylemler</Button>}
          items={[
            { id: 'copy', label: 'Kopyala', onSelect: noop },
            { id: 'delete', label: 'Sil', onSelect: noop, isDanger: true },
          ]}
        />
      </Modal>
    ),
  },
  BottomSheet: {
    default: (
      <BottomSheet title="Sıralama" onClose={noop}>
        Panel gövdesi
      </BottomSheet>
    ),
  },
  Drawer: {
    default: (
      <Drawer
        isOpen
        onClose={noop}
        title="Filtreler"
        footer={
          <>
            <Button variant={UIVariant.GHOST}>Temizle</Button>
            <Button variant={UIVariant.PRIMARY}>128 ürünü göster</Button>
          </>
        }
      >
        Filtre gövdesi
      </Drawer>
    ),
  },
  CommandPalette: {
    default: (
      <CommandPalette
        isOpen
        onClose={noop}
        label="Komut paleti"
        searchPlaceholder="Komut ara"
        emptyMessage="Sonuç yok"
        items={[
          {
            id: 'orders',
            label: 'Siparişler',
            group: 'Gezinme',
            description: '/siparisler',
            shortcut: 'G S',
            onSelect: noop,
          },
          { id: 'products', label: 'Ürünler', group: 'Gezinme', onSelect: noop },
          { id: 'new', label: 'Yeni ürün ekle', group: 'Eylemler', onSelect: noop },
        ]}
      />
    ),
  },
  ConfirmDialog: {
    default: (
      <ConfirmDialog
        isOpen
        onClose={noop}
        onConfirm={noop}
        title="Kaydı sil"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
      />
    ),
  },
  PromptDialog: {
    default: (
      <PromptDialog
        isOpen
        onClose={noop}
        onSubmit={noop}
        title="Not ekle"
        label="Sipariş notu"
        hint="En fazla 200 karakter"
      />
    ),
  },

  // --- Veri ---
  Table: {
    default: (
      <Table hasRowHover>
        <thead>
          <tr>
            <th scope="col">Kod</th>
            <th scope="col">Ad</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>SP-1</td>
            <td>Fren balatası</td>
          </tr>
          <tr>
            <td>SP-2</td>
            <td>Fren diski</td>
          </tr>
        </tbody>
      </Table>
    ),
  },
  TableScroller: {
    default: (
      <TableScroller>
        <Table>
          <tbody>
            <tr>
              <td>Kaydırma kutusu içinde</td>
            </tr>
          </tbody>
        </Table>
      </TableScroller>
    ),
  },
  DataTable: {
    rows: (
      <DataTable columns={COLUMNS}>
        <DataTableRow>
          <td>SP-1</td>
          <td>Fren balatası</td>
          <td />
        </DataTableRow>
      </DataTable>
    ),
    loading: <DataTable columns={COLUMNS} isLoading />,
    empty: <DataTable columns={COLUMNS} />,
    error: <DataTable columns={COLUMNS} error="Liste yüklenemedi" />,
    sortable: (
      <DataTable
        columns={[
          { key: 'code', label: 'Kod', isSortable: true, ariaSort: 'ascending', isSticky: true },
          { key: 'name', label: 'Ad', isSortable: true },
          { key: 'actions', srLabel: 'Eylemler' },
        ]}
        onSort={noop}
        bulkBar={<span>2 satır seçildi</span>}
      >
        <DataTableRow>
          <td>SP-1</td>
          <td>Fren balatası</td>
          <td />
        </DataTableRow>
      </DataTable>
    ),
  },
  DataTableRow: {
    warning: (
      <DataTable columns={COLUMNS}>
        <DataTableRow isWarning>
          <td>SP-9</td>
          <td>Kritik stok</td>
          <td />
        </DataTableRow>
      </DataTable>
    ),
  },
  FilterBar: {
    /* Seritte tek olcu: `Input` da `Select` gibi `sm` (36px). */
    default: (
      <FilterBar onSubmit={noop} actions={<Button size={UISize.SMALL}>Uygula</Button>}>
        <FilterBarField>
          <Input aria-label="Ara" placeholder="Kod ya da ad" size="sm" />
        </FilterBarField>
        <FilterBarField>
          <Select options={OPTIONS} value="a" onChange={noop} label="Durum" size="sm" />
        </FilterBarField>
      </FilterBar>
    ),
    /* KARISIK YUKSEKLIKLER — seridin en zor hali ve tek gorsel nobetcisi. */
    mixed: (
      <FilterBar onSubmit={noop} actions={<Button>Uygula</Button>}>
        <FilterBarField isWide>
          <Input aria-label="Ara" placeholder="Kod ya da ad" />
        </FilterBarField>
        <FilterBarField>
          <Select options={OPTIONS} value="a" onChange={noop} label="Durum" size="sm" />
        </FilterBarField>
        <FilterBarField>
          <Field label="Depo kodu" hint="Örn. IST-01">
            {props => <Input {...props} placeholder="IST-01" />}
          </Field>
        </FilterBarField>
      </FilterBar>
    ),
  },
  FilterBarField: {
    wide: (
      <FilterBar onSubmit={noop}>
        <FilterBarField isWide>
          <Input aria-label="Ara" placeholder="Geniş alan" />
        </FilterBarField>
      </FilterBar>
    ),
  },
  // --- Grafikler (@handijitcom/ui/charts) ---
  LineChart: {
    twoSeries: (
      <LineChart
        label="Aylık gelir ve gider"
        xKey="month"
        xLabel="Ay"
        data={MONTHLY}
        series={[
          { key: 'revenue', label: 'Gelir' },
          { key: 'cost', label: 'Gider' },
        ]}
        hasPoints
      />
    ),
    gap: (
      <LineChart
        label="Eksik veriyle günlük ziyaret"
        xKey="day"
        data={[
          { day: 1, visits: 120 },
          { day: 2, visits: 180 },
          { day: 3, visits: null },
          { day: 4, visits: 160 },
          { day: 5, visits: 210 },
          { day: 6, visits: 190 },
        ]}
        series={[{ key: 'visits', label: 'Ziyaret' }]}
        height={200}
      />
    ),
  },
  AreaChart: {
    stacked: (
      <AreaChart
        label="Kanala göre trafik"
        xKey="month"
        data={MONTHLY}
        series={[
          { key: 'revenue', label: 'Organik' },
          { key: 'cost', label: 'Ücretli' },
        ]}
        isStacked
      />
    ),
  },
  BarChart: {
    grouped: (
      <BarChart
        label="Çeyreklik satış"
        xKey="month"
        data={MONTHLY.slice(0, 6)}
        series={[
          { key: 'revenue', label: 'Bu yıl' },
          { key: 'cost', label: 'Geçen yıl' },
        ]}
      />
    ),
    horizontal: (
      <BarChart
        label="Kategoriye göre stok"
        xKey="name"
        data={[
          { name: 'Fren balatası', stock: 420 },
          { name: 'Yağ filtresi', stock: 310 },
          { name: 'Ateşleme bujisi uzun adlı kategori', stock: 180 },
          { name: 'Silecek', stock: -40 },
        ]}
        series={[{ key: 'stock', label: 'Stok' }]}
        orientation="horizontal"
        height={220}
      />
    ),
  },
  ComposedChart: {
    default: (
      <ComposedChart
        label="Sipariş adedi ve dönüşüm oranı"
        xKey="month"
        data={MONTHLY}
        series={[
          { key: 'revenue', label: 'Sipariş', type: 'bar' },
          {
            key: 'rate',
            label: 'Dönüşüm %',
            type: 'line',
            axis: 'right',
            format: value => `%${value}`,
          },
        ]}
      />
    ),
  },
  PieChart: {
    donut: (
      <PieChart
        label="Kategoriye göre ciro"
        valueLabel="Ciro"
        centerLabel="Toplam"
        data={[
          { id: 'brake', label: 'Fren', value: 4200 },
          { id: 'filter', label: 'Filtre', value: 3100 },
          { id: 'ignition', label: 'Ateşleme', value: 1800 },
          { id: 'body', label: 'Kaporta', value: 1200 },
          { id: 'other', label: 'Diğer', value: 650 },
        ]}
      />
    ),
    pie: (
      <PieChart
        label="Ödeme yöntemi"
        valueLabel="Sipariş"
        variant="pie"
        height={220}
        data={[
          { id: 'card', label: 'Kart', value: 72 },
          { id: 'transfer', label: 'Havale', value: 18 },
          { id: 'cod', label: 'Kapıda', value: 10 },
        ]}
      />
    ),
  },
  ScatterPlot: {
    bubble: (
      <ScatterPlot
        label="Fiyat ve satış ilişkisi"
        xLabel="Fiyat (₺)"
        yLabel="Aylık satış"
        sizeLabel="Stok"
        series={[
          {
            id: 'oem',
            label: 'Orijinal',
            data: [
              { x: 420, y: 38, size: 120, label: 'Fren balatası' },
              { x: 960, y: 22, size: 40, label: 'Amortisör' },
              { x: 180, y: 64, size: 300, label: 'Yağ filtresi' },
              { x: 1450, y: 9, size: 18, label: 'Debriyaj seti' },
            ],
          },
          {
            id: 'alt',
            label: 'Muadil',
            data: [
              { x: 260, y: 71, size: 210, label: 'Fren balatası' },
              { x: 610, y: 35, size: 90, label: 'Amortisör' },
              { x: 95, y: 112, size: 500, label: 'Yağ filtresi' },
              { x: 880, y: 17, size: 30, label: 'Debriyaj seti' },
            ],
          },
        ]}
      />
    ),
  },
  Heatmap: {
    default: (
      <Heatmap
        label="Gün ve saate göre sipariş"
        valueLabel="Sipariş"
        columns={HOURS}
        rows={WEEKDAYS}
        values={ORDERS_BY_HOUR}
      />
    ),
  },
  BoxPlot: {
    default: (
      <BoxPlot
        label="Kargo firmasına göre teslim süresi (gün)"
        groupLabel="Kargo firması"
        groups={CARRIER_DAYS}
        labels={{
          min: 'En küçük',
          q1: '1. çeyrek',
          median: 'Medyan',
          q3: '3. çeyrek',
          max: 'En büyük',
          outliers: 'Aykırı',
          count: 'Gözlem',
        }}
      />
    ),
  },
  Histogram: {
    default: (
      <Histogram
        label="Teslim süresinin dağılımı"
        valueLabel="Teslim süresi (gün)"
        countLabel="Sipariş"
        values={DELIVERY_DAYS}
      />
    ),
  },
  RadarChart: {
    default: (
      <RadarChart
        label="Tedarikçi karşılaştırması"
        max={100}
        axes={[
          { key: 'price', label: 'Fiyat' },
          { key: 'speed', label: 'Teslim hızı' },
          { key: 'quality', label: 'Kalite' },
          { key: 'stock', label: 'Stok derinliği' },
          { key: 'returns', label: 'İade kolaylığı' },
          { key: 'support', label: 'Destek' },
        ]}
        series={[
          {
            id: 'a',
            label: 'Tedarikçi A',
            values: { price: 82, speed: 64, quality: 71, stock: 90, returns: 55, support: 60 },
          },
          {
            id: 'b',
            label: 'Tedarikçi B',
            values: { price: 58, speed: 88, quality: 84, stock: 47, returns: 76, support: null },
          },
        ]}
      />
    ),
  },
  // --- Takvim (@handijitcom/ui/calendar) ---
  Calendar: {
    week: (
      <Calendar
        label="Ders planı"
        days={WEEK_DAYS}
        events={LESSONS.map(({ resourceId: _room, ...lesson }) => lesson)}
        startTime="08:00"
        endTime="18:00"
        onEventChange={noop}
        onEventOpen={noop}
      />
    ),
    resources: (
      <Calendar
        label="Ders planı — derslikler"
        days={WEEK_DAYS.slice(0, 3)}
        resources={ROOMS}
        events={LESSONS}
        startTime="08:00"
        endTime="16:00"
        onEventChange={noop}
      />
    ),
    dayPlan: (
      <Calendar
        label="Gün planı — teknisyenler"
        days={WEEK_DAYS.slice(0, 1)}
        resources={[
          { id: 'r1', label: 'Ali Yılmaz', detail: '7 / 8 iş · %88', tone: 'ink' },
          { id: 'r2', label: 'Ayşe Kaya', detail: '3 / 8 iş · %38' },
        ]}
        bands={[
          { label: 'Sabah', start: '08:00', end: '12:00' },
          { label: 'Öğle', start: '12:00', end: '17:00' },
          { label: 'Akşam', start: '17:00', end: '20:00' },
        ]}
        events={LESSONS.filter(lesson => lesson.start.startsWith(WEEK_DAYS[0].date))}
        startTime="08:00"
        endTime="20:00"
        onEventChange={noop}
      />
    ),
    month: (
      <Calendar
        label="Vade takvimi"
        view="month"
        days={MONTH_DAYS}
        events={DUES}
        weekdays={['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']}
        selectedDate="2026-11-12"
        onDaySelect={noop}
      />
    ),
  },
  // --- Sohbet (@handijitcom/ui/chat) ---
  AppBar: {
    default: (
      <AppBar
        brand={
          <>
            <StarFill aria-hidden /> Acme Chat
          </>
        }
        start={<StatusDot tone="info" label="Bağlı" />}
        end={
          <>
            <IconButton icon={<MoonStarsFill aria-hidden />} label="Tema" size="sm" />
            <Button variant={UIVariant.SECONDARY} size={UISize.XSMALL} shape="pill">
              Sohbeti bitir
            </Button>
          </>
        }
      />
    ),
  },
  ChatThread: {
    default: (
      <div style={{ height: 360, border: '1px solid var(--hd-border)', borderRadius: 12 }}>
        <ChatThread
          dock={
            <PromptInput
              value=""
              onChange={noop}
              onSubmit={noop}
              placeholder="Mesajınızı yazın…"
              hint={
                <>
                  <Kbd keys={['Enter']} /> gönder · <Kbd keys={['Shift', 'Enter']} /> yeni satır
                </>
              }
            />
          }
        >
          <ChatMessage author="user">Bağlam penceresini özetler misin?</ChatMessage>
          <ChatMessage
            author="assistant"
            avatar={
              <Avatar name="Asistan" icon={<StarFill />} tone="brand" shape="rounded" size="sm" />
            }
          >
            <Prose>
              <p>
                Pencerede üç bölüm var: önek, harita ve tur içi geçmiş{' '}
                <Citation index={1} href="#k1" />.
              </p>
            </Prose>
          </ChatMessage>
        </ChatThread>
      </div>
    ),
  },
  ChatMessage: {
    user: <ChatMessage author="user">Bir soru, iki satır{'\n'}ikinci satır</ChatMessage>,
    assistant: (
      <ChatMessage
        author="assistant"
        avatar={
          <Avatar name="Asistan" icon={<StarFill />} tone="brand" shape="rounded" size="sm" />
        }
        actions={
          <MessageActions meta="2,4 sn · 412 belirteç">
            <IconButton icon={<Clipboard aria-hidden />} label="Kopyala" size="sm" />
            <IconButton icon={<ArrowRepeat aria-hidden />} label="Yeniden dene" size="sm" />
          </MessageActions>
        }
      >
        <Prose>
          <p>Yanıtın gövdesi.</p>
        </Prose>
      </ChatMessage>
    ),
  },
  PromptInput: {
    empty: <PromptInput value="" onChange={noop} onSubmit={noop} placeholder="Mesajınızı yazın…" />,
    filled: (
      <PromptInput
        value="Bu kodu açıkla"
        onChange={noop}
        onSubmit={noop}
        placeholder="Mesajınızı yazın…"
      />
    ),
    busy: (
      <PromptInput
        value=""
        onChange={noop}
        onSubmit={noop}
        onStop={noop}
        isBusy
        placeholder="Mesajınızı yazın…"
      />
    ),
    disabled: (
      <PromptInput
        value=""
        onChange={noop}
        onSubmit={noop}
        isDisabled
        placeholder="Bağlantı bekleniyor"
      />
    ),
  },
  PromptSuggestions: {
    default: (
      <PromptSuggestions
        label="Örnek istemler"
        items={[
          { id: 'a', label: 'Bir dosyayı özetle', description: 'Uzun bir metni kısalt' },
          { id: 'b', label: 'Hatayı bul', description: 'Yığın izini yorumla' },
          { id: 'c', label: 'Test yaz', description: 'Bir fonksiyon için' },
        ]}
        onPick={noop}
      />
    ),
  },
  Prose: {
    default: (
      <Prose>
        <h2>Başlık</h2>
        <p>
          Paragraf, <a href="#">bir bağlantı</a> ve <code>satırİçiKod()</code>.
        </p>
        <ul>
          <li>Birinci madde</li>
          <li>İkinci madde</li>
        </ul>
        <blockquote>Bir alıntı.</blockquote>
        <table>
          <thead>
            <tr>
              <th>Kademe</th>
              <th>Değer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>bg-page</td>
              <td>--hd-bg-page</td>
            </tr>
          </tbody>
        </table>
      </Prose>
    ),
  },
  CodeBlock: {
    typescript: (
      <CodeBlock
        language="ts"
        code={
          "import { useState } from 'react';\n\n// Selamlama — `name` boşsa varsayılan.\nconst MAX_LENGTH = 40;\n\nexport const greet = (name: string, isLoud = false): string => {\n  const text = `Merhaba ${name.slice(0, MAX_LENGTH)}`;\n  return isLoud ? text.toUpperCase() : text;\n};"
        }
      />
    ),
    /* Tek satır gelen JSON biçimlendirilir; değerler metin olarak korunur. */
    json: (
      <CodeBlock
        language="json"
        code='{"id":12345678901234567890,"name":"ui","tags":["chat","charts"],"isPublic":true,"owner":null}'
      />
    ),
    diff: (
      <CodeBlock
        language="diff"
        code={'@@ -1,3 +1,3 @@\n const a = 1;\n-const b = a / 2;\n+const b = a * 2;'}
      />
    ),
  },
  ReasoningBlock: {
    running: (
      <ReasoningBlock summary="Düşünüyor · 1 araç" isRunning>
        <ReasoningText
          label="Akıl yürütme"
          text="Önce bağlam haritasını okuyorum, sonra iki kaynağı tarayacağım."
        />
        <ToolCall
          icon={<TerminalFill />}
          name="bash"
          summary="ls -la src"
          status="running"
          meta="1,2 sn"
        />
      </ReasoningBlock>
    ),
    done: (
      <ReasoningBlock summary="Düşündü · 2 araç · 2,4 sn">
        <ReasoningText label="Akıl yürütme" text="Bitti." />
      </ReasoningBlock>
    ),
  },
  ReasoningText: {
    default: (
      <ReasoningText
        label="Akıl yürütme"
        maxHeight={80}
        text={'Satır bir.\nSatır iki.\nSatır üç.\nSatır dört.\nSatır beş.\nSatır altı.'}
      />
    ),
  },
  ToolCall: {
    running: (
      <ToolCall
        icon={<TerminalFill />}
        name="bash"
        summary="npm test"
        status="running"
        meta="3 sn"
      />
    ),
    ok: (
      <ToolCall
        icon={<TerminalFill />}
        name="bash"
        summary="ls -la"
        status="ok"
        meta="120 ms"
        isDefaultOpen
      >
        <ToolCallSection label="Çıktı">
          <TerminalOutput
            label="Komut çıktısı"
            command="ls -la"
            chunks={[{ stream: 'stdout', text: 'build\nsrc\n' }]}
          />
        </ToolCallSection>
      </ToolCall>
    ),
    error: (
      <ToolCall icon={<TerminalFill />} name="bash" summary="rm -rf /" status="error" meta="5 ms" />
    ),
    aborted: <ToolCall name="araştır" summary="ui palet" status="aborted" />,
  },
  ToolCallSection: {
    default: (
      <ToolCall name="araştır" summary="ui" status="ok" isDefaultOpen>
        <ToolCallSection label="Girdi">ui palet</ToolCallSection>
        <ToolCallSection label="Sonuç">3 kaynak bulundu.</ToolCallSection>
      </ToolCall>
    ),
  },
  TerminalOutput: {
    default: (
      <TerminalOutput
        label="Komut çıktısı"
        command="npm run build"
        chunks={[
          { stream: 'stdout', text: 'vite v5.4.21 building for production...\n' },
          { stream: 'stderr', text: 'Uyarı: kaynak haritası eksik\n' },
          { stream: 'stdout', text: '✓ built in 1.90s\n' },
        ]}
      />
    ),
  },
  SourceList: {
    default: (
      <SourceList
        items={[
          { id: '1', title: 'ui CLAUDE.md', url: 'https://example.com', domain: 'example.com' },
          { id: '2', title: 'Yerel bağlam kaydı A3', onSelect: noop },
        ]}
      />
    ),
  },
  Citation: {
    inline: (
      <p>
        Metin içi atıf <Citation index={1} href="#k1" /> ve düğme atıf{' '}
        <Citation index={2} onClick={noop} />.
      </p>
    ),
  },
  MessageActions: {
    default: (
      <MessageActions meta="412 belirteç">
        <IconButton icon={<Clipboard aria-hidden />} label="Kopyala" size="sm" />
        <Button variant={UIVariant.GHOST} size={UISize.XSMALL}>
          Harness
        </Button>
      </MessageActions>
    ),
  },
  ActionList: {
    default: (
      <ActionList label="Bağlam haritası">
        <ActionListItem start="A1" end="t3" onClick={noop}>
          Önek: sistem yönergesi
        </ActionListItem>
        <ActionListItem start="A2" end="t4" isSelected onClick={noop}>
          Seçili satır
        </ActionListItem>
        <ActionListItem start="A3" end="t5" isMuted onClick={noop}>
          Gizlenmiş girdi
        </ActionListItem>
      </ActionList>
    ),
    /*
     * Sanal kip (`rowHeight`). Galeride karşılığı yoktu; kaydırma kabı sızıntısı nöbetçisi
     * (`e2e/scroll-containment.spec.ts`) bu kabı ölçer. Satır sonundaki nokta görsel olarak gizli
     * bir ad taşır — sızıntının tüketicide ölçüldüğü bileşimin aynısı.
     */
    virtual: (
      <ActionList label="Uzun bağlam haritası" rowHeight={44} maxHeight={176}>
        {Array.from({ length: 40 }, (_, index) => (
          <ActionListItem
            key={index}
            start={`A${index + 1}`}
            end={<StatusDot tone="info" label="Bağlı" />}
            onClick={noop}
          >
            Girdi {index + 1}
          </ActionListItem>
        ))}
      </ActionList>
    ),
  },
  ActionListItem: {
    link: (
      <ActionList label="Bağlantılar">
        <ActionListItem href="#" start="↗">
          Belgeye git
        </ActionListItem>
      </ActionList>
    ),
  },
  SegmentBar: {
    stacked: (
      <SegmentBar
        label="Bağlam bileşimi"
        max={100}
        segments={[
          { id: 'p', label: 'Önek 32', tone: 'chart-1', value: 32 },
          { id: 'm', label: 'Harita 18', tone: 'chart-2', value: 18 },
          { id: 's', label: 'Durum 12', tone: 'chart-3', value: 12 },
          { id: 'u', label: 'Kullanıcı 8', tone: 'chart-4', value: 8 },
          { id: 't', label: 'Tur içi 10', tone: 'chart-5', value: 10 },
        ]}
        markers={[{ id: 'b', at: 85, label: 'Bütçe 85', tone: 'danger' }]}
      />
    ),
    waterfall: (
      <SegmentBar
        label="Tur zaman çizelgesi"
        max={10}
        segments={[
          { id: 'w', label: 'Bekleme 0-1,2 sn', tone: 'muted', from: 0, to: 1.2 },
          { id: 's', label: 'Akış 1,2-5 sn', tone: 'chart-1', from: 1.2, to: 5 },
          { id: 't', label: 'Araçlar 5-8 sn', tone: 'chart-6', from: 5, to: 8 },
        ]}
      />
    ),
  },
  DescriptionList: {
    default: (
      <DescriptionList
        items={[
          { term: 'Kimlik', description: 'A3', isTechnical: true },
          { term: 'Tür', description: 'Bağlam haritası' },
          { term: 'Yol', description: '/src/chat/ChatThread/index.tsx', isTechnical: true },
        ]}
      />
    ),
  },
  Legend: {
    default: (
      <Legend
        items={[
          { id: 'prefix', label: 'Önek', tone: 'chart-1' },
          { id: 'map', label: 'Harita', tone: 'chart-2' },
          { id: 'state', label: 'Durum', tone: 'chart-3' },
          { id: 'user', label: 'Kullanıcı', tone: 'chart-4' },
          { id: 'turn', label: 'Tur içi', tone: 'chart-5' },
          { id: 'wait', label: 'Bekleme', tone: 'muted' },
        ]}
      />
    ),
  },
  Pagination: {
    links: <Pagination page={4} totalPages={42} buildHref={page => `#sayfa-${page}`} />,
    buttons: <Pagination page={1} totalPages={5} onPageChange={noop} />,
  },
};

export { UiProvider, SOLO_ONLY };
