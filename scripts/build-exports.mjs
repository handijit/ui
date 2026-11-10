#!/usr/bin/env node
/**
 * `package.json` `exports` HARİTASI — bileşen başına alt yol (6.0).
 *
 * `src/index.ts`in `./components/<Ad>` dizinlerinden yeniden dışa aktardığı her bileşen bir alt yol
 * alır: `@handijit/ui/button` → `build/components/Button/index.{js,cjs,d.ts}`. Alt yol adı dizin
 * adının kebab hâlidir (`ChipGroup` → `chip-group`). Her koşul kendi tipini taşır (2.2): `import` →
 * `.d.ts`, `require` → `.d.cts` (`scripts/build-declarations.mjs`); tek bir üst düzey `types`
 * CommonJS tüketicisine ES modülü bildiriyordu. Sabit girişler (`.`, `./base.css`, `./styles.css`,
 * `./chat`, `./charts`, `./scss`) burada tanımlıdır; harita ELLE DÜZENLENMEZ.
 *
 *   node scripts/build-exports.mjs          → package.json'u yazar
 *   node scripts/build-exports.mjs --check  → harita güncel mi, hedef dosyalar `build/`de var mı
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PACKAGE = join(ROOT, 'package.json');
const isCheck = process.argv.includes('--check');

const kebab = name => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** `types` is the declaration path without its extension; `js` the module without `.js`/`.cjs`. */
const conditions = (types, js) => ({
  import: { types: `./build/${types}.d.ts`, default: `./build/${js}.js` },
  require: { types: `./build/${types}.d.cts`, default: `./build/${js}.cjs` },
});

const entry = base => conditions(base, base);

const index = readFileSync(join(ROOT, 'src/index.ts'), 'utf8');
const components = [...index.matchAll(/from '\.\/components\/([A-Z]\w*)'/g)]
  .map(match => match[1])
  .filter((name, position, all) => all.indexOf(name) === position)
  .sort((a, b) => a.localeCompare(b));

const subpaths = Object.fromEntries(
  components.map(name => [`./${kebab(name)}`, entry(`components/${name}/index`)]),
);

const exportsMap = {
  '.': entry('index'),
  /* TAM paket — tek dosya; çoğu tüketici bunu alır (bkz. `vite.modules.ts`: JS CSS içe aktarmaz). */
  './styles.css': './build/styles.css',
  // Kendi CSS düzenini kuran tüketici: taban (token'lar, kutu modeli, `@keyframes`) + bileşen başına.
  './base.css': './build/base.css',
  './components/*/style.css': './build/components/*/style.css',
  ...subpaths,
  './chat': conditions('types/chat/index', 'chat'),
  './chat.css': './build/chat.css',
  './charts': conditions('types/charts/index', 'charts'),
  './charts.css': './build/charts.css',
  './scss': {
    sass: './build/scss/_index.scss',
    style: './build/scss/_index.scss',
    default: './build/scss/_index.scss',
  },
  './package.json': './package.json',
};

const pkg = JSON.parse(readFileSync(PACKAGE, 'utf8'));
const current = JSON.stringify(pkg.exports);
const next = JSON.stringify(exportsMap);

/** Every target path of a condition tree (`{ import: { types, default }, … }`). */
const leaves = value =>
  typeof value === 'string' ? [value] : Object.values(value).flatMap(leaves);

if (isCheck) {
  if (current !== next) {
    console.error(
      '✗ exports: package.json güncel değil — `node scripts/build-exports.mjs` çalıştırın.',
    );
    process.exit(1);
  }

  // `*` kalıpları her bileşen diziniyle açılır (bileşen başına `style.css` → 68 dosya).
  const targets = Object.values(exportsMap)
    .flatMap(leaves)
    .flatMap(target =>
      target.includes('*') ? components.map(name => target.replace('*', name)) : [target],
    );
  /* Kalıp hedefi: CSS'i olmayan bileşen (`ConfirmDialog`, `ToastPortal`) dosya üretmez; kalıp en az bir
     dosyaya oturmalı, tek tek eksikler hata değil. */
  const patterned = new Set(
    Object.values(exportsMap)
      .flatMap(leaves)
      .filter(target => target.includes('*'))
      .flatMap(target => components.map(name => target.replace('*', name))),
  );
  const missing = targets.filter(target => !existsSync(join(ROOT, target)));
  const fatal = missing.filter(target => !patterned.has(target));
  if (missing.length > 0 && fatal.length === 0 && patterned.size > missing.length)
    console.log(
      `  (CSS'siz bileşenler, kalıp dışında: ${missing.map(file => file.split('/')[3]).join(', ')})`,
    );
  if (fatal.length > 0) {
    console.error(
      `✗ exports: derlemede olmayan hedefler:\n${fatal.map(file => `  ${file}`).join('\n')}`,
    );
    process.exit(1);
  }

  console.log(
    `✓ exports: ${components.length} bileşen alt yolu, ${targets.length} hedef dosya yerinde.`,
  );
  process.exit(0);
}

pkg.exports = exportsMap;
writeFileSync(PACKAGE, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`✓ exports: ${components.length} bileşen alt yolu yazıldı.`);
