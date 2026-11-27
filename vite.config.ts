import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// @ts-expect-error — eklenti düz JS; tip bildirimi yok ve gerekmiyor.
import uiLayer from './scripts/lib/postcss-ui-layer.mjs';
import { defineConfig } from 'vite';
import type { PluginOption } from 'vite';
import dts from 'vite-plugin-dts';

import { clientDirectives, componentCss } from './vite.modules';

const BASE_ENTRY = resolve(__dirname, 'src/styles/base.ts');

/*
 * EVERY COMPONENT SUBPATH IS AN ENTRY (3.2.1). Under `preserveModules` a module that is not an entry
 * keeps only the exports another module imports, and the facade imports a re-export from where it is
 * defined: `components/AppShell/index.js` lost `AppShellNav`, `AppShellNavGroup` and
 * `AppShellNavItem` (its `.d.ts` still declared them), so `import { AppShellNav } from
 * '@handijitcom/ui/app-shell'` was `undefined` in Node, Vitest and bundlers alike. An entry keeps
 * its whole signature. Same discovery as `scripts/build-exports.mjs`; that script's `--check`
 * imports every subpath and fails on a missing name.
 */
const COMPONENT_ENTRIES = Object.fromEntries(
  [
    ...new Set(
      [
        ...readFileSync(resolve(__dirname, 'src/index.ts'), 'utf8').matchAll(
          /from '\.\/components\/([A-Z]\w*)'/g,
        ),
      ].map(match => match[1]),
    ),
  ].map(name => {
    const tsx = resolve(__dirname, `src/components/${name}/index.tsx`);

    return [
      `components/${name}/index`,
      existsSync(tsx) ? tsx : resolve(__dirname, `src/components/${name}/index.ts`),
    ];
  }),
);

/**
 * KÜTÜPHANE DERLEMESİ — bileşen başına modül (6.0; gerekçe `vite.modules.ts`).
 *
 * `preserveModules`: `src/` ağacı `build/` altına birebir iner (`build/components/Button/index.js`,
 * `build/index.js` cephe). `package.json` `exports` haritası her bileşene bir alt yol verir
 * (`@handijitcom/ui/button`); cephe `.` yalnızca yeniden dışa aktarım taşır.
 */
export default defineConfig({
  plugins: [
    clientDirectives(),
    componentCss({ baseEntry: BASE_ENTRY }),
    /*
     * Ortak çalışma alanında `vite-plugin-dts`in `vite` eşi (`*` aralığı) alanın vite'ına
     * çözülür; eklentinin `Plugin` tipi o sürümün tipidir, kancaları aynıdır. Tip burada
     * bu paketin vite'ına bağlanır.
     */
    dts({
      entryRoot: 'src',
      include: ['src'],
      /* Alt girişler kendi derlemelerinde (`vite.subentry.ts`). */
      exclude: [
        'src/**/*.test.*',
        'src/chat/**',
        'src/charts/**',
        'src/calendar/**',
        'src/design/**',
      ],
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
    }) as unknown as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  /*
   * ⚠ Agac sallama icin bu dosyada AYAR YOK ve olmamasi bilincli: cozum
   * KAYNAKTA (`#__PURE__` acilamasi + `helpers/component.helper` `named()`).
   * Vite'in `esbuild.pure` secenegi denendi, cikisa acilama birakmiyor.
   */
  css: {
    postcss: { plugins: [uiLayer()] },
    modules: {
      /* Sınıf adları paket adıyla ön eklenir. */
      generateScopedName: 'ui-[local]-[hash:base64:5]',
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    outDir: 'build',
    /* `npm run build` empties `build/` first and writes `build/design` before this build. */
    emptyOutDir: false,
    sourcemap: true,
    /* CSS modül başına: her bileşenin CSS'i kendi dosyasında (`vite.modules.ts`). */
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        base: BASE_ENTRY,
        ...COMPONENT_ENTRIES,
      },
      formats: ['es', 'cjs'],
      fileName: (format, name) => `${name}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@handijitcom/ui/design',
        '@handijitcom/utils',
        /*
         * İkonlar da EXTERNAL: paket tüketicide zaten var (uygulamalar kendi içerik ikonlarını aynı
         * setten alıyor).
         */
        'react-bootstrap-icons',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        /* Varsayılan ve adlı dışa aktarım birlikte (`Card` + `CardBody`): CJS'de `.default`. */
        exports: 'named',
        assetFileNames: '[name][extname]',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
