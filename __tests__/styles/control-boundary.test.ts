/**
 * @jest-environment node
 */
/* dart2js Sass fails under jsdom; compiling needs no DOM. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { compile } from 'sass';

const read = (path: string): string => readFileSync(path, 'utf8');

/** The body of the block a line opens with `selector {` (nested blocks included). */
const blockOf = (source: string, selector: string): string => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^\\s*${escaped}(?:\\([^)]*\\))? \\{`, 'm').exec(source);
  if (!match) throw new Error(`${selector} not found`);
  let depth = 0;
  for (let index = source.indexOf('{', match.index); index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(match.index, index + 1);
  }
  throw new Error(`${selector} is not closed`);
};

/** The declarations of a block itself, without its nested blocks. */
const ownDeclarations = (block: string): string => {
  let depth = 0;
  let own = '';
  for (const character of block) {
    if (character === '}') depth -= 1;
    if (depth === 1 && character !== '{') own += character;
    if (character === '{') depth += 1;
  }
  return own;
};

const stylesheets = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return stylesheets(path);
    return entry.name.endsWith('.module.scss') ? [path] : [];
  });

/*
 * WCAG 1.4.11: the edge is all that marks an EMPTY form control, so it has to be 3:1 against what
 * the control sits on. `border` (1.3:1) and `border-strong` (1.5:1 / 2.1:1) are separators; the
 * resting boundary of a control is `border-control` (design 1.1). Every control is listed here: a
 * new one is added to the list, never drawn with a separator colour.
 */
const RESTING_BOUNDARIES: ReadonlyArray<{
  control: string;
  file: string;
  selector: string;
  declaration: RegExp;
}> = [
  {
    control: 'Input, PasswordInput, Textarea, Select, Combobox, DateField, TagInput',
    file: 'src/styles/_mixins.scss',
    selector: '@mixin input-base',
    declaration: /border:\s*1px solid \$border-control;/,
  },
  {
    control: 'Checkbox, Radio, TableCheckbox',
    file: 'src/styles/_mixins.scss',
    selector: '@mixin choice-control',
    declaration: /border:\s*1\.5px solid \$border-control;/,
  },
  {
    control: 'Switch (off track)',
    file: 'src/components/Switch/index.module.scss',
    selector: '.switch__track',
    declaration: /background-color:\s*\$border-control;/,
  },
  {
    control: 'QuantityStepper',
    file: 'src/components/QuantityStepper/index.module.scss',
    selector: '.stepper',
    declaration: /border:\s*1px solid \$border-control;/,
  },
  {
    control: 'FileUpload (drop zone)',
    file: 'src/components/FileUpload/index.module.scss',
    selector: '.upload__drop',
    declaration: /border:\s*2px dashed \$border-control;/,
  },
  {
    control: 'SegmentedControl',
    file: 'src/components/SegmentedControl/index.module.scss',
    selector: '.segmented',
    declaration: /border:\s*1px solid \$border-control;/,
  },
  {
    control: 'RadioCard (indicator)',
    file: 'src/components/RadioCard/index.module.scss',
    selector: '&__indicator',
    declaration: /border:\s*1px solid \$border-control;/,
  },
  {
    control: 'PromptInput (box)',
    file: 'src/chat/PromptInput/index.module.scss',
    selector: '.prompt__box',
    declaration: /border:\s*1px solid \$border-control;/,
  },
];

describe('the resting boundary of a form control', () => {
  it.each(RESTING_BOUNDARIES)(
    '$control draws it with `border-control`',
    ({ file, selector, declaration }) => {
      expect(ownDeclarations(blockOf(read(file), selector))).toMatch(declaration);
    },
  );

  it('a field on hover darkens the boundary itself, so the step follows the theme', () => {
    const base = blockOf(read('src/styles/_mixins.scss'), '@mixin input-base');

    expect(base).toMatch(/border-color:\s*color-mix\(in oklab, #\{\$border-control\}, #\{\$text\}/);
    expect(base).not.toContain('$border-strong');
  });

  it('nothing but a control uses the role: separators, cards and table rules keep `border`', () => {
    const allowed = new Set(RESTING_BOUNDARIES.map(({ file }) => file));
    const users = [...stylesheets('src'), 'src/styles/_mixins.scss'].filter(path =>
      read(path).includes('$border-control'),
    );

    expect(users.filter(path => !allowed.has(path))).toEqual([]);
    expect(read('src/styles/_variables.scss')).toContain(
      '$border-control: var(--hd-border-control);',
    );
  });
});

/*
 * `:indeterminate` matches a mixed checkbox AND every radio of a group in which nothing is chosen
 * yet. Until 2.1 the shared mixin filled both, so an unanswered radio group was drawn with all of
 * its options selected.
 */
describe('the filled state of a choice control', () => {
  const css = (path: string): string => compile(path, { loadPaths: ['src/styles'] }).css;

  it('a radio is filled by `:checked` alone', () => {
    const radio = css('src/components/Radio/index.module.scss');

    expect(radio).toContain('.radio__input:checked');
    expect(radio).not.toContain(':indeterminate');
  });

  it('a checkbox keeps its mixed state', () => {
    expect(css('src/components/Checkbox/index.module.scss')).toContain(
      '.checkbox__input:indeterminate',
    );
    expect(css('src/components/TableCheckbox/index.module.scss')).toContain(':indeterminate');
  });
});
