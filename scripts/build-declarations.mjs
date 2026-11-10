#!/usr/bin/env node
/**
 * DECLARATIONS FOR EVERY RESOLUTION — `build/**\/*.d.ts` and their `.d.cts` twins (2.2).
 *
 * Both emitters write the import specifiers of the source: extensionless (`'./Spinner'`) and, in
 * the sub-entries' `tsc` pass, the `@/` alias of `tsconfig.json`. A bundler resolves both; Node's
 * resolution (`moduleResolution: "node16"` / `"nodenext"`) resolves neither, so a consumer on it
 * got the props of a component as `any`, silently under `skipLibCheck`. Measured with
 * `attw --pack`: "Internal resolution error" on the root and 30 sub-paths.
 *
 * 1. Every relative or `@/` specifier is written as the file Node would load: `./Spinner.js` or
 *    `./Spinner/index.js` — the declaration next to it is what TypeScript reads.
 * 2. Every `.d.ts` gets a `.d.cts` twin with `.cjs` specifiers. The package is `"type": "module"`,
 *    so a `.d.ts` declares an ES module; the `require` condition of `exports` points at the twin,
 *    or a CommonJS consumer on Node's resolution is told the package is ESM-only ("Masquerading as
 *    ESM").
 *
 * ⚠ A specifier that resolves to no declaration fails the build: it would be `any` in a consumer.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const BUILD = join(ROOT, 'build');
/* The sub-entries' `tsc` pass emits under `build/types` with `rootDir: src`: `@/` is that folder. */
const SUB_ENTRY_ROOT = join(BUILD, 'types');

const SPECIFIER = /((?:\bfrom|\bimport)\s*\(?\s*)'((?:\.{1,2}\/|@\/)[^']*)'/g;

const declarations = directory =>
  readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return declarations(path);
    return path.endsWith('.d.ts') ? [path] : [];
  });

const toPosix = path => path.split(sep).join('/');

/** `'./Spinner'` in `file` → `./Spinner` or `./Spinner/index` (without an extension). */
const resolveBase = (file, specifier) => {
  const fromAlias = specifier.startsWith('@/');
  const target = fromAlias
    ? join(SUB_ENTRY_ROOT, specifier.slice(2))
    : join(dirname(file), specifier.replace(/\.js$/, ''));

  const candidates = [target, join(target, 'index')];
  const found = candidates.find(candidate => existsSync(`${candidate}.d.ts`));
  if (!found)
    throw new Error(
      `${toPosix(relative(ROOT, file))}: '${specifier}' resolves to no declaration file.`,
    );

  const path = toPosix(relative(dirname(file), found));
  return path.startsWith('.') ? path : `./${path}`;
};

let rewritten = 0;
const files = declarations(BUILD);

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const bases = new Map();

  for (const [, , specifier] of source.matchAll(SPECIFIER))
    if (!bases.has(specifier)) bases.set(specifier, resolveBase(file, specifier));

  const write = extension =>
    source.replace(
      SPECIFIER,
      (_, prefix, specifier) => `${prefix}'${bases.get(specifier)}.${extension}'`,
    );

  if (bases.size > 0) {
    writeFileSync(file, write('js'));
    rewritten += 1;
  }
  writeFileSync(file.replace(/\.d\.ts$/, '.d.cts'), write('cjs'));
}

console.log(
  `✓ declarations: ${rewritten} of ${files.length} files with Node-resolvable imports, ${files.length} .d.cts twins.`,
);
