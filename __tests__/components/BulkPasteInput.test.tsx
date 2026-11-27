import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BulkPasteInput, { parseBulkPaste as fromSubpath } from '@/components/BulkPasteInput';
import { parseBulkPaste } from '@/helpers/bulk-paste.helper';
import UiProvider from '@/theme/UiProvider';
import { LABELS } from '@tests/fixtures/labels';

const renderInput = (props: Partial<React.ComponentProps<typeof BulkPasteInput>> = {}) =>
  render(
    <UiProvider labels={LABELS}>
      <BulkPasteInput aria-label="Parça kodları" {...props} />
    </UiProvider>,
  );

describe('BulkPasteInput', () => {
  it('says nothing while empty', () => {
    renderInput();

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('parses a paste, reports the count and the skipped lines', () => {
    const onParse = jest.fn();
    const onChange = jest.fn();
    renderInput({ onParse, onChange });
    const field = screen.getByRole('textbox');

    fireEvent.change(field, { target: { value: 'SP-1\t2\nSP-2 x\n\t4\nSP-3' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onParse).toHaveBeenCalledWith(
      parseBulkPaste('SP-1\t2\nSP-2 x\n\t4\nSP-3'),
      'SP-1\t2\nSP-2 x\n\t4\nSP-3',
    );
    /* "SP-2 x" is a code with a space (no number at its end) and takes the default quantity. */
    expect(screen.getByRole('status')).toHaveTextContent('3 satır okundu');
    expect(screen.getByRole('status')).toHaveTextContent('1 satır okunamadı');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription(/3 satır okundu/);

    const items = screen.getAllByRole('listitem').map(item => item.textContent);
    expect(items).toEqual(['Satır 34Kod yok']);
  });

  it('lists a bad quantity with its reason; the code alone is a row', async () => {
    renderInput({ defaultValue: 'SP-1\tiki' });

    expect(screen.getByRole('listitem')).toHaveTextContent('Satır 1');
    expect(screen.getByRole('listitem')).toHaveTextContent('Adet okunamadı');

    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), 'SP-9');
    expect(screen.getByRole('status')).toHaveTextContent('1 satır okundu');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('a controlled value is drawn as given; options and label props apply', () => {
    const onParse = jest.fn();
    render(
      <BulkPasteInput
        aria-label="Kodlar"
        aria-describedby="hint"
        value={'A\t1\nA\t2'}
        isMergingDuplicates
        onParse={onParse}
        labels={{ summary: count => `${count} kalem` }}
        testId="paste"
        className="paste"
      />,
    );

    expect(screen.getByTestId('paste')).toHaveClass('paste');
    expect(screen.getByRole('status')).toHaveTextContent('1 kalem');
    expect(screen.getByRole('textbox').getAttribute('aria-describedby')).toMatch(/hint$/);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'B 3' } });
    expect(onParse).toHaveBeenCalledWith(
      { rows: [{ code: 'B', quantity: 3, line: 1 }], invalid: [] },
      'B 3',
    );
    expect(screen.getByRole('textbox')).toHaveValue('A\t1\nA\t2');
  });

  it('passes aria-invalid through and re-exports the parser for the subpath', () => {
    renderInput({ 'aria-invalid': true });

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(fromSubpath).toBe(parseBulkPaste);
  });
});
