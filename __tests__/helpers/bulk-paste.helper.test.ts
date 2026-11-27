import { parseBulkPaste } from '@/helpers/bulk-paste.helper';

describe('parseBulkPaste', () => {
  it('reads a spreadsheet copy (tab separated, CRLF)', () => {
    expect(parseBulkPaste('0986494524\t2\r\nGDB1550\t4\r\n')).toEqual({
      rows: [
        { code: '0986494524', quantity: 2, line: 1 },
        { code: 'GDB1550', quantity: 4, line: 2 },
      ],
      invalid: [],
    });
  });

  it('reads `;`, `,` and space separated lines, and old Mac line ends', () => {
    expect(parseBulkPaste('A-1;3\rB-2,5\nC 3 7\n  D-4   9  ').rows).toEqual([
      { code: 'A-1', quantity: 3, line: 1 },
      { code: 'B-2', quantity: 5, line: 2 },
      { code: 'C 3', quantity: 7, line: 3 },
      { code: 'D-4', quantity: 9, line: 4 },
    ]);
  });

  it('a code alone takes the default quantity; blank lines are skipped but counted', () => {
    expect(parseBulkPaste('\nSP-1\n\n   \nSP 2 X', { defaultQuantity: 5 }).rows).toEqual([
      { code: 'SP-1', quantity: 5, line: 2 },
      { code: 'SP 2 X', quantity: 5, line: 5 },
    ]);
    expect(parseBulkPaste('SP-1').rows[0].quantity).toBe(1);
  });

  it('skips a description column: the first number after the code is the quantity', () => {
    expect(parseBulkPaste('SP-1\tFren balatası\t\t6\t2').rows).toEqual([
      { code: 'SP-1', quantity: 6, line: 1 },
    ]);
  });

  it('reads the data contract grammar: dots group by three, a zero fraction after the comma', () => {
    const { rows } = parseBulkPaste('A\t1.250\nB\t2,00\nC;1.250,000\nD\t1.000.000');

    expect(rows.map(row => row.quantity)).toEqual([1250, 2, 1250, 1_000_000]);
  });

  it('reports lines without a code and lines whose quantity is not a positive whole number', () => {
    const { rows, invalid } = parseBulkPaste(
      '\t5\nA\t0\nB\t1,5\nC\t-2\nD\tiki\nE\t1.25\nF\t99999999999999999999\n;7\nG\t0.250\nH\t3 500',
    );

    expect(rows).toEqual([]);
    expect(invalid).toEqual([
      { line: 1, text: '5', reason: 'missingCode' },
      { line: 2, text: 'A\t0', reason: 'invalidQuantity' },
      { line: 3, text: 'B\t1,5', reason: 'invalidQuantity' },
      { line: 4, text: 'C\t-2', reason: 'invalidQuantity' },
      { line: 5, text: 'D\tiki', reason: 'invalidQuantity' },
      { line: 6, text: 'E\t1.25', reason: 'invalidQuantity' },
      { line: 7, text: 'F\t99999999999999999999', reason: 'invalidQuantity' },
      { line: 8, text: ';7', reason: 'missingCode' },
      { line: 9, text: 'G\t0.250', reason: 'invalidQuantity' },
      { line: 10, text: 'H\t3 500', reason: 'invalidQuantity' },
    ]);
  });

  it('keeps duplicates apart unless asked to merge them', () => {
    const text = 'SP-1\t2\nSP-2\t1\nSP-1\t3';

    expect(parseBulkPaste(text).rows).toHaveLength(3);
    expect(parseBulkPaste(text, { isMergingDuplicates: true }).rows).toEqual([
      { code: 'SP-1', quantity: 5, line: 1 },
      { code: 'SP-2', quantity: 1, line: 2 },
    ]);
  });

  it('an empty text is no rows and no errors', () => {
    expect(parseBulkPaste('')).toEqual({ rows: [], invalid: [] });
  });

  it('parses 10 000 lines', () => {
    const text = Array.from({ length: 10_000 }, (_, index) => `SP-${index}\t${index + 1}`).join(
      '\n',
    );

    expect(parseBulkPaste(text).rows).toHaveLength(10_000);
  });
});
