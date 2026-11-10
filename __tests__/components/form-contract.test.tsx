/**
 * 2.2 — what a form library needs from the field components, one block per gap found while
 * building `@handijit/forms` 1.0 and the desktop template: errors on the choice controls, the
 * accessibility links of the composites, `Field`'s `id`, `Select` / `Combobox` as form fields,
 * read-only and group-wide disabled states, `TagInput`'s `value`, `Button`'s busy state and the
 * name of `Progress`.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ReactNode, useState } from 'react';

import Checkbox from '@/components/Checkbox';
import ChipGroup from '@/components/ChipGroup';
import Combobox from '@/components/Combobox';
import DateField, { DateRange } from '@/components/DateField';
import Field from '@/components/Field';
import Button from '@/components/Button';
import Progress, { ProgressCircle } from '@/components/Progress';
import QuantityStepper from '@/components/QuantityStepper';
import Radio from '@/components/Radio';
import RangeSlider from '@/components/RangeSlider';
import RatingInput from '@/components/RatingInput';
import SegmentedControl from '@/components/SegmentedControl';
import Select from '@/components/Select';
import Switch from '@/components/Switch';
import TagInput from '@/components/TagInput';
import { UiProvider } from '@/index';

import { axe } from '../support/axe';
import { LABELS } from '../fixtures/labels';

const withLabels = (node: ReactNode) => <UiProvider labels={LABELS}>{node}</UiProvider>;

const OPTIONS = [
  { value: 'tr', label: 'Türkiye' },
  { value: 'de', label: 'Almanya' },
];

const COMBOBOX_LABELS = { placeholder: 'Ülke', searchPlaceholder: 'Ara', clearLabel: 'Temizle' };

const describedBy = (element: HTMLElement): string[] =>
  (element.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);

describe.each([
  ['Checkbox', Checkbox, 'checkbox'],
  ['Switch', Switch, 'switch'],
  ['Radio', Radio, 'radio'],
] as const)('%s — error and merged descriptions', (_, Control, role) => {
  it('draws the error, marks the control invalid and links the message', () => {
    render(<Control label="Koşulları kabul ediyorum" error="Devam etmek için kabul edin" />);

    const control = screen.getByRole(role);
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAccessibleDescription('Devam etmek için kabul edin');
    expect(screen.getByRole('alert')).toHaveTextContent('Devam etmek için kabul edin');
  });

  it('keeps the hint when an aria-describedby is passed: the three are merged', () => {
    render(
      <>
        <p id="outside">Sözleşme metni ayrıca e-postayla gelir.</p>
        <Control
          id="terms"
          label="Kabul"
          hint="Sözleşmeyi okudum"
          error="Gerekli"
          aria-describedby="outside"
        />
      </>,
    );

    expect(describedBy(screen.getByRole(role))).toEqual(['terms-error', 'terms-hint', 'outside']);
    expect(screen.getByRole(role)).toHaveAccessibleDescription(
      'Gerekli Sözleşmeyi okudum Sözleşme metni ayrıca e-postayla gelir.',
    );
  });

  it('without an error, writes no invalid state and keeps a passed aria-invalid', () => {
    const { rerender } = render(<Control label="Kabul" />);
    expect(screen.getByRole(role)).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<Control label="Kabul" aria-invalid />);
    expect(screen.getByRole(role)).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no axe violations with an error and a hint', async () => {
    const { container } = render(<Control label="Kabul" hint="Sözleşme" error="Gerekli" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Field — id and a rich label', () => {
  it('gives the control the id it is handed, and derives the message ids from it', () => {
    render(
      <Field id="email" label="E-posta" hint="İş adresiniz" error="Geçersiz">
        {props => <input {...props} />}
      </Field>,
    );

    const input = screen.getByRole('textbox', { name: 'E-posta' });
    expect(input).toHaveAttribute('id', 'email');
    expect(describedBy(input)).toEqual(['email-error', 'email-hint']);
  });

  it('takes an element as its label, inside the <label>', () => {
    render(
      <Field
        label={
          <>
            Vergi no <abbr title="Vergi Kimlik Numarası">VKN</abbr>
          </>
        }
      >
        {props => <input {...props} />}
      </Field>,
    );

    expect(screen.getByRole('textbox')).toHaveAccessibleName('Vergi no VKN');
  });
});

describe('composites — id, aria-invalid and aria-describedby from Field', () => {
  const inField = (
    control: (props: Parameters<Parameters<typeof Field>[0]['children']>[0]) => ReactNode,
  ) =>
    render(
      withLabels(
        <Field id="f" label="Alan" hint="Yardım" error="Hatalı" isRequired>
          {control}
        </Field>,
      ),
    );

  it('QuantityStepper: the number box takes the id and the links', () => {
    inField(props => <QuantityStepper {...props} value={2} onChange={() => {}} />);

    const box = screen.getByRole('spinbutton');
    expect(box).toHaveAttribute('id', 'f');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAttribute('aria-required', 'true');
    expect(describedBy(box)).toEqual(['f-error', 'f-hint']);
  });

  it('SegmentedControl: the radiogroup takes the id and the links', () => {
    inField(props => (
      <SegmentedControl
        {...props}
        label="Görünüm"
        options={OPTIONS}
        value="tr"
        onChange={() => {}}
      />
    ));

    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('id', 'f');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group).toHaveAccessibleDescription('Hatalı Yardım');
  });

  it('ChipGroup: a single choice takes them on its radiogroup', () => {
    inField(props => (
      <ChipGroup {...props} label="Ülke" options={OPTIONS} value={null} onChange={() => {}} />
    ));

    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('id', 'f');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group).toHaveAccessibleDescription('Hatalı Yardım');
  });

  it('ChipGroup: a multiple choice takes them on its group, without aria-required', () => {
    inField(props => (
      <ChipGroup
        {...props}
        label="Ülke"
        isMultiple
        options={OPTIONS}
        value={[]}
        onChange={() => {}}
      />
    ));

    const group = screen.getByRole('group', { name: 'Ülke' });
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).not.toHaveAttribute('aria-required');
    expect(group).toHaveAccessibleDescription('Hatalı Yardım');
  });

  it('RangeSlider: the low thumb takes the id, both thumbs the links', () => {
    inField(props => (
      <RangeSlider
        {...props}
        label="Fiyat"
        min={0}
        max={100}
        value={[10, 90]}
        onChange={() => {}}
      />
    ));

    const [low, high] = screen.getAllByRole('slider');
    expect(low).toHaveAttribute('id', 'f');
    expect(high).toHaveAttribute('id', 'f-high');
    for (const thumb of [low, high]) {
      expect(thumb).toHaveAttribute('aria-invalid', 'true');
      expect(thumb).toHaveAccessibleDescription('Hatalı Yardım');
    }
  });

  it('RatingInput: the fieldset takes the id and the links, the radios are required', () => {
    inField(props => <RatingInput {...props} label="Puan" value={null} onChange={() => {}} />);

    const group = screen.getByRole('group', { name: 'Puan' });
    expect(group).toHaveAttribute('id', 'f');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAccessibleDescription('Hatalı Yardım');
    screen.getAllByRole('radio').forEach(radio => expect(radio).toBeRequired());
  });

  it('DateRange: the start field takes the id, both fields the links', () => {
    inField(props => (
      <DateRange
        {...props}
        startLabel="Başlangıç"
        endLabel="Bitiş"
        value={{ start: '', end: '' }}
        onChange={() => {}}
      />
    ));

    const start = screen.getByLabelText('Başlangıç');
    const end = screen.getByLabelText('Bitiş');
    expect(start).toHaveAttribute('id', 'f');
    expect(end).toHaveAttribute('id', 'f-end');
    for (const field of [start, end]) {
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field).toBeRequired();
      expect(field).toHaveAccessibleDescription('Hatalı Yardım');
    }
  });

  it('has no axe violations inside a Field with an error', async () => {
    const { container } = render(
      withLabels(
        <>
          {[
            (props: object) => <QuantityStepper {...props} value={2} onChange={() => {}} />,
            (props: object) => (
              <SegmentedControl
                {...props}
                label="Görünüm"
                options={OPTIONS}
                value="tr"
                onChange={() => {}}
              />
            ),
            (props: object) => (
              <ChipGroup
                {...props}
                label="Ülke"
                options={OPTIONS}
                value={null}
                onChange={() => {}}
              />
            ),
            (props: object) => (
              <ChipGroup
                {...props}
                label="Ülkeler"
                isMultiple
                options={OPTIONS}
                value={[]}
                onChange={() => {}}
              />
            ),
            (props: object) => (
              <RangeSlider
                {...props}
                label="Fiyat"
                min={0}
                max={100}
                value={[10, 90]}
                onChange={() => {}}
              />
            ),
            (props: object) => (
              <RatingInput {...props} label="Puan" value={null} onChange={() => {}} />
            ),
            (props: object) => (
              <DateRange
                {...props}
                startLabel="Başlangıç"
                endLabel="Bitiş"
                value={{ start: '', end: '' }}
                onChange={() => {}}
              />
            ),
          ].map((control, index) => (
            <Field key={index} label={`Alan ${index}`} hint="Yardım" error="Hatalı" isRequired>
              {control}
            </Field>
          ))}
        </>,
      ),
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Select — a form field', () => {
  it('holds null: the placeholder shows and nothing is chosen', () => {
    render(withLabels(<Select label="Ülke" options={OPTIONS} value={null} onChange={() => {}} />));

    expect(screen.getByRole('combobox')).toHaveTextContent(LABELS.selectPlaceholder ?? '');
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Ülke');
  });

  it('hands its ref to the trigger', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      withLabels(
        <Select ref={ref} label="Ülke" options={OPTIONS} value="tr" onChange={() => {}} />,
      ),
    );

    expect(ref.current).toBe(screen.getByRole('combobox'));
  });

  it('calls onBlur when focus leaves, not when it moves into its own list', async () => {
    const user = userEvent.setup();
    const onBlur = jest.fn();
    const Harness = () => {
      const [value, setValue] = useState<string | null>(null);
      return withLabels(
        <>
          <Select
            label="Ülke"
            options={OPTIONS}
            value={value}
            onChange={setValue}
            onBlur={onBlur}
          />
          <button type="button">Sonraki</button>
        </>,
      );
    };
    render(<Harness />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Almanya' }));
    expect(onBlur).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveFocus();

    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

describe('Combobox — a form field', () => {
  it('hands its ref to the trigger', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      withLabels(
        <Combobox
          ref={ref}
          labels={COMBOBOX_LABELS}
          options={OPTIONS}
          value={null}
          onChange={() => {}}
        />,
      ),
    );

    expect(ref.current).toBe(screen.getByRole('combobox'));
  });

  it('calls onBlur when focus leaves, not on the way through its search box and options', async () => {
    const user = userEvent.setup();
    const onBlur = jest.fn();
    const onChange = jest.fn();
    render(
      withLabels(
        <>
          <Combobox
            labels={COMBOBOX_LABELS}
            options={OPTIONS}
            value={null}
            onChange={onChange}
            onBlur={onBlur}
          />
          <button type="button">Sonraki</button>
        </>,
      ),
    );

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('textbox', { name: 'Ara' })).toHaveFocus();
    await user.click(screen.getByRole('option', { name: 'Almanya' }));
    expect(onChange).toHaveBeenCalledWith('de');
    expect(onBlur).not.toHaveBeenCalled();

    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

describe('read-only', () => {
  it('Select and Combobox: focusable, announced read-only, they do not open', async () => {
    const user = userEvent.setup();
    render(
      withLabels(
        <>
          <Select label="Ülke" options={OPTIONS} value="tr" onChange={() => {}} isReadOnly />
          <Combobox
            labels={COMBOBOX_LABELS}
            options={OPTIONS}
            value="de"
            onChange={() => {}}
            isReadOnly
            isClearable
          />
        </>,
      ),
    );

    for (const trigger of screen.getAllByRole('combobox')) {
      expect(trigger).toBeEnabled();
      expect(trigger).toHaveAttribute('aria-readonly', 'true');
      await user.click(trigger);
      expect(trigger).toHaveFocus();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await user.keyboard('{ArrowDown}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }
    expect(screen.queryByRole('button', { name: 'Temizle' })).not.toBeInTheDocument();
  });

  it('QuantityStepper: the box stays focusable, nothing changes the number', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(withLabels(<QuantityStepper value={3} onChange={onChange} isReadOnly />));

    const box = screen.getByRole('spinbutton');
    expect(box).toHaveAttribute('aria-readonly', 'true');
    expect(box).toHaveAttribute('readonly');
    await user.click(box);
    await user.keyboard('{ArrowUp}{End}7{Enter}');
    screen.getAllByRole('button').forEach(button => expect(button).toBeDisabled());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('SegmentedControl and ChipGroup: neither a press nor an arrow key changes the choice', async () => {
    const user = userEvent.setup();
    const onSegment = jest.fn();
    const onChip = jest.fn();
    render(
      <>
        <SegmentedControl
          label="Görünüm"
          options={OPTIONS}
          value="tr"
          onChange={onSegment}
          isReadOnly
        />
        <ChipGroup label="Ülke" options={OPTIONS} value="tr" onChange={onChip} isReadOnly />
      </>,
    );

    const [segments, chips] = screen.getAllByRole('radiogroup');
    expect(segments).toHaveAttribute('aria-readonly', 'true');
    expect(chips).toHaveAttribute('aria-readonly', 'true');

    for (const group of [segments, chips]) {
      await user.click(within(group).getByRole('radio', { name: 'Almanya' }));
      within(group).getByRole('radio', { name: 'Türkiye' }).focus();
      await user.keyboard('{ArrowRight}');
    }
    expect(onSegment).not.toHaveBeenCalled();
    expect(onChip).not.toHaveBeenCalled();
  });

  it('RangeSlider, RatingInput, DateRange and TagInput: nothing changes the value', async () => {
    const user = userEvent.setup();
    const onRange = jest.fn();
    const onRating = jest.fn();
    const onDates = jest.fn();
    const onTags = jest.fn();
    render(
      withLabels(
        <>
          <RangeSlider
            label="Fiyat"
            min={0}
            max={100}
            value={[10, 90]}
            onChange={onRange}
            isReadOnly
          />
          <RatingInput label="Puan" value={3} onChange={onRating} isReadOnly />
          <DateRange
            startLabel="Başlangıç"
            endLabel="Bitiş"
            value={{ start: '2026-01-01', end: '' }}
            onChange={onDates}
            isReadOnly
          />
          <TagInput
            label="Etiketler"
            removeLabel="Kaldır"
            value={['a']}
            onChange={onTags}
            isReadOnly
          />
        </>,
      ),
    );

    const [low] = screen.getAllByRole('slider');
    expect(low).toHaveAttribute('aria-readonly', 'true');
    fireEvent.change(low, { target: { value: '40' } });
    await user.click(screen.getByRole('radio', { name: /^5/ }));
    expect(screen.getByLabelText('Başlangıç')).toHaveAttribute('readonly');
    const tags = screen.getByRole('textbox', { name: 'Etiketler' });
    expect(tags).toHaveAttribute('readonly');
    await user.type(tags, 'yeni{Enter}{Backspace}');

    expect(screen.queryByRole('button', { name: /Kaldır/ })).not.toBeInTheDocument();
    for (const handler of [onRange, onRating, onDates, onTags])
      expect(handler).not.toHaveBeenCalled();
  });
});

describe('group-wide isDisabled', () => {
  it('SegmentedControl and ChipGroup disable every item', () => {
    render(
      <>
        <SegmentedControl
          label="Görünüm"
          options={OPTIONS}
          value="tr"
          onChange={() => {}}
          isDisabled
        />
        <ChipGroup label="Ülke" options={OPTIONS} value={null} onChange={() => {}} isDisabled />
      </>,
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    radios.forEach(radio => expect(radio).toBeDisabled());
  });
});

describe('TagInput — value and the duplicate label', () => {
  it('takes value, the name every other field uses', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      withLabels(
        <TagInput label="Etiketler" removeLabel="Kaldır" value={['a']} onChange={onChange} />,
      ),
    );

    await user.type(screen.getByRole('textbox'), 'b{Enter}');
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('still takes values (deprecated)', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      withLabels(
        <TagInput label="Etiketler" removeLabel="Kaldır" values={['a']} onChange={onChange} />,
      ),
    );

    await user.type(screen.getByRole('textbox'), 'b{Enter}');
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });

  const announced = (): string =>
    document.querySelector('[aria-live="assertive"]')?.textContent ?? '';

  it.each([
    [
      'the prop',
      { duplicateLabel: (value: string) => `${value} already added` },
      undefined,
      'a already added',
    ],
    ['UiProvider', {}, (value: string) => `${value} listede var`, 'a listede var'],
    ['the 2.0 fallback', {}, undefined, 'a zaten ekli'],
  ])('announces a duplicate with %s', async (_, props, provided, expected) => {
    const user = userEvent.setup();
    render(
      <UiProvider labels={{ ...LABELS, tagInput: { ...LABELS.tagInput, duplicate: provided } }}>
        <TagInput
          label="Etiketler"
          removeLabel="Kaldır"
          value={['a']}
          onChange={() => {}}
          {...props}
        />
      </UiProvider>,
    );

    await user.type(screen.getByRole('textbox'), 'a{Enter}');
    await waitFor(() => expect(announced()).toBe(expected));
  });
});

describe('Button isLoading — busy without an empty status', () => {
  it('announces aria-busy and renders no role="status"', () => {
    render(withLabels(<Button isLoading>Kaydet</Button>));

    const button = screen.getByRole('button', { name: 'Kaydet' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('has no axe violations while busy', async () => {
    const { container } = render(withLabels(<Button isLoading>Kaydet</Button>));

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Progress — named by aria-labelledby', () => {
  it.each([
    ['Progress', Progress],
    ['ProgressCircle', ProgressCircle],
  ] as const)('%s takes its name from visible text', async (_, Bar) => {
    const { container } = render(
      <>
        <h3 id="upload">rapor.pdf yükleniyor</h3>
        <Bar aria-labelledby="upload" value={40} />
      </>,
    );

    const bar = screen.getByRole('progressbar', { name: 'rapor.pdf yükleniyor' });
    expect(bar).not.toHaveAttribute('aria-label');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('still takes label', () => {
    render(<Progress label="Yükleme" value={40} />);

    expect(screen.getByRole('progressbar', { name: 'Yükleme' })).toBeInTheDocument();
  });
});

describe('DateField itself', () => {
  it('is unchanged: a native date input that spreads its props', () => {
    render(<DateField aria-label="Tarih" aria-invalid readOnly />);

    expect(screen.getByLabelText('Tarih')).toHaveAttribute('readonly');
  });
});
