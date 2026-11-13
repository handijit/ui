import { LABELS } from '../fixtures/labels';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps, type ReactNode, useState } from 'react';

import {
  Calendar,
  type CalendarDay,
  type CalendarEvent,
  type CalendarEventChange,
} from '@/calendar';
import { UiProvider } from '@/index';
import { axe } from '@tests/support/axe';

/*
 * TAKVİM DAVRANIŞI — klavye, işaretçiyle taşıma ve uzatma, boş dilim, dışarıdan bırakma, ay.
 * jsdom yerleşim yapmıyor: ızgaranın kutusu `getBoundingClientRect` ile verilir (08:00–20:00,
 * 720 px yüksek: bir dakika bir piksel; üç sütun 300 px geniş).
 */

/*
 * jsdom has neither `PointerEvent` nor `DragEvent`: Testing Library then builds a plain `Event`
 * without `button` or `clientY`. Both are mouse events with those fields in a browser.
 */
beforeAll(() => {
  const globals = window as unknown as Record<string, unknown>;
  globals.PointerEvent ??= class extends MouseEvent {};
  globals.DragEvent ??= class extends MouseEvent {};
});

const wrap = (node: ReactNode) => render(<UiProvider labels={LABELS}>{node}</UiProvider>);

const DAYS: CalendarDay[] = [
  { date: '2026-11-09', label: 'Pazartesi 9 Kasım', shortLabel: 'Pzt 9' },
  { date: '2026-11-10', label: 'Salı 10 Kasım', isToday: true },
  { date: '2026-11-11', label: 'Çarşamba 11 Kasım', isOff: true },
];

const EVENTS: CalendarEvent[] = [
  { id: 'a', title: 'İngilizce', start: '2026-11-09T09:00', end: '2026-11-09T10:00' },
  {
    id: 'b',
    title: 'Matematik',
    start: '2026-11-09T13:00',
    end: '2026-11-09T14:00',
    tone: 'success',
  },
  {
    id: 'c',
    title: 'Fizik',
    start: '2026-11-11T12:00',
    end: '2026-11-11T13:00',
    isCancelled: true,
  },
  { id: 'd', title: 'Geçmiş', start: '2026-11-10T09:00', end: '2026-11-10T10:00', isLocked: true },
];

const box = (left: number, top: number, width: number, height: number) =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

/** The grid of columns, 300 × 720; each column 100 × 720; month cells 700 × 200 (two rows). */
const mockLayout = () =>
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.classList.contains('columns')) return box(0, 0, 300, 720);
    if (this.classList.contains('column')) {
      const index = [...(this.parentElement?.children ?? [])].indexOf(this);
      return box(index * 100, 0, 100, 720);
    }
    if (this.classList.contains('cells')) return box(0, 0, 700, 200);
    return box(0, 0, 0, 0);
  });

/** A calendar that applies what it is told, unless `isRefusing`. */
const Controlled = ({
  initial = EVENTS,
  onChange,
  isRefusing = false,
  ...rest
}: Partial<ComponentProps<typeof Calendar>> & {
  initial?: CalendarEvent[];
  onChange?: (change: CalendarEventChange) => void;
  isRefusing?: boolean;
}) => {
  const [events, setEvents] = useState(initial);

  return (
    <Calendar
      label="Ders planı"
      days={DAYS}
      events={events}
      onEventChange={change => {
        onChange?.(change);
        /* A refusal still re-reads the events (a new array, the same data). */
        if (isRefusing) return setEvents(current => [...current]);
        setEvents(current =>
          current.map(event => (event.id === change.id ? { ...event, ...change } : event)),
        );
      }}
      {...rest}
    />
  );
};

const eventButton = (name: RegExp) => screen.getByRole('button', { name });

const pointer = (type: string, x: number, y: number) =>
  act(() => {
    window.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
  });

const liveRegion = () => document.getElementById('ui-live-region-polite');

describe('Calendar — time grid', () => {
  afterEach(() => jest.restoreAllMocks());

  it('draws each event as a button named by its time, title and column; cancelled is read', () => {
    wrap(<Calendar label="Ders planı" days={DAYS} events={EVENTS} />);

    const group = screen.getByRole('group', { name: 'Ders planı' });
    expect(group).toHaveAccessibleDescription(
      'Oklarla gezinin, Enter ile açın; ⌘ ve oklarla taşıyın.',
    );
    expect(eventButton(/İngilizce/)).toHaveAccessibleName(
      '09:00–10:00 İngilizce , Pazartesi 9 Kasım',
    );
    expect(eventButton(/Fizik/)).toHaveAccessibleName(
      'İptal: 12:00–13:00 Fizik , Çarşamba 11 Kasım',
    );
    expect(eventButton(/Fizik/)).toHaveClass('event--cancelled');
    expect(eventButton(/Matematik/)).toHaveClass('event--success');
    expect(within(group).getByRole('group', { name: 'Salı 10 Kasım' })).toBeInTheDocument();
    expect(screen.getByText('Salı 10 Kasım', { selector: '.header' })).toHaveAttribute(
      'aria-current',
      'date',
    );
    expect(screen.getByText('Pzt 9')).toHaveAttribute('aria-hidden');
    expect(group.querySelector('.column--off')).not.toBeNull();
    expect(screen.getAllByText('08:00')[0]).toBeInTheDocument();
  });

  it('one event is in the tab order; arrows move the focus between events', async () => {
    const user = userEvent.setup();
    wrap(<Calendar label="Ders planı" days={DAYS} events={EVENTS} />);

    const tabbable = screen.getAllByRole('button').filter(button => button.tabIndex === 0);
    expect(tabbable).toEqual([eventButton(/İngilizce/)]);

    await user.tab();
    expect(eventButton(/İngilizce/)).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(eventButton(/Matematik/)).toHaveFocus();
    expect(eventButton(/Matematik/)).toHaveAttribute('tabindex', '0');
    expect(eventButton(/İngilizce/)).toHaveAttribute('tabindex', '-1');

    await user.keyboard('{ArrowRight}');
    expect(eventButton(/Geçmiş/)).toHaveFocus();

    /* Nothing further up: the focus stays, the page may scroll. */
    await user.keyboard('{ArrowUp}{Enter}');
    expect(eventButton(/Geçmiş/)).toHaveFocus();
  });

  it('Enter and a click open the event', async () => {
    const user = userEvent.setup();
    const onEventOpen = jest.fn();
    wrap(<Calendar label="Ders planı" days={DAYS} events={EVENTS} onEventOpen={onEventOpen} />);

    await user.click(eventButton(/Matematik/));
    await user.keyboard('{Enter}');

    expect(onEventOpen.mock.calls).toEqual([['b'], ['b']]);
  });

  it('⌘ arrows move the event, the focus follows it into its new column and the move is announced', async () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callback(0);
      return 0;
    });
    const user = userEvent.setup();
    const onChange = jest.fn();
    wrap(<Controlled onChange={onChange} />);

    await user.tab();
    await user.keyboard('{Meta>}{ArrowDown}{/Meta}');

    expect(onChange).toHaveBeenLastCalledWith({
      id: 'a',
      start: '2026-11-09T09:30',
      end: '2026-11-09T10:30',
      resourceId: undefined,
    });
    expect(liveRegion()).toHaveTextContent('İngilizce taşındı: Pazartesi 9 Kasım, 09:30–10:30');

    await user.keyboard('{Control>}{ArrowRight}{/Control}');

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ start: '2026-11-10T09:30', end: '2026-11-10T10:30' }),
    );
    expect(eventButton(/İngilizce/)).toHaveFocus();
    expect(eventButton(/İngilizce/)).toHaveAccessibleName(/Salı 10 Kasım/);

    await user.keyboard('{Meta>}{Shift>}{ArrowDown}{/Shift}{/Meta}');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ start: '2026-11-10T09:30', end: '2026-11-10T11:00' }),
    );
  });

  it('a locked event, a move with nowhere to go and a refused move change nothing', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    wrap(<Controlled onChange={onChange} isRefusing />);

    act(() => eventButton(/Geçmiş/).focus());
    await user.keyboard('{Meta>}{ArrowDown}{/Meta}');
    expect(onChange).not.toHaveBeenCalled();

    act(() => eventButton(/İngilizce/).focus());
    await user.keyboard('{Meta>}{ArrowLeft}{/Meta}');
    await user.keyboard('{Meta>}{Shift>}{ArrowLeft}{/Shift}{/Meta}');
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard('{Meta>}{ArrowRight}{/Meta}');
    await user.keyboard('{Meta>}{ArrowDown}{/Meta}');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(eventButton(/İngilizce/)).toHaveAccessibleName(/09:00–10:00 İngilizce , Pazartesi/);

    /* The pending focus of the refused move is dropped by the next key. */
    await user.keyboard('a');
    expect(eventButton(/İngilizce/)).toHaveFocus();
  });

  it('⌘ → moves an event to the next resource of the same day', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    wrap(
      <Controlled
        days={DAYS.slice(0, 1)}
        resources={[
          { id: 't1', label: 'Ali' },
          { id: 't2', label: 'Ayşe' },
        ]}
        initial={[{ ...EVENTS[0], resourceId: 't1' }]}
        onChange={onChange}
      />,
    );

    await user.tab();
    await user.keyboard('{Meta>}{ArrowRight}{/Meta}');

    expect(onChange).toHaveBeenCalledWith({
      id: 'a',
      start: '2026-11-09T09:00',
      end: '2026-11-09T10:00',
      resourceId: 't2',
    });
    expect(eventButton(/İngilizce/)).toHaveFocus();
    expect(eventButton(/İngilizce/)).toHaveAccessibleName(/Ayşe/);
  });

  it('without a change handler the calendar only shows and opens: no move, no resize handle', async () => {
    const user = userEvent.setup();
    const { container } = wrap(<Calendar label="Ders planı" days={DAYS} events={EVENTS} />);

    expect(container.querySelector('.event__handle')).toBeNull();
    expect(container.querySelector('.event--movable')).toBeNull();
    await user.tab();
    await user.keyboard('{Meta>}{ArrowDown}{/Meta}');
    expect(eventButton(/İngilizce/)).toHaveAccessibleName(/09:00–10:00/);

    fireEvent.pointerDown(eventButton(/İngilizce/), { button: 0, clientX: 10, clientY: 60 });
    await pointer('pointermove', 10, 200);
    expect(container.querySelector('.preview')).toBeNull();
  });

  it('dragging moves the event: a preview while travelling, a change on release, the click swallowed', async () => {
    mockLayout();
    jest.useFakeTimers();
    const onChange = jest.fn();
    const onEventOpen = jest.fn();
    const onSlotSelect = jest.fn();
    const { container } = wrap(
      <Controlled onChange={onChange} onEventOpen={onEventOpen} onSlotSelect={onSlotSelect} />,
    );

    /* A press released where it started is a click: it opens. */
    fireEvent.pointerDown(eventButton(/Matematik/), { button: 0, clientX: 50, clientY: 360 });
    await pointer('pointerup', 50, 360);
    fireEvent.click(eventButton(/Matematik/));
    expect(onEventOpen).toHaveBeenCalledWith('b');
    onEventOpen.mockClear();

    fireEvent.pointerDown(eventButton(/İngilizce/), { button: 0, clientX: 50, clientY: 60 });
    /* Under the threshold: still a click. */
    await pointer('pointermove', 51, 61);
    expect(container.querySelector('.preview')).toBeNull();

    await pointer('pointermove', 150, 130);
    expect(container.querySelector('.preview')).toHaveTextContent('10:00–11:00İngilizce');
    expect(eventButton(/İngilizce/)).toHaveClass('event--dragging');

    await pointer('pointerup', 150, 130);
    fireEvent.click(eventButton(/İngilizce/));
    /* Released over an empty slot, the click lands on the column: not a new event either. */
    fireEvent.click(screen.getByRole('group', { name: 'Salı 10 Kasım' }), { clientY: 130 });
    expect(onSlotSelect).not.toHaveBeenCalled();

    expect(onChange).toHaveBeenCalledWith({
      id: 'a',
      start: '2026-11-10T10:00',
      end: '2026-11-10T11:00',
      resourceId: undefined,
    });
    expect(onEventOpen).not.toHaveBeenCalled();
    expect(container.querySelector('.preview')).toBeNull();

    act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
    fireEvent.click(eventButton(/İngilizce/));
    expect(onEventOpen).toHaveBeenCalledWith('a');
  });

  it('the bottom handle stretches the event; a release outside the grid snaps to its edge', async () => {
    mockLayout();
    const onChange = jest.fn();
    const { container } = wrap(<Controlled onChange={onChange} />);
    const handle = eventButton(/Matematik/).querySelector('.event__handle')!;

    fireEvent.pointerDown(handle, { button: 0, clientX: 50, clientY: 360 });
    await pointer('pointermove', 50, 450);
    expect(container.querySelector('.preview')).toHaveTextContent('13:00–15:30');

    await pointer('pointerup', 50, 450);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'b', start: '2026-11-09T13:00', end: '2026-11-09T15:30' }),
    );
  });

  it('Escape gives the drag up and is not heard by the page; a cancelled pointer too', async () => {
    mockLayout();
    const onChange = jest.fn();
    const onPageKey = jest.fn();
    window.addEventListener('keydown', onPageKey);
    const { container } = wrap(<Controlled onChange={onChange} />);

    fireEvent.pointerDown(eventButton(/İngilizce/), { button: 0, clientX: 50, clientY: 60 });
    await pointer('pointermove', 50, 200);
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(container.querySelector('.preview')).not.toBeNull();

    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(container.querySelector('.preview')).toBeNull();
    expect(onPageKey).toHaveBeenCalledTimes(1);
    await pointer('pointerup', 50, 200);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.pointerDown(eventButton(/İngilizce/), { button: 0, clientX: 50, clientY: 60 });
    await pointer('pointermove', 50, 200);
    await pointer('pointercancel', 50, 200);
    expect(container.querySelector('.preview')).toBeNull();
    /* An Escape after the drag is the page's again. */
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onPageKey).toHaveBeenCalledTimes(2);
    window.removeEventListener('keydown', onPageKey);
  });

  it('only the main button drags, a locked event does not, and a grid with no size drops nothing', async () => {
    const onChange = jest.fn();
    const { container } = wrap(<Controlled onChange={onChange} />);

    fireEvent.pointerDown(eventButton(/İngilizce/), { button: 2, clientX: 50, clientY: 60 });
    fireEvent.pointerDown(eventButton(/Geçmiş/), { button: 0, clientX: 150, clientY: 60 });
    await pointer('pointermove', 50, 200);
    expect(container.querySelector('.preview')).toBeNull();

    /* No layout (jsdom): the drag starts but has no target. */
    fireEvent.pointerDown(eventButton(/İngilizce/), { button: 0, clientX: 50, clientY: 60 });
    await pointer('pointermove', 50, 200);
    await pointer('pointerup', 50, 200);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a calendar unmounted mid-drag leaves no listener', async () => {
    mockLayout();
    const removed = jest.spyOn(window, 'removeEventListener');
    const { unmount } = wrap(<Controlled />);

    fireEvent.pointerDown(eventButton(/İngilizce/), { button: 0, clientX: 50, clientY: 60 });
    unmount();

    expect(removed.mock.calls.map(([type]) => type)).toEqual(
      expect.arrayContaining(['pointermove', 'pointerup', 'pointercancel', 'keydown']),
    );
  });

  it('a click on an empty slot gives the slot; a drop from outside gives the slot and the data', () => {
    mockLayout();
    const onSlotSelect = jest.fn();
    const onExternalDrop = jest.fn();
    wrap(
      <Calendar
        label="Gün planı"
        days={DAYS.slice(0, 1)}
        resources={[
          { id: 't1', label: 'Ali' },
          { id: 't2', label: 'Ayşe' },
        ]}
        events={[{ ...EVENTS[0], resourceId: 't2' }]}
        slotMinutes={15}
        onSlotSelect={onSlotSelect}
        onExternalDrop={onExternalDrop}
      />,
    );
    const column = screen.getByRole('group', { name: 'Pazartesi 9 Kasım, Ali' });

    fireEvent.click(column, { clientY: 130 });
    fireEvent.click(column, { clientY: 9999 });
    fireEvent.click(eventButton(/İngilizce/));
    expect(onSlotSelect.mock.calls).toEqual([
      [{ start: '2026-11-09T10:00', end: '2026-11-09T10:15', resourceId: 't1' }],
      [{ start: '2026-11-09T19:45', end: '2026-11-09T20:00', resourceId: 't1' }],
    ]);

    const dataTransfer = { getData: () => 'job-42', dropEffect: 'none' };
    fireEvent.dragOver(column, { dataTransfer });
    expect(dataTransfer.dropEffect).toBe('move');
    fireEvent.drop(column, { clientY: 60, dataTransfer });
    expect(onExternalDrop).toHaveBeenCalledWith({
      start: '2026-11-09T09:00',
      end: '2026-11-09T09:15',
      resourceId: 't1',
      data: 'job-42',
    });

    expect(screen.getByText('Ali', { selector: '.resource' })).toBeInTheDocument();
  });

  it('a slot of a column with no size is the first one', () => {
    const onSlotSelect = jest.fn();
    wrap(<Calendar label="Ders planı" days={DAYS} events={[]} onSlotSelect={onSlotSelect} />);

    fireEvent.click(screen.getByRole('group', { name: 'Salı 10 Kasım' }), { clientY: 300 });
    expect(onSlotSelect).toHaveBeenCalledWith(
      expect.objectContaining({ start: '2026-11-10T08:00', end: '2026-11-10T08:30' }),
    );
  });

  it('with no event the scroll box takes the focus itself', () => {
    wrap(<Calendar label="Ders planı" days={DAYS} events={[]} />);

    expect(screen.getByRole('region', { name: 'Ders planı' })).toHaveAttribute('tabindex', '0');
  });

  it('draws a custom body; draws no event outside the hours', () => {
    wrap(
      <Calendar
        label="Ders planı"
        days={DAYS}
        events={[
          ...EVENTS,
          { id: 'x', title: 'Gece', start: '2026-11-09T21:00', end: '2026-11-09T22:00' },
        ]}
        renderEvent={event => <strong>{`${event.title} 8/12`}</strong>}
      />,
    );

    expect(screen.getByText('İngilizce 8/12')).toBeInTheDocument();
    expect(screen.queryByText(/Gece/)).toBeNull();
  });

  it('has no axe violation', async () => {
    const { container } = wrap(
      <Calendar
        label="Ders planı"
        days={DAYS}
        resources={[{ id: 'r', label: 'Derslik' }]}
        events={EVENTS.map(event => ({ ...event, resourceId: 'r' }))}
        onEventChange={() => {}}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

const MONTH: CalendarDay[] = Array.from({ length: 14 }, (_, index) => ({
  date: `2026-11-${String(index + 2).padStart(2, '0')}`,
  label: `${index + 2} Kasım`,
  /* The last day has no short text: the cell shows its label. */
  shortLabel: index === 13 ? undefined : String(index + 2),
  isOff: index % 7 >= 5,
  isOutside: index === 13,
  isToday: index === 3,
}));

const DUES: CalendarEvent[] = [
  { id: 'k', title: 'Kira', start: '2026-11-03T00:00', end: '2026-11-03T00:00' },
  ...['Çek', 'Senet', 'Tahsilat', 'Elektrik'].map((title, index) => ({
    id: `d${index}`,
    title,
    start: `2026-11-05T0${index + 1}:00`,
    end: `2026-11-05T0${index + 1}:00`,
  })),
];

describe('Calendar — month', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lists the first events of a day, the rest behind "+N"; the day opens its list', async () => {
    const user = userEvent.setup();
    const onDaySelect = jest.fn();
    wrap(
      <Calendar
        label="Vade takvimi"
        view="month"
        days={MONTH}
        events={DUES}
        weekdays={['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']}
        selectedDate="2026-11-05"
        onDaySelect={onDaySelect}
      />,
    );
    const day = screen.getByRole('group', { name: '5 Kasım' });

    expect(within(day).getAllByRole('button', { name: /Kasım$/ })).toHaveLength(4);
    expect(within(day).getByRole('button', { name: '5 Kasım' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(day).getByRole('button', { name: '5 Kasım' })).toHaveAttribute(
      'aria-current',
      'date',
    );
    expect(within(day).queryByText('Elektrik')).toBeNull();
    expect(screen.getByText('Pzt')).toBeInTheDocument();

    await user.click(within(day).getByRole('button', { name: '+1 daha' }));
    await user.click(within(day).getByRole('button', { name: '5 Kasım' }));
    expect(onDaySelect.mock.calls).toEqual([['2026-11-05'], ['2026-11-05']]);

    expect(screen.getByRole('button', { name: /01:00 Çek/ })).toHaveAccessibleName(
      '01:00 Çek , 5 Kasım',
    );
  });

  it('a day button is a toggle only when the caller tracks a selected day', () => {
    wrap(
      <Calendar
        label="Vade takvimi"
        view="month"
        days={MONTH}
        events={DUES}
        onDaySelect={() => {}}
      />,
    );

    expect(screen.getByRole('button', { name: '5 Kasım' })).not.toHaveAttribute('aria-pressed');
  });

  it('without `onDaySelect` the day number and "+N" are text', () => {
    wrap(<Calendar label="Vade takvimi" view="month" days={MONTH} events={DUES} />);

    expect(screen.getByText('+1 daha').tagName).toBe('SPAN');
    expect(screen.getByText('15 Kasım', { selector: '.cell__day' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '5 Kasım' })).toBeNull();
  });

  it('⌘ arrows move a due by a day or a week; ⌘ ⇧ does nothing', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    wrap(<Controlled view="month" days={MONTH} initial={DUES} onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole('button', { name: /Kira/ })).toHaveFocus();

    await user.keyboard('{Meta>}{Shift>}{ArrowDown}{/Shift}{/Meta}');
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard('{Meta>}{ArrowRight}{/Meta}');
    await user.keyboard('{Meta>}{ArrowDown}{/Meta}');

    expect(onChange.mock.calls.map(([change]) => change.start)).toEqual([
      '2026-11-04T00:00',
      '2026-11-11T00:00',
    ]);
    expect(screen.getByRole('button', { name: /Kira/ })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: /Kira/ })).toHaveFocus();
    /* ← reaches the closest day with dues, at the nearest time: 01:00 of the 5th. */
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: /Çek/ })).toHaveFocus();
  });

  it('dragging a due marks the target day and moves it there', async () => {
    mockLayout();
    const onChange = jest.fn();
    const { container } = wrap(
      <Controlled view="month" days={MONTH} initial={DUES} onChange={onChange} />,
    );

    fireEvent.pointerDown(screen.getByRole('button', { name: /Kira/ }), {
      button: 0,
      clientX: 150,
      clientY: 50,
    });
    await pointer('pointermove', 650, 150);
    expect(container.querySelectorAll('.cell--target')).toHaveLength(1);
    expect(screen.getByRole('group', { name: '15 Kasım' })).toHaveClass('cell--target');

    /* Off the grid: no target. */
    await pointer('pointermove', 900, 150);
    expect(container.querySelector('.cell--target')).toBeNull();

    await pointer('pointerup', 350, 150);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'k', start: '2026-11-12T00:00', end: '2026-11-12T00:00' }),
    );
    await waitFor(() =>
      expect(
        within(screen.getByRole('group', { name: '12 Kasım' })).getByText('Kira'),
      ).toBeInTheDocument(),
    );
  });

  it('has no axe violation', async () => {
    const { container } = wrap(
      <Calendar
        label="Vade takvimi"
        view="month"
        days={MONTH}
        events={DUES}
        weekdays={['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']}
        onDaySelect={() => {}}
        onEventChange={() => {}}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
