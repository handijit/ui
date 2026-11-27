/**
 * Bulk paste parser (3.1): a pasted list of part codes and quantities → rows.
 *
 * ⚠ No `'use client'`: the parser is a plain function, callable in a server action or a worker.
 * `BulkPasteInput` (a client module) uses it; the root entry exports it from HERE so that a server
 * component calling it does not reach a client reference.
 */

export type BulkPasteRow = {
  code: string;
  quantity: number;
  /** 1-based line of the pasted text (the first line when duplicates were merged). */
  line: number;
};

export type BulkPasteInvalidReason = 'missingCode' | 'invalidQuantity';

export type BulkPasteInvalidLine = {
  /** 1-based line of the pasted text. */
  line: number;
  /** The line as pasted, trimmed. */
  text: string;
  reason: BulkPasteInvalidReason;
};

export type BulkPasteResult = {
  rows: BulkPasteRow[];
  invalid: BulkPasteInvalidLine[];
};

export type BulkPasteOptions = {
  /** Quantity of a line that names only a code. Default 1. */
  defaultQuantity?: number;
  /** Adds up the quantities of a code that appears on several lines. Default `false`. */
  isMergingDuplicates?: boolean;
};

/*
 * The number grammar of the data contract (the one `QuantityInput` reads): the comma is the decimal
 * point and dots only group by three, so "1.250" is a thousand two hundred and fifty. A quantity of
 * a part is whole: a zero fraction ("2,00", a spreadsheet's number format) is allowed, "1,5" is not.
 */
const QUANTITY = /^([1-9]\d{0,2}(?:\.\d{3})+|\d+)(?:,0+)?$/;

/** A positive whole quantity, or `null`. */
const parseQuantity = (cell: string): number | null => {
  const match = QUANTITY.exec(cell);
  if (!match) return null;

  const value = Number(match[1].replace(/\./g, ''));

  return value > 0 && Number.isSafeInteger(value) ? value : null;
};

/**
 * The cells of one line. A spreadsheet copy is tab separated; otherwise `;`, then `,`, then runs of
 * spaces ("ABC-123  4"), where the last word is the quantity only if it is a number.
 */
const splitLine = (line: string): string[] => {
  for (const separator of ['\t', ';', ',']) {
    if (line.includes(separator)) return line.split(separator).map(cell => cell.trim());
  }

  const words = line.trim().split(/\s+/);
  const last = words.at(-1) as string;

  return words.length > 1 && parseQuantity(last) !== null
    ? [words.slice(0, -1).join(' '), last]
    : [line.trim()];
};

/**
 * Parses pasted text into `{ code, quantity }` rows. Blank lines are skipped; a line with a code and
 * no quantity takes `defaultQuantity`; extra cells (a description column) are skipped and the first
 * number after the code is the quantity. Codes are kept as written (trimmed).
 * @example parseBulkPaste('0986494524\t2\nGDB1550 4') // 2 rows
 */
export const parseBulkPaste = (
  text: string,
  { defaultQuantity = 1, isMergingDuplicates = false }: BulkPasteOptions = {},
): BulkPasteResult => {
  const rows: BulkPasteRow[] = [];
  const invalid: BulkPasteInvalidLine[] = [];
  const byCode = new Map<string, BulkPasteRow>();

  text.split(/\r\n|\r|\n/).forEach((raw, position) => {
    const line = raw.trim();
    if (!line) return;

    /* Split BEFORE trimming: a leading tab is an empty code cell, not nothing. */
    const [code, ...cells] = splitLine(raw);
    const rest = cells.filter(Boolean);
    const quantity =
      rest.length === 0 ? defaultQuantity : (rest.map(parseQuantity).find(Boolean) ?? null);

    if (!code) {
      invalid.push({ line: position + 1, text: line, reason: 'missingCode' });
      return;
    }
    if (quantity === null) {
      invalid.push({ line: position + 1, text: line, reason: 'invalidQuantity' });
      return;
    }

    const existing = isMergingDuplicates ? byCode.get(code) : undefined;
    if (existing) {
      existing.quantity += quantity;
      return;
    }

    const row = { code, quantity, line: position + 1 };
    rows.push(row);
    byCode.set(code, row);
  });

  return { rows, invalid };
};
