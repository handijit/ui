/**
 * @jest-environment node
 */
/* dart2js Sass fails under jsdom; compiling needs no DOM. */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { compile } from 'sass';

const ROOT = resolve(__dirname, '../..');

type Rule = { selectors: string[]; declarations: Record<string, string> };

/** The rules of a compiled stylesheet outside every at-rule, in source order. */
const rulesOf = (path: string): Rule[] => {
  const css = compile(join(ROOT, path), { loadPaths: [join(ROOT, 'src/styles')] })
    .css.replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@(?:media|supports)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');

  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectors, body]) => ({
    selectors: selectors.split(',').map(selector => selector.trim()),
    declarations: Object.fromEntries(
      body
        .split(';')
        .map(declaration => declaration.split(':').map(part => part.trim()))
        .filter(([property, value]) => property && value)
        .map(([property, ...value]) => [property, value.join(':')]),
    ),
  }));
};

const COLOURS = ['background-color', 'border-color', 'color'] as const;

/** What the listed selectors resolve to, later rules winning: the colours of one state. */
const coloursOf = (rules: Rule[], selectors: string[]): Record<string, string | undefined> => {
  const resolved: Record<string, string | undefined> = {};

  for (const selector of selectors) {
    const matching = rules.filter(rule => rule.selectors.includes(selector));
    if (matching.length === 0) throw new Error(`no rule for ${selector}`);
    for (const rule of matching)
      for (const property of COLOURS)
        if (rule.declarations[property] !== undefined)
          resolved[property] = rule.declarations[property];
  }

  return resolved;
};

const button = rulesOf('src/components/Button/index.module.scss');
const iconButton = rulesOf('src/components/IconButton/index.module.scss');

/*
 * 2.0 had `IconButton variant="outline"` as a NEUTRAL frame while `Button` `OUTLINE` was the cobalt
 * one, and no `secondary` on `IconButton`: an icon button next to a secondary button could not be
 * drawn as its pair. Since 2.1 the two variants of the same name are the same colours in every
 * state. This test reads both compiled stylesheets, so a change to one side fails here.
 */
describe.each(['secondary', 'outline'])(
  'IconButton `%s` has the colours of its Button pair',
  variant => {
    const states: ReadonlyArray<{ state: string; button: string[]; iconButton: string[] }> = [
      {
        state: 'resting',
        button: [`.button--${variant}`],
        iconButton: ['.iconButton', `.iconButton--${variant}`],
      },
      {
        state: 'hover',
        button: [`.button--${variant}`, `.button--${variant}:hover:not(:disabled)`],
        iconButton: [
          '.iconButton',
          `.iconButton--${variant}`,
          `.iconButton--${variant}:hover:not(:disabled)`,
        ],
      },
      {
        state: 'pressed',
        button: [
          `.button--${variant}`,
          `.button--${variant}:hover:not(:disabled)`,
          `.button--${variant}:active:not(:disabled)`,
        ],
        iconButton: [
          '.iconButton',
          `.iconButton--${variant}`,
          `.iconButton--${variant}:hover:not(:disabled)`,
          `.iconButton--${variant}:active:not(:disabled)`,
        ],
      },
      {
        state: 'disabled',
        button: [
          `.button--${variant}`,
          '.button:disabled:not(.button--on-band)',
          ...(variant === 'outline' ? ['.button--outline:disabled:not(.button--on-band)'] : []),
        ],
        iconButton: [
          '.iconButton',
          '.iconButton:disabled',
          `.iconButton--${variant}`,
          `.iconButton--${variant}:disabled`,
        ],
      },
    ];

    it.each(states)('$state', ({ button: buttonSelectors, iconButton: iconSelectors }) => {
      const expected = coloursOf(button, buttonSelectors);

      expect(Object.keys(expected).sort()).toEqual([...COLOURS].sort());
      expect(coloursOf(iconButton, iconSelectors)).toEqual(expected);
    });
  },
);

describe('IconButton variants', () => {
  it('the type lists exactly the variants the stylesheet draws', () => {
    const source = readFileSync(join(ROOT, 'src/components/IconButton/index.tsx'), 'utf8');
    const union = /export type IconButtonVariant =([^;]+);/.exec(source)?.[1] ?? '';
    const declared = [...union.matchAll(/'([a-z]+)'/g)].map(([, name]) => name).sort();

    expect(declared).toEqual(['accent', 'danger', 'ghost', 'outline', 'secondary', 'solid']);
    for (const variant of declared)
      expect(
        iconButton.some(rule =>
          rule.selectors.some(selector => selector.startsWith(`.iconButton--${variant}`)),
        ),
      ).toBe(true);
  });
});
