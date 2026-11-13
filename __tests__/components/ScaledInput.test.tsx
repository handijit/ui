import { createRef, type ComponentProps, useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Field from '@/components/Field';
import MoneyInput from '@/components/MoneyInput';
import PercentInput from '@/components/PercentInput';
import QuantityInput from '@/components/QuantityInput';
import RateInput from '@/components/RateInput';
import ScaledInput from '@/components/ScaledInput';
import { axe } from '@tests/support/axe';

type ScaledProps = ComponentProps<typeof ScaledInput>;

/** A controlled field that records every value it gives. */
const Harness = ({
  initial = null,
  onValue,
  ...rest
}: Omit<ScaledProps, 'value' | 'onChange'> & {
  initial?: number | null;
  onValue?: (value: number | null) => void;
}) => {
  const [value, setValue] = useState<number | null>(initial);

  return (
    <ScaledInput
      aria-label="Tutar"
      {...rest}
      value={value}
      onChange={next => {
        onValue?.(next);
        setValue(next);
      }}
    />
  );
};

/** Any of the fields, controlled: the value follows what it gives. */
const Controlled = <P extends { value: number | null; onChange: (value: number | null) => void }>({
  as: Component,
  initial = null,
  onValue,
  ...rest
}: { as: (props: P) => React.ReactNode; initial?: number | null; onValue: jest.Mock } & Omit<
  P,
  'value' | 'onChange'
>) => {
  const [value, setValue] = useState<number | null>(initial);
  const props = {
    ...rest,
    'aria-label': 'Tutar',
    value,
    onChange: (next: number | null) => {
      onValue(next);
      setValue(next);
    },
  } as unknown as P;

  return <Component {...props} />;
};

const field = () => screen.getByRole('textbox', { name: 'Tutar' }) as HTMLInputElement;

describe('ScaledInput', () => {
  it('shows the value grouped at rest and plain while focused, selected for replacing', async () => {
    const user = userEvent.setup();
    render(<Harness initial={123_450} scaleDigits={2} minFractionDigits={2} />);

    expect(field()).toHaveValue('1.234,50');

    await user.click(field());

    expect(field()).toHaveValue('1234,50');
    expect(field().selectionStart).toBe(0);
    expect(field().selectionEnd).toBe(7);
  });

  it('gives the scaled integer on every keystroke, never a float', async () => {
    const user = userEvent.setup();
    const onValue = jest.fn();
    render(<Harness scaleDigits={2} onValue={onValue} />);

    await user.type(field(), '0,29');

    /* "0," means 0 again: no second call. */
    expect(onValue.mock.calls.map(([value]) => value)).toEqual([0, 20, 29]);
    expect(field()).toHaveValue('0,29');

    await user.tab();

    expect(field()).toHaveValue('0,29');
  });

  it('refuses a keystroke no number takes: a letter, a decimal too many, a minus', async () => {
    const user = userEvent.setup();
    const onValue = jest.fn();
    render(<Harness scaleDigits={2} onValue={onValue} />);

    await user.type(field(), '1x2,345-');

    expect(field()).toHaveValue('12,34');
    expect(onValue).toHaveBeenLastCalledWith(1234);
  });

  it('reads a pasted amount with its currency', () => {
    const onValue = jest.fn();
    render(<Harness scaleDigits={2} onValue={onValue} />);

    fireEvent.change(field(), { target: { value: '1.234,56 TL' } });

    expect(onValue).toHaveBeenCalledWith(123_456);
    expect(field()).toHaveValue('1.234,56');
  });

  it('an emptied field gives null; a number on its way gives null and is marked when left', async () => {
    const user = userEvent.setup();
    const onValue = jest.fn();
    render(<Harness initial={500} scaleDigits={0} min={-1000} onValue={onValue} />);

    await user.clear(field());

    expect(onValue).toHaveBeenLastCalledWith(null);

    await user.type(field(), '-');
    await user.tab();

    expect(field()).toHaveValue('-');
    expect(field()).toHaveAttribute('aria-invalid', 'true');

    await user.click(field());
    await user.type(field(), '5');

    expect(onValue).toHaveBeenLastCalledWith(-5);
    expect(field()).not.toHaveAttribute('aria-invalid');

    await user.clear(field());
    await user.tab();

    expect(field()).toHaveValue('');
    expect(field()).not.toHaveAttribute('aria-invalid');
  });

  it('an unreadable text is marked even when the form says the field is valid', async () => {
    const user = userEvent.setup();
    render(<Harness scaleDigits={0} min={-10} aria-invalid={false} />);

    expect(field()).toHaveAttribute('aria-invalid', 'false');

    await user.type(field(), '-');
    await user.tab();

    expect(field()).toHaveAttribute('aria-invalid', 'true');
  });

  it('raises a value under `min` when the field is left, or on Enter', async () => {
    const user = userEvent.setup();
    const onValue = jest.fn();
    render(<Harness scaleDigits={0} min={5} onValue={onValue} />);

    await user.type(field(), '2');
    await user.tab();

    expect(onValue).toHaveBeenLastCalledWith(5);
    expect(field()).toHaveValue('5');

    await user.click(field());
    await user.keyboard('3{Enter}');

    expect(onValue).toHaveBeenLastCalledWith(5);
  });

  it('a value set from outside replaces the draft', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ScaledInput aria-label="Tutar" value={100} onChange={() => {}} scaleDigits={2} />,
    );

    await user.click(field());
    fireEvent.change(field(), { target: { value: '5' } });

    rerender(<ScaledInput aria-label="Tutar" value={700} onChange={() => {}} scaleDigits={2} />);

    expect(field()).toHaveValue('7');
  });

  it('draws nothing for a value that is not a safe integer', () => {
    render(<ScaledInput aria-label="Tutar" value={1.5} onChange={() => {}} scaleDigits={2} />);

    expect(field()).toHaveValue('');
  });

  it('chains the handlers it uses and forwards the ref', async () => {
    const user = userEvent.setup();
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const onKeyDown = jest.fn();
    const ref = createRef<HTMLInputElement>();
    render(
      <ScaledInput
        ref={ref}
        aria-label="Tutar"
        value={null}
        onChange={() => {}}
        scaleDigits={2}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />,
    );

    await user.click(field());
    await user.keyboard('{Enter}');
    await user.tab();

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onKeyDown.mock.calls.map(([event]) => event.key)).toEqual(['Enter', 'Tab']);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(ref.current).toBe(field());
  });

  it('asks for the decimal keypad only when decimals can be typed', () => {
    const { rerender } = render(
      <ScaledInput aria-label="Tutar" value={null} onChange={() => {}} scaleDigits={2} />,
    );

    expect(field()).toHaveAttribute('inputmode', 'decimal');
    expect(field()).toHaveAttribute('autocomplete', 'off');

    rerender(
      <ScaledInput
        aria-label="Tutar"
        value={null}
        onChange={() => {}}
        scaleDigits={4}
        maxFractionDigits={0}
      />,
    );

    expect(field()).toHaveAttribute('inputmode', 'numeric');
  });

  it("speaks Field's contract", async () => {
    const { container } = render(
      <Field label="Tutar" error="Tutar girin" isRequired requiredLabel="zorunlu">
        {props => <ScaledInput {...props} value={null} onChange={() => {}} scaleDigits={2} />}
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: /Tutar/ });

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Tutar girin');
    expect(input).toBeRequired();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('the fixed-scale fields', () => {
  it('MoneyInput takes the minor digits of the currency and shows them all', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { rerender } = render(
      <MoneyInput
        aria-label="Tutar"
        value={123_450}
        onChange={onChange}
        minorDigits={2}
        currency="TL"
      />,
    );

    expect(field()).toHaveValue('1.234,50');
    expect(screen.getByText('TL')).toBeInTheDocument();

    rerender(<MoneyInput aria-label="Tutar" value={12_345} onChange={onChange} minorDigits={3} />);
    expect(field()).toHaveValue('12,345');

    rerender(<Controlled as={MoneyInput} onValue={onChange} minorDigits={0} />);
    await user.type(field(), '15,');
    expect(field()).toHaveValue('15');
    expect(onChange).toHaveBeenLastCalledWith(15);
  });

  it('QuantityInput stores Qty4 and takes the decimals of the unit', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { rerender } = render(
      <QuantityInput
        aria-label="Tutar"
        value={25_000}
        onChange={onChange}
        unitDigits={3}
        unit="kg"
      />,
    );

    expect(field()).toHaveValue('2,5');
    expect(screen.getByText('kg')).toBeInTheDocument();

    rerender(<Controlled as={QuantityInput} onValue={onChange} unitDigits={0} />);
    await user.type(field(), '3,5');

    expect(field()).toHaveValue('35');
    expect(onChange).toHaveBeenLastCalledWith(350_000);
  });

  it('QuantityInput never takes more than the four carried decimals', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Controlled as={QuantityInput} onValue={onChange} unitDigits={6} />);

    await user.type(field(), '0,12345');

    expect(onChange).toHaveBeenLastCalledWith(1234);
  });

  it('RateInput stores Rate6 and shows at least four places', () => {
    render(<RateInput aria-label="Tutar" value={34_120_000} onChange={() => {}} />);

    expect(field()).toHaveValue('34,1200');
  });

  it('PercentInput stores Pct2 with the sign before the number, or where the caller puts it', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <PercentInput aria-label="Tutar" value={1250} onChange={onChange} />,
    );

    expect(field()).toHaveValue('12,5');
    expect(screen.getByText('%')).toBeInTheDocument();

    fireEvent.change(field(), { target: { value: '%20' } });
    expect(onChange).toHaveBeenLastCalledWith(2000);

    rerender(
      <PercentInput aria-label="Tutar" value={2000} onChange={onChange} prefix={null} suffix="%" />,
    );
    expect(field().parentElement?.lastElementChild).toHaveTextContent('%');
  });
});
