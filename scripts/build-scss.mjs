#!/usr/bin/env node
/**
 * SCSS API — copies the public modules of `src/styles` to `build/scss/` (`exports["./scss"]`).
 *
 * The set is CLOSED: `_index` forwards `variables` and `mixins`, and neither reaches outside the
 * set — every theme value in them is a literal `var(--hd-*)`, so the consumer's Sass never has to
 * resolve `@handijit/design`. `base.scss` (reset, `@keyframes`) stays out on purpose: the
 * consumer already gets it in `styles.css`, and compiling it again would print its rules per `@use`.
 * ⚠ A missing file or a `@use` outside the list fails the build.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SOURCE = join(ROOT, 'src', 'styles');
const TARGET = join(ROOT, 'build', 'scss');

const FILES = ['_index.scss', '_variables.scss', '_mixins.scss'];

const MODULES = new Set(FILES.map(file => file.replace(/^_|\.scss$/g, '')));

mkdirSync(TARGET, { recursive: true });

for (const file of FILES) {
  const source = join(SOURCE, file);
  if (!existsSync(source)) {
    console.error(`✗ SCSS API: ${file} is missing.`);
    process.exit(1);
  }

  /* A copied module that reaches OUTSIDE the set would not resolve in the consumer; fail here. */
  for (const [, target] of readFileSync(source, 'utf8').matchAll(/^@(?:use|forward) '([^']+)'/gm))
    if (!target.startsWith('sass:') && !MODULES.has(target)) {
      console.error(`✗ SCSS API: ${file} → '${target}' is outside the copied set.`);
      process.exit(1);
    }

  copyFileSync(source, join(TARGET, file));
}

console.log(`✓ SCSS API: ${FILES.length} files → build/scss/`);
