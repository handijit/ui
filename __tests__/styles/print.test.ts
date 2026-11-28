/**
 * @jest-environment node
 */
/* dart2js Sass fails under jsdom; compiling needs no DOM. */
import { join, resolve } from 'node:path';

import { compile } from 'sass';

const ROOT = resolve(__dirname, '../..');

type Rule = { selectors: string[]; declarations: Record<string, string> };

/** The text of every `@media print` block of a compiled stylesheet, braces matched. */
const printBlocksOf = (path: string): string[] => {
  const css = compile(join(ROOT, path), { loadPaths: [join(ROOT, 'src/styles')] }).css.replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
  const blocks: string[] = [];
  for (const match of css.matchAll(/@media print\s*\{/g)) {
    let depth = 1;
    let end = match.index + match[0].length;
    while (depth > 0) {
      if (css[end] === '{') depth += 1;
      if (css[end] === '}') depth -= 1;
      end += 1;
    }
    blocks.push(css.slice(match.index + match[0].length, end - 1));
  }

  return blocks;
};

/** The rules that apply in print only, each with its declarations. */
const printRulesOf = (path: string): Rule[] =>
  printBlocksOf(path).flatMap(block =>
    [...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectors, body]) => ({
      selectors: selectors.split(',').map(selector => selector.trim()),
      declarations: Object.fromEntries(
        body
          .split(';')
          .map(declaration => declaration.split(':').map(part => part.trim()))
          .filter(([property, value]) => property && value)
          .map(([property, ...value]) => [property, value.join(':')]),
      ),
    })),
  );

/** What print sets on a selector, every rule naming it merged. */
const printed = (path: string, selector: string): Record<string, string> =>
  Object.assign(
    {},
    ...printRulesOf(path)
      .filter(rule => rule.selectors.includes(selector))
      .map(rule => rule.declarations),
  );

/*
 * PRINT (3.2.2): the paper holds the page. The portal's order and invoice pages are printed from
 * inside the shell; 3.2.1 put the sidebar, the sticky top bar and an open drawer on paper and cut
 * a capped table at its scroll box. jsdom lays nothing out, so the compiled rules are the contract.
 */
describe('print styles', () => {
  const shell = 'src/components/AppShell/index.module.scss';

  it('AppShell: hides its chrome and gives the content the full width', () => {
    for (const selector of ['.shell__skip', '.shell__sidebar', '.shell__topbar'])
      expect(printed(shell, selector)).toMatchObject({ display: 'none' });

    for (const selector of ['.shell', '.shell--collapsed'])
      expect(printed(shell, selector)).toMatchObject({ display: 'block', 'min-height': '0' });
    expect(printed(shell, '.shell__content')).toMatchObject({ padding: '0' });
  });

  it.each([
    ['Drawer', 'src/components/Drawer/index.module.scss', ['.drawer', '.drawer[open]']],
    ['Modal', 'src/components/Modal/index.module.scss', ['.modal', '.modal[open]']],
    ['BottomSheet', 'src/components/BottomSheet/index.module.scss', ['.sheet', '.sheet[open]']],
    ['Popover', 'src/components/Popover/index.module.scss', ['.popover']],
    ['Toast', 'src/components/Toast/index.module.scss', ['.hub']],
  ])('%s: never prints, open or not', (_name, path, selectors) => {
    for (const selector of selectors)
      expect(printed(path, selector)).toMatchObject({ display: 'none' });
  });

  describe('DataTable', () => {
    const table = 'src/components/DataTable/index.module.scss';

    it('lets the box grow to every row instead of scrolling', () => {
      for (const selector of [
        '.wrapper',
        '.wrapper--capped',
        '.wrapper--virtual:not(.wrapper--capped)',
      ])
        expect(printed(table, selector)).toMatchObject({
          'max-height': 'none',
          overflow: 'visible',
        });
    });

    it('drops the sticky header and column, at the specificity they were set', () => {
      for (const selector of [
        '.wrapper--capped .table thead th',
        '.wrapper--virtual .table thead th',
        '.sticky',
      ])
        expect(printed(table, selector)).toMatchObject({ position: 'static' });
    });

    it('repeats the header, keeps rows whole and frees the virtual row height', () => {
      expect(printed(table, '.table thead')).toMatchObject({ display: 'table-header-group' });
      expect(printed(table, '.table tr')).toMatchObject({ 'break-inside': 'avoid' });
      expect(printed(table, '.wrapper--virtual .table tbody tr')).toMatchObject({ height: 'auto' });
      expect(printed(table, '.wrapper--virtual .table td')).toMatchObject({
        'white-space': 'normal',
      });
    });

    it('hides the screen controls and the windowing spacers', () => {
      for (const selector of ['.toolbar', '.bulkBar', '.spacer'])
        expect(printed(table, selector)).toMatchObject({ display: 'none' });
    });
  });

  it('Table: grows, drops its sticky head and keeps rows whole', () => {
    const table = 'src/components/Table/index.module.scss';

    expect(printed(table, '.scroller')).toMatchObject({ overflow: 'visible' });
    expect(printed(table, '.table--sticky-head thead th')).toMatchObject({ position: 'static' });
    expect(printed(table, '.table thead')).toMatchObject({ display: 'table-header-group' });
    expect(printed(table, '.table tr')).toMatchObject({ 'break-inside': 'avoid' });
  });

  it('a stylesheet without print rules reads as none (the helper measures something)', () => {
    expect(printRulesOf('src/components/Badge/index.module.scss')).toEqual([]);
  });
});

/* TOTALS (3.2.2): amounts at the end in tabular figures; the grand total below a divider. */
describe('TotalsList styles', () => {
  const css = compile(join(ROOT, 'src/components/TotalsList/index.module.scss'), {
    loadPaths: [join(ROOT, 'src/styles')],
  }).css;
  const rule = (selector: string) =>
    new RegExp(`(^|\\n)${selector.replace(/[.[\]()]/g, '\\$&')} \\{([^}]*)\\}`).exec(css)?.[2] ??
    '';

  it('puts labels at the start and amounts at the end, digits aligned', () => {
    expect(rule('.totals__row')).toMatch(/justify-content: space-between/);
    expect(rule('.totals__value')).toMatch(/font-variant-numeric: tabular-nums/);
    expect(rule('.totals__value')).toMatch(/text-align: end/);
    expect(rule('.totals__value')).toMatch(/white-space: nowrap/);
  });

  it('sets the grand total apart with a divider and weight', () => {
    expect(rule('.totals__row--total')).toMatch(/border-block-start: 1px solid/);
    expect(rule('.totals__row--total')).toMatch(/font-weight:/);
  });
});
