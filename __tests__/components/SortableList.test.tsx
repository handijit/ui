import { useState } from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SortableList from '@/components/SortableList';
import UiProvider from '@/theme/UiProvider';
import { axe } from '@tests/support/axe';
import { LABELS } from '@tests/fixtures/labels';

const ITEMS = ['Ön', 'Arka', 'Yan', 'Detay'];

const Harness = ({
  onReorder,
  isDisabled,
}: {
  onReorder?: (items: string[]) => void;
  isDisabled?: boolean;
}) => {
  const [items, setItems] = useState(ITEMS);

  return (
    <UiProvider labels={LABELS}>
      <SortableList
        label="Görseller"
        items={items}
        getKey={item => item}
        getLabel={item => item}
        isDisabled={isDisabled}
        onReorder={next => {
          onReorder?.(next);
          setItems(next);
        }}
        renderItem={(item, { handle, index, isDragging, moveTo }) => (
          <div data-testid={`item-${item}`} data-dragging={isDragging || undefined}>
            {handle}
            <span>{item}</span>
            {index > 0 && (
              <button type="button" onClick={() => moveTo(0)}>
                {`${item} kapak yap`}
              </button>
            )}
          </div>
        )}
      />
    </UiProvider>
  );
};

const order = () =>
  screen.getAllByRole('listitem').map(item => item.querySelector('div > span')?.textContent);
const announced = () => document.getElementById('ui-live-region-assertive')?.textContent;

/* jsdom has no `PointerEvent`; a `MouseEvent` carries the same coordinates. */
class TestPointerEvent extends MouseEvent {}

beforeAll(() => {
  Object.defineProperty(window, 'PointerEvent', { configurable: true, value: TestPointerEvent });
});

beforeEach(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    callback(0);
    return 0;
  });
});

describe('SortableList', () => {
  it('names the list and every handle, and links the handles to the instructions', async () => {
    render(<Harness />);

    expect(screen.getByRole('list', { name: 'Görseller' })).toBeInTheDocument();
    const handle = screen.getByRole('button', { name: 'Ön öğesini taşı' });
    expect(handle).toHaveAccessibleDescription(LABELS.sortableList?.instructions ?? '');
    expect(handle).toHaveAttribute('aria-pressed', 'false');
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('grabs with Space, moves with the arrows, drops with Space and announces each step', async () => {
    const onReorder = jest.fn();
    render(<Harness onReorder={onReorder} />);
    const user = userEvent.setup();

    screen.getByRole('button', { name: 'Ön öğesini taşı' }).focus();
    await user.keyboard(' ');
    expect(announced()).toBe('Ön tutuldu, sıra 1 / 4');
    expect(screen.getByRole('button', { name: 'Ön öğesini taşı' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('item-Ön')).toHaveAttribute('data-dragging', 'true');

    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(order()).toEqual(['Arka', 'Yan', 'Ön', 'Detay']);
    expect(announced()).toBe('Ön: sıra 3 / 4');
    expect(screen.getByRole('button', { name: 'Ön öğesini taşı' })).toHaveFocus();
    expect(onReorder).not.toHaveBeenCalled();

    await user.keyboard('{ArrowUp}');
    await user.keyboard('{Enter}');
    expect(onReorder).toHaveBeenCalledWith(['Arka', 'Ön', 'Yan', 'Detay']);
    expect(announced()).toBe('Ön bırakıldı, sıra 2 / 4');
  });

  it('jumps with Home and End, stops at the ends and ignores other keys', async () => {
    const onReorder = jest.fn();
    render(<Harness onReorder={onReorder} />);
    const user = userEvent.setup();

    screen.getByRole('button', { name: 'Yan öğesini taşı' }).focus();
    await user.keyboard('a');
    await user.keyboard('{ArrowDown}');
    expect(order()).toEqual(ITEMS);

    await user.keyboard(' {End}');
    expect(order()).toEqual(['Ön', 'Arka', 'Detay', 'Yan']);
    await user.keyboard('{ArrowDown}x{Home}');
    expect(order()).toEqual(['Yan', 'Ön', 'Arka', 'Detay']);
    await user.keyboard('{ArrowLeft}');
    expect(order()).toEqual(['Yan', 'Ön', 'Arka', 'Detay']);
  });

  it('cancels with Escape and puts the order back', async () => {
    const onReorder = jest.fn();
    render(<Harness onReorder={onReorder} />);
    const user = userEvent.setup();

    screen.getByRole('button', { name: 'Ön öğesini taşı' }).focus();
    await user.keyboard(' {ArrowDown}{Escape}');
    expect(order()).toEqual(ITEMS);
    expect(onReorder).not.toHaveBeenCalled();
    expect(announced()).toBe('Ön taşınmadı');
  });

  it('drops when Tab leaves, and does not report an unmoved drop', async () => {
    const onReorder = jest.fn();
    render(<Harness onReorder={onReorder} />);
    const user = userEvent.setup();

    screen.getByRole('button', { name: 'Ön öğesini taşı' }).focus();
    await user.keyboard(' ');
    await user.keyboard(' ');
    expect(onReorder).not.toHaveBeenCalled();

    await user.keyboard(' {ArrowDown}');
    await user.tab();
    expect(onReorder).toHaveBeenCalledWith(['Arka', 'Ön', 'Yan', 'Detay']);
  });

  it('does not grab a second item while one is held', async () => {
    render(<Harness />);
    const user = userEvent.setup();

    screen.getByRole('button', { name: 'Ön öğesini taşı' }).focus();
    await user.keyboard(' ');
    fireEvent.keyDown(screen.getByRole('button', { name: 'Arka öğesini taşı' }), { key: ' ' });
    expect(screen.getByRole('button', { name: 'Arka öğesini taşı' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('drags with the pointer to the nearest slot and drops on release', () => {
    const onReorder = jest.fn();
    render(<Harness onReorder={onReorder} />);
    screen.getAllByRole('listitem').forEach((item, index) => {
      jest
        .spyOn(item, 'getBoundingClientRect')
        .mockReturnValue({ left: 0, top: index * 50, width: 100, height: 40 } as DOMRect);
    });

    const handle = screen.getByRole('button', { name: 'Ön öğesini taşı' });
    fireEvent.pointerDown(handle, { button: 2 });
    fireEvent.pointerMove(window, { clientX: 10, clientY: 160 });
    expect(order()).toEqual(ITEMS);

    fireEvent.pointerDown(handle, { button: 0 });
    fireEvent.pointerMove(window, { clientX: 10, clientY: 5 });
    expect(order()).toEqual(ITEMS);
    fireEvent.pointerMove(window, { clientX: 10, clientY: 110 });
    expect(order()).toEqual(['Arka', 'Yan', 'Ön', 'Detay']);
    fireEvent.pointerDown(handle, { button: 0 });

    fireEvent.pointerUp(window);
    expect(onReorder).toHaveBeenCalledWith(['Arka', 'Yan', 'Ön', 'Detay']);
    expect(announced()).toBe('Ön bırakıldı, sıra 3 / 4');
  });

  it('cancels a pointer drag with Escape or a cancelled pointer', () => {
    const onReorder = jest.fn();
    render(<Harness onReorder={onReorder} />);
    screen.getAllByRole('listitem').forEach((item, index) => {
      jest
        .spyOn(item, 'getBoundingClientRect')
        .mockReturnValue({ left: 0, top: index * 50, width: 100, height: 40 } as DOMRect);
    });
    const handle = screen.getByRole('button', { name: 'Detay öğesini taşı' });

    fireEvent.pointerDown(handle, { button: 0 });
    fireEvent.pointerMove(window, { clientX: 10, clientY: 10 });
    expect(order()[0]).toBe('Detay');
    fireEvent.keyDown(window, { key: 'Shift' });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(order()).toEqual(ITEMS);

    fireEvent.pointerDown(handle, { button: 0 });
    fireEvent.pointerMove(window, { clientX: 10, clientY: 10 });
    fireEvent(window, new Event('pointercancel'));
    expect(order()).toEqual(ITEMS);
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('ignores pointer events that arrive after the drop, before the listeners are gone', () => {
    const onReorder = jest.fn();
    render(<Harness onReorder={onReorder} />);
    const handle = screen.getByRole('button', { name: 'Ön öğesini taşı' });

    fireEvent.pointerDown(handle, { button: 0 });
    act(() => {
      window.dispatchEvent(new TestPointerEvent('pointerup'));
      window.dispatchEvent(new TestPointerEvent('pointermove', { clientX: 0, clientY: 300 }));
      window.dispatchEvent(new TestPointerEvent('pointerup'));
    });
    expect(order()).toEqual(ITEMS);
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('moves an item at once with moveTo (make cover)', async () => {
    const onReorder = jest.fn();
    render(<Harness onReorder={onReorder} />);

    await userEvent.click(screen.getByRole('button', { name: 'Yan kapak yap' }));
    expect(onReorder).toHaveBeenCalledWith(['Yan', 'Ön', 'Arka', 'Detay']);
    expect(announced()).toBe('Yan bırakıldı, sıra 1 / 4');
  });

  it('disables the handles', () => {
    render(<Harness isDisabled />);

    expect(screen.getByRole('button', { name: 'Ön öğesini taşı' })).toBeDisabled();
  });

  it('ignores moveTo during a drag and to the same place', async () => {
    const onReorder = jest.fn();
    let move: ((index: number) => void) | undefined;
    render(
      <UiProvider labels={LABELS}>
        <SortableList
          label="Liste"
          items={ITEMS}
          getKey={item => item}
          getLabel={item => item}
          onReorder={onReorder}
          renderItem={(item, { handle, moveTo, index }) => {
            if (index === 1) move = moveTo;
            return (
              <>
                {handle}
                {item}
              </>
            );
          }}
        />
      </UiProvider>,
    );

    act(() => move?.(1));
    expect(onReorder).not.toHaveBeenCalled();

    screen.getByRole('button', { name: 'Ön öğesini taşı' }).focus();
    await userEvent.keyboard(' ');
    act(() => move?.(3));
    expect(onReorder).not.toHaveBeenCalled();
  });
});
