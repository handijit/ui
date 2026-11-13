import {
  cleanScaledText,
  formatScaledValue,
  readScaledText,
  REFUSED,
  type ScaledReadOptions,
} from '@/helpers/scaled-number.helper';

/* The field options of a `Qty4` that takes every carried digit and negatives. */
const QTY4: ScaledReadOptions = {
  scaleDigits: 4,
  maxFractionDigits: 4,
  min: -Number.MAX_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER,
};

const read = (input: string, options: Partial<ScaledReadOptions> = {}) =>
  readScaledText(input, { ...QTY4, ...options });

/*
 * ⚠ THE SAME VECTORS AS `@handijit/app-kit` `__tests__/shared/parse-decimal.test.ts`
 * ("parseQuantity"). The grammar has two copies (the helper's header says why); a change to one
 * that this table does not follow is a drift between what a field takes and what an import reads.
 */
describe('readScaledText — the grammar of app-kit parseDecimal', () => {
  it("reads Turkish and programmer's decimals", () => {
    expect(read('12,5')).toBe(125_000);
    expect(read('12.5')).toBe(125_000);
    expect(read(' 3 ')).toBe(30_000);
    expect(read('-2,25')).toBe(-22_500);
    expect(read('1 234,5')).toBe(12_345_000);
    expect(read('+5')).toBe(50_000);
    expect(read(',5')).toBe(5000);
    expect(read('5,')).toBe(50_000);
  });

  it('reads a dot followed by groups of three as a thousands separator', () => {
    expect(read('1.250')).toBe(12_500_000);
    expect(read('1.234.567')).toBe(12_345_670_000);
    expect(read('-1.234')).toBe(-12_340_000);
    expect(read('1.234.567,8')).toBe(12_345_678_000);
    expect(read('1.25')).toBe(12_500);
  });

  it('with a comma, dots only group the whole part by three', () => {
    for (const input of [
      '12.34,5',
      '1.2,5',
      '1234.567,8',
      '.234,5',
      '1.234.56,7',
      '1,2.5',
      '1,234.5',
      '-12.34,5',
    ])
      expect([input, read(input)]).toEqual([input, REFUSED]);

    expect(read('1.234,5')).toBe(12_345_000);
    expect(read('-1.234.567,8')).toBe(-12_345_678_000);
    expect(read('1234,5')).toBe(12_345_000);
  });

  it('a group of thousands never starts with zero, so "0.250" is a quarter', () => {
    expect(read('0.250')).toBe(2500);
    expect(read('-0.500')).toBe(-5000);
    expect(read('+0.125')).toBe(1250);
    expect(read('00.234')).toBe(2340);
    expect(read('000.000')).toBe(0);
    expect(read('0.234.567')).toBe(REFUSED);
    expect(read('0.234,5')).toBe(REFUSED);
    expect(read('01.234,5')).toBe(REFUSED);
    expect(read('100.250')).toBe(1_002_500_000);
    expect(read('1.000,5')).toBe(10_005_000);
  });

  it('refuses what is not a number', () => {
    for (const input of ['1,2,3', '1.2.3', '1e3', '--1', '1-2', '12a5'])
      expect([input, read(input)]).toEqual([input, REFUSED]);
  });
});

describe('readScaledText — a field being typed', () => {
  it('is null for nothing yet, and for a number on its way', () => {
    for (const input of ['', '  ', 'abc', ',', '-', '1.250.', '1.250.0', '-1.250.00'])
      expect([input, read(input)]).toEqual([input, null]);
  });

  it('a trailing separator keeps the number: "12," and "1." are whole', () => {
    expect(read('12,')).toBe(120_000);
    expect(read('1.')).toBe(10_000);
  });

  it('is exact where a float is not: "0,1" is 10 at scale 2', () => {
    expect(read('0,1', { scaleDigits: 2, maxFractionDigits: 2 })).toBe(10);
    expect(read('0,29', { scaleDigits: 2, maxFractionDigits: 2 })).toBe(29);
    expect(read('1.234,56', { scaleDigits: 2, maxFractionDigits: 2 })).toBe(123_456);
  });

  it('refuses one decimal too many — typed, not rounded', () => {
    expect(read('2,555', { scaleDigits: 2, maxFractionDigits: 2 })).toBe(REFUSED);
    expect(read('2,5', { maxFractionDigits: 0 })).toBe(REFUSED);
    expect(read('2', { maxFractionDigits: 0 })).toBe(20_000);
    expect(read('2,', { maxFractionDigits: 0 })).toBe(REFUSED);
    expect(read('1.250', { maxFractionDigits: 0 })).toBe(12_500_000);
    /* `maxFractionDigits` is never wider than the scale. */
    expect(read('2,555', { scaleDigits: 2, maxFractionDigits: 6 })).toBe(REFUSED);
  });

  it('refuses a minus sign when `min` is not negative, even on its own', () => {
    expect(read('-', { min: 0 })).toBe(REFUSED);
    expect(read('-5', { min: 0 })).toBe(REFUSED);
    expect(read('-1.250.0', { min: 0 })).toBe(REFUSED);
    expect(read('-0', { min: -10 })).toBe(0);
    expect(Object.is(read('-0', { min: -10 }), -0)).toBe(false);
  });

  it('refuses a keystroke past `max` or under a negative `min`', () => {
    expect(read('1,0001', { max: 10_000 })).toBe(REFUSED);
    expect(read('1', { max: 10_000 })).toBe(10_000);
    expect(read('-2', { min: -10_000 })).toBe(REFUSED);
    /* Under a positive `min` the digits on the way up are taken. */
    expect(read('0', { min: 50_000 })).toBe(0);
  });

  it('refuses a number past the safe integers', () => {
    expect(read('9007199254740992', { scaleDigits: 0, maxFractionDigits: 0 })).toBe(REFUSED);
    expect(read('9007199254740991', { scaleDigits: 0, maxFractionDigits: 0 })).toBe(
      Number.MAX_SAFE_INTEGER,
    );
  });
});

describe('cleanScaledText', () => {
  it('drops spaces and the signs around a pasted number', () => {
    expect(cleanScaledText(' 1 234,56 TL ')).toBe('1234,56');
    expect(cleanScaledText('%12,5')).toBe('12,5');
    expect(cleanScaledText('₺-5')).toBe('-5');
    expect(cleanScaledText('1e3')).toBe('1e3');
  });
});

describe('formatScaledValue', () => {
  const format = (value: number, scaleDigits: number, minFractionDigits = 0, isGrouped = true) =>
    formatScaledValue(value, { scaleDigits, minFractionDigits, isGrouped });

  it('groups the whole part and pads to the shown places', () => {
    expect(format(123_456, 2, 2)).toBe('1.234,56');
    expect(format(123_450, 2, 2)).toBe('1.234,50');
    expect(format(123_400, 2, 0)).toBe('1.234');
    expect(format(12_345_678_901, 2, 2)).toBe('123.456.789,01');
  });

  it('shows every carried digit that is not a trailing zero', () => {
    expect(format(125_000, 4)).toBe('12,5');
    expect(format(1, 4)).toBe('0,0001');
    expect(format(34_123_456, 6, 4)).toBe('34,123456');
    expect(format(34_120_000, 6, 4)).toBe('34,1200');
  });

  it('writes the plain text of an edited field', () => {
    expect(format(123_456, 2, 2, false)).toBe('1234,56');
  });

  it('a scale of zero and a negative value', () => {
    expect(format(1500, 0)).toBe('1.500');
    expect(format(-123_456, 2, 2)).toBe('-1.234,56');
    expect(format(0, 2, 2)).toBe('0,00');
    expect(format(-0, 2)).toBe('0');
  });

  it('round-trips through the reader', () => {
    for (const value of [0, 1, 99, 123_456, -5_000_001, 9_007_199_254_740_991]) {
      const text = format(value, 4, 0);
      expect(read(text, { min: -Number.MAX_SAFE_INTEGER })).toBe(value);
    }
  });
});
