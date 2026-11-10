import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Combobox from '@/components/Combobox';
import Select from '@/components/Select';
import { SHEET_MEDIA_QUERY } from '@/constants/breakpoint.constants';
import {
  DESKTOP,
  matchesQuery,
  mockViewport,
  NARROW_DESKTOP,
  PHONE,
} from '@tests/support/viewport';

/*
 * THE SHEET RULE — a bottom sheet is a TOUCH pattern.
 *
 * Until 2.0 the width alone decided: any window narrower than the mobile breakpoint got the sheet,
 * including a desktop program docked to a third of the screen, where a list sliding up from the
 * bottom edge is far from the pointer and foreign to the platform. The sheet now needs both a
 * narrow viewport AND a coarse primary pointer; everything else opens the anchored dropdown.
 */
const OPTIONS = [
  { value: 'tr', label: 'Türkiye' },
  { value: 'de', label: 'Almanya' },
];

const COMBOBOX_LABELS = {
  placeholder: 'Ülke',
  searchPlaceholder: 'Ara…',
  emptyMessage: 'Sonuç bulunamadı',
  loadingMessage: 'Aranıyor…',
  clearLabel: 'Seçimi temizle',
  closeLabel: 'Kapat',
};

const openSelect = async () => {
  const user = userEvent.setup();
  render(
    <Select
      label="Ülke"
      placeholder="Seçin"
      closeLabel="Kapat"
      options={OPTIONS}
      value="tr"
      onChange={() => {}}
    />,
  );
  await user.click(screen.getByRole('combobox', { name: /Ülke/ }));
};

const openCombobox = async () => {
  const user = userEvent.setup();
  render(<Combobox options={OPTIONS} value={null} onChange={() => {}} labels={COMBOBOX_LABELS} />);
  await user.click(screen.getByRole('combobox', { name: 'Ülke' }));
};

const sheet = () => document.querySelector('dialog');

describe('sheet rule', () => {
  /* The sheet locks the page scroll and restores it on close; jsdom has no `scrollTo`. */
  let scrollTo: jest.SpyInstance;
  beforeAll(() => {
    scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  /* After ALL: the unmount of the last sheet runs after an `afterEach` registered here. */
  afterAll(() => scrollTo.mockRestore());

  it('the query asks for a narrow viewport AND a coarse pointer', () => {
    expect(matchesQuery(SHEET_MEDIA_QUERY, PHONE)).toBe(true);
    expect(matchesQuery(SHEET_MEDIA_QUERY, NARROW_DESKTOP)).toBe(false);
    expect(matchesQuery(SHEET_MEDIA_QUERY, DESKTOP)).toBe(false);
    /* A tablet or a touch laptop: touch, but wide. */
    expect(matchesQuery(SHEET_MEDIA_QUERY, { width: 1024, isTouch: true })).toBe(false);
  });

  describe.each([
    ['Select', openSelect],
    ['Combobox', openCombobox],
  ])('%s', (_name, open) => {
    it('opens a bottom sheet on a phone', async () => {
      mockViewport(PHONE);
      await open();

      expect(sheet()).toBeInTheDocument();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens a dropdown on a desktop viewport', async () => {
      mockViewport(DESKTOP);
      await open();

      expect(sheet()).not.toBeInTheDocument();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens a dropdown in a NARROW desktop window too', async () => {
      mockViewport(NARROW_DESKTOP);
      await open();

      expect(sheet()).not.toBeInTheDocument();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens a dropdown on a wide touch screen', async () => {
      mockViewport({ width: 1024, isTouch: true });
      await open();

      expect(sheet()).not.toBeInTheDocument();
    });
  });
});
