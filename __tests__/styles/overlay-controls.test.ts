/**
 * @jest-environment node
 */
/* dart2js Sass fails under jsdom; compiling needs no DOM. */
import { join, resolve } from 'node:path';

import { compile } from 'sass';

const ROOT = resolve(__dirname, '../..');

type Rule = { selectors: string[]; declarations: Record<string, string> };

/** Every rule of a compiled stylesheet, at-rules flattened (a rule inside `@media` counts too). */
const rulesOf = (path: string): Rule[] => {
  const css = compile(join(ROOT, path), { loadPaths: [join(ROOT, 'src/styles')] }).css.replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );

  return [...css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)].map(([, selectors, body]) => ({
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

const declarationsOf = (rules: Rule[], selector: string): Record<string, string> =>
  Object.assign(
    {},
    ...rules.filter(rule => rule.selectors.includes(selector)).map(rule => rule.declarations),
  );

/** Rules that set `position` with the given class as their only class (specificity 0,1,0). */
const singleClassPositions = (rules: Rule[], className: string): string[] =>
  rules
    .filter(rule => rule.declarations.position !== undefined)
    .flatMap(rule => rule.selectors)
    .filter(selector => selector === `.${className}`);

/*
 * AN ICONBUTTON PLACED OVER SOMETHING NEEDS TWO CLASSES. `.iconButton` writes `position: relative`
 * (its `tap-target`) at one class and comes later in `styles.css` than `Gallery` and `Tabs`, so a
 * one-class `position: absolute` loses there. 3.2.0's gallery arrows fell into the flow under the
 * image and were drawn squeezed into a pill at its bottom-left corner.
 */
describe('IconButtons laid over content win over `.iconButton`', () => {
  it('Gallery: the arrows sit over the stage and the viewer at two classes', () => {
    const rules = rulesOf('src/components/Gallery/index.module.scss');

    expect(singleClassPositions(rules, 'arrow')).toEqual([]);
    expect(declarationsOf(rules, '.stage .arrow')).toMatchObject({
      position: 'absolute',
      'inset-block-start': '50%',
      translate: '0 -50%',
    });
    expect(declarationsOf(rules, '.viewer .arrow').position).toBe('fixed');
  });

  it('Gallery: the arrows show on hover or focus inside the stage', () => {
    const rules = rulesOf('src/components/Gallery/index.module.scss');

    expect(declarationsOf(rules, '.stage .arrow').opacity).toBe('0');
    expect(declarationsOf(rules, '.stage:hover .arrow').opacity).toBe('1');
    expect(declarationsOf(rules, '.stage:focus-within .arrow').opacity).toBe('1');
  });

  it('Tabs: the scroll buttons sit over the bar at two classes', () => {
    const rules = rulesOf('src/components/Tabs/index.module.scss');

    expect(singleClassPositions(rules, 'tabs__scroll')).toEqual([]);
    expect(declarationsOf(rules, '.tabs__bar > .tabs__scroll').position).toBe('absolute');
    expect(declarationsOf(rules, '.tabs__list')['mask-image']).toContain('--ui-tabs-fade-end');
  });
});

describe('AppShell sidebar (3.2.1)', () => {
  const rules = rulesOf('src/components/AppShell/index.module.scss');

  it('the column paints the background down the page; it is neither sticky nor viewport-tall', () => {
    const column = declarationsOf(rules, '.shell__sidebar');

    expect(column['background-color']).toBeDefined();
    expect(column['border-inline-end']).toBeDefined();
    expect(column.position).toBeUndefined();
    expect(column.height).toBeUndefined();
  });

  it('the inner box is sticky at the top and as tall as the viewport', () => {
    expect(declarationsOf(rules, '.shell__sidebar-inner')).toMatchObject({
      position: 'sticky',
      'inset-block-start': '0',
      height: '100dvh',
    });
  });

  it('the brand link lines its icon and name up a gap apart', () => {
    expect(declarationsOf(rules, '.shell__brand :where(a)')).toMatchObject({
      display: 'inline-flex',
      gap: 'var(--hd-space-2)',
    });
  });
});

describe('Breadcrumb never scrolls sideways (3.2.1)', () => {
  it('no rule makes the trail a scroll container', () => {
    const rules = rulesOf('src/components/Breadcrumb/index.module.scss');

    expect(rules.filter(rule => /auto|scroll/.test(rule.declarations['overflow-x'] ?? ''))).toEqual(
      [],
    );
    expect(declarationsOf(rules, '.breadcrumb__current')['text-overflow']).toBe('ellipsis');
  });
});

describe('capitals can be turned off (3.2.1)', () => {
  it.each([
    ['src/components/Eyebrow/index.module.scss', '.eyebrow--as-written'],
    ['src/components/PageHeader/index.module.scss', '.header__eyebrow--as-written'],
    ['src/components/SectionHeader/index.module.scss', '.header__overline--as-written'],
  ])('%s %s', (path, selector) => {
    expect(declarationsOf(rulesOf(path), selector)['text-transform']).toBe('none');
  });
});
