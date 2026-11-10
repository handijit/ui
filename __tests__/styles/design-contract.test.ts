/**
 * @jest-environment node
 */
/* dart2js Sass fails under jsdom; compiling needs no DOM. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

import { compile, compileString } from 'sass';

import { breakpoints, layers } from '@handijit/design';

/*
 * THE DESIGN CONTRACT — the library draws with the tokens of `@handijit/design` and owns none.
 *
 * `styles/_variables.scss` is a hand-written alias layer: `$text: var(--hd-text)`. Nothing checks a
 * hand-written name against the package that defines it, and a misspelt custom property is not an
 * error anywhere — the declaration is simply dropped by the browser and the component loses a
 * colour in one theme. This test compiles every stylesheet and looks each name up in the tokens
 * file the installed design package ships.
 */
const ROOT = resolve(__dirname, '../..');
const STYLES = join(ROOT, 'src/styles');

/*
 * The path comes from the package's own exports map. Resolving `@handijit/design/tokens.css`
 * directly would hand back the style stub: Jest maps every `.css` request to it.
 */
const nodeRequire = createRequire(join(ROOT, 'package.json'));
const DESIGN_PACKAGE = nodeRequire.resolve('@handijit/design/package.json');
const DESIGN_EXPORTS = (
  JSON.parse(readFileSync(DESIGN_PACKAGE, 'utf8')) as {
    exports: Record<string, { default: string }>;
  }
).exports;
const DESIGN_TOKENS = readFileSync(
  resolve(dirname(DESIGN_PACKAGE), DESIGN_EXPORTS['./tokens.css'].default),
  'utf8',
);

const declaredTokens = new Set(DESIGN_TOKENS.match(/--hd-[a-z0-9-]+(?=\s*:)/g));

const walk = (directory: string): string[] =>
  readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const SOURCES = walk(join(ROOT, 'src'));
const STYLESHEETS = SOURCES.filter(
  path => path.endsWith('.scss') && !path.split('/').pop()?.startsWith('_'),
);

const compiled = STYLESHEETS.map(path => ({
  path: path.slice(ROOT.length + 1),
  css: compile(path, { loadPaths: [STYLES] }).css,
}));

/* Every variable of the alias layer, printed once: an unused alias is checked too. */
const aliasCss = (): string => {
  const source = readFileSync(join(STYLES, '_variables.scss'), 'utf8');
  const names = [...source.matchAll(/^\$([a-z0-9-]+):/gm)].map(match => match[1]);
  const body = names
    .map(name => `--probe-${name}: #{meta.inspect(variables.$${name})};`)
    .join('\n');

  return compileString(`@use 'sass:meta';\n@use 'variables';\n.probe {\n${body}\n}`, {
    loadPaths: [STYLES],
  }).css;
};

const referenced = (css: string): string[] => css.match(/--hd-[a-z0-9-]+/g) ?? [];

describe('design contract', () => {
  it('the installed design package ships the tokens file', () => {
    expect(declaredTokens.size).toBeGreaterThan(150);
    expect(declaredTokens).toContain('--hd-primary');
  });

  it('every --hd-* name in a compiled stylesheet exists in @handijit/design', () => {
    const unknown = compiled.flatMap(({ path, css }) =>
      [...new Set(referenced(css))]
        .filter(name => !declaredTokens.has(name))
        .map(name => `${path}: ${name}`),
    );

    expect(unknown).toEqual([]);
  });

  it('every alias in _variables.scss points at an existing token', () => {
    const unknown = [...new Set(referenced(aliasCss()))].filter(name => !declaredTokens.has(name));

    expect(unknown).toEqual([]);
  });

  /* `cssVar()` is typed, a template string is not: `var(--hd-…)` written by hand in a component. */
  it('every --hd-* name written in TypeScript exists too', () => {
    const unknown = SOURCES.filter(path => /\.tsx?$/.test(path)).flatMap(path =>
      [...new Set(referenced(readFileSync(path, 'utf8')))]
        .filter(name => !declaredTokens.has(name))
        .map(name => `${path.slice(ROOT.length + 1)}: ${name}`),
    );

    expect(unknown).toEqual([]);
  });

  /*
   * The library defines NO token of its own. Before 2.0 it shipped a whole `--ui-*` palette; a
   * second global palette next to the design one is exactly what this release removed. What is
   * left under `--ui-` is component-private: animation names and per-instance hooks.
   */
  it('the global stylesheet declares no palette — only animation names on :root', () => {
    const base = compiled.find(({ path }) => path === 'src/styles/base.scss')?.css ?? '';
    const declared = [...new Set(base.match(/--[a-z][a-z0-9-]*(?=\s*:)/g))];

    expect(declared.length).toBeGreaterThan(0);
    expect(declared.filter(name => !name.startsWith('--ui-anim-'))).toEqual([]);
  });

  it('no stylesheet DECLARES an --hd-* property — overriding a token is the application’s call', () => {
    const offenders = compiled
      .filter(({ css }) => /--hd-[a-z0-9-]+\s*:/.test(css))
      .map(({ path }) => path);

    expect(offenders).toEqual([]);
  });

  /* A media query cannot read a custom property, so the breakpoints are copied — and compared. */
  it('the breakpoints equal the design package’s', () => {
    const css = compileString(
      `@use 'variables' as v;\n.probe { sm: v.$breakpoint-sm; md: v.$breakpoint-md; lg: v.$breakpoint-lg; xl: v.$breakpoint-xl; }`,
      { loadPaths: [STYLES] },
    ).css;

    for (const [name, value] of Object.entries(breakpoints))
      expect(css).toContain(`${name}: ${value}px;`);
  });

  it('the layer aliases cover every layer of the design package', () => {
    const source = readFileSync(join(STYLES, '_variables.scss'), 'utf8');

    for (const name of Object.keys(layers))
      expect(source).toContain(`$z-${name}: var(--hd-z-${name});`);
  });

  /* A literal colour in a component is a colour that does not follow the theme. */
  it('no stylesheet carries a literal colour', () => {
    const literal = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(\s*[\d.]/i;
    /* A mask is not a colour: its only job is to be opaque or transparent. */
    const isMask = (line: string) => /^\s*#000\b/.test(line);

    const offenders = SOURCES.filter(path => path.endsWith('.scss')).flatMap(path =>
      readFileSync(path, 'utf8')
        .split('\n')
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => !/^\s*(\/\/|\/?\*)/.test(line) && literal.test(line) && !isMask(line))
        .map(({ index }) => `${path.slice(ROOT.length + 1)}:${index + 1}`),
    );

    expect(offenders).toEqual([]);
  });
});
